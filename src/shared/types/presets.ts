import type { ImageBorderStyle, PhotoAdjustments, PhotoFilter, ShaderEffects } from './domain'

export interface PresetFx {
  name: string
  overlayId: string
  color: string
  opacity: number
  flipX: boolean
  flipY: boolean
  /** Geometry in the source photo's local coordinate space, normalized by its dimensions. */
  x: number
  y: number
  width: number
  height: number
  rotation: number
  behind: boolean
  clipToSlot: boolean
}

/** A reusable look contains no photo, path, crop, text or page layout. */
export interface PhotoLook {
  adjustments: PhotoAdjustments
  filter: PhotoFilter
  shaders: ShaderEffects
  cameraLook?: string
  border: ImageBorderStyle
  opacity: number
  referenceSize: { width: number; height: number }
  fx: PresetFx[]
}

export interface UserPreset {
  id: string
  name: string
  folderId: string | null
  look: PhotoLook
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export interface PresetFolder {
  id: string
  name: string
  parentId: string | null
  createdAt: string
}

export interface PresetLibrary {
  folders: PresetFolder[]
  presets: UserPreset[]
}

export interface PresetDocument {
  format: 'noir-photo-presets'
  version: 1
  folders: Pick<PresetFolder, 'id' | 'name' | 'parentId'>[]
  presets: (Pick<UserPreset, 'id' | 'name' | 'folderId' | 'look'> & { favorite?: boolean })[]
}
