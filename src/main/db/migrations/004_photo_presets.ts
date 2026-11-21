import type { Database } from 'better-sqlite3'

export const migration004 = {
  version: 4,
  name: 'photo_presets',
  up(db: Database): void {
    db.exec(`
      CREATE TABLE preset_folders (
        id TEXT PRIMARY KEY,
        parent_id TEXT REFERENCES preset_folders(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX preset_folders_parent ON preset_folders(parent_id);
      CREATE TABLE photo_presets (
        id TEXT PRIMARY KEY,
        folder_id TEXT REFERENCES preset_folders(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        look_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX photo_presets_folder ON photo_presets(folder_id);
    `)
  }
}
