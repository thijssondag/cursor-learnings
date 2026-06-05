import { useEffect, useRef } from 'react'
import { useMutation } from 'convex/react'
import type { Editor } from 'tldraw'
import { api } from '../../convex/_generated/api'
import type { Identity } from '../lib/identity'
import { throttle } from '../lib/throttle'

const HEARTBEAT_MS = 4000
const THROTTLE_MS = 70

/**
 * Streams the local cursor position to Convex (throttled) with keepalive
 * and reliable disconnect on tab close / background.
 */
export function useCursorBroadcast(editor: Editor | null, identity: Identity) {
  const heartbeat = useMutation(api.presence.heartbeat)
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

    const send = (force = false) => {
      const { x, y } = lastPointRef.current
      if (!force && lastSentRef.current.x === x && lastSentRef.current.y === y) {
        return
      }
      lastSentRef.current = { x, y }
      void heartbeat({
        sessionId: identity.sessionId,
        name: identity.name,
        color: identity.color,
        x,
        y,
      })
    }

    const sendThrottled = throttle(() => send(false), THROTTLE_MS)

    const onPointerMove = (e: PointerEvent) => {
      const pagePoint = editor.screenToPage({ x: e.clientX, y: e.clientY })
      lastPointRef.current = { x: pagePoint.x, y: pagePoint.y }
      sendThrottled()
    }

    const onPageHide = () => {
      void leave({ sessionId: identity.sessionId })
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void leave({ sessionId: identity.sessionId })
      } else {
        send(true)
      }
    }

    container.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('beforeunload', onPageHide)
    document.addEventListener('visibilitychange', onVisibilityChange)

    const keepalive = setInterval(() => send(true), HEARTBEAT_MS)
    send(true)

    return () => {
      container.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('beforeunload', onPageHide)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      clearInterval(keepalive)
      void leave({ sessionId: identity.sessionId })
    }
  }, [editor, identity, heartbeat, leave])
}
