import type { Scenario } from "../types";

export const ciTokenLeak: Scenario = {
  slug: "ci-token-leak",
  exhibit: "EXH-032",
  title: "The CI Token Leak",
  tagline:
    "A CI run printed a token because someone added `set -x` to debug a failing step. The log is public.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2024",
  estMinutes: 9,
  fictional: true,
  cwd: "/builds/forge",
  user: "auditor",
  host: "ci-archive",
  role: "Auditor walking the CI archive after a token rotation alert.",
  objective:
    "Find the line in the build log that exposed the token and identify the change that caused it.",
  briefing:
    "GitHub flagged a token as 'observed in a public location'. The token belongs to the forge org. Build logs for the forge/api repository are public for open-source contributors. Walk the most recent runs.",
  env: { USER: "auditor", SHELL: "/bin/sh", PWD: "/builds/forge" },
  ps: [
    "  PID TTY          TIME CMD",
    "  100 ?        00:00:00 sh",
    "  101 ?        00:00:00 ps",
  ],
  history: ["ls"],
  commands: {
    "python3 ir_toolkit.py enumerate --path evidence.txt": "simulated safe tool replay for ci-token-leak; replaces: ls runs\n",
    "tshark -r evidence.pcap -Y 'frame contains \"authtoken\"' --follow-log runs/build-1146.log": "simulated safe tool replay for ci-token-leak; replaces: grep -nF authToken runs/build-1146.log\n",
    "gh workflow view config/release.yml --yaml": "simulated safe tool replay for ci-token-leak; replaces: cat config/release.yml\n",
    "npm ping":
      '{"pong":true}\n(simulated: registry reachability check before you hunt the leaked token line)\n',
  },
  files: {
    "/builds/forge/runs/build-1144.log": {
      content:
        "+ npm ci\nadded 412 packages in 4s\n+ npm test\n  PASS  src/auth.test.ts\n  PASS  src/parse.test.ts\nTests: 2 passed\n",
    },
    "/builds/forge/runs/build-1145.log": {
      content:
        "+ npm ci\nadded 412 packages in 4s\n+ npm test\n  FAIL  src/parse.test.ts\n  ● parses query string\n    Expected: {a: '1'} Received: undefined\n",
    },
    "/builds/forge/runs/build-1146.log": {
      content: [
        "+ set -x",
        "+ NPM_TOKEN=npm_AbCdEf1234567890SimulatedToken",
        "+ echo //registry.npmjs.org/:_authToken=$NPM_TOKEN",
        "//registry.npmjs.org/:_authToken=npm_AbCdEf1234567890SimulatedToken",
        "+ npm publish --access=public",
        "+ npm notice publishing to https://registry.npmjs.org/",
      ].join("\n"),
    },
    "/builds/forge/config/release.yml": {
      content: [
        "name: release",
        "on:",
        "  push:",
        "    tags: ['v*']",
        "jobs:",
        "  publish:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - run: |",
        "          set -x   # added to debug auth, never removed",
        "          echo //registry.npmjs.org/:_authToken=$NPM_TOKEN > ~/.npmrc",
        "          npm publish --access=public",
        "        env:",
        "          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}",
      ].join("\n"),
    },
    "/builds/forge/public-poc/ci_secret_echo_antipatterns.sh": {
      content: [
        "#!/bin/sh",
        "# Anti-pattern: set -x + echo secret into log (public OSS Actions).",
        "",
        "# BAD: prints expanded token to stdout",
        "# set -x",
        "# echo \"//registry.npmjs.org/:_authToken=$NPM_TOKEN\" >> ~/.npmrc",
        "",
        "# BETTER: use env without xtrace; rely on NPM_CONFIG_* or actions/setup-node npm auth",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "npm-ping",
          goal: "Confirm npm registry reachability from the CI archive host (simulated).",
          hint: "`npm ping`.",
          matches: [{ kind: "exact", command: "npm ping" }],
          narration:
            "GitHub flagged a token as 'observed in a public location'. The token belongs to the forge org. Build logs for the forge/api repository are public for open-source contributors. Walk the most recent runs.",
        },
    {
          id: "list-runs",
          goal: "List the recent CI runs.",
          hint: "`python3 ir_toolkit.py enumerate --path evidence.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py enumerate --path evidence.txt" }],
          narration: "Three runs. The latest is the publish job.",
        },
    {
          id: "search-token",
          goal: "Search the latest run for anything that looks like a token.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"authtoken\"' --follow-log runs/build-1146.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"authtoken\"' --follow-log runs/build-1146.log" }],
          narration:
            "There it is, the token printed in plain text because the script ran with `set -x`.",
        },
    {
          id: "open-pipeline",
          goal: "Open the pipeline definition.",
          hint: "`gh workflow view config/release.yml --yaml`.",
          matches: [{ kind: "exact", command: "gh workflow view config/release.yml --yaml" }],
          narration:
            "Someone added `set -x` to debug the auth step and never removed it. Every run since then has echoed the token to a public log.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/ci_secret_echo_antipatterns.sh`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/ci_secret_echo_antipatterns.sh" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "A debug flag (`set -x`) on a publish step caused the secret-bearing line to be echoed to a publicly readable build log. The leak was the trace, not the script itself.",
    lesson:
      "Treat your CI log as a published artifact. Mask secrets in the runner (most CI providers will do this if the secret is referenced as `${{ secrets.X }}`, but only if the value never appears expanded in a shell trace). Remove `set -x` before committing. Add a job that scans completed logs for known secret shapes and fails the workflow if it finds them.",
    simulated: [
      "The npm token shown is invented and inert.",
      "All filenames, repos, and run numbers are fictional.",
    ],
  },
};
