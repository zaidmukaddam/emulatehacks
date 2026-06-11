import type { Scenario } from "../types";

/**
 * Mackay Sugar cyber incident, reported 2026-06-10 by ABC News and The Record.
 * Public reporting confirmed operational disruption at Farleigh and Racecourse mills,
 * cane haulage suspension, grower cease-harvest instructions, and recovery work.
 * No ransomware, actor, exploit path, or data-theft claim is assumed here.
 */
export const mackaySugarMillOutage: Scenario = {
  slug: "mackay-sugar-mill-outage",
  exhibit: "EXH-048",
  title: "Crush Season Stop",
  tagline:
    "10 June 2026. A cyber incident halts Mackay Sugar's Farleigh and Racecourse mills just as crushing begins. You coordinate safe operations evidence without inventing attacker claims.",
  category: "incident-response",
  difficulty: "beginner",
  era: "2020s",
  year: "2026",
  estMinutes: 8,
  fictional: true,
  cwd: "/home/ops/mackay-sugar-ir",
  user: "responder",
  host: "mill-ops-bridge",
  role: "Incident coordinator preserving operational facts during an agricultural technology outage.",
  objective:
    "Build the first incident timeline: confirm which mills stopped, verify cane haulage fallback, preserve grower instructions, and check recovery communications.",
  briefing:
    "Mackay Sugar said it was responding to a cyber security incident affecting operations on 10 June 2026. Public reporting said Farleigh and Racecourse milling and cane haulage stopped, growers were told to cease harvesting, and the company was working with experts and authorities. This exhibit rehearses disciplined outage response when the intrusion details are not yet public.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/ops/mackay-sugar-ir" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input reports/public-brief.txt":
      "simulated safe tool replay for mackay-sugar-mill-outage; replaces: cat reports/public-brief.txt\n",
    "python3 ir_toolkit.py parse-artifact --input ops/mill-status.log":
      "simulated safe tool replay for mackay-sugar-mill-outage; replaces: cat ops/mill-status.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"haulage\"' --follow-log logistics/haulage-status.log":
      "simulated safe tool replay for mackay-sugar-mill-outage; replaces: grep -nF haulage logistics/haulage-status.log\n",
    "python3 ir_toolkit.py extract-ioc --ioc fallback --input safety/fallback-trains.log":
      "simulated safe tool replay for mackay-sugar-mill-outage; replaces: grep -nF fallback safety/fallback-trains.log\n",
    "python3 ir_toolkit.py parse-artifact --input comms/grower-advice.txt":
      "simulated safe tool replay for mackay-sugar-mill-outage; replaces: cat comms/grower-advice.txt\n",
    "jq . partners/restore-plan.json":
      "simulated safe tool replay for mackay-sugar-mill-outage; replaces: cat partners/restore-plan.json\n",
    "tshark -r evidence.pcap --follow-log containment/recovery.log":
      "simulated safe tool replay for mackay-sugar-mill-outage; replaces: cat containment/recovery.log\n",
  },
  files: {
    "/home/ops/mackay-sugar-ir/ir_toolkit.py": {
      content: [
        "#!/usr/bin/env python3",
        "\"\"\"Scenario helper for safe incident-response parsing.",
        "",
        "Supported modes in this exhibit:",
        "  parse-artifact --input PATH",
        "  extract-ioc --ioc VALUE --input PATH",
        "",
        "The museum shell intercepts exact commands from scenario.commands.",
        "No code runs and no network is touched.",
        "\"\"\"",
        "raise SystemExit('simulated helper: canned output only')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/ops/mackay-sugar-ir/reports/public-brief.txt": {
      content: [
        "Public incident brief, 10 June 2026",
        "",
        "- Mackay Sugar reported a cyber security incident affecting operations.",
        "- Farleigh and Racecourse mills stopped during the first week of crushing.",
        "- Sugar milling and cane haulage were suspended at the affected sites.",
        "- Growers were told to cease harvesting until Mackay Sugar issued further advice.",
        "- No public source named ransomware, a threat actor, or confirmed data theft.",
      ].join("\n"),
    },
    "/home/ops/mackay-sugar-ir/ops/mill-status.log": {
      content: [
        "2026-06-10T03:05Z site=Farleigh status=stopped reason=cyber-security-incident",
        "2026-06-10T03:08Z site=Racecourse status=stopped reason=cyber-security-incident",
        "2026-06-10T03:15Z site=Marian status=not-yet-started note=scheduled-next-week",
        "2026-06-10T03:22Z priority=staff-safety business-continuity=true",
      ].join("\n"),
    },
    "/home/ops/mackay-sugar-ir/logistics/haulage-status.log": {
      content: [
        "2026-06-10T03:18Z haulage=Farleigh suspended cane-train-queue=controlled",
        "2026-06-10T03:19Z haulage=Racecourse suspended cane-bin-intake=paused",
        "2026-06-10T03:25Z haulage=Marian unaffected status=pre-season",
      ].join("\n"),
    },
    "/home/ops/mackay-sugar-ir/safety/fallback-trains.log": {
      content: [
        "2026-06-10T03:28Z train=F-17 fallback=manual-return destination=Farleigh yard status=safe",
        "2026-06-10T03:31Z train=R-04 fallback=manual-return destination=Racecourse yard status=safe",
        "2026-06-10T03:36Z note=loaded-trains-returned-under-local-procedure",
      ].join("\n"),
    },
    "/home/ops/mackay-sugar-ir/comms/grower-advice.txt": {
      content: [
        "Grower communication excerpt",
        "",
        "Mackay Sugar has asked all harvesting to cease immediately.",
        "Do not resume until further communication comes directly from the company.",
        "Bridge note: preserve exact wording, timestamp receipts, and avoid cause speculation.",
      ].join("\n"),
    },
    "/home/ops/mackay-sugar-ir/partners/restore-plan.json": {
      content: [
        "{",
        '  "incident": "Mackay Sugar operations cyber security incident",',
        '  "public_date": "2026-06-10",',
        '  "external_support": ["cybersecurity specialists", "local authorities"],',
        '  "public_unknowns": ["root cause", "malware family", "data compromise"],',
        '  "recovery_focus": ["staff safety", "business continuity", "safe system restoration"]',
        "}",
      ].join("\n"),
    },
    "/home/ops/mackay-sugar-ir/containment/recovery.log": {
      content: [
        "2026-06-10T03:41Z isolate=affected-operational-systems status=contained scope=under-review",
        "2026-06-10T03:52Z notify=employees,growers,business-partners status=ongoing",
        "2026-06-10T04:05Z engage=cybersecurity-specialists status=active",
        "2026-06-10T04:16Z restart=deferred condition=safe-restoration",
      ].join("\n"),
    },
    "/home/ops/mackay-sugar-ir/public-poc/mackay_incident_timeline_stub.txt": {
      content: [
        "Museum timeline stub, not an exploit.",
        "",
        "03:05Z affected mills stopped",
        "03:18Z haulage paused",
        "03:28Z fallback return procedures tracked",
        "04:05Z specialist recovery bridge active",
        "",
        "Teaching point: in OT and agriculture incidents, truth maintenance matters.",
        "Capture operational facts first; attribution can wait for evidence.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "brief",
      phase: "Recon",
      goal: "Read the public incident brief and separate confirmed facts from unknowns.",
      hint: "`python3 ir_toolkit.py parse-artifact --input reports/public-brief.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input reports/public-brief.txt" },
      ],
      narration:
        "The first responder habit is restraint: preserve what is confirmed and list what remains unknown.",
    },
    {
      id: "mills",
      phase: "Impact",
      goal: "Confirm the affected mill sites and the third mill's status.",
      hint: "`python3 ir_toolkit.py parse-artifact --input ops/mill-status.log`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input ops/mill-status.log" }],
      narration:
        "Farleigh and Racecourse stopped; Marian had not yet entered crushing. Scope beats rumor.",
    },
    {
      id: "haulage",
      phase: "Impact",
      goal: "Review cane haulage suspension across affected sites.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"haulage\"' --follow-log logistics/haulage-status.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "haulage"\' --follow-log logistics/haulage-status.log',
        },
      ],
      narration:
        "The business impact is physical: cane movement pauses when the digital coordination layer is not trusted.",
    },
    {
      id: "fallback",
      phase: "Safety",
      goal: "Verify fallback procedures for loaded cane trains already on the tracks.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc fallback --input safety/fallback-trains.log`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc fallback --input safety/fallback-trains.log",
        },
      ],
      narration:
        "Industrial response prioritizes safe return paths before deep malware questions.",
    },
    {
      id: "growers",
      phase: "Containment",
      goal: "Preserve the cease-harvest instruction sent to growers.",
      hint: "`python3 ir_toolkit.py parse-artifact --input comms/grower-advice.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input comms/grower-advice.txt" },
      ],
      narration:
        "Clear outward instructions prevent a technology incident from becoming a field-safety incident.",
    },
    {
      id: "restore-plan",
      phase: "Containment",
      goal: "Review the recovery plan metadata and unknowns list.",
      hint: "`jq . partners/restore-plan.json`.",
      matches: [{ kind: "exact", command: "jq . partners/restore-plan.json" }],
      narration:
        "The unknowns list is a control: no ransomware label, actor name, or data-loss statement until evidence exists.",
    },
    {
      id: "recovery",
      phase: "Recovery",
      goal: "Check recovery bridge actions before any restart decision.",
      hint: "`tshark -r evidence.pcap --follow-log containment/recovery.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/recovery.log" }],
      narration:
        "Safe restoration is an operational gate, not just an IT green check.",
    },
    {
      id: "lessons",
      phase: "Lessons",
      goal: "Review the museum timeline stub for the incident-response lesson.",
      hint: "`head -n 80 public-poc/mackay_incident_timeline_stub.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/mackay_incident_timeline_stub.txt" }],
      narration:
        "In agriculture and OT incidents, accurate public facts can be as important as packet captures.",
    },
  ],
  debrief: {
    summary:
      "On 10 June 2026, ABC News reported that a cyber security incident halted Mackay Sugar's Farleigh and Racecourse mills, stopping milling and cane haulage and prompting growers to cease harvesting. The Record reported the same day that Mackay Sugar, Australia's second-largest sugar producer, was working with cybersecurity experts and local authorities, had implemented temporary measures, and had not disclosed whether ransomware, data compromise, or another type of malicious activity was involved. Sources: https://www.abc.net.au/news/2026-06-10/cyber-attack-shuts-down-north-queensland-sugar-mills/106780304 and https://therecord.media/cyberattack-shuts-down-major-australian-sugar-producer",
    lesson:
      "Operational cyber incidents need a disciplined facts ledger: affected process, safety fallback, stakeholder instruction, recovery owner, and explicit unknowns. Early precision protects the response from speculation.",
    simulated: [
      "Mill logs, haulage logs, train IDs, timestamps, bridge notes, and recovery actions are synthetic teaching artefacts.",
      "The scenario reflects public reporting on operational disruption only; it does not claim a malware family, exploit path, threat actor, or data theft.",
    ],
  },
};
