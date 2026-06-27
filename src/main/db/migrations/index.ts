import type { Database } from 'better-sqlite3'
import { migration001 } from './001_initial'
import { migration002 } from './002_color_grading'
import { migration003 } from './003_tone_curves'

export interface Migration {
  version: number
  name: string
  up: (db: Database) => void
}

/** Migrations versionadas, aplicadas em ordem crescente e nunca reaplicadas. */
export const migrations: Migration[] = [migration001, migration002, migration003]
