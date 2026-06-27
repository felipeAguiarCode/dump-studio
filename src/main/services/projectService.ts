import { v4 as uuid } from 'uuid'
import { getDb } from '../db/connection'
import { nowIso } from '../repositories/mappers'
import { projectsRepo, type ProjectRow } from '../repositories/projects.repo'
import { dumpItemsRepo, rowToDumpItem } from '../repositories/dumpItems.repo'
import { layersRepo } from '../repositories/layers.repo'
import { assetsRepo } from '../repositories/assets.repo'
import { uiStateRepo } from '../repositories/uiState.repo'
import { exportSettingsRepo } from '../repositories/exportSettings.repo'
import { preferencesService } from './preferencesService'
import { createDumpItem, createProject } from './factories'
import { createDefaultUiState } from '@shared/defaults'
import { INSTAGRAM_FORMATS, type InstagramFormat } from '@shared/constants'
import type { CreateProjectInput } from '@shared/ipc/contract'
import type { DumpItem, Layer, Project, ProjectSummary } from '@shared/types'

function projectToRow(p: Project): ProjectRow {
  return {
    id: p.id,
    name: p.name,
    format: p.format,
    default_export_format: p.defaultExportFormat,
    default_export_quality: p.defaultExportQuality,
    last_opened_at: p.lastOpenedAt ?? null,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    archived_at: p.archivedAt ?? null
  }
}

function assembleProject(id: string): Project | null {
  const row = projectsRepo.getById(id)
  if (!row) return null
  const itemRows = dumpItemsRepo.listByProject(id)
  const dumpItems: DumpItem[] = itemRows.map((ir) => {
    const di = rowToDumpItem(ir)
    di.layers = layersRepo.listByDumpItem(ir.id)
    return di
  })
  return {
    id: row.id,
    name: row.name,
    format: row.format as InstagramFormat,
    defaultExportFormat: row.default_export_format as 'jpg' | 'png',
    defaultExportQuality: row.default_export_quality,
    dumpItems,
    assets: assetsRepo.listByProject(id),
    lastOpenedAt: row.last_opened_at ?? undefined,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export const projectService = {
  list(includeArchived = false): ProjectSummary[] {
    return projectsRepo.listSummaries(includeArchived)
  },

  create(input: CreateProjectInput): Project {
    const prefs = preferencesService.get()
    const now = nowIso()
    const project = createProject(input, prefs, now)

    getDb().transaction(() => {
      projectsRepo.insert(projectToRow(project))
      exportSettingsRepo.upsert({
        projectId: project.id,
        exportFormat: prefs.exportDefaults.format,
        jpgQuality: prefs.exportDefaults.jpgQuality,
        destinationPath: prefs.exportDefaults.destinationPath,
        fileNamingPattern: prefs.exportDefaults.fileNamingPattern,
        exportScope: prefs.exportDefaults.exportScope
      })

      const ui = createDefaultUiState(project.id, now)
      ui.filmstripCollapsed = prefs.appearance.defaultFilmstripCollapsed
      ui.quickMenu.gridEnabled = prefs.appearance.showGridByDefault
      ui.quickMenu.smartGuidesEnabled = prefs.appearance.showSmartGuidesByDefault
      ui.quickMenu.snapEnabled = prefs.appearance.snapByDefault

      if (prefs.projectDefaults.createFirstDumpItemAutomatically) {
        const di = createDumpItem(project.id, project.format, 0, now)
        dumpItemsRepo.insert(di)
        di.layers.forEach((l) => layersRepo.insert(l))
        ui.activeDumpItemId = di.id
      }
      uiStateRepo.upsert(ui)
    })()

    return assembleProject(project.id)!
  },

  open(id: string): Project {
    projectsRepo.touchOpened(id)
    const project = assembleProject(id)
    if (!project) throw new Error(`Projeto ${id} não encontrado`)
    return project
  },

  rename(id: string, name: string): void {
    projectsRepo.update(id, { name })
  },

  setFormat(id: string, format: InstagramFormat): Project {
    const spec = INSTAGRAM_FORMATS[format]
    getDb().transaction(() => {
      projectsRepo.update(id, { format })
      const items = dumpItemsRepo.listByProject(id)
      for (const ir of items) {
        const oldW = ir.canvas_width
        const oldH = ir.canvas_height
        const sx = spec.width / oldW
        const sy = spec.height / oldH
        dumpItemsRepo.updateCanvas(ir.id, { width: spec.width, height: spec.height, format })
        // Reescala transformações das camadas para manter posição relativa.
        const layers = layersRepo.listByDumpItem(ir.id)
        for (const l of layers) {
          if (l.type === 'background') continue
          layersRepo.update(l.id, {
            transform: {
              ...l.transform,
              x: l.transform.x * sx,
              y: l.transform.y * sy,
              width: l.transform.width * sx,
              height: l.transform.height * sy
            }
          })
        }
      }
    })()
    return assembleProject(id)!
  },

  archive(id: string, archived: boolean): void {
    projectsRepo.update(id, { archived_at: archived ? nowIso() : null })
  },

  delete(id: string): void {
    // Cascade remove dump items, layers, ajustes, filtros, crops, ui state, snapshots e assets.
    projectsRepo.delete(id)
  },

  /** Substitui toda a árvore do projeto (ids preservados). Base de undo/redo e restore de snapshot. */
  replaceTree(project: Project): void {
    getDb().transaction(() => {
      projectsRepo.update(project.id, {
        name: project.name,
        format: project.format,
        default_export_format: project.defaultExportFormat,
        default_export_quality: project.defaultExportQuality
      })
      dumpItemsRepo.deleteByProject(project.id)
      project.dumpItems.forEach((di, idx) => {
        dumpItemsRepo.insert({ ...di, orderIndex: idx })
        di.layers.forEach((l) => layersRepo.insert(l))
      })
    })()
  },

  duplicate(id: string): Project {
    const source = assembleProject(id)
    if (!source) throw new Error(`Projeto ${id} não encontrado`)
    const now = nowIso()
    const newId = uuid()

    getDb().transaction(() => {
      projectsRepo.insert({
        id: newId,
        name: `${source.name} (cópia)`,
        format: source.format,
        default_export_format: source.defaultExportFormat,
        default_export_quality: source.defaultExportQuality,
        last_opened_at: now,
        created_at: now,
        updated_at: now,
        archived_at: null
      })
      exportSettingsRepo.upsert({
        projectId: newId,
        exportFormat: source.defaultExportFormat,
        jpgQuality: source.defaultExportQuality,
        fileNamingPattern: 'noir-dump-{index}',
        exportScope: 'all'
      })
      const ui = createDefaultUiState(newId, now)

      // Duplica o pool de assets (novos ids, mesmo arquivo em disco) e remapeia nas camadas.
      const assetIdMap = new Map<string, string>()
      for (const asset of source.assets) {
        const newAssetId = uuid()
        assetIdMap.set(asset.id, newAssetId)
        assetsRepo.insert({ ...asset, id: newAssetId, projectId: newId, createdAt: now })
      }

      let firstItemId: string | undefined
      for (const di of source.dumpItems) {
        const newDi: DumpItem = { ...di, id: uuid(), projectId: newId, createdAt: now, updatedAt: now, layers: [] }
        if (!firstItemId) firstItemId = newDi.id
        dumpItemsRepo.insert(newDi)
        for (const layer of di.layers) {
          let data = layer.data
          if (layer.type === 'image') {
            const d = layer.data as { assetId: string }
            data = { ...d, assetId: assetIdMap.get(d.assetId) ?? d.assetId }
          }
          layersRepo.insert({ ...layer, id: uuid(), dumpItemId: newDi.id, data, createdAt: now, updatedAt: now })
        }
      }
      ui.activeDumpItemId = firstItemId
      uiStateRepo.upsert(ui)
    })()

    return assembleProject(newId)!
  },

  assemble: assembleProject
}
