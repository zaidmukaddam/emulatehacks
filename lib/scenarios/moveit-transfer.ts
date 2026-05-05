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
  },
  steps: [
    {
      id: "brief",
      goal: "Read the CVE brief.",
      hint: "`cat CVE-2023-34362-brief.txt`.",
      matches: [{ kind: "exact", command: "cat CVE-2023-34362-brief.txt" }],
      narration:
        "MFT sits past the corporate perimeter, one SQLi becomes 'every partner file ever sent'.",
    },
    {
      id: "iis",
      goal: "Review the IIS log slice.",
      hint: "`cat iis-scrub.log`.",
      matches: [{ kind: "exact", command: "cat iis-scrub.log" }],
      narration:
        "`human2.aspx` GET right after API POST, automated implant staging.",
    },
    {
      id: "grep-human",
      goal: "Filter log lines for the IOC path.",
      hint: "`grep -nF human2.aspx iis-scrub.log`.",
      matches: [{ kind: "exact", command: "grep -nF human2.aspx iis-scrub.log" }],
      narration:
        "If your WAF only alerts on `.dll`, you missed the second line entirely.",
    },
    {
      id: "artifact",
      goal: "Confirm the webshell stub exists on disk in the sim FS.",
      hint: "`cat wwwroot/human2.aspx`.",
      matches: [{ kind: "exact", command: "cat wwwroot/human2.aspx" }],
      narration:
        "Disk forensics after isolate, hash it, diff against vendor gold image.",
    },
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
