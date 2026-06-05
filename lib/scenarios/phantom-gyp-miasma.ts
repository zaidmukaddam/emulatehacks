import type { Scenario } from "../types";

export const phantomGypMiasma: Scenario = {
  slug: "phantom-gyp-miasma",
  exhibit: "EXH-048",
  title: "Phantom Gyp Miasma",
  tagline:
    "June 4, 2026. StepSecurity reports a self-spreading npm worm that hides execution in binding.gyp instead of package.json scripts. Triage the poisoned tarball without running it.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/supply/phantom-gyp",
  user: "responder",
  host: "registry-triage-08",
  role: "Supply-chain incident responder reviewing a quarantined npm package from a CI runner.",
  objective:
    "Confirm the compromised version, identify the hidden node-gyp execution trigger, trace CI credential exposure signals, and verify containment steps.",
  briefing:
    "A June 4 public report says the Miasma worm compromised 57 npm packages across 286+ malicious versions by abusing binding.gyp, a native-addon build file that can execute during npm install without package.json lifecycle scripts. Your lab has a static tarball manifest, safe excerpts, CI logs, and containment receipts only. Nothing here runs malware or reaches npm.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/supply/phantom-gyp",
    NODE_ENV: "production",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls advisories package ci repo containment"],
  commands: {
    "npm view @vapi-ai/server-sdk@1.2.1 version": [
      "1.2.1",
      "(simulated: public reporting named this as one of the malicious versions observed in the June 2026 wave)",
    ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input advisories/stepsecurity-summary.txt": [
      "[ir_toolkit] artifact: advisories/stepsecurity-summary.txt",
      "[ir_toolkit] lines: 12  bytes: 1014",
      "   1| Public incident summary, June 4 2026",
      "   2| Source: StepSecurity and secondary Cyber Security News coverage.",
      "   3| Campaign: Miasma npm supply-chain worm using Phantom Gyp.",
      "   4| Scope reported: 57 packages, 286+ malicious versions.",
      "   5| First high-volume victim: @vapi-ai/server-sdk, hit around 2026-06-03 23:30 UTC.",
      "   6| Technique: weaponized binding.gyp makes npm invoke node-gyp rebuild during install.",
      "   7| Evasion: package.json has no preinstall or postinstall script.",
      "   8| Payload marker: tiny binding.gyp plus oversized root index.js not used by package main.",
      "   9| Impact: credential harvest from CI, cloud, npm, GitHub Actions, Vault, and developer tools.",
      "  10| Propagation: stolen npm tokens enumerate maintainer packages and republish tainted tarballs.",
      "  11| IOCs: attacker GitHub account liuende501, C2 keyword thebeautifulmarchoftime.",
      "  12| Response: block IOCs, quarantine affected versions, rotate credentials from touched runners.",
    ].join("\n"),
    "jq . package/package.json": [
      "{",
      '  "name": "@vapi-ai/server-sdk",',
      '  "version": "1.2.1",',
      '  "main": "./dist/index.js",',
      '  "scripts": {',
      '    "build": "tsup src/index.ts"',
      "  }",
      "}",
      "(simulated jq: no package.json lifecycle script explains execution)",
    ].join("\n"),
    "python3 safe_replay.py --scenario phantom-gyp-miasma --grep binding.gyp --artifact package/tarball-manifest.txt": [
      "[safe_replay] scenario=phantom-gyp-miasma",
      "[safe_replay] grep hits: 1",
      "5:binding.gyp                              157 B   root extra file, identical across sampled poisoned packages",
    ].join("\n"),
    "python3 safe_replay.py --scenario phantom-gyp-miasma --grep index.js --artifact package/tarball-manifest.txt": [
      "[safe_replay] scenario=phantom-gyp-miasma",
      "[safe_replay] grep hits: 3",
      "3:dist/index.js                            27 KB   declared package main, appears clean in this static view",
      "6:index.js                              4.50 MB   root extra file, obfuscated payload carrier",
      "8:hash root index.js: e3dbe63aded45278f49c4746ab938ed9472b3c92... (truncated public IOC)",
    ].join("\n"),
    "tshark -r evidence.pcap -Y 'frame contains \"liuende501\"' --follow-log ci/egress.log": [
      "2026-06-04T00:07:13Z runner=build-221 process=node-gyp dst=github.com account=liuende501 path=/repos/liuende501/results/contents/results-1717469233.json action=blocked",
      "2026-06-04T00:07:14Z runner=build-221 indicator=thebeautifulmarchoftime source=commit-search action=alert",
      "(simulated tshark: static log replay, not network capture parsing)",
    ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input repo/backdoor-scan.txt": [
      "[ir_toolkit] artifact: repo/backdoor-scan.txt",
      "[ir_toolkit] lines: 8  bytes: 521",
      "   1| Repository assistant-file sweep",
      "   2| .claude/setup.mjs            present=false",
      "   3| .cursor/rules/setup.mdc      present=true   reason=unexpected post-install edit",
      "   4| .gemini/settings.json        present=false",
      "   5| .vscode/setup.mjs            present=true   reason=unexpected post-install edit",
      "   6| owner=security response=quarantine branch=incident/phantom-gyp",
      "   7| note=public reporting named assistant backdoor files as Miasma artifacts",
      "   8| action=remove files after forensic copy",
    ].join("\n"),
    "tshark -r evidence.pcap --follow-log containment/rotation.log": [
      "2026-06-04T00:12Z quarantine package=@vapi-ai/server-sdk version=1.2.1 source=registry-proxy success",
      "2026-06-04T00:14Z block outbound host=github.com/liuende501 success",
      "2026-06-04T00:17Z revoke npm_token runner=build-221 success",
      "2026-06-04T00:22Z rotate github_actions_secrets repo=voice-agent success",
      "2026-06-04T00:28Z rotate cloud_secrets scope=ci-builders success",
      "2026-06-04T00:31Z rebuild lockfile from clean mirror success",
    ].join("\n"),
  },
  files: {
    "/home/supply/phantom-gyp/advisories/stepsecurity-summary.txt": {
      content: [
        "Public incident summary, June 4 2026",
        "Source: StepSecurity and secondary Cyber Security News coverage.",
        "Campaign: Miasma npm supply-chain worm using Phantom Gyp.",
        "Scope reported: 57 packages, 286+ malicious versions.",
        "First high-volume victim: @vapi-ai/server-sdk, hit around 2026-06-03 23:30 UTC.",
        "Technique: weaponized binding.gyp makes npm invoke node-gyp rebuild during install.",
        "Evasion: package.json has no preinstall or postinstall script.",
        "Payload marker: tiny binding.gyp plus oversized root index.js not used by package main.",
        "Impact: credential harvest from CI, cloud, npm, GitHub Actions, Vault, and developer tools.",
        "Propagation: stolen npm tokens enumerate maintainer packages and republish tainted tarballs.",
        "IOCs: attacker GitHub account liuende501, C2 keyword thebeautifulmarchoftime.",
        "Response: block IOCs, quarantine affected versions, rotate credentials from touched runners.",
      ].join("\n"),
    },
    "/home/supply/phantom-gyp/package/package.json": {
      content: [
        "{",
        '  "name": "@vapi-ai/server-sdk",',
        '  "version": "1.2.1",',
        '  "main": "./dist/index.js",',
        '  "scripts": {',
        '    "build": "tsup src/index.ts"',
        "  }",
        "}",
      ].join("\n"),
    },
    "/home/supply/phantom-gyp/package/tarball-manifest.txt": {
      content: [
        "Quarantined tarball manifest, static listing only",
        "",
        "dist/index.js                            27 KB   declared package main, appears clean in this static view",
        "package.json                            654 B    no install scripts",
        "binding.gyp                              157 B   root extra file, identical across sampled poisoned packages",
        "index.js                              4.50 MB   root extra file, obfuscated payload carrier",
        "",
        "hash binding.gyp: ef641e956f91d501b748085996303c96a64d6... (truncated public IOC)",
        "hash root index.js: e3dbe63aded45278f49c4746ab938ed9472b3c92... (truncated public IOC)",
      ].join("\n"),
    },
    "/home/supply/phantom-gyp/ci/egress.log": {
      content: [
        "2026-06-04T00:07:13Z runner=build-221 process=node-gyp dst=github.com account=liuende501 path=/repos/liuende501/results/contents/results-1717469233.json action=blocked",
        "2026-06-04T00:07:14Z runner=build-221 indicator=thebeautifulmarchoftime source=commit-search action=alert",
      ].join("\n"),
    },
    "/home/supply/phantom-gyp/repo/backdoor-scan.txt": {
      content: [
        "Repository assistant-file sweep",
        ".claude/setup.mjs            present=false",
        ".cursor/rules/setup.mdc      present=true   reason=unexpected post-install edit",
        ".gemini/settings.json        present=false",
        ".vscode/setup.mjs            present=true   reason=unexpected post-install edit",
        "owner=security response=quarantine branch=incident/phantom-gyp",
        "note=public reporting named assistant backdoor files as Miasma artifacts",
        "action=remove files after forensic copy",
      ].join("\n"),
    },
    "/home/supply/phantom-gyp/containment/rotation.log": {
      content: [
        "2026-06-04T00:12Z quarantine package=@vapi-ai/server-sdk version=1.2.1 source=registry-proxy success",
        "2026-06-04T00:14Z block outbound host=github.com/liuende501 success",
        "2026-06-04T00:17Z revoke npm_token runner=build-221 success",
        "2026-06-04T00:22Z rotate github_actions_secrets repo=voice-agent success",
        "2026-06-04T00:28Z rotate cloud_secrets scope=ci-builders success",
        "2026-06-04T00:31Z rebuild lockfile from clean mirror success",
      ].join("\n"),
    },
    "/home/supply/phantom-gyp/public-poc/phantom_gyp_stub.txt": {
      content: [
        "Museum excerpt: Phantom Gyp mechanism, inert paraphrase",
        "",
        "Normal npm behavior:",
        "  If a package contains binding.gyp, npm may invoke node-gyp rebuild during install.",
        "",
        "Reported abuse pattern:",
        "  1. Keep package.json free of preinstall and postinstall scripts.",
        "  2. Add a tiny binding.gyp file that abuses gyp expansion to start a local payload.",
        "  3. Place an oversized root index.js beside the real dist/index.js.",
        "  4. Let CI systems execute install-time code while scanners focus on package.json.",
        "",
        "This exhibit omits the real command substitution and payload bytes.",
        "Defender check: inspect tarball contents, not just package.json metadata.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "registry-version",
      phase: "Recon",
      goal: "Confirm the exact compromised package version named in the public report.",
      hint: "`npm view @vapi-ai/server-sdk@1.2.1 version`.",
      matches: [{ kind: "exact", command: "npm view @vapi-ai/server-sdk@1.2.1 version" }],
      narration:
        "You pin the investigation to a concrete semver before touching the quarantined tarball.",
    },
    {
      id: "public-summary",
      phase: "Recon",
      goal: "Read the distilled public advisory facts your team mirrored for responders.",
      hint: "`python3 ir_toolkit.py parse-artifact --input advisories/stepsecurity-summary.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input advisories/stepsecurity-summary.txt",
        },
      ],
      narration:
        "The critical clue is negative space: no package.json lifecycle script, yet install-time execution still occurred.",
    },
    {
      id: "package-json",
      phase: "Initial access",
      goal: "Show that package.json does not declare the usual install hooks defenders scan first.",
      hint: "`jq . package/package.json`.",
      matches: [{ kind: "exact", command: "jq . package/package.json" }],
      narration:
        "If your control only looks for preinstall and postinstall, this attack walks around it.",
    },
    {
      id: "binding-gyp",
      phase: "Execution",
      goal: "Find the unexpected binding.gyp file in the package tarball manifest.",
      hint:
        "`python3 safe_replay.py --scenario phantom-gyp-miasma --grep binding.gyp --artifact package/tarball-manifest.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 safe_replay.py --scenario phantom-gyp-miasma --grep binding.gyp --artifact package/tarball-manifest.txt",
        },
      ],
      narration:
        "A 157-byte build file is enough to change the install path when npm decides native build tooling is involved.",
    },
    {
      id: "oversized-index",
      phase: "Execution",
      goal: "Compare the declared dist entry point with the oversized root index.js payload carrier.",
      hint:
        "`python3 safe_replay.py --scenario phantom-gyp-miasma --grep index.js --artifact package/tarball-manifest.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 safe_replay.py --scenario phantom-gyp-miasma --grep index.js --artifact package/tarball-manifest.txt",
        },
      ],
      narration:
        "The real application entry stays small while the root file balloons. Tarball-level review catches what dependency manifests hide.",
    },
    {
      id: "egress-ioc",
      phase: "Impact",
      goal: "Replay CI egress telemetry for the attacker-controlled GitHub account IOC.",
      hint:
        "`tshark -r evidence.pcap -Y 'frame contains \"liuende501\"' --follow-log ci/egress.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "liuende501"\' --follow-log ci/egress.log',
        },
      ],
      narration:
        "Credential theft in CI turns an install event into an organization-wide rotation problem.",
    },
    {
      id: "assistant-backdoors",
      phase: "Persistence",
      goal: "Inspect the repository sweep for unexpected AI assistant configuration files.",
      hint: "`python3 ir_toolkit.py parse-artifact --input repo/backdoor-scan.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input repo/backdoor-scan.txt",
        },
      ],
      narration:
        "The public reporting called out assistant config files as persistence-like artifacts. Treat them as code changes that require review, not editor clutter.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify package quarantine, IOC blocking, credential rotation, and clean rebuild steps.",
      hint: "`tshark -r evidence.pcap --follow-log containment/rotation.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/rotation.log" }],
      narration:
        "Containment is not just yanking one package. Every runner secret exposed during install must be treated as spent.",
    },
    {
      id: "mechanism-excerpt",
      goal: "Review the inert mechanism excerpt for why binding.gyp changed the threat model.",
      hint: "`head -n 80 public-poc/phantom_gyp_stub.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/phantom_gyp_stub.txt" }],
      narration:
        "The safe takeaway is simple: audit published tarballs and native build triggers, not only package.json scripts.",
    },
  ],
  debrief: {
    summary:
      "StepSecurity reported on June 4, 2026 that a Miasma npm supply-chain wave used a Phantom Gyp technique: attackers compromised 57 packages across 286+ malicious versions, including @vapi-ai/server-sdk, and hid install-time execution in binding.gyp instead of package.json lifecycle scripts. Secondary coverage by Cyber Security News / HEAL Security repeated the reported scope, the 157-byte binding.gyp trigger, the oversized root index.js payload carrier, the liuende501 GitHub IOC, and the AI assistant file artifacts. Sources: https://www.stepsecurity.io/blog/binding-gyp-npm-supply-chain-attack-spreads-like-worm and https://healsecurity.com/binding-gyp-supply-chain-attack-compromises-dozens-of-npm-packages-across-maintainer-accounts/",
    lesson:
      "Supply-chain review has to inspect the packed artifact and build side effects, not only registry metadata. Block native build execution where possible, quarantine exact affected versions, watch CI egress, and rotate every credential present on a runner that installed a poisoned package.",
    simulated: [
      "The lab host, runner IDs, repository names, logs, and containment timestamps are synthetic.",
      "The scenario includes only inert summaries and static file manifests. It omits real payload bytes and the real binding.gyp command substitution.",
      "The reported campaign name, Phantom Gyp technique, 57-package scope, 286+ malicious versions, affected @vapi-ai/server-sdk versions, liuende501 IOC, and assistant-file artifact categories come from public reporting.",
    ],
  },
};
