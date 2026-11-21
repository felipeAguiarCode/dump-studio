import type { Database } from 'better-sqlite3'

export const migration005 = {
  version: 5,
  name: 'preset_favorites',
  up(db: Database): void {
    db.exec('ALTER TABLE photo_presets ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0 CHECK (favorite IN (0, 1))')
  }
}
