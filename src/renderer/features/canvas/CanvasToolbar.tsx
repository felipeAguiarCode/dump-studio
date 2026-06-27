import { useState } from 'react'
import {
  MousePointer2,
  Hand,
  Crop,
  Move,
  Brush,
  Type,
  Square,
  RectangleHorizontal,
  Circle,
  Triangle,
  Minus,
  ZoomIn
} from 'lucide-react'
import type { ShapeKind } from '@shared/types'
import type { CanvasTool } from '../../stores/uiStore'
import { useUiStore } from '../../stores/uiStore'
import { useEditorStore } from '../../stores/editorStore'
import { projectActions } from '../../services/projectActions'
import { useT } from '@renderer/i18n'
import { IconButton } from '../../components/ui/IconButton'
import { cn } from '../../lib/cn'

type ToolDef = { id: CanvasTool; icon: JSX.Element; disabled?: boolean }

const TOOLS: ToolDef[] = [
  { id: 'select', icon: <MousePointer2 size={17} /> },
  { id: 'pan', icon: <Hand size={17} /> },
  { id: 'crop', icon: <Crop size={17} /> },
  { id: 'transform', icon: <Move size={17} /> },
  { id: 'mask', icon: <Brush size={17} />, disabled: true },
  { id: 'text', icon: <Type size={17} /> },
  { id: 'shape', icon: <Square size={17} /> },
  { id: 'zoom', icon: <ZoomIn size={17} /> }
]

const SHAPE_OPTIONS: { kind: ShapeKind; icon: JSX.Element }[] = [
  { kind: 'rectangle', icon: <RectangleHorizontal size={16} /> },
  { kind: 'square', icon: <Square size={16} /> },
  { kind: 'circle', icon: <Circle size={16} /> },
  { kind: 'triangle', icon: <Triangle size={16} /> },
  { kind: 'line', icon: <Minus size={16} /> }
]

export function CanvasToolbar(): JSX.Element {
  const t = useT()
  const tool = useUiStore((s) => s.tool)
  const setTool = useUiStore((s) => s.setTool)
  const activeItemId = useEditorStore((s) => s.ui?.activeDumpItemId)
  const [shapeMenu, setShapeMenu] = useState(false)

  const onPick = (id: CanvasTool): void => {
    if (id === 'text' && activeItemId) {
      void projectActions.addLayer({ dumpItemId: activeItemId, type: 'text' })
      setTool('select')
      return
    }
    if (id === 'shape') {
      setShapeMenu((o) => !o)
      return
    }
    setShapeMenu(false)
    setTool(id)
  }

  const addShape = (kind: ShapeKind): void => {
    setShapeMenu(false)
    if (activeItemId) void projectActions.addLayer({ dumpItemId: activeItemId, type: 'shape', data: { shape: kind } })
  }

  return (
    <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-noir-border bg-noir-panel/90 p-1.5 backdrop-blur">
      {TOOLS.map((td) => (
        <div key={td.id} className="relative">
          <IconButton
            label={t(`canvas.tools.${td.id}`)}
            tooltipSide="right"
            active={tool === td.id || (td.id === 'shape' && shapeMenu)}
            disabled={td.disabled}
            onClick={() => onPick(td.id)}
          >
            {td.icon}
          </IconButton>

          {td.id === 'shape' && shapeMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShapeMenu(false)} />
              <div className="absolute left-full top-1/2 z-20 ml-2 flex -translate-y-1/2 flex-col gap-0.5 rounded-lg border border-noir-border bg-noir-elevated p-1 shadow-bubble">
                {SHAPE_OPTIONS.map((s) => (
                  <button
                    key={s.kind}
                    onClick={() => addShape(s.kind)}
                    className={cn(
                      'flex items-center gap-2.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-xs text-noir-text transition-colors hover:bg-noir-hover'
                    )}
                  >
                    {s.icon}
                    {t(`canvas.shapes.${s.kind}`)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
