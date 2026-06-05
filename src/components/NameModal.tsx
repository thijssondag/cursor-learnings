import { useState } from 'react'

export function NameModal({ onJoin }: { onJoin: (name: string) => void }) {
  const [name, setName] = useState('')
  const canJoin = name.trim().length > 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canJoin) onJoin(name)
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
          gap: 20,
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

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={32}
          style={{
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
          }}
        />

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
          }}
        >
          Join board
        </button>
      </form>
    </div>
  )
}
