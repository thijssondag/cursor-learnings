/* eslint-disable react-refresh/only-export-components */
import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  T,
  type RecordProps,
  type TLBaseShape,
} from 'tldraw'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { useIdentity } from '../context/IdentityContext'
import { setEditingNoteId } from '../lib/editingState'
import { throttle } from '../lib/throttle'

export interface TipProps {
  w: number
  h: number
  noteId: string
  text: string
  color: string
  authorName: string
  heartCount: number
  likedByMe: boolean
  isOwner: boolean
}

declare module '@tldraw/tlschema' {
  interface TLGlobalShapePropsMap {
    tip: TipProps
  }
}

export type NoteShape = TLBaseShape<'tip', TipProps>

export class NoteShapeUtil extends ShapeUtil<NoteShape> {
  static override type = 'tip' as const

  static override props: RecordProps<NoteShape> = {
    w: T.number,
    h: T.number,
    noteId: T.string,
    text: T.string,
    color: T.string,
    authorName: T.string,
    heartCount: T.number,
    likedByMe: T.boolean,
    isOwner: T.boolean,
  }

  getDefaultProps(): NoteShape['props'] {
    return {
      w: 220,
      h: 168,
      noteId: '',
      text: '',
      color: '#34d399',
      authorName: '',
      heartCount: 0,
      likedByMe: false,
      isOwner: false,
    }
  }

  getGeometry(shape: NoteShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override canResize = () => false
  override hideResizeHandles = () => true
  override canEdit = () => false

  component(shape: NoteShape) {
    return <NoteCard shape={shape} />
  }

  getIndicatorPath(shape: NoteShape) {
    const { w, h } = shape.props
    const path = new Path2D()
    path.roundRect(0, 0, w, h, 16)
    return path
  }
}

function NoteCard({ shape }: { shape: NoteShape }) {
  const { w, h, text, authorName, heartCount, likedByMe, isOwner, noteId } =
    shape.props
  const identity = useIdentity()
  const toggleHeart = useMutation(api.hearts.toggle)
  const updateNote = useMutation(api.notes.update)
  const removeNote = useMutation(api.notes.remove)

  const [draft, setDraft] = useState(text)
  const [pendingDelete, setPendingDelete] = useState(false)
  const isFocused = useRef(false)

  const displayName = isOwner ? identity.name : authorName

  useEffect(() => {
    if (!isFocused.current) setDraft(text)
  }, [text])

  const persistText = useMemo(
    () =>
      throttle((id: string, value: string) => {
        void updateNote({
          noteId: id as Id<'notes'>,
          sessionId: identity.sessionId,
          text: value,
        })
      }, 400),
    [updateNote, identity.sessionId],
  )

  const stop = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation()

  return (
    <>
      <HTMLContainer
        style={{
          width: w,
          height: h,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: 16,
            boxShadow: '0 0 1px 0 rgba(0,0,0,0.4), 0 4px 12px 0 rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          }}
        >
          {/* Drag handle — pointer events pass through to tldraw */}
          <div
            title="Drag to move"
            style={{
              flexShrink: 0,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: '#f5f3f1',
              borderBottom: '1px solid #e5e5e5',
              borderRadius: '16px 16px 0 0',
              cursor: 'grab',
              color: '#a59f97',
              fontSize: 11,
              letterSpacing: '0.04em',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>⠿</span>
            <span>Drag</span>
          </div>

          <div
            style={{
              flex: 1,
              padding: '10px 14px 0',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            {isOwner ? (
              <textarea
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  persistText(noteId, e.target.value)
                }}
                onFocus={() => {
                  isFocused.current = true
                  setEditingNoteId(noteId)
                }}
                onBlur={() => {
                  isFocused.current = false
                  setEditingNoteId(null)
                  void updateNote({
                    noteId: noteId as Id<'notes'>,
                    sessionId: identity.sessionId,
                    text: draft,
                  })
                }}
                onPointerDown={stop}
                placeholder="Share your best Cursor tip…"
                style={{
                  flex: 1,
                  width: '100%',
                  resize: 'none',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#000000',
                  fontSize: 14,
                  lineHeight: 1.4,
                  fontFamily: 'inherit',
                  pointerEvents: 'auto',
                }}
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  color: '#000000',
                  fontSize: 14,
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                  overflow: 'hidden',
                }}
              >
                {text}
              </div>
            )}
          </div>

          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '8px 14px 12px',
            }}
          >
            <span
              style={{
                color: '#777169',
                fontSize: 12,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              — {displayName}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {isOwner && (
                <button
                  title="Delete note"
                  onPointerDown={stop}
                  onClick={(e) => {
                    stop(e)
                    setPendingDelete(true)
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#b1b0b0',
                    cursor: 'pointer',
                    fontSize: 16,
                    lineHeight: 1,
                    padding: '4px 6px',
                    borderRadius: 8,
                    pointerEvents: 'auto',
                    minHeight: 32,
                    minWidth: 32,
                  }}
                >
                  ×
                </button>
              )}
              <button
                onPointerDown={stop}
                onClick={(e) => {
                  stop(e)
                  void toggleHeart({
                    noteId: noteId as Id<'notes'>,
                    sessionId: identity.sessionId,
                  })
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  minHeight: 32,
                  padding: '4px 8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: 9999,
                  color: likedByMe ? '#ff4704' : '#777169',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  pointerEvents: 'auto',
                }}
              >
                <span style={{ fontSize: 15 }}>{likedByMe ? '♥' : '♡'}</span>
                <span>{heartCount}</span>
              </button>
            </div>
          </div>
        </div>
      </HTMLContainer>

      {pendingDelete && (
        <DeleteConfirmModal
          onCancel={() => setPendingDelete(false)}
          onConfirm={() => {
            setPendingDelete(false)
            void removeNote({
              noteId: noteId as Id<'notes'>,
              sessionId: identity.sessionId,
            })
          }}
        />
      )}
    </>
  )
}
