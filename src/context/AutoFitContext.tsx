/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'

interface AutoFitContextValue {
  isAutoFitEnabled: boolean
  toggleAutoFit: () => void
  setAutoFitEnabled: (enabled: boolean) => void
}

const AutoFitContext = createContext<AutoFitContextValue | null>(null)

export function AutoFitProvider({ children }: { children: React.ReactNode }) {
  const [isAutoFitEnabled, setIsAutoFitEnabled] = useState(false)

  const setAutoFitEnabled = useCallback((enabled: boolean) => {
    setIsAutoFitEnabled(enabled)
  }, [])

  const toggleAutoFit = useCallback(() => {
    setIsAutoFitEnabled((prev) => !prev)
  }, [])

  return (
    <AutoFitContext.Provider
      value={{ isAutoFitEnabled, toggleAutoFit, setAutoFitEnabled }}
    >
      {children}
    </AutoFitContext.Provider>
  )
}

export function useAutoFitContext(): AutoFitContextValue {
  const ctx = useContext(AutoFitContext)
  if (!ctx) {
    throw new Error('useAutoFitContext must be used within AutoFitProvider')
  }
  return ctx
}
