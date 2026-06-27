import type { Database } from 'better-sqlite3'
import { migrations } from './migrations'

/**
 * Aplica migrations pendentes em transação. Idempotente: nunca reaplica nem apaga dados.
 */
export function runMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    )
  `)

  const appliedRows = db.prepare('SELECT version FROM schema_version').all() as { version: number }[]
  const applied = new Set(appliedRows.map((r) => r.version))

  const ordered = [...migrations].sort((a, b) => a.version - b.version)
  const insert = db.prepare('INSERT INTO schema_version (version, name, applied_at) VALUES (?, ?, ?)')

  for (const m of ordered) {
    if (applied.has(m.version)) continue
    const apply = db.transaction(() => {
      m.up(db)
      insert.run(m.version, m.name, new Date().toISOString())
    })
    apply()
    console.log(`[db] migration aplicada: v${m.version} ${m.name}`)
  }
}
