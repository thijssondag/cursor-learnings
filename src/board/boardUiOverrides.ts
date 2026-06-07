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

export const boardUiOverrides: TLUiOverrides = {
  tools(_editor, tools) {
    for (const id of REMOVED_TOOLS) {
      delete tools[id]
    }
    tools['add-tip-note'] = {
      id: 'add-tip-note',
      icon: 'tool-note',
      label: 'Add note',
      kbd: 'n',
      onSelect: () => {
        // Handled by BoardToolbar TldrawUiMenuItem onSelect
      },
    }
    return tools
  },
}
