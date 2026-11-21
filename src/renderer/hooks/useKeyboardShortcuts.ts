import { useEffect } from 'react'
import { useEditorStore, selectActiveIndex } from '../stores/editorStore'
import { useUiStore } from '../stores/uiStore'
import { projectActions } from '../services/projectActions'
import { autosaveClient } from '../services/autosaveClient'
import { t } from '../i18n'
import { presetActions } from '../services/presetActions'

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

/** Atalhos globais do editor (§18). Montado no AppShell. */
export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const editor = useEditorStore.getState()
      const ui = useUiStore.getState()
      if (ui.formatChanging || ui.applyingPreset) { e.preventDefault(); return }
      const mod = e.ctrlKey || e.metaKey
      const typing = isTyping(e.target)

      // Esc funciona mesmo em alguns contextos
      if (e.key === 'Escape') {
        if (ui.activeDialog) ui.closeDialog()
        else editor.clearSelection()
        return
      }
      if (typing) return
      if (ui.activeDialog || ui.confirm) return

      if (mod && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        void presetActions.copyCurrent()
        return
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        void presetActions.paste()
        return
      }

      // Navegação entre fotos (desativada quando há diálogo/overlay aberto — ex.: Prévia controla as setas)
      if (!mod && !ui.activeDialog && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const idx = selectActiveIndex(editor)
        const total = editor.project?.dumpItems.length ?? 0
        if (e.key === 'ArrowRight' && idx < total - 1) editor.goToDumpItemIndex(idx + 1)
        if (e.key === 'ArrowLeft' && idx > 0) editor.goToDumpItemIndex(idx - 1)
        return
      }

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) editor.redo()
        else editor.undo()
        return
      }
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void autosaveClient.flush()
        ui.pushToast('success', t('shortcuts.saved'))
        return
      }
      if (mod && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        if (editor.project) ui.openDialog('export')
        return
      }
      if (mod && (e.key.toLowerCase() === 'o' || e.key.toLowerCase() === 'n')) {
        e.preventDefault()
        projectActions.closeProject()
        return
      }
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        editor.ui?.selectedLayerIds.forEach((id) => void projectActions.duplicateLayer(id))
        return
      }
      if (mod && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        projectActions.copySelection()
        return
      }
      if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        void projectActions.pasteClipboard()
        return
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && editor.ui?.selectedLayerIds.length) {
        e.preventDefault()
        const layers = editor.project?.dumpItems.flatMap((d) => d.layers) ?? []
        editor.ui.selectedLayerIds.forEach((id) => {
          const l = layers.find((x) => x.id === id)
          if (l && l.type !== 'background' && !l.locked) void projectActions.deleteLayer(id)
        })
        return
      }

      // Zoom
      const zoom = editor.ui?.canvasZoom ?? 1
      if (e.key === '+' || e.key === '=') editor.setZoom(Math.min(8, zoom * 1.2))
      else if (e.key === '-' || e.key === '_') editor.setZoom(Math.max(0.1, zoom / 1.2))
      else if (e.key === '0') editor.resetView()
      else if (e.key === '1') editor.setZoom(1)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
