import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Identity } from '../lib/identity'
import {
  displayTitleStyle,
  inputStyle,
  labelStyle,
  modalBackdropStyle,
  modalCardStyle,
  primaryBtnStyle,
  secondaryBtnStyle,
} from '../lib/uiStyles'
import { MotionButton } from './MotionButton'

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
    <div className="modal-backdrop-enter" style={modalBackdropStyle} onClick={onClose}>
      <form
        role="dialog"
        aria-labelledby="profile-title"
        aria-modal="true"
        className="modal-card-enter"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        style={modalCardStyle}
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

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <MotionButton type="button" onClick={onClose} style={{ ...secondaryBtnStyle, flex: 1 }}>
            Cancel
          </MotionButton>
          <MotionButton
            type="submit"
            disabled={!canSave}
            style={{
              ...primaryBtnStyle,
              flex: 1,
              cursor: canSave ? 'pointer' : 'not-allowed',
              opacity: canSave ? 1 : 0.5,
            }}
          >
            Save
          </MotionButton>
        </div>
      </form>
    </div>,
    document.body,
  )
}
