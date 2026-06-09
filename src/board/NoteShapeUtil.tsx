/* eslint-disable react-refresh/only-export-components */
import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  T,
  type RecordProps,
  type TLBaseShape,
} from 'tldraw'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useMutation } from 'convex/react'
import { AnimatePresence, motion } from 'motion/react'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { DeleteNoteButton } from '../components/DeleteConfirmModal'
import { MotionButton } from '../components/MotionButton'
import { SocialIcons } from '../components/SocialIcons'
import { useRequestDelete } from '../context/DeleteContext'
import { useIdentity } from '../context/IdentityContext'
import {
  consumeFocusRequest,
  setEditingNoteId,
} from '../lib/editingState'
import { throttle } from '../lib/throttle'
import { iconProps } from '../lib/iconProps'
import {
  DEFAULT_NOTE_COLOR,
  isNoteColorOrLegacy,
  NOTE_COLORS,
  noteSurfaceStyles,
  noteSwatchColor,
} from '../lib/noteColors'

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
      color: DEFAULT_NOTE_COLOR,
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
    color,
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
  const updateColor = useMutation(api.notes.updateColor)

  const [draft, setDraft] = useState(text)
  const [heartAnimating, setHeartAnimating] = useState(false)
  const [showSwatches, setShowSwatches] = useState(false)
  const [swatchPos, setSwatchPos] = useState<{ top: number; left: number; rotation: number } | null>(
    null,
  )
  const isFocused = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const colorSwatchRef = useRef<HTMLDivElement>(null)
  const swatchPanelRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cardColor = isNoteColorOrLegacy(color)
    ? color
    : DEFAULT_NOTE_COLOR
  const surface = noteSurfaceStyles(cardColor)

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

  useEffect(() => {
    if (!isOwner) setShowSwatches(false)
  }, [isOwner])

  const handleColorSelect = (nextColor: string) => {
    if (!isOwner || nextColor === cardColor) return
    void updateColor({
      noteId: noteId as Id<'notes'>,
      sessionId: identity.sessionId,
      color: nextColor,
    })
    setShowSwatches(false)
  }

  const openSwatches = useCallback(() => {
    if (!isOwner) return
    clearTimeout(closeTimerRef.current)
    setShowSwatches(true)
  }, [isOwner])

  const closeSwatches = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setShowSwatches(false), 220)
  }, [])

  const updateSwatchPosition = useCallback(() => {
    const anchor = colorSwatchRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    setSwatchPos({
      top: rect.bottom + 6,
      left: rect.left + rect.width / 2,
      rotation: shape.rotation * (180 / Math.PI),
    })
  }, [shape.rotation])

  useLayoutEffect(() => {
    if (!showSwatches) {
      setSwatchPos(null)
      return
    }
    updateSwatchPosition()
    let frame = 0
    const tick = () => {
      updateSwatchPosition()
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    window.addEventListener('resize', updateSwatchPosition)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateSwatchPosition)
    }
  }, [showSwatches, updateSwatchPosition])

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
            position: 'relative',
            background: surface.background,
            border: `1px solid ${surface.borderColor}`,
            borderRadius: 16,
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'var(--font-sans)',
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
              background: surface.headerBackground,
              borderBottom: `1px solid ${surface.borderColor}`,
              borderRadius: '16px 16px 0 0',
              cursor: 'grab',
              color: 'var(--color-text-faint)',
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
                  color: 'var(--color-text)',
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
                    color: 'var(--color-text)',
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
                  color: 'var(--color-text-muted)',
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
                <div
                  ref={colorSwatchRef}
                  onMouseEnter={openSwatches}
                  onMouseLeave={closeSwatches}
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    pointerEvents: 'auto',
                  }}
                  onPointerDown={stop}
                >
                  <MotionButton
                    type="button"
                    variant="ghost"
                    aria-label="Change card color"
                    aria-expanded={showSwatches}
                    onClick={() => {
                      if (!isOwner) return
                      setShowSwatches((v) => !v)
                    }}
                    className="note-color-btn"
                    style={{
                      width: 44,
                      height: 44,
                      minWidth: 44,
                      minHeight: 44,
                      padding: 0,
                      borderRadius: '50%',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: noteSwatchColor(cardColor),
                        border: '2px solid color-mix(in srgb, var(--color-text) 18%, transparent)',
                      }}
                    />
                  </MotionButton>
                </div>
              )}
              {isOwner && (
                <DeleteNoteButton
                  onClick={() => {
                    if (noteId) requestDelete(noteId)
                  }}
                />
              )}
              <MotionButton
                type="button"
                variant="ghost"
                className="heart-btn"
                onPointerDown={stop}
                onClick={handleHeartClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  minWidth: 44,
                  minHeight: 44,
                  padding: '4px 10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: 9999,
                  color: likedByMe ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  pointerEvents: 'auto',
                }}
              >
                <span
                  className={heartAnimating ? 'heart-pop' : undefined}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  {likedByMe ? (
                    <IconHeartFilled
                      {...iconProps(15, { color: 'var(--color-accent)', fill: 'var(--color-accent)' })}
                    />
                  ) : (
                    <IconHeart {...iconProps(15)} />
                  )}
                </span>
                <span>{heartCount}</span>
              </MotionButton>
            </div>
          </div>
        </div>
      </HTMLContainer>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showSwatches && swatchPos && (
              <motion.div
                ref={swatchPanelRef}
                key="note-swatch-picker"
                initial={{ opacity: 0, y: -4, scale: 0.94, x: '-50%' }}
                animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                exit={{ opacity: 0, y: -4, scale: 0.94, x: '-50%' }}
                transition={{ type: 'spring', bounce: 0.15, visualDuration: 0.2 }}
                role="radiogroup"
                aria-label="Card color"
                onPointerDown={stop}
                onMouseEnter={openSwatches}
                onMouseLeave={closeSwatches}
                style={{
                  position: 'fixed',
                  top: swatchPos.top,
                  left: swatchPos.left,
                  rotate: swatchPos.rotation,
                  transformOrigin: 'top center',
                  display: 'flex',
                  gap: 2,
                  padding: '4px 7px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 20,
                  boxShadow: 'var(--shadow-card)',
                  pointerEvents: 'auto',
                  zIndex: 10000,
                  isolation: 'isolate',
                }}
              >
                {NOTE_COLORS.map((swatch) => {
                  const selected = swatch === cardColor
                  return (
                    <MotionButton
                      key={swatch}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={selected ? 'Current color' : 'Set color'}
                      variant="ghost"
                      onClick={() => handleColorSelect(swatch)}
                      style={{
                        width: 28,
                        height: 28,
                        minWidth: 28,
                        minHeight: 28,
                        padding: 0,
                        borderRadius: '50%',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: '50%',
                          background: noteSwatchColor(swatch),
                          border: selected
                            ? '2px solid var(--color-text)'
                            : '2px solid transparent',
                          boxShadow: selected
                            ? '0 0 0 2px var(--color-surface), 0 0 0 3.5px var(--color-text)'
                            : 'none',
                        }}
                      />
                    </MotionButton>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
