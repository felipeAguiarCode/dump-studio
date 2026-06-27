import type { Layer } from '@shared/types'

export type AlignMode = 'left' | 'centerH' | 'right' | 'top' | 'centerV' | 'bottom'

interface Box {
  id: string
  x: number
  y: number
  w: number
  h: number
}

function boxes(layers: Layer[]): Box[] {
  return layers.map((l) => ({ id: l.id, x: l.transform.x, y: l.transform.y, w: l.transform.width, h: l.transform.height }))
}

/** Alinha em relação à bounding box do conjunto (ou ao canvas se 1 elemento). */
export function alignLayers(
  layers: Layer[],
  mode: AlignMode,
  canvas: { width: number; height: number }
): Record<string, { x: number; y: number }> {
  const bs = boxes(layers)
  const result: Record<string, { x: number; y: number }> = {}
  const useCanvas = bs.length <= 1
  const minX = useCanvas ? 0 : Math.min(...bs.map((b) => b.x))
  const maxX = useCanvas ? canvas.width : Math.max(...bs.map((b) => b.x + b.w))
  const minY = useCanvas ? 0 : Math.min(...bs.map((b) => b.y))
  const maxY = useCanvas ? canvas.height : Math.max(...bs.map((b) => b.y + b.h))

  for (const b of bs) {
    let { x, y } = b
    if (mode === 'left') x = minX
    else if (mode === 'right') x = maxX - b.w
    else if (mode === 'centerH') x = (minX + maxX) / 2 - b.w / 2
    else if (mode === 'top') y = minY
    else if (mode === 'bottom') y = maxY - b.h
    else if (mode === 'centerV') y = (minY + maxY) / 2 - b.h / 2
    result[b.id] = { x, y }
  }
  return result
}

export function distributeLayers(layers: Layer[], axis: 'h' | 'v'): Record<string, { x: number; y: number }> {
  const bs = boxes(layers)
  const result: Record<string, { x: number; y: number }> = {}
  if (bs.length < 3) return result
  const sorted = [...bs].sort((a, b) => (axis === 'h' ? a.x - b.x : a.y - b.y))
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (axis === 'h') {
    const span = last.x - first.x
    const gap = span / (sorted.length - 1)
    sorted.forEach((b, i) => (result[b.id] = { x: first.x + gap * i, y: b.y }))
  } else {
    const span = last.y - first.y
    const gap = span / (sorted.length - 1)
    sorted.forEach((b, i) => (result[b.id] = { x: b.x, y: first.y + gap * i }))
  }
  return result
}
