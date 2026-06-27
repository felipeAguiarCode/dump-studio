import { useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface TooltipProps {
  label: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactNode
}

/** Tooltip minimalista CSS (sem dependências). */
export function Tooltip({ label, side = 'bottom', children }: TooltipProps): JSX.Element {
  const [open, setOpen] = useState(false)

  const pos =
    side === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      : side === 'bottom'
        ? 'top-full left-1/2 -translate-x-1/2 mt-2'
        : side === 'left'
          ? 'right-full top-1/2 -translate-y-1/2 mr-2'
          : 'left-full top-1/2 -translate-y-1/2 ml-2'

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-noir-border bg-noir-elevated px-2 py-1 text-2xs font-medium text-noir-text shadow-bubble',
            pos
          )}
        >
          {label}
        </span>
      )}
    </span>
  )
}
