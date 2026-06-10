import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  IconDeviceDesktop,
  IconDots,
  IconEraser,
  IconMoon,
  IconPencil,
  IconQrcode,
  IconSun,
  IconTrash,
  IconUser,
} from '@tabler/icons-react'
import type { Id } from '../../convex/_generated/dataModel'
import { usePageContext, type BoardPage } from '../context/PageContext'
import { useQrCode } from '../context/QrCodeContext'
import { useTheme, type ThemePreference } from '../context/ThemeContext'
import { APP_VERSION } from '../lib/constants'
import { iconProps } from '../lib/iconProps'
import { inputStyle } from '../lib/uiStyles'
import { MotionButton } from './MotionButton'

const THEME_LABELS: Record<ThemePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

export function PageMenu({
  onEditProfile,
  onClearDrawings,
}: {
  onEditProfile: () => void
  onClearDrawings: () => void
}) {
  const { pages, currentPage, currentPageId, setCurrentPageId, createPage, renamePage, deletePage } =
    usePageContext()
  const { preference, cyclePreference } = useTheme()
  const { isQrVisible, toggleQr } = useQrCode()
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

          <div className="page-menu__pages-divider" />

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
                <MotionButton type="button" onClick={() => void handleCreate()} style={menuBtnPrimaryStyle}>
                  Create
                </MotionButton>
                <MotionButton
                  type="button"
                  onClick={() => {
                    setCreating(false)
                    setNewPageName('')
                  }}
                  style={menuBtnSecondaryStyle}
                >
                  Cancel
                </MotionButton>
              </div>
            </div>
          ) : (
            <MotionButton
              type="button"
              onClick={() => setCreating(true)}
              style={menuAddPageStyle}
            >
              + Add new page
            </MotionButton>
          )}

          <div className="page-menu__mobile-actions-divider" />

          <div className="page-menu__mobile-actions">
            <MotionButton
              type="button"
              onClick={() => {
                onEditProfile()
                closeMenu()
              }}
              style={menuActionStyle}
            >
              <IconUser {...iconProps(16)} aria-hidden />
              Edit profile
            </MotionButton>
            <MotionButton
              type="button"
              onClick={cyclePreference}
              style={menuActionStyle}
            >
              <ThemeMenuIcon preference={preference} />
              Theme: {THEME_LABELS[preference]}
            </MotionButton>
            <MotionButton
              type="button"
              onClick={toggleQr}
              aria-pressed={isQrVisible}
              style={{
                ...menuActionStyle,
                ...(isQrVisible ? menuActionActiveStyle : undefined),
              }}
            >
              <IconQrcode {...iconProps(16)} aria-hidden />
              {isQrVisible ? 'Hide QR code' : 'Show QR code'}
            </MotionButton>
            <MotionButton
              type="button"
              onClick={() => {
                onClearDrawings()
                closeMenu()
              }}
              style={menuActionStyle}
            >
              <IconEraser {...iconProps(16)} aria-hidden />
              Clear drawings
            </MotionButton>
          </div>

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

function ThemeMenuIcon({ preference }: { preference: ThemePreference }) {
  if (preference === 'light') return <IconSun {...iconProps(16)} aria-hidden />
  if (preference === 'dark') return <IconMoon {...iconProps(16)} aria-hidden />
  return <IconDeviceDesktop {...iconProps(16)} aria-hidden />
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

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  border: 'none',
  background: 'transparent',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  fontWeight: 500,
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-text)',
  cursor: 'pointer',
}

const menuAddPageStyle: React.CSSProperties = {
  ...menuItemStyle,
  color: 'var(--color-text-muted)',
}

const menuActionStyle: React.CSSProperties = {
  ...menuItemStyle,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
}

const menuActionActiveStyle: React.CSSProperties = {
  background: 'var(--color-surface-muted)',
  color: 'var(--color-accent)',
}

const menuBtnBase: React.CSSProperties = {
  flex: 1,
  borderRadius: 9999,
  padding: '8px 10px',
  fontSize: 13,
  fontFamily: 'var(--font-sans)',
  fontWeight: 500,
  cursor: 'pointer',
}

const menuBtnPrimaryStyle: React.CSSProperties = {
  ...menuBtnBase,
  background: 'var(--color-btn-bg)',
  color: 'var(--color-btn-text)',
  border: 'none',
}

const menuBtnSecondaryStyle: React.CSSProperties = {
  ...menuBtnBase,
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
}
