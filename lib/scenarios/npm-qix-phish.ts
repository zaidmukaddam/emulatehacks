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
  role: "On-call engineer for a Node app that builds in CI several times a day. The advisory thread on Hacker News is two hours old and still moving.",
  objective:
    "Decide whether your app installed any of the malicious versions in the last 24 hours, and what to do if it did.",
  briefing:
    "On September 8, 2025, attackers phished Josh Junon (npm: qix), the maintainer of 18 widely-used packages including chalk, debug, ansi-styles, supports-color, and strip-ansi. They published one malicious version of each. The injected code looked for crypto-wallet API calls in browser-shipped bundles and rewrote the destination address before the user signed the transaction. The bad versions were live for roughly 2.5 hours before npm pulled them. Your CI runs `npm ci` on every PR. Walk your lockfile and your CI history.",
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
  files: {
    "/srv/forge-app/ADVISORY.md": {
      content: [
        "Sept 8 2025, npm supply-chain compromise (qix maintainer)",
        "",
        "Vector:    phishing email impersonating npm support to Josh Junon (qix).",
        "           Attackers pushed one bad version of each of 18 packages.",
        "Window:    ~2.5 hours, roughly 13:16–15:45 UTC.",
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
  },
  steps: [
    {
      id: "advisory",
      goal: "Read the advisory note.",
      hint: "`cat ADVISORY.md`.",
      matches: [{ kind: "exact", command: "cat ADVISORY.md" }],
      narration:
        "Bad versions are exact: chalk 5.6.1, debug 4.4.2, strip-ansi 7.1.1, supports-color 10.2.1. The window is 13:16–15:45 UTC. Two questions: lockfile, and CI runs during the window.",
    },
    {
      id: "package",
      goal: "Read the package.json to see what your app depends on.",
      hint: "`cat package.json`.",
      matches: [{ kind: "exact", command: "cat package.json" }],
      narration:
        "Caret ranges on chalk and debug. That means `npm ci` resolves whatever version was tip-of-major when the lockfile was last updated. The lockfile is what actually matters.",
    },
    {
      id: "lockfile-chalk",
      goal: "Search the lockfile for chalk.",
      hint: "`grep -nF chalk package-lock.json`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF chalk package-lock.json",
        },
      ],
      narration:
        "chalk pinned to 5.6.1, the bad version. So is debug 4.4.2. Your lockfile is contaminated.",
    },
    {
      id: "lockfile-debug",
      goal: "Confirm by searching for debug.",
      hint: "`grep -nF debug package-lock.json`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF debug package-lock.json",
        },
      ],
      narration:
        "Confirmed: debug 4.4.2. Two of the eighteen are in your lock.",
    },
    {
      id: "ci-window",
      goal:
        "Walk the CI history and find any `npm ci` that ran during 13:16–15:45 UTC on Sept 8.",
      hint: "`cat ci-history.log`.",
      matches: [{ kind: "exact", command: "cat ci-history.log" }],
      narration:
        "Three runs land inside the window: 8884 at 13:25, 8885 at 14:08, 8886 at 14:51. The two earlier runs (09:11 and 11:42) installed the older, clean, versions. The two later runs (16:14, 18:33) ran after npm pulled the bad versions, but `npm ci` honours the lockfile, so they would also have pulled the bad versions. Conclusion: every run from 8884 onward installed contaminated chalk + debug into a build artifact.",
    },
    {
      id: "fix",
      goal:
        "Confirm what the fix looks like before you start typing.",
      hint:
        "Set the bad versions to known-good in the lockfile and reinstall. There is no command to run here, read the answer back from the advisory.",
      matches: [{ kind: "exact", command: "cat ADVISORY.md" }],
      narration:
        "Pin chalk to 5.6.0 and debug to 4.4.1 (the last known-good in your range), regenerate the lockfile, and rebuild. Because the payload was browser-side and wallet-targeted, the urgent question for a non-crypto app is: did any user load a build whose JS bundle was generated by a contaminated CI run? If yes, invalidate those bundles at the CDN before you do anything else. The wallet-rewrite payload activates only on signed transactions, so general-purpose web users were not directly harmed, but their installed JS still contains the malicious code until you ship a clean bundle.",
    },
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
