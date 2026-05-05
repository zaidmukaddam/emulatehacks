import type { Scenario } from "../types";

/** 3CX supply chain, trojanised Windows desktop app Mar 2023 (GOPATH/Iconic Stealer / SmoothOperator). */
export const threeCxSupplyChain: Scenario = {
  slug: "3cx-supply-chain",
  exhibit: "EXH-022",
  title: "Signed Update",
  tagline:
    "March 2023. VoIP vendor 3CX ships a desktop app update that contains a decade-old chat library, and something newer that phones home from your sales floor.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2023",
  estMinutes: 9,
  fictional: true,
  cwd: "/ir/3cx-tabletop",
  user: "handler",
  host: "mclk",
  role: "IR handler with an EDR export and vendor notice, prove signed != benign.",
  objective:
    "Walk the vendor advisory, find the suspicious DLL path in the bundle manifest, and pull IOC lines from a stub DNS log.",
  briefing:
    "Filesystem is synthetic; the incident pattern matches public Mandiant/CrowdStrike write-ups.",
  env: { USER: "handler", SHELL: "/bin/sh", PWD: "/ir/3cx-tabletop" },
  ps: ["  PID TTY TIME CMD", "  501 ?   0:01 sh"],
  history: [],
  files: {
    "/ir/3cx-tabletop/VENDOR-NOTICE.txt": {
      content: [
        "3CX, Mar 2023 supply-chain incident (public)",
        "Windows desktop app versions 18.12.407 / 18.12.416 affected",
        "Shipped ffmpeg.dll + d3dcompiler_47.dll pair; second stage GitHub-hosted",
        "Enterprise mitigations: block updates, rotate creds on systems running app, hunt dll side-load",
        "Lesson: EV code-sign stops tampering, not insider / build-system compromise upstream",
      ].join("\n"),
    },
    "/ir/3cx-tabletop/bundle/filelist.txt": {
      content: [
        "app/3CXDesktopApp.exe",
        "app/ffmpeg.dll",
        "app/d3dcompiler_47.dll",
        "app/lib/…",
        "NOTE: d3dcompiler_47.dll SHA256 NOT in vendor golden manifest (tabletop flag)",
      ].join("\n"),
    },
    "/ir/3cx-tabletop/dns-ledger.log": {
      content: [
        "2023-03-29T11:02:01Z client=10.40.1.88 query=github.com A",
        "2023-03-29T11:02:04Z client=10.40.1.88 query=akamai.binance.tm A",
        "2023-03-29T11:02:09Z client=10.40.1.88 query=iconstuffer.com A",
        "2023-03-29T11:03:00Z client=10.40.1.88 query=msedge.api.cdp.microsoft.com HTTPS",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "notice",
      goal: "Read the vendor notice stub.",
      hint: "`cat VENDOR-NOTICE.txt`.",
      matches: [{ kind: "exact", command: "cat VENDOR-NOTICE.txt" }],
      narration:
        "Third-party softphone on every sales laptop, massive transitive trust.",
    },
    {
      id: "manifest",
      goal: "Inspect the bundle file list.",
      hint: "`cat bundle/filelist.txt`.",
      matches: [{ kind: "exact", command: "cat bundle/filelist.txt" }],
      narration:
        "Unsigned helper DLL next to signed EXE, classic side-load beachhead.",
    },
    {
      id: "grep-dns",
      goal: "Spot the suspicious apex domain in DNS.",
      hint: "`grep -nF iconstuffer dns-ledger.log`.",
      matches: [{ kind: "exact", command: "grep -nF iconstuffer dns-ledger.log" }],
      narration:
        "High-entropy C2 inside the first minute after GitHub, automation, not curiosity.",
    },
  ],
  debrief: {
    summary:
      "In March 2023, 3CX disclosed that certain distributions of its Windows desktop VoIP application were compromised as part of a supply-chain attack. Security firms published analysis describing malicious DLL side-loading behaviour, second-stage payloads retrieved from remote infrastructure, and impacts on enterprise endpoints running the affected application versions. The incident renewed attention to software supply chain risks, code signing limitations, and the security of widely deployed collaboration clients.",
    lesson:
      "Treat desktop UC clients like browsers for patch urgency, they parse multimedia, load native code, and update often. SBOM + binary diff on each release, EDR on sales laptops (not only engineering), DNS filtering on novel TLDs, and vendor incident comms in your crisis comms plan.",
    simulated: [
      "Domains are placeholder style; 3CX Mar 2023 supply-chain narrative and DLL side-load pattern are publicly documented.",
    ],
  },
};
