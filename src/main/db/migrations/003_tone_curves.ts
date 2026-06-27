import type { Database } from 'better-sqlite3'

/**
 * Curvas de tom (ferramenta Curvas) por camada de imagem.
 * Guardadas como JSON numa coluna nova (como color_grading_json / hsl_mixer_json).
 * Linhas antigas ficam NULL → o mapper cai em DEFAULT_TONE_CURVES (identidade).
 */
export const migration003 = {
  version: 3,
  name: 'tone_curves',
  up(db: Database): void {
    db.exec(`
      ALTER TABLE image_layer_adjustments ADD COLUMN curves_json TEXT;
    `)
  }
}
