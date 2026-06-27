import type { PhotoAdjustments } from '@shared/types'

type NumKey = {
  [K in keyof PhotoAdjustments]: PhotoAdjustments[K] extends number ? K : never
}[keyof PhotoAdjustments]

export interface SliderDef {
  key: NumKey
  label: string
  min: number
  max: number
  step?: number
  default: number
  gradient?: string
}

export type AdjustmentGroupId = 'light' | 'color' | 'bw' | 'details' | 'grain' | 'optics'

export interface GroupDef {
  /** Id estável para i18n (`adjustments.groups.<id>`). `title` é só fallback PT. */
  id: AdjustmentGroupId
  title: string
  keys: NumKey[]
  sliders: SliderDef[]
}

const TEMP_GRAD = 'linear-gradient(90deg,#5b7fb0,#2a2a2a,#b0925b)'
const TINT_GRAD = 'linear-gradient(90deg,#5bb07f,#2a2a2a,#b05ba0)'

export const ADJUSTMENT_GROUPS: GroupDef[] = [
  {
    id: 'light',
    title: 'Luz',
    keys: ['exposure', 'brilliance', 'highlights', 'shadows', 'contrast', 'brightness', 'blackPoint'],
    sliders: [
      { key: 'exposure', label: 'Exposição', min: -100, max: 100, default: 0 },
      { key: 'brilliance', label: 'Brilho Inteligente', min: -100, max: 100, default: 0 },
      { key: 'highlights', label: 'Realces', min: -100, max: 100, default: 0 },
      { key: 'shadows', label: 'Sombras', min: -100, max: 100, default: 0 },
      { key: 'contrast', label: 'Contraste', min: -100, max: 100, default: 0 },
      { key: 'brightness', label: 'Luminosidade', min: -100, max: 100, default: 0 },
      { key: 'blackPoint', label: 'Ponto Preto', min: -100, max: 100, default: 0 }
    ]
  },
  {
    id: 'color',
    title: 'Cor',
    keys: ['saturation', 'vibrance', 'temperature', 'tint'],
    sliders: [
      { key: 'saturation', label: 'Saturação', min: -100, max: 100, default: 0 },
      { key: 'vibrance', label: 'Vivacidade', min: -100, max: 100, default: 0 },
      { key: 'temperature', label: 'Calidez', min: -100, max: 100, default: 0, gradient: TEMP_GRAD },
      { key: 'tint', label: 'Tonalidade', min: -100, max: 100, default: 0, gradient: TINT_GRAD }
    ]
  },
  {
    id: 'bw',
    title: 'Preto e Branco',
    keys: ['bwIntensity', 'tonalSeparation', 'blackDepth', 'whiteBoost', 'fade'],
    sliders: [
      { key: 'bwIntensity', label: 'Intensidade P&B', min: 0, max: 100, default: 0 },
      { key: 'tonalSeparation', label: 'Separação Tonal', min: -100, max: 100, default: 0 },
      { key: 'blackDepth', label: 'Profundidade dos Pretos', min: -100, max: 100, default: 0 },
      { key: 'whiteBoost', label: 'Brancos Brilhantes', min: -100, max: 100, default: 0 },
      { key: 'fade', label: 'Fade', min: 0, max: 100, default: 0 }
    ]
  },
  {
    id: 'details',
    title: 'Detalhes',
    keys: ['sharpness', 'definition', 'noiseReduction', 'clarity', 'texture'],
    sliders: [
      { key: 'sharpness', label: 'Nitidez', min: 0, max: 100, default: 0 },
      { key: 'definition', label: 'Definição', min: 0, max: 100, default: 0 },
      { key: 'noiseReduction', label: 'Redução de Ruído', min: 0, max: 100, default: 0 },
      { key: 'clarity', label: 'Claridade', min: -100, max: 100, default: 0 },
      { key: 'texture', label: 'Textura', min: -100, max: 100, default: 0 }
    ]
  },
  {
    id: 'grain',
    title: 'Granulação / ISO',
    keys: ['grain', 'grainSize', 'grainRoughness'],
    sliders: [
      { key: 'grain', label: 'Granulação', min: 0, max: 100, default: 0 },
      { key: 'grainSize', label: 'Tamanho do Grão', min: 1, max: 10, default: 3 },
      { key: 'grainRoughness', label: 'Aspereza do Grão', min: 0, max: 100, default: 30 }
    ]
  },
  {
    id: 'optics',
    title: 'Óptica',
    keys: ['vignette', 'vignetteIntensity', 'vignetteSoftness', 'distortion'],
    sliders: [
      { key: 'vignette', label: 'Vinheta', min: -100, max: 100, default: 0 },
      { key: 'vignetteIntensity', label: 'Intensidade da Vinheta', min: 0, max: 100, default: 50 },
      { key: 'vignetteSoftness', label: 'Suavidade da Vinheta', min: 0, max: 100, default: 50 },
      { key: 'distortion', label: 'Distorção Sutil', min: -50, max: 50, default: 0 }
    ]
  }
]

export const ISO_OPTIONS: PhotoAdjustments['isoSimulation'][] = ['100', '200', '400', '800', '1600', '3200']
export const GRAIN_TYPES: { value: PhotoAdjustments['grainType']; label: string }[] = [
  { value: 'digital', label: 'Digital suave' },
  { value: 'film35mm', label: 'Filme 35mm' },
  { value: 'old_film', label: 'Filme antigo' },
  { value: 'newspaper_noir', label: 'Jornal noir' },
  { value: 'cinematic', label: 'Cinemático' }
]
export const NOIR_CURVES: { value: PhotoAdjustments['noirCurve']; label: string }[] = [
  { value: 'soft', label: 'Suave' },
  { value: 'classic', label: 'Clássica' },
  { value: 'high_contrast', label: 'Alta Contraste' },
  { value: 'cinematic', label: 'Cinemática' },
  { value: 'vintage', label: 'Vintage' }
]

/** Presets de Ajuste (alteram sliders, continuam editáveis). `id` para i18n (`presets.<id>`). */
export type AdjustmentPresetId =
  | 'noir_soft'
  | 'noir_high_contrast'
  | 'clean_silver'
  | 'vintage_fade'
  | 'grainy_film'
  | 'old_newspaper'

export const ADJUSTMENT_PRESETS: { id: AdjustmentPresetId; name: string; patch: Partial<PhotoAdjustments> }[] = [
  { id: 'noir_soft', name: 'Noir Suave', patch: { contrast: 12, blackDepth: 15, bwIntensity: 100, noirCurve: 'soft', fade: 6 } },
  { id: 'noir_high_contrast', name: 'Noir Alto Contraste', patch: { contrast: 45, blackDepth: 40, whiteBoost: 30, bwIntensity: 100, noirCurve: 'high_contrast' } },
  { id: 'clean_silver', name: 'Prata Limpa', patch: { contrast: 8, brilliance: 20, whiteBoost: 18, bwIntensity: 100, noirCurve: 'classic' } },
  { id: 'vintage_fade', name: 'Vintage Fade', patch: { contrast: -8, fade: 35, grain: 18, bwIntensity: 100, noirCurve: 'vintage' } },
  { id: 'grainy_film', name: 'Filme Granulado', patch: { contrast: 22, grain: 45, grainSize: 4, grainRoughness: 50, bwIntensity: 100, noirCurve: 'cinematic' } },
  { id: 'old_newspaper', name: 'Jornal Antigo', patch: { contrast: 55, blackDepth: 35, grain: 35, fade: 10, bwIntensity: 100, noirCurve: 'high_contrast' } }
]

export const AUTO_ADJUSTMENTS: Partial<PhotoAdjustments> = {
  exposure: 6,
  contrast: 16,
  highlights: -12,
  shadows: 14,
  blackPoint: 8,
  brilliance: 18,
  sharpness: 22,
  noiseReduction: 10
}
