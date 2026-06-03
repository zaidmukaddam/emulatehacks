import type { Scenario } from "../types";

/**
 * CVE-2026-8206: Kirki WordPress password-reset account takeover.
 * Public reports on 2026-06-02 described active exploitation against sites
 * running Kirki 6.0.0 through 6.0.6. This reconstruction uses invented logs.
 */
export const kirkiAdminReset8206: Scenario = {
  slug: "kirki-admin-reset-8206",
  exhibit: "EXH-048",
  title: "Kirki Reset Trap",
  tagline:
    "June 2, 2026. Wordfence blocks hundreds of Kirki reset attempts in a day, and your WordPress fleet still has one storefront pinned below 6.0.7. You prove whether admin reset links were routed to an attacker inbox.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/srv/wp/kirki-response",
  user: "responder",
  host: "wp-ir-03",
  role: "Incident responder triaging a WordPress plugin takeover wave.",
  objective:
    "Confirm vulnerable Kirki exposure, trace suspicious password reset routing, audit admin accounts, and verify containment.",
  briefing:
    "Public reporting on June 2, 2026 tied CVE-2026-8206 to active Kirki exploitation. The vulnerable password reset flow could send reset links for known usernames to an attacker-supplied email address. Your job is not to run an exploit. Your job is to prove exposure, find reset evidence, and close the window.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/srv/wp/kirki-response",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "wp plugin list"],
  commands: {
    "curl -sI https://orchard.example/wp-json/": [
      "HTTP/2 200",
      "x-powered-by: WordPress",
      "x-wp-total: simulated",
      "x-incident-note: REST surface reachable",
    ].join("\n"),
    "wp plugin list --field=name,version,status | grep kirki":
      "kirki 6.0.6 active\n(simulated: vulnerable build remains active on storefront-17)\n",
    "python3 ir_toolkit.py parse-artifact --input advisories/kirki-cve-2026-8206.txt":
      "simulated safe tool replay for kirki-admin-reset-8206; replaces: cat advisories/kirki-cve-2026-8206.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"kirki-forgot\"' --follow-log logs/reset-endpoint.log":
      "simulated safe tool replay for kirki-admin-reset-8206; replaces: grep -nF kirki-forgot logs/reset-endpoint.log\n",
    "python3 ir_toolkit.py parse-artifact --input mail/reset-routing.log":
      "simulated safe tool replay for kirki-admin-reset-8206; replaces: cat mail/reset-routing.log\n",
    "python3 safe_replay.py --scenario kirki-admin-reset-8206 --grep administrator --artifact users/role-audit.tsv":
      "simulated safe tool replay for kirki-admin-reset-8206; replaces: grep -nF administrator users/role-audit.tsv\n",
    "tshark -r evidence.pcap --follow-log containment/actions.log":
      "simulated safe tool replay for kirki-admin-reset-8206; replaces: cat containment/actions.log\n",
    "python3 ir_toolkit.py parse-artifact --input public-poc/kirki_reset_flow_note.txt":
      "simulated safe tool replay for kirki-admin-reset-8206; replaces: cat public-poc/kirki_reset_flow_note.txt\n",
  },
  files: {
    "/srv/wp/kirki-response/advisories/kirki-cve-2026-8206.txt": {
      content: [
        "CVE-2026-8206 public fact sheet",
        "",
        "BleepingComputer reported on 2026-06-02 that hackers were exploiting Kirki to take over WordPress accounts, including administrators.",
        "Wordfence said its firewall blocked more than 222 attempts against customers in the prior 24 hours.",
        "Affected range: Kirki 6.0.0 through 6.0.6.",
        "Fixed release: Kirki 6.0.7, released 2026-05-18.",
        "Mechanism summary: the reset handler accepted an attacker-supplied email address when a username was supplied, routing valid reset links away from the account owner's mailbox.",
        "",
        "Sources:",
        "https://www.bleepingcomputer.com/news/security/critical-kirki-flaw-exploited-to-hijack-wordpress-admin-accounts/",
        "https://patchstack.com/database/wordpress/plugin/kirki/vulnerability/wordpress-kirki-plugin-6-0-0-6-0-6-unauthenticated-privilege-escalation-via-handle-forgot-password-vulnerability",
      ].join("\n"),
    },
    "/srv/wp/kirki-response/logs/reset-endpoint.log": {
      content: [
        "2026-06-02T22:18:02Z src=203.0.113.71 method=POST path=/wp-json/KirkiComponentLibrary/v1/kirki-forgot-password user=admin dest_domain=maildrop.invalid status=200 marker=kirki-forgot",
        "2026-06-02T22:18:09Z src=203.0.113.71 method=POST path=/wp-json/KirkiComponentLibrary/v1/kirki-forgot-password user=editor dest_domain=maildrop.invalid status=200 marker=kirki-forgot",
        "2026-06-02T22:19:44Z src=198.51.100.22 method=POST path=/wp-json/KirkiComponentLibrary/v1/kirki-forgot-password user=administrator dest_domain=protonmail.invalid status=200 marker=kirki-forgot",
        "2026-06-02T22:20:01Z src=192.0.2.45 method=POST path=/wp-json/KirkiComponentLibrary/v1/kirki-forgot-password user=admin dest_domain=owner.example status=403 waf=blocked marker=kirki-forgot",
      ].join("\n"),
    },
    "/srv/wp/kirki-response/mail/reset-routing.log": {
      content: [
        "message_id=reset-8812 user=admin registered_email=owner@orchard.example destination=ops-maildrop@maildrop.invalid mismatch=true delivered=true",
        "message_id=reset-8813 user=editor registered_email=content@orchard.example destination=ops-maildrop@maildrop.invalid mismatch=true delivered=true",
        "message_id=reset-8819 user=administrator registered_email=founder@orchard.example destination=wp-reset@protonmail.invalid mismatch=true delivered=true",
      ].join("\n"),
    },
    "/srv/wp/kirki-response/users/role-audit.tsv": {
      content: [
        "user\trole\tlast_password_change\tlast_login_ip\tnote",
        "admin\tadministrator\t2026-06-02T22:24:11Z\t198.51.100.22\tpassword reset did not originate from registered mailbox",
        "founder\tadministrator\t2026-05-12T10:11:03Z\t198.51.100.10\tno suspicious reset",
        "content\teditor\t2026-06-02T22:22:18Z\t203.0.113.71\tpassword reset did not originate from registered mailbox",
      ].join("\n"),
    },
    "/srv/wp/kirki-response/containment/actions.log": {
      content: [
        "2026-06-02T22:31Z wp_plugin_update plugin=kirki from=6.0.6 to=6.0.7 success",
        "2026-06-02T22:32Z waf_rule block path=/wp-json/KirkiComponentLibrary/v1/kirki-forgot-password unauthenticated=true success",
        "2026-06-02T22:34Z force_logout role=administrator success",
        "2026-06-02T22:36Z rotate_wordpress_salts success",
        "2026-06-02T22:41Z scan_webroot suspicious_php_files=0",
      ].join("\n"),
    },
    "/srv/wp/kirki-response/public-poc/kirki_reset_flow_note.txt": {
      content: [
        "# Educational note, not an exploit.",
        "# Public reports describe a password reset logic flaw in Kirki 6.0.0 through 6.0.6.",
        "# Defensive checks:",
        "# - Compare reset destination email against the account's registered email.",
        "# - Alert when many reset requests target admin-like usernames.",
        "# - Patch to 6.0.7 or disable the plugin.",
        "# - Force logout admins and review for new plugins, themes, and PHP backdoors.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "rest-surface",
      phase: "Recon",
      goal: "Check whether the WordPress REST surface is reachable (simulated).",
      hint: "`curl -sI https://orchard.example/wp-json/`.",
      matches: [
        {
          kind: "exact",
          command: "curl -sI https://orchard.example/wp-json/",
        },
      ],
      narration:
        "The public REST surface is reachable. That does not prove compromise, but it tells you where reset telemetry should appear.",
    },
    {
      id: "plugin-version",
      phase: "Recon",
      goal: "Confirm the active Kirki plugin version on the affected site.",
      hint: "`wp plugin list --field=name,version,status | grep kirki`.",
      matches: [
        {
          kind: "exact",
          command: "wp plugin list --field=name,version,status | grep kirki",
        },
      ],
      narration:
        "Kirki 6.0.6 is inside the affected range. Treat this storefront as exposed until logs and accounts say otherwise.",
    },
    {
      id: "advisory",
      phase: "Triage",
      goal: "Read the incident fact sheet captured from public advisories.",
      hint: "`python3 ir_toolkit.py parse-artifact --input advisories/kirki-cve-2026-8206.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input advisories/kirki-cve-2026-8206.txt",
        },
      ],
      narration:
        "The key fact is routing: reset links can be sent to an address the attacker controls when a username is known.",
    },
    {
      id: "reset-logs",
      phase: "Initial access",
      goal: "Find suspicious reset endpoint hits in captured web logs.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"kirki-forgot\"' --follow-log logs/reset-endpoint.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "tshark -r evidence.pcap -Y 'frame contains \"kirki-forgot\"' --follow-log logs/reset-endpoint.log",
        },
      ],
      narration:
        "Multiple usernames were targeted in minutes, and the 200 responses happened before the WAF block landed.",
    },
    {
      id: "mail-routing",
      phase: "Impact",
      goal: "Confirm whether reset links went to non-registered mailboxes.",
      hint: "`python3 ir_toolkit.py parse-artifact --input mail/reset-routing.log`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input mail/reset-routing.log",
        },
      ],
      narration:
        "The reset destination does not match the registered account email. That is account takeover evidence, not just scanning noise.",
    },
    {
      id: "admin-audit",
      phase: "Impact",
      goal: "Audit administrator accounts for suspicious password changes.",
      hint: "`python3 safe_replay.py --scenario kirki-admin-reset-8206 --grep administrator --artifact users/role-audit.tsv`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 safe_replay.py --scenario kirki-admin-reset-8206 --grep administrator --artifact users/role-audit.tsv",
        },
      ],
      narration:
        "One administrator password changed from the suspicious source window. Assume that session and anything it touched are burned.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify update, WAF block, forced logout, salt rotation, and webroot scan.",
      hint: "`tshark -r evidence.pcap --follow-log containment/actions.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap --follow-log containment/actions.log",
        },
      ],
      narration:
        "Containment closes both sides: patch the bug, block replay, invalidate sessions, and check for post-takeover persistence.",
    },
    {
      id: "defense-note",
      phase: "Lessons",
      goal: "Review the safe defensive notes for this reset-flow bug class.",
      hint: "`python3 ir_toolkit.py parse-artifact --input public-poc/kirki_reset_flow_note.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py parse-artifact --input public-poc/kirki_reset_flow_note.txt",
        },
      ],
      narration:
        "The durable lesson is simple: password reset code must bind identity, destination, and token issuance together.",
    },
  ],
  debrief: {
    summary:
      "On June 2, 2026, BleepingComputer reported active exploitation of CVE-2026-8206 in the Kirki WordPress plugin, with Wordfence blocking more than 222 attempts in the prior 24 hours. The flaw affected versions 6.0.0 through 6.0.6 and allowed reset links for known usernames to be routed to attacker-controlled email addresses. This exhibit reconstructs a defender's audit trail after one vulnerable storefront lagged behind the 6.0.7 fix.",
    lesson:
      "Patch the plugin, but do not stop there. Audit reset-mail routing, force logout privileged users, rotate salts, and inspect the webroot for persistence because admin takeover can become plugin install, content tampering, or database theft.",
    simulated: [
      "The storefront host, logs, users, IPs, and mailboxes are invented.",
      "The CVE number, affected version range, fixed version, date, and active exploitation report are based on public sources gathered on 2026-06-03.",
      "No exploit payload or live target interaction is included.",
    ],
  },
};
