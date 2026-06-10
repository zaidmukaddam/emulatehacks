import type { Scenario } from "../types";

/**
 * Grounded in June 2026 reporting on the Hades branch of Shai-Hulud/Miasma:
 * PyPI startup hooks, Bun-staged JavaScript, CI secret harvesting, and phantom
 * releases. All evidence is synthetic and defensive. No payload code executes.
 */
export const hadesPypiShaiHulud: Scenario = {
  slug: "hades-pypi-shai-hulud",
  exhibit: "EXH-048",
  title: "Hades Startup Hook",
  tagline:
    "June 8, 2026. A new Shai-Hulud wave lands in PyPI wheels, runs through startup hooks before import, and hunts CI secrets across package ecosystems.",
  category: "modern-cloud",
  difficulty: "advanced",
  era: "2020s",
  year: "2026",
  estMinutes: 11,
  fictional: true,
  cwd: "/home/supply/hades-response",
  user: "responder",
  host: "ci-hades-07",
  role: "Supply-chain responder triaging a June 2026 Hades PyPI compromise from registry and CI telemetry.",
  objective:
    "Trace a compromised PyPI wheel from lockfile to .pth startup hook, Bun-staged loader, runner-memory scrape, phantom release, and credential rotation.",
  briefing:
    "Public reporting on June 9, 2026 described new Shai-Hulud/Miasma variants crossing NPM and PyPI. The Hades branch used PyPI startup hooks and Bun-staged JavaScript to steal developer and CI credentials, then attempted to spread through package publishing rights. This exhibit uses safe museum artifacts to practice the defender workflow.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/supply/hades-response" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/securityweek-june9-brief.txt":
      "simulated safe tool replay for hades-pypi-shai-hulud; replaces: cat intel/securityweek-june9-brief.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc ensmallen --input manifests/requirements-lock.txt":
      "simulated safe tool replay for hades-pypi-shai-hulud; replaces: grep -nF ensmallen manifests/requirements-lock.txt\n",
    "python3 ir_toolkit.py parse-artifact --input wheels/ensmallen-0.8.101.dist-info/RECORD":
      "simulated safe tool replay for hades-pypi-shai-hulud; replaces: cat wheels/ensmallen-0.8.101.dist-info/RECORD\n",
    "python3 ir_toolkit.py parse-artifact --input site-packages/ensmallen_setup.pth":
      "simulated safe tool replay for hades-pypi-shai-hulud; replaces: cat site-packages/ensmallen_setup.pth\n",
    "tshark -r evidence.pcap -Y 'frame contains \"bun-bootstrap\"' --follow-log telemetry/process.log":
      "simulated safe tool replay for hades-pypi-shai-hulud; replaces: grep -nF bun-bootstrap telemetry/process.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"Runner.Worker\"' --follow-log telemetry/secrets.log":
      "simulated safe tool replay for hades-pypi-shai-hulud; replaces: grep -nF Runner.Worker telemetry/secrets.log\n",
    "jq . registry/provenance-alert.json":
      "simulated safe tool replay for hades-pypi-shai-hulud; replaces: cat registry/provenance-alert.json\n",
    "tshark -r evidence.pcap --follow-log containment/rotation.log":
      "simulated safe tool replay for hades-pypi-shai-hulud; replaces: cat containment/rotation.log\n",
  },
  files: {
    "/home/supply/hades-response/ir_toolkit.py": {
      content: [
        "#!/usr/bin/env python3",
        '"""Scenario helper for safe incident-response parsing.',
        "",
        "Supported modes in this exhibit:",
        "  parse-artifact --input PATH",
        "  extract-ioc --ioc VALUE --input PATH",
        "",
        "The museum shell intercepts exact commands from scenario.commands.",
        "No code runs and no network is touched.",
        '"""',
        "raise SystemExit('simulated helper: canned output only')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/supply/hades-response/intel/securityweek-june9-brief.txt": {
      content: [
        "SecurityWeek public brief, 2026-06-09, Hades branch of Shai-Hulud/Miasma",
        "",
        "- New Shai-Hulud variants hit more than 100 NPM and PyPI packages.",
        "- Miasma hit NPM first; by June 5 researchers counted at least 57 NPM packages and 300 malicious versions.",
        "- Hades reached PyPI through startup hooks. Initial reports described roughly two dozen packages with *-setup.pth files.",
        "- On June 8, a second Hades wave hit PyPI. StepSecurity counted at least 29 affected packages.",
        "- SecurityWeek reported 471 total malicious artifacts across affected NPM and PyPI packages.",
        "- Defensive focus: identify startup hooks, rotate credentials reachable from developer workstations and CI, and compare registry releases with source control history.",
        "",
        "Sources:",
        "SecurityWeek: https://www.securityweek.com/over-100-npm-pypi-packages-hit-in-new-shai-hulud-supply-chain-attacks/",
        "StepSecurity: https://www.stepsecurity.io/blog/the-hades-campaign-pypi-packages",
      ].join("\n"),
    },
    "/home/supply/hades-response/manifests/requirements-lock.txt": {
      content: [
        "# Frozen CI image for graph analytics smoke tests, captured 2026-06-08T18:04Z",
        "numpy==2.3.0",
        "networkx==3.5",
        "ensmallen==0.8.101",
        "mflux-streamlit==0.0.4",
        "pytest==8.5.1",
      ].join("\n"),
    },
    "/home/supply/hades-response/wheels/ensmallen-0.8.101.dist-info/RECORD": {
      content: [
        "ensmallen/__init__.py,sha256=clean-metadata-stub,128",
        "ensmallen/graph.py,sha256=clean-code-stub,9421",
        "ensmallen_setup.pth,sha256=unexpected-startup-hook,173",
        "_index.js,sha256=redacted-hades-loader,0",
        "hades_bun_stage,sha256=redacted-bun-wrapper,0",
        "ensmallen-0.8.101.dist-info/METADATA,sha256=package-metadata,804",
        "",
        "Museum note: _index.js and hades_bun_stage are zero-byte placeholders in this exhibit.",
      ].join("\n"),
    },
    "/home/supply/hades-response/site-packages/ensmallen_setup.pth": {
      content: [
        "# PyPI path configuration file found in the compromised wheel.",
        "# Real Hades samples abused .pth startup execution before imports.",
        "# This museum line is inert documentation only; payload text has been removed.",
        "import site  # museum marker: startup hook present, executable payload stripped",
      ].join("\n"),
    },
    "/home/supply/hades-response/telemetry/process.log": {
      content: [
        "2026-06-08T18:06:11Z host=ci-hades-07 proc=python argv='-m pytest' event=site_startup",
        "2026-06-08T18:06:12Z host=ci-hades-07 proc=python file=ensmallen_setup.pth event=startup_hook_loaded",
        "2026-06-08T18:06:13Z host=ci-hades-07 proc=python child=bun-bootstrap source=wheel-cache action=blocked",
        "2026-06-08T18:06:13Z host=ci-hades-07 egress=deny reason=no-approved-runtime-download",
      ].join("\n"),
    },
    "/home/supply/hades-response/telemetry/secrets.log": {
      content: [
        "2026-06-08T18:06:14Z detector=runner-memory source=Runner.Worker target=GITHUB_TOKEN status=attempted redacted=true",
        "2026-06-08T18:06:14Z detector=registry-creds source=env target=PYPI_API_TOKEN status=attempted redacted=true",
        "2026-06-08T18:06:15Z detector=cloud-creds source=filesystem target=AWS_SHARED_CREDENTIALS_FILE status=not_present",
        "2026-06-08T18:06:16Z detector=github-deaddrop action=create-public-repo status=blocked token_scope=read-only",
      ].join("\n"),
    },
    "/home/supply/hades-response/registry/provenance-alert.json": {
      content: [
        "{",
        '  "package": "ensmallen",',
        '  "version": "0.8.101",',
        '  "ecosystem": "pypi",',
        '  "published_at": "2026-06-08T17:58:44Z",',
        '  "source_repo_matching_tag": false,',
        '  "phantom_release": true,',
        '  "startup_hook": "ensmallen_setup.pth",',
        '  "slsa_like_provenance_present": true,',
        '  "decision": "yank version, revoke publishing credentials, rotate CI secrets"',
        "}",
      ].join("\n"),
    },
    "/home/supply/hades-response/containment/rotation.log": {
      content: [
        "2026-06-08T18:09Z quarantine_runner host=ci-hades-07 success",
        "2026-06-08T18:11Z yank_pypi package=ensmallen version=0.8.101 success",
        "2026-06-08T18:12Z block_hash sha256=unexpected-startup-hook success",
        "2026-06-08T18:18Z rotate_secret name=GITHUB_TOKEN issuer=actions success",
        "2026-06-08T18:19Z rotate_secret name=PYPI_API_TOKEN scope=package-publish success",
        "2026-06-08T18:23Z audit_release_history result=phantom-release-window-closed",
      ].join("\n"),
    },
    "/home/supply/hades-response/public-poc/pth_startup_hook_stub.py": {
      content: [
        "#!/usr/bin/env python3",
        '"""Defensive sketch: detect Python .pth startup hooks in installed wheels.',
        "",
        "Do not execute package startup code during triage. Read wheel metadata offline,",
        "flag unexpected .pth files, then compare each registry release to source control.",
        "",
        "Hades reporting described Bun-staged JavaScript triggered through PyPI startup hooks.",
        "This file contains no loader, no network client, and no credential logic.",
        '"""',
        "",
        "SUSPICIOUS_SUFFIXES = ('.pth', '_index.js')",
        "",
        "def explain() -> str:",
        "    return 'Unexpected .pth files in wheels should trigger secret rotation review.'",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
  },
  steps: [
    {
      id: "brief",
      phase: "Recon",
      goal: "Load the public June 9 reporting summary for Hades and Miasma.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/securityweek-june9-brief.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input intel/securityweek-june9-brief.txt",
        },
      ],
      narration:
        "Keep the scope clear: this is the June 8 PyPI wave inside a broader June Shai-Hulud/Miasma campaign.",
    },
    {
      id: "lockfile",
      phase: "Recon",
      goal: "Find the compromised graph package version in the CI lockfile.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc ensmallen --input manifests/requirements-lock.txt`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc ensmallen --input manifests/requirements-lock.txt",
        },
      ],
      narration:
        "The lockfile pins `ensmallen==0.8.101`, one of the graph ML package names called out in Hades reporting.",
    },
    {
      id: "record",
      phase: "Initial access",
      goal: "Inspect wheel metadata for unexpected startup and loader files.",
      hint: "`python3 ir_toolkit.py parse-artifact --input wheels/ensmallen-0.8.101.dist-info/RECORD`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input wheels/ensmallen-0.8.101.dist-info/RECORD",
        },
      ],
      narration:
        "A .pth file plus a staged JavaScript marker is the Hades shape. Treat the runner as exposed before you debate intent.",
    },
    {
      id: "pth",
      phase: "Execution",
      goal: "Review the path configuration hook that would run at Python startup.",
      hint: "`python3 ir_toolkit.py parse-artifact --input site-packages/ensmallen_setup.pth`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input site-packages/ensmallen_setup.pth",
        },
      ],
      narration:
        "Hades mattered because Python startup could trigger code before a developer intentionally imported the package.",
    },
    {
      id: "bun",
      phase: "Execution",
      goal: "Correlate the startup hook with a blocked Bun bootstrap attempt.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"bun-bootstrap\"' --follow-log telemetry/process.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "bun-bootstrap"\' --follow-log telemetry/process.log',
        },
      ],
      narration:
        "The package is Python, but the reported loader staged JavaScript through Bun. Cross-runtime detection catches that pivot.",
    },
    {
      id: "secrets",
      phase: "Credential access",
      goal: "Show attempted runner-memory and registry-token harvesting.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"Runner.Worker\"' --follow-log telemetry/secrets.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "Runner.Worker"\' --follow-log telemetry/secrets.log',
        },
      ],
      narration:
        "Memory scraping turns CI masking into a speed bump. Rotate tokens that were merely reachable, not only tokens seen in logs.",
    },
    {
      id: "phantom",
      phase: "Persistence",
      goal: "Check the registry provenance alert for a phantom release pattern.",
      hint: "`jq . registry/provenance-alert.json`.",
      matches: [{ kind: "exact", command: "jq . registry/provenance-alert.json" }],
      narration:
        "A release that exists in the registry but not in source history is enough to yank, quarantine, and reissue credentials.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify runner quarantine, package yank, hash block, and secret rotation.",
      hint: "`tshark -r evidence.pcap --follow-log containment/rotation.log`.",
      matches: [
        { kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/rotation.log" },
      ],
      narration:
        "Containment is registry action plus identity action. The package can be yanked in seconds; leaked trust takes longer to rebuild.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the safe startup-hook detection sketch for responder notes.",
      hint: "`head -n 80 public-poc/pth_startup_hook_stub.py`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/pth_startup_hook_stub.py" }],
      narration:
        "Defensive takeaway: scan installed wheels for .pth surprises and compare registry reality to source reality.",
    },
  ],
  debrief: {
    summary:
      "SecurityWeek reported on June 9, 2026 that new Shai-Hulud supply-chain variants hit more than 100 NPM and PyPI packages, with 471 malicious artifacts tracked across the campaign. The Hades branch reached PyPI with startup-hook execution, Bun-staged JavaScript, credential harvesting, self-spreading behavior, and a June 8 second wave affecting at least 29 packages per StepSecurity. Sources: https://www.securityweek.com/over-100-npm-pypi-packages-hit-in-new-shai-hulud-supply-chain-attacks/ and https://www.stepsecurity.io/blog/the-hades-campaign-pypi-packages",
    lesson:
      "Treat package install surfaces and CI runners as one trust boundary. Unexpected .pth files, phantom registry releases, valid-looking provenance without source history, and cross-runtime child processes should trigger immediate runner quarantine and credential rotation.",
    simulated: [
      "Runner names, timestamps, logs, manifests, hashes, and JSON alerts are synthetic teaching props.",
      "Package names and campaign mechanics are drawn from public June 2026 reporting, but no malicious payload code is included.",
      "The .pth and JavaScript markers in the virtual filesystem are inert documentation placeholders.",
    ],
  },
};
