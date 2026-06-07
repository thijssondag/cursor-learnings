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
        <img src="/cursor-mark.svg" alt="" draggable={false} />
      </a>
    </div>
  )
}
