export function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
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
            onClick={onConfirm}
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
    </div>
  )
}
