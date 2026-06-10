import { useEffect, useRef } from 'react'
import type { Editor } from 'tldraw'
import type { Id } from '../../convex/_generated/dataModel'
import { isNoteDragging } from '../lib/editingState'
import { fitPageToViewport } from './useMobileCameraFit'

const AUTO_FIT_POLL_MS = 5000
const VIEW_CONTAIN_INSET = 24

type NoteSummary = { _id: Id<'notes'>; x: number; y: number }

function notesFingerprint(notes: NoteSummary[]): string {
  return notes
    .map((n) => `${n._id}:${n.x.toFixed(1)},${n.y.toFixed(1)}`)
    .sort()
    .join('|')
}

function isAnyNoteDragging(notes: NoteSummary[]): boolean {
  return notes.some((n) => isNoteDragging(n._id))
}

export function areAllNotesInView(editor: Editor): boolean {
  const viewport = editor.getViewportPageBounds()
  const innerMinX = viewport.minX + VIEW_CONTAIN_INSET
  const innerMinY = viewport.minY + VIEW_CONTAIN_INSET
  const innerMaxX = viewport.maxX - VIEW_CONTAIN_INSET
  const innerMaxY = viewport.maxY - VIEW_CONTAIN_INSET

  const shapes = editor.getCurrentPageShapes().filter((s) => s.type === 'tip')
  if (shapes.length === 0) return true

  for (const shape of shapes) {
    const bounds = editor.getShapePageBounds(shape.id)
    if (!bounds) return false
    if (
      bounds.minX < innerMinX ||
      bounds.minY < innerMinY ||
      bounds.maxX > innerMaxX ||
      bounds.maxY > innerMaxY
    ) {
      return false
    }
  }

  return true
}

function scheduleFit(editor: Editor): () => void {
  const frame = window.requestAnimationFrame(() => {
    fitPageToViewport(editor, true)
  })
  return () => window.cancelAnimationFrame(frame)
}

/**
 * When auto-fit is enabled, refits the viewport after notes are added, moved, or deleted,
 * and polls every 5s to recover if any note drifts out of view.
 */
export function useAutoFitFollow(
  editor: Editor | null,
  notes: NoteSummary[] | undefined,
  currentPageId: Id<'pages'> | null,
  isAutoFitEnabled: boolean,
) {
  const lastFingerprintRef = useRef('')
  const hasSnapshotRef = useRef(false)
  const lastPageIdRef = useRef<Id<'pages'> | null>(null)

  useEffect(() => {
    if (!editor || !currentPageId) return

    if (lastPageIdRef.current !== currentPageId) {
      lastPageIdRef.current = currentPageId
      lastFingerprintRef.current = ''
      hasSnapshotRef.current = false
    }

    if (!notes) return

    const fingerprint = notesFingerprint(notes)

    if (!hasSnapshotRef.current) {
      lastFingerprintRef.current = fingerprint
      hasSnapshotRef.current = true
      if (isAutoFitEnabled) {
        return scheduleFit(editor)
      }
      return
    }

    if (!isAutoFitEnabled) {
      lastFingerprintRef.current = fingerprint
      return
    }

    const layoutChanged = fingerprint !== lastFingerprintRef.current
    lastFingerprintRef.current = fingerprint

    if (!layoutChanged || isAnyNoteDragging(notes)) return

    return scheduleFit(editor)
  }, [editor, notes, currentPageId, isAutoFitEnabled])

  useEffect(() => {
    if (!editor || !currentPageId || !isAutoFitEnabled) return

    const id = window.setInterval(() => {
      if (notes && isAnyNoteDragging(notes)) return
      if (!areAllNotesInView(editor)) {
        fitPageToViewport(editor, true)
      }
    }, AUTO_FIT_POLL_MS)

    return () => window.clearInterval(id)
  }, [editor, currentPageId, isAutoFitEnabled, notes])
}
