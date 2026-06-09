import type { IconProps } from '@tabler/icons-react'

export const ICON_STROKE = 1.75

export function iconProps(size: number, overrides?: IconProps): IconProps {
  return {
    size,
    stroke: ICON_STROKE,
    'aria-hidden': true,
    ...overrides,
  }
}
