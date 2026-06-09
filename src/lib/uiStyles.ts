import type { CSSProperties } from 'react'

export const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  padding: '12px 14px',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-text)',
  outline: 'none',
  minHeight: 44,
}

export const labelStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--color-text-muted)',
  marginBottom: 6,
  display: 'block',
}

export const modalCardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 360,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 16,
  boxShadow: 'var(--shadow-card)',
  padding: 28,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}

export const displayTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 400,
  color: 'var(--color-text)',
}

export const modalBodyStyle: CSSProperties = {
  margin: '10px 0 0',
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-sans)',
}

export const modalBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 20000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  background: 'var(--color-backdrop)',
}

export const pageOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  background: 'var(--color-bg)',
}
