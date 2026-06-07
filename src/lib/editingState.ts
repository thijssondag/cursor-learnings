// Tracks local editing/drag state so the Convex reconciliation loop doesn't fight the user.

import { useEffect, useState } from 'react'

let editingNoteId: string | null = null
const draggingNoteIds = new Set<string>()
let focusNoteId: string | null = null
const listeners = new Set<() => void>()

function notifyEditingListeners() {
  listeners.forEach((l) => l())
}

export function subscribeEditingState(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useEditingNoteId(): string | null {
  const [, tick] = useState(0)
  useEffect(() => subscribeEditingState(() => tick((n) => n + 1)), [])
  return editingNoteId
}

export function setEditingNoteId(id: string | null) {
  editingNoteId = id
  notifyEditingListeners()
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

export function requestNoteFocus(noteId: string) {
  focusNoteId = noteId
}

export function consumeFocusRequest(noteId: string): boolean {
  if (focusNoteId === noteId) {
    focusNoteId = null
    return true
  }
  return false
}

export interface NoteForState {
  _id: string
  isOwner: boolean
  text: string
}

export function hasUnfinishedOwnedNote(
  notes: NoteForState[] | undefined,
  editingId: string | null,
): boolean {
  if (!notes) return false
  return notes.some(
    (n) =>
      n.isOwner && (n.text.trim() === '' || n._id === editingId),
  )
}
