import type { Scenario } from "../types";

export const iloveyouVirus: Scenario = {
  slug: "iloveyou-macro",
  exhibit: "EXH-005",
  title: "Kind Regards",
  tagline:
    "May 2000. The subject line is ILOVEYOU. The attachment is a .vbs file. Within hours, outlook.exe is the fastest file-sharing network on Earth.",
  category: "classic-history",
  difficulty: "beginner",
  era: "2000s",
  year: "2000",
  estMinutes: 8,
  fictional: true,
  cwd: "/var/spool/mailgateway",
  user: "postmaster",
  host: "gw-manila",
  role: "Mail administrator at a university in the Philippines, ground zero for the storm.",
  objective:
    "Fingerprint the attachment type, read the quarantine log, then confirm the worm summary.",
  briefing:
    "The help desk opened fifty tickets in an hour. Users say `I only opened an email from Carol`. Attachment type and scripting engine matter more than who sent it, the From: header is lies. Walk the quarantine logs.",
  env: { USER: "postmaster", SHELL: "/bin/sh", PWD: "/var/spool/mailgateway" },
  ps: ["  PID TTY TIME CMD", "  88 ?   0:12 sendmail", "  90 ?   0:01 sh"],
  history: ["pwd"],
  commands: {
    "tshark -r evidence.pcap --follow-log QUARANTINE.log": "simulated safe tool replay for iloveyou-macro; replaces: cat QUARANTINE.log\n",
    "python3 ir_toolkit.py parse-artifact --input WORM-SUMMARY.txt": "simulated safe tool replay for iloveyou-macro; replaces: cat WORM-SUMMARY.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"vbs\"' --follow-log QUARANTINE.log": "simulated safe tool replay for iloveyou-macro; replaces: grep -nF vbs QUARANTINE.log\n",
    "file quarantine/LOVE-LETTER-FOR-YOU.TXT.vbs":
      "quarantine/LOVE-LETTER-FOR-YOU.TXT.vbs: ASCII text, with CRLF line terminators, Windows Script Host VBScript (simulated)",
  },
  files: {
    "/var/spool/mailgateway/quarantine/LOVE-LETTER-FOR-YOU.TXT.vbs": {
      content: "' ILOVEYOU worm stub (simulated, inert)\n",
    },
    "/var/spool/mailgateway/QUARANTINE.log": {
      content: [
        "2000-05-04T08:14:11Z blocked message msgid=<AB12@edu.ph>",
        "  Subject: ILOVEYOU",
        "  Attachment: LOVE-LETTER-FOR-YOU.TXT.vbs  (28 KB)",
        "  MIME: application/octet-stream → Win32 script host signature",
        "  action: stripped attachment, notified user",
        "",
        "2000-05-04T08:18:44Z blocked message msgid=<CD34@corp.au>",
        "  Subject: ILOVEYOU",
        "  Attachment: LOVE-LETTER-FOR-YOU.TXT.vbs",
        "  X-Envelope-From: secretary@corp.au  (address book hop)",
        "",
        "2000-05-04T08:22:03Z stats: 1.2M similar messages globally (press wire)",
      ].join("\n"),
    },
    "/var/spool/mailgateway/WORM-SUMMARY.txt": {
      content: [
        "Loveletter / ILOVEYOU, quick reference",
        "",
        "Language: VBScript executed by Windows Script Host",
        "Spread: mass-mails everyone in MS Outlook address books + IRC hooks",
        "Payload: overwrites media files, downloads password stealer",
        "Attribution: Onel de Guzman, Manila; criminal charges discussed",
        "Damage estimates: billions of USD (productivity + remediation)",
        "",
        "Kill chain for defenders:",
        "  block .vbs at gateway, disable WSH on desktops, patch Outlook",
        "  train: never run 'documents' that are actually programs",
      ].join("\n"),
    },
    "/var/spool/mailgateway/public-poc/iloveyou_style_massmail_stub.vbs": {
      content: [
        "' Museum sketch: ILOVEYOU-era VBScript + Outlook address-book spread.",
        "' Inert text only; classic pattern was Scripting.FileSystemObject + SMTP via MAPI.",
        "",
        "' dim shell, outfile",
        "' set shell = CreateObject(\"WScript.Shell\")",
        "' ... For Each addr In Outlook.AddressLists ... SendMail ...",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "file-vbs",
          goal: "Identify what the attachment really is despite the .TXT prefix.",
          hint: "`file quarantine/LOVE-LETTER-FOR-YOU.TXT.vbs`.",
          matches: [
            {
              kind: "exact",
              command: "file quarantine/LOVE-LETTER-FOR-YOU.TXT.vbs",
            },
          ],
          narration:
            "Double extension social engineering: users saw TXT, Windows saw VBS. Gateway file(1) style checks break that story fast.",
        },
    {
          id: "log",
          goal: "Read the quarantine log.",
          hint: "`tshark -r evidence.pcap --follow-log QUARANTINE.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log QUARANTINE.log" }],
          narration:
            "Same attachment name across unrelated domains, classic worm, not targeted phish. The .vbs extension under a .TXT prefix is social engineering from the MIME era.",
        },
    {
          id: "summary",
          goal: "Read the worm summary.",
          hint: "`python3 ir_toolkit.py parse-artifact --input WORM-SUMMARY.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input WORM-SUMMARY.txt" }],
          narration:
            "VBScript + Outlook address books, why one click became ten thousand outbound messages before lunch.",
        },
    {
          id: "grep-vbs",
          goal: "Count how many quarantine lines mention the script extension.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"vbs\"' --follow-log QUARANTINE.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"vbs\"' --follow-log QUARANTINE.log" }],
          narration:
            "Every blocked love letter carried the same weaponised extension. Gateway stripping bought time; user training bought the next decade.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/iloveyou_style_massmail_stub.vbs`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/iloveyou_style_massmail_stub.vbs" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "On May 4, 2000, the ILOVEYOU worm, also known as Loveletter, spread globally as an email with a malicious VBScript attachment (`LOVE-LETTER-FOR-YOU.TXT.vbs`). When opened on Windows systems with Outlook and Windows Script Host enabled, it mailed itself to entries in the user's address book and overwrote media files. Damage estimates ran into the billions of dollars. The Philippines had no law criminalising the act at the time; author Onel de Guzman became the public face of the outbreak.",
    lesson:
      "The boundary between document and program was culturally fuzzy in 2000, attackers exploited that fuzz. Modern equivalents are macro-enabled Office files and HTML smuggling. The defense pattern repeats: default-deny execution, strip dangerous types at the gateway, and never trust romance subject lines at scale.",
    simulated: [
      "Hostnames and message-ids are invented; the worm name, date, attachment naming, technology stack, and scale are real.",
    ],
  },
};
