import type { Scenario } from "../types";

/**
 * CVE-2026-20896: Gitea Docker reverse-proxy authentication bypass.
 * July 2026 reporting described active exploitation and probing against exposed
 * Docker deployments that trusted identity headers from any source IP.
 */
export const giteaDockerAuthBypass: Scenario = {
  slug: "gitea-docker-auth-bypass",
  exhibit: "EXH-048",
  title: "One Header Admin",
  tagline:
    "July 12, 2026. Fresh exploitation warnings put Gitea Docker CVE-2026-20896 on the defender desk: a wildcard trusted-proxy default lets one identity header become admin.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/devops/gitea-ir",
  user: "responder",
  host: "forge-jump-02",
  role: "DevOps incident responder triaging an internet-facing self-hosted Git service.",
  objective:
    "Trace an actively exploited Gitea Docker authentication bypass from advisory to config, forged identity header, repository access, and containment.",
  briefing:
    "Your team runs Gitea behind an authenticating proxy. A July 2026 exploitation alert says official Docker images up to 1.26.2 can trust X-WEBAUTH-USER from any source when reverse-proxy auth is enabled and REVERSE_PROXY_TRUSTED_PROXIES is left as a wildcard. Everything here is a museum replay: advisories, config snippets, access logs, and containment receipts.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/devops/gitea-ir", NODE_ENV: "production" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "curl -sI https://git.internal.example/": [
      "HTTP/2 302",
      "location: /user/login",
      "server: gitea-museum",
      "",
    ].join("\n"),
    "jq . intel/cve-2026-20896.json":
      "simulated safe tool replay for gitea-docker-auth-bypass; replaces: cat intel/cve-2026-20896.json\n",
    "tshark -r evidence.pcap --follow-log config/app.ini":
      "simulated safe tool replay for gitea-docker-auth-bypass; replaces: cat config/app.ini\n",
    'curl -s -H "X-WEBAUTH-USER: admin" https://git.internal.example/admin': [
      "<title>admin - Dashboard - Gitea</title>",
      "simulated: vulnerable lab accepts the header because every source IP is trusted as a proxy",
    ].join("\n"),
    'tshark -r evidence.pcap -Y \'http.request.header contains "X-WEBAUTH-USER"\' --follow-log logs/gitea-access.log':
      "simulated safe tool replay for gitea-docker-auth-bypass; replaces: grep X-WEBAUTH-USER logs/gitea-access.log\n",
    "jq . repos/touched-repos.json":
      "simulated safe tool replay for gitea-docker-auth-bypass; replaces: cat repos/touched-repos.json\n",
    "tshark -r evidence.pcap --follow-log containment/upgrade.log":
      "simulated safe tool replay for gitea-docker-auth-bypass; replaces: cat containment/upgrade.log\n",
    "tshark -r evidence.pcap --follow-log containment/proxy-allowlist.log":
      "simulated safe tool replay for gitea-docker-auth-bypass; replaces: cat containment/proxy-allowlist.log\n",
    "jq . public-poc/header-shape.json":
      "simulated safe tool replay for gitea-docker-auth-bypass; replaces: cat public-poc/header-shape.json\n",
  },
  files: {
    "/home/devops/gitea-ir/intel/cve-2026-20896.json": {
      content: [
        "{",
        '  "cve": "CVE-2026-20896",',
        '  "component": "Official Gitea Docker image",',
        '  "affected": "gitea/gitea Docker images up to and including 1.26.2",',
        '  "condition": "reverse-proxy authentication enabled with REVERSE_PROXY_TRUSTED_PROXIES=*",',
        '  "impact": "unauthenticated user impersonation, including admin users",',
        '  "field_report": "July 2026 active exploitation and probing warnings",',
        '  "fixed": "upgrade directly to 1.26.4 or later and restrict trusted proxies"',
        "}",
      ].join("\n"),
    },
    "/home/devops/gitea-ir/config/app.ini": {
      content: [
        "; Synthetic Gitea app.ini excerpt",
        "[service]",
        "ENABLE_REVERSE_PROXY_AUTHENTICATION = true",
        "",
        "[security]",
        "INSTALL_LOCK = true",
        "",
        "[security.reverse_proxy]",
        "REVERSE_PROXY_TRUSTED_PROXIES = *",
      ].join("\n"),
    },
    "/home/devops/gitea-ir/logs/gitea-access.log": {
      content: [
        '2026-07-12T22:18:09Z src=198.51.100.77 method=GET path=/admin header.X-WEBAUTH-USER=admin status=200 session=created via_proxy=false',
        '2026-07-12T22:18:14Z src=198.51.100.77 method=GET path=/repo/platform/secrets/settings header.X-WEBAUTH-USER=admin status=200 session=reused via_proxy=false',
        '2026-07-12T22:19:02Z src=10.0.0.12 method=GET path=/user/login proxy=nginx-auth status=302 session=normal via_proxy=true',
      ].join("\n"),
    },
    "/home/devops/gitea-ir/repos/touched-repos.json": {
      content: [
        "{",
        '  "suspicious_session": "created_from_header_without_proxy",',
        '  "source_ip": "198.51.100.77",',
        '  "repos_read": ["platform/secrets", "infra/deploy-tokens", "payments/api"],',
        '  "secrets_at_risk": ["database URLs committed to examples", "old deploy token in CI notes", "private package registry credentials"]',
        "}",
      ].join("\n"),
    },
    "/home/devops/gitea-ir/containment/upgrade.log": {
      content: [
        "2026-07-12T22:31Z freeze_public_route service=gitea result=ok",
        "2026-07-12T22:39Z pull_image gitea/gitea:1.26.4 result=ok",
        "2026-07-12T22:46Z restart service=gitea version=1.26.4 result=ok",
        "2026-07-12T22:52Z invalidate_sessions scope=all result=ok",
        "2026-07-12T23:03Z rotate_secrets repos=platform/secrets,infra/deploy-tokens,payments/api result=in_progress",
      ].join("\n"),
    },
    "/home/devops/gitea-ir/containment/proxy-allowlist.log": {
      content: [
        "2026-07-12T22:48Z set REVERSE_PROXY_TRUSTED_PROXIES=10.0.0.12/32",
        "2026-07-12T22:49Z block_direct_container_port source=0.0.0.0/0 result=ok",
        "2026-07-12T22:50Z test forged_header_from_internet expected=login_page observed=login_page",
      ].join("\n"),
    },
    "/home/devops/gitea-ir/public-poc/header-shape.json": {
      content: [
        "{",
        '  "museum_note": "Header shape only. This exhibit does not contact real Gitea instances.",',
        '  "unsafe_header": "X-WEBAUTH-USER: admin",',
        '  "root_cause": "backend trusted identity headers from every source IP instead of only the authenticating proxy",',
        '  "defense": "upgrade, restrict trusted proxy CIDRs, and block direct container access"',
        "}",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "baseline",
      phase: "Recon",
      goal: "Confirm the forge normally redirects unauthenticated users to login.",
      hint: "`curl -sI https://git.internal.example/`.",
      matches: [{ kind: "exact", command: "curl -sI https://git.internal.example/" }],
      narration:
        "A normal browser path still lands on login. The bug hides below that surface, in whether the backend trusts identity headers from the wrong network path.",
    },
    {
      id: "advisory",
      phase: "Recon",
      goal: "Read the CVE summary your SOC copied into the incident folder.",
      hint: "`jq . intel/cve-2026-20896.json`.",
      matches: [{ kind: "exact", command: "jq . intel/cve-2026-20896.json" }],
      narration:
        "The important condition is a three-part overlap: Docker image, reverse-proxy auth, and wildcard trusted proxies.",
    },
    {
      id: "config",
      phase: "Initial access",
      goal: "Inspect the Gitea config for reverse-proxy auth and wildcard trust.",
      hint: "`tshark -r evidence.pcap --follow-log config/app.ini`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log config/app.ini" }],
      narration:
        "REVERSE_PROXY_TRUSTED_PROXIES=* is the trust boundary collapse. Any source that can reach the container can claim to be the proxy.",
    },
    {
      id: "header",
      phase: "Execution",
      goal: "Replay the museum-safe forged identity header against the vulnerable lab endpoint.",
      hint: '`curl -s -H "X-WEBAUTH-USER: admin" https://git.internal.example/admin`.',
      matches: [{ kind: "exact", command: 'curl -s -H "X-WEBAUTH-USER: admin" https://git.internal.example/admin' }],
      narration:
        "No password, token, or cookie appears in the command. The header becomes admin only because the backend accepts identity from everywhere.",
    },
    {
      id: "log-proof",
      phase: "Detection",
      goal: "Find access-log rows where the identity header arrived from outside the trusted proxy.",
      hint: "`tshark -r evidence.pcap -Y 'http.request.header contains \"X-WEBAUTH-USER\"' --follow-log logs/gitea-access.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'http.request.header contains "X-WEBAUTH-USER"\' --follow-log logs/gitea-access.log',
        },
      ],
      narration:
        "The key hunting pair is header.X-WEBAUTH-USER plus via_proxy=false. That separates normal proxy SSO from forged direct container traffic.",
    },
    {
      id: "repos",
      phase: "Impact",
      goal: "List repositories and secrets potentially exposed by the forged admin session.",
      hint: "`jq . repos/touched-repos.json`.",
      matches: [{ kind: "exact", command: "jq . repos/touched-repos.json" }],
      narration:
        "A Git service compromise is rarely just source disclosure. Old tokens, CI notes, and deployment examples make code hosting a secret inventory.",
    },
    {
      id: "upgrade",
      phase: "Containment",
      goal: "Verify the emergency upgrade and session invalidation work.",
      hint: "`tshark -r evidence.pcap --follow-log containment/upgrade.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/upgrade.log" }],
      narration:
        "Gitea advised moving directly to 1.26.4 or later. Treat sessions and reachable repository secrets as suspect after admin impersonation.",
    },
    {
      id: "allowlist",
      phase: "Containment",
      goal: "Verify trusted proxies are pinned to the real auth proxy and direct container access is blocked.",
      hint: "`tshark -r evidence.pcap --follow-log containment/proxy-allowlist.log`.",
      matches: [
        { kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/proxy-allowlist.log" },
      ],
      narration:
        "Patching fixes the shipped default. The network fix is to ensure only the real proxy can reach the container with identity headers.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the museum note that captures the unsafe header shape without targeting a real service.",
      hint: "`jq . public-poc/header-shape.json`.",
      matches: [{ kind: "exact", command: "jq . public-poc/header-shape.json" }],
      narration:
        "The lesson is trust scope. Identity headers are normal only when the receiver can prove they came from the authenticating proxy.",
    },
  ],
  debrief: {
    summary:
      "July 2026 advisories and reporting described CVE-2026-20896 in official Gitea Docker images up to 1.26.2: when reverse-proxy authentication is enabled, the Docker template could leave REVERSE_PROXY_TRUSTED_PROXIES=* in place, allowing any source that reached the container to send X-WEBAUTH-USER and impersonate a known user, including admin. Public references include https://github.com/go-gitea/gitea/security/advisories/GHSA-f75j-4cw6-rmx4, https://www.bleepingcomputer.com/news/security/hackers-exploit-critical-auth-bypass-in-gitea-docker-image/, https://www.csa.gov.sg/alerts-and-advisories/alerts/al-2026-083/, and https://www.securityweek.com/critical-gitea-flaw-under-active-exploitation-researchers-warn/.",
    lesson:
      "Reverse-proxy authentication is a trust boundary, not a convenience header. Patch Gitea Docker to 1.26.4 or later, restrict trusted proxy CIDRs, block direct container access, review logs for identity headers from non-proxy IPs, invalidate sessions, and rotate secrets reachable from touched repositories.",
    simulated: [
      "Hostnames, IP addresses, repositories, logs, and containment receipts are synthetic teaching artifacts.",
      "The forged header command is intercepted by the museum shell and never contacts a real Gitea service.",
      "The CVE number, affected Docker image scope, X-WEBAUTH-USER mechanism, active exploitation warnings, and 1.26.4 remediation guidance align with public reporting.",
    ],
  },
};
