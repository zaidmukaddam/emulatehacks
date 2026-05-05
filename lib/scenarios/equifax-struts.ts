import type { Scenario } from "../types";

/** Equifax breach, Apache Struts CVE-2017-5638 (Content-Type RCE), disclosed / exploited 2017. */
export const equifaxStruts: Scenario = {
  slug: "equifax-struts-cve",
  exhibit: "EXH-015",
  title: "Content-Type",
  tagline:
    "September 2017. Equifax announces 147 million consumer records exposed. The ingress was a patched-but-unapplied Struts bug, and nine digits of consequence.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2010s",
  year: "2017",
  estMinutes: 10,
  fictional: true,
  cwd: "/reconstruction/equifax-shape",
  user: "ir",
  host: "retro-struts",
  role: "IR lead in a tabletop based on the public Congressional report, proving the exploit string lived in logs.",
  objective:
    "Identify the malformed Content-Type associated with CVE-2017-5638 in a synthetic reverse-proxy log.",
  briefing:
    "Names, PCI zones, and PII are fake. The `%{(…)}` OGNL gadget grammar and the CVE number are real. Your job is log literacy, not exploitation.",
  env: { USER: "ir", SHELL: "/bin/sh", PWD: "/reconstruction/equifax-shape" },
  ps: ["  PID TTY TIME CMD", "  501 ?   0:02 java"],
  history: [],
  files: {
    "/reconstruction/equifax-shape/CVE-2017-5638.txt": {
      content: [
        "CVE-2017-5638, Apache Struts 2 remote code execution",
        "Issue: Jakarta Multipart parser mishandles Content-Type with OGNL",
        "Public exploit: Content-Type: %{(#_='multipart/form-data').(…)}…",
        "Fixed in Struts 2.3.32 / 2.5.10.1; Equifax cited failure to patch on Internet-facing portal",
        "Lesson: vuln management SLA for Internet edge must be days, not quarters",
      ].join("\n"),
    },
    "/reconstruction/equifax-shape/haproxy-edge.log": {
      content: [
        '192.0.2.88 - [10/Mar/2017:09:14:22] "POST /customerportal/oauth/authorize HTTP/1.1" 200 1820',
        '192.0.2.88 - [10/Mar/2017:09:14:23] req_hdr="Content-Type: %{(#_=?multipart/form-data?).(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS)"',
        '198.51.100.3 - [10/Mar/2017:09:18:01] "GET /customerportal/ HTTP/1.1" 200 9033',
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "cve",
      goal: "Read the CVE summary.",
      hint: "`cat CVE-2017-5638.txt`.",
      matches: [{ kind: "exact", command: "cat CVE-2017-5638.txt" }],
      narration:
        "OGNL in Content-Type, the kind of bug that fits in one HTTP header.",
    },
    {
      id: "log",
      goal: "Read the edge log excerpt.",
      hint: "`cat haproxy-edge.log`.",
      matches: [{ kind: "exact", command: "cat haproxy-edge.log" }],
      narration:
        "Your WAF might have logged it as `INVALID_CT`, only post-hoc review found the OGNL.",
    },
    {
      id: "grep-ognl",
      goal: "Pull the attacker line with OGNL context.",
      hint: "`grep -nF ognl haproxy-edge.log`.",
      matches: [{ kind: "exact", command: "grep -nF ognl haproxy-edge.log" }],
      narration:
        "Patch availability without inventory equals breach inevitability.",
    },
  ],
  debrief: {
    summary:
      "In September 2017 Equifax publicly disclosed a major data breach affecting approximately 147 million U.S. consumers (among other individuals). U.S. government investigations and public reporting attributed the compromise partly to failure to patch a known Apache Struts vulnerability (CVE-2017-5638) on an Internet-facing application, allowing remote code execution via a crafted Content-Type header. The incident became a reference case for vulnerability management and executive accountability.",
    lesson:
      "Edge apps need asset inventory tied to patch tickets, not spreadsheets that rot. Automate 'Struts jar hash on disk' checks in CI; treat framework RCE CVEs as Sev-0 with weekend deploy authority. Equifax paid hundreds of millions in settlements; your organisation pays in trust.",
    simulated: [
      "Log lines are illustrative, not from Equifax; CVE-2017-5638, OGNL mechanism, and breach scale are public record.",
    ],
  },
};
