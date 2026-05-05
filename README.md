# EmulateHacks

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

An archive of iconic hacks, security incidents, and command-line moments — recreated as interactive, scripted browser terminals. No backend. No network. Just the briefing, the prompt, and the debrief.

Built on [wterm](https://wterm.dev/), a DOM-rendered VT220 emulator with a Zig core compiled to WASM.

## Getting started

```bash
bun install
bun dev
```

Opens at `emulatehack.wterm.localhost` via [portless](https://github.com/vercel-labs/portless).

> **Requires portless** — install with `npm i -g portless` if not already present.

## How it works

Each scenario ships with a virtual filesystem (flat in-memory map of paths to file contents), a list of numbered steps, and a short narrative arc. A custom shell engine interprets commands against the filesystem and matches input against each step's expected pattern. When a step matches, the engine prints a line of narration and advances the counter.

The shell supports real-feeling invocations of `cat`, `grep`, `find`, `head`, `tail`, `cd`, `ls`, `env`, `ps`, and others — all sandboxed, no real execution, no network access.

## Project structure

| Path | Description |
|---|---|
| `lib/scenarios/` | Individual scenario definitions (filesystem, steps, debrief) |
| `lib/engine/runtime.ts` | Shell engine — command parsing, step matching, virtual FS ops |
| `lib/engine/fs.ts` | Virtual filesystem helpers (walk, list, resolve paths) |
| `lib/engine/ansi.ts` | ANSI escape helpers and colour utilities |
| `lib/types.ts` | Shared types (`Scenario`, `Step`, `VFile`, etc.) |
| `components/play-session.tsx` | Terminal UI — wterm integration, step progress, hints |
| `app/scenarios/` | Scenario listing and detail pages |
| `app/play/[slug]/` | Interactive play page |
| `scripts/test-scenarios.ts` | Headless scenario runner for CI |

## Adding a scenario

Create a new file in `lib/scenarios/` following the `Scenario` type, then register it in `lib/scenarios/index.ts`. The scenario needs:

- `slug` — URL identifier
- `exhibit` — short exhibit code (e.g. `EX-042`)
- `files` — virtual filesystem as `Record<string, { content: string }>`
- `steps` — array of steps with `goal`, `hint`, and `matches`
- `debrief` — `summary`, `lesson`, and list of `simulated` behaviours

Run the test script to verify all steps are reachable:

```bash
bun run test:scenarios
```

## Tech

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [wterm](https://wterm.dev/) — `@wterm/react`, `@wterm/dom`, `@wterm/core`
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- React 19

Built by [Zaid Mukaddam](https://zaidmukaddam.com).

---

[Contributing guide](.github/CONTRIBUTING.md) · [![Sponsor](https://img.shields.io/badge/sponsor-%E2%9D%A4-ea4aaa?logo=github)](https://github.com/sponsors/zaidmukaddam)

## License

Apache 2.0 — see [LICENSE](LICENSE) for the full text.
