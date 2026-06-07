import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Identity } from '../lib/identity'

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

export function ProfileModal({
  identity,
  onSave,
  onClose,
}: {
  identity: Identity
  onSave: (updates: {
    name: string
    xHandle: string
    linkedInUrl: string
  }) => void
  onClose: () => void
}) {
  const [name, setName] = useState(identity.name)
  const [xHandle, setXHandle] = useState(identity.xHandle ?? '')
  const [linkedInUrl, setLinkedInUrl] = useState(identity.linkedInUrl ?? '')
  const canSave = name.trim().length > 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    onSave({ name, xHandle, linkedInUrl })
  }

  return createPortal(
    <div
      className="modal-backdrop-enter"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0, 0, 0, 0.15)',
      }}
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-labelledby="profile-title"
        aria-modal="true"
        className="modal-card-enter"
        onClick={(e) => e.stopPropagation()}
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
        <h2
          id="profile-title"
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            fontSize: 24,
            lineHeight: 1.2,
            color: '#000000',
          }}
        >
          Edit profile
        </h2>

        <div>
          <label htmlFor="profile-name" style={labelStyle}>
            Name
          </label>
          <input
            id="profile-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="profile-x" style={labelStyle}>
            X handle <span style={{ color: '#b1b0b0' }}>(optional)</span>
          </label>
          <input
            id="profile-x"
            value={xHandle}
            onChange={(e) => setXHandle(e.target.value)}
            placeholder="@username"
            maxLength={32}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="profile-linkedin" style={labelStyle}>
            LinkedIn URL <span style={{ color: '#b1b0b0' }}>(optional)</span>
          </label>
          <input
            id="profile-linkedin"
            value={linkedInUrl}
            onChange={(e) => setLinkedInUrl(e.target.value)}
            placeholder="https://linkedin.com/in/…"
            maxLength={200}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              background: '#ffffff',
              color: '#000000',
              border: '1px solid #e5e5e5',
              borderRadius: 9999,
              padding: '12px 16px',
              minHeight: 44,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            style={{
              flex: 1,
              background: '#000000',
              color: '#fdfcfc',
              border: 'none',
              borderRadius: 9999,
              padding: '12px 16px',
              minHeight: 44,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              cursor: canSave ? 'pointer' : 'not-allowed',
              opacity: canSave ? 1 : 0.5,
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
