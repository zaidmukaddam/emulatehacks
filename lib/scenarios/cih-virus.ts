import type { Scenario } from "../types";

export const cihVirus: Scenario = {
  slug: "cih-chernobyl",
  exhibit: "EXH-003",
  title: "The 26th of April",
  tagline:
    "April 1998. A student in Taiwan ships a parasitic .exe. It lies dormant until Chernobyl's anniversary, then it overwrites the flash BIOS on thousands of PCs.",
  category: "classic-history",
  difficulty: "beginner",
  era: "1990s",
  year: "1998",
  estMinutes: 8,
  fictional: true,
  cwd: "/home/analyst",
  user: "analyst",
  host: "iso-pc",
  role: "AV analyst reconstructing a submitted sample flagged by a reseller in Seoul.",
  objective:
    "Fingerprint the PE with file and strings, confirm the trigger date, then skim the vendor-style advisory.",
  briefing:
    "A floppy arrived with cracked games. One binary is `CIH.EXE`, parasitic, infects other PE headers, no mass mailer. The scary part is what happens on a specific calendar day. You have strings and a disassembler summary, not a live infected machine.",
  env: { USER: "analyst", SHELL: "/bin/sh", PWD: "/home/analyst" },
  ps: ["  PID TTY TIME CMD", "  101 tty1 0:00 login", "  220 tty1 0:00 sh"],
  history: ["ls"],
  commands: {
    "python3 ir_toolkit.py extract-ioc --ioc day-26 --input STRINGS.txt": "simulated safe tool replay for cih-chernobyl; replaces: grep -nF day=26 STRINGS.txt\n",
    "strings CIH.EXE": [
      "--- strings CIH.EXE (simulated excerpt) ---",
      "GetProcAddress",
      "KERNEL32.dll",
      "VWIN32.DMI.CpuData",
      "CIH v1.2 TTIT",
      "XOR loops on flash regions",
      "payload activation: year=1998 month=4 day=26",
      "Win9x only, tries VxD ring-0 port I/O to chipset",
    ].join("\n"),
    "file CIH.EXE":
      "CIH.EXE: PE32 executable (GUI) Intel 80386, for MS Windows, UPX compressed (simulated)",
  },
  files: {
    "/home/analyst/STRINGS.txt": {
      content: [
        "--- strings CIH.EXE (simulated excerpt) ---",
        "GetProcAddress",
        "KERNEL32.dll",
        "VWIN32.DMI.CpuData",
        "CIH v1.2 TTIT",
        "XOR loops on flash regions",
        "payload activation: year=1998 month=4 day=26",
        "Win9x only, tries VxD ring-0 port I/O to chipset",
      ].join("\n"),
    },
    "/home/analyst/ADVISORY.txt": {
      content: [
        "Chernobyl / CIH virus, April 1998",
        "",
        "Aliases: CIH, Spacefiller, Chernobyl",
        "Author admitted (later): Chen Ing-hau, Taiwan college student",
        "Trigger: April 26 (anniversary of Chornobyl nuclear disaster, 1986)",
        "Payload: overwrites first megabyte of BIOS flash and partition table",
        "         on many machines this bricks the PC until chip reprogrammed",
        "Scope: estimated millions of infections globally via pirated software",
        "",
        "Defensive posture:",
        "  - block execution from untrusted media",
        "  - BIOS write-protect jumper where available",
        "  - watch for PE header corruption heuristics",
      ].join("\n"),
    },
    "/home/analyst/public-poc/cih_trigger_pseudocode.c": {
      content: [
        "/* Museum sketch: CIH-style date gate + flash abuse (Win9x / VxD era). */",
        "/* No working exploit; documents why April 26 mattered in press coverage. */",
        "",
        "typedef struct { unsigned y, m, d; } clock_trip;",
        "",
        "int should_arm_payload(clock_trip now) {",
        "  return (now.y == 1998 && now.m == 4 && now.d == 26);",
        "}",
        "",
        "void corrupt_bios_region(void) {",
        "  /* Public write-ups: ring-0 port I/O against chipset flash on affected boards */",
        "  /* ; real samples used VxD paths and size checks on flash geometry */",
        "}",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "file-pe",
          goal: "Identify the submitted sample type.",
          hint: "`file CIH.EXE`.",
          matches: [{ kind: "exact", command: "file CIH.EXE" }],
          narration:
            "A Windows PE from the late 90s, often packed. Your sandbox would next extract and diff headers.",
        },
    {
          id: "strings",
          goal: "Run strings on the binary to surface API and trigger hints.",
          hint: "`strings CIH.EXE`.",
          matches: [{ kind: "exact", command: "strings CIH.EXE" }],
          narration:
            "Ring-0 VxD behaviour on Windows 9x, references to CPU data access, and an explicit trigger: 1998-04-26. This is not ransomware, it is hardware destruction layer.",
        },
    {
          id: "grep-trigger",
          goal: "Search the strings export for the trigger date.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc day-26 --input STRINGS.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc day-26 --input STRINGS.txt" }],
          narration:
            "April 26, the activation date. Calendar triggers teach one defensive lesson: behaviour on a quiet disk can still be catastrophic on one specific day.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/cih_trigger_pseudocode.c`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/cih_trigger_pseudocode.c" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "The CIH virus, widely nicknamed Chernobyl, was a parasitic virus for Windows 9x PE executables, written by Taiwanese student Chen Ing-hau. When triggered on April 26 (aligned with the anniversary of the 1986 Chornobyl disaster), it attempted to overwrite flash BIOS and disk structures, rendering many PCs unbootable. It spread primarily through pirated software and game cracks and was estimated to have infected millions of machines worldwide in 1998.",
    lesson:
      "Malware does not need the network to scale, physical media and grey-market software carried CIH farther than any worm of its era. Timed payloads reward inventory discipline: knowing which machines still run legacy OSes, which BIOS chips are field-reprogrammable, and which maintenance windows actually happen before the calendar flips.",
    simulated: [
      "The strings dump is a reconstruction for teaching, not a hex-accurate dump.",
      "No viral binary is shipped.",
      "The author alias, trigger date, payload behaviour, and scale are historically grounded.",
    ],
  },
};
