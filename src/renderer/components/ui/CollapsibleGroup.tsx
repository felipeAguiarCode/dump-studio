import { useState, type ReactNode } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { cn } from '../../lib/cn'

interface Props {
  title: string
  icon?: ReactNode
  defaultOpen?: boolean
  /** Modo controlado (acordeão). Se fornecido, ignora o estado interno. */
  open?: boolean
  onToggle?: () => void
  onReset?: () => void
  children: ReactNode
}

export function CollapsibleGroup({ title, icon, defaultOpen = false, open, onToggle, onReset, children }: Props): JSX.Element {
  const [localOpen, setLocalOpen] = useState(defaultOpen)
  const controlled = open !== undefined
  const isOpen = controlled ? open : localOpen

  const toggle = (): void => {
    if (controlled) onToggle?.()
    else setLocalOpen((o) => !o)
  }

  return (
    <div className="border-b border-noir-border/60">
      <div className="flex items-center justify-between px-4 py-2.5">
        <button onClick={toggle} className="flex flex-1 items-center gap-2 text-left">
          <ChevronDown
            size={13}
            className={cn('shrink-0 text-noir-disabled transition-transform', !isOpen && '-rotate-90')}
          />
          {icon && <span className="shrink-0 text-noir-muted">{icon}</span>}
          <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{title}</span>
        </button>
        {onReset && isOpen && (
          <button
            onClick={onReset}
            className="text-noir-disabled transition-colors hover:text-noir-text"
            title="Resetar grupo"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>
      {isOpen && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}
