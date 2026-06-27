import { uiStateRepo } from '../repositories/uiState.repo'
import { preferencesService } from './preferencesService'
import { createDefaultUiState } from '@shared/defaults'
import { nowIso } from '../repositories/mappers'
import type { ProjectUiState } from '@shared/types'

export const uiStateService = {
  get(projectId: string): ProjectUiState {
    const existing = uiStateRepo.get(projectId)
    if (existing) return existing
    // Deriva defaults a partir das preferências de aparência do usuário.
    const prefs = preferencesService.get()
    const state = createDefaultUiState(projectId, nowIso())
    state.filmstripCollapsed = prefs.appearance.defaultFilmstripCollapsed
    state.quickMenu.gridEnabled = prefs.appearance.showGridByDefault
    state.quickMenu.rulersEnabled = prefs.appearance.showRulersByDefault
    state.quickMenu.smartGuidesEnabled = prefs.appearance.showSmartGuidesByDefault
    state.quickMenu.snapEnabled = prefs.appearance.snapByDefault
    uiStateRepo.upsert(state)
    return state
  },

  save(state: ProjectUiState): void {
    uiStateRepo.upsert({ ...state, updatedAt: nowIso() })
  }
}
