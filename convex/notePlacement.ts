export const NOTE_WIDTH = 220
export const NOTE_HEIGHT = 168
export const NOTE_GAP = 12

export type NoteRect = {
  x: number
  y: number
  w: number
  h: number
}

export function noteRect(
  x: number,
  y: number,
  w = NOTE_WIDTH,
  h = NOTE_HEIGHT,
): NoteRect {
  return { x, y, w, h }
}

export function rectsOverlap(a: NoteRect, b: NoteRect, gap = NOTE_GAP): boolean {
  return !(
    a.x + a.w + gap <= b.x ||
    b.x + b.w + gap <= a.x ||
    a.y + a.h + gap <= b.y ||
    b.y + b.h + gap <= a.y
  )
}

export function findNonOverlappingPosition(
  preferred: { x: number; y: number },
  existing: Array<{ x: number; y: number }>,
  size: { w: number; h: number } = { w: NOTE_WIDTH, h: NOTE_HEIGHT },
  excludeNoteId?: string,
  noteIds?: string[],
): { x: number; y: number } {
  const obstacles = existing
    .map((n, i) => ({ ...noteRect(n.x, n.y, size.w, size.h), id: noteIds?.[i] }))
    .filter((o) => o.id !== excludeNoteId)

  const candidateAt = (dx: number, dy: number) =>
    noteRect(preferred.x + dx, preferred.y + dy, size.w, size.h)

  const isFree = (rect: NoteRect) =>
    !obstacles.some((o) => rectsOverlap(rect, o))

  const origin = candidateAt(0, 0)
  if (isFree(origin)) return { x: origin.x, y: origin.y }

  const stepX = size.w + NOTE_GAP
  const stepY = size.h + NOTE_GAP

  for (let ring = 1; ring <= 24; ring++) {
    for (let dx = -ring; dx <= ring; dx++) {
      for (let dy = -ring; dy <= ring; dy++) {
        if (Math.abs(dx) !== ring && Math.abs(dy) !== ring) continue
        const candidate = candidateAt(dx * stepX, dy * stepY)
        if (isFree(candidate)) return { x: candidate.x, y: candidate.y }
      }
    }
  }

  return { x: origin.x, y: origin.y }
}
