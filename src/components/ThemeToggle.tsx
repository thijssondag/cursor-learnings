import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'
import { useTheme, type ThemePreference } from '../context/ThemeContext'
import { iconProps } from '../lib/iconProps'
import { MotionButton } from './MotionButton'

const LABELS: Record<ThemePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

export function ThemeToggle() {
  const { preference, cyclePreference } = useTheme()

  return (
    <MotionButton
      type="button"
      onClick={cyclePreference}
      title={`Theme: ${LABELS[preference]}. Click to change.`}
      aria-label={`Theme: ${LABELS[preference]}. Click to change.`}
      className="top-bar__btn top-bar__btn--secondary theme-toggle"
    >
      <ThemeIcon preference={preference} />
      <span className="theme-toggle__label">{LABELS[preference]}</span>
    </MotionButton>
  )
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === 'light') return <IconSun {...iconProps(14)} />
  if (preference === 'dark') return <IconMoon {...iconProps(14)} />
  return <IconDeviceDesktop {...iconProps(14)} />
}
