import { join } from 'node:path'
import { app } from 'electron'
import Database from 'better-sqlite3'
import { runMigrations } from './migrator'

let db: Database.Database | null = null
export const DATABASE_FILENAME = 'noir-dump-studio.db'

/** Inicializa o banco em userData (criado no primeiro boot) e aplica migrations. */
export function initDatabase(): Database.Database {
  if (db) return db
  const dbPath = join(app.getPath('userData'), DATABASE_FILENAME)
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('synchronous = NORMAL')
  runMigrations(db)
  console.log(`[db] pronto em ${dbPath}`)
  return db
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Banco de dados não inicializado. Chame initDatabase() no boot.')
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
