# Contributing to EmulateHacks

Contributions are welcome — new scenarios, engine improvements, UI fixes, and typo corrections all count.

## Scenarios

Scenarios are the most valuable contribution. A good scenario requires real research: read the original CVE writeup, incident report, or postmortem, then abstract it into a filesystem + step sequence that teaches the shape of the incident without becoming a recipe for real exploitation. Historically-grounded reconstructions are preferred over fictional ones.

### Checklist

1. Fork the repo and create a branch from `main`.
2. Add your scenario file in `lib/scenarios/` following the `Scenario` type in `lib/types.ts`.
3. Register it in `lib/scenarios/index.ts`.
4. Run `bun run test:scenarios` — all steps must pass.
5. Run `bun run type-check` and `bun run lint` — no errors.
6. Open a PR with a short description of the incident, the CVE or reference, and why it belongs in the archive.

### Required fields

| Field | Description |
|---|---|
| `slug` | URL identifier (kebab-case) |
| `exhibit` | Short exhibit code, e.g. `EX-042` |
| `files` | Virtual filesystem — `Record<string, { content: string }>` |
| `steps` | Numbered steps with `goal`, `hint`, and `matches` |
| `debrief` | `summary`, `lesson`, and list of `simulated` behaviours |

### Safety rule

No working exploit code, real credentials, live targets, or step-by-step instructions that could be lifted from the scenario and used against a real system. When in doubt, abstract further.

## Engine and UI changes

Open an issue first for anything non-trivial so we can align on approach before you invest time.

## Code style

- TypeScript strict mode throughout.
- No `useEffect` unless genuinely unavoidable — prefer derived state, event handlers, and ref callbacks.
- Keep the shell engine (`lib/engine/`) free of React imports.
