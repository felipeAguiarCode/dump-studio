import { useEffect, useState, useCallback, type ReactNode } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Sun,
  Moon,
  Loader2,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react'
import { INSTAGRAM_FORMATS } from '@shared/constants'
import { useEditorStore, selectActiveIndex } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { useT } from '@renderer/i18n'
import { cn } from '../../lib/cn'

const STORY_MS = 4000

type Theme = 'dark' | 'light'

function handleOf(name: string | undefined): string {
  const base = (name ?? 'profile').trim().toLowerCase().replace(/\s+/g, '_')
  return base || 'profile'
}

export function PreviewOverlay(): JSX.Element | null {
  const t = useT()
  const project = useEditorStore((s) => s.project)
  const startIndex = useEditorStore(selectActiveIndex)
  const closeDialog = useUiStore((s) => s.closeDialog)

  const pages = project?.dumpItems ?? []
  const total = pages.length
  const isStories = project?.format === 'story_reel_9_16'
  const spec = project ? INSTAGRAM_FORMATS[project.format] : null

  const [images, setImages] = useState<string[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(() => Math.max(0, startIndex))
  const [theme, setTheme] = useState<Theme>('dark')
  const [playing, setPlaying] = useState(true)

  // Compõe todas as páginas uma vez ao abrir (reflete o estado atual; WYSIWYG do export).
  useEffect(() => {
    let cancelled = false
    if (!project || pages.length === 0) {
      setLoading(false)
      return
    }
    setLoading(true)
    setProgress({ done: 0, total: pages.length })
    void (async () => {
      try {
        const { composeDumpItems } = await import('../../../engine/render/exportRenderer')
        const out = await composeDumpItems(pages, { format: 'jpg', quality: 90 }, (done, t) => {
          if (!cancelled) setProgress({ done, total: t })
        })
        if (cancelled) return
        const urls = out.slice().sort((a, b) => a.index - b.index).map((o) => o.dataUrl)
        setImages(urls)
      } catch (e) {
        console.error('[preview] falha ao compor páginas', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const next = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), [total])
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])

  // Teclado: setas navegam, Esc fecha, Espaço alterna play/pause (stories).
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Escape') {
        closeDialog()
      } else if (isStories && e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, closeDialog, isStories])

  // Auto-play dos stories: avança a cada STORY_MS; para no último.
  useEffect(() => {
    if (!isStories || !playing || loading || total === 0) return
    const t = setTimeout(() => {
      setIndex((i) => {
        if (i >= total - 1) {
          setPlaying(false)
          return i
        }
        return i + 1
      })
    }, STORY_MS)
    return () => clearTimeout(t)
  }, [isStories, playing, loading, index, total])

  if (!project || !spec) return null

  const dark = theme === 'dark'
  const img = images[index]
  const atStart = index <= 0
  const atEnd = index >= total - 1

  return (
    <div
      className={cn(
        'fixed inset-0 z-[80] flex items-center justify-center',
        dark ? 'bg-black/95' : 'bg-neutral-200/95'
      )}
      onMouseDown={closeDialog}
    >
      <style>{`@keyframes storyfill { from { width: 0% } to { width: 100% } }`}</style>

      {/* Controles do topo: tema + fechar */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
        <CircleBtn dark={dark} title={t('previewOverlay.toggleTheme')} onClick={() => setTheme((th) => (th === 'dark' ? 'light' : 'dark'))}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </CircleBtn>
        <CircleBtn dark={dark} title={t('previewOverlay.close')} onClick={closeDialog}>
          <X size={18} />
        </CircleBtn>
      </div>

      {/* Conteúdo */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        {loading ? (
          <div className={cn('flex flex-col items-center gap-3', dark ? 'text-white' : 'text-black')}>
            <Loader2 size={28} className="animate-spin" />
            <span className="text-sm">
              {t('previewOverlay.generating')} {progress.total ? `${progress.done}/${progress.total}` : ''}
            </span>
          </div>
        ) : total === 0 || !img ? (
          <div className={cn('text-sm', dark ? 'text-white/80' : 'text-black/70')}>{t('previewOverlay.nothing')}</div>
        ) : isStories ? (
          <StoriesView
            img={img}
            project={project}
            index={index}
            total={total}
            playing={playing}
            onTogglePlay={() => setPlaying((p) => !p)}
            onPrev={prev}
            onNext={next}
            onClose={closeDialog}
          />
        ) : (
          <PostView img={img} spec={spec} dark={dark} project={project} index={index} total={total} onGo={setIndex} />
        )}
      </div>

      {/* Setas laterais (navegação entre páginas) */}
      {!loading && total > 1 && (
        <>
          <SideArrow side="left" dark={dark} disabled={atStart} onClick={prev} />
          <SideArrow side="right" dark={dark} disabled={atEnd} onClick={next} />
        </>
      )}
    </div>
  )
}

/* ---------- Feed / Post ---------- */

function PostView({
  img,
  spec,
  dark,
  project,
  index,
  total,
  onGo
}: {
  img: string
  spec: { width: number; height: number }
  dark: boolean
  project: { name: string }
  index: number
  total: number
  onGo: (i: number) => void
}): JSX.Element {
  const t = useT()
  return (
    <div
      className={cn(
        'flex max-h-[94vh] w-[420px] max-w-[92vw] flex-col overflow-hidden rounded-xl border',
        dark ? 'border-neutral-800 bg-black text-white' : 'border-neutral-300 bg-white text-black'
      )}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <Avatar name={project.name} />
        <span className="text-[13px] font-semibold">{handleOf(project.name)}</span>
        <MoreHorizontal size={18} className="ml-auto opacity-70" />
      </div>

      <div className="relative w-full bg-black" style={{ aspectRatio: `${spec.width} / ${spec.height}` }}>
        <img src={img} alt="" className="h-full w-full object-cover" />
        {total > 1 && (
          <div className="absolute right-2.5 top-2.5 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white">
            {index + 1}/{total}
          </div>
        )}
      </div>

      <div className="relative flex items-center gap-4 px-3.5 pt-3">
        <Heart size={24} className="transition-colors hover:opacity-60" />
        <MessageCircle size={24} className="transition-colors hover:opacity-60" />
        <Send size={24} className="transition-colors hover:opacity-60" />
        <Bookmark size={24} className="ml-auto transition-colors hover:opacity-60" />
        {total > 1 && (
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => onGo(i)}
                aria-label={t('previewOverlay.page', { n: i + 1 })}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
                  i === index ? 'bg-blue-500' : dark ? 'bg-neutral-600' : 'bg-neutral-300'
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-3.5 pb-4 pt-2.5 text-[13px]">
        <div className="font-semibold">{t('previewOverlay.likes', { count: 128 })}</div>
        <div className="mt-1">
          <span className="font-semibold">{handleOf(project.name)}</span>{' '}
          <span className="opacity-90">{project.name}</span>
        </div>
        <div className={cn('mt-1.5 text-[11px] uppercase tracking-wide', dark ? 'text-white/40' : 'text-black/40')}>
          {t('previewOverlay.timeAgo')}
        </div>
      </div>
    </div>
  )
}

/* ---------- Stories ---------- */

function StoriesView({
  img,
  project,
  index,
  total,
  playing,
  onTogglePlay,
  onPrev,
  onNext,
  onClose
}: {
  img: string
  project: { name: string }
  index: number
  total: number
  playing: boolean
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}): JSX.Element {
  const t = useT()
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-black"
      style={{ aspectRatio: '9 / 16', height: '92vh', maxWidth: '96vw' }}
    >
      <img src={img} alt="" className="h-full w-full object-cover" />

      {/* Zonas de toque: esquerda/direita navegam */}
      <button aria-label={t('previewOverlay.prev')} onClick={onPrev} className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-default" />
      <button aria-label={t('previewOverlay.next')} onClick={onNext} className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-default" />

      {/* Gradiente superior para legibilidade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/70 to-transparent" />

      {/* Barras de progresso segmentadas */}
      <div className="absolute inset-x-2 top-2 z-20 flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
            {i < index ? (
              <div className="h-full w-full bg-white" />
            ) : i === index ? (
              <div
                key={`${index}-${playing}`}
                className="h-full bg-white"
                style={{
                  width: '0%',
                  animation: `storyfill ${STORY_MS}ms linear forwards`,
                  animationPlayState: playing ? 'running' : 'paused'
                }}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Cabeçalho */}
      <div className="absolute inset-x-2.5 top-5 z-20 flex items-center gap-2.5 text-white">
        <Avatar name={project.name} />
        <span className="text-[13px] font-semibold">{handleOf(project.name)}</span>
        <span className="text-[12px] text-white/70">{t('previewOverlay.now')}</span>
        <button onClick={onTogglePlay} title={playing ? t('previewOverlay.pause') : t('previewOverlay.play')} className="ml-auto rounded p-1 text-white/90 hover:text-white">
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button onClick={onClose} title={t('previewOverlay.close')} className="rounded p-1 text-white/90 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Barra de resposta (apenas visual) */}
      <div className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-3">
        <div className="flex-1 rounded-full border border-white/50 px-4 py-2.5 text-[13px] text-white/70">{t('previewOverlay.sendMessage')}</div>
        <Heart size={24} className="text-white" />
        <Send size={24} className="text-white" />
      </div>
    </div>
  )
}

/* ---------- Compartilhados ---------- */

function Avatar({ name }: { name: string }): JSX.Element {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[2px]">
      <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white">
        {(name?.trim()?.[0] ?? 'N').toUpperCase()}
      </div>
    </div>
  )
}

function SideArrow({
  side,
  dark,
  disabled,
  onClick
}: {
  side: 'left' | 'right'
  dark: boolean
  disabled: boolean
  onClick: () => void
}): JSX.Element {
  const t = useT()
  return (
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onClick}
      disabled={disabled}
      aria-label={side === 'left' ? t('previewOverlay.prevPage') : t('previewOverlay.nextPage')}
      className={cn(
        'absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-all disabled:pointer-events-none disabled:opacity-0',
        side === 'left' ? 'left-4' : 'right-4',
        dark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'
      )}
    >
      {side === 'left' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
    </button>
  )
}

function CircleBtn({
  dark,
  title,
  onClick,
  children
}: {
  dark: boolean
  title: string
  onClick: () => void
  children: ReactNode
}): JSX.Element {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
        dark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'
      )}
    >
      {children}
    </button>
  )
}
