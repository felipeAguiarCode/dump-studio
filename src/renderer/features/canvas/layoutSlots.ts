import { coverRect } from './collageTemplates'
import type { SlotTransform } from '@shared/layoutGeometry'
export type { SlotTransform } from '@shared/layoutGeometry'
export { slotRectToTransform } from '@shared/layoutGeometry'

/**
 * Geometria real (px do canvas) de um slot a partir do retângulo normalizado + gutter.
 * Fonte única de verdade — derivada em tempo de render, imune a reescala de formato.
 *
 * Slots com `rot` (graus) giram em torno do CENTRO da célula. Como o Konva rotaciona
 * o nó em torno do seu (x,y) (canto superior-esquerdo), recuamos o (x,y) de modo que,
 * após a rotação, o centro do painel caia exatamente no centro da célula.
 */
/** Tipo mínimo de contexto para traçar um caminho (Konva.Context e CanvasRenderingContext2D). */
interface PathCtx {
  beginPath(): void
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  closePath(): void
}

/**
 * Traça o caminho (px do canvas) de um slot, girado em torno do seu (x,y) — igual ao render do slot.
 * Usado como `clipFunc` para recortar overlays à caixa do slot (canvas e export).
 */
export function slotClipPath(ctx: PathCtx, slot: SlotTransform): void {
  const rad = ((slot.rotation || 0) * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const corner = (dx: number, dy: number): { x: number; y: number } => ({
    x: slot.x + dx * cos - dy * sin,
    y: slot.y + dx * sin + dy * cos
  })
  const p0 = corner(0, 0)
  const p1 = corner(slot.width, 0)
  const p2 = corner(slot.width, slot.height)
  const p3 = corner(0, slot.height)
  ctx.beginPath()
  ctx.moveTo(p0.x, p0.y)
  ctx.lineTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.closePath()
}

/** Janela cover (crop.rect normalizado 0..1) que preenche um slot sem distorção. */
export function coverCropForSlot(
  originalW: number,
  originalH: number,
  slotW: number,
  slotH: number
): { x: number; y: number; width: number; height: number } {
  const r = coverRect(originalW, originalH, slotW, slotH)
  return { x: r.x, y: r.y, width: r.w, height: r.h }
}

/**
 * Crop de uma fatia de "emenda" (carrossel contínuo). Cobre uma tela combinada de
 * `count` slots lado a lado (sem distorção) e devolve a fração horizontal `index`.
 * Como cada fatia tem o aspecto do slot e compartilha o mesmo recorte vertical, as
 * partes encaixam perfeitamente entre os slides (use a MESMA foto em todas).
 */
export function seamCropForSlot(
  originalW: number,
  originalH: number,
  slotW: number,
  slotH: number,
  index: number,
  count: number
): { x: number; y: number; width: number; height: number } {
  const cover = coverRect(originalW, originalH, count * slotW, slotH)
  const subW = cover.w / count
  return { x: cover.x + index * subW, y: cover.y, width: subW, height: cover.h }
}
