import { getDb } from '../db/connection'
import { nowIso } from '../repositories/mappers'
import { projectsRepo } from '../repositories/projects.repo'
import { dumpItemsRepo } from '../repositories/dumpItems.repo'
import { layersRepo } from '../repositories/layers.repo'
import { uiStateRepo } from '../repositories/uiState.repo'
import { exportSettingsRepo } from '../repositories/exportSettings.repo'
import { createDefaultUiState } from '@shared/defaults'
import type { AutosavePatch } from '@shared/ipc/contract'
import type { InstagramFormat } from '@shared/constants'

/**
 * Aplica um lote de patches de autosave em uma única transação.
 * Cada patch é roteado ao repository correto — ajustes/filtros/crops gravam SEMPRE
 * por layer_id, nunca globalmente no canvas (regra crítica §0).
 */
export const autosaveService = {
  apply(patches: AutosavePatch[]): { savedAt: string } {
    if (patches.length) {
      getDb().transaction(() => {
        for (const patch of patches) applyOne(patch)
      })()
    }
    return { savedAt: nowIso() }
  }
}

function applyOne(patch: AutosavePatch): void {
  switch (patch.kind) {
    case 'project':
      projectsRepo.update(patch.id, {
        name: patch.data.name,
        format: patch.data.format as InstagramFormat | undefined,
        default_export_format: patch.data.defaultExportFormat,
        default_export_quality: patch.data.defaultExportQuality
      })
      break

    case 'dumpItem':
      dumpItemsRepo.updateMeta(patch.id, {
        title: patch.data.title,
        previewPath: patch.data.previewPath
      })
      break

    case 'canvas':
      dumpItemsRepo.updateCanvas(patch.dumpItemId, patch.data)
      break

    case 'layer':
      layersRepo.update(patch.id, patch.data)
      break

    case 'adjustments':
      layersRepo.updateAdjustments(patch.layerId, patch.data)
      break

    case 'filter':
      layersRepo.updateFilter(patch.layerId, patch.data)
      break

    case 'crop':
      layersRepo.updateCrop(patch.layerId, patch.data)
      break

    case 'uiState': {
      const current = uiStateRepo.get(patch.projectId) ?? createDefaultUiState(patch.projectId, nowIso())
      uiStateRepo.upsert({
        ...current,
        ...patch.data,
        projectId: patch.projectId,
        quickMenu: { ...current.quickMenu, ...(patch.data.quickMenu ?? {}) }
      })
      break
    }

    case 'exportSettings': {
      const current = exportSettingsRepo.get(patch.projectId)
      exportSettingsRepo.upsert({
        projectId: patch.projectId,
        exportFormat: patch.data.exportFormat ?? current?.exportFormat ?? 'jpg',
        jpgQuality: patch.data.jpgQuality ?? current?.jpgQuality ?? 90,
        destinationPath: patch.data.destinationPath ?? current?.destinationPath,
        fileNamingPattern: patch.data.fileNamingPattern ?? current?.fileNamingPattern ?? 'noir-dump-{index}',
        exportScope: patch.data.exportScope ?? current?.exportScope ?? 'all'
      })
      break
    }

    case 'reorderDumpItems':
      dumpItemsRepo.reorder(patch.projectId, patch.orderedIds)
      break

    case 'reorderLayers':
      layersRepo.reorder(patch.dumpItemId, patch.orderedIds)
      break
  }
}
