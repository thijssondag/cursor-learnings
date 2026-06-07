import { useEffect, useRef } from 'react'
import { useMutation } from 'convex/react'
import type { Editor } from 'tldraw'
import { api } from '../../convex/_generated/api'
import type { Identity } from '../lib/identity'
import { throttle } from '../lib/throttle'

const KEEPALIVE_MS = 4000
const CURSOR_THROTTLE_MS = 150

/**
 * Streams cursor position (throttled, no lastSeen bump) and keepalive touches
 * so presence.list stays accurate without excessive write contention.
 */
export function useCursorBroadcast(editor: Editor | null, identity: Identity) {
  const updateCursor = useMutation(api.presence.updateCursor)
  const touch = useMutation(api.presence.touch)
  const leave = useMutation(api.presence.leave)
  const lastSentRef = useRef({ x: NaN, y: NaN })
  const lastPointRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!editor) return

    editor.user.updateUserPreferences({
      id: identity.sessionId,
      name: identity.name,
      color: identity.color,
    })

    const container = editor.getContainer()

    const payload = () => ({
      sessionId: identity.sessionId,
      name: identity.name,
      color: identity.color,
      x: lastPointRef.current.x,
      y: lastPointRef.current.y,
    })

    const sendPosition = () => {
      const { x, y } = lastPointRef.current
      if (lastSentRef.current.x === x && lastSentRef.current.y === y) return
      lastSentRef.current = { x, y }
      void updateCursor(payload())
    }

    const sendKeepalive = () => {
      void touch(payload())
    }

    const sendPositionThrottled = throttle(sendPosition, CURSOR_THROTTLE_MS)

    const onPointerMove = (e: PointerEvent) => {
      const pagePoint = editor.screenToPage({ x: e.clientX, y: e.clientY })
      lastPointRef.current = { x: pagePoint.x, y: pagePoint.y }
      sendPositionThrottled()
    }

    const onPageHide = () => {
      void leave({ sessionId: identity.sessionId })
    }

    container.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('beforeunload', onPageHide)

    const keepalive = setInterval(sendKeepalive, KEEPALIVE_MS)
    sendKeepalive()

    return () => {
      container.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('beforeunload', onPageHide)
      clearInterval(keepalive)
      void leave({ sessionId: identity.sessionId })
    }
  }, [editor, identity, updateCursor, touch, leave])
}
