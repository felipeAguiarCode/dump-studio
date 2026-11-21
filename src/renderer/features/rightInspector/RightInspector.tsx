import { SlidersHorizontal, Wand2, Camera, Layers, Sparkles, Crop, LayoutGrid, Frame, Type, Shapes, ChevronLeft, ImageOff, Bookmark } from 'lucide-react'
import type { RightTab } from '@shared/types'
import { useEditorStore, selectSelectedLayer, selectActiveDumpItem } from '../../stores/editorStore'
import { assetsBarHeight } from '../../lib/layout'
import { cn } from '../../lib/cn'
import { useT } from '@renderer/i18n'
import { AdjustmentsPanel } from './AdjustmentsPanel'
import { FiltersPanel } from './FiltersPanel'
import { CamerasLookPanel } from './CamerasLookPanel'
import { ShadersPanel } from './ShadersPanel'
import { FxPanel } from './FxPanel'
import { CropPanel } from './CropPanel'
import { LayoutsPanel } from './LayoutsPanel'
import { CanvasPanel } from './panels/CanvasPanel'
import { TextToolPanel } from './panels/TextPanel'
import { ShapePanel } from './panels/ShapePanel'
import { PresetsPanel } from './PresetsPanel'
import { PresetQuickActions } from './PresetQuickActions'

interface Section {
  id: string
  label: string
  icon: JSX.Element
  render: () => JSX.Element
}

const RIGHT_TABS: RightTab[] = ['presets', 'adjustments', 'filters', 'cameras', 'shaders', 'fx', 'crop', 'canvas', 'layouts', 'text']
const isRightTab = (id: string): id is RightTab => (RIGHT_TABS as string[]).includes(id)

/**
 * Menu de ferramentas estilo Adobe Express / Canva: trilho de ícones+rótulo à esquerda;
 * clicar abre o painel daquela seção; clicar na seção ativa recolhe (só o trilho).
 */
export function RightInspector(): JSX.Element {
  const t = useT()
  const selected = useEditorStore(selectSelectedLayer)
  const activeItem = useEditorStore(selectActiveDumpItem)
  const tab = useEditorStore((s) => s.ui?.activeRightTab ?? 'adjustments')
  const setTab = useEditorStore((s) => s.setActiveRightTab)
  const panelClosed = useEditorStore((s) => s.ui?.rightSidebarCollapsed ?? false)
  const setPanelClosed = useEditorStore((s) => s.setRightSidebarCollapsed)
  const assetsCollapsed = useEditorStore((s) => s.ui?.filmstripCollapsed ?? false)
  const barH = assetsBarHeight(assetsCollapsed)

  const isImage = selected?.type === 'image'

  // Seção Texto (ferramenta de texto): disponível com imagem, em página, e ao editar texto.
  const textSection: Section = { id: 'text', label: t('inspector.text'), icon: <Type size={18} />, render: () => <TextToolPanel /> }

  const contextualSections: Section[] = isImage
    ? [
        { id: 'layouts', label: t('inspector.layouts'), icon: <LayoutGrid size={18} />, render: () => <LayoutsPanel /> },
        { id: 'adjustments', label: t('inspector.adjustments'), icon: <SlidersHorizontal size={18} />, render: () => <AdjustmentsPanel layer={selected!} /> },
        { id: 'filters', label: t('inspector.filters'), icon: <Wand2 size={18} />, render: () => <FiltersPanel layer={selected!} /> },
        { id: 'shaders', label: t('inspector.textures'), icon: <Layers size={18} />, render: () => <ShadersPanel layer={selected!} /> },
        { id: 'fx', label: t('inspector.fx'), icon: <Sparkles size={18} />, render: () => <FxPanel /> },
        textSection,
        { id: 'cameras', label: t('inspector.cameras'), icon: <Camera size={18} />, render: () => <CamerasLookPanel layer={selected!} /> },
        { id: 'crop', label: t('inspector.crop'), icon: <Crop size={18} />, render: () => <CropPanel layer={selected!} /> }
      ]
    : selected?.type === 'text'
      ? [textSection]
      : selected?.type === 'shape' || selected?.type === 'border'
        ? [{ id: 'shape', label: t('inspector.shape'), icon: <Shapes size={18} />, render: () => <ShapePanel layer={selected!} /> }]
        : activeItem
          ? [
              { id: 'canvas', label: t('inspector.canvas'), icon: <Frame size={18} />, render: () => <CanvasPanel item={activeItem!} /> },
              { id: 'layouts', label: t('inspector.layouts'), icon: <LayoutGrid size={18} />, render: () => <LayoutsPanel /> },
              { id: 'fx', label: t('inspector.fx'), icon: <Sparkles size={18} />, render: () => <FxPanel /> },
              textSection
            ]
          : []

  const sections: Section[] = [{ id: 'presets', label: t('inspector.presets'), icon: <Bookmark size={18} />, render: () => <PresetsPanel /> }, ...contextualSections]
  const ids = sections.map((s) => s.id)
  const activeId = ids.includes(tab) ? tab : sections[0]?.id ?? null
  const active = sections.find((s) => s.id === activeId) ?? null
  const open = sections.length > 0 && !panelClosed && !!active

  const onRail = (id: string): void => {
    if (open && id === activeId) {
      setPanelClosed(true)
      return
    }
    setPanelClosed(false)
    if (isRightTab(id)) setTab(id)
  }

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 border-r border-noir-border bg-noir-panel transition-[width] duration-200 ease-out',
        open ? 'w-[344px]' : 'w-16'
      )}
    >
      {/* Trilho de ícones */}
      <nav
        className="flex h-full w-16 shrink-0 flex-col gap-1 overflow-y-auto border-r border-noir-border/60 py-2"
        style={{ paddingBottom: barH }}
      >
        {sections.length === 0 ? (
          <div className="flex flex-col items-center px-1 pt-4 text-noir-disabled">
            <ImageOff size={18} />
          </div>
        ) : (
          sections.map((s) => (
            <button
              key={s.id}
              onClick={() => onRail(s.id)}
              title={s.label}
              className={cn(
                'mx-1.5 flex flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors',
                open && s.id === activeId
                  ? 'bg-noir-selection text-brand-accent'
                  : 'text-noir-muted hover:bg-noir-hover hover:text-noir-text'
              )}
            >
              {s.icon}
              <span className="text-[10px] leading-none">{s.label}</span>
            </button>
          ))
        )}
      </nav>

      {/* Painel expandido da seção ativa */}
      {open && active && (
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-noir-border px-3.5 py-3">
            <span className="text-xs font-semibold text-noir-text">{active.label}</span>
            <button
              onClick={() => setPanelClosed(true)}
              title={t('inspectorPanel.collapse')}
              aria-label={t('inspectorPanel.collapseAria')}
              className="rounded p-0.5 text-noir-muted transition-colors hover:text-noir-text"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {active.id !== 'presets' && <PresetQuickActions />}
          {isImage && active.id !== 'layouts' && active.id !== 'text' && active.id !== 'presets' && (
            <div className="border-b border-noir-border/60 px-4 py-2 text-2xs text-noir-disabled">
              {t('inspectorPanel.editing')} <span className="text-noir-muted">{selected!.name}</span>
            </div>
          )}

          <div className={cn('min-h-0 flex-1', active.id === 'presets' ? 'overflow-hidden' : 'overflow-y-auto')} style={{ paddingBottom: barH }}>
            {active.render()}
          </div>
        </div>
      )}
    </aside>
  )
}
