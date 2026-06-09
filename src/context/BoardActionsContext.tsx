/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'

interface BoardActionsContextValue {
  onAddNote: () => void
  canAddNote: boolean
  addNoteHint: string
  addNoteTitle: string
}

const BoardActionsContext = createContext<BoardActionsContextValue | null>(null)

export function BoardActionsProvider({
  onAddNote,
  canAddNote,
  addNoteHint,
  addNoteTitle,
  children,
}: BoardActionsContextValue & { children: React.ReactNode }) {
  return (
    <BoardActionsContext.Provider
      value={{ onAddNote, canAddNote, addNoteHint, addNoteTitle }}
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
