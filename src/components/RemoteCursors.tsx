import { useValue, type Editor } from 'tldraw'
import { usePresenceContext, type PresenceUser } from '../context/PresenceContext'

export function RemoteCursors({ editor }: { editor: Editor }) {
  const { remoteUsers } = usePresenceContext()

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 200,
        overflow: 'hidden',
      }}
    >
      {remoteUsers.map((user) => (
        <RemoteCursor key={user.sessionId} editor={editor} user={user} />
      ))}
    </div>
  )
}

function RemoteCursor({ editor, user }: { editor: Editor; user: PresenceUser }) {
  const screen = useValue(
    `remote-cursor-${user.sessionId}`,
    () => {
      editor.getCamera()
      return editor.pageToScreen({ x: user.x, y: user.y })
    },
    [editor, user.x, user.y],
  )

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${screen.x}px, ${screen.y}px)`,
        transition: 'transform 75ms linear',
        willChange: 'transform',
      }}
    >
      <svg
        width="25"
        height="25"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: 'block',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
        }}
      >
        <path
          d="M3 3L3 17L8 12L13 12L3 3Z"
          fill={user.color}
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: 18,
          whiteSpace: 'nowrap',
          borderRadius: 9999,
          padding: '3px 8px',
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          color: '#000000',
          backgroundColor: user.color,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        {user.name}
      </div>
    </div>
  )
}
