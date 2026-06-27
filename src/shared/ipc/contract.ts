import type { InstagramFormat } from '../constants'
import type {
  Project,
  ProjectSummary,
  CanvasSettings,
  Layer,
  LayerType,
  PhotoAdjustments,
  PhotoFilter,
  CropSettings,
  DumpItem
} from '../types/domain'
import type { UserPreferences, ProjectUiState } from '../types/preferences'
import type { ProjectSnapshot, ProjectExportSettings } from '../types/snapshots'
import type { OriginalAsset } from '../types/assets'

export interface CreateProjectInput {
  name?: string
  format?: InstagramFormat
}

export interface ExportRequest {
  projectId: string
  scope: 'current' | 'all'
  currentDumpItemId?: string
  format: 'jpg' | 'png'
  jpgQuality: number
  destinationPath: string
  fileNamingPattern: string
  /** PNGs/JPEGs já renderizados pelo renderer (dataURL), na ordem do filmstrip. */
  images: { index: number; dataUrl: string }[]
}

export interface ExportResult {
  ok: boolean
  writtenFiles: string[]
  error?: string
}

/** Patch de autosave — discriminado por alvo; nunca grava filtro/ajuste globalmente no canvas. */
export type AutosavePatch =
  | { kind: 'project'; id: string; data: Partial<Pick<Project, 'name' | 'format' | 'defaultExportFormat' | 'defaultExportQuality'>> }
  | { kind: 'dumpItem'; id: string; data: Partial<Pick<DumpItem, 'title' | 'previewPath'>> }
  | { kind: 'canvas'; dumpItemId: string; data: Partial<CanvasSettings> }
  | { kind: 'layer'; id: string; data: Partial<Pick<Layer, 'name' | 'visible' | 'locked' | 'opacity' | 'orderIndex' | 'transform' | 'data' | 'groupId'>> }
  | { kind: 'adjustments'; layerId: string; data: Partial<PhotoAdjustments> }
  | { kind: 'filter'; layerId: string; data: Partial<PhotoFilter> }
  | { kind: 'crop'; layerId: string; data: Partial<CropSettings> }
  | { kind: 'uiState'; projectId: string; data: Partial<ProjectUiState> }
  | { kind: 'exportSettings'; projectId: string; data: Partial<ProjectExportSettings> }
  | { kind: 'reorderDumpItems'; projectId: string; orderedIds: string[] }
  | { kind: 'reorderLayers'; dumpItemId: string; orderedIds: string[] }

export interface AddLayerInput {
  dumpItemId: string
  type: LayerType
  name?: string
  assetId?: string
  data?: Record<string, unknown>
  transform?: Partial<Layer['transform']>
  /** Posição (coords do documento) onde centralizar uma camada de imagem solta no canvas. */
  position?: { x: number; y: number }
}

/**
 * Contrato IPC — fonte única da verdade compartilhada entre main e renderer.
 * Cada canal define [args] e result; o helper `handle`/`invoke` força os tipos nos dois lados.
 */
export interface IpcContract {
  'app:ping': { args: []; result: string }
  'app:bootInfo': { args: []; result: { autoOpenProjectId: string | null; exportDir: string | null; openDialog: string | null } }

  // Preferências
  'preferences:get': { args: []; result: UserPreferences }
  'preferences:set': { args: [Partial<UserPreferences>]; result: UserPreferences }

  // Projetos
  'projects:list': { args: [{ includeArchived?: boolean }?]; result: ProjectSummary[] }
  'projects:create': { args: [CreateProjectInput]; result: Project }
  'projects:open': { args: [{ id: string }]; result: Project }
  'projects:duplicate': { args: [{ id: string }]; result: Project }
  'projects:rename': { args: [{ id: string; name: string }]; result: void }
  'projects:setFormat': { args: [{ id: string; format: InstagramFormat }]; result: Project }
  'projects:archive': { args: [{ id: string; archived: boolean }]; result: void }
  'projects:delete': { args: [{ id: string }]; result: void }
  /** Substitui toda a árvore do projeto numa transação (usado por undo/redo e restore de snapshot). */
  'projects:replaceTree': { args: [{ project: Project }]; result: void }

  // Estado de UI do projeto
  'uiState:get': { args: [{ projectId: string }]; result: ProjectUiState }
  'uiState:save': { args: [ProjectUiState]; result: void }

  // Dump items (páginas/fotos)
  'dumpItems:add': { args: [{ projectId: string; afterId?: string }]; result: DumpItem }
  'dumpItems:duplicate': { args: [{ id: string }]; result: DumpItem }
  'dumpItems:delete': { args: [{ id: string }]; result: void }

  // Camadas
  'layers:add': { args: [AddLayerInput]; result: Layer }
  'layers:duplicate': { args: [{ id: string }]; result: Layer }
  'layers:delete': { args: [{ id: string }]; result: void }
  /** Cola cópias das camadas na página alvo (novos ids, deslocadas). */
  'layers:paste': { args: [{ dumpItemId: string; layers: Layer[] }]; result: Layer[] }

  // Assets / importação
  'assets:pickFiles': { args: []; result: string[] }
  /** Importa fotos para o POOL do projeto (sem criar páginas/camadas). */
  'assets:importToPool': {
    args: [{ projectId: string; paths: string[] }]
    result: { assets: OriginalAsset[]; imported: number; deduped: number }
  }
  'assets:dataUrl': { args: [{ path: string }]; result: string }

  // Autosave
  'autosave:patch': { args: [AutosavePatch[]]; result: { savedAt: string } }

  // Snapshots / estados salvos
  'snapshots:list': { args: [{ projectId: string }]; result: ProjectSnapshot[] }
  'snapshots:create': { args: [{ projectId: string; name: string; thumbnailDataUrl?: string }]; result: ProjectSnapshot }
  'snapshots:restore': { args: [{ snapshotId: string }]; result: Project }
  'snapshots:rename': { args: [{ snapshotId: string; name: string }]; result: void }
  'snapshots:delete': { args: [{ snapshotId: string }]; result: void }

  // Exportação
  'export:pickFolder': { args: []; result: string | null }
  'export:run': { args: [ExportRequest]; result: ExportResult }
}

export type IpcChannel = keyof IpcContract
export type IpcArgs<C extends IpcChannel> = IpcContract[C]['args']
export type IpcResult<C extends IpcChannel> = IpcContract[C]['result']
