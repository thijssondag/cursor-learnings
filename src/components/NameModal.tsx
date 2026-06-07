import { useState } from 'react'
import type { SocialProfileInput } from '../lib/identity'

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#ffffff',
  border: '1px solid #e5e5e5',
  borderRadius: 4,
  padding: '12px 14px',
  fontSize: 14,
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  color: '#000000',
  outline: 'none',
  minHeight: 44,
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#777169',
  marginBottom: 6,
  display: 'block',
}

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#fdfcfc',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: 360,
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: 16,
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.4), 0 4px 12px 0 rgba(0,0,0,0.06)',
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h1
          style={{
            margin: 0,
            textAlign: 'center',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            fontSize: 30,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: '#000000',
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
            X handle <span style={{ color: '#b1b0b0' }}>(optional)</span>
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
            LinkedIn URL <span style={{ color: '#b1b0b0' }}>(optional)</span>
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

        <button
          type="submit"
          disabled={!canJoin}
          style={{
            width: '100%',
            background: '#000000',
            color: '#fdfcfc',
            border: 'none',
            borderRadius: 9999,
            padding: '12px 16px',
            minHeight: 44,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            cursor: canJoin ? 'pointer' : 'not-allowed',
            opacity: canJoin ? 1 : 0.5,
            marginTop: 4,
          }}
        >
          Join board
        </button>
      </form>
    </div>
  )
}
