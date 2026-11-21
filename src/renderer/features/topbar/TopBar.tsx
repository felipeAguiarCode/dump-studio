import {
  ChevronLeft,
  ChevronRight,
  Undo2,
  Redo2,
  Maximize2,
  Upload,
  Settings,
  Home,
  History,
  Check,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  Play
} from 'lucide-react'
import { useEditorStore, selectActiveIndex } from '../../stores/editorStore'
import { useHistoryStore } from '../../stores/historyStore'
import { useUiStore } from '../../stores/uiStore'
import { projectActions } from '../../services/projectActions'
import { useT } from '@renderer/i18n'
import { IconButton } from '../../components/ui/IconButton'
import { Button } from '../../components/ui/Button'
import { FormatDropdown } from './FormatDropdown'
import { ZoomControl } from './ZoomControl'
import { formatTime } from '../../lib/format'
import { cn } from '../../lib/cn'
import { ThemeToggle } from '../../components/ui/ThemeToggle'

export function TopBar(): JSX.Element {
  const project = useEditorStore((s) => s.project)
  const index = useEditorStore(selectActiveIndex)
  const goTo = useEditorStore((s) => s.goToDumpItemIndex)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const resetView = useEditorStore((s) => s.resetView)

  const canUndo = useHistoryStore((s) => s.past.length > 0)
  const canRedo = useHistoryStore((s) => s.future.length > 0)

  const openDialog = useUiStore((s) => s.openDialog)
  const requestConfirm = useUiStore((s) => s.requestConfirm)
  const activeId = useEditorStore((s) => s.ui?.activeDumpItemId)
  const total = project?.dumpItems.length ?? 0
  const t = useT()

  const removeActivePage = (): void => {
    if (!activeId) return
    requestConfirm({
      title: t('topbar.deletePage'),
      message: t('topbar.deletePageMessage'),
      confirmLabel: t('common.delete'),
      danger: true,
      onConfirm: () => void projectActions.deleteDumpItem(activeId)
    })
  }

  return (
    <header className="flex h-[52px] shrink-0 items-center gap-2 border-b border-noir-border bg-noir-panel px-3">
      {/* Esquerda */}
      <div className="flex items-center gap-2">
        <IconButton label={t('topbar.projects')} onClick={() => projectActions.closeProject()}>
          <Home size={17} />
        </IconButton>
        <FormatDropdown />
      </div>

      {/* Centro — navegação entre fotos */}
      <div className="mx-auto flex items-center gap-2">
        <IconButton
          label={t('topbar.prevPhoto')}
          disabled={index <= 0}
          onClick={() => goTo(index - 1)}
        >
          <ChevronLeft size={18} />
        </IconButton>
        <span className="min-w-[96px] text-center text-xs text-noir-muted">
          {total === 0 ? '—' : t('topbar.photoCounter', { index: String(index + 1).padStart(2, '0'), total })}
        </span>
        <IconButton
          label={t('topbar.nextPhoto')}
          disabled={index < 0 || index >= total - 1}
          onClick={() => goTo(index + 1)}
        >
          <ChevronRight size={18} />
        </IconButton>
        <div className="mx-1 h-5 w-px bg-noir-border" />
        <IconButton label={t('topbar.newPage')} onClick={() => void projectActions.addBlankDumpItem()}>
          <Plus size={17} />
        </IconButton>
        <IconButton label={t('topbar.deletePage')} disabled={total === 0} onClick={removeActivePage}>
          <Minus size={17} />
        </IconButton>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-1">
        <SaveStatus />
        <IconButton label={t('topbar.undo')} disabled={!canUndo} onClick={undo}>
          <Undo2 size={17} />
        </IconButton>
        <IconButton label={t('topbar.redo')} disabled={!canRedo} onClick={redo}>
          <Redo2 size={17} />
        </IconButton>
        <ZoomControl />
        <IconButton label={t('topbar.fitScreen')} onClick={resetView}>
          <Maximize2 size={16} />
        </IconButton>
        <IconButton label={t('topbar.snapshots')} onClick={() => openDialog('snapshots')}>
          <History size={16} />
        </IconButton>
        <Button
          variant="subtle"
          size="sm"
          icon={<Play size={14} />}
          className="ml-1"
          disabled={total === 0}
          onClick={() => openDialog('preview')}
        >
          {t('topbar.preview')}
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Upload size={15} />}
          onClick={() => openDialog('export')}
        >
          {t('topbar.export')}
        </Button>
        <IconButton label={t('topbar.preferences')} onClick={() => openDialog('preferences')}>
          <Settings size={17} />
        </IconButton>
        <ThemeToggle />
      </div>
    </header>
  )
}

function SaveStatus(): JSX.Element | null {
  const status = useUiStore((s) => s.saveStatus)
  const savedAt = useUiStore((s) => s.lastSavedAt)
  const t = useT()
  if (status === 'idle') return null
  return (
    <div
      className={cn(
        'mr-1 flex items-center gap-1.5 text-2xs',
        status === 'error' ? 'text-noir-danger' : 'text-noir-muted'
      )}
    >
      {status === 'saving' && <Loader2 size={12} className="animate-spin" />}
      {status === 'saved' && <Check size={12} />}
      {status === 'error' && <AlertCircle size={12} />}
      <span>
        {status === 'saving' && t('topbar.saving')}
        {status === 'saved' && (savedAt ? t('topbar.savedAt', { time: formatTime(savedAt) }) : t('topbar.saved'))}
        {status === 'error' && t('topbar.saveError')}
      </span>
    </div>
  )
}
