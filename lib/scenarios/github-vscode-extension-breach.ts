import type { Scenario } from "../types";

/**
 * May 2026 GitHub internal repository breach, abstracted into a defender-safe tabletop.
 * Public reports cite a poisoned VS Code extension on an employee endpoint, about
 * 3,800 internal repositories exfiltrated, critical secret rotation, and no
 * evidence at publication time of customer data impact outside internal repos.
 */
export const githubVscodeExtensionBreach: Scenario = {
  slug: "github-vscode-extension-breach",
  exhibit: "EXH-048",
  title: "Poisoned Extension Spill",
  tagline:
    "20 May 2026. GitHub confirms an employee device was compromised through a poisoned VS Code extension, with roughly 3,800 internal repositories exfiltrated. You work the endpoint-to-repo audit trail.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/security/extension-ir",
  user: "responder",
  host: "code-ir-01",
  role: "Security engineer validating developer-workstation compromise and repository exposure.",
  objective:
    "Confirm the poisoned extension on the endpoint, scope internal repository exfiltration, compare the threat actor claim, and verify containment through isolation and secret rotation.",
  briefing:
    "Public reporting on 20 May 2026 said GitHub detected and contained an employee-device compromise involving a poisoned VS Code extension. This exhibit turns those facts into a synthetic response console: endpoint inventory, repo audit rows, a forum-claim summary, and rotation receipts. Nothing here contacts GitHub or any real repository.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/security/extension-ir" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/public-report.txt": [
      "[ir_toolkit] artifact: intel/public-report.txt",
      "   1| public reporting window: 2026-05-20",
      "   2| GitHub confirmed compromise of an employee device involving a poisoned VS Code extension.",
      "   3| Current public scope: exfiltration of GitHub-internal repositories only.",
      "   4| Attacker claim of about 3,800 repos was described as directionally consistent.",
      "   5| GitHub said it had no evidence of customer information impact outside internal repositories.",
      "   6| Response included containment of the endpoint and critical secret rotation.",
    ],
    "code --list-extensions --show-versions": [
      "github.codespaces@1.16.22",
      "github.vscode-pull-request-github@0.110.0",
      "theme.retro-terminal@2.1.0",
      "publisher.dev-helper-tools@3.4.7  flagged=poisoned-vscode source=marketplace",
      "",
      "(simulated: extension list from employee endpoint image)",
    ],
    "python3 ir_toolkit.py extract-ioc --ioc poisoned-vscode --input endpoint/extension-inventory.log":
      "4:2026-05-19T22:44Z extension=publisher.dev-helper-tools version=3.4.7 verdict=poisoned-vscode install_source=marketplace user=employee-17\n",
    "tshark -r evidence.pcap -Y 'frame contains \"repo-exfil\"' --follow-log repo-access/audit.log": [
      "2026-05-19T23:02:18Z device=employee-17 action=repo-exfil path=/internal/security/runner-secrets.git bytes=8139932",
      "2026-05-19T23:03:41Z device=employee-17 action=repo-exfil path=/internal/platform/code-search.git bytes=20377421",
      "2026-05-19T23:17:09Z device=employee-17 action=repo-exfil sample_count=3800 scope=internal-only",
    ],
    "python3 ir_toolkit.py parse-artifact --input forum/team-pcp-claim.txt": [
      "[ir_toolkit] artifact: forum/team-pcp-claim.txt",
      "   1| actor_alias=TeamPCP",
      "   2| claim=about 4000 private GitHub internal repos",
      "   3| asking_price_usd=50000 minimum",
      "   4| status=claim compared against internal audit rows",
      "   5| responder_note=do not treat sale post as proof of customer impact",
    ],
    "tshark -r evidence.pcap --follow-log response/device-containment.log": [
      "2026-05-20T04:02Z host=employee-17 action=edr_network_isolate result=success",
      "2026-05-20T04:05Z extension=publisher.dev-helper-tools action=remove_from_host result=success",
      "2026-05-20T04:09Z marketplace_ioc=poisoned-vscode action=blocklist result=success",
    ],
    "tshark -r evidence.pcap --follow-log response/secret-rotation.log": [
      "2026-05-20T04:12Z rotate class=critical-secrets priority=highest-impact status=started",
      "2026-05-20T04:44Z rotate class=github-internal-ci-tokens status=complete",
      "2026-05-20T05:03Z validate logs=repo-access audit=continuing follow_on_activity=monitoring",
    ],
    "python3 ir_toolkit.py parse-artifact --input response/customer-scope.txt": [
      "[ir_toolkit] artifact: response/customer-scope.txt",
      "   1| public_statement=no evidence of customer information impact outside GitHub internal repositories",
      "   2| notification_plan=affected customers via established channels if evidence appears",
      "   3| responder_rule=separate confirmed internal repo theft from unconfirmed downstream impact",
    ],
  },
  files: {
    "/home/security/extension-ir/intel/public-report.txt": {
      content: [
        "public reporting window: 2026-05-20",
        "GitHub confirmed compromise of an employee device involving a poisoned VS Code extension.",
        "Current public scope: exfiltration of GitHub-internal repositories only.",
        "Attacker claim of about 3,800 repos was described as directionally consistent.",
        "GitHub said it had no evidence of customer information impact outside internal repositories.",
        "Response included containment of the endpoint and critical secret rotation.",
        "",
        "Sources used in the museum debrief:",
        "https://www.bleepingcomputer.com/news/security/github-investigates-internal-repositories-breach-claimed-by-teampcp/",
        "https://techcrunch.com/2026/05/20/github-says-hackers-stole-data-from-thousands-of-internal-repositories/",
        "https://www.securityweek.com/github-confirms-hack-impacting-3800-internal-repositories/",
      ].join("\n"),
    },
    "/home/security/extension-ir/endpoint/extension-inventory.log": {
      content: [
        "2026-05-19T21:10Z extension=github.codespaces version=1.16.22 verdict=trusted install_source=marketplace user=employee-17",
        "2026-05-19T21:10Z extension=github.vscode-pull-request-github version=0.110.0 verdict=trusted install_source=marketplace user=employee-17",
        "2026-05-19T21:10Z extension=theme.retro-terminal version=2.1.0 verdict=low-risk install_source=marketplace user=employee-17",
        "2026-05-19T22:44Z extension=publisher.dev-helper-tools version=3.4.7 verdict=poisoned-vscode install_source=marketplace user=employee-17",
      ].join("\n"),
    },
    "/home/security/extension-ir/repo-access/audit.log": {
      content: [
        "2026-05-19T22:58:12Z device=employee-17 action=clone path=/internal/docs/eng-playbooks.git bytes=241993",
        "2026-05-19T23:02:18Z device=employee-17 action=repo-exfil path=/internal/security/runner-secrets.git bytes=8139932",
        "2026-05-19T23:03:41Z device=employee-17 action=repo-exfil path=/internal/platform/code-search.git bytes=20377421",
        "2026-05-19T23:17:09Z device=employee-17 action=repo-exfil sample_count=3800 scope=internal-only",
      ].join("\n"),
    },
    "/home/security/extension-ir/forum/team-pcp-claim.txt": {
      content: [
        "actor_alias=TeamPCP",
        "claim=about 4000 private GitHub internal repos",
        "asking_price_usd=50000 minimum",
        "status=claim compared against internal audit rows",
        "responder_note=do not treat sale post as proof of customer impact",
      ].join("\n"),
    },
    "/home/security/extension-ir/response/device-containment.log": {
      content: [
        "2026-05-20T04:02Z host=employee-17 action=edr_network_isolate result=success",
        "2026-05-20T04:05Z extension=publisher.dev-helper-tools action=remove_from_host result=success",
        "2026-05-20T04:09Z marketplace_ioc=poisoned-vscode action=blocklist result=success",
      ].join("\n"),
    },
    "/home/security/extension-ir/response/secret-rotation.log": {
      content: [
        "2026-05-20T04:12Z rotate class=critical-secrets priority=highest-impact status=started",
        "2026-05-20T04:44Z rotate class=github-internal-ci-tokens status=complete",
        "2026-05-20T05:03Z validate logs=repo-access audit=continuing follow_on_activity=monitoring",
      ].join("\n"),
    },
    "/home/security/extension-ir/response/customer-scope.txt": {
      content: [
        "public_statement=no evidence of customer information impact outside GitHub internal repositories",
        "notification_plan=affected customers via established channels if evidence appears",
        "responder_rule=separate confirmed internal repo theft from unconfirmed downstream impact",
      ].join("\n"),
    },
    "/home/security/extension-ir/public-poc/vscode_extension_review_checklist.txt": {
      content: [
        "# VS Code extension compromise defender checklist",
        "",
        "This museum note is defensive only. It does not include extension payload code.",
        "",
        "1. Inventory extensions by publisher, version, install time, and source.",
        "2. Diff endpoint extension state against allow-listed baselines.",
        "3. Correlate extension install time with repo clone, archive, and token use events.",
        "4. Isolate the developer workstation before broad secret rotation if live access remains.",
        "5. Rotate high-impact credentials first, then validate logs for follow-on activity.",
        "6. Keep public scoping precise: internal repo theft is not automatically customer data theft.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "public-report",
      phase: "Recon",
      goal: "Load the public incident facts that set the investigation boundary.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/public-report.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/public-report.txt" },
      ],
      narration:
        "Start with scope discipline: confirmed employee endpoint compromise, internal repository exfiltration, ongoing monitoring, and no public evidence yet of customer data impact outside internal repos.",
    },
    {
      id: "extension-list",
      phase: "Recon",
      goal: "List installed VS Code extensions from the endpoint image.",
      hint: "`code --list-extensions --show-versions`.",
      matches: [{ kind: "exact", command: "code --list-extensions --show-versions" }],
      narration:
        "Developer tooling is the beachhead. A single suspicious extension entry is enough to pivot from laptop triage into repository audit.",
    },
    {
      id: "extension-ioc",
      phase: "Initial access",
      goal: "Find the poisoned extension verdict in endpoint inventory.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc poisoned-vscode --input endpoint/extension-inventory.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py extract-ioc --ioc poisoned-vscode --input endpoint/extension-inventory.log",
        },
      ],
      narration:
        "The extension install lands before the repo-access spike. Timing alone is not proof, but it is the thread that makes the endpoint and source-control stories line up.",
    },
    {
      id: "repo-exfil",
      phase: "Collection",
      goal: "Read audit rows showing internal repository exfiltration from the device.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"repo-exfil\"' --follow-log repo-access/audit.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "tshark -r evidence.pcap -Y 'frame contains \"repo-exfil\"' --follow-log repo-access/audit.log",
        },
      ],
      narration:
        "Impact is source exposure at scale. The scenario keeps payloads abstract and focuses on what defenders must prove: what repositories moved and under which identity.",
    },
    {
      id: "claim",
      phase: "Threat intel",
      goal: "Compare the forum claim with confirmed audit scope.",
      hint: "`python3 ir_toolkit.py parse-artifact --input forum/team-pcp-claim.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input forum/team-pcp-claim.txt" },
      ],
      narration:
        "A sale post is pressure, not truth. Use it to prioritize validation, then let telemetry decide what is confirmed.",
    },
    {
      id: "contain-device",
      phase: "Containment",
      goal: "Verify endpoint isolation and extension blocklisting.",
      hint: "`tshark -r evidence.pcap --follow-log response/device-containment.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap --follow-log response/device-containment.log",
        },
      ],
      narration:
        "Contain the workstation before debating root cause taxonomy. Live developer endpoints can keep minting access until cut off.",
    },
    {
      id: "rotate",
      phase: "Containment",
      goal: "Verify critical secret rotation and follow-on monitoring.",
      hint: "`tshark -r evidence.pcap --follow-log response/secret-rotation.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap --follow-log response/secret-rotation.log",
        },
      ],
      narration:
        "Rotation order matters: burn highest-impact credentials first, then validate logs so rotation does not become ceremonial.",
    },
    {
      id: "scope",
      phase: "Comms",
      goal: "Read the customer-impact scoping note for careful incident wording.",
      hint: "`python3 ir_toolkit.py parse-artifact --input response/customer-scope.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input response/customer-scope.txt" },
      ],
      narration:
        "Public comms should separate confirmed internal repository theft from hypothetical customer exposure. Precision keeps responders honest and customers better informed.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the defensive VS Code extension compromise checklist.",
      hint: "`head -n 80 public-poc/vscode_extension_review_checklist.txt`.",
      matches: [
        { kind: "exact", command: "head -n 80 public-poc/vscode_extension_review_checklist.txt" },
      ],
      narration:
        "The lesson is not to fear all extensions. It is to govern developer tooling with the same inventory, provenance, and response muscle as production dependencies.",
    },
  ],
  debrief: {
    summary:
      "On 20 May 2026, GitHub confirmed unauthorized access involving a poisoned VS Code extension on an employee device and said current public assessment pointed to exfiltration of about 3,800 GitHub-internal repositories only. BleepingComputer reported the initial TeamPCP claim and GitHub statements at https://www.bleepingcomputer.com/news/security/github-investigates-internal-repositories-breach-claimed-by-teampcp/ TechCrunch reported GitHub's statement that it had detected and contained the poisoned-extension compromise and saw no evidence of customer information impact outside internal repositories at https://techcrunch.com/2026/05/20/github-says-hackers-stole-data-from-thousands-of-internal-repositories/ SecurityWeek reported GitHub's critical secret rotation and ongoing log validation at https://www.securityweek.com/github-confirms-hack-impacting-3800-internal-repositories/.",
    lesson:
      "Developer workstations are supply-chain infrastructure. Extension inventory, publisher trust, endpoint telemetry, repository clone auditing, and fast secret rotation all belong in the same playbook.",
    simulated: [
      "Endpoint names, extension package names, repo paths, byte counts, timestamps, and response logs are synthetic teaching artifacts.",
      "The real public facts abstracted here are the date, poisoned VS Code extension entry point, about 3,800 internal repositories, TeamPCP claim context, critical secret rotation, and GitHub's public customer-impact caveat.",
      "No extension payload, exploit code, real repository names, or real credentials are present.",
    ],
  },
};
