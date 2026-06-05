import { useEffect, useMemo, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { Editor } from 'tldraw'
import { createShapeId } from 'tldraw'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { Identity } from '../lib/identity'
import {
  clearDraggingNotes,
  getEditingNoteId,
  isNoteDragging,
  setNoteDragging,
} from '../lib/editingState'
import { throttle } from '../lib/throttle'
import type { NoteShape } from './NoteShapeUtil'

type ConvexNote = {
  _id: Id<'notes'>
  text: string
  x: number
  y: number
  rotation: number
  color: string
  authorName: string
  heartCount: number
  likedByMe: boolean
  isOwner: boolean
}

/**
 * Keeps tldraw's canvas in sync with Convex (the single source of truth):
 *  - Convex notes  -> tldraw note shapes (create / update / delete)
 *  - anyone drags  -> Convex move (persist new x/y)
 *  - owner edits   -> Convex update (text only)
 */
export function useSyncNotes(editor: Editor | null, identity: Identity) {
  const notes = useQuery(api.notes.list, { sessionId: identity.sessionId })
  const moveNote = useMutation(api.notes.move)

  const notesByIdRef = useRef<Map<string, ConvexNote>>(new Map())
  const isApplyingRemoteRef = useRef(false)

  const persistMove = useMemo(
    () =>
      throttle((id: string, x: number, y: number) => {
        void moveNote({
          noteId: id as Id<'notes'>,
          x,
          y,
        })
      }, 200),
    [moveNote],
  )

  // Reconcile Convex -> tldraw whenever the notes query changes.
  useEffect(() => {
    if (!editor || !notes) return

    const map = new Map<string, ConvexNote>()
    for (const n of notes) map.set(n._id, n as ConvexNote)
    notesByIdRef.current = map

    isApplyingRemoteRef.current = true
    editor.store.mergeRemoteChanges(() => {
      const existing = editor
        .getCurrentPageShapes()
        .filter((s) => s.type === 'tip') as unknown as NoteShape[]

      const shapeByNoteId = new Map<string, NoteShape>()
      for (const s of existing) shapeByNoteId.set(s.props.noteId, s)

      const editingId = getEditingNoteId()

      for (const n of notes as ConvexNote[]) {
        const shape = shapeByNoteId.get(n._id)
        if (!shape) {
          editor.createShape<NoteShape>({
            id: createShapeId(),
            type: 'tip',
            x: n.x,
            y: n.y,
            rotation: n.rotation,
            props: {
              w: 220,
              h: 168,
              noteId: n._id,
              text: n.text,
              color: n.color,
              authorName: n.authorName,
              heartCount: n.heartCount,
              likedByMe: n.likedByMe,
              isOwner: n.isOwner,
            },
          })
          continue
        }

        const nextProps: Partial<NoteShape['props']> = {}
        if (n._id !== editingId && shape.props.text !== n.text) nextProps.text = n.text
        if (shape.props.heartCount !== n.heartCount) nextProps.heartCount = n.heartCount
        if (shape.props.likedByMe !== n.likedByMe) nextProps.likedByMe = n.likedByMe
        if (shape.props.isOwner !== n.isOwner) nextProps.isOwner = n.isOwner
        if (shape.props.authorName !== n.authorName) nextProps.authorName = n.authorName

        // Don't snap back a note the user is currently dragging.
        const posChanged =
          !isNoteDragging(n._id) && (shape.x !== n.x || shape.y !== n.y)

        if (posChanged || Object.keys(nextProps).length > 0) {
          editor.updateShape<NoteShape>({
            id: shape.id,
            type: 'tip',
            ...(posChanged ? { x: n.x, y: n.y } : {}),
            props: nextProps,
          })
        }
      }

      for (const s of existing) {
        if (!map.has(s.props.noteId)) editor.deleteShape(s.id)
      }
    })
    isApplyingRemoteRef.current = false
  }, [editor, notes])

  // tldraw -> Convex: persist moves for all notes.
  useEffect(() => {
    if (!editor) return

    const dispose = editor.store.listen(
      (entry) => {
        for (const record of Object.values(entry.changes.updated)) {
          const to = record[1]
          if (to.typeName !== 'shape' || to.type !== 'tip') continue
          const shape = to as unknown as NoteShape
          const note = notesByIdRef.current.get(shape.props.noteId)
          if (!note) continue

          if (shape.x !== note.x || shape.y !== note.y) {
            setNoteDragging(shape.props.noteId, true)
            persistMove(shape.props.noteId, shape.x, shape.y)
          }
        }
      },
      { source: 'user', scope: 'document' },
    )

    const clearOnPointerUp = () => clearDraggingNotes()
    window.addEventListener('pointerup', clearOnPointerUp)
    window.addEventListener('pointercancel', clearOnPointerUp)

    const disposeDelete = editor.sideEffects.registerBeforeDeleteHandler(
      'shape',
      (shape) => {
        if (shape.type === 'tip' && !isApplyingRemoteRef.current) return false
        return undefined
      },
    )

    return () => {
      dispose()
      window.removeEventListener('pointerup', clearOnPointerUp)
      window.removeEventListener('pointercancel', clearOnPointerUp)
      disposeDelete()
      clearDraggingNotes()
    }
  }, [editor, persistMove])
}
