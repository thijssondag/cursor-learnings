/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'
import type { Identity } from '../lib/identity'

const IdentityContext = createContext<Identity | null>(null)

export function IdentityProvider({
  identity,
  children,
}: {
  identity: Identity
  children: React.ReactNode
}) {
  return (
    <IdentityContext.Provider value={identity}>
      {children}
    </IdentityContext.Provider>
  )
}

export function useIdentity(): Identity {
  const identity = useContext(IdentityContext)
  if (!identity) throw new Error('useIdentity must be used within IdentityProvider')
  return identity
}
