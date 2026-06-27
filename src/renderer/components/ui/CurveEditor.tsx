import { useRef } from 'react'
import type { CurveChannel, CurvePoint } from '@shared/types'
import { sampleCurve, LUT_SIZE } from '../../../engine/pipeline/curveLut'

const CHANNEL_COLOR: Record<CurveChannel, string> = {
  rgb: '#e8e8e8',
  red: '#e05a5a',
  green: '#46c46a',
  blue: '#5a86e8'
}

interface CurveEditorProps {
  points: CurvePoint[]
  channel: CurveChannel
  onChange: (points: CurvePoint[]) => void
  /** Disparado no início de um gesto (para capturar histórico). */
  onChangeStart?: () => void
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * Editor de curva de tom estilo Photoshop/Lightroom: gráfico quadrado com pontos arrastáveis.
 * Eixo X = entrada (sombras→luzes), eixo Y = saída. Arrastar move; clicar no vazio adiciona;
 * duplo-clique remove (exceto os extremos, cujo X fica fixo em 0 e 1). A curva desenhada usa
 * a MESMA `sampleCurve` da LUT do shader (WYSIWYG).
 */
export function CurveEditor({ points, channel, onChange, onChangeStart }: CurveEditorProps): JSX.Element {
  const ref = useRef<SVGSVGElement>(null)
  const dragging = useRef<number | null>(null)
  const color = CHANNEL_COLOR[channel]

  const toLocal = (clientX: number, clientY: number): CurvePoint => {
    const r = ref.current!.getBoundingClientRect()
    return { x: clamp01((clientX - r.left) / r.width), y: clamp01(1 - (clientY - r.top) / r.height) }
  }

  const onPointDown = (i: number, e: React.PointerEvent): void => {
    e.stopPropagation()
    e.preventDefault()
    onChangeStart?.()
    dragging.current = i
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const onMove = (e: React.PointerEvent): void => {
    const i = dragging.current
    if (i == null) return
    const { x, y } = toLocal(e.clientX, e.clientY)
    const next = points.map((p) => ({ ...p }))
    let nx = x
    if (i === 0) nx = 0
    else if (i === points.length - 1) nx = 1
    else nx = Math.min(Math.max(x, points[i - 1].x + 0.005), points[i + 1].x - 0.005)
    next[i] = { x: nx, y }
    onChange(next)
  }

  const onUp = (e: React.PointerEvent): void => {
    if (dragging.current != null) {
      try {
        ;(e.target as Element).releasePointerCapture(e.pointerId)
      } catch {
        /* ok */
      }
    }
    dragging.current = null
  }

  // Clique em área vazia → adiciona um ponto (entre os extremos).
  const onAdd = (e: React.PointerEvent): void => {
    const { x, y } = toLocal(e.clientX, e.clientY)
    if (x <= 0.02 || x >= 0.98) return
    onChangeStart?.()
    onChange([...points, { x, y }].sort((a, b) => a.x - b.x))
  }

  const onRemove = (i: number, e: React.MouseEvent): void => {
    e.stopPropagation()
    if (i === 0 || i === points.length - 1) return
    onChangeStart?.()
    onChange(points.filter((_, idx) => idx !== i))
  }

  const lut = sampleCurve(points)
  const pathPoints = Array.from(lut, (y, i) => `${(i / (LUT_SIZE - 1)) * 100},${(1 - y) * 100}`).join(' ')

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="aspect-square w-full cursor-crosshair touch-none select-none rounded-md border border-noir-border bg-noir-bg"
      onPointerDown={onAdd}
      onPointerMove={onMove}
      onPointerUp={onUp}
    >
      {[25, 50, 75].map((v) => (
        <line key={`v${v}`} x1={v} y1={0} x2={v} y2={100} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
      ))}
      {[25, 50, 75].map((v) => (
        <line key={`h${v}`} x1={0} y1={v} x2={100} y2={v} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
      ))}
      {/* Diagonal de referência (identidade). */}
      <line x1={0} y1={100} x2={100} y2={0} stroke="rgba(255,255,255,0.14)" strokeWidth={0.5} />
      <polyline points={pathPoints} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x * 100}
          cy={(1 - p.y) * 100}
          r={2.6}
          fill={color}
          stroke="#0b0b0b"
          strokeWidth={0.9}
          className="cursor-pointer"
          onPointerDown={(e) => onPointDown(i, e)}
          onDoubleClick={(e) => onRemove(i, e)}
        />
      ))}
    </svg>
  )
}
