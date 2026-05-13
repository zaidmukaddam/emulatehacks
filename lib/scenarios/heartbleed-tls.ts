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
  commands: {
    "python3 ir_toolkit.py parse-artifact --input NVD-CVE-2014-0160.txt": "simulated safe tool replay for heartbleed-openssl; replaces: cat NVD-CVE-2014-0160.txt\n",
    "tshark -r evidence.pcap --follow-log build.log": "simulated safe tool replay for heartbleed-openssl; replaces: cat build.log\n",
    "python3 ir_toolkit.py parse-artifact --input version.txt": "simulated safe tool replay for heartbleed-openssl; replaces: cat version.txt\n",
    "openssl version": "OpenSSL 1.0.1e 11 Feb 2013\n",
    "openssl s_client -connect lb.example:443 -brief": [
      "Connecting to 203.0.113.10",
      "CONNECTION ESTABLISHED",
      "Protocol version: TLSv1.2",
      "Peer certificate: CN=lb.example",
      "Verify return code: 0 (ok)",
      "Note: linked OpenSSL 1.0.1e (simulated: vulnerable to CVE-2014-0160 heartbeat over-read)",
    ].join("\n"),
  },
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
    // CVE-2014-0160 malformed heartbeat framing (widely reproduced after April 2014 public proofs).
    "/srv/tls-audit/public-poc/CVE-2014-0160-heartbeat_probe.py": {
      content: [
        '#!/usr/bin/env python3',
        '"""',
        "CVE-2014-0160 TLS heartbeat malformed length-field probe.",
        "",
        "Heartbeat record layout mirrors the April 2014 public proofs (sensepost/ssltest lineage).",
        "Original ssltest.py author disclaimed copyright; extend only onto systems you own.",
        '"""',
        "",
        "import argparse",
        "import socket",
        "import struct",
        "import sys",
        "",
        "",
        "def malformed_heartbeat(tls_protocol_version: int = 0x0302) -> bytes:",
        "    # Outer TLS record type 24 = Heartbeat, then bogus inner payload_length.",
        "    inner = struct.pack('>BH', 1, 0xFFFF)",
        '    reclen = len(inner)',
        "    outer = struct.pack('>BHH', 24, tls_protocol_version, reclen) + inner",
        "    return outer",
        "",
        "",
        "def read_tls_record(sock: socket.socket) -> tuple[int, int, bytes]:",
        "    hdr = sock.recv(5)",
        "    if len(hdr) != 5:",
        "        raise EOFError('short TLS record header')",
        "    typ, ver, reclen = struct.unpack('>BHH', hdr)",
        "    payload = sock.recv(reclen) if reclen else b''",
        "    return typ, ver, payload",
        "",
        "",
        "# Paste a full DER-encoded Client Hello from openssl s_client -trace or archival PoCs",
        "# until ServerHelloDone, then send malformed_heartbeat() on the same socket.",
        "",
        "",
        'if __name__ == "__main__":',
        '    ap = argparse.ArgumentParser(description="print heartbeat misuse bytes")',
        '    ap.add_argument("--show-bytes", action="store_true")',
        "    ns = ap.parse_args()",
        "    pkt = malformed_heartbeat()",
        '    print("Malformed heartbeat record hex:", pkt.hex())',
        "    if ns.show_bytes:",
        "        sys.stdout.buffer.write(pkt)",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "openssl-ver",
          goal: "Print the linked OpenSSL runtime version from the bastion.",
          hint: "`openssl version`.",
          matches: [{ kind: "exact", command: "openssl version" }],
          narration:
            "1.0.1e lands in the affected 1.0.1 train before 1.0.1g. First signal before you read build docs.",
        },
    {
          id: "tls-client",
          goal: "Simulate a quick TLS client handshake against the in-scope load balancer.",
          hint: "`openssl s_client -connect lb.example:443 -brief`.",
          matches: [
            {
              kind: "exact",
              command: "openssl s_client -connect lb.example:443 -brief",
            },
          ],
          narration:
            "You are not running a live Heartbleed exploit here, just proving which OpenSSL build terminates TLS on the edge.",
        },
    {
          id: "nvd",
          goal: "Read the vulnerability summary.",
          hint: "`python3 ir_toolkit.py parse-artifact --input NVD-CVE-2014-0160.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input NVD-CVE-2014-0160.txt" }],
          narration:
            "1.0.1 through 1.0.1f, a whole minor release train. Heartbeats were new; nobody fuzzed the length field hard enough.",
        },
    {
          id: "build",
          goal: "Read the build log for the OpenSSL linkage line.",
          hint: "`tshark -r evidence.pcap --follow-log build.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log build.log" }],
          narration:
            "1.0.1e, squarely in the vulnerable window. HAProxy inherits the bug from its OpenSSL.",
        },
    {
          id: "version",
          goal: "Confirm the on-disk OpenSSL version string.",
          hint: "`python3 ir_toolkit.py parse-artifact --input version.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input version.txt" }],
          narration:
            "Matches the build log. Incident conclusion: rotate every cert and key reachable from that process; bump to ≥1.0.1g before you sleep.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/CVE-2014-0160-heartbeat_probe.py`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/CVE-2014-0160-heartbeat_probe.py" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
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
