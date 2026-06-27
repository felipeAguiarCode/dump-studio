import { v4 as uuid } from 'uuid'
import { getDb } from '../db/connection'
import { nowIso } from './mappers'

const PREF_KEY = 'user_preferences'

export const preferencesRepo = {
  getRaw(): string | null {
    const row = getDb()
      .prepare('SELECT value_json FROM app_preferences WHERE key = ?')
      .get(PREF_KEY) as { value_json: string } | undefined
    return row?.value_json ?? null
  },

  setRaw(valueJson: string): void {
    const now = nowIso()
    const existing = getDb()
      .prepare('SELECT id FROM app_preferences WHERE key = ?')
      .get(PREF_KEY) as { id: string } | undefined
    if (existing) {
      getDb()
        .prepare('UPDATE app_preferences SET value_json = ?, updated_at = ? WHERE key = ?')
        .run(valueJson, now, PREF_KEY)
    } else {
      getDb()
        .prepare(
          'INSERT INTO app_preferences (id, key, value_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
        )
        .run(uuid(), PREF_KEY, valueJson, now, now)
    }
  }
}
