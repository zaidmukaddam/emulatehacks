import type { Scenario } from "../types";

/** Fictional composite: early-2026 cluster of Next.js / React security releases. */
export const nextAdvisoryWave2026: Scenario = {
  slug: "next-advisory-wave-2026",
  exhibit: "EXH-036",
  title: "Ledger Ghost Routes",
  tagline:
    "January 6, 2026. A scanner hits a hidden Next.js route, then an export endpoint leaks ledger rows from a preview deployment. You trace the request chain from headers to middleware to blast radius.",
  category: "modern-cloud",
  difficulty: "advanced",
  era: "2020s",
  year: "2026",
  estMinutes: 11,
  fictional: true,
  cwd: "/srv/platform/ledger-web",
  user: "responder",
  host: "build-review-01",
  role: "Staff engineer shepherding a fleet of App Router services through a noisy advisory week.",
  objective:
    "Reconstruct the simulated web chain: discover the framework, find the ghost route, inspect the weak middleware matcher, prove data export, then show the block rule that stops replay.",
  briefing:
    "A preview build was promoted with a stale debug route and middleware that trusted a preview header. The attacker does not need magic: route discovery, a forged internal-looking header, then a CSV export. This is a safe reconstruction built from logs and source snippets, not a working exploit.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/srv/platform/ledger-web",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  101 ?        00:00:01 systemd",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input recon/headers.txt": "simulated safe tool replay for next-advisory-wave-2026; replaces: cat recon/headers.txt\n",
    "jq . package.json": "simulated safe tool replay for next-advisory-wave-2026; replaces: cat package.json\n",
    "python3 ir_toolkit.py discover --kind router --root route.ts": "simulated safe tool replay for next-advisory-wave-2026; replaces: find app -name route.ts\n",
    "python3 safe_replay.py --scenario next-advisory-wave-2026 --grep x-preview-auth --artifact middleware.ts": "simulated safe tool replay for next-advisory-wave-2026; replaces: grep -nF x-preview-auth middleware.ts\n",
    "tshark -r evidence.pcap -Y 'frame contains \"ioc\"' --follow-log /var/log/ledger-web/access.log": "simulated safe tool replay for next-advisory-wave-2026; replaces: grep -nF /api/_dev/export /var/log/ledger-web/access.log\n",
    "python3 ir_toolkit.py csv-summary --input artifacts/export-sample.csv": "simulated safe tool replay for next-advisory-wave-2026; replaces: cat artifacts/export-sample.csv\n",
    "python3 ir_toolkit.py parse-artifact --input controls/block-rule.txt": "simulated safe tool replay for next-advisory-wave-2026; replaces: cat controls/block-rule.txt\n",
    "curl -sI https://ledger.preview.forge.app/ledger/overview":
      [
        "HTTP/2 200",
        "x-powered-by: Next.js",
        "x-vercel-id: iad1::ledger-preview::9h11",
        "(simulated: header fingerprint before you open recon/headers.txt)",
      ].join("\n"),
  },
  files: {
    "/srv/platform/ledger-web/recon/headers.txt": {
      content: [
        "GET /ledger/overview HTTP/2",
        "x-powered-by: Next.js",
        "x-vercel-id: iad1::ledger-preview::9h11",
        "cache-control: private, no-store",
        "set-cookie: preview_gate=stale; Path=/; HttpOnly",
      ].join("\n"),
    },
    "/srv/platform/ledger-web/package.json": {
      content: [
        "{",
        '  "name": "ledger-web",',
        '  "private": true,',
        '  "dependencies": {',
        '    "next": "16.0.4",',
        '    "react": "19.2.0",',
        '    "react-dom": "19.2.0"',
        "  }",
        "}",
      ].join("\n"),
    },
    "/srv/platform/ledger-web/app/layout.tsx": {
      content:
        'export default function Root({ children }: { children: React.ReactNode }) {\n  return <html><body>{children}</body></html>\n}\n',
    },
    "/srv/platform/ledger-web/app/api/_dev/export/route.ts": {
      content: [
        "import { NextResponse } from 'next/server';",
        "",
        "export async function GET(req: Request) {",
        "  // Exhibit bug: preview-only export route stayed in the promoted tree.",
        "  if (req.headers.get('x-preview-auth') !== 'allow-internal') return NextResponse.json({}, { status: 404 });",
        "  return new Response('account,balance\\nalpha,188201\\nbravo,99102\\n');",
        "}",
      ].join("\n"),
    },
    "/srv/platform/ledger-web/middleware.ts": {
      content: [
        "import { NextResponse } from 'next/server';",
        "export const config = { matcher: ['/ledger/:path*', '/api/:path*'] };",
        "export function middleware(req: Request) {",
        "  if (req.headers.get('x-preview-auth') === 'allow-internal') return NextResponse.next();",
        "  if (req.url.includes('/api/_dev/')) return NextResponse.json({}, { status: 404 });",
        "  return NextResponse.next();",
        "}",
      ].join("\n"),
    },
    "/var/log/ledger-web/access.log": {
      content: [
        '203.0.113.44 - - [06/Jan/2026:04:12:01 +0000] "GET /ledger/overview HTTP/2.0" 200 9021 "-" "Mozilla/5.0"',
        '198.51.100.9 - - [06/Jan/2026:04:15:22 +0000] "GET /api/_dev/export HTTP/2.0" 404 128 "-" "curl/8.5.0"',
        '198.51.100.9 - - [06/Jan/2026:04:15:41 +0000] "GET /api/_dev/export HTTP/2.0" 200 44102 "-" "python-requests/2.32" hdr=x-preview-auth',
        '198.51.100.9 - - [06/Jan/2026:04:16:03 +0000] "GET /api/ledger/export?fmt=csv HTTP/2.0" 200 44102 "-" "python-requests/2.32"',
      ].join("\n"),
    },
    "/srv/platform/ledger-web/artifacts/export-sample.csv": {
      content: [
        "account,balance,last4",
        "alpha,188201,0042",
        "bravo,99102,4491",
        "charlie,44109,7710",
      ].join("\n"),
    },
    "/srv/platform/ledger-web/controls/block-rule.txt": {
      content:
        "edge rule: deny /api/_dev/* unless source=build-network and header token matches rotated secret\npreview_gate cookie revoked at 2026-01-06T05:01Z\n",
    },
    "/srv/platform/ledger-web/public-poc/ghost_route_curl_probe.sh": {
      content: [
        "#!/bin/sh",
        "# Discover hidden App Router endpoints, then test auth assumptions.",
        "",
        "# curl -sI \"https://ledger.preview.forge.app/api/_dev/export\"",
        "# curl -sH \"x-preview-auth: allow-internal\" \"https://ledger.preview.forge.app/api/_dev/export\"",
        "",
        "# Lesson: strip debug routes from prod graphs; reject client-spoofable internal headers.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-headers",
          phase: "Recon",
          goal: "Grab response headers from the preview host with curl (simulated).",
          hint: "`curl -sI https://ledger.preview.forge.app/ledger/overview`.",
          matches: [
            {
              kind: "exact",
              command: "curl -sI https://ledger.preview.forge.app/ledger/overview",
            },
          ],
          narration:
            "Curl fingerprints the preview edge before you open the saved recon capture.",
        },
    {
          id: "headers",
          phase: "Recon",
          goal: "Fingerprint the target from captured response headers.",
          hint: "`python3 ir_toolkit.py parse-artifact --input recon/headers.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input recon/headers.txt" }],
          narration:
            "The attacker starts with boring headers: Next.js, a preview-looking deployment ID, and a stale preview cookie. That is enough to choose what to probe next.",
        },
    {
          id: "versions",
          phase: "Recon",
          goal: "Confirm the pinned Next and React versions on this build.",
          hint: "`jq . package.json`.",
          matches: [{ kind: "exact", command: "jq . package.json" }],
          narration:
            "This tells you which runtime family the route tree belongs to. It does not fix anything by itself; it tells you where to look.",
        },
    {
          id: "router",
          phase: "Initial access",
          goal: "Find the promoted ghost route that should have stayed preview-only.",
          hint: "`python3 ir_toolkit.py discover --kind router --root route.ts`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py discover --kind router --root route.ts" }],
          narration:
            "Route discovery is the hack’s first real move. A hidden `_dev` export endpoint inside the App Router tree is a foot in the door.",
        },
    {
          id: "middleware",
          phase: "Initial access",
          goal: "Inspect the middleware bypass that trusts an internal-looking preview header.",
          hint: "`python3 safe_replay.py --scenario next-advisory-wave-2026 --grep x-preview-auth --artifact middleware.ts`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario next-advisory-wave-2026 --grep x-preview-auth --artifact middleware.ts" }],
          narration:
            "The bad step is trusting a header as if the edge already authenticated it. The first probe gets a 404; the second adds the magic header and gets data.",
        },
    {
          id: "logs",
          phase: "Impact",
          goal: "Search access logs for the replay from 404 to 200 on the ghost route.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"ioc\"' --follow-log /var/log/ledger-web/access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"ioc\"' --follow-log /var/log/ledger-web/access.log" }],
          narration:
            "That is the step-by-step chain in two lines: discover endpoint, replay with trusted-looking header, receive 200.",
        },
    {
          id: "sample",
          phase: "Impact",
          goal: "Open the captured export sample to understand what left the app.",
          hint: "`python3 ir_toolkit.py csv-summary --input artifacts/export-sample.csv`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py csv-summary --input artifacts/export-sample.csv" }],
          narration:
            "Impact is not a CVE label. It is account rows in a CSV that should never have been reachable from a preview path.",
        },
    {
          id: "block",
          phase: "Containment",
          goal: "Verify the edge block that kills replay of the ghost route.",
          hint: "`python3 ir_toolkit.py parse-artifact --input controls/block-rule.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input controls/block-rule.txt" }],
          narration:
            "The fix is concrete: remove the route, rotate the preview secret, and deny the path at the edge while the deploy rolls.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/ghost_route_curl_probe.sh`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/ghost_route_curl_probe.sh" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "This scenario is a fictional January 2026 composite. It encodes how teams experience ‘many Next.js CVEs’ in practice: overlapping narratives, shared primitives (App Router, middleware, server components), and the need to triage from repo facts before touching package managers. It does not document a single real CVE chain.",
    lesson:
      "When advisories cluster, treat the week as an inventory problem first. Confirm router mode, middleware matchers, and staging NODE_ENV drift before you argue about semver. Log archaeology for dev-only paths on prod is cheap signal that often beats reading third-hand Twitter threads.",
    simulated: [
      "ledger-web repo paths, logs, and rollup text are invented for teaching.",
      "No exploit primitives, payloads, or bypass recipes are provided.",
      "The emotional shape (patch rush, bundled vendor memo) mirrors real 2025-2026 Next.js advisory cycles without quoting them verbatim.",
    ],
  },
};
