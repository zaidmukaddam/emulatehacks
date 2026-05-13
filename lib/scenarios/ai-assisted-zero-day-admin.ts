import type { Scenario } from "../types";

/**
 * Defensive scenario aligned to Google Threat Intelligence Group (GTIG) May 2026 public reporting:
 * criminal Python exploit targeting MFA on an unnamed open-source web administration product,
 * semantic logic gap (trusted path / hardcoded assumption), and high-confidence AI-assistance
 * assessment from benign code-structure tells. URLs in debrief. No exploit payloads; museum logs only.
 *
 * CVE-2026-5555 in NVD is unrelated third-party junkware — do not link it to this storyline.
 */
export const aiAssistedAdminZeroDay: Scenario = {
  slug: "ai-assisted-zero-day-admin",
  exhibit: "EXH-047",
  title: "Semantic MFA Gap",
  tagline:
    "11 May 2026. GTIG publishes disruption of a mass-exploitation-ready Python zero-day: valid-password session first, second factor skipped via a contradictory trust shortcut in auth flow. Practice the defender read they describe.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/research/blog-followup",
  user: "responder",
  host: "analysis-station-01",
  role: "Blue team digesting sanitized incident partner notes alongside GTIG summaries (no seized binary execution).",
  objective:
    "Trace public narrative to synthetic telemetry: MFA gap in access rails, Partner-noted LLM-style Python tells, semantic branch review, vendor hotfix posture, remediation log.",
  briefing:
    "Every artefact echoes what Help Net Security, SecurityWeek, and Google's own Threat Intelligence blogs stated in May 2026: credentials still required; second factor collapses when code trusts an exception that fights the advertised policy; Google's staff cited hallucinated CVSS chatter, tutoring-style docstrings, and tidy Python scaffolding as attribution hints—not proof of Gemini use. Proceed as if you are validating partner telemetry, not reversing the withheld exploit.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/research/blog-followup" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/gtig-public-brief.txt":
      "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: cat intel/gtig-public-brief.txt\n",
    "curl -sI https://admin-appliance.example/panel/dashboard":
      ["HTTP/2 302", 'location: /panel/login?next=/overview', "server: museum-webadm", ""].join("\n"),
    "tshark -r evidence.pcap -Y 'frame contains \"panel/login\"' --follow-log /var/log/nginx/admin-appliance.access.log":
      "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: grep panel/login access.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"panel/overview\"' --follow-log /var/log/nginx/admin-appliance.access.log":
      "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: grep panel/overview access.log\n",
    "python3 ir_toolkit.py parse-artifact --input samples/partner_python_tells.txt":
      "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: cat samples/partner_python_tells.txt\n",
    "python3 ir_toolkit.py parse-artifact --input analysis/semantic-branch-review.txt":
      "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: cat analysis/semantic-branch-review.txt\n",
    "jq . vendor/hotfix-channel.json":
      "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: cat vendor/hotfix-channel.json\n",
    "tshark -r evidence.pcap --follow-log controls/mfa-lockdown.log":
      "simulated safe tool replay for ai-assisted-zero-day-admin; replaces: cat controls/mfa-lockdown.log\n",
  },
  files: {
    "/home/research/blog-followup/ir_toolkit.py": {
      content: [
        "#!/usr/bin/env python3",
        "\"\"\"Scenario helper for safe incident-response parsing.",
        "",
        "Supported modes in this exhibit:",
        "  parse-artifact --input PATH",
        "  extract-ioc --ioc VALUE --input PATH",
        "",
        "The museum shell intercepts exact commands from scenario.commands.",
        "No code runs and no network is touched.",
        "\"\"\"",
        "raise SystemExit('simulated helper: canned output only')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/research/blog-followup/intel/gtig-public-brief.txt": {
      content: [
        "GTIG / Google Cloud Threat Intelligence talking points — May 2026 (public summaries)",
        "",
        "- Criminal cluster prepping mass exploitation disrupted; vendor collaborated on fix.",
        "- Weapon: standalone Python tooling (credential-gated workflow).",
        "- Effect: MFA / second-factor bypass after valid username+password authentication.",
        "- Root flaw class: semantic auth logic contradiction; hard-coded trust shortcut vs stated policy.",
        "- AI linkage (attribution, not Gemini-specific): hallucinated-looking CVSS score text, tutoring-style docstrings, argparse-heavy help UX, unusually tidy scaffolding including ANSI helper class patterns resembling training-corpus boilerplate.",
        "",
        "Museum parity: IPs, hostnames, and headers below mirror shape only.",
      ].join("\n"),
    },
    "/var/log/nginx/admin-appliance.access.log": {
      content: [
        '# Pattern partners highlighted: authenticated session establishes, yet no /panel/mfa/verify hop.',
        '198.51.100.41 - corp_user [11/May/2026:15:08:41 +0000] "POST /panel/login HTTP/2.0" 200 512 "-" "python-requests/2.32"',
        '198.51.100.41 - corp_user [11/May/2026:15:08:42 +0000] "GET /panel/overview HTTP/2.0" 200 18890 "-" "python-requests/2.32"',
        '198.51.100.41 - corp_user [11/May/2026:15:08:52 +0000] "POST /panel/mfa/verify HTTP/2.0" 200 88 "-" "LegitIOSApp/408"',
      ].join("\n"),
    },
    "/home/research/blog-followup/samples/partner_python_tells.txt": {
      content: [
        "Sanitized excerpts partners compared to GTIG-published indicator language (weapon not replayed)",
        "",
        '[docstring]',
        "\"\"\"",
        "Helper utilities for chained admin-console requests after primary authentication succeeds.",
        "Educational scaffold — remove before production (?)",
        "\"\"\"",
        "",
        "# CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H  Base 9.8  <-- analysts flagged bogus precision",
        "# argparse block spanned multiple screens with colorized usage banners (museum summary only)",
        "# class _C:  ANSI color escapes — GTIG citation of \"textbook\" helper patterns",
        "",
        "None of the above lines execute in this exhibit; wording paraphrases open press quotes.",
      ].join("\n"),
    },
    "/home/research/blog-followup/analysis/semantic-branch-review.txt": {
      content: [
        "Code review excerpt (museum synthetic) aligning to GTIG wording: contradictory trust assumptions",
        "",
        "OBSERVED BRANCH:",
        '  if request.headers.get("X-Forwarded-For","").startswith("10."):',
        '      session.flags.add("trusted_relay_legacy")',
        '      bypass_second_factor("hardcoded-internal-range")',
        "",
        'POLICY ADVERTISED IN UI: "Mandatory MFA everywhere for admins."',
        "",
        "DEFENDER READ: enforcement exceptions must be enumerated in IR; scanners rarely catch semantic divergence.",
      ].join("\n"),
    },
    "/home/research/blog-followup/vendor/hotfix-channel.json": {
      content: [
        "{",
        '  "product": "Vendor-coordinated OSS web-administration stack (identity withheld publicly)",',
        '  "hotfix_track": "mfa-consistency-emergency",',
        '  "released_utc": "2026-05-10T21:05:00Z",',
        '  "notes": "Removes unconditional trusted-relay MFA skip; aligns HTTP edge with UI policy wording per GTIG-era disclosure.",',
        "}",
      ].join("\n"),
    },
    "/home/research/blog-followup/controls/mfa-lockdown.log": {
      content: [
        "2026-05-11T16:03Z kill_switch trusted_relay_bypass=false rollout=mgmt-plane",
        "2026-05-11T16:05Z waf_append rule=require_mfa_verified_cookie /panel/overview",
        "2026-05-11T16:11Z comms_partner channel=trust-group status=traffic-throttled awaiting patch wave",
      ].join("\n"),
    },
    "/home/research/blog-followup/public-poc/gtig_may2026_python_indicator_stub.py": {
      content: [
        "#!/usr/bin/env python3",
        "\"\"\"Museum stub naming only public GTIG attribution tells (May 2026 press). Not an exploit.",
        "",
        "Public sourcing called out hallucinated-looking CVSS text, tutoring docstrings, heavy argparse help,",
        "and ANSI helper scaffolding when describing the withheld criminal Python sample.",
        "",
        "Refs: Help Net Security 2026-05-11; SecurityWeek 'Google Detects First AI-Generated Zero-Day Exploit'",
        '\"\"\"',
        "",
        "",
        'class _C:',
        '    """Paraphrase of reporters quoting GTIG on tidy color helper stubs."""',
        "    BOLD = \"\\033[1m\"",
        "",
        "",
        "def main() -> None:",
        '    \"\"\"Educational placeholder; defenders review auth trees, not this file.\"\"\"',
        "    raise SystemExit(0)",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "intel",
      phase: "Recon",
      goal: "Load distilled GTIG bulletin beats your SOC partner forwarded.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/gtig-public-brief.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/gtig-public-brief.txt" },
      ],
      narration:
        "Keeps messaging tight: MFA bypass after password auth, semantic trust flaw, attacker Python with LLM-esque tells.",
    },
    {
      id: "baseline",
      phase: "Recon",
      goal: "Confirm dashboard still redirects unauthenticated clients (museum baseline HEAD).",
      hint: "`curl -sI https://admin-appliance.example/panel/dashboard`.",
      matches: [{ kind: "exact", command: "curl -sI https://admin-appliance.example/panel/dashboard" }],
      narration:
        "Partners still route through /panel/login; you are validating edge behaviour before reading abuse rows.",
    },
    {
      id: "rail-login",
      phase: "Initial access",
      goal: "Surface the scripted primary authentication hits on the rail.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"panel/login\"' --follow-log /var/log/nginx/admin-appliance.access.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "panel/login"\' --follow-log /var/log/nginx/admin-appliance.access.log',
        },
      ],
      narration:
        "Matches press: Python-requests user agent and password gate before any escalation chatter.",
    },
    {
      id: "rail-mfa-gap",
      phase: "Execution",
      goal: "Show authenticated navigation without mandatory MFA verification between critical hops.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"panel/overview\"' --follow-log /var/log/nginx/admin-appliance.access.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "panel/overview"\' --follow-log /var/log/nginx/admin-appliance.access.log',
        },
      ],
      narration:
        "Synthetic row order mirrors SOC talking point: attacker reached overview immediately after POST /panel/login sans /panel/mfa/verify hop.",
    },
    {
      id: "tells",
      phase: "Detection",
      goal: "Read partner excerpts echoing Google's published AI-style code tells (no payloads).",
      hint: "`python3 ir_toolkit.py parse-artifact --input samples/partner_python_tells.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input samples/partner_python_tells.txt" },
      ],
      narration:
        "Hallucinated CVSS fluff, tutoring docstrings, argparse theatre, ANSI helper class shorthand: verbatim themes from reporters quoting GTIG.",
    },
    {
      id: "semantic",
      phase: "Impact",
      goal: "Document the contradictory trust shortcut versus advertised MFA posture.",
      hint: "`python3 ir_toolkit.py parse-artifact --input analysis/semantic-branch-review.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input analysis/semantic-branch-review.txt" },
      ],
      narration:
        "Where memory corruption hunts fuzzers; logic flaws hide in mismatched intentions. Matches GTIG wording on semantic errors.",
    },
    {
      id: "vendor",
      phase: "Containment",
      goal: "Check coordinated hotfix metadata your vendor PM pushed.",
      hint: "`jq . vendor/hotfix-channel.json`.",
      matches: [{ kind: "exact", command: "jq . vendor/hotfix-channel.json" }],
      narration:
        "Same disclosure cadence GTIG credited: coordinated patch before criminals ran wide spray-and-pray.",
    },
    {
      id: "lockdown",
      phase: "Containment",
      goal: "Verify emergency controls rewired MFA rails pending fleet patch.",
      hint: "`tshark -r evidence.pcap --follow-log controls/mfa-lockdown.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log controls/mfa-lockdown.log" }],
      narration:
        "Translate intel into policy: deny legacy relay shortcut, cookie-gate privileged routes, comms outward.",
    },
    {
      id: "mechanism-excerpt",
      goal: "Review the archived GTIG-indicator sketch referenced in museum debrief texts.",
      hint: "`head -n 80 public-poc/gtig_may2026_python_indicator_stub.py`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/gtig_may2026_python_indicator_stub.py" }],
      narration:
        "Paraphrases only the defensive attribution fodder reporters repeated; zero weapon bytes.",
    },
  ],
  debrief: {
    summary:
      "May 2026 GTIG/Google Cloud reporting outlined a disrupted criminal Python zero-day against an unnamed popular open-source web administration surface: MFA bypass after legitimate password authentication, stemming from contradictory trust logic, with staff citing LLM-esque code fingerprints (bogus CVSS line, tutoring docstrings, argparse-heavy scaffolding, ANSI helper stubs, Gemini not involved). Canonical write-ups live at https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/google-threat-intelligence-group-report/ plus https://cloud.google.com/blog/topics/threat-intelligence/ai-vulnerability-exploitation-initial-access Secondary coverage includes Help Net Security 2026-05-11 and SecurityWeek summarising identical facts.",
    lesson:
      "Audit authentication exception lists with the same rigor as new features. Semantic gaps beat traditional scanners; pair MFA rollouts with code review plus forced path tests that forbid silent shortcuts.",
    simulated: [
      "Hosts, IPs, nginx rows, timelines, artefact wording, vendor JSON, mitigation log, stub Python are synthetic teaching props.",
      "They intentionally reflect only what open press reproduced from GTIG; nothing reproduces withheld exploit bytecode.",
      "Do not correlate with CVE-2026-5555 / Concert Ticket Reservation SQL injection; unrelated assignment.",
    ],
  },
};
