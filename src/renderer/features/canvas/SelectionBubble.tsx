import { useState } from 'react'
import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Copy,
  Trash2,
  BringToFront,
  SendToBack,
  Wand2
} from 'lucide-react'
import type { Layer } from '@shared/types'
import { FILTERS } from '../../../engine/filters/registry'
import { useEditorStore } from '../../stores/editorStore'
import { projectActions } from '../../services/projectActions'
import { useT } from '@renderer/i18n'
import { alignLayers, distributeLayers, type AlignMode } from './alignment'
import type { ViewTransform } from './viewTransform'
import { cn } from '../../lib/cn'

interface Props {
  layers: Layer[]
  canvas: { width: number; height: number }
  view: ViewTransform
  regionWidth: number
  regionHeight: number
}

const ALIGN_BUTTONS: { mode: AlignMode; icon: JSX.Element }[] = [
  { mode: 'left', icon: <AlignStartVertical size={15} /> },
  { mode: 'centerH', icon: <AlignCenterVertical size={15} /> },
  { mode: 'right', icon: <AlignEndVertical size={15} /> },
  { mode: 'top', icon: <AlignStartHorizontal size={15} /> },
  { mode: 'centerV', icon: <AlignCenterHorizontal size={15} /> },
  { mode: 'bottom', icon: <AlignEndHorizontal size={15} /> }
]

export function SelectionBubble({ layers, canvas, view, regionWidth, regionHeight }: Props): JSX.Element | null {
  const t = useT()
  const captureHistory = useEditorStore((s) => s.captureHistory)
  const updateLayerTransform = useEditorStore((s) => s.updateLayerTransform)
  const setFilter = useEditorStore((s) => s.setFilter)
  const reorderLayers = useEditorStore((s) => s.reorderLayers)
  const project = useEditorStore((s) => s.project)
  const [filterOpen, setFilterOpen] = useState(false)

  const editable = layers.filter((l) => l.type !== 'background' && !l.locked)
  if (editable.length === 0) return null

  const minX = Math.min(...editable.map((l) => l.transform.x))
  const maxX = Math.max(...editable.map((l) => l.transform.x + l.transform.width))
  const minY = Math.min(...editable.map((l) => l.transform.y))
  const maxY = Math.max(...editable.map((l) => l.transform.y + l.transform.height))

  const screenCenterX = view.offsetX + ((minX + maxX) / 2) * view.scale
  const screenTop = view.offsetY + minY * view.scale
  const screenBottom = view.offsetY + maxY * view.scale
  const left = Math.max(180, Math.min(regionWidth - 180, screenCenterX))
  // Abaixo da seleção por padrão (longe da alça de rotação no topo); acima só se não couber.
  const BUBBLE_H = 42
  const belowTop = screenBottom + 18
  const top = belowTop + BUBBLE_H < regionHeight - 8 ? belowTop : Math.max(8, screenTop - BUBBLE_H - 28)

  const onlyImages = editable.filter((l) => l.type === 'image')
  const hasImages = onlyImages.length > 0
  const canDistribute = editable.length >= 3

  const applyAlign = (mode: AlignMode): void => {
    captureHistory()
    const next = alignLayers(editable, mode, canvas)
    for (const l of editable) {
      const p = next[l.id]
      if (p) updateLayerTransform(l.id, { ...l.transform, x: p.x, y: p.y })
    }
  }

  const applyDistribute = (axis: 'h' | 'v'): void => {
    captureHistory()
    const next = distributeLayers(editable, axis)
    for (const l of editable) {
      const p = next[l.id]
      if (p) updateLayerTransform(l.id, { ...l.transform, x: p.x, y: p.y })
    }
  }

  const reorderEnd = (toFront: boolean): void => {
    const di = project?.dumpItems.find((d) => d.id === editable[0].dumpItemId)
    if (!di) return
    const ids = [...di.layers].sort((a, b) => a.orderIndex - b.orderIndex).map((l) => l.id)
    const sel = new Set(editable.map((l) => l.id))
    const rest = ids.filter((id) => !sel.has(id))
    const moved = ids.filter((id) => sel.has(id))
    reorderLayers(di.id, toFront ? [...rest, ...moved] : [...moved, ...rest])
  }

  return (
    <div
      className="absolute z-20 -translate-x-1/2 rounded-lg border border-noir-border bg-noir-elevated/95 px-1 py-1 shadow-bubble backdrop-blur"
      style={{ left, top }}
    >
      <div className="flex items-center gap-0.5">
        {ALIGN_BUTTONS.map((b) => (
          <BubbleBtn key={b.mode} label={t(`canvas.selection.align.${b.mode}`)} onClick={() => applyAlign(b.mode)}>
            {b.icon}
          </BubbleBtn>
        ))}
        <Divider />
        <BubbleBtn
          label={t('canvas.selection.distributeH')}
          disabled={!canDistribute}
          onClick={() => applyDistribute('h')}
        >
          <AlignHorizontalDistributeCenter size={15} />
        </BubbleBtn>
        <BubbleBtn
          label={t('canvas.selection.distributeV')}
          disabled={!canDistribute}
          onClick={() => applyDistribute('v')}
        >
          <AlignVerticalDistributeCenter size={15} />
        </BubbleBtn>
        <Divider />
        <BubbleBtn label={t('canvas.selection.bringToFront')} onClick={() => reorderEnd(true)}>
          <BringToFront size={15} />
        </BubbleBtn>
        <BubbleBtn label={t('canvas.selection.sendToBack')} onClick={() => reorderEnd(false)}>
          <SendToBack size={15} />
        </BubbleBtn>
        <Divider />
        {hasImages && (
          <div className="relative">
            <BubbleBtn label={t('canvas.selection.quickFilter')} active={filterOpen} onClick={() => setFilterOpen(!filterOpen)}>
              <Wand2 size={15} />
            </BubbleBtn>
            {filterOpen && (
              <div className="absolute left-1/2 top-9 z-30 w-44 -translate-x-1/2 rounded-lg border border-noir-border bg-noir-elevated p-1 shadow-bubble">
                <button
                  onClick={() => {
                    captureHistory()
                    onlyImages.forEach((l) => setFilter(l.id, null))
                    setFilterOpen(false)
                  }}
                  className="block w-full rounded-md px-2 py-1.5 text-left text-2xs text-noir-muted hover:bg-noir-hover"
                >
                  {t('canvas.selection.removeFilter')}
                </button>
                {FILTERS.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => {
                      captureHistory()
                      onlyImages.forEach((l) => setFilter(l.id, f.name, 100))
                      setFilterOpen(false)
                    }}
                    className="block w-full truncate rounded-md px-2 py-1.5 text-left text-2xs text-noir-text hover:bg-noir-hover"
                  >
                    {t(`filters.items.${f.name}.label`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <BubbleBtn
          label={t('common.duplicate')}
          onClick={() => editable.forEach((l) => void projectActions.duplicateLayer(l.id))}
        >
          <Copy size={15} />
        </BubbleBtn>
        <BubbleBtn
          label={t('common.delete')}
          danger
          onClick={() => editable.forEach((l) => void projectActions.deleteLayer(l.id))}
        >
          <Trash2 size={15} />
        </BubbleBtn>
      </div>
    </div>
  )
}

function Divider(): JSX.Element {
  return <span className="mx-0.5 h-5 w-px bg-noir-border" />
}

function BubbleBtn({
  label,
  active,
  danger,
  disabled,
  onClick,
  children
}: {
  label: string
  active?: boolean
  danger?: boolean
  disabled?: boolean
  onClick: () => void
  children: JSX.Element
}): JSX.Element {
  return (
    <button
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent',
        danger
          ? 'text-red-300 hover:bg-red-500/10'
          : active
            ? 'bg-noir-selection text-noir-text'
            : 'text-noir-muted hover:bg-noir-hover hover:text-noir-text'
      )}
    >
      {children}
    </button>
  )
}
