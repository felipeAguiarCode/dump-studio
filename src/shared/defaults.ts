import type {
  PhotoAdjustments,
  PhotoFilter,
  CropSettings,
  ImageBorderStyle,
  ShaderEffects,
  ColorGrading,
  ColorWheel,
  HSLMixer,
  HSLBand,
  ToneCurves,
  ParametricCurve,
  CurvePoint
} from './types/domain'
import type { UserPreferences, ProjectUiState, QuickMenuState } from './types/preferences'
import { DEFAULT_FORMAT } from './constants'

const ZERO_WHEEL: ColorWheel = { hue: 0, saturation: 0, luminance: 0 }
const ZERO_BAND: HSLBand = { hue: 0, saturation: 0, luminance: 0 }

export const DEFAULT_COLOR_GRADING: ColorGrading = {
  shadows: { ...ZERO_WHEEL },
  midtones: { ...ZERO_WHEEL },
  highlights: { ...ZERO_WHEEL },
  global: { ...ZERO_WHEEL }
}

export const DEFAULT_HSL_MIXER: HSLMixer = {
  red: { ...ZERO_BAND },
  orange: { ...ZERO_BAND },
  yellow: { ...ZERO_BAND },
  green: { ...ZERO_BAND },
  aqua: { ...ZERO_BAND },
  blue: { ...ZERO_BAND },
  purple: { ...ZERO_BAND },
  magenta: { ...ZERO_BAND }
}

/** Curva identidade (reta 0→1): nenhum efeito. */
const IDENTITY_CURVE = (): CurvePoint[] => [
  { x: 0, y: 0 },
  { x: 1, y: 1 }
]

/** Curva paramétrica neutra: nenhuma região alterada. */
export const DEFAULT_PARAMETRIC_CURVE: ParametricCurve = {
  highlights: 0,
  lights: 0,
  darks: 0,
  shadows: 0
}

export const DEFAULT_TONE_CURVES: ToneCurves = {
  rgb: IDENTITY_CURVE(),
  red: IDENTITY_CURVE(),
  green: IDENTITY_CURVE(),
  blue: IDENTITY_CURVE(),
  parametric: { ...DEFAULT_PARAMETRIC_CURVE }
}

export const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  exposure: 0,
  brilliance: 0,
  highlights: 0,
  shadows: 0,
  contrast: 0,
  brightness: 0,
  blackPoint: 0,
  saturation: 0,
  vibrance: 0,
  temperature: 0,
  tint: 0,
  bwIntensity: 0,
  tonalSeparation: 0,
  blackDepth: 0,
  whiteBoost: 0,
  fade: 0,
  noirCurve: 'classic',
  clarity: 0,
  texture: 0,
  sharpness: 0,
  definition: 0,
  noiseReduction: 0,
  grain: 0,
  grainSize: 3,
  grainRoughness: 30,
  isoSimulation: '100',
  grainType: 'film35mm',
  vignette: 0,
  vignetteSoftness: 50,
  vignetteIntensity: 50,
  vignetteCenterX: 0.5,
  vignetteCenterY: 0.5,
  distortion: 0,
  colorGrading: {
    shadows: { ...ZERO_WHEEL },
    midtones: { ...ZERO_WHEEL },
    highlights: { ...ZERO_WHEEL },
    global: { ...ZERO_WHEEL }
  },
  hslMixer: {
    red: { ...ZERO_BAND },
    orange: { ...ZERO_BAND },
    yellow: { ...ZERO_BAND },
    green: { ...ZERO_BAND },
    aqua: { ...ZERO_BAND },
    blue: { ...ZERO_BAND },
    purple: { ...ZERO_BAND },
    magenta: { ...ZERO_BAND }
  },
  toneCurves: {
    rgb: IDENTITY_CURVE(),
    red: IDENTITY_CURVE(),
    green: IDENTITY_CURVE(),
    blue: IDENTITY_CURVE(),
    parametric: { ...DEFAULT_PARAMETRIC_CURVE }
  }
}

export const DEFAULT_FILTER: PhotoFilter = {
  name: null,
  intensity: 100
}

export const DEFAULT_IMAGE_BORDER: ImageBorderStyle = {
  width: 0,
  color: '#FFFFFF',
  radius: { tl: 0, tr: 0, br: 0, bl: 0 }
}

export const DEFAULT_SHADERS: ShaderEffects = {
  crt: 0,
  burn: 0,
  worn: 0,
  halation: 0,
  vhs: 0,
  signalLoss: 0,
  interference: 0,
  scanlines: 0,
  filmGrain: 0,
  darkGrainy: 0,
  concrete: 0,
  grunge: 0,
  glitch: 0,
  dustVintage: 0,
  lightLeak: 0,
  leakStreak: 0,
  leakRainbow: 0,
  leakEdge: 0,
  leakSpot: 0,
  filmBloom: 0,
  anamorphic: 0,
  personaRed: 0,
  personaBlue: 0,
  darkKnight: 0,
  cyberNeon: 0,
  inkToon: 0,
  dreadFog: 0,
  pixelArt: 0,
  gameboy: 0,
  thermal: 0,
  vaporwave: 0,
  fisheye: 0,
  antiFisheye: 0
}

export const DEFAULT_CROP: CropSettings = {
  aspectRatio: 'original',
  rotation: 0,
  straighten: 0,
  perspectiveVertical: 0,
  perspectiveHorizontal: 0,
  flipHorizontal: false,
  flipVertical: false,
  rect: { x: 0, y: 0, width: 1, height: 1 }
}

export const DEFAULT_QUICK_MENU: QuickMenuState = {
  gridEnabled: false,
  gridType: 'off',
  rulersEnabled: false,
  smartGuidesEnabled: true,
  snapEnabled: true,
  safeMarginsEnabled: false
}

export function createDefaultUiState(projectId: string, now: string): ProjectUiState {
  return {
    projectId,
    activeDumpItemId: undefined,
    selectedLayerId: null,
    selectedLayerIds: [],
    filmstripCollapsed: false,
    filmstripThumbnailSize: 2,
    filmstripView: 'large',
    activeRightTab: 'adjustments',
    canvasZoom: 1,
    canvasPanX: 0,
    canvasPanY: 0,
    quickMenu: { ...DEFAULT_QUICK_MENU },
    leftSidebarCollapsed: false,
    rightSidebarCollapsed: false,
    updatedAt: now
  }
}

export function createDefaultPreferences(now: string): UserPreferences {
  return {
    appearance: {
      theme: 'noir_dark',
      language: 'en',
      density: 'comfortable',
      defaultFilmstripCollapsed: false,
      defaultThumbnailSize: 'medium',
      showTooltips: true,
      showGuidesByDefault: true,
      showGridByDefault: false,
      showRulersByDefault: false,
      showSmartGuidesByDefault: true,
      snapByDefault: true,
      overlayLineThickness: 2,
      accordionAdjustments: true
    },
    projectDefaults: {
      defaultFormat: DEFAULT_FORMAT,
      defaultProjectName: 'New Dump',
      // Modelo de pool: o usuário cria as páginas manualmente; importar não cria páginas.
      createFirstDumpItemAutomatically: false,
      confirmBeforeFormatChange: true
    },
    editingDefaults: {
      autoSelectImportedPhoto: true,
      defaultFilterName: null,
      defaultFilterIntensity: 100,
      defaultGrain: 0,
      defaultVignette: 0
    },
    exportDefaults: {
      format: 'jpg',
      jpgQuality: 90,
      destinationPath: undefined,
      fileNamingPattern: 'noir-dump-{index}',
      exportScope: 'all'
    },
    autosave: {
      enabled: true,
      showStatus: true,
      createSnapshotBeforeExport: false,
      createSnapshotBeforeFormatChange: true
    },
    updatedAt: now
  }
}
