import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconDots, IconTrash } from '@tabler/icons-react'
import { iconProps } from '../lib/iconProps'
import { NOTE_COLORS, noteSwatchColor } from '../lib/noteColors'
import { MotionButton } from './MotionButton'

const PANEL_WIDTH = 188

export function NoteOwnerMenu({
  cardColor,
  onColorSelect,
  onDelete,
}: {
  cardColor: string
  onColorSelect: (color: string) => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null)

  const closeMenu = () => setOpen(false)

  const stop = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation()

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
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setPanelPos(null)
      return
    }
    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect()
      const margin = 8
      const left = Math.min(
        rect.right - PANEL_WIDTH,
        window.innerWidth - PANEL_WIDTH - margin,
      )
      setPanelPos({
        top: rect.bottom + 4,
        left: Math.max(margin, left),
      })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: 0,
        right: 2,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'auto',
      }}
      onPointerDown={stop}
    >
      <MotionButton
        ref={triggerRef}
        type="button"
        variant="ghost"
        title="Note options"
        aria-label="Note options"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="note-owner-menu__trigger"
        style={{
          width: 28,
          height: 28,
          minWidth: 28,
          minHeight: 28,
          padding: 0,
          border: 'none',
          borderRadius: 6,
          background: 'transparent',
          color: 'var(--color-text-faint)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconDots {...iconProps(16)} />
      </MotionButton>

      {open &&
        panelPos &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            className="note-owner-menu__panel"
            style={{
              position: 'fixed',
              top: panelPos.top,
              left: panelPos.left,
              width: PANEL_WIDTH,
            }}
            onPointerDown={stop}
          >
            <div
              role="group"
              aria-label="Card color"
              style={{ padding: '4px 6px 8px' }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-faint)',
                  marginBottom: 8,
                }}
              >
                Color
              </span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {NOTE_COLORS.map((swatch) => {
                  const selected = swatch === cardColor
                  return (
                    <MotionButton
                      key={swatch}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      aria-label={selected ? 'Current color' : 'Set color'}
                      variant="ghost"
                      onClick={() => {
                        onColorSelect(swatch)
                        closeMenu()
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        minWidth: 28,
                        minHeight: 28,
                        padding: 0,
                        borderRadius: '50%',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: noteSwatchColor(swatch),
                          border: selected
                            ? '2px solid var(--color-text)'
                            : '2px solid transparent',
                          boxShadow: selected
                            ? '0 0 0 2px var(--color-surface), 0 0 0 3px var(--color-text)'
                            : 'none',
                        }}
                      />
                    </MotionButton>
                  )
                })}
              </div>
            </div>

            <div
              style={{
                height: 1,
                margin: '0 6px',
                background: 'var(--color-border)',
              }}
            />

            <MotionButton
              type="button"
              role="menuitem"
              variant="ghost"
              onClick={() => {
                closeMenu()
                onDelete()
              }}
              className="note-owner-menu__delete"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                borderRadius: 8,
                background: 'transparent',
                color: 'var(--color-text-muted)',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <IconTrash {...iconProps(16)} />
              Delete note
            </MotionButton>
          </div>,
          document.body,
        )}
    </div>
  )
}
