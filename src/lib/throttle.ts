// Minimal trailing+leading throttle, no dependency.
export type ThrottledFn<Args extends unknown[]> = ((...args: Args) => void) & {
  cancel: () => void
}

export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
): ThrottledFn<Args> {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Args | null = null

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    lastArgs = null
  }

  const throttled = ((...args: Args) => {
    const now = Date.now()
    const remaining = waitMs - (now - last)
    lastArgs = args
    if (remaining <= 0) {
      cancel()
      last = now
      fn(...args)
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now()
        timer = null
        if (lastArgs) fn(...lastArgs)
        lastArgs = null
      }, remaining)
    }
  }) as ThrottledFn<Args>

  throttled.cancel = cancel
  return throttled
}
