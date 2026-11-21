import { useEffect, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { INSTAGRAM_FORMATS, FORMAT_GROUPS, type InstagramFormat } from '@shared/constants'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { projectActions } from '../../services/projectActions'
import { useT } from '@renderer/i18n'
import { FormatGlyph } from '../../components/FormatGlyph'
import { cn } from '../../lib/cn'

export function FormatDropdown(): JSX.Element | null {
  const format = useEditorStore((s) => s.project?.format)
  const [open, setOpen] = useState(false)
  const busy = useUiStore((s) => s.formatChanging)
  const t = useT()
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent): void => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  if (!format) return null

  const close = (): void => {
    setOpen(false)
  }

  const pick = (id: InstagramFormat): void => {
    close()
    if (id !== format) void projectActions.setFormat(id)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('topbar.formatTooltip')}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-2.5 py-1 text-left transition-colors disabled:opacity-50',
          open ? 'border-noir-border bg-noir-hover text-noir-text' : 'border-noir-border bg-noir-elevated text-noir-muted hover:text-noir-text'
        )}
        title={t('topbar.formatTooltip')}
      >
        <FormatGlyph format={format} size="sm" />
        <span>
          <span className="block text-[9px] uppercase tracking-wider text-noir-muted">{t('project.format')}</span>
          <span className="block text-xs font-medium text-noir-text">{INSTAGRAM_FORMATS[format].width} × {INSTAGRAM_FORMATS[format].height}</span>
        </span>
        <ChevronDown size={13} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} />
          <div role="menu" className="absolute left-0 top-full z-40 mt-1.5 max-h-[75vh] w-72 overflow-y-auto rounded-lg border border-noir-border bg-noir-elevated p-1.5 shadow-bubble">
            <div className="border-b border-noir-border px-2 pb-3 pt-1">
              <p className="text-xs font-medium">{t('topbar.formatTooltip')}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-noir-muted">{t('topbar.formatHint')}</p>
            </div>
            {FORMAT_GROUPS.map((group, index) => (
              <div key={group.label}>
                <div className="px-1.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-noir-disabled">
                  {t(index === 0 ? 'topbar.posts' : 'topbar.feedStories')}
                </div>
                {group.formats.map((id) => {
                  const spec = INSTAGRAM_FORMATS[id]
                  const active = format === spec.id
                  return (
                    <button
                      key={spec.id}
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => pick(spec.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors',
                        active ? 'bg-noir-selection' : 'hover:bg-noir-hover'
                      )}
                    >
                      <FormatGlyph format={spec.id} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-noir-text">
                          {t(`topbar.formatNames.${id}`)}
                          {active && <Check size={12} />}
                        </div>
                        <div className="truncate text-[10px] text-noir-muted">{spec.ratioLabel}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}

          </div>
        </>
      )}
    </div>
  )
}
