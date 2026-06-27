import { getDb } from '../db/connection'
import { buildUpdate, nowIso, parseJson } from './mappers'
import type { CanvasSettings, DumpItem, InstagramFormat, CanvasBackground, PageLayout } from '@shared/types'

export interface DumpItemRow {
  id: string
  project_id: string
  order_index: number
  title: string | null
  preview_path: string | null
  canvas_width: number
  canvas_height: number
  canvas_background: string
  canvas_settings_json: string | null
  created_at: string
  updated_at: string
}

interface CanvasExtra {
  format: InstagramFormat
  showGuides: boolean
  showGrid: boolean
  layout?: PageLayout | null
}

export function rowToDumpItem(r: DumpItemRow): DumpItem {
  const extra = parseJson<CanvasExtra>(r.canvas_settings_json, {
    format: 'feed_4_5',
    showGuides: true,
    showGrid: false
  })
  const canvas: CanvasSettings = {
    width: r.canvas_width,
    height: r.canvas_height,
    format: extra.format,
    backgroundColor: r.canvas_background as CanvasBackground,
    showGuides: extra.showGuides,
    showGrid: extra.showGrid,
    layout: extra.layout ?? null
  }
  return {
    id: r.id,
    projectId: r.project_id,
    orderIndex: r.order_index,
    title: r.title ?? '',
    previewPath: r.preview_path ?? undefined,
    canvas,
    layers: [],
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }
}

export const dumpItemsRepo = {
  insert(item: DumpItem): void {
    const now = item.createdAt || nowIso()
    getDb()
      .prepare(
        `INSERT INTO project_dump_items
         (id, project_id, order_index, title, preview_path, canvas_width, canvas_height, canvas_background, canvas_settings_json, created_at, updated_at)
         VALUES (@id, @project_id, @order_index, @title, @preview_path, @canvas_width, @canvas_height, @canvas_background, @canvas_settings_json, @created_at, @updated_at)`
      )
      .run({
        id: item.id,
        project_id: item.projectId,
        order_index: item.orderIndex,
        title: item.title,
        preview_path: item.previewPath ?? null,
        canvas_width: item.canvas.width,
        canvas_height: item.canvas.height,
        canvas_background: String(item.canvas.backgroundColor),
        canvas_settings_json: JSON.stringify({
          format: item.canvas.format,
          showGuides: item.canvas.showGuides,
          showGrid: item.canvas.showGrid,
          layout: item.canvas.layout ?? null
        }),
        created_at: now,
        updated_at: now
      })
  },

  getById(id: string): DumpItemRow | undefined {
    return getDb()
      .prepare('SELECT * FROM project_dump_items WHERE id = ?')
      .get(id) as DumpItemRow | undefined
  },

  listByProject(projectId: string): DumpItemRow[] {
    return getDb()
      .prepare('SELECT * FROM project_dump_items WHERE project_id = ? ORDER BY order_index ASC')
      .all(projectId) as DumpItemRow[]
  },

  updateCanvas(id: string, canvas: Partial<CanvasSettings>): void {
    const current = this.getById(id)
    if (!current) return
    const extra = parseJson<CanvasExtra>(current.canvas_settings_json, {
      format: 'feed_4_5',
      showGuides: true,
      showGrid: false
    })
    const merged = {
      format: canvas.format ?? extra.format,
      showGuides: canvas.showGuides ?? extra.showGuides,
      showGrid: canvas.showGrid ?? extra.showGrid,
      // !== undefined (não ??): permite limpar o layout com null ("Livre / Sem layout").
      layout: canvas.layout !== undefined ? canvas.layout : (extra.layout ?? null)
    }
    const { clause, values } = buildUpdate({
      canvas_width: canvas.width,
      canvas_height: canvas.height,
      canvas_background:
        canvas.backgroundColor !== undefined ? String(canvas.backgroundColor) : undefined,
      canvas_settings_json: JSON.stringify(merged),
      updated_at: nowIso()
    })
    getDb()
      .prepare(`UPDATE project_dump_items SET ${clause} WHERE id = ?`)
      .run(...values, id)
  },

  updateMeta(id: string, fields: { title?: string; previewPath?: string }): void {
    const { clause, values } = buildUpdate({
      title: fields.title,
      preview_path: fields.previewPath,
      updated_at: nowIso()
    })
    if (!clause) return
    getDb()
      .prepare(`UPDATE project_dump_items SET ${clause} WHERE id = ?`)
      .run(...values, id)
  },

  delete(id: string): void {
    getDb().prepare('DELETE FROM project_dump_items WHERE id = ?').run(id)
  },

  deleteByProject(projectId: string): void {
    getDb().prepare('DELETE FROM project_dump_items WHERE project_id = ?').run(projectId)
  },

  reorder(projectId: string, orderedIds: string[]): void {
    const stmt = getDb().prepare(
      'UPDATE project_dump_items SET order_index = ?, updated_at = ? WHERE id = ? AND project_id = ?'
    )
    const now = nowIso()
    orderedIds.forEach((id, idx) => stmt.run(idx, now, id, projectId))
  },

  nextOrderIndex(projectId: string): number {
    const row = getDb()
      .prepare('SELECT COALESCE(MAX(order_index), -1) AS m FROM project_dump_items WHERE project_id = ?')
      .get(projectId) as { m: number }
    return row.m + 1
  }
}
