import { v4 as uuidv4 } from 'uuid'

const SESSION_KEY = 'clb.sessionId'
const NAME_KEY = 'clb.name'
const COLOR_KEY = 'clb.color'
const X_HANDLE_KEY = 'clb.xHandle'
const LINKEDIN_KEY = 'clb.linkedInUrl'

// Small pastel palette matching the mockup cursor chips.
export const USER_COLORS = [
  '#34d399', // mint
  '#f472b6', // pink
  '#60a5fa', // blue
  '#a78bfa', // purple
  '#fbbf24', // amber
  '#22d3ee', // cyan
]

export interface Identity {
  sessionId: string
  name: string
  color: string
  xHandle?: string
  linkedInUrl?: string
}

export interface SocialProfileInput {
  xHandle?: string
  linkedInUrl?: string
}

function pickColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}

function normalizeXHandle(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim().replace(/^@/, '')
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeLinkedInUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function readSocialFromStorage(): Pick<Identity, 'xHandle' | 'linkedInUrl'> {
  const xHandle = localStorage.getItem(X_HANDLE_KEY) ?? undefined
  const linkedInUrl = localStorage.getItem(LINKEDIN_KEY) ?? undefined
  return {
    xHandle: xHandle || undefined,
    linkedInUrl: linkedInUrl || undefined,
  }
}

function writeSocialToStorage(social: SocialProfileInput) {
  const xHandle = normalizeXHandle(social.xHandle)
  const linkedInUrl = normalizeLinkedInUrl(social.linkedInUrl)
  if (xHandle) localStorage.setItem(X_HANDLE_KEY, xHandle)
  else localStorage.removeItem(X_HANDLE_KEY)
  if (linkedInUrl) localStorage.setItem(LINKEDIN_KEY, linkedInUrl)
  else localStorage.removeItem(LINKEDIN_KEY)
}

export function getStoredIdentity(): Identity | null {
  const sessionId = localStorage.getItem(SESSION_KEY)
  const name = localStorage.getItem(NAME_KEY)
  const color = localStorage.getItem(COLOR_KEY)
  if (!sessionId || !name || !color) return null
  return { sessionId, name, color, ...readSocialFromStorage() }
}

export function createIdentity(
  name: string,
  social: SocialProfileInput = {},
): Identity {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Name is required')
  const sessionId = localStorage.getItem(SESSION_KEY) ?? uuidv4()
  const color = localStorage.getItem(COLOR_KEY) ?? pickColor(sessionId)
  writeSocialToStorage(social)
  const identity: Identity = {
    sessionId,
    name: trimmed,
    color,
    ...readSocialFromStorage(),
  }
  localStorage.setItem(SESSION_KEY, sessionId)
  localStorage.setItem(NAME_KEY, identity.name)
  localStorage.setItem(COLOR_KEY, color)
  return identity
}

export function updateIdentity(
  current: Identity,
  updates: { name?: string; xHandle?: string; linkedInUrl?: string },
): Identity {
  const name = updates.name?.trim() || current.name
  writeSocialToStorage({
    xHandle: updates.xHandle ?? current.xHandle,
    linkedInUrl: updates.linkedInUrl ?? current.linkedInUrl,
  })
  const identity: Identity = {
    ...current,
    name,
    ...readSocialFromStorage(),
  }
  localStorage.setItem(NAME_KEY, identity.name)
  return identity
}
