import type { Scenario } from "../types";

export const suspiciousSsh: Scenario = {
  slug: "suspicious-ssh-login",
  exhibit: "EXH-024",
  title: "The Suspicious SSH Login",
  tagline:
    "A login at 04:11 from a country no one on the team has ever visited. Trace what they did before the team woke up.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2023",
  estMinutes: 12,
  fictional: true,
  cwd: "/var/log",
  user: "responder",
  host: "build-runner-03",
  role: "Defensive responder paged after an unusual SSH login on a build runner.",
  objective:
    "Confirm the unauthorized session, follow what they touched, and identify the persistence they left behind.",
  briefing:
    "Auth logs flagged a successful SSH login from an IP unknown to the team. The runner is offline pending investigation. Walk the logs and the filesystem. Do not assume the attacker is gone.",
  env: { USER: "responder", SHELL: "/bin/sh", PWD: "/var/log" },
  ps: [
    "  PID TTY          TIME CMD",
    "    1 ?        00:00:02 systemd",
    "  402 ?        00:00:00 sshd",
    "  515 ?        00:00:04 jenkins",
    "  701 ?        00:00:00 cron",
    "  812 pts/0    00:00:00 sh",
  ],
  history: ["pwd", "ls"],
  files: {
    "/var/log/auth.log": {
      content: [
        "Mar 14 04:08:11 build-runner-03 sshd[2210]: Failed password for ci from 198.51.100.7 port 51322",
        "Mar 14 04:08:14 build-runner-03 sshd[2210]: Failed password for ci from 198.51.100.7 port 51322",
        "Mar 14 04:11:02 build-runner-03 sshd[2218]: Accepted publickey for ci from 198.51.100.7 port 51410 ssh2: ED25519 SHA256:n0t-the-key-we-issued",
        "Mar 14 04:11:03 build-runner-03 sshd[2218]: pam_unix(sshd:session): session opened for user ci by (uid=0)",
        "Mar 14 04:14:48 build-runner-03 sudo:       ci : TTY=pts/1 ; PWD=/home/ci ; USER=root ; COMMAND=/usr/bin/crontab -e",
        "Mar 14 04:18:22 build-runner-03 sshd[2218]: pam_unix(sshd:session): session closed for user ci",
      ].join("\n"),
    },
    "/var/log/syslog": {
      content:
        "Mar 14 04:15:01 build-runner-03 cron[701]: (ci) RELOAD (crontabs/ci)\n",
    },
    "/var/log/jenkins/build-417.log": {
      content: "+ make build\n+ make test\nALL TESTS PASSED\n",
    },
    "/home/ci/.ssh/authorized_keys": {
      content:
        "ssh-ed25519 AAAA...issued-team-key ci@laptop\nssh-ed25519 AAAA...n0t-the-key-we-issued backup@unknown\n",
    },
    "/var/spool/cron/crontabs/ci": {
      content:
        "# m h dom mon dow command\n*/7 * * * * /home/ci/.cache/.runner >/dev/null 2>&1\n",
    },
    "/home/ci/.cache/.runner": {
      content:
        "#!/bin/sh\n# beacon stub, fictional reconstruction\n# (would phone home; in this simulation it does nothing)\nexit 0\n",
    },
  },
  steps: [
    {
      id: "open-auth",
      goal: "Read the auth log.",
      hint: "`cat auth.log` to see SSH events.",
      matches: [{ kind: "exact", command: "cat auth.log" }],
      narration:
        "Two failed passwords, then a successful publickey login. The fingerprint does not match any key the team issued.",
    },
    {
      id: "find-key",
      goal: "Find where authorized_keys lives on this box.",
      hint: "Try `find / -name authorized_keys`.",
      matches: [
        { kind: "regex", pattern: "^find\\s+/.*authorized_keys.*$" },
      ],
      narration: "An extra key was appended to ci's authorized_keys.",
    },
    {
      id: "read-key",
      goal: "Read the authorized_keys file.",
      hint: "`cat /home/ci/.ssh/authorized_keys`.",
      matches: [
        { kind: "exact", command: "cat /home/ci/.ssh/authorized_keys" },
      ],
      narration: "Two keys. One is yours. One is not.",
    },
    {
      id: "find-cron",
      goal: "Find what they did with sudo.",
      hint:
        "The auth log mentions `crontab -e`. Look at the user crontab: `cat /var/spool/cron/crontabs/ci`.",
      matches: [
        { kind: "exact", command: "cat /var/spool/cron/crontabs/ci" },
      ],
      narration:
        "A cron entry runs every seven minutes from a hidden cache folder. That is the persistence.",
    },
    {
      id: "inspect-payload",
      goal: "Look at the payload it runs.",
      hint: "`cat /home/ci/.cache/.runner`, note hidden file under .cache.",
      matches: [{ kind: "exact", command: "cat /home/ci/.cache/.runner" }],
      narration:
        "In this reconstruction the payload is inert. In the real incident, this is where you would isolate the host, rotate ci's keys, and pivot to the build artifacts it produced.",
    },
  ],
  debrief: {
    summary:
      "Two failures followed by a publickey success on a service account. The attacker added a key to authorized_keys and dropped a cron entry pointing at a hidden script under ~/.cache.",
    lesson:
      "For service accounts: pin `AuthorizedKeysFile` to a path users cannot write, prefer short-lived certificates over static keys, and alert on any change to authorized_keys, sudoers, and per-user crontabs. A cron entry in a service account's spool is a classic persistence shape, watch for it.",
    simulated: [
      "All log lines, fingerprints, and IPs are invented.",
      "The 'beacon' script is a no-op.",
      "No real SSH or filesystem is touched.",
    ],
  },
};
