import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'theme-preference'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return getSystemTheme()
  return preference
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.dataset.theme = resolved
}

if (typeof document !== 'undefined') {
  applyTheme(resolveTheme(getStoredPreference()))
}

interface ThemeContextValue {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
  cyclePreference: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const CYCLE_ORDER: ThemePreference[] = ['light', 'dark', 'system']

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => getStoredPreference())
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(preference))

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    localStorage.setItem(STORAGE_KEY, next)
    const resolved = resolveTheme(next)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [])

  const cyclePreference = useCallback(() => {
    const idx = CYCLE_ORDER.indexOf(preference)
    const next = CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length]
    setPreference(next)
  }, [preference, setPreference])

  useEffect(() => {
    const resolved = resolveTheme(preference)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [preference])

  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const resolved = getSystemTheme()
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference, cyclePreference }),
    [preference, resolvedTheme, setPreference, cyclePreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
