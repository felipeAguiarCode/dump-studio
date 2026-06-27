import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  CanvasBackground,
  CropSettings,
  DumpItem,
  Layer,
  PhotoAdjustments,
  PhotoFilter,
  PhotoFilterName,
  Project,
  ProjectUiState,
  RightTab,
  LayerTransform,
  QuickMenuState,
  OriginalAsset,
  ImageLayerData,
  PageLayout,
  ColorGrading,
  HSLMixer,
  ToneCurves,
  ShaderEffects
} from '@shared/types'
import { DEFAULT_ADJUSTMENTS, DEFAULT_SHADERS } from '@shared/defaults'
import { ipc } from '../services/ipcClient'
import { autosaveClient } from '../services/autosaveClient'
import { useHistoryStore } from './historyStore'
import { slotRectToTransform, coverCropForSlot, seamCropForSlot } from '../features/canvas/layoutSlots'
import type { CameraLook } from '../features/rightInspector/camerasConfig'

interface EditorState {
  project: Project | null
  ui: ProjectUiState | null

  loadProject: (project: Project, ui: ProjectUiState) => void
  setProject: (project: Project) => void
  closeProject: () => void

  // Histórico
  captureHistory: () => void
  undo: () => void
  redo: () => void

  // Navegação / seleção / UI persistida
  setActiveDumpItem: (id: string) => void
  goToDumpItemIndex: (index: number) => void
  selectLayer: (id: string | null) => void
  toggleSelection: (id: string) => void
  setSelection: (ids: string[]) => void
  clearSelection: () => void
  setActiveRightTab: (tab: RightTab) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  resetView: () => void
  setQuickMenu: (patch: Partial<QuickMenuState>) => void
  setFilmstripCollapsed: (collapsed: boolean) => void
  setFilmstripView: (view: ProjectUiState['filmstripView']) => void
  setFilmstripThumbnailSize: (size: number) => void
  setLeftSidebarCollapsed: (collapsed: boolean) => void
  setRightSidebarCollapsed: (collapsed: boolean) => void

  // Projeto
  setProjectName: (name: string) => void

  // Pool de assets
  appendAssets: (assets: OriginalAsset[]) => void

  // Dump items (memória — criação/remoção persistidas via IPC pelo chamador)
  appendDumpItems: (items: DumpItem[]) => void
  insertDumpItemAfter: (item: DumpItem, afterId?: string) => void
  removeDumpItemLocal: (id: string) => void
  reorderDumpItems: (orderedIds: string[]) => void
  renameDumpItem: (id: string, title: string) => void

  // Camadas
  appendLayers: (dumpItemId: string, layers: Layer[]) => void
  removeLayerLocal: (id: string) => void
  reorderLayers: (dumpItemId: string, orderedIds: string[]) => void
  setLayerVisibility: (id: string, visible: boolean) => void
  setLayerLock: (id: string, locked: boolean) => void
  setLayerOpacity: (id: string, opacity: number) => void
  renameLayer: (id: string, name: string) => void
  updateLayerTransform: (id: string, transform: LayerTransform) => void
  updateLayerData: (id: string, patch: Record<string, unknown>) => void

  // Edição fotográfica (somente camadas de imagem)
  updateAdjustment: <K extends keyof PhotoAdjustments>(layerId: string, key: K, value: PhotoAdjustments[K]) => void
  updateAdjustments: (layerId: string, patch: Partial<PhotoAdjustments>) => void
  updateColorGrading: (layerId: string, next: ColorGrading) => void
  updateHslMixer: (layerId: string, next: HSLMixer) => void
  updateToneCurves: (layerId: string, next: ToneCurves) => void
  setFilter: (layerId: string, name: PhotoFilterName | null, intensity?: number) => void
  setFilterIntensity: (layerId: string, intensity: number) => void
  /** Cameras Look: aplica um look COMPLETO (ajustes + filtro + texturas) de forma determinística. */
  applyCameraLook: (layerId: string, look: CameraLook) => void
  /** Remove o look de câmera: restaura ajustes/filtro/texturas ao padrão e limpa a tag. */
  clearCameraLook: (layerId: string) => void
  updateCrop: (layerId: string, patch: Partial<CropSettings>) => void

  // Canvas
  setCanvasBackground: (dumpItemId: string, color: CanvasBackground) => void

  // Layout de placeholders (encaixe estilo Stories)
  setPageLayout: (dumpItemId: string, layout: PageLayout | null) => void
  assignImageToSlot: (dumpItemId: string, slotIndex: number, layerId: string) => void
}

function findLayer(project: Project, layerId: string): { di: DumpItem; layer: Layer } | null {
  for (const di of project.dumpItems) {
    const layer = di.layers.find((l) => l.id === layerId)
    if (layer) return { di, layer }
  }
  return null
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => {
    const queueUi = (): void => {
      const ui = get().ui
      if (ui) autosaveClient.enqueue({ kind: 'uiState', projectId: ui.projectId, data: ui })
    }

    return {
      project: null,
      ui: null,

      loadProject: (project, ui) => {
        useHistoryStore.getState().reset()
        set((s) => {
          s.project = project
          s.ui = ui
        })
      },

      setProject: (project) => {
        set((s) => {
          s.project = project
        })
      },

      closeProject: () => {
        useHistoryStore.getState().reset()
        set((s) => {
          s.project = null
          s.ui = null
        })
      },

      captureHistory: () => {
        const { project } = get()
        // O pool de assets é estável; não entra no histórico (apenas a composição).
        if (project) useHistoryStore.getState().capture({ ...project, assets: [] })
      },

      undo: () => {
        const { project } = get()
        if (!project) return
        const prev = useHistoryStore.getState().undo({ ...project, assets: [] })
        if (!prev) return
        const restored = { ...prev, assets: project.assets }
        set((s) => {
          s.project = restored
        })
        void ipc('projects:replaceTree', { project: restored })
      },

      redo: () => {
        const { project } = get()
        if (!project) return
        const next = useHistoryStore.getState().redo({ ...project, assets: [] })
        if (!next) return
        const restored = { ...next, assets: project.assets }
        set((s) => {
          s.project = restored
        })
        void ipc('projects:replaceTree', { project: restored })
      },

      setActiveDumpItem: (id) => {
        set((s) => {
          if (!s.ui) return
          s.ui.activeDumpItemId = id
          s.ui.selectedLayerId = null
          s.ui.selectedLayerIds = []
        })
        queueUi()
      },

      goToDumpItemIndex: (index) => {
        const { project } = get()
        const di = project?.dumpItems[index]
        if (di) get().setActiveDumpItem(di.id)
      },

      selectLayer: (id) => {
        set((s) => {
          if (!s.ui) return
          s.ui.selectedLayerId = id
          s.ui.selectedLayerIds = id ? [id] : []
        })
        queueUi()
      },

      toggleSelection: (id) => {
        set((s) => {
          if (!s.ui) return
          const set2 = new Set(s.ui.selectedLayerIds)
          if (set2.has(id)) set2.delete(id)
          else set2.add(id)
          s.ui.selectedLayerIds = [...set2]
          s.ui.selectedLayerId = s.ui.selectedLayerIds[s.ui.selectedLayerIds.length - 1] ?? null
        })
        queueUi()
      },

      setSelection: (ids) => {
        set((s) => {
          if (!s.ui) return
          s.ui.selectedLayerIds = ids
          s.ui.selectedLayerId = ids[ids.length - 1] ?? null
        })
        queueUi()
      },

      clearSelection: () => {
        set((s) => {
          if (!s.ui) return
          s.ui.selectedLayerId = null
          s.ui.selectedLayerIds = []
        })
        queueUi()
      },

      setActiveRightTab: (tab) => {
        set((s) => {
          if (s.ui) s.ui.activeRightTab = tab
        })
        queueUi()
      },

      setZoom: (zoom) => {
        set((s) => {
          if (s.ui) s.ui.canvasZoom = zoom
        })
        queueUi()
      },

      setPan: (x, y) => {
        set((s) => {
          if (s.ui) {
            s.ui.canvasPanX = x
            s.ui.canvasPanY = y
          }
        })
        queueUi()
      },

      resetView: () => {
        set((s) => {
          if (s.ui) {
            s.ui.canvasZoom = 1
            s.ui.canvasPanX = 0
            s.ui.canvasPanY = 0
          }
        })
        queueUi()
      },

      setQuickMenu: (patch) => {
        set((s) => {
          if (s.ui) Object.assign(s.ui.quickMenu, patch)
        })
        queueUi()
      },

      setFilmstripCollapsed: (collapsed) => {
        set((s) => {
          if (s.ui) s.ui.filmstripCollapsed = collapsed
        })
        queueUi()
      },

      setFilmstripView: (view) => {
        set((s) => {
          if (s.ui) s.ui.filmstripView = view
        })
        queueUi()
      },

      setFilmstripThumbnailSize: (size) => {
        set((s) => {
          if (s.ui) s.ui.filmstripThumbnailSize = size
        })
        queueUi()
      },

      setLeftSidebarCollapsed: (collapsed) => {
        set((s) => {
          if (s.ui) s.ui.leftSidebarCollapsed = collapsed
        })
        queueUi()
      },

      setRightSidebarCollapsed: (collapsed) => {
        set((s) => {
          if (s.ui) s.ui.rightSidebarCollapsed = collapsed
        })
        queueUi()
      },

      setProjectName: (name) => {
        get().captureHistory()
        set((s) => {
          if (s.project) s.project.name = name
        })
        const project = get().project
        if (project) autosaveClient.enqueue({ kind: 'project', id: project.id, data: { name } })
      },

      appendAssets: (assets) => {
        if (assets.length === 0) return
        set((s) => {
          if (s.project) s.project.assets.push(...assets)
        })
      },

      appendDumpItems: (items) => {
        if (items.length === 0) return
        set((s) => {
          if (!s.project) return
          s.project.dumpItems.push(...items)
          if (s.ui && !s.ui.activeDumpItemId) {
            s.ui.activeDumpItemId = items[0].id
          }
        })
      },

      insertDumpItemAfter: (item, afterId) => {
        set((s) => {
          if (!s.project) return
          const idx = afterId ? s.project.dumpItems.findIndex((d) => d.id === afterId) : -1
          if (idx >= 0) s.project.dumpItems.splice(idx + 1, 0, item)
          else s.project.dumpItems.push(item)
          if (s.ui) s.ui.activeDumpItemId = item.id
        })
      },

      removeDumpItemLocal: (id) => {
        set((s) => {
          if (!s.project) return
          const idx = s.project.dumpItems.findIndex((d) => d.id === id)
          if (idx < 0) return
          s.project.dumpItems.splice(idx, 1)
          if (s.ui && s.ui.activeDumpItemId === id) {
            const next = s.project.dumpItems[Math.min(idx, s.project.dumpItems.length - 1)]
            s.ui.activeDumpItemId = next?.id
            s.ui.selectedLayerId = null
            s.ui.selectedLayerIds = []
          }
        })
        queueUi()
      },

      reorderDumpItems: (orderedIds) => {
        get().captureHistory()
        set((s) => {
          if (!s.project) return
          const byId = new Map(s.project.dumpItems.map((d) => [d.id, d]))
          s.project.dumpItems = orderedIds.map((id) => byId.get(id)!).filter(Boolean)
          s.project.dumpItems.forEach((d, i) => (d.orderIndex = i))
        })
        const project = get().project
        if (project) autosaveClient.enqueue({ kind: 'reorderDumpItems', projectId: project.id, orderedIds })
      },

      renameDumpItem: (id, title) => {
        set((s) => {
          const di = s.project?.dumpItems.find((d) => d.id === id)
          if (di) di.title = title
        })
        autosaveClient.enqueue({ kind: 'dumpItem', id, data: { title } })
      },

      appendLayers: (dumpItemId, layers) => {
        if (layers.length === 0) return
        set((s) => {
          const di = s.project?.dumpItems.find((d) => d.id === dumpItemId)
          if (di) di.layers.push(...layers)
        })
      },

      removeLayerLocal: (id) => {
        set((s) => {
          if (!s.project) return
          for (const di of s.project.dumpItems) {
            const idx = di.layers.findIndex((l) => l.id === id)
            if (idx >= 0) {
              di.layers.splice(idx, 1)
              break
            }
          }
          if (s.ui && s.ui.selectedLayerId === id) {
            s.ui.selectedLayerId = null
            s.ui.selectedLayerIds = s.ui.selectedLayerIds.filter((x) => x !== id)
          }
        })
      },

      reorderLayers: (dumpItemId, orderedIds) => {
        get().captureHistory()
        set((s) => {
          const di = s.project?.dumpItems.find((d) => d.id === dumpItemId)
          if (!di) return
          const byId = new Map(di.layers.map((l) => [l.id, l]))
          di.layers = orderedIds.map((id) => byId.get(id)!).filter(Boolean)
          di.layers.forEach((l, i) => (l.orderIndex = i))
        })
        autosaveClient.enqueue({ kind: 'reorderLayers', dumpItemId, orderedIds })
      },

      setLayerVisibility: (id, visible) => {
        get().captureHistory()
        set((s) => {
          const found = s.project && findLayer(s.project, id)
          if (found) found.layer.visible = visible
        })
        autosaveClient.enqueue({ kind: 'layer', id, data: { visible } })
      },

      setLayerLock: (id, locked) => {
        get().captureHistory()
        set((s) => {
          const found = s.project && findLayer(s.project, id)
          if (found) found.layer.locked = locked
        })
        autosaveClient.enqueue({ kind: 'layer', id, data: { locked } })
      },

      setLayerOpacity: (id, opacity) => {
        set((s) => {
          const found = s.project && findLayer(s.project, id)
          if (found) found.layer.opacity = opacity
        })
        autosaveClient.enqueue({ kind: 'layer', id, data: { opacity } })
      },

      renameLayer: (id, name) => {
        get().captureHistory()
        set((s) => {
          const found = s.project && findLayer(s.project, id)
          if (found) found.layer.name = name
        })
        autosaveClient.enqueue({ kind: 'layer', id, data: { name } })
      },

      updateLayerTransform: (id, transform) => {
        set((s) => {
          const found = s.project && findLayer(s.project, id)
          if (found) found.layer.transform = transform
        })
        autosaveClient.enqueue({ kind: 'layer', id, data: { transform } })
      },

      updateLayerData: (id, patch) => {
        set((s) => {
          const found = s.project && findLayer(s.project, id)
          if (found) found.layer.data = { ...found.layer.data, ...patch }
        })
        const found = get().project && findLayer(get().project!, id)
        if (found) autosaveClient.enqueue({ kind: 'layer', id, data: { data: found.layer.data } })
      },

      updateAdjustment: (layerId, key, value) => {
        set((s) => {
          const found = s.project && findLayer(s.project, layerId)
          if (found?.layer.adjustments) found.layer.adjustments[key] = value
        })
        autosaveClient.enqueue({ kind: 'adjustments', layerId, data: { [key]: value } as Partial<PhotoAdjustments> })
      },

      updateAdjustments: (layerId, patch) => {
        get().captureHistory()
        set((s) => {
          const found = s.project && findLayer(s.project, layerId)
          if (found?.layer.adjustments) Object.assign(found.layer.adjustments, patch)
        })
        autosaveClient.enqueue({ kind: 'adjustments', layerId, data: patch })
      },

      updateColorGrading: (layerId, next) => {
        set((s) => {
          const found = s.project && findLayer(s.project, layerId)
          if (found?.layer.adjustments) found.layer.adjustments.colorGrading = next
        })
        autosaveClient.enqueue({ kind: 'adjustments', layerId, data: { colorGrading: next } })
      },

      updateHslMixer: (layerId, next) => {
        set((s) => {
          const found = s.project && findLayer(s.project, layerId)
          if (found?.layer.adjustments) found.layer.adjustments.hslMixer = next
        })
        autosaveClient.enqueue({ kind: 'adjustments', layerId, data: { hslMixer: next } })
      },

      updateToneCurves: (layerId, next) => {
        set((s) => {
          const found = s.project && findLayer(s.project, layerId)
          if (found?.layer.adjustments) found.layer.adjustments.toneCurves = next
        })
        autosaveClient.enqueue({ kind: 'adjustments', layerId, data: { toneCurves: next } })
      },

      setFilter: (layerId, name, intensity = 100) => {
        get().captureHistory()
        const filter: PhotoFilter = { name, intensity }
        set((s) => {
          const found = s.project && findLayer(s.project, layerId)
          if (found?.layer.filter) found.layer.filter = filter
        })
        autosaveClient.enqueue({ kind: 'filter', layerId, data: filter })
      },

      setFilterIntensity: (layerId, intensity) => {
        set((s) => {
          const found = s.project && findLayer(s.project, layerId)
          if (found?.layer.filter) found.layer.filter.intensity = intensity
        })
        autosaveClient.enqueue({ kind: 'filter', layerId, data: { intensity } })
      },

      applyCameraLook: (layerId, look) => {
        get().captureHistory()
        // Look determinístico: parte SEMPRE dos defaults (reset) e sobrepõe o look da câmera.
        // structuredClone evita compartilhar/congelar os objetos aninhados de DEFAULT_ADJUSTMENTS.
        const fullAdj = structuredClone({ ...DEFAULT_ADJUSTMENTS, ...look.adjustments }) as PhotoAdjustments
        const filter: PhotoFilter = look.filter ? { ...look.filter } : { name: null, intensity: 100 }
        const shaders: ShaderEffects = { ...DEFAULT_SHADERS, ...look.shaders }
        set((s) => {
          const found = s.project && findLayer(s.project, layerId)
          if (!found) return
          found.layer.adjustments = fullAdj
          found.layer.filter = filter
          const data = found.layer.data as ImageLayerData
          data.shaders = shaders
          data.cameraLook = look.id
        })
        const found = get().project && findLayer(get().project!, layerId)
        if (found) {
          // 3 patches (mesclados pelo autosaveClient) — carregam o look nas abas Filtros/Texturas.
          autosaveClient.enqueue({ kind: 'adjustments', layerId, data: fullAdj })
          autosaveClient.enqueue({ kind: 'filter', layerId, data: filter })
          autosaveClient.enqueue({ kind: 'layer', id: layerId, data: { data: found.layer.data } })
        }
      },

      clearCameraLook: (layerId) => {
        get().captureHistory()
        const fullAdj = structuredClone(DEFAULT_ADJUSTMENTS) as PhotoAdjustments
        const filter: PhotoFilter = { name: null, intensity: 100 }
        const shaders: ShaderEffects = { ...DEFAULT_SHADERS }
        set((s) => {
          const found = s.project && findLayer(s.project, layerId)
          if (!found) return
          found.layer.adjustments = fullAdj
          found.layer.filter = filter
          const data = found.layer.data as ImageLayerData
          data.shaders = shaders
          delete data.cameraLook
        })
        const found = get().project && findLayer(get().project!, layerId)
        if (found) {
          autosaveClient.enqueue({ kind: 'adjustments', layerId, data: fullAdj })
          autosaveClient.enqueue({ kind: 'filter', layerId, data: filter })
          autosaveClient.enqueue({ kind: 'layer', id: layerId, data: { data: found.layer.data } })
        }
      },

      updateCrop: (layerId, patch) => {
        set((s) => {
          const found = s.project && findLayer(s.project, layerId)
          if (found?.layer.crop) Object.assign(found.layer.crop, patch)
        })
        autosaveClient.enqueue({ kind: 'crop', layerId, data: patch })
      },

      setCanvasBackground: (dumpItemId, color) => {
        get().captureHistory()
        set((s) => {
          const di = s.project?.dumpItems.find((d) => d.id === dumpItemId)
          if (di) di.canvas.backgroundColor = color
        })
        autosaveClient.enqueue({ kind: 'canvas', dumpItemId, data: { backgroundColor: color } })
      },

      setPageLayout: (dumpItemId, layout) => {
        get().captureHistory()
        set((s) => {
          const di = s.project?.dumpItems.find((d) => d.id === dumpItemId)
          if (!di) return
          di.canvas.layout = layout
          const imgs = di.layers
            .filter((l) => l.type === 'image')
            .sort((a, b) => a.orderIndex - b.orderIndex)
          imgs.forEach((layer, i) => {
            const data = layer.data as ImageLayerData
            if (layout && i < layout.slots.length) {
              const slot = layout.slots[i]
              const tr = slotRectToTransform(slot, di.canvas, layout.gutter)
              layer.transform = { ...layer.transform, x: tr.x, y: tr.y, width: tr.width, height: tr.height, rotation: tr.rotation }
              data.slotIndex = i
              if (layer.crop) {
                layer.crop.aspectRatio = 'free'
                layer.crop.rect = slot.seam
                  ? seamCropForSlot(data.originalWidth, data.originalHeight, tr.width, tr.height, slot.seam[0], slot.seam[1])
                  : coverCropForSlot(data.originalWidth, data.originalHeight, tr.width, tr.height)
              }
            } else {
              // sem layout, ou imagem excedente → volta a ser livre
              delete data.slotIndex
            }
          })
        })
        autosaveClient.enqueue({ kind: 'canvas', dumpItemId, data: { layout } })
        const di = get().project?.dumpItems.find((d) => d.id === dumpItemId)
        if (di) {
          for (const layer of di.layers) {
            if (layer.type !== 'image') continue
            autosaveClient.enqueue({ kind: 'layer', id: layer.id, data: { transform: layer.transform, data: layer.data } })
            if (layer.crop) autosaveClient.enqueue({ kind: 'crop', layerId: layer.id, data: { aspectRatio: layer.crop.aspectRatio, rect: layer.crop.rect } })
          }
        }
      },

      assignImageToSlot: (dumpItemId, slotIndex, layerId) => {
        set((s) => {
          const di = s.project?.dumpItems.find((d) => d.id === dumpItemId)
          const layout = di?.canvas.layout
          if (!di || !layout || slotIndex >= layout.slots.length) return
          // Libera o ocupante anterior do slot (vira livre), exceto a própria camada.
          for (const l of di.layers) {
            if (l.type !== 'image') continue
            const d = l.data as ImageLayerData
            if (d.slotIndex === slotIndex && l.id !== layerId) delete d.slotIndex
          }
          const layer = di.layers.find((l) => l.id === layerId)
          if (!layer || layer.type !== 'image') return
          const data = layer.data as ImageLayerData
          const slot = layout.slots[slotIndex]
          const tr = slotRectToTransform(slot, di.canvas, layout.gutter)
          layer.transform = { ...layer.transform, x: tr.x, y: tr.y, width: tr.width, height: tr.height, rotation: tr.rotation }
          data.slotIndex = slotIndex
          if (layer.crop) {
            layer.crop.aspectRatio = 'free'
            layer.crop.rect = slot.seam
              ? seamCropForSlot(data.originalWidth, data.originalHeight, tr.width, tr.height, slot.seam[0], slot.seam[1])
              : coverCropForSlot(data.originalWidth, data.originalHeight, tr.width, tr.height)
          }
        })
        const di = get().project?.dumpItems.find((d) => d.id === dumpItemId)
        if (di) {
          for (const l of di.layers) {
            if (l.type !== 'image') continue
            autosaveClient.enqueue({ kind: 'layer', id: l.id, data: { transform: l.transform, data: l.data } })
            if (l.crop) autosaveClient.enqueue({ kind: 'crop', layerId: l.id, data: { aspectRatio: l.crop.aspectRatio, rect: l.crop.rect } })
          }
        }
      }
    }
  })
)

// Selectors
export const selectActiveDumpItem = (s: EditorState): DumpItem | null => {
  if (!s.project || !s.ui?.activeDumpItemId) return s.project?.dumpItems[0] ?? null
  return s.project.dumpItems.find((d) => d.id === s.ui!.activeDumpItemId) ?? s.project.dumpItems[0] ?? null
}

export const selectActiveIndex = (s: EditorState): number => {
  if (!s.project) return -1
  const active = selectActiveDumpItem(s)
  return active ? s.project.dumpItems.findIndex((d) => d.id === active.id) : -1
}

export const selectSelectedLayer = (s: EditorState): Layer | null => {
  const id = s.ui?.selectedLayerId
  if (!s.project || !id) return null
  return findLayer(s.project, id)?.layer ?? null
}
