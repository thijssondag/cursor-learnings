// Tracks local editing/drag state so the Convex reconciliation loop doesn't fight the user.

let editingNoteId: string | null = null
const draggingNoteIds = new Set<string>()

export function setEditingNoteId(id: string | null) {
  editingNoteId = id
}

export function getEditingNoteId(): string | null {
  return editingNoteId
}

export function setNoteDragging(noteId: string, dragging: boolean) {
  if (dragging) draggingNoteIds.add(noteId)
  else draggingNoteIds.delete(noteId)
}

export function isNoteDragging(noteId: string): boolean {
  return draggingNoteIds.has(noteId)
}

export function clearDraggingNotes() {
  draggingNoteIds.clear()
}
