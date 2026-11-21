import { useEffect, useRef, useState } from 'react'
import { Check, Ban, Contrast, Film, Clapperboard, Palette, Camera, Sunset, BookOpen, FlaskConical } from 'lucide-react'
import type { Layer, ImageLayerData, PhotoFilterName } from '@shared/types'
import { DEFAULT_ADJUSTMENTS } from '@shared/defaults'
import { FILTER_SESSIONS } from '../../../engine/filters/registry'
import { getGLContext } from '../../../engine/pipeline/glContext'
import { buildUniforms } from '../../../engine/pipeline/params'
import { useEditorStore } from '../../stores/editorStore'
import { useImage } from '../../hooks/useImage'
import { assetUrl } from '../../services/assetUrls'
import { Slider } from '../../components/ui/Slider'
import { CollapsibleGroup } from '../../components/ui/CollapsibleGroup'
import { cn } from '../../lib/cn'
import { useT } from '@renderer/i18n'

const PW = 152
const PH = 190

const SESSION_ICONS: Record<string, JSX.Element> = {
  noir: <Contrast size={13} />,
  fujifilm: <Film size={13} />,
  cinematic: <Clapperboard size={13} />,
  aesthetic: <Palette size={13} />,
  vintage: <Camera size={13} />,
  nostalgic: <Sunset size={13} />,
  editorial: <BookOpen size={13} />,
  laboratory: <FlaskConical size={13} />
}

export function FiltersPanel({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const data = layer.data as ImageLayerData
  const src = useImage(assetUrl(data.assetId))
  const setFilter = useEditorStore((s) => s.setFilter)
  const setFilterIntensity = useEditorStore((s) => s.setFilterIntensity)
  const captureHistory = useEditorStore((s) => s.captureHistory)
  const active = layer.filter?.name ?? null
  // Acordeão: todas as sessões colapsadas por padrão; abrir uma fecha as demais.
  const [openId, setOpenId] = useState<string | null>(null)

  const toggle = (id: string): void => setOpenId((prev) => (prev === id ? null : id))

  return (
    <div className="flex flex-col">
      <div className="border-b border-noir-border/60 px-4 pb-3 pt-4">
        <h3 className="text-xs font-medium text-noir-text">{t('filtersPanel.title')}</h3>
        <p className="mt-1 text-2xs text-noir-muted">{t('filtersPanel.subtitle')}</p>

        {active && (
          <div className="mt-3">
            <Slider
              label={t('filtersPanel.intensity')}
              value={layer.filter?.intensity ?? 100}
              min={0}
              max={100}
              defaultValue={100}
              onChangeStart={captureHistory}
              onChange={(v) => setFilterIntensity(layer.id, v)}
            />
          </div>
        )}

        {/* Sem filtro */}
        <button
          onClick={() => setFilter(layer.id, null)}
          className={cn(
            'mt-3 flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors',
            active === null ? 'border-noir-border-active/40 bg-noir-selection' : 'border-noir-border hover:bg-noir-hover'
          )}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-noir-border bg-noir-bg text-noir-muted">
            <Ban size={18} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {t('filters.none')} {active === null && <Check size={13} />}
            </div>
            <div className="text-2xs text-noir-muted">{t('filters.noneDesc')}</div>
          </div>
        </button>
      </div>

      {FILTER_SESSIONS.map((session) => (
        <CollapsibleGroup
          key={session.id}
          title={t(`filters.sessions.${session.id}.label`)}
          icon={SESSION_ICONS[session.id]}
          open={openId === session.id}
          onToggle={() => toggle(session.id)}
        >
          <div className="space-y-2">
            <p className="text-2xs text-noir-muted">{t(`filters.sessions.${session.id}.description`)}</p>
            {session.filters.map((f) => (
              <FilterCard
                key={f.name}
                name={f.name}
                label={t(`filters.items.${f.name}.label`)}
                description={t(`filters.items.${f.name}.description`)}
                src={src}
                assetId={data.assetId}
                active={active === f.name}
                onClick={() => setFilter(layer.id, f.name, 100)}
              />
            ))}
          </div>
        </CollapsibleGroup>
      ))}
    </div>
  )
}

function FilterCard({
  name,
  label,
  description,
  src,
  assetId,
  active,
  onClick
}: {
  name: PhotoFilterName
  label: string
  description: string
  src: HTMLImageElement | null
  assetId: string
  active: boolean
  onClick: () => void
}): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!src || !ref.current) return
    const uniforms = buildUniforms(DEFAULT_ADJUSTMENTS, { name, intensity: 100 }, 1080, 0)
    try {
      getGLContext().process(assetId, src, uniforms, ref.current, PW, PH)
    } catch {
      /* ignore preview errors */
    }
  }, [src, assetId, name])

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors',
        active ? 'border-noir-border-active/40 bg-noir-selection' : 'border-noir-border hover:bg-noir-hover'
      )}
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-noir-border bg-noir-bg">
        <canvas ref={ref} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span className="truncate">{label}</span>
          {active && <Check size={13} className="shrink-0" />}
        </div>
        <div className="mt-0.5 text-2xs leading-snug text-noir-muted">{description}</div>
      </div>
    </button>
  )
}
