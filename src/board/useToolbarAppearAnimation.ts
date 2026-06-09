import { useEditor } from 'tldraw'
import { useEffect } from 'react'

const ANIMATION_MS = 800
const STAGGER_MS = 40

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function animateElement(element: HTMLElement, delay = 0) {
  element.classList.remove('board-toolbar-item-appear')
  void element.offsetHeight
  element.style.setProperty('--board-toolbar-appear-delay', `${delay}ms`)
  element.classList.add('board-toolbar-item-appear')

  window.setTimeout(() => {
    element.classList.remove('board-toolbar-item-appear')
    element.style.removeProperty('--board-toolbar-appear-delay')
  }, ANIMATION_MS + delay)
}

function animateToolbarInner(toolbar: ParentNode) {
  const inner = toolbar.querySelector<HTMLElement>('.tlui-main-toolbar__inner')
  if (!inner) return

  inner.classList.remove('board-toolbar-magical-appear')
  void inner.offsetHeight
  inner.classList.add('board-toolbar-magical-appear')

  window.setTimeout(() => {
    inner.classList.remove('board-toolbar-magical-appear')
  }, ANIMATION_MS)
}

function getVisibleToolItems(container: ParentNode) {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-toolbar-visible="true"]')
  ).filter((el) => el.closest('.tlui-main-toolbar__tools, .tlui-main-toolbar__overflow-content'))
}

function staggerAnimateItems(items: HTMLElement[]) {
  items.forEach((item, index) => {
    animateElement(item, index * STAGGER_MS)
  })
}

export function useToolbarAppearAnimation() {
  const editor = useEditor()

  useEffect(() => {
    if (prefersReducedMotion()) return

    const container = editor.getContainer()
    const toolbar = container.querySelector('.tlui-main-toolbar')
    if (!toolbar) return

    let hasPlayedInitialAnimation = false
    const animatedItems = new WeakSet<HTMLElement>()

    const runInitialAnimation = () => {
      if (hasPlayedInitialAnimation) return
      hasPlayedInitialAnimation = true
      animateToolbarInner(toolbar)
    }

    const toolsContainer = toolbar.querySelector('.tlui-main-toolbar__tools')
    if (!toolsContainer) return

    requestAnimationFrame(() => {
      requestAnimationFrame(runInitialAnimation)
    })

    const visibilityObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type !== 'attributes' ||
          mutation.attributeName !== 'data-toolbar-visible'
        ) {
          continue
        }

        const element = mutation.target as HTMLElement
        if (element.getAttribute('data-toolbar-visible') !== 'true') continue
        if (mutation.oldValue !== 'false') continue
        if (animatedItems.has(element)) continue

        animatedItems.add(element)
        animateElement(element)
      }
    })

    visibilityObserver.observe(toolsContainer, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-toolbar-visible'],
      attributeOldValue: true,
    })

    const animateOverflowItems = () => {
      const overflowContent = toolbar.querySelector('.tlui-main-toolbar__overflow-content')
      if (!overflowContent) return

      const items = getVisibleToolItems(overflowContent).filter((item) => !animatedItems.has(item))
      items.forEach((item) => animatedItems.add(item))
      staggerAnimateItems(items)
    }

    const overflowObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'attributes' || mutation.attributeName !== 'data-state') continue

        const element = mutation.target as HTMLElement
        if (!element.classList.contains('tlui-main-toolbar__overflow')) continue
        if (element.getAttribute('data-state') !== 'open') continue

        animateOverflowItems()
      }
    })

    overflowObserver.observe(toolbar, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state'],
    })

    return () => {
      visibilityObserver.disconnect()
      overflowObserver.disconnect()
    }
  }, [editor])
}
