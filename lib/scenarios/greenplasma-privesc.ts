import type { Scenario } from "../types";

/** Fictional Windows privilege escalation narrative (GreenPlasma theme), DFIR-text only. */
export const greenplasmaPrivesc: Scenario = {
  slug: "greenplasma-privesc",
  exhibit: "EXH-039",
  title: "GreenPlasma",
  tagline:
    "February 18, 2026. A vendor SAS session shows a service account climbing from helpdesk laptop to domain admin in three hops. You read analyst notes and synthetic event excerpts only.",
  category: "incident-response",
  difficulty: "advanced",
  era: "2020s",
  year: "2026",
  estMinutes: 11,
  fictional: true,
  cwd: "/home/dfir/greenplasma",
  user: "responder",
  host: "dfir-laptop-02",
  role: "Incident commander reviewing outsourced MDR escalations.",
  objective:
    "Follow the simulated intrusion from helpdesk remote session to scheduled task to service-account abuse and domain-admin cleanup.",
  briefing:
    "GreenPlasma is analyst shorthand for a commodity kit observed in Q1 2026 that chains stolen interactive sessions with scheduled tasks running as NETWORK SERVICE and a legacy delegation on a maintenance account. This reconstruction contains no exploit code, only log shapes and timelines you would see in a ticket.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/dfir/greenplasma" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "tshark -r evidence.pcap --follow-log timeline.log": "simulated safe tool replay for greenplasma-privesc; replaces: cat timeline.log\n",
    "python3 ir_toolkit.py extract-ioc --ioc svc-printops --input events/security.txt": "simulated safe tool replay for greenplasma-privesc; replaces: grep -nF SVC-PRINTOPS events/security.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc plasmaminute --input tasks/schtasks.txt": "simulated safe tool replay for greenplasma-privesc; replaces: grep -nF PlasmaMinute tasks/schtasks.txt\n",
    "jq . ad/SVC-PRINTOPS.json": "simulated safe tool replay for greenplasma-privesc; replaces: cat ad/SVC-PRINTOPS.json\n",
    "python3 ir_toolkit.py extract-ioc --ioc domain --input events/security.txt": "simulated safe tool replay for greenplasma-privesc; replaces: grep -nF Domain Admins events/security.txt\n",
    "tshark -r evidence.pcap --follow-log containment/actions.log": "simulated safe tool replay for greenplasma-privesc; replaces: cat containment/actions.log\n",
    "tshark -r evidence.pcap --follow-log timeline.log --view 2": "simulated safe tool replay for greenplasma-privesc; replaces: cat timeline.log\n",
    "ldapsearch -x -H ldap://dc.corp.local -b dc=corp,dc=local '(samAccountName=SVC-PRINTOPS)' memberOf":
      [
        "dn: CN=SVC-PRINTOPS,OU=Service Accounts,DC=corp,DC=local",
        "memberOf: CN=Printer Operators,CN=Builtin,DC=corp,DC=local",
        "(simulated LDAP; highlights risky delegation on the maintenance account)",
      ].join("\n"),
  },
  files: {
    "/home/dfir/greenplasma/timeline.log": {
      content: [
        "T+0  User reports slow laptop, helpdesk remotes in (legit session).",
        "T+25 Beaconing DNS to `*.stage-renew.cc` from dllhost child (synthetic IoC).",
        "T+41 Schtasks created `/sc minute` job as SYSTEM invoking rundll32 with odd export.",
        "T+67 Auth log shows `SVC-PRINTOPS` authenticating from unexpected workstation.",
        "T+92 `SVC-PRINTOPS` adds members to `Domain Admins` via legacy MMC host.",
      ].join("\n"),
    },
    "/home/dfir/greenplasma/events/security.txt": {
      content: [
        "Synthetic Windows event excerpts (flattened for exhibit)",
        "",
        "4688  cmd.exe spawned rundll32.exe /export:PlasmaInit",
        "4624  SVC-PRINTOPS logon type 3 from desktop-4821.corp.local",
        "4728  Member Domain Admins <- SVC-PRINTOPS",
        "4732  User `backupsvc` session hijack warning (vendor specific sensor)",
      ].join("\n"),
    },
    "/home/dfir/greenplasma/ad/SVC-PRINTOPS.json": {
      content: [
        "{",
        '  "account": "SVC-PRINTOPS",',
        '  "spn": ["HTTP/printer-gw.corp.local"],',
        '  "delegation": "unconstrained (FLAGGED 2025 audit)",',
        '  "lastPasswordRotation": "2024-11-02"',
        "}",
      ].join("\n"),
    },
    "/home/dfir/greenplasma/tasks/schtasks.txt": {
      content: [
        "desktop-4821\\PlasmaMinute SYSTEM rundll32.exe C:\\ProgramData\\gp.dat,PlasmaInit",
        "desktop-4821\\VendorAssist helpdesk runonce legitimate",
        "print-gw-02\\PrinterInventory SVC-PRINTOPS nightly",
      ].join("\n"),
    },
    "/home/dfir/greenplasma/containment/actions.log": {
      content: [
        "2026-02-18T12:12Z disable_account SVC-PRINTOPS success",
        "2026-02-18T12:15Z remove_group Domain Admins SVC-PRINTOPS success",
        "2026-02-18T12:19Z purge_task desktop-4821 PlasmaMinute success",
        "2026-02-18T12:25Z reset_krbtgt_phase1 queued",
      ].join("\n"),
    },
    "/home/dfir/greenplasma/public-poc/printeroperators_delegation_chain_note.txt": {
      content: [
        "# AD abuse pattern: service account in Printer Operators / unconstrained delegation.",
        "# Attacker reuses NETWORK SERVICE scheduled task → stolen TGT → MMC domain join.",
        "",
        "schtasks /create /tn PlasmaMinute /tr \"rundll32 C:\\\\ProgramData\\\\gp.dat,PlasmaInit\" /sc minute /ru SYSTEM",
        "",
        "# Museum: rundll32 line is illustrative; scrub delegation on maintenance SPNs.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "ldap-svc",
          phase: "Recon",
          goal: "Query the suspicious service account with ldapsearch (simulated).",
          hint: "`ldapsearch -x -H ldap://dc.corp.local -b dc=corp,dc=local '(samAccountName=SVC-PRINTOPS)' memberOf`.",
          matches: [
            {
              kind: "exact",
              command:
                "ldapsearch -x -H ldap://dc.corp.local -b dc=corp,dc=local '(samAccountName=SVC-PRINTOPS)' memberOf",
            },
          ],
          narration:
            "LDAP confirms the service account still carries risky group memberships before you read the timeline.",
        },
    {
          id: "timeline",
          phase: "Recon",
          goal: "Read the timestamped intrusion chain from helpdesk session to DA change.",
          hint: "`tshark -r evidence.pcap --follow-log timeline.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log timeline.log" }],
          narration:
            "This is the shape of a modern escalation: interactive helpdesk channel becomes execution, then trust in a fat service account becomes domain-wide impact.",
        },
    {
          id: "events",
          phase: "Initial access",
          goal: "Correlate synthetic 4688 and 4624 lines with the timeline notes.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc svc-printops --input events/security.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc svc-printops --input events/security.txt" }],
          narration:
            "The service account’s network logon from a desktop tier is the lateral hop. It should be rare for print-bound identities to originate there.",
        },
    {
          id: "task",
          phase: "Persistence",
          goal: "Find the scheduled task that keeps the malicious DLL loading.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc plasmaminute --input tasks/schtasks.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc plasmaminute --input tasks/schtasks.txt" }],
          narration:
            "The attacker’s foothold survives through a minute-by-minute task. It is noisy, but it works long enough to reach identity.",
        },
    {
          id: "account",
          phase: "Lateral movement",
          goal: "Inspect the abused service account’s dangerous delegation setting.",
          hint: "`jq . ad/SVC-PRINTOPS.json`.",
          matches: [{ kind: "exact", command: "jq . ad/SVC-PRINTOPS.json" }],
          narration:
            "Unconstrained delegation is lateral movement stored in AD. The desktop foothold borrows printer trust and turns it into domain reach.",
        },
    {
          id: "impact",
          phase: "Impact",
          goal: "Show the Domain Admins membership change line.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc domain --input events/security.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc domain --input events/security.txt" }],
          narration:
            "Impact is blatant once the account is in DA. Detection value is earlier: odd hosts, odd logon types, stale service passwords.",
        },
    {
          id: "contain",
          phase: "Containment",
          goal: "Verify account disable, group removal, task purge, and krbtgt queue.",
          hint: "`tshark -r evidence.pcap --follow-log containment/actions.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/actions.log" }],
          narration:
            "Containment is identity surgery plus host rebuild, not just an AV scan.",
        },
    {
          id: "lessons",
          phase: "Lessons",
          goal: "Re-open the timeline to see the three-hop escalation without prose.",
          hint: "`tshark -r evidence.pcap --follow-log timeline.log --view 2`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log timeline.log --view 2" }],
          narration:
            "GreenPlasma, wholly fictional here, encodes an uncomfortable lesson: helpdesk remoting plus legacy delegation equals a highway to domain tier if you do not treat both as security boundaries.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/printeroperators_delegation_chain_note.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/printeroperators_delegation_chain_note.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "GreenPlasma is a fictional Q1 2026 Windows privilege-escalation storyline told through DFIR notes. It stresses abuse of over-provisioned service accounts and legacy Kerberos settings after a desktop foothold. It is not a recreation of a single public incident.",
    lesson:
      "Audit service accounts for delegation and interactive pathways as often as you audit domain admins. Break unconstrained delegation aggressively: it is lateral movement printed into LDAP.",
    simulated: [
      "Events, hostnames, and IoCs are synthetic.",
      "No malware samples, shellcode, or privilege-escalation recipes are included.",
    ],
  },
};
