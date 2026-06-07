import { lazy, Suspense, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { BoardLoading } from './components/BoardLoading'
import { NameModal } from './components/NameModal'
import { createIdentity, getStoredIdentity, type Identity } from './lib/identity'

const Board = lazy(() =>
  import('./board/Board').then((module) => ({ default: module.Board })),
)

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
    <Suspense fallback={<BoardLoading />}>
      <Board identity={identity} onIdentityChange={handleIdentityChange} />
    </Suspense>
  )
}

export default App
