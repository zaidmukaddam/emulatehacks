import type { Scenario } from "../types";

/** MOVEit Transfer, CVE-2023-34362 SQLi zero-day, mass exploitation June 2023 (Cl0p). */
export const moveitTransferClop: Scenario = {
  slug: "moveit-mft-clop",
  exhibit: "EXH-023",
  title: "human2.aspx",
  tagline:
    "June 2023. Progress Software emergency-patches MOVEit Transfer while Cl0p claims hundreds of victims. The bug is pre-auth SQLi on the web tier, data exfil before ransomware ever loads.",
  category: "modern-cloud",
  difficulty: "advanced",
  era: "2020s",
  year: "2023",
  estMinutes: 10,
  fictional: true,
  cwd: "/mft/moveit-sim",
  user: "responder",
  host: "soc-east",
  role: "Operator reading WAF logs after Progress publishes CVE-2023-34362.",
  objective:
    "Correlate advisory static with suspicious POST paths and an ASPX artifact path.",
  briefing:
    "Progress published IOCs listing unexpected `.aspx` under `wwwroot`, you grep for them here.",
  env: { USER: "responder", SHELL: "/bin/sh", PWD: "/mft/moveit-sim" },
  ps: ["  PID TTY TIME CMD", "  12 ?   0:00 sh"],
  history: [],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input CVE-2023-34362-brief.txt": "simulated safe tool replay for moveit-mft-clop; replaces: cat CVE-2023-34362-brief.txt\n",
    "tshark -r evidence.pcap --follow-log iis-scrub.log": "simulated safe tool replay for moveit-mft-clop; replaces: cat iis-scrub.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"ioc\"' --follow-log iis-scrub.log": "simulated safe tool replay for moveit-mft-clop; replaces: grep -nF human2.aspx iis-scrub.log\n",
    "python3 safe_replay.py --scenario moveit-mft-clop --artifact wwwroot/human2.aspx": "simulated safe tool replay for moveit-mft-clop; replaces: cat wwwroot/human2.aspx\n",
    "sqlmap -u 'http://127.0.0.1/moveitisapi/moveitisapi.dll' --batch --risk=3 --level=2 --tables":
      [
        "[*] testing connection to the target URL",
        "[*] checking if the target is protected by some kind of WAF/IPS",
        "[*] heuristic (basic) test shows that GET parameter 'action' might be injectable (possible DBMS: 'Microsoft SQL Server')",
        "[*] fetching tables (simulated)",
        "Database: moveit",
        "[4 tables]",
        "+------------------+",
        "| dbo.sessions     |",
        "| dbo.transfers    |",
        "| dbo.users        |",
        "| dbo.audit        |",
        "+------------------+",
      ].join("\n"),
  },
  files: {
    "/mft/moveit-sim/CVE-2023-34362-brief.txt": {
      content: [
        "CVE-2023-34362, MOVEit Transfer SQL injection (June 2023)",
        "Pre-authenticated attacker crafts multipart body → SQL → RCE / data theft paths per vendor guidance",
        "Cl0p ransomware group mass-exploited for theft-extortion",
        "IOC: unexpected files human2.aspx, .cmdline, web shells under wwwroot",
        "Mitigation: patch + reset service creds + comprehensive log review back 30+ days",
      ].join("\n"),
    },
    "/mft/moveit-sim/iis-scrub.log": {
      content: [
        '2023-06-01 04:12:09 198.51.100.9 POST /moveitisapi/moveitisapi.dll - 443 - "-" "Mozilla/5.0" 200 0 0 831',
        '2023-06-01 04:12:11 198.51.100.9 GET /human2.aspx - 443 - "-" "-" 200 0 0 312',
        '2023-06-01 04:14:02 198.51.100.9 POST /moveitisapi/moveitisapi.dll action=m2 - 443 - "-" "-" 200 0 0 1201',
        '2023-06-01 04:18:55 203.0.113.40 GET /guestaccess.aspx - 443 - "-" "Chrome" 200 0 0 512',
      ].join("\n"),
    },
    "/mft/moveit-sim/wwwroot/human2.aspx": {
      content: "<%@ Page Language='C#' %><!-- tabletop stub: would contain webshell in real IR -->\n",
    },
    "/mft/moveit-sim/public-poc/moveit_sqli_multipart_shape.txt": {
      content: [
        "# CVE-2023-34362: pre-auth SQLi on MOVEit Transfer web tier (public write-ups).",
        "# Attackers POST to moveitisapi.dll with crafted multipart fields → SQL → file write → human2.aspx",
        "",
        "POST /moveitisapi/moveitisapi.dll?action=m2 HTTP/1.1",
        "Content-Type: multipart/form-data; boundary=----abc",
        "",
        "------abc",
        'Content-Disposition: form-data; name="field1"',
        "",
        "') ; INSERT INTO ... --",
        "------abc--",
        "",
        "# Museum: truncated; use vendor advisories for exact patches.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "sqlmap",
          goal: "Run a canned sqlmap-style enumeration against the MOVEit API endpoint (simulated).",
          hint: "`sqlmap -u 'http://127.0.0.1/moveitisapi/moveitisapi.dll' --batch --risk=3 --level=2 --tables`.",
          matches: [
            {
              kind: "exact",
              command:
                "sqlmap -u 'http://127.0.0.1/moveitisapi/moveitisapi.dll' --batch --risk=3 --level=2 --tables",
            },
          ],
          narration:
            "MFT sits past the corporate perimeter, one SQLi becomes 'every partner file ever sent'.",
        },
    {
          id: "brief",
          goal: "Read the CVE brief.",
          hint: "`python3 ir_toolkit.py parse-artifact --input CVE-2023-34362-brief.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input CVE-2023-34362-brief.txt" }],
          narration:
            "MFT sits past the corporate perimeter, one SQLi becomes 'every partner file ever sent'.",
        },
    {
          id: "iis",
          goal: "Review the IIS log slice.",
          hint: "`tshark -r evidence.pcap --follow-log iis-scrub.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log iis-scrub.log" }],
          narration:
            "`human2.aspx` GET right after API POST, automated implant staging.",
        },
    {
          id: "grep-human",
          goal: "Filter log lines for the IOC path.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"ioc\"' --follow-log iis-scrub.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"ioc\"' --follow-log iis-scrub.log" }],
          narration:
            "If your WAF only alerts on `.dll`, you missed the second line entirely.",
        },
    {
          id: "artifact",
          goal: "Confirm the webshell stub exists on disk in the sim FS.",
          hint: "`python3 safe_replay.py --scenario moveit-mft-clop --artifact wwwroot/human2.aspx`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario moveit-mft-clop --artifact wwwroot/human2.aspx" }],
          narration:
            "Disk forensics after isolate, hash it, diff against vendor gold image.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/moveit_sqli_multipart_shape.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/moveit_sqli_multipart_shape.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "CVE-2023-34362 was a critical vulnerability in Progress MOVEit Transfer disclosed in June 2023, described as an SQL injection that could enable unauthorized access and data theft. It was widely exploited, including in campaigns associated with the Cl0p cybercrime group impacting numerous organisations globally. Incident responders focused on patching, credential rotation, and hunting for unexpected web shells and exfiltration activity.",
    lesson:
      "Managed file transfer is a data-lake with SFTP semantics, compromise equals every contract PDF your clients ever uploaded. Run MFT on isolated VLANs, force SAML SSO with MFA for admins, ship logs to SIEM with 12-month retention minimum, and treat vendor zero-days like earthquakes: pre-written runbooks, comms templates, and legal on retainer.",
    simulated: [
      "IPs are invented; CVE-2023-34362, June 2023 timeline, Cl0p association, and human2.aspx IOC naming follow public reporting.",
    ],
  },
};
