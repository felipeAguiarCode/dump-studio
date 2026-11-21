import type { CreateProjectInput } from '@shared/ipc/contract'
import type { Layer, LayerType } from '@shared/types'
import { ipc } from './ipcClient'
import { useEditorStore } from '../stores/editorStore'
import { useUiStore } from '../stores/uiStore'
import { autosaveClient } from './autosaveClient'
import { t } from '../i18n'

/** Área de transferência de camadas (sessão). */
let clipboard: Layer[] = []
const clone = <T,>(v: T): T => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)))

/**
 * Ações de alto nível: orquestram IPC (persistência canônica) + store (memória).
 * Componentes chamam estas funções; nunca falam IPC estrutural direto.
 */

async function hydrate(projectId: string): Promise<void> {
  const [project, ui] = await Promise.all([
    ipc('projects:open', { id: projectId }),
    ipc('uiState:get', { projectId })
  ])
  useEditorStore.getState().loadProject(project, ui)
}

export const projectActions = {
  async createProject(input: CreateProjectInput): Promise<string> {
    const project = await ipc('projects:create', input)
    await hydrate(project.id)
    useUiStore.getState().setView('editor')
    return project.id
  },

  async openProject(id: string): Promise<void> {
    await hydrate(id)
    useUiStore.getState().setView('editor')
  },

  closeProject(): void {
    // Garante que pendências de autosave sejam gravadas antes de sair do editor.
    void autosaveClient.flush()
    useEditorStore.getState().closeProject()
    useUiStore.getState().setView('home')
  },

  async setFormat(format: import('@shared/constants').InstagramFormat): Promise<void> {
    const editor = useEditorStore.getState()
    if (!editor.project || editor.project.format === format) return
    const ui = useUiStore.getState()
    if (ui.formatChanging) return
    ui.setFormatChanging(true)
    try {
      await autosaveClient.drain()
      const current = useEditorStore.getState()
      if (!current.project) return
      const updated = await ipc('projects:setFormat', { id: current.project.id, format })
      current.captureHistory()
      current.setProject(updated)
      current.resetView()
      ui.pushToast('success', t('topbar.formatChanged'))
    } catch (error) {
      console.error('[format] could not resize project:', error)
      ui.pushToast('error', t('topbar.formatFailed'))
    } finally {
      ui.setFormatChanging(false)
    }
  },

  /** Abre o seletor e importa fotos para o POOL do projeto. */
  async importPhotos(): Promise<void> {
    const paths = await ipc('assets:pickFiles')
    if (paths.length === 0) return
    await this.importFromPaths(paths)
  },

  /** Importa fotos (por caminho) para o POOL do projeto. Não cria páginas. */
  async importFromPaths(paths: string[]): Promise<void> {
    const editor = useEditorStore.getState()
    const ui = useUiStore.getState()
    const project = editor.project
    if (!project || paths.length === 0) return
    try {
      const res = await ipc('assets:importToPool', { projectId: project.id, paths })
      const existing = new Set(project.assets.map((a) => a.id))
      editor.appendAssets(res.assets.filter((a) => !existing.has(a.id)))
      const parts = [t.plural('toasts.importedToPool', res.imported)]
      if (res.deduped > 0) parts.push(t.plural('toasts.alreadyExisting', res.deduped))
      ui.pushToast('success', parts.join(' · '))
    } catch (e) {
      ui.pushToast('error', t('toasts.importFailed', { error: (e as Error).message }))
    }
  },

  /** Adiciona uma camada de imagem a partir de um asset do pool (clique ou drop no canvas). */
  async addImageFromAsset(
    dumpItemId: string,
    assetId: string,
    position?: { x: number; y: number },
    opts?: { captureHistory?: boolean }
  ): Promise<void> {
    const editor = useEditorStore.getState()
    if (opts?.captureHistory !== false) editor.captureHistory()
    const layer = await ipc('layers:add', { dumpItemId, type: 'image', assetId, position })
    editor.appendLayers(dumpItemId, [layer])
    editor.selectLayer(layer.id)
  },

  /** Encaixa um asset do pool num slot do layout ativo (drop ou clique). Um passo de histórico. */
  async assignAssetToSlot(dumpItemId: string, assetId: string, slotIndex: number): Promise<void> {
    const editor = useEditorStore.getState()
    editor.captureHistory()
    const layer = await ipc('layers:add', { dumpItemId, type: 'image', assetId })
    editor.appendLayers(dumpItemId, [layer])
    editor.assignImageToSlot(dumpItemId, slotIndex, layer.id)
    editor.selectLayer(layer.id)
  },

  /**
   * Sem páginas ainda: cria a primeira página e já adiciona a foto.
   * Acionado ao soltar (ou clicar) uma foto do pool quando o projeto não tem páginas.
   * O fundo segue o padrão do canvas (createCanvasSettings). Único passo de histórico.
   */
  async addImageToNewPage(assetId: string, position?: { x: number; y: number }): Promise<void> {
    const editor = useEditorStore.getState()
    const project = editor.project
    if (!project) return
    editor.captureHistory()
    const item = await ipc('dumpItems:add', { projectId: project.id })
    editor.insertDumpItemAfter(item)
    await this.addImageFromAsset(item.id, assetId, position, { captureHistory: false })
  },

  async addBlankDumpItem(afterId?: string): Promise<void> {
    const editor = useEditorStore.getState()
    if (!editor.project) return
    editor.captureHistory()
    const item = await ipc('dumpItems:add', { projectId: editor.project.id, afterId })
    editor.insertDumpItemAfter(item, afterId)
  },

  async duplicateDumpItem(id: string): Promise<void> {
    const editor = useEditorStore.getState()
    editor.captureHistory()
    const item = await ipc('dumpItems:duplicate', { id })
    editor.insertDumpItemAfter(item, id)
  },

  async deleteDumpItem(id: string): Promise<void> {
    const editor = useEditorStore.getState()
    editor.captureHistory()
    await ipc('dumpItems:delete', { id })
    editor.removeDumpItemLocal(id)
  },

  async addLayer(input: {
    dumpItemId: string
    type: LayerType
    assetId?: string
    name?: string
    data?: Record<string, unknown>
    transform?: Partial<{ x: number; y: number; width: number; height: number; rotation: number; scaleX: number; scaleY: number }>
  }): Promise<Layer> {
    const editor = useEditorStore.getState()
    editor.captureHistory()
    const layer = await ipc('layers:add', input)
    editor.appendLayers(input.dumpItemId, [layer])
    editor.selectLayer(layer.id)
    return layer
  },

  async duplicateLayer(id: string): Promise<void> {
    const editor = useEditorStore.getState()
    editor.captureHistory()
    const layer = await ipc('layers:duplicate', { id })
    editor.appendLayers(layer.dumpItemId, [layer])
    editor.selectLayer(layer.id)
  },

  async deleteLayer(id: string): Promise<void> {
    const editor = useEditorStore.getState()
    editor.captureHistory()
    await ipc('layers:delete', { id })
    editor.removeLayerLocal(id)
  },

  /** Ctrl+C — copia as camadas selecionadas (exceto o fundo). */
  copySelection(): void {
    const editor = useEditorStore.getState()
    const project = editor.project
    const ids = editor.ui?.selectedLayerIds ?? []
    if (!project || ids.length === 0) return
    const layers = project.dumpItems
      .flatMap((d) => d.layers)
      .filter((l) => ids.includes(l.id) && l.type !== 'background')
    if (layers.length === 0) return
    clipboard = layers.map((l) => clone(l))
    useUiStore.getState().pushToast('info', t.plural('toasts.layersCopied', clipboard.length))
  },

  /** Ctrl+V — cola as camadas na página ativa. */
  async pasteClipboard(): Promise<void> {
    const editor = useEditorStore.getState()
    if (clipboard.length === 0) return
    const dumpItemId = editor.ui?.activeDumpItemId
    if (!dumpItemId) return
    editor.captureHistory()
    const created = await ipc('layers:paste', { dumpItemId, layers: clipboard })
    if (created.length > 0) {
      editor.appendLayers(dumpItemId, created)
      editor.setSelection(created.map((l) => l.id))
    }
  },

  async createSnapshot(name: string): Promise<void> {
    const editor = useEditorStore.getState()
    const project = editor.project
    if (!project) return
    const active = project.dumpItems.find((d) => d.id === editor.ui?.activeDumpItemId) ?? project.dumpItems[0]
    let thumbnailDataUrl: string | undefined
    if (active) {
      try {
        const { composeDumpItem } = await import('../../engine/render/exportRenderer')
        thumbnailDataUrl = await composeDumpItem(active, { format: 'jpg', quality: 55 })
      } catch {
        /* sem thumbnail */
      }
    }
    await ipc('snapshots:create', { projectId: project.id, name, thumbnailDataUrl })
    useUiStore.getState().pushToast('success', t('toasts.snapshotSaved'))
  },

  async restoreSnapshot(snapshotId: string): Promise<void> {
    const editor = useEditorStore.getState()
    const ui = editor.ui
    const project = await ipc('snapshots:restore', { snapshotId })
    const validActive =
      project.dumpItems.find((d) => d.id === ui?.activeDumpItemId)?.id ?? project.dumpItems[0]?.id
    editor.loadProject(project, {
      ...(ui ?? { projectId: project.id }),
      activeDumpItemId: validActive,
      selectedLayerId: null,
      selectedLayerIds: []
    } as Parameters<typeof editor.loadProject>[1])
    useUiStore.getState().pushToast('info', t('toasts.snapshotRestored'))
  }
}
