import type { ParametricCurve } from '@shared/types'
import { sampleParametric, LUT_SIZE } from '../../../engine/pipeline/curveLut'

interface ParametricCurvePreviewProps {
  parametric: ParametricCurve
}

/**
 * Gráfico (somente leitura) da Curva Paramétrica — mesmo visual do {@link CurveEditor}, mas sem
 * pontos arrastáveis: a curva é controlada pelos 4 sliders de região (Realces/Claros/Escuros/Sombras).
 * As divisórias verticais marcam as zonas tonais, como no painel de Curva Paramétrica do Lightroom.
 */
export function ParametricCurvePreview({ parametric }: ParametricCurvePreviewProps): JSX.Element {
  const lut = sampleParametric(parametric)
  const pathPoints = Array.from(lut, (y, i) => `${(i / (LUT_SIZE - 1)) * 100},${(1 - y) * 100}`).join(' ')

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="aspect-square w-full select-none rounded-md border border-noir-border bg-noir-bg"
    >
      {/* Zonas tonais (sombras · escuros · claros · realces). */}
      {[25, 50, 75].map((v) => (
        <line key={`v${v}`} x1={v} y1={0} x2={v} y2={100} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
      ))}
      {[25, 50, 75].map((v) => (
        <line key={`h${v}`} x1={0} y1={v} x2={100} y2={v} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
      ))}
      {/* Diagonal de referência (identidade). */}
      <line x1={0} y1={100} x2={100} y2={0} stroke="rgba(255,255,255,0.14)" strokeWidth={0.5} />
      <polyline points={pathPoints} fill="none" stroke="#e8e8e8" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
