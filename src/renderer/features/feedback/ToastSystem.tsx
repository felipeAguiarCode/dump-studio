import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'
import { useT } from '@renderer/i18n'
import { cn } from '../../lib/cn'

const ICONS = {
  success: CheckCircle2,
  info: Info,
  error: XCircle
}

export function ToastSystem(): JSX.Element {
  const t = useT()
  const toasts = useUiStore((s) => s.toasts)
  const dismiss = useUiStore((s) => s.dismissToast)

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.kind]
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center gap-2.5 rounded-lg border bg-noir-elevated px-3.5 py-2.5 text-sm shadow-bubble',
              toast.kind === 'error' ? 'border-red-500/40 text-red-200' : 'border-noir-border text-noir-text'
            )}
          >
            <Icon size={16} className={toast.kind === 'success' ? 'text-noir-text' : undefined} />
            <span>{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-1 text-noir-muted transition-colors hover:text-noir-text"
              aria-label={t('common.close')}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
