import type { Scenario } from "../types";

/** Alleged British Airways crew portal breach, reported May 2026. Defensive reconstruction only. */
export const britishAirwaysCrewPortal: Scenario = {
  slug: "british-airways-crew-portal",
  exhibit: "EXH-048",
  title: "Crew Portal Claims",
  tagline:
    "15 May 2026. A pro-Russian group claims access to British Airways crew systems, sick leave data, and an AI knowledge platform. You validate the report as an alleged breach and build the first containment packet.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/airline-ir/ba-crew-portal",
  user: "responder",
  host: "soc-airline-01",
  role: "Airline SOC responder triaging public breach claims before an official vendor confirmation.",
  objective:
    "Correlate the reported claim to synthetic crew portal logs: compromised account, admin panel access, sick leave data exposure, Cognino AI 360 API key risk, sale post pressure, and containment actions.",
  briefing:
    "Cyber Daily reported on 15 May 2026 that Infrastructure Destruction Squad claimed it breached British Airways systems through a compromised account, reached a Crew Portal admin panel, exposed crew sick leave data, and found API keys in a Cognino AI 360 environment. Cybernews had reported similar claims a day earlier and said researchers reviewed samples. British Airways had not publicly acknowledged the claims in the Cyber Daily report. This exhibit is a defensive reconstruction using synthetic artefacts only.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/airline-ir/ba-crew-portal" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input source-notes/incident-brief.txt": [
      "Source notes, public reporting only",
      "",
      "Cyber Daily: 2026-05-15, British Airways allegedly breached as hackers claim pilot data theft.",
      "Cybernews: 2026-05-14, British Airways breach claims raise operational security concerns.",
      "",
      "Reported claim: Infrastructure Destruction Squad, also known as Dark Engine, said it used a compromised account to reach a Crew Portal admin panel.",
      "Reported data themes: cabin crew and pilot schedules, sick leave data, employee personal information, medical-server files, Cognino AI 360 login material, emails, and API keys.",
      "Status at report time: British Airways had not publicly acknowledged the claims in the Cyber Daily story.",
    ].join("\n"),
    "curl -sI https://crew.ba.example/portal/admin": [
      "HTTP/2 302",
      "location: /portal/login?next=/portal/admin",
      "server: airline-edge-sim",
      "x-simulated: true",
      "",
    ].join("\n"),
    "tshark -r evidence.pcap -Y 'frame contains \"CrewPortal\"' --follow-log logs/crew-portal-events.log": [
      "2026-05-15T04:31:10Z app=CrewPortal user=ba.cabin.ops ip=198.51.100.73 action=login mfa=passed device=new",
      "2026-05-15T04:32:44Z app=CrewPortal user=ba.cabin.ops ip=198.51.100.73 action=admin_console result=ok role=workforce_admin",
      "2026-05-15T04:34:02Z app=CrewPortal user=ba.cabin.ops ip=198.51.100.73 action=export endpoint=/crew/sick-leave rows=24",
    ].join("\n"),
    "python3 ir_toolkit.py extract-ioc --ioc admin_console --input logs/crew-portal-events.log":
      "2026-05-15T04:32:44Z app=CrewPortal user=ba.cabin.ops ip=198.51.100.73 action=admin_console result=ok role=workforce_admin\n",
    "python3 ir_toolkit.py extract-ioc --ioc sick_leave --input exports/sick-leave-sample.csv": [
      "line 1: employee_id,name,leave_type,reason,supervisor,ai_confidence",
      "line 2: BA-REDACTED-001,REDACTED,sick_leave,REDACTED,REDACTED,0.91",
      "line 3: BA-REDACTED-002,REDACTED,sick_leave,REDACTED,REDACTED,0.87",
      "line 4: note: synthetic rows show the shape reported by press, not real employee data",
    ].join("\n"),
    "jq . cognino/api-inventory.json": [
      "{",
      '  "platform": "Cognino AI 360",',
      '  "source": "synthetic inventory based on reported claim",',
      '  "findings": [',
      '    { "type": "login_page", "status": "captured_in_claim" },',
      '    { "type": "email_list", "status": "reported" },',
      '    { "type": "api_key", "service": "insurance-workflow", "status": "rotate_now" },',
      '    { "type": "api_key", "service": "finance-workflow", "status": "rotate_now" }',
      "  ]",
      "}",
    ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input extortion/sale-post.txt": [
      "Telegram post summary, sanitized",
      "",
      "Actor: Infrastructure Destruction Squad / Dark Engine",
      "Claim: full access to compromised systems, Crew Portal credentials, Cognino AI 360 material, medical files, crew schedules, and employee information.",
      "Price named in report: 1000 USD.",
      "Screenshots: reported by press, not included in this museum artefact.",
    ].join("\n"),
    "tshark -r evidence.pcap --follow-log containment/revocation.log": [
      "2026-05-15T05:06Z disable_account user=ba.cabin.ops reason=public-claim-correlated",
      "2026-05-15T05:09Z revoke_sessions app=CrewPortal user=ba.cabin.ops result=success",
      "2026-05-15T05:12Z rotate_api_key platform=Cognino service=insurance-workflow result=queued",
      "2026-05-15T05:14Z rotate_api_key platform=Cognino service=finance-workflow result=queued",
      "2026-05-15T05:18Z preserve_evidence case=BA-crew-portal-claim hash_manifest=sealed",
    ].join("\n"),
  },
  files: {
    "/home/airline-ir/ba-crew-portal/ir_toolkit.py": {
      content: [
        "#!/usr/bin/env python3",
        "\"\"\"Scenario helper for safe incident-response parsing.",
        "",
        "Supported modes in this exhibit:",
        "  parse-artifact --input PATH",
        "  extract-ioc --ioc VALUE --input PATH",
        "",
        "The museum shell intercepts exact commands from scenario.commands.",
        "No code runs and no network is touched.",
        "\"\"\"",
        "raise SystemExit('simulated helper: canned output only')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/home/airline-ir/ba-crew-portal/source-notes/incident-brief.txt": {
      content: [
        "Public source notes",
        "",
        "Cyber Daily, 2026-05-15:",
        "- Infrastructure Destruction Squad claimed it breached British Airways servers and systems.",
        "- The group claimed access to the Crew Portal through a compromised account and admin control panel.",
        "- Reported exposed data included sick leave data for flight crew, employee names, leave reasons, supervisor approvals, and AI confidence levels.",
        "- The story also said the group claimed access to Cognino AI 360, emails, API keys, medical data, and training files.",
        "- British Airways had not publicly acknowledged the claims in that report.",
        "",
        "Cybernews, 2026-05-14:",
        "- Reported that researchers reviewed samples tied to claims of crew and medical data exposure.",
        "- Warned that operational data can reveal communication patterns and airline operations context.",
        "",
        "This exhibit uses synthetic data and does not include real screenshots, credentials, employee names, or medical details.",
      ].join("\n"),
    },
    "/home/airline-ir/ba-crew-portal/logs/crew-portal-events.log": {
      content: [
        "2026-05-15T04:31:10Z app=CrewPortal user=ba.cabin.ops ip=198.51.100.73 action=login mfa=passed device=new",
        "2026-05-15T04:32:44Z app=CrewPortal user=ba.cabin.ops ip=198.51.100.73 action=admin_console result=ok role=workforce_admin",
        "2026-05-15T04:34:02Z app=CrewPortal user=ba.cabin.ops ip=198.51.100.73 action=export endpoint=/crew/sick-leave rows=24",
        "2026-05-15T04:36:19Z app=CrewPortal user=ba.cabin.ops ip=198.51.100.73 action=view endpoint=/crew/schedules rows=112",
      ].join("\n"),
    },
    "/home/airline-ir/ba-crew-portal/exports/sick-leave-sample.csv": {
      content: [
        "employee_id,name,leave_type,reason,supervisor,ai_confidence",
        "BA-REDACTED-001,REDACTED,sick_leave,REDACTED,REDACTED,0.91",
        "BA-REDACTED-002,REDACTED,sick_leave,REDACTED,REDACTED,0.87",
        "BA-REDACTED-003,REDACTED,sick_leave,REDACTED,REDACTED,0.72",
      ].join("\n"),
    },
    "/home/airline-ir/ba-crew-portal/cognino/api-inventory.json": {
      content: [
        "{",
        '  "platform": "Cognino AI 360",',
        '  "source": "synthetic inventory based on reported claim",',
        '  "findings": [',
        '    { "type": "login_page", "status": "captured_in_claim" },',
        '    { "type": "email_list", "status": "reported" },',
        '    { "type": "api_key", "service": "insurance-workflow", "status": "rotate_now" },',
        '    { "type": "api_key", "service": "finance-workflow", "status": "rotate_now" }',
        "  ]",
        "}",
      ].join("\n"),
    },
    "/home/airline-ir/ba-crew-portal/extortion/sale-post.txt": {
      content: [
        "Sanitized sale-post summary from public reporting",
        "",
        "actor=Infrastructure Destruction Squad / Dark Engine",
        "claimed_access=Crew Portal credentials, Cognino AI 360 material, medical files, crew schedules, employee personal information",
        "price=1000 USD",
        "note=Screenshots were reported by press but are not reproduced here.",
      ].join("\n"),
    },
    "/home/airline-ir/ba-crew-portal/containment/revocation.log": {
      content: [
        "2026-05-15T05:06Z disable_account user=ba.cabin.ops reason=public-claim-correlated",
        "2026-05-15T05:09Z revoke_sessions app=CrewPortal user=ba.cabin.ops result=success",
        "2026-05-15T05:12Z rotate_api_key platform=Cognino service=insurance-workflow result=queued",
        "2026-05-15T05:14Z rotate_api_key platform=Cognino service=finance-workflow result=queued",
        "2026-05-15T05:18Z preserve_evidence case=BA-crew-portal-claim hash_manifest=sealed",
      ].join("\n"),
    },
    "/home/airline-ir/ba-crew-portal/public-poc/crew_portal_compromise_notes.txt": {
      content: [
        "# Defensive notes for an alleged crew portal compromise",
        "",
        "# 1. Preserve the public claim, screenshots, and timestamps without amplifying real data.",
        "# 2. Correlate claimed account names to portal auth logs and admin role grants.",
        "# 3. Disable the suspect identity and revoke sessions before asking for perfect certainty.",
        "# 4. Rotate API keys exposed in connected knowledge platforms and workflow tools.",
        "# 5. Treat sick leave and medical context as highly sensitive even when rows are partial.",
        "# 6. Prepare workforce comms with clear status labels: alleged, confirmed, contained, notified.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "source-brief",
      phase: "Recon",
      goal: "Read the source note that frames the breach as a public claim, not confirmed fact.",
      hint: "`python3 ir_toolkit.py parse-artifact --input source-notes/incident-brief.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input source-notes/incident-brief.txt" },
      ],
      narration:
        "Start with confidence labels. A public claim can justify containment, but your notes must not outrun verification.",
    },
    {
      id: "portal-baseline",
      phase: "Recon",
      goal: "Check the synthetic Crew Portal admin endpoint baseline.",
      hint: "`curl -sI https://crew.ba.example/portal/admin`.",
      matches: [{ kind: "exact", command: "curl -sI https://crew.ba.example/portal/admin" }],
      narration:
        "The portal redirects unauthenticated clients. The incident question is whether a real account reached admin paths.",
    },
    {
      id: "portal-events",
      phase: "Initial access",
      goal: "Surface Crew Portal events tied to the suspect account.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"CrewPortal\"' --follow-log logs/crew-portal-events.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "CrewPortal"\' --follow-log logs/crew-portal-events.log',
        },
      ],
      narration:
        "This synthetic trail matches the reported shape: compromised account, new device, admin control panel, and export activity.",
    },
    {
      id: "admin-console",
      phase: "Privilege use",
      goal: "Extract the admin console event from the Crew Portal log.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc admin_console --input logs/crew-portal-events.log`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc admin_console --input logs/crew-portal-events.log",
        },
      ],
      narration:
        "Admin-panel access is the hinge between a stolen account and exposure across crew records.",
    },
    {
      id: "sick-leave",
      phase: "Collection",
      goal: "Review redacted sick leave export shape without exposing real personal or medical data.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc sick_leave --input exports/sick-leave-sample.csv`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc sick_leave --input exports/sick-leave-sample.csv",
        },
      ],
      narration:
        "Even a small export can carry health context, supervisor decisions, and fraud-scoring metadata.",
    },
    {
      id: "cognino",
      phase: "Lateral movement",
      goal: "Inspect the synthetic Cognino AI 360 inventory for connected key exposure.",
      hint: "`jq . cognino/api-inventory.json`.",
      matches: [{ kind: "exact", command: "jq . cognino/api-inventory.json" }],
      narration:
        "Knowledge platforms become lateral risk when they index login pages, workflow secrets, and service keys.",
    },
    {
      id: "sale-post",
      phase: "Extortion",
      goal: "Read the sanitized sale-post summary and identify the pressure tactic.",
      hint: "`python3 ir_toolkit.py parse-artifact --input extortion/sale-post.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input extortion/sale-post.txt" },
      ],
      narration:
        "Low-price access sales are not proof of depth, but they raise the odds that opportunistic buyers will test the same paths.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify account disablement, session revocation, key rotation, and evidence preservation.",
      hint: "`tshark -r evidence.pcap --follow-log containment/revocation.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/revocation.log" }],
      narration:
        "Containment can proceed while attribution stays unresolved: kill sessions, rotate keys, seal evidence, and keep status words precise.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the defensive note for crew portal breach handling.",
      hint: "`head -n 80 public-poc/crew_portal_compromise_notes.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/crew_portal_compromise_notes.txt" }],
      narration:
        "The lesson is practical: identity review, key rotation, data minimization, and workforce comms need to move together.",
    },
  ],
  debrief: {
    summary:
      "This exhibit is based on public reports that Infrastructure Destruction Squad claimed access to British Airways crew-facing systems in May 2026. Cyber Daily reported the claim on 15 May 2026, including alleged access through a compromised Crew Portal account, sick leave data, Cognino AI 360 material, API keys, and a 1000 USD sale price. Cybernews reported related claims on 14 May 2026 and warned about operational security risk. The scenario keeps the claim status explicit because British Airways had not publicly acknowledged the claims in the Cyber Daily report.",
    lesson:
      "When a breach is still alleged, defenders still need a disciplined first hour: preserve the public evidence, disable suspect identities, revoke sessions, rotate connected keys, and write every note with a clear confidence label.",
    simulated: [
      "All IP addresses, user names, logs, exports, and API-key inventory are synthetic.",
      "No real British Airways employee, medical, credential, or screenshot data is included.",
      "Sources used for factual framing: https://www.cyberdaily.au/security/13603-british-airways-allegedly-breached-as-hackers-claim-to-have-stolen-pilot-data and https://cybernews.com/security/british-airways-crew-data-breach/",
    ],
  },
};
