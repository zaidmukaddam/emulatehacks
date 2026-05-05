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
  files: {
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
  },
  steps: [
    {
      id: "brief",
      goal: "Read the CIO brief.",
      hint: "`cat SUNBURST-BRIEF.txt`.",
      matches: [{ kind: "exact", command: "cat SUNBURST-BRIEF.txt" }],
      narration:
        "The supply chain was not npm typosquatting, it was a vendor who could sign Windows binaries. Dormancy and stealth DNS let the actor live inside NOC tooling.",
    },
    {
      id: "grep-dorm",
      goal: "Search the brief for the dormancy note.",
      hint: "`grep -nF dormancy SUNBURST-BRIEF.txt`.",
      matches: [{ kind: "exact", command: "grep -nF dormancy SUNBURST-BRIEF.txt" }],
      narration:
        "Two-week quiet period, designed to outlive snapshot restores and impatient SOC hunts.",
    },
    {
      id: "grep-saml",
      goal: "Confirm SAML was in play for some victims.",
      hint: "`grep -nF SAML SUNBURST-BRIEF.txt`.",
      matches: [{ kind: "exact", command: "grep -nF SAML SUNBURST-BRIEF.txt" }],
      narration:
        "Once the NOC is owned, identity infrastructure is the next domino. SUNBURST is as much an IAM incident as an RMM incident.",
    },
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
