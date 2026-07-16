import type { Scenario } from "../types";

/**
 * Defensive reconstruction of the Reliance Infrastructure hosted-server breach
 * disclosed on 15 July 2026. Public facts come from Reuters reporting carried by
 * CNA and NPCIL's statement reported by The Hindu. All terminal telemetry is synthetic.
 */
export const relianceHostedServerBreach: Scenario = {
  slug: "reliance-hosted-server-breach",
  exhibit: "EXH-048",
  title: "Stopped Payload, Open Questions",
  tagline:
    "15 July 2026. Reliance confirms a partial breach on a third-party hosted server. The provider says ransomware execution was stopped, yet a leak claim forces responders to separate containment from data exposure.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/ir/contractor-breach",
  user: "responder",
  host: "review-station-08",
  role: "Incident responder reconciling a provider alert, contractor records, and a public extortion claim.",
  objective:
    "Build a defensible timeline, test the no-impact claims against synthetic access evidence, preserve the boundary between contractor files and plant control systems, then verify containment and notification.",
  briefing:
    "Public reporting on 15 July described a partial breach of Reliance Infrastructure data on one server hosted by Yotta. Yotta said it detected suspicious activity on 29 May, terminated the process, isolated the server, and prevented suspected ransomware execution. World Leaks separately claimed a large data theft. NPCIL said the material described in public reporting concerned conventional balance-of-plant facilities, not nuclear safety or security systems. This exhibit teaches the gap between stopping encryption and ruling out prior file access. It does not recreate the intrusion method or expose leaked documents.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/ir/contractor-breach",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "jq . provider/endpoint-alert.json": [
      "{",
      '  "detected_utc": "2026-05-29T04:18:31Z",',
      '  "asset": "contractor-docs-03",',
      '  "process_outcome": "terminated_before_encryption",',
      '  "host_outcome": "isolated",',
      '  "file_access_review": "required",',
      '  "exercise_note": "synthetic telemetry, not a provider log"',
      "}",
    ],
    "tshark -r evidence.pcap --follow-log evidence/server-audit.log": [
      "2026-05-29T04:11:02Z asset=contractor-docs-03 event=session_start source=198.51.100.84",
      "2026-05-29T04:13:19Z asset=contractor-docs-03 event=archive_read path=/projects/shared-docs count=1842",
      "2026-05-29T04:17:55Z asset=contractor-docs-03 event=suspicious_process verdict=blocked",
      "2026-05-29T04:18:31Z asset=contractor-docs-03 event=network_isolate result=success",
      "# Synthetic exercise rows. They are not attributed to Reliance or Yotta.",
    ],
    "python3 ir_toolkit.py table-summary --input review/claim-matrix.csv": [
      "[ir_toolkit] columns (4): ['question', 'public_position', 'exercise_evidence', 'response']",
      "[ir_toolkit] data rows: 4",
    ].join("\n"),
    "tshark -r evidence.pcap --follow-log containment/actions.log": [
      "2026-05-29T04:18:31Z isolate_host contractor-docs-03 success",
      "2026-05-29T04:22:08Z preserve_disk_image contractor-docs-03 success",
      "2026-05-29T04:31:44Z rotate_service_identity docs-sync success",
      "2026-05-29T05:04:10Z restrict_repository_export shared-docs success",
      "2026-05-29T06:15:00Z notify_response_partners status=initiated",
      "# Synthetic containment sequence for the exercise.",
    ],
  },
  files: {
    "/home/ir/contractor-breach/intel/disclosure.txt": {
      content: [
        "PUBLIC DISCLOSURE BRIEF",
        "",
        "Report date: 2026-07-15",
        "Detection date stated by provider: 2026-05-29",
        "Reliance position: partial breach of data on one third-party hosted server.",
        "Yotta position: suspicious activity terminated and suspected ransomware execution prevented.",
        "Extortion claim: World Leaks posted a large cache it attributed to Reliance.",
        "Independent reporting: Reuters reviewed samples but could not authenticate every document.",
        "NPCIL scope statement: described material concerns conventional balance-of-plant facilities,",
        "not nuclear safety or nuclear security systems.",
        "",
        "Responder rule: process containment does not by itself prove that no files were accessed.",
      ].join("\n"),
    },
    "/home/ir/contractor-breach/provider/endpoint-alert.json": {
      content: [
        "{",
        '  "detected_utc": "2026-05-29T04:18:31Z",',
        '  "asset": "contractor-docs-03",',
        '  "process_outcome": "terminated_before_encryption",',
        '  "host_outcome": "isolated",',
        '  "file_access_review": "required",',
        '  "exercise_note": "synthetic telemetry, not a provider log"',
        "}",
      ].join("\n"),
    },
    "/home/ir/contractor-breach/evidence/server-audit.log": {
      content: [
        "2026-05-29T04:11:02Z asset=contractor-docs-03 event=session_start source=198.51.100.84",
        "2026-05-29T04:13:19Z asset=contractor-docs-03 event=archive_read path=/projects/shared-docs count=1842",
        "2026-05-29T04:17:55Z asset=contractor-docs-03 event=suspicious_process verdict=blocked",
        "2026-05-29T04:18:31Z asset=contractor-docs-03 event=network_isolate result=success",
        "# Synthetic exercise rows. They are not attributed to Reliance or Yotta.",
      ].join("\n"),
    },
    "/home/ir/contractor-breach/evidence/repository-map/categories.txt": {
      content: [
        "Broad categories reported in public coverage:",
        "- project correspondence",
        "- meeting and inspection records",
        "- supplier and procurement records",
        "- conventional facility engineering material",
        "- insurance and administrative records",
        "",
        "No leaked files are stored in this exhibit.",
      ].join("\n"),
    },
    "/home/ir/contractor-breach/review/claim-matrix.csv": {
      content: [
        "question,public_position,exercise_evidence,response",
        "Did ransomware encrypt the server?,Provider says prevented,Blocked process row,Preserve endpoint evidence",
        "Could files have been read first?,Not resolved by process block,Earlier archive-read row,Review access and egress",
        "Were nuclear control systems reached?,NPCIL says no,Contractor repository boundary,Keep scope statement precise",
        "Is every leaked file authentic?,Not independently verified,Public claim only,Validate without redistributing",
      ].join("\n"),
    },
    "/home/ir/contractor-breach/scope/plant-boundary.txt": {
      content: [
        "SCOPE BOUNDARY",
        "",
        "Affected environment described publicly:",
        "  Reliance Infrastructure data on a server hosted by Yotta.",
        "",
        "NPCIL statement reported 15 July 2026:",
        "  Material described publicly relates to conventional balance-of-plant common services.",
        "  It does not relate to nuclear safety or nuclear security systems or information.",
        "",
        "Do not rewrite a contractor document-server breach as compromise of reactor control systems.",
      ].join("\n"),
    },
    "/home/ir/contractor-breach/containment/actions.log": {
      content: [
        "2026-05-29T04:18:31Z isolate_host contractor-docs-03 success",
        "2026-05-29T04:22:08Z preserve_disk_image contractor-docs-03 success",
        "2026-05-29T04:31:44Z rotate_service_identity docs-sync success",
        "2026-05-29T05:04:10Z restrict_repository_export shared-docs success",
        "2026-05-29T06:15:00Z notify_response_partners status=initiated",
        "# Synthetic containment sequence for the exercise.",
      ].join("\n"),
    },
    "/home/ir/contractor-breach/public-poc/july15-source-note.txt": {
      content: [
        "Museum source note. No exploit or leaked material is included.",
        "",
        "Reuters report carried by CNA, 15 July 2026:",
        "https://www.channelnewsasia.com/business/exclusive-files-relating-indias-largest-nuclear-power-plant-kudankulam-exposed-in-data-breach-6255651",
        "",
        "NPCIL statement reported by The Hindu, 15 July 2026:",
        "https://www.thehindu.com/news/national/kudankulam-nuclear-plant-data-breach-triggers-absolute-commotion-among-projects-top-brass-sources/article71226328.ece",
        "",
        "Public facts retained: provider detection date, partial-breach confirmation,",
        "ransomware-prevention statement, leak claim, and NPCIL scope boundary.",
        "All terminal hosts, timestamps after detection, audit rows, and response actions are synthetic.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "disclosure",
      phase: "Recon",
      goal: "Read the disclosure brief and separate the May event from the July reporting date.",
      hint: "`cat intel/disclosure.txt`.",
      matches: [{ kind: "exact", command: "cat intel/disclosure.txt" }],
      narration:
        "The breach was publicly detailed on 15 July, but the provider said it detected activity on 29 May. A clean timeline prevents headline date drift.",
    },
    {
      id: "provider-alert",
      phase: "Detection",
      goal: "Inspect the synthetic endpoint alert and identify what the provider control did not prove.",
      hint: "`jq . provider/endpoint-alert.json`.",
      matches: [{ kind: "exact", command: "jq . provider/endpoint-alert.json" }],
      narration:
        "Terminated before encryption is a process outcome. It is not a finding about earlier archive reads or outbound transfer.",
    },
    {
      id: "audit",
      phase: "Impact",
      goal: "Review the synthetic server timeline around detection and isolation.",
      hint: "`tshark -r evidence.pcap --follow-log evidence/server-audit.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap --follow-log evidence/server-audit.log",
        },
      ],
      narration:
        "The exercise places a bulk read before the blocked process. Responders must investigate data access independently from ransomware execution.",
    },
    {
      id: "repository-scope",
      phase: "Impact",
      goal: "List only the broad repository categories described by public reporting.",
      hint: "`cat evidence/repository-map/categories.txt`.",
      matches: [
        {
          kind: "exact",
          command: "cat evidence/repository-map/categories.txt",
        },
      ],
      narration:
        "Useful triage can classify exposed records without downloading, opening, or redistributing sensitive leaked documents.",
    },
    {
      id: "claim-matrix",
      phase: "Analysis",
      goal: "Summarize the questions that remain after comparing public claims with exercise evidence.",
      hint: "`python3 ir_toolkit.py table-summary --input review/claim-matrix.csv`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py table-summary --input review/claim-matrix.csv",
        },
      ],
      narration:
        "A claim matrix keeps confirmed facts, synthetic evidence, and unresolved questions from collapsing into one confident story.",
    },
    {
      id: "boundary",
      phase: "Analysis",
      goal: "Verify the line between the contractor repository and nuclear safety systems.",
      hint: "`cat scope/plant-boundary.txt`.",
      matches: [{ kind: "exact", command: "cat scope/plant-boundary.txt" }],
      narration:
        "NPCIL said the reported material concerned conventional common services. Precision matters when critical infrastructure is in the headline.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify the synthetic isolation, preservation, identity rotation, and notification sequence.",
      hint: "`tshark -r evidence.pcap --follow-log containment/actions.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap --follow-log containment/actions.log",
        },
      ],
      narration:
        "Good containment preserves evidence before cleanup, constrains repository export, rotates service access, and brings the right partners into scope.",
    },
    {
      id: "source-note",
      phase: "Lessons",
      goal: "Review the public sources and the exhibit's simulation boundary.",
      hint: "`head -n 80 public-poc/july15-source-note.txt`.",
      matches: [
        {
          kind: "exact",
          command: "head -n 80 public-poc/july15-source-note.txt",
        },
      ],
      narration:
        "The exhibit retains only sourced public claims and synthetic defensive telemetry. No leaked documents or intrusion recipe are present.",
    },
  ],
  debrief: {
    summary:
      "On 15 July 2026, Reuters reported that Reliance Group confirmed a partial breach involving data on a server hosted by Yotta. Yotta said it detected suspicious activity on 29 May, terminated the process, isolated the server, and prevented suspected ransomware execution. World Leaks claimed a much larger theft and published files it attributed to Reliance. Reuters reviewed samples but could not verify every document. NPCIL later said the reported material concerned conventional balance-of-plant common services and did not involve nuclear safety or nuclear security systems. Sources: https://www.channelnewsasia.com/business/exclusive-files-relating-indias-largest-nuclear-power-plant-kudankulam-exposed-in-data-breach-6255651 and https://www.thehindu.com/news/national/kudankulam-nuclear-plant-data-breach-triggers-absolute-commotion-among-projects-top-brass-sources/article71226328.ece",
    lesson:
      "Do not use successful ransomware prevention as shorthand for no breach. Investigate access, staging, and egress separately, preserve provider evidence, and describe critical-infrastructure boundaries with exact language.",
    simulated: [
      "Hostnames, IP addresses, exact alert fields, access rows, and containment timestamps are invented.",
      "The archive-read event is a teaching device and is not attributed to Reliance, Yotta, World Leaks, or NPCIL.",
      "No leaked documents, malware, credentials, exploit path, or operational plant details are included.",
    ],
  },
};
