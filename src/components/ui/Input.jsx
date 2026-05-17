// Reusable Input component
import { clsx } from 'clsx'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  className = '',
  required = false,
  disabled = false,
  hint,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-white/70">
          {label}
          {required && <span className="text-violet-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          {...props}
          className={clsx(
            'w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-white/20 transition-all duration-200 outline-none focus:ring-2',
            icon && 'pl-10',
            isPassword && 'pr-10',
            error
              ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500'
              : 'border-white/10 focus:ring-violet-500/30 focus:border-violet-500/50',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {hint && !error && <p className="text-white/30 text-xs">{hint}</p>}
    </div>
  )
}
