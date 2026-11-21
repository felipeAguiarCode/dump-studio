import { cn } from '../../lib/cn'

export function Toggle({
  checked,
  onChange,
  label
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}): JSX.Element {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
      {label && <span className="text-xs text-noir-text">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'brand-primary' : 'bg-noir-border'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'left-0.5 translate-x-4' : 'left-0.5'
          )}
        />
      </button>
    </label>
  )
}
