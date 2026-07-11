import type { Scenario } from "../types";

/**
 * Delaware County, Pennsylvania network intrusion. Publicly reported July 10, 2026.
 * The exercise uses synthetic local artefacts and avoids exploit detail.
 */
export const delcoNetworkIntrusion: Scenario = {
  slug: "delco-network-intrusion",
  exhibit: "EXH-048",
  title: "Courthouse Offline",
  tagline:
    "10 July 2026. Delaware County says a June 26 network shutdown followed a sophisticated cybercriminal attack. You rebuild the county responder view from outage notes, blocked access attempts, J-Net workarounds, and data-scope triage.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/srv/delco-ir",
  user: "responder",
  host: "county-jump-01",
  role: "County incident responder translating public disruption reports into a safe tabletop timeline.",
  objective:
    "Trace the synthetic response chain: public brief, network shutdown, blocked intrusion attempts, limited data access, justice-system workarounds, and restoration controls.",
  briefing:
    "Delaware County disclosed that a June 26 network disruption was tied to a sophisticated cybercriminal attack. Phones and internet came back first, but external services and justice-system integrations lagged while specialists investigated limited network and data access. Your job is to build the responder timeline without assuming ransomware, a payment, or a final breach scope that officials had not confirmed.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/srv/delco-ir",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  101 ?        00:00:01 systemd",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/delco-public-brief.md":
      "simulated safe tool replay for delco-network-intrusion; replaces: cat intel/delco-public-brief.md\n",
    "tshark -r evidence.pcap --follow-log logs/network-shutdown.log":
      "simulated safe tool replay for delco-network-intrusion; replaces: cat logs/network-shutdown.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"blocked\"' --follow-log logs/edge-auth.log":
      "simulated safe tool replay for delco-network-intrusion; replaces: grep blocked logs/edge-auth.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"limited-access\"' --follow-log logs/edge-auth.log":
      "simulated safe tool replay for delco-network-intrusion; replaces: grep limited-access logs/edge-auth.log\n",
    "python3 ir_toolkit.py parse-artifact --input scope/data-access-review.md":
      "simulated safe tool replay for delco-network-intrusion; replaces: cat scope/data-access-review.md\n",
    "python3 ir_toolkit.py parse-artifact --input services/jnet-workaround.md":
      "simulated safe tool replay for delco-network-intrusion; replaces: cat services/jnet-workaround.md\n",
    "python3 ir_toolkit.py parse-artifact --input controls/restoration-plan.md":
      "simulated safe tool replay for delco-network-intrusion; replaces: cat controls/restoration-plan.md\n",
    "curl -sI https://county-services.example/records":
      [
        "HTTP/2 503",
        "retry-after: 3600",
        "x-county-service: records-portal",
        "x-incident-mode: restoration",
        "(simulated: external service stays limited while internal systems recover)",
      ].join("\n"),
  },
  files: {
    "/srv/delco-ir/ir_toolkit.py": {
      content: [
        "#!/usr/bin/env python3",
        '"""Scenario helper for safe incident-response parsing.',
        "",
        "The museum shell intercepts exact commands from scenario.commands.",
        "No code runs and no network is touched.",
        '"""',
        "raise SystemExit('simulated helper: canned output only')",
      ].join("\n"),
      perms: "r-xr-xr-x",
    },
    "/srv/delco-ir/intel/delco-public-brief.md": {
      content: [
        "Delaware County public brief, July 10 2026",
        "",
        "Publicly reported facts to preserve:",
        "- County officials said the June 26 network intrusion was part of a sophisticated cybercriminal attack.",
        "- The county shut down its network to protect sensitive information and critical systems.",
        "- Officials said attackers gained limited access to the county network and data maintained within it.",
        "- Internal systems were back in full operation, while external-facing access remained limited.",
        "- Courts, libraries, the District Attorney's Office, and justice-system integrations felt service impacts.",
        "",
        "Responder guardrails:",
        "- Do not infer a ransom demand; local reporting said officials had not confirmed one.",
        "- Do not publish final data categories before the investigation confirms scope.",
      ].join("\n"),
    },
    "/srv/delco-ir/logs/network-shutdown.log": {
      content: [
        "2026-06-26T13:18:42Z facility=government-center symptom=phones-and-internet-down",
        "2026-06-26T13:32:10Z action=disconnect-external-links reason=protect-sensitive-systems",
        "2026-06-26T14:05:33Z service=courthouse-records mode=manual-workaround",
        "2026-06-26T15:22:09Z service=library-public-terminals state=offline",
        "2026-07-02T17:10:44Z service=phone-internet state=restored",
        "2026-07-10T19:47:24Z statement=internal-systems-full-operation external-systems-limited",
      ].join("\n"),
    },
    "/srv/delco-ir/logs/edge-auth.log": {
      content: [
        "2026-06-26T12:51:03Z src=198.51.100.77 user=clerk.sync result=blocked reason=impossible-travel",
        "2026-06-26T12:52:18Z src=198.51.100.77 user=clerk.sync result=blocked reason=mfa-step-up",
        "2026-06-26T13:03:44Z src=203.0.113.82 user=vendor.portal result=limited-access tag=limited-access scope=file-share-read",
        "2026-06-26T13:08:19Z src=203.0.113.82 user=vendor.portal result=blocked reason=egress-rule",
        "2026-06-26T13:16:57Z src=203.0.113.82 user=vendor.portal result=session-killed reason=network-shutdown",
      ].join("\n"),
    },
    "/srv/delco-ir/scope/data-access-review.md": {
      content: [
        "Data access triage",
        "",
        "Known from the public statement:",
        "- Access was limited, not full-domain control in this reconstruction.",
        "- Data maintained within the county network was accessed.",
        "- Full scope and risk to county data remained under specialist investigation.",
        "",
        "Internal review queue:",
        "1. Preserve VPN, SSO, file-share, and endpoint logs from June 20 onward.",
        "2. Identify file shares reachable by vendor.portal during 13:03-13:16 UTC.",
        "3. Separate confirmed-accessed files from merely exposed repositories.",
        "4. Draft resident notifications only after counsel and forensics confirm data categories.",
      ].join("\n"),
    },
    "/srv/delco-ir/services/jnet-workaround.md": {
      content: [
        "Service continuity notes",
        "",
        "Justice and records systems:",
        "- External J-Net access is unavailable while partners complete revalidation.",
        "- Protection-from-abuse orders are hand-delivered to neighboring sheriff offices for entry and service.",
        "- Deputies verify warrants from hard-copy records until portal access returns.",
        "- Register of Wills probate filing remains on due-diligence procedures.",
        "",
        "Public service notes:",
        "- Libraries accept returns, but public terminals and in-library catalogs remain offline.",
        "- Courthouse public-records users are routed to manual request desks.",
      ].join("\n"),
    },
    "/srv/delco-ir/controls/restoration-plan.md": {
      content: [
        "Restoration controls",
        "",
        "1. Keep internal systems segmented from external portals until endpoint scans finish.",
        "2. Rotate vendor.portal and all shared integration credentials before reconnecting partners.",
        "3. Require MFA step-up on remote access and block impossible-travel replays.",
        "4. Reopen services in priority order: emergency operations, courts, records, libraries.",
        "5. Publish resident-facing updates that distinguish confirmed facts from under-investigation scope.",
      ].join("\n"),
    },
    "/srv/delco-ir/public-poc/county_intrusion_ir_stub.txt": {
      content: [
        "# Museum IR stub for Delaware County July 2026 public reporting.",
        "# No exploit steps. The exercise is about outage triage, log preservation, service continuity, and careful public scope language.",
        "",
        "Hunt shape:",
        "- remote access anomalies",
        "- file-share read windows",
        "- emergency network shutdown markers",
        "- partner portal restoration dependencies",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "brief",
      phase: "Recon",
      goal: "Load the public incident brief and lock in what is confirmed versus unknown.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/delco-public-brief.md`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/delco-public-brief.md" },
      ],
      narration:
        "The wording matters: sophisticated cybercriminal attack, limited access, scope still under investigation. That keeps the tabletop from inventing a ransom story.",
    },
    {
      id: "portal-baseline",
      phase: "Recon",
      goal: "Check an external records portal still held in restoration mode.",
      hint: "`curl -sI https://county-services.example/records`.",
      matches: [{ kind: "exact", command: "curl -sI https://county-services.example/records" }],
      narration:
        "Internal recovery and public-service recovery move at different speeds. A 503 can be a deliberate safety control.",
    },
    {
      id: "shutdown",
      phase: "Containment",
      goal: "Read the shutdown and service-restoration timeline.",
      hint: "`tshark -r evidence.pcap --follow-log logs/network-shutdown.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log logs/network-shutdown.log" }],
      narration:
        "The county cut external links to protect critical systems, then brought phones and internet back before every dependent portal was ready.",
    },
    {
      id: "blocked-attempts",
      phase: "Initial access",
      goal: "Surface the blocked access attempts that limited blast radius.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"blocked\"' --follow-log logs/edge-auth.log`.",
      matches: [
        {
          kind: "exact",
          command: 'tshark -r evidence.pcap -Y \'frame contains "blocked"\' --follow-log logs/edge-auth.log',
        },
      ],
      narration:
        "Public reporting said protections blocked larger intrusion attempts. In the exhibit, MFA and egress rules are the difference between attempted and expanded access.",
    },
    {
      id: "limited-access",
      phase: "Impact",
      goal: "Find the limited-access session that explains why data scope still matters.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"limited-access\"' --follow-log logs/edge-auth.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "limited-access"\' --follow-log logs/edge-auth.log',
        },
      ],
      narration:
        "Limited access is not no access. It triggers preservation, file-share review, and cautious notifications.",
    },
    {
      id: "data-scope",
      phase: "Impact",
      goal: "Review the data-access triage queue before drafting any public notice.",
      hint: "`python3 ir_toolkit.py parse-artifact --input scope/data-access-review.md`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input scope/data-access-review.md" },
      ],
      narration:
        "Good IR separates confirmed accessed data from data that was merely reachable. That distinction drives resident notices.",
    },
    {
      id: "jnet",
      phase: "Continuity",
      goal: "Inspect J-Net and courthouse workaround notes for resident-facing impact.",
      hint: "`python3 ir_toolkit.py parse-artifact --input services/jnet-workaround.md`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input services/jnet-workaround.md" },
      ],
      narration:
        "The hack becomes visible as hand-delivered protection orders, hard-copy warrant checks, library terminals offline, and records desks slowed down.",
    },
    {
      id: "restoration",
      phase: "Lessons",
      goal: "Verify the staged restoration plan before reconnecting external partners.",
      hint: "`python3 ir_toolkit.py parse-artifact --input controls/restoration-plan.md`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input controls/restoration-plan.md" },
      ],
      narration:
        "Restoration is not just turning the network back on. It is credential rotation, partner revalidation, segmentation, and clear public language.",
    },
    {
      id: "mechanism-excerpt",
      goal: "Review the archived public IR sketch for this exhibit.",
      hint: "`head -n 80 public-poc/county_intrusion_ir_stub.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/county_intrusion_ir_stub.txt" }],
      narration:
        "The museum excerpt stays defensive: hunt shape and continuity controls, no exploit procedure.",
    },
  ],
  debrief: {
    summary:
      "On July 10, 2026, Delaware County, Pennsylvania said a June 26 network intrusion was part of a sophisticated cybercriminal attack. Local reporting from The Philadelphia Inquirer and Patch quoted the county saying attackers gained limited access to the county network and to data maintained within it, while the full scope remained under investigation. CBS Philadelphia and the Delaware County Daily Times reported service impacts including courthouse delays, J-Net disruption, hard-copy warrant checks, hand-delivered protection-from-abuse orders, library computer outages, and a staged restoration of phones, internet, internal systems, and external services. Sources: https://www.inquirer.com/politics/pennsylvania/delco-cyber-attack-county-services-20260710.html https://patch.com/pennsylvania/media/hack-delcos-network-part-sophisticated-cybercriminal-attack-against-county https://www.cbsnews.com/philadelphia/news/delaware-county-courthouse-government-center-hack/ https://www.delcotimes.com/2026/07/07/delaware-county-continues-to-work-on-systems-issue/",
    lesson:
      "Local-government cyber incidents are continuity incidents. The best responder habit is disciplined scope language: say what is confirmed, preserve logs, protect residents from speculation, and restore external services only after partner credentials and integrations have been revalidated.",
    simulated: [
      "Hostnames, IP addresses, usernames, timestamps inside logs, portal URLs, and file paths are invented for the exhibit.",
      "The public facts preserved here are the July 10 sophisticated-attack disclosure, the June 26 shutdown, limited network and data access, ongoing scope investigation, and reported service disruptions.",
      "No ransomware demand, attacker identity, exploit chain, or final data category is asserted because public reporting did not confirm those details.",
    ],
  },
};
