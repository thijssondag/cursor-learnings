import { v4 as uuidv4 } from 'uuid'

const SESSION_KEY = 'clb.sessionId'
const NAME_KEY = 'clb.name'
const COLOR_KEY = 'clb.color'

// Small pastel palette matching the mockup cursor chips.
export const USER_COLORS = [
  '#34d399', // mint
  '#f472b6', // pink
  '#60a5fa', // blue
  '#a78bfa', // purple
  '#fbbf24', // amber
  '#22d3ee', // cyan
  '#fb7185', // rose
  '#4ade80', // green
]

export interface Identity {
  sessionId: string
  name: string
  color: string
}

function pickColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}

export function getStoredIdentity(): Identity | null {
  const sessionId = localStorage.getItem(SESSION_KEY)
  const name = localStorage.getItem(NAME_KEY)
  const color = localStorage.getItem(COLOR_KEY)
  if (!sessionId || !name || !color) return null
  return { sessionId, name, color }
}

export function createIdentity(name: string): Identity {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Name is required')
  const sessionId = localStorage.getItem(SESSION_KEY) ?? uuidv4()
  const color = localStorage.getItem(COLOR_KEY) ?? pickColor(sessionId)
  const identity: Identity = { sessionId, name: trimmed, color }
  localStorage.setItem(SESSION_KEY, sessionId)
  localStorage.setItem(NAME_KEY, identity.name)
  localStorage.setItem(COLOR_KEY, color)
  return identity
}
