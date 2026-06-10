import { useEffect, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { Editor } from 'tldraw'
import { createShapeId } from 'tldraw'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { Identity } from '../lib/identity'
import {
  BUILD_PLAN_NOTE_HEIGHT,
  BUILD_PLAN_NOTE_WIDTH,
  NOTE_HEIGHT,
  NOTE_WIDTH,
} from '../lib/constants'
import { usePageContext } from '../context/PageContext'
import {
  clearDraggingNotes,
  getEditingNoteId,
  isNoteDragging,
  isNoteJustCreated,
  markRemoteNoteAppear,
  setEditingNoteId,
  setNoteDragging,
} from '../lib/editingState'
import type { NoteShape } from './NoteShapeUtil'

type ConvexNote = {
  _id: Id<'notes'>
  text: string
  project: string
  supportQuestion: string
  x: number
  y: number
  rotation: number
  color: string
  authorName: string
  authorXHandle: string
  authorLinkedInUrl: string
  heartCount: number
  likedByMe: boolean
  isOwner: boolean
}

export function useSyncNotes(editor: Editor | null, identity: Identity) {
  const { currentPageId, currentPage } = usePageContext()
  const pageKind = currentPage?.pageKind ?? 'tip'
  const noteWidth =
    pageKind === 'buildPlan' ? BUILD_PLAN_NOTE_WIDTH : NOTE_WIDTH
  const noteHeight =
    pageKind === 'buildPlan' ? BUILD_PLAN_NOTE_HEIGHT : NOTE_HEIGHT

  const notes = useQuery(
    api.notes.list,
    currentPageId
      ? { sessionId: identity.sessionId, pageId: currentPageId }
      : 'skip',
  )
  const moveNote = useMutation(api.notes.move)

  const notesByIdRef = useRef<Map<string, ConvexNote>>(new Map())
  const isApplyingRemoteRef = useRef(false)
  const pendingMoveRef = useRef(new Map<string, { x: number; y: number }>())

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
          if (!isNoteJustCreated(n._id)) {
            markRemoteNoteAppear(n._id)
          }
          editor.createShape<NoteShape>({
            id: createShapeId(),
            type: 'tip',
            x: n.x,
            y: n.y,
            rotation: n.rotation,
            props: {
              w: noteWidth,
              h: noteHeight,
              noteId: n._id,
              text: n.text,
              project: n.project,
              supportQuestion: n.supportQuestion,
              color: n.color,
              authorName: n.authorName,
              authorXHandle: n.authorXHandle,
              authorLinkedInUrl: n.authorLinkedInUrl,
              heartCount: n.heartCount,
              likedByMe: n.likedByMe,
              isOwner: n.isOwner,
            },
          })
          continue
        }

        const nextProps: Partial<NoteShape['props']> = {}
        if (n._id !== editingId && shape.props.text !== n.text) nextProps.text = n.text
        if (n._id !== editingId && shape.props.project !== n.project) {
          nextProps.project = n.project
        }
        if (n._id !== editingId && shape.props.supportQuestion !== n.supportQuestion) {
          nextProps.supportQuestion = n.supportQuestion
        }
        if (shape.props.heartCount !== n.heartCount) nextProps.heartCount = n.heartCount
        if (shape.props.likedByMe !== n.likedByMe) nextProps.likedByMe = n.likedByMe
        if (shape.props.isOwner !== n.isOwner) nextProps.isOwner = n.isOwner
        if (shape.props.authorName !== n.authorName) nextProps.authorName = n.authorName
        if (shape.props.noteId !== n._id) nextProps.noteId = n._id
        if (shape.props.authorXHandle !== n.authorXHandle) {
          nextProps.authorXHandle = n.authorXHandle
        }
        if (shape.props.authorLinkedInUrl !== n.authorLinkedInUrl) {
          nextProps.authorLinkedInUrl = n.authorLinkedInUrl
        }
        if (shape.props.color !== n.color) nextProps.color = n.color
        if (shape.props.w !== noteWidth) nextProps.w = noteWidth
        if (shape.props.h !== noteHeight) nextProps.h = noteHeight

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
        if (!s.props.noteId || !map.has(s.props.noteId)) {
          editor.deleteShape(s.id)
        }
      }
    })
    isApplyingRemoteRef.current = false
  }, [editor, notes, noteWidth, noteHeight])

  useEffect(() => {
    if (!editor) return

    const pendingMoves = pendingMoveRef.current

    const dispose = editor.store.listen(
      (entry) => {
        for (const record of Object.values(entry.changes.updated)) {
          const to = record[1]
          if (to.typeName !== 'shape' || to.type !== 'tip') continue
          const shape = to as unknown as NoteShape
          const note = notesByIdRef.current.get(shape.props.noteId)
          if (!note) continue

          if (shape.x !== note.x || shape.y !== note.y) {
            const { noteId } = shape.props
            setNoteDragging(noteId, true)
            if (getEditingNoteId() === noteId) {
              setEditingNoteId(null)
            }
            pendingMoves.set(noteId, {
              x: shape.x,
              y: shape.y,
            })
          }
        }
      },
      { source: 'user', scope: 'document' },
    )

    const flushPendingMoves = () => {
      const moves = Array.from(pendingMoves.entries())
      if (moves.length === 0) return
      pendingMoves.clear()

      void Promise.all(
        moves.map(async ([noteId, { x, y }]) => {
          try {
            await moveNote({
              noteId: noteId as Id<'notes'>,
              x,
              y,
            })
          } catch (err) {
            console.error('Failed to move note:', err)
          } finally {
            setNoteDragging(noteId, false)
          }
        }),
      )
    }

    window.addEventListener('pointerup', flushPendingMoves)
    window.addEventListener('pointercancel', flushPendingMoves)

    const disposeDelete = editor.sideEffects.registerBeforeDeleteHandler(
      'shape',
      (shape) => {
        if (shape.type === 'tip' && !isApplyingRemoteRef.current) return false
        return undefined
      },
    )

    return () => {
      dispose()
      window.removeEventListener('pointerup', flushPendingMoves)
      window.removeEventListener('pointercancel', flushPendingMoves)
      disposeDelete()
      pendingMoves.clear()
      clearDraggingNotes()
    }
  }, [editor, moveNote])

  return notes
}
