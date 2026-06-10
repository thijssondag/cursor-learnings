import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Tldraw,
  DefaultSizeStyle,
  type Editor,
  type TLComponents,
} from 'tldraw'
import 'tldraw/tldraw.css'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { IdentityProvider } from '../context/IdentityContext'
import { PresenceProvider } from '../context/PresenceContext'
import { DeleteProvider } from '../context/DeleteContext'
import { ParticipationQrOverlay } from '../components/ParticipationQrOverlay'
import { PageProvider, usePageContext } from '../context/PageContext'
import { useAutoFitContext } from '../context/AutoFitContext'
import { BoardActionsProvider } from '../context/BoardActionsContext'
import { useTheme } from '../context/ThemeContext'
import type { Identity } from '../lib/identity'
import {
  BUILD_PLAN_NOTE_HEIGHT,
  BUILD_PLAN_NOTE_WIDTH,
  NOTE_HEIGHT,
  NOTE_WIDTH,
  randomTilt,
} from '../lib/constants'
import { DEFAULT_NOTE_COLOR } from '../lib/noteColors'
import {
  getAddNoteAvailability,
  markNoteJustCreated,
  useEditingNoteId,
} from '../lib/editingState'
import { updateIdentity } from '../lib/identity'
import { NoteShapeUtil } from './NoteShapeUtil'
import { useSyncNotes } from './useSyncNotes'
import {
  cancelCanvasClear,
  fadeOutAndDeleteLocalCanvasShapes,
  finishCanvasClear,
  prepareCanvasClear,
  useSyncCanvasShapes,
} from './useSyncCanvasShapes'
import { useCursorBroadcast } from './usePresence'
import { BoardToolbar } from './BoardToolbar'
import { useAutoFitFollow } from './useAutoFitFollow'
import {
  configureMobileEditor,
  fitPageToViewport,
  useMobileCameraFit,
} from './useMobileCameraFit'
import { createBoardUiOverrides } from './boardUiOverrides'
import { TopBar } from '../components/TopBar'
import { RemoteCursors } from '../components/RemoteCursors'
import { CursorBoardBackground } from '../components/CursorBoardBackground'
import { ProfileModal } from '../components/ProfileModal'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { WelcomeDialog } from '../components/WelcomeDialog'
import { ClearCanvasModal } from '../components/ClearCanvasModal'
import { hasSeenWelcome, markWelcomeSeen } from '../lib/welcome'

const shapeUtils = [NoteShapeUtil]

const BLOCKED_SHAPE_TYPES = new Set(['image', 'video', 'note', 'bookmark', 'embed'])

const components: TLComponents = {
  Background: CursorBoardBackground,
  Toolbar: BoardToolbar,
  MainMenu: null,
  PageMenu: null,
  MenuPanel: null,
  QuickActions: null,
  ActionsMenu: null,
  HelpMenu: null,
  StylePanel: null,
  PeopleMenu: null,
  SharePanel: null,
  DebugPanel: null,
  DebugMenu: null,
}

function configureEditor(editor: Editor) {
  editor.setStyleForNextShapes(DefaultSizeStyle, 'm')

  editor.sideEffects.registerAfterCreateHandler('shape', (shape, source) => {
    if (source !== 'user') return
    if (BLOCKED_SHAPE_TYPES.has(shape.type)) {
      editor.deleteShape(shape.id)
    }
  })
}

function ClearCanvasGate({
  editor,
  open,
  isClearing,
  onClose,
  onClearingChange,
}: {
  editor: Editor | null
  open: boolean
  isClearing: boolean
  onClose: () => void
  onClearingChange: (clearing: boolean) => void
}) {
  const { currentPageId } = usePageContext()
  const clearCanvas = useMutation(api.drawings.clearPage)

  useEffect(() => {
    if (open) prepareCanvasClear()
  }, [open])

  const handleCancel = () => {
    cancelCanvasClear()
    onClose()
  }

  const handleConfirm = async () => {
    if (!editor || !currentPageId || isClearing) return
    onClearingChange(true)
    try {
      await clearCanvas({ pageId: currentPageId })
      await fadeOutAndDeleteLocalCanvasShapes(editor)
    } catch (err) {
      console.error('Failed to clear canvas:', err)
    } finally {
      finishCanvasClear()
      onClearingChange(false)
      onClose()
    }
  }

  return (
    <ClearCanvasModal
      open={open}
      isClearing={isClearing}
      onCancel={handleCancel}
      onConfirm={() => void handleConfirm()}
    />
  )
}

export function Board({
  identity,
  onIdentityChange,
}: {
  identity: Identity
  onIdentityChange: (identity: Identity) => void
}) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showWelcome, setShowWelcome] = useState(() => !hasSeenWelcome())
  const [showClearCanvas, setShowClearCanvas] = useState(false)
  const [isClearingCanvas, setIsClearingCanvas] = useState(false)
  const removeNote = useMutation(api.notes.remove)
  const upsertProfile = useMutation(api.profiles.upsert)

  const overlayOpen =
    deleteNoteId !== null ||
    showProfile ||
    showWelcome ||
    showClearCanvas ||
    isClearingCanvas

  const handleConfirmDelete = async () => {
    if (!deleteNoteId) return
    const noteId = deleteNoteId
    setDeleteNoteId(null)
    if (editor) editor.setSelectedShapes([])
    try {
      await removeNote({
        noteId: noteId as Id<'notes'>,
        sessionId: identity.sessionId,
      })
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  const handleRequestDelete = (noteId: string) => {
    if (!noteId) return
    if (editor) editor.setSelectedShapes([])
    setDeleteNoteId(noteId)
  }

  const handleProfileSave = async (updates: {
    name: string
    xHandle: string
    linkedInUrl: string
  }) => {
    const next = updateIdentity(identity, updates)
    onIdentityChange(next)
    await upsertProfile({
      sessionId: next.sessionId,
      name: next.name,
      xHandle: next.xHandle,
      linkedInUrl: next.linkedInUrl,
    })
    setShowProfile(false)
  }

  return (
    <IdentityProvider identity={identity}>
      <PresenceProvider identity={identity}>
        <PageProvider identity={identity}>
          <DeleteProvider onRequestDelete={handleRequestDelete}>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: overlayOpen ? 'none' : undefined,
              }}
            >
              <BoardWithActions
                editor={editor}
                identity={identity}
                onEditProfile={() => setShowProfile(true)}
                onRequestClearCanvas={() => setShowClearCanvas(true)}
                setEditor={setEditor}
              />
              {editor && <RemoteCursors editor={editor} />}
            </div>

            <DeleteConfirmModal
              open={deleteNoteId !== null}
              onCancel={() => setDeleteNoteId(null)}
              onConfirm={() => void handleConfirmDelete()}
            />
            <ProfileModal
              open={showProfile}
              identity={identity}
              onSave={(updates) => void handleProfileSave(updates)}
              onClose={() => setShowProfile(false)}
            />
            {showWelcome && (
              <WelcomeDialog
                name={identity.name}
                onContinue={() => {
                  markWelcomeSeen()
                  setShowWelcome(false)
                }}
              />
            )}
            <ClearCanvasGate
              editor={editor}
              open={showClearCanvas}
              isClearing={isClearingCanvas}
              onClose={() => setShowClearCanvas(false)}
              onClearingChange={setIsClearingCanvas}
            />
            <ParticipationQrOverlay />
          </DeleteProvider>
        </PageProvider>
      </PresenceProvider>
    </IdentityProvider>
  )
}

function BoardWithActions({
  editor,
  identity,
  onEditProfile,
  onRequestClearCanvas,
  setEditor,
}: {
  editor: Editor | null
  identity: Identity
  onEditProfile: () => void
  onRequestClearCanvas: () => void
  setEditor: (editor: Editor | null) => void
}) {
  const { currentPageId, currentPage } = usePageContext()
  const { resolvedTheme } = useTheme()
  const { isAutoFitEnabled, toggleAutoFit } = useAutoFitContext()
  const notes = useSyncNotes(editor, identity)
  useSyncCanvasShapes(editor)
  useCursorBroadcast(editor, identity)

  useMobileCameraFit(editor, currentPageId ?? undefined)
  useAutoFitFollow(editor, notes, currentPageId, isAutoFitEnabled)

  const handleToggleAutoFit = useCallback(() => {
    const enabling = !isAutoFitEnabled
    toggleAutoFit()
    if (enabling && editor) {
      fitPageToViewport(editor, true)
    }
  }, [editor, isAutoFitEnabled, toggleAutoFit])

  const createNote = useMutation(api.notes.create)

  const editingId = useEditingNoteId()
  const pageKind = currentPage?.pageKind ?? 'tip'
  const isLocked = currentPage?.isLocked ?? true
  const {
    canAddNote,
    hint: addNoteHint,
    enabledTitle: addNoteTitle,
    addNoteLabel,
    addNoteLimit,
    addNoteShortLabel,
  } = getAddNoteAvailability(notes, editingId, pageKind, isLocked)

  const boardUiOverrides = useMemo(
    () => createBoardUiOverrides(`${addNoteLabel}${addNoteLimit}`),
    [addNoteLabel, addNoteLimit],
  )

  const handleAddNote = async () => {
    if (!editor || !canAddNote || !currentPageId) return
    const center = editor.getViewportPageBounds().center
    const noteWidth =
      pageKind === 'buildPlan' ? BUILD_PLAN_NOTE_WIDTH : NOTE_WIDTH
    const noteHeight =
      pageKind === 'buildPlan' ? BUILD_PLAN_NOTE_HEIGHT : NOTE_HEIGHT
    const noteId = await createNote({
      pageId: currentPageId,
      sessionId: identity.sessionId,
      authorName: identity.name,
      text: '',
      project: pageKind === 'buildPlan' ? '' : undefined,
      supportQuestion: pageKind === 'buildPlan' ? '' : undefined,
      x: center.x - noteWidth / 2,
      y: center.y - noteHeight / 2,
      rotation: randomTilt(),
      color: DEFAULT_NOTE_COLOR,
    })
    markNoteJustCreated(noteId)
  }

  return (
    <BoardActionsProvider
      onAddNote={() => void handleAddNote()}
      isAutoFitEnabled={isAutoFitEnabled}
      onToggleAutoFit={handleToggleAutoFit}
      canAddNote={canAddNote}
      addNoteHint={addNoteHint}
      addNoteTitle={addNoteTitle}
      addNoteLabel={addNoteLabel}
      addNoteLimit={addNoteLimit}
      addNoteShortLabel={addNoteShortLabel}
    >
      <Tldraw
        licenseKey={import.meta.env.VITE_TLDRAW_LICENSE_KEY}
        shapeUtils={shapeUtils}
        components={components}
        overrides={boardUiOverrides}
        colorScheme={resolvedTheme}
        onMount={(e) => {
          configureEditor(e)
          configureMobileEditor(e)
          setEditor(e)
        }}
      >
        <TopBar
          onAddNote={() => void handleAddNote()}
          onClearDrawings={onRequestClearCanvas}
          canAddNote={canAddNote}
          addNoteHint={addNoteHint}
          addNoteTitle={addNoteTitle}
          addNoteLabel={addNoteLabel}
          addNoteLimit={addNoteLimit}
          addNoteShortLabel={addNoteShortLabel}
          onEditProfile={onEditProfile}
        />
      </Tldraw>
    </BoardActionsProvider>
  )
}
