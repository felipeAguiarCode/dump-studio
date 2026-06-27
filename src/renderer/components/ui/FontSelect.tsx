import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { FONTS, FONT_CATEGORY_ORDER, FONT_CATEGORY_LABELS, quoteFamily, type FontCategory } from '../../styles/fonts'
import { cn } from '../../lib/cn'

/** Dropdown de fontes estilo Canva: cada nome é exibido na própria tipografia. */
export function FontSelect({ value, onChange }: { value: string; onChange: (family: string) => void }): JSX.Element {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = FONTS.find((f) => f.family === value) ?? FONTS[0]

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const groups = FONT_CATEGORY_ORDER.map((cat: FontCategory) => ({
    cat,
    fonts: FONTS.filter((f) => f.category === cat)
  })).filter((g) => g.fonts.length > 0)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-noir-border bg-noir-bg px-3 py-2 text-left text-sm text-noir-text outline-none transition-colors hover:border-noir-border-active/40"
      >
        <span className="truncate" style={{ fontFamily: quoteFamily(current.family) }}>
          {current.label}
        </span>
        <ChevronDown size={14} className={cn('shrink-0 text-noir-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-[340px] w-full overflow-y-auto rounded-lg border border-noir-border bg-noir-elevated p-1 shadow-bubble">
          {groups.map((g) => (
            <div key={g.cat}>
              <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-noir-disabled">
                {FONT_CATEGORY_LABELS[g.cat]}
              </div>
              {g.fonts.map((f) => (
                <button
                  key={f.family}
                  onClick={() => {
                    onChange(f.family)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[15px] leading-none transition-colors hover:bg-noir-hover',
                    f.family === value ? 'bg-noir-selection text-noir-text' : 'text-noir-text'
                  )}
                >
                  <span className="truncate" style={{ fontFamily: quoteFamily(f.family) }}>
                    {f.label}
                  </span>
                  {f.family === value && <Check size={14} className="shrink-0 text-noir-muted" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
