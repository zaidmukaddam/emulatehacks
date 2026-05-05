import type { Scenario } from "../types";

export const regresshion: Scenario = {
  slug: "regresshion-openssh",
  exhibit: "EXH-031",
  title: "regreSSHion",
  tagline:
    "July 1, 2024. Qualys publishes a working unauthenticated RCE against the OpenSSH server, a regression of an 18-year-old CVE that quietly returned in 2020. Your fleet runs sshd on every host.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2024",
  estMinutes: 9,
  fictional: true,
  cwd: "/home/responder",
  user: "responder",
  host: "edge-bastion-01",
  role: "On-call engineer for a small fleet of glibc-based Linux bastions and edge boxes. The advisory dropped fifteen minutes ago.",
  objective:
    "Find out which of the boxes you can reach are exposed, and apply the same-day config mitigation while the patch waits in change control.",
  briefing:
    "Qualys disclosed CVE-2024-6387, 'regreSSHion'. It is an unauthenticated RCE against sshd as root, on glibc-based Linux. It is a regression of CVE-2006-5051: a signal handler race condition that was fixed in 2006, then accidentally reintroduced in OpenSSH 8.5p1 (October 2020). Versions 4.4p1 → 8.5p1 are not affected. 8.5p1 → 9.7p1 are affected. OpenBSD's sshd is not affected because of an unrelated SIGALRM handler. The exploit takes ~6–8 hours of connection attempts on amd64 to win the race. That is the window you have.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/responder",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  101 ?        00:00:01 systemd",
    "  244 ?        00:00:00 sshd: /usr/sbin/sshd -D",
    "  398 pts/0    00:00:00 bash",
    "  402 pts/0    00:00:00 ps",
  ],
  history: ["uname -a"],
  files: {
    "/home/responder/ADVISORY.md": {
      content: [
        "CVE-2024-6387, regreSSHion (OpenSSH unauthenticated RCE)",
        "",
        "Class: signal-handler race condition in sshd's pre-auth path",
        "       (regression of CVE-2006-5051 fixed in 2006, reintroduced",
        "       upstream in OpenSSH 8.5p1, October 2020)",
        "",
        "Affected:    OpenSSH 8.5p1  ≤  version  <  9.8p1   on glibc-based Linux",
        "Not affected: 4.4p1 ≤ version < 8.5p1  (signal handler is safe)",
        "Not affected: < 4.4p1 unless built without a specific patch (different bug)",
        "Not affected: OpenBSD (unrelated SIGALRM handler design)",
        "",
        "Exploit cost: ~10,000 connection attempts on amd64 to win the SIGALRM race.",
        "             Practical wall-clock on a default LoginGraceTime=120 server",
        "             is roughly 6–8 hours per host.",
        "",
        "Same-day mitigation if you cannot patch right now:",
        "  Set `LoginGraceTime 0` in /etc/ssh/sshd_config and reload sshd.",
        "  This disables the SIGALRM the race depends on. Trade-off: half-open",
        "  connections will accumulate and can be DoS'd, but RCE is closed.",
      ].join("\n"),
    },
    "/etc/ssh/sshd_config": {
      content: [
        "# /etc/ssh/sshd_config (default-ish)",
        "Port 22",
        "PermitRootLogin prohibit-password",
        "PasswordAuthentication no",
        "ChallengeResponseAuthentication no",
        "UsePAM yes",
        "X11Forwarding no",
        "PrintMotd no",
        "AcceptEnv LANG LC_*",
        "Subsystem sftp /usr/lib/openssh/sftp-server",
        "",
        "# default LoginGraceTime is 120s.",
        "# leave alone for now; setting it to 0 mitigates CVE-2024-6387",
        "# at the cost of leaving connections half-open.",
      ].join("\n"),
    },
    "/etc/ssh/sshd_config.d/90-regresshion.conf": {
      content: [
        "# emergency mitigation for CVE-2024-6387 (regreSSHion)",
        "# created during incident response 2024-07-01",
        "# remove after sshd is upgraded to 9.8p1+ on every fleet host",
        "LoginGraceTime 0",
      ].join("\n"),
    },
    "/var/log/auth.log": {
      content: [
        "2024-07-01T10:08:21Z edge-bastion-01 sshd[2188]: Accepted publickey for responder from 10.0.0.4 port 41044 ssh2",
        "2024-07-01T10:08:21Z edge-bastion-01 systemd-logind[412]: New session 11 of user responder.",
        "2024-07-01T11:14:09Z edge-bastion-01 sshd[2401]: Connection from 198.51.100.42 port 53441",
        "2024-07-01T11:14:11Z edge-bastion-01 sshd[2401]: Timeout before authentication for 198.51.100.42",
        "2024-07-01T11:14:13Z edge-bastion-01 sshd[2402]: Connection from 198.51.100.42 port 53442",
        "2024-07-01T11:14:15Z edge-bastion-01 sshd[2402]: Timeout before authentication for 198.51.100.42",
        "2024-07-01T11:14:17Z edge-bastion-01 sshd[2403]: Connection from 198.51.100.42 port 53443",
        "2024-07-01T11:14:19Z edge-bastion-01 sshd[2403]: Timeout before authentication for 198.51.100.42",
      ].join("\n"),
    },
    "/usr/sbin/sshd.version": {
      content: "OpenSSH_9.6p1 Ubuntu-3ubuntu13, OpenSSL 3.0.13 30 Jan 2024\n",
    },
  },
  steps: [
    {
      id: "advisory",
      goal: "Read the advisory note for context.",
      hint: "`cat ADVISORY.md`.",
      matches: [{ kind: "exact", command: "cat ADVISORY.md" }],
      narration:
        "Affected: 8.5p1 → 9.7p1 on glibc-based Linux. Same-day mitigation: LoginGraceTime 0. That disables the SIGALRM the race depends on, at the cost of letting half-open connections accumulate.",
    },
    {
      id: "version",
      goal: "Identify the sshd version on this box.",
      hint: "`cat /usr/sbin/sshd.version`.",
      matches: [{ kind: "exact", command: "cat /usr/sbin/sshd.version" }],
      narration:
        "OpenSSH 9.6p1 on Ubuntu. Squarely inside the affected range.",
    },
    {
      id: "config",
      goal: "Read the current sshd config.",
      hint: "`cat /etc/ssh/sshd_config`.",
      matches: [{ kind: "exact", command: "cat /etc/ssh/sshd_config" }],
      narration:
        "Default config, LoginGraceTime is unset, so it inherits the 120-second default. That gives a remote attacker the full window per attempt.",
    },
    {
      id: "mitigation",
      goal:
        "Confirm the same-day mitigation has been staged in /etc/ssh/sshd_config.d/.",
      hint: "`cat /etc/ssh/sshd_config.d/90-regresshion.conf`.",
      matches: [
        {
          kind: "exact",
          command: "cat /etc/ssh/sshd_config.d/90-regresshion.conf",
        },
      ],
      narration:
        "LoginGraceTime 0. Reload sshd and the race is closed on this host. Schedule the package upgrade through change control; you have weeks for the patch, you have minutes for the mitigation.",
    },
    {
      id: "logs",
      goal: "Check auth.log for anything that looks like an exploit attempt.",
      hint:
        "Look for many short-lived `Timeout before authentication` lines from one IP. Try `grep -nF 'Timeout before authentication' /var/log/auth.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "grep -nF 'Timeout before authentication' /var/log/auth.log",
        },
      ],
      narration:
        "Three connections from 198.51.100.42 in six seconds, each ending at the LoginGraceTime cutoff. Could be a scanner, could be the start of the race. Either way: blocklist the IP, ship the LoginGraceTime mitigation cluster-wide, and log the rotation of any host key that is older than today.",
    },
  ],
  debrief: {
    summary:
      "CVE-2024-6387, regreSSHion, was an unauthenticated remote code execution as root in the OpenSSH server, disclosed July 1, 2024 by the Qualys Threat Research Unit. It was a regression of CVE-2006-5051: a signal handler race condition that was fixed upstream in 2006 and accidentally reintroduced in OpenSSH 8.5p1 (October 2020) when refactoring removed a line of code. The race depends on SIGALRM firing inside an async-signal-unsafe code path; on amd64 with default settings it took roughly 10,000 connections (6–8 wall-clock hours) to win the race. Affected: glibc-based Linux running OpenSSH 8.5p1 through 9.7p1. Not affected: OpenBSD's sshd, or systems running 4.4p1–8.5p1.",
    lesson:
      "Two practical takeaways. (1) Configuration mitigations are a real tool when the patch can't ship today: LoginGraceTime 0 closes the bug because it disables the SIGALRM the race needs. The cost, accumulating half-open connections and an easier DoS, is acceptable for the window between disclosure and rollout, and the trade-off is yours to make on every box, not the vendor's. (2) Treat regressions of resolved CVEs as a real class. The 2006 fix to the same code path was lost during a 2020 refactor of the SIGALRM handler. Track historical security fixes in your codebase the same way you track tests: any change that touches a previously-patched function should require an explicit signoff that the historical bug remains fixed.",
    simulated: [
      "Hostnames, IP addresses, and auth.log lines are invented. The dpkg-format sshd version string format is realistic but the value is a representative pick from the affected range.",
      "The exploit itself is not present in this exhibit. Qualys did not publish working exploit code; they described the primitive and timing.",
      "The CVE number, disclosure date, affected version range, the regression-of-2006-5051 lineage, and the LoginGraceTime mitigation are real (Qualys advisory, July 1 2024).",
    ],
  },
};
