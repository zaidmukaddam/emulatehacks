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
  },
  steps: [
    {
      id: "stub",
      goal: "Read the CVE relationship stub.",
      hint: "`cat SPRING-CVE-stub.txt`.",
      matches: [{ kind: "exact", command: "cat SPRING-CVE-stub.txt" }],
      narration:
        "Name collision with Spring Cloud Function burned a week of analyst time in 2022, read the CVE not the tweet.",
    },
    {
      id: "access",
      goal: "Review the Tomcat access log.",
      hint: "`cat localhost_access.log`.",
      matches: [{ kind: "exact", command: "cat localhost_access.log" }],
      narration:
        "`class.module.classLoader` repeated in query string, that's the fingerprint.",
    },
    {
      id: "grep-pattern",
      goal: "Isolate exploitation attempts.",
      hint: "`grep -nF class.module.classLoader localhost_access.log`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF class.module.classLoader localhost_access.log",
        },
      ],
      narration:
        "WAF vendors shipped emergency signatures; patch still wins long-term.",
    },
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
