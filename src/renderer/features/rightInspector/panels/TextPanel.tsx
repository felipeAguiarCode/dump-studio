import { AlignLeft, AlignCenter, AlignRight, Bold, Plus, Pipette } from 'lucide-react'
import type { Layer, TextLayerData } from '@shared/types'
import { useEditorStore, selectSelectedLayer, selectActiveDumpItem } from '../../../stores/editorStore'
import { projectActions } from '../../../services/projectActions'
import { Slider } from '../../../components/ui/Slider'
import { FontSelect } from '../../../components/ui/FontSelect'
import { MARIGOLD } from '../../../lib/colors'
import { useT } from '@renderer/i18n'
import { cn } from '../../../lib/cn'

const COLORS = ['#FFFFFF', MARIGOLD, '#A0A0A0', '#666666', '#000000']
const ALIGNS: { value: TextLayerData['align']; icon: JSX.Element }[] = [
  { value: 'left', icon: <AlignLeft size={15} /> },
  { value: 'center', icon: <AlignCenter size={15} /> },
  { value: 'right', icon: <AlignRight size={15} /> }
]

/** Ferramenta de Texto do trilho: adicionar texto + editar o texto selecionado. */
export function TextToolPanel(): JSX.Element {
  const t = useT()
  const selected = useEditorStore(selectSelectedLayer)
  const activeItem = useEditorStore(selectActiveDumpItem)
  const isText = selected?.type === 'text'

  const addText = (): void => {
    if (activeItem) void projectActions.addLayer({ dumpItemId: activeItem.id, type: 'text' })
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4">
        <button
          onClick={addText}
          disabled={!activeItem}
          className="flex w-full items-center justify-center gap-2 rounded-md brand-primary py-2 text-xs font-medium  transition-colors  disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={14} /> {t('textPanel.addText')}
        </button>
      </div>

      {isText ? (
        <TextEditor layer={selected} />
      ) : (
        <p className="px-4 py-6 text-2xs leading-relaxed text-noir-muted">
          {t('textPanel.emptyHint')}
        </p>
      )}
    </div>
  )
}

function TextEditor({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const data = layer.data as TextLayerData
  const update = useEditorStore((s) => s.updateLayerData)
  const capture = useEditorStore((s) => s.captureHistory)
  const setOpacity = useEditorStore((s) => s.setLayerOpacity)
  const isBold = data.fontWeight >= 600
  const isPreset = COLORS.includes(data.color)

  return (
    <div className="space-y-4 px-4 py-4">
      <div>
        <label className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{t('textPanel.textLabel')}</label>
        <textarea
          value={data.text}
          onChange={(e) => update(layer.id, { text: e.target.value })}
          rows={3}
          className="mt-2 w-full resize-none rounded-md border border-noir-border bg-noir-bg p-2 text-sm text-noir-text outline-none focus:border-noir-border-active/40"
        />
      </div>

      <div>
        <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{t('textPanel.font')}</span>
        <div className="mt-2">
          <FontSelect
            value={data.fontFamily}
            onChange={(family) => {
              capture()
              update(layer.id, { fontFamily: family })
            }}
          />
        </div>
      </div>

      <Slider
        label={t('textPanel.size')}
        value={data.fontSize}
        min={12}
        max={300}
        defaultValue={64}
        onChangeStart={capture}
        onChange={(v) => update(layer.id, { fontSize: v })}
      />

      <Slider
        label={t('textPanel.curve')}
        value={data.curve ?? 0}
        min={-100}
        max={100}
        defaultValue={0}
        onChangeStart={capture}
        onChange={(v) => update(layer.id, { curve: v })}
      />

      <Slider
        label={t('textPanel.opacity')}
        value={Math.round((layer.opacity ?? 1) * 100)}
        min={0}
        max={100}
        defaultValue={100}
        onChangeStart={capture}
        onChange={(v) => setOpacity(layer.id, v / 100)}
      />

      <div>
        <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{t('textPanel.style')}</span>
        <div className="mt-2 flex gap-1">
          <button
            onClick={() => {
              capture()
              update(layer.id, { fontWeight: isBold ? 500 : 700 })
            }}
            title={t('textPanel.bold')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
              isBold
                ? 'border-noir-border-active/40 bg-noir-selection text-noir-text'
                : 'border-noir-border text-noir-muted hover:bg-noir-hover'
            )}
          >
            <Bold size={15} />
          </button>
        </div>
      </div>

      <div>
        <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{t('textPanel.color')}</span>
        <div className="mt-2 flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                capture()
                update(layer.id, { color: c })
              }}
              className={cn(
                'h-7 w-7 rounded-full border-2',
                data.color === c ? 'border-noir-border-active' : 'border-noir-border'
              )}
              style={{ background: c }}
            />
          ))}
          {/* Cor personalizada (RGB / Hex) */}
          <label
            title={t('textPanel.customColor')}
            className={cn(
              'relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border-2',
              !isPreset ? 'border-noir-border-active' : 'border-noir-border'
            )}
            style={{ background: 'conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
          >
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white mix-blend-difference">
              <Pipette size={12} />
            </span>
            <input
              type="color"
              value={data.color}
              onChange={(e) => {
                capture()
                update(layer.id, { color: e.target.value })
              }}
              className="absolute -inset-2 h-[200%] w-[200%] cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>

      <div>
        <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{t('textPanel.alignment')}</span>
        <div className="mt-2 flex gap-1">
          {ALIGNS.map((a) => (
            <button
              key={a.value}
              onClick={() => {
                capture()
                update(layer.id, { align: a.value })
              }}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
                data.align === a.value
                  ? 'border-noir-border-active/40 bg-noir-selection text-noir-text'
                  : 'border-noir-border text-noir-muted hover:bg-noir-hover'
              )}
            >
              {a.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
