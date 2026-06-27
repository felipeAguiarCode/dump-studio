import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { INSTAGRAM_FORMATS, FORMAT_GROUPS, type InstagramFormat } from '@shared/constants'
import { useEditorStore } from '../../stores/editorStore'
import { projectActions } from '../../services/projectActions'
import { useT } from '@renderer/i18n'
import { FormatGlyph } from '../../components/FormatGlyph'
import { cn } from '../../lib/cn'

export function FormatDropdown(): JSX.Element | null {
  const format = useEditorStore((s) => s.project?.format)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<InstagramFormat | null>(null)
  const t = useT()

  if (!format) return null

  const close = (): void => {
    setOpen(false)
    setPending(null)
  }

  const pick = (id: InstagramFormat): void => {
    if (id === format) return close()
    setPending(id)
  }

  const confirm = async (): Promise<void> => {
    if (!pending) return
    const fmt = pending
    close()
    await projectActions.setFormat(fmt)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 rounded-md border px-2 py-1 text-2xs transition-colors',
          open ? 'border-noir-border bg-noir-hover text-noir-text' : 'border-noir-border bg-noir-elevated text-noir-muted hover:text-noir-text'
        )}
        title={t('topbar.formatTooltip')}
      >
        <span className="font-medium">{INSTAGRAM_FORMATS[format].short}</span>
        <ChevronDown size={13} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} />
          <div className="absolute left-0 top-full z-40 mt-1.5 max-h-[70vh] w-60 overflow-y-auto rounded-lg border border-noir-border bg-noir-elevated p-1.5 shadow-bubble">
            {FORMAT_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="px-1.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-noir-disabled">
                  {group.label}
                </div>
                {group.formats.map((id) => {
                  const spec = INSTAGRAM_FORMATS[id]
                  const active = format === spec.id
                  return (
                    <button
                      key={spec.id}
                      onClick={() => pick(spec.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors',
                        active ? 'bg-noir-selection' : 'hover:bg-noir-hover'
                      )}
                    >
                      <FormatGlyph format={spec.id} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-noir-text">
                          {spec.label}
                          {active && <Check size={12} />}
                        </div>
                        <div className="truncate text-[10px] text-noir-muted">{spec.ratioLabel}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}

            {pending && (
              <div className="mt-1.5 rounded-md border border-noir-border bg-noir-panel p-2.5">
                <p className="text-[10px] leading-relaxed text-noir-muted">
                  {t('topbar.formatChangeWarning', { format: INSTAGRAM_FORMATS[pending].label })}
                </p>
                <div className="mt-2 flex gap-1.5">
                  <button onClick={() => setPending(null)} className="flex-1 rounded-md border border-noir-border py-1.5 text-[10px] hover:bg-noir-hover">
                    {t('common.cancel')}
                  </button>
                  <button onClick={() => void confirm()} className="flex-1 rounded-md bg-noir-text py-1.5 text-[10px] font-medium text-noir-bg hover:bg-white">
                    {t('topbar.switch')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
