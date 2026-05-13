import type { Scenario } from "../types";

export const copyFailKernel: Scenario = {
  slug: "copy-fail-kernel",
  exhibit: "EXH-043",
  title: "Copy Fail",
  tagline:
    "April 30, 2026. A tenant reports that `su` misbehaves on a shared node after a rival team's CI job ran. The same day, CVE-2026-31431 (Copy Fail) hits the front page.",
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
    "Walk from the first suspicious tenant report to a containment call: prove the shared-kernel exposure path, confirm blast radius, and ship a same-day mitigation before the reboot window tonight.",
  briefing:
    "You are paged because an internal tenant saw `su` crash with impossible offsets right after another team's unprivileged job finished on the same bare-metal node. Thirty minutes later the Copy Fail disclosure lands. The shape matches what they saw: a logic flaw in the kernel algif_aead module lets an unprivileged process write a few bytes into the page cache of readable files, including setuid binaries, and the page cache is host-wide, so every pod on the node inherits the poisoned mapping. Public PoC is tiny and reliable. You still cannot reboot until the maintenance window. Prove the node is in the vulnerable configuration, then lock it down.",
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
  commands: {
    "tshark -r evidence.pcap --follow-log tenant-report.log": "simulated safe tool replay for copy-fail-kernel; replaces: cat tenant-report.log\n",
    "uname -a": "simulated safe tool replay for copy-fail-kernel; replaces: cat /proc/version\n",
    "python3 osqueryi.py --query 'select * from os_version' --source /etc/os-release": "simulated safe tool replay for copy-fail-kernel; replaces: cat /etc/os-release\n",
    "lsmod | python3 module_filter.py --contains algif --source /proc/modules": "simulated safe tool replay for copy-fail-kernel; replaces: grep -nF algif /proc/modules\n",
    "python3 ir_toolkit.py extract-ioc --ioc af-alg --input ci/strace-excerpt.txt": "simulated safe tool replay for copy-fail-kernel; replaces: grep -nF AF_ALG ci/strace-excerpt.txt\n",
    "python3 ir_toolkit.py table-summary --input ci/node-occupancy.tsv": "simulated safe tool replay for copy-fail-kernel; replaces: cat ci/node-occupancy.tsv\n",
    "python3 safe_replay.py --scenario copy-fail-kernel --artifact /etc/modprobe.d/disable-algif-aead.conf": "simulated safe tool replay for copy-fail-kernel; replaces: cat /etc/modprobe.d/disable-algif-aead.conf\n",
    "tshark -r evidence.pcap -Y 'frame contains \"responder\"' --follow-log /var/log/auth.log": "simulated safe tool replay for copy-fail-kernel; replaces: grep -nF responder /var/log/auth.log\n",
    "tshark -r evidence.pcap --follow-log containment/actions.log": "simulated safe tool replay for copy-fail-kernel; replaces: cat containment/actions.log\n",
    "uname -r": "6.17.0-1007-aws\n(simulated release string for shared-node triage)\n",
  },
  files: {
    "/home/responder/tenant-report.log": {
      content: [
        "Tenant: research-ci / namespace ai-sandbox-12",
        "Signal: userland job exited 0, then unrelated tenant reports `/usr/bin/su` segfaults.",
        "Correlation: both pods share kube node k8s-node-04 same hour.",
        "Hypothesis until confirmed: page-cache poisoning via new Linux LPE (public thread names 'Copy Fail').",
      ].join("\n"),
    },
    "/home/responder/ci/strace-excerpt.txt": {
      content: [
        "socket(AF_ALG, SOCK_SEQPACKET, 0) = 7",
        "bind(7, {salg_type='aead', salg_name='gcm(aes)'}, ...) = 0",
        "splice(3, NULL, 7, NULL, 4096, 0) = 4096",
        "execve('/usr/bin/su', ['su'], ...) = -1 EFAULT",
      ].join("\n"),
    },
    "/home/responder/ci/node-occupancy.tsv": {
      content: [
        "namespace\tpod\ttenant\tstarted",
        "research-ci\tai-sandbox-12\tml-research\t2026-04-30T08:54Z",
        "payments-ci\tsettlement-test-09\tpayments\t2026-04-30T08:58Z",
        "platform-ci\tbase-image-build\tplatform\t2026-04-30T09:01Z",
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
    "/home/responder/containment/actions.log": {
      content: [
        "2026-04-30T09:22Z cordon node=k8s-node-04 success",
        "2026-04-30T09:23Z drain namespace=research-ci pod=ai-sandbox-12 success",
        "2026-04-30T09:24Z apply seccomp deny socket.AF_ALG success",
        "2026-04-30T09:25Z write /etc/modprobe.d/disable-algif-aead.conf success",
      ].join("\n"),
    },
    "/home/responder/public-poc/cve_2026_31431_alg_splice_shape.c": {
      content: [
        "/* CVE-2026-31431 (Copy Fail): public write-ups describe AF_ALG AEAD + splice",
        " * into a page-cache-backed buffer, flipping bytes inside cached executables.",
        " * Museum excerpt only: not a working PoC.",
        " */",
        "",
        "int sock = socket(AF_ALG, SOCK_SEQPACKET, 0);",
        "/* bind(sock, struct sockaddr_alg { .salg_type = \"aead\", .salg_name = \"gcm(aes)\" }) */",
        "/* splice(pipefd, NULL, sockfd, NULL, len, 0); */",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "uname-r",
          phase: "Recon",
          goal: "Print the running kernel release (simulated).",
          hint: "`uname -r`.",
          matches: [{ kind: "exact", command: "uname -r" }],
          narration:
            "Kernel release pins the node to the Copy Fail disclosure window before you read the tenant flash.",
        },
    {
          id: "soc-flash",
          phase: "Recon",
          goal: "Inspect the tenant report that starts the shared-kernel investigation.",
          hint: "`tshark -r evidence.pcap --follow-log tenant-report.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log tenant-report.log" }],
          narration:
            "Two tenants, one kernel, same hour. That is the whole story before you open any vendor PDF: multi-tenant pods are not a CPU fence against kernel primitives.",
        },
    {
          id: "kernel",
          phase: "Recon",
          goal: "Identify the running kernel.",
          hint: "`uname -a`.",
          matches: [{ kind: "exact", command: "uname -a" }],
          narration:
            "Linux 6.17.0 on Ubuntu 24.04. Well past 4.14, inside the vulnerable range described in public writeups.",
        },
    {
          id: "distro",
          phase: "Recon",
          goal: "Confirm the distribution.",
          hint: "`python3 osqueryi.py --query 'select * from os_version' --source /etc/os-release`.",
          matches: [{ kind: "exact", command: "python3 osqueryi.py --query 'select * from os_version' --source /etc/os-release" }],
          narration:
            "Ubuntu 24.04 LTS, the sort of fleet where this landed first in everyone’s test clusters.",
        },
    {
          id: "modules",
          phase: "Initial access",
          goal:
            "Map the AF_ALG surface: show whether algif pieces are present and whether autoload can still pull in algif_aead.",
          hint: "`lsmod | python3 module_filter.py --contains algif --source /proc/modules`.",
          matches: [{ kind: "exact", command: "lsmod | python3 module_filter.py --contains algif --source /proc/modules" }],
          narration:
            "algif_skcipher and algif_hash are already live; algif_aead is absent until something asks for AEAD. af_alg is present, so the autoload path is the exposure. This is the bridge from ‘unprivileged container’ to ‘host-wide page cache’.",
        },
    {
          id: "strace",
          phase: "Impact",
          goal: "Show the AF_ALG plus splice sequence from the suspect CI job trace.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc af-alg --input ci/strace-excerpt.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc af-alg --input ci/strace-excerpt.txt" }],
          narration:
            "This is the simulated primitive shape: AF_ALG socket, AEAD bind, splice into the kernel path. No payload, just the trace that tells responders what happened.",
        },
    {
          id: "tenants",
          phase: "Impact",
          goal: "List every tenant sharing the node during the exposure window.",
          hint: "`python3 ir_toolkit.py table-summary --input ci/node-occupancy.tsv`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py table-summary --input ci/node-occupancy.tsv" }],
          narration:
            "The blast radius is not the one pod that ran the trace. It is every tenant sharing the host page cache before containment.",
        },
    {
          id: "blacklist",
          phase: "Containment",
          goal:
            "Verify the emergency modprobe drop-in that blocks algif_aead from loading.",
          hint: "`python3 safe_replay.py --scenario copy-fail-kernel --artifact /etc/modprobe.d/disable-algif-aead.conf`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario copy-fail-kernel --artifact /etc/modprobe.d/disable-algif-aead.conf" }],
          narration:
            "`install algif_aead /bin/false` kills the autoload path. This is the lever you can pull before reboot: no AEAD socket provider, no Copy Fail primitive.",
        },
    {
          id: "auth",
          phase: "Detection",
          goal: "Rule out interactive attackers on this node.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"responder\"' --follow-log /var/log/auth.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"responder\"' --follow-log /var/log/auth.log" }],
          narration:
            "Only your responder account touched SSH this morning. That does not disprove kernel-layer games, it just says the follow-on drama is not an extra human shell yet.",
        },
    {
          id: "actions",
          phase: "Containment",
          goal: "Verify cordon, drain, AF_ALG seccomp, and modprobe containment actions.",
          hint: "`tshark -r evidence.pcap --follow-log containment/actions.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/actions.log" }],
          narration:
            "This is the fix in operational order: cordon, drain, block the syscall surface for pods, then stop algif_aead from loading while the reboot window is prepared.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/cve_2026_31431_alg_splice_shape.c`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/cve_2026_31431_alg_splice_shape.c" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
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
