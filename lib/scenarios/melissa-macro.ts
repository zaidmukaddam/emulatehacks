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
    "From quarantine excerpts alone, identify the propagation mechanism and why the From: address looked trustworthy.",
  briefing:
    "The attachment is `list.doc`, same 40-name Outlook address book blast that made Melissa famous. You do not have live SMTP here. Read the samples the gateway already caught.",
  env: { USER: "analyst", SHELL: "/bin/sh", PWD: "/var/mail/exchange-mirror" },
  ps: ["  PID TTY TIME CMD", "  41 ?   0:02 sendmail", "  55 ?   0:00 sh"],
  history: ["pwd"],
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
  },
  steps: [
    {
      id: "notes",
      goal: "Read the incident summary.",
      hint: "`cat MELISSA-NOTES.txt`.",
      matches: [{ kind: "exact", command: "cat MELISSA-NOTES.txt" }],
      narration:
        "Macros + trusted sender illusion. That's the entire threat model Office would fight for the next twenty-five years.",
    },
    {
      id: "sample",
      goal: "Open the quarantined message header.",
      hint: "`cat quarantine/0001.eml`.",
      matches: [{ kind: "exact", command: "cat quarantine/0001.eml" }],
      narration:
        "Same human filename every time, `list.doc`, so help desks could keyword-block once they knew the shape.",
    },
    {
      id: "grep-subject",
      goal: "Confirm the subject pattern on this sample.",
      hint: "`grep -nF Subject quarantine/0001.eml`.",
      matches: [{ kind: "exact", command: "grep -nF Subject quarantine/0001.eml" }],
      narration:
        "`Important Message From …`, social engineering baked into the subject line so victims assumed chain-of-trust.",
    },
  ],
  debrief: {
    summary:
      "Melissa was a mass-mailing macro worm for Microsoft Word, first observed on March 26, 1999. It spread by emailing itself to the first entries in the victim's Microsoft Outlook address book, often using manipulated subject lines so messages appeared to come from someone the recipient recognised. It was among the first malware incidents to demonstrate how quickly macro-enabled documents could scale across corporate email.",
    lesson:
      "Untrusted documents are programs. The modern parallel is not only Word macros but also PDF JavaScript, ISO+LNK shipping, and HTML smuggling. Default-deny macro execution (as Microsoft eventually shipped) plus gateway stripping of dangerous MIME types remains the pattern; user training without technical controls failed in 1999 and still fails now.",
    simulated: [
      "Message bodies and domains are fictional; Melissa's mechanism, date, filename, and creator plea are historically grounded in public reporting.",
    ],
  },
};
