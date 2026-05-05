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
  },
  steps: [
    {
      id: "cve",
      goal: "Read the CVE note.",
      hint: "`cat CVE-2014-6271.txt`.",
      matches: [{ kind: "exact", command: "cat CVE-2014-6271.txt" }],
      narration:
        "Environment variables are not data, they are code under bash. CGI maps remote HTTP fields into that environment.",
    },
    {
      id: "access",
      goal: "Read the access log slice.",
      hint: "`cat access.log`.",
      matches: [{ kind: "exact", command: "cat access.log" }],
      narration:
        "Two probing IPs; one clean curl. The malicious lines show classic function-injection grammar in the User-Agent field.",
    },
    {
      id: "grep-paren",
      goal: "Search for the shellshock prefix in the User-Agent column.",
      hint: "`grep -nF '() {' access.log` — fixed-string grep is what you want for IOC substrings with metacharacters.",
      matches: [{ kind: "exact", command: "grep -nF '() {' access.log" }],
      narration:
        "Every `() {` hit is a shellshock probe. Rotate keys if any CGI ran as a user with privileges; assume lateral movement if the same source hit multiple vhosts.",
    },
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
