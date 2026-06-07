/** Fixed overlay so the logo link receives clicks above the tldraw canvas. */
export function CursorWatermark() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 150,
      }}
    >
      <a
        href="https://cursor.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Cursor — opens in a new tab"
        className="board-cursor-mark"
        style={{ pointerEvents: 'auto' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <img src="/cursor-lockup-vertical.png" alt="" draggable={false} />
      </a>
    </div>
  )
}
