import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react'
import type { Id } from '../../convex/_generated/dataModel'
import { usePageContext, type BoardPage } from '../context/PageContext'
import { APP_VERSION } from '../lib/constants'
import { iconProps } from '../lib/iconProps'
import { inputStyle } from '../lib/uiStyles'
import { Button } from './Button'
import { MotionButton } from './MotionButton'

export function PageMenu() {
  const { pages, currentPage, currentPageId, setCurrentPageId, createPage, renamePage, deletePage } =
    usePageContext()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newPageName, setNewPageName] = useState('')
  const [editingPageId, setEditingPageId] = useState<Id<'pages'> | null>(null)
  const [editName, setEditName] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null)

  const closeMenu = () => {
    setOpen(false)
    setCreating(false)
    setEditingPageId(null)
    setNewPageName('')
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (menuRef.current?.contains(target) || panelRef.current?.contains(target)) return
      closeMenu()
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (editingPageId) {
        setEditingPageId(null)
        setEditName('')
        return
      }
      if (creating) {
        setCreating(false)
        setNewPageName('')
        return
      }
      closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, editingPageId, creating])

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setPanelPos(null)
      return
    }
    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect()
      const panelWidth = 260
      const margin = 12
      const left = Math.min(
        rect.left,
        window.innerWidth - panelWidth - margin,
      )
      setPanelPos({ top: rect.bottom + 8, left: Math.max(margin, left) })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
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
      <span className="page-menu__title">
        {currentPage?.name ?? 'Cursor Learnings'}
      </span>
      <MotionButton
        ref={triggerRef}
        type="button"
        variant="ghost"
        title="Pages"
        aria-label="Pages menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="page-menu__trigger"
      >
        <IconDots {...iconProps(18)} />
      </MotionButton>

      {open &&
        panelPos &&
        createPortal(
        <div
          ref={panelRef}
          className="page-menu__panel"
          style={{
            position: 'fixed',
            top: panelPos.top,
            left: panelPos.left,
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
                background:
                  page._id === currentPageId ? 'var(--color-surface-muted)' : 'transparent',
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
                    ...inputStyle,
                    flex: 1,
                    minWidth: 0,
                    minHeight: 36,
                    padding: '6px 8px',
                  }}
                />
              ) : (
                <MotionButton
                  type="button"
                  variant="ghost"
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
                    fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {page.name}
                  {page.isLocked && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--color-text-faint)' }}>
                      locked
                    </span>
                  )}
                </MotionButton>
              )}

              {page.canDelete && editingPageId !== page._id && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <MotionButton
                    type="button"
                    variant="ghost"
                    aria-label="Rename page"
                    title="Rename page"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditing(page)
                    }}
                    style={iconBtnStyle}
                  >
                    <IconPencil {...iconProps(14)} />
                  </MotionButton>
                  <MotionButton
                    type="button"
                    variant="ghost"
                    aria-label="Delete page"
                    title="Delete page"
                    onClick={(e) => {
                      e.stopPropagation()
                      void handleDeletePage(page)
                    }}
                    style={{ ...iconBtnStyle, color: 'var(--color-error)' }}
                  >
                    <IconTrash {...iconProps(14)} />
                  </MotionButton>
                </div>
              )}
            </div>
          ))}

          <div style={{ height: 1, background: 'var(--color-border)', margin: '6px 0' }} />

          {creating ? (
            <div style={{ padding: '4px 8px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                autoFocus
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Page name"
                maxLength={48}
                style={{
                  ...inputStyle,
                  fontSize: 13,
                  minHeight: 36,
                  padding: '8px 10px',
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <Button type="button" color="primary" size="sm" onClick={() => void handleCreate()} fullWidth>
                  Create
                </Button>
                <Button
                  type="button"
                  color="secondary"
                  size="sm"
                  onClick={() => {
                    setCreating(false)
                    setNewPageName('')
                  }}
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" color="tertiary" size="sm" onClick={() => setCreating(true)} fullWidth className="page-menu__new-page">
              New page
            </Button>
          )}
          <div
            aria-hidden
            style={{
              fontSize: 10,
              lineHeight: 1.2,
              color: 'var(--color-text)',
              opacity: 0.3,
              textAlign: 'center',
              padding: '4px 8px 2px',
              fontFamily: 'var(--font-sans)',
              userSelect: 'none',
            }}
          >
            v{APP_VERSION}
          </div>
        </div>,
        document.body,
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
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
}
