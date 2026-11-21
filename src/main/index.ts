import { join } from 'node:path'
import { app, BrowserWindow, dialog } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initDatabase, closeDatabase } from './db/connection'
import { registerIpcHandlers } from './ipc/registerHandlers'
import { registerAssetScheme, handleAssetProtocol } from './fs/assetProtocol'
import { runDevSeed } from './services/devSeed'
import { createStartupSplash, type StartupSplash } from './splash'
import { preferencesService } from './services/preferencesService'
import { applyNativeTheme, windowBackground } from './theme'
import { openCreatorLink } from './creatorLinks'

// Deve ser registrado antes do app ficar pronto.
registerAssetScheme()

let startupSplash: StartupSplash | undefined
const iconPath = is.dev
  ? join(__dirname, '../../build/icon.png')
  : join(process.resourcesPath, 'icon.png')

function createWindow(splash?: StartupSplash): void {
  const theme = preferencesService.get().appearance.theme
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: windowBackground(theme),
    autoHideMenuBar: true,
    title: 'Noir Dump Studio',
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    if (splash) void splash.reveal(mainWindow)
    else mainWindow.show()
  })

  // Captura de tela para verificação de desenvolvimento (gated por env).
  if (process.env['NOIR_SHOT']) {
    mainWindow.once('show', () => {
      setTimeout(async () => {
        try {
          const image = await mainWindow.webContents.capturePage()
          const { writeFile } = await import('node:fs/promises')
          await writeFile(process.env['NOIR_SHOT']!, image.toPNG())
        } catch (e) {
          console.error('[shot] falhou:', e)
        } finally {
          app.quit()
        }
      }, 2500)
    })
  }

  mainWindow.webContents.setWindowOpenHandler(openCreatorLink)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const url = new URL(process.env['ELECTRON_RENDERER_URL'])
    url.searchParams.set('theme', theme)
    mainWindow.loadURL(url.toString())
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { query: { theme } })
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('me.dio.noirdumpstudio')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Read the saved theme before either window paints, including the one-time legacy migration.
  initDatabase()
  const theme = preferencesService.get().appearance.theme
  applyNativeTheme(theme)
  try {
    startupSplash = await createStartupSplash(iconPath, theme)
  } catch (error) {
    console.error('[splash] falha ao carregar:', error)
  }

  // Banco local (criado no primeiro boot) + handlers IPC antes da janela.
  handleAssetProtocol()
  registerIpcHandlers()
  await runDevSeed()

  createWindow(startupSplash)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}).catch((error: unknown) => {
  console.error('[startup] falha ao iniciar:', error)
  startupSplash?.close()
  dialog.showErrorBox('Noir Dump Studio', `Unable to start the studio.\n\n${error instanceof Error ? error.message : String(error)}`)
  app.exit(1)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  closeDatabase()
})
