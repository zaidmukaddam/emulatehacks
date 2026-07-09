import type { Scenario } from "../types";

/**
 * July 2026 Accenture disclosure reconstruction.
 * Public reporting: an actor using "888" claimed 35 GB of source code and
 * cloud secrets, including Azure DevOps artefacts. This exhibit uses only
 * synthetic defensive evidence and redacted token shapes.
 */
export const accentureDevopsExposure: Scenario = {
  slug: "accenture-devops-exposure",
  exhibit: "EXH-048",
  title: "Azure DevOps Exposure",
  tagline:
    "8 July 2026. Accenture confirms an isolated security matter after a forum actor claims 35 GB of source code, RSA and SSH keys, Azure PATs, storage keys, and config files were offered for sale.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/soc/accenture-devops",
  user: "responder",
  host: "cloud-ir-07",
  role: "Cloud incident responder validating a synthetic Azure DevOps exposure packet derived from public July 2026 reporting.",
  objective:
    "Confirm the public claim, identify the exposed credential classes, trace repository access, and verify containment actions without touching any real Accenture system.",
  briefing:
    "A threat actor using the handle 888 claimed to sell a July 2026 Accenture dataset. Public reports describe source code, RSA and SSH keys, Azure Personal Access Tokens, Azure Storage keys, and configuration files, plus a screenshot that appeared to show an Azure DevOps repository clone. Accenture said it remediated an isolated matter with no operational impact. Your task is to rehearse the defender workflow with sanitized artifacts.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/soc/accenture-devops",
    CLOUD: "azure",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  417 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "cat README.md"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/public-report-summary.txt": [
      "simulated safe tool replay for accenture-devops-exposure",
      "source date: 2026-07-08",
      "actor: 888",
      "claim: 35 GB source code and cloud secret material",
      "company statement: isolated matter remediated, no impact to operations or service delivery",
      "scope caveat: public reports say client-data exposure and exact intrusion path were not confirmed",
    ].join("\n"),
    "python3 safe_replay.py --scenario accenture-devops-exposure --artifact evidence/forum-screenshot-transcript.txt": [
      "simulated safe replay for accenture-devops-exposure",
      "artifact: forum-screenshot-transcript.txt",
      "curl https://dev.azure.com/[redacted-org]/_apis/git/repositories/121123_AtriasTalentAcademy",
      "git clone https://[redacted]@dev.azure.com/[redacted-org]/121123_AtriasTalentAcademy/_git/121123_AtriasTalentAcademy",
      "receiving objects: 100% (8421/8421), 51.4 MiB | 18.2 MiB/s",
      "note: command text is synthetic and credential material is redacted",
    ].join("\n"),
    "python3 ir_toolkit.py extract-ioc --ioc Azure --input manifests/claimed-files.csv": [
      "kind,path,risk",
      "azure-pat,repos/academy/.azure/pipeline-pat.txt,repo read and clone access",
      "azure-storage-key,config/prod/storage-account.txt,blob access if still valid",
      "config,deploy/arm/parameters.prod.json,environment mapping",
    ].join("\n"),
    "python3 token_audit.py --manifest manifests/claimed-files.csv --kind azure-devops": [
      "token audit simulation",
      "azure-pat candidates: 4",
      "rsa-private-key candidates: 2",
      "ssh-private-key candidates: 5",
      "azure-storage-key candidates: 3",
      "highest priority: revoke repo-scoped PATs, rotate storage account keys, invalidate deploy keys",
    ].join("\n"),
    "tshark -r evidence.pcap --follow-log logs/azure-devops-audit.log": [
      "simulated packet/log follow for accenture-devops-exposure",
      "2026-07-06T21:18:44Z repo=121123_AtriasTalentAcademy action=Git.Clone actor=pat-legacy-build ip=198.51.100.88 result=Success",
      "2026-07-06T21:19:03Z repo=121123_AtriasTalentAcademy action=Git.GetBlobs actor=pat-legacy-build ip=198.51.100.88 result=Success",
      "2026-07-08T12:31:10Z repo=121123_AtriasTalentAcademy action=TokenRevoked actor=soc-containment ip=192.0.2.25 result=Success",
    ].join("\n"),
    "jq . containment/revocation-plan.json": [
      "{",
      '  "incident": "accenture-devops-exposure",',
      '  "revoked": ["pat-legacy-build", "academy-readonly-pat"],',
      '  "rotated": ["storage-account-primary", "ssh-deploy-key-02", "rsa-ci-signing-key"],',
      '  "repo_actions": ["disable classic PATs", "force branch policy review", "audit project visibility"],',
      '  "status": "contained in simulation"',
      "}",
    ].join("\n"),
  },
  files: {
    "/home/soc/accenture-devops/README.md": {
      content: [
        "Accenture Azure DevOps exposure reconstruction",
        "",
        "All evidence is synthetic and redacted.",
        "Start with `python3 ir_toolkit.py parse-artifact --input intel/public-report-summary.txt`.",
      ].join("\n"),
    },
    "/home/soc/accenture-devops/ir_toolkit.py": {
      content: [
        "#!/usr/bin/env python3",
        "\"\"\"Scenario helper for safe artifact parsing.",
        "",
        "The museum shell intercepts exact commands from scenario.commands.",
        "No code runs and no real tenant, repository, or network is touched.",
        "\"\"\"",
        "raise SystemExit('simulated helper: canned output only')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/soc/accenture-devops/safe_replay.py": {
      content: [
        "#!/usr/bin/env python3",
        "\"\"\"Safe replay wrapper for redacted public artefacts.\"\"\"",
        "raise SystemExit('simulated helper: canned output only')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/soc/accenture-devops/token_audit.py": {
      content: [
        "#!/usr/bin/env python3",
        "\"\"\"Classifies token-shaped strings in redacted manifests.",
        "",
        "This file is a placeholder. The exhibit routes the exact command to canned output.",
        "\"\"\"",
        "raise SystemExit('simulated helper: canned output only')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/soc/accenture-devops/intel/public-report-summary.txt": {
      content: [
        "Public reporting packet, July 8 2026",
        "",
        "Security Affairs reported that Accenture confirmed an isolated security matter after a threat actor",
        "using the handle 888 claimed to sell 35 GB of data on PwnForums.",
        "",
        "Reported material classes:",
        "- source code",
        "- RSA keys",
        "- SSH keys",
        "- Azure Personal Access Tokens",
        "- Azure Storage access keys",
        "- configuration files",
        "",
        "GBHackers summarized a screenshot that appeared to show an Azure DevOps API request and a git clone",
        "of a repository named 121123_AtriasTalentAcademy. Both outlets noted that the exact intrusion method,",
        "client data scope, and final exfiltration details were not publicly confirmed.",
      ].join("\n"),
    },
    "/home/soc/accenture-devops/evidence/forum-screenshot-transcript.txt": {
      content: [
        "Forum screenshot transcript, sanitized",
        "",
        "seller_handle: 888",
        "listing_label: One-Time Sale",
        "claim_size: 35 GB",
        "payment: Monero only",
        "",
        "visible terminal fragment:",
        "curl https://dev.azure.com/[redacted-org]/_apis/git/repositories/121123_AtriasTalentAcademy",
        "git clone https://[redacted]@dev.azure.com/[redacted-org]/121123_AtriasTalentAcademy/_git/121123_AtriasTalentAcademy",
        "receiving objects: 100% (8421/8421), 51.4 MiB | 18.2 MiB/s",
      ].join("\n"),
    },
    "/home/soc/accenture-devops/manifests/claimed-files.csv": {
      content: [
        "kind,path,risk",
        "source-code,repos/academy/src/portal.ts,application logic disclosure",
        "azure-pat,repos/academy/.azure/pipeline-pat.txt,repo read and clone access",
        "azure-pat,repos/academy/.azure/release-pat.txt,pipeline release access",
        "azure-storage-key,config/prod/storage-account.txt,blob access if still valid",
        "rsa-private-key,keys/ci-signing/id_rsa,signature or deploy impersonation",
        "ssh-private-key,keys/deploy/academy_ed25519,server or git deploy access",
        "config,deploy/arm/parameters.prod.json,environment mapping",
      ].join("\n"),
    },
    "/home/soc/accenture-devops/logs/azure-devops-audit.log": {
      content: [
        "2026-07-06T21:18:44Z repo=121123_AtriasTalentAcademy action=Git.Clone actor=pat-legacy-build ip=198.51.100.88 result=Success",
        "2026-07-06T21:19:03Z repo=121123_AtriasTalentAcademy action=Git.GetBlobs actor=pat-legacy-build ip=198.51.100.88 result=Success",
        "2026-07-08T12:31:10Z repo=121123_AtriasTalentAcademy action=TokenRevoked actor=soc-containment ip=192.0.2.25 result=Success",
      ].join("\n"),
    },
    "/home/soc/accenture-devops/containment/revocation-plan.json": {
      content: [
        "{",
        '  "incident": "accenture-devops-exposure",',
        '  "revoked": ["pat-legacy-build", "academy-readonly-pat"],',
        '  "rotated": ["storage-account-primary", "ssh-deploy-key-02", "rsa-ci-signing-key"],',
        '  "repo_actions": ["disable classic PATs", "force branch policy review", "audit project visibility"],',
        '  "status": "contained in simulation"',
        "}",
      ].join("\n"),
    },
    "/home/soc/accenture-devops/public-poc/azure_devops_pat_triage.txt": {
      content: [
        "# Azure DevOps exposure triage, museum-safe checklist",
        "",
        "1. Treat every Personal Access Token in source or screenshots as compromised.",
        "2. Revoke PATs before asking whether attackers used them.",
        "3. Pull repository audit logs for Git.Clone, Git.GetBlobs, TokenCreated, TokenUsed, and TokenRevoked.",
        "4. Rotate storage account keys and deploy keys referenced by leaked configuration files.",
        "5. Review project visibility and classic PAT policy at the organization level.",
        "6. Notify downstream owners when config files map client or production environments.",
        "",
        "This exhibit contains no real credentials, no real tenant names, and no working endpoints.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "public-report",
      phase: "Recon",
      goal: "Load the distilled public report summary for the July 8 disclosure.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/public-report-summary.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/public-report-summary.txt" }],
      narration:
        "The confirmed fact is narrow: Accenture said it remediated an isolated matter. The attacker claim is broader and still unverified in public reporting.",
    },
    {
      id: "forum-artifact",
      phase: "Initial access",
      goal: "Replay the redacted forum screenshot transcript to identify the Azure DevOps evidence shape.",
      hint: "`python3 safe_replay.py --scenario accenture-devops-exposure --artifact evidence/forum-screenshot-transcript.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 safe_replay.py --scenario accenture-devops-exposure --artifact evidence/forum-screenshot-transcript.txt",
        },
      ],
      narration:
        "A curl to dev.azure.com followed by git clone suggests authenticated repository access, if the screenshot is genuine.",
    },
    {
      id: "azure-classes",
      phase: "Discovery",
      goal: "Filter the claimed file manifest for Azure-related secret classes.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc Azure --input manifests/claimed-files.csv`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc Azure --input manifests/claimed-files.csv" },
      ],
      narration:
        "PATs, storage keys, and config files turn source exposure into a cloud access problem.",
    },
    {
      id: "token-audit",
      phase: "Credential access",
      goal: "Classify the redacted token and key candidates by response priority.",
      hint: "`python3 token_audit.py --manifest manifests/claimed-files.csv --kind azure-devops`.",
      matches: [
        { kind: "exact", command: "python3 token_audit.py --manifest manifests/claimed-files.csv --kind azure-devops" },
      ],
      narration:
        "Response order matters: revoke reusable tokens first, then rotate keys and invalidate deploy material.",
    },
    {
      id: "audit-log",
      phase: "Detection",
      goal: "Correlate the repository clone pattern with synthetic Azure DevOps audit rows.",
      hint: "`tshark -r evidence.pcap --follow-log logs/azure-devops-audit.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log logs/azure-devops-audit.log" }],
      narration:
        "A legacy build PAT cloned the repository from an unfamiliar IP before containment revoked it.",
    },
    {
      id: "revocation",
      phase: "Containment",
      goal: "Verify the response plan for revoked tokens, rotated keys, and repository policy changes.",
      hint: "`jq . containment/revocation-plan.json`.",
      matches: [{ kind: "exact", command: "jq . containment/revocation-plan.json" }],
      narration:
        "Containment is not a press statement. It is revocation, rotation, policy hardening, and downstream notification.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the Azure DevOps PAT triage checklist for the museum debrief.",
      hint: "`head -n 80 public-poc/azure_devops_pat_triage.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/azure_devops_pat_triage.txt" }],
      narration:
        "The reusable lesson is simple: source leaks become identity incidents when tokens and keys travel with the code.",
    },
  ],
  debrief: {
    summary:
      "On 8 July 2026, Security Affairs reported that Accenture confirmed an isolated security matter after a threat actor using the handle 888 claimed to sell 35 GB of source code and cloud secret material. GBHackers reported the alleged data classes as source repositories, RSA and SSH keys, Azure Personal Access Tokens, Azure Storage keys, and configuration files, and described a screenshot that appeared to show Azure DevOps API and git clone activity against a repository named 121123_AtriasTalentAcademy. Accenture's public statement said the source was remediated and operations were not impacted. Sources: https://securityaffairs.com/194962/data-breach/a-hacker-claims-35-gb-of-accenture-source-code-the-company-discloses-the-data-breach.html and https://gbhackers.com/accenture-data-breach-exposes-35gb-source-code/",
    lesson:
      "Treat exposed developer artefacts as an identity and cloud-control incident. Revoke PATs, rotate storage and deploy keys, inspect repository audit logs, review project visibility, and assume configuration files may describe production or client paths even when source code alone seems harmless.",
    simulated: [
      "All tenant names, IP addresses, logs, manifests, token counts, and command transcripts are synthetic teaching artefacts.",
      "The scenario preserves public high-level claims and Accenture's reported statement, but it does not validate attacker screenshots or assert client-data exposure.",
      "No real Azure DevOps endpoint, repository, Accenture system, or credential is contacted or reproduced.",
    ],
  },
};
