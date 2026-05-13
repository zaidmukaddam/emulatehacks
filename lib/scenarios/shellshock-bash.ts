import type { Scenario } from "../types";

export const shellshockBash: Scenario = {
  slug: "shellshock-bash",
  exhibit: "EXH-012",
  title: "Envoi",
  tagline:
    "September 24, 2014. Someone realises you can stash arbitrary bash commands in HTTP headers and have them executed by CGI scripts. Half the web runs bash as `/bin/sh`.",
  category: "classic-history",
  difficulty: "intermediate",
  era: "2010s",
  year: "2014",
  estMinutes: 9,
  fictional: true,
  cwd: "/var/log/www-legacy",
  user: "responder",
  host: "apache-bridge",
  role: "On-call engineer triaging a botnet's sweep through your leftover CGI directory.",
  objective:
    "Recognise the CVE-2014-6271 pattern in access logs and tie it to bash parsing function exports.",
  briefing:
    "Apache still has `/cgi-bin/` turned on for some PHP-era apps. Attackers probe with crafted `User-Agent`/`Cookie` strings that start with `() { :; };`. Your job is log forensics only.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/var/log/www-legacy" },
  ps: ["  PID TTY TIME CMD", "  301 ?   0:02 httpd", "  400 tty1 0:00 bash"],
  history: ["cd /var/log/www-legacy"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input CVE-2014-6271.txt": "simulated safe tool replay for shellshock-bash; replaces: cat CVE-2014-6271.txt\n",
    "tshark -r evidence.pcap --follow-log access.log": "simulated safe tool replay for shellshock-bash; replaces: cat access.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"step\"' --follow-log access.log": "simulated safe tool replay for shellshock-bash; replaces: grep -nF '() {' access.log\n",
    "curl -s -A '() { :; }; echo SHELLSHOCK_PROBE' http://127.0.0.1/cgi-bin/status.sh":
      "SHELLSHOCK_PROBE\nuname=Linux apache-bridge 3.13.0 #1 (simulated CGI bash fork)\n",
  },
  files: {
    "/var/log/www-legacy/access.log": {
      content: [
        '192.0.2.12 - - [24/Sep/2014:06:11:02 +0000] "GET /cgi-bin/status.sh HTTP/1.1" 200 48 "-" "() { ignored; }; echo; /bin/uname -a"',
        '192.0.2.12 - - [24/Sep/2014:06:11:03 +0000] "GET /cgi-bin/test-cgi HTTP/1.1" 404 209 "-" "() { :; }; /bin/cat /etc/passwd"',
        '198.51.100.7 - - [24/Sep/2014:09:40:18 +0000] "GET / HTTP/1.1" 200 384 "-" "curl/7.35.0"',
      ].join("\n"),
    },
    "/var/log/www-legacy/CVE-2014-6271.txt": {
      content: [
        "CVE-2014-6271 / CVE-2014-7169, GNU Bash environment variable handling",
        "",
        "Nickname: Shellshock",
        "Issue: bash exports function definitions into env vars; trailing",
        "       commands after the function definition are executed when bash",
        "       spawns child shells, e.g. CGI forks bash to run scripts",
        "",
        "Exploit pattern in logs:",
        "  () { :; }; <command>",
        "",
        "Fix: patch bash; disable unnecessary CGI; migrate to safer /bin/sh",
        "     that does not fork bash for every request",
      ].join("\n"),
    },
    // Public triage one-liner circulated with the Sep 2014 disclosure (oss-sec).
    "/var/log/www-legacy/public-poc/shellshock_env_probe.sh": {
      content: [
        "#!/bin/sh",
        '# CVE-2014-6271 local check: if "vulnerable" prints, bash parsed trailing code after exporting a function.',
        "env 'x=() { :;}; echo vulnerable' bash -c \"echo this is a test\"",
        "",
        "# Remote shape (CGI): user input becomes env. Example header used in many write-ups:",
        "#   User-Agent: () { :; }; /bin/id",
        "",
        "# Metasploit apache_mod_cgi Bash RCE module (Metasploit Framework) documents the same CGI header channel.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-probe",
          goal: "Replay a safe curl probe that sends a classic Shellshock User-Agent to CGI.",
          hint: "`curl -s -A '() { :; }; echo SHELLSHOCK_PROBE' http://127.0.0.1/cgi-bin/status.sh`.",
          matches: [
            {
              kind: "exact",
              command:
                "curl -s -A '() { :; }; echo SHELLSHOCK_PROBE' http://127.0.0.1/cgi-bin/status.sh",
            },
          ],
          narration:
            "If bash is behind CGI, the function-injection prefix can execute during the forked handler. This lab output is canned, not a live exploit against you.",
        },
    {
          id: "cve",
          goal: "Read the CVE note.",
          hint: "`python3 ir_toolkit.py parse-artifact --input CVE-2014-6271.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input CVE-2014-6271.txt" }],
          narration:
            "Environment variables are not data, they are code under bash. CGI maps remote HTTP fields into that environment.",
        },
    {
          id: "access",
          goal: "Read the access log slice.",
          hint: "`tshark -r evidence.pcap --follow-log access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log access.log" }],
          narration:
            "Two probing IPs; one clean curl. The malicious lines show classic function-injection grammar in the User-Agent field.",
        },
    {
          id: "grep-paren",
          goal: "Search for the shellshock prefix in the User-Agent column.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"step\"' --follow-log access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"step\"' --follow-log access.log" }],
          narration:
            "Every `() {` hit is a shellshock probe. Rotate keys if any CGI ran as a user with privileges; assume lateral movement if the same source hit multiple vhosts.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/shellshock_env_probe.sh`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/shellshock_env_probe.sh" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "Shellshock referred to critical vulnerabilities in GNU Bash (CVE-2014-6271 and related CVEs including CVE-2014-7169) disclosed in September 2014. Bash could be tricked into executing arbitrary commands passed in environment variables when it spawned child processes, a behaviour widely exposed on the web where CGI scripts invoked Bash with attacker-controlled HTTP headers. Mass scanning began within hours of disclosure.",
    lesson:
      "Never treat environment variables as untrusted text, especially in setuid programs and network-facing script handlers. Default `/bin/sh` on many systems is dash specifically to avoid this class of parsing; know what your web stack actually execve()s per request.",
    simulated: [
      "IPs and paths are invented; exploit strings are illustrative, not weaponised.",
    ],
  },
};
