import { v4 as uuid } from 'uuid'
import { getDb } from '../db/connection'
import { nowIso } from './mappers'
import type { ProjectExportSettings } from '@shared/types'

interface ExportRow {
  project_id: string
  export_format: string
  jpg_quality: number
  destination_path: string | null
  file_naming_pattern: string
  export_scope: string
}

export const exportSettingsRepo = {
  get(projectId: string): ProjectExportSettings | undefined {
    const r = getDb()
      .prepare('SELECT * FROM project_export_settings WHERE project_id = ?')
      .get(projectId) as ExportRow | undefined
    if (!r) return undefined
    return {
      projectId: r.project_id,
      exportFormat: r.export_format as 'jpg' | 'png',
      jpgQuality: r.jpg_quality,
      destinationPath: r.destination_path ?? undefined,
      fileNamingPattern: r.file_naming_pattern,
      exportScope: r.export_scope as 'current' | 'all'
    }
  },

  upsert(settings: ProjectExportSettings): void {
    const now = nowIso()
    const existing = getDb()
      .prepare('SELECT id FROM project_export_settings WHERE project_id = ?')
      .get(settings.projectId) as { id: string } | undefined
    const params = {
      project_id: settings.projectId,
      export_format: settings.exportFormat,
      jpg_quality: settings.jpgQuality,
      destination_path: settings.destinationPath ?? null,
      file_naming_pattern: settings.fileNamingPattern,
      export_scope: settings.exportScope,
      updated_at: now
    }
    if (existing) {
      getDb()
        .prepare(
          `UPDATE project_export_settings SET
             export_format = @export_format, jpg_quality = @jpg_quality,
             destination_path = @destination_path, file_naming_pattern = @file_naming_pattern,
             export_scope = @export_scope, updated_at = @updated_at
           WHERE project_id = @project_id`
        )
        .run(params)
    } else {
      getDb()
        .prepare(
          `INSERT INTO project_export_settings
             (id, project_id, export_format, jpg_quality, destination_path, file_naming_pattern, export_scope, created_at, updated_at)
           VALUES (@id, @project_id, @export_format, @jpg_quality, @destination_path, @file_naming_pattern, @export_scope, @created_at, @updated_at)`
        )
        .run({ ...params, id: uuid(), created_at: now })
    }
  }
}
