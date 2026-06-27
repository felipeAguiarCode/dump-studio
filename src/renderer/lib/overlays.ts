// Catálogo de overlays (FX → Overlays): PNGs de sombra degradê bundlados.
// O Vite resolve cada import para uma URL de asset (servida como 'self'/file — ok no CSP).
import bottom30 from '../assets/overlays/bottom-30.png'
import bottom60 from '../assets/overlays/bottom-60.png'
import bottom90 from '../assets/overlays/bottom-90.png'
import top60 from '../assets/overlays/top-60.png'
import full50 from '../assets/overlays/full-50.png'
import full70 from '../assets/overlays/full-70.png'
import side30 from '../assets/overlays/side-30.png'
import lateral50 from '../assets/overlays/lateral-50.png'
import vignette55 from '../assets/overlays/vignette-55.png'
// Sombras (FX → Shadows): formas escuras p/ ficar atrás de textos/elementos.
import shBarLine from '../assets/shadows/bar-line.png'
import shBar from '../assets/shadows/bar.png'
import shBarSoft from '../assets/shadows/bar-soft.png'
import shBarCurve from '../assets/shadows/bar-curve.png'
import shBarArc from '../assets/shadows/bar-curve-down.png'
import shBarFeet from '../assets/shadows/bar-feet.png'
import shBarThick from '../assets/shadows/bar-thick.png'
import shOval from '../assets/shadows/oval.png'
import shOvalWide from '../assets/shadows/oval-wide.png'
import shBlob from '../assets/shadows/blob.png'
import shEllipse from '../assets/shadows/ellipse.png'
import shCard from '../assets/shadows/card.png'
import shCardTilt from '../assets/shadows/card-angled.png'
import shRect from '../assets/shadows/rect.png'
// Sombras retangulares puras (retângulo arredondado desfocado) — atrás de cards/elementos.
import shRectSoft from '../assets/shadows/rect-soft.png'
import shRectCrisp from '../assets/shadows/rect-crisp.png'
import shRectWide from '../assets/shadows/rect-wide.png'
import shRectTall from '../assets/shadows/rect-tall.png'
import shRectSquare from '../assets/shadows/rect-square.png'
import shRectPill from '../assets/shadows/rect-pill.png'

export interface OverlayDef {
  /** Id estável, persistido em `OverlayLayerData.overlayId`. */
  id: string
  /** Rótulo curto exibido no card. */
  label: string
  /** URL bundlada (Vite). */
  url: string
  /** Proporção largura/altura do conteúdo (sombras) — usada p/ o tamanho padrão ao adicionar. */
  aspect?: number
}

/** Sombras degradê para stories: base inferior (3 intensidades), topo, full, laterais e vinheta. */
export const OVERLAYS: OverlayDef[] = [
  { id: 'bottom-30', label: 'Bottom Soft', url: bottom30 },
  { id: 'bottom-60', label: 'Bottom', url: bottom60 },
  { id: 'bottom-90', label: 'Bottom Strong', url: bottom90 },
  { id: 'top-60', label: 'Top', url: top60 },
  { id: 'full-50', label: 'Full', url: full50 },
  { id: 'full-70', label: 'Full Soft', url: full70 },
  { id: 'side-30', label: 'Side', url: side30 },
  { id: 'lateral-50', label: 'Diagonal', url: lateral50 },
  { id: 'vignette-55', label: 'Vignette', url: vignette55 }
]

/** Sombras decorativas (formas escuras) para ficar atrás de fontes/elementos. `aspect` = larg/alt. */
export const SHADOWS: OverlayDef[] = [
  { id: 'bar-line', label: 'Line', url: shBarLine, aspect: 14.3 },
  { id: 'bar', label: 'Bar', url: shBar, aspect: 13.5 },
  { id: 'bar-soft', label: 'Soft Bar', url: shBarSoft, aspect: 3.28 },
  { id: 'bar-curve', label: 'Curve', url: shBarCurve, aspect: 9.6 },
  { id: 'bar-curve-down', label: 'Arc', url: shBarArc, aspect: 9.2 },
  { id: 'bar-feet', label: 'Bracket', url: shBarFeet, aspect: 7.35 },
  { id: 'bar-thick', label: 'Block', url: shBarThick, aspect: 4.29 },
  { id: 'oval', label: 'Oval', url: shOval, aspect: 9.6 },
  { id: 'oval-wide', label: 'Wide Oval', url: shOvalWide, aspect: 4.48 },
  { id: 'blob', label: 'Blob', url: shBlob, aspect: 2.01 },
  { id: 'ellipse', label: 'Ellipse', url: shEllipse, aspect: 2.0 },
  { id: 'card', label: 'Card', url: shCard, aspect: 0.7 },
  { id: 'card-angled', label: 'Card Tilt', url: shCardTilt, aspect: 0.53 },
  { id: 'rect', label: 'Panel', url: shRect, aspect: 1.55 },
  // Retangulares puras (sombra de card/painel)
  { id: 'rect-soft', label: 'Soft Rect', url: shRectSoft, aspect: 0.78 },
  { id: 'rect-crisp', label: 'Crisp Rect', url: shRectCrisp, aspect: 0.81 },
  { id: 'rect-square', label: 'Square', url: shRectSquare, aspect: 1.0 },
  { id: 'rect-wide', label: 'Wide Rect', url: shRectWide, aspect: 1.93 },
  { id: 'rect-tall', label: 'Tall Rect', url: shRectTall, aspect: 0.52 },
  { id: 'rect-pill', label: 'Pill', url: shRectPill, aspect: 2.83 }
]

const OVERLAY_BY_ID = new Map([...OVERLAYS, ...SHADOWS].map((o) => [o.id, o]))
const SHADOW_IDS = new Set(SHADOWS.map((s) => s.id))

/** URL bundlada de um overlay/sombra por id (string vazia se desconhecido). */
export function overlayUrl(id: string): string {
  return OVERLAY_BY_ID.get(id)?.url ?? ''
}

/** True se o id pertence ao conjunto de Sombras (vs Overlays). */
export function isShadow(id: string): boolean {
  return SHADOW_IDS.has(id)
}

const isBlack = (c: string): boolean => !c || c === '#000000' || c.toLowerCase() === '#000'

/**
 * Tinge um overlay (degradê preto) com `color`, preservando o alfa via `source-in`.
 * Preto → devolve a imagem original (sem custo). Usado no canvas e no export (WYSIWYG).
 */
export function tintOverlay(
  img: HTMLImageElement,
  color: string
): HTMLImageElement | HTMLCanvasElement {
  if (isBlack(color)) return img
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) return img
  ctx.drawImage(img, 0, 0)
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  return c
}
