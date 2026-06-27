import { useState, type DragEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEditorStore } from '../../stores/editorStore'
import { projectActions } from '../../services/projectActions'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useT } from '@renderer/i18n'
import { TopBar } from '../topbar/TopBar'
import { ProjectSidebar } from '../leftSidebar/ProjectSidebar'
import { RightInspector } from '../rightInspector/RightInspector'
import { PhotosAssetsPanel } from '../assets/PhotosAssetsPanel'
import { CanvasRegion } from '../canvas/CanvasRegion'
import { assetsBarHeight } from '../../lib/layout'
import { cn } from '../../lib/cn'

export function AppShell(): JSX.Element {
  const ui = useEditorStore((s) => s.ui)
  const setLeftCollapsed = useEditorStore((s) => s.setLeftSidebarCollapsed)
  const barHeight = assetsBarHeight(ui?.filmstripCollapsed ?? false)
  const [dragging, setDragging] = useState(false)
  const t = useT()
  useKeyboardShortcuts()

  const onDrop = async (e: DragEvent): Promise<void> => {
    if (!Array.from(e.dataTransfer.types).includes('Files')) return
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|tiff?)$/i.test(f.name))
    if (files.length === 0) return
    const paths = files.map((f) => window.noir.getPathForFile(f))
    // Arquivos soltos vão para o pool de fotos do projeto.
    await projectActions.importFromPaths(paths)
  }

  return (
    <div
      className="flex h-screen w-screen flex-col bg-noir-bg"
      onDragOver={(e) => {
        if (!Array.from(e.dataTransfer.types).includes('Files')) return
        e.preventDefault()
        if (!dragging) setDragging(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false)
      }}
      onDrop={(e) => void onDrop(e)}
    >
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        {/* Esquerda: ferramentas (trilho de ícones + painel expansível, estilo Canva) */}
        <RightInspector />
        <main className="flex min-w-0 min-h-0 flex-1 flex-col" style={{ paddingBottom: barHeight }}>
          <CanvasRegion />
        </main>
        {/* Direita: projeto e camadas */}
        <div
          className={cn(
            'h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            ui?.leftSidebarCollapsed ? 'w-0' : 'w-60'
          )}
        >
          <ProjectSidebar />
        </div>
        {ui?.leftSidebarCollapsed && (
          <ExpandRail side="right" onClick={() => setLeftCollapsed(false)} />
        )}

        {/* Dock "Photos Assets": à frente dos menus, ponta a ponta no rodapé. */}
        <div className="absolute inset-x-0 bottom-0 z-40">
          <PhotosAssetsPanel />
        </div>
      </div>

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className={cn(
              'rounded-2xl border-2 border-dashed border-noir-border-active/50 px-12 py-10 text-center'
            )}
          >
            <p className="text-lg font-medium">{t('shell.dropToAdd')}</p>
            <p className="mt-1 text-sm text-noir-muted">JPG · PNG · WEBP · HEIC · TIFF</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ExpandRail({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }): JSX.Element {
  const t = useT()
  return (
    <button
      onClick={onClick}
      title={t('shell.showPanel')}
      aria-label={side === 'left' ? t('shell.showLeftPanel') : t('shell.showRightPanel')}
      className={cn(
        'flex w-6 shrink-0 items-center justify-center bg-noir-panel text-noir-muted transition-colors hover:bg-noir-hover hover:text-noir-text',
        side === 'left' ? 'border-r border-noir-border' : 'border-l border-noir-border'
      )}
    >
      {side === 'left' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
    </button>
  )
}
