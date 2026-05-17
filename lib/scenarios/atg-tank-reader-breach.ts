import type { Scenario } from "../types";

/**
 * May 2026 reporting on breached automatic tank gauge systems at US gas stations.
 * Scenario uses static incident-response evidence only. It does not include device commands.
 */
export const atgTankReaderBreach: Scenario = {
  slug: "atg-tank-reader-breach",
  exhibit: "EXH-048",
  title: "ATG Display Drift",
  tagline:
    "16 May 2026. Follow-on reports cite breached automatic tank gauges at US gas stations: internet-exposed fuel monitors with no passwords, display tampering, and leak-detection risk.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: false,
  cwd: "/home/ot-ir/atg-response",
  user: "responder",
  host: "fuel-soc-02",
  role: "OT incident responder validating exposed fuel tank monitoring systems.",
  objective:
    "Confirm which automatic tank gauge was exposed, tie display drift to unauthenticated remote access, and verify safe containment for the operator.",
  briefing:
    "Public reporting described attackers reaching automatic tank gauge systems that were online without passwords, changing displayed readings but not the actual fuel volumes. Your job is the defender workflow: source the brief, inspect exposure, correlate display and alarm logs, then verify hardening without sending any commands to real equipment.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/ot-ir/atg-response" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/public-brief.txt":
      "simulated safe tool replay for atg-tank-reader-breach; replaces: cat intel/public-brief.txt\n",
    "nmap -Pn -p10001 198.51.100.77":
      [
        "PORT      STATE SERVICE",
        "10001/tcp open  scada-serial",
        "| banner: ATG serial bridge, auth: none (simulated scan archive)",
      ].join("\n"),
    "python3 ir_toolkit.py extract-ioc --ioc no-password --input exposure/scan.csv":
      "simulated safe tool replay for atg-tank-reader-breach; replaces: grep -nF no-password exposure/scan.csv\n",
    "tshark -r evidence.pcap -Y 'frame contains \"DISPLAY_DRIFT\"' --follow-log logs/atg-serial.log":
      "simulated safe tool replay for atg-tank-reader-breach; replaces: grep -nF DISPLAY_DRIFT logs/atg-serial.log\n",
    "python3 ir_toolkit.py parse-artifact --input ops/operator-call.txt":
      "simulated safe tool replay for atg-tank-reader-breach; replaces: cat ops/operator-call.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"leak_alarm\"' --follow-log logs/alarm-audit.log":
      "simulated safe tool replay for atg-tank-reader-breach; replaces: grep -nF leak_alarm logs/alarm-audit.log\n",
    "python3 ir_toolkit.py parse-artifact --input containment/hardening.log":
      "simulated safe tool replay for atg-tank-reader-breach; replaces: cat containment/hardening.log\n",
  },
  files: {
    "/home/ot-ir/atg-response/intel/public-brief.txt": {
      content: [
        "Public reporting digest, May 2026",
        "",
        "- CNN reported that US officials suspected Iranian hackers in breaches of gas station tank monitoring systems across multiple states.",
        "- The reported access path was automatic tank gauge systems exposed online without password protection.",
        "- Reported impact: attackers could alter displayed readings, while sources said actual fuel levels were not changed.",
        "- Safety concern: access to ATGs could hide leak indications or disrupt operational decisions.",
        "- WION and Economic Times carried follow-on coverage on 16 May 2026.",
        "",
        "Museum note: the shell contains only staged evidence and no device control path.",
      ].join("\n"),
    },
    "/home/ot-ir/atg-response/exposure/scan.csv": {
      content: [
        "asset,site,port,service,remote_access,auth_state,owner",
        "ATG-17,truck-stop-east,10001,serial-bridge,internet,no-password,fuel-ops",
        "ATG-18,truck-stop-west,443,vpn-gateway,private,strong-password,fuel-ops",
      ].join("\n"),
    },
    "/home/ot-ir/atg-response/logs/atg-serial.log": {
      content: [
        "2026-05-16T04:12:31Z asset=ATG-17 src=203.0.113.66 action=connect result=accepted auth=none",
        "2026-05-16T04:12:37Z asset=ATG-17 event=DISPLAY_DRIFT tank=3 shown_gallons=1180 measured_gallons=1840 delta=-660",
        "2026-05-16T04:13:10Z asset=ATG-17 event=label_change old='Diesel 2' new='SERVICE OK'",
        "2026-05-16T04:19:44Z asset=ATG-17 src=203.0.113.66 action=disconnect",
      ].join("\n"),
    },
    "/home/ot-ir/atg-response/ops/operator-call.txt": {
      content: [
        "Operator call transcript",
        "",
        "04:24Z manager: Tank 3 display says low, delivery system says plenty.",
        "04:25Z dispatcher: No delivery was cancelled. Manual stick check shows expected volume.",
        "04:27Z manager: Leak alarm panel was quiet during the mismatch.",
        "04:29Z SOC: Treat display as untrusted until the ATG is removed from public access.",
      ].join("\n"),
    },
    "/home/ot-ir/atg-response/logs/alarm-audit.log": {
      content: [
        "2026-05-16T03:55:00Z asset=ATG-17 leak_alarm=test status=pass route=local-buzzer",
        "2026-05-16T04:12:39Z asset=ATG-17 leak_alarm=threshold_check route=display status=suppressed-by-display-drift",
        "2026-05-16T04:33:10Z asset=ATG-17 leak_alarm=manual-test status=pass route=local-buzzer",
      ].join("\n"),
    },
    "/home/ot-ir/atg-response/containment/hardening.log": {
      content: [
        "2026-05-16T04:35Z firewall block public tcp/10001 to ATG-17 success",
        "2026-05-16T04:38Z remote_access moved behind vendor-vpn with named accounts success",
        "2026-05-16T04:41Z set site-specific ATG password success",
        "2026-05-16T04:44Z restore tank labels from maintenance backup success",
        "2026-05-16T04:47Z manual leak detection check recorded success",
        "2026-05-16T04:51Z CISA incident report package queued with out-of-band contact success",
      ].join("\n"),
    },
    "/home/ot-ir/atg-response/public-poc/atg_defender_note.txt": {
      content: [
        "# Automatic tank gauge response notes",
        "# Defensive focus only:",
        "# - Do not expose serial bridges or ATG web consoles directly to the internet.",
        "# - Require site-specific credentials and a VPN or firewall allow list for remote service.",
        "# - Treat unexpected display changes as safety events until manual checks confirm state.",
        "# - Report affected systems with timestamps, impact, and mitigation steps.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "brief",
      phase: "Recon",
      goal: "Load the public reporting digest that framed the response.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/public-brief.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/public-brief.txt" }],
      narration:
        "The public story is narrow: exposed ATGs, suspected state-linked operators, display tampering, and safety risk without known physical harm.",
    },
    {
      id: "port",
      phase: "Recon",
      goal: "Confirm the archived external scan for the exposed ATG serial bridge.",
      hint: "`nmap -Pn -p10001 198.51.100.77`.",
      matches: [{ kind: "exact", command: "nmap -Pn -p10001 198.51.100.77" }],
      narration:
        "The device should never be a public internet service. The scan archive gives responders a concrete asset to contain.",
    },
    {
      id: "auth",
      phase: "Initial access",
      goal: "Find the exposure row showing no password on remote access.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc no-password --input exposure/scan.csv`.",
      matches: [
        {
          kind: "exact",
          command: "python3 ir_toolkit.py extract-ioc --ioc no-password --input exposure/scan.csv",
        },
      ],
      narration:
        "Initial access in this incident class is not glamour. It is an exposed OT management path accepting remote sessions without authentication.",
    },
    {
      id: "display",
      phase: "Execution",
      goal: "Correlate the remote session with the display reading mismatch.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"DISPLAY_DRIFT\"' --follow-log logs/atg-serial.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "DISPLAY_DRIFT"\' --follow-log logs/atg-serial.log',
        },
      ],
      narration:
        "The actual fuel is not changing in these rows. The risk is operators trusting a false display while safety workflows depend on accurate readings.",
    },
    {
      id: "operator",
      phase: "Impact",
      goal: "Read the operator call that caught the fuel reading inconsistency.",
      hint: "`python3 ir_toolkit.py parse-artifact --input ops/operator-call.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input ops/operator-call.txt" }],
      narration:
        "Humans in the loop catch what the remote panel obscures. Manual checks matter when cyber changes touch physical safety.",
    },
    {
      id: "alarm",
      phase: "Detection",
      goal: "Review leak alarm routing during the display drift window.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"leak_alarm\"' --follow-log logs/alarm-audit.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "leak_alarm"\' --follow-log logs/alarm-audit.log',
        },
      ],
      narration:
        "The scary part is not stolen data. It is a quiet panel when a real leak would need immediate local attention.",
    },
    {
      id: "contain",
      phase: "Containment",
      goal: "Verify firewalling, credentialing, label restoration, and reporting steps.",
      hint: "`python3 ir_toolkit.py parse-artifact --input containment/hardening.log`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input containment/hardening.log" }],
      narration:
        "Containment is simple and urgent: remove public access, add credentials, confirm the physical state, and preserve evidence for reporting.",
    },
    {
      id: "defender-note",
      phase: "Lessons",
      goal: "Review the museum defender note for ATG operators.",
      hint: "`head -n 80 public-poc/atg_defender_note.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/atg_defender_note.txt" }],
      narration:
        "Lesson: small OT boxes become critical infrastructure when their readings drive deliveries, alarms, and public confidence.",
    },
  ],
  debrief: {
    summary:
      "CNN reported on 15 May 2026 that US officials suspected Iranian hackers in breaches of automatic tank gauge systems at gas stations across multiple states, with sources saying attackers reached systems exposed online without passwords and could alter displayed readings but not actual fuel levels. WION and Economic Times published follow-on coverage on 16 May 2026. This scenario reconstructs the defender workflow using synthetic logs, not live device operations.",
    lesson:
      "Internet-exposed OT management paths turn basic hygiene failures into safety incidents. Put tank gauges behind firewalls or VPNs, require unique credentials, monitor label and alarm changes, and validate suspicious readings with local procedures.",
    simulated: [
      "IP addresses, site names, scan rows, and logs are synthetic teaching artefacts.",
      "Attribution remains suspect-only in the public reporting; the scenario does not assert proof of a specific actor.",
      "No ATG command syntax or device-control payloads are included.",
      "Sources consulted: CNN 2026-05-15, WION 2026-05-16, Economic Times 2026-05-16, and FuelIowa advisory 2026-04-14.",
    ],
  },
};
