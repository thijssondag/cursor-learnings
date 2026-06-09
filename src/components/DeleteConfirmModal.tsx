import { createPortal } from 'react-dom'
import { IconTrash } from '@tabler/icons-react'
import {
  displayTitleStyle,
  modalBackdropStyle,
  primaryBtnStyle,
  secondaryBtnStyle,
} from '../lib/uiStyles'
import { iconProps } from '../lib/iconProps'
import { MotionButton } from './MotionButton'

export function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return createPortal(
    <div className="modal-backdrop-enter" style={modalBackdropStyle} onClick={onCancel}>
      <div
        role="dialog"
        aria-labelledby="delete-title"
        aria-modal="true"
        className="modal-card-enter"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 340,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-card)',
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div>
          <h2
            id="delete-title"
            style={{
              ...displayTitleStyle,
              margin: 0,
              fontSize: 24,
              lineHeight: 1.2,
            }}
          >
            Delete this note?
          </h2>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            This cannot be undone. Only you can delete notes you created.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <MotionButton type="button" onClick={onCancel} style={{ ...secondaryBtnStyle, flex: 1 }}>
            Cancel
          </MotionButton>
          <MotionButton
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onConfirm()
            }}
            style={{ ...primaryBtnStyle, flex: 1, cursor: 'pointer' }}
          >
            Delete
          </MotionButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function DeleteNoteButton({
  onClick,
}: {
  onClick: (e: React.MouseEvent) => void
}) {
  const stop = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation()

  return (
    <MotionButton
      type="button"
      variant="ghost"
      title="Delete note"
      onPointerDown={stop}
      onClick={(e) => {
        stop(e)
        onClick(e)
      }}
      className="delete-note-btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        color: 'var(--color-text-faint)',
        cursor: 'pointer',
        borderRadius: 8,
        pointerEvents: 'auto',
        width: 44,
        height: 44,
        minWidth: 44,
        minHeight: 44,
        padding: 0,
        transition: 'background 150ms ease, color 150ms ease',
      }}
    >
      <IconTrash {...iconProps(16)} />
    </MotionButton>
  )
}
