import type { Scenario } from "../types";

export const copyFailKernel: Scenario = {
  slug: "copy-fail-kernel",
  exhibit: "EXH-036",
  title: "Copy Fail",
  tagline:
    "April 30, 2026. A kernel LPE that has lived in every major Linux distro since 2017 is now public, with a 732-byte exploit. You manage a multi-tenant Kubernetes cluster.",
  category: "incident-response",
  difficulty: "advanced",
  era: "2020s",
  year: "2026",
  estMinutes: 12,
  fictional: true,
  cwd: "/home/responder",
  user: "responder",
  host: "k8s-node-04",
  role: "Platform engineer on a Kubernetes cluster that hosts CI runners and AI sandboxes for multiple internal teams. Same host kernel underneath all of them.",
  objective:
    "Decide in the next ten minutes whether this node is exposed to CVE-2026-31431, and apply a same-day mitigation if you cannot reboot.",
  briefing:
    "Theori disclosed CVE-2026-31431 (Copy Fail) yesterday. It's a logic flaw in the kernel's algif_aead module, an unprivileged process can write a few bytes into the page cache of any readable file, including setuid binaries. Public 732-byte PoC. No race window. Reliable across Ubuntu, RHEL, Amazon Linux, SUSE. Worse: the page cache is shared across containers on the same kernel, so one tenant can poison /usr/bin/su for everyone else on this node. You can't reboot until the off-peak window tonight. Find out what's safe to ship now.",
  env: {
    USER: "responder",
    SHELL: "/bin/sh",
    PWD: "/home/responder",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "    1 ?        00:00:11 systemd",
    "  117 ?        00:00:02 containerd",
    "  240 ?        00:00:33 kubelet",
    "  812 ?        00:14:02 containerd-shim (ci-runner-09)",
    "  814 ?        00:08:51 containerd-shim (ai-sandbox-12)",
    " 1402 pts/0    00:00:00 sh",
    " 1411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  files: {
    "/home/responder/ADVISORY.md": {
      content: [
        "CVE-2026-31431, Copy Fail (Linux kernel LPE + container escape)",
        "",
        "Disclosed: Apr 29 2026 by Theori (Taeyang Lee, AI-assisted via Xint Code)",
        "Affected: Linux 4.14 → present, where the algif_aead module is loadable",
        "Class: page-cache write primitive via AF_ALG (the 2017 in-place AEAD optimization)",
        "Impact: local privilege escalation to root; cross-container poisoning on shared",
        "        kernels because the page cache is host-wide.",
        "Public PoC: 732-byte Python script. Reliable. No kernel offset, no race.",
        "",
        "What does NOT help:",
        "  - file integrity monitoring on /usr/bin/su or /etc/passwd. The bug writes",
        "    to the in-memory page cache, not to disk; the file on disk is unchanged.",
        "",
        "What DOES help (in order):",
        "  1) patch the kernel and reboot",
        "  2) blacklist algif_aead and rmmod it",
        "  3) seccomp / AppArmor policy denying socket(AF_ALG, ...) for untrusted pods",
        "",
        "What's NOT vulnerable: anything that doesn't share a host kernel with the",
        "attacker, Firecracker microVMs (Lambda, Fargate), gVisor, V8 isolates",
        "(Cloudflare Workers), dedicated hosts.",
      ].join("\n"),
    },
    "/home/responder/PATCH-PLAN.md": {
      content: [
        "decision tree (fill in as you investigate):",
        "",
        "[ ] kernel version on this node:        ___________",
        "[ ] kernel ≥ 4.14?                      yes / no",
        "[ ] is algif_aead loadable here?        yes / no",
        "[ ] is algif_aead currently loaded?     yes / no",
        "[ ] does this node host >1 tenant?      yes / no",
        "[ ] can we reboot in < 4 hours?         yes / no",
        "",
        "if any tenancy + AF_ALG row is yes and we cannot reboot now,",
        "blacklist algif_aead and rmmod it before close of standup.",
      ].join("\n"),
    },
    "/proc/version": {
      content:
        "Linux version 6.17.0-1007-aws (buildd@lcy02-amd64-073) (gcc-13 ...) #7-Ubuntu SMP Mon Apr 14 13:51:02 UTC 2026\n",
    },
    "/etc/os-release": {
      content: [
        'PRETTY_NAME="Ubuntu 24.04.2 LTS"',
        'NAME="Ubuntu"',
        'VERSION_ID="24.04"',
        'VERSION="24.04.2 LTS (Noble Numbat)"',
        'ID=ubuntu',
      ].join("\n"),
    },
    "/proc/modules": {
      content: [
        "ext4 1056768 4 - Live 0xffffffffc0a40000",
        "overlay 196608 16 - Live 0xffffffffc09a0000",
        "br_netfilter 32768 0 - Live 0xffffffffc0980000",
        "algif_skcipher 16384 0 - Live 0xffffffffc0860000",
        "algif_hash 20480 0 - Live 0xffffffffc0840000",
        "af_alg 36864 2 algif_skcipher,algif_hash, Live 0xffffffffc0820000",
      ].join("\n"),
    },
    "/etc/modprobe.d/disable-algif-aead.conf": {
      content:
        "# created during incident response 2026-04-30\n# remove after kernel patch is rolled and verified\ninstall algif_aead /bin/false\n",
    },
    "/var/log/auth.log": {
      content: [
        "2026-04-30T08:14:02Z k8s-node-04 sshd[2188]: Accepted publickey for responder from 10.0.4.12 port 41044 ssh2: ED25519 SHA256:...",
        "2026-04-30T08:14:02Z k8s-node-04 systemd-logind[412]: New session 17 of user responder.",
        "2026-04-30T08:14:31Z k8s-node-04 sudo: responder : TTY=pts/0 ; PWD=/home/responder ; USER=root ; COMMAND=/bin/cat /home/responder/PATCH-PLAN.md",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "advisory",
      goal: "Read the advisory note for context.",
      hint: "`cat ADVISORY.md`.",
      matches: [{ kind: "exact", command: "cat ADVISORY.md" }],
      narration:
        "Page-cache write primitive via AF_ALG. File-on-disk is untouched, so file integrity monitoring will not see anything. The exposure question is one thing only: can an unprivileged process on this node reach the AF_ALG AEAD interface?",
    },
    {
      id: "kernel",
      goal: "Identify the running kernel.",
      hint: "`cat /proc/version`.",
      matches: [{ kind: "exact", command: "cat /proc/version" }],
      narration:
        "Linux 6.17.0 on Ubuntu 24.04. Well past 4.14, vulnerable kernel range.",
    },
    {
      id: "distro",
      goal: "Confirm the distribution.",
      hint: "`cat /etc/os-release`.",
      matches: [{ kind: "exact", command: "cat /etc/os-release" }],
      narration:
        "Ubuntu 24.04 LTS, explicitly listed as vulnerable in Theori's writeup.",
    },
    {
      id: "modules",
      goal:
        "Check whether the AF_ALG family is currently loaded on this node.",
      hint: "`grep -nF algif /proc/modules`.",
      matches: [
        { kind: "exact", command: "grep -nF algif /proc/modules" },
      ],
      narration:
        "algif_skcipher and algif_hash are loaded; algif_aead is not (yet). But af_alg is loaded as a dependency of the others, which means a process can request a new AF_ALG socket and the kernel will autoload algif_aead on demand. Treat this as exposed.",
    },
    {
      id: "blacklist",
      goal:
        "Confirm the same-day mitigation is staged: a modprobe blacklist for algif_aead.",
      hint:
        "Read `/etc/modprobe.d/disable-algif-aead.conf`.",
      matches: [
        {
          kind: "exact",
          command: "cat /etc/modprobe.d/disable-algif-aead.conf",
        },
      ],
      narration:
        "`install algif_aead /bin/false` neutralises the autoload path. Once you `rmmod algif_aead` (which is currently a no-op since it isn't loaded), no process, privileged or not, can bring the AEAD interface back up until the file is removed and the host is rebooted.",
    },
    {
      id: "auth",
      goal: "Sanity-check that no one else has been on this box today.",
      hint: "`grep -nF responder /var/log/auth.log`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF responder /var/log/auth.log",
        },
      ],
      narration:
        "Only your session this morning. Nothing else interactive. Good, that means the window of exposure you have to characterise is the entire pre-patch period, and you're managing it forward, not backward.",
    },
    {
      id: "plan",
      goal: "Open the patch plan checklist and prepare to fill it in.",
      hint: "`cat PATCH-PLAN.md`.",
      matches: [{ kind: "exact", command: "cat PATCH-PLAN.md" }],
      narration:
        "Fill in: kernel 6.17.0, ≥4.14 yes, algif_aead loadable yes, currently loaded no (but autoload-able), multi-tenant yes, reboot in <4h no. Action: ship the modprobe blacklist now, schedule the kernel reboot for the maintenance window, and write a post-incident note recommending Firecracker / gVisor for the AI sandboxes, the structural fix is don't share a kernel with untrusted code.",
    },
  ],
  debrief: {
    summary:
      "CVE-2026-31431 (Copy Fail), disclosed April 29 2026 by Theori, is a logic flaw in the Linux kernel's algif_aead module. The 2017 in-place AEAD optimization allowed a page-cache page to end up in the kernel's writable destination buffer for an AEAD operation submitted over an AF_ALG socket. An unprivileged process could then drive splice() into that socket and overwrite a few bytes inside the page cache of any readable file, including setuid binaries like /usr/bin/su. Reliable, no race, every major distro since Linux 4.14, public 732-byte PoC.",
    lesson:
      "Two things. First, the structural fix is the boundary, not the patch: containers were never meant to be a security boundary against the host kernel, and Copy Fail just makes that concrete. If you run untrusted code today (CI runners, AI sandboxes, multi-tenant Kubernetes), move it to Firecracker, gVisor, or per-tenant VMs and stop relying on namespace isolation as if it were a hardware boundary. Second, the same-day mitigation is real: blacklist algif_aead via a modprobe drop-in, rmmod it where loaded, and add a seccomp profile that denies AF_ALG socket creation in pod specs. That eliminates the attack surface entirely until the kernel reboot lands. Don't depend on file integrity monitoring, Copy Fail writes only to the in-memory page cache, so on-disk hashes never change.",
    simulated: [
      "All hostnames, sessions, IPs, and the contents of /proc/modules are invented.",
      "No kernel-mode behaviour is modelled or executed; this exhibit is a defensive walk-through of public information from Theori, Bugcrowd, and the University of Toronto advisory.",
      "The CVE number, disclosure date, affected kernel range, mitigation (modprobe blacklist), and the unaffected-isolation list (Firecracker / gVisor / V8 isolates) are real.",
    ],
  },
};
