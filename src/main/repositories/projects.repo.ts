import { getDb } from '../db/connection'
import { buildUpdate, nowIso } from './mappers'
import type { ProjectSummary, InstagramFormat } from '@shared/types'

export interface ProjectRow {
  id: string
  name: string
  format: string
  default_export_format: string
  default_export_quality: number
  last_opened_at: string | null
  created_at: string
  updated_at: string
  archived_at: string | null
}

export const projectsRepo = {
  insert(row: ProjectRow): void {
    getDb()
      .prepare(
        `INSERT INTO projects
         (id, name, format, default_export_format, default_export_quality, last_opened_at, created_at, updated_at, archived_at)
         VALUES (@id, @name, @format, @default_export_format, @default_export_quality, @last_opened_at, @created_at, @updated_at, @archived_at)`
      )
      .run(row)
  },

  getById(id: string): ProjectRow | undefined {
    return getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined
  },

  update(
    id: string,
    fields: Partial<{
      name: string
      format: InstagramFormat
      default_export_format: string
      default_export_quality: number
      archived_at: string | null
    }>
  ): void {
    const { clause, values } = buildUpdate({ ...fields, updated_at: nowIso() })
    if (!clause) return
    getDb()
      .prepare(`UPDATE projects SET ${clause} WHERE id = ?`)
      .run(...values, id)
  },

  touchOpened(id: string): void {
    getDb()
      .prepare('UPDATE projects SET last_opened_at = ? WHERE id = ?')
      .run(nowIso(), id)
  },

  delete(id: string): void {
    getDb().prepare('DELETE FROM projects WHERE id = ?').run(id)
  },

  listSummaries(includeArchived = false): ProjectSummary[] {
    const rows = getDb()
      .prepare(
        `SELECT
           p.id, p.name, p.format, p.last_opened_at, p.updated_at, p.created_at,
           (SELECT COUNT(*) FROM project_dump_items d WHERE d.project_id = p.id) AS photo_count,
           (SELECT d.preview_path FROM project_dump_items d WHERE d.project_id = p.id ORDER BY d.order_index LIMIT 1) AS thumbnail_path,
           (SELECT json_extract(l.data_json, '$.assetId')
              FROM layers l JOIN project_dump_items d ON l.dump_item_id = d.id
              WHERE d.project_id = p.id AND l.type = 'image'
              ORDER BY d.order_index, l.order_index LIMIT 1) AS thumbnail_asset_id
         FROM projects p
         WHERE (@includeArchived = 1 OR p.archived_at IS NULL)
         ORDER BY COALESCE(p.last_opened_at, p.updated_at) DESC`
      )
      .all({ includeArchived: includeArchived ? 1 : 0 }) as Array<{
      id: string
      name: string
      format: string
      last_opened_at: string | null
      updated_at: string
      created_at: string
      photo_count: number
      thumbnail_path: string | null
      thumbnail_asset_id: string | null
    }>

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      format: r.format as InstagramFormat,
      photoCount: r.photo_count,
      thumbnailPath: r.thumbnail_path ?? undefined,
      thumbnailAssetId: r.thumbnail_asset_id ?? undefined,
      lastOpenedAt: r.last_opened_at ?? undefined,
      updatedAt: r.updated_at,
      createdAt: r.created_at
    }))
  }
}
