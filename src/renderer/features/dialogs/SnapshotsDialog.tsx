import { useEffect, useState } from 'react'
import { Save, RotateCcw, Trash2, Camera } from 'lucide-react'
import type { ProjectSnapshot } from '@shared/types'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { ipc } from '../../services/ipcClient'
import { projectActions } from '../../services/projectActions'
import { useT } from '@renderer/i18n'
import { Modal } from '../../components/ui/Modal'
import { formatRelativeDate } from '../../lib/format'

export function SnapshotsDialog(): JSX.Element | null {
  const t = useT()
  const project = useEditorStore((s) => s.project)
  const closeDialog = useUiStore((s) => s.closeDialog)
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([])
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null)

  const refresh = async (): Promise<void> => {
    if (project) setSnapshots(await ipc('snapshots:list', { projectId: project.id }))
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  if (!project) return null

  const create = async (): Promise<void> => {
    setBusy(true)
    await projectActions.createSnapshot(name.trim() || t('snapshotsDialog.defaultName', { n: snapshots.length + 1 }))
    setName('')
    await refresh()
    setBusy(false)
  }

  const restore = async (id: string): Promise<void> => {
    setConfirmRestore(null)
    await projectActions.restoreSnapshot(id)
    closeDialog()
  }

  return (
    <Modal title={t('snapshotsDialog.title')} onClose={closeDialog} width={500}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void create()}
            placeholder={t('snapshotsDialog.namePlaceholder')}
            className="flex-1 rounded-md border border-noir-border bg-noir-bg px-3 py-2 text-xs outline-none focus:border-noir-border-active/40"
          />
          <button
            onClick={() => void create()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md bg-noir-text px-3 py-2 text-xs font-medium text-noir-bg hover:bg-white disabled:opacity-50"
          >
            <Save size={14} /> {t('snapshotsDialog.saveState')}
          </button>
        </div>

        {snapshots.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-noir-disabled">
            <Camera size={32} strokeWidth={1.25} />
            <p className="text-xs">{t('snapshotsDialog.empty')}</p>
          </div>
        ) : (
          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {snapshots.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border border-noir-border bg-noir-panel p-2">
                <SnapshotThumb path={s.thumbnailPath} />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{s.name}</div>
                  <div className="text-2xs text-noir-muted">{formatRelativeDate(s.createdAt)}</div>
                </div>
                {confirmRestore === s.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xs text-noir-muted">{t('snapshotsDialog.replaceCurrent')}</span>
                    <button onClick={() => void restore(s.id)} className="rounded-md bg-noir-text px-2 py-1 text-2xs font-medium text-noir-bg hover:bg-white">{t('common.restore')}</button>
                    <button onClick={() => setConfirmRestore(null)} className="rounded-md border border-noir-border px-2 py-1 text-2xs hover:bg-noir-hover">{t('common.cancel')}</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setConfirmRestore(s.id)} title={t('common.restore')} className="rounded-md p-1.5 text-noir-muted hover:bg-noir-hover hover:text-noir-text">
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={async () => { await ipc('snapshots:delete', { snapshotId: s.id }); void refresh() }}
                      title={t('common.delete')}
                      className="rounded-md p-1.5 text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

function SnapshotThumb({ path }: { path?: string }): JSX.Element {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!path) return
    void ipc('assets:dataUrl', { path }).then(setUrl).catch(() => setUrl(null))
  }, [path])
  return (
    <div className="h-12 w-10 shrink-0 overflow-hidden rounded border border-noir-border bg-noir-bg">
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
    </div>
  )
}
