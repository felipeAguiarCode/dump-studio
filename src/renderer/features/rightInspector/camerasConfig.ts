import type { PhotoAdjustments, PhotoFilterName, ShaderEffects } from '@shared/types'

/** Ids estáveis das câmeras (usados para i18n `cameras.<id>.*` e para a tag `data.cameraLook`). */
export type CameraLookId =
  | 'ccd_classic'
  | 'half_frame'
  | 'instant_600'
  | 'super_8'
  | 'color_35mm'
  | 'disposable_flash'
  | 'cross_process'
  | 'sepia_antiga'
  | 'camcorder_vhs'

/** Silhueta de câmera (SVG inline) usada no badge de cada card. Ver {@link CameraGlyph}. */
export type CameraGlyph =
  | 'compact'
  | 'rangefinder'
  | 'instant'
  | 'cine'
  | 'slr'
  | 'disposable'
  | 'toy'
  | 'folding'
  | 'camcorder'

/**
 * Um "Cameras Look": preset de câmera vintage estilo Dazz Cam. Aplicar define um look COMPLETO
 * (ajustes + filtro + texturas) de forma determinística — ver `applyCameraLook` no editorStore.
 */
export interface CameraLook {
  id: CameraLookId
  /** Nome de exibição (fallback; i18n via `cameras.<id>.label`). */
  name: string
  glyph: CameraGlyph
  /** Cor de destaque do badge do glyph. */
  accent: string
  adjustments: Partial<PhotoAdjustments>
  filter: { name: PhotoFilterName; intensity: number } | null
  shaders: Partial<ShaderEffects>
}

/**
 * Conjunto curado de câmeras vintage. Cada look é montado a partir dos primitivos já existentes
 * (filtros `vint_*`/`aes_*`/`cine_*`, shaders de textura, grão/ISO e cor).
 */
export const CAMERA_LOOKS: CameraLook[] = [
  {
    id: 'ccd_classic',
    name: 'CCD Classic',
    glyph: 'compact',
    accent: '#6fb0c8',
    adjustments: { temperature: -12, contrast: 18, saturation: 14, vibrance: 8, sharpness: 30, clarity: 8 },
    filter: { name: 'aes_clean', intensity: 60 },
    shaders: { filmGrain: 8 }
  },
  {
    id: 'half_frame',
    name: 'Half Frame',
    glyph: 'rangefinder',
    accent: '#c8a86f',
    adjustments: { temperature: 10, contrast: 10, saturation: -6, fade: 18, grain: 30, grainType: 'film35mm', grainSize: 4, vignette: 12 },
    filter: { name: 'vint_seventies', intensity: 70 },
    shaders: { filmGrain: 14 }
  },
  {
    id: 'instant_600',
    name: 'Instant 600',
    glyph: 'instant',
    accent: '#d89a7a',
    adjustments: { temperature: 16, saturation: -10, fade: 30, brightness: 6, contrast: -6, vignette: 18 },
    filter: { name: 'vint_polaroid', intensity: 100 },
    shaders: { halation: 10, worn: 6 }
  },
  {
    id: 'super_8',
    name: 'Super 8',
    glyph: 'cine',
    accent: '#c89a5a',
    adjustments: { temperature: 18, saturation: 6, contrast: 12, grain: 40, grainType: 'old_film', grainSize: 5, vignette: 20 },
    filter: { name: 'cine_golden', intensity: 70 },
    shaders: { filmGrain: 20, halation: 12, dustVintage: 18 }
  },
  {
    id: 'color_35mm',
    name: '35mm Color',
    glyph: 'slr',
    accent: '#b07a5a',
    adjustments: { temperature: 8, saturation: 10, vibrance: 10, contrast: 12, grain: 16, grainType: 'film35mm' },
    filter: { name: 'vint_kodachrome', intensity: 80 },
    shaders: { filmGrain: 8 }
  },
  {
    id: 'disposable_flash',
    name: 'Disposable Flash',
    glyph: 'disposable',
    accent: '#7a9ac8',
    adjustments: { contrast: 26, saturation: 12, highlights: 14, blackPoint: 8, vignette: 26, grain: 20 },
    filter: { name: 'aes_moody', intensity: 50 },
    shaders: { filmGrain: 12, halation: 8 }
  },
  {
    id: 'cross_process',
    name: 'Cross Process',
    glyph: 'toy',
    accent: '#5ac89a',
    adjustments: { saturation: 30, contrast: 24, tint: 18, temperature: -8, vibrance: 12, vignette: 22 },
    filter: { name: 'vint_cross_process', intensity: 100 },
    shaders: { filmGrain: 8 }
  },
  {
    id: 'sepia_antiga',
    name: 'Sépia Antiga',
    glyph: 'folding',
    accent: '#b09a6f',
    adjustments: { bwIntensity: 100, fade: 24, contrast: 16, grain: 24, grainType: 'old_film' },
    filter: { name: 'vint_sepia', intensity: 100 },
    shaders: { worn: 20, dustVintage: 22 }
  },
  {
    id: 'camcorder_vhs',
    name: 'Camcorder VHS',
    glyph: 'camcorder',
    accent: '#8a7ac8',
    adjustments: { saturation: 8, contrast: 8, temperature: 6 },
    filter: { name: 'aes_faded_matte', intensity: 40 },
    shaders: { vhs: 45, scanlines: 18, interference: 14 }
  }
]
