import { ipcMain } from 'electron'
import type { IpcChannel, IpcContract } from '@shared/ipc/contract'
import { preferencesService } from '../services/preferencesService'
import { projectService } from '../services/projectService'
import { uiStateService } from '../services/uiStateService'
import { editService } from '../services/editService'
import { assetService } from '../services/assetService'
import { autosaveService } from '../services/autosaveService'
import { exportService } from '../services/exportService'
import { snapshotService } from '../services/snapshotService'
import { getAutoOpenProjectId } from '../services/devSeed'

/** Helper que força os tipos de args/result do contrato nos dois lados. */
function handle<C extends IpcChannel>(
  channel: C,
  fn: (
    ...args: IpcContract[C]['args']
  ) => IpcContract[C]['result'] | Promise<IpcContract[C]['result']>
): void {
  ipcMain.handle(channel, (_event, ...args) => fn(...(args as IpcContract[C]['args'])))
}

export function registerIpcHandlers(): void {
  handle('app:ping', () => 'pong')
  handle('app:bootInfo', () => ({
    autoOpenProjectId: getAutoOpenProjectId(),
    exportDir: process.env['NOIR_EXPORT'] ?? null,
    openDialog: process.env['NOIR_DIALOG'] ?? null
  }))

  // Preferências
  handle('preferences:get', () => preferencesService.get())
  handle('preferences:set', (patch) => preferencesService.set(patch))

  // Projetos
  handle('projects:list', (input) => projectService.list(input?.includeArchived))
  handle('projects:create', (input) => projectService.create(input))
  handle('projects:open', ({ id }) => projectService.open(id))
  handle('projects:duplicate', ({ id }) => projectService.duplicate(id))
  handle('projects:rename', ({ id, name }) => projectService.rename(id, name))
  handle('projects:setFormat', ({ id, format }) => projectService.setFormat(id, format))
  handle('projects:archive', ({ id, archived }) => projectService.archive(id, archived))
  handle('projects:delete', ({ id }) => projectService.delete(id))
  handle('projects:replaceTree', ({ project }) => projectService.replaceTree(project))

  // Estado de UI do projeto
  handle('uiState:get', ({ projectId }) => uiStateService.get(projectId))
  handle('uiState:save', (state) => uiStateService.save(state))

  // Dump items
  handle('dumpItems:add', ({ projectId, afterId }) => editService.addDumpItem(projectId, afterId))
  handle('dumpItems:duplicate', ({ id }) => editService.duplicateDumpItem(id))
  handle('dumpItems:delete', ({ id }) => editService.deleteDumpItem(id))

  // Camadas
  handle('layers:add', (input) => editService.addLayer(input))
  handle('layers:duplicate', ({ id }) => editService.duplicateLayer(id))
  handle('layers:delete', ({ id }) => editService.deleteLayer(id))
  handle('layers:paste', ({ dumpItemId, layers }) => editService.pasteLayers(dumpItemId, layers))

  // Assets / importação
  handle('assets:pickFiles', () => assetService.pickFiles())
  handle('assets:importToPool', (input) => assetService.importToPool(input))
  handle('assets:dataUrl', (input) => assetService.dataUrl(input))

  // Autosave
  handle('autosave:patch', (patches) => autosaveService.apply(patches))

  // Exportação
  handle('export:pickFolder', () => exportService.pickFolder())
  handle('export:run', (req) => exportService.run(req))

  // Snapshots / estados salvos
  handle('snapshots:list', ({ projectId }) => snapshotService.list(projectId))
  handle('snapshots:create', (input) => snapshotService.create(input))
  handle('snapshots:restore', ({ snapshotId }) => snapshotService.restore(snapshotId))
  handle('snapshots:rename', ({ snapshotId, name }) => snapshotService.rename(snapshotId, name))
  handle('snapshots:delete', ({ snapshotId }) => snapshotService.delete(snapshotId))
}
