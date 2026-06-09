import { usePresenceContext } from '../context/PresenceContext'
import { PageMenu } from './PageMenu'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './Button'

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
          <Button
            type="button"
            color="link-gray"
            size="xs"
            onClick={onEditProfile}
            className="top-bar__edit-profile"
          >
            Edit profile
          </Button>
        </div>

        <div className="top-bar__actions">
          <ThemeToggle />
          <Button
            type="button"
            color="secondary"
            size="sm"
            onClick={onClearDrawings}
            aria-label="Clear drawings"
            className="top-bar__action-btn"
          >
            <span className="top-bar__btn-label top-bar__btn-label--long" aria-hidden>
              Clear Drawings
            </span>
            <span className="top-bar__btn-label top-bar__btn-label--short" aria-hidden>
              Clear
            </span>
          </Button>
          <Button
            type="button"
            color="primary"
            size="sm"
            onClick={canAddNote ? onAddNote : undefined}
            isDisabled={!canAddNote}
            title={canAddNote ? addNoteTitle : addNoteHint}
            aria-label={canAddNote ? addNoteTitle : addNoteHint}
            className="top-bar__action-btn top-bar__action-btn--primary"
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
          </Button>
        </div>
      </div>
    </div>
  )
}
