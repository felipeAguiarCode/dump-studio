import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { app, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import { APP_NAME } from '@shared/constants'
import type { AppTheme } from '@shared/types'
import { windowBackground } from './theme'
import { openCreatorLink } from './creatorLinks'

export interface StartupSplash {
  reveal(mainWindow: BrowserWindow): Promise<void>
  close(): void
}

export async function createStartupSplash(icon: string, theme: AppTheme): Promise<StartupSplash> {
  const window = new BrowserWindow({
    width: 900,
    height: 510,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    show: false,
    skipTaskbar: true,
    backgroundColor: windowBackground(theme),
    title: APP_NAME,
    icon,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  window.webContents.setWindowOpenHandler(openCreatorLink)

  let shownAt = Date.now()
  const ready = new Promise<void>((resolve) => {
    window.once('ready-to-show', () => {
      resolve()
    })
    window.once('closed', resolve)
  })

  const close = (): void => {
    if (!window.isDestroyed()) window.destroy()
  }

  try {
    const query = { version: app.getVersion(), lang: app.getLocale(), theme }
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      const url = new URL('splash.html', process.env['ELECTRON_RENDERER_URL'])
      for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value)
      await window.loadURL(url.toString())
    } else {
      await window.loadFile(join(__dirname, '../renderer/splash.html'), { query })
    }
    await ready
    if (!window.isDestroyed()) {
      window.show()
      shownAt = Date.now()
    }

    // The smoke check captures the real splash, then continues into the main application.
    if (process.env['NOIR_SPLASH_SHOT'] && !window.isDestroyed()) {
      const image = await window.webContents.capturePage()
      await writeFile(process.env['NOIR_SPLASH_SHOT'], image.toPNG())
    }
  } catch (error) {
    close()
    throw error
  }

  return {
    close,
    async reveal(mainWindow): Promise<void> {
      // Keep the artwork visible for the requested five seconds; slow starts add no extra delay.
      const remaining = Math.max(0, 5000 - (Date.now() - shownAt))
      if (remaining) await new Promise((resolve) => setTimeout(resolve, remaining))
      if (!mainWindow.isDestroyed()) mainWindow.show()
      if (process.env['NOIR_SPLASH_SHOT']) console.log(`[startup-test] splash-visible-ms=${Date.now() - shownAt}`)
      close()
    }
  }
}
