import { join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import { app } from 'electron'

export function ensureDir(dir: string): string {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

export function projectsRoot(): string {
  return join(app.getPath('userData'), 'projects')
}

export function assetsDir(projectId: string): string {
  return ensureDir(join(projectsRoot(), projectId, 'assets'))
}

export function thumbnailsDir(projectId: string): string {
  return ensureDir(join(projectsRoot(), projectId, 'thumbnails'))
}

export function snapshotsDir(projectId: string): string {
  return ensureDir(join(projectsRoot(), projectId, 'snapshots'))
}
