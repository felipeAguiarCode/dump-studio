import { RotateCcw } from 'lucide-react'
import { cn } from '../../lib/cn'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  defaultValue?: number
  disabled?: boolean
  /** Gradiente opcional no trilho (ex.: temperatura/matiz). */
  trackGradient?: string
  onChange: (value: number) => void
  /** Chamado no início do gesto (para capturar histórico antes de arrastar). */
  onChangeStart?: () => void
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  defaultValue = 0,
  disabled = false,
  trackGradient,
  onChange,
  onChangeStart
}: SliderProps): JSX.Element {
  const changed = Math.abs(value - defaultValue) > 0.0001

  return (
    <div className={cn('group/slider py-1.5', disabled && 'opacity-40')}>
      <div className="mb-1 flex items-center justify-between">
        <button
          onDoubleClick={() => !disabled && onChange(defaultValue)}
          className="text-xs text-noir-muted transition-colors hover:text-noir-text"
          title="Duplo clique para redefinir"
          disabled={disabled}
        >
          {label}
        </button>
        <div className="flex items-center gap-1.5">
          <span className={cn('text-2xs tabular-nums', changed ? 'text-noir-text' : 'text-noir-disabled')}>
            {value > 0 && defaultValue === 0 ? '+' : ''}
            {Number.isInteger(step) ? Math.round(value) : value.toFixed(2)}
          </span>
          {changed && !disabled && (
            <button
              onClick={() => onChange(defaultValue)}
              className="text-noir-disabled opacity-0 transition-opacity hover:text-noir-text group-hover/slider:opacity-100"
              aria-label="Redefinir"
            >
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        className="noir-range"
        style={trackGradient ? { background: trackGradient } : undefined}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        title="Duplo clique para redefinir"
        onPointerDown={() => onChangeStart?.()}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onDoubleClick={() => !disabled && onChange(defaultValue)}
      />
    </div>
  )
}
