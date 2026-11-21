import { preferencesRepo } from '../repositories/preferences.repo'
import { createDefaultPreferences } from '@shared/defaults'
import { nowIso } from '../repositories/mappers'
import type { UserPreferences } from '@shared/types'

function mergePreferences(base: UserPreferences, patch: Partial<UserPreferences>): UserPreferences {
  return {
    appearance: { ...base.appearance, ...patch.appearance },
    projectDefaults: { ...base.projectDefaults, ...patch.projectDefaults },
    editingDefaults: { ...base.editingDefaults, ...patch.editingDefaults },
    exportDefaults: { ...base.exportDefaults, ...patch.exportDefaults },
    autosave: { ...base.autosave, ...patch.autosave, enabled: true },
    updatedAt: nowIso()
  }
}

export const preferencesService = {
  get(): UserPreferences {
    const raw = preferencesRepo.getRaw()
    const defaults = createDefaultPreferences(nowIso())
    if (!raw) {
      preferencesRepo.setRaw(JSON.stringify(defaults))
      return defaults
    }
    try {
      const parsed = JSON.parse(raw) as Partial<UserPreferences>
      // Mescla com defaults para preencher chaves novas adicionadas em versões futuras.
      const merged = mergePreferences(defaults, parsed)
      // Before selectable themes existed, noir_dark was an unconditional default, not a choice.
      if (parsed.appearance?.themeVersion !== 1 || !['instagram_light', 'noir_dark'].includes(merged.appearance.theme)) {
        merged.appearance.theme = 'instagram_light'
        merged.appearance.themeVersion = 1
        preferencesRepo.setRaw(JSON.stringify(merged))
      }
      return merged
    } catch {
      return defaults
    }
  },

  set(patch: Partial<UserPreferences>): UserPreferences {
    const current = this.get()
    const merged = mergePreferences(current, patch)
    preferencesRepo.setRaw(JSON.stringify(merged))
    return merged
  }
}
