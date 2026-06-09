import { Modal } from './Modal'
import {
  modalBodyStyle,
  modalCancelBtnStyle,
  modalPrimaryBtnStyle,
  modalTitleStyle,
} from './modalStyles'

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
        <h2 id="delete-title" style={modalTitleStyle}>
          Delete this note?
        </h2>
        <p style={modalBodyStyle}>
          This cannot be undone. Only you can delete notes you created.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onCancel} style={modalCancelBtnStyle}>
          Cancel
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onConfirm()
          }}
          style={modalPrimaryBtnStyle}
        >
          Delete
        </button>
      </div>
    </Modal>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M9 7V5h6v2M10 11v5M14 11v5M6 7l1 12h10l1-12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DeleteNoteButton({
  onClick,
}: {
  onClick: (e: React.MouseEvent) => void
}) {
  const stop = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation()

  return (
    <button
      type="button"
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
        color: '#b1b0b0',
        cursor: 'pointer',
        borderRadius: 8,
        pointerEvents: 'auto',
        width: 36,
        height: 36,
        padding: 0,
        transition: 'background 150ms ease, color 150ms ease',
      }}
    >
      <TrashIcon />
    </button>
  )
}
