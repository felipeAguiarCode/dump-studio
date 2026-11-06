import type { PhotoAdjustments, PhotoFilter, NoirCurve, PhotoFilterName, CropSettings, ShaderEffects, ColorWheel } from '@shared/types'
import { HSL_COLOR_NAMES } from '@shared/types'
import { DEFAULT_SHADERS, DEFAULT_COLOR_GRADING, DEFAULT_HSL_MIXER, DEFAULT_TONE_CURVES } from '@shared/defaults'
import { buildCurveLUT, curvesAreIdentity } from './curveLut'

/** HSL → RGB (h,s,l em 0..1). Usado p/ derivar a cor de tinta de cada roda de color grading. */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l]
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)]
}

/** Roda → offset RGB assinado (em torno de 0), escalado pela saturação. Matiz puro a partir do ângulo. */
function wheelTint(w: ColorWheel): [number, number, number] {
  const s = Math.max(0, Math.min(1, w.saturation / 100))
  if (s === 0) return [0, 0, 0]
  const hue = ((((w.hue % 360) + 360) % 360) / 360)
  const [r, g, b] = hslToRgb(hue, 1, 0.5)
  return [(r - 0.5) * s, (g - 0.5) * s, (b - 0.5) * s]
}

const CURVE_INDEX: Record<NoirCurve, number> = {
  soft: 0,
  classic: 1,
  high_contrast: 2,
  cinematic: 3,
  vintage: 4
}

// ISO simulado → fator de granulação de sensor (100 = limpo, 3200 = pesado).
const ISO_GRAIN: Record<PhotoAdjustments['isoSimulation'], number> = {
  '100': 0,
  '200': 0.12,
  '400': 0.28,
  '800': 0.5,
  '1600': 0.75,
  '3200': 1.0
}

// Tipo de grão → índice usado pelo shader para variar caráter (tamanho, dureza, distribuição).
const GRAIN_TYPE_INDEX: Record<PhotoAdjustments['grainType'], number> = {
  digital: 0,
  film35mm: 1,
  old_film: 2,
  newspaper_noir: 3,
  cinematic: 4
}

const FILTER_INDEX: Record<PhotoFilterName, number> = {
  // Sessão Noir (P&B) — índices 1..8
  high_contrast_bw: 1,
  silver_tones: 2,
  vintage: 3,
  mono: 4,
  tonal: 5,
  noir: 6,
  silvertone: 7,
  newspaper_noir: 8,
  // Sessão Fujifilm (cor) — índices 9..16
  fuji_provia: 9,
  fuji_velvia: 10,
  fuji_astia: 11,
  fuji_classic_chrome: 12,
  fuji_classic_neg: 13,
  fuji_eterna: 14,
  fuji_nostalgic_neg: 15,
  fuji_acros: 16,
  // Sessão Cinematográfico (cor) — índices 17..21
  cine_teal_orange: 17,
  cine_bleach_bypass: 18,
  cine_day_for_night: 19,
  cine_thriller: 20,
  cine_golden: 21,
  // Sessão Aesthetic (cor) — índices 22..26
  aes_pastel: 22,
  aes_faded_matte: 23,
  aes_moody: 24,
  aes_clean: 25,
  aes_warm_peach: 26,
  // Sessão Vintage (cor) — índices 27..31
  vint_seventies: 27,
  vint_polaroid: 28,
  vint_sepia: 29,
  vint_kodachrome: 30,
  vint_cross_process: 31,
  // Sessão Nostalgic (cor) — índices 32..36
  nost_faded_90s: 32,
  nost_washed_film: 33,
  nost_disposable: 34,
  nost_muted_vsco: 35,
  nost_sun_faded: 36
}

export interface PipelineUniforms {
  // `curveLUT` é bytes da LUT (consumido pelo glContext como textura, não como uniform escalar).
  [key: string]: number | number[] | Uint8Array
}

/** Converte ajustes/filtro do domínio em uniforms normalizados para o shader. */
export function buildUniforms(
  adj: PhotoAdjustments,
  filter: PhotoFilter | undefined,
  referenceWidth: number,
  seed: number,
  crop?: CropSettings,
  shaders?: ShaderEffects
): PipelineUniforms {
  const f = (v: number): number => v / 100
  const rect = crop?.rect ?? { x: 0, y: 0, width: 1, height: 1 }
  // Mescla com os defaults: projetos antigos podem ter ShaderEffects parciais (sem as texturas novas).
  const sh = { ...DEFAULT_SHADERS, ...shaders }
  const cg = adj.colorGrading ?? DEFAULT_COLOR_GRADING
  const mix = adj.hslMixer ?? DEFAULT_HSL_MIXER
  const curves = adj.toneCurves ?? DEFAULT_TONE_CURVES
  return {
    // Curvas de tom: flag liga/desliga + bytes da LUT (o glContext sobe como textura).
    uCurveOn: curvesAreIdentity(curves) ? 0 : 1,
    curveLUT: buildCurveLUT(curves),
    uCrt: sh.crt / 100,
    uBurn: sh.burn / 100,
    uWorn: sh.worn / 100,
    uHalation: sh.halation / 100,
    uVhs: sh.vhs / 100,
    uSignalLoss: sh.signalLoss / 100,
    uInterference: sh.interference / 100,
    uScanlines: sh.scanlines / 100,
    uFilmGrain: sh.filmGrain / 100,
    uDarkGrainy: sh.darkGrainy / 100,
    uConcrete: sh.concrete / 100,
    uGrunge: sh.grunge / 100,
    uGlitch: sh.glitch / 100,
    uDustVintage: sh.dustVintage / 100,
    uLightLeak: sh.lightLeak / 100,
    uLeakStreak: sh.leakStreak / 100,
    uLeakRainbow: sh.leakRainbow / 100,
    uLeakEdge: sh.leakEdge / 100,
    uLeakSpot: sh.leakSpot / 100,
    uFilmBloom: sh.filmBloom / 100,
    uAnamorphic: sh.anamorphic / 100,
    uPersonaRed: sh.personaRed / 100,
    uPersonaBlue: sh.personaBlue / 100,
    uDarkKnight: sh.darkKnight / 100,
    uCyberNeon: sh.cyberNeon / 100,
    uInkToon: sh.inkToon / 100,
    uDreadFog: sh.dreadFog / 100,
    uPixelArt: sh.pixelArt / 100,
    uGameboy: sh.gameboy / 100,
    uThermal: sh.thermal / 100,
    uVaporwave: sh.vaporwave / 100,
    uFisheye: sh.fisheye / 100,
    uAntiFisheye: sh.antiFisheye / 100,
    uCropRect: [rect.x, rect.y, rect.width, rect.height],
    uFlipX: crop?.flipHorizontal ? 1 : 0,
    uFlipY: crop?.flipVertical ? 1 : 0,
    uRotate90: crop ? Math.round((crop.rotation % 360) / 90) : 0,
    uStraighten: crop ? (crop.straighten * Math.PI) / 180 : 0,
    uExposure: f(adj.exposure),
    uContrast: f(adj.contrast),
    uHighlights: f(adj.highlights),
    uShadows: f(adj.shadows),
    uBrightness: f(adj.brightness),
    uBlackPoint: f(adj.blackPoint),
    uBrilliance: f(adj.brilliance),
    uSaturation: f(adj.saturation),
    uVibrance: f(adj.vibrance),
    uTemperature: f(adj.temperature),
    uTint: f(adj.tint),
    uBwIntensity: adj.bwIntensity / 100,
    uTonalSeparation: f(adj.tonalSeparation),
    uBlackDepth: f(adj.blackDepth),
    uWhiteBoost: f(adj.whiteBoost),
    uFade: adj.fade / 100,
    uNoirCurve: CURVE_INDEX[adj.noirCurve] ?? 1,
    uClarity: f(adj.clarity),
    uTexture: f(adj.texture),
    uSharpness: adj.sharpness / 100,
    uDefinition: adj.definition / 100,
    uNoiseReduction: adj.noiseReduction / 100,
    uGrain: adj.grain / 100,
    uGrainSize: adj.grainSize,
    uGrainRoughness: adj.grainRoughness / 100,
    uIso: ISO_GRAIN[adj.isoSimulation] ?? 0,
    uGrainType: GRAIN_TYPE_INDEX[adj.grainType] ?? 1,
    uReferenceWidth: referenceWidth,
    uSeed: seed,
    uVignette: f(adj.vignette),
    uVignetteSoftness: adj.vignetteSoftness / 100,
    uVignetteIntensity: adj.vignetteIntensity / 100,
    uVignetteCenter: [adj.vignetteCenterX, adj.vignetteCenterY],
    uFilter: filter?.name ? (FILTER_INDEX[filter.name] ?? 0) : 0,
    uFilterIntensity: filter?.name ? filter.intensity / 100 : 0,
    // Color grading (split-toning): offset RGB + luminância por faixa tonal.
    uCgShadows: wheelTint(cg.shadows),
    uCgMidtones: wheelTint(cg.midtones),
    uCgHighlights: wheelTint(cg.highlights),
    uCgGlobal: wheelTint(cg.global),
    uCgShadowsLum: cg.shadows.luminance / 100,
    uCgMidtonesLum: cg.midtones.luminance / 100,
    uCgHighlightsLum: cg.highlights.luminance / 100,
    uCgGlobalLum: cg.global.luminance / 100,
    // Color mixer (HSL): arrays float[8] na ordem de HSL_COLOR_NAMES.
    uHslHue: HSL_COLOR_NAMES.map((n) => mix[n].hue / 100),
    uHslSat: HSL_COLOR_NAMES.map((n) => mix[n].saturation / 100),
    uHslLum: HSL_COLOR_NAMES.map((n) => mix[n].luminance / 100)
  }
}

export const UNIFORM_NAMES = [
  'uExposure', 'uContrast', 'uHighlights', 'uShadows', 'uBrightness', 'uBlackPoint', 'uBrilliance',
  'uSaturation', 'uVibrance', 'uTemperature', 'uTint',
  'uBwIntensity', 'uTonalSeparation', 'uBlackDepth', 'uWhiteBoost', 'uFade', 'uNoirCurve',
  'uCurveOn',
  'uClarity', 'uTexture', 'uSharpness', 'uDefinition', 'uNoiseReduction',
  'uGrain', 'uGrainSize', 'uGrainRoughness', 'uIso', 'uGrainType', 'uReferenceWidth', 'uSeed',
  'uVignette', 'uVignetteSoftness', 'uVignetteIntensity', 'uVignetteCenter',
  'uFilter', 'uFilterIntensity',
  'uCropRect', 'uFlipX', 'uFlipY', 'uRotate90', 'uStraighten',
  'uCrt', 'uBurn', 'uWorn', 'uHalation', 'uVhs',
  'uFilmGrain', 'uDarkGrainy', 'uConcrete', 'uGrunge', 'uGlitch', 'uDustVintage',
  'uSignalLoss', 'uInterference', 'uScanlines',
  'uLightLeak', 'uLeakStreak', 'uLeakRainbow', 'uLeakEdge', 'uLeakSpot', 'uFilmBloom', 'uAnamorphic',
  'uPersonaRed', 'uPersonaBlue', 'uDarkKnight', 'uCyberNeon', 'uInkToon', 'uDreadFog',
  'uPixelArt', 'uGameboy', 'uThermal', 'uVaporwave',
  'uFisheye', 'uAntiFisheye',
  'uCgShadows', 'uCgMidtones', 'uCgHighlights', 'uCgGlobal',
  'uCgShadowsLum', 'uCgMidtonesLum', 'uCgHighlightsLum', 'uCgGlobalLum',
  'uHslHue', 'uHslSat', 'uHslLum'
] as const
