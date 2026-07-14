import type { Scenario } from "../types";

/**
 * Defensive reconstruction of the July 2026 Jscrambler npm package compromise.
 * Sources:
 * - https://jscrambler.com/blog/security-advisory-malicious-npm-package
 * - https://socket.dev/blog/jscrambler-supply-chain-attack
 *
 * All hosts, logs, and organization details are synthetic. No malware is included.
 */
export const jscramblerNpmStealer: Scenario = {
  slug: "jscrambler-npm-stealer",
  exhibit: "EXH-048",
  title: "Trusted Package, Hidden Stealer",
  tagline:
    "13 July 2026. New reporting details malicious Jscrambler npm releases that targeted developer and CI secrets. Trace the package swap, execution paths, and containment.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 11,
  fictional: true,
  cwd: "/home/supply/jscrambler-response",
  user: "responder",
  host: "build-ir-07",
  role: "Supply-chain responder investigating a synthetic CI runner that resolved a compromised Jscrambler release.",
  objective:
    "Confirm exposure, identify both install-time and import-time execution paths, scope credentials at risk, and verify package removal plus secret rotation.",
  briefing:
    "Jscrambler reported that a compromised npm publishing credential was used to publish unauthorized releases. Socket found that early releases used a preinstall hook, while later releases moved the same loader into package entry points. Work only from quarantined metadata and synthetic telemetry. Do not execute package contents.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/supply/jscrambler-response",
    CI: "true",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "npm ls jscrambler --all"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/vendor-advisory.txt": [
      "JSCRAMBLER SECURITY ADVISORY - incident summary",
      "affected: jscrambler 8.14, 8.16, 8.17, 8.18, 8.20",
      "safe: 8.22 or later",
      "known downloads: 1,479 across affected packages",
      "initial access: compromised npm publishing credential",
      "status: affected releases deprecated; investigation ongoing",
      "",
    ],
    "npm ls jscrambler --all": [
      "checkout-web@4.12.0 /builds/checkout-web",
      "└─┬ jscrambler-webpack-plugin@8.6.2",
      "  └── jscrambler@8.18.0",
      "",
      "exposure: affected transitive release resolved on runner ci-web-214",
      "",
    ],
    "python3 ir_toolkit.py parse-artifact --input evidence/package-diff.txt": [
      "8.14.0 / 8.16.0 / 8.17.0:",
      '  package.json added "preinstall": "node dist/setup.js"',
      "8.18.0 / 8.20.0:",
      "  install hook removed",
      "  loader injected into dist/index.js and dist/bin/jscrambler.js",
      "  execution moved to package import or CLI launch",
      "  self-dependency could resolve a compromised release transitively",
      "",
    ],
    "python3 ir_toolkit.py extract-ioc --ioc a742de963f14a92d24ebcbc7b44ac867e23a20d31d1b0094a13a4f83287f4e60 --input evidence/hash-report.txt":
      "MATCH dist/setup.js sha256=a742de963f14a92d24ebcbc7b44ac867e23a20d31d1b0094a13a4f83287f4e60 source=quarantine/ci-web-214\n",
    "tshark -r evidence.pcap -Y 'frame contains \"dist/bin/jscrambler.js\"' --follow-log logs/ci-install.log": [
      "2026-07-11T15:46:03Z runner=ci-web-214 npm resolved jscrambler@8.18.0",
      "2026-07-11T15:46:05Z lifecycle_hook=none",
      "2026-07-11T15:47:18Z command=\"npx jscrambler -c jscrambler.json\"",
      "2026-07-11T15:47:18Z module_load=dist/bin/jscrambler.js detached_child=true",
      "",
    ],
    "tshark -r evidence.pcap -Y 'http.request.uri == \"/upload\"' --follow-log logs/egress.log": [
      "2026-07-11T15:47:21Z src=ci-web-214 dst=203.0.113.88 tls=true method=POST path=/upload",
      "2026-07-11T15:47:21Z content_type=multipart/form-data bytes=48211 action=blocked",
      "note: destination is TEST-NET-3 synthetic museum telemetry",
      "",
    ],
    "python3 ir_toolkit.py parse-artifact --input analysis/exposure-matrix.txt": [
      "runner access review",
      "HIGH  deployment token present in process environment",
      "HIGH  cloud workload credential mounted for release job",
      "HIGH  repository source and CI configuration available",
      "MED   package cache shared with two later jobs",
      "N/A   browser wallets and desktop messaging profiles absent on ephemeral runner",
      "",
    ],
    "jq . containment/registry-status.json": [
      "{",
      '  "jscrambler": "8.22.0",',
      '  "lockfile_clean": true,',
      '  "affected_versions_blocked": ["8.14.0", "8.16.0", "8.17.0", "8.18.0", "8.20.0"],',
      '  "registry_cache_purged": true',
      "}",
      "",
    ],
    "tshark -r evidence.pcap --follow-log containment/actions.log": [
      "2026-07-11T16:02Z isolate_runner ci-web-214 success",
      "2026-07-11T16:05Z purge_registry_cache jscrambler affected_versions success",
      "2026-07-11T16:11Z rotate_secret deployment_token success",
      "2026-07-11T16:14Z rotate_identity cloud_workload_credential success",
      "2026-07-11T16:21Z rebuild_runner image=verified-clean success",
      "2026-07-11T16:29Z pin_package jscrambler@8.22.0 success",
      "",
    ],
  },
  files: {
    "/home/supply/jscrambler-response/ir_toolkit.py": {
      content: [
        "#!/usr/bin/env python3",
        '"""Inert museum helper. The shell returns canned defensive evidence only."""',
        "raise SystemExit('simulated helper: no package content is executed')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/supply/jscrambler-response/intel/vendor-advisory.txt": {
      content: [
        "Jscrambler advisory snapshot - updated 13 July 2026",
        "Affected jscrambler releases: 8.14, 8.16, 8.17, 8.18, 8.20",
        "Safe release: 8.22 or later",
        "Known downloads reported by npm: 1,479",
        "Vendor finding: unauthorized publication used an npm publishing credential",
        "Vendor response: deprecation, credential rotation, publishing pipeline hardening",
      ].join("\n"),
    },
    "/home/supply/jscrambler-response/evidence/package-diff.txt": {
      content: [
        "Sanitized package comparison from Socket reporting",
        "",
        "8.14.0, 8.16.0, 8.17.0:",
        '+ package.json scripts.preinstall = "node dist/setup.js"',
        "+ dist/setup.js loader",
        "+ dist/intro.js disguised binary container",
        "",
        "8.18.0, 8.20.0:",
        "- preinstall hook",
        "+ self-executing loader in dist/index.js",
        "+ self-executing loader in dist/bin/jscrambler.js",
        '+ dependency "jscrambler": "^8.17.0"',
      ].join("\n"),
    },
    "/home/supply/jscrambler-response/evidence/hash-report.txt": {
      content: [
        "Quarantine hash report",
        "a742de963f14a92d24ebcbc7b44ac867e23a20d31d1b0094a13a4f83287f4e60  dist/setup.js",
        "a41a523ef9517aab37ed6eea0ec881821bdcb7aefcb5c5f603adc7907f868c86  dist/intro.js",
        "No executable payloads retained in this museum exhibit.",
      ].join("\n"),
    },
    "/home/supply/jscrambler-response/logs/ci-install.log": {
      content: [
        "2026-07-11T15:46:03Z runner=ci-web-214 npm resolved jscrambler@8.18.0",
        "2026-07-11T15:46:05Z lifecycle_hook=none",
        "2026-07-11T15:47:18Z command=npx-jscrambler module_load=dist/bin/jscrambler.js",
        "2026-07-11T15:47:18Z detached_child=true source=module-entrypoint",
      ].join("\n"),
    },
    "/home/supply/jscrambler-response/logs/egress.log": {
      content: [
        "2026-07-11T15:47:21Z src=ci-web-214 dst=203.0.113.88 tls=true method=POST path=/upload",
        "2026-07-11T15:47:21Z content_type=multipart/form-data bytes=48211 action=blocked",
        "203.0.113.88 is a synthetic TEST-NET-3 address, not a published indicator.",
      ].join("\n"),
    },
    "/home/supply/jscrambler-response/analysis/exposure-matrix.txt": {
      content: [
        "Credential and data exposure matrix for synthetic runner ci-web-214",
        "deployment token: present, rotate",
        "cloud workload credential: present, rotate",
        "repository source: present, review access logs",
        "shared npm cache: present, purge and inspect downstream jobs",
        "browser, wallet, AI-tool, and messaging profiles: absent on ephemeral runner",
      ].join("\n"),
    },
    "/home/supply/jscrambler-response/containment/registry-status.json": {
      content: [
        "{",
        '  "jscrambler": "8.22.0",',
        '  "lockfile_clean": true,',
        '  "affected_versions_blocked": ["8.14.0", "8.16.0", "8.17.0", "8.18.0", "8.20.0"],',
        '  "registry_cache_purged": true',
        "}",
      ].join("\n"),
    },
    "/home/supply/jscrambler-response/containment/actions.log": {
      content: [
        "2026-07-11T16:02Z isolate_runner ci-web-214 success",
        "2026-07-11T16:05Z purge_registry_cache jscrambler affected_versions success",
        "2026-07-11T16:11Z rotate_secret deployment_token success",
        "2026-07-11T16:14Z rotate_identity cloud_workload_credential success",
        "2026-07-11T16:21Z rebuild_runner image=verified-clean success",
        "2026-07-11T16:29Z pin_package jscrambler@8.22.0 success",
      ].join("\n"),
    },
    "/home/supply/jscrambler-response/public-poc/jscrambler_loader_stub.js": {
      content: [
        "/**",
        " * Inert museum sketch of the disclosed delivery sequence.",
        " *",
        " * Early affected versions: npm preinstall invoked dist/setup.js.",
        " * Later affected versions: package import or CLI load reached an injected loader.",
        " * Reported loader behavior: select a platform payload, write a hidden temp file,",
        " * launch it detached, and target developer and cloud credentials.",
        " *",
        " * No loader, binary container, process spawn, or network code is included.",
        " */",
        "const status = Object.freeze({ executable: false, payloadIncluded: false });",
        "void status;",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "advisory",
      phase: "Recon",
      goal: "Load the vendor-confirmed affected and safe release set.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/vendor-advisory.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/vendor-advisory.txt" },
      ],
      narration:
        "The response starts from verified scope: five affected releases, 8.22 as the safe floor, and a compromised publishing credential.",
    },
    {
      id: "dependency-tree",
      phase: "Recon",
      goal: "Determine whether the affected package reached this runner directly or transitively.",
      hint: "`npm ls jscrambler --all`.",
      matches: [{ kind: "exact", command: "npm ls jscrambler --all" }],
      narration:
        "The runner resolved jscrambler 8.18.0 through an affected plugin, so transitive installs count as exposure.",
    },
    {
      id: "delivery-diff",
      phase: "Execution",
      goal: "Compare the early lifecycle hook with the later import-time delivery path.",
      hint: "`python3 ir_toolkit.py parse-artifact --input evidence/package-diff.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input evidence/package-diff.txt" },
      ],
      narration:
        "The attacker moved beyond preinstall, meaning ignore-scripts alone would not protect consumers of the later releases.",
    },
    {
      id: "hash",
      phase: "Detection",
      goal: "Match the quarantined loader metadata against the published setup.js hash.",
      hint:
        "`python3 ir_toolkit.py extract-ioc --ioc a742de963f14a92d24ebcbc7b44ac867e23a20d31d1b0094a13a4f83287f4e60 --input evidence/hash-report.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py extract-ioc --ioc a742de963f14a92d24ebcbc7b44ac867e23a20d31d1b0094a13a4f83287f4e60 --input evidence/hash-report.txt",
        },
      ],
      narration:
        "The published loader hash confirms the package artefact while the exhibit keeps all executable payloads out of reach.",
    },
    {
      id: "execution-log",
      phase: "Detection",
      goal: "Find the later release executing from its CLI entry point without a lifecycle hook.",
      hint:
        "`tshark -r evidence.pcap -Y 'frame contains \"dist/bin/jscrambler.js\"' --follow-log logs/ci-install.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "tshark -r evidence.pcap -Y 'frame contains \"dist/bin/jscrambler.js\"' --follow-log logs/ci-install.log",
        },
      ],
      narration:
        "No preinstall event appears. The CLI import is the trigger, which is the evasion responders must include in their hunt.",
    },
    {
      id: "egress",
      phase: "Impact",
      goal: "Inspect the synthetic upload attempt immediately after package entry-point execution.",
      hint:
        "`tshark -r evidence.pcap -Y 'http.request.uri == \"/upload\"' --follow-log logs/egress.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "tshark -r evidence.pcap -Y 'http.request.uri == \"/upload\"' --follow-log logs/egress.log",
        },
      ],
      narration:
        "Socket reported a TLS multipart POST to /upload. This synthetic control fired before the transfer completed.",
    },
    {
      id: "scope",
      phase: "Impact",
      goal: "Prioritize credentials and data available to the affected CI process.",
      hint: "`python3 ir_toolkit.py parse-artifact --input analysis/exposure-matrix.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input analysis/exposure-matrix.txt" },
      ],
      narration:
        "Scope from process access, not the malware's entire target list. Here, deployment and cloud credentials are the urgent risks.",
    },
    {
      id: "package-containment",
      phase: "Containment",
      goal: "Verify the clean pin, block list, lockfile, and registry cache state.",
      hint: "`jq . containment/registry-status.json`.",
      matches: [{ kind: "exact", command: "jq . containment/registry-status.json" }],
      narration:
        "A clean manifest is insufficient if a proxy cache can still serve a deprecated package. Both are now controlled.",
    },
    {
      id: "response-actions",
      phase: "Containment",
      goal: "Confirm runner isolation, credential rotation, rebuild, and safe package pinning.",
      hint: "`tshark -r evidence.pcap --follow-log containment/actions.log`.",
      matches: [
        { kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/actions.log" },
      ],
      narration:
        "Treat any machine that loaded an affected release as compromised: rotate reachable secrets and rebuild from a clean image.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Review",
      goal: "Review the inert mechanism sketch preserved for the museum debrief.",
      hint: "`head -n 80 public-poc/jscrambler_loader_stub.js`.",
      matches: [
        { kind: "exact", command: "head -n 80 public-poc/jscrambler_loader_stub.js" },
      ],
      narration:
        "The sketch preserves the defensive lesson without retaining a loader, native payload, or exfiltration code.",
    },
  ],
  debrief: {
    summary:
      "On 11 July 2026, unauthorized Jscrambler npm releases were published using a compromised npm publishing credential. The vendor listed 8.14, 8.16, 8.17, 8.18, and 8.20 as affected, reported 1,479 downloads across affected packages, deprecated the releases, rotated credentials, and designated 8.22 as safe. Socket found that the first three malicious releases used a preinstall hook, while 8.18 and 8.20 moved the same loader into package entry points so it ran on import or CLI execution. Sources: https://jscrambler.com/blog/security-advisory-malicious-npm-package and https://socket.dev/blog/jscrambler-supply-chain-attack",
    lesson:
      "Package incident response must inspect resolved dependency trees, lifecycle scripts, runtime entry points, lockfiles, and registry caches. If a credential stealer reached a developer machine or CI runner, removing the package is only the first step. Rotate every secret the affected process could read and rebuild the host from a trusted image.",
    simulated: [
      "The organization, runner, timestamps after package resolution, dependency tree, network event, and containment receipts are synthetic.",
      "203.0.113.88 is a reserved TEST-NET-3 address and is not a published indicator.",
      "No malicious package, binary container, native payload, persistence logic, or working exfiltration code is included.",
    ],
  },
};
