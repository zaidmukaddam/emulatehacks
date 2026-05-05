import type { Scenario } from "../types";

/** Conficker / Downadup, late 2008. MS08-067 + IPC$ + autorun; domain generation. */
export const confickerWorm: Scenario = {
  slug: "conficker-ms08-067",
  exhibit: "EXH-009",
  title: "Tuesday Patch, Wednesday Storm",
  tagline:
    "November 2008. MS08-067 ships for a critical Server service RPC hole. Conficker spreads anyway, through patched gaps, weak passwords, and USB autoplay.",
  category: "classic-history",
  difficulty: "intermediate",
  era: "2000s",
  year: "2008",
  estMinutes: 9,
  fictional: true,
  cwd: "/incident/conficker-practice",
  user: "handler",
  host: "ren-isac-lab",
  role: "Incident handler reconstructing the first enterprise outbreak in your region.",
  objective:
    "Connect the KB patch bulletin to the observable IPC$ / autorun indicators in the stub logs.",
  briefing:
    "No live SMB on this terminal, this is the workbook version CERT used for tabletop exercises. Read the bulletin excerpt and grep the synthetic `netlog` for anonymous share attempts.",
  env: { USER: "handler", SHELL: "/bin/sh", PWD: "/incident/conficker-practice" },
  ps: ["  PID TTY TIME CMD", "  900 pts/0 0:00 sh"],
  history: [],
  files: {
    "/incident/conficker-practice/MS08-067-stub.txt": {
      content: [
        "Microsoft MS08-067, Oct 2008",
        "Vulnerability in Server service could allow remote code execution",
        "Conficker.A propagates via MS08-067 RPC exploit on TCP 445",
        "Later variants: P2P updates, domain generation algorithm (DGA), autorun.inf on USB",
        "Defenders disabled AutoRun, blocked IPC$ null sessions at edge, pushed KB958644 under emergency CAB",
      ].join("\n"),
    },
    "/incident/conficker-practice/netlog-synth.txt": {
      content: [
        "2008-11-23T03:12:01 10.4.18.99 -> 10.4.20.40 IPC$ anonymous bind SUCCESS",
        "2008-11-23T03:12:04 10.4.18.99 ADMIN$ pw-guess fail (Administrator)",
        "2008-11-23T03:15:19 198.51.100.2 USBINSERT E:\\autorun.inf OPEN",
        "2008-11-23T03:15:20 198.51.100.2 E:\\RECYCLER\\S-1-2-3\\setup.exe EXEC blocked",
        "2008-11-23T03:22:11 10.4.18.99 -> 10.4.20.40 SERVICE_RPC MS08-067 heuristics POSITIVE",
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "bulletin",
      goal: "Read the MS08-067 / Conficker relationship note.",
      hint: "`cat MS08-067-stub.txt`.",
      matches: [{ kind: "exact", command: "cat MS08-067-stub.txt" }],
      narration:
        "Patch existed before the hurricane, remediation debt is the real vulnerability.",
    },
    {
      id: "netlog",
      goal: "Read the synthetic netlog slice.",
      hint: "`cat netlog-synth.txt`.",
      matches: [{ kind: "exact", command: "cat netlog-synth.txt" }],
      narration:
        "IPC$, USB autorun, RPC heuristics firing, three blended ingress paths for one worm family.",
    },
    {
      id: "grep-autorun",
      goal: "Surface the removable-media indicator lines.",
      hint: "`grep -nF autorun netlog-synth.txt`.",
      matches: [{ kind: "exact", command: "grep -nF autorun netlog-synth.txt" }],
      narration:
        "Air-gapped labs learned about Conficker from lab technicians' thumb drives, technical policy without physical controls fails.",
    },
  ],
  debrief: {
    summary:
      "Conficker (also called Downadup) was a prolific Windows worm family first observed in late 2008. Early variants spread by exploiting the MS08-067 vulnerability in the Windows Server service over SMB; later variants added additional propagation mechanisms including weak password guessing, USB autorun abuse, and peer-to-peer update channels using algorithmically generated domains. It infected millions of systems worldwide and remained a case study in patch latency and defence-in-depth.",
    lesson:
      "A single critical remote does not wash away if 5% of your estate never patches. Plan for offline nodes, vendor appliances you forgot were Windows, and removable media in OT shops. Today's Conficker-shaped problems are VPN concentrators with years-old firmware and lab laptops that joined the domain once in 2016.",
    simulated: [
      "Subnets and timestamps are synthetic; MS08-067, Conficker propagation techniques, and timeline are historically grounded.",
    ],
  },
};
