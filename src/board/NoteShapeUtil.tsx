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
import { motion, useReducedMotion } from 'motion/react'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { MotionButton } from '../components/MotionButton'
import { NoteOwnerMenu } from '../components/NoteOwnerMenu'
import { SocialIcons } from '../components/SocialIcons'
import { useRequestDelete } from '../context/DeleteContext'
import { useIdentity } from '../context/IdentityContext'
import { useOptionalPageContext } from '../context/PageContext'
import {
  consumeNoteEntrance,
  isNoteDragging,
  type NoteEntrance,
  setEditingNoteId,
  subscribeEditingState,
} from '../lib/editingState'
import {
  EASE_OUT_QUINT,
  NOTE_ENTER_OWN,
  NOTE_ENTER_REMOTE,
  motionDuration,
} from '../lib/motion'
import { throttle } from '../lib/throttle'
import { iconProps } from '../lib/iconProps'
import { NOTE_HEIGHT, NOTE_WIDTH } from '../lib/constants'
import {
  DEFAULT_NOTE_COLOR,
  isNoteColorOrLegacy,
  noteSurfaceStyles,
} from '../lib/noteColors'

export interface TipProps {
  w: number
  h: number
  noteId: string
  text: string
  project: string
  supportQuestion: string
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
    project: T.string,
    supportQuestion: T.string,
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
      w: NOTE_WIDTH,
      h: NOTE_HEIGHT,
      noteId: '',
      text: '',
      project: '',
      supportQuestion: '',
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

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  letterSpacing: '0.02em',
  marginBottom: 4,
  userSelect: 'none',
}

const textareaStyle: React.CSSProperties = {
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
}

function NoteCard({ shape }: { shape: NoteShape }) {
  const {
    w,
    h,
    text,
    project,
    supportQuestion,
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
  const pageContext = useOptionalPageContext()
  const pageKind = pageContext?.currentPage?.pageKind ?? 'tip'
  const requestDelete = useRequestDelete()
  const toggleHeart = useMutation(api.hearts.toggle)
  const updateNote = useMutation(api.notes.update)
  const updateColor = useMutation(api.notes.updateColor)

  const [draftText, setDraftText] = useState(text)
  const [draftProject, setDraftProject] = useState(project)
  const [draftSupport, setDraftSupport] = useState(supportQuestion)
  const [heartAnimating, setHeartAnimating] = useState(false)
  const [entrance] = useState<NoteEntrance>(() => consumeNoteEntrance(noteId))
  const reduceMotion = useReducedMotion()
  const isFocused = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    if (!isFocused.current) {
      setDraftText(text)
      setDraftProject(project)
      setDraftSupport(supportQuestion)
    }
  }, [text, project, supportQuestion])

  useEffect(() => {
    if (!isOwner) return
    let wasDragging = isNoteDragging(noteId)
    return subscribeEditingState(() => {
      const dragging = isNoteDragging(noteId)
      if (dragging && !wasDragging) {
        textareaRef.current?.blur()
      }
      wasDragging = dragging
    })
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

  const persistProject = useMemo(
    () =>
      throttle((id: string, value: string) => {
        void updateNote({
          noteId: id as Id<'notes'>,
          sessionId: identity.sessionId,
          project: value,
        })
      }, 400),
    [updateNote, identity.sessionId],
  )

  const persistSupport = useMemo(
    () =>
      throttle((id: string, value: string) => {
        void updateNote({
          noteId: id as Id<'notes'>,
          sessionId: identity.sessionId,
          supportQuestion: value,
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

  const handleColorSelect = (nextColor: string) => {
    if (!isOwner || nextColor === cardColor) return
    void updateColor({
      noteId: noteId as Id<'notes'>,
      sessionId: identity.sessionId,
      color: nextColor,
    })
  }

  const handleFocus = () => {
    isFocused.current = true
    setEditingNoteId(noteId)
  }

  const handleBlurTip = () => {
    isFocused.current = false
    setEditingNoteId(null)
    void updateNote({
      noteId: noteId as Id<'notes'>,
      sessionId: identity.sessionId,
      text: draftText,
    })
  }

  const handleBlurBuildPlan = () => {
    isFocused.current = false
    setEditingNoteId(null)
    void updateNote({
      noteId: noteId as Id<'notes'>,
      sessionId: identity.sessionId,
      project: draftProject,
      supportQuestion: draftSupport,
    })
  }

  const renderTipContent = () => {
    if (isOwner) {
      return (
        <textarea
          ref={textareaRef}
          value={draftText}
          onChange={(e) => {
            setDraftText(e.target.value)
            persistText(noteId, e.target.value)
          }}
          onFocus={handleFocus}
          onBlur={handleBlurTip}
          onPointerDown={stop}
          placeholder="Share your best Cursor tip…"
          style={{ ...textareaStyle, flex: 1 }}
        />
      )
    }
    return (
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
    )
  }

  const renderBuildPlanContent = () => {
    if (isOwner) {
      return (
        <>
          <div
            style={{
              flex: '0 1 auto',
              minHeight: 0,
              maxHeight: '38%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={fieldLabelStyle}>What are you building?</div>
            <textarea
              value={draftProject}
              onChange={(e) => {
                setDraftProject(e.target.value)
                persistProject(noteId, e.target.value)
              }}
              onFocus={handleFocus}
              onBlur={handleBlurBuildPlan}
              onPointerDown={stop}
              placeholder="My project idea…"
              style={{ ...textareaStyle, flex: 1, minHeight: 52, maxHeight: 72 }}
            />
          </div>
          <div
            style={{
              height: 1,
              background: surface.borderColor,
              margin: '6px 0',
              flexShrink: 0,
            }}
          />
          <div
            style={{
              flex: '1 1 62%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={fieldLabelStyle}>What support are you looking for?</div>
            <textarea
              value={draftSupport}
              onChange={(e) => {
                setDraftSupport(e.target.value)
                persistSupport(noteId, e.target.value)
              }}
              onFocus={handleFocus}
              onBlur={handleBlurBuildPlan}
              onPointerDown={stop}
              placeholder="Pairing on X, feedback on Y…"
              style={{ ...textareaStyle, flex: 1, minHeight: 110 }}
            />
          </div>
        </>
      )
    }

    return (
      <>
        <div style={{ flex: '0 1 auto', minHeight: 0, maxHeight: '38%' }}>
          <div style={fieldLabelStyle}>What are you building?</div>
          <div
            style={{
              color: 'var(--color-text)',
              fontSize: 14,
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              userSelect: 'none',
            }}
          >
            {project}
          </div>
        </div>
        {supportQuestion.trim() && (
          <>
            <div
              style={{
                height: 1,
                background: surface.borderColor,
                margin: '6px 0',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: '1 1 62%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={fieldLabelStyle}>What support are you looking for?</div>
              <div
                style={{
                  flex: 1,
                  color: 'var(--color-text)',
                  fontSize: 14,
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  userSelect: 'none',
                }}
              >
                {supportQuestion}
              </div>
            </div>
          </>
        )}
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
    )
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
        <motion.div
          initial={
            entrance === 'own'
              ? { opacity: 0, scale: 0.92, y: 8 }
              : entrance === 'remote'
                ? { opacity: 0 }
                : false
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: motionDuration(
              entrance === 'own' ? NOTE_ENTER_OWN : NOTE_ENTER_REMOTE,
              reduceMotion,
            ),
            ease: EASE_OUT_QUINT,
          }}
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            background: surface.background,
            border: `1px solid ${surface.borderColor}`,
            borderRadius: 16,
            boxShadow:
              entrance === 'own'
                ? 'var(--shadow-card-elevated, var(--shadow-card))'
                : 'var(--shadow-card)',
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
              position: 'relative',
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
            {isOwner && (
              <NoteOwnerMenu
                cardColor={cardColor}
                onColorSelect={handleColorSelect}
                onDelete={() => {
                  if (noteId) requestDelete(noteId)
                }}
              />
            )}
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
            {pageKind === 'buildPlan' ? renderBuildPlanContent() : renderTipContent()}
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
                gap: 4,
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
                  minWidth: 0,
                  flex: '1 1 auto',
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

            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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
        </motion.div>
      </HTMLContainer>
    </>
  )
}
