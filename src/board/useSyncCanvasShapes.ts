import { useCallback, useEffect, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { Editor, TLShape, TLShapeId } from 'tldraw'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { usePageContext } from '../context/PageContext'
import { throttle } from '../lib/throttle'

const DRAW_THROTTLE_MS = 120
const STATIC_THROTTLE_MS = 200

const BLOCKED_SHAPE_TYPES = new Set(['tip', 'image', 'video', 'note', 'bookmark', 'embed'])

type ConvexCanvasShape = {
  _id: Id<'drawings'>
  shapeId: string
  shapeType: string
  x: number
  y: number
  rotation: number
  data: string
  updatedAt: number
}

function serializeCanvasShape(shape: TLShape) {
  return JSON.stringify({
    props: shape.props,
    meta: shape.meta,
  })
}

function isCanvasShape(shape: TLShape) {
  return !BLOCKED_SHAPE_TYPES.has(shape.type)
}

function remoteToken(d: ConvexCanvasShape) {
  return `${d.updatedAt}:${d.data}`
}

function snapshotVersion(pageId: Id<'pages'>, shapes: ConvexCanvasShape[]) {
  const body =
    shapes.length === 0
      ? ''
      : shapes
          .map((d) => `${d.shapeId}:${d.updatedAt}`)
          .sort()
          .join('|')
  return `${pageId}|${body}`
}

/**
 * Syncs all tldraw canvas shapes (except custom notes) per page via Convex.
 */
export function useSyncCanvasShapes(editor: Editor | null) {
  const { currentPageId } = usePageContext()
  const shapes = useQuery(
    api.drawings.list,
    currentPageId ? { pageId: currentPageId } : 'skip',
  )
  const upsertShape = useMutation(api.drawings.upsert)
  const removeShape = useMutation(api.drawings.remove)

  const isApplyingRemoteRef = useRef(false)
  const previousPageIdRef = useRef<Id<'pages'> | null>(null)
  const lastPayloadRef = useRef(new Map<string, string>())
  const lastAppliedRemoteRef = useRef(new Map<string, string>())
  const lastRemoteVersionRef = useRef('')
  const lastDrawShapeRef = useRef<TLShape | null>(null)
  const persistDrawRef = useRef<((shape: TLShape) => void) | null>(null)
  const persistStaticRef = useRef<((shape: TLShape) => void) | null>(null)

  const upsertNow = useCallback(
    (shape: TLShape) => {
      if (!currentPageId || !isCanvasShape(shape)) return

      const data = serializeCanvasShape(shape)
      const key = `${shape.id}:${data}`
      if (lastPayloadRef.current.get(shape.id) === key) return
      lastPayloadRef.current.set(shape.id, key)

      void upsertShape({
        pageId: currentPageId,
        shapeId: shape.id,
        shapeType: shape.type,
        x: shape.x,
        y: shape.y,
        rotation: shape.rotation,
        data,
      }).catch((err: unknown) => {
        console.error('Failed to save canvas shape:', err)
        lastPayloadRef.current.delete(shape.id)
      })
    },
    [upsertShape, currentPageId],
  )

  useEffect(() => {
    persistDrawRef.current = throttle(
      (shape: TLShape) => upsertNow(shape),
      DRAW_THROTTLE_MS,
    )
    persistStaticRef.current = throttle(
      (shape: TLShape) => upsertNow(shape),
      STATIC_THROTTLE_MS,
    )
  }, [upsertNow])

  const persistShape = useCallback((shape: TLShape) => {
    if (!isCanvasShape(shape)) return
    if (shape.type === 'draw') {
      lastDrawShapeRef.current = shape
      persistDrawRef.current?.(shape)
    } else {
      persistStaticRef.current?.(shape)
    }
  }, [])

  // Wipe local canvas shapes when switching Convex pages (do not delete from Convex).
  useEffect(() => {
    if (!editor || !currentPageId) return

    const previousPageId = previousPageIdRef.current
    previousPageIdRef.current = currentPageId

    if (previousPageId === null || previousPageId === currentPageId) return

    isApplyingRemoteRef.current = true
    deleteLocalCanvasShapes(editor)
    lastPayloadRef.current.clear()
    lastAppliedRemoteRef.current.clear()
    lastRemoteVersionRef.current = ''
    lastDrawShapeRef.current = null
    isApplyingRemoteRef.current = false
  }, [editor, currentPageId])

  // Convex -> tldraw (incremental: skip unchanged remote rows)
  useEffect(() => {
    if (!editor || shapes === undefined || !currentPageId) return

    const remoteShapes = shapes as ConvexCanvasShape[]
    const version = snapshotVersion(currentPageId, remoteShapes)
    if (version === lastRemoteVersionRef.current) return
    lastRemoteVersionRef.current = version

    isApplyingRemoteRef.current = true
    editor.store.mergeRemoteChanges(() => {
      const existing = editor
        .getCurrentPageShapes()
        .filter((s) => isCanvasShape(s))

      const byShapeId = new Map<string, TLShape>()
      for (const s of existing) byShapeId.set(s.id, s)

      const remoteIds = new Set<string>()

      for (const d of remoteShapes) {
        remoteIds.add(d.shapeId)

        const token = remoteToken(d)
        if (lastAppliedRemoteRef.current.get(d.shapeId) === token) continue
        lastAppliedRemoteRef.current.set(d.shapeId, token)

        const shape = byShapeId.get(d.shapeId)
        const shapeType = d.shapeType || 'draw'
        const parsed = JSON.parse(d.data) as {
          props: TLShape['props']
          meta: TLShape['meta']
        }

        if (!shape) {
          editor.createShape({
            id: d.shapeId as TLShapeId,
            type: shapeType,
            x: d.x,
            y: d.y,
            rotation: d.rotation,
            props: parsed.props,
            meta: parsed.meta,
          } as TLShape)
          continue
        }

        const posChanged =
          shape.x !== d.x || shape.y !== d.y || shape.rotation !== d.rotation
        const propsChanged = serializeCanvasShape(shape) !== d.data

        if (posChanged || propsChanged) {
          editor.updateShape({
            id: shape.id,
            type: shape.type,
            ...(posChanged ? { x: d.x, y: d.y, rotation: d.rotation } : {}),
            props: parsed.props,
            meta: parsed.meta,
          } as TLShape)
        }
      }

      for (const s of existing) {
        if (!remoteIds.has(s.id)) {
          lastAppliedRemoteRef.current.delete(s.id)
          editor.deleteShape(s.id)
        }
      }
    })
    isApplyingRemoteRef.current = false
  }, [editor, shapes, currentPageId])

  // tldraw -> Convex
  useEffect(() => {
    if (!editor || !currentPageId) return

    const persistRemove = (shapeId: string) => {
      lastPayloadRef.current.delete(shapeId)
      void removeShape({ pageId: currentPageId, shapeId })
    }

    const dispose = editor.store.listen(
      (entry) => {
        if (isApplyingRemoteRef.current) return

        for (const record of Object.values(entry.changes.added)) {
          if (record.typeName !== 'shape') continue
          const shape = record as TLShape
          if (!isCanvasShape(shape)) continue
          upsertNow(shape)
        }

        for (const record of Object.values(entry.changes.updated)) {
          const to = record[1]
          if (to.typeName !== 'shape') continue
          const shape = to as TLShape
          if (!isCanvasShape(shape)) continue
          persistShape(shape)
        }

        for (const record of Object.values(entry.changes.removed)) {
          if (record.typeName !== 'shape') continue
          const shape = record as TLShape
          if (!isCanvasShape(shape)) continue
          persistRemove(shape.id)
        }
      },
      { source: 'user', scope: 'document' },
    )

    const flushActiveDraw = () => {
      const shape = lastDrawShapeRef.current
      if (shape) upsertNow(shape)
      lastDrawShapeRef.current = null
    }

    window.addEventListener('pointerup', flushActiveDraw)
    window.addEventListener('pointercancel', flushActiveDraw)

    return () => {
      dispose()
      window.removeEventListener('pointerup', flushActiveDraw)
      window.removeEventListener('pointercancel', flushActiveDraw)
    }
  }, [editor, currentPageId, persistShape, removeShape, upsertNow])
}

export function deleteLocalCanvasShapes(editor: Editor) {
  const ids = editor
    .getCurrentPageShapes()
    .filter((s) => isCanvasShape(s))
    .map((s) => s.id)
  if (ids.length > 0) editor.deleteShapes(ids)
}
