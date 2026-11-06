import { useEffect, useRef, useState } from 'react'
import { Layers, Square, Check, FlipHorizontal, FlipVertical, Pipette, Trash2 } from 'lucide-react'
import type { ImageLayerData, Layer, OverlayLayerData } from '@shared/types'
import { useEditorStore, selectSelectedLayer, selectActiveDumpItem } from '../../stores/editorStore'
import { projectActions } from '../../services/projectActions'
import { OVERLAYS, SHADOWS, isShadow } from '../../lib/overlays'
import { slotRectToTransform } from '../canvas/layoutSlots'
import { Slider } from '../../components/ui/Slider'
import { CollapsibleGroup } from '../../components/ui/CollapsibleGroup'
import { cn } from '../../lib/cn'
import { useT } from '@renderer/i18n'

const OVERLAY_COLORS = ['#000000', '#FFFFFF', '#4a3b2e', '#2e3a4a', '#3a2e3f']

/** Aba FX: efeitos sobrepostos. Sessões: Overlays (degradês) e Shadows (sombras atrás de elementos). */
export function FxPanel(): JSX.Element {
  const t = useT()
  const selected = useEditorStore(selectSelectedLayer)
  const [openId, setOpenId] = useState<string | null>(null)
  const toggle = (id: string): void => setOpenId((prev) => (prev === id ? null : id))

  // O painel sempre começa com as sessões colapsadas. Só ao TROCAR a seleção para um
  // overlay/sombra (com o painel já aberto) abrimos a sessão da sua espécie para revelar
  // os controles — a primeira montagem é ignorada para não expandir nada de saída.
  const selKind =
    selected?.type === 'overlay' ? (isShadow((selected.data as OverlayLayerData).overlayId) ? 'shadows' : 'overlays') : null
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (selKind) setOpenId(selKind)
  }, [selected?.id, selKind])

  return (
    <div className="flex flex-col">
      <div className="border-b border-noir-border/60 px-4 pb-3 pt-4">
        <h3 className="text-xs font-medium text-noir-text">{t('inspector.fx')}</h3>
        <p className="mt-1 text-2xs text-noir-muted">{t('fxPanel.subtitle')}</p>
      </div>

      <CollapsibleGroup title={t('fxPanel.overlays')} icon={<Layers size={13} />} open={openId === 'overlays'} onToggle={() => toggle('overlays')}>
        <FxAssetSection kind="overlay" />
      </CollapsibleGroup>

      <CollapsibleGroup title={t('fxPanel.shadows')} icon={<Square size={13} />} open={openId === 'shadows'} onToggle={() => toggle('shadows')}>
        <FxAssetSection kind="shadow" />
      </CollapsibleGroup>
    </div>
  )
}

function FxAssetSection({ kind }: { kind: 'overlay' | 'shadow' }): JSX.Element {
  const t = useT()
  const selected = useEditorStore(selectSelectedLayer)
  const activeItem = useEditorStore(selectActiveDumpItem)
  const updateLayerData = useEditorStore((s) => s.updateLayerData)
  const reorderLayers = useEditorStore((s) => s.reorderLayers)
  const captureHistory = useEditorStore((s) => s.captureHistory)

  const assets = kind === 'shadow' ? SHADOWS : OVERLAYS
  const selOverlay = selected?.type === 'overlay' ? selected : null
  const selData = selOverlay ? (selOverlay.data as OverlayLayerData) : null
  // O overlay selecionado pertence a ESTA espécie (overlay vs sombra)?
  const selIsThisKind = !!selData && isShadow(selData.overlayId) === (kind === 'shadow')

  const pick = async (id: string): Promise<void> => {
    // Mesma espécie já selecionada → troca a arte (mantém posição/flip/cor/opacidade).
    if (selIsThisKind && selOverlay) {
      captureHistory()
      updateLayerData(selOverlay.id, { overlayId: id })
      return
    }
    if (!activeItem) return
    const canvas = activeItem.canvas

    if (kind === 'shadow') {
      const aspect = SHADOWS.find((s) => s.id === id)?.aspect ?? 1
      const w = Math.round(canvas.width * 0.6)
      const h = Math.round(w / aspect)
      // Se houver um elemento selecionado (texto/forma/imagem), a sombra entra ATRÁS dele.
      const targetId = selected && selected.type !== 'overlay' && selected.type !== 'background' ? selected.id : null
      const shadow = await projectActions.addLayer({
        dumpItemId: activeItem.id,
        type: 'overlay',
        data: { overlayId: id, flipX: false, flipY: false, color: '#000000' },
        transform: { x: Math.round((canvas.width - w) / 2), y: Math.round((canvas.height - h) / 2), width: w, height: h, rotation: 0 }
      })
      if (shadow && targetId) {
        const fresh = selectActiveDumpItem(useEditorStore.getState())
        if (fresh) {
          const ids = [...fresh.layers].sort((a, b) => a.orderIndex - b.orderIndex).map((l) => l.id)
          const without = ids.filter((lid) => lid !== shadow.id)
          const ti = without.indexOf(targetId)
          if (ti >= 0) reorderLayers(fresh.id, [...without.slice(0, ti), shadow.id, ...without.slice(ti)])
        }
      }
      return
    }

    // Overlays: em layout cobre o slot da foto; senão cobre o canvas inteiro.
    const slotIndex = selected?.type === 'image' && canvas.layout ? (selected.data as ImageLayerData).slotIndex : undefined
    if (slotIndex != null && canvas.layout) {
      const s = slotRectToTransform(canvas.layout.slots[slotIndex], canvas, canvas.layout.gutter)
      await projectActions.addLayer({
        dumpItemId: activeItem.id,
        type: 'overlay',
        data: { overlayId: id, flipX: false, flipY: false, color: '#000000', slotIndex },
        transform: { x: s.x, y: s.y, width: s.width, height: s.height, rotation: s.rotation }
      })
    } else {
      await projectActions.addLayer({
        dumpItemId: activeItem.id,
        type: 'overlay',
        data: { overlayId: id, flipX: false, flipY: false, color: '#000000' },
        transform: { x: 0, y: 0, width: canvas.width, height: canvas.height }
      })
    }
  }

  const hint = selIsThisKind ? t('fxPanel.swapHint') : kind === 'shadow' ? t('fxPanel.shadowsHint') : t('fxPanel.addHint')

  return (
    <div className="space-y-3">
      {/* Controles do item selecionado no TOPO (visíveis sem rolar a grade). */}
      {selIsThisKind && selOverlay && <OverlayControls layer={selOverlay} />}

      <p className="text-2xs text-noir-muted">{hint}</p>

      <div className="grid grid-cols-3 gap-2">
        {assets.map((o) => {
          const active = selIsThisKind && selData?.overlayId === o.id
          return (
            <button
              key={o.id}
              onClick={() => void pick(o.id)}
              title={o.label}
              className={cn(
                'relative overflow-hidden rounded-md border transition-colors',
                kind === 'shadow' ? 'aspect-square' : 'aspect-[9/16]',
                active ? 'border-noir-border-active' : 'border-noir-border hover:border-noir-muted/60'
              )}
              style={{ background: kind === 'shadow' ? '#c8c8c8' : '#8c8c8c' }}
            >
              <img
                src={o.url}
                alt={o.label}
                className={cn('h-full w-full', kind === 'shadow' ? 'object-contain p-1.5' : 'object-cover')}
                draggable={false}
              />
              {active && (
                <span className="absolute right-1 top-1 flex items-center justify-center rounded-full bg-noir-border-active p-0.5 text-noir-bg">
                  <Check size={10} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {!selIsThisKind && !activeItem && <p className="text-2xs text-noir-disabled">{t('fxPanel.noPage')}</p>}
    </div>
  )
}

/** Controles compartilhados de um overlay/sombra selecionado: flip, cor, opacidade, remover. */
function OverlayControls({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const data = layer.data as OverlayLayerData
  const updateLayerData = useEditorStore((s) => s.updateLayerData)
  const setLayerOpacity = useEditorStore((s) => s.setLayerOpacity)
  const captureHistory = useEditorStore((s) => s.captureHistory)

  return (
    <div className="space-y-3 border-b border-noir-border/50 pb-3">
      <div>
        <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{t('fxPanel.flip')}</span>
        <div className="mt-2 flex gap-1">
          <button
            onClick={() => {
              captureHistory()
              updateLayerData(layer.id, { flipX: !data.flipX })
            }}
            title={t('fxPanel.flipH')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
              data.flipX ? 'border-noir-border-active/40 bg-noir-selection text-noir-text' : 'border-noir-border text-noir-muted hover:bg-noir-hover'
            )}
          >
            <FlipHorizontal size={15} />
          </button>
          <button
            onClick={() => {
              captureHistory()
              updateLayerData(layer.id, { flipY: !data.flipY })
            }}
            title={t('fxPanel.flipV')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
              data.flipY ? 'border-noir-border-active/40 bg-noir-selection text-noir-text' : 'border-noir-border text-noir-muted hover:bg-noir-hover'
            )}
          >
            <FlipVertical size={15} />
          </button>
        </div>
      </div>

      <div>
        <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{t('fxPanel.color')}</span>
        <div className="mt-2 flex items-center gap-2">
          {OVERLAY_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                captureHistory()
                updateLayerData(layer.id, { color: c })
              }}
              aria-label={c}
              className={cn('h-7 w-7 rounded-full border-2', (data.color ?? '#000000') === c ? 'border-noir-border-active' : 'border-noir-border')}
              style={{ background: c }}
            />
          ))}
          <label
            title={t('fxPanel.customColor')}
            className={cn(
              'relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border-2',
              !OVERLAY_COLORS.includes(data.color ?? '#000000') ? 'border-noir-border-active' : 'border-noir-border'
            )}
            style={{ background: 'conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
          >
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white mix-blend-difference">
              <Pipette size={12} />
            </span>
            <input
              type="color"
              value={data.color ?? '#000000'}
              onChange={(e) => {
                captureHistory()
                updateLayerData(layer.id, { color: e.target.value })
              }}
              className="absolute -inset-2 h-[200%] w-[200%] cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>

      <Slider
        label={t('fxPanel.opacity')}
        value={Math.round((layer.opacity ?? 1) * 100)}
        min={0}
        max={100}
        defaultValue={100}
        onChangeStart={captureHistory}
        onChange={(v) => setLayerOpacity(layer.id, v / 100)}
      />

      <button
        onClick={() => void projectActions.deleteLayer(layer.id)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-noir-border py-2 text-2xs text-noir-muted transition-colors hover:bg-noir-hover hover:text-noir-text"
      >
        <Trash2 size={13} />
        {t('fxPanel.remove')}
      </button>
    </div>
  )
}
