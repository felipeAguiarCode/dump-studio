import { getDb } from '../db/connection'
import { nowIso } from './mappers'
import type { OriginalAsset } from '@shared/types'

interface AssetRow {
  id: string
  project_id: string
  source_path: string | null
  internal_copy_path: string
  file_name: string
  mime_type: string | null
  width: number | null
  height: number | null
  size_bytes: number | null
  checksum: string | null
  created_at: string
}

function rowToAsset(r: AssetRow): OriginalAsset {
  return {
    id: r.id,
    projectId: r.project_id,
    sourcePath: r.source_path ?? undefined,
    internalCopyPath: r.internal_copy_path,
    fileName: r.file_name,
    mimeType: r.mime_type ?? undefined,
    width: r.width ?? undefined,
    height: r.height ?? undefined,
    sizeBytes: r.size_bytes ?? undefined,
    checksum: r.checksum ?? undefined,
    createdAt: r.created_at
  }
}

export const assetsRepo = {
  insert(asset: OriginalAsset): void {
    getDb()
      .prepare(
        `INSERT INTO original_assets
         (id, project_id, source_path, internal_copy_path, file_name, mime_type, width, height, size_bytes, checksum, created_at)
         VALUES (@id, @project_id, @source_path, @internal_copy_path, @file_name, @mime_type, @width, @height, @size_bytes, @checksum, @created_at)`
      )
      .run({
        id: asset.id,
        project_id: asset.projectId,
        source_path: asset.sourcePath ?? null,
        internal_copy_path: asset.internalCopyPath,
        file_name: asset.fileName,
        mime_type: asset.mimeType ?? null,
        width: asset.width ?? null,
        height: asset.height ?? null,
        size_bytes: asset.sizeBytes ?? null,
        checksum: asset.checksum ?? null,
        created_at: asset.createdAt || nowIso()
      })
  },

  getById(id: string): OriginalAsset | undefined {
    const r = getDb().prepare('SELECT * FROM original_assets WHERE id = ?').get(id) as
      | AssetRow
      | undefined
    return r ? rowToAsset(r) : undefined
  },

  findByChecksum(projectId: string, checksum: string): OriginalAsset | undefined {
    const r = getDb()
      .prepare('SELECT * FROM original_assets WHERE project_id = ? AND checksum = ?')
      .get(projectId, checksum) as AssetRow | undefined
    return r ? rowToAsset(r) : undefined
  },

  listByProject(projectId: string): OriginalAsset[] {
    const rows = getDb()
      .prepare('SELECT * FROM original_assets WHERE project_id = ?')
      .all(projectId) as AssetRow[]
    return rows.map(rowToAsset)
  }
}
