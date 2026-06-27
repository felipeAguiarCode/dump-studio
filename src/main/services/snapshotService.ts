import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { v4 as uuid } from 'uuid'
import { snapshotsRepo } from '../repositories/snapshots.repo'
import { projectService } from './projectService'
import { snapshotsDir } from '../fs/paths'
import type { Project, ProjectSnapshot } from '@shared/types'
import type { ProjectSnapshotPayload } from '@shared/types'

export const snapshotService = {
  list(projectId: string): ProjectSnapshot[] {
    return snapshotsRepo.list(projectId)
  },

  async create(input: { projectId: string; name: string; thumbnailDataUrl?: string }): Promise<ProjectSnapshot> {
    const project = projectService.assemble(input.projectId)
    if (!project) throw new Error('Projeto não encontrado')

    let thumbnailPath: string | undefined
    if (input.thumbnailDataUrl) {
      thumbnailPath = join(snapshotsDir(input.projectId), `${uuid()}.jpg`)
      const data = input.thumbnailDataUrl.replace(/^data:image\/\w+;base64,/, '')
      await writeFile(thumbnailPath, Buffer.from(data, 'base64')).catch(() => {
        thumbnailPath = undefined
      })
    }

    const payload: ProjectSnapshotPayload = { project, capturedAt: new Date().toISOString() }
    return snapshotsRepo.insert(input.projectId, input.name, JSON.stringify(payload), thumbnailPath)
  },

  restore(snapshotId: string): Project {
    const row = snapshotsRepo.getJson(snapshotId)
    if (!row) throw new Error('Snapshot não encontrado')
    const payload = JSON.parse(row.json) as ProjectSnapshotPayload
    projectService.replaceTree(payload.project)
    return projectService.assemble(row.projectId)!
  },

  rename(snapshotId: string, name: string): void {
    snapshotsRepo.rename(snapshotId, name)
  },

  delete(snapshotId: string): void {
    snapshotsRepo.delete(snapshotId)
  }
}
