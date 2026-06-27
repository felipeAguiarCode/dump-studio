import { useEffect, useRef } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import type { Layer, ImageLayerData } from '@shared/types'
import { DEFAULT_ADJUSTMENTS, DEFAULT_SHADERS } from '@shared/defaults'
import { getGLContext } from '../../../engine/pipeline/glContext'
import { buildUniforms } from '../../../engine/pipeline/params'
import { useEditorStore } from '../../stores/editorStore'
import { useImage } from '../../hooks/useImage'
import { assetUrl } from '../../services/assetUrls'
import { CameraGlyph } from '../../components/ui/CameraGlyph'
import { cn } from '../../lib/cn'
import { useT } from '@renderer/i18n'
import { CAMERA_LOOKS, type CameraLook } from './camerasConfig'

const PW = 160
const PH = 120

export function CamerasLookPanel({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const data = layer.data as ImageLayerData
  const src = useImage(assetUrl(data.assetId))
  const applyCameraLook = useEditorStore((s) => s.applyCameraLook)
  const clearCameraLook = useEditorStore((s) => s.clearCameraLook)
  const activeId = data.cameraLook ?? null

  return (
    <div className="flex flex-col">
      <div className="border-b border-noir-border/60 px-4 pb-3 pt-4">
        <h3 className="text-xs font-medium text-noir-text">{t('camerasPanel.title')}</h3>
        <p className="mt-1 text-2xs text-noir-muted">{t('camerasPanel.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        {/* Original (remove o look da câmera). */}
        <OriginalCard
          active={activeId === null}
          src={src}
          assetId={data.assetId}
          label={t('camerasPanel.original')}
          onClick={() => clearCameraLook(layer.id)}
        />
        {CAMERA_LOOKS.map((look) => (
          <CameraCard
            key={look.id}
            look={look}
            src={src}
            assetId={data.assetId}
            active={activeId === look.id}
            label={t(`cameras.${look.id}.label`)}
            description={t(`cameras.${look.id}.description`)}
            onClick={() => applyCameraLook(layer.id, look)}
          />
        ))}
      </div>
    </div>
  )
}

/** Renderiza o preview ao vivo do look numa <canvas> (mesmo motor do painel de Filtros). */
function usePreview(
  ref: React.RefObject<HTMLCanvasElement>,
  src: HTMLImageElement | null,
  assetId: string,
  look: CameraLook | null
): void {
  useEffect(() => {
    if (!src || !ref.current) return
    const uniforms = look
      ? buildUniforms(
          { ...DEFAULT_ADJUSTMENTS, ...look.adjustments },
          look.filter ?? undefined,
          1080,
          0,
          undefined,
          { ...DEFAULT_SHADERS, ...look.shaders }
        )
      : buildUniforms(DEFAULT_ADJUSTMENTS, undefined, 1080, 0)
    try {
      getGLContext().process(assetId, src, uniforms, ref.current, PW, PH)
    } catch {
      /* ignora erros de preview */
    }
    // `look` é estável (constante do módulo); reprocessa quando muda a foto/câmera.
  }, [ref, src, assetId, look])
}

function CardShell({
  active,
  onClick,
  badge,
  label,
  description,
  canvasRef
}: {
  active: boolean
  onClick: () => void
  badge: JSX.Element
  label: string
  description?: string
  canvasRef: React.RefObject<HTMLCanvasElement>
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border text-left transition-colors',
        active ? 'border-noir-border-active/60 bg-noir-selection' : 'border-noir-border hover:bg-noir-hover'
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-noir-bg">
        <canvas ref={canvasRef} className="h-full w-full object-cover" />
        {badge}
        {active && (
          <span className="absolute right-1 top-1 flex items-center justify-center rounded-full bg-noir-border-active p-0.5 text-noir-bg">
            <Check size={11} />
          </span>
        )}
      </div>
      <div className="px-2 py-1.5">
        <div className="truncate text-2xs font-medium text-noir-text">{label}</div>
        {description && <div className="truncate text-[10px] leading-tight text-noir-muted">{description}</div>}
      </div>
    </button>
  )
}

function CameraCard({
  look,
  src,
  assetId,
  active,
  label,
  description,
  onClick
}: {
  look: CameraLook
  src: HTMLImageElement | null
  assetId: string
  active: boolean
  label: string
  description: string
  onClick: () => void
}): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null)
  usePreview(ref, src, assetId, look)
  return (
    <CardShell
      active={active}
      onClick={onClick}
      label={label}
      description={description}
      canvasRef={ref}
      badge={
        <span
          className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-md border border-black/30 shadow-sm"
          style={{ background: look.accent }}
        >
          <CameraGlyph glyph={look.glyph} size={15} accent="#ffffff" />
        </span>
      }
    />
  )
}

function OriginalCard({
  src,
  assetId,
  active,
  label,
  onClick
}: {
  src: HTMLImageElement | null
  assetId: string
  active: boolean
  label: string
  onClick: () => void
}): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null)
  usePreview(ref, src, assetId, null)
  return (
    <CardShell
      active={active}
      onClick={onClick}
      label={label}
      canvasRef={ref}
      badge={
        <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-md border border-black/30 bg-noir-elevated text-noir-muted shadow-sm">
          <RotateCcw size={13} />
        </span>
      }
    />
  )
}
