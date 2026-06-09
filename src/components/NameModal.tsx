import { useState } from 'react'
import type { SocialProfileInput } from '../lib/identity'
import {
  displayTitleStyle,
  inputStyle,
  labelStyle,
  modalCardStyle,
  pageOverlayStyle,
  primaryBtnStyle,
} from '../lib/uiStyles'
import { MotionButton } from './MotionButton'

export function NameModal({
  onJoin,
}: {
  onJoin: (name: string, social: SocialProfileInput) => void
}) {
  const [name, setName] = useState('')
  const [xHandle, setXHandle] = useState('')
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const canJoin = name.trim().length > 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canJoin) {
      onJoin(name, {
        xHandle: xHandle || undefined,
        linkedInUrl: linkedInUrl || undefined,
      })
    }
  }

  return (
    <div style={pageOverlayStyle}>
      <form onSubmit={submit} style={modalCardStyle}>
        <h1
          style={{
            ...displayTitleStyle,
            margin: 0,
            textAlign: 'center',
            fontSize: 30,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          Cursor
          <br />
          Learnings Board
        </h1>

        <div>
          <label htmlFor="join-name" style={labelStyle}>
            Your name
          </label>
          <input
            id="join-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={32}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="join-x" style={labelStyle}>
            X handle <span style={{ color: 'var(--color-text-faint)' }}>(optional)</span>
          </label>
          <input
            id="join-x"
            value={xHandle}
            onChange={(e) => setXHandle(e.target.value)}
            placeholder="@username"
            maxLength={32}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="join-linkedin" style={labelStyle}>
            LinkedIn URL <span style={{ color: 'var(--color-text-faint)' }}>(optional)</span>
          </label>
          <input
            id="join-linkedin"
            value={linkedInUrl}
            onChange={(e) => setLinkedInUrl(e.target.value)}
            placeholder="https://linkedin.com/in/…"
            maxLength={200}
            style={inputStyle}
          />
        </div>

        <MotionButton
          type="submit"
          disabled={!canJoin}
          style={{
            ...primaryBtnStyle,
            width: '100%',
            cursor: canJoin ? 'pointer' : 'not-allowed',
            opacity: canJoin ? 1 : 0.5,
            marginTop: 4,
          }}
        >
          Join board
        </MotionButton>
      </form>
    </div>
  )
}
