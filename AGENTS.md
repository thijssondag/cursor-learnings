<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Cursor Cloud specific instructions

**Cursor Learnings Board** — React + Vite frontend with a Convex realtime backend (no Docker, no local DB).

### Services

| Service | Command | URL |
|---|---|---|
| Frontend (Vite) | `npm run dev` | http://localhost:5173 |
| Convex sync | `npm run convex` (or `npx convex dev`) | Backend: http://127.0.0.1:3210 |
| Both together | `npm run dev:all` | — |
| Convex dashboard | started by `convex dev` | http://127.0.0.1:6790 |

Run `npm run dev:all` in a tmux session for local development. The frontend requires `VITE_CONVEX_URL` in `.env.local` (gitignored).

### Convex in Cloud Agent VMs

No Convex cloud account is required for local dev. Provision an anonymous local deployment once per session (or when `.env.local` is missing):

```bash
CONVEX_AGENT_MODE=anonymous npx convex dev --once
```

Then start `npm run dev:all`. Re-run `convex dev --once` after editing files under `convex/` to push schema/function changes.

### Lint / build / tests

- Lint: `npm run lint`
- Production build: `npm run build` (requires `.env.local` with `VITE_CONVEX_URL`)
- No automated test script is defined in `package.json`

### Hello-world verification

1. Open http://localhost:5173
2. Enter a display name on the modal and join the board
3. Click **+ Add note**, type a tip, and confirm it appears on the canvas with your name

For multiplayer checks, use two browser profiles (normal + incognito) because `localStorage` is shared across tabs in the same profile.
