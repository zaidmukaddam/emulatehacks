import type { Scenario } from "../types";

/**
 * Fictional: AI-assisted discovery of a zero-day in a web-based admin tool (Google threat research blog theme).
 */
export const aiAssistedAdminZeroDay: Scenario = {
  slug: "ai-assisted-zero-day-admin",
  exhibit: "EXH-047",
  title: "Crash, Then Converge",
  tagline:
    "June 4, 2026. A threat research team publishes a blog describing how operators used AI coding assistants to speed crash triage until a zero-day in a hosted admin appliance surfaced. You review synthetic telemetry like their exhibits.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/research/blog-followup",
  user: "responder",
  host: "analysis-station-01",
  role: "Blue teamer reading offensive research without running any payload.",
  objective:
    "Map the described chain: fuzz traffic, import crashes, crash clustering, appliance version gap, and the emergency disable action.",
  briefing:
    "The scenario channels anxiety about AI shortening exploit development timelines, but the terminal stays defensive. You inspect repeated crashes on an admin import endpoint, cluster the stack traces, identify the vulnerable build, and verify that import was disabled.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/research/blog-followup" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input fuzz/queue.txt": "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: cat fuzz/queue.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"researchbot\"' --follow-log /var/log/nginx/admin-appliance.access.log": "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: grep -nF ResearchBot /var/log/nginx/admin-appliance.access.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"import\"' --follow-log /var/log/nginx/admin-appliance.access.log": "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: grep -nF import /var/log/nginx/admin-appliance.access.log\n",
    "python3 ir_toolkit.py parse-artifact --input crashes/cluster.txt": "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: cat crashes/cluster.txt\n",
    "jq . appliance-release.json": "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: cat appliance-release.json\n",
    "tshark -r evidence.pcap --follow-log controls/import-disable.log": "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: cat controls/import-disable.log\n",
    "curl -sI https://admin-appliance.example/admin/import":
      [
        "HTTP/2 500",
        "server: tabletop-appliance",
        "x-import-route: enabled (simulated)",
      ].join("\n"),
  },
  files: {
    "/home/research/blog-followup/ir_toolkit.py": {
      content: [
        "#!/usr/bin/env python3",
        "\"\"\"Scenario helper for safe incident-response parsing.",
        "",
        "Supported modes in this exhibit:",
        "  parse-artifact --input PATH",
        "  extract-ioc --ioc VALUE --input PATH",
        "  table-summary --input PATH",
        "  csv-summary --input PATH",
        "  enumerate --path PATH",
        "  discover --kind KIND --root PATH",
        "  count-events --input PATH",
        "",
        "The museum shell intercepts exact commands from scenario.commands.",
        "No code runs and no network is touched.",
        "\"\"\"",
        "raise SystemExit('simulated helper: canned output only')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/research/blog-followup/fuzz/queue.txt": {
      content: [
        "case-018 /admin/import status=500 size=182 ua=curl/8.7",
        "case-019 /admin/import status=500 size=211 ua=ResearchBot/1.0",
        "case-020 /admin/import status=302 path=/admin/login ua=Mozilla/5.0",
      ].join("\n"),
    },
    "/var/log/nginx/admin-appliance.access.log": {
      content: [
        '192.0.2.88 - - [04/Jun/2026:02:01:01 +0000] "POST /admin/import HTTP/2.0" 500 182 "-" "curl/8.7"',
        '192.0.2.88 - - [04/Jun/2026:02:04:19 +0000] "POST /admin/import HTTP/2.0" 500 211 "-" "ResearchBot/1.0 (+https://example.internal/research)"',
        '192.0.2.88 - - [04/Jun/2026:02:10:02 +0000] "POST /admin/login HTTP/2.0" 302 0 "-" "Mozilla/5.0"',
      ].join("\n"),
    },
    "/home/research/blog-followup/appliance-release.json": {
      content: [
        "{",
        '  "product": "Contoso HyperAdmin Appliance",',
        '  "build": "9.3.1p2",',
        '  "notes": "vendor confirming OOB patch 9.3.1p4 for import deser issue June 5"',
        "}",
      ].join("\n"),
    },
    "/home/research/blog-followup/crashes/cluster.txt": {
      content: [
        "cluster=import-deser-500 count=17 first=2026-06-04T02:01Z last=2026-06-04T02:09Z",
        "top_frame=ImportBundleReader.parse",
        "second_frame=AdminConfigDeserializer.load",
        "auth_state=pre-auth",
      ].join("\n"),
    },
    "/home/research/blog-followup/controls/import-disable.log": {
      content: [
        "2026-06-04T02:24Z feature_flag admin.import.enabled=false",
        "2026-06-04T02:26Z acl admin-vhost source=10.42.0.0/16 only",
        "2026-06-04T02:31Z snapshot appliance disk=preserved",
      ].join("\n"),
    },
    "/home/research/blog-followup/public-poc/admin_import_fuzz_loop.py": {
      content: [
        "#!/usr/bin/env python3",
        "\"\"\"Museum sketch: directed fuzzing against a fragile admin import endpoint.\"\"\"",
        "",
        "import itertools",
        "",
        "def cases():",
        "    for n in range(64, 4096, 64):",
        "        yield b'IMPORT\\x00' + b'A' * n",
        "",
        "# for payload in cases():",
        "#     requests.post('https://admin-appliance.example/admin/import', data=payload, verify=False)",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-import",
          phase: "Recon",
          goal: "Send a HEAD to the admin import route (simulated 500).",
          hint: "`curl -sI https://admin-appliance.example/admin/import`.",
          matches: [
            {
              kind: "exact",
              command: "curl -sI https://admin-appliance.example/admin/import",
            },
          ],
          narration:
            "HEAD shows the import route still throws 500s while you line up log evidence.",
        },
    {
          id: "queue",
          phase: "Recon",
          goal: "Inspect the minimized fuzz queue hitting the admin import route.",
          hint: "`python3 ir_toolkit.py parse-artifact --input fuzz/queue.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input fuzz/queue.txt" }],
          narration:
            "The attacker iterates on crashes. AI may speed the loop, but the first defender signal is still repeated 500s.",
        },
    {
          id: "ua",
          phase: "Initial access",
          goal: "Grep access logs for automated research traffic hitting the fragile endpoint.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"researchbot\"' --follow-log /var/log/nginx/admin-appliance.access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"researchbot\"' --follow-log /var/log/nginx/admin-appliance.access.log" }],
          narration:
            "That User-Agent is a storytelling device: ops-scale fuzzing often announces itself softly in logs.",
        },
    {
          id: "import",
          phase: "Execution",
          goal: "Isolate lines where /admin/import returns 500.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"import\"' --follow-log /var/log/nginx/admin-appliance.access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"import\"' --follow-log /var/log/nginx/admin-appliance.access.log" }],
          narration:
            "The import endpoint is the execution surface in this reconstruction. Repeated 500s are the smoke.",
        },
    {
          id: "cluster",
          phase: "Detection",
          goal: "Read the crash cluster showing a pre-auth deserialization path.",
          hint: "`python3 ir_toolkit.py parse-artifact --input crashes/cluster.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input crashes/cluster.txt" }],
          narration:
            "Crash clustering turns noisy requests into a bug-shaped story: same parser, same endpoint, pre-auth.",
        },
    {
          id: "release",
          phase: "Impact",
          goal: "Read appliance build metadata tying exposure to a known patch gap.",
          hint: "`jq . appliance-release.json`.",
          matches: [{ kind: "exact", command: "jq . appliance-release.json" }],
          narration:
            "Impact language becomes simple once inventory shows you lag the OOB drop.",
        },
    {
          id: "disable",
          phase: "Containment",
          goal: "Verify the import feature was disabled and admin vhost restricted.",
          hint: "`tshark -r evidence.pcap --follow-log controls/import-disable.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log controls/import-disable.log" }],
          narration:
            "The fix is immediate exposure reduction: turn off import, restrict admin, preserve disk, then wait for the vendor build.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/admin_import_fuzz_loop.py`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/admin_import_fuzz_loop.py" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "This exhibit is a fictional echo of 2026 security blog discourse on AI assistants helping attackers iterate from crashes toward working exploits faster. It does not quote or reproduce a specific Google publication; it encodes the defensive story: admin appliances, noisy logs, inventory discipline, and sober communication.",
    lesson:
      "Invest in appliance SBOMs, admin network zoning, and crash analytics that assume intelligent opposition. AI changes timelines, not your need for basics.",
    simulated: [
      "CVE-2026-5555, Contoso HyperAdmin, logs, and blog claims are invented.",
      "No model prompts, payloads, or deserialization tricks appear in files.",
    ],
  },
};
