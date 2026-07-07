import type { Scenario } from "../types";

/**
 * Defensive reconstruction based on July 6-7, 2026 public reporting:
 * CVE-2026-48282, Adobe ColdFusion RDS FILEIO path traversal to file write and RCE.
 * Sources used while creating this scenario:
 * - https://www.bleepingcomputer.com/news/security/max-severity-adobe-coldfusion-flaw-now-exploited-in-attacks/
 * - https://www.resecurity.com/blog/article/cve-2026-48282-adobe-coldfusion-rds-path-traversal-leading-to-rce
 * - https://www.cyberdaily.au/security/13861-patch-now-active-exploitation-of-a-perfect-10-adobe-coldfusion-vulnerability-is-underway
 *
 * No exploit request, endpoint recipe, or working CFML payload is included.
 */
export const coldfusionRdsFileioRce: Scenario = {
  slug: "coldfusion-rds-fileio-rce",
  exhibit: "EXH-048",
  title: "ColdFusion RDS File Write",
  tagline:
    "7 July 2026. Fresh reporting says attackers are probing CVE-2026-48282 within hours of disclosure: exposed Adobe ColdFusion RDS FILEIO can turn path traversal into arbitrary file write and remote code execution.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/srv/coldfusion-ir",
  user: "responder",
  host: "cf-jump-01",
  role: "Incident responder triaging a legacy ColdFusion cluster after overnight exploitation reports.",
  objective:
    "Confirm public intel, find exposed RDS, identify affected builds, review abstracted FILEIO hits, verify webroot write indicators, and validate containment plus patch evidence.",
  briefing:
    "BleepingComputer, Cyber Daily, and Resecurity all reported fresh exploitation pressure around CVE-2026-48282 in early July 2026. The real flaw is in ColdFusion Remote Development Services FILEIO path handling. This tabletop keeps the handler details abstract and asks you to work the defender loop: exposure, version, suspicious writes, containment, and upgrade posture.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/srv/coldfusion-ir" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "goal"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/public-report.txt":
      "simulated safe tool replay for coldfusion-rds-fileio-rce; replaces: cat intel/public-report.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc RDS --input inventory/coldfusion-builds.txt":
      "simulated safe tool replay for coldfusion-rds-fileio-rce; replaces: grep -nF RDS inventory/coldfusion-builds.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc 2025.9 --input inventory/coldfusion-builds.txt":
      "simulated safe tool replay for coldfusion-rds-fileio-rce; replaces: grep -nF 2025.9 inventory/coldfusion-builds.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"RDS FILEIO\"' --follow-log /var/log/coldfusion/rds.log":
      "simulated safe tool replay for coldfusion-rds-fileio-rce; replaces: grep -nF 'RDS FILEIO' /var/log/coldfusion/rds.log\n",
    "python3 ir_toolkit.py parse-artifact --input webroot/suspicious-files.txt":
      "simulated safe tool replay for coldfusion-rds-fileio-rce; replaces: cat webroot/suspicious-files.txt\n",
    "jq . evidence/cisa-kev-entry.json":
      "simulated safe tool replay for coldfusion-rds-fileio-rce; replaces: cat evidence/cisa-kev-entry.json\n",
    "python3 ir_toolkit.py parse-artifact --input controls/rds-containment.log":
      "simulated safe tool replay for coldfusion-rds-fileio-rce; replaces: cat controls/rds-containment.log\n",
    "python3 ir_toolkit.py parse-artifact --input patch/upgrade-plan.txt":
      "simulated safe tool replay for coldfusion-rds-fileio-rce; replaces: cat patch/upgrade-plan.txt\n",
  },
  files: {
    "/srv/coldfusion-ir/ir_toolkit.py": {
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
    "/srv/coldfusion-ir/intel/public-report.txt": {
      content: [
        "Public reporting digest - CVE-2026-48282",
        "",
        "BleepingComputer, 2026-07-06:",
        "- Attackers are exploiting a maximum-severity Adobe ColdFusion vulnerability.",
        "- Affected builds called out publicly include ColdFusion 2025.9, 2023.20, and earlier.",
        "- KEVIntel reported in-the-wild exploitation inside two hours of disclosure.",
        "",
        "Resecurity, 2026-07-06:",
        "- RDS FILEIO path traversal can permit arbitrary file write.",
        "- Webroot write can become remote code execution in vulnerable configurations.",
        "- Risk is highest where RDS is internet reachable or misconfigured.",
        "",
        "Cyber Daily, 2026-07-07:",
        "- Defenders were urged to patch immediately after active probing was observed.",
        "",
        "Museum rule: this exhibit uses only safe log and config shapes, not exploit requests.",
      ].join("\n"),
    },
    "/srv/coldfusion-ir/inventory/coldfusion-builds.txt": {
      content: [
        "cluster inventory snapshot 2026-07-07T02:41Z",
        "",
        "cf-app-01 product=ColdFusion 2025.9 role=public-web RDS=enabled scope=0.0.0.0/0 status=at-risk",
        "cf-app-02 product=ColdFusion 2025.10 role=admin-preview RDS=disabled scope=10.20.0.0/16 status=patched",
        "cf-report-01 product=ColdFusion 2023.20 role=internal-report RDS=enabled scope=10.30.0.0/16 status=at-risk",
        "",
        "Public fixed-version notes used by this tabletop:",
        "- ColdFusion 2025 Update 10 or later",
        "- ColdFusion 2023 Update 21 or later",
      ].join("\n"),
    },
    "/var/log/coldfusion/rds.log": {
      content: [
        "# Synthetic ColdFusion RDS audit excerpt. Handler names are coarse by design.",
        "2026-07-07T01:52:11Z host=cf-app-01 src=198.51.100.77 action=RDS FILEIO op=read result=blocked reason=path-left-rds-root",
        "2026-07-07T01:52:19Z host=cf-app-01 src=198.51.100.77 action=RDS FILEIO op=write result=created target=webroot-stage/quarantine-9f3.cfm",
        "2026-07-07T01:52:23Z host=cf-app-01 src=198.51.100.77 action=RDS FILEIO op=write result=blocked reason=webroot-write-deny-after-rule",
        "2026-07-07T02:05:44Z host=cf-report-01 src=203.0.113.18 action=RDS FILEIO op=read result=blocked reason=internal-only-acl",
      ].join("\n"),
    },
    "/srv/coldfusion-ir/webroot/suspicious-files.txt": {
      content: [
        "webroot integrity sweep 2026-07-07T02:10Z",
        "",
        "host=cf-app-01 path=/opt/cfusion/wwwroot/quarantine-9f3.cfm owner=cfusion mtime=2026-07-07T01:52:19Z verdict=remove-and-preserve",
        "hash=sha256:89d2b4e0b1b2e2b56c8f5e1df0000000000000000000000000000000000000000 classification=unknown-cfml-stager",
        "",
        "handler note: file was moved to evidence storage before deletion. Contents are intentionally omitted from this museum scenario.",
      ].join("\n"),
    },
    "/srv/coldfusion-ir/evidence/cisa-kev-entry.json": {
      content: [
        "{",
        '  "cve": "CVE-2026-48282",',
        '  "product": "Adobe ColdFusion",',
        '  "vulnerability": "RDS FILEIO path traversal leading to arbitrary file write",',
        '  "evidence": "public exploitation reporting and KEV-style emergency handling",',
        '  "response": ["disable RDS", "restrict admin interfaces", "patch affected builds", "hunt for unauthorized webroot files"]',
        "}",
      ].join("\n"),
    },
    "/srv/coldfusion-ir/controls/rds-containment.log": {
      content: [
        "2026-07-07T02:18Z firewall_update host=cf-app-01 rule=deny-public-rds result=success",
        "2026-07-07T02:20Z coldfusion_admin host=cf-app-01 setting=RDS enabled=false result=success",
        "2026-07-07T02:24Z file_integrity host=cf-app-01 watch=/opt/cfusion/wwwroot result=enabled",
        "2026-07-07T02:29Z case_note host=cf-report-01 action=internal-acl-confirmed patch-window=urgent",
      ].join("\n"),
    },
    "/srv/coldfusion-ir/patch/upgrade-plan.txt": {
      content: [
        "ColdFusion emergency patch board",
        "",
        "cf-app-01 current=2025.9 target=2025 Update 10 status=approved rollout=2026-07-07T04:00Z",
        "cf-app-02 current=2025.10 target=none status=already-patched",
        "cf-report-01 current=2023.20 target=2023 Update 21 status=approved rollout=2026-07-07T04:30Z",
        "",
        "Post-patch validation:",
        "- RDS remains disabled unless a named owner files an exception.",
        "- Admin interfaces remain off untrusted networks.",
        "- Webroot sweep and credential review stay open until no new FILEIO rows appear.",
      ].join("\n"),
    },
    "/srv/coldfusion-ir/public-poc/cve_2026_48282_fileio_shape.txt": {
      content: [
        "# CVE-2026-48282 museum reference",
        "# Public analysis describes unchecked path handling in ColdFusion RDS FILEIO.",
        "# Vulnerable shape: user-controlled file path reaches FILEIO before canonical boundary checks.",
        "# Patched shape: canonicalize, reject traversal or absolute out-of-scope paths, then enforce allowed directories.",
        "",
        "Do not use this file as a request template. It intentionally omits endpoint routes, body format, headers, and payload bytes.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "public-intel",
      phase: "Recon",
      goal: "Read the public reporting digest that triggered the emergency case.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/public-report.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/public-report.txt" },
      ],
      narration:
        "The incident is current: reporting says active probing followed disclosure quickly, and RDS FILEIO exposure is the thread to pull.",
    },
    {
      id: "rds-exposure",
      phase: "Recon",
      goal: "Find ColdFusion hosts where RDS is still enabled.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc RDS --input inventory/coldfusion-builds.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc RDS --input inventory/coldfusion-builds.txt" },
      ],
      narration:
        "RDS is a development surface. Leaving it enabled on a public role turns a patch bulletin into an incident.",
    },
    {
      id: "affected-version",
      phase: "Initial access",
      goal: "Prove at least one public-web host is on an affected ColdFusion 2025.9 build.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc 2025.9 --input inventory/coldfusion-builds.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc 2025.9 --input inventory/coldfusion-builds.txt" },
      ],
      narration:
        "The exposed host lines up with the vulnerable version set called out in public reporting.",
    },
    {
      id: "fileio-hits",
      phase: "Execution",
      goal: "Review abstracted RDS FILEIO activity without exposing a reusable exploit request.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"RDS FILEIO\"' --follow-log /var/log/coldfusion/rds.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "RDS FILEIO"\' --follow-log /var/log/coldfusion/rds.log',
        },
      ],
      narration:
        "The important defender signal is not the payload. It is FILEIO touching paths outside its safe boundary, then a webroot write attempt.",
    },
    {
      id: "webroot-write",
      phase: "Impact",
      goal: "Inspect the integrity sweep entry for the suspicious CFML file.",
      hint: "`python3 ir_toolkit.py parse-artifact --input webroot/suspicious-files.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input webroot/suspicious-files.txt" },
      ],
      narration:
        "Arbitrary write becomes critical when the landing zone is executable. Preserve, remove, and hunt for sibling files.",
    },
    {
      id: "kev-note",
      phase: "Detection",
      goal: "Read the emergency handling note for the vulnerability.",
      hint: "`jq . evidence/cisa-kev-entry.json`.",
      matches: [{ kind: "exact", command: "jq . evidence/cisa-kev-entry.json" }],
      narration:
        "The response checklist is basic and urgent: disable RDS, restrict admin paths, patch, then hunt for unauthorized writes.",
    },
    {
      id: "contain-rds",
      phase: "Containment",
      goal: "Verify the immediate control changes that removed public RDS exposure.",
      hint: "`python3 ir_toolkit.py parse-artifact --input controls/rds-containment.log`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input controls/rds-containment.log" },
      ],
      narration:
        "Containment closes the exposed surface before the patch window finishes.",
    },
    {
      id: "patch-plan",
      phase: "Containment",
      goal: "Confirm affected hosts are queued for the fixed ColdFusion updates.",
      hint: "`python3 ir_toolkit.py parse-artifact --input patch/upgrade-plan.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input patch/upgrade-plan.txt" },
      ],
      narration:
        "Adobe's fixed update line is the end state, not the first move. Exposure removal and evidence preservation happen first.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the safe mechanism note that explains the bug class without exploit bytes.",
      hint: "`head -n 80 public-poc/cve_2026_48282_fileio_shape.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/cve_2026_48282_fileio_shape.txt" }],
      narration:
        "The core lesson is canonical path enforcement before file operations. The scenario omits request details by design.",
    },
  ],
  debrief: {
    summary:
      "On July 6-7, 2026, public reporting from BleepingComputer and Cyber Daily described active exploitation of CVE-2026-48282, a maximum-severity Adobe ColdFusion flaw. Resecurity's write-up described the root class as RDS FILEIO path traversal that could permit arbitrary file write and, in webroot-write configurations, remote code execution. This exhibit turns those reports into a defender workflow: confirm RDS exposure, verify affected versions, inspect safe audit summaries, preserve suspicious webroot files, disable or restrict RDS, and upgrade.",
    lesson:
      "Development interfaces become production attack surface when they survive into internet-facing deployments. Disable RDS when it is not needed, never expose administrative services to untrusted networks, enforce canonical path boundaries before file operations, and treat public exploitation reports as a trigger for hunting, not just patching.",
    simulated: [
      "Hosts, IP addresses, logs, filenames, hashes, inventory rows, and response notes are synthetic teaching artefacts.",
      "The exhibit intentionally omits exploit endpoint routes, request bodies, headers, traversal strings, and CFML payload content.",
      "Only the CVE identifier, product family, affected-version framing, RDS FILEIO bug class, and July 2026 exploitation reporting are grounded in public sources.",
    ],
  },
};
