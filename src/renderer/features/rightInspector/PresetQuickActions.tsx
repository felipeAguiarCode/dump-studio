import { useEffect, useRef, useState } from 'react'
import { Bookmark, ChevronRight, Download, Plus, Upload } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useT } from '../../i18n'
import { presetActions, presetTarget } from '../../services/presetActions'
import { useEditorStore } from '../../stores/editorStore'
import { usePresetLibraryStore } from '../../stores/presetLibraryStore'
import { useUiStore } from '../../stores/uiStore'

/** Preset actions stay visible while editing filters, cameras, textures and adjustments. */
export function PresetQuickActions(): JSX.Element {
  const t = useT()
  useEditorStore((state) => state.ui?.selectedLayerId)
  useEditorStore((state) => state.project)
  const library = usePresetLibraryStore()
  const applying = useUiStore((state) => state.applyingPreset || state.formatChanging)
  const [working, setWorking] = useState(false)
  const pending = useRef(false)
  const busy = applying || working
  const target = presetTarget()
  useEffect(() => { void library.load().catch(console.error) }, [])

  async function run(action: () => Promise<void>, importing = false): Promise<void> {
    if (busy || pending.current) return
    pending.current = true
    setWorking(true)
    try { await action() }
    catch (error) { console.error('[presets]', error); useUiStore.getState().pushToast('error', t(importing ? 'presetLibrary.invalidJson' : 'presetLibrary.failed')) }
    finally { pending.current = false; setWorking(false) }
  }

  return <div className="shrink-0 space-y-2 border-b border-noir-border px-3 py-3" data-testid="preset-quick-actions">
    <button type="button" className="flex w-full items-center gap-2 text-xs font-medium text-brand-accent" onClick={() => presetActions.openLibrary()} disabled={busy}>
      <Bookmark size={13} /><span>{t('presetLibrary.library')}</span><ChevronRight size={13} className="ml-auto" />
    </button>
    <Button type="button" variant="primary" size="sm" className="w-full" icon={<Plus size={13} />} disabled={busy || !target || target.image.locked} onClick={() => presetActions.openLibrary(true)}>{t('presetLibrary.saveLook')}</Button>
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" size="sm" className="px-2 text-[11px]" icon={<Upload size={12} />} disabled={busy} onClick={() => void run(() => presetActions.importJson(library.folderId), true)}>{t('presetLibrary.import')}</Button>
      <Button type="button" size="sm" className="px-2 text-[11px]" icon={<Download size={12} />} disabled={busy || library.loading || library.presets.length + library.folders.length === 0} onClick={() => void run(() => presetActions.exportJson({ folderId: library.folderId }))}>{t('presetLibrary.export')}</Button>
    </div>
  </div>
}
