import { ChevronDown } from 'lucide-react'

interface SelectProps<T extends string> {
  label?: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function Select<T extends string>({ label, value, options, onChange }: SelectProps<T>): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      {label && <span className="text-xs text-noir-muted">{label}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="appearance-none rounded-md border border-noir-border bg-noir-elevated py-1 pl-2.5 pr-7 text-xs text-noir-text outline-none hover:bg-noir-hover focus:border-noir-border-active/40"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-noir-elevated">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-noir-muted" />
      </div>
    </div>
  )
}
