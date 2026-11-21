import { randomUUID } from 'node:crypto'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { clipboard, dialog } from 'electron'
import { applyPhotoLook, capturePhotoLook, linkedPresetFx } from '@shared/photoPresets'
import { parsePresetDocument, PRESET_JSON_LIMIT, presetName, validatePhotoLook } from '@shared/presetValidation'
import type { DumpItem, OverlayLayerData, PhotoLook, PresetDocument, PresetLibrary, UserPreset } from '@shared/types'
import { FILTERS } from '../../engine/filters/registry'
import { getDb } from '../db/connection'
import { presetsRepo } from '../repositories/presets.repo'
import { layersRepo } from '../repositories/layers.repo'
import { dumpItemsRepo, rowToDumpItem } from '../repositories/dumpItems.repo'

function validatedLook(input: unknown): PhotoLook {
  const look = validatePhotoLook(input)
  if (look.filter.name !== null && !FILTERS.some((filter) => filter.name === look.filter.name)) throw new Error('Unsupported filter')
  return look
}
function page(id: string): DumpItem {
  const row = dumpItemsRepo.getById(id)
  if (!row) throw new Error('Page not found')
  return { ...rowToDumpItem(row), layers: layersRepo.listByDumpItem(id) }
}
function checkFolder(library: PresetLibrary, id: string | null): void {
  if (id !== null && !library.folders.some((folder) => folder.id === id)) throw new Error('Folder not found')
}
function descendants(library: PresetLibrary, folderId: string): Set<string> {
  const result = new Set([folderId])
  let count = 0
  do {
    count = result.size
    for (const f of library.folders) if (f.parentId !== null && result.has(f.parentId)) result.add(f.id)
  } while (result.size !== count)
  return result
}
function uniqueName(name: string, existing: string[]): string {
  const names = new Set(existing.map((n) => n.toLocaleLowerCase()))
  if (!names.has(name.toLocaleLowerCase())) return name
  let index = 2
  while (names.has(`${name.slice(0, 110)} (${index})`.toLocaleLowerCase())) index++
  return `${name.slice(0, 110)} (${index})`
}

export const presetService = {
  list: (): PresetLibrary => presetsRepo.list(),

  save(input: { name: string; folderId: string | null; dumpItemId: string; layerId: string; fxIds: string[]; favorite?: boolean }): { preset: UserPreset; item: DumpItem } {
    if (input.favorite !== undefined && typeof input.favorite !== 'boolean') throw new Error('Invalid favorite value')
    const library = presetsRepo.list()
    checkFolder(library, input.folderId)
    const item = page(input.dumpItemId)
    const image = item.layers.find((layer) => layer.id === input.layerId && layer.type === 'image')
    if (!image) throw new Error('Photo not found')
    if (!Array.isArray(input.fxIds) || input.fxIds.length > 100) throw new Error('Invalid FX selection')
    for (const id of input.fxIds) {
      const fx = item.layers.find((layer) => layer.id === id && layer.type === 'overlay')
      const owner = (fx?.data as OverlayLayerData | undefined)?.imageLayerId
      if (!fx || (owner && owner !== image.id)) throw new Error('FX belongs to another photo')
    }
    const now = new Date().toISOString()
    const preset: UserPreset = {
      id: randomUUID(), name: uniqueName(presetName(input.name), library.presets.filter((p) => p.folderId === input.folderId).map((p) => p.name)),
      folderId: input.folderId, favorite: input.favorite ?? false, look: validatedLook(capturePhotoLook(item, image.id, input.fxIds)), createdAt: now, updatedAt: now
    }
    getDb().transaction(() => {
      presetsRepo.insert(preset)
      for (const id of input.fxIds) {
        const fx = item.layers.find((layer) => layer.id === id)!
        fx.data = { ...fx.data, imageLayerId: image.id }
        layersRepo.update(id, { data: fx.data })
      }
    })()
    return { preset, item }
  },

  update(input: { id: string; name: string; folderId: string | null }): void {
    const library = presetsRepo.list()
    if (!library.presets.some((p) => p.id === input.id)) throw new Error('Preset not found')
    checkFolder(library, input.folderId)
    const name = uniqueName(presetName(input.name), library.presets.filter((p) => p.id !== input.id && p.folderId === input.folderId).map((p) => p.name))
    presetsRepo.update(input.id, name, input.folderId, new Date().toISOString())
  },
  delete: (id: string): void => presetsRepo.delete(id),
  setFavorite(id: string, favorite: boolean): void {
    if (typeof favorite !== 'boolean') throw new Error('Invalid favorite value')
    if (!presetsRepo.list().presets.some((preset) => preset.id === id)) throw new Error('Preset not found')
    presetsRepo.setFavorite(id, favorite, new Date().toISOString())
  },

  saveFolder(input: { id?: string; name: string; parentId: string | null }): string {
    const library = presetsRepo.list()
    checkFolder(library, input.parentId)
    if (input.id && !library.folders.some((f) => f.id === input.id)) throw new Error('Folder not found')
    if (input.id && input.parentId && descendants(library, input.id).has(input.parentId)) throw new Error('A folder cannot contain itself')
    const parent = library.folders.find((f) => f.id === input.parentId)
    let depth = 0, nextParent = parent
    while (nextParent) { depth++; nextParent = library.folders.find((f) => f.id === nextParent!.parentId) }
    if (depth >= 32) throw new Error('Folder depth limit reached')
    const name = uniqueName(presetName(input.name), library.folders.filter((f) => f.id !== input.id && f.parentId === input.parentId).map((f) => f.name))
    const id = input.id ?? randomUUID()
    if (input.id) presetsRepo.updateFolder(id, name, input.parentId)
    else presetsRepo.insertFolder({ id, name, parentId: input.parentId, createdAt: new Date().toISOString() })
    return id
  },
  deleteFolder: (id: string): void => presetsRepo.deleteFolder(id),

  apply(input: { dumpItemId: string; layerId: string; look: PhotoLook }): DumpItem {
    const original = page(input.dumpItemId)
    const look = validatedLook(input.look)
    if (linkedPresetFx(original, input.layerId).some((fx) => fx.locked)) throw new Error('Unlock the photo FX before replacing the look')
    const updated = applyPhotoLook(original, input.layerId, look, look.fx.map(() => randomUUID()), new Date().toISOString())
    const image = updated.layers.find((layer) => layer.id === input.layerId)!
    const newIds = new Set(updated.layers.map((layer) => layer.id))
    const oldIds = new Set(original.layers.map((layer) => layer.id))
    getDb().transaction(() => {
      layersRepo.update(image.id, { data: image.data, opacity: image.opacity })
      layersRepo.updateAdjustments(image.id, image.adjustments!)
      layersRepo.updateFilter(image.id, image.filter!)
      for (const layer of original.layers) if (!newIds.has(layer.id)) layersRepo.delete(layer.id)
      for (const layer of updated.layers) if (!oldIds.has(layer.id)) layersRepo.insert(layer)
      layersRepo.reorder(updated.id, updated.layers.map((layer) => layer.id))
    })()
    return page(updated.id)
  },

  document(input: { presetId?: string; folderId?: string | null } = {}): PresetDocument {
    const library = presetsRepo.list()
    if (input.presetId) {
      const preset = library.presets.find((p) => p.id === input.presetId)
      if (!preset) throw new Error('Preset not found')
      return { format: 'noir-photo-presets', version: 1, folders: [], presets: [{ id: preset.id, name: preset.name, folderId: null, look: preset.look, favorite: preset.favorite }] }
    }
    checkFolder(library, input.folderId ?? null)
    const ids = input.folderId ? descendants(library, input.folderId) : null
    return {
      format: 'noir-photo-presets', version: 1,
      folders: library.folders.filter((f) => !ids || ids.has(f.id)).map((f) => ({ id: f.id, name: f.name, parentId: ids && f.id === input.folderId ? null : f.parentId })),
      presets: library.presets.filter((p) => !ids || (p.folderId !== null && ids.has(p.folderId))).map((p) => ({ id: p.id, name: p.name, folderId: p.folderId, look: p.look, favorite: p.favorite }))
    }
  },

  importDocument(text: string, parentId: string | null): number {
    const document = parsePresetDocument(text)
    document.presets.forEach((p) => { p.look = validatedLook(p.look) })
    const library = presetsRepo.list()
    checkFolder(library, parentId)
    const now = new Date().toISOString(), idMap = new Map(document.folders.map((f) => [f.id, randomUUID()]))
    getDb().transaction(() => {
      const pending = [...document.folders]
      const inserted = new Set<string>()
      while (pending.length) {
        const at = pending.findIndex((f) => f.parentId === null || inserted.has(f.parentId))
        if (at < 0) throw new Error('Invalid folder hierarchy')
        const [f] = pending.splice(at, 1)
        const targetParent = f.parentId === null ? parentId : idMap.get(f.parentId)!
        const folder = { id: idMap.get(f.id)!, parentId: targetParent, name: uniqueName(f.name, library.folders.filter((n) => n.parentId === targetParent).map((n) => n.name)), createdAt: now }
        presetsRepo.insertFolder(folder); library.folders.push(folder); inserted.add(f.id)
      }
      for (const p of document.presets) {
        const folderId = p.folderId === null ? parentId : idMap.get(p.folderId)!
        const preset = { id: randomUUID(), name: uniqueName(p.name, library.presets.filter((n) => n.folderId === folderId).map((n) => n.name)), folderId, favorite: p.favorite ?? false, look: p.look, createdAt: now, updatedAt: now }
        presetsRepo.insert(preset); library.presets.push(preset)
      }
    })()
    return document.presets.length
  },

  async exportJson(input: { presetId?: string; folderId?: string | null }): Promise<boolean> {
    const document = this.document(input)
    const label = input.presetId ? document.presets[0]?.name : input.folderId ? document.folders.find((f) => f.id === input.folderId)?.name : 'Noir Presets'
    const result = await dialog.showSaveDialog({ defaultPath: `${(label ?? 'Noir Presets').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')}.json`, filters: [{ name: 'Noir Presets JSON', extensions: ['json'] }] })
    if (result.canceled || !result.filePath) return false
    await writeFile(result.filePath, JSON.stringify(document, null, 2), 'utf8')
    return true
  },
  async importJson(folderId: string | null): Promise<number | null> {
    const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Noir Presets JSON', extensions: ['json'] }] })
    if (result.canceled || !result.filePaths[0]) return null
    const path = result.filePaths[0]
    if ((await stat(path)).size > PRESET_JSON_LIMIT) throw new Error('Preset JSON is too large')
    return this.importDocument(await readFile(path, 'utf8'), folderId)
  },
  copy(input: { name: string; look: PhotoLook }): void {
    const document: PresetDocument = { format: 'noir-photo-presets', version: 1, folders: [], presets: [{ id: 'clipboard', name: presetName(input.name), folderId: null, look: validatedLook(input.look) }] }
    clipboard.writeText(JSON.stringify(document, null, 2))
  },
  readClipboard(): { name: string; look: PhotoLook } {
    const document = parsePresetDocument(clipboard.readText())
    if (document.presets.length !== 1) throw new Error('Copy one preset to apply')
    const preset = document.presets[0]
    return { name: preset.name, look: validatedLook(preset.look) }
  },
  importClipboard(folderId: string | null): number { return this.importDocument(clipboard.readText(), folderId) }
}
