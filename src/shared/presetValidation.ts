import { DEFAULT_ADJUSTMENTS, DEFAULT_SHADERS } from './defaults'
import type { PhotoAdjustments, PhotoLook, PresetDocument, PresetFx } from './types'

export const PRESET_JSON_LIMIT = 10 * 1024 * 1024
export const BUNDLED_FX_IDS = ['bottom-30', 'bottom-60', 'bottom-90', 'top-60', 'full-50', 'full-70', 'side-30', 'lateral-50', 'vignette-55', 'bar-line', 'bar', 'bar-soft', 'bar-curve', 'bar-curve-down', 'bar-feet', 'bar-thick', 'oval', 'oval-wide', 'blob', 'ellipse', 'card', 'card-angled', 'rect', 'rect-soft', 'rect-crisp', 'rect-square', 'rect-wide', 'rect-tall', 'rect-pill']

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object')
  return value as Record<string, unknown>
}
function num(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error('Invalid numeric setting')
  return value
}
function str(value: unknown, max = 120): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f]/.test(value)) throw new Error('Invalid name or identifier')
  return value.trim()
}
export const presetName = (value: unknown): string => str(value)
function bool(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new Error('Invalid boolean setting')
  return value
}
function color(value: unknown): string {
  if (typeof value !== 'string' || !/^#[\da-f]{6}$/i.test(value)) throw new Error('Invalid color')
  return value
}
function list(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) throw new Error('Invalid or oversized list')
  return value
}
function nullableId(value: unknown): string | null { return value == null ? null : str(value) }
function choice<T extends string>(value: unknown, values: readonly T[]): T {
  if (!values.includes(value as T)) throw new Error('Unsupported setting')
  return value as T
}

export function validatePhotoLook(value: unknown): PhotoLook {
  const root = object(value), raw = object(root.adjustments)
  const adjustments = structuredClone(DEFAULT_ADJUSTMENTS)
  for (const key of Object.keys(DEFAULT_ADJUSTMENTS) as (keyof PhotoAdjustments)[]) {
    if (raw[key] === undefined || typeof DEFAULT_ADJUSTMENTS[key] !== 'number') continue
    const ranges: Record<string, [number, number]> = {
      grainSize: [1, 10], grainRoughness: [0, 100], grain: [0, 100], bwIntensity: [0, 100], fade: [0, 100],
      sharpness: [0, 100], definition: [0, 100], noiseReduction: [0, 100], vignetteSoftness: [0, 100],
      vignetteIntensity: [0, 100], vignetteCenterX: [0, 1], vignetteCenterY: [0, 1], distortion: [-50, 50]
    }
    const [min, max] = ranges[key] ?? [-100, 100]
    ;(adjustments as unknown as Record<string, unknown>)[key] = num(raw[key], min, max)
  }
  if (raw.noirCurve !== undefined) adjustments.noirCurve = choice(raw.noirCurve, ['soft', 'classic', 'high_contrast', 'cinematic', 'vintage'])
  if (raw.isoSimulation !== undefined) adjustments.isoSimulation = choice(raw.isoSimulation, ['100', '200', '400', '800', '1600', '3200'])
  if (raw.grainType !== undefined) adjustments.grainType = choice(raw.grainType, ['digital', 'film35mm', 'old_film', 'newspaper_noir', 'cinematic'])
  if (raw.colorGrading !== undefined) {
    const grading = object(raw.colorGrading)
    for (const band of ['shadows', 'midtones', 'highlights', 'global'] as const) {
      const wheel = object(grading[band])
      adjustments.colorGrading[band] = { hue: num(wheel.hue, 0, 360), saturation: num(wheel.saturation, 0, 100), luminance: num(wheel.luminance, -100, 100) }
    }
  }
  if (raw.hslMixer !== undefined) {
    const hsl = object(raw.hslMixer)
    for (const band of Object.keys(adjustments.hslMixer) as (keyof PhotoAdjustments['hslMixer'])[]) {
      const v = object(hsl[band])
      adjustments.hslMixer[band] = { hue: num(v.hue, -100, 100), saturation: num(v.saturation, -100, 100), luminance: num(v.luminance, -100, 100) }
    }
  }
  if (raw.toneCurves !== undefined) {
    const curves = object(raw.toneCurves)
    for (const channel of ['rgb', 'red', 'green', 'blue'] as const) {
      const points = list(curves[channel], 64).map((point) => { const p = object(point); return { x: num(p.x, 0, 1), y: num(p.y, 0, 1) } })
      if (points.length < 2 || points.some((p, i) => i > 0 && p.x <= points[i - 1].x)) throw new Error('Invalid tone curve')
      adjustments.toneCurves[channel] = points
    }
    const parametric = object(curves.parametric)
    for (const key of ['highlights', 'lights', 'darks', 'shadows'] as const) adjustments.toneCurves.parametric[key] = num(parametric[key], -100, 100)
  }
  const filter = object(root.filter), shaders = object(root.shaders), border = object(root.border), radius = object(border.radius), size = object(root.referenceSize)
  const normalizedShaders = { ...DEFAULT_SHADERS }
  for (const key of Object.keys(DEFAULT_SHADERS) as (keyof typeof DEFAULT_SHADERS)[]) if (shaders[key] !== undefined) normalizedShaders[key] = num(shaders[key], 0, 100)
  const fx: PresetFx[] = list(root.fx, 100).map((value) => {
    const f = object(value), overlayId = str(f.overlayId)
    if (!BUNDLED_FX_IDS.includes(overlayId)) throw new Error('Unsupported FX')
    return {
      name: str(f.name), overlayId, color: color(f.color), opacity: num(f.opacity, 0, 1),
      flipX: bool(f.flipX), flipY: bool(f.flipY), x: num(f.x, -1000, 1000), y: num(f.y, -1000, 1000),
      width: num(f.width, .000001, 1000), height: num(f.height, .000001, 1000), rotation: num(f.rotation, -36000, 36000),
      behind: bool(f.behind), clipToSlot: bool(f.clipToSlot)
    }
  })
  return {
    adjustments, filter: { name: filter.name === null ? null : str(filter.name) as PhotoLook['filter']['name'], intensity: num(filter.intensity, 0, 100) },
    shaders: normalizedShaders, ...(root.cameraLook ? { cameraLook: str(root.cameraLook) } : {}),
    border: { width: num(border.width, 0, 100000), color: color(border.color), radius: {
      tl: num(radius.tl, 0, 100000), tr: num(radius.tr, 0, 100000), bl: num(radius.bl, 0, 100000), br: num(radius.br, 0, 100000)
    } }, opacity: num(root.opacity, 0, 1),
    referenceSize: { width: num(size.width, .000001, 1000000), height: num(size.height, .000001, 1000000) }, fx
  }
}

export function parsePresetDocument(text: string): PresetDocument {
  if (text.length > PRESET_JSON_LIMIT) throw new Error('Preset JSON is too large')
  const root = object(JSON.parse(text.replace(/^\uFEFF/, '')))
  if (root.format !== 'noir-photo-presets' || root.version !== 1) throw new Error('Unsupported preset file or version')
  const folders = list(root.folders, 1000).map((value) => { const f = object(value); return { id: str(f.id), name: presetName(f.name), parentId: nullableId(f.parentId) } })
  const byId = new Map(folders.map((f) => [f.id, f]))
  if (byId.size !== folders.length) throw new Error('Duplicate folder identifiers')
  for (const folder of folders) {
    const visited = new Set([folder.id])
    let parentId = folder.parentId
    while (parentId !== null) {
      if (visited.has(parentId) || !byId.has(parentId) || visited.size > 64) throw new Error('Invalid folder hierarchy')
      visited.add(parentId)
      parentId = byId.get(parentId)!.parentId
    }
  }
  const presets = list(root.presets, 5000).map((value) => {
    const p = object(value), folderId = nullableId(p.folderId)
    if (folderId !== null && !byId.has(folderId)) throw new Error('Missing preset folder')
    return { id: str(p.id), name: presetName(p.name), folderId, favorite: p.favorite === undefined ? false : bool(p.favorite), look: validatePhotoLook(p.look) }
  })
  if (new Set(presets.map((p) => p.id)).size !== presets.length) throw new Error('Duplicate preset identifiers')
  return { format: 'noir-photo-presets', version: 1, folders, presets }
}
