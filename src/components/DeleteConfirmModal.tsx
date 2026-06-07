import { createPortal } from 'react-dom'

export function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return createPortal(
    <div
      className="modal-backdrop-enter"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0, 0, 0, 0.15)',
      }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-labelledby="delete-title"
        aria-modal="true"
        className="modal-card-enter"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 340,
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: 16,
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.4), 0 4px 12px 0 rgba(0,0,0,0.06)',
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
              margin: 0,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
              fontSize: 24,
              lineHeight: 1.2,
              color: '#000000',
            }}
          >
            Delete this note?
          </h2>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 14,
              lineHeight: 1.5,
              color: '#777169',
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            }}
          >
            This cannot be undone. Only you can delete notes you created.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              background: '#ffffff',
              color: '#000000',
              border: '1px solid #e5e5e5',
              borderRadius: 9999,
              padding: '12px 16px',
              minHeight: 44,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onConfirm()
            }}
            style={{
              flex: 1,
              background: '#000000',
              color: '#fdfcfc',
              border: 'none',
              borderRadius: 9999,
              padding: '12px 16px',
              minHeight: 44,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
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
