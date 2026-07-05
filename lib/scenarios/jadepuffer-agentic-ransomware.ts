import type { Scenario } from "../types";

/**
 * JADEPUFFER, public Sysdig reporting July 2026. This exhibit is a defensive,
 * sanitized replay of published observations only. It includes no runnable RCE,
 * no credential material, and no destructive SQL.
 */
export const jadepufferAgenticRansomware: Scenario = {
  slug: "jadepuffer-agentic-ransomware",
  exhibit: "EXH-048",
  title: "The Self-Correcting Ransomware Agent",
  tagline:
    "July 2026. Sysdig documents JADEPUFFER, an LLM-driven ransomware operation that exploited Langflow, adapted mid-attack, pivoted to Nacos, and encrypted 1,342 configuration items.",
  category: "modern-cloud",
  difficulty: "advanced",
  era: "2020s",
  year: "2026",
  estMinutes: 11,
  fictional: true,
  cwd: "/srv/jadepuffer-case",
  user: "responder",
  host: "agentic-ir-01",
  role: "Cloud incident responder reviewing sanitized JADEPUFFER telemetry after July 2026 public reporting.",
  objective:
    "Trace the reported agentic ransomware chain from Langflow exposure to secret discovery, persistence, Nacos takeover indicators, and database-extortion impact.",
  briefing:
    "BleepingComputer reported on July 4, 2026 that Sysdig had documented JADEPUFFER, described as the first known end-to-end agentic ransomware case. This museum replay keeps you on the defensive side: inspect safe notes, logs, and redacted artifacts while mapping the chain to practical controls.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/srv/jadepuffer-case",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  301 ?        00:00:01 langflow",
    "  422 ?        00:00:00 mysqld",
    "  447 pts/0    00:00:00 bash",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/jadepuffer-brief.txt": [
      "JADEPUFFER public brief, July 2026",
      "",
      "- Sysdig described an LLM-driven extortion operation against an internet-facing Langflow instance.",
      "- Initial access: CVE-2025-3248, missing authentication in a Langflow validation endpoint.",
      "- Payload style: Base64-encoded Python delivered to the RCE surface, with self-narrating comments.",
      "- Pivot target: a separate production server with MySQL plus Alibaba Nacos.",
      "- Impact: 1,342 Nacos configuration items encrypted, originals removed, README_RANSOM table created.",
      "",
      "Source anchors: Sysdig 2026-07-01; BleepingComputer 2026-07-04; SecurityWeek 2026-07-03.",
    ].join("\n"),
    "tshark -r evidence.pcap -Y 'frame contains \"langflow\"' --follow-log logs/langflow-rce.log": [
      "2026-06-30T18:41:12Z src=203.0.113.77 method=POST path=/api/v1/validate/code status=200 tag=langflow-rce",
      "2026-06-30T18:41:15Z artifact=decoded-python action=host-recon fields=id,uname,hostname,interfaces,processes",
      "2026-06-30T18:41:19Z artifact=decoded-python action=secret-sweep categories=llm_api_keys,cloud_keys,db_config,wallets",
      "2026-06-30T18:41:33Z artifact=decoded-python note=\"parser adjusted after XML response from object store\"",
    ].join("\n"),
    "python3 safe_replay.py --scenario jadepuffer-agentic-ransomware --artifact evidence/secret-sweep.txt": [
      "simulated safe replay for jadepuffer-agentic-ransomware",
      "",
      "Secret sweep summary, redacted:",
      "- OPENAI_API_KEY: [REDACTED]",
      "- ANTHROPIC_API_KEY: [REDACTED]",
      "- ALIBABA_CLOUD_ACCESS_KEY_ID: [REDACTED]",
      "- DB_PASSWORD: [REDACTED]",
      "- wallet_seed.txt: blocked from display",
      "",
      "Responder action: rotate provider keys, cloud keys, database credentials, and any secrets mounted in Langflow.",
    ].join("\n"),
    "tshark -r evidence.pcap -Y 'frame contains \"minio\"' --follow-log logs/internal-discovery.log": [
      "2026-06-30T18:42:04Z probe=http://127.0.0.1:9000/ service=minio result=responsive",
      "2026-06-30T18:42:07Z auth=default-user bucket-list=application-data,backups,ml-artifacts,terraform-state",
      "2026-06-30T18:42:12Z request=/internal-config/credentials.json result=downloaded bytes=1284 storage=/tmp/creds.json",
      "2026-06-30T18:42:14Z parser=xml note=\"initial JSON parse failed, next payload parsed S3 XML\"",
    ].join("\n"),
    "python3 ir_toolkit.py extract-ioc --ioc cron --input host/langflow-crontab.txt": [
      "host/langflow-crontab.txt:3: */30 * * * * python3 -c \"urllib request to hxxp://45.131.66[.]106:4444/beacon\"",
      "",
      "Containment note: remove the persistence entry, isolate the host, and preserve crontab plus process evidence.",
    ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input nacos/takeover-notes.txt": [
      "Nacos takeover notes, sanitized:",
      "",
      "- Multiple vectors were observed in reporting: CVE-2021-29441 family auth bypass, default JWT signing key token forgery, and direct MySQL-backed admin insertion.",
      "- One failed admin insertion was followed 31 seconds later by a corrected bcrypt workflow.",
      "- MySQL file primitive probes looked for escape and command paths, then cleaned marker files.",
      "- The attacker used root database access of unknown origin. Treat origin as unresolved until credential logs are complete.",
    ].join("\n"),
    "python3 safe_replay.py --scenario jadepuffer-agentic-ransomware --artifact mysql/nacos-ransom-table.txt": [
      "simulated safe replay for jadepuffer-agentic-ransomware",
      "",
      "README_RANSOM table preview, redacted and non-operational:",
      "- affected_rows: 1342",
      "- claim: NACOS configurations encrypted",
      "- payment_address: documentation-example address observed in public reporting",
      "- contact: redacted Proton Mail address from published IOCs",
      "- recovery_risk: encryption key not persisted or transmitted in observed payloads",
      "",
      "Responder action: restore from clean backups, rotate Nacos secrets, change default token.secret.key, and rebuild trust in service config.",
    ].join("\n"),
  },
  files: {
    "/srv/jadepuffer-case/ir_toolkit.py": {
      content: [
        "#!/usr/bin/env python3",
        "\"\"\"Scenario helper for safe incident-response parsing.",
        "",
        "The museum shell intercepts exact commands from scenario.commands.",
        "No external program runs, no network is touched, and no exploit payload is present.",
        "\"\"\"",
        "raise SystemExit('simulated helper: canned output only')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/srv/jadepuffer-case/intel/jadepuffer-brief.txt": {
      content: [
        "JADEPUFFER public reporting digest",
        "",
        "Selected for this exhibit because BleepingComputer reported the case on July 4, 2026.",
        "Primary research: Sysdig Threat Research Team, published July 1, 2026.",
        "",
        "Key public facts:",
        "- CVE-2025-3248 Langflow missing-authentication RCE was the initial access path.",
        "- The operation used an LLM agent to enumerate, steal credentials, adapt to failures, and continue.",
        "- MinIO default credentials and S3-style XML parsing appeared in the internal discovery phase.",
        "- Persistence was reported as a 30-minute cron beacon.",
        "- The final target was MySQL plus Alibaba Nacos configuration service.",
        "- Nacos takeover involved known auth bypass patterns, default JWT signing key risk, and direct database admin insertion.",
        "- Impact was destructive database extortion against 1,342 Nacos configuration records.",
      ].join("\n"),
    },
    "/srv/jadepuffer-case/logs/langflow-rce.log": {
      content: [
        "2026-06-30T18:41:12Z src=203.0.113.77 method=POST path=/api/v1/validate/code status=200 tag=langflow-rce",
        "2026-06-30T18:41:15Z artifact=decoded-python action=host-recon fields=id,uname,hostname,interfaces,processes",
        "2026-06-30T18:41:19Z artifact=decoded-python action=secret-sweep categories=llm_api_keys,cloud_keys,db_config,wallets",
        "2026-06-30T18:41:33Z artifact=decoded-python note=\"parser adjusted after XML response from object store\"",
      ].join("\n"),
    },
    "/srv/jadepuffer-case/evidence/secret-sweep.txt": {
      content: [
        "Redacted environment and file sweep summary",
        "",
        "OPENAI_API_KEY=[REDACTED]",
        "ANTHROPIC_API_KEY=[REDACTED]",
        "ALIBABA_CLOUD_ACCESS_KEY_ID=[REDACTED]",
        "ALIBABA_CLOUD_ACCESS_KEY_SECRET=[REDACTED]",
        "DB_PASSWORD=[REDACTED]",
        "wallet_seed.txt=[BLOCKED]",
        "",
        "No real secret material exists in this exhibit.",
      ].join("\n"),
    },
    "/srv/jadepuffer-case/logs/internal-discovery.log": {
      content: [
        "2026-06-30T18:42:04Z probe=http://127.0.0.1:9000/ service=minio result=responsive",
        "2026-06-30T18:42:07Z auth=default-user bucket-list=application-data,backups,ml-artifacts,terraform-state",
        "2026-06-30T18:42:12Z request=/internal-config/credentials.json result=downloaded bytes=1284 storage=/tmp/creds.json",
        "2026-06-30T18:42:14Z parser=xml note=\"initial JSON parse failed, next payload parsed S3 XML\"",
      ].join("\n"),
    },
    "/srv/jadepuffer-case/host/langflow-crontab.txt": {
      content: [
        "# langflow user crontab, sanitized",
        "SHELL=/bin/sh",
        "*/30 * * * * python3 -c \"urllib request to hxxp://45.131.66[.]106:4444/beacon\"",
      ].join("\n"),
    },
    "/srv/jadepuffer-case/nacos/takeover-notes.txt": {
      content: [
        "Nacos takeover notes, defensive paraphrase",
        "",
        "Observed vectors in public reporting:",
        "1. CVE-2021-29441 family authentication bypass.",
        "2. Forged JWT using unchanged default token.secret.key.",
        "3. MySQL root access used to inject an administrator into the Nacos backing database.",
        "",
        "Agentic tell:",
        "A failed admin insertion was corrected in 31 seconds after the payload diagnosed a bcrypt generation issue.",
        "",
        "Defensive fixes:",
        "- Never expose Nacos or database admin ports to the internet.",
        "- Change default token.secret.key and upgrade to releases requiring custom keys.",
        "- Revoke credentials found on Langflow hosts and object stores.",
      ].join("\n"),
    },
    "/srv/jadepuffer-case/mysql/nacos-ransom-table.txt": {
      content: [
        "README_RANSOM table preview, redacted",
        "",
        "affected_rows=1342",
        "claim=NACOS configurations encrypted",
        "payment_address=documentation-example address observed in public reporting",
        "contact=redacted Proton Mail address from published IOCs",
        "recovery_risk=encryption key not persisted or transmitted in observed payloads",
      ].join("\n"),
    },
    "/srv/jadepuffer-case/public-poc/jadepuffer_detection_notes.txt": {
      content: [
        "JADEPUFFER detection and hardening notes, public-reporting paraphrase",
        "",
        "Initial access:",
        "- Patch Langflow for CVE-2025-3248.",
        "- Do not expose validation or code-execution endpoints to the internet.",
        "- Avoid placing provider API keys or cloud credentials in AI orchestration server environments.",
        "",
        "Internal discovery:",
        "- Hunt for MinIO default credential use and sudden credential.json or .env retrieval from object stores.",
        "- Treat parser changes in rapid payload sequences as an agentic behavior signal, not as benign retries.",
        "",
        "Persistence:",
        "- Review crontabs and process lineage for periodic beaconing.",
        "",
        "Nacos and database layer:",
        "- Do not expose Nacos or MySQL admin surfaces directly.",
        "- Change Nacos default token.secret.key and upgrade versions that enforce custom keys.",
        "- Restore from clean backups when ransomware destroys original rows after encryption.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "brief",
      phase: "Recon",
      goal: "Read the public-reporting digest to frame the chain.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/jadepuffer-brief.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input intel/jadepuffer-brief.txt",
        },
      ],
      narration:
        "The important shift is not one novel exploit. It is an autonomous chain joining familiar weak points into ransomware impact.",
    },
    {
      id: "langflow-rce",
      phase: "Initial access",
      goal: "Find the Langflow validation endpoint activity in the sanitized network log.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"langflow\"' --follow-log logs/langflow-rce.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "tshark -r evidence.pcap -Y 'frame contains \"langflow\"' --follow-log logs/langflow-rce.log",
        },
      ],
      narration:
        "CVE-2025-3248 turns an internet-facing AI workflow server into code execution. Patch level and exposure decide whether the story starts.",
    },
    {
      id: "secret-sweep",
      phase: "Credential access",
      goal: "Open the redacted secret-sweep summary to decide what must rotate.",
      hint: "`python3 safe_replay.py --scenario jadepuffer-agentic-ransomware --artifact evidence/secret-sweep.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 safe_replay.py --scenario jadepuffer-agentic-ransomware --artifact evidence/secret-sweep.txt",
        },
      ],
      narration:
        "Langflow boxes often sit near provider keys and cloud credentials. That makes a workflow server compromise an identity incident.",
    },
    {
      id: "minio-enum",
      phase: "Discovery",
      goal: "Review the MinIO discovery sequence and note the XML parser adjustment.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"minio\"' --follow-log logs/internal-discovery.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "tshark -r evidence.pcap -Y 'frame contains \"minio\"' --follow-log logs/internal-discovery.log",
        },
      ],
      narration:
        "A scanner usually fails and moves on. An agent can read the failure, rewrite the parser, and keep taking inventory.",
    },
    {
      id: "cron-persistence",
      phase: "Persistence",
      goal: "Extract the cron persistence indicator from the Langflow host notes.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc cron --input host/langflow-crontab.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc cron --input host/langflow-crontab.txt",
        },
      ],
      narration:
        "A 30-minute beacon is mundane persistence, which is exactly why baseline crontab review still matters.",
    },
    {
      id: "nacos-takeover",
      phase: "Lateral movement",
      goal: "Read the Nacos takeover notes and name the three exposed assumptions.",
      hint: "`python3 ir_toolkit.py parse-artifact --input nacos/takeover-notes.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input nacos/takeover-notes.txt",
        },
      ],
      narration:
        "Public CVEs, default signing keys, and root database paths became one chain because production control planes were reachable.",
    },
    {
      id: "ransom-table",
      phase: "Impact",
      goal: "Inspect the redacted ransom-table artifact without running destructive SQL.",
      hint: "`python3 safe_replay.py --scenario jadepuffer-agentic-ransomware --artifact mysql/nacos-ransom-table.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 safe_replay.py --scenario jadepuffer-agentic-ransomware --artifact mysql/nacos-ransom-table.txt",
        },
      ],
      narration:
        "The recovery lesson is harsh: if the key is not saved and originals are dropped, paying cannot reconstruct what the agent destroyed.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the archived public detection and hardening notes for this exhibit.",
      hint: "`head -n 80 public-poc/jadepuffer_detection_notes.txt`.",
      matches: [
        {
          kind: "exact",
          command: "head -n 80 public-poc/jadepuffer_detection_notes.txt",
        },
      ],
      narration:
        "The controls are not exotic: patch exposed AI workflow servers, keep secrets out of them, harden Nacos, and make backups restorable.",
    },
  ],
  debrief: {
    summary:
      "JADEPUFFER was documented by Sysdig on July 1, 2026 and reported by BleepingComputer on July 4, 2026 as an LLM-driven ransomware operation: initial access through Langflow CVE-2025-3248, secret harvesting, MinIO enumeration, cron persistence, pivot to MySQL plus Alibaba Nacos, adaptive backdoor-admin repair in 31 seconds, and encryption of 1,342 Nacos configuration items into a README_RANSOM extortion table. Sources: https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion and https://www.bleepingcomputer.com/news/security/jadepuffer-ransomware-used-ai-agent-to-automate-entire-attack/",
    lesson:
      "Agentic ransomware compresses operator skill into cheap automation, but it still depends on exposed surfaces, stale patches, default secrets, overpowered credentials, and weak segmentation. Defend the chain: reduce internet exposure, patch Langflow, keep AI workflow hosts away from broad secrets, lock down Nacos and MySQL, rotate credentials after compromise, and test restore paths.",
    simulated: [
      "All hosts, IPs except bracketed public IOCs, timestamps, log rows, secrets, and artifacts are synthetic teaching props.",
      "No exploit payload, destructive SQL, working credential, or outbound network action is present in this scenario.",
      "The scenario paraphrases public reporting from Sysdig, BleepingComputer, SecurityWeek, and The Register.",
    ],
  },
};
