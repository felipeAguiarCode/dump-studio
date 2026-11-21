import type { AppTheme } from '@shared/types'

export const THEME_CACHE_KEY = 'noir-ui-theme-v1'

export function applyTheme(theme: AppTheme): void {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme === 'noir_dark' ? 'dark' : 'light'
  try { localStorage.setItem(THEME_CACHE_KEY, theme) } catch { /* SQLite remains authoritative. */ }
}
