import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined
const root = document.getElementById('root')!

if (!convexUrl) {
  console.error(
    'Missing VITE_CONVEX_URL. Run `npx convex dev` locally, or set CONVEX_DEPLOY_KEY and use `npx convex deploy --cmd npm run build` on Vercel.',
  )
  createRoot(root).render(
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        color: '#000',
        background: '#fdfcfc',
      }}
    >
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
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </StrictMode>,
  )
}
