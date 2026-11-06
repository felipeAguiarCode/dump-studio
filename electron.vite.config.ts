import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const shared = resolve('src/shared')
const renderer = resolve('src/renderer')

// Licença: data de expiração "assada" no build (data do build + 60 dias).
// Override para testes: NOIR_LICENSE_EXPIRY_MS=<ms> (ex.: `1` => já expirada).
const LICENSE_DURATION_DAYS = 60
const licenseExpiryMs =
  process.env.NOIR_LICENSE_EXPIRY_MS != null && process.env.NOIR_LICENSE_EXPIRY_MS !== ''
    ? Number(process.env.NOIR_LICENSE_EXPIRY_MS)
    : Date.now() + LICENSE_DURATION_DAYS * 24 * 60 * 60 * 1000
const licenseDefine = { __LICENSE_EXPIRY_MS__: JSON.stringify(licenseExpiryMs) }

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    define: licenseDefine,
    resolve: {
      alias: { '@shared': shared }
    },
    build: {
      rollupOptions: {
        input: { index: resolve('src/main/index.ts') }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: { '@shared': shared }
    },
    build: {
      rollupOptions: {
        input: { index: resolve('src/preload/index.ts') }
      }
    }
  },
  renderer: {
    root: renderer,
    define: licenseDefine,
    resolve: {
      alias: { '@shared': shared, '@renderer': renderer }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: { index: resolve('src/renderer/index.html') }
      }
    }
  }
})
