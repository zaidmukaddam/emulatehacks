import type { Scenario } from "../types";

/**
 * Singapore Land Authority / IBM-managed cloud environment incident.
 * SLA announced the data security incident on 2026-07-03.
 * Official statement: https://www.sla.gov.sg/news/press-release/security-incident-involving-an-ibm-managed-cloud-environment-/
 */
export const slaIbmTestCloud: Scenario = {
  slug: "sla-ibm-test-cloud",
  exhibit: "EXH-048",
  title: "STARS Test Spill",
  tagline:
    "July 3, 2026. Singapore Land Authority says an IBM-managed development and testing cloud environment was accessed without authorisation, exposing a test dataset that should have been anonymised but contained real personal data.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 9,
  fictional: true,
  cwd: "/home/ir/stars-test",
  user: "responder",
  host: "cloud-ir-04",
  role: "Incident responder validating a vendor-managed cloud exposure against official SLA statements.",
  objective:
    "Confirm the affected environment, prove the dataset contained live personal fields, verify operational STARS and ELS separation, and close the regulatory notification loop.",
  briefing:
    "SLA's July 3 statement says IBM informed it of unauthorised access to an IBM-managed cloud environment used for STARS and ELS development and systems-integration testing. The affected dataset was created for testing in 1998, updated over time, and meant to hold mock anonymised data, but it contained names, NRIC numbers, and past property addresses for about 70,000 people.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/ir/stars-test" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/sla-release.txt": [
      "SLA public statement replay, 2026-07-03:",
      "IBM-managed development and systems-integration testing environment for STARS and ELS.",
      "Preliminary finding: unauthorised access to a vendor development/testing dataset.",
      "Dataset should have been mock and anonymised, but contained names, NRIC numbers, and then property addresses for about 70,000 individuals.",
    ].join("\n"),
    "jq . inventory/stars-els-environments.json": [
      "{",
      '  "vendor_testing_cloud": { "manager": "IBM", "status": "access_revoked", "contains_live_ops": false },',
      '  "stars_production": { "status": "unaffected", "connection_to_test": "none" },',
      '  "els_production": { "status": "unaffected", "connection_to_test": "none" }',
      "}",
    ].join("\n"),
    "tshark -r evidence.pcap -Y 'frame contains \"vendor-test\"' --follow-log cloud/access-review.log":
      [
        "2026-06-12T03:20Z provider=IBM notice=security-incident env=vendor-test-cloud",
        "2026-06-15T09:45Z provider=IBM update=possible-personal-data-access env=vendor-test-cloud",
        "2026-07-03T04:00Z env=vendor-test-cloud public_statement=prepared",
      ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input data/sample-field-audit.txt": [
      "Field audit summary:",
      "expected=mock anonymised property records",
      "observed=real names, NRIC numbers, and past property addresses",
      "estimated_people=70000",
      "live_system_records=not affected",
    ].join("\n"),
    "python3 ir_toolkit.py extract-ioc --ioc NRIC --input data/sample-field-audit.txt": [
      "2: observed_field=NRIC_NUMBER classification=personal_identifier",
      "5: sample redacted as S0000000X, stored only for field mapping in this exhibit",
    ].join("\n"),
    "tshark -r evidence.pcap --follow-log containment/access-revocation.log": [
      "2026-07-03T05:05Z IBM revoke_access env=vendor-test-cloud success",
      "2026-07-03T05:20Z SLA verify stars_production isolated success",
      "2026-07-03T05:23Z SLA verify els_production isolated success",
    ].join("\n"),
    "jq . notifications/regulatory.json": [
      "{",
      '  "police_report": "lodged",',
      '  "pdpc": "notified",',
      '  "partners": ["IBM", "GovTech", "Cyber Security Agency of Singapore"],',
      '  "individual_notifications": "started"',
      "}",
    ].join("\n"),
    "python3 safe_replay.py --scenario sla-ibm-test-cloud --sample resident-notice.md": [
      "Resident notice summary:",
      "What happened: unauthorised access to an IBM-managed test environment.",
      "What data: name, NRIC number, and past property address may have been present.",
      "What was not affected: live STARS, ELS, property ownership, and lodgment operations.",
    ].join("\n"),
  },
  files: {
    "/home/ir/stars-test/intel/sla-release.txt": {
      content: [
        "Singapore Land Authority statement, 3 July 2026",
        "",
        "IBM informed SLA of a data security incident involving unauthorised access to an IBM-managed cloud environment.",
        "The environment supported development and systems-integration testing for STARS and ELS.",
        "The accessed dataset was created in 1998 for vendor development and testing.",
        "It was meant to contain only mock and anonymised records.",
        "SLA found names, NRIC numbers, and then property addresses for an estimated 70,000 individuals.",
        "SLA states live STARS, ELS, and other operational systems were not connected to or compromised by this incident.",
      ].join("\n"),
    },
    "/home/ir/stars-test/inventory/stars-els-environments.json": {
      content: [
        "{",
        '  "vendor_testing_cloud": {',
        '    "manager": "IBM",',
        '    "purpose": "development and systems-integration testing",',
        '    "systems": ["STARS", "ELS"],',
        '    "status": "access_revoked",',
        '    "contains_live_ops": false',
        "  },",
        '  "stars_production": {',
        '    "status": "unaffected",',
        '    "connection_to_test": "none"',
        "  },",
        '  "els_production": {',
        '    "status": "unaffected",',
        '    "connection_to_test": "none"',
        "  }",
        "}",
      ].join("\n"),
    },
    "/home/ir/stars-test/cloud/access-review.log": {
      content: [
        "2026-06-12T03:20Z provider=IBM notice=security-incident env=vendor-test-cloud",
        "2026-06-15T09:45Z provider=IBM update=possible-personal-data-access env=vendor-test-cloud",
        "2026-07-03T04:00Z env=vendor-test-cloud public_statement=prepared",
      ].join("\n"),
    },
    "/home/ir/stars-test/data/sample-field-audit.txt": {
      content: [
        "field_audit=vendor-test-dataset",
        "expected=mock anonymised property records",
        "observed_field=FULL_NAME classification=personal_data",
        "observed_field=NRIC_NUMBER classification=personal_identifier",
        "observed_field=PAST_PROPERTY_ADDRESS classification=address_history",
        "sample_value=REDACTED",
        "estimated_people=70000",
        "live_system_records=not affected",
      ].join("\n"),
    },
    "/home/ir/stars-test/containment/access-revocation.log": {
      content: [
        "2026-07-03T05:05Z IBM revoke_access env=vendor-test-cloud success",
        "2026-07-03T05:20Z SLA verify stars_production isolated success",
        "2026-07-03T05:23Z SLA verify els_production isolated success",
      ].join("\n"),
    },
    "/home/ir/stars-test/notifications/regulatory.json": {
      content: [
        "{",
        '  "police_report": "lodged",',
        '  "pdpc": "notified",',
        '  "partners": ["IBM", "GovTech", "Cyber Security Agency of Singapore"],',
        '  "individual_notifications": "started"',
        "}",
      ].join("\n"),
    },
    "/home/ir/stars-test/resident-notice.md": {
      content: [
        "# Affected individual notice draft",
        "",
        "SLA has identified individuals whose information was present in the affected development and testing dataset.",
        "Potential fields include name, NRIC number, and past property address.",
        "Property ownership and lodgment records in live STARS and ELS remain secure and unaffected.",
        "Residents should be alert for phishing emails, fake websites, text messages, or calls impersonating public agencies.",
      ].join("\n"),
    },
    "/home/ir/stars-test/public-reference/sla_july_3_summary.txt": {
      content: [
        "Public reference summary for exhibit EXH-048",
        "",
        "Official source: Singapore Land Authority, Security Incident Involving an IBM-managed Cloud Environment, 3 July 2026.",
        "Secondary source: CNA, Data of 70,000 people compromised in cybersecurity incident involving SLA's vendor IBM, 3 July 2026.",
        "",
        "This museum exhibit uses synthetic logs and redacted field names only.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "public-statement",
      phase: "Recon",
      goal: "Load the public SLA statement beats for the July 3 IBM-managed cloud incident.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/sla-release.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/sla-release.txt" }],
      narration:
        "Start with what is known publicly: an IBM-managed test cloud, unauthorised access, and a dataset that should not have held live personal fields.",
    },
    {
      id: "environment-map",
      phase: "Scoping",
      goal: "Map the vendor testing environment away from live STARS and ELS systems.",
      hint: "`jq . inventory/stars-els-environments.json`.",
      matches: [{ kind: "exact", command: "jq . inventory/stars-els-environments.json" }],
      narration:
        "Scope matters. The official statement says operational STARS and ELS were distinct and separate from the affected testing environment.",
    },
    {
      id: "provider-timeline",
      phase: "Scoping",
      goal: "Review the synthetic provider notice timeline for the affected test cloud.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"vendor-test\"' --follow-log cloud/access-review.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "vendor-test"\' --follow-log cloud/access-review.log',
        },
      ],
      narration:
        "CNA reported IBM first notified SLA in June; this exhibit uses synthetic rows to show how responders preserve that timeline.",
    },
    {
      id: "field-audit",
      phase: "Impact",
      goal: "Inspect the field audit showing real data in a dataset intended for mock testing.",
      hint: "`python3 ir_toolkit.py parse-artifact --input data/sample-field-audit.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input data/sample-field-audit.txt" }],
      narration:
        "The failure mode is not just access control. Test-data governance failed because the dataset retained real identifiers.",
    },
    {
      id: "identifier-proof",
      phase: "Impact",
      goal: "Confirm the presence of the NRIC personal-identifier field without exposing any real value.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc NRIC --input data/sample-field-audit.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc NRIC --input data/sample-field-audit.txt" },
      ],
      narration:
        "Field names are enough for containment and notification decisions. You do not need to spread sensitive sample values further.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify access revocation and production isolation checks.",
      hint: "`tshark -r evidence.pcap --follow-log containment/access-revocation.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/access-revocation.log" }],
      narration:
        "IBM revoked access associated with the affected environment, while SLA emphasized that live systems were not compromised.",
    },
    {
      id: "notifications",
      phase: "Notification",
      goal: "Check the police report, PDPC notification, partner list, and affected-individual notice status.",
      hint: "`jq . notifications/regulatory.json`.",
      matches: [{ kind: "exact", command: "jq . notifications/regulatory.json" }],
      narration:
        "Regulatory and public communications are part of incident response, especially when real personal data appears in a test set.",
    },
    {
      id: "resident-notice",
      phase: "Lessons",
      goal: "Review the resident-facing summary that avoids overstating live-system compromise.",
      hint: "`python3 safe_replay.py --scenario sla-ibm-test-cloud --sample resident-notice.md`.",
      matches: [
        {
          kind: "exact",
          command: "python3 safe_replay.py --scenario sla-ibm-test-cloud --sample resident-notice.md",
        },
      ],
      narration:
        "Good disclosure is precise: explain affected fields, warn about fraud, and clearly state what was not compromised.",
    },
  ],
  debrief: {
    summary:
      "On 3 July 2026, the Singapore Land Authority announced that IBM had informed it of a data security incident involving unauthorised access to an IBM-managed cloud environment for STARS and ELS development and systems-integration testing. SLA said the accessed dataset was created in 1998 for vendor testing and should have contained only mock anonymised data, but instead included names, NRIC numbers, and then property addresses for about 70,000 individuals. SLA also stated the affected environment was separate from operational STARS and ELS systems, IBM revoked access associated with it, affected individuals were being notified, and SLA lodged a police report plus notified the Personal Data Protection Commission. Sources: https://www.sla.gov.sg/news/press-release/security-incident-involving-an-ibm-managed-cloud-environment-/ and https://www.channelnewsasia.com/singapore/ibm-sla-data-breach-70000-people-cybersecurity-6229876",
    lesson:
      "Development and testing environments need the same data-governance discipline as production when they contain production-derived records. Anonymisation checks, access lifecycle reviews, and clear environment separation can turn a breach into a bounded disclosure instead of an operational crisis.",
    simulated: [
      "All hostnames, timestamps after the public reporting beats, logs, JSON inventories, and notice drafts are synthetic.",
      "No real NRIC numbers, addresses, property records, or vendor credentials are included.",
      "The incident date, involved organisations, affected environment description, approximate affected count, exposed field categories, access revocation, production-system separation, police report, PDPC notification, and partner investigation facts reflect public reporting as of 3 July 2026.",
    ],
  },
};
