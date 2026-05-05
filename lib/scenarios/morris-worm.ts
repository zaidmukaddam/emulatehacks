import type { Scenario } from "../types";

export const morrisWorm: Scenario = {
  slug: "morris-internet-worm",
  exhibit: "EXH-002",
  title: "The First Flood",
  tagline:
    "November 2nd, 1988. Something is wrong with ARPANET, mail delays, logins failing, machines falling over. You're the grad student on duty who gets the phone call.",
  category: "classic-history",
  difficulty: "intermediate",
  era: "1980s",
  year: "1988",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/operator",
  user: "operator",
  host: "mit-ai-lab",
  role: "Junior systems operator on a BSD 4.3 timeshare connected to early ARPANET.",
  objective:
    "From logs and notes alone, characterise what is spreading, how it moves between hosts, and why it knocked out so many machines in one night.",
  briefing:
    "It is the evening of November 2, 1988. Campus modems are jammed. Every third machine reports `Not enough space` or a dead sendmail. You do not have outbound network tools in this reconstruction, only the local log fragments and a scratch file someone started. Work the evidence.",
  env: { USER: "operator", SHELL: "/bin/sh", PWD: "/home/operator", TERM: "vt100" },
  ps: [
    "  PID TTY  TIME CMD",
    "  101 co   0:00 getty",
    "  240 p0   0:00 sh",
  ],
  history: ["date", "w"],
  files: {
    "/home/operator/SCRATCH.md": {
      content: [
        "## 1988-11-02, weird night",
        "",
        "- load average on the VAX went stupid around 20:30 local",
        "- finger daemon cores everywhere? or just ours?",
        "- sendmail -bd children not reaping",
        "- rumor: Cornell grad student, worm, `rtm` username somewhere",
        "",
        "check:",
        "  - /var/log/messages for sendmail + finger",
        "  - /tmp/worm-analysis.txt (phoned in from cert circle)",
      ].join("\n"),
    },
    "/var/log/messages": {
      content: [
        "Nov  2 20:31:03 mit-ai-lab sendmail[184]: cannot fork: Resource temporarily unavailable",
        "Nov  2 20:31:04 mit-ai-lab fingerd[192]: connection from 10.0.0.44",
        "Nov  2 20:31:11 mit-ai-lab kernel: pid 201 fingerd: segmentation violation",
        "Nov  2 20:33:22 mit-ai-lab sendmail[210]: NAQP: lost connection from unknown",
        "Nov  2 20:45:01 mit-ai-lab inetd[88]: rsh connection from 128.2.0.9 (spoofed src?)",
      ].join("\n"),
    },
    "/tmp/worm-analysis.txt": {
      content: [
        "preliminary, not for publication",
        "",
        "self-replicating program targeting BSD 4.x + SunOS",
        "spread: exploiting bugs in debug builds of `fingerd` (gets overflow),",
        "       Sendmail DEBUG mode, rexec/rsh with weak trust",
        "copy: /usr/tmp/sh (hidden stage)",
        "feature: tried to guess passwords weakly; fork bomb when replication",
        "        succeeded too fast on same host (accidental DoS)",
        "",
        "cleanup: kill processes, restore binaries, disable debug sendmail, patch fingerd",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "scratch",
      goal: "Read the on-call scratch notes.",
      hint: "`cat SCRATCH.md`.",
      matches: [{ kind: "exact", command: "cat SCRATCH.md" }],
      narration:
        "Mail and finger both mentioned. ARPANET-era trust and a handful of networked daemons were enough to pull half the research net westward.",
    },
    {
      id: "messages",
      goal: "Inspect the system log for the failure pattern.",
      hint: "`cat /var/log/messages`.",
      matches: [{ kind: "exact", command: "cat /var/log/messages" }],
      narration:
        "sendmail cannot fork, classic symptom of process exhaustion. fingerd crashing on connections, the intrusion path, not the goal.",
    },
    {
      id: "grep-finger",
      goal: "Pull every fingerd line out of the log.",
      hint: "`grep -nF fingerd /var/log/messages`.",
      matches: [{ kind: "exact", command: "grep -nF fingerd /var/log/messages" }],
      narration:
        "Inbound finger connections followed immediately by segfaults. That's the fingerprint of the exploit chain people would later call the Morris worm.",
    },
    {
      id: "analysis",
      goal: "Read the CERT-circle analysis fragment.",
      hint: "`cat /tmp/worm-analysis.txt`.",
      matches: [{ kind: "exact", command: "cat /tmp/worm-analysis.txt" }],
      narration:
        "Multi-vector replication: not one bug, but several, fingerd, misconfigured sendmail, trust between hosts. The accidental fork storm is why historians still argue whether the author meant a denial-of-service.",
    },
  ],
  debrief: {
    summary:
      "On November 2, 1988, the Morris worm, released by Cornell graduate student Robert Tappan Morris, became the first worm to spread broadly across the early Internet (then ARPANET). It exploited implementation flaws in fingerd and some sendmail configurations, reused weak passwords, and used rsh/rexec trust between machines. Thousands of BSD and Sun workstations slowed to a halt within about twenty-four hours. The incident directly led to the creation of the first CERT/CC.",
    lesson:
      "Three lessons that aged well. (1) Debug features left enabled in production (`sendmail -bt`, unchecked builds of fingerd) are attack surface. Turning them off is cheaper than explaining them to Congress. (2) Trust between hosts without cryptographic identity is transitive failure, rsh and hosts.equiv scaled insecurity as fast as convenience. (3) Self-replicating code does not need malice to cause damage; an arithmetic mistake in a replication counter becomes a fork bomb.",
    simulated: [
      "All hosts, IPs, and PID numbers in the logs are invented for the exhibit shell.",
      "No worm binary or exploit code is present.",
      "The date, the author, the affected OS families, the daemon chain, and the creation of CERT are historically accurate.",
    ],
  },
};
