import type { Scenario } from "../types";

/**
 * Publicly grounded, fictionalized IR scenario for the June 2026 Oracle PeopleSoft
 * CVE-2026-35273 exploitation and ShinyHunters/UNC6240 extortion reporting.
 * Synthetic logs only. No exploit payloads, live targets, or real victim data.
 */
export const peoplesoftZeroDayExtortion: Scenario = {
  slug: "peoplesoft-zero-day-extortion",
  exhibit: "EXH-048",
  title: "PeopleSoft EMHub Raid",
  tagline:
    "11 June 2026. Oracle warns of CVE-2026-35273 as reports tie PeopleSoft zero-day exploitation to ShinyHunters data theft against 100+ organizations.",
  category: "incident-response",
  difficulty: "advanced",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/responder/peoplesoft-ir",
  user: "responder",
  host: "soc-workbench-48",
  role: "Incident responder for a university PeopleSoft environment validating emergency mitigation.",
  objective:
    "Trace the reported PeopleSoft campaign through synthetic exposure checks, PSEMHUB access logs, remote agent staging, extortion-linked egress, and containment evidence.",
  briefing:
    "Public reporting on 11 June 2026 described a critical Oracle PeopleSoft PeopleTools flaw, CVE-2026-35273, remotely exploitable without authentication and abused in a data-theft campaign attributed to ShinyHunters/UNC6240. This exhibit keeps the defender view: confirm exposed PeopleSoft services, inspect sanitized web logs, identify remote management staging, and verify emergency controls. All hostnames, records, and log rows are museum props.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/responder/peoplesoft-ir" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "objective"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/public-brief.txt": [
      "[ir_toolkit] artifact: intel/public-brief.txt",
      "[ir_toolkit] lines: 11  bytes: 1042",
      "   1| Public brief, sanitized for museum use",
      "   2| Date: 2026-06-11",
      "   3| Incident: Oracle PeopleSoft PeopleTools CVE-2026-35273",
      "   4| Public severity: critical, CVSS 9.8 in Oracle reporting",
      "   5| Public impact: unauthenticated remote code execution",
      "   6| Reported activity: ShinyHunters/UNC6240 data theft and extortion",
      "   7| Reported scale: more than 100 organizations notified or claimed affected",
      "   8| Sector emphasis: higher education, mostly United States organizations",
      "   9| Defender focus: PSEMHUB and PSIGW endpoint logs, unusual WebLogic files, remote agents",
      "  10| Museum note: this is not an exploit walkthrough",
      "  11| Sources are listed in the debrief",
    ],
    "curl -sI https://peoplesoft.edu.example/PSEMHUB/hub": [
      "HTTP/2 200",
      "server: weblogic-museum",
      "x-peoplesoft-component: PSEMHUB",
      "x-scope: synthetic exposure check",
      "",
    ],
    "tshark -r people.pcap -Y http.request.uri contains PSEMHUB --follow-log /var/log/weblogic/access.log": [
      "2026-06-10T23:58:12Z src=198.51.100.77 method=GET uri=/PSEMHUB/hub status=200 ua=python-requests/2.32",
      "2026-06-10T23:58:16Z src=198.51.100.77 method=POST uri=/PSEMHUB/tx/submit status=500 ua=python-requests/2.32 bytes=1840",
      "2026-06-10T23:58:20Z src=198.51.100.77 method=GET uri=/PSEMHUB/tx/results status=200 ua=python-requests/2.32",
    ],
    "tshark -r people.pcap -Y http.request.uri contains PSIGW --follow-log /var/log/weblogic/access.log": [
      "2026-06-11T00:04:31Z src=198.51.100.77 method=POST uri=/PSIGW/HttpListeningConnector status=200 ua=python-requests/2.32",
      "2026-06-11T00:04:36Z src=198.51.100.77 method=POST uri=/PSIGW/HttpListeningConnector status=200 ua=python-requests/2.32 action=config-map",
      "2026-06-11T00:05:09Z src=198.51.100.77 method=POST uri=/PSIGW/HttpListeningConnector status=200 ua=python-requests/2.32 action=credential-check",
    ],
    "python3 ir_toolkit.py parse-artifact --input host/agent-inventory.txt": [
      "[ir_toolkit] artifact: host/agent-inventory.txt",
      "   1| Host inventory, synthetic",
      "   2| 2026-06-11T00:11:43Z new file /opt/psft/appserv/prcs/.azure-update/meshsvc",
      "   3| 2026-06-11T00:11:45Z process meshsvc parent=weblogic pid=5148",
      "   4| 2026-06-11T00:11:48Z beacon label=Azure Service Bus Helper",
      "   5| 2026-06-11T00:12:02Z note=remote management agent shape mirrors public Mandiant reporting",
    ],
    "python3 ir_toolkit.py extract-ioc --ioc 176.120.22.24 --input network/egress-summary.log": [
      "4:2026-06-11T00:26:44Z host=psft-app-02 dest=176.120.22.24 port=443 bytes_out=24891140 note=compressed archive egress, blocked after alert",
    ],
    "jq . controls/emergency-mitigation.json": [
      "{",
      "  \"incident\": \"CVE-2026-35273 PeopleSoft emergency controls\",",
      "  \"disable_emhub_service\": true,",
      "  \"remove_single_server_pse_mhub_app\": \"queued\",",
      "  \"perimeter_blocks\": [",
      "    \"/PSEMHUB/*\",",
      "    \"/PSIGW/HttpListeningConnector\"",
      "  ],",
      "  \"credential_rotation\": \"PeopleSoft, WebLogic, hardcoded integration accounts\",",
      "  \"status\": \"mitigated pending vendor patch\"",
      "}",
    ],
    "tshark -r people.pcap --follow-log controls/containment.log": [
      "2026-06-11T00:31:10Z waf block uri=/PSEMHUB/* src=0.0.0.0/0 status=active",
      "2026-06-11T00:31:44Z waf block uri=/PSIGW/HttpListeningConnector src=0.0.0.0/0 status=active",
      "2026-06-11T00:36:09Z endpoint isolate host=psft-app-02 reason=unexpected remote-management agent",
      "2026-06-11T00:42:33Z rotate credentials scope=psft-weblogic-integrations status=started",
      "2026-06-11T01:05:18Z hunt complete indicators=clean on remaining app servers",
    ],
  },
  files: {
    "/home/responder/peoplesoft-ir/intel/public-brief.txt": {
      content: [
        "Public brief, sanitized for museum use",
        "Date: 2026-06-11",
        "Incident: Oracle PeopleSoft PeopleTools CVE-2026-35273",
        "Public severity: critical, CVSS 9.8 in Oracle reporting",
        "Public impact: unauthenticated remote code execution",
        "Reported activity: ShinyHunters/UNC6240 data theft and extortion",
        "Reported scale: more than 100 organizations notified or claimed affected",
        "Sector emphasis: higher education, mostly United States organizations",
        "Defender focus: PSEMHUB and PSIGW endpoint logs, unusual WebLogic files, remote agents",
        "Museum note: this is not an exploit walkthrough",
        "Sources are listed in the debrief",
      ].join("\n"),
    },
    "/var/log/weblogic/access.log": {
      content: [
        "2026-06-10T23:58:12Z src=198.51.100.77 method=GET uri=/PSEMHUB/hub status=200 ua=python-requests/2.32",
        "2026-06-10T23:58:16Z src=198.51.100.77 method=POST uri=/PSEMHUB/tx/submit status=500 ua=python-requests/2.32 bytes=1840",
        "2026-06-10T23:58:20Z src=198.51.100.77 method=GET uri=/PSEMHUB/tx/results status=200 ua=python-requests/2.32",
        "2026-06-11T00:04:31Z src=198.51.100.77 method=POST uri=/PSIGW/HttpListeningConnector status=200 ua=python-requests/2.32",
        "2026-06-11T00:04:36Z src=198.51.100.77 method=POST uri=/PSIGW/HttpListeningConnector status=200 ua=python-requests/2.32 action=config-map",
        "2026-06-11T00:05:09Z src=198.51.100.77 method=POST uri=/PSIGW/HttpListeningConnector status=200 ua=python-requests/2.32 action=credential-check",
        "2026-06-11T00:09:52Z src=203.0.113.19 method=GET uri=/psp/HRPRD status=200 ua=Mozilla/5.0 user=campus-hr",
      ].join("\n"),
    },
    "/home/responder/peoplesoft-ir/host/agent-inventory.txt": {
      content: [
        "Host inventory, synthetic",
        "2026-06-11T00:11:43Z new file /opt/psft/appserv/prcs/.azure-update/meshsvc",
        "2026-06-11T00:11:45Z process meshsvc parent=weblogic pid=5148",
        "2026-06-11T00:11:48Z beacon label=Azure Service Bus Helper",
        "2026-06-11T00:12:02Z note=remote management agent shape mirrors public Mandiant reporting",
      ].join("\n"),
    },
    "/home/responder/peoplesoft-ir/network/egress-summary.log": {
      content: [
        "2026-06-11T00:20:10Z host=psft-app-01 dest=203.0.113.10 port=443 bytes_out=4012 note=vendor update check",
        "2026-06-11T00:22:01Z host=psft-app-02 dest=198.51.100.55 port=443 bytes_out=91104 note=remote agent heartbeat",
        "2026-06-11T00:24:18Z host=psft-app-02 archive=/tmp/psoft_fin_audit.tgz size=24M status=created",
        "2026-06-11T00:26:44Z host=psft-app-02 dest=176.120.22.24 port=443 bytes_out=24891140 note=compressed archive egress, blocked after alert",
      ].join("\n"),
    },
    "/home/responder/peoplesoft-ir/controls/emergency-mitigation.json": {
      content: [
        "{",
        '  "incident": "CVE-2026-35273 PeopleSoft emergency controls",',
        '  "disable_emhub_service": true,',
        '  "remove_single_server_pse_mhub_app": "queued",',
        '  "perimeter_blocks": [',
        '    "/PSEMHUB/*",',
        '    "/PSIGW/HttpListeningConnector"',
        "  ],",
        '  "credential_rotation": "PeopleSoft, WebLogic, hardcoded integration accounts",',
        '  "status": "mitigated pending vendor patch"',
        "}",
      ].join("\n"),
    },
    "/home/responder/peoplesoft-ir/controls/containment.log": {
      content: [
        "2026-06-11T00:31:10Z waf block uri=/PSEMHUB/* src=0.0.0.0/0 status=active",
        "2026-06-11T00:31:44Z waf block uri=/PSIGW/HttpListeningConnector src=0.0.0.0/0 status=active",
        "2026-06-11T00:36:09Z endpoint isolate host=psft-app-02 reason=unexpected remote-management agent",
        "2026-06-11T00:42:33Z rotate credentials scope=psft-weblogic-integrations status=started",
        "2026-06-11T01:05:18Z hunt complete indicators=clean on remaining app servers",
      ].join("\n"),
    },
    "/home/responder/peoplesoft-ir/public-poc/peoplesoft_emhub_indicators.txt": {
      content: [
        "# PeopleSoft CVE-2026-35273 defender indicators, museum-safe excerpt",
        "",
        "Review web logs for unexpected requests to:",
        "  /PSEMHUB/",
        "  /PSIGW/HttpListeningConnector",
        "",
        "Review WebLogic application paths for:",
        "  unexpected JSP files",
        "  unauthorized files in PSEMHUB transaction folders",
        "  suspicious directories named logs, persistantstorage, or scratchpad",
        "  recently modified XML files used for persistence or restart-triggered execution",
        "",
        "Mitigate by restricting or disabling exposed EMHub services and blocking the risky paths at the perimeter.",
        "This file intentionally contains no exploit payload.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "brief",
      phase: "Recon",
      goal: "Read the public incident brief your SOC lead distilled from 11 June reporting.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/public-brief.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/public-brief.txt" }],
      narration:
        "You have the safe facts: critical unauthenticated RCE, PeopleSoft PeopleTools, extortion campaign, higher education exposure, and no payload replay.",
    },
    {
      id: "exposure",
      phase: "Recon",
      goal: "Check whether the synthetic PeopleSoft EMHub path is exposed at the edge.",
      hint: "`curl -sI https://peoplesoft.edu.example/PSEMHUB/hub`.",
      matches: [{ kind: "exact", command: "curl -sI https://peoplesoft.edu.example/PSEMHUB/hub" }],
      narration:
        "The service answers from an internet-shaped URL, so you treat the host as exposed until network policy proves otherwise.",
    },
    {
      id: "psemhub",
      phase: "Initial access",
      goal: "Pull web log rows showing suspicious PSEMHUB traffic.",
      hint: "`tshark -r people.pcap -Y http.request.uri contains PSEMHUB --follow-log /var/log/weblogic/access.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r people.pcap -Y http.request.uri contains PSEMHUB --follow-log /var/log/weblogic/access.log",
        },
      ],
      narration:
        "Public guidance points defenders at PSEMHUB paths. The synthetic sequence shows automated probing and transaction handling.",
    },
    {
      id: "psigw",
      phase: "Discovery",
      goal: "Trace related PSIGW connector activity used for environment mapping.",
      hint: "`tshark -r people.pcap -Y http.request.uri contains PSIGW --follow-log /var/log/weblogic/access.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r people.pcap -Y http.request.uri contains PSIGW --follow-log /var/log/weblogic/access.log",
        },
      ],
      narration:
        "Configuration mapping and connector checks align with the defender story: attackers learn the PeopleSoft and WebLogic layout before stealing data.",
    },
    {
      id: "agent",
      phase: "Persistence",
      goal: "Review the host inventory note for a remote management agent masquerading as cloud infrastructure.",
      hint: "`python3 ir_toolkit.py parse-artifact --input host/agent-inventory.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input host/agent-inventory.txt" }],
      narration:
        "A service name that sounds like Azure is not evidence of legitimacy. Treat new remote management binaries under app paths as hostile.",
    },
    {
      id: "egress",
      phase: "Exfiltration",
      goal: "Extract the extortion-linked egress indicator from the network summary.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc 176.120.22.24 --input network/egress-summary.log`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc 176.120.22.24 --input network/egress-summary.log",
        },
      ],
      narration:
        "The public reporting associated 176.120.22.24 with the leak-site infrastructure. Here it marks attempted archive egress in a synthetic log.",
    },
    {
      id: "mitigation",
      phase: "Containment",
      goal: "Inspect the emergency mitigation plan based on published PeopleSoft guidance.",
      hint: "`jq . controls/emergency-mitigation.json`.",
      matches: [{ kind: "exact", command: "jq . controls/emergency-mitigation.json" }],
      narration:
        "Containment narrows the attack surface: disable or restrict EMHub, block risky endpoints, and rotate credentials that might have moved laterally.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify controls landed in the containment log.",
      hint: "`tshark -r people.pcap --follow-log controls/containment.log`.",
      matches: [{ kind: "exact", command: "tshark -r people.pcap --follow-log controls/containment.log" }],
      narration:
        "The attacker path is now blocked at the perimeter, the suspicious host is isolated, and credential rotation has started.",
    },
    {
      id: "indicators",
      phase: "Lessons",
      goal: "Review the museum-safe indicator checklist for this exhibit.",
      hint: "`head -n 80 public-poc/peoplesoft_emhub_indicators.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/peoplesoft_emhub_indicators.txt" }],
      narration:
        "The learning artifact ends on detection and mitigation, not weaponization.",
    },
  ],
  debrief: {
    summary:
      "On 11 June 2026, Oracle and public reporting described CVE-2026-35273 in PeopleSoft PeopleTools as a critical unauthenticated remote code execution issue. BleepingComputer reported ShinyHunters claims of using old and zero-day flaws against PeopleSoft instances, with alleged theft from 300 instances across more than 100 organizations, plus Mandiant details on higher education targeting, PSEMHUB and PSIGW log review, custom MeshCentral-style agents, and egress to 176.120.22.24. TechCrunch reported Oracle warned customers after claims of 100+ PeopleSoft breaches, and Help Net Security summarized mitigations including disabling or restricting EMHub and blocking /PSEMHUB/* plus /PSIGW/HttpListeningConnector. Sources: https://www.bleepingcomputer.com/news/security/oracle-mitigates-peoplesoft-zero-day-exploited-in-data-theft-attacks/ https://techcrunch.com/2026/06/11/oracle-warns-of-security-bug-that-hackers-abused-to-breach-100-companies/ https://www.helpnetsecurity.com/2026/06/11/oracle-peoplesoft-under-attack-cve-2026-35273/",
    lesson:
      "Treat enterprise admin middleware as internet-facing software whenever its connectors can be reached from untrusted networks. Logs, staged binaries, egress, and emergency controls matter as much as the CVE headline.",
    simulated: [
      "Campus name, hostnames, request rows, user agents, process names, archives, and containment timestamps are synthetic.",
      "The scenario uses public defender indicators and high-level incident facts only.",
      "No exploit chain, gadget detail, victim data, or real credential appears in this exhibit.",
    ],
  },
};
