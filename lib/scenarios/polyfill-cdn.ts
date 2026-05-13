import type { Scenario } from "../types";

export const polyfillCdn: Scenario = {
  slug: "polyfill-cdn-sale",
  exhibit: "EXH-030",
  title: "When the CDN Was Sold",
  tagline:
    "June 2024. The polyfill.io domain quietly changes hands. The same <script> tag on a hundred thousand websites starts serving conditional malware to mobile users. Yours might be one of them.",
  category: "modern-cloud",
  difficulty: "beginner",
  era: "2020s",
  year: "2024",
  estMinutes: 8,
  fictional: true,
  cwd: "/srv/marketing-site",
  user: "responder",
  host: "edge-cdn-01",
  role: "Solo engineer for a small marketing site. The community advisories about polyfill.io dropped three days ago and you're the only person who can audit your own HTML.",
  objective:
    "Find every page on your site that loads a third-party CDN, identify which ones reference polyfill.io, and replace them with a known-good source.",
  briefing:
    "polyfill.io was a long-running open-source CDN that served browser polyfill scripts conditional on the user's User-Agent. In February 2024 the domain was sold to a Chinese company called Funnull. By June, traffic from mobile devices to certain referrer domains was being served scripts that redirected to gambling and adult sites, and in some samples, dropped malware via classic drive-by patterns. Cloudflare and Fastly began intercepting the domain at the edge. Andrew Betts (the original author) and the OWASP team published advisories. The Polyfill.io maintainer pages on GitHub and npm have nothing to do with the new domain owner. Walk your own templates and find anything you're still loading from polyfill.io.",
  env: { USER: "responder", SHELL: "/bin/sh", PWD: "/srv/marketing-site" },
  ps: [
    "  PID TTY          TIME CMD",
    "  101 ?        00:00:00 nginx",
    "  111 ?        00:00:00 sh",
    "  112 ?        00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "python3 advisory_triage.py --input ADVISORY.md": "simulated safe tool replay for polyfill-cdn-sale; replaces: cat ADVISORY.md\n",
    "python3 ir_toolkit.py enumerate --path evidence.txt": "simulated safe tool replay for polyfill-cdn-sale; replaces: ls templates\n",
    "python3 ir_toolkit.py extract-ioc --ioc polyfill --input evidence.txt": "simulated safe tool replay for polyfill-cdn-sale; replaces: grep -nF polyfill templates/*.html\n",
    "python3 safe_replay.py --scenario polyfill-cdn-sale --artifact templates/_layout.html": "simulated safe tool replay for polyfill-cdn-sale; replaces: cat templates/_layout.html\n",
    "tshark -r evidence.pcap -Y 'frame contains \"iphone\"' --follow-log access.log": "simulated safe tool replay for polyfill-cdn-sale; replaces: grep -nF iPhone access.log\n",
    "python3 advisory_triage.py --input PATCH.md": "simulated safe tool replay for polyfill-cdn-sale; replaces: cat PATCH.md\n",
    "curl -sI https://cdn.polyfill.io/v3/polyfill.min.js":
      [
        "HTTP/2 302",
        "location: https://blocked-tabletop/intercept",
        "x-polyfill-risk: ua-conditional-redirect (simulated)",
        "server: tabletop-cdn",
      ].join("\n"),
  },
  files: {
    "/srv/marketing-site/ADVISORY.md": {
      content: [
        "polyfill.io supply-chain compromise, June 2024",
        "",
        "Background: polyfill.io was a CDN that served conditional polyfill scripts.",
        "            The domain was sold by its original author in early 2024.",
        "            By June, malicious behaviour appeared in served scripts.",
        "Behaviour:  redirects to scam destinations from mobile UAs against",
        "            specific referrer domains. Drops malware in some samples.",
        "Reach:      ~100,000 sites observed loading from cdn.polyfill.io",
        "            (later linked publicly to North Korean threat actors).",
        "",
        "Action: stop loading anything from polyfill.io. Replace with either",
        "        a self-hosted polyfill bundle, jsDelivr's mirror, or, if you",
        "        no longer support old browsers, remove the tag entirely.",
        "",
        "Cloudflare and Fastly are intercepting the domain. Your users behind",
        "those networks may already be safe; users behind plain DNS are not.",
      ].join("\n"),
    },
    "/srv/marketing-site/templates/_layout.html": {
      content: [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        '  <meta charset="utf-8">',
        '  <meta name="viewport" content="width=device-width,initial-scale=1">',
        '  <title>Forge, modern hardware</title>',
        '  <link rel="stylesheet" href="/static/site.css">',
        "</head>",
        "<body>",
        "  {% block content %}{% endblock %}",
        "  <!-- analytics + polyfills -->",
        '  <script src="https://cdn.polyfill.io/v3/polyfill.min.js?features=default"></script>',
        '  <script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST"></script>',
        '  <script src="/static/app.js"></script>',
        "</body>",
        "</html>",
      ].join("\n"),
    },
    "/srv/marketing-site/templates/blog.html": {
      content: [
        "{% extends '_layout.html' %}",
        "{% block content %}",
        "  <article>",
        "    <h1>{{ post.title }}</h1>",
        "    {{ post.body | safe }}",
        "  </article>",
        "{% endblock %}",
      ].join("\n"),
    },
    "/srv/marketing-site/templates/checkout.html": {
      content: [
        "{% extends '_layout.html' %}",
        "{% block content %}",
        "  <h1>Checkout</h1>",
        '  <form method="post" action="/api/checkout">',
        '    <input type="text" name="ship_to">',
        '    <button type="submit">Pay</button>',
        "  </form>",
        "{% endblock %}",
      ].join("\n"),
    },
    "/srv/marketing-site/static/site.css": {
      content: "body{font:16px/1.5 system-ui;color:#111;background:#fff}\n",
    },
    "/srv/marketing-site/PATCH.md": {
      content: [
        "fix:",
        "",
        "1. self-host the polyfills you actually need (or drop the tag),",
        "2. replace the cdn.polyfill.io URL in templates/_layout.html,",
        "3. invalidate the CDN cache for any HTML that referenced the old URL,",
        "4. add a CSP header that whitelists allowed script sources.",
        "",
        "for step 1, generate a per-target bundle with @web/polyfills-loader,",
        "drop the result into static/, and reference it from _layout.html.",
      ].join("\n"),
    },
    "/srv/marketing-site/access.log": {
      content: [
        "203.0.113.18 - - [22/Jun/2024:14:11:02 +0000] \"GET /blog/launch HTTP/2.0\" 200 4912 \"-\" \"Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)\"",
        "203.0.113.42 - - [22/Jun/2024:14:11:08 +0000] \"GET /checkout HTTP/2.0\" 200 1188 \"-\" \"Mozilla/5.0 (Linux; Android 14)\"",
        "198.51.100.7 - - [22/Jun/2024:15:02:11 +0000] \"GET /blog/launch HTTP/2.0\" 200 4912 \"-\" \"Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)\"",
      ].join("\n"),
    },
    "/srv/marketing-site/public-poc/conditional_redirect_stub.js": {
      content: [
        "// Museum sketch: UA + Referrer gated behaviour on compromised polyfill CDN (2024).",
        "// Real incidents redirected mobile users / specific referrers to scam payloads.",
        "",
        "// if (/iPhone/.test(navigator.userAgent) && document.referrer.match(/checkout/))",
        "//   location.replace('https://blocked-tabletop/intercept');",
      ].join("\n"),
    },
  },
  steps: [
    {
          id: "curl-polyfill",
          goal: "Check response headers from the polyfill CDN URL (simulated).",
          hint: "`curl -sI https://cdn.polyfill.io/v3/polyfill.min.js`.",
          matches: [
            {
              kind: "exact",
              command: "curl -sI https://cdn.polyfill.io/v3/polyfill.min.js",
            },
          ],
          narration:
            "The supply chain here isn't code or a package, it's a domain. Same script tag on every page; new owner; new payload. CSP would have caught it. Self-hosting would have prevented it.",
        },
    {
          id: "advisory",
          goal: "Read the advisory note.",
          hint: "`python3 advisory_triage.py --input ADVISORY.md`.",
          matches: [{ kind: "exact", command: "python3 advisory_triage.py --input ADVISORY.md" }],
          narration:
            "Advisory text backs the curl signal with dates, reach, and takedown context.",
        },
    {
          id: "list-templates",
          goal: "List your templates.",
          hint: "`python3 ir_toolkit.py enumerate --path evidence.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py enumerate --path evidence.txt" }],
          narration: "Three templates. _layout is the one shared by everything.",
        },
    {
          id: "find-polyfill",
          goal: "Search every template for polyfill.io.",
          hint: "`python3 ir_toolkit.py extract-ioc --ioc polyfill --input evidence.txt`.",
          matches: [{ kind: "exact", command: "python3 ir_toolkit.py extract-ioc --ioc polyfill --input evidence.txt" }],
          narration:
            "One hit, in _layout.html, which means every page that extends the layout (so: every page on the site) loads it. blog.html and checkout.html both inherit. The checkout page is the bad one: a script you don't control, on the page where users type a payment address.",
        },
    {
          id: "open-layout",
          goal: "Open the layout to read the exact tag.",
          hint: "`python3 safe_replay.py --scenario polyfill-cdn-sale --artifact templates/_layout.html`.",
          matches: [{ kind: "exact", command: "python3 safe_replay.py --scenario polyfill-cdn-sale --artifact templates/_layout.html" }],
          narration:
            "There it is, exactly as it shipped: `cdn.polyfill.io/v3/polyfill.min.js?features=default`. No SRI hash. No CSP fallback. The browser will execute whatever bytes that URL returns.",
        },
    {
          id: "logs",
          goal:
            "Check what kind of clients have been hitting the affected pages.",
          hint: "`tshark -r evidence.pcap -Y 'frame contains \"iphone\"' --follow-log access.log`.",
          matches: [{ kind: "exact", command: "tshark -r evidence.pcap -Y 'frame contains \"iphone\"' --follow-log access.log" }],
          narration:
            "Mostly mobile traffic, exactly the surface the bad payload targeted. Treat any session from this audit window as potentially served the bad script.",
        },
    {
          id: "patch",
          goal: "Read the patch checklist.",
          hint: "`python3 advisory_triage.py --input PATCH.md`.",
          matches: [{ kind: "exact", command: "python3 advisory_triage.py --input PATCH.md" }],
          narration:
            "Self-host, swap, invalidate, then add a CSP. The CSP is the actual long-term fix, it would have made this CDN sale a non-event.",
        },
    {
          id: "mechanism-excerpt",
          goal: "Review the archived public mechanism excerpt for this exhibit (museum reference).",
          hint: `head -n 80 public-poc/conditional_redirect_stub.js`,
          matches: [{ kind: "exact", command: "head -n 80 public-poc/conditional_redirect_stub.js" }],
          narration:
            "Educational material from disclosure-era patterns; excerpt only and nothing executes in this shell.",
        }
  ],
  debrief: {
    summary:
      "In early 2024 the polyfill.io domain, a popular open-source CDN that served browser-conditional polyfill scripts, was sold to a company called Funnull. By June 2024, scripts served from cdn.polyfill.io had begun delivering malicious payloads on mobile user-agents and against specific referrer domains: redirects to scam pages, drive-by malware, the lot. Roughly 100,000 sites were observed loading from the domain at the time of disclosure (CVE-2024-38526 covers one specific downstream, pdoc-generated documentation, but the impact was domain-wide). Cloudflare and Fastly began intercepting requests at the edge. The original author Andrew Betts publicly disavowed any connection to the new owners.",
    lesson:
      "Three things. (1) Treat every third-party <script src> as a domain you don't own. The author can sell, the registrar can lapse, the CDN can be hijacked. None of those events change a thing in your repo, and none of them will alert you. (2) Use Subresource Integrity (an `integrity=` hash on the <script> tag) for any third-party JS that you cannot move in-house. SRI would have made the polyfill.io payload simply not execute, regardless of what the new owner served. (3) Use a Content Security Policy that lists script sources explicitly. It's the one control that scales: it doesn't depend on you noticing every third-party domain change, only on knowing which domains you intended to allow on the day you shipped.",
    simulated: [
      "Hostnames, IPs, and access log lines are invented for the exhibit.",
      "The malicious payload is described at a high level (UA-conditional redirects, drive-by drop) and not reproduced.",
      "The polyfill.io domain sale, the timeline, the malicious behaviour, the ~100,000-site reach, the Cloudflare/Fastly interception, and the later attribution to North Korea-linked actors are all from public reporting (Sansec, Qualys, SecurityWeek 2026 update).",
    ],
  },
};
