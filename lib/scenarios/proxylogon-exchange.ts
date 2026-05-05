import type { Scenario } from "../types";

/** ProxyLogon, Microsoft Exchange Server SSRF + chain, HAFNIUM campaign, Mar 2021. CVE-2021-26855 et al. */
export const proxylogonExchange: Scenario = {
  slug: "proxylogon-exchange",
  exhibit: "EXH-018",
  title: "Autodiscover Depth",
  tagline:
    "March 2021. Microsoft discloses four Exchange zero-days actively exploited in the wild. The first stone in the chain is an unauthenticated SSRF against `/owa/auth/` paths.",
  category: "modern-cloud",
  difficulty: "advanced",
  era: "2020s",
  year: "2021",
  estMinutes: 10,
  fictional: true,
  cwd: "/forensics/exchange-proxylogon-drill",
  user: "hunter",
  host: "edr-siem-bridge",
  role: "Threat hunter validating IIS logs against Microsoft's March emergency guidance.",
  objective:
    "Locate the suspicious Cookie / path combination Microsoft public write-ups associated with CVE-2021-26855 reconnaissance.",
  briefing:
    "This terminal contains fictional IPs and shortened paths. The vulnerability chain and CVE identifiers are real. No Exchange DLLs execute here.",
  env: { USER: "hunter", SHELL: "/bin/sh", PWD: "/forensics/exchange-proxylogon-drill" },
  ps: ["  PID TTY TIME CMD", "  301 ?   0:02 splunkd"],
  history: [],
  files: {
    "/forensics/exchange-proxylogon-drill/MS-MAR-2021-proxy.txt": {
      content: [
        "Microsoft Exchange Server, Mar 2 2021 out-of-band patches",
        "CVE-2021-26855, SSRF in Exchange HTTP",
        "CVE-2021-26857/58/65, post-auth RCE / arbitrary file write chain elements",
        "Threat actors (later attributed) used SSRF to reach Exchange backend and drop webshells",
        "Defender action: patch externally reachable Exchange *now*; hunt for ASPX in odd paths",
      ].join("\n"),
    },
    "/forensics/exchange-proxylogon-drill/W3SVC-excerpt.log": {
      content: [
        '2021-03-01 02:18:11 203.0.113.9 POST /owa/auth/Current/themes/resources/logon.css - 443 - 198.51.100.7 Mozilla/5.0 - 200 0 0 41',
        '2021-03-01 02:18:12 203.0.113.9 POST /ecp/DDI/DDIService.svc/GetList - 443 - 198.51.100.7 Mozilla/5.0 - 200 0 0 412',
        '2021-03-01 02:19:44 203.0.113.9 GET /owa/auth/frowny.aspx - 443 - 198.51.100.7 - 404 0 0 12',
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "brief",
      goal: "Read the Microsoft-era summary stub.",
      hint: "`cat MS-MAR-2021-proxy.txt`.",
      matches: [{ kind: "exact", command: "cat MS-MAR-2021-proxy.txt" }],
      narration:
        "Four CVEs dropped as a set, the defender wins only if patching beats coinfall.",
    },
    {
      id: "slice",
      goal: "Read the IIS excerpt.",
      hint: "`cat W3SVC-excerpt.log`.",
      matches: [{ kind: "exact", command: "cat W3SVC-excerpt.log" }],
      narration:
        "Weird posts into `/owa/auth/` static themes, classic SSRF staging in public IR timelines.",
    },
    {
      id: "grep-owa",
      goal: "Filter for OWA auth traffic from the suspicious netblock.",
      hint: "`grep -nF '/owa/' W3SVC-excerpt.log`.",
      matches: [{ kind: "exact", command: "grep -nF '/owa/' W3SVC-excerpt.log" }],
      narration:
        "Two POSTs in two seconds, automated chain, not a distracted human.",
    },
  ],
  debrief: {
    summary:
      "In March 2021 Microsoft released emergency updates for Microsoft Exchange Server to address multiple vulnerabilities including CVE-2021-26855 (a server-side request forgery) and related issues that could enable remote code execution and persistent access when chained. The vulnerabilities were actively exploited by threat actors, leading to widespread incident response across organisations running on-premises Exchange exposed to the Internet.",
    lesson:
      "On-premises mail remains a crown jewel: it houses credentials, executive comms, and MFA resets attackers crave. If you still run Exchange without a managed patch SLA and egress-restricted ECP, you're gambling against nation-states *and* commodity ransomware affiliates. Prefer cloud-hosted mail or isolate Exchange behind dedicated WAF + VPN with aggressive log review.",
    simulated: [
      "Log fields shortened; CVE numbers, March 2021 emergency patch narrative, and exploitation chain concepts are public record.",
    ],
  },
};
