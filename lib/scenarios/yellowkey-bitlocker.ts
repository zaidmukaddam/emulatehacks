import type { Scenario } from "../types";

/** Fictional: BitLocker recovery-key theft via service-desk rush (YellowKey theme). */
export const yellowkeyBitlocker: Scenario = {
  slug: "yellowkey-bitlocker",
  exhibit: "EXH-037",
  title: "YellowKey",
  tagline:
    "February 3, 2026. Help-desk chat lights up: executives forward a polished ‘IT verification’ portal that asks for BitLocker recovery keys. You walk chat transcripts, Intune exports, and a forged page hash.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/dfir/yellowkey",
  user: "responder",
  host: "dfir-laptop-02",
  role: "Enterprise DFIR analyst on the identity and endpoint team.",
  objective:
    "Reconstruct the phish from SMS lure to fake recovery form to recovery-key use, then verify wipe and identity containment.",
  briefing:
    "Attackers branded a fake portal ‘Device Trust Recovery’ and pushed links through SMS and compromised vendor mail. The goal is volume: collect BitLocker recovery keys and wipe resale friction on stolen laptops. You work evidence staged as flat text files, no live tenant APIs.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/dfir/yellowkey" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input sms-lure.txt": "simulated safe tool replay for yellowkey-bitlocker; replaces: cat sms-lure.txt\n",
    "python3 safe_replay.py --scenario yellowkey-bitlocker --grep recovery-key --artifact artifacts/forged-recovery.html": "simulated safe tool replay for yellowkey-bitlocker; replaces: grep -nF recovery_key artifacts/forged-recovery.html\n",
    "python3 ir_toolkit.py parse-artifact --input intune/device.txt": "simulated safe tool replay for yellowkey-bitlocker; replaces: cat intune/device.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"2026-02-03t09\"' --follow-log signin/aad.log": "simulated safe tool replay for yellowkey-bitlocker; replaces: grep -nF 2026-02-03T09: signin/aad.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"assume-disclosed\"' --follow-log bitlocker/recovery-audit.log": "simulated safe tool replay for yellowkey-bitlocker; replaces: grep -nF assume_disclosed bitlocker/recovery-audit.log\n",
    "tshark -r evidence.pcap --follow-log intune/actions.log": "simulated safe tool replay for yellowkey-bitlocker; replaces: cat intune/actions.log\n",
    "curl -skI https://dev-trust-verify.example/bitlocker":
      [
        "HTTP/2 200",
        "server: tabletop-nginx",
        "x-phish-kit: recovery-form (simulated)",
      ].join("\n"),
  },
  files: {
    "/home/dfir/yellowkey/sms-lure.txt": {
      content: [
        "2026-02-03T09:04Z sender='IT urgent' to=f.barber",
        "body='Device Trust Recovery required before travel. Open https://dev-trust-verify.example/bitlocker'",
        "user_reply='I pasted the long number with dashes. It said verified.'",
      ].join("\n"),
    },
    "/home/dfir/yellowkey/artifacts/forged-recovery.html": {
      content: [
        "<form id='recovery'>",
        "  <label>BitLocker recovery key</label>",
        "  <input name='recovery_key' autocomplete='off' />",
        "  <input name='device_id' value='Laptop-Finance-04' />",
        "</form>",
      ].join("\n"),
    },
    "/home/dfir/yellowkey/intune/device.txt": {
      content: [
        "Intune export, device Laptop-Finance-04",
        "BitLocker: enabled, TPM+PIN",
        "Recovery password ID: 3A29F0C9-... (partial)",
        "Last sync: 2026-02-03T08:55:12Z",
        "Compliance: non-compliant ‘recovery key escrow missing’ BEFORE incident ticket opened",
      ].join("\n"),
    },
    "/home/dfir/yellowkey/signin/aad.log": {
      content: [
        "2026-02-03T08:58:02Z user=f.barber@contoso auth=success ip=198.51.100.77 city=Frankfurt",
        "2026-02-03T09:01:44Z user=f.barber@contoso auth=success ip=203.0.113.18 city=Taipei",
        "2026-02-03T09:02:11Z user=f.barber@contoso risk=unfamiliar_features ip=203.0.113.18",
      ].join("\n"),
    },
    "/home/dfir/yellowkey/bitlocker/recovery-audit.log": {
      content: [
        "2026-02-03T09:05Z key_id=3A29F0C9 lookup=none tenant_escrow=missing",
        "2026-02-03T09:19Z key_id=3A29F0C9 status=assume_disclosed source=user_report",
        "2026-02-03T09:26Z device=Laptop-Finance-04 action=remote_lock queued=true",
      ].join("\n"),
    },
    "/home/dfir/yellowkey/intune/actions.log": {
      content: [
        "2026-02-03T09:26Z Laptop-Finance-04 remote_lock ack",
        "2026-02-03T09:31Z Laptop-Finance-04 wipe_on_next_online queued",
        "2026-02-03T09:35Z f.barber password_reset complete",
      ].join("\n"),
    },
    "/home/dfir/yellowkey/public-poc/bitlocker_recovery_phish_kit_note.txt": {
      content: [
        "# Criminal pattern: counterfeit 'Device Verification' portals collect 48-digit recovery passwords.",
        "# Legit IT never solicits recovery keys via SMS or public forms.",
        "",
        "<!-- POST → attacker sink -->",
        "<input pattern='^[0-9]{6}(-[0-9]{6}){7}$'/>",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-phish",
          phase: "Recon",
          goal: "Fetch headers from the SMS lure domain with curl -k (simulated).",
          hint: "`curl -skI https://dev-trust-verify.example/bitlocker`.",
          matches: [
            {
              kind: "exact",
              command: "curl -skI https://dev-trust-verify.example/bitlocker",
            },
          ],
          narration:
            "Curl shows a live phishing kit answering on TLS even before you read the SMS transcript.",
        },
    {
          id: "sms",
          phase: "Recon",
          goal: "Inspect the SMS lure that got the employee to the fake recovery flow.",
          hint: "`python3 ir_toolkit.py parse-artifact --input sms-lure.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input sms-lure.txt" }],
          narration:
            "The hack starts with urgency and a mobile channel. BitLocker is not cracked; the recovery material is requested from the human.",
        },
    {
          id: "form",
          phase: "Initial access",
          goal: "Open the captured fake page and find the recovery-key input.",
          hint: "`python3 safe_replay.py --scenario yellowkey-bitlocker --grep recovery-key --artifact artifacts/forged-recovery.html`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario yellowkey-bitlocker --grep recovery-key --artifact artifacts/forged-recovery.html" }],
          narration:
            "That input is the whole payload. The page turns a disk-recovery secret into attacker-controlled text.",
        },
    {
          id: "intune",
          phase: "Impact",
          goal: "Read Intune posture for the laptop tied to the stolen key.",
          hint: "`python3 ir_toolkit.py parse-artifact --input intune/device.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intune/device.txt" }],
          narration:
            "BitLocker is doing its job on disk; the failure mode is humans exporting the recovery password to a web form. TPM+PIN does not help after the key leaves the mouth of the user.",
        },
    {
          id: "aad",
          phase: "Lateral movement",
          goal:
            "Hunt for impossible-travel style risk lines shortly after the help-desk ticket.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"2026-02-03t09\"' --follow-log signin/aad.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"2026-02-03t09\"' --follow-log signin/aad.log" }],
          narration:
            "Two cities minutes apart for the same user session. Could be VPN, could be account sharing, could be token theft. Treat it as identity follow-on until ruled out.",
        },
    {
          id: "recovery",
          phase: "Detection",
          goal: "Find the recovery-key audit event that marks the device as compromised.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"assume-disclosed\"' --follow-log bitlocker/recovery-audit.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"assume-disclosed\"' --follow-log bitlocker/recovery-audit.log" }],
          narration:
            "This is the fix point: once the key is assumed disclosed, remote lock and wipe become device-preservation decisions, not optional hygiene.",
        },
    {
          id: "actions",
          phase: "Containment",
          goal: "Verify the remote lock, wipe queue, and identity reset actions.",
          hint: "`tshark -r evidence.pcap --follow-log intune/actions.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log intune/actions.log" }],
          narration:
            "The recovery-key phish ends with device containment and account reset. That is the real response loop.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/bitlocker_recovery_phish_kit_note.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/bitlocker_recovery_phish_kit_note.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "YellowKey is a synthetic codename for a BitLocker recovery-key phishing wave. The underlying mechanic is familiar: attackers harvest high-entropy recovery material through fake IT portals, then pair it with physical theft or resale. BitLocker’s cryptography is not the bypass; human procedure is.",
    lesson:
      "Train against ‘paste your recovery key here’ moments the same way you train wire-fraud callbacks. Pair Intune escrow with clearly branded internal URLs only, and instrument helpdesk for sudden spikes in recovery-language tickets.",
    simulated: [
      "Contoso-style names, IP geos, and hashes are invented.",
      "No working phishing kit or recovery key formats usable against real devices.",
      "Mechanics mirror real BitLocker social-engineering cases at high level.",
    ],
  },
};
