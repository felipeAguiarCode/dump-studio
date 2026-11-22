import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, Film, Loader2, Pause, Play, X } from 'lucide-react'
import type { DumpItem, Layer, UserPreset } from '@shared/types'
import { composeDumpItem } from '../../../engine/render/exportRenderer'
import samplePhoto from '../../../../.site/assets/photos/golden-street.jpg'
import { Button } from '../../components/ui/Button'
import { useT } from '../../i18n'
import { assetUrl } from '../../services/assetUrls'
import { buildPresetFrames, SAMPLE_ASSET_ID, SAMPLE_PAGE } from './presetPreviewFrames'

interface Props {
  preset: UserPreset
  target: { item: DumpItem; image: Layer } | null
  busy: boolean
  onApply: () => Promise<void>
  onClose: () => void
}

type Mode = 'before' | 'after' | 'showcase'

export function PresetPreview({ preset, target, busy, onApply, onClose }: Props): JSX.Element {
  const t = useT()
  const titleId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<Mode>('after')
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [applying, setApplying] = useState(false)
  const [images, setImages] = useState<Record<number, string>>({})
  const [failedFrame, setFailedFrame] = useState<number | null>(null)
  const cache = useRef(new Map<number, Promise<string>>())
  const image = target?.image ?? SAMPLE_PAGE.layers[0]
  const frames = useMemo(() => buildPresetFrames(target?.item ?? SAMPLE_PAGE, image, preset.look), [target, image, preset.look])
  const last = frames.length - 1
  const frameIndex = mode === 'showcase' ? step : mode === 'before' ? 0 : last
  const frame = frames[frameIndex]
  const src = images[frameIndex]
  const failed = failedFrame === frameIndex
  const inactive = busy || applying

  useEffect(() => {
    const element = dialog.current!
    element.showModal()
    return () => element.close()
  }, [])

  useEffect(() => {
    let active = true
    let pending = cache.current.get(frameIndex)
    if (!pending) {
      pending = composeDumpItem(frame.page, {
        format: 'png', quality: 100, maxSide: 960, requiredImageId: image.id,
        resolveAssetUrl: (id) => id === SAMPLE_ASSET_ID ? samplePhoto : assetUrl(id)
      })
      cache.current.set(frameIndex, pending)
    }
    void pending.then((url) => {
      if (active) setImages((current) => ({ ...current, [frameIndex]: url }))
    }).catch((error) => {
      console.error('[preset preview]', error)
      if (active) {
        setFailedFrame(frameIndex)
        setPlaying(false)
      }
    })
    return () => { active = false }
  }, [frame, frameIndex, image.id])

  useEffect(() => {
    if (mode !== 'showcase' || !playing || !src) return
    if (step === last) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => setStep(step + 1), 2000)
    return () => clearTimeout(timer)
  }, [mode, playing, step, last, src])

  function selectMode(next: Mode): void {
    setMode(next)
    setStep(0)
    setPlaying(next === 'showcase' && !matchMedia('(prefers-reduced-motion: reduce)').matches)
  }

  function seek(index: number): void {
    setPlaying(false)
    setStep(Math.max(0, Math.min(last, index)))
  }

  async function apply(): Promise<void> {
    if (inactive || !target || target.image.locked) return
    setApplying(true)
    try { await onApply() }
    finally { setApplying(false) }
  }

  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      className="m-auto max-h-[92vh] w-[880px] max-w-[calc(100vw-48px)] overflow-y-auto rounded-2xl border border-noir-border bg-noir-elevated p-0 text-noir-text shadow-bubble backdrop:bg-black/60"
      data-testid="preset-preview"
      onCancel={(event) => { event.preventDefault(); if (!inactive) onClose() }}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (mode === 'showcase' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
          event.preventDefault()
          seek(step + (event.key === 'ArrowLeft' ? -1 : 1))
        }
      }}
      onClick={(event) => { if (event.target === event.currentTarget && !inactive) onClose() }}
    >
      <header className="flex items-center justify-between gap-4 border-b border-noir-border px-5 py-3.5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-accent">{t('presetPreview.title')}</p>
          <h2 id={titleId} className="truncate text-lg font-semibold">{preset.name}</h2>
        </div>
        <button autoFocus type="button" aria-label={t('presetPreview.close')} disabled={inactive} onClick={onClose} className="rounded-lg p-2 text-noir-muted hover:bg-noir-hover hover:text-noir-text"><X size={18} /></button>
      </header>
      <div className="flex flex-wrap items-center gap-2 px-5 py-3" role="group" aria-label={t('presetPreview.title')}>
        <Button size="sm" aria-pressed={mode === 'before'} variant={mode === 'before' ? 'primary' : 'ghost'} icon={<EyeOff size={14} />} onClick={() => selectMode('before')}>{t('presetPreview.before')}</Button>
        <Button size="sm" aria-pressed={mode === 'after'} variant={mode === 'after' ? 'primary' : 'ghost'} icon={<Eye size={14} />} onClick={() => selectMode('after')}>{t('presetPreview.after')}</Button>
        <Button size="sm" aria-pressed={mode === 'showcase'} variant={mode === 'showcase' ? 'primary' : 'ghost'} icon={<Film size={14} />} onClick={() => selectMode('showcase')}>{t('presetPreview.showcase')}</Button>
        <span className="ml-auto max-w-[210px] truncate text-xs text-noir-muted" title={target?.image.name}>{target?.image.name ?? t('presetPreview.sample')}</span>
      </div>
      <figure className="mx-5 flex h-[min(51vh,460px)] items-center justify-center overflow-hidden rounded-xl border border-noir-border bg-noir-bg p-2" aria-busy={!src && !failed}>
        {src ? <img className="h-full w-full object-contain" src={src} alt={t(`presetPreview.${mode === 'showcase' ? frame.key : mode}`)} />
          : failed ? <p role="status" className="text-sm text-noir-danger">{t('presetPreview.failed')}</p>
          : <div role="status" className="flex items-center gap-2 text-sm text-noir-muted"><Loader2 size={17} className="animate-spin" />{t('presetPreview.loading')}</div>}
      </figure>
      {mode === 'showcase' && <div className="px-5 pt-3">
        <div className="flex items-center gap-2">
          <Button size="sm" aria-label={t('presetPreview.previous')} disabled={step === 0} onClick={() => seek(step - 1)}><ChevronLeft size={16} /></Button>
          <Button size="sm" aria-label={t(playing ? 'presetPreview.pause' : 'presetPreview.play')} onClick={() => { if (!playing && step === last) setStep(0); setPlaying(!playing) }}>{playing ? <Pause size={14} /> : <Play size={14} />}</Button>
          <Button size="sm" aria-label={t('presetPreview.next')} disabled={step === last} onClick={() => seek(step + 1)}><ChevronRight size={16} /></Button>
          <span aria-live="polite" className="ml-2 text-xs font-medium">{step + 1} / {frames.length} · {t(`presetPreview.${frame.key}`)}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label={t('presetPreview.steps')}>
          {frames.map(({ key }, index) => <button key={key} type="button" aria-current={index === step ? 'step' : undefined} onClick={() => seek(index)} className={`rounded-md px-2.5 py-1.5 text-xs ${index <= step ? 'bg-noir-selection text-brand-accent' : 'bg-noir-panel text-noir-muted hover:bg-noir-hover'}`}>{t(`presetPreview.${key}`)}</button>)}
        </div>
      </div>}
      <footer className="flex items-center justify-between gap-3 px-5 py-4">
        <p className="text-xs text-noir-muted">{t(!target ? 'presetPreview.selectToApply' : target.image.locked ? 'presetLibrary.lockedHint' : 'presetPreview.applyHint')}</p>
        <Button size="sm" variant="primary" icon={<Check size={14} />} disabled={inactive || !target || target.image.locked || !images[last]} onClick={() => void apply()}>{t('presetPreview.apply')}</Button>
      </footer>
    </dialog>,
    document.body
  )
}
