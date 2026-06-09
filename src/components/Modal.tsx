import { useEffect, useRef, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  EASE_OUT_QUINT,
  MODAL_BACKDROP_ENTER,
  MODAL_BACKDROP_EXIT,
  MODAL_CARD_ENTER,
  MODAL_CARD_EXIT,
  motionDuration,
} from '../lib/motion'

const cardStyle: React.CSSProperties = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid #e5e5e5',
  borderRadius: 16,
  boxShadow: '0 0 1px 0 rgba(0,0,0,0.4), 0 4px 12px 0 rgba(0,0,0,0.06)',
  padding: 28,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
}

interface ModalBaseProps {
  open: boolean
  onClose: () => void
  titleId: string
  maxWidth?: number
  children: ReactNode
}

interface ModalDivProps extends ModalBaseProps {
  as?: 'div'
  onSubmit?: never
}

interface ModalFormProps extends ModalBaseProps {
  as: 'form'
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export function Modal(props: ModalDivProps | ModalFormProps) {
  const { open, onClose, titleId, maxWidth = 340, children } = props
  const reduceMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement | HTMLFormElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      const el = cardRef.current
      if (!el) return
      const focusable = el.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
      )
      focusable?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open])

  const backdropEnter = motionDuration(MODAL_BACKDROP_ENTER, reduceMotion)
  const backdropExit = motionDuration(MODAL_BACKDROP_EXIT, reduceMotion)
  const cardEnter = motionDuration(MODAL_CARD_ENTER, reduceMotion)
  const cardExit = motionDuration(MODAL_CARD_EXIT, reduceMotion)

  const cardMotionProps = {
    role: 'dialog' as const,
    'aria-labelledby': titleId,
    'aria-modal': true,
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    style: { ...cardStyle, maxWidth },
    initial: { opacity: 0, scale: 0.97 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: cardEnter, ease: EASE_OUT_QUINT },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: { duration: cardExit, ease: EASE_OUT_QUINT },
    },
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: backdropEnter, ease: EASE_OUT_QUINT },
          }}
          exit={{
            opacity: 0,
            transition: { duration: backdropExit, ease: EASE_OUT_QUINT },
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 20000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'rgba(0, 0, 0, 0.15)',
          }}
          onClick={onClose}
        >
          {props.as === 'form' ? (
            <motion.form
              ref={cardRef as React.Ref<HTMLFormElement>}
              {...cardMotionProps}
              onSubmit={props.onSubmit}
            >
              {children}
            </motion.form>
          ) : (
            <motion.div ref={cardRef as React.Ref<HTMLDivElement>} {...cardMotionProps}>
              {children}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
