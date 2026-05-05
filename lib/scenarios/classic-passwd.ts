import type { Scenario } from "../types";

export const classicPasswd: Scenario = {
  slug: "classic-password-file",
  exhibit: "EXH-001",
  title: "The Classic Password File",
  tagline:
    "An old UNIX timeshare in 1988. The password file is world-readable. This is why we have shadow.",
  category: "classic-history",
  difficulty: "beginner",
  era: "1980s",
  year: "1988",
  estMinutes: 7,
  fictional: false,
  cwd: "/etc",
  user: "student",
  host: "vax-stargazer",
  role: "A curious undergraduate on a shared UNIX timeshare.",
  objective:
    "See why early UNIX kept hashed passwords in a world-readable file, and what changed.",
  briefing:
    "It is 1988. /etc/passwd holds usernames, UIDs, shells, and, until shadow files arrived, the hashed passwords too. Anyone who could read the file could carry it home and run a cracker against it offline. This exhibit reconstructs that moment, with fake users.",
  env: { USER: "student", SHELL: "/bin/sh", PWD: "/etc", TERM: "vt100" },
  ps: [
    "  PID TTY  TIME CMD",
    "    1 ?    0:01 init",
    "   84 co   0:00 getty",
    "  211 p1   0:00 sh",
  ],
  history: ["who", "ls /etc"],
  files: {
    "/etc/passwd": {
      owner: "root",
      perms: "-rw-r--r--",
      content: [
        "root:Zx7q.k1.sLpYU:0:0:Operator:/:/bin/sh",
        "daemon:*:1:1::/:",
        "sys:*:2:2::/:",
        "bin:*:3:3::/bin:",
        "adm:*:4:4:Admin:/var/adm:",
        "uucp:*:5:5::/var/spool/uucp:/usr/lib/uucico",
        "rje:p4kYq.Hd9.J0c:8:8:Remote Job Entry:/usr/rje:",
        "guest:abYI.qz.PpCxw:100:100:Guest:/usr/guest:/bin/sh",
        "student:lmXp.Rt.qZ8s.:101:100:Student account:/usr/student:/bin/sh",
        "kthompson:Wjk6/n.0.qnEMW:200:1:Ken (visitor):/usr/kthompson:/bin/sh",
      ].join("\n"),
    },
    "/etc/group": {
      content: "root::0:\nstaff::1:root\nuser::100:guest,student\n",
    },
    "/etc/motd": {
      content:
        "VAX-11/780 timeshare. Be considerate of other users.\nReport problems to operator@stargazer.\n",
    },
  },
  steps: [
    {
      id: "look-around",
      goal: "List the etc directory.",
      hint: "`ls` from /etc.",
      matches: [{ kind: "exact", command: "ls" }],
      narration: "passwd, group, motd. Standard for the era.",
    },
    {
      id: "who-am-i",
      goal: "Identify yourself.",
      hint: "`whoami`.",
      matches: [{ kind: "exact", command: "whoami" }],
      narration:
        "An ordinary student account. UID 101. No special privileges.",
    },
    {
      id: "read-passwd",
      goal: "Read the password file.",
      hint:
        "`cat passwd`. Notice that you, an unprivileged user, can read every account's hash.",
      matches: [{ kind: "exact", command: "cat passwd" }],
      narration:
        "The second field is the hashed password. World-readable, by design. You could copy this file off the system and crack it at your leisure.",
    },
    {
      id: "look-for-shadow",
      goal: "Look for /etc/shadow.",
      hint: "`cat /etc/shadow`.",
      matches: [{ kind: "exact", command: "cat /etc/shadow" }],
      narration:
        "It does not exist on this system. Shadow files separated hashes from the public passwd file, that change took years to become universal.",
    },
  ],
  debrief: {
    summary:
      "Early UNIX stored hashed passwords in /etc/passwd, which had to remain world-readable so utilities could resolve usernames. Anyone with a shell could carry the hashes off the machine and crack them offline.",
    lesson:
      "Modern systems split this into /etc/passwd (public metadata) and /etc/shadow (hashes, root-readable only) and use slow, salted hashes (bcrypt, argon2). The lesson generalises: keep secret material in files only the security boundary that needs it can read.",
    simulated: [
      "All users and hashes are fictional.",
      "The hashes shown are not real DES crypt outputs and cannot be cracked.",
      "No real timeshare is connected.",
    ],
  },
};
