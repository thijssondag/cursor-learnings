import { useValue, type Editor } from 'tldraw'
import { IconPointerFilled } from '@tabler/icons-react'
import { usePresenceContext, type PresenceUser } from '../context/PresenceContext'

export function RemoteCursors({ editor }: { editor: Editor }) {
  const { remoteUsers } = usePresenceContext()

  const cursors = useValue(
    'remote-cursors-all',
    () => {
      editor.getCamera()
      return remoteUsers.map((user) => ({
        user,
        screen: editor.pageToScreen({ x: user.x, y: user.y }),
      }))
    },
    [editor, remoteUsers],
  )

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
      {cursors.map(({ user, screen }) => (
        <RemoteCursorDot key={user.sessionId} user={user} screen={screen} />
      ))}
    </div>
  )
}

function RemoteCursorDot({
  user,
  screen,
}: {
  user: PresenceUser
  screen: { x: number; y: number }
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${screen.x}px, ${screen.y}px)`,
        transition: 'transform 120ms linear',
        willChange: 'transform',
      }}
    >
      <IconPointerFilled
        size={20}
        color={user.color}
        aria-hidden
        style={{
          display: 'block',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: 18,
          whiteSpace: 'nowrap',
          borderRadius: 9999,
          padding: '3px 8px',
          fontSize: 12,
          fontWeight: 400,
          fontFamily: 'var(--font-sans)',
          color: '#26251e',
          backgroundColor: user.color,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        {user.name}
      </div>
    </div>
  )
}
