import type { Scenario } from "../types";

/**
 * Defensive reconstruction of the Fairlife ransomware disclosure filed by
 * The Coca-Cola Company on July 16, 2026. The public record confirms impact
 * and response posture, but does not identify an intrusion path or threat actor.
 * All terminal evidence is synthetic and avoids inventing those unknowns.
 */
export const fairlifeRansomwareProductionHalt: Scenario = {
  slug: "fairlife-ransomware-production-halt",
  exhibit: "EXH-048",
  title: "Fairlife Production Halt",
  tagline:
    "July 16, 2026. Fairlife detects ransomware-related unauthorized access in production systems. U.S. production stops while responders preserve evidence, confirm safety boundaries, and plan a gated restoration.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/responder/fairlife-incident",
  user: "responder",
  host: "ir-coordination-01",
  role: "Incident responder coordinating evidence, business continuity, and safe restoration.",
  objective:
    "Separate confirmed disclosure facts from unknowns, scope the affected business boundary, and build a defensible restoration gate without inventing an attack path.",
  briefing:
    "Coca-Cola disclosed that Fairlife identified unauthorized third-party access to some systems, including production-related systems, in connection with ransomware. U.S. production was suspended, Canadian production was not impacted, and product quality and safety were not impacted. The actor, entry path, data-theft status, and full scope were not public. Treat every timestamp and host below as a synthetic tabletop artifact.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/responder/fairlife-incident",
    CASE_ID: "TRAINING-FAIRLIFE-2026-07",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input disclosure-facts.txt": [
      "[ir_toolkit] disclosure facts",
      "confirmed: unauthorized third-party access affected a portion of Fairlife systems",
      "confirmed: production-related systems were included",
      "confirmed: the event involved ransomware",
      "confirmed: U.S. production was temporarily suspended",
      "confirmed: Canadian production and product quality and safety were not impacted",
      "confirmed: incident response, business continuity, outside experts, and law enforcement were engaged",
      "unknown: entry path, actor, data theft, extortion details, full scope, and materiality",
    ].join("\n"),
    "tshark -r evidence.pcap --follow-log training-alerts.log": [
      "T+00  SYNTHETIC  production-related endpoint raises ransomware behavior alert",
      "T+04  SYNTHETIC  response lead opens evidence-preservation track",
      "T+08  SYNTHETIC  U.S. production boundary moves to containment hold",
      "T+14  SYNTHETIC  Canada boundary remains monitor-only",
      "No line above is a disclosed Fairlife timestamp or indicator.",
    ].join("\n"),
    "python3 ir_toolkit.py table-summary --input system-scope.csv": [
      "[ir_toolkit] columns: boundary, public_status, response_track",
      "us-production-related | impacted | isolate_and_preserve",
      "canada-production | not_impacted | monitor_and_validate",
      "product-quality-safety | not_impacted | independent_owner_validation",
      "other-systems | scope_unknown | investigate",
    ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input continuity-status.txt": [
      "[ir_toolkit] continuity status",
      "U.S. production: temporarily suspended",
      "Canada production: not impacted",
      "Incident response and business continuity protocols: active",
      "Outside cybersecurity experts: engaged",
      "Law enforcement: notified",
    ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input restoration-gates.txt": [
      "[ir_toolkit] proposed restoration gates",
      "[ ] preserve evidence before rebuild",
      "[ ] close observed unauthorized access and rotate exposed trust material",
      "[ ] recover production-related systems from trusted sources",
      "[ ] validate segmentation and monitoring",
      "[ ] obtain operations and quality-owner approval",
      "[ ] restart in stages with rollback criteria",
      "These are training recommendations, not claimed Fairlife actions.",
    ].join("\n"),
  },
  files: {
    "/home/responder/fairlife-incident/disclosure-facts.txt": {
      content: [
        "FAIRLIFE RANSOMWARE DISCLOSURE, JULY 16, 2026",
        "",
        "CONFIRMED",
        "- A third party gained unauthorized access to a portion of Fairlife systems.",
        "- Production-related systems were included.",
        "- The access was connected to a ransomware event.",
        "- U.S. production operations were temporarily suspended.",
        "- Canadian production operations were not impacted.",
        "- Product quality and safety were not impacted.",
        "- Incident response and business continuity protocols were activated.",
        "- Outside advisors and cybersecurity experts were assisting.",
        "- Law enforcement was notified.",
        "",
        "NOT PUBLICLY ESTABLISHED",
        "- Initial access method",
        "- Threat actor or ransomware group",
        "- Data theft or extortion demand",
        "- Full scope, nature, impact, or materiality",
        "",
        "Primary source:",
        "https://investors.coca-colacompany.com/filings-reports/all-sec-filings/content/0001628280-26-048466/ko-20260716.htm",
      ].join("\n"),
    },
    "/home/responder/fairlife-incident/training-alerts.log": {
      content: [
        "SYNTHETIC TABLETOP TELEMETRY, NOT FAIRLIFE EVIDENCE",
        "T+00 production-related endpoint raises ransomware behavior alert",
        "T+04 response lead opens evidence-preservation track",
        "T+08 U.S. production boundary moves to containment hold",
        "T+14 Canada boundary remains monitor-only",
      ].join("\n"),
    },
    "/home/responder/fairlife-incident/system-scope.csv": {
      content: [
        "boundary,public_status,response_track",
        "us-production-related,impacted,isolate_and_preserve",
        "canada-production,not_impacted,monitor_and_validate",
        "product-quality-safety,not_impacted,independent_owner_validation",
        "other-systems,scope_unknown,investigate",
      ].join("\n"),
    },
    "/home/responder/fairlife-incident/safety-boundary.txt": {
      content: [
        "PUBLIC_FACT quality_and_safety=not_impacted",
        "PUBLIC_FACT us_production=temporarily_suspended",
        "PUBLIC_FACT canada_production=not_impacted",
        "RESPONSE_RULE keep cyber containment and product-safety validation as separate approval tracks",
        "RESPONSE_RULE do not turn an unaffected statement into proof that every system is clean",
      ].join("\n"),
    },
    "/home/responder/fairlife-incident/continuity-status.txt": {
      content: [
        "U.S. production: temporarily suspended",
        "Canada production: not impacted",
        "Incident response and business continuity protocols: active",
        "Outside cybersecurity experts: engaged",
        "Law enforcement: notified",
      ].join("\n"),
    },
    "/home/responder/fairlife-incident/restoration-gates.txt": {
      content: [
        "PROPOSED TRAINING CHECKLIST, NOT DISCLOSED FAIRLIFE ACTIONS",
        "[ ] preserve evidence before rebuild",
        "[ ] close observed unauthorized access and rotate exposed trust material",
        "[ ] recover production-related systems from trusted sources",
        "[ ] validate segmentation and monitoring",
        "[ ] obtain operations and quality-owner approval",
        "[ ] restart in stages with rollback criteria",
      ].join("\n"),
    },
    "/home/responder/fairlife-incident/investigation-state.txt": {
      content: [
        "status=known incident_type=ransomware",
        "status=known affected_boundary=portion_of_systems_including_production_related",
        "status=known business_impact=us_production_temporarily_suspended",
        "status=unknown initial_access_method",
        "status=unknown threat_actor",
        "status=unknown data_theft",
        "status=unknown extortion_demand",
        "status=unknown full_scope_nature_impacts",
        "status=unknown material_effect",
      ].join("\n"),
    },
    "/home/responder/fairlife-incident/public-poc/fairlife_disclosure_excerpt.txt": {
      content: [
        "FAIRLIFE INCIDENT, PUBLIC RECORD EXCERPT",
        "",
        "On July 16, 2026, The Coca-Cola Company reported that Fairlife had",
        "identified unauthorized third-party access to a portion of its systems,",
        "including production-related systems, in connection with ransomware.",
        "",
        "The company activated incident response and business continuity protocols,",
        "engaged outside advisors and cybersecurity experts, and notified law enforcement.",
        "U.S. production was temporarily suspended. Canadian production and product",
        "quality and safety were reported as not impacted.",
        "",
        "The full scope, nature, impacts, and potential material effect remained unknown.",
        "",
        "Sources:",
        "Coca-Cola Form 8-K, filed July 16, 2026:",
        "https://investors.coca-colacompany.com/filings-reports/all-sec-filings/content/0001628280-26-048466/ko-20260716.htm",
        "Coca-Cola media statement, July 16, 2026:",
        "https://www.coca-colacompany.com/media-center/the-coca-cola-company-announces-technology-disruption-Involving-fairlife-operations.html",
        "BleepingComputer coverage, July 16, 2026:",
        "https://www.bleepingcomputer.com/news/security/coca-cola-says-fairlife-ransomware-attack-halts-us-dairy-production/",
        "",
        "No exploit path, malware sample, credentials, or live target is included.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "facts-first",
      phase: "Triage",
      goal: "Load the public facts and keep unresolved questions visibly separate.",
      hint: "`python3 ir_toolkit.py parse-artifact --input disclosure-facts.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input disclosure-facts.txt",
        },
      ],
      narration:
        "The disclosure supports impact and response claims, but it does not support an invented actor or entry path.",
    },
    {
      id: "alert-window",
      phase: "Detection",
      goal: "Review the synthetic alert sequence used for this tabletop.",
      hint: "`tshark -r evidence.pcap --follow-log training-alerts.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap --follow-log training-alerts.log",
        },
      ],
      narration:
        "The exhibit marks synthetic telemetry at every line so learners do not mistake reconstruction for reporting.",
    },
    {
      id: "scope-boundaries",
      phase: "Scoping",
      goal: "Compare impacted, unaffected, and still-unknown business boundaries.",
      hint: "`python3 ir_toolkit.py table-summary --input system-scope.csv`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py table-summary --input system-scope.csv",
        },
      ],
      narration:
        "Contain the known U.S. boundary while validating Canada and investigating everything the filing leaves unresolved.",
    },
    {
      id: "safety-separation",
      phase: "Impact",
      goal: "Confirm the public product-safety statement without overextending it.",
      hint: "`grep -nF 'quality_and_safety=not_impacted' safety-boundary.txt`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF 'quality_and_safety=not_impacted' safety-boundary.txt",
        },
      ],
      narration:
        "Product safety was not impacted, but that statement is not a substitute for proving every affected system clean.",
    },
    {
      id: "continuity",
      phase: "Containment",
      goal: "Verify which continuity and response actions are confirmed.",
      hint: "`python3 ir_toolkit.py parse-artifact --input continuity-status.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input continuity-status.txt",
        },
      ],
      narration:
        "Stopping production can be the correct containment decision when trusted operation cannot yet be demonstrated.",
    },
    {
      id: "restore-gates",
      phase: "Recovery",
      goal: "Review a proposed evidence-to-restart checklist for production-related systems.",
      hint: "`python3 ir_toolkit.py parse-artifact --input restoration-gates.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input restoration-gates.txt",
        },
      ],
      narration:
        "Recovery is a gated business decision: preserve, eradicate, rebuild, validate, approve, then restart gradually.",
    },
    {
      id: "unknowns",
      phase: "Reporting",
      goal: "List every material investigation question that remains publicly unresolved.",
      hint: "`grep -nF 'status=unknown' investigation-state.txt`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF 'status=unknown' investigation-state.txt",
        },
      ],
      narration:
        "Unknown is a valid incident status. Record it, assign it, and resist turning absence of evidence into certainty.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the sourced public-record excerpt and its explicit limits.",
      hint: "`head -n 80 public-poc/fairlife_disclosure_excerpt.txt`.",
      matches: [
        {
          kind: "exact",
          command: "head -n 80 public-poc/fairlife_disclosure_excerpt.txt",
        },
      ],
      narration:
        "The exhibit ends where the public record ends: confirmed disruption and response, with attribution and mechanism still open.",
    },
  ],
  debrief: {
    summary:
      "On July 16, 2026, Coca-Cola disclosed ransomware-related unauthorized access to a portion of Fairlife systems, including production-related systems. Fairlife temporarily suspended U.S. production while Canadian production and product quality and safety remained unaffected. Incident response and business continuity protocols were active, outside experts were assisting, and law enforcement had been notified. The official filing is https://investors.coca-colacompany.com/filings-reports/all-sec-filings/content/0001628280-26-048466/ko-20260716.htm and contemporary reporting is https://www.bleepingcomputer.com/news/security/coca-cola-says-fairlife-ransomware-attack-halts-us-dairy-production/",
    lesson:
      "During operational ransomware response, distinguish confirmed impact from unresolved mechanism. Preserve evidence, isolate the affected boundary, maintain independent safety validation, and require explicit recovery gates before restarting production.",
    simulated: [
      "All hostnames, environment values, alerts, timestamps, scope rows, and restoration gates are synthetic teaching material.",
      "The scenario does not claim an initial-access method, threat actor, data theft, extortion demand, or ransomware family.",
      "No malware, exploit instructions, live credentials, or real infrastructure are present.",
    ],
  },
};
