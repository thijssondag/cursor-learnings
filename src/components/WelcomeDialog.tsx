import { type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { IconHeart, IconNote, IconPointer } from '@tabler/icons-react'
import { motion, useReducedMotion } from 'motion/react'
import { displayTitleStyle, modalBackdropStyle, primaryBtnStyle } from '../lib/uiStyles'
import { iconProps } from '../lib/iconProps'
import { MotionButton } from './MotionButton'

type FeatureId = 'tip' | 'heart' | 'cursors'

const FEATURES: {
  id: FeatureId
  text: string
  Icon: typeof IconNote
}[] = [
  {
    id: 'tip',
    text: 'Share your best Cursor tips on the board. Everyone gets up to five sticky notes.',
    Icon: IconNote,
  },
  {
    id: 'heart',
    text: 'Heart the tips you love and see what others are learning.',
    Icon: IconHeart,
  },
  {
    id: 'cursors',
    text: 'Move around together. Live cursors show who is on the board.',
    Icon: IconPointer,
  },
]

const enterSpring = {
  type: 'spring' as const,
  bounce: 0.2,
  visualDuration: 0.45,
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: enterSpring,
  },
}

const dialogContent = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.1,
    },
  },
}

const featureList = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
}

export function WelcomeDialog({
  name,
  onContinue,
}: {
  name: string
  onContinue: () => void
}) {
  const firstName = name.trim().split(/\s+/)[0] || 'there'
  const reduceMotion = useReducedMotion()

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onContinue()
    }
  }

  const shellTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, bounce: 0.15, visualDuration: 0.35 }

  return createPortal(
    <motion.div
      className="welcome-dialog-backdrop"
      style={modalBackdropStyle}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={shellTransition}
    >
      <motion.div
        role="dialog"
        aria-labelledby="welcome-title"
        aria-modal="true"
        className="welcome-dialog"
        onKeyDown={handleKeyDown}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={shellTransition}
      >
        <motion.div
          className="welcome-dialog__content"
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
          variants={dialogContent}
        >
          <motion.h2
            id="welcome-title"
            variants={fadeUp}
            style={{
              ...displayTitleStyle,
              margin: 0,
              fontSize: 24,
              lineHeight: 1.2,
              textAlign: 'center',
              willChange: reduceMotion ? undefined : 'opacity, transform',
            }}
          >
            Hi {firstName}, welcome to the board 🎉
          </motion.h2>

          <motion.ul
            className="welcome-dialog__features"
            variants={featureList}
          >
            {FEATURES.map(({ id, text, Icon }) => (
              <motion.li
                key={id}
                className="welcome-dialog__feature"
                variants={fadeUp}
                style={{
                  willChange: reduceMotion ? undefined : 'opacity, transform',
                }}
              >
                <span className={`welcome-dialog__icon welcome-dialog__icon--${id}`}>
                  <Icon {...iconProps(16)} />
                </span>
                <p className="welcome-dialog__text">{text}</p>
              </motion.li>
            ))}
          </motion.ul>

          <MotionButton
            type="button"
            autoFocus
            onClick={onContinue}
            className="welcome-dialog__cta"
            variants={fadeUp}
            style={{
              ...primaryBtnStyle,
              width: '100%',
              cursor: 'pointer',
              willChange: reduceMotion ? undefined : 'opacity, transform',
            }}
          >
            Get started
          </MotionButton>
        </motion.div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
