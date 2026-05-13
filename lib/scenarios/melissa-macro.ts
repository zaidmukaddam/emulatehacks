import type { Scenario } from "../types";

/** Melissa, March 1999. Word macro worm; ~100k+ infections within days. */
export const melissaMacro: Scenario = {
  slug: "melissa-macro",
  exhibit: "EXH-004",
  title: "Friday Afternoon",
  tagline:
    "March 26, 1999. A Word macro arrives as list.doc from someone you know. By Monday the mail servers at Intel and Microsoft are holding tens of thousands of copies.",
  category: "classic-history",
  difficulty: "beginner",
  era: "1990s",
  year: "1999",
  estMinutes: 7,
  fictional: true,
  cwd: "/var/mail/exchange-mirror",
  user: "analyst",
  host: "msg-gw-east",
  role: "Email administrator watching queue depth spike during Melissa's first exponential hour.",
  objective:
    "Ole-scan the attachment, read the incident notes, then prove the subject pattern from the quarantined headers.",
  briefing:
    "The attachment is `list.doc`, same 40-name Outlook address book blast that made Melissa famous. You do not have live SMTP here. Read the samples the gateway already caught.",
  env: { USER: "analyst", SHELL: "/bin/sh", PWD: "/var/mail/exchange-mirror" },
  ps: ["  PID TTY TIME CMD", "  41 ?   0:02 sendmail", "  55 ?   0:00 sh"],
  history: ["pwd"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input MELISSA-NOTES.txt": "simulated safe tool replay for melissa-macro; replaces: cat MELISSA-NOTES.txt\n",
    "python3 safe_replay.py --scenario melissa-macro --artifact quarantine/0001.eml": "simulated safe tool replay for melissa-macro; replaces: cat quarantine/0001.eml\n",
    "python3 safe_replay.py --scenario melissa-macro --grep subject --artifact quarantine/0001.eml": "simulated safe tool replay for melissa-macro; replaces: grep -nF Subject quarantine/0001.eml\n",
    "oleid quarantine/list.doc": [
      "filename: quarantine/list.doc",
      "OLE format: yes",
      "VBA macros: PRESENT (AutoOpen)",
      "risk: HIGH (mass-mail pattern historically associated with Melissa)",
    ].join("\n"),
  },
  files: {
    "/var/mail/exchange-mirror/MELISSA-NOTES.txt": {
      content: [
        "Melissa (1999-03-26)",
        "Vector: Word 97/Word 2000 macro in list.doc",
        "Spread: mass-mails first 50 entries in Outlook address book",
        "Subject variants: Important Message From <spoofed sender>",
        "Payload: lowers macro security; mass-mail loop; some registry keys",
        "Creator: David L. Smith, pleaded guilty 1999, ~$80M damage estimate cited in press",
      ].join("\n"),
    },
    "/var/mail/exchange-mirror/quarantine/list.doc": {
      content: "D0 CF 11 E0 A1 B1 1A E1  (simulated OLE2 header stub)\n",
    },
    "/var/mail/exchange-mirror/quarantine/0001.eml": {
      content: [
        "From: colleague@example.com",
        "To: everyone-in-addr-book",
        "Subject: Important Message From colleague@example.com",
        "MIME-Version: 1.0",
        "Content-Type: application/msword",
        "X-Quarantine-Reason: WINWORD macro OLE2 container matches Melissa signature",
        "Attachment: list.doc",
      ].join("\n"),
    },
    "/var/mail/exchange-mirror/public-poc/melissa_style_autopen_stub.vba": {
      content: [
        "' Educational fragment: Melissa-class Word macro pattern (AutoOpen mass-mail).",
        "' Not runnable in the museum shell; Outlook.Application + MAPI send loop.",
        "",
        "Sub AutoOpen()",
        "  Dim OA As Object, ML As Object, AD As Variant, i As Integer",
        "  Set OA = CreateObject(\"Outlook.Application\")",
        "  Set ML = OA.CreateItem(0)",
        "  ' ... iterate AddressEntries, attach ActiveDocument.Copy ...",
        "End Sub",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "oleid",
          goal: "Run an OLE/macro fingerprint on the quarantined attachment.",
          hint: "`oleid quarantine/list.doc`.",
          matches: [{ kind: "exact", command: "oleid quarantine/list.doc" }],
          narration:
            "Macros + trusted sender illusion. That's the entire threat model Office would fight for the next twenty-five years.",
        },
    {
          id: "notes",
          goal: "Read the incident summary.",
          hint: "`python3 ir_toolkit.py parse-artifact --input MELISSA-NOTES.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input MELISSA-NOTES.txt" }],
          narration:
            "Outlook address book blasting at scale, one attachment name repeated across enterprises.",
        },
    {
          id: "sample",
          goal: "Open the quarantined message header.",
          hint: "`python3 safe_replay.py --scenario melissa-macro --artifact quarantine/0001.eml`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario melissa-macro --artifact quarantine/0001.eml" }],
          narration:
            "Same human filename every time, `list.doc`, so help desks could keyword-block once they knew the shape.",
        },
    {
          id: "grep-subject",
          goal: "Confirm the subject pattern on this sample.",
          hint: "`python3 safe_replay.py --scenario melissa-macro --grep subject --artifact quarantine/0001.eml`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario melissa-macro --grep subject --artifact quarantine/0001.eml" }],
          narration:
            "`Important Message From …`, social engineering baked into the subject line so victims assumed chain-of-trust.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/melissa_style_autopen_stub.vba`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/melissa_style_autopen_stub.vba" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "Melissa was a mass-mailing macro worm for Microsoft Word, first observed on March 26, 1999. It spread by emailing itself to the first entries in the victim's Microsoft Outlook address book, often using manipulated subject lines so messages appeared to come from someone the recipient recognised. It was among the first malware incidents to demonstrate how quickly macro-enabled documents could scale across corporate email.",
    lesson:
      "Untrusted documents are programs. The modern parallel is not only Word macros but also PDF JavaScript, ISO+LNK shipping, and HTML smuggling. Default-deny macro execution (as Microsoft eventually shipped) plus gateway stripping of dangerous MIME types remains the pattern; user training without technical controls failed in 1999 and still fails now.",
    simulated: [
      "Message bodies and domains are fictional; Melissa's mechanism, date, filename, and creator plea are historically grounded in public reporting.",
      "oleid output is simulated.",
    ],
  },
};
