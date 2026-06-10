/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'

interface BoardActionsContextValue {
  onAddNote: () => void
  isAutoFitEnabled: boolean
  onToggleAutoFit: () => void
  canAddNote: boolean
  addNoteHint: string
  addNoteTitle: string
  addNoteLabel: string
  addNoteLimit: string
  addNoteShortLabel: string
}

const BoardActionsContext = createContext<BoardActionsContextValue | null>(null)

export function BoardActionsProvider({
  onAddNote,
  isAutoFitEnabled,
  onToggleAutoFit,
  canAddNote,
  addNoteHint,
  addNoteTitle,
  addNoteLabel,
  addNoteLimit,
  addNoteShortLabel,
  children,
}: BoardActionsContextValue & { children: React.ReactNode }) {
  return (
    <BoardActionsContext.Provider
      value={{
        onAddNote,
        isAutoFitEnabled,
        onToggleAutoFit,
        canAddNote,
        addNoteHint,
        addNoteTitle,
        addNoteLabel,
        addNoteLimit,
        addNoteShortLabel,
      }}
    >
      {children}
    </BoardActionsContext.Provider>
  )
}

export function useBoardActions(): BoardActionsContextValue {
  const ctx = useContext(BoardActionsContext)
  if (!ctx) throw new Error('useBoardActions must be used within BoardActionsProvider')
  return ctx
}
