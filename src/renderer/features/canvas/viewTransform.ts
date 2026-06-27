import type { CanvasSettings } from '@shared/types'

export const FIT_PADDING = 0.86

export interface ViewTransform {
  scale: number
  offsetX: number
  offsetY: number
}

/** Mapeia coordenadas do documento → tela. Compartilhado entre o Stage e overlays HTML. */
export function computeView(
  size: { width: number; height: number },
  doc: Pick<CanvasSettings, 'width' | 'height'>,
  zoom: number,
  panX: number,
  panY: number
): ViewTransform {
  const fitScale = Math.min(size.width / doc.width, size.height / doc.height) * FIT_PADDING
  const scale = fitScale * zoom
  return {
    scale,
    offsetX: (size.width - doc.width * scale) / 2 + panX,
    offsetY: (size.height - doc.height * scale) / 2 + panY
  }
}
