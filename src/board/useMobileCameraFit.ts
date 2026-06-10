import { useEffect, useRef } from 'react'
import type { Editor } from 'tldraw'
import { MOBILE_MEDIA_QUERY } from '../lib/useMediaQuery'

const MOBILE_FIT_INSET = 96
const RESIZE_DEBOUNCE_MS = 200
const INITIAL_FIT_DELAY_MS = 350

function isMobileViewport(): boolean {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
}

function orientationKey(): string {
  return screen.orientation?.type ?? `${window.innerWidth}x${window.innerHeight}`
}

/** Fit all shapes on the current page into the viewport (mobile-oriented insets). */
export function fitPageToViewport(editor: Editor, animate = true) {
  const bounds = editor.getCurrentPageBounds()
  const animation = animate ? { duration: 200 } : { duration: 0 }

  if (bounds && bounds.width > 0 && bounds.height > 0) {
    editor.zoomToBounds(bounds, { inset: MOBILE_FIT_INSET, animation })
    return
  }

  editor.zoomToFit({ animation })
}

export function configureMobileEditor(editor: Editor) {
  if (!isMobileViewport()) return
  editor.setCurrentTool('hand')
}

/**
 * Auto-fits the camera on narrow screens after load, page change, and orientation change.
 */
export function useMobileCameraFit(
  editor: Editor | null,
  pageId: string | undefined,
  contentVersion: number,
) {
  const hasAutoFitRef = useRef(false)
  const wasMobileRef = useRef(isMobileViewport())
  const lastOrientationRef = useRef(orientationKey())

  useEffect(() => {
    if (!editor) return

    const runFit = (animate: boolean) => {
      if (!isMobileViewport()) return
      fitPageToViewport(editor, animate)
      hasAutoFitRef.current = true
      wasMobileRef.current = true
      lastOrientationRef.current = orientationKey()
    }

    const maybeFitFromResize = () => {
      const mobile = isMobileViewport()
      const orientation = orientationKey()
      const becameMobile = mobile && !wasMobileRef.current
      const orientationChanged = mobile && orientation !== lastOrientationRef.current

      if (!mobile) {
        wasMobileRef.current = false
        hasAutoFitRef.current = false
        return
      }

      if (becameMobile || orientationChanged) {
        runFit(true)
      }
    }

    let initialTimer: ReturnType<typeof setTimeout> | undefined
    if (isMobileViewport()) {
      initialTimer = window.setTimeout(() => runFit(false), INITIAL_FIT_DELAY_MS)
    }

    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(maybeFitFromResize, RESIZE_DEBOUNCE_MS)
    }

    const onOrientationChange = () => {
      window.setTimeout(() => {
        if (isMobileViewport()) runFit(true)
      }, RESIZE_DEBOUNCE_MS)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onOrientationChange)

    return () => {
      if (initialTimer !== undefined) window.clearTimeout(initialTimer)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onOrientationChange)
    }
  }, [editor, pageId, contentVersion])
}
