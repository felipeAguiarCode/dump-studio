import type { FormatSpec } from './constants'
import type { BorderLayerData, CanvasSettings, CompositionFrame, ImageLayerData, Layer, ShapeLayerData, TextLayerData } from './types'
import { slotRectToTransform } from './layoutGeometry'

/** Contain the composition as one piece, preserving crops and the aspect of every element. */
export function resizeComposition(canvas: CanvasSettings, layers: Layer[], target: FormatSpec): { canvas: CanvasSettings; layers: Layer[] } {
  if (canvas.width <= 0 || canvas.height <= 0) throw new Error('Invalid canvas dimensions')
  const full = { x: 0, y: 0, width: canvas.width, height: canvas.height }
  const original = canvas.compositionFrame ?? full
  let frame = { ...original }
  const geometry = (layer: Layer): Layer['transform'] => {
    const index = (layer.data as ImageLayerData).slotIndex
    const slot = index != null ? canvas.layout?.slots[index] : undefined
    return layer.type === 'image' && slot
      ? { ...layer.transform, ...slotRectToTransform(slot, canvas, canvas.layout!.gutter) }
      : layer.transform
  }

  // Include content newly placed in the margins, while retaining the previous artboard basis.
  for (const layer of layers) {
    if (layer.type === 'background' || !layer.visible) continue
    const t = layer.type === 'border'
      ? { ...((layer.data as BorderLayerData).frame ?? full), rotation: 0 }
      : geometry(layer)
    const angle = t.rotation * Math.PI / 180
    const corners = [[0, 0], [t.width, 0], [0, t.height], [t.width, t.height]].map(([x, y]) => ({
      x: t.x + x * Math.cos(angle) - y * Math.sin(angle),
      y: t.y + x * Math.sin(angle) + y * Math.cos(angle)
    }))
    let left = Math.max(0, Math.min(...corners.map((p) => p.x)))
    let top = Math.max(0, Math.min(...corners.map((p) => p.y)))
    let right = Math.min(canvas.width, Math.max(...corners.map((p) => p.x)))
    let bottom = Math.min(canvas.height, Math.max(...corners.map((p) => p.y)))
    // Slotted overlays can extend far beyond their actual visible clip.
    const slotIndex = (layer.data as ImageLayerData).slotIndex
    const clip = slotIndex != null ? canvas.layout?.slots[slotIndex] : undefined
    if (layer.type === 'overlay' && clip) {
      left = Math.max(left, clip.x * canvas.width)
      top = Math.max(top, clip.y * canvas.height)
      right = Math.min(right, (clip.x + clip.w) * canvas.width)
      bottom = Math.min(bottom, (clip.y + clip.h) * canvas.height)
    }
    if (right <= left || bottom <= top) continue
    const x = Math.min(frame.x, left)
    const y = Math.min(frame.y, top)
    frame = { x, y, width: Math.max(frame.x + frame.width, right) - x, height: Math.max(frame.y + frame.height, bottom) - y }
  }

  const scale = Math.min(target.width / frame.width, target.height / frame.height)
  const dx = (target.width - frame.width * scale) / 2 - frame.x * scale
  const dy = (target.height - frame.height * scale) / 2 - frame.y * scale
  const map = <T extends CompositionFrame>(rect: T): T => ({ ...rect, x: dx + rect.x * scale, y: dy + rect.y * scale, width: rect.width * scale, height: rect.height * scale })

  const resizedLayers = layers.map((layer): Layer => {
    if (layer.type === 'background') return layer
    let data = { ...layer.data }
    if (layer.type === 'image') {
      const image = layer.data as ImageLayerData
      if (image.border) data = { ...image, border: { ...image.border, width: image.border.width * scale, radius: {
        tl: image.border.radius.tl * scale, tr: image.border.radius.tr * scale,
        br: image.border.radius.br * scale, bl: image.border.radius.bl * scale
      } } }
    } else if (layer.type === 'text') {
      const text = layer.data as TextLayerData
      data = { ...text, fontSize: text.fontSize * scale, ...(text.letterSpacing != null ? { letterSpacing: text.letterSpacing * scale } : {}) }
    } else if (layer.type === 'shape') {
      const shape = layer.data as ShapeLayerData
      data = { ...shape, strokeWidth: shape.strokeWidth * scale, cornerRadius: shape.cornerRadius * scale }
    } else if (layer.type === 'border') {
      const border = layer.data as BorderLayerData
      data = { ...border, thickness: border.thickness * scale, cornerRadius: border.cornerRadius * scale, gutter: border.gutter * scale, frame: map(border.frame ?? full) }
    }
    return { ...layer, transform: map(geometry(layer)), data }
  })

  return {
    canvas: {
      ...canvas, width: target.width, height: target.height, format: target.id,
      compositionFrame: map(frame),
      layout: canvas.layout ? {
        ...canvas.layout, gutter: canvas.layout.gutter * scale,
        slots: canvas.layout.slots.map((slot) => ({ ...slot,
          x: (dx + slot.x * canvas.width * scale) / target.width,
          y: (dy + slot.y * canvas.height * scale) / target.height,
          w: slot.w * canvas.width * scale / target.width,
          h: slot.h * canvas.height * scale / target.height
        }))
      } : canvas.layout
    },
    layers: resizedLayers
  }
}
