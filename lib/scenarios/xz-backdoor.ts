import type { Scenario } from "../types";

export const xzBackdoor: Scenario = {
  slug: "xz-backdoor",
  exhibit: "EXH-029",
  title: "Microseconds",
  tagline:
    "March 29, 2024. A Postgres engineer notices sshd is half a second slower on his test box. The investigation that follows uncovers a two-year supply-chain operation against every Linux distribution.",
  category: "incident-response",
  difficulty: "advanced",
  era: "2020s",
  year: "2024",
  estMinutes: 14,
  fictional: true,
  cwd: "/home/freund",
  user: "freund",
  host: "debian-sid-test",
  role: "You're a database engineer testing on Debian sid. You don't work on cryptography or distros. You just noticed something off this weekend and decided to chase it.",
  objective:
    "Walk the same trail of evidence: the slow sshd, the patched library, and the malicious tarball that didn't match its git source.",
  briefing:
    "You've been benchmarking sshd because of an unrelated Valgrind warning. Sometime after the latest sid update, sshd is taking 500–800ms longer to fail authentication than it used to. Probably nothing. Probably worth twenty minutes. Start by figuring out which library on your system shipped most recently.",
  env: {
    USER: "freund",
    SHELL: "/bin/bash",
    PWD: "/home/freund",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  101 ?        00:00:01 systemd",
    "  244 ?        00:00:00 sshd: /usr/sbin/sshd",
    "  398 pts/0    00:00:00 bash",
    "  402 pts/0    00:00:00 ps",
  ],
  history: ["uname -a", "ls"],
  commands: {
    "python3 advisory_triage.py --input NOTES.md": "simulated safe tool replay for xz-backdoor; replaces: cat NOTES.md\n",
    "python3 osqueryi.py --query 'select * from os_version' --source /etc/os-release": "simulated safe tool replay for xz-backdoor; replaces: cat /etc/os-release\n",
    "python3 safe_replay.py --scenario xz-backdoor --grep version --artifact /var/lib/dpkg/status.xz": "simulated safe tool replay for xz-backdoor; replaces: grep -inF version /var/lib/dpkg/status.xz\n",
    "python3 ir_toolkit.py enumerate --path /build/xz-5.6.1/m4": "simulated safe tool replay for xz-backdoor; replaces: ls /build/xz-5.6.1/m4\n",
    "python3 safe_replay.py --scenario xz-backdoor --artifact /git/xz/m4/.gitignore": "simulated safe tool replay for xz-backdoor; replaces: cat /git/xz/m4/.gitignore\n",
    "python3 safe_replay.py --scenario xz-backdoor --artifact /build/xz-5.6.1/m4/build-to-host.m4": "simulated safe tool replay for xz-backdoor; replaces: cat /build/xz-5.6.1/m4/build-to-host.m4\n",
    "python3 ir_toolkit.py parse-artifact --input timeline.txt": "simulated safe tool replay for xz-backdoor; replaces: cat timeline.txt\n",
    "file /build/xz-5.6.1/m4/build-to-host.m4":
      "/build/xz-5.6.1/m4/build-to-host.m4: ASCII text, with very long lines (simulated)\n",
  },
  files: {
    "/home/freund/NOTES.md": {
      content: [
        "weekend notes, sshd is slow",
        "",
        "- noticed during unrelated valgrind work",
        "- sshd auth attempts on debian-sid-test take ~500ms longer than my",
        "  jammy box. cpu graph shows liblzma at the top. why is sshd",
        "  even calling liblzma?",
        "- it isn't, directly. it's a transitive load via libsystemd, which",
        "  links liblzma for journal compression. so any sshd built with",
        "  systemd notify support pulls liblzma into its address space at",
        "  startup. that means liblzma can hook anything sshd does.",
        "",
        "checklist:",
        "  [ ] confirm xz-utils version on this host",
        "  [ ] check the build artifact tree for anything that doesn't match",
        "      the public git tree on github.com/tukaani-project/xz",
        "  [ ] look at any recent maintainer changes",
      ].join("\n"),
    },
    "/etc/os-release": {
      content: [
        'PRETTY_NAME="Debian GNU/Linux trixie/sid"',
        'NAME="Debian GNU/Linux"',
        'VERSION_CODENAME="sid"',
        'ID=debian',
      ].join("\n"),
    },
    "/var/lib/dpkg/status.xz": {
      content:
        "<binary> xz-utils package metadata\n  Package: xz-utils\n  Status: install ok installed\n  Version: 5.6.1-1\n  Maintainer: Jia Tan <jiat0218@gmail.com>\n  Description: XZ-format compression utilities\n",
    },
    "/build/xz-5.6.1/m4/build-to-host.m4": {
      content: [
        "# build-to-host.m4, included in the release tarball but NOT in the upstream git tree.",
        "# Decodes a payload from the test corpus during ./configure and links it into liblzma.",
        "AC_DEFUN([gl_BUILD_TO_HOST],[",
        "  gl_path_map='tr \"\\t \\-_\" \" \\t_\\-\"'",
        "  gl_[$1]_config='sed \\\"r\\n\\\" $gl_am_configmake | eval $gl_path_map | tr -d \"\\n\" | xz -d 2>/dev/null'",
        "  ...",
        "])",
      ].join("\n"),
    },
    "/build/xz-5.6.1/tests/files/bad-3-corrupt_lzma2.xz": {
      content:
        "<binary> the disguised payload, extracted at build time by the m4 macro,\nthen linked into liblzma. Two stages of obfuscation; the final stage hooks\nRSA_public_decrypt() inside any process that loads liblzma into its address space.",
    },
    "/build/xz-5.6.1/tests/files/good-large_compressed.lzma": {
      content:
        "<binary> the second stage of the dropper. Real archives test files;\nthese two have been replaced.",
    },
    "/git/xz/m4/.gitignore": {
      content:
        "# the upstream git tree does NOT contain build-to-host.m4.\n# the file only exists in the release tarball, generated locally by autoreconf.\n# that is the whole point of the smuggle: the tarball is not the git tree.\n",
    },
    "/home/freund/timeline.txt": {
      content: [
        "2021-10  github user JiaT75 (Jia Tan) starts contributing to xz-utils",
        "2022-04  long campaign of mailing-list pressure on the only maintainer",
        "         (Lasse Collin), apparently coordinated, lobbying for shared",
        "         maintainership",
        "2023-01  Jia Tan added as a co-maintainer; starts cutting releases",
        "2024-02  xz-utils 5.6.0 released. m4/build-to-host.m4 added.",
        "2024-03  xz-utils 5.6.1 released.",
        "2024-03-29  Andres Freund posts oss-security: 'I noticed sshd was",
        "            using a surprising amount of CPU... after some time of",
        "            digging I figured out the answer.'",
        "         CVE-2024-3094 assigned. Same day, distros begin reverting.",
      ].join("\n"),
    },
    // First public disclosure (oss-security, 2024-03-29): Andres Freund on sshd RSA path / liblzma.
    "/home/freund/public-poc/oss_security_20240329_excerpt.txt": {
      content: [
        "Subject: backdoor in upstream xz/liblzma leading to SSH server compromise",
        "From: Andres Freund <andres@samba.org>",
        "Date: Fri, 29 Mar 2024",
        "",
        "I've just noticed something weird in Debian sid / unstable openssh server vs bookworm stable.",
        "sshd ... was using more CPU than I would expect and valgrind was throwing",
        "warnings about stack memory that was uninitialised.",
        "",
        "... after some time of digging ... the answer: liblzma from xz 5.6.0 and 5.6.1 ...",
        "... part of the sshd binary ... contains code for an IFUNC ... that",
        "determines whether the process is ... modified to allow certain RSA keys",
        "to authenticate as legitimate ...",
        "",
        "(Museum excerpt paraphrases the public mail chain; see CVE-2024-3094 advisories.)",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "file-macro",
          goal: "Classify the suspicious m4 macro with file(1) (simulated).",
          hint: "`file /build/xz-5.6.1/m4/build-to-host.m4`.",
          matches: [
            {
              kind: "exact",
              command: "file /build/xz-5.6.1/m4/build-to-host.m4",
            },
          ],
          narration:
            "You noticed sshd lagging; classify the tarball-only macro before you reread your own notes.",
        },
    {
          id: "notes",
          goal: "Read your weekend notes for context.",
          hint: "`python3 advisory_triage.py --input NOTES.md`.",
          matches: [{ kind: "exact", command: "python3 advisory_triage.py --input NOTES.md" }],
          narration:
            "sshd doesn't link liblzma directly. It links libsystemd for sd_notify, and libsystemd links liblzma for journal compression. That's how a compression library ended up running inside an SSH daemon's address space.",
        },
    {
          id: "distro",
          goal: "Confirm we're on Debian sid (which has the new xz package).",
          hint: "`python3 osqueryi.py --query 'select * from os_version' --source /etc/os-release`.",
          matches: [{ kind: "exact", command: "python3 osqueryi.py --query 'select * from os_version' --source /etc/os-release" }],
          narration:
            "Debian sid. The 5.6.x line shipped here before any stable distro picked it up, which is what saved most production systems.",
        },
    {
          id: "version",
          goal: "Find the installed xz-utils version.",
          hint: "`python3 safe_replay.py --scenario xz-backdoor --grep version --artifact /var/lib/dpkg/status.xz`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario xz-backdoor --grep version --artifact /var/lib/dpkg/status.xz" }],
          narration:
            "5.6.1, maintained by Jia Tan. That maintainer name is going to matter in a few minutes.",
        },
    {
          id: "tarball-vs-git",
          goal:
            "List the build/m4 directory from the release tarball, not from upstream git.",
          hint: "`python3 ir_toolkit.py enumerate --path /build/xz-5.6.1/m4`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py enumerate --path /build/xz-5.6.1/m4" }],
          narration:
            "build-to-host.m4 exists in the tarball. Hold that thought.",
        },
    {
          id: "git-tree",
          goal: "Now look at the same path in the upstream git tree.",
          hint: "`python3 safe_replay.py --scenario xz-backdoor --artifact /git/xz/m4/.gitignore`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario xz-backdoor --artifact /git/xz/m4/.gitignore" }],
          narration:
            "The git tree doesn't ship that file. The release tarball does. The autoconf macro inside it runs at ./configure time and decodes a payload out of two test files in `tests/files/`. That is the whole trick: the build inputs that distros actually consume are not the same as the source you can audit on github.",
        },
    {
          id: "macro",
          goal: "Read the malicious m4 macro.",
          hint: "`python3 safe_replay.py --scenario xz-backdoor --artifact /build/xz-5.6.1/m4/build-to-host.m4`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario xz-backdoor --artifact /build/xz-5.6.1/m4/build-to-host.m4" }],
          narration:
            "Pipe through tr, sed, eval, xz. Reads `tests/files/bad-3-corrupt_lzma2.xz`, a file you would never read in a security audit because it is literally named 'corrupt'. The decoded payload hooks RSA_public_decrypt inside any process that loads liblzma. sshd loads liblzma. So sshd's signature verification was being intercepted. With the right key, the attacker could authenticate as any user on any patched box, leaving no log trace.",
        },
    {
          id: "timeline",
          goal: "Read the maintainer timeline.",
          hint: "`python3 ir_toolkit.py parse-artifact --input timeline.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input timeline.txt" }],
          narration:
            "Two-year social engineering. Coordinated mailing-list pressure on the single overworked maintainer. Eventual co-maintainership. Two release cycles to land the backdoor. Caught not by static analysis, not by fuzzing, not by any tool, but by an unrelated engineer who noticed sshd was 500ms slow on a Sunday.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/oss_security_20240329_excerpt.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/oss_security_20240329_excerpt.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "CVE-2024-3094, the xz-utils backdoor, was a multi-year supply-chain operation against the upstream xz compression project. A maintainer who had spent two years building trust (operating as 'Jia Tan' / JiaT75) merged a build-system macro that, only in the release tarballs and not in the git tree, would decode a payload hidden in two of the project's test files and link it into liblzma. Because libsystemd links liblzma for journal compression, every sshd built with systemd notification support loaded the malicious code into its address space, where it hooked RSA_public_decrypt to allow authentication with an attacker-controlled key. It was discovered by Andres Freund (a Microsoft Postgres engineer) on March 29, 2024, by accident, while investigating an unrelated 500ms slowdown in sshd authentication. Stable distros had not yet picked up the 5.6.x line, so production exposure was limited to sid/Tumbleweed/Fedora 40 betas.",
    lesson:
      "The defensive lessons here are uncomfortable. (1) The thing you audit (git source) is not the thing your distro actually builds (the release tarball). Every supply-chain story reduces to this. Move toward reproducible builds and require that release tarballs be regenerated bit-for-bit from VCS at distro packaging time. (2) Lone-maintainer projects in the dependency closure of half the internet are a structural risk; the burnout and the coordinated pressure on Lasse Collin are part of the attack chain, not background. Fund and staff critical OSS or accept that 'free' costs you something. (3) Watch for performance anomalies. Andres Freund's 500ms sshd was the only signal anyone noticed. Build it into your detection: a small, boring CI job that compares boot time and sshd auth latency across releases will catch the next one.",
    simulated: [
      "The hostname, the dpkg status excerpt, and the timeline notes are reconstructions for narrative fit. The CVE number, maintainer alias, file names, attack chain (libsystemd → liblzma → sshd → RSA_public_decrypt), discovery story, and the dates are real.",
      "The malicious payload itself is not present in this exhibit; only the public macro and a label for the disguised test files are shown.",
      "All commands are scripted; the filesystem you see is in memory.",
    ],
  },
};
