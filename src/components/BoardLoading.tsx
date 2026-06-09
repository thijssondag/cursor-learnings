export function BoardLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--color-bg)',
        fontFamily: 'var(--font-sans)',
        color: 'var(--color-text)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-text)',
          animation: 'board-spin 0.8s linear infinite',
        }}
      />
      <p style={{ margin: 0, fontSize: 15, fontWeight: 400 }}>Loading board…</p>
    </div>
  )
}
