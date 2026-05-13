import type { Scenario } from "../types";

/** HTTP/2 Rapid Reset, CVE-2023-44487. Oct 2023. RST_STREAM abuse → record DDoS amplification. */
export const http2RapidReset: Scenario = {
  slug: "http2-rapid-reset",
  exhibit: "EXH-026",
  title: "RST_STREAM Loop",
  tagline:
    "October 2023. Google, AWS, and Cloudflare coordinate disclosure: a flaw in HTTP/2 stream cancellation lets a handful of TCP connections tie up origin CPU, the largest layer-7 attacks measured to date.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2023",
  estMinutes: 8,
  fictional: true,
  cwd: "/cdn/rapid-reset-drill",
  user: "sre",
  host: "edge-metrics",
  role: "SRE reading attack recap the night your provider enabled emergency mitigations.",
  objective:
    "Connect the coordinated disclosure memo to edge metrics showing `RST_STREAM` spikes and elevated request churn.",
  briefing:
    "Numbers are synthetic; the mechanism and October 2023 coordination are real.",
  env: { USER: "sre", SHELL: "/bin/sh", PWD: "/cdn/rapid-reset-drill" },
  ps: ["  PID TTY TIME CMD", "  44 ?   0:11 envoy"],
  history: [],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input CVE-2023-44487-brief.txt": "simulated safe tool replay for http2-rapid-reset; replaces: cat CVE-2023-44487-brief.txt\n",
    "python3 ir_toolkit.py table-summary --input edge-60s.tsv": "simulated safe tool replay for http2-rapid-reset; replaces: cat edge-60s.tsv\n",
    "python3 safe_replay.py --scenario http2-rapid-reset --grep 12440 --artifact edge-60s.tsv": "simulated safe tool replay for http2-rapid-reset; replaces: grep -nF 12440 edge-60s.tsv\n",
    "curl -sI --http2 https://rapid-reset.lab/":
      [
        "HTTP/2 503",
        "server: tabletop-envoy",
        "x-rst-storm: 12440/sec",
        "(simulated: edge signals RST_STREAM churn during Rapid Reset class attacks)",
      ].join("\n"),
  },
  files: {
    "/cdn/rapid-reset-drill/CVE-2023-44487-brief.txt": {
      content: [
        "CVE-2023-44487, HTTP/2 Rapid Reset attack",
        "Abuse of stream cancellation (RST_STREAM) to amplify request cost at reverse proxies / origins",
        "Disclosed coordinated Oct 2023 by Cloudflare, Google, AWS, Microsoft, nginx, etc.",
        "Mitigations: patch proxies, limit concurrent streams per connection, rate-limit RST_STREAM, hardware L4 scrubbers",
        "Not credential theft, availability economics at planetary scale",
      ].join("\n"),
    },
    "/cdn/rapid-reset-drill/edge-60s.tsv": {
      content: [
        "ts\tconnections\tactive_streams\trst_per_sec\torigin_cpu",
        "2023-10-10T14:00:01Z\t4021\t89012\t880\t0.41",
        "2023-10-10T14:00:02Z\t5188\t120441\t12440\t0.89",
        "2023-10-10T14:00:03Z\t5240\t118902\t12110\t0.91",
        "2023-10-10T14:02:00Z\t4102\t14002\t210\t0.33",
      ].join("\n"),
    },
    "/cdn/rapid-reset-drill/public-poc/h2_rst_stream_flood_pseudocode.py": {
      content: [
        "# CVE-2023-44487: cancel many streams immediately after opening (Rapid Reset).",
        "# Educational skeleton only; do not aim at systems you do not own.",
        "",
        "# for i in range(N):",
        "#     send_headers(stream_id=2*i+1, end_headers=True, end_stream=False)",
        "#     send_rst_stream(stream_id=2*i+1, error_code=NO_ERROR)",
        "",
        "# Proxies that charged full request cost per half-open stream were worst-hit.",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-h2",
          goal: "Probe the origin with HTTP/2 headers (simulated RST storm banner).",
          hint: "`curl -sI --http2 https://rapid-reset.lab/`.",
          matches: [{ kind: "exact", command: "curl -sI --http2 https://rapid-reset.lab/" }],
          narration:
            "Protocol design met economics, cancellation was supposed to be cheap; attackers made it expensive.",
        },
    {
          id: "brief",
          goal: "Read the CVE / attack brief.",
          hint: "`python3 ir_toolkit.py parse-artifact --input CVE-2023-44487-brief.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input CVE-2023-44487-brief.txt" }],
          narration:
            "Coordinated disclosure memo sets language your execs will repeat on earnings calls.",
        },
    {
          id: "metrics",
          goal: "Inspect the 60-second edge metrics slice.",
          hint: "`python3 ir_toolkit.py table-summary --input edge-60s.tsv`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py table-summary --input edge-60s.tsv" }],
          narration:
            "`rst_per_sec` jumps 10× while connections barely double, classic cancellation storm.",
        },
    {
          id: "grep-spike",
          goal: "Pull only lines where RST/s exceeds 1000.",
          hint: "`python3 safe_replay.py --scenario http2-rapid-reset --grep 12440 --artifact edge-60s.tsv`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario http2-rapid-reset --grep 12440 --artifact edge-60s.tsv" }],
          narration:
            "Tabletop uses a literal threshold line; production would alert on rate derivatives.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/h2_rst_stream_flood_pseudocode.py`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/h2_rst_stream_flood_pseudocode.py" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "CVE-2023-44487 documents an issue in the handling of HTTP/2 stream cancellation that could be abused to generate extremely high request rates at HTTP/2-supporting servers and intermediaries, sometimes described as a 'Rapid Reset' attack. Major cloud and CDN providers coordinated public disclosure in October 2023 alongside mitigation guidance and software updates. The issue primarily threatens availability rather than confidentiality.",
    lesson:
      "Your origin must never trust that 'HTTP/2 is just faster HTTP/1.1'. Terminate HTTP/2 at a patched edge, cap streams per connection, and maintain L4 scrubbing contracts. DDoS is a financial weapon, cost the attacker more than they cost you, or they win by invoice.",
    simulated: [
      "Metric rows are invented; CVE-2023-44487, Rapid Reset name, Oct 2023 coordination, and attack class are public record.",
    ],
  },
};
