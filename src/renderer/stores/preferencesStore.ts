import { create } from 'zustand'
import type { UserPreferences } from '@shared/types'
import { ipc } from '../services/ipcClient'

interface PrefsState {
  prefs: UserPreferences | null
  load: () => Promise<void>
  patch: (partial: Partial<UserPreferences>) => Promise<void>
}

export const usePreferencesStore = create<PrefsState>((set, get) => ({
  prefs: null,

  load: async () => {
    const prefs = await ipc('preferences:get')
    set({ prefs })
  },

  patch: async (partial) => {
    const current = get().prefs
    if (current) {
      // Atualização otimista (merge raso por grupo já feito pelo chamador).
      set({ prefs: { ...current, ...partial } as UserPreferences })
    }
    const saved = await ipc('preferences:set', partial)
    set({ prefs: saved })
  }
}))
