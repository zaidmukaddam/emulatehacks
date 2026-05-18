import type { Scenario } from "../types";

/**
 * May 2026 Grafana Labs GitHub token incident, reconstructed as a safe
 * source-control IR tabletop. All repository names and log records below are
 * synthetic except for the public incident shape.
 */
export const grafanaGithubToken: Scenario = {
  slug: "grafana-github-token",
  exhibit: "EXH-048",
  title: "Grafana GitHub Token",
  tagline:
    "17 May 2026. Grafana says an unauthorized party used a compromised GitHub token to download codebase material, then tried extortion after the company found no customer-system impact.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/secops/grafana-github-ir",
  user: "responder",
  host: "ci-forensics-01",
  role: "Security engineer triaging source-control token exposure after a public disclosure.",
  objective:
    "Trace the token from announcement to audit log, identify repository download scope, separate code exposure from customer impact, and verify containment.",
  briefing:
    "Public reporting on May 17 described a Grafana GitHub environment token compromise that led to codebase download and an extortion attempt. This exhibit keeps the facts high level and turns them into a defender workflow: read the disclosure, inspect synthetic GitHub and CI evidence, assess blast radius, and prove revocation.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/secops/grafana-github-ir",
    INCIDENT_ID: "GL-2026-05-GH",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "hint"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input announcement/grafana-thread.txt":
      "simulated safe tool replay for grafana-github-token; replaces: cat announcement/grafana-thread.txt\n",
    "gh api /orgs/grafana/audit-log --jq '.[] | select(.token_id==\"ghu_build_2049\")'":
      [
        '{"time":"2026-05-16T21:08:11Z","action":"git.clone","repo":"grafana/private-cloud-source","actor":"automation","token_id":"ghu_build_2049","ip":"198.51.100.61"}',
        '{"time":"2026-05-16T21:11:42Z","action":"git.clone","repo":"grafana/enterprise-plugins","actor":"automation","token_id":"ghu_build_2049","ip":"198.51.100.61"}',
        '{"time":"2026-05-16T21:15:03Z","action":"git.clone","repo":"grafana/release-tools","actor":"automation","token_id":"ghu_build_2049","ip":"198.51.100.61"}',
      ].join("\n"),
    "tshark -r evidence.pcap --follow-log ci/workflow-run.log":
      "simulated safe tool replay for grafana-github-token; replaces: cat ci/workflow-run.log\n",
    "jq . repos/repo-downloads.json":
      [
        "{",
        '  "token_id": "ghu_build_2049",',
        '  "downloads": [',
        '    { "repo": "grafana/private-cloud-source", "kind": "private-code", "bytes": 184233941 },',
        '    { "repo": "grafana/enterprise-plugins", "kind": "private-code", "bytes": 66410912 },',
        '    { "repo": "grafana/release-tools", "kind": "build-automation", "bytes": 19221044 }',
        "  ],",
        '  "customer_data_seen": false,',
        '  "production_access_seen": false',
        "}",
      ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input secrets/secret-scan-alert.txt":
      "simulated safe tool replay for grafana-github-token; replaces: cat secrets/secret-scan-alert.txt\n",
    "python3 ir_toolkit.py parse-artifact --input extortion/demand.txt":
      "simulated safe tool replay for grafana-github-token; replaces: cat extortion/demand.txt\n",
    "python3 ir_toolkit.py parse-artifact --input containment/revocation.log":
      "simulated safe tool replay for grafana-github-token; replaces: cat containment/revocation.log\n",
  },
  files: {
    "/home/secops/grafana-github-ir/announcement/grafana-thread.txt": {
      content: [
        "public-disclosure summary",
        "date=2026-05-17",
        "subject=Grafana Labs GitHub token incident",
        "reported_vector=unauthorized party obtained a token with access to GitHub environment",
        "reported_action=downloaded codebase material",
        "reported_customer_data=no evidence of customer data or personal information accessed",
        "reported_operations=no evidence of impact to customer systems or operations",
        "reported_extortion=payment demanded to prevent code release; company refused",
        "next_step=post-incident review after investigation",
      ].join("\n"),
    },
    "/home/secops/grafana-github-ir/github/audit.log": {
      content: [
        "2026-05-16T20:58:40Z action=workflow_run.completed repo=grafana/ci-sandbox actor=external-pr token_id=ghu_build_2049 signal=env-access",
        "2026-05-16T21:08:11Z action=git.clone repo=grafana/private-cloud-source actor=automation token_id=ghu_build_2049 ip=198.51.100.61",
        "2026-05-16T21:11:42Z action=git.clone repo=grafana/enterprise-plugins actor=automation token_id=ghu_build_2049 ip=198.51.100.61",
        "2026-05-16T21:15:03Z action=git.clone repo=grafana/release-tools actor=automation token_id=ghu_build_2049 ip=198.51.100.61",
        "2026-05-16T21:48:09Z action=token.revoked actor=secops token_id=ghu_build_2049 ip=203.0.113.10",
      ].join("\n"),
    },
    "/home/secops/grafana-github-ir/ci/workflow-run.log": {
      content: [
        "run_id=11848290",
        "repo=grafana/ci-sandbox",
        "event=pull_request_target",
        "runner=ubuntu-latest",
        "step=build status=success",
        "step=integration-test status=success",
        "step=collect-debug-artifacts status=warning detail=unexpected env read",
        "artifact=debug-env.txt encrypted=true uploaded_by=external-pr",
        "triage=workflow had trusted-token context while processing untrusted branch input",
      ].join("\n"),
    },
    "/home/secops/grafana-github-ir/repos/repo-downloads.json": {
      content: [
        "{",
        '  "token_id": "ghu_build_2049",',
        '  "downloads": [',
        '    { "repo": "grafana/private-cloud-source", "kind": "private-code", "bytes": 184233941 },',
        '    { "repo": "grafana/enterprise-plugins", "kind": "private-code", "bytes": 66410912 },',
        '    { "repo": "grafana/release-tools", "kind": "build-automation", "bytes": 19221044 }',
        "  ],",
        '  "customer_data_seen": false,',
        '  "production_access_seen": false',
        "}",
      ].join("\n"),
    },
    "/home/secops/grafana-github-ir/secrets/secret-scan-alert.txt": {
      content: [
        "2026-05-16T21:02:22Z detector=secret-scan severity=high",
        "subject=GitHub automation token observed outside expected runner boundary",
        "token_id=ghu_build_2049",
        "source=ci-sandbox pull_request_target workflow",
        "scope=repo:read on selected private repositories",
        "revocation_required=true",
      ].join("\n"),
    },
    "/home/secops/grafana-github-ir/extortion/demand.txt": {
      content: [
        "sender=unknown-extortion-actor",
        "received=2026-05-17T02:40Z",
        "claim=downloaded source material from private GitHub repositories",
        "demand=payment to prevent publication",
        "response=do not pay; preserve evidence; coordinate legal and law-enforcement notification",
        "note=payload details and actor contact handles intentionally omitted",
      ].join("\n"),
    },
    "/home/secops/grafana-github-ir/containment/revocation.log": {
      content: [
        "2026-05-16T21:48Z revoke token_id=ghu_build_2049 success",
        "2026-05-16T21:51Z disable workflow repo=grafana/ci-sandbox file=.github/workflows/pr-target.yml success",
        "2026-05-16T22:10Z rotate repository secrets in affected org vault success",
        "2026-05-16T23:05Z audit production access logs result=no evidence of access",
        "2026-05-17T00:30Z add required short-lived OIDC tokens for trusted release jobs success",
      ].join("\n"),
    },
    "/home/secops/grafana-github-ir/public-poc/pwn-request-safe-shape.yml": {
      content: [
        "# Safe shape only: do not process untrusted pull request code in a trusted token context.",
        "name: unsafe-pr-target-shape",
        "on: pull_request_target",
        "jobs:",
        "  build:",
        "    permissions:",
        "      contents: read",
        "    steps:",
        "      - name: trusted checkout placeholder",
        "        run: echo 'Check out trusted base, never attacker branch, before privileged steps.'",
        "      - name: suspicious pattern",
        "        run: echo 'Any debug env dump here would expose tokens to attacker-controlled artifacts.'",
        "",
        "# Defensive checklist:",
        "# - Use pull_request for untrusted code.",
        "# - Keep pull_request_target jobs metadata-only unless reviewed.",
        "# - Prefer short-lived OIDC credentials over long-lived repository tokens.",
        "# - Scan workflows with static analysis before enabling privileged contexts.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "announcement",
      phase: "Recon",
      goal: "Read the public-disclosure summary and name the incident shape.",
      hint: "`python3 ir_toolkit.py parse-artifact --input announcement/grafana-thread.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input announcement/grafana-thread.txt",
        },
      ],
      narration:
        "The public signal is code exposure through a GitHub token, not a customer database breach. That distinction drives the rest of the triage.",
    },
    {
      id: "audit-token",
      phase: "Initial access",
      goal: "Query synthetic GitHub audit logs for the suspect token.",
      hint: "`gh api /orgs/grafana/audit-log --jq '.[] | select(.token_id==\"ghu_build_2049\")'`.",
      matches: [
        {
          kind: "exact",
          command:
            "gh api /orgs/grafana/audit-log --jq '.[] | select(.token_id==\"ghu_build_2049\")'",
        },
      ],
      narration:
        "One token clones three private repositories from the same unfamiliar source. The account name says automation, but the network and timing say incident.",
    },
    {
      id: "workflow",
      phase: "Initial access",
      goal: "Inspect the CI run that exposed the trusted token context.",
      hint: "`tshark -r evidence.pcap --follow-log ci/workflow-run.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap --follow-log ci/workflow-run.log",
        },
      ],
      narration:
        "The workflow pattern is the lesson: untrusted pull request input met a trusted token context and produced an artifact boundary the attacker could abuse.",
    },
    {
      id: "downloads",
      phase: "Collection",
      goal: "Summarize which repositories were downloaded and what was not seen.",
      hint: "`jq . repos/repo-downloads.json`.",
      matches: [{ kind: "exact", command: "jq . repos/repo-downloads.json" }],
      narration:
        "The blast radius is private code and release automation material. Customer data and production access stay out of scope in the available evidence.",
    },
    {
      id: "secret-alert",
      phase: "Detection",
      goal: "Open the token alert that linked the CI run to the repository clones.",
      hint: "`python3 ir_toolkit.py parse-artifact --input secrets/secret-scan-alert.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input secrets/secret-scan-alert.txt",
        },
      ],
      narration:
        "Good secret detection turns code exposure into a bounded incident. Without the token ID, the repository clones look like ordinary automation.",
    },
    {
      id: "extortion",
      phase: "Impact",
      goal: "Read the sanitized extortion note and classify business impact.",
      hint: "`python3 ir_toolkit.py parse-artifact --input extortion/demand.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input extortion/demand.txt",
        },
      ],
      narration:
        "The pressure point is disclosure of proprietary source, not encryption. Response shifts to evidence preservation, legal coordination, and source-risk review.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify revocation, workflow shutdown, rotation, and OIDC hardening.",
      hint: "`python3 ir_toolkit.py parse-artifact --input containment/revocation.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input containment/revocation.log",
        },
      ],
      narration:
        "Containment is not just revoking the stolen token. The durable fix is shrinking token lifetime and removing privileged workflow paths.",
    },
    {
      id: "safe-shape",
      phase: "Lessons",
      goal: "Review the safe workflow-shape note for the recurring CI/CD failure mode.",
      hint: "`head -n 80 public-poc/pwn-request-safe-shape.yml`.",
      matches: [
        {
          kind: "exact",
          command: "head -n 80 public-poc/pwn-request-safe-shape.yml",
        },
      ],
      narration:
        "The safe takeaway is simple: untrusted code should not run where trusted tokens live. Split those trust zones before attackers do it for you.",
    },
  ],
  debrief: {
    summary:
      "On May 17, 2026, public reporting said Grafana Labs disclosed that an unauthorized party obtained a GitHub token, used it to access the company's GitHub environment, and downloaded codebase material. Grafana reportedly said it found no evidence of customer data, personal information, customer-system impact, or operational impact, and that it refused an extortion demand tied to possible code release. This exhibit reconstructs the defender workflow with synthetic logs.",
    lesson:
      "CI/CD tokens are production-adjacent secrets. Scope them narrowly, make them short-lived, avoid privileged workflows for untrusted pull request input, and keep enough audit telemetry to distinguish source-code exposure from customer-data impact.",
    simulated: [
      "Repository names, token IDs, IP addresses, CI logs, and extortion text are invented.",
      "The scenario does not contain an exploit payload, live token, or real Grafana private repository detail.",
      "The public incident shape, publication date, no-customer-data framing, and refusal-to-pay framing are based on May 17, 2026 reporting.",
    ],
  },
};
