import type { PhotoLook } from '@shared/types'
import { capturePhotoLook } from '@shared/photoPresets'
import { useEditorStore, selectActiveDumpItem } from '../stores/editorStore'
import { usePresetLibraryStore } from '../stores/presetLibraryStore'
import { useUiStore } from '../stores/uiStore'
import { autosaveClient } from './autosaveClient'
import { ipc } from './ipcClient'
import { t } from '../i18n'

export function presetTarget() {
  const state = useEditorStore.getState(), item = selectActiveDumpItem(state)
  if (!item) return null
  const selected = item.layers.find((l) => l.id === state.ui?.selectedLayerId)
  const ownerId = selected?.type === 'overlay' ? (selected.data as { imageLayerId?: string }).imageLayerId : null
  const photos = item.layers.filter((l) => l.type === 'image')
  const image = selected?.type === 'image' ? selected : photos.find((l) => l.id === ownerId) ?? (photos.length === 1 ? photos[0] : null)
  return image ? { item, image } : null
}

async function editing<T>(action: () => Promise<T>): Promise<T | undefined> {
  const ui = useUiStore.getState()
  if (ui.applyingPreset || ui.formatChanging) return
  ui.setApplyingPreset(true)
  try { await autosaveClient.drain(); return await action() }
  catch (error) { console.error('[presets]', error); ui.pushToast('error', t('presetLibrary.failed')); return undefined }
  finally { ui.setApplyingPreset(false) }
}

export const presetActions = {
  openLibrary(save = false): void {
    const editor = useEditorStore.getState()
    if (!editor.project || !editor.ui) return
    editor.setRightSidebarCollapsed(false)
    editor.setActiveRightTab('presets')
    useUiStore.getState().setPresetSaveRequested(save)
  },
  async importJson(folderId: string | null, clipboard = false): Promise<void> {
    const count = clipboard ? await ipc('presets:importClipboard', { folderId }) : await ipc('presets:import', { folderId })
    if (count === null) return
    await usePresetLibraryStore.getState().load()
    useUiStore.getState().pushToast('success', t('presetLibrary.imported', { count }))
  },
  async exportJson(input: { presetId?: string; folderId?: string | null }): Promise<void> {
    if (await ipc('presets:export', input)) useUiStore.getState().pushToast('success', t('presetLibrary.exported'))
  },
  async save(name: string, folderId: string | null, fxIds: string[], favorite = false): Promise<boolean> {
    return await editing(async () => {
      const target = presetTarget()
      if (!target) throw new Error('No photo selected')
      const result = await ipc('presets:save', { name, folderId, fxIds, favorite, dumpItemId: target.item.id, layerId: target.image.id })
      useEditorStore.getState().replaceDumpItem(result.item)
      await usePresetLibraryStore.getState().load()
      usePresetLibraryStore.getState().setActive(result.preset.id)
      useUiStore.getState().pushToast('success', t('presetLibrary.saved'))
      return true
    }) ?? false
  },
  async apply(look: PhotoLook, presetId?: string, expected?: { itemId: string; layerId: string }): Promise<boolean> {
    return await editing(async () => {
      const target = presetTarget()
      if (!target) throw new Error('No photo selected')
      if (expected && (target.item.id !== expected.itemId || target.image.id !== expected.layerId)) {
        throw new Error('The preview target changed')
      }
      const item = await ipc('presets:apply', { dumpItemId: target.item.id, layerId: target.image.id, look })
      const editor = useEditorStore.getState()
      editor.captureHistory()
      editor.replaceDumpItem(item)
      editor.selectLayer(target.image.id)
      usePresetLibraryStore.getState().setActive(presetId ?? null)
      return true
    }) ?? false
  },
  async copyCurrent(): Promise<void> {
    const target = presetTarget()
    if (!target) return
    const selected = new Set(useEditorStore.getState().ui?.selectedLayerIds ?? [])
    const fxIds = target.item.layers.filter((l) => l.type === 'overlay' && l.visible &&
      ((l.data as { imageLayerId?: string }).imageLayerId === target.image.id || (selected.has(l.id) && !(l.data as { imageLayerId?: string }).imageLayerId))).map((l) => l.id)
    await this.copy(target.image.name.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 120) || t('presetLibrary.newPreset'), capturePhotoLook(target.item, target.image.id, fxIds))
  },
  async copy(name: string, look: PhotoLook): Promise<void> {
    try { await ipc('presets:copy', { name, look }); useUiStore.getState().pushToast('success', t('presetLibrary.copied')) }
    catch (error) { console.error('[presets]', error); useUiStore.getState().pushToast('error', t('presetLibrary.failed')) }
  },
  async paste(): Promise<void> {
    try { const { look } = await ipc('presets:clipboard'); await this.apply(look) }
    catch (error) { console.error('[presets]', error); useUiStore.getState().pushToast('error', t('presetLibrary.invalidClipboard')) }
  }
}
