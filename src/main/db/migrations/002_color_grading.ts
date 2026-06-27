import type { Database } from 'better-sqlite3'

/**
 * Color Grading (rodas) + Color Mixer (HSL) por camada de imagem.
 * Guardados como JSON em duas colunas novas (como `image_layer_crops.crop_json`).
 * Linhas antigas ficam NULL → o mapper cai nos defaults.
 */
export const migration002 = {
  version: 2,
  name: 'color_grading_and_hsl',
  up(db: Database): void {
    db.exec(`
      ALTER TABLE image_layer_adjustments ADD COLUMN color_grading_json TEXT;
      ALTER TABLE image_layer_adjustments ADD COLUMN hsl_mixer_json TEXT;
    `)
  }
}
