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
    "Inspect a stolen code-signing cert with openssl, read IOCs and timeline, then grep for Siemens targets.",
  briefing:
    "This exhibit is document-only. You have hashes, imports, and timeline notes from Symantec / Langner-era public reporting. Your output is a short IOC list for the plant's incident bridge.",
  env: { USER: "reverse", SHELL: "/bin/sh", PWD: "/home/reverse" },
  ps: ["  PID TTY TIME CMD", "  1 ?   0:00 init", "  90 tty1 0:00 sh"],
  history: ["ls -la"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input STUXNET-IOCS.txt": "simulated safe tool replay for stuxnet-plc; replaces: cat STUXNET-IOCS.txt\n",
    "python3 ir_toolkit.py parse-artifact --input timeline.txt": "simulated safe tool replay for stuxnet-plc; replaces: cat timeline.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc siemens --input STUXNET-IOCS.txt": "simulated safe tool replay for stuxnet-plc; replaces: grep -nF Siemens STUXNET-IOCS.txt\n",
    "openssl x509 -in /home/reverse/stolen-realtek.pem -noout -subject -issuer": [
      "subject=C = TW, ST = Taiwan, O = Realtek Semiconductor Corp, OU = Digital ID Class 3 - Microsoft Software Validation v2, CN = Realtek Semiconductor Corporation",
      "issuer=C = US, O = VeriSign, Inc., OU = VeriSign Trust Network, OU = Terms of use at https://www.verisign.com/rpa (c)04, CN = VeriSign Class 3 Code Signing 2004 CA",
      "(simulated: stolen cert chain used to sign kernel drivers in public reporting)",
    ].join("\n"),
  },
  files: {
    "/home/reverse/stolen-realtek.pem": {
      content:
        "-----BEGIN CERTIFICATE-----\nSIMULATED_STUB_BASE64_LINE_1\n-----END CERTIFICATE-----\n",
    },
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
    "/home/reverse/public-poc/stuxnet_lnk_autorun_skeleton.txt": {
      content: [
        "# Public chain: crafted .lnk files (MS10-046) + autorun.inf on USB.",
        "# Second stage: win32k + Task Scheduler privesc, stolen Realtek/JMicron signed drivers.",
        "",
        "[autorun]",
        "open=stuxnet_installer.exe",
        "",
        "# Siemens side: s7otbxdx.dll replacement fingerprints Step7 projects (WinCC).",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "openssl-cert",
          goal: "Inspect the recreated stolen signing certificate metadata.",
          hint: "`openssl x509 -in /home/reverse/stolen-realtek.pem -noout -subject -issuer`.",
          matches: [
            {
              kind: "exact",
              command:
                "openssl x509 -in /home/reverse/stolen-realtek.pem -noout -subject -issuer",
            },
          ],
          narration:
            "Signed drivers carrying adversary code, the supply chain hit the trust model, not just the vendor download page. PLC modification is the headline.",
        },
    {
          id: "iocs",
          goal: "Read the public IOC summary.",
          hint: "`python3 ir_toolkit.py parse-artifact --input STUXNET-IOCS.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input STUXNET-IOCS.txt" }],
          narration:
            "Signed drivers carrying adversary code, the supply chain hit the trust model, not just the vendor download page. PLC modification is the headline.",
        },
    {
          id: "timeline",
          goal: "Read the disclosure timeline.",
          hint: "`python3 ir_toolkit.py parse-artifact --input timeline.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input timeline.txt" }],
          narration:
            "From odd Belarusian sample to confirmed industrial sabotage in months. Air-gapped sites were never off the graph.",
        },
    {
          id: "grep-siemens",
          goal: "Find references to Siemens in the IOC file.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc siemens --input STUXNET-IOCS.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc siemens --input STUXNET-IOCS.txt" }],
          narration:
            "Every serious Stuxnet discussion eventually lands on Step7 / WinCC, this was the first worm whose primary target was rotational machinery, not credit cards.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/stuxnet_lnk_autorun_skeleton.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/stuxnet_lnk_autorun_skeleton.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
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
