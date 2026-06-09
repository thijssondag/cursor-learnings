import { IconTrash } from '@tabler/icons-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { MotionButton } from './MotionButton'
import { displayTitleStyle, modalBodyStyle } from '../lib/uiStyles'
import { iconProps } from '../lib/iconProps'

export function DeleteConfirmModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal open={open} onClose={onCancel} titleId="delete-title">
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
        <p style={modalBodyStyle}>
          This cannot be undone. Only you can delete notes you created.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Button type="button" color="secondary" size="md" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button
          type="button"
          color="primary-destructive"
          size="md"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onConfirm()
          }}
          fullWidth
        >
          Delete
        </Button>
      </div>
    </Modal>
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
