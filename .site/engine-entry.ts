import { getGLContext } from '../src/engine/pipeline/glContext'
import { buildUniforms } from '../src/engine/pipeline/params'
import { DEFAULT_ADJUSTMENTS, DEFAULT_CROP, DEFAULT_SHADERS } from '../src/shared/defaults'
import type { PhotoFilterName } from '../src/shared/types'

/** The demo uses the same WebGL processing as the desktop app. No Electron/IPC or uploads. */
export function renderPhoto(image: HTMLImageElement, filter: PhotoFilterName | null, intensity = 80, grain = false): HTMLCanvasElement {
  const maxSide = 1400
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  const adjustments = structuredClone(DEFAULT_ADJUSTMENTS)
  const shaders = { ...DEFAULT_SHADERS, filmGrain: grain ? 20 : 0 }
  const uniforms = buildUniforms(adjustments, { name: filter, intensity }, 1080, 42, DEFAULT_CROP, shaders)
  getGLContext().process(image.src, image, uniforms, canvas, image.naturalWidth * scale, image.naturalHeight * scale)
  return canvas
}
