import type { InstagramFormat } from '../constants'
import type { OriginalAsset } from './assets'

export type { InstagramFormat }

export type LayerType = 'image' | 'text' | 'shape' | 'border' | 'background' | 'overlay'

export type CanvasBackground =
  | 'black'
  | 'white'
  | 'light_gray'
  | 'medium_gray'
  | 'dark_gray'
  | 'transparent'
  | string

/** Retângulo normalizado (0..1) de um slot dentro do layout da página. */
export interface SlotRect {
  x: number
  y: number
  w: number
  h: number
  /** Rotação do slot em graus (em torno do centro da célula). Ausente/0 = sem rotação. */
  rot?: number
  /**
   * Slot de "emenda" de carrossel contínuo: `[index, count]`. A foto é fatiada para que
   * a parte `index` (de `count` slides) mostre sua fração horizontal, conectando-se sem
   * distorção com as demais partes (a MESMA foto deve ser usada em todos os slides).
   */
  seam?: [number, number]
}

/**
 * Layout de encaixe da página (estilo Stories): as células viram placeholders.
 * Slots normalizados (0..1); a geometria real é derivada por slot × canvas − gutter.
 */
export interface PageLayout {
  templateId: string
  gutter: number
  slots: SlotRect[]
}

export interface CanvasSettings {
  width: number
  height: number
  format: InstagramFormat
  backgroundColor: CanvasBackground
  /** Overlays de apoio (não exportáveis) — persistidos no UI state, espelhados aqui por conveniência. */
  showGuides: boolean
  showGrid: boolean
  /** Layout de placeholders ativo na página. null/ausente = movimentação livre. */
  layout?: PageLayout | null
}

export interface LayerTransform {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
}

export interface CornerRadii {
  tl: number
  tr: number
  br: number
  bl: number
}

export interface ImageBorderStyle {
  /** Espessura do contorno em px do documento (0 = sem contorno). */
  width: number
  color: string
  radius: CornerRadii
}

/**
 * Efeitos de "shader" empilháveis por foto (texturas analógicas / de tela).
 * Cada valor é intensidade 0..100 (0 = desligado). Guardados no data_json da camada.
 */
export interface ShaderEffects {
  /** Monitor CRT: scanlines, máscara de fósforo, aberração cromática e curvatura. */
  crt: number
  /** Foto chamuscada: bordas queimadas com escurecimento quente irregular. */
  burn: number
  /** Desgaste do tempo: fade, leve sépia, poeira e arranhões. */
  worn: number
  /** Halação analógica: brilho/glow que vaza das altas luzes. */
  halation: number
  /** Fita VHS: sangramento de croma horizontal, jitter por linha e tracking. */
  vhs: number
  /** Perda de sinal: rasgos horizontais, quedas em preto e linha de sincronismo. */
  signalLoss: number
  /** Interferência: chuvisco analógico, barras de ruído e fantasma de croma. */
  interference: number
  /** Scanlines: linhas horizontais de monitor (sem a aberração do CRT). */
  scanlines: number
  /** Grão de filme: ruído de luminância clássico, mais presente nos médios-tons. */
  filmGrain: number
  /** Escuro e granulado: escurece, reforça o contraste e adiciona grão pesado. */
  darkGrainy: number
  /** Parede de concreto: textura áspera e mosqueada sobreposta em multiplicação. */
  concrete: number
  /** Grunge: manchas sujas, riscos e granulado seco distorcido. */
  grunge: number
  /** Glitch digital: deslocamento de blocos, separação RGB e ruído de dados. */
  glitch: number
  /** Poeira e grão vintage: fade quente com grão de filme, poeira e arranhões. */
  dustVintage: number
  // ---- Sessão Leak (vazamentos de luz) ----
  /** Light leak quente: vazamento de luz vindo dos cantos (screen blend). */
  lightLeak: number
  /** Risco diagonal de luz quente cruzando o quadro. */
  leakStreak: number
  /** Banda de arco-íris (dispersão de prisma). */
  leakRainbow: number
  /** Fim de rolo: faixa vermelha/laranja intensa numa borda. */
  leakEdge: number
  /** Reflexo de lente: orbe/hotspot dourado suave. */
  leakSpot: number
  /** Brilho difuso (pro-mist): glow suave e sonhador que espalha as altas luzes. */
  filmBloom: number
  /** Flare anamórfico: risco horizontal azul saindo das altas luzes, cinematográfico. */
  anamorphic: number
  // ---- Sessão Games (inspirados em jogos) ----
  /** Fantasma vermelho (JRPG estiloso, ex. Persona 5): eco/silhueta vermelha + duotone carmesim. */
  personaRed: number
  /** Fantasma azul (JRPG melancólico, ex. Persona 3): contornos e eco azuis + duotone frio. */
  personaBlue: number
  /** Vigilante noir (clima "The Batman"): penumbra urbana, vermelho/âmbar e pretos profundos. */
  darkKnight: number
  /** Cyber neon (Cyberpunk): aberração cromática, split-tone ciano/magenta e saturação neon. */
  cyberNeon: number
  /** Cel-shade (quadrinho/cartoon): cor posterizada com contornos de tinta preta. */
  inkToon: number
  /** Névoa sombria (survival horror): dessatura, escurece, névoa e grão pesado. */
  dreadFog: number
  /** Pixel art: pixeliza e reduz a paleta, estilo console retrô 8/16-bit. */
  pixelArt: number
  /** LCD verde: tela de 4 tons verdes pixelada, estilo portátil clássico. */
  gameboy: number
  /** Visão térmica: mapa de calor infravermelho a partir da luminância. */
  thermal: number
  /** Vaporwave: duotone rosa/ciano synthwave com scanlines, estilo Outrun. */
  vaporwave: number
  // ---- Sessão Fisheye (distorção de lente) ----
  /** Fisheye: distorção barril radial — linhas curvam para fora, centro ampliado. */
  fisheye: number
  /** Anti-fisheye: distorção pincushion — linhas curvam para dentro, bordas ampliadas. */
  antiFisheye: number
}

export interface ImageLayerData {
  assetId: string
  sourcePath: string
  originalWidth: number
  originalHeight: number
  previewPath?: string
  border?: ImageBorderStyle
  shaders?: ShaderEffects
  /** Id da câmera (Cameras Look) atualmente aplicada, para destaque de seleção. Ausente = nenhuma. */
  cameraLook?: string
  /** Índice do slot ocupado quando a página tem um layout ativo. Ausente = imagem livre. */
  slotIndex?: number
}

export interface TextLayerData {
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  color: string
  align: 'left' | 'center' | 'right'
  letterSpacing?: number
  lineHeight?: number
  /** Curvatura do texto (WordArt): 0 = reto; ±100 = círculo completo. */
  curve?: number
}

export type ShapeKind = 'rectangle' | 'square' | 'circle' | 'triangle' | 'line'

export interface ShapeLayerData {
  shape: ShapeKind
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius: number
}

export interface BorderLayerData {
  color: string
  thickness: number
  cornerRadius: number
  /** Espaçamento interno entre slots de uma collage. */
  gutter: number
}

/** Camada de FX → Overlay: PNG de sombra degradê (bundlado) sobreposto à foto. */
export interface OverlayLayerData {
  /** Chave estável do overlay → URL bundlada (ver `renderer/lib/overlays.ts`). */
  overlayId: string
  /** Espelha horizontalmente. */
  flipX: boolean
  /** Espelha verticalmente. */
  flipY: boolean
  /** Cor do overlay (tinge o degradê preservando o alfa). Padrão '#000000' (sombra). */
  color: string
  /** Em modo layout: índice do slot ao qual o overlay é recortado (clip). Ausente = overlay livre. */
  slotIndex?: number
}

export type ISOSimulation = '100' | '200' | '400' | '800' | '1600' | '3200'

export type NoirCurve = 'soft' | 'classic' | 'high_contrast' | 'cinematic' | 'vintage'

/** Uma roda de Color Grading: matiz (0..360°), saturação (0..100), luminância (-100..100). */
export interface ColorWheel {
  hue: number
  saturation: number
  luminance: number
}

/** Gradação de cor estilo Lightroom: 3 faixas tonais + global (split-toning). */
export interface ColorGrading {
  shadows: ColorWheel
  midtones: ColorWheel
  highlights: ColorWheel
  global: ColorWheel
}

/** As 8 faixas de cor do Color Mixer (HSL), na ordem fixa usada pelo shader. */
export type HSLColorName = 'red' | 'orange' | 'yellow' | 'green' | 'aqua' | 'blue' | 'purple' | 'magenta'

/** Ajuste por faixa de cor: matiz/saturação/luminância, cada um -100..100. */
export interface HSLBand {
  hue: number
  saturation: number
  luminance: number
}

export type HSLMixer = Record<HSLColorName, HSLBand>

/** Ordem canônica das faixas HSL (centros de matiz definidos no shader). */
export const HSL_COLOR_NAMES: HSLColorName[] = ['red', 'orange', 'yellow', 'green', 'aqua', 'blue', 'purple', 'magenta']

/** Ponto de controle de uma curva de tom (entrada→saída, ambos 0..1). Ordenados por x. */
export interface CurvePoint {
  x: number
  y: number
}

/** Canais da ferramenta Curvas (modo Ponto): mestre (RGB/luminância) + Vermelho/Verde/Azul. */
export type CurveChannel = 'rgb' | 'red' | 'green' | 'blue'

/** Ordem dos canais de curva (mestre primeiro). */
export const CURVE_CHANNELS: CurveChannel[] = ['rgb', 'red', 'green', 'blue']

/**
 * Curva Paramétrica estilo Lightroom: 4 regiões tonais, cada uma -100..100. Em vez de
 * arrastar pontos, ajusta-se por região (Realces/Claros/Escuros/Sombras), o que gera um
 * ajuste suave de tom somado por região — depois composto com a curva de pontos mestre.
 */
export interface ParametricCurve {
  /** Realces / brancos (quarto superior). */
  highlights: number
  /** Claros (meios-tons altos). */
  lights: number
  /** Escuros (meios-tons baixos). */
  darks: number
  /** Sombras / pretos (quarto inferior). */
  shadows: number
}

/** Regiões paramétricas na ordem de exibição da UI (realces no topo → sombras na base, como no Lightroom). */
export const PARAMETRIC_REGIONS = ['highlights', 'lights', 'darks', 'shadows'] as const
export type ParametricRegion = (typeof PARAMETRIC_REGIONS)[number]

/** Curvas de tom estilo Photoshop/Lightroom: curva de pontos por canal + curva paramétrica por região. */
export interface ToneCurves {
  rgb: CurvePoint[]
  red: CurvePoint[]
  green: CurvePoint[]
  blue: CurvePoint[]
  parametric: ParametricCurve
}

export interface PhotoAdjustments {
  // Luz
  exposure: number
  brilliance: number
  highlights: number
  shadows: number
  contrast: number
  brightness: number
  blackPoint: number
  // Cor
  saturation: number
  vibrance: number
  temperature: number
  tint: number
  // Preto e Branco
  bwIntensity: number
  tonalSeparation: number
  blackDepth: number
  whiteBoost: number
  fade: number
  noirCurve: NoirCurve
  // Detalhes
  clarity: number
  texture: number
  sharpness: number
  definition: number
  noiseReduction: number
  // Granulação / ISO
  grain: number
  grainSize: number
  grainRoughness: number
  isoSimulation: ISOSimulation
  grainType: 'digital' | 'film35mm' | 'old_film' | 'newspaper_noir' | 'cinematic'
  // Óptica
  vignette: number
  vignetteSoftness: number
  vignetteIntensity: number
  vignetteCenterX: number
  vignetteCenterY: number
  distortion: number
  // Gradação de cor (rodas) + Color Mixer (HSL)
  colorGrading: ColorGrading
  hslMixer: HSLMixer
  // Curvas de tom (pontos por canal)
  toneCurves: ToneCurves
}

export type PhotoFilterName =
  // Sessão Noir (preto e branco)
  | 'high_contrast_bw'
  | 'silver_tones'
  | 'vintage'
  | 'mono'
  | 'tonal'
  | 'noir'
  | 'silvertone'
  | 'newspaper_noir'
  // Sessão Fujifilm (simulações de filme coloridas; ACROS em P&B)
  | 'fuji_provia'
  | 'fuji_velvia'
  | 'fuji_astia'
  | 'fuji_classic_chrome'
  | 'fuji_classic_neg'
  | 'fuji_eterna'
  | 'fuji_nostalgic_neg'
  | 'fuji_acros'
  // Sessão Cinematográfico (cor)
  | 'cine_teal_orange'
  | 'cine_bleach_bypass'
  | 'cine_day_for_night'
  | 'cine_thriller'
  | 'cine_golden'
  // Sessão Aesthetic (cor)
  | 'aes_pastel'
  | 'aes_faded_matte'
  | 'aes_moody'
  | 'aes_clean'
  | 'aes_warm_peach'
  // Sessão Vintage (cor)
  | 'vint_seventies'
  | 'vint_polaroid'
  | 'vint_sepia'
  | 'vint_kodachrome'
  | 'vint_cross_process'
  // Sessão Nostalgic (cor) — fotos antigas lavadas, estética VSCO / anos 90
  | 'nost_faded_90s'
  | 'nost_washed_film'
  | 'nost_disposable'
  | 'nost_muted_vsco'
  | 'nost_sun_faded'

export interface PhotoFilter {
  name: PhotoFilterName | null
  intensity: number
}

export type CropAspectRatio = 'free' | 'original' | '1_1' | '4_5' | '9_16' | '16_9'

export interface CropSettings {
  aspectRatio: CropAspectRatio
  rotation: number
  straighten: number
  perspectiveVertical: number
  perspectiveHorizontal: number
  flipHorizontal: boolean
  flipVertical: boolean
  /** Retângulo normalizado (0..1) sobre a imagem de origem. */
  rect: { x: number; y: number; width: number; height: number }
}

export interface Layer {
  id: string
  dumpItemId: string
  type: LayerType
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  orderIndex: number
  groupId?: string | null
  transform: LayerTransform
  data: ImageLayerData | TextLayerData | ShapeLayerData | BorderLayerData | OverlayLayerData | Record<string, unknown>
  // Somente camadas type="image" possuem ajustes/filtro/crop fotográfico.
  adjustments?: PhotoAdjustments
  filter?: PhotoFilter
  crop?: CropSettings
  createdAt: string
  updatedAt: string
}

/** Uma página/foto do carrossel do Instagram. Pode conter 1 foto ou uma collage. */
export interface DumpItem {
  id: string
  projectId: string
  orderIndex: number
  title: string
  previewPath?: string
  canvas: CanvasSettings
  layers: Layer[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  format: InstagramFormat
  defaultExportFormat: 'jpg' | 'png'
  defaultExportQuality: number
  dumpItems: DumpItem[]
  /** Pool de fotos importadas no projeto, disponíveis para arrastar/clicar nas páginas. */
  assets: OriginalAsset[]
  lastOpenedAt?: string
  archivedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectSummary {
  id: string
  name: string
  format: InstagramFormat
  photoCount: number
  thumbnailPath?: string
  thumbnailAssetId?: string
  lastOpenedAt?: string
  updatedAt: string
  createdAt: string
}
