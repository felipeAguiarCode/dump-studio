import { useEffect, useState } from 'react'
import { useUiStore } from '../../stores/uiStore'

/** Indicador flutuante de graus durante a rotação — aparece e some suavemente. */
export function RotationBadge(): JSX.Element | null {
  const hint = useUiStore((s) => s.rotationHint)
  const [last, setLast] = useState(hint)

  useEffect(() => {
    if (hint) setLast(hint)
  }, [hint])

  if (!last) return null

  return (
    <div
      className="pointer-events-none absolute z-30 rounded-md border border-noir-border bg-noir-elevated px-2 py-1 text-2xs font-medium tabular-nums text-noir-text shadow-bubble transition-opacity duration-300"
      style={{
        left: last.x,
        top: last.y,
        transform: 'translate(-50%, calc(-100% - 16px))',
        opacity: hint ? 1 : 0
      }}
    >
      {last.degrees}°
    </div>
  )
}
