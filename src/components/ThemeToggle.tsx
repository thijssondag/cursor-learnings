import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'
import { useTheme, type ThemePreference } from '../context/ThemeContext'
import { iconProps } from '../lib/iconProps'
import { Button } from './Button'

const LABELS: Record<ThemePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

export function ThemeToggle() {
  const { preference, cyclePreference } = useTheme()

  return (
    <Button
      type="button"
      color="secondary"
      size="sm"
      onClick={cyclePreference}
      title={`Theme: ${LABELS[preference]}. Click to change.`}
      aria-label={`Theme: ${LABELS[preference]}. Click to change.`}
      iconLeading={<ThemeIcon preference={preference} />}
      className="theme-toggle top-bar__action-btn"
    >
      <span className="theme-toggle__label">{LABELS[preference]}</span>
    </Button>
  )
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === 'light') return <IconSun {...iconProps(14)} />
  if (preference === 'dark') return <IconMoon {...iconProps(14)} />
  return <IconDeviceDesktop {...iconProps(14)} />
}
