import { readFile } from 'node:fs/promises'
import { dialog } from 'electron'
import { getDb } from '../db/connection'
import { nowIso } from '../repositories/mappers'
import { assetsRepo } from '../repositories/assets.repo'
import { projectsRepo } from '../repositories/projects.repo'
import { importImageFile } from '../fs/assetStore'
import type { OriginalAsset } from '@shared/types'

const ACCEPTED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'tif', 'tiff']

export const assetService = {
  async pickFiles(): Promise<string[]> {
    const result = await dialog.showOpenDialog({
      title: 'Adicionar Fotos',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Imagens', extensions: ACCEPTED_EXT }]
    })
    return result.canceled ? [] : result.filePaths
  },

  async dataUrl({ path }: { path: string }): Promise<string> {
    const buffer = await readFile(path)
    const ext = path.split('.').pop()?.toLowerCase() ?? 'jpg'
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
    return `data:${mime};base64,${buffer.toString('base64')}`
  },

  /**
   * Importa fotos para o POOL do projeto (sem criar páginas/camadas).
   * Faz dedup por checksum. As fotos ficam disponíveis para arrastar/clicar nas páginas.
   */
  async importToPool(input: {
    projectId: string
    paths: string[]
  }): Promise<{ assets: OriginalAsset[]; imported: number; deduped: number }> {
    const project = projectsRepo.getById(input.projectId)
    if (!project) throw new Error(`Projeto ${input.projectId} não encontrado`)
    const now = nowIso()

    // Etapa de IO (fora da transação): copia arquivos, gera thumbnails, resolve dedup.
    let imported = 0
    let deduped = 0
    const resolved: OriginalAsset[] = []
    const toInsert: OriginalAsset[] = []

    for (const path of input.paths) {
      const file = await importImageFile(input.projectId, path)
      const existing = assetsRepo.findByChecksum(input.projectId, file.checksum)
      if (existing) {
        deduped += 1
        resolved.push(existing)
        continue
      }
      const asset: OriginalAsset = {
        id: file.id,
        projectId: input.projectId,
        sourcePath: file.sourcePath,
        internalCopyPath: file.internalCopyPath,
        fileName: file.fileName,
        mimeType: file.mimeType,
        width: file.width,
        height: file.height,
        sizeBytes: file.sizeBytes,
        checksum: file.checksum,
        createdAt: now
      }
      imported += 1
      resolved.push(asset)
      toInsert.push(asset)
    }

    getDb().transaction(() => {
      for (const asset of toInsert) assetsRepo.insert(asset)
    })()

    return { assets: resolved, imported, deduped }
  }
}
