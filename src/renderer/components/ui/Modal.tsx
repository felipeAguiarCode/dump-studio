import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  width?: number
}

export function Modal({ title, onClose, children, width = 460 }: ModalProps): JSX.Element {
  return (
    <div
      className="ui-modal-backdrop fixed inset-0 z-[80] flex items-center justify-center p-6"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[85vh] overflow-y-auto rounded-2xl border border-noir-border bg-noir-elevated shadow-bubble"
        style={{ width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-noir-border px-5 py-3.5">
          <h2 className="text-sm font-medium">{title}</h2>
          <button onClick={onClose} className="text-noir-muted transition-colors hover:text-noir-text" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
