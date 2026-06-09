import { useState } from 'react'
import type { Identity } from '../lib/identity'
import { Modal } from './Modal'
import {
  modalCancelBtnStyle,
  modalPrimaryBtnStyle,
  modalTitleStyle,
} from './modalStyles'

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
  open,
  identity,
  onSave,
  onClose,
}: {
  open: boolean
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      titleId="profile-title"
      as="form"
      onSubmit={submit}
      maxWidth={360}
    >
      <h2 id="profile-title" style={{ ...modalTitleStyle, marginBottom: 0 }}>
        Edit profile
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onClose} style={modalCancelBtnStyle}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSave}
          style={{
            ...modalPrimaryBtnStyle,
            cursor: canSave ? 'pointer' : 'not-allowed',
            opacity: canSave ? 1 : 0.5,
          }}
        >
          Save
        </button>
      </div>
    </Modal>
  )
}
