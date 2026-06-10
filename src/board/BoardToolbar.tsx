import {
  ArrowDownToolbarItem,
  ArrowLeftToolbarItem,
  ArrowRightToolbarItem,
  ArrowToolbarItem,
  ArrowUpToolbarItem,
  CheckBoxToolbarItem,
  CloudToolbarItem,
  DefaultToolbar,
  DiamondToolbarItem,
  DrawToolbarItem,
  EllipseToolbarItem,
  EraserToolbarItem,
  FrameToolbarItem,
  HandToolbarItem,
  HeartToolbarItem,
  HexagonToolbarItem,
  HighlightToolbarItem,
  LaserToolbarItem,
  LineToolbarItem,
  OvalToolbarItem,
  RectangleToolbarItem,
  RhombusToolbarItem,
  SelectToolbarItem,
  StarToolbarItem,
  TextToolbarItem,
  TldrawUiMenuItem,
  TriangleToolbarItem,
  XBoxToolbarItem,
} from 'tldraw'
import { useBoardActions } from '../context/BoardActionsContext'
import { useIsMobile } from '../lib/useMediaQuery'
import { useToolbarAppearAnimation } from './useToolbarAppearAnimation'

function MobileEssentialTools() {
  const { onAddNote, canAddNote, addNoteLabel, addNoteLimit } = useBoardActions()

  return (
    <>
      <SelectToolbarItem />
      <HandToolbarItem />
      <DrawToolbarItem />
      <EraserToolbarItem />
      <TldrawUiMenuItem
        id="add-tip-note"
        label={`${addNoteLabel}${addNoteLimit}`}
        icon="tool-note"
        kbd="n"
        onSelect={() => {
          if (canAddNote) onAddNote()
        }}
        disabled={!canAddNote}
      />
    </>
  )
}

function DesktopFullTools() {
  const { onAddNote, canAddNote, addNoteLabel, addNoteLimit } = useBoardActions()

  return (
    <>
      <SelectToolbarItem />
      <HandToolbarItem />
      <DrawToolbarItem />
      <EraserToolbarItem />
      <TldrawUiMenuItem
        id="add-tip-note"
        label={`${addNoteLabel}${addNoteLimit}`}
        icon="tool-note"
        kbd="n"
        onSelect={() => {
          if (canAddNote) onAddNote()
        }}
        disabled={!canAddNote}
      />
      <ArrowToolbarItem />
      <TextToolbarItem />
      <RectangleToolbarItem />
      <EllipseToolbarItem />
      <TriangleToolbarItem />
      <DiamondToolbarItem />
      <HexagonToolbarItem />
      <OvalToolbarItem />
      <RhombusToolbarItem />
      <StarToolbarItem />
      <CloudToolbarItem />
      <HeartToolbarItem />
      <XBoxToolbarItem />
      <CheckBoxToolbarItem />
      <ArrowLeftToolbarItem />
      <ArrowUpToolbarItem />
      <ArrowDownToolbarItem />
      <ArrowRightToolbarItem />
      <LineToolbarItem />
      <HighlightToolbarItem />
      <LaserToolbarItem />
      <FrameToolbarItem />
    </>
  )
}

export function BoardToolbar() {
  const isMobile = useIsMobile()
  useToolbarAppearAnimation()

  return (
    <DefaultToolbar>
      {isMobile ? <MobileEssentialTools /> : <DesktopFullTools />}
    </DefaultToolbar>
  )
}
