import { useState, type DragEvent } from 'react'
import { ImagePlus, Plus, MousePointerClick } from 'lucide-react'
import { useEditorStore, selectActiveDumpItem } from '../../stores/editorStore'
import { projectActions } from '../../services/projectActions'
import { useT } from '@renderer/i18n'
import { useElementSize } from '../../hooks/useElementSize'
import { ASSET_DND_TYPE } from '../../lib/dnd'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../shell/EmptyState'
import { CanvasStage } from './CanvasStage'
import { CanvasToolbar } from './CanvasToolbar'
import { CarouselDots } from './CarouselDots'
import { QuickActivationMenu } from './QuickActivationMenu'
import { SelectionBubble } from './SelectionBubble'
import { RotationBadge } from './RotationBadge'
import { Rulers } from './Rulers'
import { computeView } from './viewTransform'
import { slotRectToTransform } from './layoutSlots'
import { cn } from '../../lib/cn'

export function CanvasRegion(): JSX.Element {
  const t = useT()
  const project = useEditorStore((s) => s.project)
  const activeItem = useEditorStore(selectActiveDumpItem)
  const selectedIds = useEditorStore((s) => s.ui?.selectedLayerIds ?? [])
  const zoom = useEditorStore((s) => s.ui?.canvasZoom ?? 1)
  const panX = useEditorStore((s) => s.ui?.canvasPanX ?? 0)
  const panY = useEditorStore((s) => s.ui?.canvasPanY ?? 0)
  const rulersEnabled = useEditorStore((s) => s.ui?.quickMenu.rulersEnabled ?? false)
  const { ref, size } = useElementSize<HTMLDivElement>()
  const [dropActive, setDropActive] = useState(false)

  const noPages = (project?.dumpItems.length ?? 0) === 0
  const selectedLayers = activeItem ? activeItem.layers.filter((l) => selectedIds.includes(l.id)) : []
  const view = activeItem ? computeView(size, activeItem.canvas, zoom, panX, panY) : null
  const pageEmpty = !!activeItem && activeItem.layers.every((l) => l.type === 'background')

  const onAssetDragOver = (e: DragEvent): void => {
    if (!Array.from(e.dataTransfer.types).includes(ASSET_DND_TYPE)) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    if (!dropActive) setDropActive(true)
  }

  const onAssetDrop = (e: DragEvent): void => {
    const assetId = e.dataTransfer.getData(ASSET_DND_TYPE)
    setDropActive(false)
    if (!assetId) return
    e.preventDefault()
    e.stopPropagation()
    // Ainda não há páginas: cria a primeira (fundo branco) com a foto centralizada.
    if (!activeItem || !view) {
      void projectActions.addImageToNewPage(assetId)
      return
    }
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const docX = (e.clientX - rect.left - view.offsetX) / view.scale
    const docY = (e.clientY - rect.top - view.offsetY) / view.scale
    // Layout ativo: soltar dentro de um slot encaixa a foto nele.
    const layout = activeItem.canvas.layout
    if (layout) {
      const slotIndex = layout.slots.findIndex((sl) => {
        const t = slotRectToTransform(sl, activeItem.canvas, layout.gutter)
        return docX >= t.x && docX <= t.x + t.width && docY >= t.y && docY <= t.y + t.height
      })
      if (slotIndex >= 0) {
        void projectActions.assignAssetToSlot(activeItem.id, assetId, slotIndex)
        return
      }
    }
    void projectActions.addImageFromAsset(activeItem.id, assetId, { x: docX, y: docY })
  }

  return (
    <div
      ref={ref}
      className="relative flex flex-1 items-center justify-center overflow-hidden bg-noir-canvas"
      onDragOver={onAssetDragOver}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDropActive(false)
      }}
      onDrop={onAssetDrop}
    >
      {noPages ? (
        <EmptyState
          icon={<Plus size={44} strokeWidth={1.25} />}
          title={t('canvas.emptyState.title')}
          description={t('canvas.emptyState.desc')}
          action={
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => void projectActions.addBlankDumpItem()}>
              {t('canvas.emptyState.newPage')}
            </Button>
          }
        />
      ) : (
        activeItem && <CanvasStage item={activeItem} width={size.width} height={size.height} />
      )}

      {!noPages && pageEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-noir-disabled">
            <MousePointerClick size={28} strokeWidth={1.25} />
            <p className="text-xs">{t('canvas.dropHint')}</p>
          </div>
        </div>
      )}

      {!noPages && view && rulersEnabled && <Rulers view={view} doc={activeItem!.canvas} size={size} />}

      {!noPages && (
        <>
          <QuickActivationMenu />
          <CanvasToolbar />
          {activeItem && view && selectedLayers.length > 0 && (
            <SelectionBubble
              layers={selectedLayers}
              canvas={activeItem.canvas}
              view={view}
              regionWidth={size.width}
              regionHeight={size.height}
            />
          )}
          <RotationBadge />
        </>
      )}

      <CarouselDots />

      {dropActive && (
        <div className="pointer-events-none absolute inset-3 rounded-xl border-2 border-dashed border-noir-border-active/50" />
      )}

      {/* Fallback de importação quando há páginas mas o pool está vazio */}
      {!noPages && (project?.assets.length ?? 0) === 0 && pageEmpty && (
        <button
          onClick={() => void projectActions.importPhotos()}
          className={cn(
            'absolute bottom-16 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-lg border border-noir-border bg-noir-elevated px-3.5 py-2 text-xs',
            'pointer-events-auto transition-colors hover:bg-noir-hover'
          )}
        >
          <ImagePlus size={15} /> {t('canvas.addPhotos')}
        </button>
      )}
    </div>
  )
}
