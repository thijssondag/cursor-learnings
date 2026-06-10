export const APP_VERSION = '0.0.8'

export const PARTICIPATION_BASE_URL = 'https://cursor-learnings-beta.vercel.app'

export const NOTE_WIDTH = 220
export const NOTE_HEIGHT = 168
export const BUILD_PLAN_NOTE_WIDTH = 280
export const BUILD_PLAN_NOTE_HEIGHT = 300

// Random gentle tilt (radians) for the sticky-note feel in the mockup.
export function randomTilt(): number {
  const degrees = (Math.random() * 6 - 3) // -3deg .. +3deg
  return (degrees * Math.PI) / 180
}
