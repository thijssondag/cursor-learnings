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
import { useToolbarAppearAnimation } from './useToolbarAppearAnimation'

export function BoardToolbar() {
  const { onAddNote, canAddNote } = useBoardActions()
  useToolbarAppearAnimation()

  return (
    <DefaultToolbar>
      <SelectToolbarItem />
      <HandToolbarItem />
      <DrawToolbarItem />
      <EraserToolbarItem />
      <TldrawUiMenuItem
        id="add-tip-note"
        label="Add your tip (1 per person)"
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
    </DefaultToolbar>
  )
}
