import { join } from 'node:path'
import { app, shell, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initDatabase, closeDatabase } from './db/connection'
import { registerIpcHandlers } from './ipc/registerHandlers'
import { registerAssetScheme, handleAssetProtocol } from './fs/assetProtocol'
import { runDevSeed } from './services/devSeed'

// Deve ser registrado antes do app ficar pronto.
registerAssetScheme()

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: '#080808',
    autoHideMenuBar: true,
    title: 'Noir Dump Studio',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Captura de tela para verificação de desenvolvimento (gated por env).
  if (process.env['NOIR_SHOT']) {
    mainWindow.webContents.once('did-finish-load', () => {
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

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('me.dio.noirdumpstudio')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Banco local (criado no primeiro boot) + handlers IPC antes da janela.
  initDatabase()
  handleAssetProtocol()
  registerIpcHandlers()
  await runDevSeed()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  closeDatabase()
})
