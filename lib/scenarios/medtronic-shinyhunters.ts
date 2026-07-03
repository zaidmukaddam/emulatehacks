import type { Scenario } from "../types";

/** Real July 2026 disclosure: Medtronic patient notification after corporate IT breach. */
export const medtronicShinyhunters: Scenario = {
  slug: "medtronic-shinyhunters",
  exhibit: "EXH-048",
  title: "Patient Notice Window",
  tagline:
    "July 2, 2026. Medtronic notifies patients after unauthorized access to corporate IT systems. You separate device-safety facts from data-breach impact.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: false,
  cwd: "/home/soc/medtronic-brief",
  user: "responder",
  host: "health-ir-02",
  role: "Incident responder preparing an executive brief for a medical-device data breach.",
  objective:
    "Build the safe breach picture: confirm the July notice, identify the access window, compare the extortion claim, list exposed data classes, separate product safety from corporate IT, and verify notification controls.",
  briefing:
    "Medtronic disclosed that an unauthorized actor accessed certain corporate IT systems between April 13 and April 19, 2026, and began notifying affected patients on July 2. Public reporting also tied the incident to a ShinyHunters claim of more than nine million records, while Medtronic said device operation and patient therapy were not impacted. This exhibit turns that disclosure into a defensive triage drill.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/soc/medtronic-brief",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls notice evidence data response controls sources"],
  commands: {
    "curl -sI https://notice.medtronic.example/patient-data-incident-2026-07-02":
      [
        "HTTP/2 200",
        "last-modified: Thu, 02 Jul 2026 04:25:42 GMT",
        "x-incident-scope: corporate-it",
        "x-device-impact: none-reported",
        "(simulated header replay from public notification metadata)",
      ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input notice/summary.txt":
      "simulated safe tool replay for medtronic-shinyhunters; replaces: cat notice/summary.txt\n",
    "tshark -r evidence.pcap --follow-log evidence/access-window.log":
      "simulated safe tool replay for medtronic-shinyhunters; replaces: cat evidence/access-window.log\n",
    "python3 ir_toolkit.py parse-artifact --input evidence/shinyhunters-claim.txt":
      "simulated safe tool replay for medtronic-shinyhunters; replaces: cat evidence/shinyhunters-claim.txt\n",
    "python3 ir_toolkit.py parse-artifact --input data/exposed-classes.txt":
      "simulated safe tool replay for medtronic-shinyhunters; replaces: cat data/exposed-classes.txt\n",
    "python3 safe_replay.py --scenario medtronic-shinyhunters --grep device-safety --artifact response/talking-points.txt":
      "simulated safe tool replay for medtronic-shinyhunters; replaces: grep -nF device-safety response/talking-points.txt\n",
    "python3 ir_toolkit.py parse-artifact --input controls/notification-plan.txt":
      "simulated safe tool replay for medtronic-shinyhunters; replaces: cat controls/notification-plan.txt\n",
    "python3 ir_toolkit.py parse-artifact --input sources/public-reporting.txt":
      "simulated safe tool replay for medtronic-shinyhunters; replaces: cat sources/public-reporting.txt\n",
  },
  files: {
    "/home/soc/medtronic-brief/notice/summary.txt": {
      content: [
        "incident=Medtronic corporate IT data breach",
        "public_notice_date=2026-07-02",
        "detected=2026-04-15 unusual activity in certain corporate IT systems",
        "access_window=2026-04-13 through 2026-04-19",
        "scope=patient support, product update, safety notice, and regulatory records stored in corporate systems",
      ].join("\n"),
    },
    "/home/soc/medtronic-brief/evidence/access-window.log": {
      content: [
        "2026-04-13T21:18Z corp-vpn-04 auth accepted user=svc_case_sync src=198.51.100.67 mfa=push",
        "2026-04-15T03:42Z edr unusual_data_staging host=case-export-02 path=/srv/support/export",
        "2026-04-19T18:07Z ir containment disabled user=svc_case_sync revoked_sessions=7",
        "2026-07-02T04:25Z comms patient-notice batch=1 status=sent",
      ].join("\n"),
    },
    "/home/soc/medtronic-brief/evidence/shinyhunters-claim.txt": {
      content: [
        "source=public reporting of extortion-site listing",
        "actor_claim=ShinyHunters listed Medtronic on 2026-04-18",
        "claimed_volume=more than 9 million records",
        "deadline=2026-04-21",
        "status=listing removed later in April; company did not publicly attribute the attack",
      ].join("\n"),
    },
    "/home/soc/medtronic-brief/data/exposed-classes.txt": {
      content: [
        "potential_data_classes:",
        "- full name",
        "- contact information",
        "- date of birth",
        "- Social Security number",
        "- health-related information tied to Medtronic products and services",
        "",
        "known_public_exposure=no evidence reported that impacted information was posted publicly or exposed on the internet",
      ].join("\n"),
    },
    "/home/soc/medtronic-brief/response/talking-points.txt": {
      content: [
        "device-safety: Medtronic reported no impact to the ability of devices to operate safely or deliver intended therapy.",
        "business-operations: public notices described the incident as corporate IT, not manufacturing, distribution, financial reporting, or hospital customer networks.",
        "patient-risk: exposed data classes support identity theft, phishing, and medical-themed social engineering risk.",
        "briefing-rule: never let a leak-site volume claim replace validated affected-person counts.",
      ].join("\n"),
    },
    "/home/soc/medtronic-brief/controls/notification-plan.txt": {
      content: [
        "actions_completed:",
        "- isolated and investigated affected corporate systems",
        "- worked with third-party cybersecurity experts",
        "- notified regulators and law enforcement",
        "- sent patient notices beginning 2026-07-02",
        "- offered 24 months of credit monitoring, dark-web monitoring, and identity restoration",
        "",
        "next_questions:",
        "- validate affected-person count by jurisdiction",
        "- confirm whether data was copied or only accessed",
        "- preserve evidence for attribution without overclaiming",
      ].join("\n"),
    },
    "/home/soc/medtronic-brief/sources/public-reporting.txt": {
      content: [
        "BleepingComputer, 2026-07-02: Medtronic notifies customers impacted by ShinyHunters data breach.",
        "The Register, 2026-07-02: Pacemaker manufacturer Medtronic warns patients cybercrooks may have swiped health data.",
        "Both sources report April 13 to April 19 corporate IT access and July 2 patient notification.",
      ].join("\n"),
    },
    "/home/soc/medtronic-brief/public-poc/patient_breach_triage.sh": {
      content: [
        "#!/bin/sh",
        "# Safe incident-response checklist for a medical-device vendor breach.",
        "",
        "# 1. Confirm disclosure date and access window from the notice.",
        "# 2. Compare threat-actor claims against validated forensic scope.",
        "# 3. Separate corporate IT data exposure from device safety claims.",
        "# 4. Map exposed data classes to notification and monitoring duties.",
        "",
        "# No exploit payloads are included in this exhibit.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "curl-notice",
      phase: "Recon",
      goal: "Confirm the public notice metadata for the July 2 Medtronic incident.",
      hint: "`curl -sI https://notice.medtronic.example/patient-data-incident-2026-07-02`.",
      matches: [
        {
          kind: "exact",
          command:
            "curl -sI https://notice.medtronic.example/patient-data-incident-2026-07-02",
        },
      ],
      narration:
        "The first split is scope: this is a corporate IT breach notice, not a device-control finding.",
    },
    {
      id: "notice",
      phase: "Recon",
      goal: "Read the incident summary and extract the official access window.",
      hint: "`python3 ir_toolkit.py parse-artifact --input notice/summary.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input notice/summary.txt",
        },
      ],
      narration:
        "April 13 to April 19 is the working window. Every later claim should be tied back to evidence from that range.",
    },
    {
      id: "access-window",
      phase: "Initial access",
      goal: "Review the reconstructed access-window log for detection and containment milestones.",
      hint: "`tshark -r evidence.pcap --follow-log evidence/access-window.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap --follow-log evidence/access-window.log",
        },
      ],
      narration:
        "The log compresses the timeline: access begins, unusual staging triggers response, and sessions are revoked.",
    },
    {
      id: "claim",
      phase: "Extortion",
      goal: "Compare the public ShinyHunters claim with what the company validated.",
      hint: "`python3 ir_toolkit.py parse-artifact --input evidence/shinyhunters-claim.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input evidence/shinyhunters-claim.txt",
        },
      ],
      narration:
        "Leak-site copy is a lead, not a source of truth. Treat volume and attribution claims as unverified until forensics catches up.",
    },
    {
      id: "data-classes",
      phase: "Impact",
      goal: "List the patient data classes that may have been exposed.",
      hint: "`python3 ir_toolkit.py parse-artifact --input data/exposed-classes.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input data/exposed-classes.txt",
        },
      ],
      narration:
        "Names plus contact, birth, Social Security, and health details create phishing and identity-risk work even without public posting.",
    },
    {
      id: "device-safety",
      phase: "Scope",
      goal: "Find the line that separates device safety from corporate IT exposure.",
      hint: "`python3 safe_replay.py --scenario medtronic-shinyhunters --grep device-safety --artifact response/talking-points.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 safe_replay.py --scenario medtronic-shinyhunters --grep device-safety --artifact response/talking-points.txt",
        },
      ],
      narration:
        "Healthcare breach response must answer the patient’s first question plainly: are devices and therapy affected?",
    },
    {
      id: "controls",
      phase: "Containment",
      goal: "Verify notification, monitoring, and follow-up control actions.",
      hint: "`python3 ir_toolkit.py parse-artifact --input controls/notification-plan.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input controls/notification-plan.txt",
        },
      ],
      narration:
        "A clean brief ends with controls completed, open questions, and support offered to affected patients.",
    },
    {
      id: "sources",
      phase: "Lessons",
      goal: "Review the public reporting notes used to ground the exhibit.",
      hint: "`python3 ir_toolkit.py parse-artifact --input sources/public-reporting.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input sources/public-reporting.txt",
        },
      ],
      narration:
        "Corroboration matters: use public reporting to frame the exercise, then keep the response tied to validated facts.",
    },
    {
      id: "mechanism-excerpt",
      goal: "Review the archived public triage excerpt for this exhibit.",
      hint: `head -n 80 public-poc/patient_breach_triage.sh`,
      matches: [
        {
          kind: "exact",
          command: "head -n 80 public-poc/patient_breach_triage.sh",
        },
      ],
      narration:
        "This exhibit contains a response checklist only. No exploit path, payload, or stolen data is reproduced.",
    },
  ],
  debrief: {
    summary:
      "Medtronic began notifying affected patients on July 2, 2026, after an April corporate IT intrusion. The public exercise is to keep three threads separate: the validated corporate access window, the ShinyHunters extortion claim, and the company’s statement that medical devices were not impacted.",
    lesson:
      "In medical-device incidents, patient trust depends on precise scoping. State what data may be exposed, say what is still unknown, and separate patient-safety claims from corporate IT compromise before drafting notifications.",
    simulated: [
      "Hostnames, IPs, service accounts, logs, and file paths are invented for the exhibit shell.",
      "The April 13 to April 19 access window, July 2 notification reporting, potential data classes, ShinyHunters claim, and no-reported-device-impact statement are grounded in public reporting from BleepingComputer and The Register.",
      "No stolen patient data, exploit instructions, or attacker infrastructure are included.",
    ],
  },
};
