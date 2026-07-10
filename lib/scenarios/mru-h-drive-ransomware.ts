import type { Scenario } from "../types";

/**
 * Mount Royal University ransomware disclosure, July 2026.
 * Public reports describe data exfiltration and deletion from an H drive used by
 * students and employees, plus deletion of a separate J drive used for departmental data.
 */
export const mruHDriveRansomware: Scenario = {
  slug: "mru-h-drive-ransomware",
  exhibit: "EXH-048",
  title: "H Drive Wipeout",
  tagline:
    "July 9, 2026. Mount Royal University confirms a ransomware actor stole files from selected H drive folders, deleted the originals, and also wiped a separate departmental J drive.",
  category: "incident-response",
  difficulty: "intermediate",
  era: "2020s",
  year: "2026",
  estMinutes: 10,
  fictional: true,
  cwd: "/home/dfir/mru-h-drive",
  user: "responder",
  host: "campus-ir-01",
  role: "University DFIR analyst coordinating storage, privacy, and recovery teams after a public ransomware update.",
  objective:
    "Reconstruct the delete-after-steal pattern, separate confirmed H drive exposure from J drive destruction, and verify containment and notification actions.",
  briefing:
    "Public reporting says MRU confirmed student and employee data was accessed, taken, and then deleted from selected H drive folders. A separate J drive was deleted too, but MRU said it had no evidence that J drive data was copied. Your job is to keep those facts separate while building a recovery and notification timeline.",
  env: { USER: "responder", SHELL: "/bin/bash", PWD: "/home/dfir/mru-h-drive" },
  ps: [
    "  PID TTY          TIME CMD",
    "  402 pts/0    00:00:00 bash",
    "  411 pts/0    00:00:00 ps",
  ],
  history: ["pwd", "ls"],
  commands: {
    "curl -sI https://emergency.mtroyal.example/cyber-update":
      [
        "HTTP/2 200",
        "content-type: text/html",
        "x-incident-page: mru-ransomware-update (simulated)",
      ].join("\n"),
    "python3 ir_toolkit.py parse-artifact --input intel/public-report.txt":
      "simulated safe tool replay for mru-h-drive-ransomware; replaces: cat intel/public-report.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"H-Drive\"' --follow-log storage/file-server.log":
      "simulated safe tool replay for mru-h-drive-ransomware; replaces: grep -nF H-Drive storage/file-server.log\n",
    "python3 ir_toolkit.py parse-artifact --input storage/h-drive-impact.txt":
      "simulated safe tool replay for mru-h-drive-ransomware; replaces: cat storage/h-drive-impact.txt\n",
    "tshark -r evidence.pcap -Y 'frame contains \"J-Drive\"' --follow-log storage/j-drive-recovery.log":
      "simulated safe tool replay for mru-h-drive-ransomware; replaces: grep -nF J-Drive storage/j-drive-recovery.log\n",
    "jq . extortion/cmd-claim.json":
      "simulated safe tool replay for mru-h-drive-ransomware; replaces: cat extortion/cmd-claim.json\n",
    "tshark -r evidence.pcap --follow-log containment/actions.log":
      "simulated safe tool replay for mru-h-drive-ransomware; replaces: cat containment/actions.log\n",
    "python3 ir_toolkit.py parse-artifact --input notification/privacy-timeline.txt":
      "simulated safe tool replay for mru-h-drive-ransomware; replaces: cat notification/privacy-timeline.txt\n",
  },
  files: {
    "/home/dfir/mru-h-drive/intel/public-report.txt": {
      content: [
        "Mount Royal University ransomware update, public-source digest",
        "",
        "2026-06-17: cyber incident discovered after disruption to internal systems, online services, and internet access.",
        "2026-07-07 to 2026-07-09: public reporting says MRU confirmed data was accessed, taken, and deleted from selected H drive folders.",
        "Affected population described publicly: current and former students, current and former employees, and other individuals.",
        "Secondary storage note: J drive data was deleted, but MRU reported no evidence that it was copied before deletion.",
        "Claim note: CMD Organization claimed responsibility and demanded about 30 BTC, roughly 1.9 million dollars in reporting at the time.",
      ].join("\n"),
    },
    "/home/dfir/mru-h-drive/storage/file-server.log": {
      content: [
        "2026-06-17T04:21:08Z volume=H-Drive action=access folder=/students/2024/capstone source=unknown-vpn result=read",
        "2026-06-17T04:23:31Z volume=H-Drive action=archive folder=/employees/shared/hr source=unknown-vpn result=created",
        "2026-06-17T04:29:44Z volume=H-Drive action=delete folder=/students/2024/capstone source=unknown-vpn result=deleted",
        "2026-06-17T04:31:10Z volume=H-Drive action=delete folder=/employees/shared/hr source=unknown-vpn result=deleted",
      ].join("\n"),
    },
    "/home/dfir/mru-h-drive/storage/h-drive-impact.txt": {
      content: [
        "H drive impact memo",
        "",
        "Scope: selected folders, not a confirmed full-drive copy.",
        "Confirmed pattern for this exhibit: access, take, then delete originals.",
        "Review blocker: deleted originals make per-person file ownership slower to confirm.",
        "Privacy action: identify affected people from folder ACL history and backup metadata.",
      ].join("\n"),
    },
    "/home/dfir/mru-h-drive/storage/j-drive-recovery.log": {
      content: [
        "2026-06-17T04:35:52Z volume=J-Drive action=delete tree=/departmental source=unknown-vpn result=deleted",
        "2026-06-18T09:42:15Z volume=J-Drive action=restore attempt=snapshot-1 result=partial",
        "2026-07-07T19:30:00Z volume=J-Drive finding=no-evidence-of-copy status=investigation-continues",
      ].join("\n"),
    },
    "/home/dfir/mru-h-drive/extortion/cmd-claim.json": {
      content: [
        "{",
        '  "actor_claim": "CMD Organization",',
        '  "claim_status": "claimed publicly; MRU did not name an actor in its own update",',
        '  "reported_demand_btc": 30,',
        '  "reported_usd_approx": 1900000,',
        '  "operator_model": "auction-style extortion claim reported by BleepingComputer",',
        '  "defender_note": "Do not treat actor claims as scoped facts until verified by forensics."',
        "}",
      ].join("\n"),
    },
    "/home/dfir/mru-h-drive/containment/actions.log": {
      content: [
        "2026-06-17T05:05Z isolate=file-services vlan=campus-storage success",
        "2026-06-17T05:14Z revoke=unknown-vpn-session success",
        "2026-06-18T13:20Z recovery=controlled-service-restore online-services partial",
        "2026-07-07T20:10Z privacy=folder-owner-review started",
        "2026-07-09T10:40Z monitoring=credit-and-identity-protection employees-current-and-recent announced",
      ].join("\n"),
    },
    "/home/dfir/mru-h-drive/notification/privacy-timeline.txt": {
      content: [
        "Privacy and notification timeline",
        "",
        "Report to Alberta privacy commissioner: completed per public notice.",
        "Law enforcement notification: completed per public notice.",
        "Direct notifications: begin after compromised H drive folders map to individuals.",
        "Credit monitoring: public reporting says current employees and people employed within the past five years receive 24 months.",
        "Student impact: preserve wording carefully until individual folder review is complete.",
      ].join("\n"),
    },
    "/home/dfir/mru-h-drive/public-poc/delete_after_steal_recovery_note.txt": {
      content: [
        "# Delete-after-steal ransomware response pattern",
        "# 1. Preserve access logs and ACL history before storage rebuilds.",
        "# 2. Separate copied data from destroyed-only data in every briefing.",
        "# 3. Notify based on confirmed folder ownership, not threat-actor marketing claims.",
        "# 4. Test backups for full restore, metadata restore, and owner mapping.",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "incident-page",
      phase: "Recon",
      goal: "Check that the public incident page is reachable in the tabletop stub.",
      hint: "`curl -sI https://emergency.mtroyal.example/cyber-update`.",
      matches: [{ kind: "exact", command: "curl -sI https://emergency.mtroyal.example/cyber-update" }],
      narration:
        "Start with public communications. In a university incident, privacy, recovery, and media clocks all run at once.",
    },
    {
      id: "public-digest",
      phase: "Recon",
      goal: "Read the public-source digest before touching storage evidence.",
      hint: "`python3 ir_toolkit.py parse-artifact --input intel/public-report.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input intel/public-report.txt" }],
      narration:
        "The key distinction is H drive data was taken and deleted, while J drive data was deleted with no evidence of copying.",
    },
    {
      id: "h-drive-log",
      phase: "Impact",
      goal: "Surface H drive access, archive, and deletion events from the file-server slice.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"H-Drive\"' --follow-log storage/file-server.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "H-Drive"\' --follow-log storage/file-server.log',
        },
      ],
      narration:
        "This is the destructive extortion shape: copy first, erase second, then pressure recovery through the attacker copy.",
    },
    {
      id: "h-drive-scope",
      phase: "Scoping",
      goal: "Review why selected-folder ownership is the privacy bottleneck.",
      hint: "`python3 ir_toolkit.py parse-artifact --input storage/h-drive-impact.txt`.",
      matches: [{ kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input storage/h-drive-impact.txt" }],
      narration:
        "Folder-level scope matters. Announcing a whole-drive breach when only selected folders are confirmed can create needless harm.",
    },
    {
      id: "j-drive",
      phase: "Scoping",
      goal: "Check J drive recovery notes without overstating exfiltration.",
      hint: "`tshark -r evidence.pcap -Y 'frame contains \"J-Drive\"' --follow-log storage/j-drive-recovery.log`.",
      matches: [
        {
          kind: "exact",
          command:
            'tshark -r evidence.pcap -Y \'frame contains "J-Drive"\' --follow-log storage/j-drive-recovery.log',
        },
      ],
      narration:
        "Destruction is still impact. It is not automatically data theft, so keep the J drive phrasing precise.",
    },
    {
      id: "extortion",
      phase: "Threat intelligence",
      goal: "Read the reported CMD Organization claim as unverified threat-actor marketing.",
      hint: "`jq . extortion/cmd-claim.json`.",
      matches: [{ kind: "exact", command: "jq . extortion/cmd-claim.json" }],
      narration:
        "Threat-actor claims help triage risk, but defenders scope from logs and victim confirmation, not ransom-site copy.",
    },
    {
      id: "containment",
      phase: "Containment",
      goal: "Verify isolation, session revocation, service restoration, and privacy review actions.",
      hint: "`tshark -r evidence.pcap --follow-log containment/actions.log`.",
      matches: [{ kind: "exact", command: "tshark -r evidence.pcap --follow-log containment/actions.log" }],
      narration:
        "The response splits into two tracks: rebuild services safely and map deleted folders to people for notification.",
    },
    {
      id: "notification",
      phase: "Lessons",
      goal: "Read the privacy timeline that turns technical scope into notification work.",
      hint: "`python3 ir_toolkit.py parse-artifact --input notification/privacy-timeline.txt`.",
      matches: [
        { kind: "exact", command: "python3 ir_toolkit.py parse-artifact --input notification/privacy-timeline.txt" },
      ],
      narration:
        "The lesson is disciplined wording: stolen, deleted, no-evidence-of-copy, and still-under-review are different states.",
    },
    {
      id: "mechanism-excerpt",
      phase: "Lessons",
      goal: "Review the recovery checklist for delete-after-steal ransomware.",
      hint: "`head -n 80 public-poc/delete_after_steal_recovery_note.txt`.",
      matches: [{ kind: "exact", command: "head -n 80 public-poc/delete_after_steal_recovery_note.txt" }],
      narration:
        "Backups are not only about file bytes. For privacy response, metadata and owner mapping can be just as important.",
    },
  ],
  debrief: {
    summary:
      "SecurityWeek reported on 2026-07-09 that Mount Royal University confirmed employee and student data was stolen from its network during a disruptive ransomware attack, with H drive data exfiltrated and deleted and a second storage system deleted without evidence of exfiltration: https://www.securityweek.com/mount-royal-university-confirms-data-stolen-in-ransomware-attack/ BleepingComputer reported on 2026-07-08 that MRU said selected H drive folders were accessed and taken, J drive data was deleted with no evidence it was copied, and CMD Organization claimed the attack while asking for 30 BTC: https://www.bleepingcomputer.com/news/security/mount-royal-university-confirms-breach-as-hackers-claim-attack/",
    lesson:
      "In destructive extortion, precision is a control. Keep copied data, deleted data, restored data, and still-unknown data in separate lanes so recovery, privacy notification, and executive updates do not accidentally amplify the attacker narrative.",
    simulated: [
      "The university name, public reporting dates, H drive and J drive distinction, broad affected populations, CMD Organization claim, and reported ransom demand reflect cited public reporting.",
      "Hostnames, paths, timestamps after discovery, file names, logs, JSON fields, and containment events are synthetic teaching props.",
      "No real stolen files, actor infrastructure, or exploit details are included.",
    ],
  },
};
