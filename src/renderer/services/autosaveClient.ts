import type { AutosavePatch } from '@shared/ipc/contract'
import { ipc } from './ipcClient'
import { useUiStore } from '../stores/uiStore'

const DEBOUNCE_MS = 400
const RETRY_MS = 1500

/**
 * Serviço central de autosave (não espalhado em componentes).
 * - Coalescing por chave: edições repetidas no mesmo alvo/campo fundem-se.
 * - Debounce para sliders; flush imediato para mudanças estruturais.
 * - Fila persistente + retry: um patch nunca é descartado em falha.
 */
class AutosaveClient {
  private pending = new Map<string, AutosavePatch>()
  private timer: ReturnType<typeof setTimeout> | null = null
  private inFlight = false

  enqueue(patch: AutosavePatch, opts?: { immediate?: boolean }): void {
    const key = keyOf(patch)
    const existing = this.pending.get(key)
    this.pending.set(key, existing ? merge(existing, patch) : patch)
    if (opts?.immediate) {
      void this.flush()
    } else {
      this.schedule()
    }
  }

  private schedule(): void {
    if (this.timer) return
    this.timer = setTimeout(() => {
      this.timer = null
      void this.flush()
    }, DEBOUNCE_MS)
  }

  async flush(): Promise<void> {
    if (this.inFlight) return
    if (this.pending.size === 0) return
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    const batch = [...this.pending.values()]
    this.pending.clear()
    this.inFlight = true
    useUiStore.getState().setSaveStatus('saving')

    try {
      const { savedAt } = await ipc('autosave:patch', batch)
      this.inFlight = false
      useUiStore.getState().setSaveStatus('saved', savedAt)
      // Se chegaram patches durante o envio, agenda novamente.
      if (this.pending.size > 0) this.schedule()
    } catch {
      this.inFlight = false
      // Recoloca os patches no início da fila (sem sobrescrever os mais novos).
      for (const patch of batch) {
        const key = keyOf(patch)
        const newer = this.pending.get(key)
        this.pending.set(key, newer ? merge(patch, newer) : patch)
      }
      useUiStore.getState().setSaveStatus('error')
      setTimeout(() => void this.flush(), RETRY_MS)
    }
  }
}

function keyOf(p: AutosavePatch): string {
  switch (p.kind) {
    case 'project':
      return `project:${p.id}`
    case 'dumpItem':
      return `dumpItem:${p.id}`
    case 'canvas':
      return `canvas:${p.dumpItemId}`
    case 'layer':
      return `layer:${p.id}`
    case 'adjustments':
      return `adjustments:${p.layerId}`
    case 'filter':
      return `filter:${p.layerId}`
    case 'crop':
      return `crop:${p.layerId}`
    case 'uiState':
      return `uiState:${p.projectId}`
    case 'exportSettings':
      return `exportSettings:${p.projectId}`
    case 'reorderDumpItems':
      return `reorderDumpItems:${p.projectId}`
    case 'reorderLayers':
      return `reorderLayers:${p.dumpItemId}`
  }
}

function merge(a: AutosavePatch, b: AutosavePatch): AutosavePatch {
  if ('orderedIds' in a && 'orderedIds' in b) {
    return { ...a, orderedIds: b.orderedIds } as AutosavePatch
  }
  if ('data' in a && 'data' in b) {
    const aData = a.data as Record<string, unknown>
    const bData = b.data as Record<string, unknown>
    const mergedData: Record<string, unknown> = { ...aData, ...bData }
    if ('quickMenu' in aData || 'quickMenu' in bData) {
      mergedData.quickMenu = {
        ...((aData.quickMenu as object) ?? {}),
        ...((bData.quickMenu as object) ?? {})
      }
    }
    return { ...a, data: mergedData } as AutosavePatch
  }
  return b
}

export const autosaveClient = new AutosaveClient()
