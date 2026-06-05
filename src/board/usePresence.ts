import { useEffect, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { InstancePresenceRecordType, type Editor, type TLRecord } from 'tldraw'
import { api } from '../../convex/_generated/api'
import type { Identity } from '../lib/identity'
import { throttle } from '../lib/throttle'

/**
 * Streams the local cursor to Convex and renders other people's cursors by
 * injecting tldraw `instance_presence` records into the store.
 */
export function usePresence(editor: Editor | null, identity: Identity) {
  const others = useQuery(api.presence.list)
  const heartbeat = useMutation(api.presence.heartbeat)
  const leave = useMutation(api.presence.leave)

  // Send local cursor position (throttled) + a keepalive so we don't go stale.
  useEffect(() => {
    if (!editor) return

    const send = throttle(() => {
      const p = editor.inputs.currentPagePoint
      void heartbeat({
        sessionId: identity.sessionId,
        name: identity.name,
        color: identity.color,
        x: p.x,
        y: p.y,
      })
    }, 70)

    const onMove = () => send()
    window.addEventListener('pointermove', onMove)
    const keepalive = setInterval(() => send(), 4000)
    send()

    const onUnload = () => {
      void leave({ sessionId: identity.sessionId })
    }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('beforeunload', onUnload)
      clearInterval(keepalive)
      void leave({ sessionId: identity.sessionId })
    }
  }, [editor, identity, heartbeat, leave])

  // Render remote cursors.
  const appliedIdsRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    if (!editor || !others) return

    const pageId = editor.getCurrentPageId()
    const nextIds = new Set<string>()
    const records: TLRecord[] = []

    for (const o of others) {
      if (o.sessionId === identity.sessionId) continue
      const id = InstancePresenceRecordType.createId(o.sessionId)
      nextIds.add(id)
      records.push(
        InstancePresenceRecordType.create({
          id,
          currentPageId: pageId,
          userId: o.sessionId,
          userName: o.name,
          color: o.color,
          cursor: { x: o.x, y: o.y, type: 'default', rotation: 0 },
          lastActivityTimestamp: Date.now(),
        }),
      )
    }

    const toRemove = [...appliedIdsRef.current].filter((id) => !nextIds.has(id))

    editor.store.mergeRemoteChanges(() => {
      if (records.length > 0) editor.store.put(records)
      if (toRemove.length > 0) {
        editor.store.remove(
          toRemove as Parameters<typeof editor.store.remove>[0],
        )
      }
    })

    appliedIdsRef.current = nextIds
  }, [editor, others, identity.sessionId])
}
