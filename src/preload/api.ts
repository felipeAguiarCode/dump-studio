import { ipcRenderer, webUtils } from 'electron'
import type { IpcChannel, IpcContract } from '@shared/ipc/contract'

/**
 * API exposta ao renderer via contextBridge como `window.noir`.
 * `invoke` é genérico e deriva tipos do contrato — não enumera canais,
 * então adicionar um canal ao contrato o torna chamável sem mexer aqui.
 */
export const noirApi = {
  invoke<C extends IpcChannel>(
    channel: C,
    ...args: IpcContract[C]['args']
  ): Promise<IpcContract[C]['result']> {
    return ipcRenderer.invoke(channel, ...args) as Promise<IpcContract[C]['result']>
  },

  /** Resolve o caminho absoluto de um File arrastado (Electron 33+ usa webUtils). */
  getPathForFile(file: File): string {
    return webUtils.getPathForFile(file)
  },

  /** Eventos vindos do main (ex.: menu Arquivo > Importar). */
  on(channel: string, listener: (...args: unknown[]) => void): () => void {
    const wrapped = (_e: unknown, ...args: unknown[]): void => listener(...args)
    ipcRenderer.on(channel, wrapped as never)
    return () => ipcRenderer.off(channel, wrapped as never)
  }
}

export type NoirApi = typeof noirApi
