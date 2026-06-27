import { Grid3x3, Ruler, Magnet, Frame, Sparkle } from 'lucide-react'
import { useEditorStore } from '../../stores/editorStore'
import { IconButton } from '../../components/ui/IconButton'

export function QuickActivationMenu(): JSX.Element {
  const qm = useEditorStore((s) => s.ui?.quickMenu)
  const setQuickMenu = useEditorStore((s) => s.setQuickMenu)
  if (!qm) return <div />

  const cycleGrid = (): void => {
    const next = qm.gridType === 'off' ? '3x3' : qm.gridType === '3x3' ? 'dense' : 'off'
    setQuickMenu({ gridType: next, gridEnabled: next !== 'off' })
  }

  return (
    <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-noir-border bg-noir-panel/90 px-1.5 py-1 backdrop-blur">
      <IconButton
        label={`Grid: ${qm.gridType === 'off' ? 'desligado' : qm.gridType === '3x3' ? '3×3' : 'denso'}`}
        size="sm"
        active={qm.gridEnabled}
        onClick={cycleGrid}
      >
        <Grid3x3 size={15} />
      </IconButton>
      <IconButton label="Réguas" size="sm" active={qm.rulersEnabled} onClick={() => setQuickMenu({ rulersEnabled: !qm.rulersEnabled })}>
        <Ruler size={15} />
      </IconButton>
      <IconButton label="Guias inteligentes" size="sm" active={qm.smartGuidesEnabled} onClick={() => setQuickMenu({ smartGuidesEnabled: !qm.smartGuidesEnabled })}>
        <Sparkle size={15} />
      </IconButton>
      <IconButton label="Snap / Encaixe" size="sm" active={qm.snapEnabled} onClick={() => setQuickMenu({ snapEnabled: !qm.snapEnabled })}>
        <Magnet size={15} />
      </IconButton>
      <IconButton label="Margens seguras" size="sm" active={qm.safeMarginsEnabled} onClick={() => setQuickMenu({ safeMarginsEnabled: !qm.safeMarginsEnabled })}>
        <Frame size={15} />
      </IconButton>
    </div>
  )
}
