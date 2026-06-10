import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import { useOptionalPageContext } from '../context/PageContext'
import { useQrCode } from '../context/QrCodeContext'
import {
  buildParticipationUrl,
  formatParticipationDisplayUrl,
  getPageSlug,
} from '../lib/pageSlugs'
import {
  DURATION_FAST,
  DURATION_NORMAL,
  EASE_OUT_QUINT,
  motionDuration,
} from '../lib/motion'

const QR_SIZE = 240

export function ParticipationQrOverlay() {
  const { isQrVisible } = useQrCode()
  const pageContext = useOptionalPageContext()
  const reduceMotion = useReducedMotion()
  const enter = motionDuration(DURATION_NORMAL, reduceMotion)
  const exit = motionDuration(DURATION_FAST, reduceMotion)

  if (!pageContext) return null

  const { currentPage } = pageContext
  const slug = currentPage ? getPageSlug(currentPage) : null
  const participationUrl = buildParticipationUrl(slug)
  const displayUrl = formatParticipationDisplayUrl(slug)
  const title = currentPage ? `Join ${currentPage.name}` : 'Join the board'

  return createPortal(
    <AnimatePresence>
      {isQrVisible && (
        <motion.aside
          key="participation-qr"
          className="qr-overlay"
          role="complementary"
          aria-label="Participation QR code"
          aria-live="polite"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: enter, ease: EASE_OUT_QUINT },
          }}
          exit={{
            opacity: 0,
            scale: 0.96,
            y: 8,
            transition: { duration: exit, ease: EASE_OUT_QUINT },
          }}
        >
          <p className="qr-overlay__title">{title}</p>
          <div className="qr-overlay__code-panel">
            <QRCodeSVG
              value={participationUrl}
              size={QR_SIZE}
              level="Q"
              marginSize={2}
              bgColor="#ffffff"
              fgColor="#26251e"
              imageSettings={{
                src: '/favicon.svg',
                height: Math.round(QR_SIZE * 0.2),
                width: Math.round(QR_SIZE * 0.2),
                excavate: true,
              }}
            />
          </div>
          <p className="qr-overlay__url">{displayUrl}</p>
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body,
  )
}
