import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps): JSX.Element {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', className)}>
      {icon && <div className="mb-4 text-noir-disabled">{icon}</div>}
      <h3 className="text-sm font-medium text-noir-text">{title}</h3>
      {description && <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-noir-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
