import type { Scenario } from "../types";

/**
 * CVE-2026-20245: Cisco Catalyst SD-WAN Manager authenticated privilege escalation.
 * Public advisory first published 2026-06-04, updated 2026-06-05 with IoCs.
 * Scenario is defensive log triage only. No crafted files or exploit paths.
 */
export const ciscoSdwanPrivesc: Scenario = {
  slug: "cisco-sdwan-privesc",
  exhibit: "EXH-048",
  title: "SD-WAN Root Pivot",
  tagline:
    "5 June 2026. Cisco updates CVE-2026-20245 guidance after PSIRT learns of exploitation: authenticated SD-WAN Manager abuse can reach root, and scripts.log is where defenders start.",
  category: "incident-response",
  difficulty: "advanced",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/netops/sdwan-cve-2026-20245",
  user: "responder",
  host: "control-plane-ir",
  role: "Network incident responder preserving Cisco Catalyst SD-WAN control-plane evidence before upgrade.",
  objective:
    "Triage public CVE-2026-20245 guidance, inspect synthetic scripts.log and control-plane records, preserve admin-tech, and verify the post-upgrade response plan.",
  briefing:
    "Cisco disclosed CVE-2026-20245 for Catalyst SD-WAN Manager, formerly vManage: a netadmin-level local path could run commands as root through insufficient validation of uploaded files. Cisco said exploitation was observed in June 2026 and told customers to preserve admin-tech, audit /var/log/scripts.log, upgrade relevant control components, and contact TAC if indicators are suspicious. This exhibit uses synthetic logs shaped like the public IoCs, with no exploit file or live device commands.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/netops/sdwan-cve-2026-20245",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls intel logs response"],
  commands: {
    "python3 advisory_triage.py --input intel/cisco-cve-2026-20245.md --summary":
      "simulated safe tool replay for cisco-sdwan-privesc; replaces: cat intel/cisco-cve-2026-20245.md\n",
    "python3 ir_toolkit.py parse-artifact --input inventory/control-plane.txt":
      "simulated safe tool replay for cisco-sdwan-privesc; replaces: cat inventory/control-plane.txt\n",
    'python3 ir_toolkit.py extract-ioc --ioc "Tenant list upload" --input logs/scripts.log':
      "simulated safe tool replay for cisco-sdwan-privesc; replaces: grep Tenant list upload logs/scripts.log\n",
    "tshark -r evidence.pcap --follow-log logs/scripts.log":
      "simulated safe tool replay for cisco-sdwan-privesc; replaces: cat logs/scripts.log\n",
    'python3 ir_toolkit.py extract-ioc --ioc "config-push" --input logs/change-audit.log':
      "simulated safe tool replay for cisco-sdwan-privesc; replaces: grep config-push logs/change-audit.log\n",
    "python3 safe_replay.py --scenario cisco-sdwan-privesc --grep challenge-ack --artifact logs/control-connections-detail.txt":
      "simulated safe tool replay for cisco-sdwan-privesc; replaces: grep challenge-ack logs/control-connections-detail.txt\n",
    "python3 ir_toolkit.py parse-artifact --input response/admin-tech-plan.txt":
      "simulated safe tool replay for cisco-sdwan-privesc; replaces: cat response/admin-tech-plan.txt\n",
    "python3 advisory_triage.py --input response/remediation-runbook.md --summary":
      "simulated safe tool replay for cisco-sdwan-privesc; replaces: cat response/remediation-runbook.md\n",
    "python3 ir_toolkit.py parse-artifact --input public-notes/ioc-shape.txt":
      "simulated safe tool replay for cisco-sdwan-privesc; replaces: cat public-notes/ioc-shape.txt\n",
  },
  files: {
    "/home/netops/sdwan-cve-2026-20245/intel/cisco-cve-2026-20245.md": {
      content: [
        "Cisco Security Advisory: CVE-2026-20245",
        "",
        "- First published: 2026-06-04 22:27 GMT.",
        "- Updated: 2026-06-05 with indicators of compromise.",
        "- Product: Cisco Catalyst SD-WAN Manager, formerly SD-WAN vManage.",
        "- Class: authenticated local privilege escalation to root through insufficient validation of uploaded file input.",
        "- Requirement: attacker must already have netadmin privileges, commonly from valid credentials or prior SD-WAN vulnerabilities.",
        "- Cisco PSIRT became aware of exploitation in June 2026.",
        "- Defensive priority: preserve admin-tech, audit /var/log/scripts.log, upgrade control components, and work with TAC if indicators are suspicious.",
        "",
        "Sources summarized in debrief: Cisco advisory cisco-sa-sdwan-privesc-4uxFrdzx and BleepingComputer coverage dated 2026-06-05.",
      ].join("\n"),
    },
    "/home/netops/sdwan-cve-2026-20245/inventory/control-plane.txt": {
      content: [
        "control-plane inventory snapshot",
        "manager: Manager01 role=vmanage version=20.15.4.3 internet_exposed_ports=443,830 mgmt_acl=wide",
        "controller: vSmart01 role=vsmart version=20.15.4.3 internet_exposed_ports=12346 mgmt_acl=corp-vpn",
        "validator: vBond01 role=vbond version=20.15.4.3 internet_exposed_ports=12346 mgmt_acl=corp-vpn",
        "note: all control components scheduled for fixed release 20.15.4.4 after evidence collection",
      ].join("\n"),
    },
    "/home/netops/sdwan-cve-2026-20245/logs/scripts.log": {
      content: [
        "Jun  5 12:58:04 Manager01 vScript: daily template validation complete template=branch-basic actor=netops-ci",
        "Jun  5 13:06:39 Manager01 vScript: vSmart upload serial numbers: /usr/bin/vconfd_script_upload_vsmart_serial_numbers.sh -cli path /home/admin/vsmart_serial_numbers_safe.csv",
        "Jun  5 13:08:47 vBond01 vScript: ZTP upload chassis numbers: /usr/bin/vconfd_script_upload_chassis_number_file.sh -cli path /home/admin/chassis_numbers_safe.csv",
        "Jun  5 13:14:22 Manager01 vScript: Tenant list upload per vsmart serial number: /usr/bin/vconfd_script_upload_tenant_list.sh -cli path /home/admin/tenant_delta_20260605.csv vpn 0",
        "Jun  5 13:17:03 Manager01 vScript: commit queue accepted change-id=74291 actor=vmanage-admin source=198.51.100.77",
      ].join("\n"),
    },
    "/home/netops/sdwan-cve-2026-20245/logs/change-audit.log": {
      content: [
        "2026-06-05T13:10:11Z audit read-only actor=netops-ci object=template/branch-basic result=ok",
        "2026-06-05T13:17:06Z audit config-push actor=vmanage-admin source=198.51.100.77 target=edge-group-west result=success",
        "2026-06-05T13:17:08Z audit config-push detail=unexpected vpn0 peer preference changed on 12 edges",
        "2026-06-05T13:25:44Z audit rollback actor=oncall-netops target=edge-group-west result=queued",
        "2026-06-05T13:31:19Z audit rollback actor=oncall-netops target=edge-group-west result=success",
      ].join("\n"),
    },
    "/home/netops/sdwan-cve-2026-20245/logs/control-connections-detail.txt": {
      content: [
        "REMOTE-COLOR- default SYSTEM-IP- 10.2.2.2   PEER-PERSONALITY- vmanage",
        "state               up",
        "Tx Statistics-",
        "  hello                   3423293",
        "  challenge               1",
        "  challenge-response      0",
        "  challenge-ack           0",
        "Rx Statistics-",
        "  hello                   3423291",
        "  challenge               0",
        "  challenge-response      1",
        "  challenge-ack           0",
        "",
        "REMOTE-COLOR- default SYSTEM-IP- 10.1.0.18   PEER-PERSONALITY- vmanage",
        "state               up",
        "Tx Statistics-",
        "  hello                   551",
        "  challenge               1",
        "  challenge-response      1",
        "  challenge-ack           1",
        "Rx Statistics-",
        "  hello                   549",
        "  challenge               1",
        "  challenge-response      1",
        "  challenge-ack           1",
      ].join("\n"),
    },
    "/home/netops/sdwan-cve-2026-20245/response/admin-tech-plan.txt": {
      content: [
        "admin-tech preservation plan",
        "",
        "1. Freeze volatile cleanup jobs on Manager01, vSmart01, and vBond01.",
        "2. Collect admin-tech with logs and tech options from all Managers and Validators.",
        "3. Collect vSmart admin-tech one controller at a time to avoid resource contention.",
        "4. Store bundles in evidence/sdwan-20260605/ and record SHA256 hashes out-of-band.",
        "5. Upgrade control components after collection, then upload bundles to TAC for scanning.",
        "6. If TAC confirms compromise, follow TAC remediation guidance before trusting the fabric state.",
      ].join("\n"),
    },
    "/home/netops/sdwan-cve-2026-20245/response/remediation-runbook.md": {
      content: [
        "SD-WAN CVE-2026-20245 response runbook",
        "",
        "- preserve admin-tech from all control components before upgrade",
        "- restrict management exposure and review allowed inbound prefixes",
        "- upgrade vulnerable control components to the nearest fixed train documented by Cisco",
        "- verify edge device configuration after upgrade",
        "- open TAC case if scripts.log or control-plane checks cannot be mapped to approved maintenance",
        "- keep rollback evidence and partner IR notes linked to the TAC case",
      ].join("\n"),
    },
    "/home/netops/sdwan-cve-2026-20245/public-notes/ioc-shape.txt": {
      content: [
        "Public IoC shape, safe excerpt",
        "",
        "Cisco's advisory tells customers to inspect /var/log/scripts.log for upload helper invocations.",
        "The rows can be legitimate, so a match is not proof of compromise.",
        "The defender task is correlation: who initiated it, from what source, in what maintenance window, and did edge configuration change afterward.",
        "",
        "Museum line used above:",
        "Tenant list upload per vsmart serial number: /usr/bin/vconfd_script_upload_tenant_list.sh -cli path /home/admin/tenant_delta_20260605.csv vpn 0",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "advisory",
      phase: "Recon",
      goal: "Summarize the Cisco advisory into defender actions.",
      hint: "`python3 advisory_triage.py --input intel/cisco-cve-2026-20245.md --summary`.",
      matches: [
        {
          kind: "exact",
          command: "python3 advisory_triage.py --input intel/cisco-cve-2026-20245.md --summary",
        },
      ],
      narration:
        "Start with the hard constraints: netadmin-level access, root impact, exploitation observed, no exploit details needed.",
    },
    {
      id: "inventory",
      phase: "Scoping",
      goal: "Inspect which SD-WAN control components need evidence collection and upgrade.",
      hint: "`python3 ir_toolkit.py parse-artifact --input inventory/control-plane.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input inventory/control-plane.txt" },
      ],
      narration:
        "The manager is internet-adjacent and the whole control plane is on an affected train, so evidence preservation must cover every component.",
    },
    {
      id: "scripts-ioc",
      phase: "Detection",
      goal: "Search scripts.log for the tenant-list upload pattern Cisco called out.",
      hint: '`python3 ir_toolkit.py extract-ioc --ioc "Tenant list upload" --input logs/scripts.log`.',
      matches: [
        {
          kind: "exact",
          command: 'python3 ir_toolkit.py extract-ioc --ioc "Tenant list upload" --input logs/scripts.log',
        },
      ],
      narration:
        "A scripts.log hit is a lead, not a verdict. Cisco noted these helpers can appear during legitimate operations.",
    },
    {
      id: "scripts-context",
      phase: "Detection",
      goal: "Read the surrounding synthetic scripts.log context before escalating.",
      hint: "`tshark -r evidence.pcap --follow-log logs/scripts.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log logs/scripts.log" }],
      narration:
        "The upload entry is followed by a commit from a source the team does not recognize, making correlation urgent.",
    },
    {
      id: "config-change",
      phase: "Impact",
      goal: "Correlate the suspicious upload window with edge configuration pushes.",
      hint: '`python3 ir_toolkit.py extract-ioc --ioc "config-push" --input logs/change-audit.log`.',
      matches: [
        {
          kind: "exact",
          command: 'python3 ir_toolkit.py extract-ioc --ioc "config-push" --input logs/change-audit.log',
        },
      ],
      narration:
        "Cisco said limited observed cases resulted in configuration changes pushed to edge devices. Your synthetic audit shows exactly why that matters.",
    },
    {
      id: "control-plane-check",
      phase: "Detection",
      goal: "Check manual control-connection evidence for missing challenge acknowledgements.",
      hint:
        "`python3 safe_replay.py --scenario cisco-sdwan-privesc --grep challenge-ack --artifact logs/control-connections-detail.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 safe_replay.py --scenario cisco-sdwan-privesc --grep challenge-ack --artifact logs/control-connections-detail.txt",
        },
      ],
      narration:
        "Manual checks are secondary to admin-tech, but they give responders a quick peer-session anomaly to document.",
    },
    {
      id: "preserve",
      phase: "Containment",
      goal: "Review the admin-tech collection sequence before any upgrade removes evidence.",
      hint: "`python3 ir_toolkit.py parse-artifact --input response/admin-tech-plan.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input response/admin-tech-plan.txt" },
      ],
      narration:
        "Preserve first, upgrade promptly second. That ordering matches Cisco's advisory language for possible compromise.",
    },
    {
      id: "remediate",
      phase: "Containment",
      goal: "Summarize the response runbook for upgrade and TAC handoff.",
      hint: "`python3 advisory_triage.py --input response/remediation-runbook.md --summary`.",
      matches: [
        {
          kind: "exact",
          command: "python3 advisory_triage.py --input response/remediation-runbook.md --summary",
        },
      ],
      narration:
        "The response is not just patching. It includes exposure review, config verification, evidence upload, and TAC guidance if compromise is confirmed.",
    },
    {
      id: "public-ioc-shape",
      phase: "Lessons",
      goal: "Review the safe public IoC shape and why it must be correlated.",
      hint: "`python3 ir_toolkit.py parse-artifact --input public-notes/ioc-shape.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input public-notes/ioc-shape.txt",
        },
      ],
      narration:
        "A public IoC becomes useful only when tied to actor, source, maintenance window, and downstream device state.",
    },
  ],
  debrief: {
    summary:
      "Cisco's CVE-2026-20245 advisory for Catalyst SD-WAN Manager was first published on 4 June 2026 and updated on 5 June with indicators of compromise. Cisco said PSIRT became aware of exploitation in June 2026, the bug requires netadmin-level access or prior compromise, and observed cases included configuration changes pushed to edge devices. BleepingComputer covered the active exploitation on 5 June 2026. This exhibit models the defender flow Cisco described: preserve admin-tech, inspect /var/log/scripts.log, correlate legitimate-looking helper use with change records, upgrade affected control components, and work with TAC when findings are suspicious. Sources: https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-sdwan-privesc-4uxFrdzx and https://www.bleepingcomputer.com/news/security/new-cisco-sd-wan-flaw-exploited-in-zero-day-attacks-to-gain-root/",
    lesson:
      "For control-plane appliances, a privilege escalation can look like normal administration. Preserve logs before upgrade, map helper commands to approved maintenance, and treat unexpected config pushes as fabric-wide impact until proven otherwise.",
    simulated: [
      "Manager names, IPs, scripts.log rows, control-connection snippets, change audit records, and runbooks are synthetic.",
      "The scenario does not include crafted files, exploit syntax, or live Cisco device commands.",
      "Facts reflected at a high level come from Cisco's public advisory and same-day public reporting.",
    ],
  },
};
