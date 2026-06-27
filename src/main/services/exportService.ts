import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { dialog } from 'electron'
import { projectsRepo } from '../repositories/projects.repo'
import type { ExportRequest, ExportResult } from '@shared/ipc/contract'

export const exportService = {
  async pickFolder(): Promise<string | null> {
    const res = await dialog.showOpenDialog({
      title: 'Pasta de destino',
      properties: ['openDirectory', 'createDirectory']
    })
    return res.canceled ? null : res.filePaths[0]
  },

  async run(req: ExportRequest): Promise<ExportResult> {
    try {
      if (!req.destinationPath) return { ok: false, writtenFiles: [], error: 'Pasta de destino não definida' }
      const project = projectsRepo.getById(req.projectId)
      const projectName = (project?.name ?? 'noir-dump').replace(/[^\p{L}\p{N}_-]+/gu, '-')
      const ext = req.format === 'png' ? 'png' : 'jpg'
      const written: string[] = []

      for (const img of req.images) {
        const idx = String(img.index + 1).padStart(2, '0')
        const base = req.fileNamingPattern
          .replace('{index}', idx)
          .replace('{project-name}', projectName)
          .replace('{name}', projectName)
        const fileName = `${base}.${ext}`
        const data = img.dataUrl.replace(/^data:image\/\w+;base64,/, '')
        await writeFile(join(req.destinationPath, fileName), Buffer.from(data, 'base64'))
        written.push(fileName)
      }
      return { ok: true, writtenFiles: written }
    } catch (e) {
      return { ok: false, writtenFiles: [], error: (e as Error).message }
    }
  }
}
