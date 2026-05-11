import type { Scenario } from "../types";

export const panOsCaptivePortal: Scenario = {
  slug: "pan-os-captive-portal",
  exhibit: "EXH-037",
  title: "The Captive Portal",
  tagline:
    "May 10, 2026. CVE-2026-0300 is under active exploitation against public PAN-OS User-ID Authentication Portals. Your perimeter firewall still has the portal open.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/var/pan-ir",
  user: "responder",
  host: "fw-mgmt-01",
  role: "Network security engineer responsible for the public edge firewalls and the contractor VPN landing zone.",
  objective:
    "Decide whether edge-pa-02 is exposed to CVE-2026-0300, look for evidence of exploit traffic, and stage the safest mitigation before the patch train opens.",
  briefing:
    "Palo Alto Networks has confirmed limited exploitation of CVE-2026-0300, a critical PAN-OS buffer overflow in the User-ID Authentication Portal, also known as Captive Portal. The first fixed builds do not start landing until May 13, and CISA has already put the bug in KEV. Your risk team wants one answer before morning standup: is edge-pa-02 reachable from untrusted networks, and can you close the portal without breaking the whole perimeter?",
  env: {
    USER: "responder",
    SHELL: "/bin/sh",
    PWD: "/var/pan-ir",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  101 ?        00:00:02 configd",
    "  118 ?        00:00:01 logrcvr",
    "  219 pts/0    00:00:00 sh",
    "  227 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "cat ADVISORY.md"],
  files: {
    "/var/pan-ir/ADVISORY.md": {
      content: [
        "CVE-2026-0300, PAN-OS User-ID Authentication Portal RCE",
        "",
        "Vendor status: limited exploitation observed in the wild.",
        "Class: buffer overflow in the User-ID Authentication Portal / Captive Portal service.",
        "Impact: unauthenticated remote code execution with root privileges on affected",
        "        PA-Series and VM-Series firewalls.",
        "Applies when both are true:",
        "  1) User-ID Authentication Portal is enabled",
        "  2) the portal is reachable from untrusted networks or the public internet",
        "",
        "Not affected: Prisma Access, Cloud NGFW, Panorama.",
        "Patch cadence: first fixed PAN-OS builds are expected May 13, with more on May 28.",
        "Same-day control: disable the portal if unused, or restrict the service route to",
        "trusted zones and management subnets only. Do not wait for the patch if the",
        "portal is public.",
      ].join("\n"),
    },
    "/var/pan-ir/firewalls/edge-pa-02.txt": {
      content: [
        "asset: edge-pa-02",
        "model: PA-3220",
        "role: internet edge, contractor VPN pre-auth landing zone",
        "pan-os: 11.1.5-h4",
        "ha peer: edge-pa-01",
        "mgmt: 10.40.8.22",
        "external interface: ethernet1/1, zone untrust, address 198.51.100.24",
        "user-id-authentication-portal: enabled",
        "portal exposure: ethernet1/1 service route allows tcp/443 from untrust",
        "content update: 2026-05-06, threat prevention signature 95187 present",
      ].join("\n"),
    },
    "/var/pan-ir/firewalls/panorama.txt": {
      content: [
        "asset: panorama-01",
        "model: M-300",
        "role: management only",
        "pan-os: 11.1.6-h5",
        "note: Panorama is listed as not affected by CVE-2026-0300.",
      ].join("\n"),
    },
    "/var/pan-ir/configs/edge-pa-02.set": {
      content: [
        "set deviceconfig setting user-id auth-portal enabled yes",
        "set deviceconfig setting user-id auth-portal ssl-tls-service-profile captive-portal-prod",
        "set deviceconfig setting user-id auth-portal redirect-host vpn.example.invalid",
        "set rulebase security rules allow-captive-portal from untrust to untrust source any destination 198.51.100.24 application ssl service application-default action allow",
        "set rulebase security rules allow-captive-portal description contractor pre-auth portal, opened during 2024 onboarding freeze",
        "set rulebase security rules allow-mgmt from trust to mgmt source 10.40.0.0/16 destination 10.40.8.22 application panos-web-interface service application-default action allow",
      ].join("\n"),
    },
    "/var/pan-ir/configs/edge-pa-01.set": {
      content: [
        "set deviceconfig setting user-id auth-portal enabled no",
        "set rulebase security rules allow-mgmt from trust to mgmt source 10.40.0.0/16 destination 10.40.8.21 application panos-web-interface service application-default action allow",
      ].join("\n"),
    },
    "/var/pan-ir/logs/threat.log": {
      content: [
        "2026-05-10T23:42:11Z edge-pa-02 threat 95187 critical src=203.0.113.77 dst=198.51.100.24 dport=443 action=reset-both app=ssl note=CVE-2026-0300 portal probe",
        "2026-05-10T23:46:05Z edge-pa-02 threat 95187 critical src=203.0.113.81 dst=198.51.100.24 dport=443 action=reset-both app=ssl note=CVE-2026-0300 portal probe",
        "2026-05-11T00:03:44Z edge-pa-02 traffic allow src=198.18.44.10 dst=198.51.100.24 dport=443 app=ssl rule=allow-captive-portal bytes=9321",
        "2026-05-11T00:07:19Z edge-pa-02 threat 95187 critical src=203.0.113.86 dst=198.51.100.24 dport=443 action=reset-both app=ssl note=CVE-2026-0300 portal probe",
      ].join("\n"),
    },
    "/var/pan-ir/logs/config.log": {
      content: [
        "2024-08-19T13:14:02Z admin=netops change=set rulebase security rules allow-captive-portal from untrust",
        "2024-08-19T13:15:31Z admin=netops commit succeeded jobid=29173",
        "2026-05-10T22:58:41Z admin=responder export running-config edge-pa-02",
      ].join("\n"),
    },
    "/var/pan-ir/mitigations/captive-portal-lockdown.set": {
      content: [
        "candidate mitigation for edge-pa-02",
        "",
        "# preferred if contractor pre-auth can move behind VPN SSO today",
        "set deviceconfig setting user-id auth-portal enabled no",
        "",
        "# minimum fallback if the portal must stay up for a short window",
        "delete rulebase security rules allow-captive-portal",
        "set rulebase security rules allow-captive-portal-trusted from trust to untrust source 10.40.0.0/16 destination 198.51.100.24 application ssl service application-default action allow",
        "",
        "# keep the vendor threat prevention signature enabled, but do not treat it as the boundary",
        "set profiles vulnerability CVE-2026-0300 action reset-both",
        "",
        "# apply fixed PAN-OS build when 11.1.6-h32 or 11.1.10-h25 becomes available",
      ].join("\n"),
    },
    "/var/pan-ir/OWNER-NOTE.md": {
      content: [
        "standup note",
        "",
        "edge-pa-02 is in the affected product set: PA-Series, PAN-OS 11.1.5-h4,",
        "User-ID Authentication Portal enabled.",
        "",
        "It is also in the exposed configuration set: the portal rule permits source",
        "any from untrust to the public address. Threat logs show signature 95187",
        "resetting multiple probes overnight, which proves scanning has reached us.",
        "",
        "Recommendation: disable the portal now. If the business cannot accept that,",
        "delete the untrust rule and recreate it from trusted management ranges only.",
        "Patch as soon as the matching 11.1 fixed build is released, then leave the",
        "portal off public internet permanently.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "advisory",
      goal: "Read the advisory note for the current exploitation facts.",
      hint: "`cat ADVISORY.md`.",
      matches: [{ kind: "exact", command: "cat ADVISORY.md" }],
      narration:
        "The exposure condition is narrow but severe: affected PAN-OS, User-ID Authentication Portal enabled, and reachable from untrusted networks. The mitigation is configuration first, patch second.",
    },
    {
      id: "asset",
      goal: "Open the firewall asset record.",
      hint: "`cat firewalls/edge-pa-02.txt`.",
      matches: [
        { kind: "exact", command: "cat firewalls/edge-pa-02.txt" },
      ],
      narration:
        "edge-pa-02 is a PA-Series firewall on PAN-OS 11.1.5-h4 with User-ID Authentication Portal enabled. That puts it in the affected set.",
    },
    {
      id: "portal-config",
      goal: "Find the running config lines that mention the auth portal.",
      hint: "`grep -nF auth-portal configs/*.set`.",
      matches: [
        { kind: "exact", command: "grep -nF auth-portal configs/*.set" },
      ],
      narration:
        "The active peer has auth-portal enabled and a rule named allow-captive-portal. The HA peer has it disabled, which gives you a cleaner failover option if the business pushes back.",
    },
    {
      id: "untrust-rule",
      goal: "Confirm whether the portal rule accepts public or untrusted sources.",
      hint: "`grep -nF allow-captive-portal configs/edge-pa-02.set`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF allow-captive-portal configs/edge-pa-02.set",
        },
      ],
      narration:
        "There it is: from untrust, source any, destination the public address. This is exactly the configuration the vendor warning says attackers are targeting.",
    },
    {
      id: "threat-log",
      goal: "Search the threat log for the CVE signature.",
      hint: "`grep -nF CVE-2026-0300 logs/*.log`.",
      matches: [
        { kind: "exact", command: "grep -nF CVE-2026-0300 logs/*.log" },
      ],
      narration:
        "The signature is firing and resetting probes, but the probes are reaching the device. IPS is useful telemetry here, not a reason to leave root-level RCE exposed to the internet.",
    },
    {
      id: "mitigation",
      goal: "Read the candidate mitigation config.",
      hint: "`cat mitigations/captive-portal-lockdown.set`.",
      matches: [
        {
          kind: "exact",
          command: "cat mitigations/captive-portal-lockdown.set",
        },
      ],
      narration:
        "The safest control is to disable the portal. If it must remain available briefly, remove untrust access and allow only trusted internal ranges. Then patch when the right fixed build is released.",
    },
    {
      id: "owner-note",
      goal: "Open the standup note that summarizes the decision.",
      hint: "`cat OWNER-NOTE.md`.",
      matches: [{ kind: "exact", command: "cat OWNER-NOTE.md" }],
      narration:
        "Decision: exposed and probed. Disable public Captive Portal now, keep the reset signature, schedule the fixed PAN-OS build, and do not re-open this service to untrusted networks afterward.",
    },
  ],
  debrief: {
    summary:
      "CVE-2026-0300 is a critical PAN-OS buffer overflow in the User-ID Authentication Portal, also known as Captive Portal. Palo Alto Networks says unauthenticated attackers can send specially crafted packets to affected PA-Series and VM-Series firewalls and execute arbitrary code with root privileges. The vendor confirmed limited exploitation against portals exposed to untrusted networks or the public internet. CISA added the CVE to KEV on May 6, 2026, with a May 9 mitigation deadline for federal agencies. First fixed builds are scheduled to begin May 13, with additional releases later in May.",
    lesson:
      "A firewall management or identity portal is still an application on the perimeter. If it is not meant for the whole internet, do not make the whole internet your allowlist. For a live zero-day without an immediate patch, reduce reachable attack surface first: disable the service if unused, restrict it to trusted zones if required, and keep prevention signatures as telemetry and defense in depth. Then patch when the fixed build exists. The durable fix is architectural: keep sensitive portals behind VPN, internal network ranges, or a dedicated access broker, not in a public untrust rule named source any.",
    simulated: [
      "Asset names, IP addresses, firewall config snippets, and log lines are invented.",
      "No exploit payload, packet structure, or reproduction path is included.",
      "The CVE number, affected component, root-level RCE impact, exploitation status, CISA KEV listing, unavailable patch window, and mitigation guidance are based on public Palo Alto Networks and CISA reporting.",
    ],
  },
};
