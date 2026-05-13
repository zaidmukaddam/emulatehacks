import type { Scenario } from "../types";

/** Fictional ‘Copy Fail 2 / dirty frag’ aftermath: forensic hunt after page-cache games on shared metal. */
export const copyFailDirtyFrag: Scenario = {
  slug: "copy-fail-dirty-frag",
  exhibit: "EXH-045",
  title: "Copy Fail 2 / Dirty Frag",
  tagline:
    "May 12, 2026. After CVE-2026-31431 mitigations land, one CI worker still shows odd text section mappings. You prove whether fragments of poisoned pages remain mapped in shared address spaces.",
  category: "incident-response",
  difficulty: "advanced",
  era: "2020s",
  year: "2026",
  estMinutes: 12,
  fictional: true,
  cwd: "/home/forensics/ci-node-east",
  user: "responder",
  host: "ci-node-east",
  role: "Forensic engineer validating reboot completeness post Copy Fail response.",
  objective:
    "Validate the simulated Copy Fail 2 chain: AF_ALG use, duplicate mappings, surviving CI jobs, reboot evidence, and image rebuild.",
  briefing:
    "This is a deliberately fictional Copy Fail 2 follow-up. A CI worker still shows dirty page-cache symptoms after mitigation. You do not run kernel tricks; you trace the artifact chain defenders would use to decide whether to evict and rebuild.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/forensics/ci-node-east" },
  ps: [
    "  PID TTY          TIME CMD",
    " 402 pts/0    00:00:00 bash",
    " 411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "tshark -r evidence.pcap --follow-log incident-window.log": "simulated safe tool replay for copy-fail-dirty-frag; replaces: cat incident-window.log\n",
    "python3 ir_toolkit.py parse-artifact --input suspect-strace.txt": "simulated safe tool replay for copy-fail-dirty-frag; replaces: cat suspect-strace.txt\n",
    "python3 ir_toolkit.py extract-ioc --ioc su --input proc-maps-snip.txt": "simulated safe tool replay for copy-fail-dirty-frag; replaces: grep -nF su proc-maps-snip.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"reboot\"' --follow-log cgroup-events.log": "simulated safe tool replay for copy-fail-dirty-frag; replaces: grep -nF reboot cgroup-events.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"algif-aead\"' --follow-log rebuild.log": "simulated safe tool replay for copy-fail-dirty-frag; replaces: grep -nF algif_aead rebuild.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"reboot\"' --follow-log cgroup-events.log --view 2": "simulated safe tool replay for copy-fail-dirty-frag; replaces: grep -nF reboot cgroup-events.log\n",
    "strings suspect-strace.txt | head -n 6":
      [
        "socket(AF_ALG, SOCK_SEQPACKET, 0) = 19",
        "splice(14, NULL, 19, NULL, 4096, 0)     = 4096",
        "(simulated strings head on CI strace excerpt)",
      ].join("\n"),
  },
  files: {
    "/home/forensics/ci-node-east/incident-window.log": {
      content: [
        "2026-05-02T01:07:12 ci-job-8841 started tenant=mlbench",
        "2026-05-02T01:08:44 ci-job-8842 started tenant=payments",
        "2026-05-02T01:09:31 detector flagged duplicate executable mapping on /usr/bin/su",
        "2026-05-02T01:10:02 scheduler cordon requested for ci-node-east",
      ].join("\n"),
    },
    "/home/forensics/ci-node-east/suspect-strace.txt": {
      content: [
        "Synthetic strace highlights (CI uid 91011)",
        "socket(AF_ALG, SOCK_SEQPACKET, 0) = 19",
        "splice(14, NULL, 19, NULL, 4096, 0)     = 4096",
        "close(19)                                = 0",
        "execve('/usr/bin/su', ...)               = -1 EACCES (optional noise)",
      ].join("\n"),
    },
    "/home/forensics/ci-node-east/proc-maps-snip.txt": {
      content: [
        "Synthetic /proc/self/maps excerpt for teaching",
        "7f8c0c000000-7f8c0c001000 r-xp ... /usr/bin/su",
        "7f8c0c002000-7f8c0c003000 r--p ... /usr/bin/su  <- duplicate mapping hint in exhibit",
      ].join("\n"),
    },
    "/home/forensics/ci-node-east/cgroup-events.log": {
      content: [
        "2026-05-02T01:11:02 freed cgroup ci-job-8841",
        "2026-05-02T01:11:04 freed cgroup ci-job-8842",
        "2026-05-02T01:14:59 kube_scheduled reboot_marker=post-copyfail",
      ].join("\n"),
    },
    "/home/forensics/ci-node-east/rebuild.log": {
      content: [
        "2026-05-02T01:20:00 image=ci-golden-2026.05.02 build=started",
        "2026-05-02T01:34:44 image=ci-golden-2026.05.02 algif_aead=blacklisted",
        "2026-05-02T01:41:13 image=ci-golden-2026.05.02 promoted=true",
      ].join("\n"),
    },
    "/home/forensics/ci-node-east/public-poc/page_cache_forensics_note.txt": {
      content: [
        "# After Copy Fail class issues, defenders watch for:",
        "# - duplicate r-xp mappings of setuid binaries",
        "# - unexplained EACCES/EFAULT on exec after CI jobs",
        "# - host reboot as the ground-truth eviction for shared page cache",
        "",
        "grep su /proc/$pid/maps | uniq -c",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "strings-strace",
          phase: "Recon",
          goal: "Pull printable syscall lines from the strace excerpt (simulated).",
          hint: "`strings suspect-strace.txt | head -n 6`.",
          matches: [
            {
              kind: "exact",
              command: "strings suspect-strace.txt | head -n 6",
            },
          ],
          narration:
            "Strings on the strace excerpt surfaces AF_ALG+splice without running the exploit.",
        },
    {
          id: "window",
          phase: "Recon",
          goal: "Read the incident window to see which CI tenants overlapped.",
          hint: "`tshark -r evidence.pcap --follow-log incident-window.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log incident-window.log" }],
          narration:
            "Two tenants overlap before cordon. That makes dirty page-cache questions a tenant-isolation incident, not a lab curiosity.",
        },
    {
          id: "strace",
          phase: "Initial access",
          goal: "Review synthetic strace lines that echo Copy Fail primitives without weaponising them.",
          hint: "`python3 ir_toolkit.py parse-artifact --input suspect-strace.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input suspect-strace.txt" }],
          narration:
            "AF_ALG plus splice is the high-level shape public writeups discuss. You log it, you do not replay it.",
        },
    {
          id: "maps",
          phase: "Persistence",
          goal: "Inspect the suspicious duplicate mapping fragment for `/usr/bin/su`.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc su --input proc-maps-snip.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc su --input proc-maps-snip.txt" }],
          narration:
            "Double mappings can be innocent; in this teaching file they stand in for ‘something is off, get humans.’",
        },
    {
          id: "cgroup",
          phase: "Impact",
          goal: "Verify cgroup teardown and reboot marker timestamps.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"reboot\"' --follow-log cgroup-events.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"reboot\"' --follow-log cgroup-events.log" }],
          narration:
            "Impact containment for CI is literal eviction: free the cgroup, reboot the metal, rebuild golden images.",
        },
    {
          id: "rebuild",
          phase: "Containment",
          goal: "Verify the rebuilt CI image includes the algif_aead blacklist.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"algif-aead\"' --follow-log rebuild.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"algif-aead\"' --follow-log rebuild.log" }],
          narration:
            "The fix is not a paragraph. It is a rebuilt image with the risky module path disabled and no old jobs left running.",
        },
    {
          id: "lessons",
          phase: "Lessons",
          goal: "Re-check the reboot marker that proves the old kernel state died.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"reboot\"' --follow-log cgroup-events.log --view 2`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"reboot\"' --follow-log cgroup-events.log --view 2" }],
          narration:
            "Lesson: treat ‘dirty frag’ fear as a governance trigger for real VM isolation budgets, not as a second patch roulette.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/page_cache_forensics_note.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/page_cache_forensics_note.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "Dirty Frag is a fictional forensic coda to the public Copy Fail / CVE-2026-31431 narrative already covered in this museum. It discusses page-cache anxiety on shared CI hosts after kernel mitigations, without presenting a distinct real CVE or exploit recipe.",
    lesson:
      "After kernel trust failures on multi-tenant metal, win the argument with reboot evidence and architecture change, not with endless `/proc` staring contests.",
    simulated: [
      "strace, maps, and cgroup logs are pedagogical snippets only.",
      "CVE-2026-31431 reference links this exhibit to the earlier Copy Fail scenario thematically.",
    ],
  },
};
