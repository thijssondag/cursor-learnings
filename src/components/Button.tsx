import { cloneElement, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react'
import { MotionButton } from './MotionButton'

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'primary-destructive'
  | 'secondary-destructive'
  | 'tertiary-destructive'
  | 'link-color'
  | 'link-gray'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type ButtonProps = Omit<ComponentProps<typeof MotionButton>, 'color'> & {
  color?: ButtonColor
  size?: ButtonSize
  iconLeading?: ReactNode
  iconTrailing?: ReactNode
  isDisabled?: boolean
  isLoading?: boolean
  showTextWhileLoading?: boolean
  fullWidth?: boolean
}

const linkColors: ButtonColor[] = ['link-color', 'link-gray']

function withDataIcon(node: ReactNode): ReactNode {
  if (!isValidElement(node)) return node
  return cloneElement(node as ReactElement<{ 'data-icon'?: true }>, { 'data-icon': true })
}

function wrapText(children: ReactNode): ReactNode {
  if (typeof children === 'string' || typeof children === 'number') {
    return <span data-text>{children}</span>
  }
  return children
}

export function Button({
  color = 'primary',
  size = 'md',
  iconLeading,
  iconTrailing,
  isDisabled,
  isLoading,
  showTextWhileLoading,
  fullWidth,
  className,
  children,
  disabled,
  variant,
  whileHover,
  whileTap,
  ...props
}: ButtonProps) {
  const inactive = Boolean(disabled || isDisabled || isLoading)
  const isLink = linkColors.includes(color)
  const isIconOnly = Boolean((iconLeading || iconTrailing) && !children)
  const motionVariant = variant ?? (color === 'tertiary' || color === 'tertiary-destructive' ? 'ghost' : 'default')
  const suppressMotion = !isLink && color !== 'tertiary' && color !== 'tertiary-destructive'

  const classes = [
    'btn',
    `btn--${color}`,
    `btn--${size}`,
    isLoading && 'btn--loading',
    showTextWhileLoading && 'btn--loading-with-text',
    fullWidth && 'btn--full',
    isIconOnly && 'btn--icon-only',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <MotionButton
      {...props}
      disabled={inactive}
      variant={motionVariant}
      whileHover={suppressMotion ? {} : whileHover}
      whileTap={suppressMotion ? {} : whileTap}
      className={classes}
      data-loading={isLoading ? '' : undefined}
    >
      {isLoading ? <span className="btn__spinner" aria-hidden data-icon="loading" /> : null}
      {iconLeading ? withDataIcon(iconLeading) : null}
      {children != null && children !== false ? wrapText(children as ReactNode) : null}
      {iconTrailing ? withDataIcon(iconTrailing) : null}
    </MotionButton>
  )
}
