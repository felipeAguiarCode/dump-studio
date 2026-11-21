import { create } from 'zustand'
import type { UserPreferences } from '@shared/types'
import { ipc } from '../services/ipcClient'
import { applyTheme } from '../styles/theme'

interface PrefsState {
  prefs: UserPreferences | null
  load: () => Promise<void>
  patch: (partial: Partial<UserPreferences>) => Promise<void>
}

export const usePreferencesStore = create<PrefsState>((set, get) => ({
  prefs: null,

  load: async () => {
    const prefs = await ipc('preferences:get')
    applyTheme(prefs.appearance.theme)
    set({ prefs })
  },

  patch: async (partial) => {
    const current = get().prefs
    if (current) {
      // Atualização otimista (merge raso por grupo já feito pelo chamador).
      set({ prefs: { ...current, ...partial } as UserPreferences })
      applyTheme(partial.appearance?.theme ?? current.appearance.theme)
    }
    try {
      const saved = await ipc('preferences:set', partial)
      applyTheme(saved.appearance.theme)
      set({ prefs: saved })
    } catch (error) {
      if (current) { applyTheme(current.appearance.theme); set({ prefs: current }) }
      console.error('[preferences] could not save:', error)
    }
  }
}))
