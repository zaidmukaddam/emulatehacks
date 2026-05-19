import type { Scenario } from "../types";

/**
 * Defensive reconstruction based on public May 18, 2026 reporting that Grafana
 * disclosed a GitHub token compromise, codebase download, and extortion attempt.
 */
export const grafanaGithubToken: Scenario = {
  slug: "grafana-github-token",
  exhibit: "EXH-048",
  title: "The Token That Cloned",
  tagline:
    "May 18, 2026. Grafana says a compromised GitHub token let an unauthorized party download code. You trace the audit log, scope the blast radius, and verify containment.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/srv/devsec/grafana-response",
  user: "responder",
  host: "repo-audit-02",
  role: "Repository security engineer validating a developer-platform incident after public reporting.",
  objective:
    "Correlate the public report to synthetic GitHub audit evidence, identify the token-scoped repository access, prove customer systems were out of scope, and verify credential revocation.",
  briefing:
    "Public reporting says an unauthorized party obtained a token for Grafana Labs' GitHub environment, downloaded parts of the codebase, attempted extortion, and that Grafana found no customer data or operational impact. This exhibit keeps that story defensive: audit logs, repo egress, scope review, ransom handling, and containment receipts only.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/srv/devsec/grafana-response",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "goal"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/public-report.txt":
      "simulated safe tool replay for grafana-github-token; replaces: cat intel/public-report.txt\n",
    "gh api /orgs/grafana-lab-museum/audit-log?phrase=token_id:TKN_ghu_2026_05":
      [
        "[",
        '  {"created_at":"2026-05-17T21:10:44Z","action":"oauth_authorization.update","actor":"dev-platform-bot","token_id":"TKN_ghu_2026_05","scope":"repo,read:org"},',
        '  {"created_at":"2026-05-17T21:22:18Z","action":"repo.download_archive","repo":"grafana-private/render-service","token_id":"TKN_ghu_2026_05"},',
        '  {"created_at":"2026-05-17T21:24:02Z","action":"repo.git_clone","repo":"grafana-private/cloud-plugins","token_id":"TKN_ghu_2026_05"},',
        '  {"created_at":"2026-05-17T22:03:49Z","action":"oauth_authorization.destroy","actor":"security-admin","token_id":"TKN_ghu_2026_05"}',
        "]",
      ].join("\n"),
    "python3 ir_toolkit.py extract-ioc --ioc repo.download_archive --input github/audit.log":
      "simulated safe tool replay for grafana-github-token; replaces: grep -nF repo.download_archive github/audit.log\n",
    "python3 ir_toolkit.py extract-ioc --ioc grafana-private --input github/audit.log":
      "simulated safe tool replay for grafana-github-token; replaces: grep -nF grafana-private github/audit.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"repo-egress\"' --follow-log egress/repo-transfer.log":
      "simulated safe tool replay for grafana-github-token; replaces: grep -nF repo-egress egress/repo-transfer.log\n",
    "jq . github/token.json":
      "simulated safe tool replay for grafana-github-token; replaces: cat github/token.json\n",
    "python3 ir_toolkit.py parse-artifact --input scope/customer-data-review.txt":
      "simulated safe tool replay for grafana-github-token; replaces: cat scope/customer-data-review.txt\n",
    "python3 ir_toolkit.py parse-artifact --input extortion/ransom-note.txt":
      "simulated safe tool replay for grafana-github-token; replaces: cat extortion/ransom-note.txt\n",
    "tshark -r evidence.pcap --follow-log containment/actions.log":
      "simulated safe tool replay for grafana-github-token; replaces: cat containment/actions.log\n",
  },
  files: {
    "/srv/devsec/grafana-response/intel/public-report.txt": {
      content: [
        "Grafana GitHub token incident, public reporting digest",
        "",
        "Date reported: 2026-05-18 UTC",
        "Core claim: an unauthorized party obtained a token that granted access to Grafana Labs' GitHub environment.",
        "Observed effect: attacker downloaded parts of the codebase and attempted extortion to prevent release.",
        "Company posture reported: no customer data or personal information accessed, no customer-system or operations impact found.",
        "Containment reported: compromised credentials invalidated, additional security measures implemented, forensic review ongoing.",
        "",
        "Primary open sources used for this exhibit:",
        "- SecurityWeek: https://www.securityweek.com/grafana-confirms-breach-after-hackers-claim-they-stole-data/",
        "- TechRepublic: https://www.techrepublic.com/article/news-grafana-github-token-codebase-breach/",
        "- The Register: https://www.theregister.com/cyber-crime/2026/05/18/grafana-labs-admits-attackers-downloaded-its-codebase-from-github/5241686",
      ].join("\n"),
    },
    "/srv/devsec/grafana-response/github/audit.log": {
      content: [
        "2026-05-17T20:48:12Z action=oauth_authorization.create actor=dev-platform-bot token_id=TKN_ghu_2026_05 scopes=repo,read:org ip=198.51.100.73 user_agent=git/2.44.0",
        "2026-05-17T21:10:44Z action=oauth_authorization.update actor=dev-platform-bot token_id=TKN_ghu_2026_05 scopes=repo,read:org ip=203.0.113.31 user_agent=git/2.44.0",
        "2026-05-17T21:22:18Z action=repo.download_archive repo=grafana-private/render-service token_id=TKN_ghu_2026_05 bytes=18423318 ip=203.0.113.31",
        "2026-05-17T21:24:02Z action=repo.git_clone repo=grafana-private/cloud-plugins token_id=TKN_ghu_2026_05 bytes=27133164 ip=203.0.113.31",
        "2026-05-17T21:28:55Z action=repo.download_archive repo=grafana-private/provisioning-labs token_id=TKN_ghu_2026_05 bytes=15322901 ip=203.0.113.31",
        "2026-05-17T21:42:09Z action=org.audit_log_export actor=security-admin reason=unusual_repo_downloads case=GFN-IR-2026-0518",
        "2026-05-17T22:03:49Z action=oauth_authorization.destroy actor=security-admin token_id=TKN_ghu_2026_05 reason=credential_leak_confirmed",
      ].join("\n"),
    },
    "/srv/devsec/grafana-response/github/token.json": {
      content: [
        "{",
        '  "token_id": "TKN_ghu_2026_05",',
        '  "owner": "dev-platform-bot",',
        '  "type": "classic_oauth_token",',
        '  "scopes": ["repo", "read:org"],',
        '  "created_at": "2026-05-17T20:48:12Z",',
        '  "last_used_at": "2026-05-17T21:28:55Z",',
        '  "revoked_at": "2026-05-17T22:03:49Z",',
        '  "customer_data_scope": false,',
        '  "remediation": "replaced with short-lived GitHub App installation token plus IP allowlist"',
        "}",
      ].join("\n"),
    },
    "/srv/devsec/grafana-response/egress/repo-transfer.log": {
      content: [
        "2026-05-17T21:22:18Z marker=repo-egress src=github.com dst=203.0.113.31 method=archive repo=grafana-private/render-service bytes=18423318",
        "2026-05-17T21:24:02Z marker=repo-egress src=github.com dst=203.0.113.31 method=git_clone repo=grafana-private/cloud-plugins bytes=27133164",
        "2026-05-17T21:28:55Z marker=repo-egress src=github.com dst=203.0.113.31 method=archive repo=grafana-private/provisioning-labs bytes=15322901",
        "2026-05-17T21:43:12Z marker=repo-egress-baseline src=github.com dst=192.0.2.50 method=git_fetch repo=grafana-public/grafana bytes=88412",
      ].join("\n"),
    },
    "/srv/devsec/grafana-response/scope/customer-data-review.txt": {
      content: [
        "Customer impact scope review, synthetic control record",
        "",
        "Question: did the token touch customer records, billing stores, support cases, or production telemetry?",
        "",
        "Evidence reviewed:",
        "- GitHub audit events for token_id TKN_ghu_2026_05",
        "- SSO and cloud control-plane logs for the same source IP",
        "- Support, billing, and production Grafana Cloud access logs",
        "",
        "Findings:",
        "- customer_data_access: none observed",
        "- production_system_access: none observed",
        "- repo_access: three private code repositories downloaded",
        "- residual risk: source exposure can still reveal design details, build paths, or secrets accidentally committed to code",
      ].join("\n"),
    },
    "/srv/devsec/grafana-response/extortion/ransom-note.txt": {
      content: [
        "Extortion handling excerpt, synthetic",
        "",
        "Threat: publish downloaded codebase unless payment is made.",
        "Decision record: do not pay.",
        "Reasoning: public FBI guidance says ransom payment does not guarantee data return or deletion and may encourage additional criminal activity.",
        "Comms: preserve evidence, notify counsel and incident commander, prepare customer-safe statement focused on scope and containment.",
      ].join("\n"),
    },
    "/srv/devsec/grafana-response/containment/actions.log": {
      content: [
        "2026-05-17T22:03:49Z revoke_token token_id=TKN_ghu_2026_05 status=success",
        "2026-05-17T22:08:12Z rotate_bot_credentials account=dev-platform-bot status=success",
        "2026-05-17T22:14:27Z enable_github_app_short_lived_tokens org=grafana-lab-museum status=success ttl_minutes=60",
        "2026-05-17T22:18:03Z apply_ip_allowlist org=grafana-lab-museum status=success",
        "2026-05-17T22:26:44Z secret_scan_repos scope=downloaded status=complete findings=0",
        "2026-05-17T22:32:05Z legal_preserve evidence_bucket=GFN-IR-2026-0518 status=success",
      ].join("\n"),
    },
    "/srv/devsec/grafana-response/public-poc/github_token_scope_checklist.md": {
      content: [
        "# GitHub token incident checklist",
        "",
        "Defensive checklist only. No exploit payloads.",
        "",
        "1. Export audit events for the token id and source IP.",
        "2. Enumerate `repo.download_archive`, `repo.git_clone`, and `git.fetch` events.",
        "3. Check whether the token can reach customer data, production systems, or only code.",
        "4. Revoke the credential and rotate any bot or owner credentials attached to it.",
        "5. Prefer GitHub App installation tokens with short TTL, least privilege, and IP allowlists.",
        "6. Secret-scan every downloaded repository because source exposure can become credential exposure.",
        "7. Preserve extortion evidence and coordinate legal, comms, and law-enforcement paths.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "public-report",
      phase: "Recon",
      goal: "Read the public reporting digest that anchors this exhibit.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/public-report.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/public-report.txt" },
      ],
      narration:
        "Keep the claims bounded: GitHub token, codebase download, extortion attempt, no customer data or operations impact reported.",
    },
    {
      id: "audit-api",
      phase: "Recon",
      goal: "Query the token-specific audit trail from the simulated GitHub API.",
      hint: "`gh api /orgs/grafana-lab-museum/audit-log?phrase=token_id:TKN_ghu_2026_05`.",
      matches: [
        {
          kind: "exact",
          command: "gh api /orgs/grafana-lab-museum/audit-log?phrase=token_id:TKN_ghu_2026_05",
        },
      ],
      narration:
        "The timeline starts with token scope changes and ends with revocation. In between, repository download events define the blast radius.",
    },
    {
      id: "archive-downloads",
      phase: "Initial access",
      goal: "Find archive downloads tied to the compromised token.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc repo.download_archive --input github/audit.log`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc repo.download_archive --input github/audit.log",
        },
      ],
      narration:
        "Archive downloads are high-signal for code theft because they bypass normal developer clone patterns.",
    },
    {
      id: "repo-scope",
      phase: "Discovery",
      goal: "List the private repositories reached by the token.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc grafana-private --input github/audit.log`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc grafana-private --input github/audit.log",
        },
      ],
      narration:
        "Three private code repositories show up. The case is source exposure, not proof of production access.",
    },
    {
      id: "egress",
      phase: "Collection",
      goal: "Correlate GitHub audit events with repository-transfer egress.",
      hint:
        "`tshark -r evidence.pcap -Y 'frame contains \"repo-egress\"' --follow-log egress/repo-transfer.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "tshark -r evidence.pcap -Y 'frame contains \"repo-egress\"' --follow-log egress/repo-transfer.log",
        },
      ],
      narration:
        "Network metadata mirrors the audit log. You now have enough to bound which repos left the environment.",
    },
    {
      id: "token-record",
      phase: "Privilege",
      goal: "Inspect the token record to understand scope, revocation, and the planned replacement.",
      hint: "`jq . github/token.json`.",
      matches: [{ kind: "exact", command: "jq . github/token.json" }],
      narration:
        "A broad classic token is replaced with a short-lived GitHub App token. That changes future compromise math.",
    },
    {
      id: "customer-scope",
      phase: "Impact",
      goal: "Review the customer-data and production-system impact note.",
      hint: "`python3 ir_toolkit.py parse-artifact --input scope/customer-data-review.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input scope/customer-data-review.txt",
        },
      ],
      narration:
        "No customer data or production access observed. Source exposure still matters, but it is a different response lane.",
    },
    {
      id: "extortion",
      phase: "Impact",
      goal: "Read the extortion decision note and FBI-guidance rationale.",
      hint: "`python3 ir_toolkit.py parse-artifact --input extortion/ransom-note.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input extortion/ransom-note.txt",
        },
      ],
      narration:
        "The attacker's pressure tactic is data theft plus blackmail, not file encryption. Preserve evidence and keep response facts narrow.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify revocation, rotation, short-lived token controls, allowlisting, and secret scan completion.",
      hint: "`tshark -r evidence.pcap --follow-log containment/actions.log`.",
      matches: [
        { kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/actions.log" },
      ],
      narration:
        "Good containment closes both paths: the stolen token stops working, and the next token class is harder to abuse.",
    },
    {
      id: "checklist",
      goal: "Review the archived defensive checklist for GitHub token incidents.",
      hint: "`head -n 80 public-poc/github_token_scope_checklist.md`.",
      matches: [
        { kind: "exact", command: "head -n 80 public-poc/github_token_scope_checklist.md" },
      ],
      narration:
        "Repository incidents are access-control incidents first. Scope the token, then scan the source, then rotate what source could reveal.",
    },
  ],
  debrief: {
    summary:
      "On May 18, 2026, SecurityWeek, TechRepublic, and The Register reported that Grafana confirmed a breach in which an unauthorized party obtained a compromised token for its GitHub environment and downloaded code. The same reporting said Grafana found no customer or personal data access, no customer-system or operations impact, reset or invalidated the compromised credential, and refused an extortion demand. Sources: https://www.securityweek.com/grafana-confirms-breach-after-hackers-claim-they-stole-data/ https://www.techrepublic.com/article/news-grafana-github-token-codebase-breach/ https://www.theregister.com/cyber-crime/2026/05/18/grafana-labs-admits-attackers-downloaded-its-codebase-from-github/5241686",
    lesson:
      "A GitHub token can be a codebase key. Treat broad developer tokens like production credentials: least privilege, short lifetimes, app-scoped grants, source IP restrictions where practical, audit-log alerts for archive downloads, and secret scanning after any repository theft.",
    simulated: [
      "Audit events, token IDs, repository names, IPs, timelines, and containment logs are synthetic.",
      "The incident framing is based on public reports from May 18, 2026.",
      "No real Grafana systems, tokens, or repositories are represented.",
    ],
  },
};
