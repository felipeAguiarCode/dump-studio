import type { CurvePoint, ParametricCurve, ToneCurves } from '@shared/types'

/** Resolução da LUT (entrada 0..255). */
export const LUT_SIZE = 256

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

/**
 * Amostra uma curva de pontos em `LUT_SIZE` valores (x de 0..1) via spline cúbica
 * monotônica (Fritsch–Carlson / PCHIP) — suave e sem overshoot. Fallback linear/constante
 * para 0/1 ponto. Reaproveitada pela UI (path da curva) e pela LUT do shader.
 */
export function sampleCurve(rawPoints: CurvePoint[]): Float64Array {
  const pts = [...rawPoints]
    .map((p) => ({ x: clamp01(p.x), y: clamp01(p.y) }))
    .sort((a, b) => a.x - b.x)
  const xs: number[] = []
  const ys: number[] = []
  for (const p of pts) {
    if (xs.length && p.x - xs[xs.length - 1] < 1e-6) continue // descarta x duplicado
    xs.push(p.x)
    ys.push(p.y)
  }
  const out = new Float64Array(LUT_SIZE)
  const n = xs.length
  if (n === 0) {
    for (let i = 0; i < LUT_SIZE; i++) out[i] = i / (LUT_SIZE - 1) // identidade
    return out
  }
  if (n === 1) {
    out.fill(ys[0])
    return out
  }

  const h: number[] = []
  const delta: number[] = []
  for (let i = 0; i < n - 1; i++) {
    h[i] = xs[i + 1] - xs[i]
    delta[i] = (ys[i + 1] - ys[i]) / h[i]
  }
  const m: number[] = new Array(n)
  m[0] = delta[0]
  m[n - 1] = delta[n - 2]
  for (let i = 1; i < n - 1; i++) {
    if (delta[i - 1] * delta[i] <= 0) {
      m[i] = 0
    } else {
      const w1 = 2 * h[i] + h[i - 1]
      const w2 = h[i] + 2 * h[i - 1]
      m[i] = (w1 + w2) / (w1 / delta[i - 1] + w2 / delta[i])
    }
  }

  for (let i = 0; i < LUT_SIZE; i++) {
    const x = i / (LUT_SIZE - 1)
    if (x <= xs[0]) {
      out[i] = ys[0]
      continue
    }
    if (x >= xs[n - 1]) {
      out[i] = ys[n - 1]
      continue
    }
    let k = 0
    while (k < n - 1 && x > xs[k + 1]) k++
    const t = (x - xs[k]) / h[k]
    const t2 = t * t
    const t3 = t2 * t
    const h00 = 2 * t3 - 3 * t2 + 1
    const h10 = t3 - 2 * t2 + t
    const h01 = -2 * t3 + 3 * t2
    const h11 = t3 - t2
    out[i] = clamp01(h00 * ys[k] + h10 * h[k] * m[k] + h01 * ys[k + 1] + h11 * h[k] * m[k + 1])
  }
  return out
}

/** Parametrização da curva paramétrica (estilo Lightroom). */
const ZERO_PARAMETRIC: ParametricCurve = { highlights: 0, lights: 0, darks: 0, shadows: 0 }
/** Centro tonal (x em 0..1) de cada região — das sombras (esquerda) aos realces (direita). */
const REGION_CENTERS = { shadows: 0.1, darks: 0.36, lights: 0.64, highlights: 0.9 } as const
/** Largura (sigma da gaussiana) do peso de cada região: regiões adjacentes se sobrepõem suavemente. */
const REGION_SIGMA = 0.18
/** Deslocamento máximo de saída (0..1) que um slider em ±100 aplica no centro da sua região. */
const REGION_MAX_SHIFT = 0.2

function regionWeight(x: number, center: number): number {
  const d = x - center
  return Math.exp(-(d * d) / (2 * REGION_SIGMA * REGION_SIGMA))
}

/**
 * Amostra a curva paramétrica em `LUT_SIZE` valores. Cada região soma um "morro" gaussiano suave
 * centrado na sua zona tonal; a soma das 4 regiões desloca a diagonal identidade. Igual ao
 * comportamento do painel de Curva Paramétrica do Lightroom (Realces/Claros/Escuros/Sombras).
 */
export function sampleParametric(p: ParametricCurve): Float64Array {
  const s = p.shadows / 100
  const d = p.darks / 100
  const l = p.lights / 100
  const h = p.highlights / 100
  const out = new Float64Array(LUT_SIZE)
  for (let i = 0; i < LUT_SIZE; i++) {
    const x = i / (LUT_SIZE - 1)
    let y = x
    y += s * regionWeight(x, REGION_CENTERS.shadows) * REGION_MAX_SHIFT
    y += d * regionWeight(x, REGION_CENTERS.darks) * REGION_MAX_SHIFT
    y += l * regionWeight(x, REGION_CENTERS.lights) * REGION_MAX_SHIFT
    y += h * regionWeight(x, REGION_CENTERS.highlights) * REGION_MAX_SHIFT
    out[i] = clamp01(y)
  }
  return out
}

export function parametricIsIdentity(p: ParametricCurve): boolean {
  return p.highlights === 0 && p.lights === 0 && p.darks === 0 && p.shadows === 0
}

/**
 * LUT RGBA (256×1) das curvas: por texel x → `.r`=Vermelho, `.g`=Verde, `.b`=Azul, `.a`=Mestre(RGB).
 * O shader aplica o canal mestre a cada componente e depois a curva do componente. O canal mestre
 * é a composição entrada→paramétrica→curva de pontos (a paramétrica age antes da curva de pontos).
 */
export function buildCurveLUT(curves: ToneCurves): Uint8Array {
  const pointMaster = sampleCurve(curves.rgb)
  const parametric = sampleParametric(curves.parametric ?? ZERO_PARAMETRIC)
  const master = new Float64Array(LUT_SIZE)
  for (let i = 0; i < LUT_SIZE; i++) {
    const idx = Math.round(parametric[i] * (LUT_SIZE - 1))
    master[i] = pointMaster[idx]
  }
  const red = sampleCurve(curves.red)
  const green = sampleCurve(curves.green)
  const blue = sampleCurve(curves.blue)
  const lut = new Uint8Array(LUT_SIZE * 4)
  for (let i = 0; i < LUT_SIZE; i++) {
    lut[i * 4 + 0] = Math.round(red[i] * 255)
    lut[i * 4 + 1] = Math.round(green[i] * 255)
    lut[i * 4 + 2] = Math.round(blue[i] * 255)
    lut[i * 4 + 3] = Math.round(master[i] * 255)
  }
  return lut
}

function channelIsIdentity(points: CurvePoint[]): boolean {
  return points.every((p) => Math.abs(p.y - p.x) < 1e-4)
}

/** Todas as curvas na diagonal (sem efeito) → permite desligar o passo no shader. */
export function curvesAreIdentity(curves: ToneCurves): boolean {
  return (
    parametricIsIdentity(curves.parametric ?? ZERO_PARAMETRIC) &&
    channelIsIdentity(curves.rgb) &&
    channelIsIdentity(curves.red) &&
    channelIsIdentity(curves.green) &&
    channelIsIdentity(curves.blue)
  )
}
