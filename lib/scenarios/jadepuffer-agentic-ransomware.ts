import type { Scenario } from "../types";

/**
 * JadePuffer, July 2026 public reporting. Sysdig documented an agentic
 * ransomware operation against Langflow, MinIO, MySQL, and Nacos. This exhibit
 * is defensive and uses only static, synthetic artifacts plus public facts.
 */
export const jadepufferAgenticRansomware: Scenario = {
  slug: "jadepuffer-agentic-ransomware",
  exhibit: "EXH-048",
  title: "31 Second Fix",
  tagline:
    "6 July 2026. Fresh reporting points back to Sysdig's JadePuffer case: an LLM-driven ransomware chain that exploited Langflow, adapted to errors, and destroyed Nacos configuration data.",
  category: "modern-cloud",
  difficulty: "advanced",
  era: "2020s",
  year: "2026",
  estMinutes: 11,
  fictional: true,
  cwd: "/home/soc/jadepuffer-lab",
  user: "responder",
  host: "ata-review-01",
  role: "Cloud incident responder turning public JadePuffer reporting into safe tabletop evidence.",
  objective:
    "Trace the reported agentic ransomware chain from Langflow RCE to secret discovery, MinIO default credentials, cron persistence, Nacos takeover, and database-extortion impact.",
  briefing:
    "Digital Trends carried a July 6 report on JadePuffer inside this automation's 24-hour window, citing Sysdig's July research. Your lab artifacts are synthetic defender notes that preserve the public sequence: CVE-2025-3248 on Langflow, self-correcting reconnaissance, MinIO default credentials, a 30-minute cron beacon, Nacos admin creation, and 1,342 encrypted configuration records.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/soc/jadepuffer-lab",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "hint"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/sources.txt":
      "simulated safe tool replay for jadepuffer-agentic-ransomware; replaces: cat intel/sources.txt\n",
    "curl -sI https://langflow.example/api/v1/validate/code": [
      "HTTP/2 403",
      "server: museum-langflow",
      "x-control: validation endpoint blocked at edge",
      "",
    ].join("\n"),
    "tshark -r evidence.pcap --follow-log logs/langflow-rce.log":
      "simulated safe tool replay for jadepuffer-agentic-ransomware; replaces: cat logs/langflow-rce.log\n",
    "python3 ir_toolkit.py extract-ioc --ioc minioadmin --input artifacts/minio-enum.txt":
      "simulated safe tool replay for jadepuffer-agentic-ransomware; replaces: grep -nF minioadmin artifacts/minio-enum.txt\n",
    "python3 persistence_audit.py --crontab persistence/langflow.cron":
      "simulated safe tool replay for jadepuffer-agentic-ransomware; replaces: cat persistence/langflow.cron\n",
    "python3 ir_toolkit.py parse-artifact --input artifacts/nacos-takeover.txt":
      "simulated safe tool replay for jadepuffer-agentic-ransomware; replaces: cat artifacts/nacos-takeover.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc README_RANSOM --input artifacts/nacos-impact.sql":
      "simulated safe tool replay for jadepuffer-agentic-ransomware; replaces: grep -nF README_RANSOM artifacts/nacos-impact.sql\n",
    "jq . containment/hardening.json":
      "simulated safe tool replay for jadepuffer-agentic-ransomware; replaces: cat containment/hardening.json\n",
  },
  files: {
    "/home/soc/jadepuffer-lab/intel/sources.txt": {
      content: [
        "JadePuffer public-source note",
        "",
        "Current-window hook:",
        "- Digital Trends published a July 6, 2026 report summarizing Sysdig's JadePuffer findings.",
        "",
        "Primary research:",
        "- Sysdig Threat Research Team, JADEPUFFER: Agentic ransomware for automated database extortion, July 1, 2026.",
        "- BleepingComputer and The Register covered the same Sysdig findings in early July 2026.",
        "",
        "Facts modeled in this exhibit:",
        "- Initial access: Langflow CVE-2025-3248 unauthenticated Python execution.",
        "- Discovery: host inventory, provider API keys, cloud credentials, database credentials, and MinIO buckets.",
        "- Adaptation: an XML response caused a parser change and retry, not a dead end.",
        "- Persistence: cron beacon every 30 minutes to attacker infrastructure.",
        "- Target: exposed MySQL and Alibaba Nacos service.",
        "- Impact: 1,342 Nacos configuration items encrypted, originals dropped, README_RANSOM created.",
      ].join("\n"),
    },
    "/home/soc/jadepuffer-lab/logs/langflow-rce.log": {
      content: [
        "2026-07-01T09:14:22Z edge POST /api/v1/validate/code src=45.131.66[.]106 result=python-exec cve=CVE-2025-3248",
        "2026-07-01T09:14:25Z host enum cmd=id,uname,hostname,ip addr,ps aux actor=ATA note=self-narrating-comments",
        "2026-07-01T09:14:31Z secrets scan categories=OPENAI,ANTHROPIC,DEEPSEEK,GEMINI,AWS,GCP,AZURE,ALIBABA,TENCENT,HUAWEI",
        "2026-07-01T09:15:02Z langflow postgres export staged=/tmp/lf_dump.txt action=review-delete",
        "2026-07-01T09:16:44Z lateral discovery probes=db,object-store,secret-store,service-discovery",
      ].join("\n"),
    },
    "/home/soc/jadepuffer-lab/artifacts/minio-enum.txt": {
      content: [
        "MinIO enumeration transcript summary",
        "",
        "09:17:10Z health check: http://127.0.0.1:9000 responsive",
        "09:17:12Z auth attempted: minioadmin:minioadmin",
        "09:17:13Z first parser expected JSON and received XML",
        "09:17:16Z retry selected S3 XML namespace parser",
        "09:17:17Z buckets listed: app-data, backups, ml-artifacts, terraform-state, internal-config",
        "09:17:21Z object priority: terraform-state and internal-config credentials.json",
        "09:17:24Z credential file staged locally then deleted after review",
        "",
        "Defender read: default object-store credentials are the hinge, not a novel exploit.",
      ].join("\n"),
    },
    "/home/soc/jadepuffer-lab/persistence/langflow.cron": {
      content: [
        "# Synthetic crontab excerpt based on Sysdig reporting.",
        "# Address is defanged and the command is inert text in this exhibit.",
        "*/30 * * * * python3 -c \"beacon('hxxp://45.131.66[.]106:4444/beacon', timeout=5)\"",
      ].join("\n"),
    },
    "/home/soc/jadepuffer-lab/artifacts/nacos-takeover.txt": {
      content: [
        "Nacos takeover summary, synthetic transcript",
        "",
        "production target: mysql + Alibaba Nacos exposed to internet",
        "root database login: observed, origin unknown in public reporting",
        "vectors in parallel:",
        "- CVE-2021-29441 auth-bypass family",
        "- default token.secret.key enabled JWT forgery",
        "- direct Nacos backing database writes with root MySQL access",
        "",
        "09:24:11Z create admin user xadmin with generated bcrypt hash",
        "09:24:38Z login verification failed",
        "09:25:09Z corrective payload recreated account with simpler credential",
        "delta: 31 seconds from failed login to corrected payload",
        "",
        "Defender read: the noteworthy behavior is plan, act, observe, adjust at machine speed.",
      ].join("\n"),
    },
    "/home/soc/jadepuffer-lab/artifacts/nacos-impact.sql": {
      content: [
        "-- Synthetic SQL-shaped impact ledger. Not executable in the museum shell.",
        "-- Public fact modeled: 1,342 Nacos config items encrypted with MySQL AES_ENCRYPT().",
        "table=config_info rows_before=1342 rows_after=0 action=dropped_after_encrypt",
        "table=config_info_beta rows_before=184 rows_after=0 action=dropped_after_encrypt",
        "table=his_config_info rows_before=9287 rows_after=0 action=dropped_after_encrypt",
        "table=README_RANSOM rows_before=0 rows_after=1 action=created_extortion_note",
        "claim=aes-256 observed-likely=aes-128-ecb key-handling=random-key-not-stored",
        "",
        "Defender read: this is destructive extortion. Public reporting says payment would not restore data if the key was never saved.",
      ].join("\n"),
    },
    "/home/soc/jadepuffer-lab/containment/hardening.json": {
      content: [
        "{",
        '  "langflow": [',
        '    "patch CVE-2025-3248",',
        '    "remove validation/code endpoints from internet exposure",',
        '    "separate AI orchestration servers from provider API keys and cloud credentials"',
        "  ],",
        '  "minio": [',
        '    "disable default minioadmin credentials",',
        '    "inventory buckets containing terraform state and internal config",',
        '    "rotate exposed object-store access keys"',
        "  ],",
        '  "nacos": [',
        '    "never expose Nacos directly to the internet",',
        '    "replace default token.secret.key",',
        '    "deny root database access from application services",',
        '    "restore configuration tables from offline backups"',
        "  ]",
        "}",
      ].join("\n"),
    },
    "/home/soc/jadepuffer-lab/public-poc/jadepuffer_defender_notes.txt": {
      content: [
        "JadePuffer defender notes, museum safe",
        "",
        "No exploit payloads are included. The useful defender exercise is correlation:",
        "1. Internet-facing Langflow validation endpoint touched by CVE-2025-3248 traffic.",
        "2. Host and secret enumeration immediately follows.",
        "3. MinIO default credentials turn object storage into lateral discovery.",
        "4. Cron beacon appears every 30 minutes.",
        "5. Nacos default signing key and exposed MySQL increase blast radius.",
        "6. README_RANSOM plus dropped config tables means backup restore, not ransom negotiation, is the recovery path.",
        "",
        "Detection ideas:",
        "- Alert on Langflow validation endpoints at the perimeter.",
        "- Flag source code payloads with verbose natural-language reasoning in post-exploitation paths.",
        "- Hunt for minioadmin:minioadmin use outside approved build labs.",
        "- Treat Nacos admin creation plus table-drop activity as a critical outage event.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "sources",
      phase: "Recon",
      goal: "Read the source note tying the current report to Sysdig's public JadePuffer research.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/sources.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input intel/sources.txt",
        },
      ],
      narration:
        "The July 6 hook is current reporting; the technical spine is Sysdig's July JadePuffer research.",
    },
    {
      id: "edge-block",
      phase: "Recon",
      goal: "Confirm the Langflow validation endpoint is now blocked at the edge in the tabletop lab.",
      hint: "`curl -sI https://langflow.example/api/v1/validate/code`.",
      matches: [
        {
          kind: "exact",
          command: "curl -sI https://langflow.example/api/v1/validate/code",
        },
      ],
      narration:
        "Blocking the endpoint is the control state. The next artifact shows why that path cannot be public.",
    },
    {
      id: "langflow-rce",
      phase: "Initial access",
      goal: "Review the synthetic Langflow RCE log for CVE-2025-3248 activity and secret discovery.",
      hint: "`tshark -r evidence.pcap --follow-log logs/langflow-rce.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap --follow-log logs/langflow-rce.log",
        },
      ],
      narration:
        "The chain starts with a known missing-auth bug in a quickly deployed AI workflow server that also holds secrets.",
    },
    {
      id: "minio-default",
      phase: "Discovery",
      goal: "Find the default MinIO credential that let the agent enumerate buckets.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc minioadmin --input artifacts/minio-enum.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py extract-ioc --ioc minioadmin --input artifacts/minio-enum.txt",
        },
      ],
      narration:
        "The agent did not need exotic object-store tradecraft. It adapted its parser and used the default login.",
    },
    {
      id: "cron",
      phase: "Persistence",
      goal: "Audit the staged crontab for the 30-minute beacon pattern reported by Sysdig.",
      hint: "`python3 persistence_audit.py --crontab persistence/langflow.cron`.",
      matches: [
        {
          kind: "exact",
          command: "python3 persistence_audit.py --crontab persistence/langflow.cron",
        },
      ],
      narration:
        "Persistence was a simple cron heartbeat. Simplicity matters when automation is chaining the rest.",
    },
    {
      id: "nacos",
      phase: "Privilege escalation",
      goal: "Open the Nacos takeover summary and identify the 31-second self-correction.",
      hint: "`python3 ir_toolkit.py parse-artifact --input artifacts/nacos-takeover.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input artifacts/nacos-takeover.txt",
        },
      ],
      narration:
        "This is the agentic tell defenders care about: failed login, observed error, corrected payload, no human pause.",
    },
    {
      id: "impact",
      phase: "Impact",
      goal: "Show the README_RANSOM marker in the synthetic Nacos impact ledger.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc README_RANSOM --input artifacts/nacos-impact.sql`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py extract-ioc --ioc README_RANSOM --input artifacts/nacos-impact.sql",
        },
      ],
      narration:
        "Impact is data destruction, not just encryption. If the key was never stored, ransom payment cannot become recovery.",
    },
    {
      id: "hardening",
      phase: "Containment",
      goal: "Review the hardening checklist for Langflow, MinIO, and Nacos.",
      hint: "`jq . containment/hardening.json`.",
      matches: [{ kind: "exact", command: "jq . containment/hardening.json" }],
      narration:
        "Patch the entry point, remove default credentials, de-internet Nacos, rotate keys, and restore from clean backups.",
    },
    {
      id: "defender-notes",
      phase: "Lessons",
      goal: "Read the safe museum notes that summarize detection ideas without exploit payloads.",
      hint: "`head -n 80 public-poc/jadepuffer_defender_notes.txt`.",
      matches: [
        {
          kind: "exact",
          command: "head -n 80 public-poc/jadepuffer_defender_notes.txt",
        },
      ],
      narration:
        "The important lesson is not that AI invented new primitives. It connected neglected primitives faster and kept adjusting.",
    },
  ],
  debrief: {
    summary:
      "JadePuffer was described by Sysdig TRT as the first documented agentic ransomware operation: an LLM-driven chain that exploited Langflow CVE-2025-3248, enumerated host and cloud secrets, adapted MinIO parsing after an XML response, planted a cron beacon, pivoted toward exposed MySQL and Alibaba Nacos, abused Nacos weaknesses including CVE-2021-29441 and default signing-key assumptions, then encrypted 1,342 Nacos configuration items before dropping originals and creating README_RANSOM. Digital Trends published a July 6, 2026 article summarizing those findings inside this automation's last-24-hour window; primary details are from Sysdig's July 1 research, with additional coverage by BleepingComputer and The Register.",
    lesson:
      "Agentic attacks make old hygiene failures compound quickly. Keep AI workflow servers off the public internet when they host code-execution paths, remove default credentials from object stores, isolate provider and cloud secrets, harden Nacos signing keys and database privileges, and treat self-correcting payload behavior as a detection signal.",
    simulated: [
      "All hosts, logs, bucket names, SQL rows, and file paths are synthetic teaching artifacts.",
      "CVE identifiers, affected products, 31-second correction, 30-minute cron beacon, MinIO default-credential theme, and 1,342 Nacos configuration item impact reflect public reporting at a high level.",
      "No exploit payloads, real credentials, or live network operations are present in this exhibit.",
    ],
  },
};
