/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'

const DeleteContext = createContext<((noteId: string) => void) | null>(null)

export function DeleteProvider({
  onRequestDelete,
  children,
}: {
  onRequestDelete: (noteId: string) => void
  children: React.ReactNode
}) {
  return (
    <DeleteContext.Provider value={onRequestDelete}>
      {children}
    </DeleteContext.Provider>
  )
}

export function useRequestDelete(): (noteId: string) => void {
  const request = useContext(DeleteContext)
  if (!request) {
    throw new Error('useRequestDelete must be used within DeleteProvider')
  }
  return request
}
