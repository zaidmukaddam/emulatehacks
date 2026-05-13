import type { Scenario } from "../types";

/** Terrapin attack, SSH handshake prefix truncation CVE-2023-48795. Dec 2023. */
export const terrapinSsh: Scenario = {
  slug: "terrapin-ssh-handshake",
  exhibit: "EXH-027",
  title: "sequence_number++",
  tagline:
    "December 2023. Researchers show a middlebox can truncate the SSH handshake just before NEWKEYS, downgrading your channel without triggering the hostkey warning you were trained to trust.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2023",
  estMinutes: 8,
  fictional: true,
  cwd: "/ssh/terrapin-workbench",
  user: "crypto",
  host: "bastion-lab",
  role: "Cryptography engineer validating `ssh -Q kex` output against the vendor bulletin before your fleet patch window.",
  objective:
    "Read the briefing, inspect sshd_config for vulnerable default KEX proposals, and grep auth logs for handshake reset lines.",
  briefing:
    "Terrapin is real but niche, attacker needs MitM. Your execs still deserve a crisp explanation.",
  env: { USER: "crypto", SHELL: "/bin/sh", PWD: "/ssh/terrapin-workbench" },
  ps: ["  PID TTY TIME CMD", "  1 ?   0:00 sshd"],
  history: [],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input CVE-2023-48795-brief.txt": "simulated safe tool replay for terrapin-ssh-handshake; replaces: cat CVE-2023-48795-brief.txt\n",
    "python3 ir_toolkit.py parse-artifact --input evidence.txt": "simulated safe tool replay for terrapin-ssh-handshake; replaces: cat sshd_config\n",
    "tshark -r evidence.pcap -Y 'frame contains \"newkeys\"' --follow-log auth.log": "simulated safe tool replay for terrapin-ssh-handshake; replaces: grep -nF NEWKEYS auth.log\n",
    "ssh -V 2>&1":
      "OpenSSH_8.9p1 Debian-1 (tabletop)\n(simulated: compare client/server builds before Terrapin patch window)\n",
  },
  files: {
    "/ssh/terrapin-workbench/CVE-2023-48795-brief.txt": {
      content: [
        "CVE-2023-48795, Terrapin attack (SSH)",
        "Handshake prefix truncation breaks early SSH_MSG_NEWKEYS integrity expectation",
        "Enables downgrade / feature stripping (e.g. keystroke obfuscation extensions) in vulnerable combos",
        "Mitigation: patch OpenSSH + peers; prefer strictKex extension; disable legacy ChaCha20-Poly1305 + Encrypt-then-MAC combos called out in paper",
        "Published Dec 2023; named Terrapin (TERrain Truncation ATTack)",
      ].join("\n"),
    },
    "/ssh/terrapin-workbench/sshd_config": {
      content: [
        "# tabletop sshd with *insecure defaults* for training",
        "Port 22",
        "PermitRootLogin prohibit-password",
        "KexAlgorithms curve25519-sha256,ecdh-sha2-nistp256,diffie-hellman-group14-sha256",
        "Ciphers chacha20-poly1305@openssh.com,aes128-ctr",
        "MACs hmac-sha2-256-etm@openssh.com,hmac-sha1",
      ].join("\n"),
    },
    "/ssh/terrapin-workbench/auth.log": {
      content: [
        "2023-12-21T08:14:01Z bastion-lab sshd[1200]: Client 203.0.113.44 closed connection before NEWKEYS [possible MitM]",
        "2023-12-21T08:14:02Z bastion-lab sshd[1200]: session opened for user buildbot from 198.51.100.7",
        "2023-12-21T08:19:40Z bastion-lab sshd[1214]: error: Protocol error: packet too long",
      ].join("\n"),
    },
    "/ssh/terrapin-workbench/public-poc/terrapin_handshake_truncation_note.txt": {
      content: [
        "# CVE-2023-48795: MitM truncates handshake so client/server disagree on CHANNEL_REQUEST / extensions.",
        "# Attacker suppresses SSH_MSG_NEWKEYS or related sequencing in vulnerable KEX stacks.",
        "",
        "# Mitigation highlights from public paper:",
        "# - strict key exchange (strict-kex) extension",
        "# - patch both peers; disable weak EtM + ChaCha combos where advised",
        "",
        "# Requires on-path attacker; coffee-shop WiFi risk model.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "ssh-version",
          goal: "Print the OpenSSH client version string (simulated).",
          hint: "`ssh -V 2>&1`.",
          matches: [{ kind: "exact", command: "ssh -V 2>&1" }],
          narration:
            "Another reason VPN-over-coffee-shop is insufficient, attackers need positioning, not CPU farms.",
        },
    {
          id: "brief",
          goal: "Read the Terrapin brief.",
          hint: "`python3 ir_toolkit.py parse-artifact --input CVE-2023-48795-brief.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input CVE-2023-48795-brief.txt" }],
          narration:
            "Handshake prefix truncation breaks early NEWKEYS expectations; MitM positioning turns it into a downgrade story.",
        },
    {
          id: "config",
          goal: "Inspect the synthetic sshd_config.",
          hint: "`python3 ir_toolkit.py parse-artifact --input evidence.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input evidence.txt" }],
          narration:
            "ChaCha20-Poly1305 still listed, pairing with peer matters; patch awareness beats cipher dogma.",
        },
    {
          id: "grep",
          goal: "Find lines mentioning NEWKEYS.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"newkeys\"' --follow-log auth.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"newkeys\"' --follow-log auth.log" }],
          narration:
            "Telemetry for handshake truncation barely existed pre-2024, expect false negatives in old logs.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/terrapin_handshake_truncation_note.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/terrapin_handshake_truncation_note.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "CVE-2023-48795, referred to in public materials as the Terrapin attack, is a vulnerability in the SSH protocol related to handshake handling that, in conjunction with certain cryptographic modes and a man-in-the-middle attacker, could enable protocol downgrades or weakening of SSH security guarantees. Fixes were released by OpenSSH and other vendors in late 2023, alongside protocol extension work (e.g. strict key exchange mitigations). Exploitation requires an active network adversary positioned between client and server.",
    lesson:
      "SSH is still a channel security protocol, not magic, patch clients *and* servers, pin known-good host keys, prefer VPN/zero-trust overlays on hostile networks, and teach developers that `StrictHostKeyChecking accept-new` is a liability on CI runners.",
    simulated: [
      "auth.log lines are synthetic; CVE-2023-48795, Terrapin naming, MitM requirement, and Dec 2023 disclosure are public record.",
    ],
  },
};
