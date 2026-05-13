import type { Scenario } from "../types";

/** Mydoom / Novarg, Jan 2004. Mass-mailing worm + DDoS backdoor; briefly topped Slammer for noise. */
export const mydoomWorm: Scenario = {
  slug: "mydoom-smtp",
  exhibit: "EXH-008",
  title: "The Big Dig",
  tagline:
    "January 2004. Email subjects alternate between test, hello, and Mail Delivery System. The attachment is a scrap of shrapnel, and it opens outbound TCP 3127 on millions of desktops.",
  category: "classic-history",
  difficulty: "beginner",
  era: "2000s",
  year: "2004",
  estMinutes: 7,
  fictional: true,
  cwd: "/var/spool/sohokiller-watch",
  user: "noc",
  host: "mx-ord-west",
  role: "NOC analyst during the week Mydoom's SMTP traffic dwarfed legitimate mail at several universities.",
  objective:
    "Probe the Mydoom backdoor port from the NOC jump box, then read the CERT note and the deferred mail sample.",
  briefing:
    "This reconstruction reads like 2004 help-desk radio. The worm mailed copies of itself and opened a listener designers used as a staged DDoS platform against SCO Group's site, history you can quote in the debrief, not execute here.",
  env: { USER: "noc", SHELL: "/bin/sh", PWD: "/var/spool/sohokiller-watch" },
  ps: ["  PID TTY TIME CMD", "  12 ?   0:34 sendmail", "  900 pts/0 0:00 sh"],
  history: ["who"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input CERT-style-NOTE.txt": "simulated safe tool replay for mydoom-smtp; replaces: cat CERT-style-NOTE.txt\n",
    "python3 ir_toolkit.py parse-artifact --input deferred-sample.txt": "simulated safe tool replay for mydoom-smtp; replaces: cat deferred-sample.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc ioc --input deferred-sample.txt": "simulated safe tool replay for mydoom-smtp; replaces: grep -nF message.zip deferred-sample.txt\n",
    "nc -vz 203.0.113.77 3127":
      "Connection to 203.0.113.77 3127 port [tcp/*] succeeded! (simulated infected desktop listener)\n",
  },
  files: {
    "/var/spool/sohokiller-watch/CERT-style-NOTE.txt": {
      content: [
        "Mydoom.A / Novarg (Jan 2004)",
        "Mass-mail with zip/exe payload; spoofs From: arbitrarily",
        "Copies itself to P2P share names, Kazaa era",
        "Backdoor: listens TCP 3127 (later variants shifted)",
        "Scheduled DDoS window against www.sco.com theorised in early analysis (public controversy)",
        "Mydoom.B introduced search-engine poisoning via localhost HTTP proxy",
      ].join("\n"),
    },
    "/var/spool/sohokiller-watch/deferred-sample.txt": {
      content: [
        "msgid=<10345.fake@spoofed.edu>",
        "Subject: Mail Delivery System",
        "Attachment: message.zip (contains document.exe)",
        "HELO mx-ord-west.local",
        "RCPT TO: victim@department.example",
        "X-Amavis-Alert: YES_MYDOOM_HEX_SIG",
      ].join("\n"),
    },
    "/var/spool/sohokiller-watch/public-poc/mydoom_backdoor_listen_stub.c": {
      content: [
        "/* Museum note: infected hosts listened TCP 3127 (Mydoom.A era public IOC). */",
        "/* Real worm carried SMTP engine + SOCKS-like proxy staging; no live code here. */",
        "",
        "#include <netinet/in.h>",
        "// socket(AF_INET, SOCK_STREAM, 0); bind(port 3127); listen(); /* analyst checklist */",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "nc-backdoor",
          goal: "Simulate an nc connectivity probe to the classic Mydoom listener port.",
          hint: "`nc -vz 203.0.113.77 3127`.",
          matches: [{ kind: "exact", command: "nc -vz 203.0.113.77 3127" }],
          narration:
            "TCP 3127 was the tell on help-desk checklists: worm phones home for staged DDoS tooling, not just SMTP noise.",
        },
    {
          id: "read-note",
          goal: "Read the CERT-style reconstruction note.",
          hint: "`python3 ir_toolkit.py parse-artifact --input CERT-style-NOTE.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input CERT-style-NOTE.txt" }],
          narration:
            "SMTP + file-sharing + backdoor, the triple package before botnets professionalised rental.",
        },
    {
          id: "sample",
          goal: "Inspect the deferred spam sample.",
          hint: "`python3 ir_toolkit.py parse-artifact --input deferred-sample.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input deferred-sample.txt" }],
          narration:
            "Spoofed `Mail Delivery System`, attackers learned early that system messages bypass scepticism.",
        },
    {
          id: "grep-zip",
          goal: "Pull the line naming the weaponised archive.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc ioc --input deferred-sample.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc ioc --input deferred-sample.txt" }],
          narration:
            "Same attachment naming every branch office, easy fingerprint once AV hexdumps stabilise.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/mydoom_backdoor_listen_stub.c`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/mydoom_backdoor_listen_stub.c" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "Mydoom (also called Novarg) was a mass-mailing computer worm discovered in January 2004. It spread primarily via email with malicious attachments, copied itself to peer-to-peer shared folders on affected Windows systems, and installed a backdoor that listened on TCP port 3127 on many infections. Some variants included functionality associated with denial-of-service activity and search-engine abuse; at its peak it accounted for a large fraction of global email traffic.",
    lesson:
      "When email is both the lateral-movement and the C2 signup channel, perimeter mail hygiene has to move from 'nice to have' to SLO-backed. Modern equivalents attach ISO files and password-protected zips, different file types, same human exploit: hurry + authority + familiarity.",
    simulated: [
      "Mail headers are invented; Mydoom timeframe, SMTP spread, TCP/3127 listening, and historical impact claims are from public analysis.",
    ],
  },
};
