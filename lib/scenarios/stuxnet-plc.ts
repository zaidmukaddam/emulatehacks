import type { Scenario } from "../types";

export const stuxnetSample: Scenario = {
  slug: "stuxnet-plc",
  exhibit: "EXH-010",
  title: "Two Staged Drivers",
  tagline:
    "June 2010. A Belarusian AV company publishes a strange Windows worm. It talks to Siemens PLC software, carries stolen Realtek certificates, and spreads through USB sticks.",
  category: "classic-history",
  difficulty: "advanced",
  era: "2010s",
  year: "2010",
  estMinutes: 12,
  fictional: true,
  cwd: "/home/reverse",
  user: "reverse",
  host: "lab-win",
  role: "Malware analyst documenting indicators before sharing with ICS-CERT.",
  objective:
    "List the worm's unusual traits: PLC targets, driver signing abuse, and air-gap crossing, without ever running the binary.",
  briefing:
    "This exhibit is document-only. You have hashes, imports, and timeline notes from Symantec / Langner-era public reporting. Your output is a short IOC list for the plant's incident bridge.",
  env: { USER: "reverse", SHELL: "/bin/sh", PWD: "/home/reverse" },
  ps: ["  PID TTY TIME CMD", "  1 ?   0:00 init", "  90 tty1 0:00 sh"],
  history: ["ls -la"],
  files: {
    "/home/reverse/STUXNET-IOCS.txt": {
      content: [
        "Stuxnet, public IOCs (recreated summary, 2010)",
        "",
        "Hashes (simulated):",
        "  md5 dropper: [REDACTED-IN-SIMULATION]",
        "",
        "Filenames observed:",
        "  ~DIAFA.tmp, mrcls.sys, mrxnet.sys",
        "  Siemens Step7 projects modified: s7otbxdx.dll",
        "",
        "C2 domains (historical): many, fast flux, dual-use hosting",
        "",
        "Capabilities:",
        "  - spreads via LNK autorun + print spooler MS10-061",
        "  - loads signed drivers (stolen certs from Realtek / JMicron)",
        "  - fingerprints specific PLC ladder logic / frequency converter drives",
        "  - overwrites PLC code on match, sabotage, not espionage",
        "",
        "Lesson for plant defenders:",
        "  USB is a network. Patch engineering stations. Trust no thumb drive.",
      ].join("\n"),
    },
    "/home/reverse/timeline.txt": {
      content: [
        "2010-06 VirusBlokAda finds odd rootkit using LNK vulnerability",
        "2010-07 Siemens + CERTs notified; world learns word Stuxnet",
        "2010-09 Symantec: worm specifically hunts Siemens WinCC / Step7",
        "2010-11 Langner: 3150 PLC code modules, cyber-physical payload",
        "2012-06 Natanz imagery correlates with drive speed changes, open source",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "iocs",
      goal: "Read the public IOC summary.",
      hint: "`cat STUXNET-IOCS.txt`.",
      matches: [{ kind: "exact", command: "cat STUXNET-IOCS.txt" }],
      narration:
        "Signed drivers carrying adversary code, the supply chain hit the trust model, not just the vendor download page. PLC modification is the headline.",
    },
    {
      id: "timeline",
      goal: "Read the disclosure timeline.",
      hint: "`cat timeline.txt`.",
      matches: [{ kind: "exact", command: "cat timeline.txt" }],
      narration:
        "From odd Belarusian sample to confirmed industrial sabotage in months. Air-gapped sites were never off the graph.",
    },
    {
      id: "grep-siemens",
      goal: "Find references to Siemens in the IOC file.",
      hint: "`grep -nF Siemens STUXNET-IOCS.txt`.",
      matches: [{ kind: "exact", command: "grep -nF Siemens STUXNET-IOCS.txt" }],
      narration:
        "Every serious Stuxnet discussion eventually lands on Step7 / WinCC, this was the first worm whose primary target was rotational machinery, not credit cards.",
    },
  ],
  debrief: {
    summary:
      "Stuxnet was a highly complex Windows worm first identified in 2010 that propagated via USB drives and Windows vulnerabilities and specifically targeted Siemens SIMATIC industrial control software. It used stolen code-signing certificates, multiple zero-day exploits, and replaced ladder logic on certain models of frequency drives, reportedly damaging uranium enrichment centrifuges in Iran's Natanz facility. Its discovery rewrote assumptions about cyber warfare touching physical equipment.",
    lesson:
      "ICS security is endpoint security for engineering laptops. Anything that can touch a PLC programming port must be patched, inventoried, and isolated with the same rigor as an internet DMZ, because USB is an untrusted network and contractors rotate through the plant weekly.",
    simulated: [
      "Binary hashes are redacted; filenames and capabilities follow public reporting (Symantec, Langner, RLangner blog).",
      "No exploit code or PLC payloads are included.",
    ],
  },
};
