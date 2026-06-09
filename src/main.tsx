import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './context/ThemeContext'

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined
const root = document.getElementById('root')!

const fallbackStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  padding: 24,
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-text)',
  background: 'var(--color-bg)',
}

if (!convexUrl) {
  console.error(
    'Missing VITE_CONVEX_URL. Run `npx convex dev` locally, or set CONVEX_DEPLOY_KEY and use `npx convex deploy --cmd npm run build` on Vercel.',
  )
  createRoot(root).render(
    <div style={fallbackStyle}>
      <p style={{ maxWidth: 420, textAlign: 'center', lineHeight: 1.5 }}>
        Backend not configured: missing <code>VITE_CONVEX_URL</code>. Add{' '}
        <code>CONVEX_DEPLOY_KEY</code> in Vercel and set the build command to{' '}
        <code>npx convex deploy --cmd 'npm run build'</code>.
      </p>
    </div>,
  )
} else {
  const convex = new ConvexReactClient(convexUrl)
  createRoot(root).render(
    <StrictMode>
      <ThemeProvider>
        <ErrorBoundary>
          <ConvexProvider client={convex}>
            <App />
          </ConvexProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </StrictMode>,
  )
}
