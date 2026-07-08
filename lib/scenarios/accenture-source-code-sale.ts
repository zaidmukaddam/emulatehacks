import type { Scenario } from "../types";

/**
 * July 7, 2026 public reporting: Accenture confirmed an isolated breach after
 * threat actor "888" offered alleged source code and cloud secrets for sale.
 */
export const accentureSourceCodeSale: Scenario = {
  slug: "accenture-source-code-sale",
  exhibit: "EXH-048",
  title: "Source Repo Fire Sale",
  tagline:
    "7 July 2026. Accenture confirms an isolated breach after actor 888 advertises 35 GB of alleged source code, keys, Azure PATs, storage keys, and config files on a crime forum.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/cloudsec/accenture-triage",
  user: "responder",
  host: "repo-ir-02",
  role: "Cloud security responder validating source-code exposure and emergency secret rotation.",
  objective:
    "Confirm the public breach facts, separate verified statements from seller claims, find the highest-risk secret classes, and verify containment evidence.",
  briefing:
    "A July 7 BleepingComputer report says Accenture confirmed a remediated, isolated breach after a forum actor named 888 claimed 35 GB of source code and infrastructure secrets. You only have sanitized artefacts: press notes, a seller-claim digest, a repository-clone screenshot transcript, secret inventory, repo-access logs, and containment receipts. Treat the actor's scope claims as unverified unless a local artefact supports response action.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/cloudsec/accenture-triage",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/bleepingcomputer-report.txt":
      [
        "[ir_toolkit] artifact: intel/bleepingcomputer-report.txt",
        "   1| BleepingComputer, 2026-07-07 22:06 UTC",
        "   2| Accenture confirmed an isolated security breach and said the source was remediated.",
        "   3| Accenture statement: no impact to operations or service delivery.",
        "   4| Actor 888 claimed 35 GB stolen in July 2026.",
        "   5| Claimed contents: source code, RSA keys, SSH keys, Azure PATs, Azure Storage access keys, config files.",
        "   6| Reporter note: full scope and exfiltrated data types were not independently verified.",
      ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input forum/seller-claim.txt":
      [
        "[ir_toolkit] artifact: forum/seller-claim.txt",
        "   1| seller=888",
        "   2| post_date=2026-07-07",
        "   3| claim=35GB Accenture data breach archive",
        "   4| list=source code, RSA keys, SSH keys, Azure PATs, Azure Storage access keys, config files",
        "   5| caveat=marketplace claim only; authenticate every sample before declaring impact",
      ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input evidence/azure-devops-clone.txt":
      [
        "[ir_toolkit] artifact: evidence/azure-devops-clone.txt",
        "   1| screenshot transcript from article sample",
        "   2| action=git clone over Azure DevOps HTTPS",
        "   3| org_host=redacted.accenture.com",
        "   4| repo_name=121123_AtriasTalentAcademy",
        "   5| local_note=repo name proves one visible development asset, not full archive scope",
      ].join("\n"),
    "python3 ir_toolkit.py extract-ioc --ioc PAT --input triage/secret-inventory.txt":
      [
        "4:Azure PAT: listed by seller, rotate all visible Azure DevOps tokens in matching orgs",
        "8:Priority 1: invalidate Azure PATs before repo mirroring or forensic export",
      ].join("\n"),
    "python3 ir_toolkit.py extract-ioc --ioc Azure --input triage/secret-inventory.txt":
      [
        "4:Azure PAT: listed by seller, rotate all visible Azure DevOps tokens in matching orgs",
        "5:Azure Storage access keys: listed by seller, rotate account keys and review SAS tokens",
        "8:Priority 1: invalidate Azure PATs before repo mirroring or forensic export",
      ].join("\n"),
    "tshark -r evidence.pcap --follow-log detection/repo-access.log":
      [
        "2026-07-07T20:14:09Z provider=azure-devops repo=121123_AtriasTalentAcademy event=git.clone actor=svc-build-legacy ip=198.51.100.74",
        "2026-07-07T20:14:11Z provider=azure-devops token_type=PAT scope=code:read,packaging:read policy=legacy-no-expiry",
        "2026-07-07T20:19:32Z provider=azure-devops alert=bulk_repo_read threshold=exceeded actor=svc-build-legacy",
      ].join("\n"),
    "jq . containment/remediation.json":
      [
        "{",
        '  "source": "remediated",',
        '  "operations_impact": false,',
        '  "rotated": ["azure_devops_pat", "azure_storage_keys", "ssh_deploy_keys", "rsa_private_keys"],',
        '  "disabled_identities": ["svc-build-legacy"],',
        '  "customer_data_status": "not publicly confirmed in source reporting"',
        "}",
      ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input lessons/source-review.txt":
      [
        "[ir_toolkit] artifact: lessons/source-review.txt",
        "   1| Source-code theft is not just IP loss.",
        "   2| Repositories often contain build secrets, deployment scripts, hardcoded endpoints, and comments that map customer environments.",
        "   3| Immediate response: revoke tokens, rotate keys, review repo history, audit service accounts, and hunt for clone bursts.",
        "   4| Communications: separate confirmed breach facts from unverified forum inventory claims.",
      ].join("\n"),
  },
  files: {
    "/home/cloudsec/accenture-triage/intel/bleepingcomputer-report.txt": {
      content: [
        "BleepingComputer, 2026-07-07 22:06 UTC",
        "Accenture confirmed an isolated security breach and said the source was remediated.",
        "Accenture statement: no impact to operations or service delivery.",
        "Actor 888 claimed 35 GB stolen in July 2026.",
        "Claimed contents: source code, RSA keys, SSH keys, Azure PATs, Azure Storage access keys, config files.",
        "Reporter note: full scope and exfiltrated data types were not independently verified.",
        "Source: https://www.bleepingcomputer.com/news/security/accenture-confirms-breach-after-hacker-offers-stolen-data-for-sale/",
      ].join("\n"),
    },
    "/home/cloudsec/accenture-triage/forum/seller-claim.txt": {
      content: [
        "seller=888",
        "post_date=2026-07-07",
        "claim=35GB Accenture data breach archive",
        "list=source code, RSA keys, SSH keys, Azure PATs, Azure Storage access keys, config files",
        "caveat=marketplace claim only; authenticate every sample before declaring impact",
      ].join("\n"),
    },
    "/home/cloudsec/accenture-triage/evidence/azure-devops-clone.txt": {
      content: [
        "screenshot transcript from article sample",
        "action=git clone over Azure DevOps HTTPS",
        "org_host=redacted.accenture.com",
        "repo_name=121123_AtriasTalentAcademy",
        "local_note=repo name proves one visible development asset, not full archive scope",
      ].join("\n"),
    },
    "/home/cloudsec/accenture-triage/triage/secret-inventory.txt": {
      content: [
        "High-risk classes from seller claim and local response queue",
        "RSA private keys: rotate certificates and search repo history",
        "SSH keys: disable deploy keys, replace host-trust shortcuts",
        "Azure PAT: listed by seller, rotate all visible Azure DevOps tokens in matching orgs",
        "Azure Storage access keys: listed by seller, rotate account keys and review SAS tokens",
        "Configuration files: scan for customer endpoints and embedded credentials",
        "",
        "Priority 1: invalidate Azure PATs before repo mirroring or forensic export",
      ].join("\n"),
    },
    "/home/cloudsec/accenture-triage/detection/repo-access.log": {
      content: [
        "2026-07-07T20:14:09Z provider=azure-devops repo=121123_AtriasTalentAcademy event=git.clone actor=svc-build-legacy ip=198.51.100.74",
        "2026-07-07T20:14:11Z provider=azure-devops token_type=PAT scope=code:read,packaging:read policy=legacy-no-expiry",
        "2026-07-07T20:19:32Z provider=azure-devops alert=bulk_repo_read threshold=exceeded actor=svc-build-legacy",
      ].join("\n"),
    },
    "/home/cloudsec/accenture-triage/containment/remediation.json": {
      content: [
        "{",
        '  "source": "remediated",',
        '  "operations_impact": false,',
        '  "rotated": ["azure_devops_pat", "azure_storage_keys", "ssh_deploy_keys", "rsa_private_keys"],',
        '  "disabled_identities": ["svc-build-legacy"],',
        '  "customer_data_status": "not publicly confirmed in source reporting"',
        "}",
      ].join("\n"),
    },
    "/home/cloudsec/accenture-triage/lessons/source-review.txt": {
      content: [
        "Source-code theft is not just IP loss.",
        "Repositories often contain build secrets, deployment scripts, hardcoded endpoints, and comments that map customer environments.",
        "Immediate response: revoke tokens, rotate keys, review repo history, audit service accounts, and hunt for clone bursts.",
        "Communications: separate confirmed breach facts from unverified forum inventory claims.",
      ].join("\n"),
    },
    "/home/cloudsec/accenture-triage/public-poc/devops_secret_triage_stub.sh": {
      content: [
        "#!/bin/sh",
        "# Museum stub: defensive Azure DevOps exposure triage only.",
        "# No network call, token, or credential is present in this file.",
        "",
        "# Response pattern:",
        "# 1. Disable suspect service identities.",
        "# 2. Rotate Azure PATs and storage keys.",
        "# 3. Search repository history for private keys and config secrets.",
        "# 4. Compare confirmed facts with seller claims before public impact statements.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "public-report",
      phase: "Recon",
      goal: "Read the public report summary and Accenture's confirmed statement.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/bleepingcomputer-report.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input intel/bleepingcomputer-report.txt",
        },
      ],
      narration:
        "Start with confirmed facts: an isolated, remediated breach and no stated operations or delivery impact.",
    },
    {
      id: "seller-claim",
      phase: "Recon",
      goal: "Inspect the forum claim without treating every claimed data type as verified.",
      hint: "`python3 ir_toolkit.py parse-artifact --input forum/seller-claim.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input forum/seller-claim.txt",
        },
      ],
      narration:
        "A crime-forum inventory is a lead, not proof. It still drives urgent secret rotation because claimed keys can burn live systems.",
    },
    {
      id: "repo-sample",
      phase: "Initial access",
      goal: "Review the sanitized Azure DevOps repository clone sample from the report.",
      hint: "`python3 ir_toolkit.py parse-artifact --input evidence/azure-devops-clone.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input evidence/azure-devops-clone.txt",
        },
      ],
      narration:
        "The screenshot supports at least one Azure DevOps repository exposure, while the total archive size remains unverified.",
    },
    {
      id: "pat-risk",
      phase: "Credential access",
      goal: "Find the Azure DevOps personal access token class in the triage inventory.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc PAT --input triage/secret-inventory.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py extract-ioc --ioc PAT --input triage/secret-inventory.txt",
        },
      ],
      narration:
        "PATs are the fast path from repository leak to repeated clone, package read, and pipeline reconnaissance.",
    },
    {
      id: "azure-risk",
      phase: "Impact",
      goal: "List Azure-specific secret classes that need immediate rotation.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc Azure --input triage/secret-inventory.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py extract-ioc --ioc Azure --input triage/secret-inventory.txt",
        },
      ],
      narration:
        "Source code plus cloud credentials compounds the risk: the attacker may learn how systems are built and how to reach them.",
    },
    {
      id: "repo-logs",
      phase: "Detection",
      goal: "Inspect clone telemetry for a legacy service identity and token scope.",
      hint: "`tshark -r evidence.pcap --follow-log detection/repo-access.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap --follow-log detection/repo-access.log",
        },
      ],
      narration:
        "A bulk clone burst from a no-expiry service PAT is enough to trigger containment even when public scope is still unclear.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify remediation status, rotations, and disabled identities.",
      hint: "`jq . containment/remediation.json`.",
      matches: [{ kind: "exact", command: "jq . containment/remediation.json" }],
      narration:
        "Containment aligns with the confirmed statement: source remediated, operations unaffected, highest-risk secrets rotated.",
    },
    {
      id: "lessons",
      phase: "Lessons",
      goal: "Summarize the durable response lessons from a source-code breach.",
      hint: "`python3 ir_toolkit.py parse-artifact --input lessons/source-review.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input lessons/source-review.txt",
        },
      ],
      narration:
        "Source repositories are maps of production. Hunt in history, rotate anything deployable, and keep public statements evidence-based.",
    },
    {
      id: "mechanism-excerpt",
      goal: "Review the inert triage checklist kept with the exhibit.",
      hint: "`head -n 80 public-poc/devops_secret_triage_stub.sh`.",
      matches: [
        {
          kind: "exact",
          command: "head -n 80 public-poc/devops_secret_triage_stub.sh",
        },
      ],
      narration:
        "This is a defensive checklist, not a reproduction of the breach path.",
    },
  ],
  debrief: {
    summary:
      "On 7 July 2026, BleepingComputer reported that Accenture confirmed an isolated breach after actor 888 offered alleged company data for sale. The actor claimed 35 GB of source code and infrastructure secrets, including RSA keys, SSH keys, Azure personal access tokens, Azure Storage access keys, and configuration files. Accenture told BleepingComputer it remediated the source and saw no impact to operations or service delivery, while the reporter noted that the full scope and claimed data types were not independently verified. Source: https://www.bleepingcomputer.com/news/security/accenture-confirms-breach-after-hacker-offers-stolen-data-for-sale/",
    lesson:
      "A source-code breach becomes a cloud-identity incident the moment tokens, deploy keys, storage keys, or config secrets might be present. Rotate first, then spend the slower cycle proving exact scope.",
    simulated: [
      "Local logs, service identity names, remediation JSON, and repository triage artefacts are synthetic teaching props.",
      "The public Accenture statement, actor name 888, claimed 35 GB size, claimed secret classes, and Azure DevOps screenshot framing are taken from public reporting at a high level.",
      "This exhibit does not include real company code, secrets, exploit steps, or forum material.",
    ],
  },
};
