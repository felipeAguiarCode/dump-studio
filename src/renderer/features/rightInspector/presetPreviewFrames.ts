import { DEFAULT_FILTER, DEFAULT_ADJUSTMENTS, DEFAULT_IMAGE_BORDER, DEFAULT_SHADERS } from '@shared/defaults'
import { applyPhotoLook, linkedPresetFx } from '@shared/photoPresets'
import type { DumpItem, ImageLayerData, Layer, PhotoLook } from '@shared/types'

export const SAMPLE_ASSET_ID = 'preset-demo-photo'

export const SAMPLE_PAGE: DumpItem = {
  id: 'preset-demo-page',
  projectId: 'preset-demo',
  orderIndex: 0,
  title: '',
  createdAt: '',
  updatedAt: '',
  canvas: { width: 720, height: 900, format: 'feed_4_5', backgroundColor: '#ffffff', showGrid: false, showGuides: false },
  layers: [{
    id: SAMPLE_ASSET_ID,
    dumpItemId: 'preset-demo-page',
    type: 'image',
    name: '',
    visible: true,
    locked: false,
    opacity: 1,
    orderIndex: 0,
    transform: { x: 0, y: 0, width: 720, height: 900, rotation: 0, scaleX: 1, scaleY: 1 },
    data: { assetId: SAMPLE_ASSET_ID, sourcePath: '', originalWidth: 1200, originalHeight: 1800 },
    createdAt: '',
    updatedAt: ''
  }]
}

export interface PresetFrame {
  key: 'before' | 'filter' | 'adjustments' | 'textures' | 'finish' | 'fx' | 'after'
  page: DumpItem
}

export function buildPresetFrames(page: DumpItem, image: Layer, look: PhotoLook): PresetFrame[] {
  // The real preset path defines the final look and FX placement. These are detached render inputs.
  const editable: DumpItem = { ...page, layers: page.layers.map((layer) => layer.id === image.id ? { ...layer, locked: false } : layer) }
  const after = applyPhotoLook(editable, image.id, look, look.fx.map((_, index) => `preview-fx-${index}`), image.updatedAt)
  const finalImage = after.layers.find((layer) => layer.id === image.id)!
  const originalData = image.data as ImageLayerData
  const finalData = finalImage.data as ImageLayerData
  const frames: PresetFrame[] = [{ key: 'before', page }]
  let partial = { ...image, data: { ...originalData } }
  const push = (key: PresetFrame['key'], patch: Partial<Layer>, data: Partial<ImageLayerData> = {}): void => {
    partial = { ...partial, ...patch, data: { ...partial.data, ...data } }
    frames.push({ key, page: { ...page, layers: page.layers.map((layer) => layer.id === image.id ? partial : layer) } })
  }
  const differs = (a: unknown, b: unknown): boolean => JSON.stringify(a) !== JSON.stringify(b)

  if (differs(image.filter ?? DEFAULT_FILTER, finalImage.filter)) {
    push('filter', { filter: finalImage.filter })
  }
  if (differs({ ...DEFAULT_ADJUSTMENTS, ...image.adjustments }, finalImage.adjustments) || originalData.cameraLook !== finalData.cameraLook) {
    push('adjustments', { adjustments: finalImage.adjustments }, { cameraLook: finalData.cameraLook })
  }
  if (differs({ ...DEFAULT_SHADERS, ...originalData.shaders }, finalData.shaders)) {
    push('textures', {}, { shaders: finalData.shaders })
  }
  if (differs(originalData.border ?? DEFAULT_IMAGE_BORDER, finalData.border) || image.opacity !== finalImage.opacity) {
    push('finish', { opacity: finalImage.opacity }, { border: finalData.border })
  }
  if (look.fx.length || linkedPresetFx(page, image.id).length) frames.push({ key: 'fx', page: after })
  if (frames.length === 1) frames.push({ key: 'after', page: after })
  else frames[frames.length - 1] = { ...frames[frames.length - 1], page: after }
  return frames
}
