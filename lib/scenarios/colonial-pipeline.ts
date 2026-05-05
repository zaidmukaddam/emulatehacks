import type { Scenario } from "../types";

/** Colonial Pipeline, May 2021. DarkSide ransomware; OT ops shutdown; credential / VPN angle in public reporting. */
export const colonialPipeline: Scenario = {
  slug: "colonial-pipeline-ransom",
  exhibit: "EXH-019",
  title: "Gauging Station Offline",
  tagline:
    "May 7, 2021. Colonial Pipeline proactively halts fuel flows on the largest U.S. refined-products line. The headline says ransomware, your job is what the logs say about ingress.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2021",
  estMinutes: 9,
  fictional: true,
  cwd: "/tabletop/colonial-shape",
  user: "ot-ir",
  host: "fusion-cell",
  role: "Joint OT/IT responder working from CISA-style fusion-cell handouts, no SCADA access in this shell.",
  objective:
    "Reconstruct from synthetic artefacts that the blast radius started on IT VPN credentials, not PLC zero-days.",
  briefing:
    "Fictional hostnames. Real lesson: single-factor VPN and reused passwords still collapse national-scale OT in 2021.",
  env: { USER: "ot-ir", SHELL: "/bin/sh", PWD: "/tabletop/colonial-shape" },
  ps: ["  PID TTY TIME CMD", "  12 ?   0:00 sh"],
  history: [],
  files: {
    "/tabletop/colonial-shape/CISA-ALERT-stub.txt": {
      content: [
        "Critical Infrastructure, Ransomware tabletop (based on public Colonial reporting)",
        "DarkSide affiliate strain; double-extortion M.O.",
        "Initial access reported via compromised VPN creds (legacy account, no MFA)",
        "Pivot: SMB / AD; deployment of Cobalt-style beaconing in IT before OT shutdown decision",
        "Operator chose operational shutdown to isolate billing systems, physical fuel not 'hacked off' but halted safely",
      ].join("\n"),
    },
    "/tabletop/colonial-shape/vpn-audit.log": {
      content: [
        "2021-05-06T23:41:02Z user=migrate_svc ip=203.0.113.90 mfa=NONE result=OK",
        "2021-05-06T23:43:18Z user=migrate_svc src_rdp=10.70.4.12 dst=jump01.internal result=OK",
        "2021-05-07T00:05:41Z user=migrate_svc action=create_share \\\\FILE01\\IPC$ result=OK",
        "2021-05-07T00:22:09Z alert=DEFENDER ransomware_indicators host=FILE01 severity=high",
      ].join("\n"),
    },
    "/tabletop/colonial-shape/read_me_txt.stub": {
      content: [
        "Your data stolen and encrypted",
        "No name given in this reconstruction, refer to FBI flash and CISA guidance",
        "If you call media first, we delete keys, blah blah (textbook DarkSide-shaped note)",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "cisa",
      goal: "Read the alert stub.",
      hint: "`cat CISA-ALERT-stub.txt`.",
      matches: [{ kind: "exact", command: "cat CISA-ALERT-stub.txt" }],
      narration:
        "OT consequence, IT root cause, air gaps are marketing, segmentation is engineering.",
    },
    {
      id: "vpn",
      goal: "Inspect the VPN audit excerpt.",
      hint: "`cat vpn-audit.log`.",
      matches: [{ kind: "exact", command: "cat vpn-audit.log" }],
      narration:
        "`mfa=NONE` on a service account that can reach RDP, that's the whole novel in one field.",
    },
    {
      id: "grep-migrate",
      goal: "Surface lines for the compromised service account.",
      hint: "`grep -nF migrate_svc vpn-audit.log`.",
      matches: [{ kind: "exact", command: "grep -nF migrate_svc vpn-audit.log" }],
      narration:
        "Timeline matters: first VPN OK, then SMB, you could have killed sessions between those timestamps with proper session monitoring.",
    },
    {
      id: "note",
      goal: "Read the synthetic ransom note stub.",
      hint: "`cat read_me_txt.stub`.",
      matches: [{ kind: "exact", command: "cat read_me_txt.stub" }],
      narration:
        "The business sees this; you see VPN lines, bridge both in the executive briefing.",
    },
  ],
  debrief: {
    summary:
      "In May 2021 Colonial Pipeline, which operates a major U.S. refined-products pipeline system, experienced a ransomware incident attributed to a DarkSide affiliate. The company proactively halted pipeline operations to ensure safety and investigate. U.S. government agencies published guidance highlighting common initial-access failures including inadequate protections for Internet-facing VPNs and remote services. Public reporting and congressional testimony discussed impacts on fuel supply chains and renewed focus on OT/IT segmentation and ransomware preparedness.",
    lesson:
      "Ransomware is a continuity-of-operations problem for infrastructure, not only an IT ticket. MFA everywhere on edge VPN, kill stale service accounts, monitor for impossible-travel on VPN, and rehearse controlled shutdown procedures before an adversary forces an uncontrolled one. The pipeline itself was not 'magic hacked', business risk management met encryption.",
    simulated: [
      "Usernames and IPs are invented; Colonial/DarkSide/May 2021 timeline and public lessons are real at high level.",
    ],
  },
};
