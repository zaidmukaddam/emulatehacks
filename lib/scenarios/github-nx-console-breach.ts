import type { Scenario } from "../types";

/**
 * GitHub-owned repository breach tied to the compromised Nx Console 18.95.0 extension.
 */
export const githubNxConsoleBreach: Scenario = {
  slug: "github-nx-console-breach",
  exhibit: "EXH-048",
  title: "The Console That Called Home",
  tagline:
    "May 21, 2026. GitHub links unauthorized access to internal repositories to a poisoned Nx Console VS Code extension. You validate endpoint exposure, repo access, and credential rotation.",
  category: "modern-cloud",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/ir/nx-console-breach",
  user: "responder",
  host: "devsec-bridge",
  role: "Incident responder coordinating developer endpoint triage after a supply-chain extension compromise.",
  objective:
    "Confirm the exposed extension version, identify local indicators, scope repository access, and verify credential rotation.",
  briefing:
    "GitHub reported unauthorized access to GitHub-owned repositories after a poisoned third-party VS Code extension compromised an employee device. The Nx Console advisory identifies version 18.95.0 as malicious, with a short marketplace window but broad credential reach. This exhibit uses static logs and safe command replays to walk the response.",
  env: {
    USER: "responder",
    SHELL: "/bin/bash",
    PWD: "/home/ir/nx-console-breach",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  701 pts/0    00:00:00 bash",
    "  718 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls", "cat ADVISORY.md"],
  commands: {
    "python3 advisory_triage.py --input ADVISORY.md": [
      "Incident: GitHub-owned repositories accessed after a poisoned VS Code extension compromise.",
      "Public scope: GitHub assessed about 3,800 internal repositories as directionally consistent with attacker claims.",
      "Extension: Nx Console 18.95.0, patched by updating to 18.100.0 or later.",
      "Response focus: endpoint isolation, extension removal, credential rotation, and follow-on monitoring.",
      "",
    ],
    "code --list-extensions --show-versions": [
      "GitHub.copilot@1.312.0",
      "ms-vscode.vscode-typescript-next@5.9.20260518",
      "nrwl.angular-console@18.95.0",
      "redhat.vscode-yaml@1.18.0",
      "",
      "(simulated: workstation inventory snapshot from the exposed endpoint)",
      "",
    ],
    "python3 ir_toolkit.py extract-ioc --ioc 18.95.0 --input marketplace/timeline.log": [
      "marketplace/timeline.log:1:2026-05-18T12:30Z channel=visual-studio-marketplace event=upload extension=nrwl.angular-console version=18.95.0",
      "marketplace/timeline.log:4:2026-05-18T12:48Z channel=visual-studio-marketplace event=unpublish extension=nrwl.angular-console version=18.95.0",
      "marketplace/timeline.log:6:2026-05-18T12:33Z channel=open-vsx event=publish extension=nrwl.angular-console version=18.95.0",
      "marketplace/timeline.log:7:2026-05-18T13:09Z channel=open-vsx event=unpublish extension=nrwl.angular-console version=18.95.0",
      "",
    ],
    "python3 ir_toolkit.py enumerate --path endpoint/iocs.txt": [
      "endpoint/iocs.txt",
      "  hit file ~/.local/share/kitty/cat.py",
      "  hit file /var/tmp/.gh_update_state",
      "  hit process python cat.py",
      "  hit env __DAEMONIZED=1",
      "  status endpoint isolated, disk image queued",
      "",
    ],
    "tshark -r evidence.pcap --follow-log github/internal-repo-access.log": [
      "2026-05-18T20:54Z src=employee-device token=ghs_redacted action=list_repos scope=internal result=success",
      "2026-05-18T21:03Z src=employee-device token=ghs_redacted action=archive_repo repo=github-internal/service-a result=success",
      "2026-05-18T21:23Z src=employee-device token=ghs_redacted action=bulk_archive count=3800 scope=github-owned-internal result=success",
      "2026-05-18T21:42Z src=employee-device action=customer_repo_access result=no_evidence",
      "",
    ],
    "gh secret list --org github-internal --audit rotation": [
      "critical-secrets        rotated 2026-05-18T23:12Z priority=highest",
      "codesigning-material    rotated 2026-05-19T01:44Z priority=high",
      "ci-automation-tokens    rotated 2026-05-19T03:30Z priority=high",
      "support-export-access   monitored 2026-05-19T04:10Z priority=review",
      "",
      "(simulated: names are generic and no secret values are present)",
      "",
    ],
    "python3 ir_toolkit.py enumerate --path containment/actions.log": [
      "2026-05-18T22:01Z isolate_endpoint host=employee-device success",
      "2026-05-18T22:08Z remove_extension nrwl.angular-console@18.95.0 success",
      "2026-05-18T23:12Z rotate_credentials tier=critical success",
      "2026-05-19T03:30Z validate_rotation tier=ci-automation success",
      "2026-05-19T05:00Z monitor_follow_on_activity window=72h status=active",
      "",
    ],
  },
  files: {
    "/home/ir/nx-console-breach/ADVISORY.md": {
      content: [
        "# GitHub-owned repositories via poisoned Nx Console",
        "",
        "Source basis:",
        "- GitHub Blog: https://github.blog/security/investigating-unauthorized-access-to-githubs-internal-repositories/",
        "- Nx Console GHSA: https://github.com/nrwl/nx-console/security/advisories/GHSA-c9j4-9m59-847w",
        "- BleepingComputer: https://www.bleepingcomputer.com/news/security/github-links-repo-breach-to-tanstack-npm-supply-chain-attack/",
        "",
        "Known public facts:",
        "- GitHub detected and contained a compromised employee device on May 18, 2026.",
        "- GitHub assessed attacker claims of about 3,800 internal repositories as directionally consistent.",
        "- GitHub reported no evidence of impact to customer information outside GitHub-owned internal repositories.",
        "- Nx Console 18.95.0 was a malicious VS Code extension release.",
        "- Nx says 18.95.0 was in Visual Studio Marketplace from 12:30 to 12:48 UTC.",
        "- Nx says OpenVSX exposure lasted from 12:33 to 13:09 UTC.",
        "- Nx recommends updating to 18.100.0 or later and rotating every reachable credential.",
        "",
        "Response question:",
        "Did this endpoint run 18.95.0, and if so, what repository and credential scopes must be treated as exposed?",
      ].join("\n"),
    },
    "/home/ir/nx-console-breach/marketplace/timeline.log": {
      content: [
        "2026-05-18T12:30Z channel=visual-studio-marketplace event=upload extension=nrwl.angular-console version=18.95.0",
        "2026-05-18T12:36Z channel=visual-studio-marketplace event=maintainer-email extension=nrwl.angular-console version=18.95.0",
        "2026-05-18T12:47Z channel=visual-studio-marketplace event=maintainer-unpublish extension=nrwl.angular-console version=18.95.0",
        "2026-05-18T12:48Z channel=visual-studio-marketplace event=unpublish extension=nrwl.angular-console version=18.95.0",
        "2026-05-18T12:30Z channel=open-vsx event=scan-start extension=nrwl.angular-console version=18.95.0",
        "2026-05-18T12:33Z channel=open-vsx event=publish extension=nrwl.angular-console version=18.95.0",
        "2026-05-18T13:09Z channel=open-vsx event=unpublish extension=nrwl.angular-console version=18.95.0",
      ].join("\n"),
    },
    "/home/ir/nx-console-breach/endpoint/extensions.txt": {
      content: [
        "GitHub.copilot@1.312.0",
        "ms-vscode.vscode-typescript-next@5.9.20260518",
        "nrwl.angular-console@18.95.0",
        "redhat.vscode-yaml@1.18.0",
      ].join("\n"),
    },
    "/home/ir/nx-console-breach/endpoint/iocs.txt": {
      content: [
        "host=employee-device",
        "file=~/.local/share/kitty/cat.py state=present",
        "file=~/Library/LaunchAgents/com.user.kitty-monitor.plist state=not_applicable_linux",
        "file=/var/tmp/.gh_update_state state=present",
        "file=/tmp/kitty-9f1d state=present",
        "process=python args=cat.py state=running",
        "env=__DAEMONIZED=1 state=present",
        "action=isolate_endpoint state=complete",
      ].join("\n"),
    },
    "/home/ir/nx-console-breach/github/internal-repo-access.log": {
      content: [
        "2026-05-18T20:54Z src=employee-device token=ghs_redacted action=list_repos scope=internal result=success",
        "2026-05-18T21:03Z src=employee-device token=ghs_redacted action=archive_repo repo=github-internal/service-a result=success",
        "2026-05-18T21:07Z src=employee-device token=ghs_redacted action=archive_repo repo=github-internal/support-tools result=success",
        "2026-05-18T21:23Z src=employee-device token=ghs_redacted action=bulk_archive count=3800 scope=github-owned-internal result=success",
        "2026-05-18T21:42Z src=employee-device action=customer_repo_access result=no_evidence",
      ].join("\n"),
    },
    "/home/ir/nx-console-breach/containment/actions.log": {
      content: [
        "2026-05-18T22:01Z isolate_endpoint host=employee-device success",
        "2026-05-18T22:08Z remove_extension nrwl.angular-console@18.95.0 success",
        "2026-05-18T22:14Z block_extension_version nrwl.angular-console@18.95.0 success",
        "2026-05-18T23:12Z rotate_credentials tier=critical success",
        "2026-05-19T01:44Z rotate_credentials tier=codesigning success",
        "2026-05-19T03:30Z validate_rotation tier=ci-automation success",
        "2026-05-19T05:00Z monitor_follow_on_activity window=72h status=active",
      ].join("\n"),
    },
    "/home/ir/nx-console-breach/public-poc/extension_update_guardrails.md": {
      content: [
        "# Defensive extension update guardrails",
        "",
        "This exhibit does not include payload code. Use the public incident to practice controls.",
        "",
        "1. Inventory extensions and versions on every developer workstation.",
        "2. Block known-bad extension versions such as nrwl.angular-console@18.95.0.",
        "3. Require a minimum extension age or security approval before auto-update.",
        "4. Rotate tokens, SSH keys, cloud credentials, and package publishing tokens reachable from exposed endpoints.",
        "5. Review repository access logs for archive, clone, and secret-listing events.",
        "6. Monitor for follow-on activity after rotation because stolen code and metadata can still guide attacks.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "advisory",
      phase: "Briefing",
      goal: "Read the incident summary and scope the response question.",
      hint: "`python3 advisory_triage.py --input ADVISORY.md`.",
      matches: [{ kind: "exact", command: "python3 advisory_triage.py --input ADVISORY.md" }],
      narration:
        "The public record gives you three anchors: poisoned extension, GitHub-owned repository access, and urgent credential rotation.",
    },
    {
      id: "extension-version",
      phase: "Exposure",
      goal: "Check the captured extension inventory for the exposed Nx Console version.",
      hint: "`code --list-extensions --show-versions`.",
      matches: [{ kind: "exact", command: "code --list-extensions --show-versions" }],
      narration:
        "The workstation had `nrwl.angular-console@18.95.0`, so the response must assume code execution on the developer endpoint.",
    },
    {
      id: "marketplace-window",
      phase: "Exposure",
      goal: "Confirm the marketplace exposure window for version 18.95.0.",
      hint: "`python3 ir_toolkit.py extract-ioc --ioc 18.95.0 --input marketplace/timeline.log`.",
      matches: [
        {
          kind: "exact",
          command:
            "python3 ir_toolkit.py extract-ioc --ioc 18.95.0 --input marketplace/timeline.log",
        },
      ],
      narration:
        "A short marketplace window is still enough for auto-update. Time windows narrow triage, but they do not eliminate endpoint risk.",
    },
    {
      id: "endpoint-iocs",
      phase: "Persistence",
      goal: "Enumerate local indicators from the compromised workstation image.",
      hint: "`python3 ir_toolkit.py enumerate --path endpoint/iocs.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py enumerate --path endpoint/iocs.txt" }],
      narration:
        "The endpoint shows the public IoC pattern: a cat.py artifact, daemon marker, and local state file. Isolation comes before cleanup.",
    },
    {
      id: "repo-access",
      phase: "Impact",
      goal: "Review repository access telemetry tied to the employee device.",
      hint: "`tshark -r evidence.pcap --follow-log github/internal-repo-access.log`.",
      matches: [
        {
          kind: "exact",
          command: "tshark -r evidence.pcap --follow-log github/internal-repo-access.log",
        },
      ],
      narration:
        "The synthetic telemetry mirrors GitHub's public assessment: internal repositories were accessed, while customer repositories outside that scope had no evidence of impact at disclosure time.",
    },
    {
      id: "secret-rotation",
      phase: "Containment",
      goal: "Verify that high-impact credentials were rotated and audited.",
      hint: "`gh secret list --org github-internal --audit rotation`.",
      matches: [
        { kind: "exact", command: "gh secret list --org github-internal --audit rotation" },
      ],
      narration:
        "Credential response is scoped by what the device could reach, not by what the payload is known to have touched.",
    },
    {
      id: "containment-log",
      phase: "Containment",
      goal: "Confirm endpoint isolation, extension blocking, rotation validation, and monitoring.",
      hint: "`python3 ir_toolkit.py enumerate --path containment/actions.log`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py enumerate --path containment/actions.log" },
      ],
      narration:
        "Containment is layered: remove the version, block reinstallation, rotate credentials, validate rotation, and watch for follow-on use.",
    },
    {
      id: "mechanism-excerpt",
      goal: "Review the defensive guardrails excerpt for extension supply-chain incidents.",
      hint: `head -n 80 public-poc/extension_update_guardrails.md`,
      matches: [
        { kind: "exact", command: "head -n 80 public-poc/extension_update_guardrails.md" },
      ],
      narration:
        "The museum takeaway is operational: extension trust belongs in the same control plane as package, CI, and cloud credential trust.",
    },
  ],
  debrief: {
    summary:
      "GitHub reported unauthorized access to GitHub-owned internal repositories after a poisoned VS Code extension compromised an employee device. Public reporting and the Nx Console advisory identified the malicious extension as Nx Console 18.95.0, with GitHub assessing the attacker claim of about 3,800 internal repositories as directionally consistent and stating it had no evidence of impact to customer information outside those internal repositories at disclosure time.",
    lesson:
      "Developer endpoints are production-adjacent assets. Extension auto-update, marketplace publisher credentials, local token stores, cloud CLIs, and CI secrets all share one blast radius when the developer workstation runs trusted code from a compromised publisher. Maintain extension inventories, gate updates for high-risk tools, restrict long-lived credentials on workstations, and rehearse broad rotation.",
    simulated: [
      "The endpoint hostname, logs, repository names, and credential labels are fictional.",
      "No payload code is included, and every command is a canned museum-safe replay.",
      "The public facts about GitHub's assessment, Nx Console 18.95.0, the marketplace windows, and the 18.100.0 remediation come from the cited public advisories and reporting.",
    ],
  },
};
