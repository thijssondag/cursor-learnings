import { motion, useReducedMotion } from 'motion/react'
import { usePresenceContext } from '../context/PresenceContext'
import { PageMenu } from './PageMenu'
import { DURATION_INSTANT, EASE_OUT_QUINT } from '../lib/motion'

const pillBtnBase: React.CSSProperties = {
  pointerEvents: 'auto',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 9999,
  padding: '8px 16px',
  minHeight: 40,
  fontSize: 14,
  fontWeight: 500,
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  boxShadow:
    'rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px',
}

function PillButton({
  children,
  onClick,
  disabled,
  title,
  style,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  title?: string
  style: React.CSSProperties
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      style={style}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: DURATION_INSTANT, ease: EASE_OUT_QUINT }}
    >
      {children}
    </motion.button>
  )
}

export function TopBar({
  onAddNote,
  onClearDrawings,
  canAddNote,
  addNoteHint,
  onEditProfile,
}: {
  onAddNote: () => void
  onClearDrawings: () => void
  canAddNote: boolean
  addNoteHint?: string
  onEditProfile: () => void
}) {
  const { onlineCount } = usePresenceContext()

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
          pointerEvents: 'auto',
        }}
      >
        <PageMenu />
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            color: '#777169',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 9999,
              background: '#34d399',
              display: 'inline-block',
            }}
          />
          {onlineCount} online
        </span>
        <button
          type="button"
          onClick={onEditProfile}
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            fontSize: 12,
            color: '#a59f97',
            cursor: 'pointer',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          Edit profile
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
        <PillButton
          onClick={onClearDrawings}
          style={{
            ...pillBtnBase,
            background: '#ffffff',
            color: '#000000',
            border: '1px solid #e5e5e5',
          }}
        >
          Clear canvas
        </PillButton>
        <PillButton
          onClick={onAddNote}
          disabled={!canAddNote}
          title={!canAddNote ? addNoteHint : undefined}
          style={{
            ...pillBtnBase,
            background: '#000000',
            color: '#fdfcfc',
            border: '1px solid #e5e5e5',
            cursor: canAddNote ? 'pointer' : 'not-allowed',
            opacity: canAddNote ? 1 : 0.45,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          <span>Add note</span>
        </PillButton>
      </div>
    </div>
  )
}
