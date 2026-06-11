import { Fragment, type ReactNode } from 'react'

const URL_SPLIT_REGEX = /(https?:\/\/\S+)/g

function trimTrailingPunctuation(url: string): { href: string; trailing: string } {
  let href = url
  let trailing = ''
  while (/[.,;:!?)\]}'"]$/.test(href)) {
    const char = href.slice(-1)
    if (char === ')') {
      const openCount = (href.match(/\(/g) ?? []).length
      const closeCount = (href.match(/\)/g) ?? []).length
      if (closeCount <= openCount) break
    }
    trailing = char + trailing
    href = href.slice(0, -1)
  }
  return { href, trailing }
}

function stopPointer(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

function openLinkInNewTab(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.stopPropagation()
  if (e.detail > 1) return
  // tldraw intercepts default <a> navigation inside the canvas
  e.preventDefault()
  window.open(href, '_blank', 'noopener,noreferrer')
}

export function linkifyText(text: string): ReactNode {
  const segments = text.split(URL_SPLIT_REGEX)
  if (segments.length === 1) return text

  return segments.map((segment, index) => {
    if (index % 2 === 0) {
      return segment ? <Fragment key={index}>{segment}</Fragment> : null
    }

    const { href, trailing } = trimTrailingPunctuation(segment)
    return (
      <Fragment key={index}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="card-link"
          onPointerDown={stopPointer}
          onClick={(e) => openLinkInNewTab(e, href)}
        >
          {href}
        </a>
        {trailing}
      </Fragment>
    )
  })
}
