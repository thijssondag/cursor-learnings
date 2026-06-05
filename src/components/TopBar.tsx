import { usePresenceContext } from '../context/PresenceContext'

export function TopBar({ onAddNote }: { onAddNote: () => void }) {
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
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            fontSize: 22,
            lineHeight: 1.1,
            color: '#000000',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Cursor Learnings Board
        </span>
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
      </div>

      <button
        onClick={onAddNote}
        style={{
          pointerEvents: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#000000',
          color: '#fdfcfc',
          border: '1px solid #e5e5e5',
          borderRadius: 9999,
          padding: '8px 16px',
          minHeight: 40,
          fontSize: 14,
          fontWeight: 500,
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          cursor: 'pointer',
          boxShadow:
            'rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
        <span>Add note</span>
      </button>
    </div>
  )
}
