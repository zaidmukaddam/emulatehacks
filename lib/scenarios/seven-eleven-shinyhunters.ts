import type { Scenario } from "../types";

/**
 * 7-Eleven breach confirmed May 19, 2026: franchisee document systems were accessed
 * on April 8 and ShinyHunters claimed Salesforce-related data theft and extortion.
 */
export const sevenElevenShinyhunters: Scenario = {
  slug: "seven-eleven-shinyhunters",
  exhibit: "EXH-048",
  title: "Franchise File Leak",
  tagline:
    "May 19, 2026. 7-Eleven confirms an April 8 breach of systems holding franchisee documents after ShinyHunters claims Salesforce data theft. You trace document access, export bursts, and containment receipts.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/soc/franchise-leak",
  user: "responder",
  host: "retail-siem-07",
  role: "Retail incident responder scoping franchisee document exposure after a public extortion claim.",
  objective:
    "Confirm the access window, identify the bulk export pattern, scope franchisee application data, and verify containment before notifications continue.",
  briefing:
    "Public reporting says 7-Eleven confirmed unauthorized access to systems used to store franchisee documents, while ShinyHunters claimed Salesforce-related theft. This reconstruction uses synthetic Salesforce-style audit logs and fake franchisee records so you can practice scoping and containment without touching any live service or real victim data.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/soc/franchise-leak",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 advisory_triage.py --input NOTICE.md": "simulated safe tool replay for seven-eleven-shinyhunters; replaces: cat NOTICE.md\n",
    "python3 ir_toolkit.py extract-ioc --ioc 2026-04-08 --input sf/audit-events.log": "simulated safe tool replay for seven-eleven-shinyhunters; replaces: grep -nF 2026-04-08 sf/audit-events.log\n",
    "python3 ir_toolkit.py table-summary --input franchisee/document-index.csv": "simulated safe tool replay for seven-eleven-shinyhunters; replaces: head franchisee/document-index.csv && wc -l franchisee/document-index.csv\n",
    "python3 ir_toolkit.py extract-ioc --ioc BulkDataExport --input sf/audit-events.log": "simulated safe tool replay for seven-eleven-shinyhunters; replaces: grep -nF BulkDataExport sf/audit-events.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"archive\"' --follow-log extortion/leak-claim.txt": "simulated safe tool replay for seven-eleven-shinyhunters; replaces: grep -nF archive extortion/leak-claim.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc IDX --input notification/state-filings.md": "simulated safe tool replay for seven-eleven-shinyhunters; replaces: grep -nF IDX notification/state-filings.md\n",
    "python3 ir_toolkit.py parse-artifact --input containment/actions.log": "simulated safe tool replay for seven-eleven-shinyhunters; replaces: cat containment/actions.log\n",
  },
  files: {
    "/home/soc/franchise-leak/NOTICE.md": {
      content: [
        "7-Eleven franchisee document breach desk",
        "",
        "Public timeline for this exhibit:",
        "- 2026-04-08: unauthorized third party accessed systems used to store franchisee documents.",
        "- 2026-04-17: ShinyHunters claimed responsibility for the incident.",
        "- 2026-05-01: notification letters were sent to affected individuals.",
        "- 2026-05-19: public reporting described an alleged 600000+ Salesforce record theft and a 9.4GB leak archive.",
        "",
        "Responder task:",
        "- scope the access window",
        "- identify bulk export behavior",
        "- confirm what kind of franchisee application data may be involved",
        "- verify account disablement, token rotation, export lockdown, and monitoring",
      ].join("\n"),
    },
    "/home/soc/franchise-leak/sf/audit-events.log": {
      content: [
        "2026-04-07T23:58:40Z event=Login user=partner-sync@retail.example ip=198.51.100.24 result=Success mfa=ok app=ConnectedApp-FranchisePortal",
        "2026-04-08T00:06:12Z event=Login user=partner-sync@retail.example ip=203.0.113.77 result=Success mfa=token-reuse app=ConnectedApp-FranchisePortal",
        "2026-04-08T00:08:44Z event=ReportExport user=partner-sync@retail.example object=Franchise_Application__c rows=58423 format=csv",
        "2026-04-08T00:15:02Z event=BulkDataExport user=partner-sync@retail.example object=ContentDocumentLink rows=621884 job=7509K00000exA1Q",
        "2026-04-08T00:18:19Z event=BulkDataExport user=partner-sync@retail.example object=Franchise_Document__c rows=607912 job=7509K00000exA1R",
        "2026-04-08T00:25:55Z event=ApiTotalUsage user=partner-sync@retail.example requests=8420 window=15m anomaly=high",
        "2026-04-08T00:31:10Z event=ContentVersionDownload user=partner-sync@retail.example files=14122 bytes=9479128832 archive_hint=true",
        "2026-04-08T00:36:22Z event=SessionHijackingRisk user=partner-sync@retail.example ip=203.0.113.77 score=91",
        "2026-04-08T01:02:41Z event=Logout user=partner-sync@retail.example ip=203.0.113.77 reason=admin-revoke",
      ].join("\n"),
    },
    "/home/soc/franchise-leak/franchisee/document-index.csv": {
      content: [
        "doc_id,object,record_count,contains_pii,notes",
        "FD-1001,Franchise_Application__c,58423,yes,application contact data and franchise history fields",
        "FD-1002,Franchise_Document__c,607912,yes,uploaded franchisee documents and supporting forms",
        "FD-1003,ContentDocumentLink,621884,yes,links joining files to franchise application records",
        "FD-1004,Store_Readiness__c,12088,no,operational readiness checklist metadata",
      ].join("\n"),
    },
    "/home/soc/franchise-leak/extortion/leak-claim.txt": {
      content: [
        "dark web monitoring note",
        "actor=ShinyHunters",
        "victim=7-Eleven",
        "claim=600000+ Salesforce records with PII and internal corporate data",
        "archive=9.4GB documents posted after ransom talks failed",
        "confidence=unverified actor claim, matches timing and volume patterns in synthetic Salesforce audit",
        "defender_action=do not negotiate from this console; preserve evidence and continue notification workflow",
      ].join("\n"),
    },
    "/home/soc/franchise-leak/notification/state-filings.md": {
      content: [
        "Notification coordination notes",
        "",
        "- Letters began on 2026-05-01 for affected individuals whose franchise application information may be involved.",
        "- Offer identity protection and CyberScan monitoring through IDX for up to 24 months.",
        "- Data categories need final legal review before public detail expands beyond franchisee application materials.",
        "- Support desk guidance: watch for phishing that references franchise applications or store ownership documents.",
      ].join("\n"),
    },
    "/home/soc/franchise-leak/containment/actions.log": {
      content: [
        "2026-04-08T00:58Z disable_connected_app app=ConnectedApp-FranchisePortal success",
        "2026-04-08T01:02Z revoke_sessions user=partner-sync@retail.example success",
        "2026-04-08T01:08Z rotate_integration_secret app=ConnectedApp-FranchisePortal success",
        "2026-04-08T01:15Z restrict_bulk_export profile=FranchisePortalIntegration success",
        "2026-04-08T01:22Z enable_transaction_security policy=large-content-download success",
        "2026-04-08T01:41Z preserve_event_logs range=2026-03-25..2026-04-09 success",
        "2026-05-01T09:00Z mail_notifications batch=franchisee-applicants success",
      ].join("\n"),
    },
    "/home/soc/franchise-leak/playbook/salesforce-containment.md": {
      content: [
        "Salesforce incident checklist",
        "",
        "1. Revoke suspect sessions and refresh tokens.",
        "2. Disable or rotate connected apps used by integration accounts.",
        "3. Pull Event Monitoring logs for Login, ReportExport, BulkDataExport, and ContentVersionDownload.",
        "4. Restrict exports on integration profiles until least privilege review is complete.",
        "5. Preserve notification evidence and dark web monitoring notes separately from production systems.",
      ].join("\n"),
    },
    "/home/soc/franchise-leak/public-poc/salesforce_bulk_export_shape.txt": {
      content: [
        "# Salesforce-style bulk export shape for defender education.",
        "# No endpoint, token, or victim data is present in this museum file.",
        "",
        "GET /services/data/vXX.X/jobs/query/7509K00000exA1R/results",
        "Authorization: Bearer [revoked integration token]",
        "",
        "Typical signals:",
        "- Connected app login from new ASN or cloud egress range",
        "- ReportExport and BulkDataExport spikes in the same session",
        "- ContentVersionDownload byte volume near archive size later claimed by actor",
        "- Integration profile exporting objects outside its service purpose",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "briefing",
      phase: "Recon",
      goal: "Review the public timeline and responder task list.",
      hint: "`python3 advisory_triage.py --input NOTICE.md`.",
      matches: [{ kind: "exact", command: "python3 advisory_triage.py --input NOTICE.md" }],
      narration:
        "Start with chronology. The confirmed access date, notification date, and public extortion claim define the initial scoping window.",
    },
    {
      id: "access-window",
      phase: "Initial access",
      goal: "Find audit events from the April 8 access window.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc 2026-04-08 --input sf/audit-events.log`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc 2026-04-08 --input sf/audit-events.log",
        },
      ],
      narration:
        "The same integration identity changes network origin, reuses a token, and then starts high-volume export activity.",
    },
    {
      id: "scope-documents",
      phase: "Scoping",
      goal: "Summarize the document index to see which data families may include PII.",
      hint: "`python3 ir_toolkit.py table-summary --input franchisee/document-index.csv`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py table-summary --input franchisee/document-index.csv",
        },
      ],
      narration:
        "Franchisee application systems mix identity, legal, financial, and operational records, so scoping is about object purpose as much as row count.",
    },
    {
      id: "bulk-export",
      phase: "Collection",
      goal: "Pull the Salesforce-style bulk export lines from the audit log.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc BulkDataExport --input sf/audit-events.log`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc BulkDataExport --input sf/audit-events.log",
        },
      ],
      narration:
        "Bulk export is the key behavior. The actor does not need malware when an overprivileged integration can package records for them.",
    },
    {
      id: "extortion-claim",
      phase: "Impact",
      goal: "Compare the leak claim to the synthetic archive-size signal.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"archive\"' --follow-log extortion/leak-claim.txt`.",
      matches: [
        {
          kind: "exact",
          command:
            "tshark -r evidence.pcap -Y 'frame contains \"archive\"' --follow-log extortion/leak-claim.txt",
        },
      ],
      narration:
        "Actor claims are not proof, but they can guide preservation and notification when they line up with internal telemetry.",
    },
    {
      id: "notification",
      phase: "Response",
      goal: "Check notification support details for identity protection coverage.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc IDX --input notification/state-filings.md`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc IDX --input notification/state-filings.md",
        },
      ],
      narration:
        "Breach response includes people outside the SOC: legal, franchise operations, help desks, and anti-phishing communications.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify app disablement, session revocation, secret rotation, and export lockdown.",
      hint: "`python3 ir_toolkit.py parse-artifact --input containment/actions.log`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py parse-artifact --input containment/actions.log",
        },
      ],
      narration:
        "The minimum closure package is revoke, rotate, restrict exports, turn on transaction rules, and preserve logs for the full window.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the safe bulk export detection shape for this exhibit.",
      hint: `head -n 80 public-poc/salesforce_bulk_export_shape.txt`,
      matches: [{ kind: "exact", command: "head -n 80 public-poc/salesforce_bulk_export_shape.txt" }],
      narration:
        "Lesson: SaaS breach response depends on event telemetry, connected app hygiene, export guardrails, and fast notification workflows.",
    },
  ],
  debrief: {
    summary:
      "This scenario is based on public reports that 7-Eleven confirmed unauthorized access to systems used to store franchisee documents on April 8, 2026, with ShinyHunters claiming Salesforce-related data theft and later publication of a 9.4GB archive. The lab models defensive triage of SaaS audit logs, not the actual victim environment.",
    lesson:
      "For SaaS-heavy retail operations, integration accounts need least privilege, export anomaly detection, refresh-token rotation, and tested notification playbooks before an extortion actor posts a countdown.",
    simulated: [
      "Salesforce objects, users, IP addresses, row counts, and logs are synthetic.",
      "No real 7-Eleven data, credentials, domains, or attacker infrastructure are included.",
      "The ShinyHunters attribution and archive details are treated as public claims for defender scoping, not independently verified facts inside the lab.",
    ],
  },
};
