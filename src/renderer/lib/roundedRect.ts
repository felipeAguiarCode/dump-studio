import type { CornerRadii } from '@shared/types'

interface PathCtx {
  beginPath(): void
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void
  closePath(): void
}

/** Traça um retângulo com raios independentes por canto (usado em clipFunc do Konva e no canvas 2D). */
export function traceRoundedRect(
  ctx: PathCtx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: CornerRadii
): void {
  const max = Math.min(w, h) / 2
  const tl = Math.max(0, Math.min(r.tl, max))
  const tr = Math.max(0, Math.min(r.tr, max))
  const br = Math.max(0, Math.min(r.br, max))
  const bl = Math.max(0, Math.min(r.bl, max))
  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y)
  ctx.arcTo(x + w, y, x + w, y + tr, tr)
  ctx.lineTo(x + w, y + h - br)
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br)
  ctx.lineTo(x + bl, y + h)
  ctx.arcTo(x, y + h, x, y + h - bl, bl)
  ctx.lineTo(x, y + tl)
  ctx.arcTo(x, y, x + tl, y, tl)
  ctx.closePath()
}

export function radiiToArray(r: CornerRadii): [number, number, number, number] {
  return [r.tl, r.tr, r.br, r.bl]
}
