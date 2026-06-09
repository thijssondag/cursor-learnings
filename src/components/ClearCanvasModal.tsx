import { Modal } from './Modal'
import { Button } from './Button'
import { displayTitleStyle, modalBodyStyle } from '../lib/uiStyles'

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
        <h2
          id="clear-canvas-title"
          style={{
            ...displayTitleStyle,
            margin: 0,
            fontSize: 24,
            lineHeight: 1.2,
          }}
        >
          Clear this page?
        </h2>
        <p style={modalBodyStyle}>
          This removes all drawings and shapes on this page for everyone. Your notes
          stay on the board.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Button
          type="button"
          color="secondary"
          size="md"
          onClick={onCancel}
          isDisabled={isClearing}
          fullWidth
        >
          Cancel
        </Button>
        <Button
          type="button"
          color="primary-destructive"
          size="md"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            if (!isClearing) onConfirm()
          }}
          isDisabled={isClearing}
          isLoading={isClearing}
          showTextWhileLoading
          fullWidth
        >
          {isClearing ? 'Clearing…' : 'Clear drawings'}
        </Button>
      </div>
    </Modal>
  )
}
