import { useEffect, useState } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import { INSTAGRAM_FORMATS } from '@shared/constants'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { projectActions } from '../../services/projectActions'
import { useT } from '@renderer/i18n'
import { LayersPanel } from './LayersPanel'
import { IconButton } from '../../components/ui/IconButton'
import { assetsBarHeight } from '../../lib/layout'

export function ProjectSidebar(): JSX.Element {
  const project = useEditorStore((s) => s.project)
  const setProjectName = useEditorStore((s) => s.setProjectName)
  const collapse = useEditorStore((s) => s.setLeftSidebarCollapsed)
  const assetsCollapsed = useEditorStore((s) => s.ui?.filmstripCollapsed ?? false)
  const saveStatus = useUiStore((s) => s.saveStatus)
  const [name, setName] = useState(project?.name ?? '')
  const t = useT()

  useEffect(() => {
    setName(project?.name ?? '')
  }, [project?.id, project?.name])

  if (!project) return <aside className="h-full w-60 shrink-0 border-l border-noir-border bg-noir-panel" />

  const statusLabel =
    saveStatus === 'saving' ? t('project.statusSaving') : saveStatus === 'error' ? t('project.statusError') : t('project.statusSaved')

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-l border-noir-border bg-noir-panel">
      {/* Projeto */}
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <span className="text-2xs font-semibold uppercase tracking-[0.14em] text-noir-muted">{t('project.title')}</span>
        <button
          onClick={() => collapse(true)}
          className="-mr-1 rounded p-0.5 text-noir-muted transition-colors hover:text-noir-text"
          title={t('project.collapsePanel')}
          aria-label={t('project.collapsePanelAria')}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="px-4 pb-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name !== project.name && setProjectName(name.trim())}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm font-medium text-noir-text outline-none transition-colors hover:border-noir-border focus:border-noir-border focus:bg-noir-bg"
        />
        <dl className="mt-2 space-y-1 px-1 text-2xs">
          <Row k={t('project.format')} v={INSTAGRAM_FORMATS[project.format].label} />
          <Row k={t('project.photos')} v={String(project.dumpItems.length)} />
          <Row k={t('project.status')} v={statusLabel} />
        </dl>
      </div>

      <div className="mx-4 my-1 border-t border-noir-border" />

      {/* Camadas */}
      <div className="flex items-center justify-between px-4 pb-1 pt-4">
        <span className="text-2xs font-semibold uppercase tracking-[0.14em] text-noir-muted">{t('project.layers')}</span>
        <IconButton label={t('project.addPhotosToPool')} size="sm" onClick={() => void projectActions.importPhotos()}>
          <Plus size={15} />
        </IconButton>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" style={{ paddingBottom: assetsBarHeight(assetsCollapsed) + 12 }}>
        <LayersPanel />
      </div>
    </aside>
  )
}

function Row({ k, v }: { k: string; v: string }): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-noir-disabled">{k}</dt>
      <dd className="truncate pl-2 text-noir-muted">{v}</dd>
    </div>
  )
}
