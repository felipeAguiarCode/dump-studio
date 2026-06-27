import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Tooltip } from './Tooltip'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md'
  children: ReactNode
}

export function IconButton({
  label,
  active = false,
  tooltipSide = 'bottom',
  size = 'md',
  className,
  children,
  ...props
}: IconButtonProps): JSX.Element {
  return (
    <Tooltip label={label} side={tooltipSide}>
      <button
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center rounded-md border transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-30',
          size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
          active
            ? 'border-noir-border-active/30 bg-noir-selection text-noir-text'
            : 'border-transparent text-noir-muted hover:bg-noir-hover hover:text-noir-text',
          className
        )}
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  )
}
