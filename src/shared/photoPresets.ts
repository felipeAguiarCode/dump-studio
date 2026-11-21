import { DEFAULT_ADJUSTMENTS, DEFAULT_FILTER, DEFAULT_IMAGE_BORDER, DEFAULT_SHADERS } from './defaults'
import { slotRectToTransform } from './layoutGeometry'
import type { DumpItem, ImageLayerData, Layer, OverlayLayerData, PhotoLook } from './types'

export function photoGeometry(item: DumpItem, image: Layer): Layer['transform'] {
  const index = (image.data as ImageLayerData).slotIndex
  const layout = item.canvas.layout
  return index != null && layout?.slots[index]
    ? { ...image.transform, ...slotRectToTransform(layout.slots[index], item.canvas, layout.gutter) }
    : image.transform
}

export function linkedPresetFx(item: DumpItem, imageId: string): Layer[] {
  return item.layers.filter((layer) => layer.type === 'overlay' && (layer.data as OverlayLayerData).imageLayerId === imageId)
}

export function remapFxOwner(layer: Layer, ids: Map<string, string>, keepExisting = false): Layer['data'] {
  if (layer.type !== 'overlay') return layer.data
  const data = layer.data as OverlayLayerData
  if (!data.imageLayerId) return data
  return { ...data, imageLayerId: ids.get(data.imageLayerId) ?? (keepExisting ? data.imageLayerId : undefined) }
}

export function capturePhotoLook(item: DumpItem, imageId: string, fxIds?: string[]): PhotoLook {
  const image = item.layers.find((layer) => layer.id === imageId && layer.type === 'image')
  if (!image) throw new Error('Photo not found')
  const geo = photoGeometry(item, image)
  if (geo.width <= 0 || geo.height <= 0) throw new Error('Invalid photo dimensions')
  const data = image.data as ImageLayerData
  const selected = new Set(fxIds ?? linkedPresetFx(item, imageId).filter((fx) => fx.visible).map((fx) => fx.id))
  const rad = geo.rotation * Math.PI / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  return structuredClone({
    adjustments: { ...DEFAULT_ADJUSTMENTS, ...image.adjustments },
    filter: image.filter ?? DEFAULT_FILTER,
    shaders: { ...DEFAULT_SHADERS, ...data.shaders },
    cameraLook: data.cameraLook,
    border: data.border ?? DEFAULT_IMAGE_BORDER,
    opacity: image.opacity,
    referenceSize: { width: geo.width, height: geo.height },
    fx: item.layers.filter((fx) => fx.type === 'overlay' && selected.has(fx.id)).sort((a, b) => a.orderIndex - b.orderIndex).map((fx) => {
      const d = fx.data as OverlayLayerData, t = fx.transform
      const dx = t.x - geo.x, dy = t.y - geo.y
      return {
        name: fx.name.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 120) || 'FX', overlayId: d.overlayId, color: d.color ?? '#000000', opacity: fx.opacity,
        flipX: d.flipX, flipY: d.flipY,
        x: (dx * cos + dy * sin) / geo.width, y: (-dx * sin + dy * cos) / geo.height,
        width: t.width / geo.width, height: t.height / geo.height,
        rotation: t.rotation - geo.rotation, behind: fx.orderIndex < image.orderIndex, clipToSlot: d.slotIndex != null
      }
    })
  })
}

/** One replacement, preserving every unrelated layer and the target photo's identity/geometry. */
export function applyPhotoLook(item: DumpItem, imageId: string, look: PhotoLook, fxIds: string[], now: string): DumpItem {
  const next = structuredClone(item)
  const image = next.layers.find((layer) => layer.id === imageId && layer.type === 'image')
  if (!image || image.locked) throw new Error('Select an unlocked photo')
  if (fxIds.length !== look.fx.length) throw new Error('Invalid FX identifiers')
  const data = image.data as ImageLayerData
  const geo = photoGeometry(next, image)
  const scale = Math.min(geo.width / look.referenceSize.width, geo.height / look.referenceSize.height)
  image.adjustments = structuredClone(look.adjustments)
  image.filter = { ...look.filter }
  data.shaders = { ...look.shaders }
  if (look.cameraLook) data.cameraLook = look.cameraLook
  else delete data.cameraLook
  data.border = { ...look.border, width: look.border.width * scale, radius: {
    tl: look.border.radius.tl * scale, tr: look.border.radius.tr * scale,
    bl: look.border.radius.bl * scale, br: look.border.radius.br * scale
  } }
  image.opacity = look.opacity
  image.updatedAt = now
  next.layers = next.layers.filter((layer) => layer.type !== 'overlay' || (layer.data as OverlayLayerData).imageLayerId !== imageId)
  next.layers.sort((a, b) => a.orderIndex - b.orderIndex)
  const rad = geo.rotation * Math.PI / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  const overlays: Layer[] = look.fx.map((fx, index) => ({
    id: fxIds[index], dumpItemId: item.id, type: 'overlay', name: fx.name, visible: true, locked: false,
    opacity: fx.opacity, orderIndex: 0, groupId: null,
    transform: {
      x: geo.x + fx.x * geo.width * cos - fx.y * geo.height * sin,
      y: geo.y + fx.x * geo.width * sin + fx.y * geo.height * cos,
      width: fx.width * geo.width, height: fx.height * geo.height,
      rotation: geo.rotation + fx.rotation, scaleX: 1, scaleY: 1
    },
    data: { overlayId: fx.overlayId, color: fx.color, flipX: fx.flipX, flipY: fx.flipY,
      imageLayerId: imageId, ...((fx.clipToSlot || !fx.behind) && data.slotIndex != null ? { slotIndex: data.slotIndex } : {}) },
    createdAt: now, updatedAt: now
  }))
  const at = next.layers.findIndex((layer) => layer.id === imageId)
  next.layers.splice(at, 1, ...overlays.filter((_, index) => look.fx[index].behind), image, ...overlays.filter((_, index) => !look.fx[index].behind))
  next.layers.forEach((layer, index) => { layer.orderIndex = index })
  return next
}
