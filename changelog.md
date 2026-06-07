# Changelog

All notable changes to the Cursor Learnings Board are documented here.

## [0.3.1] — 2026-06-07

Fix production white screen after ~5 seconds (by Thijs / agent).

### Fixed

- **tldraw license:** Pass `licenseKey={import.meta.env.VITE_TLDRAW_LICENSE_KEY}` in `Board.tsx` so production no longer hits tldraw's 5s unlicensed shutdown.
- **Long sessions:** Removed `visibilitychange` leave from cursor broadcast; presence stale window increased to 30s.
- **Crash visibility:** Added `ErrorBoundary` in `main.tsx` so future render errors show a message instead of a blank page.

## [0.3.0] — 2026-06-07

Pages, drawing, and minimal tldraw UI (by Thijs / agent).

### Added

- **Multi-page boards:** `pages` Convex table; main **Cursor Learnings** page is locked and cannot be deleted. Anyone can create pages; only the creator can delete their own pages.
- **Page menu:** ⋯ menu in the top bar to switch pages, create a new page, or delete a page you own.
- **Collaborative drawing:** Freehand strokes sync per page via `drawings` table; **Clear drawings** button removes all strokes on the current page for everyone.
- **Minimal tldraw UI:** Only Select and Draw tools; standard zoom controls (+/−) via tldraw navigation panel; other tldraw chrome disabled. Draw tool uses a fixed stroke size with color picker only.

### Changed

- **Note movement:** Any user can move any note on the board (position sync has no ownership check). Text editing and delete remain owner-only.

## [0.2.2] — 2026-06-07

Cursor logo watermark (by Thijs / agent).

### Changed

- **Logo:** Replaced the wide banner image with the official Cursor icon (`cursor-mark.svg`) as a tiny bottom-left watermark on tldraw’s background layer (behind notes). Links to [cursor.com](https://cursor.com); notes can be placed over it.

## [0.2.1] — 2026-06-07

Fix delete note flow (by Thijs / agent).

### Fixed

- **Delete confirm:** tldraw was stealing pointer events from the modal (blocker layer + per-shape modal state). Delete is now a single board-level modal at `z-index: 20000`, canvas input is paused while open, and `noteId` is reconciled on sync so the mutation always receives a valid Convex id.

## [0.2.0] — 2026-06-07

Board UX polish (by Thijs / agent).

### Added

- **Profiles:** Optional X handle and LinkedIn URL on join; `profiles` Convex table with `upsert` mutation; "Edit profile" link in top bar.
- **Social icons:** Minimal X / LinkedIn icons to the right of author names on notes — hidden when unset; each opens the author's profile in a new tab.
- **Cursor logo:** Left border strip with Cursor logo (`public/cursor-logo.png`).
- **Heart animation:** Brief scale pop on like with `prefers-reduced-motion` support.
- **One note at a time:** "+ Add note" disabled while an owned note is empty or being edited.

### Changed

- **Foreign notes:** Non-owner notes block click/double-click selection overlay; tldraw selection guard clears selection on others' notes.
- **Delete modal:** Portaled to `document.body` (fixes canvas-trapped overlay); trash icon button with larger hit target and hover state.
- **Modal animations:** Subtle backdrop fade + card scale on delete and profile modals.

## [0.1.0] — 2026-06-05

Initial version (by Thijs / agent).

### Added

- **Project scaffold:** Vite + React + TypeScript, Tailwind v4, tldraw, Convex, deployed-ready for Vercel.
- **Design system:** eggshell theme tokens from `Design/DESIGN.md`, Inter + Cormorant Garamond fonts, matching the approved mockup `Design/75566527-...png`.
- **Identity:** name-entry modal; per-browser `sessionId` + assigned color in `localStorage` (`src/lib/identity.ts`).
- **Convex backend** (`convex/`):
  - `schema.ts` — `notes`, `hearts`, `presence` tables with indexes.
  - `notes.ts` — `list` (with heart count + ownership), `create`, `update`, `remove` (owner-checked).
  - `hearts.ts` — `toggle` (one heart per person per note).
  - `presence.ts` — `heartbeat`, `list` (stale-filtered), `leave`.
- **Canvas:** tldraw mounted with a custom `tip` shape (`NoteShapeUtil.tsx`) rendering the note card — owner-only textarea, delete button, and a heart with live count.
- **Sync:** `useSyncNotes` reconciles Convex notes with tldraw shapes, persists owner moves, and blocks/reverts edits to other people's notes.
- **Live cursors:** `usePresence` streams the local cursor (throttled) and renders other users as native tldraw cursors with colored name chips.
- **Top bar:** serif wordmark, "N online" indicator, and "+ Add note" pill; responsive down to mobile widths.
- **Docs:** `README.md` with local-run and deploy steps.

### Verified

- Join, add note, edit own note (text persists), heart toggle (unique-person count), ownership read-only enforcement for non-owners, presence online count, and remote cursor rendering — all tested in-browser.

### Known caveats

- Identity is browser-local and unauthenticated; ownership is best-effort (acceptable for a trusted workshop).
- tldraw shows a small watermark without a license key.

## [0.1.3] — 2026-06-05

Fix Vercel white screen (by Thijs / agent).

### Fixed

- **Vercel build:** Added `vercel.json` so builds run `npx convex deploy --cmd 'npm run build'`, injecting `VITE_CONVEX_URL` from `CONVEX_DEPLOY_KEY`.
- **Startup:** Show a clear configuration message instead of a blank page when `VITE_CONVEX_URL` is missing.
- **Gitignore:** Ignore `.env` files so deploy keys are not committed.

## [0.1.2] — 2026-06-05

Multiplayer cursor reliability and mockup-accurate rendering (by Thijs / agent).

### Changed

- **Presence:** Shared `PresenceContext` replaces duplicate `useQuery(api.presence.list)` subscriptions.
- **Cursor broadcast:** `useCursorBroadcast` tracks pointer on the tldraw container via `screenToPage`, syncs tldraw user prefs, and disconnects on `pagehide` / `visibilitychange`.
- **Remote cursors:** Custom `RemoteCursors` overlay (SVG arrow + pastel name pill with dark text) replaces tldraw `InstancePresenceRecordType` injection; positions stay correct while panning/zooming.
- **Backend:** `presence.heartbeat` skips full row patches when position/name/color are unchanged (still updates `lastSeen` on keepalive).

## [0.1.1] — 2026-06-05

UX improvements (by Thijs / agent).

### Changed

- **Dragging:** All notes have a visible drag handle; pointer-events fixed so tldraw can translate shapes. Anyone can move any note; only owners can edit text or delete.
- **Backend:** New `notes.move` mutation (anyone updates x/y); `notes.update` is text-only and owner-checked.
- **Delete:** Browser `confirm()` replaced with an in-app `DeleteConfirmModal` matching the design system.
- **Names:** Join name is trimmed/validated; own-note cards show live `identity.name`; empty names rejected on note create.
- **Sync:** Position reconciliation skips notes currently being dragged to prevent snap-back.
