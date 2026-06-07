import { useEffect, useRef, useState } from 'react'
import type { Id } from '../../convex/_generated/dataModel'
import { usePageContext } from '../context/PageContext'

export function PageMenu() {
  const { pages, currentPage, currentPageId, setCurrentPageId, createPage, deletePage } =
    usePageContext()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newPageName, setNewPageName] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setCreating(false)
      }
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const handleCreate = async () => {
    const name = newPageName.trim() || undefined
    await createPage(name)
    setNewPageName('')
    setCreating(false)
    setOpen(false)
  }

  const handleDelete = async () => {
    if (!currentPageId || !currentPage?.canDelete) return
    if (!window.confirm(`Delete "${currentPage.name}" and all its notes?`)) return
    await deletePage(currentPageId)
    setOpen(false)
  }

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500,
          fontSize: 22,
          lineHeight: 1.1,
          color: '#000000',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 220,
        }}
      >
        {currentPage?.name ?? 'Cursor Learnings'}
      </span>
      <button
        type="button"
        title="Pages"
        aria-label="Pages menu"
        onClick={() => setOpen((v) => !v)}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: '#777169',
          fontSize: 18,
          lineHeight: 1,
          padding: '4px 6px',
          borderRadius: 6,
        }}
      >
        ⋯
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            minWidth: 220,
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: 12,
            boxShadow: '0 0 1px 0 rgba(0,0,0,0.4), 0 4px 12px 0 rgba(0,0,0,0.06)',
            padding: 8,
            zIndex: 400,
          }}
        >
          {pages?.map((page) => (
            <button
              key={page._id}
              type="button"
              onClick={() => {
                setCurrentPageId(page._id as Id<'pages'>)
                setOpen(false)
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: page._id === currentPageId ? '#f5f3f1' : 'transparent',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 14,
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                color: '#000000',
                cursor: 'pointer',
              }}
            >
              {page.name}
              {page.isLocked && (
                <span style={{ marginLeft: 6, fontSize: 11, color: '#a59f97' }}>locked</span>
              )}
            </button>
          ))}

          <div style={{ height: 1, background: '#e5e5e5', margin: '6px 0' }} />

          {creating ? (
            <div style={{ padding: '4px 8px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                autoFocus
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Page name"
                maxLength={48}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1px solid #e5e5e5',
                  borderRadius: 4,
                  padding: '8px 10px',
                  fontSize: 13,
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  style={menuBtnStyle('#000000', '#fdfcfc')}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false)
                    setNewPageName('')
                  }}
                  style={menuBtnStyle('#ffffff', '#000000', true)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              style={menuItemStyle}
            >
              New page
            </button>
          )}

          {currentPage?.canDelete && (
            <button
              type="button"
              onClick={() => void handleDelete()}
              style={{ ...menuItemStyle, color: '#b42318' }}
            >
              Delete this page
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  border: 'none',
  background: 'transparent',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  color: '#000000',
  cursor: 'pointer',
}

function menuBtnStyle(bg: string, color: string, bordered = false): React.CSSProperties {
  return {
    flex: 1,
    background: bg,
    color,
    border: bordered ? '1px solid #e5e5e5' : 'none',
    borderRadius: 9999,
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    cursor: 'pointer',
  }
}
