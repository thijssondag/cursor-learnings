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
        background: '#f5f3f1',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        color: '#3d3d3d',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid #e5e5e5',
          borderTopColor: '#3d3d3d',
          animation: 'board-spin 0.8s linear infinite',
        }}
      />
      <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Loading board…</p>
      <style>{`@keyframes board-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
