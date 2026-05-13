import type { Scenario } from "../types";

export const solarwindsSunburst: Scenario = {
  slug: "solarwinds-sunburst",
  exhibit: "EXH-016",
  title: "A Quiet Orion",
  tagline:
    "December 2020. FireEye discovers its own red-team tools were stolen, not by spear-phishing, but through a trojaned update to enterprise network monitoring software.",
  category: "classic-history",
  difficulty: "advanced",
  era: "2020s",
  year: "2020",
  estMinutes: 11,
  fictional: true,
  cwd: "/soc/vendor-review",
  user: "analyst",
  host: "soc-east",
  role: "Vendor risk analyst reviewing the SolarWinds Orion compromise for your CIO briefing.",
  objective:
    "From public IOC summaries, describe SUNBURST: longevity, dormant beaconing, and why the trusted build pipeline was the breach.",
  briefing:
    "You have a synthetic executive summary that mirrors CISA AA20-352A themes. No binaries, no live C2.",
  env: { USER: "analyst", SHELL: "/bin/sh", PWD: "/soc/vendor-review" },
  ps: ["  PID TTY TIME CMD", "  1 ?   0:01 systemd", "  220 tty1 0:00 sh"],
  history: ["ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input SUNBURST-BRIEF.txt": "simulated safe tool replay for solarwinds-sunburst; replaces: cat SUNBURST-BRIEF.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc dormancy --input SUNBURST-BRIEF.txt": "simulated safe tool replay for solarwinds-sunburst; replaces: grep -nF dormancy SUNBURST-BRIEF.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc saml --input SUNBURST-BRIEF.txt": "simulated safe tool replay for solarwinds-sunburst; replaces: grep -nF SAML SUNBURST-BRIEF.txt\n",
    "openssl dgst -sha256 orion-stub.dll":
      "SHA256(orion-stub.dll)= e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n(simulated: tabletop digest, not a real Orion binary)\n",
  },
  files: {
    "/soc/vendor-review/orion-stub.dll": {
      content: "MZ\x90\x00SOLAR_ORION_STUB_FOR_TABLETOP\n",
    },
    "/soc/vendor-review/SUNBURST-BRIEF.txt": {
      content: [
        "SUNBURST / Solarigate, executive summary (reconstructed Dec 2020)",
        "",
        "Vendor: SolarWinds Orion Platform",
        "Implant: SUNBURST backdoor in digitally signed Orion .DLL,",
        "         adversary modified source/build before signing",
        "Window: malicious updates March–June 2020 (approx.) shipped to ~18k",
        "        customers; active intrusions subset in high-value orgs",
        "",
        "Behaviour:",
        "  - legit Orion process loads trojaned SolarWinds.Orion.Core.BusinessLayer.dll",
        "  - dormancy: waits ~2 weeks before C2",
        "  - DNS-staged C2 with passive host classification",
        "  - lateral movement via stolen SAML / AD in some victims",
        "",
        "Attribution (USG): APT29 / Cozy Bear, Russian SVR",
        "",
        "Defensive pivot:",
        "  inventory every host running Orion; hunt for IoCs even if patched;",
        "  assume downstream SAML trust may be forged",
      ].join("\n"),
    },
    "/soc/vendor-review/public-poc/sunburst_orion_businesslayer_hook_note.txt": {
      content: [
        "// Public reporting: implant lived in SolarWinds.Orion.Core.BusinessLayer.dll",
        "// Legit Orion process loads DLL; backdoor named jobs with benign constants.",
        "",
        "// Example hunt (conceptual):",
        "// Get-FileHash .\\SolarWinds.Orion.Core.BusinessLayer.dll -Algorithm SHA256",
        "// YARA: SUNBURST rulesets from CISA / FireEye public releases",
        "",
        "// No binary or C2 bytes in this museum file.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "digest",
          goal: "Fingerprint the tabletop Orion stub DLL with openssl (simulated digest).",
          hint: "`openssl dgst -sha256 orion-stub.dll`.",
          matches: [{ kind: "exact", command: "openssl dgst -sha256 orion-stub.dll" }],
          narration:
            "The supply chain was not npm typosquatting, it was a vendor who could sign Windows binaries. Dormancy and stealth DNS let the actor live inside NOC tooling.",
        },
    {
          id: "brief",
          goal: "Read the CIO brief.",
          hint: "`python3 ir_toolkit.py parse-artifact --input SUNBURST-BRIEF.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input SUNBURST-BRIEF.txt" }],
          narration:
            "Signed DLL inside a trusted update channel is the nightmare case for binary inventory.",
        },
    {
          id: "grep-dorm",
          goal: "Search the brief for the dormancy note.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc dormancy --input SUNBURST-BRIEF.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc dormancy --input SUNBURST-BRIEF.txt" }],
          narration:
            "Two-week quiet period, designed to outlive snapshot restores and impatient SOC hunts.",
        },
    {
          id: "grep-saml",
          goal: "Confirm SAML was in play for some victims.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc saml --input SUNBURST-BRIEF.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc saml --input SUNBURST-BRIEF.txt" }],
          narration:
            "Once the NOC is owned, identity infrastructure is the next domino. SUNBURST is as much an IAM incident as an RMM incident.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/sunburst_orion_businesslayer_hook_note.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/sunburst_orion_businesslayer_hook_note.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "In December 2020, FireEye disclosed that sophisticated attackers had inserted malware, codenamed SUNBURST, into legitimate updates of SolarWinds Orion IT monitoring software. The digitally signed trojanized library gave attackers deep access to roughly 18,000 organisations that installed updates between March and June 2020; a smaller set saw hands-on intrusion, including U.S. government agencies. U.S. authorities attributed the campaign to Russia's SVR (APT29). The incident redefined vendor trust for enterprise software supply chains.",
    lesson:
      "If your SIEM and your admin tooling share the same trust domain as your crown jewels, a signing key compromise becomes a horizontal privilege boundary break. Segment monitoring infrastructure, enforce deterministic builds with reproducibility checkpoints, and hunt identity federation logs as aggressively as endpoint logs.",
    simulated: [
      "The brief compresses factual themes from CISA alerts; no live telemetry.",
    ],
  },
};
