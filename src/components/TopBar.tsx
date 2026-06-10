import { IconArrowsMaximize } from '@tabler/icons-react'
import { useBoardActions } from '../context/BoardActionsContext'
import { usePresenceContext } from '../context/PresenceContext'
import { iconProps } from '../lib/iconProps'
import { PageMenu } from './PageMenu'
import { ThemeToggle } from './ThemeToggle'
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
  const { onFitAll } = useBoardActions()

  return (
    <div className="top-bar">
      <div className="top-bar__inner">
        <div className="top-bar__brand">
          <PageMenu />
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
          <Button
            type="button"
            color="secondary"
            size="sm"
            onClick={onFitAll}
            aria-label="Fit all notes in view"
            className="top-bar__action-btn top-bar__fit-btn"
          >
            <IconArrowsMaximize {...iconProps(16)} aria-hidden />
            <span className="top-bar__btn-label top-bar__btn-label--short" aria-hidden>
              Fit
            </span>
          </Button>
          <ThemeToggle />
          <MotionButton
            type="button"
            onClick={onClearDrawings}
            aria-label="Clear drawings"
            className="top-bar__btn top-bar__btn--secondary"
          >
            <span className="top-bar__btn-label top-bar__btn-label--long" aria-hidden>
              Clear Drawings
            </span>
            <span className="top-bar__btn-label top-bar__btn-label--short" aria-hidden>
              Clear
            </span>
          </MotionButton>
          <MotionButton
            type="button"
            onClick={canAddNote ? onAddNote : undefined}
            disabled={!canAddNote}
            title={canAddNote ? addNoteTitle : addNoteHint}
            aria-label={canAddNote ? addNoteTitle : addNoteHint}
            className="top-bar__btn top-bar__btn--primary"
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
    </div>
  )
}
