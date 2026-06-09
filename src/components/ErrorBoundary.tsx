import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-text)',
            background: 'var(--color-bg)',
          }}
        >
          <p style={{ maxWidth: 480, textAlign: 'center', lineHeight: 1.5 }}>
            Something went wrong: {this.state.error.message}
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
