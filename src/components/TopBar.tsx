import { IconArrowsMaximize, IconEraser } from '@tabler/icons-react'
import { useBoardActions } from '../context/BoardActionsContext'
import { usePresenceContext } from '../context/PresenceContext'
import { iconProps } from '../lib/iconProps'
import { PageMenu } from './PageMenu'
import { ThemeToggle } from './ThemeToggle'
import { QrCodeToggle } from './QrCodeToggle'
import { MotionButton } from './MotionButton'

export function TopBar({
  onAddNote,
  onClearDrawings,
  canAddNote,
  addNoteHint,
  addNoteTitle,
  addNoteLabel,
  addNoteLimit,
  addNoteShortLabel,
  onEditProfile,
}: {
  onAddNote: () => void
  onClearDrawings: () => void
  canAddNote: boolean
  addNoteHint: string
  addNoteTitle: string
  addNoteLabel: string
  addNoteLimit: string
  addNoteShortLabel: string
  onEditProfile: () => void
}) {
  const { onlineCount } = usePresenceContext()
  const { isAutoFitEnabled, onToggleAutoFit } = useBoardActions()

  return (
    <div className="top-bar">
      <div className="top-bar__inner">
        <div className="top-bar__row top-bar__row--main">
          <div className="top-bar__brand">
            <PageMenu
              onEditProfile={onEditProfile}
              onClearDrawings={onClearDrawings}
            />
          </div>

          <div className="top-bar__meta">
            <span className="top-bar__online">
              <span className="top-bar__online-dot" aria-hidden />
              {onlineCount}
              <span className="top-bar__online-suffix"> online</span>
            </span>
            <MotionButton
              type="button"
              variant="ghost"
              onClick={onEditProfile}
              className="top-bar__edit-profile"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Edit profile
            </MotionButton>
          </div>

          <div className="top-bar__actions">
            <MotionButton
              type="button"
              onClick={onToggleAutoFit}
              aria-pressed={isAutoFitEnabled}
              aria-label={
                isAutoFitEnabled
                  ? 'Turn off auto-fit for new notes'
                  : 'Turn on auto-fit for new notes'
              }
              title={
                isAutoFitEnabled
                  ? 'Auto-fit on — new notes stay in view'
                  : 'Auto-fit off — fit notes when new ones appear'
              }
              className={`top-bar__btn top-bar__btn--secondary top-bar__fit-btn fit-toggle${isAutoFitEnabled ? ' fit-toggle--active' : ''}`}
            >
              <IconArrowsMaximize {...iconProps(16)} aria-hidden />
              <span className="top-bar__btn-label top-bar__btn-label--short" aria-hidden>
                Fit
              </span>
            </MotionButton>
            <MotionButton
              type="button"
              onClick={canAddNote ? onAddNote : undefined}
              disabled={!canAddNote}
              title={canAddNote ? addNoteTitle : addNoteHint}
              aria-label={canAddNote ? addNoteTitle : addNoteHint}
              className="top-bar__btn top-bar__btn--primary top-bar__add-btn"
            >
              <span className="top-bar__btn-icon" aria-hidden>
                +
              </span>
              <span className="top-bar__btn-label top-bar__btn-label--long" aria-hidden>
                {addNoteLabel}
                {addNoteLimit ? (
                  <span className="top-bar__btn-limit">{addNoteLimit}</span>
                ) : null}
              </span>
              <span className="top-bar__btn-label top-bar__btn-label--short" aria-hidden>
                {addNoteShortLabel}
              </span>
            </MotionButton>
          </div>
        </div>

        <div className="top-bar__row top-bar__row--tools">
          <ThemeToggle />
          <QrCodeToggle />
          <MotionButton
            type="button"
            onClick={onClearDrawings}
            aria-label="Clear drawings"
            className="top-bar__btn top-bar__btn--secondary"
          >
            <IconEraser {...iconProps(16)} className="top-bar__btn-icon-only" aria-hidden />
            <span className="top-bar__btn-label top-bar__btn-label--long" aria-hidden>
              Clear Drawings
            </span>
            <span className="top-bar__btn-label top-bar__btn-label--short" aria-hidden>
              Clear
            </span>
          </MotionButton>
        </div>
      </div>
    </div>
  )
}
