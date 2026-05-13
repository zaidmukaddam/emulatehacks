import type { Scenario } from "../types";

export const wannacryRansomware: Scenario = {
  slug: "wannacry-eternalblue",
  exhibit: "EXH-014",
  title: "The Kill Switch",
  tagline:
    "May 12, 2017. NHS trusts see BSOD cascades. A worm encrypting files at line speed is spreading through SMBv1 using an exploit stolen from Equation Group, until someone registers a nonsense domain.",
  category: "classic-history",
  difficulty: "intermediate",
  era: "2010s",
  year: "2017",
  estMinutes: 10,
  fictional: true,
  cwd: "/malware-lab/quarantine",
  user: "analyst",
  host: "forensics-04",
  role: "Malware reverse engineer extracting static strings from a captured sample.",
  objective:
    "Identify the MS17-010 / EternalBlue class vulnerability, the ransomware family name, and the accidental kill-switch mechanism from strings alone.",
  briefing:
    "Binary execution is disabled on this VM. You have `strings-wannacry.txt` and a CISA flash summary. No EternalBlue replay.",
  env: { USER: "analyst", SHELL: "/bin/sh", PWD: "/malware-lab/quarantine" },
  ps: ["  PID TTY TIME CMD", "  1 ?   0:01 systemd", "  88 tty1 0:00 sh"],
  history: ["ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input CISA-ALERT.txt": "simulated safe tool replay for wannacry-eternalblue; replaces: cat CISA-ALERT.txt\n",
    "python3 ir_toolkit.py parse-artifact --input strings-wannacry.txt": "simulated safe tool replay for wannacry-eternalblue; replaces: cat strings-wannacry.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc ms17 --input strings-wannacry.txt": "simulated safe tool replay for wannacry-eternalblue; replaces: grep -inF ms17 strings-wannacry.txt\n",
    "dig +short iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com A":
      "NXDOMAIN\n(simulated: public analyses described the worm probing this killswitch domain)\n",
  },
  files: {
    "/malware-lab/quarantine/strings-wannacry.txt": {
      content: [
        "--- simulated strings excerpt ---",
        "\\\\192.168.%d.%d\\IPC$",
        "SrvSvc",
        "Windows 7 / 2008 R2 SMB remote code exec grooming",
        "Ms17010",
        "WANACRY!",
        "tasksche.exe",
        "icacls . /grant Everyone:F /T /C /Q",
        "Global\\MsWinZonesCacheCounterMutexA",
        "http://www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com",
        "CreateFileW C:\\WINDOWS\\mssecsvc.exe",
        "...",
      ].join("\n"),
    },
    "/malware-lab/quarantine/CISA-ALERT.txt": {
      content: [
        "May 2017, WannaCry / WanaCrypt0r ransomware worm",
        "",
        "Spread: MS17-010 (EternalBlue) against SMBv1 on unpatched Windows",
        "Impact: >200k machines in ~150 countries; hospitals, rail, telcos",
        "Kill switch (accidental): Sample checks unregistered domain; if HTTP",
        "  lookup succeeds, worm exits, researcher registers domain, slowing spread",
        "Lesson: disable SMBv1 everywhere; segment legacy; offline backup",
      ].join("\n"),
    },
    // Post-Mandiant / MS17-010 public summaries described grooming via large NT Trans + malformed Trans2 secondary.
    "/malware-lab/quarantine/public-poc/eternalblue_smb_stage_note.txt": {
      content: [
        "MS17-010 / EternalBlue (CVE-2017-0144)  SMBv1 server path",
        "",
        "Public IR language (condensed):",
        "  1) SMB session setup to IPC$",
        "  2) Large NT Trans request to move srv state machine",
        "  3) Sequence of SMB_COM_TRANSACTION2_SECONDARY (0x33) with malformed",
        "     offsets / counts → kernel pool corruption → RCE primitive",
        "  4) Payload often delivered DoublePulsar-style for follow-on shellcode",
        "",
        "No exploit bytes in the museum; use MS17-010 patches and SMBv1 disablement.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "dig-killswitch",
          goal: "Resolve the killswitch-style domain from public WannaCry write-ups (simulated NXDOMAIN).",
          hint: "`dig +short iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com A`.",
          matches: [
            {
              kind: "exact",
              command: "dig +short iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com A",
            },
          ],
          narration:
            "EternalBlue + ransomware as a network service, propagation faster than most AV consoles could refresh.",
        },
    {
          id: "alert",
          goal: "Read the CISA-style alert.",
          hint: "`python3 ir_toolkit.py parse-artifact --input CISA-ALERT.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input CISA-ALERT.txt" }],
          narration:
            "The alert frames MS17-010, SMBv1, and why a single DNS answer changed outbreak velocity.",
        },
    {
          id: "strings",
          goal: "Read the strings excerpt.",
          hint: "`python3 ir_toolkit.py parse-artifact --input strings-wannacry.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input strings-wannacry.txt" }],
          narration:
            "Ms17010, SMB paths, mutex names, and the absurd kill-switch URL, all visible without disassembly if you know what to look for.",
        },
    {
          id: "grep-ms17",
          goal: "Find the bulletin reference in the strings file.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc ms17 --input strings-wannacry.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc ms17 --input strings-wannacry.txt" }],
          narration:
            "MS17-010 is the patch boundary. Unpatched SMBv1 is the structural reason the worm moved like smoke.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/eternalblue_smb_stage_note.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/eternalblue_smb_stage_note.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "WannaCry was ransomware worm that exploded on May 12, 2017, encrypting files on Windows systems worldwide. It spread primarily via EternalBlue, an exploit of SMBv1 patched by Microsoft in MS17-010 after the Shadow Brokers leak. A malware analyst accidentally slowed the outbreak by registering a domain the worm used as a killswitch check. Critical infrastructure including Britain's NHS was heavily affected.",
    lesson:
      "Legacy protocols linger for decades. SMBv1 should have been dead before 2017; the worm punished everyone who postponed that decision. Segmentation and offline backups are the only answers when patch velocity cannot match worm velocity.",
    simulated: [
      "String list is partial and lightly fictionalised; behaviour matches public analyses (Symantec, Europol).",
    ],
  },
};
