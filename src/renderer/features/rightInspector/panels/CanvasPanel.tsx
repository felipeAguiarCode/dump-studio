import { useState } from 'react'
import { Check, Pipette } from 'lucide-react'
import type { DumpItem } from '@shared/types'
import { useEditorStore } from '../../../stores/editorStore'
import { useUiStore } from '../../../stores/uiStore'
import { BACKGROUND_SWATCHES } from '../../canvas/background'
import { useT } from '@renderer/i18n'
import { cn } from '../../../lib/cn'

type BgId = 'black' | 'white' | 'light_gray' | 'medium_gray' | 'dark_gray' | 'transparent'

const NAMED_IDS = new Set<string>(BACKGROUND_SWATCHES.map((s) => s.id))

/** Normaliza '#rgb' / 'rrggbb' / '#RRGGBB' → '#rrggbb' (ou null se inválido). */
function normalizeHex(value: string): string | null {
  let s = value.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(s)) s = s.split('').map((c) => c + c).join('')
  if (/^[0-9a-fA-F]{6}$/.test(s)) return '#' + s.toLowerCase()
  return null
}

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> }

export function CanvasPanel({ item }: { item: DumpItem }): JSX.Element {
  const t = useT()
  const setBackground = useEditorStore((s) => s.setCanvasBackground)
  const pushToast = useUiStore((s) => s.pushToast)
  const current = String(item.canvas.backgroundColor)

  const isCustom = !NAMED_IDS.has(current)
  // Cor base do seletor: a própria cor (se hex) ou o css do swatch nomeado; fallback cinza.
  const swatchCss = BACKGROUND_SWATCHES.find((s) => s.id === current)?.css
  const baseHex = normalizeHex(current) ?? (swatchCss && swatchCss.startsWith('#') ? swatchCss : '#808080')

  const [hexText, setHexText] = useState(baseHex.slice(1))
  // Ressincroniza o campo quando a cor muda por fora (swatch, seletor, conta-gotas).
  const [lastCurrent, setLastCurrent] = useState(current)
  if (current !== lastCurrent) {
    setLastCurrent(current)
    setHexText(baseHex.slice(1))
  }

  const apply = (color: string): void => {
    const hx = normalizeHex(color)
    if (hx) setBackground(item.id, hx)
  }

  const commitHex = (): void => {
    const hx = normalizeHex(hexText)
    if (hx) setBackground(item.id, hx)
    else setHexText(baseHex.slice(1)) // reverte entrada inválida
  }

  const pickWithEyedropper = async (): Promise<void> => {
    const Ctor = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper
    if (!Ctor) {
      pushToast('error', t('canvasPanelUi.eyedropperUnavailable'))
      return
    }
    try {
      const { sRGBHex } = await new Ctor().open()
      apply(sRGBHex)
    } catch {
      /* usuário cancelou (Esc) */
    }
  }

  return (
    <div className="px-4 py-4">
      <p className="mb-3 text-xs leading-relaxed text-noir-muted">{t('canvasPanelUi.hint')}</p>
      <div className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{t('canvasPanelUi.background')}</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {BACKGROUND_SWATCHES.map((sw) => {
          const active = current === sw.id
          return (
            <button
              key={sw.id}
              onClick={() => setBackground(item.id, sw.id)}
              className={cn(
                'group relative flex h-14 flex-col items-center justify-center gap-1 rounded-lg border transition-colors',
                active ? 'border-noir-border-active/50' : 'border-noir-border hover:border-noir-muted/60'
              )}
            >
              <span
                className="h-6 w-6 rounded-full border border-noir-border"
                style={
                  sw.id === 'transparent'
                    ? { backgroundImage: 'linear-gradient(45deg,#333 25%,transparent 25%,transparent 75%,#333 75%),linear-gradient(45deg,#333 25%,#1a1a1a 25%,#1a1a1a 75%,#333 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0,4px 4px' }
                    : { background: sw.css }
                }
              />
              <span className="text-[9px] text-noir-muted">{t(`background.${sw.id as BgId}`)}</span>
              {active && <Check size={11} className="absolute right-1 top-1 text-noir-text" />}
            </button>
          )
        })}
      </div>

      {/* Cor personalizada: seletor RGB nativo + hexadecimal + conta-gotas */}
      <div className="mt-5 text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{t('canvasPanelUi.custom')}</div>
      <div className="mt-3 flex items-center gap-2">
        {/* Amostra clicável que abre o seletor de cor do sistema (RGB). */}
        <div
          className={cn(
            'relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border',
            isCustom ? 'border-noir-border-active/50' : 'border-noir-border'
          )}
          title={t('canvasPanelUi.custom')}
        >
          <span className="block h-full w-full" style={{ background: baseHex }} />
          <input
            type="color"
            value={baseHex}
            onChange={(e) => apply(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={t('canvasPanelUi.custom')}
          />
        </div>

        {/* Entrada hexadecimal manual. */}
        <div className="flex flex-1 items-center rounded-lg border border-noir-border bg-noir-bg px-2 focus-within:border-noir-muted/70">
          <span className="text-xs text-noir-muted">#</span>
          <input
            type="text"
            value={hexText}
            spellCheck={false}
            maxLength={6}
            placeholder="RRGGBB"
            onChange={(e) => setHexText(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
            onBlur={commitHex}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
            className="w-full bg-transparent py-1.5 pl-1 text-xs uppercase tracking-wide text-noir-text outline-none placeholder:text-noir-disabled"
          />
        </div>

        {/* Conta-gotas: escolhe qualquer cor da tela. */}
        <button
          onClick={() => void pickWithEyedropper()}
          title={t('canvasPanelUi.eyedropper')}
          aria-label={t('canvasPanelUi.eyedropper')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-noir-border text-noir-muted transition-colors hover:border-noir-muted/60 hover:text-noir-text"
        >
          <Pipette size={15} />
        </button>
      </div>
    </div>
  )
}
