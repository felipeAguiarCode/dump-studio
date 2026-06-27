import { useCallback, useEffect, useState } from 'react'
import { Plus, MoreHorizontal, Copy, Trash2, Images, ArrowRight } from 'lucide-react'
import type { ProjectSummary } from '@shared/types'
import { INSTAGRAM_FORMATS, FORMAT_GROUPS, type InstagramFormat } from '@shared/constants'
import { ipc } from '../../services/ipcClient'
import { projectActions } from '../../services/projectActions'
import { useUiStore } from '../../stores/uiStore'
import { useT } from '@renderer/i18n'
import { thumbUrl } from '../../services/assetUrls'
import { formatRelativeDate } from '../../lib/format'
import { cn } from '../../lib/cn'
import { EmptyState } from '../shell/EmptyState'
import { FormatGlyph } from '../../components/FormatGlyph'

export function RecentProjectsScreen(): JSX.Element {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const pushToast = useUiStore((s) => s.pushToast)
  const t = useT()

  const refresh = useCallback(async () => {
    const list = await ipc('projects:list', {})
    setProjects(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createWithFormat = async (format: InstagramFormat): Promise<void> => {
    if (busy) return
    setBusy(true)
    try {
      await projectActions.createProject({ format })
    } catch (e) {
      pushToast('error', t('home.createFailed', { error: (e as Error).message }))
      setBusy(false)
    }
  }

  const open = async (id: string): Promise<void> => {
    if (busy) return
    setBusy(true)
    try {
      await projectActions.openProject(id)
    } catch (e) {
      pushToast('error', t('home.openFailed', { error: (e as Error).message }))
      setBusy(false)
    }
  }

  const duplicate = async (id: string): Promise<void> => {
    setMenuId(null)
    const dup = await ipc('projects:duplicate', { id })
    pushToast('success', t('home.duplicated'))
    await refresh()
    void dup
  }

  const remove = async (id: string): Promise<void> => {
    setConfirmId(null)
    setMenuId(null)
    await ipc('projects:delete', { id })
    pushToast('info', t('home.deleted'))
    await refresh()
  }

  const last = projects[0]

  return (
    <div className="h-screen w-screen overflow-y-auto bg-noir-bg" onClick={() => setMenuId(null)}>
      <div className="mx-auto max-w-5xl px-10 py-16">
        {/* Cabeçalho */}
        <header className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-noir-border bg-noir-elevated text-sm font-semibold tracking-tight">
            ND
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight">Noir Dump Studio</h1>
            <p className="text-xs text-noir-muted">{t('home.subtitle')}</p>
          </div>
          {last && (
            <button
              onClick={() => void open(last.id)}
              disabled={busy}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border border-noir-border bg-noir-elevated px-4 py-2.5 text-sm transition-colors hover:bg-noir-hover disabled:opacity-40"
            >
              {t('home.continue')} <span className="text-noir-muted">{last.name}</span>
              <ArrowRight size={15} />
            </button>
          )}
        </header>

        {/* Criar novo projeto */}
        <section className="mt-12">
          <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-noir-muted">
            {t('home.newProjectChooseFormat')}
          </h2>
          {FORMAT_GROUPS.map((group) => (
            <div key={group.label} className="mt-5 first:mt-4">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-noir-disabled">{group.label}</span>
                <div className="h-px flex-1 bg-noir-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {group.formats.map((id) => {
                  const spec = INSTAGRAM_FORMATS[id]
                  return (
                    <button
                      key={spec.id}
                      disabled={busy}
                      onClick={() => void createWithFormat(spec.id)}
                      className="group flex items-center gap-3.5 rounded-xl border border-noir-border bg-noir-panel p-4 text-left transition-colors hover:border-noir-border-active/30 hover:bg-noir-elevated disabled:opacity-40"
                    >
                      <FormatGlyph format={spec.id} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {spec.label}
                          <Plus size={14} className="text-noir-disabled transition-colors group-hover:text-noir-text" />
                        </div>
                        <div className="mt-0.5 truncate text-xs text-noir-muted">{spec.ratioLabel}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Projetos recentes */}
        <section className="mt-12">
          <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-noir-muted">
            {t('home.recentProjects')}
          </h2>

          {loading ? (
            <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-noir-panel" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              className="mt-10 py-10"
              icon={<Images size={40} strokeWidth={1.25} />}
              title={t('home.emptyTitle')}
              description={t('home.emptyDesc')}
            />
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="group relative cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    void open(p.id)
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-noir-border bg-noir-panel transition-colors group-hover:border-noir-border-active/30">
                    {p.thumbnailAssetId ? (
                      <img
                        src={thumbUrl(p.thumbnailAssetId)}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-noir-disabled">
                        <Images size={28} strokeWidth={1.25} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
                      <div className="truncate text-xs font-medium">{p.name}</div>
                      <div className="text-2xs text-noir-muted">
                        {INSTAGRAM_FORMATS[p.format].label.split(' ')[0]} · {t.plural('home.photoCount', p.photoCount, { count: p.photoCount })} · {formatRelativeDate(p.lastOpenedAt ?? p.updatedAt)}
                      </div>
                    </div>

                    {/* Menu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuId(menuId === p.id ? null : p.id)
                      }}
                      className="absolute right-1.5 top-1.5 rounded-md bg-black/40 p-1 text-noir-muted opacity-0 backdrop-blur transition-opacity hover:text-noir-text group-hover:opacity-100"
                      aria-label={t('home.projectOptions')}
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {menuId === p.id && (
                      <div
                        className="absolute right-1.5 top-9 z-10 w-36 overflow-hidden rounded-lg border border-noir-border bg-noir-elevated py-1 shadow-bubble"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MenuItem icon={<Copy size={14} />} onClick={() => void duplicate(p.id)}>
                          {t('common.duplicate')}
                        </MenuItem>
                        <MenuItem
                          icon={<Trash2 size={14} />}
                          danger
                          onClick={() => setConfirmId(p.id)}
                        >
                          {t('common.delete')}
                        </MenuItem>
                      </div>
                    )}

                    {confirmId === p.id && (
                      <div
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/85 p-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-xs text-noir-text">{t('home.deleteConfirm', { name: p.name })}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmId(null)}
                            className="rounded-md border border-noir-border px-3 py-1.5 text-xs hover:bg-noir-hover"
                          >
                            {t('common.cancel')}
                          </button>
                          <button
                            onClick={() => void remove(p.id)}
                            className="rounded-md bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  children,
  danger,
  onClick
}: {
  icon: JSX.Element
  children: string
  danger?: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-noir-hover',
        danger ? 'text-red-300' : 'text-noir-text'
      )}
    >
      {icon}
      {children}
    </button>
  )
}
