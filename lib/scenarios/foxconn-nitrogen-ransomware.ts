import type { Scenario } from "../types";

/**
 * Foxconn North America cyberattack confirmed May 13, 2026.
 * Public source: BleepingComputer report on Foxconn confirmation and Nitrogen ransomware claim.
 */
export const foxconnNitrogenRansomware: Scenario = {
  slug: "foxconn-nitrogen-ransomware",
  exhibit: "EXH-048",
  title: "Factory Leak Claim",
  tagline:
    "May 13, 2026. Foxconn confirms some North American factories suffered a cyberattack while Nitrogen claims 8 TB of files and 11 million documents. You separate public claims from recoverable factory evidence.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/ir/foxconn-northamerica",
  user: "responder",
  host: "factory-soc-02",
  role: "Incident responder coordinating factory operations, legal, and customer trust updates after a ransomware leak-site claim.",
  objective:
    "Validate the confirmed factory disruption, compare Nitrogen's leak claim with local telemetry, scope file-server staging, and verify containment plus production recovery.",
  briefing:
    "Foxconn publicly confirmed that some North American factories suffered a cyberattack and said affected factories were resuming normal production. This museum exhibit uses synthetic SOC artifacts to rehearse the defender loop behind that kind of statement: production continuity, double-extortion triage, file-server staging, egress review, backup readiness, and customer-data containment.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/ir/foxconn-northamerica",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/public-report.txt":
      "simulated safe tool replay for foxconn-nitrogen-ransomware; replaces: cat intel/public-report.txt\n",
    "nmap -Pn -p445,3389 10.66.14.20":
      [
        "Starting Nmap (simulated)",
        "PORT     STATE SERVICE",
        "445/tcp  open  microsoft-ds",
        "3389/tcp open  ms-wbt-server",
        "Host note: internal file server only, no internet-facing service in this exhibit",
      ].join("\n"),
    "tshark -r evidence.pcap --follow-log ops/production-recovery.log":
      "simulated safe tool replay for foxconn-nitrogen-ransomware; replaces: cat ops/production-recovery.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"8TB\"' --follow-log leak-site-claim.txt":
      "simulated safe tool replay for foxconn-nitrogen-ransomware; replaces: grep -nF 8TB leak-site-claim.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc svc_mes_backup --input edr/file-server-alerts.log":
      "simulated safe tool replay for foxconn-nitrogen-ransomware; replaces: grep -nF svc_mes_backup edr/file-server-alerts.log\n",
    "python3 ir_toolkit.py extract-ioc --ioc 7z --input edr/file-server-alerts.log":
      "simulated safe tool replay for foxconn-nitrogen-ransomware; replaces: grep -nF 7z edr/file-server-alerts.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"198.51.100.77\"' --follow-log netflow/egress.log":
      "simulated safe tool replay for foxconn-nitrogen-ransomware; replaces: grep -nF 198.51.100.77 netflow/egress.log\n",
    "python3 ir_toolkit.py parse-artifact --input backups/restore-readiness.txt":
      "simulated safe tool replay for foxconn-nitrogen-ransomware; replaces: cat backups/restore-readiness.txt\n",
    "tshark -r evidence.pcap --follow-log identity/admin-actions.log":
      "simulated safe tool replay for foxconn-nitrogen-ransomware; replaces: cat identity/admin-actions.log\n",
  },
  files: {
    "/home/ir/foxconn-northamerica/intel/public-report.txt": {
      content: [
        "Public report digest, 2026-05-13",
        "Source: BleepingComputer, Foxconn confirms cyberattack claimed by Nitrogen ransomware gang.",
        "Confirmed: some Foxconn factories in North America suffered a cyberattack.",
        "Company statement: cybersecurity team activated response mechanisms and operational measures.",
        "Company statement: affected factories were resuming normal production.",
        "Nitrogen claim: 8TB of data and more than 11 million documents stolen.",
        "Claimed content: confidential instructions, projects, and drawings from major customer programs.",
        "Unknown at report time: initial access vector, encryption scope, and whether claimed files were authentic.",
      ].join("\n"),
    },
    "/home/ir/foxconn-northamerica/ops/production-recovery.log": {
      content: [
        "2026-05-13T11:42Z site=NA-plant-2 line=SMT-A mes=manual-fallback status=degraded",
        "2026-05-13T12:05Z site=NA-plant-2 action=cybersecurity_response_mechanism activated=true",
        "2026-05-13T13:20Z site=NA-plant-2 line=SMT-A status=resuming-normal-production",
        "2026-05-13T14:10Z site=NA-plant-3 line=packout status=resuming-normal-production",
        "2026-05-13T15:02Z site=NA-plant-2 shipping=green customer-commitments=monitored",
      ].join("\n"),
    },
    "/home/ir/foxconn-northamerica/leak-site-claim.txt": {
      content: [
        "Nitrogen leak-site claim, analyst transcription",
        "victim=Foxconn North America",
        "claim_size=8TB",
        "claim_documents=11000000+",
        "claim_categories=confidential_instructions,projects,drawings,customer_program_files",
        "named_customers_in_claim=Apple,Intel,Google,Nvidia,AMD,others",
        "ransom_deadline=redacted",
        "SOC note: treat all customer names as unverified until legal and account teams confirm exposure.",
      ].join("\n"),
    },
    "/home/ir/foxconn-northamerica/edr/file-server-alerts.log": {
      content: [
        "2026-05-13T09:18:33Z host=fs-na-eng01 user=svc_mes_backup logon_type=3 src=10.66.18.44 result=success",
        "2026-05-13T09:22:10Z host=fs-na-eng01 process=7z.exe command='7z a \\\\10.66.14.20\\stage\\drawings.7z D:\\Engineering\\CustomerDrawings' user=svc_mes_backup",
        "2026-05-13T09:25:44Z host=fs-na-eng01 process=robocopy.exe command='robocopy D:\\Projects \\\\10.66.14.20\\stage\\projects /MIR' user=svc_mes_backup",
        "2026-05-13T09:31:09Z host=fs-na-eng01 process=vssadmin.exe command='delete shadows /all /quiet' action=blocked",
        "2026-05-13T09:40:11Z host=fs-na-eng01 alert=mass-read customer_drawings count=42391 severity=high",
      ].join("\n"),
    },
    "/home/ir/foxconn-northamerica/netflow/egress.log": {
      content: [
        "2026-05-13T09:48:00Z src=10.66.14.20 dst=198.51.100.77 proto=tcp bytes=2199023255552 label=external-storage",
        "2026-05-13T10:12:00Z src=10.66.14.20 dst=198.51.100.77 proto=tcp bytes=4398046511104 label=external-storage",
        "2026-05-13T10:37:00Z src=10.66.14.20 dst=198.51.100.77 proto=tcp bytes=2199023255552 label=external-storage",
        "2026-05-13T10:42:18Z firewall=egress-deny src=10.66.14.20 dst=198.51.100.77 result=blocked",
        "analyst_total_to_198.51.100.77=8796093022208 bytes, approximately 8TB, synthetic parity with claim",
      ].join("\n"),
    },
    "/home/ir/foxconn-northamerica/backups/restore-readiness.txt": {
      content: [
        "Restore readiness, NA factory file services",
        "fs-na-eng01 last immutable snapshot: 2026-05-13T04:00Z",
        "restore test: 2026-05-10 sample CAD tree restored to clean room in 18 minutes",
        "MES database: no destructive writes observed in this exhibit",
        "customer drawings: read-heavy exfil risk, not confirmed encryption loss",
        "recovery choice: restore staging shares only after account disable and egress block",
      ].join("\n"),
    },
    "/home/ir/foxconn-northamerica/identity/admin-actions.log": {
      content: [
        "2026-05-13T10:39Z disable_account user=svc_mes_backup success",
        "2026-05-13T10:40Z revoke_sessions user=svc_mes_backup success",
        "2026-05-13T10:42Z firewall_block dst=198.51.100.77 success",
        "2026-05-13T10:44Z isolate_host host=fs-na-eng01 mode=edr-network-containment success",
        "2026-05-13T11:05Z preserve_evidence host=fs-na-eng01 chain_of_custody=opened",
        "2026-05-13T12:22Z customer-trust draft=prepared scope=claims-vs-validated-telemetry",
      ].join("\n"),
    },
    "/home/ir/foxconn-northamerica/public-poc/nitrogen_factory_triage_note.txt": {
      content: [
        "# Defensive triage note for double-extortion claims in manufacturing.",
        "# 1. Keep production state separate from leak-site claims.",
        "# 2. Verify file-server reads, archive creation, and egress volume before customer notification.",
        "# 3. Disable abused service accounts before restoring shares.",
        "# 4. Preserve chain of custody for any claimed customer drawings or project files.",
        "",
        "# Museum: no ransomware payload, no leak-site content, no real customer files.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "public-report",
      phase: "Recon",
      goal: "Read the public-report digest that frames the confirmed incident and the Nitrogen claim.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/public-report.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/public-report.txt" },
      ],
      narration:
        "Start with what is confirmed, what is claimed, and what remains unknown. That keeps ransomware comms honest.",
    },
    {
      id: "scan-file-server",
      phase: "Recon",
      goal: "Scan the internal file-server anchor seen in staging paths (simulated nmap).",
      hint: "`nmap -Pn -p445,3389 10.66.14.20`.",
      matches: [{ kind: "exact", command: "nmap -Pn -p445,3389 10.66.14.20" }],
      narration:
        "SMB and RDP on an internal file server make this a factory file-services problem, not a public web exploit story.",
    },
    {
      id: "production",
      phase: "Impact",
      goal: "Review production recovery lines for the affected factory systems.",
      hint: "`tshark -r evidence.pcap --follow-log ops/production-recovery.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log ops/production-recovery.log" }],
      narration:
        "Operations can resume while IR continues. The job is controlled recovery, not waiting for perfect certainty.",
    },
    {
      id: "claim",
      phase: "Impact",
      goal: "Pull the 8TB leak-site claim from the analyst transcription.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"8TB\"' --follow-log leak-site-claim.txt`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap -Y 'frame contains \"8TB\"' --follow-log leak-site-claim.txt",
        },
      ],
      narration:
        "Leak-site numbers are pressure tactics until telemetry supports them. Here, the claim becomes a hypothesis to test.",
    },
    {
      id: "service-account",
      phase: "Initial access",
      goal: "Identify the service account tied to file-server access.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc svc_mes_backup --input edr/file-server-alerts.log`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc svc_mes_backup --input edr/file-server-alerts.log",
        },
      ],
      narration:
        "Manufacturing service accounts often bridge MES, file shares, and engineering data. That bridge is blast radius.",
    },
    {
      id: "archive-staging",
      phase: "Collection",
      goal: "Find archive creation that staged customer drawing files.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc 7z --input edr/file-server-alerts.log`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc 7z --input edr/file-server-alerts.log",
        },
      ],
      narration:
        "Before encryption comes collection. Archive commands plus mass reads are the double-extortion heartbeat.",
    },
    {
      id: "egress",
      phase: "Exfiltration",
      goal: "Compare outbound transfer volume against the leak-site claim.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"198.51.100.77\"' --follow-log netflow/egress.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "tshark -r evidence.pcap -Y 'frame contains \"198.51.100.77\"' --follow-log netflow/egress.log",
        },
      ],
      narration:
        "The synthetic netflow totals roughly 8TB, enough to treat customer program exposure as a working incident scope.",
    },
    {
      id: "backup-readiness",
      phase: "Recovery",
      goal: "Check immutable backup and restore-test readiness before bringing shares back.",
      hint: "`python3 ir_toolkit.py parse-artifact --input backups/restore-readiness.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input backups/restore-readiness.txt" },
      ],
      narration:
        "Resuming production safely depends on clean restore points and proof that destructive writes did not outrun snapshots.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify account disablement, session revocation, egress block, host isolation, and evidence preservation.",
      hint: "`tshark -r evidence.pcap --follow-log identity/admin-actions.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log identity/admin-actions.log" }],
      narration:
        "Containment is the sequence: kill identity, stop egress, isolate hosts, preserve evidence, then brief customers.",
    },
    {
      id: "mechanism-excerpt",
      goal: "Review the archived manufacturing ransomware triage note for this exhibit.",
      hint: "`head -n 80 public-poc/nitrogen_factory_triage_note.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/nitrogen_factory_triage_note.txt" }],
      narration:
        "The museum note is safe: defensive triage only, no ransomware payload and no real leaked material.",
    },
  ],
  debrief: {
    summary:
      "On May 13, 2026, BleepingComputer reported that Foxconn confirmed some North American factories suffered a cyberattack and were resuming normal production after response measures. The same report said Nitrogen ransomware claimed it stole 8 TB of data and more than 11 million documents, including confidential instructions, projects, and drawings tied to major customers. This exhibit turns those public facts into a synthetic responder exercise: factory recovery, leak-claim validation, file-server staging, egress review, backup readiness, and containment. Source: https://www.bleepingcomputer.com/news/security/electronics-giant-foxconn-confirms-cyberattack-on-north-american-factories/",
    lesson:
      "In manufacturing ransomware, public leak claims and production recovery statements move in parallel. Build a defensible bridge between them with identity timelines, archive staging, egress volume, immutable backups, and customer-data scope notes.",
    simulated: [
      "All hosts, IPs, account names, logs, file paths, timestamps after publication, and operational details are synthetic teaching artifacts.",
      "Foxconn confirmation, North American factory impact, Nitrogen attribution claim, 8 TB claim, 11 million document claim, and named customer-file categories are based on the public report cited in the debrief.",
      "No ransomware payloads, leak-site material, customer drawings, or real Foxconn data are included.",
    ],
  },
};
