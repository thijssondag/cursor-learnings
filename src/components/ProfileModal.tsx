import { useState } from 'react'
import type { Identity } from '../lib/identity'
import { displayTitleStyle, inputStyle, labelStyle } from '../lib/uiStyles'
import { Modal } from './Modal'
import { Button } from './Button'

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
      <h2
        id="profile-title"
        style={{
          ...displayTitleStyle,
          margin: 0,
          fontSize: 24,
          lineHeight: 1.2,
        }}
      >
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
            X handle <span style={{ color: 'var(--color-text-faint)' }}>(optional)</span>
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
            LinkedIn URL <span style={{ color: 'var(--color-text-faint)' }}>(optional)</span>
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
        <Button type="button" color="secondary" size="md" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button type="submit" color="primary" size="md" isDisabled={!canSave} fullWidth>
          Save
        </Button>
      </div>
    </Modal>
  )
}
