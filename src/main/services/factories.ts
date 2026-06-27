import { v4 as uuid } from 'uuid'
import { INSTAGRAM_FORMATS, type InstagramFormat } from '@shared/constants'
import { DEFAULT_ADJUSTMENTS, DEFAULT_CROP, DEFAULT_FILTER, DEFAULT_IMAGE_BORDER } from '@shared/defaults'
import type {
  CanvasSettings,
  DumpItem,
  ImageLayerData,
  Layer,
  OriginalAsset,
  Project,
  UserPreferences
} from '@shared/types'

export function createCanvasSettings(format: InstagramFormat): CanvasSettings {
  const spec = INSTAGRAM_FORMATS[format]
  return {
    width: spec.width,
    height: spec.height,
    format,
    backgroundColor: 'white',
    showGuides: true,
    showGrid: false
  }
}

export function createBackgroundLayer(dumpItemId: string, now: string): Layer {
  return {
    id: uuid(),
    dumpItemId,
    type: 'background',
    name: 'Background',
    visible: true,
    locked: true,
    opacity: 1,
    orderIndex: 0,
    groupId: null,
    transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    data: { color: 'white' },
    createdAt: now,
    updatedAt: now
  }
}

export function createDumpItem(
  projectId: string,
  format: InstagramFormat,
  orderIndex: number,
  now: string
): DumpItem {
  const id = uuid()
  return {
    id,
    projectId,
    orderIndex,
    title: `Foto ${String(orderIndex + 1).padStart(2, '0')}`,
    canvas: createCanvasSettings(format),
    layers: [createBackgroundLayer(id, now)],
    createdAt: now,
    updatedAt: now
  }
}

/** Cria uma camada de imagem centralizada e contida (fit) no canvas. */
export function createImageLayer(
  dumpItemId: string,
  asset: OriginalAsset,
  orderIndex: number,
  canvas: CanvasSettings,
  now: string,
  prefs?: UserPreferences
): Layer {
  const aw = asset.width ?? canvas.width
  const ah = asset.height ?? canvas.height
  const scale = Math.min(canvas.width / aw, canvas.height / ah)
  const width = aw * scale
  const height = ah * scale
  const data: ImageLayerData = {
    assetId: asset.id,
    sourcePath: asset.internalCopyPath,
    originalWidth: aw,
    originalHeight: ah,
    border: { ...DEFAULT_IMAGE_BORDER, radius: { ...DEFAULT_IMAGE_BORDER.radius } }
  }
  const filter = prefs?.editingDefaults.defaultFilterName
    ? { name: prefs.editingDefaults.defaultFilterName, intensity: prefs.editingDefaults.defaultFilterIntensity }
    : { ...DEFAULT_FILTER }
  const adjustments = {
    ...DEFAULT_ADJUSTMENTS,
    grain: prefs?.editingDefaults.defaultGrain ?? DEFAULT_ADJUSTMENTS.grain,
    vignette: prefs?.editingDefaults.defaultVignette ?? DEFAULT_ADJUSTMENTS.vignette
  }
  return {
    id: uuid(),
    dumpItemId,
    type: 'image',
    name: asset.fileName.replace(/\.[^.]+$/, '') || `Imagem ${orderIndex}`,
    visible: true,
    locked: false,
    opacity: 1,
    orderIndex,
    groupId: null,
    transform: {
      x: (canvas.width - width) / 2,
      y: (canvas.height - height) / 2,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    },
    data,
    adjustments,
    filter,
    crop: { ...DEFAULT_CROP },
    createdAt: now,
    updatedAt: now
  }
}

export function createProject(
  input: { name?: string; format?: InstagramFormat },
  prefs: UserPreferences,
  now: string
): Project {
  const format = input.format ?? prefs.projectDefaults.defaultFormat
  return {
    id: uuid(),
    name: input.name?.trim() || prefs.projectDefaults.defaultProjectName,
    format,
    defaultExportFormat: prefs.exportDefaults.format,
    defaultExportQuality: prefs.exportDefaults.jpgQuality,
    dumpItems: [],
    assets: [],
    lastOpenedAt: now,
    archivedAt: null,
    createdAt: now,
    updatedAt: now
  }
}
