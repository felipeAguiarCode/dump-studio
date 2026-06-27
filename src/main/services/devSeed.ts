import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { projectService } from './projectService'
import { assetService } from './assetService'
import { editService } from './editService'
import { projectsRepo } from '../repositories/projects.repo'
import { assetsRepo } from '../repositories/assets.repo'
import { uiStateRepo } from '../repositories/uiState.repo'
import { layersRepo } from '../repositories/layers.repo'

let autoOpenProjectId: string | null = null

export function getAutoOpenProjectId(): string | null {
  return autoOpenProjectId
}

/**
 * Seed de desenvolvimento, gated por env NOIR_SEED=<pasta de imagens>.
 * Cria um projeto e importa as imagens caso o banco esteja vazio.
 * Retorna o id do projeto a ser auto-aberto (ou null).
 */
export async function runDevSeed(): Promise<string | null> {
  const folder = process.env['NOIR_SEED']
  if (!folder) return null

  const existing = projectsRepo.listSummaries(true)
  if (existing.length > 0) {
    autoOpenProjectId = existing[0].id
    // Seleção de dev (gated) para verificar a aba Ajustes — só muda a seleção, não o conteúdo.
    if (process.env['NOIR_SEED_SELECT']) {
      const proj = projectService.assemble(existing[0].id)
      const page = proj?.dumpItems.find((d) => d.layers.some((l) => l.type === 'image')) ?? proj?.dumpItems[0]
      const img = page?.layers.find((l) => l.type === 'image')
      const ui = uiStateRepo.get(existing[0].id)
      if (ui && page) {
        uiStateRepo.upsert({
          ...ui,
          activeDumpItemId: page.id,
          selectedLayerId: img?.id ?? null,
          selectedLayerIds: img ? [img.id] : [],
          activeRightTab: 'adjustments'
        })
      }
    }
    return autoOpenProjectId
  }

  const project = projectService.create({ name: 'Dump Noturno', format: 'feed_4_5' })
  try {
    const files = readdirSync(folder)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .map((f) => join(folder, f))
    if (files.length) {
      await assetService.importToPool({ projectId: project.id, paths: files })
      // Demo: cria 1 página e adiciona a primeira foto do pool.
      const assets = assetsRepo.listByProject(project.id)
      if (assets.length) {
        const page = editService.addDumpItem(project.id)
        editService.addLayer({ dumpItemId: page.id, type: 'image', assetId: assets[0].id })
      }
    }
  } catch (e) {
    console.error('[seed] falha ao importar:', e)
  }
  const proj = projectService.assemble(project.id)
  const firstPage = proj?.dumpItems[0]
  const firstImg = firstPage?.layers.find((l) => l.type === 'image')
  if (firstPage) {
    const ui = uiStateRepo.get(project.id)
    if (ui) {
      uiStateRepo.upsert({
        ...ui,
        activeDumpItemId: firstPage.id,
        selectedLayerId: firstImg?.id ?? null,
        selectedLayerIds: firstImg ? [firstImg.id] : [],
        activeRightTab:
          (process.env['NOIR_SEED_TAB'] as 'adjustments' | 'filters' | 'crop') || ui.activeRightTab,
        quickMenu: process.env['NOIR_SEED_GRID']
          ? { ...ui.quickMenu, gridEnabled: true, gridType: '3x3', rulersEnabled: true, safeMarginsEnabled: true }
          : ui.quickMenu,
        leftSidebarCollapsed: !!process.env['NOIR_SEED_COLLAPSE'],
        rightSidebarCollapsed: !!process.env['NOIR_SEED_COLLAPSE']
      })
    }
    // Aplica um look noir de demonstração na primeira foto.
    if (firstImg) {
      layersRepo.updateAdjustments(firstImg.id, {
        contrast: 42,
        blackDepth: 38,
        whiteBoost: 24,
        noirCurve: 'high_contrast',
        grain: 16,
        vignette: 30
      })
    }
  }
  console.log(`[seed] projeto "${project.name}" com ${proj?.dumpItems.length ?? 0} página(s)`)
  autoOpenProjectId = project.id
  return project.id
}
