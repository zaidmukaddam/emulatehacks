import type { Scenario } from "../types";

/** Fictional Canvas LMS style edu breach: OAuth / API token abuse, high level only. */
export const canvasLmsCompromise: Scenario = {
  slug: "canvas-lms-compromise",
  exhibit: "EXH-041",
  title: "LMS API Storm",
  tagline:
    "March 21, 2026. State-wide Canvas tenants see burst `/api/v1` traffic copying rubric exports. You correlate developer key logs with a wayward LTI integration.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/sre/canvas-trace",
  user: "responder",
  host: "lti-siem-01",
  role: "SRE for a regional education authority’s learning stack.",
  objective:
    "Prove credential misuse on the Canvas edge: identify the token, follow API export traffic, tie it to an LTI domain failure, then verify revocation.",
  briefing:
    "Canvas is a widely deployed LMS; this scenario does not reproduce any single 2026 vendor incident. Instead it encodes a common failure mode: long-lived API keys paired with an LTI tool domain takeover. Students and faculty data move through those APIs faster than humans can read CSVs.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/sre/canvas-trace" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input tokens/developer-key-51.txt": "simulated safe tool replay for canvas-lms-compromise; replaces: cat tokens/developer-key-51.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"rubrics\"' --follow-log /var/log/canvas/edge-access.log": "simulated safe tool replay for canvas-lms-compromise; replaces: grep -nF rubrics /var/log/canvas/edge-access.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"key-id-51\"' --follow-log api/token-use.log": "simulated safe tool replay for canvas-lms-compromise; replaces: grep -nF key_id=51 api/token-use.log\n",
    "jq . lti/manifest.json": "simulated safe tool replay for canvas-lms-compromise; replaces: cat lti/manifest.json\n",
    "tshark -r evidence.pcap --follow-log containment/revocation.log": "simulated safe tool replay for canvas-lms-compromise; replaces: cat containment/revocation.log\n",
    "python3 ir_toolkit.py count-events --input /var/log/canvas/edge-access.log": "simulated safe tool replay for canvas-lms-compromise; replaces: wc -l /var/log/canvas/edge-access.log\n",
    "curl -sI -H 'Authorization: Bearer canvas_dev_51' https://canvas.edu.example/api/v1/courses/8812/rubrics":
      [
        "HTTP/1.1 200 OK",
        "content-length: 48290301",
        "x-canvas-meta: developer_key_id=51 (simulated)",
      ].join("\n"),
  },
  files: {
    "/home/sre/canvas-trace/tokens/developer-key-51.txt": {
      content: [
        "key_id=51",
        "label=legacy-rubric-import",
        "scopes=rubrics:read,courses:read,submissions:read",
        "lastRotated=2024-03-10",
        "status=active before 2026-03-21T02:31Z",
      ].join("\n"),
    },
    "/var/log/canvas/edge-access.log": {
      content: [
        '203.0.113.99 - - [21/Mar/2026:02:12:01 +0000] "GET /api/v1/courses/8812/rubrics HTTP/1.1" 200 48290301 "-" "python-requests/2.31"',
        '203.0.113.99 - - [21/Mar/2026:02:12:44 +0000] "GET /api/v1/courses/8812/quizzes HTTP/1.1" 200 12004412 "-" "python-requests/2.31"',
        '198.51.100.22 - staff/admin - [21/Mar/2026:02:18:10 +0000] "POST /login/canvas HTTP/1.1" 302 - "-" "Mozilla/5.0"',
      ].join("\n"),
    },
    "/home/sre/canvas-trace/api/token-use.log": {
      content: [
        "2026-03-21T02:12:01Z key_id=51 course=8812 scope=rubrics:read ip=203.0.113.99",
        "2026-03-21T02:12:44Z key_id=51 course=8812 scope=quizzes:read ip=203.0.113.99 denied_scope=true",
        "2026-03-21T02:15:09Z key_id=51 course=8813 scope=submissions:read ip=203.0.113.99",
      ].join("\n"),
    },
    "/home/sre/canvas-trace/lti/manifest.json": {
      content: [
        "{",
        '  "tool": "RubricMirror SaaS",',
        '  "launch": "https://rubric-mirror-cdn.example/lti/launch",',
        '  "notes": "Vendor domain expired 2026-02-28; SOC suspects resolvers pointed to sinkhole then attacker infra"',
        "}",
      ].join("\n"),
    },
    "/home/sre/canvas-trace/containment/revocation.log": {
      content: [
        "2026-03-21T02:31Z revoke_developer_key id=51 success",
        "2026-03-21T02:33Z block_waf ua=python-requests/2.31 temporary success",
        "2026-03-21T02:36Z rotate_lti_secret tool=RubricMirror success",
      ].join("\n"),
    },
    "/home/sre/canvas-trace/public-poc/canvas_api_token_curl_shapes.sh": {
      content: [
        "#!/bin/sh",
        "# Canvas LMS exposes rich REST API; leaked developer keys emulate users at scale.",
        "",
        "# curl -sS -H \"Authorization: Bearer $CANVAS_TOKEN\" \\",
        "#   \"https://canvas.example.edu/api/v1/courses/8812/rubrics\"",
        "",
        "# Hunt: correlate 48MB+ JSON pulls with stale key_id in admin logs.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-rubrics",
          phase: "Recon",
          goal: "Replay a rubrics API HEAD request with the suspect developer key (simulated).",
          hint: "`curl -sI -H 'Authorization: Bearer canvas_dev_51' https://canvas.edu.example/api/v1/courses/8812/rubrics`.",
          matches: [
            {
              kind: "exact",
              command:
                "curl -sI -H 'Authorization: Bearer canvas_dev_51' https://canvas.edu.example/api/v1/courses/8812/rubrics",
            },
          ],
          narration:
            "HEAD shows multi-megabyte rubric bodies reachable with the long-lived key.",
        },
    {
          id: "token",
          phase: "Recon",
          goal: "Inspect the developer key that could read course artifacts.",
          hint: "`python3 ir_toolkit.py parse-artifact --input tokens/developer-key-51.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input tokens/developer-key-51.txt" }],
          narration:
            "Initial access is not SQLi here: it is an API identity with export-grade scopes and stale rotation.",
        },
    {
          id: "logs",
          phase: "Initial access",
          goal: "Pull log lines showing large rubric downloads.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"rubrics\"' --follow-log /var/log/canvas/edge-access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"rubrics\"' --follow-log /var/log/canvas/edge-access.log" }],
          narration:
            "The attacker is not getting a shell. They are getting 48 MB rubric exports through the official API.",
        },
    {
          id: "use",
          phase: "Persistence",
          goal: "Show token 51 being reused across course data pulls.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"key-id-51\"' --follow-log api/token-use.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"key-id-51\"' --follow-log api/token-use.log" }],
          narration:
            "Repeated token use is persistence in API form. The attacker keeps the same identity while rotating network origin later.",
        },
    {
          id: "lti",
          phase: "Lateral movement",
          goal: "Read the LTI manifest note about vendor domain loss.",
          hint: "`jq . lti/manifest.json`.",
          matches: [{ kind: "exact", command: "jq . lti/manifest.json" }],
          narration:
            "Supply chain for edu: if a vendor domain lapses, your trust store still points faculty at it until someone audits DNS.",
        },
    {
          id: "revoke",
          phase: "Containment",
          goal: "Verify developer key revocation, WAF block, and LTI secret rotation.",
          hint: "`tshark -r evidence.pcap --follow-log containment/revocation.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/revocation.log" }],
          narration:
            "Containment is revoke, throttle, rotate. That is the fix for a token-driven LMS compromise.",
        },
    {
          id: "lessons",
          phase: "Lessons",
          goal: "Count the edge events to understand how fast API theft scaled.",
          hint: "`python3 ir_toolkit.py count-events --input /var/log/canvas/edge-access.log`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py count-events --input /var/log/canvas/edge-access.log" }],
          narration:
            "Detection: payload size anomaly on academic exports beats IP blocklists when attackers ride residential networks.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/canvas_api_token_curl_shapes.sh`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/canvas_api_token_curl_shapes.sh" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "This scenario is inspired by how large LMS deployments behave under API token misuse, not by a particular public ‘Canvas compromise’ headline. It emphasises developer keys, LTI integrations, and exfiltration via documented REST surfaces.",
    lesson:
      "Treat LMS API keys like cloud IAM users: automatic rotation, narrow scopes, and DNS monitoring on every LTI launch domain you trust.",
    simulated: [
      "Institution names, course IDs, and logs are invented.",
      "Instructure Canvas is a real product; this story is not a official postmortem.",
    ],
  },
};
