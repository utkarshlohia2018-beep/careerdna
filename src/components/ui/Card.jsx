// Reusable glass Card component
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  animate = false,
  onClick,
  delay = 0,
}) {
  const Component = animate ? motion.div : 'div'
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay },
      }
    : {}

  return (
    <Component
      {...animProps}
      onClick={onClick}
      className={clsx(
        'glass rounded-2xl p-6',
        hover && 'glass-hover cursor-pointer',
        glow && 'animate-pulse-glow',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </Component>
  )
}
