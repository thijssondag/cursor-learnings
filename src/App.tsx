import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Board } from './board/Board'
import { NameModal } from './components/NameModal'
import { createIdentity, getStoredIdentity, type Identity } from './lib/identity'

function App() {
  const [identity, setIdentity] = useState<Identity | null>(() =>
    getStoredIdentity(),
  )
  const upsertProfile = useMutation(api.profiles.upsert)

  const handleJoin = async (
    name: string,
    social: { xHandle?: string; linkedInUrl?: string },
  ) => {
    const next = createIdentity(name, social)
    setIdentity(next)
    await upsertProfile({
      sessionId: next.sessionId,
      name: next.name,
      xHandle: next.xHandle,
      linkedInUrl: next.linkedInUrl,
    })
  }

  const handleIdentityChange = (next: Identity) => {
    setIdentity(next)
  }

  if (!identity) {
    return <NameModal onJoin={(name, social) => void handleJoin(name, social)} />
  }

  return (
    <Board identity={identity} onIdentityChange={handleIdentityChange} />
  )
}

export default App
