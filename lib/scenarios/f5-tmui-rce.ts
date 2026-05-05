import type { Scenario } from "../types";

/** F5 BIG-IP TMUI, CVE-2020-5902. Remote code execution via TMUI /mgmt tmsh escape. July 2020. */
export const f5TmuiRce: Scenario = {
  slug: "f5-bigip-tmui",
  exhibit: "EXH-017",
  title: "tmsh Exit Code 0",
  tagline:
    "July 2020. CVE-2020-5902 drops: unauthenticated attackers can run arbitrary commands through the Traffic Management User Interface. Your SOC ships a block rule at 03:00 local, already late.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2020",
  estMinutes: 8,
  fictional: true,
  cwd: "/var/log/f5-tabletop",
  user: "soc",
  host: "dmz-monitor",
  role: "SOC analyst replaying vendor IOC guidance after missing the first twelve hours of scanning.",
  objective:
    "Correlate the advisory snippet with suspicious requests in a stub access log.",
  briefing:
    "No BIG-IP binary lives here, only text proxies. Prove you can spot path-normalisation tricks public write-ups called out.",
  env: { USER: "soc", SHELL: "/bin/sh", PWD: "/var/log/f5-tabletop" },
  ps: ["  PID TTY TIME CMD", "  440 ?   0:01 rsyslogd"],
  history: [],
  files: {
    "/var/log/f5-tabletop/K03009927-summary.txt": {
      content: [
        "F5 K03009927 / CVE-2020-5902 (Jul 2020)",
        "CVSS 10.0, unauthenticated RCE on BIG-IP management / configuration utility",
        "Affected: BIG-IP 11.x–16.x with TMUI enabled on mgmt plane",
        "Mitigation: restrict mgmt to admin VLAN; patch under emergency banner; ICX/self-IP exposure = game over",
        "Attack surface: crafted HTTP to /tmui/login.jsp and related endpoints; directory traversal semantics in some PoCs",
      ].join("\n"),
    },
    "/var/log/f5-tabletop/bad-actors.log": {
      content: [
        '203.0.113.44 - - [04/Jul/2020:02:41:09 +0000] "GET /tmui/login.jsp/..;/tmui/locallb/workspace/tmshCmd.jsp?command=list+auth+user+admin HTTP/1.1" 200 733 "-" "Mozilla/5.0 Scanner"',
        '198.51.100.2 - - [04/Jul/2020:03:05:11 +0000] "GET /tmui/Control/form HTTP/1.1" 302 - "-" "curl/7.68"',
        '192.0.2.201 - - [04/Jul/2020:08:55:00 +0000] "GET / HTTP/1.1" 200 812 "-" "uptime-kuma"',
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "read-kb",
      goal: "Read the K03009927 summary stub.",
      hint: "`cat K03009927-summary.txt`.",
      matches: [{ kind: "exact", command: "cat K03009927-summary.txt" }],
      narration:
        "Management planes are applications, they need CVE SLAs tighter than customer traffic.",
    },
    {
      id: "access",
      goal: "Review the synthetic access log.",
      hint: "`cat bad-actors.log`.",
      matches: [{ kind: "exact", command: "cat bad-actors.log" }],
      narration:
        "`..;` path smuggling into `tmshCmd.jsp`, canonicalisation bugs love semicolons.",
    },
    {
      id: "grep-tmsh",
      goal: "Surface exploitation attempts touching tmsh.",
      hint: "`grep -nF tmshCmd bad-actors.log`.",
      matches: [{ kind: "exact", command: "grep -nF tmshCmd bad-actors.log" }],
      narration:
        "One line is enough to justify an emergency CAB if management is Internet-exposed.",
    },
  ],
  debrief: {
    summary:
      "CVE-2020-5902 was a critical vulnerability in F5 BIG-IP allowing unauthenticated remote attackers to execute arbitrary system commands, root the device, and read/modify configurations via the Traffic Management User Interface (TMUI). F5 published urgent mitigation and patch guidance (K03009927) in July 2020. Because BIG-IP devices are commonly deployed at network edges and handle TLS termination and load balancing, compromises had outsized blast radius.",
    lesson:
      "If your load balancer's admin UI has a routable public IP, you are one PHP/JSP bug away from full network compromise. Treat ADC management like vault infrastructure: jump hosts, MFA, zero public listeners, automated firmware SLOs. Incident runbooks should include 'snapshot configs and rotate keys' for edge appliances, not just Linux hosts.",
    simulated: [
      "IP addresses are synthetic; CVE-2020-5902, K03009927, TMUI semantics, and July 2020 disclosure are real.",
    ],
  },
};
