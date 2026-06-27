import type { Project } from './domain'

export interface ProjectSnapshot {
  id: string
  projectId: string
  name: string
  thumbnailPath?: string
  createdAt: string
}

/** Payload completo armazenado em project_snapshots.snapshot_json. */
export interface ProjectSnapshotPayload {
  project: Project
  capturedAt: string
}

export interface ProjectExportSettings {
  projectId: string
  exportFormat: 'jpg' | 'png'
  jpgQuality: number
  destinationPath?: string
  fileNamingPattern: string
  exportScope: 'current' | 'all'
}
