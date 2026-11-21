import { RectangleHorizontal, Square, Circle, Triangle, Minus, Slash } from 'lucide-react'
import type { BorderLayerData, Layer, ShapeKind, ShapeLayerData } from '@shared/types'
import { useEditorStore } from '../../../stores/editorStore'
import { Slider } from '../../../components/ui/Slider'
import { useT } from '@renderer/i18n'
import { cn } from '../../../lib/cn'

type ShapeId = 'rectangle' | 'square' | 'circle' | 'triangle' | 'line'
const COLORS = ['#FFFFFF', '#C8C8C8', '#7A7A7A', '#2E2E2E', '#000000']
const SHAPES: { kind: ShapeKind; icon: JSX.Element; label: string }[] = [
  { kind: 'rectangle', icon: <RectangleHorizontal size={16} />, label: 'Retângulo' },
  { kind: 'square', icon: <Square size={16} />, label: 'Quadrado' },
  { kind: 'circle', icon: <Circle size={16} />, label: 'Círculo' },
  { kind: 'triangle', icon: <Triangle size={16} />, label: 'Triângulo' },
  { kind: 'line', icon: <Minus size={16} />, label: 'Linha' }
]

export function ShapePanel({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const update = useEditorStore((s) => s.updateLayerData)
  const setOpacity = useEditorStore((s) => s.setLayerOpacity)
  const capture = useEditorStore((s) => s.captureHistory)
  const isBorder = layer.type === 'border'
  const data = layer.data as ShapeLayerData & BorderLayerData

  const ColorRow = ({
    label,
    value,
    field,
    allowTransparent,
    allowNone
  }: {
    label: string
    value: string
    field: string
    allowTransparent?: boolean
    allowNone?: boolean
  }): JSX.Element => (
    <div>
      <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{label}</span>
      <div className="mt-2 flex gap-2">
        {allowNone && (
          <button
            onClick={() => {
              capture()
              update(layer.id, { [field]: 'transparent' })
            }}
            title={t('shapePanel.noStroke')}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full border-2 bg-noir-bg text-noir-muted',
              value === 'transparent' || value === 'none' ? 'border-noir-border-active' : 'border-noir-border'
            )}
          >
            <Slash size={13} />
          </button>
        )}
        {allowTransparent && (
          <button
            onClick={() => {
              capture()
              update(layer.id, { [field]: 'transparent' })
            }}
            title={t('shapePanel.noFill')}
            className={cn(
              'h-6 w-6 rounded-full border-2',
              value === 'transparent' ? 'border-noir-border-active' : 'border-noir-border'
            )}
            style={{
              backgroundImage:
                'var(--checkerboard)',
              backgroundSize: '6px 6px',
              backgroundPosition: '0 0,3px 3px'
            }}
          />
        )}
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => {
              capture()
              update(layer.id, { [field]: c })
            }}
            className={cn('h-6 w-6 rounded-full border-2', value === c ? 'border-noir-border-active' : 'border-noir-border')}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  )

  if (isBorder) {
    return (
      <div className="space-y-4 px-4 py-4">
        <ColorRow label={t('shapePanel.borderColor')} value={data.color} field="color" />
        <Slider label={t('shapePanel.thickness')} value={data.thickness} min={0} max={120} defaultValue={24} onChangeStart={capture} onChange={(v) => update(layer.id, { thickness: v })} />
        <Slider label={t('shapePanel.cornerRadius')} value={data.cornerRadius} min={0} max={120} defaultValue={0} onChangeStart={capture} onChange={(v) => update(layer.id, { cornerRadius: v })} />
        <Slider label={t('shapePanel.gutter')} value={data.gutter} min={0} max={120} defaultValue={16} onChangeStart={capture} onChange={(v) => update(layer.id, { gutter: v })} />
      </div>
    )
  }

  const kind = data.shape
  const isLine = kind === 'line'
  const isRectLike = kind === 'rectangle' || kind === 'square'

  return (
    <div className="space-y-4 px-4 py-4">
      {/* Seletor de forma */}
      <div>
        <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{t('inspector.shape')}</span>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {SHAPES.map((s) => (
            <button
              key={s.kind}
              title={t(`shapePanel.shapes.${s.kind as ShapeId}`)}
              aria-label={t(`shapePanel.shapes.${s.kind as ShapeId}`)}
              onClick={() => {
                capture()
                update(layer.id, { shape: s.kind })
              }}
              className={cn(
                'flex h-9 items-center justify-center rounded-md border transition-colors',
                kind === s.kind
                  ? 'border-noir-border-active/40 bg-noir-selection text-noir-text'
                  : 'border-noir-border text-noir-muted hover:bg-noir-hover'
              )}
            >
              {s.icon}
            </button>
          ))}
        </div>
      </div>

      <ColorRow label={isLine ? t('shapePanel.lineColor') : t('shapePanel.stroke')} value={data.stroke} field="stroke" allowNone={!isLine} />
      {!isLine && <ColorRow label={t('shapePanel.fill')} value={data.fill} field="fill" allowTransparent />}

      <Slider label={isLine ? t('shapePanel.lineThickness') : t('shapePanel.strokeWidth')} value={data.strokeWidth} min={0} max={60} defaultValue={4} onChangeStart={capture} onChange={(v) => update(layer.id, { strokeWidth: v })} />
      {isRectLike && (
        <Slider label={t('shapePanel.cornerRadius')} value={data.cornerRadius} min={0} max={200} defaultValue={0} onChangeStart={capture} onChange={(v) => update(layer.id, { cornerRadius: v })} />
      )}

      <Slider
        label={t('shapePanel.opacity')}
        value={Math.round(layer.opacity * 100)}
        min={0}
        max={100}
        defaultValue={100}
        onChangeStart={capture}
        onChange={(v) => setOpacity(layer.id, v / 100)}
      />
    </div>
  )
}
