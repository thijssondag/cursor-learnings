import { IconBrandLinkedin, IconBrandX } from '@tabler/icons-react'
import { iconProps } from '../lib/iconProps'

function stop(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

const linkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  textDecoration: 'none',
  pointerEvents: 'auto',
  flexShrink: 0,
}

export function SocialIcons({
  name,
  xHandle,
  linkedInUrl,
}: {
  name: string
  xHandle?: string
  linkedInUrl?: string
}) {
  if (!xHandle && !linkedInUrl) return null

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 6 }}>
      {xHandle && (
        <a
          href={`https://x.com/${encodeURIComponent(xHandle)}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`${name} on X`}
          className="social-link"
          onPointerDown={stop}
          onClick={stop}
          style={linkStyle}
        >
          <IconBrandX {...iconProps(14)} />
        </a>
      )}
      {linkedInUrl && (
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`${name} on LinkedIn`}
          className="social-link"
          onPointerDown={stop}
          onClick={stop}
          style={linkStyle}
        >
          <IconBrandLinkedin {...iconProps(14)} />
        </a>
      )}
    </span>
  )
}
