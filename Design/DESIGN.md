# Cursor — Style Reference

> Warm paper command center: cream-white pages, espresso-black type, and a single orange accent reserved for interactive moments.

**Themes:** light and dark (user toggle with system default)

This app follows [cursor.com](https://cursor.com/)'s editorial aesthetic using open font substitutes. Proprietary CursorGothic and Berkeley Mono are not bundled.

## Semantic tokens (runtime)

Defined in [`src/index.css`](../src/index.css) on `:root` / `[data-theme="dark"]`. Use `var(--color-*)` in components.

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--color-bg` | `#f7f7f4` | `#141414` | Page / canvas background |
| `--color-text` | `#26251e` | `#f7f7f4` | Primary text |
| `--color-text-muted` | `#7a7974` | `#a1a19f` | Secondary text |
| `--color-text-faint` | `#a1a19f` | `#8f8e89` | Placeholders, icons |
| `--color-surface` | `#ffffff` | `#26251e` | Cards, modals, inputs |
| `--color-surface-muted` | `#e6e5e0` | `#2e2d28` | Hover rows, note drag bar |
| `--color-border` | `#d9d5cf` | `rgba(247,247,244,0.12)` | Dividers, outlines |
| `--color-accent` | `#f54e00` | `#f54e00` | Links, hovers, liked hearts |
| `--color-btn-bg` | `#26251e` | `#f7f7f4` | Filled primary buttons |
| `--color-btn-text` | `#f7f7f4` | `#26251e` | Text on filled buttons |
| `--color-error` | `#b42318` | `#f87171` | Destructive actions |

## Brand palette (reference)

| Name | Value | Role |
|------|-------|------|
| Page Parchment | `#f7f7f4` | Light canvas |
| Espresso Ink | `#26251e` | Warm near-black text |
| Card Stone | `#e6e5e0` | Elevated surfaces |
| Border Sand | `#d9d5cf` | Hairline borders |
| Ember Orange | `#f54e00` | Interactive accent only |
| Deep Charcoal | `#141414` | Dark canvas |

## Typography

| Role | Family | Weight | Usage |
|------|--------|--------|-------|
| UI | Inter Tight | 400 | Body, buttons, nav, labels |
| Display | EB Garamond | 400 | Modal titles, page name |
| Mono | JetBrains Mono | 400 | Code (if needed) |

Substitutes for CursorGothic (proprietary): Inter Tight with `-0.02em` tracking at 36px+.

## Shape

- Buttons: pill radius (`9999px`)
- Cards / modals: `16px`
- Inputs / tags: `4px`
- Button font-weight: **400** (never 500/700 for UI chrome)

## Theme behavior

- Preference: `light` | `dark` | `system` (default `system`)
- Stored in `localStorage` key `theme-preference`
- Applied via `document.documentElement.dataset.theme`
- tldraw `colorScheme` synced to resolved theme

## Do

- Use `--color-text` and `--color-bg` — never pure `#000` / `#fff`
- Apply `--color-accent` only on interactive hovers and links
- Keep surfaces 95%+ achromatic warm neutrals

## Don't

- Use the Cursor logo or lockup in the product UI
- Use accent orange as large background fills
- Add drop shadows to nav pills or text buttons
