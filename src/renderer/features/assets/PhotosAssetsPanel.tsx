import { useMemo } from 'react'
import { ChevronDown, ChevronUp, Plus, ImagePlus } from 'lucide-react'
import type { ImageLayerData } from '@shared/types'
import { useEditorStore } from '../../stores/editorStore'
import { projectActions } from '../../services/projectActions'
import { thumbUrl } from '../../services/assetUrls'
import { useT } from '@renderer/i18n'
import { IconButton } from '../../components/ui/IconButton'
import { ASSET_DND_TYPE } from '../../lib/dnd'

const THUMB = 76

export function PhotosAssetsPanel(): JSX.Element {
  const project = useEditorStore((s) => s.project)
  const ui = useEditorStore((s) => s.ui)
  const setCollapsed = useEditorStore((s) => s.setFilmstripCollapsed)
  const t = useT()

  const collapsed = ui?.filmstripCollapsed ?? false
  const assets = project?.assets ?? []
  const activePageId = ui?.activeDumpItemId

  const usage = useMemo(() => {
    const map = new Map<string, number>()
    for (const di of project?.dumpItems ?? []) {
      for (const l of di.layers) {
        if (l.type === 'image') {
          const id = (l.data as ImageLayerData).assetId
          map.set(id, (map.get(id) ?? 0) + 1)
        }
      }
    }
    return map
  }, [project?.dumpItems])

  const addToPage = (assetId: string): void => {
    if (!activePageId) {
      // Sem páginas: cria a primeira (fundo branco) já com a foto.
      void projectActions.addImageToNewPage(assetId)
      return
    }
    // Layout ativo: clique preenche o primeiro slot vazio.
    const activeItem = project?.dumpItems.find((d) => d.id === activePageId)
    const layout = activeItem?.canvas.layout
    if (activeItem && layout) {
      const occupied = new Set<number>()
      for (const l of activeItem.layers) {
        if (l.type === 'image') {
          const si = (l.data as ImageLayerData).slotIndex
          if (si != null) occupied.add(si)
        }
      }
      const empty = layout.slots.findIndex((_, i) => !occupied.has(i))
      if (empty >= 0) {
        void projectActions.assignAssetToSlot(activePageId, assetId, empty)
        return
      }
    }
    void projectActions.addImageFromAsset(activePageId, assetId)
  }

  return (
    <div className="border-t border-noir-border bg-noir-panel shadow-dock">
      <div className="flex h-10 items-center gap-3 px-4">
        <span className="text-2xs font-semibold uppercase tracking-[0.14em] text-noir-muted">Photos Assets</span>
        <span className="text-2xs text-noir-disabled">
          {t.plural('assets.photoCount', assets.length, { count: assets.length })}
        </span>
        <span className="hidden text-2xs text-noir-disabled lg:inline">{t('assets.hint')}</span>
        <div className="ml-auto flex items-center gap-1">
          <IconButton label={t('assets.addPhotos')} size="sm" tooltipSide="top" onClick={() => void projectActions.importPhotos()}>
            <Plus size={16} />
          </IconButton>
          <IconButton label={collapsed ? t('assets.expand') : t('assets.collapse')} size="sm" tooltipSide="top" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </div>
      </div>

      {!collapsed && (
        <div className="h-[92px] overflow-x-auto px-4 pb-3">
          {assets.length === 0 ? (
            <button
              onClick={() => void projectActions.importPhotos()}
              className="flex h-[72px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-noir-border text-2xs text-noir-disabled transition-colors hover:border-noir-muted/50 hover:text-noir-muted"
            >
              <ImagePlus size={16} />
              {t('assets.emptyCta')}
            </button>
          ) : (
            <div className="flex h-full items-center gap-2.5">
              {assets.map((asset) => {
                const used = usage.get(asset.id) ?? 0
                return (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(ASSET_DND_TYPE, asset.id)
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    onClick={() => addToPage(asset.id)}
                    title={`${asset.fileName}${used ? t('assets.usedTimes', { count: used }) : ''}`}
                    className="group relative shrink-0 cursor-grab overflow-hidden rounded-md border border-noir-border bg-noir-bg transition-colors hover:border-noir-border-active/40 active:cursor-grabbing"
                    style={{ width: THUMB, height: THUMB }}
                  >
                    <img src={thumbUrl(asset.id)} alt={asset.fileName} className="h-full w-full object-cover" draggable={false} />
                    {used > 0 && (
                      <span className="absolute right-1 top-1 rounded bg-black/60 px-1 text-[9px] font-medium text-noir-text">{used}×</span>
                    )}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-gradient-to-t from-black/70 to-transparent py-1 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Plus size={11} /> {t('assets.add')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
