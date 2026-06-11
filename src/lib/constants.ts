export const APP_VERSION = '0.0.11'

export const MAX_TIPS_PER_PERSON = 5
export const MAX_BUILD_PLANS_PER_PERSON = 1

export const PARTICIPATION_BASE_URL = 'https://cursor-learnings-beta.vercel.app'

export const NOTE_WIDTH = 260
export const NOTE_HEIGHT = 200
export const BUILD_PLAN_NOTE_WIDTH = 280
export const BUILD_PLAN_NOTE_HEIGHT = 300

// Random gentle tilt (radians) for the sticky-note feel in the mockup.
export function randomTilt(): number {
  const degrees = (Math.random() * 6 - 3) // -3deg .. +3deg
  return (degrees * Math.PI) / 180
}
