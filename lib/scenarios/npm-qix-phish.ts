import type { Scenario } from "../types";

export const npmQixPhish: Scenario = {
  slug: "npm-qix-phish",
  exhibit: "EXH-034",
  title: "Two and a Half Hours",
  tagline:
    "September 8, 2025. A single phishing email gives an attacker the npm account for `chalk`, `debug`, and sixteen other packages with 2.6 billion combined weekly downloads. The malicious versions sit live for two and a half hours.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2025",
  estMinutes: 11,
  fictional: true,
  cwd: "/srv/forge-app",
  user: "responder",
  host: "build-runner-04",
  role: "On-call engineer for a Node app that builds in CI several times a day. Your manager forwards an internal alert before you open Hacker News.",
  objective:
    "Trace the phishing-driven npm supply-chain incident from the internal alert to contaminated lockfile lines, prove which CI runs pulled the poison during the live window, then read the remediation note your security team drafted.",
  briefing:
    "September 8, 2025. An operations channel posts that npm yanked malicious versions of chalk, debug, and sixteen other packages after maintainer qix was phished. The published payload targeted browser wallets. Your builds still run `npm ci` hourly. You need the full chain: alert, dependency pins, lockfile proof, CI windowing, then cleanup guidance, not a dry reading of semver ranges.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/srv/forge-app",
    NODE_ENV: "production",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  101 ?        00:00:01 systemd",
    "  240 ?        00:00:03 nginx",
    "  301 ?        00:01:42 node server.js",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 advisory_triage.py --input ALERT.md": "simulated safe tool replay for npm-qix-phish; replaces: cat ALERT.md\n",
    "jq . package.json": "simulated safe tool replay for npm-qix-phish; replaces: cat package.json\n",
    "npm audit signatures --json --package chalk": "simulated safe tool replay for npm-qix-phish; replaces: grep -nF chalk package-lock.json\n",
    "npm audit signatures --json --package debug": "simulated safe tool replay for npm-qix-phish; replaces: grep -nF debug package-lock.json\n",
    "tshark -r evidence.pcap --follow-log ci-history.log": "simulated safe tool replay for npm-qix-phish; replaces: cat ci-history.log\n",
    "python3 advisory_triage.py --input ADVISORY.md": "simulated safe tool replay for npm-qix-phish; replaces: cat ADVISORY.md\n",
    "python3 advisory_triage.py --summary REMEDIATION.md": "simulated safe tool replay for npm-qix-phish; replaces: head -20 REMEDIATION.md\n",
    "npm view chalk@5.6.1 version":
      "5.6.1\n(simulated: confirms the poison semver was servable from the registry during IR)\n",
  },
  files: {
    "/srv/forge-app/ALERT.md": {
      content: [
        "Forge security alert, Sep 8 2025 15:05 UTC",
        "",
        "Subject: npm maintainer phishing → malicious publishes on chalk, debug, ansi-styles, …",
        "Window: malicious versions reportedly live ~13:16-15:45 UTC (npm pulled them after).",
        "",
        "Action for app teams:",
        "  - Inspect lockfiles for the bad semver-exact versions in the mirrored advisory.",
        "  - Any CI `npm ci` inside the window must be treated as producing tainted artifacts.",
        "  - Browser bundles: invalidate CDN if a build overlapped the window.",
      ].join("\n"),
    },
    "/srv/forge-app/ADVISORY.md": {
      content: [
        "Sept 8 2025, npm supply-chain compromise (qix maintainer)",
        "",
        "Vector:    phishing email impersonating npm support to Josh Junon (qix).",
        "           Attackers pushed one bad version of each of 18 packages.",
        "Window:    ~2.5 hours, roughly 13:16-15:45 UTC.",
        "Payload:   browser-side; intercepts wallet RPC calls (window.ethereum,",
        "           solana.signAndSendTransaction, ...) and rewrites the",
        "           destination address before the user confirms.",
        "",
        "Bad versions (full list, abridged here for the relevant ones):",
        "  chalk@5.6.1               (good: 5.5.0, 5.6.0)",
        "  debug@4.4.2               (good: 4.4.1)",
        "  ansi-styles@6.2.2         (good: 6.2.1)",
        "  strip-ansi@7.1.1          (good: 7.1.0)",
        "  supports-color@10.2.1     (good: 10.2.0)",
        "  color-convert@3.1.1       (good: 3.1.0)",
        "  is-arrayish@0.3.3         (good: 0.3.2)",
        "",
        "Two questions for you:",
        "  (1) does your lockfile pin any of the bad versions above?",
        "  (2) did `npm ci` run during the window?",
      ].join("\n"),
    },
    "/srv/forge-app/package.json": {
      content: [
        "{",
        '  "name": "forge-app",',
        '  "version": "2.4.1",',
        '  "private": true,',
        '  "scripts": {',
        '    "build": "vite build",',
        '    "start": "node server.js"',
        "  },",
        '  "dependencies": {',
        '    "chalk": "^5.6.0",',
        '    "debug": "^4.4.0",',
        '    "express": "^4.21.0",',
        '    "vite": "^5.4.0"',
        "  }",
        "}",
      ].join("\n"),
    },
    "/srv/forge-app/package-lock.json": {
      content: [
        "{",
        '  "name": "forge-app",',
        '  "version": "2.4.1",',
        '  "lockfileVersion": 3,',
        '  "packages": {',
        '    "node_modules/ansi-styles": {',
        '      "version": "6.2.1",',
        '      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-6.2.1.tgz"',
        "    },",
        '    "node_modules/chalk": {',
        '      "version": "5.6.1",',
        '      "resolved": "https://registry.npmjs.org/chalk/-/chalk-5.6.1.tgz"',
        "    },",
        '    "node_modules/debug": {',
        '      "version": "4.4.2",',
        '      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.2.tgz"',
        "    },",
        '    "node_modules/strip-ansi": {',
        '      "version": "7.1.0",',
        '      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.1.0.tgz"',
        "    },",
        '    "node_modules/supports-color": {',
        '      "version": "10.2.0",',
        '      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-10.2.0.tgz"',
        "    }",
        "  }",
        "}",
      ].join("\n"),
    },
    "/srv/forge-app/ci-history.log": {
      content: [
        "2025-09-08T09:11:02Z run.id=8881 trigger=push      branch=main             npm ci ok (87s)",
        "2025-09-08T11:42:33Z run.id=8882 trigger=push      branch=feat/perm-grid    npm ci ok (84s)",
        "2025-09-08T13:25:14Z run.id=8884 trigger=pr        branch=fix/typo          npm ci ok (88s)",
        "2025-09-08T14:08:51Z run.id=8885 trigger=schedule  branch=main             npm ci ok (91s)",
        "2025-09-08T14:51:02Z run.id=8886 trigger=push      branch=main             npm ci ok (86s)",
        "2025-09-08T16:14:09Z run.id=8887 trigger=push      branch=main             npm ci ok (85s)",
        "2025-09-08T18:33:18Z run.id=8888 trigger=push      branch=main             npm ci ok (87s)",
      ].join("\n"),
    },
    "/srv/forge-app/REMEDIATION.md": {
      content: [
        "Forge remediation note (draft)",
        "",
        "1) Bump to known-good versions from advisory (chalk 5.6.0 / debug 4.4.1 here).",
        "2) Delete node_modules + dist, regenerate lockfile from clean npm cache mirror.",
        "3) Rebuild every branch touched by CI runs during the malicious window.",
        "4) Purge CDN edge caches for any JS shipped from those builds.",
        "5) Require npm OIDC or WebAuthn for publishing; scope CI tokens read-only except release job.",
      ].join("\n"),
    },
    "/srv/forge-app/public-poc/npm_wallet_rpc_hook_stub.js": {
      content: [
        "// Educational fragment: Sep 2025 npm incident targeted browser wallets.",
        "// Malicious package post-install / entry hooked provider APIs (museum paraphrase).",
        "",
        "// const orig = window.ethereum.request;",
        "// window.ethereum.request = async (args) => { /* rewrite tx.to */ return orig(args); };",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "npm-view-chalk",
          goal: "Query the compromised chalk semver directly (simulated npm view).",
          hint: "`npm view chalk@5.6.1 version`.",
          matches: [{ kind: "exact", command: "npm view chalk@5.6.1 version" }],
          narration:
            "The npm view output confirms the bad semver was real on the registry during the incident window.",
        },
    {
          id: "alert",
          phase: "Recon",
          goal:
            "Read the internal alert that names the maintainer phishing vector and the rough malicious window.",
          hint: "`python3 advisory_triage.py --input ALERT.md`.",
          matches: [{ kind: "exact", command: "python3 advisory_triage.py --input ALERT.md" }],
          narration:
            "You already know this is credential theft on a human, not a registry protocol flaw. The interesting IR question is whether your automation pulled the bad tarballs while they were still served.",
        },
    {
          id: "package",
          phase: "Recon",
          goal: "Read package.json ranges that feed into the lockfile snapshot.",
          hint: "`jq . package.json`.",
          matches: [{ kind: "exact", command: "jq . package.json" }],
          narration:
            "Carets on chalk and debug tell you almost nothing during an incident. The lockfile is the ground truth.",
        },
    {
          id: "lockfile-chalk",
          phase: "Initial access",
          goal: "Prove whether the lockfile pins a malicious chalk version.",
          hint: "`npm audit signatures --json --package chalk`.",
          matches: [{ kind: "exact", command: "npm audit signatures --json --package chalk" }],
          narration:
            "chalk 5.6.1 is on the attacker-published line. That means every `npm ci` resolved that tarball until you change the lock.",
        },
    {
          id: "lockfile-debug",
          phase: "Initial access",
          goal: "Confirm the second poisoned dependency the alert called out.",
          hint: "`npm audit signatures --json --package debug`.",
          matches: [{ kind: "exact", command: "npm audit signatures --json --package debug" }],
          narration:
            "debug 4.4.2 matches the same wave. Two packages, one phishing story.",
        },
    {
          id: "ci-window",
          phase: "Impact",
          goal:
            "List CI runs and mark which ones executed while npm still served the bad versions.",
          hint: "`tshark -r evidence.pcap --follow-log ci-history.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log ci-history.log" }],
          narration:
            "Runs 8884-8886 fall inside ~13:16-15:45 UTC. Earlier runs were clean snapshots; later runs still reinstall whatever the lock pins, so downstream artifact purge stays mandatory.",
        },
    {
          id: "advisory",
          phase: "Detection",
          goal:
            "Cross-check version numbers against the mirrored npm advisory your team saved.",
          hint: "`python3 advisory_triage.py --input ADVISORY.md`.",
          matches: [{ kind: "exact", command: "python3 advisory_triage.py --input ADVISORY.md" }],
          narration:
            "The advisory spells exact semver matches and payload behaviour: wallet RPC hooking in browser bundles. That steers customer comms: crypto teams panic, everyone else still rewrites caches.",
        },
    {
          id: "remediation",
          phase: "Lessons",
          goal: "Read the drafted remediation checklist you owe delivery managers.",
          hint: "`python3 advisory_triage.py --summary REMEDIATION.md`.",
          matches: [{ kind: "exact", command: "python3 advisory_triage.py --summary REMEDIATION.md" }],
          narration:
            "Rebuild, re-lock, purge CDN, then fix the org problem: maintainer accounts and CI publish tokens need tighter scopes than you used during the incident window.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/npm_wallet_rpc_hook_stub.js`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/npm_wallet_rpc_hook_stub.js" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "On September 8, 2025, attackers phished Josh Junon (npm: qix), the maintainer of chalk, debug, ansi-styles, strip-ansi, supports-color, and 13 other packages with a combined ~2.6 billion weekly downloads. Using the credentials, they published exactly one malicious version of each package. The injected code targeted browser environments: it watched for window.ethereum and Solana wallet RPC calls and rewrote the destination address before the user signed. The bad versions were live for roughly 2.5 hours before npm staff and downstream researchers pulled them. CISA published an alert under AA25-266A on September 23.",
    lesson:
      "Three things to write down. (1) Lockfiles are the security boundary, not version ranges. `npm ci` will reproduce whatever your lockfile says, including newly-published malicious versions if your lockfile happened to update during the window. (2) Build artifacts outlive the bad upstream version. The malicious chalk was pulled at 15:45 UTC, but every CDN that served a JS bundle built between 13:25 and 15:45 still serves the malicious code until that bundle is invalidated. Make 'invalidate-and-rebuild' a reflex. (3) Every package maintainer is a credential attack surface. The mitigation here isn't reactive (you can't out-detect a 2.5-hour window of a maintainer's keys). It's structural: scope CI tokens by registry endpoint, require WebAuthn for npm publish, and prefer provenance attestations (npm publish --provenance) for any package you produce so downstream consumers can verify the build came from your CI.",
    simulated: [
      "Run IDs, hostnames, and the package.json contents are invented for the exhibit.",
      "The injected payload is described, wallet RPC interception, address rewrite, but no exploit code is included.",
      "The maintainer (qix), the date (September 8 2025), the affected package list, the wallet-targeting payload, the ~2.5 hour live window, and the CISA alert (AA25-266A) are real.",
    ],
  },
};
