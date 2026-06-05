# Changelog

All notable changes to the Cursor Learnings Board are documented here.

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
