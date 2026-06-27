import { Group, Line, Rect } from 'react-konva'
import type { GridType } from '@shared/types'
import { INSTAGRAM_GRID, MARIGOLD_SAFE } from '../../lib/colors'

interface Props {
  docWidth: number
  docHeight: number
  scale: number
  gridEnabled: boolean
  gridType: GridType
  safeMargins: boolean
  guides: { v: number[]; h: number[] }
  lineThickness: number
}

const GRID_COLOR = INSTAGRAM_GRID
const SAFE_COLOR = MARIGOLD_SAFE
const GUIDE_COLOR = '#7Cc5ff'

/** Overlays de apoio (grid, margens, guias) — desenhados na live view, nunca exportados. */
export function CanvasOverlay({ docWidth, docHeight, scale, gridEnabled, gridType, safeMargins, guides, lineThickness }: Props): JSX.Element {
  const sw = lineThickness / scale
  const guideSw = 1.4 / scale
  const divisions = gridType === 'dense' ? 6 : 3
  const lines: JSX.Element[] = []

  if (gridEnabled) {
    for (let i = 1; i < divisions; i++) {
      const x = (docWidth / divisions) * i
      const y = (docHeight / divisions) * i
      lines.push(<Line key={`gv${i}`} points={[x, 0, x, docHeight]} stroke={GRID_COLOR} strokeWidth={sw} listening={false} />)
      lines.push(<Line key={`gh${i}`} points={[0, y, docWidth, y]} stroke={GRID_COLOR} strokeWidth={sw} listening={false} />)
    }
  }

  return (
    <Group listening={false}>
      {lines}
      {safeMargins && (
        <Rect
          x={docWidth * 0.05}
          y={docHeight * 0.05}
          width={docWidth * 0.9}
          height={docHeight * 0.9}
          stroke={SAFE_COLOR}
          strokeWidth={sw}
          dash={[8 / scale, 6 / scale]}
          listening={false}
        />
      )}
      {guides.v.map((x, i) => (
        <Line key={`sv${i}`} points={[x, 0, x, docHeight]} stroke={GUIDE_COLOR} strokeWidth={guideSw} listening={false} />
      ))}
      {guides.h.map((y, i) => (
        <Line key={`sh${i}`} points={[0, y, docWidth, y]} stroke={GUIDE_COLOR} strokeWidth={guideSw} listening={false} />
      ))}
    </Group>
  )
}
