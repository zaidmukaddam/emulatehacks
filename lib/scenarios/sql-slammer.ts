import type { Scenario } from "../types";

export const sqlSlammer: Scenario = {
  slug: "sql-slammer-worm",
  exhibit: "EXH-007",
  title: "376 Bytes",
  tagline:
    "January 25, 2003. A single malformed UDP packet to SQL Server can own the process. Someone weaponises it into the fastest-spreading worm the internet had yet seen.",
  category: "classic-history",
  difficulty: "intermediate",
  era: "2000s",
  year: "2003",
  estMinutes: 9,
  fictional: true,
  cwd: "/home/dbadmin",
  user: "dbadmin",
  host: "mssql-arch-01",
  role: "Database administrator called in when core routers start seeing line-rate UDP 1434.",
  objective:
    "Connect the worm to its root cause, a buffer overflow on a UDP listener, and name the missing patch.",
  briefing:
    "NOC says `udp/1434` from everywhere. You do not have production access in this simulation, only notes, a patch bulletin, and a snippet of `pcap-summary.txt`. Work backward from the port.",
  env: { USER: "dbadmin", SHELL: "/bin/sh", PWD: "/home/dbadmin" },
  ps: ["  PID TTY TIME CMD", "  1 ?   0:01 init", "  220 tty1 0:00 sh"],
  history: ["whoami"],
  files: {
    "/home/dbadmin/pcap-summary.txt": {
      content: [
        "# export from backbone tap (simulated aggregate)",
        "",
        "frame 1: udp 1434 len=404 src=random dst=random",
        "  payload begins: 04 01 01 01 ... (OLE pattern into ssnetlib)",
        "  follow-on: scanner sweep ~55k pps per infected host",
        "",
        "impact:",
        "  ATM networks in Korea offline",
        "  Continental Airlines ticketing degraded",
        "  MS SQL 2000 + Desktop Engine default listener exposed",
      ].join("\n"),
    },
    "/home/dbadmin/MS02-039.txt": {
      content: [
        "Microsoft Security Bulletin MS02-039",
        "Unchecked Buffer in SQL Server 2000 Resolution Service (Q323875)",
        "",
        "CVE: CVE-2002-0649 (stack overflow in SQL Server Resolution Service)",
        "Vector: UDP port 1434, single packet sufficient for code execution",
        "Affected: SQL Server 2000, MSDE 2000 with networking enabled",
        "Fix: patch + disable SQL listener on perimeter-facing hosts",
        "",
        "Released: July 2002, worms in Jan 2003 target unpatched fleet",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "pcap",
      goal: "Read the packet summary.",
      hint: "`cat pcap-summary.txt`.",
      matches: [{ kind: "exact", command: "cat pcap-summary.txt" }],
      narration:
        "UDP/1434, SQL Server's resolution service, not the TCP query port people firewall. Tiny payloads, huge amplification per infected host.",
    },
    {
      id: "bulletin",
      goal: "Read the Microsoft bulletin excerpt.",
      hint: "`cat MS02-039.txt`.",
      matches: [{ kind: "exact", command: "cat MS02-039.txt" }],
      narration:
        "The fix shipped six months before the worm. Slammer is the textbook cost of patch lag on internet-facing databases.",
    },
    {
      id: "grep-port",
      goal: "Search the summary for the vulnerable port.",
      hint: "`grep -nF 1434 pcap-summary.txt`.",
      matches: [{ kind: "exact", command: "grep -nF 1434 pcap-summary.txt" }],
      narration:
        "Every line that matters names 1434. Perimeter rules that only watched TCP left this hole wide open.",
    },
  ],
  debrief: {
    summary:
      "SQL Slammer, also called Sapphire, was a memory-resident worm that spread on January 25, 2003, by sending a single UDP packet exploiting a stack buffer overflow in Microsoft SQL Server 2000's Resolution Service (MS02-039 / CVE-2002-0649). Its entire worm body was only a few hundred bytes, yet it doubled infections roughly every few seconds at peak and caused collateral outages worldwide, including banking and airline systems. The patch had been available since mid-2002.",
    lesson:
      "UDP services with code-execution bugs are worm fuel, there is no handshake to rate-limit. Database engines bundled with application servers routinely listen on unexpected ports; inventory beats firewall folklore. Finally: patch latency measured in quarters becomes outage measured in hours.",
    simulated: [
      "The pcap text is synthetic; Slammer's real packet sizes and growth curves are documented in CAIDA analyses.",
    ],
  },
};
