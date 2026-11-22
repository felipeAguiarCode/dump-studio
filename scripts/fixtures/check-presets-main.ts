import assert from 'node:assert/strict'
import { join } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { app, BrowserWindow, clipboard, dialog, ipcMain } from 'electron'
import Database from 'better-sqlite3'
import { migration001 } from '../../src/main/db/migrations/001_initial'
import { migration002 } from '../../src/main/db/migrations/002_color_grading'
import { migration003 } from '../../src/main/db/migrations/003_tone_curves'
import { migration004 } from '../../src/main/db/migrations/004_photo_presets'
import { migration005 } from '../../src/main/db/migrations/005_preset_favorites'
import { initDatabase, closeDatabase, DATABASE_FILENAME } from '../../src/main/db/connection'
import { configureUserData } from '../../src/main/userData'
import { projectService } from '../../src/main/services/projectService'
import { editService } from '../../src/main/services/editService'
import { assetService } from '../../src/main/services/assetService'
import { presetService } from '../../src/main/services/presetService'
import { preferencesService } from '../../src/main/services/preferencesService'
import { layersRepo } from '../../src/main/repositories/layers.repo'
import { dumpItemsRepo } from '../../src/main/repositories/dumpItems.repo'
import { uiStateService } from '../../src/main/services/uiStateService'
import { registerIpcHandlers } from '../../src/main/ipc/registerHandlers'
import { registerAssetScheme, handleAssetProtocol } from '../../src/main/fs/assetProtocol'
import { DEFAULT_ADJUSTMENTS, DEFAULT_SHADERS } from '../../src/shared/defaults'
import { capturePhotoLook, linkedPresetFx } from '../../src/shared/photoPresets'
import { parsePresetDocument } from '../../src/shared/presetValidation'
import type { ImageLayerData, Layer, OverlayLayerData } from '../../src/shared/types'

const scratch = process.env.NOIR_PRESETS_TEST_DIR!
const legacyProfile = join(scratch, 'Noir Dump Studio')
app.setPath('appData', scratch)
app.setPath('userData', join(scratch, 'My Dump Studio'))
registerAssetScheme()
// The test uses the real IPC endpoints but isolates the user's system clipboard and file pickers.
let clipboardText = ''
clipboard.readText = () => clipboardText
clipboard.writeText = (value) => { clipboardText = value }
const jsonPath = join(scratch, 'collection.json')
dialog.showSaveDialog = (async () => ({ canceled: false, filePath: jsonPath })) as typeof dialog.showSaveDialog
dialog.showOpenDialog = (async () => ({ canceled: false, filePaths: [jsonPath] })) as typeof dialog.showOpenDialog

async function checks(): Promise<string> {
  const source = projectService.create({ name: 'Preset source' })
  const destination = projectService.create({ name: 'Biblioteca de looks' })
  const assetPath = join(process.env.NOIR_FIXTURE_ROOT!, 'assets/branding/splash-art.png')
  const sourceAsset = (await assetService.importToPool({ projectId: source.id, paths: [assetPath] })).assets[0]
  const targetAsset = (await assetService.importToPool({ projectId: destination.id, paths: [assetPath] })).assets[0]
  const sourcePage = source.dumpItems[0] ?? editService.addDumpItem(source.id)
  const targetPage = destination.dumpItems[0] ?? editService.addDumpItem(destination.id)
  const image = editService.addLayer({ dumpItemId: sourcePage.id, type: 'image', assetId: sourceAsset.id, name: 'Foto original' })
  const target = editService.addLayer({ dumpItemId: targetPage.id, type: 'image', assetId: targetAsset.id, name: 'Foto de destino' })
  layersRepo.update(image.id, { transform: { x: 40, y: 50, width: 800, height: 600, rotation: 23, scaleX: 1, scaleY: 1 }, opacity: .84,
    data: { ...image.data, cameraLook: 'ccd_classic', shaders: Object.fromEntries(Object.keys(DEFAULT_SHADERS).map((key, index) => [key, index + 1])), border: { width: 8, color: '#ffddee', radius: { tl: 12, tr: 16, bl: 20, br: 24 } } } })
  const adjustments = structuredClone(DEFAULT_ADJUSTMENTS)
  Object.assign(adjustments, { exposure: 17, contrast: 28, temperature: 12, grain: 41 })
  adjustments.colorGrading.shadows = { hue: 220, saturation: 12, luminance: -14 }
  adjustments.hslMixer.blue.luminance = 14
  adjustments.toneCurves.rgb = [{ x: 0, y: 0 }, { x: .35, y: .2 }, { x: 1, y: 1 }]
  layersRepo.updateAdjustments(image.id, adjustments)
  layersRepo.updateFilter(image.id, { name: 'lab_selenium', intensity: 73 })
  layersRepo.update(target.id, { transform: { x: 110, y: 170, width: 540, height: 650, rotation: -13, scaleX: 1, scaleY: 1 } })
  layersRepo.updateCrop(target.id, { rect: { x: .1, y: .2, width: .7, height: .6 }, rotation: 90, flipHorizontal: true })
  const fx = editService.addLayer({ dumpItemId: sourcePage.id, type: 'overlay', name: 'Luz lateral', data: { overlayId: 'side-30', flipX: true, flipY: false, color: '#ffffff', imageLayerId: image.id }, transform: { x: 110, y: 210, width: 450, height: 600, rotation: 23 } })
  const shadow = editService.addLayer({ dumpItemId: sourcePage.id, type: 'overlay', name: 'Sombra suave', data: { overlayId: 'rect-soft', flipX: false, flipY: true, color: '#000000' }, transform: { x: 90, y: 190, width: 420, height: 610, rotation: 28 } })
  layersRepo.update(shadow.id, { orderIndex: image.orderIndex - .5 })
  const unrelated = editService.addLayer({ dumpItemId: targetPage.id, type: 'overlay', name: 'FX independente', data: { overlayId: 'full-50', flipX: false, flipY: false, color: '#000000' } })
  const text = editService.addLayer({ dumpItemId: targetPage.id, type: 'text', name: 'Texto preservado', data: { text: 'Olá, presets!' } })
  editService.addLayer({ dumpItemId: targetPage.id, type: 'overlay', name: 'FX anterior', data: { overlayId: 'top-60', flipX: false, flipY: false, color: '#000000', imageLayerId: target.id } })
  const collection = presetService.saveFolder({ name: 'Coleção autoral', parentId: null })
  const folder = presetService.saveFolder({ name: 'Cinema', parentId: collection })
  const subfolder = presetService.saveFolder({ name: 'Prata', parentId: folder })
  assert.throws(() => presetService.saveFolder({ id: collection, name: 'Cycle', parentId: subfolder }))
  const saved = presetService.save({ name: 'Prata de estúdio', folderId: subfolder, dumpItemId: sourcePage.id, layerId: image.id, fxIds: [fx.id, shadow.id] })
  assert.equal(saved.preset.favorite, false)
  presetService.setFavorite(saved.preset.id, true)
  assert.equal(presetService.list().presets.find((p) => p.id === saved.preset.id)!.favorite, true)
  assert.equal(saved.preset.look.fx.length, 2)
  assert.equal(linkedPresetFx(saved.item, image.id).length, 2)
  assert.deepEqual(saved.preset.look.adjustments, adjustments)
  assert.deepEqual(saved.preset.look.shaders, (layersRepo.assemble(layersRepo.getRow(image.id)!).data as ImageLayerData).shaders)
  const before = projectService.open(destination.id).dumpItems[0]
  const beforePhoto = before.layers.find((l) => l.id === target.id)!
  for (let repetition = 0; repetition < 2; repetition++) {
    const after = presetService.apply({ dumpItemId: targetPage.id, layerId: target.id, look: saved.preset.look })
    const photo = after.layers.find((l) => l.id === target.id)!
    assert.deepEqual(photo.transform, beforePhoto.transform)
    assert.deepEqual(photo.crop, beforePhoto.crop)
    assert.equal((photo.data as ImageLayerData).assetId, targetAsset.id)
    assert.deepEqual(after.canvas, before.canvas)
    assert.deepEqual(photo.adjustments, saved.preset.look.adjustments)
    assert.deepEqual(photo.filter, saved.preset.look.filter)
    assert.deepEqual((photo.data as ImageLayerData).shaders, saved.preset.look.shaders)
    assert.equal((photo.data as ImageLayerData).cameraLook, 'ccd_classic')
    assert.equal(photo.opacity, .84)
    assert.ok(Math.abs((photo.data as ImageLayerData).border!.width - 8 * Math.min(540 / 800, 650 / 600)) < 1e-9)
    assert.equal(linkedPresetFx(after, target.id).length, 2)
    assert.equal(after.layers.filter((l) => l.type === 'overlay').length, 3)
    for (const id of [text.id, unrelated.id]) {
      const old = before.layers.find((l) => l.id === id)!, next = after.layers.find((l) => l.id === id)!
      assert.deepEqual(next.data, old.data); assert.deepEqual(next.transform, old.transform)
    }
    const recaptured = capturePhotoLook(after, target.id)
    for (let index = 0; index < 2; index++) for (const key of ['x', 'y', 'width', 'height', 'rotation'] as const) assert.ok(Math.abs(recaptured.fx[index][key] - saved.preset.look.fx[index][key]) < 1e-8)
  }
  const applied = projectService.open(destination.id)
  layersRepo.update(target.id, { locked: true })
  assert.throws(() => presetService.apply({ dumpItemId: targetPage.id, layerId: target.id, look: saved.preset.look }))
  layersRepo.update(target.id, { locked: false })
  const slotted = editService.addDumpItem(destination.id)
  const slottedImage = editService.addLayer({ dumpItemId: slotted.id, type: 'image', assetId: targetAsset.id })
  dumpItemsRepo.updateCanvas(slotted.id, { layout: { templateId: 'fixture', gutter: 20, slots: [{ x: .1, y: .1, w: .5, h: .6, rot: 30 }] } })
  layersRepo.update(slottedImage.id, { data: { ...slottedImage.data, slotIndex: 0 } })
  const slottedAfter = presetService.apply({ dumpItemId: slotted.id, layerId: slottedImage.id, look: saved.preset.look })
  assert.equal(slottedAfter.canvas.layout!.templateId, 'fixture')
  assert.ok(linkedPresetFx(slottedAfter, slottedImage.id).some((fx) => (fx.data as OverlayLayerData).slotIndex === 0), 'Overlays must be clipped to the destination photo slot')
  assert.deepEqual(capturePhotoLook(slottedAfter, slottedImage.id).filter, saved.preset.look.filter)
  const document = presetService.document({ folderId: collection })
  assert.equal(document.presets[0].favorite, true)
  const legacyDocument = structuredClone(document); delete legacyDocument.presets[0].favorite
  assert.equal(parsePresetDocument(JSON.stringify(legacyDocument)).presets[0].favorite, false)
  assert.equal(document.folders.length, 3)
  assert.equal(document.folders.find((f) => f.id === collection)!.parentId, null)
  assert.ok(!JSON.stringify(document).includes(sourceAsset.internalCopyPath))
  assert.ok(!JSON.stringify(document).includes('sourcePath'))
  const count = presetService.list().presets.length
  assert.equal(presetService.importDocument(JSON.stringify(document), null), 1)
  assert.equal(presetService.list().presets.length, count + 1)
  assert.equal(presetService.list().presets.filter((p) => p.favorite).length, 2)
  assert.ok(presetService.list().folders.some((f) => f.name === 'Coleção autoral (2)'))
  for (const mutate of [
    (d: any) => { d.version = 999 },
    (d: any) => { d.presets[0].favorite = 'true' },
    (d: any) => { d.folders[0].parentId = d.folders[2].id },
    (d: any) => { d.presets[0].look.adjustments.toneCurves.rgb[1].x = 0 },
    (d: any) => { d.presets[0].look.filter.name = 'unknown_filter' },
    (d: any) => { d.presets[0].look.fx[0].overlayId = '../../arbitrary-file' },
    (d: any) => { d.presets[0].look.shaders.crt = null }
  ]) {
    const invalid = structuredClone(document); mutate(invalid)
    const previous = presetService.list()
    assert.throws(() => presetService.importDocument(JSON.stringify(invalid), null))
    assert.deepEqual(presetService.list(), previous)
  }
  await presetService.exportJson({ folderId: collection })
  assert.equal(parsePresetDocument(await readFile(jsonPath, 'utf8')).presets.length, 1)
  assert.equal(await presetService.importJson(folder), 1)
  presetService.copy({ name: saved.preset.name, look: saved.preset.look })
  assert.deepEqual(presetService.readClipboard().look, saved.preset.look)
  assert.equal(presetService.importClipboard(null), 1)
  const duplicate = editService.duplicateDumpItem(targetPage.id)
  const copiedPhoto = duplicate.layers.find((l) => l.type === 'image')!
  assert.equal(linkedPresetFx(duplicate, copiedPhoto.id).length, 2)
  const duplicateProject = projectService.duplicate(destination.id)
  assert.equal(linkedPresetFx(duplicateProject.dumpItems[0], duplicateProject.dumpItems[0].layers.find((l) => l.type === 'image')!.id).length, 2)
  const pasted = editService.pasteLayers(slotted.id, applied.dumpItems[0].layers.filter((l) => l.type === 'image' || (l.type === 'overlay' && (l.data as OverlayLayerData).imageLayerId === target.id)))
  const pastedPhoto = pasted.find((l) => l.type === 'image')!
  assert.equal(pasted.filter((l) => l.type === 'overlay' && (l.data as OverlayLayerData).imageLayerId === pastedPhoto.id).length, 2)
  const total = presetService.list().presets.length
  const removable = presetService.saveFolder({ name: 'Temporary collection', parentId: null })
  presetService.importDocument(JSON.stringify(document), removable)
  presetService.deleteFolder(removable)
  assert.equal(presetService.list().presets.length, total)
  closeDatabase(); initDatabase()
  assert.equal(presetService.list().presets.length, total)
  assert.equal(presetService.list().presets.find((p) => p.id === saved.preset.id)!.favorite, true)
  assert.deepEqual(projectService.open(destination.id).dumpItems[0].layers.find((l) => l.id === target.id)!.adjustments, saved.preset.look.adjustments)
  presetService.save({ name: 'Cinema suave', folderId: folder, dumpItemId: sourcePage.id, layerId: image.id, fxIds: [] })
  presetService.save({ name: 'Noite analógica', folderId: null, dumpItemId: sourcePage.id, layerId: image.id, fxIds: [fx.id] })
  const ui = uiStateService.get(destination.id)
  ui.activeDumpItemId = targetPage.id; ui.selectedLayerId = target.id; ui.selectedLayerIds = [target.id]; ui.activeRightTab = 'presets'
  uiStateService.save(ui)
  const prefs = preferencesService.get()
  preferencesService.set({ appearance: { ...prefs.appearance, language: 'pt' } })
  console.log('PASS: SQLite preset/folder persistence, nested JSON file round-trip, additive import, malformed-file rollback, all look fields, rotated FX adaptation, replacement without duplicates, crop/layout preservation, and FX owner remapping on page/project/layer duplication.')
  return destination.id
}

app.whenReady().then(async () => {
  const previousLibrary = new Database(':memory:')
  migration004.up(previousLibrary)
  previousLibrary.prepare('INSERT INTO photo_presets (id, name, look_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run('existing-preset', 'Existing preset', '{"preserved":true}', 'before', 'before')
  migration005.up(previousLibrary)
  assert.deepEqual(previousLibrary.prepare('SELECT name, look_json, favorite FROM photo_presets WHERE id = ?').get('existing-preset'), { name: 'Existing preset', look_json: '{"preserved":true}', favorite: 0 })
  previousLibrary.close()
  console.log('PASS: upgrading a populated v4 preset library preserves its presets and initializes favorites.')
  await mkdir(legacyProfile, { recursive: true })
  const legacy = new Database(join(legacyProfile, DATABASE_FILENAME))
  legacy.exec('CREATE TABLE schema_version (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)')
  const now = new Date().toISOString()
  for (const migration of [migration001, migration002, migration003]) {
    migration.up(legacy)
    legacy.prepare('INSERT INTO schema_version VALUES (?, ?, ?)').run(migration.version, migration.name, now)
  }
  legacy.prepare('INSERT INTO projects (id, name, format, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run('legacy-project', 'Existing project preserved', 'feed_4_5', now, now)
  legacy.prepare('INSERT INTO app_preferences (id, key, value_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run('legacy-preferences', 'fixture-marker', '{"preserved":true}', now, now)
  legacy.close()
  configureUserData()
  assert.equal(app.getPath('userData'), legacyProfile, 'Rebranded app must reopen the existing profile')
  const upgraded = initDatabase()
  assert.equal(projectService.open('legacy-project').name, 'Existing project preserved')
  assert.equal((upgraded.prepare('SELECT value_json FROM app_preferences WHERE id = ?').get('legacy-preferences') as { value_json: string }).value_json, '{"preserved":true}')
  assert.equal((upgraded.prepare('SELECT COUNT(*) AS count FROM schema_version').get() as { count: number }).count, 5)
  assert.deepEqual(upgraded.pragma('foreign_key_check'), [])
  console.log('PASS: upgrade from a populated v3 database adds the preset library and preserves the existing project and preferences.')
  handleAssetProtocol(); registerIpcHandlers()
  const projectId = await checks()
  const window = new BrowserWindow({ width: 1440, height: 900, show: false, useContentSize: true, webPreferences: { nodeIntegration: true, contextIsolation: false, sandbox: false, backgroundThrottling: false, offscreen: true } })
  window.webContents.on('console-message', (_event, level, message) => { if (level >= 2) console.error(message) })
  ipcMain.handle('preset-check:fixture', () => ({ project: projectService.open(projectId), ui: uiStateService.get(projectId), prefs: preferencesService.get() }))
  ipcMain.handle('preset-check:project', () => projectService.open(projectId))
  ipcMain.handle('preset-check:capture', async (_event, name: string) => { await new Promise((resolve) => setTimeout(resolve, 250)); await writeFile(join(scratch, `${name}.png`), (await window.webContents.capturePage()).toPNG()) })
  ipcMain.once('preset-check:result', (_event, result) => { console.log(result.message); closeDatabase(); app.exit(result.ok ? 0 : 1) })
  await window.loadFile(join(scratch, 'index.html'))
}).catch((error) => { console.error(error); closeDatabase(); app.exit(1) })
