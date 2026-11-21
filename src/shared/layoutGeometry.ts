import type { SlotRect } from './types'

export interface SlotTransform {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

/** Slot geometry shared by persistence, canvas and export. */
export function slotRectToTransform(slot: SlotRect, canvas: { width: number; height: number }, gutter: number): SlotTransform {
  const width = Math.max(1, slot.w * canvas.width - gutter)
  const height = Math.max(1, slot.h * canvas.height - gutter)
  const cx = slot.x * canvas.width + gutter / 2 + width / 2
  const cy = slot.y * canvas.height + gutter / 2 + height / 2
  const rotation = slot.rot ?? 0
  const rad = rotation * Math.PI / 180
  return {
    x: cx - (width / 2 * Math.cos(rad) - height / 2 * Math.sin(rad)),
    y: cy - (width / 2 * Math.sin(rad) + height / 2 * Math.cos(rad)),
    width, height, rotation
  }
}
