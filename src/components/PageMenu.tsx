import { useEffect, useRef, useState } from 'react'
import type { Id } from '../../convex/_generated/dataModel'
import { usePageContext, type BoardPage } from '../context/PageContext'
import { APP_VERSION } from '../lib/constants'

export function PageMenu() {
  const { pages, currentPage, currentPageId, setCurrentPageId, createPage, renamePage, deletePage } =
    usePageContext()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newPageName, setNewPageName] = useState('')
  const [editingPageId, setEditingPageId] = useState<Id<'pages'> | null>(null)
  const [editName, setEditName] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setCreating(false)
        setEditingPageId(null)
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

  const startEditing = (page: BoardPage) => {
    setEditingPageId(page._id)
    setEditName(page.name)
  }

  const cancelEditing = () => {
    setEditingPageId(null)
    setEditName('')
  }

  const handleRename = async (page: BoardPage) => {
    const name = editName.trim()
    if (!name || name === page.name) {
      cancelEditing()
      return
    }
    await renamePage(page._id, name)
    cancelEditing()
  }

  const handleDeletePage = async (page: BoardPage) => {
    if (!page.canDelete) return
    if (!window.confirm(`Delete "${page.name}" and all its notes?`)) return
    await deletePage(page._id)
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
            minWidth: 260,
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: 12,
            boxShadow: '0 0 1px 0 rgba(0,0,0,0.4), 0 4px 12px 0 rgba(0,0,0,0.06)',
            padding: 8,
            zIndex: 400,
          }}
        >
          {pages?.map((page) => (
            <div
              key={page._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                borderRadius: 8,
                padding: '4px 6px',
                background: page._id === currentPageId ? '#f5f3f1' : 'transparent',
              }}
            >
              {editingPageId === page._id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleRename(page)
                    if (e.key === 'Escape') cancelEditing()
                  }}
                  onBlur={() => void handleRename(page)}
                  maxLength={48}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    boxSizing: 'border-box',
                    border: '1px solid #e5e5e5',
                    borderRadius: 4,
                    padding: '6px 8px',
                    fontSize: 14,
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPageId(page._id as Id<'pages'>)
                    setOpen(false)
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: 6,
                    padding: '6px 8px',
                    fontSize: 14,
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                    color: '#000000',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {page.name}
                  {page.isLocked && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: '#a59f97' }}>locked</span>
                  )}
                </button>
              )}

              {page.canDelete && editingPageId !== page._id && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <button
                    type="button"
                    aria-label="Rename page"
                    title="Rename page"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditing(page)
                    }}
                    style={iconBtnStyle}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete page"
                    title="Delete page"
                    onClick={(e) => {
                      e.stopPropagation()
                      void handleDeletePage(page)
                    }}
                    style={{ ...iconBtnStyle, color: '#b42318' }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              )}
            </div>
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
          <div
            aria-hidden
            style={{
              fontSize: 10,
              lineHeight: 1.2,
              color: '#000000',
              opacity: 0.3,
              textAlign: 'center',
              padding: '4px 8px 2px',
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              userSelect: 'none',
            }}
          >
            v{APP_VERSION}
          </div>
        </div>
      )}
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  border: 'none',
  background: 'transparent',
  borderRadius: 6,
  color: '#777169',
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
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

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M9 7V5h6v2M10 11v5M14 11v5M6 7l1 12h10l1-12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
