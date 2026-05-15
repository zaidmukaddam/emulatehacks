import type { Scenario } from "../types";

/**
 * Grounded in May 2026 reporting that Foxconn confirmed a cyberattack on North
 * American factories after Nitrogen claimed an 8 TB, 11M-file ransomware theft.
 * All logs and hostnames below are synthetic museum evidence.
 */
export const foxconnNitrogenRansomware: Scenario = {
  slug: "foxconn-nitrogen-ransomware",
  exhibit: "EXH-048",
  title: "Factory Floor Double Extortion",
  tagline:
    "May 14, 2026. Foxconn says North American factories are resuming after a cyberattack while Nitrogen claims 8 TB of project files. You triage factory disruption without validating attacker hype.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/ir/foxconn-nitrogen",
  user: "responder",
  host: "factory-soc-02",
  role: "Manufacturing incident responder separating confirmed disruption from ransomware-leak claims.",
  objective:
    "Confirm the public facts, map operational impact, review the alleged data classes, assess restore risk, and verify containment work.",
  briefing:
    "Foxconn confirmed that some North American factories suffered a cyberattack and were resuming normal production. Nitrogen claimed responsibility, alleging 8 TB and more than 11 million files containing confidential instructions, projects, and drawings tied to major technology customers. Your job is to triage with evidence discipline: confirmed company statements first, attacker claims second, containment receipts last.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/ir/foxconn-nitrogen" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "goal"],
  commands: {
    "curl -sI https://factory-status.example/na-production":
      [
        "HTTP/2 200",
        "server: museum-status",
        "x-production-state: resuming-normal-production",
        "x-incident-scope: some-north-american-factories",
      ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input intel/public-brief.txt":
      [
        "Public brief loaded:",
        "- Foxconn confirmed some North American factories suffered a cyberattack.",
        "- The company said response measures were activated to maintain production and delivery.",
        "- Nitrogen claimed responsibility and alleged 8 TB across more than 11 million files.",
        "- Foxconn had not confirmed ransomware mechanics, ransom demand, or customer data theft.",
      ].join("\n"),
    "tshark -r evidence.pcap --follow-log ops/factory-restart.log":
      [
        "2026-05-12T13:02Z site=NA-assembly-3 erp=restored mes=partial shipment_queue=degraded",
        "2026-05-12T14:18Z site=NA-assembly-3 production_line=A status=resuming",
        "2026-05-12T15:44Z site=NA-assembly-5 network_segment=floor-wifi status=isolated",
      ].join("\n"),
    "python3 ir_toolkit.py extract-ioc --ioc nitrogen --input leak/nitrogen-claim.txt":
      [
        "nitrogen claim summary:",
        "claimed_actor=Nitrogen",
        "claimed_volume=8 TB",
        "claimed_file_count=11M+",
        "claimed_content=confidential instructions, projects, drawings",
        "status=attacker-claimed-not-company-confirmed",
      ].join("\n"),
    "python3 ir_toolkit.py summarize --input inventory/alleged-project-classes.csv":
      [
        "class,count,handling",
        "assembly-instruction,42,customer-notification-review",
        "product-drawing,37,legal-and-engineering-review",
        "network-topology,9,highest-escalation",
        "financial-document,4,fraud-monitoring",
      ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input recovery/nitrogen-esxi-risk.txt":
      [
        "restore risk:",
        "Coveware researchers reported a Nitrogen ESXi encryptor bug that can corrupt files with the wrong public key.",
        "Decision: preserve forensic images, prioritize clean rebuilds, and do not treat payment as a reliable recovery path.",
      ].join("\n"),
    "tshark -r evidence.pcap --follow-log containment/actions.log":
      [
        "2026-05-12T13:08Z isolate_floor_vlan sites=NA-assembly-3,NA-assembly-5 success",
        "2026-05-12T13:22Z freeze_vendor_file_shares scope=customer-projects success",
        "2026-05-12T13:49Z rotate_supplier_portal_creds customers=priority-tier success",
        "2026-05-12T14:35Z notify_customer_security_contacts status=in-progress",
        "2026-05-12T15:10Z rebuild_priority erp,mes,shipping source=clean-images",
      ].join("\n"),
  },
  files: {
    "/home/ir/foxconn-nitrogen/ir_toolkit.py": {
      content: [
        "#!/usr/bin/env python3",
        "\"\"\"Scenario helper for safe incident-response parsing.",
        "",
        "Supported modes in this exhibit:",
        "  parse-artifact --input PATH",
        "  extract-ioc --ioc VALUE --input PATH",
        "  summarize --input PATH",
        "",
        "The museum shell intercepts exact commands from scenario.commands.",
        "No code runs and no network is touched.",
        "\"\"\"",
        "raise SystemExit('simulated helper: canned output only')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/ir/foxconn-nitrogen/intel/public-brief.txt": {
      content: [
        "Foxconn / Nitrogen public reporting brief, May 2026",
        "",
        "Confirmed by company spokesperson:",
        "- Some North American factories suffered a cyberattack.",
        "- Cybersecurity response measures were activated.",
        "- Affected factories were resuming normal production.",
        "",
        "Claimed by Nitrogen on its leak site:",
        "- 8 TB of data.",
        "- More than 11 million files.",
        "- Confidential instructions, projects, and drawings tied to major customers.",
        "",
        "Open questions:",
        "- Whether customer data was actually stolen.",
        "- Whether systems were encrypted at affected sites.",
        "- Whether a ransom demand exists.",
      ].join("\n"),
    },
    "/home/ir/foxconn-nitrogen/ops/factory-restart.log": {
      content: [
        "2026-05-12T13:02Z site=NA-assembly-3 erp=restored mes=partial shipment_queue=degraded",
        "2026-05-12T14:18Z site=NA-assembly-3 production_line=A status=resuming",
        "2026-05-12T15:44Z site=NA-assembly-5 network_segment=floor-wifi status=isolated",
        "2026-05-12T16:21Z site=NA-assembly-5 paper-traveler=enabled quality_hold=manual",
      ].join("\n"),
    },
    "/home/ir/foxconn-nitrogen/leak/nitrogen-claim.txt": {
      content: [
        "Attacker claim digest, sanitized from public reporting",
        "",
        "actor=Nitrogen",
        "victim=Foxconn North America factories",
        "claimed_volume=8 TB",
        "claimed_files=11M+",
        "claimed_customers=Apple, Intel, Google, Dell, Nvidia, AMD",
        "claimed_data=confidential instructions, projects, drawings",
        "",
        "Analyst note: treat as pressure material until validated by victim-side logs and customer artifact review.",
      ].join("\n"),
    },
    "/home/ir/foxconn-nitrogen/inventory/alleged-project-classes.csv": {
      content: [
        "class,count,example,triage",
        "assembly-instruction,42,line bring-up runbook,customer-notification-review",
        "product-drawing,37,board outline drawing,legal-and-engineering-review",
        "network-topology,9,data-center layout excerpt,highest-escalation",
        "financial-document,4,bank statement screenshot,fraud-monitoring",
      ].join("\n"),
    },
    "/home/ir/foxconn-nitrogen/recovery/nitrogen-esxi-risk.txt": {
      content: [
        "Nitrogen recovery risk note",
        "",
        "Public reporting cited Coveware research that a Nitrogen ESXi encryptor bug can encrypt files with the wrong public key.",
        "If that happens, files may remain unrecoverable even if a victim pays.",
        "",
        "Response posture:",
        "- Preserve images for forensics.",
        "- Rebuild priority production systems from clean images.",
        "- Validate backups before reconnecting factory networks.",
        "- Do not assume ransom negotiation creates a working decrypt path.",
      ].join("\n"),
    },
    "/home/ir/foxconn-nitrogen/containment/actions.log": {
      content: [
        "2026-05-12T13:08Z isolate_floor_vlan sites=NA-assembly-3,NA-assembly-5 success",
        "2026-05-12T13:22Z freeze_vendor_file_shares scope=customer-projects success",
        "2026-05-12T13:49Z rotate_supplier_portal_creds customers=priority-tier success",
        "2026-05-12T14:35Z notify_customer_security_contacts status=in-progress",
        "2026-05-12T15:10Z rebuild_priority erp,mes,shipping source=clean-images",
      ].join("\n"),
    },
    "/home/ir/foxconn-nitrogen/public-poc/nitrogen_double_extortion_notes.txt": {
      content: [
        "Museum note: double-extortion ransomware triage",
        "",
        "1. Separate confirmed victim facts from leak-site claims.",
        "2. Identify which production cells are safe to resume.",
        "3. Freeze shared project repositories before customer artifact review.",
        "4. Rotate supplier and customer portal credentials that touched the affected enclave.",
        "5. Rebuild from known-good images when encryptor reliability is questionable.",
        "",
        "No payloads, decryptors, or leaked data are present in this exhibit.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "status",
      phase: "Recon",
      goal: "Check the simulated factory status endpoint for confirmed operational scope.",
      hint: "`curl -sI https://factory-status.example/na-production`.",
      matches: [{ kind: "exact", command: "curl -sI https://factory-status.example/na-production" }],
      narration:
        "Start with confirmed operations: some North American factories were affected, and production was resuming.",
    },
    {
      id: "brief",
      phase: "Recon",
      goal: "Read the public-brief summary separating confirmed facts from claims.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/public-brief.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/public-brief.txt" }],
      narration:
        "Evidence discipline matters in extortion cases. Company confirmation and attacker leverage copy are different evidence classes.",
    },
    {
      id: "factory-impact",
      phase: "Impact",
      goal: "Review restart telemetry for affected production and isolated floor networks.",
      hint: "`tshark -r evidence.pcap --follow-log ops/factory-restart.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log ops/factory-restart.log" }],
      narration:
        "Factory recovery is not just servers online. MES, ERP, Wi-Fi, paper travelers, and shipping queues all gate safe restart.",
    },
    {
      id: "claim",
      phase: "Extortion",
      goal: "Extract the Nitrogen claim details from the sanitized leak-site digest.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc nitrogen --input leak/nitrogen-claim.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc nitrogen --input leak/nitrogen-claim.txt" }],
      narration:
        "The 8 TB and 11M-file figures are attacker claims. They guide triage, but they do not become facts until validated.",
    },
    {
      id: "project-classes",
      phase: "Scoping",
      goal: "Summarize alleged customer-project data classes for escalation.",
      hint: "`python3 ir_toolkit.py summarize --input inventory/alleged-project-classes.csv`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py summarize --input inventory/alleged-project-classes.csv" }],
      narration:
        "Network topology and product drawings create supply-chain risk beyond ordinary data theft because customers may need to rotate designs, access paths, or fraud controls.",
    },
    {
      id: "restore-risk",
      phase: "Recovery",
      goal: "Read the Nitrogen ESXi encryptor reliability note before choosing restore strategy.",
      hint: "`python3 ir_toolkit.py parse-artifact --input recovery/nitrogen-esxi-risk.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input recovery/nitrogen-esxi-risk.txt" }],
      narration:
        "If an encryptor can corrupt keys, ransom payment is not a recovery plan. Clean rebuilds and validated backups become the decision path.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify isolation, share freeze, credential rotation, customer notification, and rebuild work.",
      hint: "`tshark -r evidence.pcap --follow-log containment/actions.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/actions.log" }],
      narration:
        "Containment spans OT segmentation, project repository freezes, supplier credential rotation, and customer security contact loops.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the archived double-extortion triage note for this exhibit.",
      hint: "`head -n 80 public-poc/nitrogen_double_extortion_notes.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/nitrogen_double_extortion_notes.txt" }],
      narration:
        "The durable lesson is not the leak-site number. It is the habit of preserving evidence while restarting production safely.",
    },
  ],
  debrief: {
    summary:
      "May 2026 reporting said Foxconn confirmed a cyberattack affecting some North American factories while the Nitrogen ransomware group claimed it stole 8 TB and more than 11 million files, including confidential instructions, projects, and drawings tied to major customers. CyberScoop published fresh May 14 coverage; BleepingComputer and TechCrunch carried the core confirmation and claim details. Foxconn had not confirmed customer data theft, ransomware encryption, or a ransom demand in the cited reports.",
    lesson:
      "For manufacturing ransomware, triage must balance uptime and evidence: segment the factory floor, freeze shared project repositories, rotate supplier credentials, validate backups, and brief customers from confirmed facts rather than leak-site pressure copy.",
    simulated: [
      "All hostnames, logs, customer-project inventory rows, timestamps, and containment receipts are synthetic.",
      "The public reporting date, Foxconn confirmation, Nitrogen claim, 8 TB figure, 11M-file figure, and alleged customer-project data classes are grounded in cited May 2026 reporting.",
      "No stolen files, ransomware payloads, or decryptor details are present.",
    ],
  },
};
