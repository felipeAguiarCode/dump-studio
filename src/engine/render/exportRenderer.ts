import Konva from 'konva'
import type {
  BorderLayerData,
  DumpItem,
  ImageLayerData,
  OverlayLayerData,
  ShapeLayerData,
  TextLayerData
} from '@shared/types'
import { DEFAULT_ADJUSTMENTS, DEFAULT_IMAGE_BORDER } from '@shared/defaults'
import { getGLContext } from '../pipeline/glContext'
import { buildUniforms } from '../pipeline/params'
import { resolveBackground } from '../../renderer/features/canvas/background'
import { slotRectToTransform, slotClipPath } from '../../renderer/features/canvas/layoutSlots'
import { buildCurvedText } from '../../renderer/features/canvas/curvedText'
import { ensureFontsLoaded } from '../../renderer/styles/fonts'
import { assetUrl } from '../../renderer/services/assetUrls'
import { overlayUrl, tintOverlay } from '../../renderer/lib/overlays'
import { traceRoundedRect, radiiToArray } from '../../renderer/lib/roundedRect'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Compõe um DumpItem na resolução EXATA do formato, com cada camada de imagem
 * passando por seu próprio pipeline. Sem overlays de edição. Retorna um dataURL.
 */
export async function composeDumpItem(
  item: DumpItem,
  opts: { format: 'jpg' | 'png'; quality: number }
): Promise<string> {
  const { width, height } = item.canvas
  // Garante que as fontes das camadas de texto estejam carregadas antes de desenhar (WYSIWYG).
  const textFamilies = item.layers
    .filter((l) => l.visible && l.type === 'text')
    .map((l) => (l.data as TextLayerData).fontFamily)
  if (textFamilies.length) await ensureFontsLoaded(textFamilies)
  const container = document.createElement('div')
  const stage = new Konva.Stage({ container, width, height })
  const layer = new Konva.Layer()
  stage.add(layer)

  const sorted = [...item.layers].sort((a, b) => a.orderIndex - b.orderIndex)
  const bg = resolveBackground(String(item.canvas.backgroundColor))
  if (bg && !(opts.format === 'png' && item.canvas.backgroundColor === 'transparent')) {
    layer.add(new Konva.Rect({ x: 0, y: 0, width, height, fill: bg }))
  }

  for (const l of sorted) {
    if (!l.visible || l.type === 'background') continue
    const t = l.transform
    if (l.type === 'image') {
      const data = l.data as ImageLayerData
      // Imagem encaixada num slot: deriva a geometria do layout (mesma fonte de verdade do canvas).
      const layout = item.canvas.layout
      const slotted = !!layout && data.slotIndex != null && data.slotIndex < layout.slots.length
      const slotGeo = slotted
        ? slotRectToTransform(layout!.slots[data.slotIndex as number], item.canvas, layout!.gutter)
        : null
      const geo = slotGeo ?? { x: t.x, y: t.y, width: t.width, height: t.height }
      const rot = slotGeo ? slotGeo.rotation : t.rotation
      try {
        const img = await loadImage(assetUrl(data.assetId))
        const w = Math.max(1, Math.round(geo.width))
        const h = Math.max(1, Math.round(geo.height))
        const out = document.createElement('canvas')
        const uniforms = buildUniforms(l.adjustments ?? DEFAULT_ADJUSTMENTS, l.filter, width, 0, l.crop, data.shaders)
        getGLContext().process(data.assetId, img, uniforms, out, w, h)

        const border = data.border ?? DEFAULT_IMAGE_BORDER
        const rad = border.radius
        const hasRadius = rad.tl > 0 || rad.tr > 0 || rad.br > 0 || rad.bl > 0
        const bw = border.width
        const group = new Konva.Group({
          x: geo.x,
          y: geo.y,
          width: geo.width,
          height: geo.height,
          rotation: rot,
          opacity: l.opacity,
          clipFunc: hasRadius
            ? (ctx) => traceRoundedRect(ctx as unknown as CanvasRenderingContext2D, 0, 0, geo.width, geo.height, rad)
            : undefined
        })
        group.add(new Konva.Image({ image: out, x: 0, y: 0, width: geo.width, height: geo.height }))
        if (bw > 0) {
          const ins = (v: number): number => Math.max(0, v - bw / 2)
          group.add(
            new Konva.Rect({
              x: bw / 2,
              y: bw / 2,
              width: geo.width - bw,
              height: geo.height - bw,
              cornerRadius: radiiToArray({ tl: ins(rad.tl), tr: ins(rad.tr), br: ins(rad.br), bl: ins(rad.bl) }),
              stroke: border.color,
              strokeWidth: bw
            })
          )
        }
        layer.add(group)
      } catch {
        /* pula imagem que falhar */
      }
    } else if (l.type === 'text') {
      const d = l.data as TextLayerData
      const bold = d.fontWeight >= 600
      const curved = buildCurvedText(d.text, d.fontSize, d.fontFamily, bold, d.curve ?? 0)
      if (curved) {
        const g = new Konva.Group({ x: t.x, y: t.y, rotation: t.rotation, opacity: l.opacity })
        g.add(
          new Konva.TextPath({
            x: t.width / 2,
            y: t.height / 2 + curved.dy,
            data: curved.data,
            text: d.text,
            fontFamily: d.fontFamily,
            fontSize: d.fontSize,
            fontStyle: bold ? 'bold' : 'normal',
            fill: d.color,
            align: 'center'
          })
        )
        layer.add(g)
      } else {
        layer.add(
          new Konva.Text({
            x: t.x,
            y: t.y,
            width: t.width,
            text: d.text,
            fontFamily: d.fontFamily,
            fontSize: d.fontSize,
            fontStyle: bold ? 'bold' : 'normal',
            fill: d.color,
            align: d.align,
            lineHeight: d.lineHeight ?? 1.2,
            rotation: t.rotation,
            opacity: l.opacity
          })
        )
      }
    } else if (l.type === 'shape') {
      const d = l.data as ShapeLayerData
      layer.add(
        new Konva.Rect({
          x: t.x,
          y: t.y,
          width: t.width,
          height: t.height,
          fill: d.fill === 'transparent' ? undefined : d.fill,
          stroke: d.stroke,
          strokeWidth: d.strokeWidth,
          cornerRadius: d.cornerRadius,
          rotation: t.rotation,
          opacity: l.opacity
        })
      )
    } else if (l.type === 'border') {
      const d = l.data as BorderLayerData
      layer.add(
        new Konva.Rect({
          x: d.thickness / 2,
          y: d.thickness / 2,
          width: width - d.thickness,
          height: height - d.thickness,
          stroke: d.color,
          strokeWidth: d.thickness,
          cornerRadius: d.cornerRadius,
          opacity: l.opacity
        })
      )
    } else if (l.type === 'overlay') {
      const data = l.data as OverlayLayerData
      // O overlay usa o próprio transform (pan/escala). Em layout, recorta ao slot (clip).
      const layout = item.canvas.layout
      const slotGeo =
        !!layout && data.slotIndex != null && data.slotIndex < layout.slots.length
          ? slotRectToTransform(layout.slots[data.slotIndex], item.canvas, layout.gutter)
          : null
      try {
        const img = tintOverlay(await loadImage(overlayUrl(data.overlayId)), data.color ?? '#000000')
        const w = Math.max(1, Math.round(t.width))
        const h = Math.max(1, Math.round(t.height))
        const group = new Konva.Group({ x: t.x, y: t.y, width: w, height: h, rotation: t.rotation, opacity: l.opacity })
        group.add(
          new Konva.Image({
            image: img,
            x: data.flipX ? w : 0,
            y: data.flipY ? h : 0,
            width: w,
            height: h,
            scaleX: data.flipX ? -1 : 1,
            scaleY: data.flipY ? -1 : 1
          })
        )
        if (slotGeo) {
          const clip = new Konva.Group({ clipFunc: (c) => slotClipPath(c, slotGeo) })
          clip.add(group)
          layer.add(clip)
        } else {
          layer.add(group)
        }
      } catch {
        /* pula overlay que falhar */
      }
    }
  }

  layer.draw()
  const mimeType = opts.format === 'png' ? 'image/png' : 'image/jpeg'
  const dataUrl = stage.toDataURL({ mimeType, quality: opts.quality / 100, pixelRatio: 1 })
  stage.destroy()
  return dataUrl
}

export async function composeDumpItems(
  items: DumpItem[],
  opts: { format: 'jpg' | 'png'; quality: number },
  onProgress?: (done: number, total: number) => void
): Promise<{ index: number; dataUrl: string }[]> {
  const out: { index: number; dataUrl: string }[] = []
  for (let i = 0; i < items.length; i++) {
    out.push({ index: i, dataUrl: await composeDumpItem(items[i], opts) })
    onProgress?.(i + 1, items.length)
  }
  return out
}
