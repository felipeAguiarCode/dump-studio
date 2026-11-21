import { getDb } from '../db/connection'
import type { PresetFolder, PresetLibrary, UserPreset } from '@shared/types'

export const presetsRepo = {
  list(): PresetLibrary {
    const folders = getDb().prepare('SELECT id, name, parent_id AS parentId, created_at AS createdAt FROM preset_folders ORDER BY name COLLATE NOCASE').all() as PresetFolder[]
    const rows = getDb().prepare('SELECT id, name, folder_id AS folderId, look_json AS lookJson, favorite, created_at AS createdAt, updated_at AS updatedAt FROM photo_presets ORDER BY name COLLATE NOCASE').all() as (Omit<UserPreset, 'look' | 'favorite'> & { lookJson: string; favorite: number })[]
    return { folders, presets: rows.map(({ lookJson, favorite, ...row }) => ({ ...row, favorite: favorite === 1, look: JSON.parse(lookJson) })) }
  },
  insert(preset: UserPreset): void {
    getDb().prepare('INSERT INTO photo_presets (id, folder_id, name, look_json, favorite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(preset.id, preset.folderId, preset.name, JSON.stringify(preset.look), preset.favorite ? 1 : 0, preset.createdAt, preset.updatedAt)
  },
  update(id: string, name: string, folderId: string | null, now: string): void {
    getDb().prepare('UPDATE photo_presets SET name = ?, folder_id = ?, updated_at = ? WHERE id = ?').run(name, folderId, now, id)
  },
  delete(id: string): void { getDb().prepare('DELETE FROM photo_presets WHERE id = ?').run(id) },
  setFavorite(id: string, favorite: boolean, now: string): void {
    getDb().prepare('UPDATE photo_presets SET favorite = ?, updated_at = ? WHERE id = ?').run(favorite ? 1 : 0, now, id)
  },
  insertFolder(folder: PresetFolder): void {
    getDb().prepare('INSERT INTO preset_folders (id, parent_id, name, created_at) VALUES (?, ?, ?, ?)').run(folder.id, folder.parentId, folder.name, folder.createdAt)
  },
  updateFolder(id: string, name: string, parentId: string | null): void {
    getDb().prepare('UPDATE preset_folders SET name = ?, parent_id = ? WHERE id = ?').run(name, parentId, id)
  },
  deleteFolder(id: string): void { getDb().prepare('DELETE FROM preset_folders WHERE id = ?').run(id) }
}
