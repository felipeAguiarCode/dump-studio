import { create } from 'zustand'
import type { Project } from '@shared/types'

const CAPACITY = 80

interface HistoryState {
  past: Project[]
  future: Project[]
  /** Empurra o estado atual para o histórico (chamado ANTES de uma mutação). */
  capture: (current: Project) => void
  undo: (current: Project) => Project | null
  redo: (current: Project) => Project | null
  reset: () => void
}

const clone = (p: Project): Project =>
  typeof structuredClone === 'function' ? structuredClone(p) : (JSON.parse(JSON.stringify(p)) as Project)

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  capture: (current) =>
    set((s) => ({
      past: [...s.past, clone(current)].slice(-CAPACITY),
      future: []
    })),

  undo: (current) => {
    const { past, future } = get()
    if (past.length === 0) return null
    const prev = past[past.length - 1]
    set({ past: past.slice(0, -1), future: [clone(current), ...future].slice(0, CAPACITY) })
    return prev
  },

  redo: (current) => {
    const { past, future } = get()
    if (future.length === 0) return null
    const next = future[0]
    set({ past: [...past, clone(current)].slice(-CAPACITY), future: future.slice(1) })
    return next
  },

  reset: () => set({ past: [], future: [] })
}))
