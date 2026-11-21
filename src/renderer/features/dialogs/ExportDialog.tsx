import { useState } from 'react'
import { Folder, Loader2, Download } from 'lucide-react'
import { useEditorStore, selectActiveDumpItem } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { ipc } from '../../services/ipcClient'
import { autosaveClient } from '../../services/autosaveClient'
import { composeDumpItem, composeDumpItems } from '../../../engine/render/exportRenderer'
import { INSTAGRAM_FORMATS } from '@shared/constants'
import { useT } from '@renderer/i18n'
import { Modal } from '../../components/ui/Modal'
import { Slider } from '../../components/ui/Slider'
import { cn } from '../../lib/cn'

export function ExportDialog(): JSX.Element | null {
  const t = useT()
  const project = useEditorStore((s) => s.project)
  const activeItem = useEditorStore(selectActiveDumpItem)
  const closeDialog = useUiStore((s) => s.closeDialog)
  const pushToast = useUiStore((s) => s.pushToast)

  const [scope, setScope] = useState<'current' | 'all'>('all')
  const [format, setFormat] = useState<'jpg' | 'png'>(project?.defaultExportFormat ?? 'jpg')
  const [quality, setQuality] = useState(project?.defaultExportQuality ?? 90)
  const [pattern, setPattern] = useState('noir-dump-{index}')
  const [destination, setDestination] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  if (!project) return null
  const spec = INSTAGRAM_FORMATS[project.format]

  const pickFolder = async (): Promise<void> => {
    const dir = await ipc('export:pickFolder')
    if (dir) setDestination(dir)
  }

  const run = async (): Promise<void> => {
    if (!destination) {
      await pickFolder()
      return
    }
    setBusy(true)
    try {
      const opts = { format, quality }
      const items = scope === 'current' && activeItem ? [activeItem] : project.dumpItems
      const images =
        scope === 'current' && activeItem
          ? [{ index: 0, dataUrl: await composeDumpItem(activeItem, opts) }]
          : await composeDumpItems(items, opts, (done, total) => setProgress({ done, total }))

      const result = await ipc('export:run', {
        projectId: project.id,
        scope,
        currentDumpItemId: activeItem?.id,
        format,
        jpgQuality: quality,
        destinationPath: destination,
        fileNamingPattern: pattern,
        images
      })

      autosaveClient.enqueue({
        kind: 'exportSettings',
        projectId: project.id,
        data: { exportFormat: format, jpgQuality: quality, destinationPath: destination, fileNamingPattern: pattern, exportScope: scope }
      })

      if (result.ok) {
        pushToast('success', t.plural('exportDialog.exported', result.writtenFiles.length))
        closeDialog()
      } else {
        pushToast('error', t('exportDialog.failed', { error: result.error ?? '' }))
      }
    } catch (e) {
      pushToast('error', t('exportDialog.failed', { error: (e as Error).message }))
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <Modal title={t('exportDialog.title')} onClose={closeDialog}>
      <div className="space-y-5">
        {/* Escopo */}
        <Field label={t('exportDialog.whatToExport')}>
          <div className="grid grid-cols-2 gap-2">
            <Choice active={scope === 'current'} onClick={() => setScope('current')}>{t('exportDialog.currentPhoto')}</Choice>
            <Choice active={scope === 'all'} onClick={() => setScope('all')}>{t('exportDialog.fullDump', { count: project.dumpItems.length })}</Choice>
          </div>
        </Field>

        {/* Formato */}
        <Field label={t('exportDialog.fileFormat')}>
          <div className="grid grid-cols-2 gap-2">
            <Choice active={format === 'jpg'} onClick={() => setFormat('jpg')}>JPG</Choice>
            <Choice active={format === 'png'} onClick={() => setFormat('png')}>PNG</Choice>
          </div>
        </Field>

        {format === 'jpg' && (
          <Field label={t('exportDialog.jpgQuality')}>
            <Slider label={t('exportDialog.quality')} value={quality} min={70} max={100} defaultValue={90} onChange={setQuality} />
          </Field>
        )}

        {/* Nome */}
        <Field label={t('exportDialog.namePattern')}>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="w-full rounded-md border border-noir-border bg-noir-bg px-2.5 py-1.5 text-xs outline-none focus:border-noir-border-active/40"
          />
          <p className="mt-1 text-[10px] text-noir-disabled">{t('exportDialog.namePatternHelp', { format })}</p>
        </Field>

        {/* Destino */}
        <Field label={t('exportDialog.destFolder')}>
          <button
            onClick={() => void pickFolder()}
            className="flex w-full items-center gap-2 rounded-md border border-noir-border bg-noir-bg px-2.5 py-2 text-left text-xs hover:bg-noir-hover"
          >
            <Folder size={15} className="shrink-0 text-noir-muted" />
            <span className={cn('truncate', destination ? 'text-noir-text' : 'text-noir-disabled')}>
              {destination || t('exportDialog.chooseFolder')}
            </span>
          </button>
        </Field>

        <div className="rounded-md border border-noir-border/60 bg-noir-bg px-3 py-2 text-[10px] text-noir-disabled">
          {t('exportDialog.resolution')} <span className="text-noir-muted">{spec.width} × {spec.height} px</span>
        </div>

        <button
          onClick={() => void run()}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg brand-primary py-2.5 text-sm font-medium  transition-colors  disabled:opacity-50"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {busy
            ? progress
              ? t('exportDialog.exportingProgress', { done: progress.done, total: progress.total })
              : t('exportDialog.exporting')
            : destination
              ? t('exportDialog.export')
              : t('exportDialog.chooseFolderAndExport')}
        </button>
      </div>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div>
      <label className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-md border py-2 text-xs transition-colors',
        active ? 'border-noir-border-active/40 bg-noir-selection text-noir-text' : 'border-noir-border text-noir-muted hover:bg-noir-hover'
      )}
    >
      {children}
    </button>
  )
}
