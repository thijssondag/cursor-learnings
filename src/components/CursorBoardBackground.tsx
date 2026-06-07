export function CursorBoardBackground() {
  return (
    <div className="tl-background board-cursor-background">
      <a
        href="https://cursor.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Cursor"
        className="board-cursor-mark"
      >
        <img src="/cursor-lockup-vertical.png" alt="" draggable={false} />
      </a>
    </div>
  )
}
