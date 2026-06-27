import { useState } from 'react'
import { Plus, Minus, Copy, Trash2 } from 'lucide-react'
import { useEditorStore, selectActiveIndex } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { projectActions } from '../../services/projectActions'
import { useT } from '@renderer/i18n'
import { cn } from '../../lib/cn'

export function CarouselDots(): JSX.Element | null {
  const t = useT()
  const project = useEditorStore((s) => s.project)
  const activeIndex = useEditorStore(selectActiveIndex)
  const goTo = useEditorStore((s) => s.goToDumpItemIndex)
  const requestConfirm = useUiStore((s) => s.requestConfirm)
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const total = project?.dumpItems.length ?? 0
  if (total === 0) return null

  const confirmDelete = (id: string): void =>
    requestConfirm({
      title: t('canvas.carousel.deletePage'),
      message: t('canvas.carousel.deletePageConfirm'),
      confirmLabel: t('common.delete'),
      danger: true,
      onConfirm: () => void projectActions.deleteDumpItem(id)
    })

  return (
    <div
      className="absolute bottom-4 left-1/2 z-10 flex max-w-[70%] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5"
      onMouseLeave={() => setMenu(null)}
    >
      {project!.dumpItems.map((item, i) => (
        <button
          key={item.id}
          onClick={() => goTo(i)}
          onContextMenu={(e) => {
            e.preventDefault()
            setMenu({ id: item.id, x: e.clientX, y: e.clientY })
          }}
          aria-label={t('canvas.carousel.goToPage', { n: i + 1 })}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i === activeIndex ? 'w-4 bg-noir-white' : 'w-1.5 bg-noir-muted/40 hover:bg-noir-muted'
          )}
        />
      ))}
      <button
        onClick={() => void projectActions.addBlankDumpItem()}
        aria-label={t('canvas.carousel.newPage')}
        title={t('canvas.carousel.newPage')}
        className="ml-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-noir-muted/40 text-noir-muted transition-colors hover:border-noir-text hover:text-noir-text"
      >
        <Plus size={9} />
      </button>
      <button
        onClick={() => {
          const id = project!.dumpItems[activeIndex]?.id
          if (id) confirmDelete(id)
        }}
        aria-label={t('canvas.carousel.deleteCurrentPage')}
        title={t('canvas.carousel.deleteCurrentPage')}
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-noir-muted/40 text-noir-muted transition-colors hover:border-red-400 hover:text-red-300"
      >
        <Minus size={9} />
      </button>

      {menu && (
        <div
          className="fixed z-50 w-36 rounded-lg border border-noir-border bg-noir-elevated p-1 shadow-bubble"
          style={{ left: menu.x, top: menu.y - 8, transform: 'translateY(-100%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { setMenu(null); void projectActions.duplicateDumpItem(menu.id) }}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs text-noir-text hover:bg-noir-hover"
          >
            <Copy size={13} /> {t('canvas.carousel.duplicatePage')}
          </button>
          <button
            onClick={() => { const id = menu.id; setMenu(null); confirmDelete(id) }}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs text-red-300 hover:bg-red-500/10"
          >
            <Trash2 size={13} /> {t('canvas.carousel.deletePage')}
          </button>
        </div>
      )}
    </div>
  )
}
