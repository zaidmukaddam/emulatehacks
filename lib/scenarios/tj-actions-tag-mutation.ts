import type { Scenario } from "../types";

export const tjActionsTagMutation: Scenario = {
  slug: "tj-actions-tag-drift",
  exhibit: "EXH-033",
  title: "The Tag That Moved",
  tagline:
    "March 14, 2025. A widely-used GitHub Action is overnight rewritten so every tag, v1, v44, v45, points at one malicious commit. Every workflow that pinned by tag now exfiltrates its secrets to the build log.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2025",
  estMinutes: 10,
  fictional: true,
  cwd: "/var/log/forge-ci",
  user: "auditor",
  host: "ci-archive",
  role: "You're the security engineer auditing your org's CI runs after StepSecurity's writeup goes public. You have a few thousand workflow files to think about and one specific question to answer first.",
  objective:
    "Find every workflow in your org that uses tj-actions/changed-files by tag, and prove from the public build logs whether any of them ran with the malicious commit.",
  briefing:
    "tj-actions/changed-files (CVE-2025-30066) was compromised on March 14, 2025. The attackers got a write-capable token, force-updated every release tag, v1 through v45, to point at a single commit they had pushed. That commit dumped the runner's process memory and base64-encoded any secrets it found into the build log. If a downstream attacker had read access to a public repo's Actions logs, they could pull credentials out of any project that pinned by tag instead of by commit SHA. Initial vector was an even earlier compromise of reviewdog/action-setup the week before. You have the archive of your CI logs from the week of the 14th. Walk it.",
  env: {
    USER: "auditor",
    SHELL: "/bin/sh",
    PWD: "/var/log/forge-ci",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  101 ?        00:00:00 sh",
    "  102 ?        00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 advisory_triage.py --input ADVISORY.md": "simulated safe tool replay for tj-actions-tag-drift; replaces: cat ADVISORY.md\n",
    "python3 ir_toolkit.py extract-ioc --ioc tj-actions --input evidence.txt": "simulated safe tool replay for tj-actions-tag-drift; replaces: grep -nF tj-actions workflows/*.yml\n",
    "gh workflow view workflows/lint.yml --yaml": "simulated safe tool replay for tj-actions-tag-drift; replaces: cat workflows/lint.yml\n",
    "python3 ir_toolkit.py extract-ioc --ioc lint --input evidence.txt": "simulated safe tool replay for tj-actions-tag-drift; replaces: grep -nF lint runs/*.log\n",
    "tshark -r evidence.pcap --follow-log runs/build-2237.log": "simulated safe tool replay for tj-actions-tag-drift; replaces: cat runs/build-2237.log\n",
    "tshark -r evidence.pcap --follow-log runs/build-2241.log": "simulated safe tool replay for tj-actions-tag-drift; replaces: cat runs/build-2241.log\n",
    "curl -s https://api.github.com/repos/tj-actions/changed-files/git/refs/tags/v44":
      '{"ref":"refs/tags/v44","node_id":"stub","url":"https://api.github.com/repos/tj-actions/changed-files/git/refs/tags/v44","object":{"sha":"0e58ed867288cfb8930e7c9b45b1c2a3d4e5f6a7","type":"commit"}}\n(simulated: tag moved post-compromise in public write-ups)\n',
  },
  files: {
    "/var/log/forge-ci/ADVISORY.md": {
      content: [
        "CVE-2025-30066, tj-actions/changed-files supply-chain compromise",
        "",
        "Disclosed:    March 14, 2025 (StepSecurity, Wiz, CISA AA25-078A)",
        "Initial vector: compromise of reviewdog/action-setup@v1 (CVE-2025-30154)",
        "                on March 11, used to leak a maintainer PAT",
        "Window:       all tags v1..v45 mutated to point at the malicious commit",
        "              (one commit SHA, prepended to the project's history)",
        "Payload:      dumps the runner's /proc/<pid>/maps and memory of the",
        "              Runner.Worker process; base64-encodes secrets to stdout.",
        "Reach:        any workflow that referenced tj-actions/changed-files@<tag>",
        "              and ran during the window. Pinning to a commit SHA was safe.",
        "",
        "Your job here is two questions, in order:",
        "  (1) which of your workflows referenced the action by tag?",
        "  (2) for each one, did any run land inside the window?",
      ].join("\n"),
    },
    "/var/log/forge-ci/workflows/release.yml": {
      content: [
        "name: release",
        "on:",
        "  push:",
        "    tags: ['v*']",
        "jobs:",
        "  publish:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683",
        "      # tj-actions, pinned by commit SHA, safe by construction",
        "      - uses: tj-actions/changed-files@40dca42ed8a0d02a35f1e0d8e3a8f1a8d8b9c0a1",
        "      - run: echo \"${{ steps.changed.outputs.all_changed_files }}\"",
      ].join("\n"),
    },
    "/var/log/forge-ci/workflows/lint.yml": {
      content: [
        "name: lint",
        "on: [pull_request]",
        "jobs:",
        "  lint:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      # tj-actions, pinned by floating tag, exposed",
        "      - uses: tj-actions/changed-files@v44",
        "      - run: ./bin/lint-changed.sh ${{ steps.changed.outputs.all }}",
      ].join("\n"),
    },
    "/var/log/forge-ci/workflows/notify.yml": {
      content: [
        "name: notify",
        "on: [pull_request]",
        "jobs:",
        "  notify:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: slackapi/slack-github-action@v1.26.0",
        "        env:",
        "          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}",
      ].join("\n"),
    },
    "/var/log/forge-ci/runs/build-2233.log": {
      content: [
        "2025-03-13T18:11:02Z run.id=2233 workflow=lint repo=forge/api branch=pr-441",
        "==> Run tj-actions/changed-files@v44",
        "    Resolved tj-actions/changed-files@v44 -> 40dca42ed8a0d02a35f1e0d8e3a8f1a8d8b9c0a1",
        "    Found 12 changed files",
        "==> ./bin/lint-changed.sh",
        "    no issues",
        "Job succeeded.",
      ].join("\n"),
    },
    "/var/log/forge-ci/runs/build-2237.log": {
      content: [
        "2025-03-14T22:48:11Z run.id=2237 workflow=lint repo=forge/api branch=pr-444",
        "==> Run tj-actions/changed-files@v44",
        "    Resolved tj-actions/changed-files@v44 -> 0e58ed867288cfb8930e7c9b45b1c2a3d4e5f6a7",
        "    Found 4 changed files",
        "==> echo \"$RUNNER_DEBUG=1; double-base64 dump follows\"",
        "    Q1JFRF9EVU1QX01BUktFUjogYmFzZTY0KGJhc2U2NChzZWNyZXRzKSk= (truncated)",
        "    [REDACTED-IN-SIMULATION ~ 14kB of base64 omitted]",
        "==> ./bin/lint-changed.sh",
        "Job succeeded.",
      ].join("\n"),
    },
    "/var/log/forge-ci/runs/build-2241.log": {
      content: [
        "2025-03-15T09:02:18Z run.id=2241 workflow=release repo=forge/api tag=v2.4.0",
        "==> Run tj-actions/changed-files@40dca42ed8a0d02a35f1e0d8e3a8f1a8d8b9c0a1",
        "    Resolved tj-actions/changed-files@40dca42ed8a0d02a35f1e0d8e3a8f1a8d8b9c0a1 -> 40dca42ed8a0d02a35f1e0d8e3a8f1a8d8b9c0a1",
        "    Found 1 changed file",
        "==> publish",
        "    npm publish ok",
        "Job succeeded.",
      ].join("\n"),
    },
    "/var/log/forge-ci/public-poc/gha_commit_pin_vs_tag.yml": {
      content: [
        "# Pin third-party Actions by immutable commit SHA, not movable tags.",
        "",
        "# Vulnerable:",
        "#   uses: tj-actions/changed-files@v44",
        "",
        "# Safer:",
        "#   uses: tj-actions/changed-files@40dca42ed8a0d02a35f1e0d8e3a8f1a8d8b9c0a1",
        "",
        "# CVE-2025-30066 class: attacker retargeted every v* tag → one malicious commit.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-tag",
          goal: "Resolve the floating v44 tag via the GitHub refs API (simulated JSON).",
          hint: "`curl -s https://api.github.com/repos/tj-actions/changed-files/git/refs/tags/v44`.",
          matches: [
            {
              kind: "exact",
              command:
                "curl -s https://api.github.com/repos/tj-actions/changed-files/git/refs/tags/v44",
            },
          ],
          narration:
            "Two questions, in order: which workflows reference the action by tag, and which of them ran during the window.",
        },
    {
          id: "advisory",
          goal: "Read the advisory note for context.",
          hint: "`python3 advisory_triage.py --input ADVISORY.md`.",
          matches: [{ kind: "exact", command: "python3 advisory_triage.py --input ADVISORY.md" }],
          narration:
            "Advisory text explains tag mutation, memory dump payload, and why commit SHAs are the fix.",
        },
    {
          id: "find-uses",
          goal: "Search every workflow file for `tj-actions/changed-files`.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc tj-actions --input evidence.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc tj-actions --input evidence.txt" }],
          narration:
            "Two workflows reference the action. release.yml pins by a 40-char commit SHA. lint.yml pins by `@v44`. lint.yml is the one that's exposed.",
        },
    {
          id: "open-lint",
          goal: "Open the exposed workflow file in full.",
          hint: "`gh workflow view workflows/lint.yml --yaml`.",
          matches: [{ kind: "exact", command: "gh workflow view workflows/lint.yml --yaml" }],
          narration:
            "Confirmed: `tj-actions/changed-files@v44`. Every PR run from that workflow during the window pulled the malicious commit.",
        },
    {
          id: "search-window",
          goal:
            "Find every run of the lint workflow during the compromise window. Try `grep -nF lint runs/*.log`.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc lint --input evidence.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc lint --input evidence.txt" }],
          narration:
            "Two lint runs surface, build-2233 (March 13, before the compromise) and build-2237 (March 14, during it).",
        },
    {
          id: "open-bad",
          goal: "Open the suspect run.",
          hint: "`tshark -r evidence.pcap --follow-log runs/build-2237.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log runs/build-2237.log" }],
          narration:
            "Different commit SHA. Different output: the action printed a base64 blob into the log labelled CRED_DUMP_MARKER. That's the canary StepSecurity called out, double-base64 of the runner's secret memory. Treat any GitHub-issued token, npm token, AWS keys, or signing keys reachable from this workflow as compromised. Rotate. Then open every public log in the repo's Actions tab from this run forward and scrub.",
        },
    {
          id: "compare-good",
          goal:
            "Confirm the safe pattern by reading the release workflow's run from the day after.",
          hint: "`tshark -r evidence.pcap --follow-log runs/build-2241.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log runs/build-2241.log" }],
          narration:
            "release.yml pinned by full commit SHA, so the resolution step is a tautology, same SHA in, same SHA out, and the malicious commit never reaches the runner. This is the structural fix.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/gha_commit_pin_vs_tag.yml`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/gha_commit_pin_vs_tag.yml" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "CVE-2025-30066, the tj-actions/changed-files supply-chain compromise, was a March 2025 attack against the GitHub Actions ecosystem. Attackers, having earlier compromised reviewdog/action-setup@v1 (CVE-2025-30154) and stolen a maintainer's PAT, force-updated every release tag of the popular tj-actions/changed-files action to point at a single malicious commit. The injected payload dumped the runner's worker process memory and base64-encoded discovered secrets into the build log, which made every public repository's Actions logs an exfiltration channel. Disclosed by StepSecurity (Adnan Khan) and Wiz; CISA followed with AA25-078A.",
    lesson:
      "One discipline matters more than any other here: pin by commit SHA, not by tag. Tags are mutable. A tag is a label on a commit; whoever can push to the repo can move the label. A commit SHA is a content hash; the only way to point an SHA at malicious code is to find a SHA collision in SHA-1, which nobody is doing on Tuesday morning. GitHub's own security guide has called this out for years; almost nobody followed it. After this incident, do three things: (1) replace every `@v*` reference in your workflows with the resolved 40-char SHA; (2) add a CI check that fails any PR whose workflow file introduces a tag-pinned action; (3) treat your build logs as a publish surface and scan them for known secret shapes before they're written, not after.",
    simulated: [
      "Run IDs, branch names, and the inline base64 token blob are invented.",
      "The malicious commit SHA in build-2237 is a placeholder; the real one was published in StepSecurity's IoCs and is intentionally not reproduced here.",
      "The CVE numbers, the chain through reviewdog/action-setup, the tag-mutation technique, the disclosure date (March 14, 2025), and the safe-by-construction commit-SHA pinning are real.",
    ],
  },
};
