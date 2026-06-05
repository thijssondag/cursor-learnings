/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Identity } from '../lib/identity'

export interface PresenceUser {
  sessionId: string
  name: string
  color: string
  x: number
  y: number
  lastSeen: number
}

interface PresenceContextValue {
  onlineUsers: PresenceUser[]
  remoteUsers: PresenceUser[]
  onlineCount: number
}

const PresenceContext = createContext<PresenceContextValue | null>(null)

export function PresenceProvider({
  identity,
  children,
}: {
  identity: Identity
  children: React.ReactNode
}) {
  const raw = useQuery(api.presence.list)
  const onlineUsers = raw ?? []

  const remoteUsers = useMemo(
    () => onlineUsers.filter((u) => u.sessionId !== identity.sessionId),
    [onlineUsers, identity.sessionId],
  )

  const value = useMemo(
    () => ({
      onlineUsers,
      remoteUsers,
      onlineCount: onlineUsers.length,
    }),
    [onlineUsers, remoteUsers],
  )

  return (
    <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
  )
}

export function usePresenceContext(): PresenceContextValue {
  const ctx = useContext(PresenceContext)
  if (!ctx) {
    throw new Error('usePresenceContext must be used within PresenceProvider')
  }
  return ctx
}
