import { IconCheck } from '@tabler/icons-react'
import { iconProps } from '../lib/iconProps'
import { Button } from './Button'

export function ButtonShowcase() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        background: 'var(--color-bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <p
          style={{
            margin: '0 0 16px',
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          Compare against{' '}
          <a
            href="https://www.untitledui.com/react/components/buttons"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-accent)' }}
          >
            Untitled UI buttons
          </a>{' '}
          in a second tab. Structure and shadows match; colors use project tokens.
        </p>
        <div
          style={{
            borderRadius: 20,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            padding: '128px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <Button color="primary-destructive" size="md">
              Delete project
            </Button>
            <Button color="secondary" size="md">
              Stage for publish
            </Button>
            <Button color="primary" size="md" iconLeading={<IconCheck {...iconProps(20)} />}>
              Publish now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
