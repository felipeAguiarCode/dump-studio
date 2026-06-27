import type { InstagramFormat } from '../constants'
import type { PhotoFilterName } from './domain'

/** Idiomas suportados pela interface. Inglês é o default global. */
export type AppLanguage = 'en' | 'pt'

export type RightTab = 'adjustments' | 'filters' | 'cameras' | 'shaders' | 'fx' | 'crop' | 'canvas' | 'layouts' | 'text'
export type GridType = 'off' | '3x3' | 'dense'
export type ThumbnailView = 'large' | 'compact' | 'grid'

export interface QuickMenuState {
  gridEnabled: boolean
  gridType: GridType
  rulersEnabled: boolean
  smartGuidesEnabled: boolean
  snapEnabled: boolean
  safeMarginsEnabled: boolean
}

export interface ProjectUiState {
  projectId: string
  activeDumpItemId?: string
  selectedLayerId?: string | null
  selectedLayerIds: string[]
  filmstripCollapsed: boolean
  filmstripThumbnailSize: number
  filmstripView: ThumbnailView
  activeRightTab: RightTab
  canvasZoom: number
  canvasPanX: number
  canvasPanY: number
  quickMenu: QuickMenuState
  leftSidebarCollapsed: boolean
  rightSidebarCollapsed: boolean
  updatedAt: string
}

export interface UserPreferences {
  appearance: {
    theme: 'noir_dark'
    /** Idioma da interface. Default 'en'. */
    language: AppLanguage
    density: 'compact' | 'comfortable'
    defaultFilmstripCollapsed: boolean
    defaultThumbnailSize: 'small' | 'medium' | 'large'
    showTooltips: boolean
    showGuidesByDefault: boolean
    showGridByDefault: boolean
    showRulersByDefault: boolean
    showSmartGuidesByDefault: boolean
    snapByDefault: boolean
    /** Espessura (px) das linhas de grid e margens seguras no canvas. */
    overlayLineThickness: number
    /** Aba de Ajustes em acordeão: abrir uma seção colapsa as outras. */
    accordionAdjustments: boolean
  }
  projectDefaults: {
    defaultFormat: InstagramFormat
    defaultProjectName: string
    createFirstDumpItemAutomatically: boolean
    confirmBeforeFormatChange: boolean
  }
  editingDefaults: {
    autoSelectImportedPhoto: boolean
    defaultFilterName: PhotoFilterName | null
    defaultFilterIntensity: number
    defaultGrain: number
    defaultVignette: number
  }
  exportDefaults: {
    format: 'jpg' | 'png'
    jpgQuality: number
    destinationPath?: string
    fileNamingPattern: string
    exportScope: 'current' | 'all'
  }
  autosave: {
    enabled: true
    showStatus: boolean
    createSnapshotBeforeExport: boolean
    createSnapshotBeforeFormatChange: boolean
  }
  updatedAt: string
}
