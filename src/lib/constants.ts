export const APP_VERSION = '0.0.5'

export const NOTE_WIDTH = 220
export const NOTE_HEIGHT = 168

// Random gentle tilt (radians) for the sticky-note feel in the mockup.
export function randomTilt(): number {
  const degrees = (Math.random() * 6 - 3) // -3deg .. +3deg
  return (degrees * Math.PI) / 180
}
