import { IconQrcode } from '@tabler/icons-react'
import { useQrCode } from '../context/QrCodeContext'
import { iconProps } from '../lib/iconProps'
import { MotionButton } from './MotionButton'

export function QrCodeToggle() {
  const { isQrVisible, toggleQr } = useQrCode()

  return (
    <MotionButton
      type="button"
      onClick={toggleQr}
      aria-pressed={isQrVisible}
      aria-label={
        isQrVisible ? 'Hide participation QR code' : 'Show participation QR code'
      }
      title={isQrVisible ? 'Hide QR code' : 'Show QR code'}
      className={`top-bar__btn top-bar__btn--secondary qr-toggle${isQrVisible ? ' qr-toggle--active' : ''}`}
    >
      <IconQrcode {...iconProps(14)} aria-hidden />
      <span className="qr-toggle__label">QR</span>
    </MotionButton>
  )
}
