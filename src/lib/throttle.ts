// Minimal trailing+leading throttle, no dependency.
export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
): (...args: Args) => void {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Args | null = null

  return (...args: Args) => {
    const now = Date.now()
    const remaining = waitMs - (now - last)
    lastArgs = args
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      last = now
      fn(...args)
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now()
        timer = null
        if (lastArgs) fn(...lastArgs)
      }, remaining)
    }
  }
}
