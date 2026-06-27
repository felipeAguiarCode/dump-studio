import { quoteFamily } from '../../styles/fonts'

// Texto curvo (WordArt): gera um caminho de arco circular para Konva.TextPath.
// O apex (meio do texto) fica na origem (0,0); o `dy` reposiciona o nó para centralizar
// verticalmente o arco. curve ∈ [-100,100]: 0 = reto; +cima / -baixo; ±100 = círculo completo.

let mctx: CanvasRenderingContext2D | null = null
function measureWidth(text: string, fontSize: number, family: string, bold: boolean): number {
  const fallback = Math.max(1, text?.length ?? 1) * fontSize * 0.5
  if (typeof document === 'undefined') return fallback
  if (!mctx) mctx = document.createElement('canvas').getContext('2d')
  if (!mctx) return fallback
  mctx.font = `${bold ? 700 : 400} ${fontSize}px ${quoteFamily(family)}`
  return mctx.measureText(text || ' ').width || fallback
}

const P = (r: number, cy: number, ang: number): string =>
  `${(r * Math.cos(ang)).toFixed(2)} ${(cy + r * Math.sin(ang)).toFixed(2)}`

export interface CurvedText {
  data: string
  /** Deslocamento vertical do nó para centralizar o arco no box. */
  dy: number
}

export function buildCurvedText(
  text: string,
  fontSize: number,
  family: string,
  bold: boolean,
  curve: number
): CurvedText | null {
  const c = Math.max(-100, Math.min(100, curve || 0))
  if (Math.abs(c) < 1) return null
  const w = measureWidth(text, fontSize, family, bold)
  if (w <= 1) return null
  const theta = Math.min(Math.PI * 2, (Math.abs(c) / 100) * Math.PI * 2)
  const r = w / theta
  const up = c > 0
  const yOff = (r * (1 - Math.cos(theta / 2))) / 2

  if (Math.abs(c) >= 100) {
    const data = up
      ? `M 0 0 A ${r} ${r} 0 1 1 0 ${(2 * r).toFixed(2)} A ${r} ${r} 0 1 1 0 0`
      : `M 0 0 A ${r} ${r} 0 1 1 0 ${(-2 * r).toFixed(2)} A ${r} ${r} 0 1 1 0 0`
    return { data, dy: up ? -r : r }
  }

  const largeArc = theta > Math.PI ? 1 : 0
  if (up) {
    // coroa (∩): apex (topo) na origem; arco superior
    const a0 = -Math.PI / 2 - theta / 2
    const a1 = -Math.PI / 2 + theta / 2
    return { data: `M ${P(r, r, a0)} A ${r} ${r} 0 ${largeArc} 1 ${P(r, r, a1)}`, dy: -yOff }
  }
  // vale (∪): apex (base) na origem; arco inferior
  const a0 = Math.PI / 2 + theta / 2
  const a1 = Math.PI / 2 - theta / 2
  return { data: `M ${P(r, -r, a0)} A ${r} ${r} 0 ${largeArc} 0 ${P(r, -r, a1)}`, dy: yOff }
}
