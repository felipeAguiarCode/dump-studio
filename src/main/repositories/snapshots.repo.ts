import { v4 as uuid } from 'uuid'
import { getDb } from '../db/connection'
import { nowIso } from './mappers'
import type { ProjectSnapshot } from '@shared/types'

interface SnapshotRow {
  id: string
  project_id: string
  name: string
  thumbnail_path: string | null
  snapshot_json: string
  created_at: string
}

function rowToSummary(r: SnapshotRow): ProjectSnapshot {
  return {
    id: r.id,
    projectId: r.project_id,
    name: r.name,
    thumbnailPath: r.thumbnail_path ?? undefined,
    createdAt: r.created_at
  }
}

export const snapshotsRepo = {
  list(projectId: string): ProjectSnapshot[] {
    const rows = getDb()
      .prepare(
        'SELECT id, project_id, name, thumbnail_path, created_at, snapshot_json FROM project_snapshots WHERE project_id = ? ORDER BY created_at DESC'
      )
      .all(projectId) as SnapshotRow[]
    return rows.map(rowToSummary)
  },

  insert(projectId: string, name: string, snapshotJson: string, thumbnailPath?: string): ProjectSnapshot {
    const id = uuid()
    const now = nowIso()
    getDb()
      .prepare(
        'INSERT INTO project_snapshots (id, project_id, name, thumbnail_path, snapshot_json, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(id, projectId, name, thumbnailPath ?? null, snapshotJson, now)
    return { id, projectId, name, thumbnailPath, createdAt: now }
  },

  getJson(snapshotId: string): { projectId: string; json: string } | undefined {
    const r = getDb()
      .prepare('SELECT project_id, snapshot_json FROM project_snapshots WHERE id = ?')
      .get(snapshotId) as { project_id: string; snapshot_json: string } | undefined
    return r ? { projectId: r.project_id, json: r.snapshot_json } : undefined
  },

  rename(snapshotId: string, name: string): void {
    getDb().prepare('UPDATE project_snapshots SET name = ? WHERE id = ?').run(name, snapshotId)
  },

  delete(snapshotId: string): void {
    getDb().prepare('DELETE FROM project_snapshots WHERE id = ?').run(snapshotId)
  }
}
