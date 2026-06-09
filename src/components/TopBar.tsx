import { usePresenceContext } from '../context/PresenceContext'
import { PageMenu } from './PageMenu'
import { ThemeToggle } from './ThemeToggle'
import { MotionButton } from './MotionButton'

export function TopBar({
  onAddNote,
  onClearDrawings,
  canAddNote,
  addNoteHint,
  addNoteTitle,
  onEditProfile,
}: {
  onAddNote: () => void
  onClearDrawings: () => void
  canAddNote: boolean
  addNoteHint: string
  addNoteTitle: string
  onEditProfile: () => void
}) {
  const { onlineCount } = usePresenceContext()

  return (
    <div className="top-bar">
      <div className="top-bar__inner">
        <div className="top-bar__brand">
          <PageMenu onEditProfile={onEditProfile} />
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
          <ThemeToggle />
          <MotionButton
            type="button"
            onClick={onClearDrawings}
            aria-label="Clear canvas"
            className="top-bar__btn top-bar__btn--secondary"
          >
            <span className="top-bar__btn-label top-bar__btn-label--long" aria-hidden>
              Clear canvas
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
            aria-label={
              canAddNote
                ? 'Add your tip — one per person'
                : addNoteHint
            }
            className="top-bar__btn top-bar__btn--primary"
          >
            <span className="top-bar__btn-icon" aria-hidden>
              +
            </span>
            <span className="top-bar__btn-label top-bar__btn-label--long" aria-hidden>
              Add your tip
              <span className="top-bar__btn-limit"> · 1 per person</span>
            </span>
            <span className="top-bar__btn-label top-bar__btn-label--short" aria-hidden>
              Your tip
            </span>
          </MotionButton>
        </div>
      </div>
    </div>
  )
}
