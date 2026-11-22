import { ipcRenderer } from 'electron'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppShell } from '../../src/renderer/features/shell/AppShell'
import { ConfirmDialog } from '../../src/renderer/features/dialogs/ConfirmDialog'
import { ToastSystem } from '../../src/renderer/features/feedback/ToastSystem'
import { useEditorStore } from '../../src/renderer/stores/editorStore'
import { usePreferencesStore } from '../../src/renderer/stores/preferencesStore'
import { usePresetLibraryStore } from '../../src/renderer/stores/presetLibraryStore'
import { useHistoryStore } from '../../src/renderer/stores/historyStore'
import { useUiStore } from '../../src/renderer/stores/uiStore'
import { autosaveClient } from '../../src/renderer/services/autosaveClient'
import { presetTarget } from '../../src/renderer/services/presetActions'

Object.assign(window, { noir: { invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args), getPathForFile: () => '', on: () => () => {} } })
const check = (value: unknown, message: string): void => { if (!value) throw new Error(message) }
const pause = (ms = 30): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))
async function wait(condition: () => boolean): Promise<void> {
  for (let i = 0; i < 250; i++) { if (condition()) return; await pause() }
  throw new Error('Preset UI update timed out')
}
async function click(text: string): Promise<void> {
  await wait(() => [...document.querySelectorAll<HTMLButtonElement>('button')].some((b) => b.textContent?.trim() === text && !b.disabled))
  const button = [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.trim() === text)
  check(button && !button.disabled, `Missing or disabled button: ${text}`); button!.click()
}
async function aria(label: string): Promise<void> {
  await wait(() => [...document.querySelectorAll<HTMLButtonElement>('button')].some((b) => b.getAttribute('aria-label') === label && !b.disabled))
  const button = [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.getAttribute('aria-label') === label)
  check(button && !button.disabled, `Missing or disabled action: ${label}`); button!.click()
}
async function input(value: string): Promise<void> {
  const element = document.querySelector<HTMLInputElement>('[data-testid="preset-form"] input:not([type="checkbox"])')!
  check(element, 'Preset form name is missing')
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, value)
  element.dispatchEvent(new Event('input', { bubbles: true }))
  await pause()
}
async function submit(): Promise<void> {
  document.querySelector<HTMLFormElement>('[data-testid="preset-form"]')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  await wait(() => !document.querySelector('[data-testid="preset-form"]'))
}
async function persistedExposure(value: number): Promise<void> {
  const id = presetTarget()!.image.id
  for (let i = 0; i < 100; i++) {
    const project = await ipcRenderer.invoke('preset-check:project')
    if (project.dumpItems.flatMap((p) => p.layers).find((l) => l.id === id)?.adjustments.exposure === value) return
    await pause()
  }
  throw new Error(`Exposure ${value} was not persisted`)
}

async function run(): Promise<void> {
  const fixture = await ipcRenderer.invoke('preset-check:fixture')
  await usePreferencesStore.getState().load()
  useEditorStore.getState().loadProject(fixture.project, fixture.ui)
  useUiStore.getState().setView('editor')
  createRoot(document.getElementById('root')!).render(<><AppShell /><ConfirmDialog /><ToastSystem /></>)
  await wait(() => !!document.querySelector('[data-testid="preset-panel"]') && usePresetLibraryStore.getState().presets.length > 0 && !usePresetLibraryStore.getState().loading)
  useEditorStore.getState().setActiveRightTab('filters')
  await wait(() => !!document.querySelector('[data-testid="preset-quick-actions"]'))
  await ipcRenderer.invoke('preset-check:capture', 'presets-quick-actions')
  await click('Salvar preset'); await wait(() => !!document.querySelector('[data-testid="preset-form"]'))
  await click('Cancelar'); await wait(() => !document.querySelector('[data-testid="preset-form"]'))
  await aria('Nova pasta'); await wait(() => !!document.querySelector('[data-testid="preset-form"]'))
  await input('Favoritos UI'); await submit()
  const parent = usePresetLibraryStore.getState().folders.find((f) => f.name === 'Favoritos UI')!
  check(parent, 'Folder was not created by the real form')
  await aria('Nova pasta'); await wait(() => !!document.querySelector('[data-testid="preset-form"]'))
  await input('Cinema UI'); await submit()
  const folder = usePresetLibraryStore.getState().folders.find((f) => f.name === 'Cinema UI')!
  check(folder.parentId === parent.id, 'Subfolder did not retain its parent')
  await click('Salvar preset'); await wait(() => !!document.querySelector('[data-testid="preset-form"]'))
  check(document.querySelectorAll('[data-testid="preset-form"] input[type="checkbox"]:checked').length === 2, 'Linked FX were not selected for saving')
  const favoriteCheckbox = [...document.querySelectorAll<HTMLInputElement>('[data-testid="preset-form"] input[type="checkbox"]')].find((element) => element.parentElement?.textContent?.includes('Adicionar aos favoritos'))!
  check(favoriteCheckbox, 'Favorite option is missing from the save dialog'); favoriteCheckbox.click(); await pause()
  await input('Look de teste UI')
  await ipcRenderer.invoke('preset-check:capture', 'preset-save-dialog')
  await submit()
  let preset = usePresetLibraryStore.getState().presets.find((p) => p.name === 'Look de teste UI')!
  check(preset && preset.folderId === folder.id && preset.look.fx.length === 2, 'Save form lost settings, folder or FX')
  check(preset.favorite, 'Favorite was not persisted when saving')
  await aria('Remover Look de teste UI dos favoritos'); await wait(() => !usePresetLibraryStore.getState().presets.find((p) => p.id === preset.id)!.favorite)
  await aria('Adicionar Look de teste UI aos favoritos'); await wait(() => usePresetLibraryStore.getState().presets.find((p) => p.id === preset.id)!.favorite)
  const favoritesButton = [...document.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.startsWith('Favoritos'))!
  favoritesButton.click(); await pause()
  check(document.querySelectorAll('[data-testid="preset-list"] button[aria-label^="Aplicar "]').length === usePresetLibraryStore.getState().presets.filter((p) => p.favorite).length, 'Favorites filter shows nonfavorite presets')
  favoritesButton.click(); await pause()
  await aria('Ações de Look de teste UI')
  await wait(() => [...document.querySelectorAll('button')].some((b) => b.textContent?.trim() === 'Renomear / mover'))
  await click('Renomear / mover')
  await wait(() => !!document.querySelector('[data-testid="preset-form"]'))
  await input('Cinema pessoal')
  const select = document.querySelector<HTMLSelectElement>('[data-testid="preset-form"] select')!
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(select, parent.id)
  select.dispatchEvent(new Event('change', { bubbles: true })); await pause(); await submit()
  preset = usePresetLibraryStore.getState().presets.find((p) => p.name === 'Cinema pessoal')!
  check(preset.folderId === parent.id, 'Rename/move did not persist')
  usePresetLibraryStore.getState().setFolder(null)
  await pause()
  const target = presetTarget()!, photoId = target.image.id
  const crop = JSON.stringify(target.image.crop), geometry = JSON.stringify(target.image.transform), assetId = (target.image.data as { assetId: string }).assetId
  useEditorStore.getState().captureHistory()
  useEditorStore.getState().updateAdjustment(photoId, 'exposure', -35)
  useEditorStore.getState().setFilter(photoId, 'noir')
  const steps = useHistoryStore.getState().past.length
  await persistedExposure(-35)
  const previewImage = (): string | undefined => document.querySelector<HTMLImageElement>('[data-testid="preset-preview"] img')?.src
  const previewedProject = JSON.stringify(useEditorStore.getState().project)
  await aria('Prévia de Cinema pessoal')
  await wait(() => !!previewImage())
  const after = previewImage()
  await click('Antes')
  await wait(() => !!previewImage() && previewImage() !== after)
  const before = previewImage()
  await click('Showcase')
  await wait(() => previewImage() === before)
  const currentStage = (): string | undefined | null => document.querySelector('[data-testid="preset-preview"] [aria-current="step"]')?.textContent
  await wait(() => currentStage() === 'Filtro')
  await aria('Pausar Showcase')
  await aria('Próxima etapa')
  await wait(() => currentStage() === 'Câmera e ajustes' && !!previewImage())
  await aria('Próxima etapa')
  await wait(() => currentStage() === 'FX')
  await wait(() => previewImage() === after)
  check(previewedProject === JSON.stringify(useEditorStore.getState().project), 'Preview modified the project')
  check(useHistoryStore.getState().past.length === steps, 'Preview added undo entries')
  await persistedExposure(-35)
  await ipcRenderer.invoke('preset-check:capture', 'presets-showcase')
  await click('Aplicar preset')
  await wait(() => !document.querySelector('[data-testid="preset-preview"]'))
  await wait(() => !useUiStore.getState().applyingPreset && presetTarget()!.image.adjustments!.exposure === preset.look.adjustments.exposure)
  check(useHistoryStore.getState().past.length === steps + 1, 'Applying a preset was not one undo step')
  check(JSON.stringify(presetTarget()!.image.crop) === crop && JSON.stringify(presetTarget()!.image.transform) === geometry && (presetTarget()!.image.data as { assetId: string }).assetId === assetId, 'Preset changed the photo identity, crop or transform')
  useEditorStore.getState().undo()
  await persistedExposure(-35)
  check(presetTarget()!.image.adjustments!.exposure === -35, 'Undo did not restore the previous look')
  useEditorStore.getState().redo()
  await persistedExposure(preset.look.adjustments.exposure)
  useEditorStore.getState().clearSelection()
  await aria('Prévia de Cinema pessoal')
  await wait(() => !!previewImage())
  const sample = document.querySelector('[data-testid="preset-preview"]')!
  check(sample.textContent?.includes('Foto de exemplo'), 'Opening preview without selection should show the sample')
  check([...sample.querySelectorAll('button')].some((button) => button.textContent?.trim() === 'Aplicar preset' && button.disabled), 'Sample photo should never be written to the project')
  await aria('Fechar prévia do preset')
  useEditorStore.getState().selectLayer(photoId)
  await click('Copiar look'); await pause(100)
  useEditorStore.getState().updateAdjustment(photoId, 'exposure', 9)
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true }))
  await wait(() => !useUiStore.getState().applyingPreset && presetTarget()!.image.adjustments!.exposure === preset.look.adjustments.exposure)
  await persistedExposure(preset.look.adjustments.exposure)
  const count = usePresetLibraryStore.getState().presets.length
  await click('Adicionar JSON copiado à biblioteca')
  await wait(() => usePresetLibraryStore.getState().presets.length === count + 1)
  await click('Exportar JSON')
  await pause(100)
  await wait(() => ![...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.trim() === 'Importar JSON')!.disabled)
  await click('Importar JSON')
  await wait(() => usePresetLibraryStore.getState().presets.length === (count + 1) * 2)
  useEditorStore.getState().setActiveRightTab('filters'); await wait(() => !!document.querySelector('[data-testid="preset-quick-actions"]'))
  await click('Exportar JSON'); await pause(100)
  const beforeQuickImport = usePresetLibraryStore.getState().presets.length
  await click('Importar JSON'); await wait(() => usePresetLibraryStore.getState().presets.length === beforeQuickImport * 2)
  await click('Biblioteca de presets'); await wait(() => !!document.querySelector('[data-testid="preset-panel"]'))
  usePresetLibraryStore.getState().setFolder(folder.id)
  await pause()
  await aria('Excluir pasta'); await wait(() => !!useUiStore.getState().confirm)
  await click('Excluir'); await wait(() => !usePresetLibraryStore.getState().folders.some((f) => f.id === folder.id))
  await autosaveClient.drain()
  usePresetLibraryStore.getState().setFolder(null)
  // Clear transient test feedback and collapse the folder tree for a clean library preview.
  useUiStore.setState({ toasts: [] })
  const foldersButton = [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.getAttribute('aria-expanded') === 'true' && b.textContent?.includes('Pastas'))
  foldersButton?.click()
  await pause(1000)
  const panel = document.querySelector<HTMLElement>('[data-testid="preset-panel"]')!
  check(panel.scrollWidth <= panel.clientWidth + 1, 'Preset panel overflows horizontally')
  check(document.querySelector<HTMLElement>('[data-testid="preset-list"]')!.clientHeight >= 96, 'Preset list has no room to browse')
  await ipcRenderer.invoke('preset-check:capture', 'presets-white')
  const prefs = usePreferencesStore.getState().prefs!
  await usePreferencesStore.getState().patch({ appearance: { ...prefs.appearance, theme: 'noir_dark' } })
  await pause(250)
  await ipcRenderer.invoke('preset-check:capture', 'presets-noir')
  await usePreferencesStore.getState().patch({ appearance: { ...prefs.appearance, theme: 'instagram_light' } })
  ipcRenderer.send('preset-check:result', { ok: true, message: 'PASS: real Presets UI, before/after pixels, cumulative Showcase, non-mutating previews, sample photo, one-step apply/undo, favorite presets, folders and JSON exchange.' })
}
void run().catch((error) => ipcRenderer.send('preset-check:result', { ok: false, message: String(error.stack ?? error) }))
