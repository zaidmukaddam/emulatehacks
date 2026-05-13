import type { Scenario } from "../types";

/** Citrix Bleed, NetScaler ADC/Gateway buffer over-read CVE-2023-4966. Oct 2023. */
export const citrixBleed: Scenario = {
  slug: "citrix-bleed-token",
  exhibit: "EXH-025",
  title: "31 Bytes Too Many",
  tagline:
    "October 2023. A memory read goes past the end of a header buffer on NetScaler ADC and Gateway before patch 14.1–12.1. Session tokens leak to strangers.",
  category: "modern-cloud",
  difficulty: "advanced",
  era: "2020s",
  year: "2023",
  estMinutes: 9,
  fictional: true,
  cwd: "/adc/citrix-tabletop",
  user: "netsec",
  host: "edge-monitor",
  role: "NetSec engineer validating vendor release notes against your sanitised HTTP event log.",
  objective:
    "Identify repeated unexpected `GET /oauth/idp/.well-known/openid-configuration` bursts that public IR tied to mass session abuse.",
  briefing:
    "No VPX here. You are proving log literacy for an emergency maintenance window tonight.",
  env: { USER: "netsec", SHELL: "/bin/sh", PWD: "/adc/citrix-tabletop" },
  ps: ["  PID TTY TIME CMD", "  9 ?   0:00 sh"],
  history: [],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input CVE-2023-4966-stub.txt": "simulated safe tool replay for citrix-bleed-token; replaces: cat CVE-2023-4966-stub.txt\n",
    "tshark -r evidence.pcap --follow-log http_errors.log": "simulated safe tool replay for citrix-bleed-token; replaces: cat http_errors.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"openid-configuration\"' --follow-log http_errors.log": "simulated safe tool replay for citrix-bleed-token; replaces: grep -nF openid-configuration http_errors.log\n",
    "curl -sk https://citrix.edge/oauth/idp/.well-known/openid-configuration":
      '{"issuer":"https://citrix.edge/oauth/idp","authorization_endpoint":"https://citrix.edge/oauth/authorize"}\n(simulated OIDC metadata; public IR correlated bursts with token abuse)\n',
  },
  files: {
    "/adc/citrix-tabletop/CVE-2023-4966-stub.txt": {
      content: [
        "CVE-2023-4966 / CVE-2023-4967, Citrix NetScaler ADC & Gateway",
        "Sensitive information disclosure via buffer over-read (CitrixBleed)",
        "Attackers harvest session tokens → bypass MFA for valid SSO sessions",
        "Vendor patch cadence: upgrade to fixed builds; force terminate all sessions after patch",
        "Mass exploitation observed Oct 2023; Mandiant/CISA released guidance",
      ].join("\n"),
    },
    "/adc/citrix-tabletop/http_errors.log": {
      content: [
        '2023-10-19T09:12:01Z 203.0.113.20 "GET /oauth/idp/.well-known/openid-configuration" 200 cookie="NSC_AAAC=\\xe3\\x9a\\xff..." len=431',
        "2023-10-19T09:12:01Z 203.0.113.20 duplicate_session_id replay BLOCKED internal=-",
        "2023-10-19T09:14:44Z 198.51.100.7 \"GET /logon/LogonPoint/index.html\" 200 -",
        '2023-10-19T09:15:02Z 203.0.113.20 "GET /oauth/idp/.well-known/openid-configuration" 200 cookie="NSC_AAAC=\\xe3\\x9a\\xff..." len=431',
      ].join("\n"),
    },
    // CVE-2023-4966 header over-read / session token leak pattern (public scanner logic, stubbed).
    "/adc/citrix-tabletop/public-poc/cve_2023_4966_leak_probe_stub.py": {
      content: [
        "#!/usr/bin/env python3",
        '"""',
        "CitrixBleed (CVE-2023-4966) returned bytes past the proper header boundary; defenders grepped for",
        "NetScaler cookie markers (NSC_*) in suspicious responses. Museum stub only.",
        '"""',
        "",
        "LEAK_MARKERS = (b'NSC_AAAC', b'NSC_USER', b'NSC_TMAS')",
        "",
        "",
        "# def looks_like_token_leak(body: bytes) -> bool:",
        "#     return any(marker in body[:8192] for marker in LEAK_MARKERS)",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-oidc",
          goal: "Fetch OIDC metadata over TLS with curl -k (simulated JSON).",
          hint: "`curl -sk https://citrix.edge/oauth/idp/.well-known/openid-configuration`.",
          matches: [
            {
              kind: "exact",
              command: "curl -sk https://citrix.edge/oauth/idp/.well-known/openid-configuration",
            },
          ],
          narration:
            "Not SQLi, pure memory disclosure. Your WAF will not save you; patch + mass session kill will.",
        },
    {
          id: "cve",
          goal: "Read the CitrixBleed summary stub.",
          hint: "`python3 ir_toolkit.py parse-artifact --input CVE-2023-4966-stub.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input CVE-2023-4966-stub.txt" }],
          narration:
            "Session tokens are bearer secrets; disclosure bugs turn MFA into theatre.",
        },
    {
          id: "slice",
          goal: "Read the HTTP error / debug log slice.",
          hint: "`tshark -r evidence.pcap --follow-log http_errors.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log http_errors.log" }],
          narration:
            "Same source IP hammering OIDC metadata, staging for token harvest scripts.",
        },
    {
          id: "grep",
          goal: "Surface lines about openid-configuration.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"openid-configuration\"' --follow-log http_errors.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"openid-configuration\"' --follow-log http_errors.log" }],
          narration:
            "IOCs move faster than CVSS scores, watch for behavioural patterns, not only file hashes.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/cve_2023_4966_leak_probe_stub.py`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/cve_2023_4966_leak_probe_stub.py" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "CVE-2023-4966 (nicknamed CitrixBleed in public reporting) is a sensitive information disclosure vulnerability in Citrix NetScaler ADC and NetScaler Gateway due to a buffer over-read. Successful exploitation could allow attackers to capture authentication session data, potentially enabling session hijacking including in environments using multifactor authentication. Citrix released patches and urged customers to terminate active sessions after upgrading. Widespread exploitation was reported in late 2023.",
    lesson:
      "Session tokens are bearer secrets, treat them like passwords in TTL, storage, and revocation. After edge appliance RCE/disclosure bugs, rotate SAML keys, kill all gateway sessions globally, and hunt for impossible VPN geography. If your NetScaler is Internet-facing, subscribe to vendor CERT-style mailing lists, not only quarterly vendor QBRs.",
    simulated: [
      "Cookie bytes are fictional; CVE-2023-4966, CitrixBleed nickname, Oct 2023 exploitation wave, and session hijack mechanism are public record.",
    ],
  },
};
