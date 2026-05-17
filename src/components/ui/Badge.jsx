// Badge / Tag component
import { clsx } from 'clsx'

const colors = {
  purple: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  blue: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  red: 'bg-red-500/15 text-red-300 border-red-500/30',
  pink: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  white: 'bg-white/10 text-white/70 border-white/10',
}

export default function Badge({ children, color = 'purple', className = '', dot = false }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      colors[color],
      className
    )}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', {
          'bg-violet-400': color === 'purple',
          'bg-blue-400': color === 'blue',
          'bg-cyan-400': color === 'cyan',
          'bg-emerald-400': color === 'green',
          'bg-yellow-400': color === 'yellow',
          'bg-red-400': color === 'red',
          'bg-pink-400': color === 'pink',
          'bg-white/50': color === 'white',
        })} />
      )}
      {children}
    </span>
  )
}
