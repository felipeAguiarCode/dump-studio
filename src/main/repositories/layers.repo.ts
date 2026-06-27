import { v4 as uuid } from 'uuid'
import { getDb } from '../db/connection'
import { buildUpdate, fromBool, nowIso, parseJson, toBool } from './mappers'
import { DEFAULT_ADJUSTMENTS, DEFAULT_CROP, DEFAULT_FILTER, DEFAULT_COLOR_GRADING, DEFAULT_HSL_MIXER, DEFAULT_TONE_CURVES } from '@shared/defaults'
import type {
  Layer,
  LayerTransform,
  LayerType,
  PhotoAdjustments,
  PhotoFilter,
  PhotoFilterName,
  CropSettings,
  ISOSimulation,
  NoirCurve,
  CropAspectRatio,
  ColorGrading,
  HSLMixer,
  ToneCurves
} from '@shared/types'

interface LayerRow {
  id: string
  dump_item_id: string
  type: string
  name: string
  order_index: number
  visible: number
  locked: number
  opacity: number
  group_id: string | null
  transform_json: string
  data_json: string
  created_at: string
  updated_at: string
}

/**
 * Mapa camelCase (PhotoAdjustments escalares) → coluna SQL, usado em insert e patch dinâmico.
 * `colorGrading`/`hslMixer` são aninhados e tratados à parte (colunas JSON).
 */
const ADJ_COLUMNS: Record<Exclude<keyof PhotoAdjustments, 'colorGrading' | 'hslMixer' | 'toneCurves'>, string> = {
  exposure: 'exposure',
  brilliance: 'brilliance',
  highlights: 'highlights',
  shadows: 'shadows',
  contrast: 'contrast',
  brightness: 'brightness',
  blackPoint: 'black_point',
  saturation: 'saturation',
  vibrance: 'vibrance',
  temperature: 'temperature',
  tint: 'tint',
  bwIntensity: 'bw_intensity',
  tonalSeparation: 'tonal_separation',
  blackDepth: 'black_depth',
  whiteBoost: 'white_boost',
  fade: 'fade',
  noirCurve: 'noir_curve',
  clarity: 'clarity',
  texture: 'texture',
  sharpness: 'sharpness',
  definition: 'definition',
  noiseReduction: 'noise_reduction',
  grain: 'grain',
  grainSize: 'grain_size',
  grainRoughness: 'grain_roughness',
  isoSimulation: 'iso_simulation',
  grainType: 'grain_type',
  vignette: 'vignette',
  vignetteSoftness: 'vignette_softness',
  vignetteIntensity: 'vignette_intensity',
  vignetteCenterX: 'vignette_center_x',
  vignetteCenterY: 'vignette_center_y',
  distortion: 'distortion'
}

function rowToAdjustments(r: Record<string, unknown>): PhotoAdjustments {
  return {
    exposure: r.exposure as number,
    brilliance: r.brilliance as number,
    highlights: r.highlights as number,
    shadows: r.shadows as number,
    contrast: r.contrast as number,
    brightness: r.brightness as number,
    blackPoint: r.black_point as number,
    saturation: r.saturation as number,
    vibrance: r.vibrance as number,
    temperature: r.temperature as number,
    tint: r.tint as number,
    bwIntensity: r.bw_intensity as number,
    tonalSeparation: r.tonal_separation as number,
    blackDepth: r.black_depth as number,
    whiteBoost: r.white_boost as number,
    fade: r.fade as number,
    noirCurve: r.noir_curve as NoirCurve,
    clarity: r.clarity as number,
    texture: r.texture as number,
    sharpness: r.sharpness as number,
    definition: r.definition as number,
    noiseReduction: r.noise_reduction as number,
    grain: r.grain as number,
    grainSize: r.grain_size as number,
    grainRoughness: r.grain_roughness as number,
    isoSimulation: r.iso_simulation as ISOSimulation,
    grainType: r.grain_type as PhotoAdjustments['grainType'],
    vignette: r.vignette as number,
    vignetteSoftness: r.vignette_softness as number,
    vignetteIntensity: r.vignette_intensity as number,
    vignetteCenterX: r.vignette_center_x as number,
    vignetteCenterY: r.vignette_center_y as number,
    distortion: r.distortion as number,
    colorGrading: parseJson<ColorGrading>(r.color_grading_json as string | null, DEFAULT_COLOR_GRADING),
    hslMixer: parseJson<HSLMixer>(r.hsl_mixer_json as string | null, DEFAULT_HSL_MIXER),
    toneCurves: parseJson<ToneCurves>(r.curves_json as string | null, DEFAULT_TONE_CURVES)
  }
}

function getAdjustments(layerId: string): PhotoAdjustments {
  const row = getDb()
    .prepare('SELECT * FROM image_layer_adjustments WHERE layer_id = ?')
    .get(layerId) as Record<string, unknown> | undefined
  return row ? rowToAdjustments(row) : { ...DEFAULT_ADJUSTMENTS }
}

function getFilter(layerId: string): PhotoFilter {
  const row = getDb()
    .prepare('SELECT filter_name, intensity FROM image_layer_filters WHERE layer_id = ?')
    .get(layerId) as { filter_name: string | null; intensity: number } | undefined
  if (!row) return { ...DEFAULT_FILTER }
  return { name: (row.filter_name as PhotoFilterName) ?? null, intensity: row.intensity }
}

function getCrop(layerId: string): CropSettings {
  const row = getDb()
    .prepare('SELECT * FROM image_layer_crops WHERE layer_id = ?')
    .get(layerId) as Record<string, unknown> | undefined
  if (!row) return { ...DEFAULT_CROP }
  return {
    aspectRatio: row.aspect_ratio as CropAspectRatio,
    rotation: row.rotation as number,
    straighten: row.straighten as number,
    perspectiveVertical: row.perspective_vertical as number,
    perspectiveHorizontal: row.perspective_horizontal as number,
    flipHorizontal: toBool(row.flip_horizontal as number),
    flipVertical: toBool(row.flip_vertical as number),
    rect: parseJson(row.crop_json as string | null, DEFAULT_CROP.rect)
  }
}

function insertImageEditingRows(layerId: string, layer: Layer, now: string): void {
  const adj = layer.adjustments ?? DEFAULT_ADJUSTMENTS
  const adjParams: Record<string, unknown> = { id: uuid(), layer_id: layerId, created_at: now, updated_at: now }
  for (const [key, col] of Object.entries(ADJ_COLUMNS)) {
    adjParams[col] = adj[key as keyof PhotoAdjustments]
  }
  adjParams.color_grading_json = JSON.stringify(adj.colorGrading ?? DEFAULT_COLOR_GRADING)
  adjParams.hsl_mixer_json = JSON.stringify(adj.hslMixer ?? DEFAULT_HSL_MIXER)
  adjParams.curves_json = JSON.stringify(adj.toneCurves ?? DEFAULT_TONE_CURVES)
  const adjCols = ['id', 'layer_id', ...Object.values(ADJ_COLUMNS), 'color_grading_json', 'hsl_mixer_json', 'curves_json', 'created_at', 'updated_at']
  getDb()
    .prepare(
      `INSERT INTO image_layer_adjustments (${adjCols.join(', ')})
       VALUES (${adjCols.map((c) => '@' + c).join(', ')})`
    )
    .run(adjParams)

  const filter = layer.filter ?? DEFAULT_FILTER
  getDb()
    .prepare(
      'INSERT INTO image_layer_filters (id, layer_id, filter_name, intensity, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(uuid(), layerId, filter.name, filter.intensity, now, now)

  const crop = layer.crop ?? DEFAULT_CROP
  getDb()
    .prepare(
      `INSERT INTO image_layer_crops
       (id, layer_id, aspect_ratio, rotation, straighten, perspective_vertical, perspective_horizontal, flip_horizontal, flip_vertical, crop_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      uuid(),
      layerId,
      crop.aspectRatio,
      crop.rotation,
      crop.straighten,
      crop.perspectiveVertical,
      crop.perspectiveHorizontal,
      fromBool(crop.flipHorizontal),
      fromBool(crop.flipVertical),
      JSON.stringify(crop.rect),
      now,
      now
    )
}

export const layersRepo = {
  insert(layer: Layer): void {
    const now = layer.createdAt || nowIso()
    getDb()
      .prepare(
        `INSERT INTO layers
         (id, dump_item_id, type, name, order_index, visible, locked, opacity, group_id, transform_json, data_json, created_at, updated_at)
         VALUES (@id, @dump_item_id, @type, @name, @order_index, @visible, @locked, @opacity, @group_id, @transform_json, @data_json, @created_at, @updated_at)`
      )
      .run({
        id: layer.id,
        dump_item_id: layer.dumpItemId,
        type: layer.type,
        name: layer.name,
        order_index: layer.orderIndex,
        visible: fromBool(layer.visible),
        locked: fromBool(layer.locked),
        opacity: layer.opacity,
        group_id: layer.groupId ?? null,
        transform_json: JSON.stringify(layer.transform),
        data_json: JSON.stringify(layer.data),
        created_at: now,
        updated_at: now
      })
    if (layer.type === 'image') insertImageEditingRows(layer.id, layer, now)
  },

  getRow(id: string): LayerRow | undefined {
    return getDb().prepare('SELECT * FROM layers WHERE id = ?').get(id) as LayerRow | undefined
  },

  assemble(row: LayerRow): Layer {
    const base: Layer = {
      id: row.id,
      dumpItemId: row.dump_item_id,
      type: row.type as LayerType,
      name: row.name,
      visible: toBool(row.visible),
      locked: toBool(row.locked),
      opacity: row.opacity,
      orderIndex: row.order_index,
      groupId: row.group_id,
      transform: parseJson<LayerTransform>(row.transform_json, {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      }),
      data: parseJson<Record<string, unknown>>(row.data_json, {}),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
    if (base.type === 'image') {
      base.adjustments = getAdjustments(row.id)
      base.filter = getFilter(row.id)
      base.crop = getCrop(row.id)
    }
    return base
  },

  listByDumpItem(dumpItemId: string): Layer[] {
    const rows = getDb()
      .prepare('SELECT * FROM layers WHERE dump_item_id = ? ORDER BY order_index ASC')
      .all(dumpItemId) as LayerRow[]
    return rows.map((r) => this.assemble(r))
  },

  update(
    id: string,
    fields: Partial<
      Pick<Layer, 'name' | 'visible' | 'locked' | 'opacity' | 'orderIndex' | 'groupId' | 'transform' | 'data'>
    >
  ): void {
    const { clause, values } = buildUpdate({
      name: fields.name,
      visible: fields.visible !== undefined ? fromBool(fields.visible) : undefined,
      locked: fields.locked !== undefined ? fromBool(fields.locked) : undefined,
      opacity: fields.opacity,
      order_index: fields.orderIndex,
      group_id: fields.groupId,
      transform_json: fields.transform ? JSON.stringify(fields.transform) : undefined,
      data_json: fields.data ? JSON.stringify(fields.data) : undefined,
      updated_at: nowIso()
    })
    if (!clause) return
    getDb()
      .prepare(`UPDATE layers SET ${clause} WHERE id = ?`)
      .run(...values, id)
  },

  updateAdjustments(layerId: string, patch: Partial<PhotoAdjustments>): void {
    const cols: Record<string, unknown> = { updated_at: nowIso() }
    for (const [key, value] of Object.entries(patch)) {
      const col = ADJ_COLUMNS[key as Exclude<keyof PhotoAdjustments, 'colorGrading' | 'hslMixer' | 'toneCurves'>]
      if (col) cols[col] = value
    }
    if (patch.colorGrading) cols.color_grading_json = JSON.stringify(patch.colorGrading)
    if (patch.hslMixer) cols.hsl_mixer_json = JSON.stringify(patch.hslMixer)
    if (patch.toneCurves) cols.curves_json = JSON.stringify(patch.toneCurves)
    const { clause, values } = buildUpdate(cols)
    getDb()
      .prepare(`UPDATE image_layer_adjustments SET ${clause} WHERE layer_id = ?`)
      .run(...values, layerId)
  },

  updateFilter(layerId: string, patch: Partial<PhotoFilter>): void {
    const { clause, values } = buildUpdate({
      filter_name: patch.name === undefined ? undefined : patch.name,
      intensity: patch.intensity,
      updated_at: nowIso()
    })
    if (!clause) return
    getDb()
      .prepare(`UPDATE image_layer_filters SET ${clause} WHERE layer_id = ?`)
      .run(...values, layerId)
  },

  updateCrop(layerId: string, patch: Partial<CropSettings>): void {
    const { clause, values } = buildUpdate({
      aspect_ratio: patch.aspectRatio,
      rotation: patch.rotation,
      straighten: patch.straighten,
      perspective_vertical: patch.perspectiveVertical,
      perspective_horizontal: patch.perspectiveHorizontal,
      flip_horizontal: patch.flipHorizontal !== undefined ? fromBool(patch.flipHorizontal) : undefined,
      flip_vertical: patch.flipVertical !== undefined ? fromBool(patch.flipVertical) : undefined,
      crop_json: patch.rect ? JSON.stringify(patch.rect) : undefined,
      updated_at: nowIso()
    })
    if (!clause) return
    getDb()
      .prepare(`UPDATE image_layer_crops SET ${clause} WHERE layer_id = ?`)
      .run(...values, layerId)
  },

  delete(id: string): void {
    getDb().prepare('DELETE FROM layers WHERE id = ?').run(id)
  },

  reorder(dumpItemId: string, orderedIds: string[]): void {
    const stmt = getDb().prepare(
      'UPDATE layers SET order_index = ?, updated_at = ? WHERE id = ? AND dump_item_id = ?'
    )
    const now = nowIso()
    orderedIds.forEach((id, idx) => stmt.run(idx, now, id, dumpItemId))
  },

  nextOrderIndex(dumpItemId: string): number {
    const row = getDb()
      .prepare('SELECT COALESCE(MAX(order_index), -1) AS m FROM layers WHERE dump_item_id = ?')
      .get(dumpItemId) as { m: number }
    return row.m + 1
  }
}
