import { useEffect } from 'react'
import type { Editor } from 'tldraw'
import type { NoteShape } from './NoteShapeUtil'

/** Clears tldraw selection when a non-owned note shape is selected. */
export function useBlockForeignNoteSelection(editor: Editor | null) {
  useEffect(() => {
    if (!editor) return

    const dispose = editor.store.listen(
      () => {
        const selected = editor.getSelectedShapes() as NoteShape[]
        const foreign = selected.filter(
          (s) => s.type === 'tip' && !s.props.isOwner,
        )
        if (foreign.length > 0) {
          const allowed = selected.filter(
            (s) => s.type !== 'tip' || s.props.isOwner,
          )
          editor.setSelectedShapes(allowed.map((s) => s.id))
        }
      },
      { scope: 'session' },
    )

    return () => dispose()
  }, [editor])
}
