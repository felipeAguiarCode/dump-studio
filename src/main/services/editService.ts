import { v4 as uuid } from 'uuid'
import { getDb } from '../db/connection'
import { nowIso } from '../repositories/mappers'
import { dumpItemsRepo, rowToDumpItem } from '../repositories/dumpItems.repo'
import { layersRepo } from '../repositories/layers.repo'
import { assetsRepo } from '../repositories/assets.repo'
import { projectsRepo } from '../repositories/projects.repo'
import { createBackgroundLayer, createDumpItem, createImageLayer } from './factories'
import { preferencesService } from './preferencesService'
import type { AddLayerInput } from '@shared/ipc/contract'
import type { DumpItem, ImageLayerData, InstagramFormat, Layer } from '@shared/types'

function assembleDumpItem(id: string): DumpItem {
  const row = dumpItemsRepo.getById(id)
  if (!row) throw new Error(`Dump item ${id} não encontrado`)
  const di = rowToDumpItem(row)
  di.layers = layersRepo.listByDumpItem(id)
  return di
}

export const editService = {
  addDumpItem(projectId: string, afterId?: string): DumpItem {
    const project = projectsRepo.getById(projectId)
    if (!project) throw new Error(`Projeto ${projectId} não encontrado`)
    const now = nowIso()
    const orderIndex = dumpItemsRepo.nextOrderIndex(projectId)
    const di = createDumpItem(projectId, project.format as InstagramFormat, orderIndex, now)

    getDb().transaction(() => {
      dumpItemsRepo.insert(di)
      di.layers.forEach((l) => layersRepo.insert(l))
      if (afterId) {
        const items = dumpItemsRepo.listByProject(projectId).map((r) => r.id)
        const filtered = items.filter((iid) => iid !== di.id)
        const at = filtered.indexOf(afterId)
        const ordered = at >= 0 ? [...filtered.slice(0, at + 1), di.id, ...filtered.slice(at + 1)] : filtered.concat(di.id)
        dumpItemsRepo.reorder(projectId, ordered)
      }
    })()
    return assembleDumpItem(di.id)
  },

  duplicateDumpItem(id: string): DumpItem {
    const source = assembleDumpItem(id)
    const now = nowIso()
    const newId = uuid()
    const orderIndex = dumpItemsRepo.nextOrderIndex(source.projectId)

    getDb().transaction(() => {
      const copy: DumpItem = { ...source, id: newId, orderIndex, title: `${source.title} (cópia)`, createdAt: now, updatedAt: now, layers: [] }
      dumpItemsRepo.insert(copy)
      for (const layer of source.layers) {
        layersRepo.insert({ ...layer, id: uuid(), dumpItemId: newId, createdAt: now, updatedAt: now })
      }
      // Posiciona logo após a original.
      const items = dumpItemsRepo.listByProject(source.projectId).map((r) => r.id).filter((iid) => iid !== newId)
      const at = items.indexOf(id)
      const ordered = at >= 0 ? [...items.slice(0, at + 1), newId, ...items.slice(at + 1)] : items.concat(newId)
      dumpItemsRepo.reorder(source.projectId, ordered)
    })()
    return assembleDumpItem(newId)
  },

  deleteDumpItem(id: string): void {
    dumpItemsRepo.delete(id)
  },

  addLayer(input: AddLayerInput): Layer {
    const row = dumpItemsRepo.getById(input.dumpItemId)
    if (!row) throw new Error(`Dump item ${input.dumpItemId} não encontrado`)
    const di = rowToDumpItem(row)
    const now = nowIso()
    const orderIndex = layersRepo.nextOrderIndex(input.dumpItemId)

    let layer: Layer
    if (input.type === 'image') {
      if (!input.assetId) throw new Error('Camada de imagem requer assetId')
      const asset = assetsRepo.getById(input.assetId)
      if (!asset) throw new Error(`Asset ${input.assetId} não encontrado`)
      const prefs = preferencesService.get()
      layer = createImageLayer(input.dumpItemId, asset, orderIndex, di.canvas, now, prefs)
      if (input.name) layer.name = input.name
      if (input.position) {
        layer.transform.x = input.position.x - layer.transform.width / 2
        layer.transform.y = input.position.y - layer.transform.height / 2
      }
    } else if (input.type === 'background') {
      layer = createBackgroundLayer(input.dumpItemId, now)
      layer.orderIndex = orderIndex
    } else {
      const data = { ...defaultLayerData(input.type), ...(input.data ?? {}) }
      const kind = (data as { shape?: string }).shape
      const squareish = input.type === 'shape' && (kind === 'square' || kind === 'circle')
      const baseW = di.canvas.width * 0.5
      const baseH = input.type === 'text' ? 120 : di.canvas.height * 0.5
      const w = squareish ? Math.min(baseW, baseH) : baseW
      const h = squareish ? Math.min(baseW, baseH) : baseH
      layer = {
        id: uuid(),
        dumpItemId: input.dumpItemId,
        type: input.type,
        name: input.name ?? defaultLayerName(input.type),
        visible: true,
        locked: false,
        opacity: 1,
        orderIndex,
        groupId: null,
        transform: {
          x: (di.canvas.width - w) / 2,
          y: (di.canvas.height - h) / 2,
          width: w,
          height: h,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          ...input.transform
        },
        data,
        createdAt: now,
        updatedAt: now
      }
    }

    layersRepo.insert(layer)
    return layersRepo.assemble(layersRepo.getRow(layer.id)!)
  },

  duplicateLayer(id: string): Layer {
    const row = layersRepo.getRow(id)
    if (!row) throw new Error(`Camada ${id} não encontrada`)
    const source = layersRepo.assemble(row)
    const now = nowIso()
    const orderIndex = layersRepo.nextOrderIndex(source.dumpItemId)
    const copy: Layer = {
      ...source,
      id: uuid(),
      name: `${source.name} (cópia)`,
      orderIndex,
      transform: { ...source.transform, x: source.transform.x + 24, y: source.transform.y + 24 },
      adjustments: source.adjustments ? { ...source.adjustments } : undefined,
      filter: source.filter ? { ...source.filter } : undefined,
      crop: source.crop ? { ...source.crop } : undefined,
      createdAt: now,
      updatedAt: now
    }
    layersRepo.insert(copy)
    return layersRepo.assemble(layersRepo.getRow(copy.id)!)
  },

  deleteLayer(id: string): void {
    layersRepo.delete(id)
  },

  /** Cola cópias das camadas na página alvo (novos ids, deslocadas). */
  pasteLayers(dumpItemId: string, layers: Layer[]): Layer[] {
    const row = dumpItemsRepo.getById(dumpItemId)
    if (!row) throw new Error(`Dump item ${dumpItemId} não encontrado`)
    const projectId = row.project_id
    const now = nowIso()
    const created: Layer[] = []

    getDb().transaction(() => {
      let order = layersRepo.nextOrderIndex(dumpItemId)
      for (const src of layers) {
        if (src.type === 'background') continue
        if (src.type === 'image') {
          const assetId = (src.data as ImageLayerData).assetId
          const asset = assetsRepo.getById(assetId)
          if (!asset || asset.projectId !== projectId) continue // asset não pertence a este projeto
        }
        const copy: Layer = {
          ...src,
          id: uuid(),
          dumpItemId,
          orderIndex: order++,
          transform: { ...src.transform, x: src.transform.x + 24, y: src.transform.y + 24 },
          adjustments: src.adjustments ? { ...src.adjustments } : undefined,
          filter: src.filter ? { ...src.filter } : undefined,
          crop: src.crop ? { ...src.crop, rect: { ...src.crop.rect } } : undefined,
          createdAt: now,
          updatedAt: now
        }
        layersRepo.insert(copy)
        created.push(layersRepo.assemble(layersRepo.getRow(copy.id)!))
      }
    })()
    return created
  }
}

function defaultLayerName(type: Layer['type']): string {
  switch (type) {
    case 'text':
      return 'Text'
    case 'shape':
      return 'Shape'
    case 'border':
      return 'Border'
    case 'overlay':
      return 'Overlay'
    default:
      return 'Layer'
  }
}

function defaultLayerData(type: Layer['type']): Record<string, unknown> {
  switch (type) {
    case 'text':
      return { text: 'Text', fontFamily: 'Inter Variable', fontSize: 64, fontWeight: 500, color: '#F2F2F2', align: 'left' }
    case 'shape':
      return { shape: 'rectangle', fill: 'transparent', stroke: '#F5F5F5', strokeWidth: 4, cornerRadius: 0 }
    case 'border':
      return { color: '#FFFFFF', thickness: 24, cornerRadius: 0, gutter: 16 }
    case 'overlay':
      return { overlayId: '', flipX: false, flipY: false, color: '#000000' }
    default:
      return {}
  }
}
