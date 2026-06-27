import { contextBridge } from 'electron'
import { noirApi } from './api'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('noir', noirApi)
  } catch (error) {
    console.error('[preload] falha ao expor API noir:', error)
  }
} else {
  // Fallback (contextIsolation desabilitado) — não usado em produção.
  // @ts-expect-error window estendido em tempo de execução
  window.noir = noirApi
}
