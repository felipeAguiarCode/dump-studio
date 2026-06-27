import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Image as ImageIcon,
  Type,
  Square,
  SquareDashed,
  Layers as LayersIcon,
  Sparkles,
  MoreVertical,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical
} from 'lucide-react'
import type { ImageLayerData, Layer, LayerType } from '@shared/types'
import { useEditorStore, selectActiveDumpItem } from '../../stores/editorStore'
import { projectActions } from '../../services/projectActions'
import { thumbUrl } from '../../services/assetUrls'
import { useT } from '@renderer/i18n'
import { Slider } from '../../components/ui/Slider'
import { cn } from '../../lib/cn'

const TYPE_ICON: Record<LayerType, JSX.Element> = {
  image: <ImageIcon size={13} />,
  text: <Type size={13} />,
  shape: <Square size={13} />,
  border: <SquareDashed size={13} />,
  background: <LayersIcon size={13} />,
  overlay: <Sparkles size={13} />
}

/** Nomes-padrão (gerados ao criar a camada) por tipo, em EN e PT legado, para localizar no render. */
const DEFAULT_LAYER_NAMES: Partial<Record<LayerType, string[]>> = {
  background: ['Background', 'Plano de Fundo'],
  text: ['Text', 'Texto'],
  shape: ['Shape', 'Forma'],
  border: ['Border', 'Borda'],
  image: ['Layer', 'Camada']
}

/** Mostra o nome da camada; se ainda for o nome-padrão do tipo, traduz. Nomes customizados são respeitados. */
function useLayerDisplayName(): (layer: Layer) => string {
  const t = useT()
  return (layer) => {
    const defaults = DEFAULT_LAYER_NAMES[layer.type]
    if (defaults?.includes(layer.name)) return t(`layers.names.${layer.type === 'image' ? 'layer' : layer.type}`)
    return layer.name
  }
}

export function LayersPanel(): JSX.Element {
  const activeItem = useEditorStore(selectActiveDumpItem)
  const selectedId = useEditorStore((s) => s.ui?.selectedLayerId)
  const selectLayer = useEditorStore((s) => s.selectLayer)
  const reorderLayers = useEditorStore((s) => s.reorderLayers)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const t = useT()

  if (!activeItem) return <div className="px-4 py-3 text-2xs text-noir-disabled">{t('layers.noActivePage')}</div>

  // Exibe do topo (maior orderIndex) para baixo, como no mockup.
  const ordered = [...activeItem.layers].sort((a, b) => b.orderIndex - a.orderIndex)

  const applyReorder = (displayList: Layer[]): void => {
    // Converte de volta para ordem crescente de orderIndex.
    const ascending = [...displayList].reverse().map((l) => l.id)
    reorderLayers(activeItem.id, ascending)
  }

  const onDrop = (targetId: string): void => {
    if (!dragId || dragId === targetId) return
    const list = [...ordered]
    const from = list.findIndex((l) => l.id === dragId)
    const to = list.findIndex((l) => l.id === targetId)
    if (from < 0 || to < 0) return
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved)
    applyReorder(list)
    setDragId(null)
  }

  return (
    <div className="flex flex-col">
      {ordered.map((layer) => (
        <LayerRow
          key={layer.id}
          layer={layer}
          selected={selectedId === layer.id}
          menuOpen={menuId === layer.id}
          onSelect={() => selectLayer(layer.id)}
          onToggleMenu={() => setMenuId(menuId === layer.id ? null : layer.id)}
          onCloseMenu={() => setMenuId(null)}
          onDragStart={() => setDragId(layer.id)}
          onDragEnd={() => setDragId(null)}
          onDrop={() => onDrop(layer.id)}
          dragging={dragId === layer.id}
        />
      ))}
    </div>
  )
}

function LayerRow({
  layer,
  selected,
  menuOpen,
  onSelect,
  onToggleMenu,
  onCloseMenu,
  onDragStart,
  onDragEnd,
  onDrop,
  dragging
}: {
  layer: Layer
  selected: boolean
  menuOpen: boolean
  onSelect: () => void
  onToggleMenu: () => void
  onCloseMenu: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onDrop: () => void
  dragging: boolean
}): JSX.Element {
  const setVisibility = useEditorStore((s) => s.setLayerVisibility)
  const setLock = useEditorStore((s) => s.setLayerLock)
  const setOpacity = useEditorStore((s) => s.setLayerOpacity)
  const renameLayer = useEditorStore((s) => s.renameLayer)
  const captureHistory = useEditorStore((s) => s.captureHistory)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(layer.name)
  const t = useT()
  const displayName = useLayerDisplayName()

  const assetId = layer.type === 'image' ? (layer.data as ImageLayerData).assetId : undefined
  const lockable = layer.type !== 'background' || true

  return (
    <div
      // Não arrastável com o menu aberto: evita que mexer no slider de opacidade dispare
      // o drag nativo do row (que aplicaria opacity-40 ao row inteiro, incluindo o menu).
      draggable={!layer.locked && !menuOpen}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={onSelect}
      className={cn(
        'group relative flex items-center gap-2 px-2.5 py-1.5 transition-colors',
        selected ? 'bg-noir-selection' : 'hover:bg-noir-hover',
        dragging && 'opacity-40'
      )}
    >
      <GripVertical
        size={13}
        className={cn('shrink-0 text-noir-disabled', layer.locked ? 'opacity-20' : 'cursor-grab')}
      />

      {/* Thumb */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded border border-noir-border bg-noir-bg text-noir-muted">
        {assetId ? (
          <img src={thumbUrl(assetId)} alt="" className="h-full w-full object-cover" />
        ) : (
          TYPE_ICON[layer.type]
        )}
      </div>

      {/* Nome */}
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            setEditing(false)
            if (draft.trim() && draft !== layer.name) renameLayer(layer.id, draft.trim())
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            if (e.key === 'Escape') {
              setDraft(layer.name)
              setEditing(false)
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="min-w-0 flex-1 rounded border border-noir-border bg-noir-bg px-1.5 py-0.5 text-xs outline-none"
        />
      ) : (
        <span
          onDoubleClick={(e) => {
            e.stopPropagation()
            setDraft(layer.name)
            setEditing(true)
          }}
          className={cn('min-w-0 flex-1 truncate text-xs', layer.visible ? 'text-noir-text' : 'text-noir-disabled')}
        >
          {displayName(layer)}
        </span>
      )}

      {/* Ações */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setVisibility(layer.id, !layer.visible)
        }}
        className={cn('shrink-0 text-noir-muted hover:text-noir-text', !layer.visible && 'text-noir-disabled')}
        aria-label={layer.visible ? t('layers.hide') : t('layers.show')}
      >
        {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (lockable) setLock(layer.id, !layer.locked)
        }}
        className={cn(
          'shrink-0 text-noir-muted hover:text-noir-text',
          layer.locked ? 'text-noir-text' : 'opacity-0 group-hover:opacity-100'
        )}
        aria-label={layer.locked ? t('layers.unlock') : t('layers.lock')}
      >
        {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleMenu()
        }}
        className="shrink-0 text-noir-muted opacity-0 hover:text-noir-text group-hover:opacity-100"
        aria-label={t('layers.options')}
      >
        <MoreVertical size={14} />
      </button>

      {menuOpen && (
        <div
          className="absolute right-2 top-9 z-20 w-48 rounded-lg border border-noir-border bg-noir-elevated p-1 shadow-bubble"
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem
            icon={<Copy size={13} />}
            onClick={() => {
              onCloseMenu()
              void projectActions.duplicateLayer(layer.id)
            }}
          >
            {t('common.duplicate')}
          </MenuItem>
          <MenuItem
            icon={<ArrowUp size={13} />}
            onClick={() => {
              onCloseMenu()
              bringForward(layer)
            }}
          >
            {t('layers.bringForward')}
          </MenuItem>
          <MenuItem
            icon={<ArrowDown size={13} />}
            onClick={() => {
              onCloseMenu()
              sendBackward(layer)
            }}
          >
            {t('layers.sendBackward')}
          </MenuItem>
          <div className="px-2 pb-1 pt-2">
            <Slider
              label={t('layers.opacity')}
              value={Math.round(layer.opacity * 100)}
              min={0}
              max={100}
              defaultValue={100}
              onChangeStart={captureHistory}
              onChange={(v) => setOpacity(layer.id, v / 100)}
            />
          </div>
          {layer.type !== 'background' && (
            <MenuItem
              icon={<Trash2 size={13} />}
              danger
              onClick={() => {
                onCloseMenu()
                void projectActions.deleteLayer(layer.id)
              }}
            >
              {t('common.delete')}
            </MenuItem>
          )}
        </div>
      )}
    </div>
  )
}

function bringForward(layer: Layer): void {
  const editor = useEditorStore.getState()
  const di = editor.project?.dumpItems.find((d) => d.id === layer.dumpItemId)
  if (!di) return
  const asc = [...di.layers].sort((a, b) => a.orderIndex - b.orderIndex).map((l) => l.id)
  const i = asc.indexOf(layer.id)
  if (i < 0 || i >= asc.length - 1) return
  ;[asc[i], asc[i + 1]] = [asc[i + 1], asc[i]]
  editor.reorderLayers(di.id, asc)
}

function sendBackward(layer: Layer): void {
  const editor = useEditorStore.getState()
  const di = editor.project?.dumpItems.find((d) => d.id === layer.dumpItemId)
  if (!di) return
  const asc = [...di.layers].sort((a, b) => a.orderIndex - b.orderIndex).map((l) => l.id)
  const i = asc.indexOf(layer.id)
  if (i <= 0) return
  ;[asc[i], asc[i - 1]] = [asc[i - 1], asc[i]]
  editor.reorderLayers(di.id, asc)
}

function MenuItem({
  icon,
  children,
  danger,
  onClick
}: {
  icon: JSX.Element
  children: string
  danger?: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-noir-hover',
        danger ? 'text-red-300' : 'text-noir-text'
      )}
    >
      {icon}
      {children}
    </button>
  )
}
