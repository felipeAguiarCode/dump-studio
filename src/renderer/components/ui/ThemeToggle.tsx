import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { useT } from '../../i18n'

export function ThemeToggle(): JSX.Element {
  const prefs = usePreferencesStore((state) => state.prefs)
  const patch = usePreferencesStore((state) => state.patch)
  const [pending, setPending] = useState(false)
  const t = useT()
  const dark = prefs?.appearance.theme === 'noir_dark'
  const label = t(dark ? 'preferences.switchToLight' : 'preferences.switchToDark')
  return <button
    type="button" title={label} aria-label={label} disabled={!prefs || pending}
    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-noir-border bg-noir-elevated text-noir-muted transition-colors hover:bg-noir-hover hover:text-brand-accent disabled:opacity-40"
    onClick={async () => {
      if (!prefs || pending) return
      setPending(true)
      try { await patch({ appearance: { ...prefs.appearance, theme: dark ? 'instagram_light' : 'noir_dark', themeVersion: 1 } }) }
      finally { setPending(false) }
    }}
  >{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
}
