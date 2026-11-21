import type { Database } from 'better-sqlite3'
import { migration001 } from './001_initial'
import { migration002 } from './002_color_grading'
import { migration003 } from './003_tone_curves'
import { migration004 } from './004_photo_presets'
import { migration005 } from './005_preset_favorites'

export interface Migration {
  version: number
  name: string
  up: (db: Database) => void
}

/** Migrations versionadas, aplicadas em ordem crescente e nunca reaplicadas. */
export const migrations: Migration[] = [migration001, migration002, migration003, migration004, migration005]
