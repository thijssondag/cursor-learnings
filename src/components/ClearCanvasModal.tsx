import { Modal } from './Modal'
import {
  modalBodyStyle,
  modalCancelBtnStyle,
  modalPrimaryBtnStyle,
  modalTitleStyle,
} from './modalStyles'

export function ClearCanvasModal({
  open,
  isClearing,
  onCancel,
  onConfirm,
}: {
  open: boolean
  isClearing: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Modal open={open} onClose={isClearing ? () => {} : onCancel} titleId="clear-canvas-title">
      <div>
        <h2 id="clear-canvas-title" style={modalTitleStyle}>
          Clear this page?
        </h2>
        <p style={modalBodyStyle}>
          This removes all drawings and shapes on this page for everyone. Your notes
          stay on the board.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isClearing}
          style={{
            ...modalCancelBtnStyle,
            opacity: isClearing ? 0.5 : 1,
            cursor: isClearing ? 'not-allowed' : 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            if (!isClearing) onConfirm()
          }}
          disabled={isClearing}
          style={{
            ...modalPrimaryBtnStyle,
            opacity: isClearing ? 0.6 : 1,
            cursor: isClearing ? 'wait' : 'pointer',
          }}
        >
          {isClearing ? 'Clearing…' : 'Clear canvas'}
        </button>
      </div>
    </Modal>
  )
}
