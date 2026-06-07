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
import { DeleteNoteButton } from '../components/DeleteConfirmModal'
import { SocialIcons } from '../components/SocialIcons'
import { useRequestDelete } from '../context/DeleteContext'
import { useIdentity } from '../context/IdentityContext'
import {
  consumeFocusRequest,
  setEditingNoteId,
} from '../lib/editingState'
import { throttle } from '../lib/throttle'

export interface TipProps {
  w: number
  h: number
  noteId: string
  text: string
  color: string
  authorName: string
  authorXHandle: string
  authorLinkedInUrl: string
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
    authorXHandle: T.string,
    authorLinkedInUrl: T.string,
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
      authorXHandle: '',
      authorLinkedInUrl: '',
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
  const {
    w,
    h,
    text,
    authorName,
    authorXHandle,
    authorLinkedInUrl,
    heartCount,
    likedByMe,
    isOwner,
    noteId,
  } = shape.props
  const identity = useIdentity()
  const requestDelete = useRequestDelete()
  const toggleHeart = useMutation(api.hearts.toggle)
  const updateNote = useMutation(api.notes.update)

  const [draft, setDraft] = useState(text)
  const [heartAnimating, setHeartAnimating] = useState(false)
  const isFocused = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const displayName = isOwner ? identity.name : authorName
  const displayXHandle = isOwner ? identity.xHandle : authorXHandle || undefined
  const displayLinkedIn = isOwner
    ? identity.linkedInUrl
    : authorLinkedInUrl || undefined

  useEffect(() => {
    if (!isFocused.current) setDraft(text)
  }, [text])

  useEffect(() => {
    if (!isOwner || !textareaRef.current) return
    if (consumeFocusRequest(noteId)) {
      textareaRef.current.focus()
    }
  }, [isOwner, noteId])

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

  const blockForeignInteraction = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const handleHeartClick = (e: React.MouseEvent) => {
    stop(e)
    setHeartAnimating(true)
    window.setTimeout(() => setHeartAnimating(false), 250)
    void toggleHeart({
      noteId: noteId as Id<'notes'>,
      sessionId: identity.sessionId,
    })
  }

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
              position: 'relative',
            }}
          >
            {isOwner ? (
              <textarea
                ref={textareaRef}
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
              <>
                <div
                  style={{
                    flex: 1,
                    color: '#000000',
                    fontSize: 14,
                    lineHeight: 1.4,
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    userSelect: 'none',
                  }}
                >
                  {text}
                </div>
                <div
                  aria-hidden
                  onPointerDown={blockForeignInteraction}
                  onDoubleClick={blockForeignInteraction}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    cursor: 'default',
                    pointerEvents: 'auto',
                  }}
                />
              </>
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                flex: 1,
                pointerEvents: 'auto',
              }}
              onPointerDown={stop}
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
              <SocialIcons
                name={displayName}
                xHandle={displayXHandle}
                linkedInUrl={displayLinkedIn}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isOwner && (
                <DeleteNoteButton
                  onClick={() => {
                    if (noteId) requestDelete(noteId)
                  }}
                />
              )}
              <button
                type="button"
                className="heart-btn"
                onPointerDown={stop}
                onClick={handleHeartClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  minHeight: 36,
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
                <span
                  className={heartAnimating ? 'heart-pop' : undefined}
                  style={{ fontSize: 15, display: 'inline-block' }}
                >
                  {likedByMe ? '♥' : '♡'}
                </span>
                <span>{heartCount}</span>
              </button>
            </div>
          </div>
        </div>
      </HTMLContainer>

    </>
  )
}
