import { useEffect, useMemo, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { Editor, TLDrawShape } from 'tldraw'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { usePageContext } from '../context/PageContext'
import { throttle } from '../lib/throttle'

type ConvexDrawing = {
  _id: Id<'drawings'>
  shapeId: string
  x: number
  y: number
  rotation: number
  data: string
}

function serializeDrawShape(shape: TLDrawShape) {
  return JSON.stringify({
    props: shape.props,
    meta: shape.meta,
  })
}

/**
 * Syncs freehand draw shapes for the current page via Convex.
 */
export function useSyncDrawings(editor: Editor | null) {
  const { currentPageId } = usePageContext()
  const drawings = useQuery(
    api.drawings.list,
    currentPageId ? { pageId: currentPageId } : 'skip',
  )
  const upsertDrawing = useMutation(api.drawings.upsert)
  const removeDrawing = useMutation(api.drawings.remove)

  const isApplyingRemoteRef = useRef(false)
  const pageIdRef = useRef(currentPageId)
  pageIdRef.current = currentPageId

  const persistDrawing = useMemo(
    () =>
      throttle((shape: TLDrawShape) => {
        const pageId = pageIdRef.current
        if (!pageId) return
        void upsertDrawing({
          pageId,
          shapeId: shape.id,
          x: shape.x,
          y: shape.y,
          rotation: shape.rotation,
          data: serializeDrawShape(shape),
        })
      }, 200),
    [upsertDrawing],
  )

  // Convex -> tldraw
  useEffect(() => {
    if (!editor || !drawings || !currentPageId) return

    isApplyingRemoteRef.current = true
    editor.store.mergeRemoteChanges(() => {
      const existing = editor
        .getCurrentPageShapes()
        .filter((s) => s.type === 'draw') as TLDrawShape[]

      const byShapeId = new Map<string, TLDrawShape>()
      for (const s of existing) byShapeId.set(s.id, s)

      const remoteIds = new Set<string>()

      for (const d of drawings as ConvexDrawing[]) {
        remoteIds.add(d.shapeId)
        const shape = byShapeId.get(d.shapeId)
        const parsed = JSON.parse(d.data) as {
          props: TLDrawShape['props']
          meta: TLDrawShape['meta']
        }

        if (!shape) {
          editor.createShape<TLDrawShape>({
            id: d.shapeId as TLDrawShape['id'],
            type: 'draw',
            x: d.x,
            y: d.y,
            rotation: d.rotation,
            props: parsed.props,
            meta: parsed.meta,
          })
          continue
        }

        const posChanged = shape.x !== d.x || shape.y !== d.y || shape.rotation !== d.rotation
        const propsChanged = serializeDrawShape(shape) !== d.data

        if (posChanged || propsChanged) {
          editor.updateShape<TLDrawShape>({
            id: shape.id,
            type: 'draw',
            x: d.x,
            y: d.y,
            rotation: d.rotation,
            props: parsed.props,
            meta: parsed.meta,
          })
        }
      }

      for (const s of existing) {
        if (!remoteIds.has(s.id)) editor.deleteShape(s.id)
      }
    })
    isApplyingRemoteRef.current = false
  }, [editor, drawings, currentPageId])

  // tldraw -> Convex
  useEffect(() => {
    if (!editor || !currentPageId) return

    const persistRemove = (shapeId: string) => {
      void removeDrawing({ pageId: currentPageId, shapeId })
    }

    const dispose = editor.store.listen(
      (entry) => {
        if (isApplyingRemoteRef.current) return

        for (const record of Object.values(entry.changes.added)) {
          if (record.typeName !== 'shape' || record.type !== 'draw') continue
          persistDrawing(record as TLDrawShape)
        }

        for (const record of Object.values(entry.changes.updated)) {
          const to = record[1]
          if (to.typeName !== 'shape' || to.type !== 'draw') continue
          persistDrawing(to as TLDrawShape)
        }

        for (const record of Object.values(entry.changes.removed)) {
          if (record.typeName !== 'shape' || record.type !== 'draw') continue
          persistRemove(record.id)
        }
      },
      { source: 'user', scope: 'document' },
    )

    return () => {
      dispose()
    }
  }, [editor, currentPageId, persistDrawing, removeDrawing])
}
