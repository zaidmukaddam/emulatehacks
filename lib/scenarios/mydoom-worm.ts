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
    "From queue dumps and a stub CERT-style note, characterise the mail + backdoor footprint without touching live binaries.",
  briefing:
    "This reconstruction reads like 2004 help-desk radio. The worm mailed copies of itself and opened a listener designers used as a staged DDoS platform against SCO Group's site, history you can quote in the debrief, not execute here.",
  env: { USER: "noc", SHELL: "/bin/sh", PWD: "/var/spool/sohokiller-watch" },
  ps: ["  PID TTY TIME CMD", "  12 ?   0:34 sendmail", "  900 pts/0 0:00 sh"],
  history: ["who"],
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
  },
  steps: [
    {
      id: "read-note",
      goal: "Read the CERT-style reconstruction note.",
      hint: "`cat CERT-style-NOTE.txt`.",
      matches: [{ kind: "exact", command: "cat CERT-style-NOTE.txt" }],
      narration:
        "SMTP + file-sharing + backdoor, the triple package before botnets professionalised rental.",
    },
    {
      id: "sample",
      goal: "Inspect the deferred spam sample.",
      hint: "`cat deferred-sample.txt`.",
      matches: [{ kind: "exact", command: "cat deferred-sample.txt" }],
      narration:
        "Spoofed `Mail Delivery System`, attackers learned early that system messages bypass scepticism.",
    },
    {
      id: "grep-zip",
      goal: "Pull the line naming the weaponised archive.",
      hint: "`grep -nF message.zip deferred-sample.txt`.",
      matches: [{ kind: "exact", command: "grep -nF message.zip deferred-sample.txt" }],
      narration:
        "Same attachment naming every branch office, easy fingerprint once AV hexdumps stabilise.",
    },
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
