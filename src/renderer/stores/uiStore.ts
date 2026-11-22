import { create } from 'zustand'
import type { DumpItem } from '@shared/types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
export type CanvasTool =
  | 'select'
  | 'pan'
  | 'crop'
  | 'transform'
  | 'mask'
  | 'text'
  | 'shape'
  | 'zoom'
export type DialogKind = 'export' | 'preferences' | 'snapshots' | 'newProject' | 'preview' | 'about' | null

export interface Toast {
  id: number
  kind: 'info' | 'success' | 'error'
  message: string
}

export interface ConfirmRequest {
  title?: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
}

export type AppView = 'home' | 'editor'

interface PresetHoverPreview {
  page: DumpItem
  imageId: string
  name: string
  src: string
}

interface UiState {
  view: AppView
  tool: CanvasTool
  saveStatus: SaveStatus
  formatChanging: boolean
  applyingPreset: boolean
  presetSaveRequested: boolean
  presetHoverPreview: PresetHoverPreview | null
  lastSavedAt: string | null
  toasts: Toast[]
  activeDialog: DialogKind
  /** Indicador flutuante de graus durante a rotação no canvas. */
  rotationHint: { degrees: number; x: number; y: number } | null
  confirm: ConfirmRequest | null

  setView: (view: AppView) => void
  setFormatChanging: (changing: boolean) => void
  setApplyingPreset: (applying: boolean) => void
  setPresetSaveRequested: (requested: boolean) => void
  setPresetHoverPreview: (preview: PresetHoverPreview | null) => void
  setTool: (tool: CanvasTool) => void
  setRotationHint: (hint: UiState['rotationHint']) => void
  requestConfirm: (req: ConfirmRequest) => void
  closeConfirm: () => void
  setSaveStatus: (status: SaveStatus, savedAt?: string) => void
  pushToast: (kind: Toast['kind'], message: string) => void
  dismissToast: (id: number) => void
  openDialog: (dialog: Exclude<DialogKind, null>) => void
  closeDialog: () => void
}

let toastSeq = 1

export const useUiStore = create<UiState>((set) => ({
  view: 'home',
  tool: 'select',
  saveStatus: 'idle',
  formatChanging: false,
  applyingPreset: false,
  presetSaveRequested: false,
  presetHoverPreview: null,
  lastSavedAt: null,
  toasts: [],
  activeDialog: null,
  rotationHint: null,
  confirm: null,

  setView: (view) => set({ view }),
  setFormatChanging: (formatChanging) => set({ formatChanging }),
  setApplyingPreset: (applyingPreset) => set({ applyingPreset }),
  setPresetSaveRequested: (presetSaveRequested) => set({ presetSaveRequested }),
  setPresetHoverPreview: (presetHoverPreview) => set({ presetHoverPreview }),
  setTool: (tool) => set({ tool }),
  setRotationHint: (rotationHint) => set({ rotationHint }),
  requestConfirm: (confirm) => set({ confirm }),
  closeConfirm: () => set({ confirm: null }),

  setSaveStatus: (saveStatus, savedAt) =>
    set((s) => ({ saveStatus, lastSavedAt: savedAt ?? s.lastSavedAt })),

  pushToast: (kind, message) => {
    const id = toastSeq++
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, kind === 'error' ? 6000 : 3200)
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  openDialog: (activeDialog) => set({ activeDialog }),
  closeDialog: () => set({ activeDialog: null })
}))
