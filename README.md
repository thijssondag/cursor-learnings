# Cursor Learnings Board

A multiplayer infinite-canvas board where workshop attendees enter their name, drop sticky-note cards with their best Cursor / agentic-engineering tips, heart each other's notes, and see each other's live cursors.

Built with **React + Vite + tldraw** (canvas + live cursors) and **Convex** (realtime backend / single source of truth), styled to a clean "eggshell" editorial aesthetic.

## How it works

- **Identity:** no login. You type a name once; a `sessionId` + color is stored in `localStorage`. Ownership is enforced server-side by matching `authorSessionId` (spoofable, but fine for a workshop).
- **Notes:** stored in Convex. Rendered as a custom tldraw shape (`tip`). You can edit/move/delete only your own notes; everyone can heart any note.
- **Hearts:** one per person per note (toggle). The number is the count of unique people.
- **Cursors:** your pointer position is streamed to Convex (throttled) and other people are rendered as native tldraw cursors with name chips.

## Project structure

```
convex/                 # Backend (single source of truth)
  schema.ts             # notes, hearts, presence tables
  notes.ts              # list / create / update / remove (owner-checked)
  hearts.ts             # toggle (one per person per note)
  presence.ts           # heartbeat / list / leave (live cursors)
src/
  App.tsx               # identity gate -> board
  main.tsx              # ConvexProvider
  components/
    NameModal.tsx       # name entry
    TopBar.tsx          # wordmark, online count, "+ Add note"
  board/
    Board.tsx           # mounts tldraw + hooks
    NoteShapeUtil.tsx   # the custom note card (heart, owner edit, delete)
    useSyncNotes.ts     # reconciles Convex notes <-> tldraw shapes
    usePresence.ts      # streams + renders live cursors
  lib/                  # identity, throttle, constants
  context/IdentityContext.tsx
```

## Running locally

You need Node 20+ and a (free) Convex account.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Convex (first run logs you in, creates a dev deployment, and writes `.env.local`):
   ```bash
   npx convex dev
   ```
   Leave this running.
3. In a second terminal, start the frontend:
   ```bash
   npm run dev
   ```
   Open http://localhost:5173.

Or run both at once:

```bash
npm run dev:all
```

### Test multiplayer locally

Open the app in **two different browsers** (or one normal + one incognito window — a single browser shares `localStorage`, so two normal tabs become the same user). Join with two names and confirm:

- both cursors move live (with name chips),
- a new note appears in both windows,
- hearts update live and the count = unique people,
- you can't edit or move the other person's note (no textarea / delete on theirs).

## Deploying (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Set the build command to `npx convex deploy --cmd 'npm run build'` (this provisions the production Convex deployment and builds the frontend), or run `npx convex deploy` once and add `VITE_CONVEX_URL` as a Vercel env var with `npm run build` as the build command.
3. Connecting `main` gives auto-deploys; pull requests get preview URLs.

## Notes / caveats

- tldraw is free in development and shows a small watermark without a license key — fine for a workshop. A free license key removes it.
- Identity is browser-local and not authenticated; ownership is best-effort (good enough for a trusted workshop crowd).
