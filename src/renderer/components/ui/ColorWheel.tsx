import { useRef } from 'react'
import { cn } from '../../lib/cn'

interface ColorWheelProps {
  /** Matiz em graus 0..360. */
  hue: number
  /** Saturação 0..100 (distância do centro). */
  saturation: number
  size?: number
  onChange: (hue: number, saturation: number) => void
  /** Disparado no início do gesto (para capturar histórico). */
  onChangeStart?: () => void
}

/**
 * Roda de cor estilo Lightroom: arraste o ponto — ângulo = matiz, distância do centro = saturação.
 * Convenção: 0° (vermelho) no topo, sentido horário (igual ao conic-gradient do fundo).
 */
export function ColorWheel({ hue, saturation, size = 132, onChange, onChangeStart }: ColorWheelProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const r = size / 2

  const update = (clientX: number, clientY: number): void => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    const dist = Math.sqrt(dx * dx + dy * dy)
    const sat = Math.max(0, Math.min(100, (dist / r) * 100))
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI // 0 = topo, horário
    onChange(Math.round((deg + 360) % 360), Math.round(sat))
  }

  const onDown = (e: React.PointerEvent): void => {
    e.preventDefault()
    onChangeStart?.()
    e.currentTarget.setPointerCapture(e.pointerId)
    update(e.clientX, e.clientY)
  }
  const onMove = (e: React.PointerEvent): void => {
    if (e.buttons !== 1) return
    update(e.clientX, e.clientY)
  }

  const sr = (Math.max(0, Math.min(100, saturation)) / 100) * r
  const rad = (hue * Math.PI) / 180
  const tx = r + Math.sin(rad) * sr
  const ty = r - Math.cos(rad) * sr
  const active = saturation > 0.5

  return (
    <div
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      className="relative cursor-crosshair touch-none select-none rounded-full border border-noir-border"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 50% 50%, #7a7a7a 0%, rgba(122,122,122,0) 72%), conic-gradient(from 0deg, #ff0000, #ffff00 60deg, #00ff00 120deg, #00ffff 180deg, #0000ff 240deg, #ff00ff 300deg, #ff0000 360deg)'
      }}
    >
      <div
        className={cn(
          'pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow',
          active ? 'border-white' : 'border-white/70'
        )}
        style={{ left: tx, top: ty, background: active ? `hsl(${hue}, 100%, 50%)` : '#7a7a7a' }}
      />
    </div>
  )
}
