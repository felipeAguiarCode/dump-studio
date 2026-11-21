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
export class AutosaveClient {
  private pending = new Map<string, AutosavePatch>()
  private timer: ReturnType<typeof setTimeout> | null = null
  private inFlight: Promise<boolean> | null = null

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
    await this.flushBatch()
  }

  /** Wait for every pending and in-flight save before a structural change. */
  async drain(): Promise<void> {
    while (this.inFlight || this.pending.size > 0) {
      if (!await this.flushBatch()) throw new Error('Pending edits could not be saved')
    }
  }

  private flushBatch(): Promise<boolean> {
    if (this.inFlight) return this.inFlight
    if (this.pending.size === 0) return Promise.resolve(true)
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    const batch = [...this.pending.values()]
    this.pending.clear()
    useUiStore.getState().setSaveStatus('saving')

    const work = (async (): Promise<boolean> => {
      try {
        const { savedAt } = await ipc('autosave:patch', batch)
        useUiStore.getState().setSaveStatus('saved', savedAt)
        if (this.pending.size > 0) this.schedule()
        return true
      } catch {
        for (const patch of batch) {
          const key = keyOf(patch)
          const newer = this.pending.get(key)
          this.pending.set(key, newer ? merge(patch, newer) : patch)
        }
        useUiStore.getState().setSaveStatus('error')
        setTimeout(() => void this.flush(), RETRY_MS)
        return false
      } finally {
        this.inFlight = null
      }
    })()
    this.inFlight = work
    return work
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
