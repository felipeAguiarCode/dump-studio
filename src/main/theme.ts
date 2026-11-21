import { BrowserWindow, nativeTheme } from 'electron'
import type { AppTheme } from '@shared/types'

export const windowBackground = (theme: AppTheme): string => theme === 'noir_dark' ? '#151616' : '#fafafa'

export function applyNativeTheme(theme: AppTheme): void {
  nativeTheme.themeSource = theme === 'noir_dark' ? 'dark' : 'light'
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) window.setBackgroundColor(windowBackground(theme))
  }
}
