import type { ViewTransform } from './viewTransform'
import { MARIGOLD, MARIGOLD_RULER } from '../../lib/colors'

interface Props {
  view: ViewTransform
  doc: { width: number; height: number }
  size: { width: number; height: number }
}

const BAND = 18
const STEP = 100

/** Réguas horizontal e vertical (marigold) ao redor do canvas. Não exportadas. */
export function Rulers({ view, doc, size }: Props): JSX.Element {
  const hTicks: JSX.Element[] = []
  for (let docX = 0; docX <= doc.width; docX += STEP) {
    const x = view.offsetX + docX * view.scale
    if (x < BAND || x > size.width) continue
    const major = docX % 500 === 0
    hTicks.push(
      <line key={`h${docX}`} x1={x} y1={major ? 4 : 10} x2={x} y2={BAND} stroke={MARIGOLD_RULER} strokeWidth={1} />
    )
    if (major) hTicks.push(<text key={`ht${docX}`} x={x + 2} y={9} fill={MARIGOLD} fontSize={7}>{docX}</text>)
  }

  const vTicks: JSX.Element[] = []
  for (let docY = 0; docY <= doc.height; docY += STEP) {
    const y = view.offsetY + docY * view.scale
    if (y < BAND || y > size.height) continue
    const major = docY % 500 === 0
    vTicks.push(
      <line key={`v${docY}`} x1={major ? 4 : 10} y1={y} x2={BAND} y2={y} stroke={MARIGOLD_RULER} strokeWidth={1} />
    )
    if (major)
      vTicks.push(
        <text key={`vt${docY}`} x={3} y={y - 2} fill={MARIGOLD} fontSize={7} transform={`rotate(-90 3 ${y - 2})`}>
          {docY}
        </text>
      )
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {/* Régua horizontal */}
      <svg width={size.width} height={BAND} className="absolute left-0 top-0" style={{ background: 'rgba(245,184,46,0.05)' }}>
        {hTicks}
      </svg>
      {/* Régua vertical */}
      <svg width={BAND} height={size.height} className="absolute left-0 top-0" style={{ background: 'rgba(245,184,46,0.05)' }}>
        {vTicks}
      </svg>
      {/* Canto */}
      <div className="absolute left-0 top-0 border-b border-r" style={{ width: BAND, height: BAND, background: 'rgba(245,184,46,0.08)', borderColor: 'rgba(245,184,46,0.25)' }} />
    </div>
  )
}
