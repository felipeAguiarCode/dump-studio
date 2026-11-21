import { useRef } from 'react'
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Check, X } from 'lucide-react'
import type { CropAspectRatio, CropSettings, ImageLayerData, Layer } from '@shared/types'
import { DEFAULT_CROP } from '@shared/defaults'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { Slider } from '../../components/ui/Slider'
import { useT } from '@renderer/i18n'
import { cn } from '../../lib/cn'

const RATIOS: { id: CropAspectRatio; label: string; value: number | null }[] = [
  { id: 'free', label: 'Livre', value: null },
  { id: 'original', label: 'Original', value: null },
  { id: '1_1', label: '1:1', value: 1 },
  { id: '4_5', label: '4:5', value: 0.8 },
  { id: '9_16', label: '9:16', value: 9 / 16 },
  { id: '16_9', label: '16:9', value: 16 / 9 }
]

function rectForRatio(srcW: number, srcH: number, ratio: number): CropSettings['rect'] {
  const srcRatio = srcW / srcH
  let w = 1
  let h = 1
  if (srcRatio > ratio) {
    // fonte mais larga → limita largura
    w = (ratio * srcH) / srcW
  } else {
    h = (srcW / ratio) / srcH
  }
  return { x: (1 - w) / 2, y: (1 - h) / 2, width: w, height: h }
}

export function CropPanel({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const data = layer.data as ImageLayerData
  const crop = layer.crop ?? DEFAULT_CROP
  const updateCrop = useEditorStore((s) => s.updateCrop)
  const updateLayerTransform = useEditorStore((s) => s.updateLayerTransform)
  const captureHistory = useEditorStore((s) => s.captureHistory)
  const setTab = useEditorStore((s) => s.setActiveRightTab)
  const setTool = useUiStore((s) => s.setTool)
  const stash = useRef<CropSettings>(crop)

  const srcW = data.originalWidth
  const srcH = data.originalHeight

  const setBoxAspect = (ratio: number): void => {
    const t = layer.transform
    updateLayerTransform(layer.id, { ...t, height: t.width / ratio })
  }

  const pickRatio = (r: (typeof RATIOS)[number]): void => {
    captureHistory()
    if (r.id === 'original' || r.id === 'free') {
      updateCrop(layer.id, { aspectRatio: r.id, rect: { x: 0, y: 0, width: 1, height: 1 } })
      setBoxAspect(srcW / srcH)
      return
    }
    const rect = rectForRatio(srcW, srcH, r.value!)
    updateCrop(layer.id, { aspectRatio: r.id, rect })
    setBoxAspect(r.value!)
  }

  const rotate = (dir: 1 | -1): void => {
    captureHistory()
    const rotation = (crop.rotation + dir * 90 + 360) % 360
    updateCrop(layer.id, { rotation })
    const t = layer.transform
    updateLayerTransform(layer.id, { ...t, width: t.height, height: t.width })
  }

  return (
    <div className="space-y-5 px-4 py-4">
      {/* Proporção */}
      <div>
        <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{t('cropPanel.aspectRatio')}</span>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {RATIOS.map((r) => (
            <button
              key={r.id}
              onClick={() => pickRatio(r)}
              className={cn(
                'rounded-md border py-2 text-2xs transition-colors',
                crop.aspectRatio === r.id
                  ? 'border-noir-border-active/40 bg-noir-selection text-noir-text'
                  : 'border-noir-border text-noir-muted hover:bg-noir-hover'
              )}
            >
              {r.id === 'free' || r.id === 'original' ? t(`cropPanel.ratios.${r.id}`) : r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Girar / espelhar */}
      <div className="flex gap-2">
        <CropBtn label={t('cropPanel.rotateLeft')} onClick={() => rotate(-1)}><RotateCcw size={16} /></CropBtn>
        <CropBtn label={t('cropPanel.rotateRight')} onClick={() => rotate(1)}><RotateCw size={16} /></CropBtn>
        <CropBtn
          label={t('cropPanel.flipHorizontal')}
          active={crop.flipHorizontal}
          onClick={() => {
            captureHistory()
            updateCrop(layer.id, { flipHorizontal: !crop.flipHorizontal })
          }}
        >
          <FlipHorizontal size={16} />
        </CropBtn>
        <CropBtn
          label={t('cropPanel.flipVertical')}
          active={crop.flipVertical}
          onClick={() => {
            captureHistory()
            updateCrop(layer.id, { flipVertical: !crop.flipVertical })
          }}
        >
          <FlipVertical size={16} />
        </CropBtn>
      </div>

      {/* Endireitar / perspectiva */}
      <div>
        <Slider label={t('cropPanel.straighten')} value={crop.straighten} min={-45} max={45} defaultValue={0} onChangeStart={captureHistory} onChange={(v) => updateCrop(layer.id, { straighten: v })} />
        <Slider label={t('cropPanel.perspectiveVertical')} value={crop.perspectiveVertical} min={-100} max={100} defaultValue={0} onChangeStart={captureHistory} onChange={(v) => updateCrop(layer.id, { perspectiveVertical: v })} />
        <Slider label={t('cropPanel.perspectiveHorizontal')} value={crop.perspectiveHorizontal} min={-100} max={100} defaultValue={0} onChangeStart={captureHistory} onChange={(v) => updateCrop(layer.id, { perspectiveHorizontal: v })} />
      </div>

      {/* Ações */}
      <div className="flex gap-2 border-t border-noir-border/60 pt-4">
        <button
          onClick={() => {
            captureHistory()
            updateCrop(layer.id, { ...DEFAULT_CROP })
            setBoxAspect(srcW / srcH)
          }}
          className="flex-1 rounded-md border border-noir-border py-2 text-2xs text-noir-muted hover:bg-noir-hover"
        >
          {t('cropPanel.reset')}
        </button>
        <button
          onClick={() => {
            updateCrop(layer.id, stash.current)
            setTab('adjustments')
            setTool('select')
          }}
          className="flex items-center justify-center gap-1 rounded-md border border-noir-border px-3 py-2 text-2xs text-noir-muted hover:bg-noir-hover"
        >
          <X size={13} /> {t('common.cancel')}
        </button>
        <button
          onClick={() => {
            stash.current = layer.crop ?? DEFAULT_CROP
            setTab('adjustments')
            setTool('select')
          }}
          className="flex flex-1 items-center justify-center gap-1 rounded-md brand-primary py-2 text-2xs font-medium  "
        >
          <Check size={13} /> {t('cropPanel.apply')}
        </button>
      </div>
    </div>
  )
}

function CropBtn({
  label,
  active,
  onClick,
  children
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: JSX.Element
}): JSX.Element {
  return (
    <button
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex h-9 flex-1 items-center justify-center rounded-md border transition-colors',
        active
          ? 'border-noir-border-active/40 bg-noir-selection text-noir-text'
          : 'border-noir-border text-noir-muted hover:bg-noir-hover'
      )}
    >
      {children}
    </button>
  )
}
