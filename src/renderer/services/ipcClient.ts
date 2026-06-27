import type { IpcChannel, IpcContract } from '@shared/ipc/contract'

/**
 * Wrapper único sobre window.noir.invoke. Centraliza tratamento de erro
 * para que componentes nunca falem com o IPC cru.
 */
export async function ipc<C extends IpcChannel>(
  channel: C,
  ...args: IpcContract[C]['args']
): Promise<IpcContract[C]['result']> {
  try {
    return await window.noir.invoke(channel, ...args)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[ipc] ${channel} falhou:`, message)
    throw new Error(message.replace(/^Error invoking remote method '[^']+':\s*/, ''))
  }
}
