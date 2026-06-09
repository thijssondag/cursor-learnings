import type { TLUiOverrides } from 'tldraw'

const REMOVED_TOOLS = [
  'asset',
  'note',
  'media',
  'file',
  'image',
  'video',
  'bookmark',
  'embed',
] as const

export function createBoardUiOverrides(addNoteToolLabel: string): TLUiOverrides {
  return {
    tools(_editor, tools) {
      for (const id of REMOVED_TOOLS) {
        delete tools[id]
      }
      tools['add-tip-note'] = {
        id: 'add-tip-note',
        icon: 'tool-note',
        label: addNoteToolLabel,
        kbd: 'n',
        onSelect: () => {
          // Handled by BoardToolbar TldrawUiMenuItem onSelect
        },
      }
      return tools
    },
  }
}
