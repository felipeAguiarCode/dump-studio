import { useEffect, useRef, useState } from 'react'
import type { Layer, ImageLayerData } from '@shared/types'
import { DEFAULT_ADJUSTMENTS } from '@shared/defaults'
import { getGLContext } from '../../../engine/pipeline/glContext'
import { buildUniforms } from '../../../engine/pipeline/params'
import { useImage } from '../../hooks/useImage'
import { assetUrl } from '../../services/assetUrls'

const MAX_PREVIEW_EDGE = 1280

function seedFromId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000
  return h / 100
}

/**
 * Processa a camada de imagem pelo pipeline WebGL e devolve um canvas de saída.
 * Reprocessa (coalescido em rAF) quando ajustes/filtro/tamanho mudam.
 */
export function useProcessedLayer(
  layer: Layer,
  referenceWidth: number
): { canvas: HTMLCanvasElement; version: number; ready: boolean } {
  const data = layer.data as ImageLayerData
  const src = useImage(assetUrl(data.assetId))
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))
  const [version, setVersion] = useState(0)
  const rafRef = useRef<number | undefined>(undefined)

  const t = layer.transform

  useEffect(() => {
    if (!src) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const longest = Math.max(t.width, t.height)
      const k = Math.min(1, MAX_PREVIEW_EDGE / Math.max(longest, 1))
      const pw = Math.max(1, Math.round(t.width * k))
      const ph = Math.max(1, Math.round(t.height * k))
      const uniforms = buildUniforms(
        layer.adjustments ?? DEFAULT_ADJUSTMENTS,
        layer.filter,
        referenceWidth,
        seedFromId(layer.id),
        layer.crop,
        data.shaders
      )
      try {
        getGLContext().process(data.assetId, src, uniforms, canvasRef.current, pw, ph)
        setVersion((v) => v + 1)
      } catch (e) {
        console.error('[pipeline] falha ao processar camada', e)
      }
    })
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, layer.adjustments, layer.filter, layer.crop, data.shaders, t.width, t.height, referenceWidth, data.assetId])

  return { canvas: canvasRef.current, version, ready: !!src && version > 0 }
}
