import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check, Maximize2 } from 'lucide-react'
import { useEditorStore } from '../../stores/editorStore'
import { cn } from '../../lib/cn'

const PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]
const MIN = 0.1
const MAX = 8

export function ZoomControl(): JSX.Element {
  const zoom = useEditorStore((s) => s.ui?.canvasZoom ?? 1)
  const setZoom = useEditorStore((s) => s.setZoom)
  const resetView = useEditorStore((s) => s.resetView)
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('')

  useEffect(() => {
    if (open) setCustom(String(Math.round(zoom * 100)))
  }, [open, zoom])

  const apply = (z: number): void => {
    setZoom(Math.min(MAX, Math.max(MIN, z)))
    setOpen(false)
  }

  const applyCustom = (): void => {
    const v = parseFloat(custom.replace('%', ''))
    if (!Number.isNaN(v) && v > 0) apply(v / 100)
    else setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1 text-2xs tabular-nums transition-colors',
          open ? 'bg-noir-hover text-noir-text' : 'text-noir-muted hover:bg-noir-hover hover:text-noir-text'
        )}
        title="Nível de zoom"
      >
        {Math.round(zoom * 100)}%
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-1.5 w-44 rounded-lg border border-noir-border bg-noir-elevated p-1.5 shadow-bubble">
            <button
              onClick={() => {
                resetView()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-noir-text transition-colors hover:bg-noir-hover"
            >
              <Maximize2 size={13} /> Ajustar à tela
            </button>
            <div className="my-1 border-t border-noir-border/60" />
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => apply(p)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-noir-text transition-colors hover:bg-noir-hover"
              >
                {Math.round(p * 100)}%
                {Math.abs(zoom - p) < 0.001 && <Check size={13} />}
              </button>
            ))}
            <div className="my-1 border-t border-noir-border/60" />
            <div className="flex items-center gap-1 px-1 py-0.5">
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyCustom()
                  if (e.key === 'Escape') setOpen(false)
                }}
                className="w-full rounded border border-noir-border bg-noir-bg px-2 py-1 text-xs tabular-nums outline-none focus:border-noir-border-active/40"
                placeholder="Personalizado"
                inputMode="numeric"
              />
              <span className="text-2xs text-noir-muted">%</span>
              <button
                onClick={applyCustom}
                className="rounded border border-noir-border px-2 py-1 text-2xs hover:bg-noir-hover"
              >
                OK
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
