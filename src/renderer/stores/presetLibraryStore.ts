import { create } from 'zustand'
import type { PresetLibrary } from '@shared/types'
import { ipc } from '../services/ipcClient'

interface PresetLibraryState extends PresetLibrary {
  folderId: string | null
  activeId: string | null
  loading: boolean
  error: boolean
  load: () => Promise<void>
  setFolder: (id: string | null) => void
  setActive: (id: string | null) => void
}

export const usePresetLibraryStore = create<PresetLibraryState>((set) => ({
  folders: [], presets: [], folderId: null, activeId: null, loading: false, error: false,
  load: async () => {
    set({ loading: true, error: false })
    try {
      const library = await ipc('presets:list')
      set((state) => ({ ...library, loading: false,
        folderId: library.folders.some((f) => f.id === state.folderId) ? state.folderId : null,
        activeId: library.presets.some((p) => p.id === state.activeId) ? state.activeId : null
      }))
    } catch (error) { set({ loading: false, error: true }); throw error }
  },
  setFolder: (folderId) => set({ folderId }),
  setActive: (activeId) => set({ activeId })
}))
