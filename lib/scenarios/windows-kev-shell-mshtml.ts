import type { Scenario } from "../types";

/**
 * February 2026 Microsoft KEV pair CVE-2026-21510 (Windows Shell) and CVE-2026-21513 (MSHTML).
 * High level: protection mechanism failures exploited in the wild per CISA catalog (Feb 2026).
 */
export const windowsKevShellMshtml: Scenario = {
  slug: "windows-kev-shell-mshtml",
  exhibit: "EXH-038",
  title: "February KEV Pair",
  tagline:
    "10 February 2026. CISA adds two related Microsoft protection-mechanism failures to the KEV catalog. Your proxy team already sees HTML smuggling attachments that match the CERT email template.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/soc/feb-kev",
  user: "responder",
  host: "soc-bridge-01",
  role: "SOC lead correlating email gateway telemetry with the KEV drop.",
  objective:
    "Trace the simulated campaign from payroll HTML lure to Shell/MSHTML process chain, then confirm isolation and build posture.",
  briefing:
    "The attacker sends a payroll HTML attachment that opens an old MSHTML path and spawns Shell activity. You only see safe telemetry: mail gateway rows, process excerpts, proxy blocks, and host containment evidence.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/soc/feb-kev" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 mail_triage.py --headers mail/quarantine.eml.txt": "simulated safe tool replay for windows-kev-shell-mshtml; replaces: cat mail/quarantine.eml.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc mshtml --input edr/process-tree.txt": "simulated safe tool replay for windows-kev-shell-mshtml; replaces: grep -nF mshtml edr/process-tree.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"2026-02-10\"' --follow-log PROXY-BLOCK.log": "simulated safe tool replay for windows-kev-shell-mshtml; replaces: grep -nF 2026-02-10 PROXY-BLOCK.log\n",
    "python3 ir_toolkit.py parse-artifact --input host/windows-build.txt": "simulated safe tool replay for windows-kev-shell-mshtml; replaces: cat host/windows-build.txt\n",
    "tshark -r evidence.pcap --follow-log edr/isolation.log": "simulated safe tool replay for windows-kev-shell-mshtml; replaces: cat edr/isolation.log\n",
    "python3 ir_toolkit.py parse-artifact --input edr/process-tree.txt": "simulated safe tool replay for windows-kev-shell-mshtml; replaces: cat edr/process-tree.txt\n",
    "curl -sI https://www.cisa.gov/known-exploited-vulnerabilities-catalog":
      [
        "HTTP/2 200",
        "content-type: text/html",
        "(simulated: KEV page reachable while you triage the mail lure)",
      ].join("\n"),
  },
  files: {
    "/home/soc/feb-kev/mail/quarantine.eml.txt": {
      content: [
        "From: payroll-updates@example-payroll.invalid",
        "To: executives@corp.local",
        "Subject: Payroll realignment",
        "Attachment: deferrals.html.sz",
        "Gateway verdict: stripped attachment, delivered banner-only notice",
      ].join("\n"),
    },
    "/home/soc/feb-kev/edr/process-tree.txt": {
      content: [
        "host=exec-4432 user=a.singh",
        "outlook.exe pid=2200",
        "  msedge.exe --single-argument deferrals.html pid=2331",
        "    mshtml-host.exe zone=Internet pid=2404",
        "      explorer.exe /select,\\\\webdav.example\\payroll pid=2480",
      ].join("\n"),
    },
    "/home/soc/feb-kev/PROXY-BLOCK.log": {
      content: [
        "2026-02-10T07:12:03 action=strip subject='Payroll realignment' att=deferrals.html.sz",
        "2026-02-10T07:18:44 action=block url=https://track.redir.example/mshtml-loader",
        "2026-02-10T07:21:09 action=alert user=executives alias='Shell gadget wording'",
      ].join("\n"),
    },
    "/home/soc/feb-kev/host/windows-build.txt": {
      content: [
        "Sample vulnerable build snapshot (exhibit, not inventory)",
        "winver reported: Microsoft Windows [Version 10.0.19045.6937]",
        "Baseline before February 2026 CU on channel broad-internal",
      ].join("\n"),
    },
    "/home/soc/feb-kev/edr/isolation.log": {
      content: [
        "2026-02-10T07:23:10Z host=exec-4432 action=network_isolate status=success",
        "2026-02-10T07:25:02Z host=exec-4432 action=collect_triage_bundle status=success",
        "2026-02-10T07:41:50Z host=exec-4432 action=queue_feb_cu status=success",
      ].join("\n"),
    },
    "/home/soc/feb-kev/public-poc/html_smuggling_attachment_stub.txt": {
      content: [
        "# HTML smuggling: attachment carries JS that assembles blob and opens MSHTML/Shell paths.",
        "# Feb 2026 KEV pairing: protections in Shell + legacy MSHTML rendering.",
        "",
        "<!-- inside deferrals.html (museum stub) -->",
        "<script>",
        "// navigator.msSaveBlob / FileReader tricks to drop second stage (pattern only)",
        "</script>",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-kev",
          phase: "Recon",
          goal: "Sanity-check outbound reach to the public KEV catalog (simulated headers).",
          hint: "`curl -sI https://www.cisa.gov/known-exploited-vulnerabilities-catalog`.",
          matches: [
            {
              kind: "exact",
              command:
                "curl -sI https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
            },
          ],
          narration:
            "KEV catalog still loads while you triage the payroll lure in mail logs.",
        },
    {
          id: "mail",
          phase: "Recon",
          goal: "Inspect the quarantined payroll lure and attachment name.",
          hint: "`python3 mail_triage.py --headers mail/quarantine.eml.txt`.",
          matches: [{ kind: "exact", command: "python3 mail_triage.py --headers mail/quarantine.eml.txt" }],
          narration:
            "The chain starts as email, not patch notes: payroll subject, compressed HTML, executive audience.",
        },
    {
          id: "process",
          phase: "Initial access",
          goal: "Find the MSHTML process spawned from the opened attachment.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc mshtml --input edr/process-tree.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc mshtml --input edr/process-tree.txt" }],
          narration:
            "This is the simulated exploit pivot: a user opens HTML and the legacy renderer path comes alive.",
        },
    {
          id: "proxy",
          phase: "Impact",
          goal: "Grep the proxy log for HTML smuggling or redir alerts today.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"2026-02-10\"' --follow-log PROXY-BLOCK.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"2026-02-10\"' --follow-log PROXY-BLOCK.log" }],
          narration:
            "Proxy telemetry shows the campaign trying to fetch the second stage. The block is good, but the endpoint still needs containment.",
        },
    {
          id: "build",
          phase: "Persistence",
          goal: "Confirm the vulnerable winver line your patch squad references.",
          hint: "`python3 ir_toolkit.py parse-artifact --input host/windows-build.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input host/windows-build.txt" }],
          narration:
            "The host is on the pre-CU baseline, so every event above gets treated as exposure until the February build lands.",
        },
    {
          id: "isolation",
          phase: "Containment",
          goal: "Verify EDR isolation, triage collection, and update queue actions.",
          hint: "`tshark -r evidence.pcap --follow-log edr/isolation.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log edr/isolation.log" }],
          narration:
            "This is the fix flow: isolate the host, preserve evidence, queue the cumulative update. The email is already stripped; now the laptop is handled.",
        },
    {
          id: "lessons",
          phase: "Lessons",
          goal: "Re-open the process tree to name the user-action chain cleanly.",
          hint: "`python3 ir_toolkit.py parse-artifact --input edr/process-tree.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input edr/process-tree.txt" }],
          narration:
            "The lesson is concrete: Outlook to HTML renderer to Shell handoff to WebDAV-shaped follow-on. That is what defenders hunt.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/html_smuggling_attachment_stub.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/html_smuggling_attachment_stub.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "CVE-2026-21510 and CVE-2026-21513 appear in NIST NVD with published timestamps of 10 February 2026, described by Microsoft as protection mechanism failures in Windows Shell and MSHTML. CISA listed both in the Known Exploited Vulnerabilities catalog the same day (10 February 2026) with remediation due 3 March 2026 per CISA's KEV export. This scenario stays descriptive; it does not teach exploitation.",
    lesson:
      "Treat paired KEV entries as a campaign forecast, not two independent bugs. Combine mail controls, asset inventory on build numbers, and identity reset paths when HTML social engineering is in play.",
    simulated: [
      "Proxy log lines, corp hostnames, and comms drafts are invented.",
      "CVE identifiers and their high-level classifications match public MSRC/NVD summaries.",
    ],
  },
};
