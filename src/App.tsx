import { useState } from 'react'
import { Board } from './board/Board'
import { NameModal } from './components/NameModal'
import { createIdentity, getStoredIdentity, type Identity } from './lib/identity'

function App() {
  const [identity, setIdentity] = useState<Identity | null>(() =>
    getStoredIdentity(),
  )

  if (!identity) {
    return <NameModal onJoin={(name) => setIdentity(createIdentity(name))} />
  }

  return <Board identity={identity} />
}

export default App
