import { useState } from 'react'
import { Grid3x3, Rows3, LayoutPanelLeft, LayoutDashboard, Move, Check, Instagram, LayoutTemplate, Frame, Zap, GalleryHorizontal } from 'lucide-react'
import { useEditorStore, selectActiveDumpItem } from '../../stores/editorStore'
import { LAYOUT_SESSIONS, type CollageTemplate, type LayoutSession } from '../canvas/collageTemplates'
import { CollapsibleGroup } from '../../components/ui/CollapsibleGroup'
import { cn } from '../../lib/cn'
import { useT } from '@renderer/i18n'

const GUTTER = 14

const SESSION_ICONS: Record<string, JSX.Element> = {
  grades: <Grid3x3 size={13} />,
  tiras: <Rows3 size={13} />,
  destaque: <LayoutPanelLeft size={13} />,
  editorial: <LayoutDashboard size={13} />,
  stories: <Instagram size={13} />,
  'stories-mix': <LayoutTemplate size={13} />,
  polaroid: <Frame size={13} />,
  dynamics: <Zap size={13} />,
  carousel: <GalleryHorizontal size={13} />
}

export function LayoutsPanel(): JSX.Element | null {
  const t = useT()
  const activeItem = useEditorStore(selectActiveDumpItem)
  const setPageLayout = useEditorStore((s) => s.setPageLayout)
  const setCanvasBackground = useEditorStore((s) => s.setCanvasBackground)
  // Acordeão: todas as sessões colapsadas por padrão; abrir uma fecha as demais.
  const [openId, setOpenId] = useState<string | null>(null)
  const toggle = (id: string): void => setOpenId((p) => (p === id ? null : id))

  if (!activeItem) return null
  const activeTemplateId = activeItem.canvas.layout?.templateId ?? null

  const choose = (tpl: CollageTemplate, session: LayoutSession): void => {
    // Fundo do template (ex.: Dynamics P5→preto, P3→azul) tem prioridade sobre o da sessão (ex.: Polaroid→branco).
    const bg = tpl.background ?? session.background
    if (bg && activeItem.canvas.backgroundColor !== bg) {
      setCanvasBackground(activeItem.id, bg)
    }
    setPageLayout(activeItem.id, {
      templateId: tpl.id,
      gutter: session.gutter ?? GUTTER,
      slots: tpl.cells.map((c) => ({ x: c.x, y: c.y, w: c.w, h: c.h, rot: c.rot, seam: c.seam }))
    })
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-noir-border/60 px-4 pb-3 pt-4">
        <h3 className="text-xs font-medium text-noir-text">{t('layouts.title')}</h3>
        <p className="mt-1 text-2xs text-noir-muted">{t('layouts.subtitle')}</p>
      </div>

      {/* Livre / Sem layout — movimentação livre das fotos. */}
      <div className="px-4 py-3">
        <button
          onClick={() => setPageLayout(activeItem.id, null)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left text-2xs transition-colors',
            !activeTemplateId
              ? 'border-noir-border-active/40 bg-noir-selection text-noir-text'
              : 'border-noir-border text-noir-muted hover:bg-noir-hover'
          )}
        >
          <Move size={13} />
          <span className="flex-1">{t('layouts.freeNoLayout')}</span>
          {!activeTemplateId && <Check size={13} />}
        </button>
      </div>

      {LAYOUT_SESSIONS.map((session) => (
        <CollapsibleGroup
          key={session.id}
          title={t(`layouts.sessions.${session.id}`)}
          icon={SESSION_ICONS[session.id]}
          open={openId === session.id}
          onToggle={() => toggle(session.id)}
        >
          <div className="grid grid-cols-4 gap-2">
            {session.templates.map((tpl) => {
              const active = tpl.id === activeTemplateId
              return (
                <button
                  key={tpl.id}
                  onClick={() => choose(tpl, session)}
                  title={t(`layouts.templates.${tpl.id}`)}
                  className={cn(
                    'group flex aspect-square items-center justify-center rounded-md border p-1.5 transition-colors',
                    active
                      ? 'border-noir-border-active/50 bg-noir-selection'
                      : 'border-noir-border bg-noir-elevated hover:border-noir-border-active/30 hover:bg-noir-hover'
                  )}
                >
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    {tpl.cells.map((c, i) => {
                      const x = c.x * 100 + 3
                      const y = c.y * 100 + 3
                      const w = c.w * 100 - 6
                      const h = c.h * 100 - 6
                      const rot = c.rot
                        ? `rotate(${c.rot} ${(c.x + c.w / 2) * 100} ${(c.y + c.h / 2) * 100})`
                        : undefined
                      // Borda de emenda do carrossel: índice 0 conecta à direita, último à esquerda.
                      const seamRight = c.seam && c.seam[0] < c.seam[1] - 1
                      const seamLeft = c.seam && c.seam[0] > 0
                      return (
                        <g key={i} transform={rot}>
                          <rect
                            x={x}
                            y={y}
                            width={w}
                            height={h}
                            rx={2}
                            className={active ? 'fill-noir-text/70' : 'fill-noir-muted/30 group-hover:fill-noir-muted/60'}
                          />
                          {seamRight && <rect x={x + w - 3} y={y} width={3} height={h} fill="#4ea1ff" />}
                          {seamLeft && <rect x={x} y={y} width={3} height={h} fill="#4ea1ff" />}
                        </g>
                      )
                    })}
                  </svg>
                </button>
              )
            })}
          </div>
        </CollapsibleGroup>
      ))}
    </div>
  )
}
