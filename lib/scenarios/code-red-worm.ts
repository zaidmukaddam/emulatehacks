import type { Scenario } from "../types";

/** Code Red / Code Red II, July 2001. IIS indexing worm; buffer overflow in .ida handler. */
export const codeRedWorm: Scenario = {
  slug: "code-red-iis",
  exhibit: "EXH-006",
  title: ".ida",
  tagline:
    "July 2001. IIS 4 and 5 answer a malformed GET to /.ida with a buffer overflow. Within hours the worm is scanning random IPv4 space for TCP 80.",
  category: "classic-history",
  difficulty: "intermediate",
  era: "2000s",
  year: "2001",
  estMinutes: 8,
  fictional: true,
  cwd: "/var/log/iis-reconstruction",
  user: "responder",
  host: "win-legacy-log",
  role: "Contractor triaging a Fortune-500 extranet the week Code Red made the cover of every trade paper.",
  objective:
    "Prove from logs and a stub advisory that the probe traffic matches the .ida overflow pattern, not generic scanning.",
  briefing:
    "You have anonymised IIS W3SVC logs from the first overnight after disclosure. Look for the tell-tale path fragment, the worm probed `GET /default.ida` with an oversized query string.",
  env: { USER: "responder", SHELL: "/bin/sh", PWD: "/var/log/iis-reconstruction" },
  ps: ["  PID TTY TIME CMD", "  301 ?   0:01 sh"],
  history: ["ls"],
  files: {
    "/var/log/iis-reconstruction/MS01-033-summary.txt": {
      content: [
        "Microsoft Security Bulletin MS01-033 (Jul 2001)",
        "CVE-2001-0500, IIS buffer overrun in Index Server / ISAPI",
        "Unauthenticated remote code execution via crafted IDQ/IDA URL",
        "Worm note: 'Code Red' mass-probes port 80, leaves 'HELLO' defacements on some 9.x IIS installs",
        "Patch: urlscan + service pack; disable .ida mapping if unused",
      ].join("\n"),
    },
    "/var/log/iis-reconstruction/extranet-w3svc.log": {
      content: [
        "2001-07-19 18:02:11 203.0.113.44 GET /default.idaNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN 404",
        "2001-07-19 18:02:14 203.0.113.44 GET /scripts/root.exe 404 -",
        "2001-07-19 18:05:02 198.51.100.9 GET /default.idaNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN 404",
        "2001-07-19 18:12:33 192.0.2.201 GET /index.html 200 -",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "bulletin",
      goal: "Read the MS01-033 reconstruction summary.",
      hint: "`cat MS01-033-summary.txt`.",
      matches: [{ kind: "exact", command: "cat MS01-033-summary.txt" }],
      narration:
        "IDA/IDQ ISAPI, the same surface area URL-scanning would later neuter on hardened IIS farms.",
    },
    {
      id: "access",
      goal: "Read the extranet access log slice.",
      hint: "`cat extranet-w3svc.log`.",
      matches: [{ kind: "exact", command: "cat extranet-w3svc.log" }],
      narration:
        "Repeating `default.ida` probes with absurd padding, classic overflow grooming. The second line often probed cmd backdoors left by earlier worms.",
    },
    {
      id: "grep-ida",
      goal: "Count lines that touch the vulnerable path.",
      hint: "`grep -nF default.ida extranet-w3svc.log`.",
      matches: [{ kind: "exact", command: "grep -nF default.ida extranet-w3svc.log" }],
      narration:
        "Two distinct sources in minutes. That's not a targeted pen-test, that's internet background radiation once exploit code ships.",
    },
  ],
  debrief: {
    summary:
      "Code Red was a computer worm observed in July 2001 that exploited a buffer overflow in Microsoft IIS Internet Indexing Service (Indexing Service / ISAPI), commonly associated with crafted requests to `.ida` or `.idq` URLs. Infected systems could be used to scan for other vulnerable hosts and, on some configurations, deface web pages. Microsoft published fixes via security bulletins including MS01-033.",
    lesson:
      "Patch latency beats attribution. A worm that picks random IPv4 /24s does not care about your industry, only whether TCP/80 still runs unpatched IIS with dangerous ISAPI mappings. Today the analogue is exposed admin panels and one-click RCE chains on edge appliances; the response pattern is the same: deny by default, patch under SLA hours not weeks.",
    simulated: [
      "IPs and hostnames are invented; CVE-2001-0500, MS01-033, Code Red timeframe, and .ida probing behaviour are public record.",
    ],
  },
};
