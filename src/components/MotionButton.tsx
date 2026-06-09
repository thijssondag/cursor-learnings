import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'

const buttonSpring = {
  type: 'spring' as const,
  bounce: 0.12,
  visualDuration: 0.28,
}

const hoverByVariant = {
  default: { scale: 1.015, y: -1 },
  ghost: { scale: 1.06 },
} as const

const tapByVariant = {
  default: { scale: 0.985, y: 0 },
  ghost: { scale: 0.94 },
} as const

type MotionButtonProps = HTMLMotionProps<'button'> & {
  variant?: keyof typeof hoverByVariant
}

export function MotionButton({
  disabled,
  variant = 'default',
  whileHover: whileHoverProp,
  whileTap: whileTapProp,
  transition,
  ...props
}: MotionButtonProps) {
  const reduceMotion = useReducedMotion()
  const inactive = disabled || reduceMotion

  return (
    <motion.button
      {...props}
      disabled={disabled}
      whileHover={inactive ? undefined : (whileHoverProp ?? hoverByVariant[variant])}
      whileTap={inactive ? undefined : (whileTapProp ?? tapByVariant[variant])}
      transition={transition ?? buttonSpring}
    />
  )
}
