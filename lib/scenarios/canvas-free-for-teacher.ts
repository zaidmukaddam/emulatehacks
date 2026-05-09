import type { Scenario } from "../types";

export const canvasFreeForTeacher: Scenario = {
  slug: "canvas-free-for-teacher",
  exhibit: "EXH-037",
  title: "Finals Week Lockout",
  tagline:
    "May 8, 2026. Canvas is back online after a same-week breach, but schools are still deciding whether to reconnect SSO, warn users, and trust the vendor's containment notes.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/itsec/canvas-bridge",
  user: "itsec",
  host: "campus-idp-02",
  role: "Campus security engineer responsible for the Canvas SSO integration during final exams.",
  objective:
    "Use the vendor FAQ, local SSO logs, and the campus action checklist to decide whether Canvas can be reconnected safely.",
  briefing:
    "Instructure detected unauthorized Canvas activity on April 29, 2026. On May 7, the same actor changed pages that appeared to some logged-in students and teachers, so Canvas was moved into maintenance mode. Public reporting the next day described broad finals disruption and a ransom note attributed to ShinyHunters. Your campus disconnected Canvas from the identity provider while the vendor investigated. The question now is whether the evidence supports a phased reconnect or continued isolation.",
  env: {
    USER: "itsec",
    SHELL: "/bin/sh",
    PWD: "/home/itsec/canvas-bridge",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "    1 ?        00:00:03 systemd",
    "  224 ?        00:00:09 idp-agent",
    "  517 ?        00:00:01 audit-forwarder",
    "  921 pts/0    00:00:00 sh",
    "  932 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "cat ADVISORY.md"],
  files: {
    "/home/itsec/canvas-bridge/ADVISORY.md": {
      content: [
        "Canvas LMS security incident, May 2026",
        "",
        "Public window:",
        "  Apr 29: Instructure detected unauthorized activity in Canvas.",
        "  May 5: impacted organizations were notified directly.",
        "  May 7: additional activity changed pages shown to some logged-in users.",
        "  May 8: public reporting described finals disruption at many schools.",
        "",
        "Vendor-identified path:",
        "  Free-For-Teacher account issue, temporarily shut down by Instructure.",
        "",
        "Campus triage order:",
        "  1) read the vendor FAQ for confirmed scope",
        "  2) verify the access path was removed",
        "  3) confirm what data types were involved",
        "  4) keep Canvas isolated from SSO until monitoring is clean",
        "  5) warn users about phishing that references finals, grades, or Canvas",
      ].join("\n"),
    },
    "/home/itsec/canvas-bridge/vendor/instructure-faq.txt": {
      content: [
        "Security Incident Update and FAQs, extracted for campus IR",
        "",
        "What happened:",
        "On April 29, 2026, unauthorized activity was detected in Canvas. The unauthorized party's access was revoked, an investigation began, and outside forensic experts were engaged.",
        "",
        "On May 7, 2026, additional unauthorized activity tied to the same incident was identified. The unauthorized actor made changes to pages that appeared when some students and teachers were logged in through Canvas. Canvas was temporarily taken offline into maintenance mode to contain the activity, investigate, and apply safeguards.",
        "",
        "Confirmed access path:",
        "The activity exploited an issue related to Free-For-Teacher accounts. Instructure temporarily shut down Free-For-Teacher accounts to remove that access path.",
        "",
        "Response actions:",
        "Instructure revoked privileged credentials and access tokens, deployed platform-wide protections, rotated certain internal keys, restricted token creation pathways, added monitoring, engaged a third-party forensic firm, and notified law enforcement including the FBI and CISA.",
        "",
        "Information involved:",
        "The data taken in the April 29 incident includes certain personal information of users at affected organizations, including names, email addresses, student ID numbers, and messages among Canvas users.",
        "",
        "Information not seen so far:",
        "Instructure found no evidence that passwords, dates of birth, government identifiers, or financial information were involved. Instructure also found no evidence that data was taken during the May 7 activity.",
        "",
        "Current vendor status:",
        "Canvas is back online and available for use. The external forensic partner reviewed known indicators and found no evidence that the threat actor currently has access to the platform.",
      ].join("\n"),
    },
    "/home/itsec/canvas-bridge/logs/sso.log": {
      content: [
        "2026-05-07T19:14:02Z idp canvas_saml status=enabled result=normal user=student-4821",
        "2026-05-07T20:08:44Z idp canvas_saml status=disabled reason=vendor-maintenance-mode actor=secops",
        "2026-05-07T20:09:17Z idp canvas_saml status=disabled result=blocked user=student-9112",
        "2026-05-07T20:11:29Z idp canvas_saml status=disabled result=blocked user=faculty-210",
        "2026-05-08T03:22:05Z idp canvas_saml status=disabled result=blocked user=student-0314",
        "2026-05-08T13:01:33Z idp canvas_saml status=disabled reason=waiting-for-forensic-review actor=secops",
        "2026-05-08T17:46:51Z idp canvas_saml status=pilot-allowlist result=allowed user=it-test-02",
        "2026-05-08T17:47:12Z idp canvas_saml status=pilot-allowlist result=blocked user=student-4821",
      ].join("\n"),
    },
    "/home/itsec/canvas-bridge/monitoring/known-indicators.txt": {
      content: [
        "local indicator review",
        "",
        "canvas_saml anomalous login spike: none observed after SSO disconnect",
        "new OAuth token grants to Canvas: none after 2026-05-07T20:08:44Z",
        "unexpected Canvas admin role grants: none in campus IdP",
        "phishing reports mentioning Canvas ransom note: 7 reports, all blocked",
        "vendor statement: external forensic partner found no evidence of current platform access",
      ].join("\n"),
    },
    "/home/itsec/canvas-bridge/communications/phishing-warning.md": {
      content: [
        "# Draft campus warning",
        "",
        "Canvas access is being restored in phases after a vendor security incident.",
        "",
        "Do not click unexpected links claiming to restore grades, finals, lecture notes, or Canvas access. Campus IT will never ask for your password by email, text message, or chat.",
        "",
        "Use the official campus portal bookmark for Canvas. Report suspicious Canvas messages to security@midtown.example.",
      ].join("\n"),
    },
    "/home/itsec/canvas-bridge/ACTION-PLAN.md": {
      content: [
        "Reconnect plan for Canvas SSO",
        "",
        "[x] Vendor names access path: Free-For-Teacher account issue.",
        "[x] Vendor says access path was removed by temporarily shutting down Free-For-Teacher accounts.",
        "[x] Vendor confirms privileged credentials and access tokens were revoked.",
        "[x] Vendor confirms internal keys were rotated and token creation pathways restricted.",
        "[x] Local IdP shows Canvas SSO disabled during containment.",
        "[x] Local monitoring shows no anomalous login spike after disconnect.",
        "[ ] Reconnect only a small IT allowlist first.",
        "[ ] Keep broad student and faculty access blocked until the pilot is quiet for one hour.",
        "[ ] Send phishing warning before broad restore.",
        "",
        "Decision: phased reconnect, not full reopen. Keep Canvas behind an allowlist until local SSO, token, and phishing monitoring stay clean.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "advisory",
      goal: "Read the campus advisory to understand the incident timeline.",
      hint: "`cat ADVISORY.md`.",
      matches: [{ kind: "exact", command: "cat ADVISORY.md" }],
      narration:
        "The important split is April 29 data access versus May 7 page changes. Treat them as one incident, but keep the impact statements separate.",
    },
    {
      id: "faq",
      goal: "Open the vendor FAQ excerpt for confirmed facts.",
      hint: "`cat vendor/instructure-faq.txt`.",
      matches: [{ kind: "exact", command: "cat vendor/instructure-faq.txt" }],
      narration:
        "The vendor says the May 7 activity changed pages seen by some logged-in users, then Canvas was taken offline as a containment step.",
    },
    {
      id: "access-path",
      goal: "Find the named access path in the FAQ.",
      hint: "`grep -nF Free-For-Teacher vendor/instructure-faq.txt`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF Free-For-Teacher vendor/instructure-faq.txt",
        },
      ],
      narration:
        "Free-For-Teacher is the access path Instructure named. Shutting it down removes the known path, but it does not by itself prove the campus can fully reconnect.",
    },
    {
      id: "data-scope",
      goal: "Confirm what user data was involved.",
      hint: "`grep -nF \"names\" vendor/instructure-faq.txt`.",
      matches: [
        {
          kind: "exact",
          command: 'grep -nF "names" vendor/instructure-faq.txt',
        },
      ],
      narration:
        "Names, email addresses, student ID numbers, and Canvas messages are enough to create phishing risk, even without passwords.",
    },
    {
      id: "passwords",
      goal: "Check the FAQ for data types not seen so far.",
      hint: "`grep -nF passwords vendor/instructure-faq.txt`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF passwords vendor/instructure-faq.txt",
        },
      ],
      narration:
        "No evidence of passwords, dates of birth, government identifiers, or financial information so far. That reduces account-takeover risk, but it does not remove phishing risk.",
    },
    {
      id: "sso",
      goal: "Review the campus SSO log before reconnecting.",
      hint: "`grep -nF canvas_saml logs/sso.log`.",
      matches: [{ kind: "exact", command: "grep -nF canvas_saml logs/sso.log" }],
      narration:
        "The campus disconnected Canvas at 20:08 UTC, then shifted to a tiny IT allowlist on May 8. That is the right shape: prove the path with test users before reopening everyone.",
    },
    {
      id: "plan",
      goal: "Open the action plan and decide on the restore path.",
      hint: "`cat ACTION-PLAN.md`.",
      matches: [{ kind: "exact", command: "cat ACTION-PLAN.md" }],
      narration:
        "Decision: phased reconnect. Keep the allowlist until local SSO logs, token grants, and phishing reports stay quiet, then warn users before broad access returns.",
    },
  ],
  debrief: {
    summary:
      "Instructure's May 2026 Canvas incident involved unauthorized activity first detected on April 29 and additional activity on May 7, when an actor changed pages shown to some logged-in users. Instructure said the access path involved Free-For-Teacher accounts, which it temporarily shut down. Public reporting on May 8 described disruption across schools during finals and a ransom note attributed to ShinyHunters. The vendor said data taken in the April 29 incident included names, email addresses, student ID numbers, and Canvas messages, with no evidence so far of passwords, dates of birth, government identifiers, or financial information.",
    lesson:
      "Vendor containment is an input, not the whole decision. For a SaaS breach tied to identity and classroom workflows, a safe restore combines the vendor's facts with your own logs: disable SSO during uncertainty, confirm the named access path was removed, review token and admin-role activity, pilot with an allowlist, and communicate phishing guidance before broad access returns. The incident response win is continuity without turning a vendor outage into a campus credential event.",
    simulated: [
      "Midtown University, hostnames, users, SSO log lines, monitoring notes, and action-plan details are invented.",
      "No exploit technique is modeled. The exhibit focuses on SaaS incident-response decisions, identity isolation, and phishing warnings.",
      "The dates, Free-For-Teacher access-path statement, response actions, data categories, Canvas outage context, and ShinyHunters attribution in public reporting are based on Instructure's incident FAQ and NPR reporting from May 8, 2026.",
    ],
  },
};
