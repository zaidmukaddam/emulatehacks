import type { Scenario } from "../types";

/**
 * June 2026 VS Code / github.dev token-stealing zero-day disclosure.
 * Based on public reporting by Ammar Askar and BleepingComputer.
 * All evidence below is synthetic and defensive; no exploit payload is included.
 */
export const vscodeGithubTokenWebview: Scenario = {
  slug: "vscode-github-token-webview",
  exhibit: "EXH-048",
  title: "Webview Token Trap",
  tagline:
    "June 3, 2026. A one-click github.dev proof of concept shows how VS Code webview message handling can lead to GitHub OAuth token exposure. You triage the browser editor trail and rotate the blast radius.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/devsec/github-dev-triage",
  user: "responder",
  host: "devsec-workstation-12",
  role: "Developer security analyst validating exposure from a public VS Code and github.dev disclosure.",
  objective:
    "Trace the click from github.dev launch to webview key replay, extension install, token access, repository enumeration, and containment.",
  briefing:
    "A maintainer clicked a link to a repository that opened in github.dev. Public reporting says the zero-day abused VS Code webview keydown message handling to install an extension that could read the GitHub OAuth token github.com posts to github.dev. Your job is to prove which controls fired, which repos were enumerated, and whether the token was revoked.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/devsec/github-dev-triage" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "objective"],
  commands: {
    "python3 ir_toolkit.py parse-artifact --input intel/public-disclosure.txt":
      "simulated safe tool replay for vscode-github-token-webview; replaces: cat intel/public-disclosure.txt\n",
    "curl -sI https://github.dev/maintainer/research-notebook/blob/main/README.ipynb":
      [
        "HTTP/2 200",
        "content-type: text/html; charset=utf-8",
        "x-museum-note: github.dev browser editor launch observed",
        "",
      ].join("\n"),
    "tshark -r evidence.pcap -Y 'frame contains \"github.dev\"' --follow-log browser/navigation.log":
      "simulated safe tool replay for vscode-github-token-webview; replaces: grep -nF github.dev browser/navigation.log\n",
    "python3 ir_toolkit.py parse-artifact --input browser/webview-events.log":
      "simulated safe tool replay for vscode-github-token-webview; replaces: cat browser/webview-events.log\n",
    "python3 ir_toolkit.py parse-artifact --input vscode/extension-install.log":
      "simulated safe tool replay for vscode-github-token-webview; replaces: cat vscode/extension-install.log\n",
    "tshark -r evidence.pcap -Y 'frame contains \"api.github.com/user/repos\"' --follow-log proxy/github-api.log":
      "simulated safe tool replay for vscode-github-token-webview; replaces: grep -nF api.github.com/user/repos proxy/github-api.log\n",
    "jq . github/token-scope.json":
      "simulated safe tool replay for vscode-github-token-webview; replaces: cat github/token-scope.json\n",
    "tshark -r evidence.pcap --follow-log controls/containment.log":
      "simulated safe tool replay for vscode-github-token-webview; replaces: cat controls/containment.log\n",
  },
  files: {
    "/home/devsec/github-dev-triage/intel/public-disclosure.txt": {
      content: [
        "Public disclosure summary",
        "",
        "Source: Ammar Askar, 1-Click GitHub Token Stealing via a VSCode Bug",
        "Press: BleepingComputer, VS Code zero-day lets hackers steal GitHub tokens in one click",
        "Date window: disclosed June 2, 2026; reported June 3, 2026 at 06:50 UTC",
        "",
        "Key facts for defenders:",
        "- github.com posts an OAuth token to github.dev so the browser editor can work with repositories.",
        "- The token is not limited to only the repository that launched the editor.",
        "- A webview keydown message path can be abused to replay shortcuts in the main editor.",
        "- The public proof of concept chained a notebook webview, local workspace extension behavior, and extension install flow.",
        "- Microsoft applied a June 3 stopgap: extra confirmation when opening notebooks in web VS Code and no publisher-trust skip via commands.",
      ].join("\n"),
    },
    "/home/devsec/github-dev-triage/browser/navigation.log": {
      content: [
        "2026-06-03T07:12:44Z user=maintainer url=https://github.com/maintainer/research-notebook",
        "2026-06-03T07:12:51Z user=maintainer url=https://github.dev/maintainer/research-notebook/blob/main/README.ipynb referrer=https://chat.example",
        "2026-06-03T07:13:02Z user=maintainer browser_site_data=github.dev prior_signin=true",
      ].join("\n"),
    },
    "/home/devsec/github-dev-triage/browser/webview-events.log": {
      content: [
        "webview audit excerpt",
        "",
        "07:13:09Z origin=vscode-webview event=did-keydown key=KeyA ctrl=true shift=true",
        "07:13:10Z origin=vscode-webview event=did-keydown key=F1 ctrl=true",
        "07:13:10Z note=synthetic mirror of public key-replay class; no payload stored here",
        "07:13:11Z control=notebook-open-confirmation result=absent profile=existing-site-data",
      ].join("\n"),
    },
    "/home/devsec/github-dev-triage/vscode/extension-install.log": {
      content: [
        "VS Code web extension audit",
        "",
        "07:13:09Z workspace=.vscode/extensions local_workspace_extension=true",
        "07:13:10Z notification_primary_action=accepted_by_keyboard_shortcut",
        "07:13:11Z extension_id=token-audit-demo publisher_trust=skipped source=workspace-keybinding",
        "07:13:12Z alert=unexpected_extension_install github_dev_session=active",
      ].join("\n"),
    },
    "/home/devsec/github-dev-triage/proxy/github-api.log": {
      content: [
        "2026-06-03T07:13:15Z host=devsec-workstation-12 method=GET url=https://api.github.com/user/repos status=200 ua=github-dev-web-extension",
        "2026-06-03T07:13:16Z host=devsec-workstation-12 method=GET url=https://api.github.com/orgs/core-platform/repos status=200 ua=github-dev-web-extension",
        "2026-06-03T07:13:16Z alert=repo_enumeration token_hint=ghu_simulated_redacted scope=repo",
      ].join("\n"),
    },
    "/home/devsec/github-dev-triage/github/token-scope.json": {
      content: [
        "{",
        '  "token_hint": "ghu_simulated_redacted",',
        '  "observed_scope": ["repo", "workflow"],',
        '  "repository_limit": "not limited to launch repository",',
        '  "enumerated_private_repos": 18,',
        '  "write_capable": true,',
        '  "recommended_action": "revoke token, clear github.dev site data, review repo events"',
        "}",
      ].join("\n"),
    },
    "/home/devsec/github-dev-triage/controls/containment.log": {
      content: [
        "2026-06-03T07:18Z token_revoke token_hint=ghu_simulated_redacted success",
        "2026-06-03T07:19Z clear_site_data domain=github.dev user=maintainer success",
        "2026-06-03T07:21Z disable_browser_vscode_notebooks org=core-platform pending_vendor_stopgap",
        "2026-06-03T07:26Z audit_repo_events window=2026-06-03T07:10Z..07:25Z suspicious_writes=0",
        "2026-06-03T07:31Z developer_advisory sent=true message='do not open unexpected github.dev notebook links'",
      ].join("\n"),
    },
    "/home/devsec/github-dev-triage/public-poc/vscode_webview_token_trap_note.txt": {
      content: [
        "# Defensive note only. No proof-of-concept code is included.",
        "",
        "The public report described a chain where a notebook webview can replay keydown shortcuts,",
        "a workspace extension path can help install an extension, and github.dev exposes a broad",
        "GitHub OAuth token to the browser editor session.",
        "",
        "Defender checklist:",
        "- Revoke tokens touched by suspicious github.dev sessions.",
        "- Clear cookies and local site data for github.dev.",
        "- Review repository audit events for reads, writes, workflow edits, and new deploy keys.",
        "- Update VS Code and rely on the June 3 stopgap confirmation flow when available.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "intel",
      phase: "Recon",
      goal: "Load the public disclosure summary your team attached to the incident ticket.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/public-disclosure.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/public-disclosure.txt" },
      ],
      narration:
        "Anchor on facts from the disclosure: github.dev receives a broad OAuth token, and the risky path begins inside VS Code webviews.",
    },
    {
      id: "baseline",
      phase: "Recon",
      goal: "Confirm the suspicious github.dev notebook URL was reachable.",
      hint: "`curl -sI https://github.dev/maintainer/research-notebook/blob/main/README.ipynb`.",
      matches: [
        {
          kind: "exact",
          command: "curl -sI https://github.dev/maintainer/research-notebook/blob/main/README.ipynb",
        },
      ],
      narration:
        "The URL opens the browser editor path. In this exhibit, the notebook is inert and only the access trail matters.",
    },
    {
      id: "navigation",
      phase: "Initial access",
      goal: "Show the maintainer moved from a chat link into github.dev with prior site data.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"github.dev\"' --follow-log browser/navigation.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "github.dev"\' --follow-log browser/navigation.log',
        },
      ],
      narration:
        "Existing github.dev site data matters because the protective sign-in prompt may not appear for users who already passed it.",
    },
    {
      id: "webview",
      phase: "Execution",
      goal: "Inspect webview key replay events tied to the public vulnerability class.",
      hint: "`python3 ir_toolkit.py parse-artifact --input browser/webview-events.log`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input browser/webview-events.log" },
      ],
      narration:
        "The webview should be sandboxed, but keydown message forwarding turned UI convenience into a control boundary problem.",
    },
    {
      id: "extension",
      phase: "Persistence",
      goal: "Review the unexpected extension install evidence.",
      hint: "`python3 ir_toolkit.py parse-artifact --input vscode/extension-install.log`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input vscode/extension-install.log" },
      ],
      narration:
        "The public chain used extension behavior to reach token-reading code. Your log records the install, not the exploit.",
    },
    {
      id: "repo-api",
      phase: "Impact",
      goal: "Find GitHub API calls that indicate repository enumeration.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"api.github.com/user/repos\"' --follow-log proxy/github-api.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "api.github.com/user/repos"\' --follow-log proxy/github-api.log',
        },
      ],
      narration:
        "Impact is developer identity reach: private repository enumeration and possible write access through the exposed token.",
    },
    {
      id: "scope",
      phase: "Impact",
      goal: "Check the observed token scope and repository blast radius.",
      hint: "`jq . github/token-scope.json`.",
      matches: [{ kind: "exact", command: "jq . github/token-scope.json" }],
      narration:
        "The key lesson from the write-up is token breadth. Treat it like an org-wide developer credential until proven narrower.",
    },
    {
      id: "contain",
      phase: "Containment",
      goal: "Verify token revocation, site-data clearing, audit review, and developer advisory.",
      hint: "`tshark -r evidence.pcap --follow-log controls/containment.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log controls/containment.log" }],
      narration:
        "Containment pairs token revocation with browser cleanup and repo audit review. Patching alone cannot undo a copied token.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the safe mechanism note for this exhibit.",
      hint: "`head -n 80 public-poc/vscode_webview_token_trap_note.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/vscode_webview_token_trap_note.txt" }],
      narration:
        "This museum note keeps the mechanics defensive: what to revoke, what to clear, and which audit trails to review.",
    },
  ],
  debrief: {
    summary:
      "On June 3, 2026, BleepingComputer reported Ammar Askar's public VS Code zero-day proof of concept that could steal GitHub tokens via github.dev. Askar's write-up states that github.com posts an OAuth token to github.dev, the token is not limited to the single repository that launched the browser editor, and a webview keydown message path could be chained through extension install behavior to read the token and enumerate private repositories. The write-up also says Microsoft applied a June 3 stopgap by adding notebook confirmation in web VS Code and blocking commands from skipping publisher trust. Sources: https://www.bleepingcomputer.com/news/security/vs-code-zero-day-lets-hackers-steal-github-tokens-in-one-click/ and https://blog.ammaraskar.com/github-token-stealing/",
    lesson:
      "Developer browser tools carry high-value identity material. Scope tokens narrowly where possible, prompt on risky editor transitions, monitor unexpected extension installs, and treat github.dev site data plus repository audit logs as part of incident response.",
    simulated: [
      "Maintainer names, hostnames, logs, token hints, repo counts, extension names, and control actions are synthetic.",
      "No exploit JavaScript, notebook payload, extension payload, or live GitHub token is included.",
      "The factual backbone comes from the June 2026 public disclosure and press coverage linked in the debrief.",
    ],
  },
};
