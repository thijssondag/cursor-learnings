// Tracks local editing/drag state so the Convex reconciliation loop doesn't fight the user.

import { useEffect, useState } from 'react'

let editingNoteId: string | null = null
const draggingNoteIds = new Set<string>()
const justCreatedNoteIds = new Set<string>()
const remoteAppearNoteIds = new Set<string>()
const listeners = new Set<() => void>()

const APPEAR_TTL_MS = 800

function scheduleAppearExpiry(noteId: string, set: Set<string>) {
  window.setTimeout(() => set.delete(noteId), APPEAR_TTL_MS)
}

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

export function markNoteJustCreated(noteId: string) {
  justCreatedNoteIds.add(noteId)
  scheduleAppearExpiry(noteId, justCreatedNoteIds)
}

export function isNoteJustCreated(noteId: string): boolean {
  return justCreatedNoteIds.has(noteId)
}

export function consumeJustCreated(noteId: string): boolean {
  if (!justCreatedNoteIds.has(noteId)) return false
  justCreatedNoteIds.delete(noteId)
  return true
}

export function markRemoteNoteAppear(noteId: string) {
  remoteAppearNoteIds.add(noteId)
  scheduleAppearExpiry(noteId, remoteAppearNoteIds)
}

export function consumeRemoteAppear(noteId: string): boolean {
  if (!remoteAppearNoteIds.has(noteId)) return false
  remoteAppearNoteIds.delete(noteId)
  return true
}

export type NoteEntrance = 'own' | 'remote' | null

export function consumeNoteEntrance(noteId: string): NoteEntrance {
  if (consumeJustCreated(noteId)) return 'own'
  if (consumeRemoteAppear(noteId)) return 'remote'
  return null
}

export type PageKind = 'tip' | 'buildPlan'

export interface NoteForState {
  _id: string
  isOwner: boolean
  text: string
  project?: string
}

function isNoteContentEmpty(note: NoteForState, pageKind: PageKind): boolean {
  if (pageKind === 'buildPlan') {
    return (note.project ?? '').trim() === ''
  }
  return note.text.trim() === ''
}

export function hasUnfinishedOwnedNote(
  notes: NoteForState[] | undefined,
  editingId: string | null,
  pageKind: PageKind,
): boolean {
  if (!notes) return false
  return notes.some(
    (n) =>
      n.isOwner && (isNoteContentEmpty(n, pageKind) || n._id === editingId),
  )
}

export interface AddNoteAvailability {
  canAddNote: boolean
  hint: string
  enabledTitle: string
  addNoteLabel: string
  addNoteLimit: string
  addNoteShortLabel: string
}

function addNoteLabels(pageKind: PageKind, isLocked: boolean) {
  if (!isLocked) {
    return {
      addNoteLabel: 'Add note',
      addNoteLimit: '',
      addNoteShortLabel: 'Add note',
      enabledTitle: 'Add a note to this board',
    }
  }
  if (pageKind === 'buildPlan') {
    return {
      addNoteLabel: 'Add your project',
      addNoteLimit: ' · 1 per person',
      addNoteShortLabel: 'Your project',
      enabledTitle: 'One project per person on this board',
    }
  }
  return {
    addNoteLabel: 'Add your tip',
    addNoteLimit: ' · 1 per person',
    addNoteShortLabel: 'Your tip',
    enabledTitle: 'One tip per person on this board',
  }
}

export function getAddNoteAvailability(
  notes: NoteForState[] | undefined,
  editingId: string | null,
  pageKind: PageKind,
  isLocked: boolean,
): AddNoteAvailability {
  const labels = addNoteLabels(pageKind, isLocked)

  if (!notes) {
    return {
      canAddNote: false,
      hint: 'Loading board…',
      ...labels,
    }
  }

  if (hasUnfinishedOwnedNote(notes, editingId, pageKind)) {
    return {
      canAddNote: false,
      hint: 'Finish or delete your note first',
      ...labels,
    }
  }

  const ownedNotes = notes.filter((n) => n.isOwner)
  if (ownedNotes.length === 0) {
    return { canAddNote: true, hint: labels.enabledTitle, ...labels }
  }

  if (!isLocked) {
    return { canAddNote: true, hint: labels.enabledTitle, ...labels }
  }

  const alreadySharedHint =
    pageKind === 'buildPlan'
      ? 'One project per person — you already shared yours'
      : 'One tip per person — you already shared yours'

  return {
    canAddNote: false,
    hint: alreadySharedHint,
    ...labels,
  }
}
