import type { Scenario } from "../types";

export const heartbleedTls: Scenario = {
  slug: "heartbleed-openssl",
  exhibit: "EXH-011",
  title: "The Heartbeat",
  tagline:
    "April 2014. A keep-alive feature in OpenSSL can return a slice of process memory to any client. Private keys, session cookies, passwords, all adjacent to the heap for a moment.",
  category: "classic-history",
  difficulty: "intermediate",
  era: "2010s",
  year: "2014",
  estMinutes: 9,
  fictional: true,
  cwd: "/srv/tls-audit",
  user: "auditor",
  host: "patch-bastion",
  role: "Contractor validating whether a public-facing load balancer was ever built against a vulnerable OpenSSL.",
  objective:
    "Determine OpenSSL version bounds for CVE-2014-0160 and whether this host's build was in the affected range.",
  briefing:
    "Heartbleed is not an SQL injection you grep in access logs, it is a TLS feature bug. Here you have `openssl version`, a build log, and a NIST summary. No live TLS probing in the museum.",
  env: { USER: "auditor", SHELL: "/bin/sh", PWD: "/srv/tls-audit" },
  ps: ["  PID TTY TIME CMD", "  1 ?   0:01 systemd", "  90 tty1 0:00 sh"],
  history: ["pwd"],
  files: {
    "/srv/tls-audit/NVD-CVE-2014-0160.txt": {
      content: [
        "CVE-2014-0160, OpenSSL TLS heartbeat information disclosure",
        "",
        "Nickname: Heartbleed",
        "Affected: OpenSSL 1.0.1 through 1.0.1f (inclusive)",
        "Fixed: OpenSSL 1.0.1g (April 7 2014)",
        "Vector: Client sends malformed Heartbeat request; server returns",
        "        up to 64KiB of heap memory from the OpenSSL process",
        "Impact: Leak of private keys, session material, plaintext fragments",
        "",
        "Rotation: if keys were online on a vulnerable build, assume compromise.",
      ].join("\n"),
    },
    "/srv/tls-audit/build.log": {
      content: [
        "haproxy-1.5-dev26 build 2014-03-12",
        "linked against:",
        "  OpenSSL 1.0.1e 11 Feb 2013",
        "  (see /usr/local/ssl/version.txt)",
      ].join("\n"),
    },
    "/srv/tls-audit/version.txt": {
      content: "OpenSSL 1.0.1e 11 Feb 2013\n",
    },
  },
  steps: [
    {
      id: "nvd",
      goal: "Read the vulnerability summary.",
      hint: "`cat NVD-CVE-2014-0160.txt`.",
      matches: [{ kind: "exact", command: "cat NVD-CVE-2014-0160.txt" }],
      narration:
        "1.0.1 through 1.0.1f, a whole minor release train. Heartbeats were new; nobody fuzzed the length field hard enough.",
    },
    {
      id: "build",
      goal: "Read the build log for the OpenSSL linkage line.",
      hint: "`cat build.log`.",
      matches: [{ kind: "exact", command: "cat build.log" }],
      narration:
        "1.0.1e, squarely in the vulnerable window. HAProxy inherits the bug from its OpenSSL.",
    },
    {
      id: "version",
      goal: "Confirm the on-disk OpenSSL version string.",
      hint: "`cat version.txt`.",
      matches: [{ kind: "exact", command: "cat version.txt" }],
      narration:
        "Matches the build log. Incident conclusion: rotate every cert and key reachable from that process; bump to ≥1.0.1g before you sleep.",
    },
  ],
  debrief: {
    summary:
      "Heartbleed (CVE-2014-0160), disclosed in April 2014, was a buffer over-read in OpenSSL's implementation of the TLS heartbeat extension. A client could request a payload length larger than the payload provided, and the server would return uninitialized heap memory, potentially including long-lived private keys and plaintext. OpenSSL 1.0.1a–1.0.1f were affected; 1.0.1g fixed the bug. It became a cultural moment for TLS: millions of sites had to reissue certificates.",
    lesson:
      "Cryptography libraries are still C programs, memory safety bugs become key-exposure bugs. Inventory OpenSSL on appliances, not just on Linux: load balancers, VPNs, embedded HTTPS stacks. After disclosure, the correct mental model is 'assume keys leaked' until you prove otherwise with HSM audit trails or offline generation.",
    simulated: [
      "Host and filenames are fictional; CVE bounds, nickname, fix version, and disclosure month are real.",
    ],
  },
};
