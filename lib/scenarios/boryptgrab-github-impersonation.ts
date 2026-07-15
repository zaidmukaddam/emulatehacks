import type { Scenario } from "../types";

/**
 * Defensive reconstruction based on Arctic Wolf Labs research published on 13 July 2026
 * and reporting published within this automation's 24-hour news window on 14 July 2026.
 * The incident facts and public indicators are sourced in the debrief. All local telemetry,
 * hostnames, user activity, and response records are synthetic museum artifacts.
 */
export const boryptgrabGithubImpersonation: Scenario = {
  slug: "boryptgrab-github-impersonation",
  exhibit: "EXH-048",
  title: "The Trusted Download",
  tagline:
    "14 July 2026. Reporting exposes 292 fake GitHub repositories that borrowed trusted brands, rotated malicious ZIPs, and side-loaded a BoryptGrab-lineage stealer through a signed updater.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 11,
  fictional: true,
  cwd: "/home/analyst/case-0714",
  user: "analyst",
  host: "forensics-02",
  role: "SOC analyst reviewing a quarantined Windows endpoint after a user followed a search result to an unofficial software repository.",
  objective:
    "Trace the trust-abuse chain from repository redirect to DLL side-loading, identify the smash-and-grab staging evidence and network indicator, validate a memory detection, then prepare containment actions.",
  briefing:
    "A workstation alert arrived hours after public reporting described 292 brand-impersonation GitHub repositories. The campaign was not a GitHub or vendor vulnerability. It relied on search traffic, convincing README pages, fake trust badges, and a rotating download. Your evidence set contains no malware binaries and cannot contact the internet. Determine what the user trusted, what ran, what data was staged, and what defenders should do next.",
  env: {
    USER: "analyst",
    SHELL: "/bin/bash",
    PWD: "/home/analyst/case-0714",
    CASE_ID: "IR-2026-0714-042",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  734 pts/0    00:00:00 bash",
    "  752 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "cat CASE-NOTES.txt"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/campaign-brief.txt": [
      "simulated safe parser output: intel/campaign-brief.txt",
      "campaign_start=2026-06-26",
      "repositories_enumerated=292",
      "repositories_active_at_analysis=78",
      "vector=search-driven brand impersonation",
      "family=BoryptGrab-lineage",
      "vulnerability_exploited=none",
      "attribution=unattributed, financially motivated",
    ],
    "jq . evidence/referral.json": [
      "{",
      '  "search_query": "northstar endpoint agent download",',
      '  "repository": "github.example/Northstar-Endpoint-Security/.github",',
      '  "readme_button": "OFFICIAL PAGE",',
      '  "redirector": "northstar-download.github.example/.github/Northstar",',
      '  "landing_badges": ["VirusTotal Approved", "Secure Archive", "Verified Access"],',
      '  "assessment": "synthetic brand and defanged URLs; pattern matches public reporting"',
      "}",
    ],
    "python3 safe_replay.py --scenario boryptgrab-github-impersonation --artifact evidence/download-manifest.txt":
      [
        "simulated safe replay: metadata only, no archive or executable is present",
        "archive=Northstar-Endpoint-4.12.0.zip",
        "archive_rotation=approximately_60_seconds",
        "signed_host=Northstar-Endpoint-4.12.0.exe",
        "signed_host_identity=renamed legitimate WinGUP updater (gup.exe)",
        "adjacent_dll=libcurl.dll",
        "execution_chain=signed updater -> DLL side-load -> reflective in-memory stealer",
      ],
    "tshark -r evidence.pcap -Y 'frame contains \"libcurl.dll\"' --follow-log telemetry/edr.log": [
      "2026-07-14T18:42:11Z host=WKSTN-042 process=Northstar-Endpoint-4.12.0.exe signer=WinGUP action=started",
      "2026-07-14T18:42:11Z host=WKSTN-042 image_load=libcurl.dll path=C:\\Users\\mira\\Downloads\\Northstar-Endpoint-4.12.0\\libcurl.dll signature=unsigned",
      "2026-07-14T18:42:12Z host=WKSTN-042 process=Northstar-Endpoint-4.12.0.exe technique=reflective_load target=memory verdict=blocked_late",
      "museum note: telemetry is synthetic and contains no runnable sample",
    ],
    "python3 ir_toolkit.py parse-artifact --input evidence/staging-tree.txt": [
      "simulated safe parser output: recovered staging directory",
      "%TEMP%\\XX___GUID_7c91\\",
      "  decrypt_browser\\browser_decryption.log",
      "  Filegraber\\credentials_data.txt",
      "  Wallet\\wallet_inventory.txt",
      "  Messenger\\Discord\\Discord_tokens.txt",
      "  Messenger\\Telegram\\session_inventory.txt",
      "  screenshot.png",
      "  UserInformation.txt",
      "interpretation=no persistence observed; staging remained because the stealer did not clean up",
    ],
    "python3 ir_toolkit.py extract-ioc --ioc 193.143.1[.]131 --input telemetry/proxy.log": [
      "simulated safe IOC lookup for defanged value 193.143.1[.]131",
      "2026-07-14T18:42:29Z src=WKSTN-042 dst=193.143.1[.]131 method=POST uri=/upload bytes_out=2482016 action=blocked",
      "matches=1",
      "public_context=hardcoded HTTP C2 reported by Arctic Wolf Labs",
    ],
    "yara rules/BoryptGrab_infostealer.yara evidence/memory-snapshot.bin": [
      "BoryptGrab_infostealer evidence/memory-snapshot.bin",
      "matched_strings=CopyBrowserData,ExtractDiscordTokens,CreateZipArchive,TakeScreenshot",
      "museum note: the memory snapshot is represented by canned output only",
    ],
    "python3 ir_toolkit.py parse-artifact --input response/containment.md": [
      "simulated safe parser output: response/containment.md",
      "1. Isolate the endpoint and preserve memory plus the leftover staging directory.",
      "2. Reset browser, messaging, wallet, and Windows credentials used on the host.",
      "3. Hunt for the public hashes, staging names, memory strings, and defanged C2.",
      "4. Block known redirectors and distribution infrastructure after validation.",
      "5. Remove unapproved software and verify downloads through official vendor channels.",
      "6. Report active impersonation pages to GitHub and the impersonated vendor.",
    ],
  },
  files: {
    "/home/analyst/case-0714/CASE-NOTES.txt": {
      content: [
        "IR-2026-0714-042",
        "Endpoint: WKSTN-042",
        "Trigger: unsigned DLL loaded beside a signed updater downloaded from an unofficial repository.",
        "Safety: evidence is text-only; all domains are defanged or reserved examples.",
      ].join("\n"),
    },
    "/home/analyst/case-0714/ir_toolkit.py": {
      content: [
        "#!/usr/bin/env python3",
        '"""Museum helper declaration. The shell returns canned text for approved commands."""',
        "raise SystemExit('simulated helper: no local execution')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/analyst/case-0714/safe_replay.py": {
      content: [
        "#!/usr/bin/env python3",
        '"""Metadata-only replay declaration. No archive or malware sample exists."""',
        "raise SystemExit('simulated helper: no local execution')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/analyst/case-0714/intel/campaign-brief.txt": {
      content: [
        "BoryptGrab-lineage GitHub impersonation campaign",
        "Public research date: 13 July 2026",
        "Follow-up reporting used for this exhibit: 14 July 2026",
        "",
        "At least 292 deceptive GitHub pages and .github repositories were enumerated.",
        "Seventy-eight were still active when Arctic Wolf analyzed the set.",
        "The pages impersonated software, security, finance, crypto, email, and gaming brands.",
        "Search results led users to polished README pages and concealed external downloads.",
        "This was trust abuse and social engineering, not a vulnerability in GitHub or the copied brands.",
      ].join("\n"),
    },
    "/home/analyst/case-0714/evidence/referral.json": {
      content: [
        "{",
        '  "search_query": "northstar endpoint agent download",',
        '  "repository": "github.example/Northstar-Endpoint-Security/.github",',
        '  "readme_button": "OFFICIAL PAGE",',
        '  "redirector": "northstar-download.github.example/.github/Northstar",',
        '  "landing_badges": ["VirusTotal Approved", "Secure Archive", "Verified Access"],',
        '  "assessment": "synthetic brand and defanged URLs; pattern matches public reporting"',
        "}",
      ].join("\n"),
    },
    "/home/analyst/case-0714/evidence/download-manifest.txt": {
      content: [
        "Quarantine metadata only",
        "",
        "Archive name: Northstar-Endpoint-4.12.0.zip",
        "Observed landing-page behavior: archive name and payload rotated about every 60 seconds.",
        "Signed host: Northstar-Endpoint-4.12.0.exe",
        "Identity: renamed legitimate WinGUP updater, normally gup.exe",
        "Adjacent library: unsigned libcurl.dll",
        "Observed pattern: signed updater side-loads the adjacent DLL; DLL reflectively loads the stealer.",
        "",
        "No binaries are stored in this exhibit.",
      ].join("\n"),
    },
    "/home/analyst/case-0714/telemetry/edr.log": {
      content: [
        "2026-07-14T18:42:11Z host=WKSTN-042 process=Northstar-Endpoint-4.12.0.exe signer=WinGUP action=started",
        "2026-07-14T18:42:11Z host=WKSTN-042 image_load=libcurl.dll path=C:\\Users\\mira\\Downloads\\Northstar-Endpoint-4.12.0\\libcurl.dll signature=unsigned",
        "2026-07-14T18:42:12Z host=WKSTN-042 process=Northstar-Endpoint-4.12.0.exe technique=reflective_load target=memory verdict=blocked_late",
      ].join("\n"),
    },
    "/home/analyst/case-0714/evidence/staging-tree.txt": {
      content: [
        "%TEMP%\\XX___GUID_7c91\\",
        "├── decrypt_browser\\browser_decryption.log",
        "├── Filegraber\\credentials_data.txt",
        "├── Wallet\\wallet_inventory.txt",
        "├── Messenger\\Discord\\Discord_tokens.txt",
        "├── Messenger\\Telegram\\session_inventory.txt",
        "├── screenshot.png",
        "└── UserInformation.txt",
        "",
        "The misspelled Filegraber directory mirrors the public host artifact.",
        "Names and sample contents are synthetic. No credentials are included.",
      ].join("\n"),
    },
    "/home/analyst/case-0714/telemetry/proxy.log": {
      content: [
        "2026-07-14T18:42:28Z src=WKSTN-042 dst=cdn.example method=GET uri=/icons/check.svg bytes_out=391 action=allow",
        "2026-07-14T18:42:29Z src=WKSTN-042 dst=193.143.1[.]131 method=POST uri=/upload bytes_out=2482016 action=blocked",
        "2026-07-14T18:42:31Z src=WKSTN-042 dst=updates.example method=GET uri=/status bytes_out=212 action=allow",
      ].join("\n"),
    },
    "/home/analyst/case-0714/rules/BoryptGrab_infostealer.yara": {
      content: [
        "rule BoryptGrab_infostealer_museum_note {",
        "  meta:",
        '    description = "Non-operational excerpt of public defensive string themes"',
        "  strings:",
        '    $a1 = "CopyBrowserData"',
        '    $a2 = "ExtractDiscordTokens"',
        '    $a3 = "CreateZipArchive"',
        '    $a4 = "TakeScreenshot"',
        "  condition:",
        "    all of them",
        "}",
      ].join("\n"),
    },
    "/home/analyst/case-0714/response/containment.md": {
      content: [
        "# Containment checklist",
        "",
        "1. Isolate the endpoint and preserve volatile memory plus the leftover staging directory.",
        "2. Reset browser, messaging, wallet, and Windows credentials used on the host.",
        "3. Hunt for the public hashes, staging names, memory strings, and defanged C2.",
        "4. Block known redirectors and distribution infrastructure after validation.",
        "5. Remove unapproved software and verify downloads through official vendor channels.",
        "6. Report active impersonation pages to GitHub and the impersonated vendor.",
        "",
        "Do not treat a signed parent process as proof that adjacent DLLs are trusted.",
      ].join("\n"),
    },
    "/home/analyst/case-0714/public-poc/boryptgrab_detection_notes.txt": {
      content: [
        "BoryptGrab GitHub impersonation campaign: public defensive mechanism excerpt",
        "",
        "Delivery pattern:",
        "  search result -> copied-brand repository -> concealed README link",
        "  -> github.io redirector -> templated download page -> rotating ZIP",
        "",
        "Execution pattern:",
        "  legitimate signed WinGUP updater, renamed for the lure",
        "  -> side-loads trojanized adjacent libcurl.dll",
        "  -> reflectively executes an in-memory stealer",
        "",
        "Hunt pivots:",
        "  - signed updater loading unsigned libcurl.dll from a user download directory",
        "  - %TEMP% staging tree containing decrypt_browser, Filegraber, Wallet, and Messenger",
        "  - memory strings such as CopyBrowserData, CreateZipArchive, and TakeScreenshot",
        "  - HTTP POST /upload to validated public campaign infrastructure",
        "",
        "No exploit or malware code appears in this excerpt.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "campaign-brief",
      phase: "Recon",
      goal: "Load the public campaign facts that frame this endpoint investigation.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/campaign-brief.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input intel/campaign-brief.txt",
        },
      ],
      narration:
        "The scale matters: 292 impersonation repositories, 78 still active during analysis, and no vendor vulnerability required.",
    },
    {
      id: "referral-chain",
      phase: "Initial access",
      goal: "Inspect the synthetic browser referral that turned a search result into a trusted-looking download.",
      hint: "`jq . evidence/referral.json`.",
      matches: [{ kind: "exact", command: "jq . evidence/referral.json" }],
      narration:
        "The lure stacks borrowed branding, an OFFICIAL PAGE button, and fake verification badges before leaving the repository.",
    },
    {
      id: "download-chain",
      phase: "Execution",
      goal: "Replay the quarantined download metadata without opening any archive.",
      hint:
        "`python3 safe_replay.py --scenario boryptgrab-github-impersonation --artifact evidence/download-manifest.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 safe_replay.py --scenario boryptgrab-github-impersonation --artifact evidence/download-manifest.txt",
        },
      ],
      narration:
        "A renamed signed WinGUP process is the decoy. The adjacent unsigned libcurl.dll is the side-loading pivot.",
    },
    {
      id: "side-load",
      phase: "Execution",
      goal: "Confirm the signed-parent and unsigned-DLL sequence in endpoint telemetry.",
      hint:
        "`tshark -r evidence.pcap -Y 'frame contains \"libcurl.dll\"' --follow-log telemetry/edr.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "libcurl.dll"\' --follow-log telemetry/edr.log',
        },
      ],
      narration:
        "Signature trust does not transfer to an adjacent library. The stealer then runs from memory.",
    },
    {
      id: "staging-tree",
      phase: "Discovery",
      goal: "Review what the smash-and-grab stealer left in its temporary staging directory.",
      hint: "`python3 ir_toolkit.py parse-artifact --input evidence/staging-tree.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input evidence/staging-tree.txt",
        },
      ],
      narration:
        "Browser material, messaging sessions, wallet inventory, and a screenshot were staged. No persistence was needed for a one-run theft.",
    },
    {
      id: "c2-pivot",
      phase: "Impact",
      goal: "Pivot the defanged public C2 indicator across the synthetic proxy log.",
      hint:
        "`python3 ir_toolkit.py extract-ioc --ioc 193.143.1[.]131 --input telemetry/proxy.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py extract-ioc --ioc 193.143.1[.]131 --input telemetry/proxy.log",
        },
      ],
      narration:
        "The proxy blocked a POST to /upload, but the host still requires credential resets because collection had already occurred.",
    },
    {
      id: "memory-detection",
      phase: "Detection",
      goal: "Apply the public YARA string themes to the represented memory capture.",
      hint: "`yara rules/BoryptGrab_infostealer.yara evidence/memory-snapshot.bin`.",
      matches: [
        {
          kind: "exact",
          command: "yara rules/BoryptGrab_infostealer.yara evidence/memory-snapshot.bin",
        },
      ],
      narration:
        "Memory strings connect browser copying, token theft, archiving, and screenshots to one collection workflow.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Turn the evidence into an endpoint, identity, network, and platform response.",
      hint: "`python3 ir_toolkit.py parse-artifact --input response/containment.md`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input response/containment.md",
        },
      ],
      narration:
        "Isolation is only the first move. Assume collected sessions and credentials are exposed, preserve evidence, hunt fleet-wide, and report active lures.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the archived public detection mechanism excerpt for this exhibit.",
      hint: "`head -n 80 public-poc/boryptgrab_detection_notes.txt`.",
      matches: [
        {
          kind: "exact",
          command: "head -n 80 public-poc/boryptgrab_detection_notes.txt",
        },
      ],
      narration:
        "The useful mechanism is defensive: repository trust abuse, rotating downloads, DLL side-loading, memory execution, and recoverable staging traces.",
    },
  ],
  debrief: {
    summary:
      "Arctic Wolf Labs reported that an unattributed, financially motivated actor created at least 292 brand-impersonation GitHub repositories from 26 June 2026 onward. Their README links led through GitHub Pages redirectors to a reused fake-download template. Rotating ZIPs paired a renamed, legitimate signed WinGUP updater with a trojanized libcurl.dll; DLL side-loading launched a BoryptGrab-lineage stealer in memory. The campaign targeted browser data, cryptocurrency wallets, messaging sessions, Windows credentials, files, screenshots, and system details, staged results under %TEMP%, and sent archives to command-and-control infrastructure. Sources: https://arcticwolf.com/resources/blog/fake-github-repositories-deliver-boryptgrab-lineage-infostealer/ and the 14 July 2026 report at https://www.bleepingcomputer.com/news/security/nearly-300-github-repos-pose-as-legit-software-to-push-malware/ Public indicators: https://github.com/rtkwlf/wolf-tools/tree/main/threat-intelligence/fake-github-repositories-deliver-boryptgrab-lineage-infostealer",
    lesson:
      "Legitimate hosting, copied branding, and a signed process are context, not proof of safety. Verify software through the vendor's known domain, inspect where release links actually lead, and alert when signed utilities load unsigned DLLs from user-writable directories. For smash-and-grab stealers, absence of persistence does not reduce identity impact: preserve memory and staging traces, rotate every credential and session available to the host, and hunt the same trust chain across browser, DNS, proxy, and endpoint telemetry.",
    simulated: [
      "The workstation, user, copied brand, repository, referral history, EDR events, proxy rows, and containment record are fictional.",
      "No ZIP, executable, DLL, memory image, live domain, or malware payload exists in the exhibit.",
      "The repository count, delivery pattern, WinGUP and libcurl.dll side-loading chain, data targets, staging artifacts, and defanged C2 are drawn from public reporting.",
    ],
  },
};
