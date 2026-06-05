import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined

if (!convexUrl) {
  // Helpful message during local setup before `npx convex dev` has run.
  console.error(
    'Missing VITE_CONVEX_URL. Run `npx convex dev` to create a deployment and .env.local.',
  )
}

const convex = new ConvexReactClient(convexUrl ?? '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>,
)
