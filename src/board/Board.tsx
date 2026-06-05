import { useState } from 'react'
import { Tldraw, type Editor, type TLComponents } from 'tldraw'
import 'tldraw/tldraw.css'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { IdentityProvider } from '../context/IdentityContext'
import { PresenceProvider } from '../context/PresenceContext'
import type { Identity } from '../lib/identity'
import { NOTE_HEIGHT, NOTE_WIDTH, randomTilt } from '../lib/constants'
import { NoteShapeUtil } from './NoteShapeUtil'
import { useSyncNotes } from './useSyncNotes'
import { useCursorBroadcast } from './usePresence'
import { TopBar } from '../components/TopBar'
import { RemoteCursors } from '../components/RemoteCursors'

const shapeUtils = [NoteShapeUtil]

// Hide tldraw's default menus/panels — we use our own minimal top bar.
const components: TLComponents = {
  MenuPanel: null,
  PageMenu: null,
  MainMenu: null,
  QuickActions: null,
  ActionsMenu: null,
  HelpMenu: null,
  NavigationPanel: null,
  Toolbar: null,
  StylePanel: null,
  DebugPanel: null,
  DebugMenu: null,
}

export function Board({ identity }: { identity: Identity }) {
  const [editor, setEditor] = useState<Editor | null>(null)

  return (
    <IdentityProvider identity={identity}>
      <PresenceProvider identity={identity}>
        <div style={{ position: 'fixed', inset: 0 }}>
          <Tldraw
            shapeUtils={shapeUtils}
            components={components}
            onMount={(e) => setEditor(e)}
          >
            <BoardInner editor={editor} identity={identity} />
          </Tldraw>
          {editor && <RemoteCursors editor={editor} />}
        </div>
      </PresenceProvider>
    </IdentityProvider>
  )
}

function BoardInner({
  editor,
  identity,
}: {
  editor: Editor | null
  identity: Identity
}) {
  useSyncNotes(editor, identity)
  useCursorBroadcast(editor, identity)

  const createNote = useMutation(api.notes.create)

  const handleAddNote = () => {
    if (!editor) return
    const center = editor.getViewportPageBounds().center
    void createNote({
      sessionId: identity.sessionId,
      authorName: identity.name,
      text: '',
      x: center.x - NOTE_WIDTH / 2,
      y: center.y - NOTE_HEIGHT / 2,
      rotation: randomTilt(),
      color: identity.color,
    })
  }

  return <TopBar onAddNote={handleAddNote} />
}
