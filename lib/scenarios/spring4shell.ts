import type { Scenario } from "../types";

/** Spring4Shell, Spring Framework RCE CVE-2022-22965 / CVE-2022-22963. Mar-Apr 2022. */
export const spring4shell: Scenario = {
  slug: "spring4shell-core",
  exhibit: "EXH-021",
  title: "class.module.classLoader",
  tagline:
    "March 2022. A bad commit from 2010 meets Spring MVC on Tomcat 9 + JDK 9+. Query parameters become write primitives under the right classpath layout.",
  category: "modern-cloud",
  difficulty: "advanced",
  era: "2020s",
  year: "2022",
  estMinutes: 9,
  fictional: true,
  cwd: "/tomcat/spring4shell-lab",
  user: "appsec",
  host: "tomcat-sandbox",
  role: "AppSec engineer validating WAF logs the week CVE-2022-22965 went CVSS 9.8.",
  objective:
    "Identify the tell-tale query-parameter gadgetry in an access log without running a PoC.",
  briefing:
    "Spring Shell in this museum is read-only text. Real exploits bind Tomcat listeners, you are documenting artefacts.",
  env: { USER: "appsec", SHELL: "/bin/sh", PWD: "/tomcat/spring4shell-lab" },
  ps: ["  PID TTY TIME CMD", "  901 ?   0:44 java"],
  history: [],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input SPRING-CVE-stub.txt": "simulated safe tool replay for spring4shell-core; replaces: cat SPRING-CVE-stub.txt\n",
    "tshark -r evidence.pcap --follow-log localhost_access.log": "simulated safe tool replay for spring4shell-core; replaces: cat localhost_access.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"ioc\"' --follow-log localhost_access.log": "simulated safe tool replay for spring4shell-core; replaces: grep -nF class.module.classLoader localhost_access.log\n",
    "curl -sG http://127.0.0.1/app/exploit --data-urlencode 'class.module.classLoader.resources.context.parent.pipeline.first.pattern=test'":
      "HTTP/1.1 500 Internal Server Error\nContent-Length: 5121\n(simulated: Spring MVC data-binding gadget chain)\n",
  },
  files: {
    "/tomcat/spring4shell-lab/SPRING-CVE-stub.txt": {
      content: [
        "CVE-2022-22965, Spring4Shell (Spring Framework)",
        "Data binding issue on Java Beans with certain classpath layouts (Tomcat WAR deployment pattern)",
        "Attacker crafts query params like class.module.classLoader.resources.context...",
        "Distinct from CVE-2022-22963 (Spring Cloud Function SpEL), media conflated names",
        "Mitigation: Spring Framework 5.3.18+ / 5.2.20+; Tomcat workarounds for older stacks",
      ].join("\n"),
    },
    "/tomcat/spring4shell-lab/localhost_access.log": {
      content: [
        '0:0:0:0:0:0:0:1 - - [31/Mar/2022:14:02:01 +0000] "GET /shell.jsp HTTP/1.1" 404 782',
        '203.0.113.55 - - [31/Mar/2022:14:05:22 +0000] "GET /app/exploit?name=1&class.module.classLoader.resources.context.parent.pipeline.first.pattern=%25%7Bc2%7Di&class.module.classLoader.resources.context.parent.pipeline.first.suffix=.jsp HTTP/1.1" 500 5121',
        '198.51.100.3 - - [31/Mar/2022:14:06:00 +0000] "GET /app/health HTTP/1.1" 200 44',
      ].join("\n"),
    },
    // CVE-2022-22965 gadget query pattern as published in Spring / vendor analyses (Tomcat access log refit).
    "/tomcat/spring4shell-lab/public-poc/spring4shell_query_replay.sh": {
      content: [
        "#!/bin/sh",
        '# CVE-2022-22965  Spring Framework RCE via class binding (conditions: JDK9+, WAR on Tomcat in public PoCs).',
        "# Example GET query shape (values vary; pattern is the chained class.module.classLoader properties):",
        'exec curl -s -G "http://127.0.0.1:8080/example" \\',
        '  --data-urlencode "class.module.classLoader.resources.context.parent.pipeline.first.pattern=%25%7Bc2%7Di" \\',
        '  --data-urlencode "class.module.classLoader.resources.context.parent.pipeline.first.suffix=.jsp"',
        "",
        "# Vendor fix: Spring Framework 5.3.18 / 5.2.20.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-gadget",
          goal: "Replay a canned GET that carries the class.module.classLoader gadget in the query string.",
          hint: "`curl -sG http://127.0.0.1/app/exploit --data-urlencode 'class.module.classLoader.resources.context.parent.pipeline.first.pattern=test'`.",
          matches: [
            {
              kind: "exact",
              command:
                "curl -sG http://127.0.0.1/app/exploit --data-urlencode 'class.module.classLoader.resources.context.parent.pipeline.first.pattern=test'",
            },
          ],
          narration:
            "Spring Shell in this museum is read-only text. Real exploits bind Tomcat listeners, you are documenting artefacts.",
        },
    {
          id: "stub",
          goal: "Read the CVE relationship stub.",
          hint: "`python3 ir_toolkit.py parse-artifact --input SPRING-CVE-stub.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input SPRING-CVE-stub.txt" }],
          narration:
            "Name collision with Spring Cloud Function burned a week of analyst time in 2022, read the CVE not the tweet.",
        },
    {
          id: "access",
          goal: "Review the Tomcat access log.",
          hint: "`tshark -r evidence.pcap --follow-log localhost_access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log localhost_access.log" }],
          narration:
            "`class.module.classLoader` repeated in query string, that's the fingerprint.",
        },
    {
          id: "grep-pattern",
          goal: "Isolate exploitation attempts.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"ioc\"' --follow-log localhost_access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"ioc\"' --follow-log localhost_access.log" }],
          narration:
            "WAF vendors shipped emergency signatures; patch still wins long-term.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/spring4shell_query_replay.sh`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/spring4shell_query_replay.sh" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "CVE-2022-22965 (sometimes nicknamed Spring4Shell) is a critical remote code execution vulnerability affecting certain configurations of Spring Framework applications on Java Development Kit versions 9 and later, commonly discussed in the context of Spring MVC applications deployed to Apache Tomcat as a WAR. It involved unsafe data binding via crafted request parameters. A separate Spring issue, CVE-2022-22963, affected Spring Cloud Function; early public discussion sometimes mixed the two. Patches were released in Spring Framework 5.3.18/5.2.20 in March–April 2022.",
    lesson:
      "Framework RCEs demand dependency SBOMs + continuous image scanning, not annual pen-tests. If your Fat JAR still pins Spring 5.2 because 'it works', you are one deserialisation bug away from shell. Align language runtime upgrades with JDK LTS cadence; block `GET` query parsing on sensitive controllers at the edge where possible.",
    simulated: [
      "Log query parameters truncated for readability; CVE identifiers and Spring/Tomcat relationship are public record.",
    ],
  },
};
