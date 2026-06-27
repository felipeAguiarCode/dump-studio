import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'ghost' | 'subtle' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-noir-text text-noir-bg hover:bg-white border border-transparent font-medium',
  ghost:
    'bg-transparent text-noir-text hover:bg-noir-hover border border-noir-border',
  subtle: 'bg-noir-elevated text-noir-text hover:bg-noir-hover border border-transparent',
  danger: 'bg-transparent text-red-300 hover:bg-red-500/10 border border-red-500/30'
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg'
}

export function Button({
  variant = 'ghost',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
