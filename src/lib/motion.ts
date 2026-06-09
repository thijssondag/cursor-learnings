/** Shared motion tokens — impeccable 100/300/500 durations + ease-out curves */

export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const
export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const

export const DURATION_INSTANT = 0.1
export const DURATION_FAST = 0.2
export const DURATION_NORMAL = 0.3

export const MODAL_BACKDROP_ENTER = DURATION_FAST
export const MODAL_CARD_ENTER = 0.25
export const MODAL_BACKDROP_EXIT = MODAL_BACKDROP_ENTER * 0.75
export const MODAL_CARD_EXIT = MODAL_CARD_ENTER * 0.75

export const NOTE_ENTER_OWN = DURATION_NORMAL
export const NOTE_ENTER_REMOTE = DURATION_FAST

export function motionDuration(
  seconds: number,
  reduced: boolean | null,
): number {
  return reduced ? 0 : seconds
}
