function stop(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4l16 16M20 4L4 20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 11v5M8 8v.01M12 16v-3c0-1.1.9-2 2-2s2 .9 2 2v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const linkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  color: '#a59f97',
  opacity: 0.85,
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
          onPointerDown={stop}
          onClick={stop}
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#777169'
            e.currentTarget.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a59f97'
            e.currentTarget.style.opacity = '0.85'
          }}
        >
          <XIcon />
        </a>
      )}
      {linkedInUrl && (
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`${name} on LinkedIn`}
          onPointerDown={stop}
          onClick={stop}
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#777169'
            e.currentTarget.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a59f97'
            e.currentTarget.style.opacity = '0.85'
          }}
        >
          <LinkedInIcon />
        </a>
      )}
    </span>
  )
}
