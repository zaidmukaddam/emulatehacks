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
  commands: {
    "python3 ir_toolkit.py parse-artifact --input CVE-2017-5638.txt": "simulated safe tool replay for equifax-struts-cve; replaces: cat CVE-2017-5638.txt\n",
    "tshark -r evidence.pcap --follow-log haproxy-edge.log": "simulated safe tool replay for equifax-struts-cve; replaces: cat haproxy-edge.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"ognl\"' --follow-log haproxy-edge.log": "simulated safe tool replay for equifax-struts-cve; replaces: grep -nF ognl haproxy-edge.log\n",
    "curl -s -o /dev/null -w '%{http_code}' -H 'Content-Type: %{(#_multipart)?}' http://127.0.0.1/customerportal/oauth/authorize":
      "200\n(simulated: edge returns 200 while Struts OGNL is still evaluated server-side in vulnerable builds)\n",
  },
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
    // Apache Struts S2-045 / CVE-2017-5638 Content-Type OGNL prefix (public exploits used long single-line headers).
    "/reconstruction/equifax-shape/public-poc/S2-045_Content-Type_prefix.txt": {
      content: [
        "CVE-2017-5638  minimal Content-Type prefix reproduced in many defensive write-ups (payloads often extend this):",
        "",
        "Content-Type: %{(#_='multipart/form-data').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS)",
        ".(#_memberAccess?(#_memberAccess=#dm):",
        "((#container=#context['com.opensymphony.xwork2.ActionContext.container']).(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear()).(#context.setMemberAccess(#dm))))}",
        "",
        "# ... attacker appends method calls to evaluate OGNL to RCE ...",
        "",
        "# curl repro shape (tabletop): malformed Content-Type on POST to Struts action.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-ognl",
          goal: "Replay a minimal curl that carries a malformed Struts-style Content-Type header.",
          hint: "`curl -s -o /dev/null -w '%{http_code}' -H 'Content-Type: %{(#_multipart)?}' http://127.0.0.1/customerportal/oauth/authorize`.",
          matches: [
            {
              kind: "exact",
              command:
                "curl -s -o /dev/null -w '%{http_code}' -H 'Content-Type: %{(#_multipart)?}' http://127.0.0.1/customerportal/oauth/authorize",
            },
          ],
          narration:
            "Synthetic curl shows how one malformed header still crosses the edge in tabletop replay.",
        },
    {
          id: "cve",
          goal: "Read the CVE summary.",
          hint: "`python3 ir_toolkit.py parse-artifact --input CVE-2017-5638.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input CVE-2017-5638.txt" }],
          narration:
            "OGNL in Content-Type, the kind of bug that fits in one HTTP header. Names, PCI zones, and PII are fake. The `%{(…)}` OGNL gadget grammar and the CVE number are real. Your job is log literacy, not exploitation.",
        },
    {
          id: "log",
          goal: "Read the edge log excerpt.",
          hint: "`tshark -r evidence.pcap --follow-log haproxy-edge.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log haproxy-edge.log" }],
          narration:
            "Your WAF might have logged it as `INVALID_CT`, only post-hoc review found the OGNL.",
        },
    {
          id: "grep-ognl",
          goal: "Pull the attacker line with OGNL context.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"ognl\"' --follow-log haproxy-edge.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"ognl\"' --follow-log haproxy-edge.log" }],
          narration:
            "Patch availability without inventory equals breach inevitability.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/S2-045_Content-Type_prefix.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/S2-045_Content-Type_prefix.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
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
