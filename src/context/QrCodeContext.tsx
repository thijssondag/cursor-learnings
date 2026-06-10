/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'

interface QrCodeContextValue {
  isQrVisible: boolean
  toggleQr: () => void
  setQrVisible: (visible: boolean) => void
}

const QrCodeContext = createContext<QrCodeContextValue | null>(null)

export function QrCodeProvider({ children }: { children: React.ReactNode }) {
  const [isQrVisible, setIsQrVisible] = useState(false)

  const setQrVisible = useCallback((visible: boolean) => {
    setIsQrVisible(visible)
  }, [])

  const toggleQr = useCallback(() => {
    setIsQrVisible((prev) => !prev)
  }, [])

  return (
    <QrCodeContext.Provider value={{ isQrVisible, toggleQr, setQrVisible }}>
      {children}
    </QrCodeContext.Provider>
  )
}

export function useQrCode() {
  const ctx = useContext(QrCodeContext)
  if (!ctx) {
    throw new Error('useQrCode must be used within QrCodeProvider')
  }
  return ctx
}
