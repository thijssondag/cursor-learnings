# Changelog

All notable changes to the Cursor Learnings Board are documented here.

## [0.0.8] — 2026-06-10

Top bar responsive breakpoint tweak (by Thijs / agent).

### Changed

- **Toolbar collapse:** System, QR, Clear Drawings, Fit, theme, and Edit profile now move into the page menu below 1200px width so the header stays uncluttered on laptops and narrow desktop windows.

## [0.0.7] — 2026-06-10

Per-page participation QR codes and deep linking (by Thijs / agent).

### Added

- **Per-page QR codes:** The in-app QR overlay encodes a page-specific URL for Cursor Learnings (`?page=learnings`) and Cursor Nijmegen Build Plans (`?page=build-plans`).
- **Deep linking:** Opening or scanning a participation URL with `?page=` lands on the matching system page after join.
- **Static QR assets:** `public/qr/cursor-learnings.png` and `public/qr/cursor-nijmegen-build-plans.png` for PowerPoint slides.
- **QR generator script:** `npm run generate:qr` regenerates the PNG assets from the canonical participation URLs.

### Changed

- **URL sync:** Switching between system pages updates the browser URL so refresh and share links stay on the same board.

## [0.0.6] — 2026-06-10

Cursor Nijmegen Build Plans page (by Thijs / agent).

### Changed

- **Page menu order:** Build Plans now appears second in the page list, directly after Cursor Learnings.
- **Build plan note size:** Notes on the Build Plans page are wider (280px) and taller (300px), with more room in the support question field.

### Added

- **Build Plans page:** Locked system page "Cursor Nijmegen Build Plans" auto-created alongside Cursor Learnings on bootstrap.
- **Two-field notes:** Build-plan notes show "What are you building?" (required) and "What support are you looking for?" (optional) instead of a single tip textarea.
- **Page kinds:** `pageKind` on pages (`tip` | `buildPlan`) drives note layout and add-note button labels.

### Changed

- **One note per person:** Locked pages enforce one note per person with page-specific copy (tip vs project).
- **System pages:** Bootstrap ensures both Cursor Learnings and Build Plans exist by name among locked pages.

## [0.0.5] — 2026-06-10

Version bump and production deploy (by Thijs / agent).

### Changed

- **Page menu:** Bumped displayed app version to v0.0.5.

## [0.0.8] — 2026-06-09

Mobile board UX improvements (by Thijs / agent).

### Changed

- **Mobile camera:** Auto zoom-to-fit on narrow screens after load, page switch, and orientation change so multiple notes stay visible.
- **Fit button:** Mobile-only top-bar control to re-fit all notes after panning or zooming.
- **Mobile toolbar:** Shows essential tools only (select, hand, draw, eraser, add note); hand tool is the default on mobile.
- **Safe areas:** Added `viewport-fit=cover` and bottom safe-area padding for the tldraw toolbar.

## [0.0.7] — 2026-06-09

Fix newly created note not draggable (by Thijs / agent).

### Changed

- **Page menu:** Bumped displayed app version to v0.0.4.

### Fixed

- **Note drag by ownership:** Other people's notes can be dragged from the header and text body; your own notes still drag only from the top bar so the textarea stays editable.
- **Note drag on create:** Removed auto-focus on the textarea after adding a note. The focused input was consuming the first pointer interaction on the drag header, so users had to click the canvas once before a note could move.
- **Note move sync:** Keep drag state until the Convex `moveNote` mutation finishes, preventing position snap-back on pointer-up.
- **Clear drawings:** Strokes no longer reappear after clearing when clicking the canvas. Outbound sync is paused during clear, stale draw refs are dropped, and Convex is cleared before local shapes are removed.

## [0.0.6] — 2026-06-09

Page-specific note limits (by Thijs / agent).

### Changed

- **Cursor Learnings:** Still one tip per person; button shows "Add your tip · 1 per person".
- **Project pages:** Unlimited notes per person; button shows "Add note" without the per-person limit.
- **Both page types:** Users must finish or delete an in-progress note before adding another.

## [0.0.5] — 2026-06-09

Note card owner menu and page menu cleanup (by Thijs / agent).

### Changed

- **Note options:** Moved color picker and delete into a three-dot menu in the top-right of owned notes, freeing footer space for author name and LinkedIn/X links.
- **Page menu:** Removed duplicate "Edit profile" from the pages dropdown; it remains next to the online count in the top bar.
- **Top bar:** Theme toggle matches pill button sizing; "Clear canvas" renamed to "Clear Drawings".

## [0.0.4] — 2026-06-09

Favicon update (by Thijs / agent).

### Changed

- **Favicon:** Replaced the custom purple bolt icon with the official Cursor favicons from [cursor.com](https://cursor.com) (dark + light SVG variants and `.ico` fallback).

## [0.0.3] — 2026-06-07

Fix drawings appearing on every page (by Thijs / agent).

### Fixed

- **Per-page canvas:** Switching pages now clears local tldraw shapes and hydrates only that page's drawings from Convex. Fixes shared smiley/drawings showing on Logiland and other pages.

## [0.0.2] — 2026-06-07

Cursor watermark link fix (by Thijs / agent).

### Fixed

- **Cursor logo:** Moved to a fixed overlay so clicks open [cursor.com](https://cursor.com) in a new tab (was blocked by the tldraw canvas layer).

## [0.0.1] — 2026-06-07

Live deploy marker (by Thijs / agent).

### Added

- **Version label:** `v0.0.1` shown under "New page" in the pages menu (small, 30% opacity) to confirm which build is live.

## [0.5.1] — 2026-06-07

Further performance polish (by Thijs / agent).

### Changed

- **Note moves:** Position syncs to Convex on pointer-up only (was throttled every 200ms during drag), cutting write load during note rearranging.
- **Lazy board load:** tldraw and the board shell load via `React.lazy` after join; lightweight loading screen shown first.

## [0.5.0] — 2026-06-07

Performance optimizations for ~40 concurrent users (by Thijs / agent).

### Changed

- **notes.list:** Replaced per-note hearts/profile queries with denormalized `heartCount`, `authorXHandle`, and `authorLinkedInUrl` on notes; batch `likedByMe` via `hearts.by_session` index (2 reads per page).
- **hearts.toggle:** Maintains denormalized `heartCount` on the note document.
- **profiles.upsert:** Propagates social links to all notes by the same author.
- **presence:** Added `by_lastSeen` index; split `updateCursor` (position only) from `touch` (keepalive); cursor throttle raised to 150ms.
- **Remote cursors:** Single `useValue` subscription for all remote cursors instead of one per user.
- **Canvas sync:** Incremental remote reconcile (skip unchanged shapes + version token); draw throttle raised to 120ms.
- **pages.bootstrap:** No longer full-table scans; use `maintenance.backfillDenormalized` once for legacy data.

## [0.4.1] — 2026-06-07

Fix canvas shape persistence on refresh (by Thijs / agent).

### Fixed

- **Shape load failure:** `drawings:list` crashed when legacy rows lacked `shapeType` (Convex schema validation). Field is now optional; bootstrap backfills missing values.
- **Save reliability:** New shapes upsert immediately on create; hydration guard prevents premature orphan deletion during initial sync.

## [0.4.0] — 2026-06-07

Sync all canvas shapes and fix toolbar (by Thijs / agent).

### Added

- **Full canvas sync:** All tldraw shapes (draw, geo, arrow, text, line, etc.) sync per page via Convex `drawings` table with `shapeType`. Custom `tip` notes remain in the `notes` table.
- **Live drawing:** Freehand strokes upsert at 50ms while drawing, flush on pointer-up; static shapes at 200ms.
- **Custom toolbar:** All shape tools except media upload and tldraw sticky note; custom **Add note** button creates our Convex notes.

### Changed

- **Clear canvas** (was "Clear drawings") removes all synced canvas shapes for everyone; notes are untouched.
- **Editor guards** block creation of image, video, bookmark, embed, and tldraw note shapes.

## [0.3.3] — 2026-06-07

Cursor watermark updates (by Thijs / agent).

### Changed

- **Logo:** Moved the Cursor watermark from bottom-left to bottom-right to leave room for the canvas dimension scaler on the left.
- **Logo asset:** Switched to the official vertical 2D lockup (`public/cursor-lockup-vertical.png`) with a transparent background.
- **Logo position:** Inset watermark 2% from the bottom and right edges.

## [0.3.2] — 2026-06-07

Page menu per-row actions (by Thijs / agent).

### Added

- **Page rename:** `pages.rename` Convex mutation; owners can rename their pages via a pencil icon in the page menu.
- **Per-row actions:** Edit and delete icons appear beside each page you own; locked pages show no icons.

### Changed

- **Page menu:** Removed the bottom "Delete this page" item; delete is now a trash icon on each deletable page row.

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
