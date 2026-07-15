# AGENTS.md

## Cursor Cloud specific instructions

### Overview

EmulateHacks is a fully client-side Next.js 16 app (App Router, Turbopack) that recreates historic security incidents as interactive browser terminals. No backend, no database, no auth, no environment variables required.

### Package Manager & Runtime

- **Bun** is the package manager (`bun.lock`). Use `bun install` for dependencies.
- Node.js is also needed for `portless` (installed globally via npm).

### Running the Dev Server

The standard `bun dev` command uses `portless` to route `emulatehack.wterm.localhost` to the Next.js dev server. In a Cloud Agent environment where custom local domains may not resolve, run Next.js directly:

```bash
npx next dev --turbopack --port 3000
```

The WASM file must be in `public/` before starting — run the predev script first or copy manually:
```bash
mkdir -p public && cp node_modules/@wterm/core/wasm/wterm.wasm public/wterm.wasm
```

### Lint / Type-check / Test

- `bun run lint` — ESLint (flat config, eslint-config-next)
- `bun run type-check` — `tsc --noEmit`
- `bun run test:scenarios`: headless scenario runner verifying all 48 scenarios (315 steps) are reachable end-to-end

### Build

```bash
bun run build
```

### Key Caveats

- The `predev` / `prebuild` scripts automatically copy the WASM binary. If you skip them (e.g. running `next dev` directly), ensure `public/wterm.wasm` exists.
- No `.env` file or secrets are needed.
- The CONTRIBUTING.md recommends: no `useEffect` unless genuinely unavoidable — prefer derived state, event handlers, and ref callbacks.
