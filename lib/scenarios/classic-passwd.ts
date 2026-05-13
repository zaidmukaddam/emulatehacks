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
    "Enumerate the host, pull printable secrets from passwd with strings, then simulate an offline crypt crack.",
  briefing:
    "It is 1988. /etc/passwd holds usernames, UIDs, shells, and, until shadow files arrived, the hashed passwords too. Anyone who could read the file could carry it home and run a cracker against it. This exhibit reconstructs that moment, with fake users.",
  env: { USER: "student", SHELL: "/bin/sh", PWD: "/etc", TERM: "vt100" },
  ps: [
    "  PID TTY  TIME CMD",
    "    1 ?    0:01 init",
    "   84 co   0:00 getty",
    "  211 p1   0:00 sh",
  ],
  history: ["who", "ls /etc"],
  commands: {
    "python3 ir_toolkit.py enumerate --path .": "simulated safe tool replay for classic-password-file; replaces: ls\n",
    "python3 safe_replay.py --scenario classic-password-file --artifact /etc/shadow": "simulated safe tool replay for classic-password-file; replaces: cat /etc/shadow\n",
    "strings passwd": [
      "root:Zx7q.k1.sLpYU:0:0:Operator:/:/bin/sh",
      "guest:abYI.qz.PpCxw:100:100:Guest:/usr/guest:/bin/sh",
      "student:lmXp.Rt.qZ8s.:101:100:Student account:/usr/student:/bin/sh",
      "kthompson:Wjk6/n.0.qnEMW:200:1:Ken (visitor):/usr/kthompson:/bin/sh",
      "(simulated: DES crypt strings are readable by any user with cat or strings)",
    ].join("\n"),
    "john --show passwd": [
      "guest:guest1988       (passwd)",
      "1 password hash cracked, 3 left",
      "Note: exhibit-only fake crack to show offline risk",
    ].join("\n"),
  },
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
    "/etc/public-poc/unshadow_and_john_example.sh": {
      content: [
        "#!/bin/sh",
        "# 1980s-era /etc/passwd held crypt(3) hashes in the second field (before shadow).",
        "# Museum-only: no real hashes; shows the offline crack workflow.",
        "",
        "# unshadow /etc/passwd /etc/shadow > hashes.txt   # when shadow exists",
        "# john --wordlist=words.txt hashes.txt",
        "",
        "echo 'root:Zx7q.k1.sLpYU:0:0:...'  # DES crypt in field 2, visible to any user",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "look-around",
          goal: "List the etc directory.",
          hint: "`python3 ir_toolkit.py enumerate --path .`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py enumerate --path ." }],
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
          id: "strings-passwd",
          goal: "Run strings on passwd to mimic dumping cleartext hash fields.",
          hint: "`strings passwd`.",
          matches: [{ kind: "exact", command: "strings passwd" }],
          narration:
            "The second field is the hashed password. World-readable, by design. You could copy this file off the system and crack it at your leisure.",
        },
    {
          id: "john-show",
          goal: "Simulate John showing one cracked line from the same passwd file.",
          hint: "`john --show passwd`.",
          matches: [{ kind: "exact", command: "john --show passwd" }],
          narration:
            "Offline crypt(3) cracking is the punchline: hashes left the building on a floppy, not the password in clear on disk.",
        },
    {
          id: "look-for-shadow",
          goal: "Look for /etc/shadow.",
          hint: "`python3 safe_replay.py --scenario classic-password-file --artifact /etc/shadow`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario classic-password-file --artifact /etc/shadow" }],
          narration:
            "It does not exist on this system. Shadow files separated hashes from the public passwd file, that change took years to become universal.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/unshadow_and_john_example.sh`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/unshadow_and_john_example.sh" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
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
      "john output is canned for teaching.",
    ],
  },
};
