import type { Scenario } from "../types";

export const react2shell: Scenario = {
  slug: "react2shell-rsc",
  exhibit: "EXH-035",
  title: "React2Shell",
  tagline:
    "The morning of December 4th, 2025. A critical RSC vulnerability is on the front page. Your app is on Next 15.4. You have an hour before standup.",
  category: "incident-response",
  difficulty: "advanced",
  era: "2020s",
  year: "2025",
  estMinutes: 12,
  fictional: true,
  cwd: "/srv/forge-web",
  user: "responder",
  host: "edge-prod-02",
  role: "On-call SRE for a SaaS app running Next.js. The advisory dropped overnight. You have a production app to triage before anyone else is awake.",
  objective:
    "Confirm whether your app is exposed, find any evidence of pre-patch exploitation in the access logs, and prepare the rollout plan, all from defensive logs only.",
  briefing:
    "CVE-2025-66478 was disclosed at 11:00 PT on December 3rd, 2025. The Next.js advisory describes 'an insecure deserialization vulnerability where the server fails to properly validate the structure of incoming RSC payloads.' Affected: Next.js 15.x, 16.x, and 14.3.0-canary.77+ when the App Router is used. Not affected: Pages Router, Edge Runtime, Next 13.x, Next 14.x stable. You inherited this app three months ago. Start by figuring out what version it actually runs.",
  env: {
    USER: "responder",
    SHELL: "/bin/sh",
    PWD: "/srv/forge-web",
    NODE_ENV: "production",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "    1 ?        00:00:01 systemd",
    "  240 ?        00:00:03 nginx",
    "  301 ?        00:01:42 node .next/standalone/server.js",
    "  402 pts/0    00:00:00 sh",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  files: {
    "/srv/forge-web/ADVISORY.md": {
      content: [
        "CVE-2025-66478, React Server Components",
        "",
        "Disclosed: Dec 3 2025, 11:00 PT",
        "Affected: Next.js 15.x, 16.x, 14.3.0-canary.77+ (App Router only)",
        "Not affected: Pages Router, Edge Runtime, Next 13.x, Next 14.x stable",
        "Severity: CVSS 9.8 (network, no auth, RCE)",
        "Fix: npx fix-react2shell-next  (see https://github.com/vercel-labs/fix-react2shell-next)",
        "",
        "Triage order:",
        "  1) confirm your app is on an affected major + uses App Router",
        "  2) check access logs for RSC POSTs you do not recognise",
        "  3) plan the patch + secret rotation if the app was online before patch ship",
        "",
        "Be careful: there are PoCs floating around that invoke _vm, _child_process,",
        "_fs. Per the disclosing researcher, a real exploit does not need any of",
        "those. Treat the absence of those signatures as no evidence either way.",
      ].join("\n"),
    },
    "/srv/forge-web/package.json": {
      content: [
        "{",
        '  "name": "forge-web",',
        '  "version": "1.18.4",',
        '  "private": true,',
        '  "scripts": {',
        '    "dev": "next dev",',
        '    "build": "next build",',
        '    "start": "next start"',
        "  },",
        '  "dependencies": {',
        '    "next": "15.4.2",',
        '    "react": "19.0.0",',
        '    "react-dom": "19.0.0"',
        "  }",
        "}",
      ].join("\n"),
    },
    "/srv/forge-web/next.config.mjs": {
      content: [
        "// Default App Router config, no custom server, no edge runtime",
        "export default {",
        "  output: 'standalone',",
        "  experimental: {",
        "    serverActions: { allowedOrigins: ['forge.app', '*.forge.app'] },",
        "  },",
        "}",
      ].join("\n"),
    },
    "/srv/forge-web/app/layout.tsx": {
      content:
        "// app/layout.tsx, App Router root layout. Confirms the app is App Router (vulnerable surface).\nexport default function Root({ children }: { children: React.ReactNode }) {\n  return <html><body>{children}</body></html>\n}\n",
    },
    "/srv/forge-web/.next/BUILD_ID": {
      content: "8c4f1e9d-rc2-prod\n",
    },
    "/var/log/nginx/access.log": {
      content: [
        '203.0.113.18 - - [04/Dec/2025:02:14:11 +0000] "GET / HTTP/2.0" 200 7218 "-" "Mozilla/5.0"',
        '203.0.113.18 - - [04/Dec/2025:02:14:12 +0000] "GET /dashboard HTTP/2.0" 200 11944 "-" "Mozilla/5.0"',
        '198.51.100.42 - - [04/Dec/2025:03:08:52 +0000] "POST /api/login HTTP/2.0" 200 312 "-" "okhttp/4.12"',
        '198.51.100.207 - - [04/Dec/2025:04:02:01 +0000] "POST /dashboard HTTP/2.0" 200 4811 "https://forge.app/dashboard" "Mozilla/5.0" rsc=1 next-action=00d7c6e1f0',
        '198.51.100.207 - - [04/Dec/2025:04:02:01 +0000] "POST /dashboard HTTP/2.0" 200 4811 "https://forge.app/dashboard" "Mozilla/5.0" rsc=1 next-action=00d7c6e1f0',
        '198.51.100.207 - - [04/Dec/2025:04:02:02 +0000] "POST /dashboard HTTP/2.0" 500 211 "https://forge.app/dashboard" "Mozilla/5.0" rsc=1 next-action=00d7c6e1f0',
        '192.0.2.55  - - [04/Dec/2025:04:11:33 +0000] "POST /pricing HTTP/2.0" 500 211 "-" "curl/8.4.0" rsc=1 next-action=__probe__',
        '192.0.2.55  - - [04/Dec/2025:04:11:34 +0000] "POST /pricing HTTP/2.0" 500 211 "-" "curl/8.4.0" rsc=1 next-action=__probe__',
        '192.0.2.55  - - [04/Dec/2025:04:11:34 +0000] "POST /pricing HTTP/2.0" 500 211 "-" "Go-http-client/1.1" rsc=1 next-action=__probe__',
        '203.0.113.99 - - [04/Dec/2025:05:19:17 +0000] "POST /. HTTP/2.0" 400 159 "-" "masscan/1.3"',
      ].join("\n"),
    },
    "/var/log/forge-web/app.log": {
      content: [
        "2025-12-04T04:02:02Z error  rsc-protocol  invalid Flight payload at /dashboard (action=00d7c6e1f0)",
        "2025-12-04T04:11:33Z error  rsc-protocol  invalid Flight payload at /pricing (action=__probe__)",
        "2025-12-04T04:11:34Z error  rsc-protocol  invalid Flight payload at /pricing (action=__probe__)",
        "2025-12-04T04:11:34Z error  rsc-protocol  invalid Flight payload at /pricing (action=__probe__)",
      ].join("\n"),
    },
    "/srv/forge-web/PATCH-PLAN.md": {
      content: [
        "patch plan, fill in as you investigate",
        "",
        "[ ] confirmed Next major:        ___________",
        "[ ] confirmed App Router in use: ___________",
        "[ ] suspicious RSC POSTs:        ___________",
        "[ ] earliest suspicious request: ___________",
        "[ ] secret rotation required:    yes / no",
        "[ ] patch command to run:        ___________",
        "",
        "fill these in by reading the files and access log around you.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "advisory",
      goal: "Read the advisory note for context.",
      hint: "`cat ADVISORY.md`.",
      matches: [{ kind: "exact", command: "cat ADVISORY.md" }],
      narration:
        "App Router only. CVSS 9.8. Patched via the official codemod. Ignore PoCs, the disclosing researcher said the obvious _vm / _child_process signatures aren't needed for a real exploit.",
    },
    {
      id: "version",
      goal: "Confirm which Next major your app is running.",
      hint: "`cat package.json` and look at the `next` dependency.",
      matches: [{ kind: "exact", command: "cat package.json" }],
      narration: "Next 15.4.2. Squarely in the affected range.",
    },
    {
      id: "router",
      goal: "Confirm the app uses the App Router (not Pages Router).",
      hint:
        "If `app/layout.tsx` exists, it is App Router. `cat app/layout.tsx`.",
      matches: [{ kind: "exact", command: "cat app/layout.tsx" }],
      narration:
        "App Router confirmed. Pages Router and the Edge Runtime are not affected, App Router on Node is the vulnerable surface.",
    },
    {
      id: "config",
      goal: "Skim the next.config to rule out the edge runtime.",
      hint: "`cat next.config.mjs`.",
      matches: [{ kind: "exact", command: "cat next.config.mjs" }],
      narration:
        "Standalone output, no edge runtime. Vulnerable.",
    },
    {
      id: "find-rsc",
      goal: "Search the access log for RSC POSTs to surface anything unusual.",
      hint: "`grep -nF rsc=1 /var/log/nginx/access.log`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF rsc=1 /var/log/nginx/access.log",
        },
      ],
      narration:
        "Two distinct sources. 198.51.100.207 to /dashboard with a real-looking action ID. 192.0.2.55 to /pricing with the literal string `__probe__` as the action, that one is a scanner.",
    },
    {
      id: "app-log",
      goal: "Cross-reference with the app log for protocol errors.",
      hint: "`cat /var/log/forge-web/app.log`.",
      matches: [
        { kind: "exact", command: "cat /var/log/forge-web/app.log" },
      ],
      narration:
        "All four entries say `invalid Flight payload`. The server rejected the malformed payload, but the advisory is clear: rejection alone is not safety. Some payload shapes were accepted into vulnerable code paths.",
    },
    {
      id: "find-payload",
      goal: "Audit the access log for the canonical scanner string.",
      hint: "`grep -nF __probe__ /var/log/nginx/access.log`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF __probe__ /var/log/nginx/access.log",
        },
      ],
      narration:
        "Three hits from 192.0.2.55, two user-agents. Mass-scanner behaviour. You can't tell from the log alone whether the dashboard POST from .207 was benign or malicious, assume malicious since the app was unpatched. That triggers the rotation.",
    },
    {
      id: "patch-plan",
      goal: "Open the patch plan checklist and prepare to fill it in.",
      hint: "`cat PATCH-PLAN.md`.",
      matches: [{ kind: "exact", command: "cat PATCH-PLAN.md" }],
      narration:
        "Three blanks you can answer now: Next 15.4.2, App Router yes, suspicious RSC POSTs from 198.51.100.207 and 192.0.2.55. Run `npx fix-react2shell-next`, redeploy, and rotate every secret reachable from server actions before standup. Document the window: app was online unpatched between 03:00 PT Dec 3 and now.",
    },
  ],
  debrief: {
    summary:
      "CVE-2025-66478, informally called React2Shell, was an insecure deserialization issue in the React Server Components Flight protocol. Next.js applications using the App Router (15.x, 16.x, 14.3.0-canary.77+) processed certain malformed RSC payloads through privileged server code paths. A request that looked like a normal page navigation could result in arbitrary server-side JavaScript execution. Disclosed Dec 3 2025 by Lachlan Davidson; patched the same day by the Next.js team.",
    lesson:
      "Three things to take from this. (1) Treat any framework that deserialises wire-format payloads from the browser as a parser, and treat parsers as security boundaries, assume that protocol-level validation will eventually fail and design downstream code so a protocol-level failure does not become an execution failure. (2) For Next.js specifically: keep an inventory of which routes use the App Router, which use Pages, and which run on the Edge Runtime; this advisory only reached one of those three. (3) When the advisory says 'rotate secrets if the app was online unpatched,' rotate. The window of unattended exposure is the relevant signal, not a confirmed exploit attempt, the disclosing researcher specifically warned that genuine exploitation does not leave the obvious _vm / _child_process signature that early PoCs used.",
    simulated: [
      "All IPs, action IDs, hostnames, and user-agents in the access log are invented.",
      "The malformed payloads themselves are not shown anywhere in this exhibit. The defensive flow does not require them and we do not publish them.",
      "The CVE number, affected/unaffected version table, disclosure date, and patch tool name are real (Next.js advisory, December 3 2025).",
    ],
  },
};
