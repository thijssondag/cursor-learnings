import { USER_COLORS } from './identity'

export const NOTE_COLORS = USER_COLORS

export const DEFAULT_NOTE_COLOR = NOTE_COLORS[0]

export function isNoteColor(value: string): value is (typeof NOTE_COLORS)[number] {
  return (NOTE_COLORS as readonly string[]).includes(value)
}

/** Retired swatches — still render on existing notes. */
const LEGACY_NOTE_COLORS = ['#fb7185', '#4ade80'] as const

export function isNoteColorOrLegacy(value: string): boolean {
  return isNoteColor(value) || (LEGACY_NOTE_COLORS as readonly string[]).includes(value)
}

/**
 * Per-hue mix ratios [background%, header%, border%].
 * Tuned so every card reads as a distinct tint while keeping
 * ≥ 4.5:1 contrast ratio with --color-text for body copy.
 * Mixed in oklch for perceptually uniform lightness across hues.
 */
const SURFACE_MIX: Record<string, [bg: number, header: number, border: number]> = {
  '#34d399': [16, 28, 38], // mint — bright green, absorbs more mix
  '#f472b6': [11, 20, 30], // pink — saturated, needs restraint
  '#60a5fa': [14, 24, 34], // blue — cooler mid-range
  '#a78bfa': [12, 22, 32], // purple — slightly less luminant
  '#fbbf24': [10, 18, 28], // amber — very bright, minimal mix
  '#22d3ee': [14, 24, 34], // cyan — similar to blue
  '#fb7185': [11, 20, 30], // rose — warm saturated like pink
  '#4ade80': [15, 26, 36], // green — bright and open
}

const FALLBACK_MIX: [number, number, number] = [13, 22, 32]

export function noteSurfaceStyles(color: string) {
  const [bg, header, border] = SURFACE_MIX[color] ?? FALLBACK_MIX
  return {
    background: `color-mix(in oklch, ${color} ${bg}%, var(--color-surface))`,
    headerBackground: `color-mix(in oklch, ${color} ${header}%, var(--color-surface-muted))`,
    borderColor: `color-mix(in oklch, ${color} ${border}%, var(--color-border))`,
  }
}

/** Swatch fill — same oklch mix as card surfaces, but strong enough to read at icon size. */
export function noteSwatchColor(color: string) {
  return `color-mix(in oklch, ${color} 52%, var(--color-surface-muted))`
}
