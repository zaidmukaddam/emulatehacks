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
  commands: {
    "python3 ir_toolkit.py parse-artifact --input pcap-summary.txt": "simulated safe tool replay for sql-slammer-worm; replaces: cat pcap-summary.txt\n",
    "python3 ir_toolkit.py parse-artifact --input MS02-039.txt": "simulated safe tool replay for sql-slammer-worm; replaces: cat MS02-039.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc 1434 --input pcap-summary.txt": "simulated safe tool replay for sql-slammer-worm; replaces: grep -nF 1434 pcap-summary.txt\n",
    "tcpdump -nn -r /home/dbadmin/slammer.pcap udp port 1434": [
      "reading from file /home/dbadmin/slammer.pcap",
      "18:02:01.112233 IP 203.0.113.9.49152 > 198.51.100.2.1434: UDP, length 404",
      "  0x0000: 0401 0101 0101 ... (simulated Slammer-style payload stub)",
      "18:02:01.112401 IP 198.51.100.2.1434 > 203.0.113.9.49152: ICMP port unreachable",
    ].join("\n"),
  },
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
    "/home/dbadmin/public-poc/slammer_udp_1434_stub.hexnote.txt": {
      content: [
        "# UDP/1434 single-datagram exploitation (CVE-2002-0649), Jan 2003 worm.",
        "# Public reversing showed ~376-byte UDP payload targeting SQL Resolution Service.",
        "",
        "# xxd-style stub head only (zeros / filler in real samples):",
        "# 0401010101010101 ...  ; ssnetlib resolution packet grooming",
        "",
        "# Lesson: firewall UDP 1434 everywhere; MSDE defaults burned carriers.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "tcpdump",
          goal: "Replay a canned tcpdump of UDP 1434 (SQL resolution service).",
          hint: "`tcpdump -nn -r /home/dbadmin/slammer.pcap udp port 1434`.",
          matches: [
            {
              kind: "exact",
              command: "tcpdump -nn -r /home/dbadmin/slammer.pcap udp port 1434",
            },
          ],
          narration:
            "UDP/1434, SQL Server's resolution service, not the TCP query port people firewall. Tiny payloads, huge amplification per infected host.",
        },
    {
          id: "pcap",
          goal: "Read the analyst packet summary.",
          hint: "`python3 ir_toolkit.py parse-artifact --input pcap-summary.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input pcap-summary.txt" }],
          narration:
            "Aggregate view of line-rate UDP/1434 and blast radius. Cross-check with the single-packet replay above.",
        },
    {
          id: "bulletin",
          goal: "Read the Microsoft bulletin excerpt.",
          hint: "`python3 ir_toolkit.py parse-artifact --input MS02-039.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input MS02-039.txt" }],
          narration:
            "The fix shipped six months before the worm. Slammer is the textbook cost of patch lag on internet-facing databases.",
        },
    {
          id: "grep-port",
          goal: "Search the summary for the vulnerable port.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc 1434 --input pcap-summary.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc 1434 --input pcap-summary.txt" }],
          narration:
            "Every line that matters names 1434. Perimeter rules that only watched TCP left this hole wide open.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/slammer_udp_1434_stub.hexnote.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/slammer_udp_1434_stub.hexnote.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
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
