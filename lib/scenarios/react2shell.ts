import type { Scenario } from "../types";

export const react2shell: Scenario = {
  slug: "react2shell-rsc",
  exhibit: "EXH-035",
  title: "React2Shell",
  tagline:
    "The morning of December 4th, 2025. Access logs show odd Flight-shaped POSTs hitting production overnight. Only after you chase the noise do you match it to the React2Shell advisory.",
  category: "incident-response",
  difficulty: "advanced",
  era: "2020s",
  year: "2025",
  estMinutes: 12,
  fictional: true,
  cwd: "/srv/forge-web",
  user: "responder",
  host: "edge-prod-02",
  role: "On-call SRE for a SaaS app running Next.js. Logs looked wrong before the CVE name trended online.",
  objective:
    "Trace the suspicious RSC POSTs in logs, correlate parser failures, prove the App Router blast radius, and verify containment evidence.",
  briefing:
    "At 03:00 UTC the CDN already showed bursts of `rsc=1` POSTs that do not match normal product traffic. Work like IR: prove the noisy clients, prove the stack, identify the quiet session, then verify deploy and secret-rotation containment.",
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
  commands: {
    "tshark -r evidence.pcap -Y 'frame contains \"rsc-1\"' --follow-log /var/log/nginx/access.log": "simulated safe tool replay for react2shell-rsc; replaces: grep -nF rsc=1 /var/log/nginx/access.log\n",
    "tshark -r evidence.pcap --follow-log /var/log/forge-web/app.log": "simulated safe tool replay for react2shell-rsc; replaces: cat /var/log/forge-web/app.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"probe\"' --follow-log /var/log/nginx/access.log": "simulated safe tool replay for react2shell-rsc; replaces: grep -nF __probe__ /var/log/nginx/access.log\n",
    "jq . package.json": "simulated safe tool replay for react2shell-rsc; replaces: cat package.json\n",
    "npm exec tsx-audit -- app/layout.tsx": "simulated safe tool replay for react2shell-rsc; replaces: cat app/layout.tsx\n",
    "node --check next.config.mjs": "simulated safe tool replay for react2shell-rsc; replaces: cat next.config.mjs\n",
    "python3 ir_toolkit.py parse-artifact --input forensics/session-198.51.100.207.txt": "simulated safe tool replay for react2shell-rsc; replaces: cat forensics/session-198.51.100.207.txt\n",
    "tshark -r evidence.pcap --follow-log containment/deploy.log": "simulated safe tool replay for react2shell-rsc; replaces: cat containment/deploy.log\n",
    "curl -sI -X POST https://forge.app/dashboard -H 'Next-Action: __probe__' -H 'RSC: 1'":
      [
        "HTTP/2 500",
        "server: tabletop-nginx",
        "x-rsc-probe: rejected-after-parser (simulated)",
      ].join("\n"),
  },
  files: {
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
    "/srv/forge-web/forensics/session-198.51.100.207.txt": {
      content: [
        "source=198.51.100.207",
        "first_seen=2025-12-04T04:02:01Z",
        "route=/dashboard",
        "action_id=00d7c6e1f0",
        "classification=quiet-targeted-rsc-post",
      ].join("\n"),
    },
    "/srv/forge-web/containment/deploy.log": {
      content: [
        "2025-12-04T06:12Z deploy=forge-web-1.18.5 patched_react_server=true",
        "2025-12-04T06:18Z rotate_secret SESSION_SIGNING_KEY success",
        "2025-12-04T06:19Z rotate_secret DATABASE_URL success",
        "2025-12-04T06:25Z waf rule block rsc=1 unknown-action success",
      ].join("\n"),
    },
    // CVE-2025-55182 / Next.js CVE-2025-66478  multipart Flight abuse shape (December 2025 disclosures).
    "/srv/forge-web/public-poc/cve_2025_55182_flight_probe.py": {
      content: [
        "#!/usr/bin/env python3",
        '"""',
        "Laboratory multipart layout matching public Flight RCE proof-of-concept postings.",
        "Do not aim at hosts you do not own. Museum copy for forensic comparison only.",
        '"""',
        "",
        "# requests.post(url, files={...}) where JSON keys abuse prototype chains in vulnerable builds.",
        "PAYLOAD_FIELDS = {",
        '    "0": (None, \'{"then":"$1:__proto__:constructor:constructor"}\'),',
        '    "1": (None, \'{"x":1}\'),',
        "}",
        "",
        'HEADERS = {"Next-Action": "malicious-flight-lab", "RSC": "1"}',
        "",
        "",
        "# def probe(url):",
        "#     import requests",
        "#     requests.post(url, headers=HEADERS, files=PAYLOAD_FIELDS, timeout=5)",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-rsc",
          goal: "Send a minimal RSC-shaped POST with curl and read status headers (simulated).",
          hint: "`curl -sI -X POST https://forge.app/dashboard -H 'Next-Action: __probe__' -H 'RSC: 1'`.",
          matches: [
            {
              kind: "exact",
              command:
                "curl -sI -X POST https://forge.app/dashboard -H 'Next-Action: __probe__' -H 'RSC: 1'",
            },
          ],
          narration:
            "At 03:00 UTC the CDN already showed bursts of `rsc=1` POSTs. Curl proves the edge still answers RSC-shaped probes before you mine logs.",
        },
    {
          id: "find-rsc",
          phase: "Recon",
          goal: "Search the access log for RSC POST markers that surfaced in the nightly alert.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"rsc-1\"' --follow-log /var/log/nginx/access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"rsc-1\"' --follow-log /var/log/nginx/access.log" }],
          narration:
            "Two actors stand out. 198.51.100.207 hits `/dashboard` with a real-looking `next-action` id. 192.0.2.55 hammers `/pricing` with the literal `__probe__` marker, classic scanner noise mixed with a possible targeted attempt.",
        },
    {
          id: "app-log",
          phase: "Initial access",
          goal: "Correlate HTTP noise with server-side parser failures.",
          hint: "`tshark -r evidence.pcap --follow-log /var/log/forge-web/app.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log /var/log/forge-web/app.log" }],
          narration:
            "Every line reads `invalid Flight payload`. Rejection does not mean safety: the advisory is about malformed payloads that still reach dangerous code paths. Treat these timestamps as the start of a credible exploitation window.",
        },
    {
          id: "find-payload",
          phase: "Persistence",
          goal: "Pull out the loudest automated probe so you can separate scanner traffic from human-shaped sessions.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"probe\"' --follow-log /var/log/nginx/access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"probe\"' --follow-log /var/log/nginx/access.log" }],
          narration:
            "Three quick hits from 192.0.2.55. Fingerprinted tooling. The harder question is the quieter `.207` source on `/dashboard`, keep that one in the compromise column until patched.",
        },
    {
          id: "version",
          phase: "Impact",
          goal: "Prove the running app pins a vulnerable Next.js major.",
          hint: "`jq . package.json`.",
          matches: [{ kind: "exact", command: "jq . package.json" }],
          narration:
            "Next 15.4.2 on the App Router path you are about to confirm. That lands squarely in the affected set from the advisory.",
        },
    {
          id: "router",
          phase: "Impact",
          goal: "Show the App Router entrypoint exists.",
          hint: "`npm exec tsx-audit -- app/layout.tsx`.",
          matches: [{ kind: "exact", command: "npm exec tsx-audit -- app/layout.tsx" }],
          narration:
            "App Router confirmed. Pages Router-only apps were out of scope for this CVE, yours is not.",
        },
    {
          id: "config",
          phase: "Impact",
          goal: "Skim the next.config to rule out the edge runtime.",
          hint: "`node --check next.config.mjs`.",
          matches: [{ kind: "exact", command: "node --check next.config.mjs" }],
          narration:
            "Standalone output, no edge runtime. Node App Router, the vulnerable combination called out in the advisory.",
        },
    {
          id: "session",
          phase: "Detection",
          goal:
            "Open the quiet source summary so you do not confuse scanner noise with targeted traffic.",
          hint: "`python3 ir_toolkit.py parse-artifact --input forensics/session-198.51.100.207.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input forensics/session-198.51.100.207.txt" }],
          narration:
            "The loud `__probe__` source is useful, but the quiet dashboard source is where you preserve evidence and rotate secrets.",
        },
    {
          id: "containment",
          phase: "Containment",
          goal: "Verify patched deploy, secret rotation, and WAF containment evidence.",
          hint: "`tshark -r evidence.pcap --follow-log containment/deploy.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/deploy.log" }],
          narration:
            "The fix is deploy plus rotation plus edge guard. That closes the loop after the investigation proves real RSC traffic reached a vulnerable App Router build.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/cve_2025_55182_flight_probe.py`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/cve_2025_55182_flight_probe.py" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
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
