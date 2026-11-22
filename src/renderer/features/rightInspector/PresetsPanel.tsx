import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Bookmark, Star, Plus, Copy, ClipboardPaste, Download, Upload, FolderPlus, Folder, FolderOpen, Search, MoreHorizontal, Pencil, Trash2, ChevronDown, ChevronRight, ArrowLeft, ArrowRight, Check, Loader2, Eye, X } from 'lucide-react'
import type { OverlayLayerData, PresetFolder, UserPreset } from '@shared/types'
import { linkedPresetFx } from '@shared/photoPresets'
import { useT } from '../../i18n'
import { cn } from '../../lib/cn'
import { ipc } from '../../services/ipcClient'
import { presetActions, presetTarget } from '../../services/presetActions'
import { usePresetLibraryStore } from '../../stores/presetLibraryStore'
import { useEditorStore, selectActiveDumpItem } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { PresetPreview } from './PresetPreview'
import { usePresetHover } from './usePresetHover'

const inputClass = 'w-full rounded-lg border border-noir-border bg-noir-panel px-3 py-2 text-xs text-noir-text outline-none focus:border-noir-border-active'
const toolClass = 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-noir-muted hover:bg-noir-hover hover:text-noir-text disabled:opacity-40'

export function folderPath(folders: PresetFolder[], id: string | null): string {
  const names: string[] = [], visited = new Set<string>()
  let current = folders.find((f) => f.id === id)
  while (current && !visited.has(current.id)) { visited.add(current.id); names.unshift(current.name); current = folders.find((f) => f.id === current!.parentId) }
  return names.join(' / ')
}

export function PresetsPanel(): JSX.Element {
  const t = useT()
  const library = usePresetLibraryStore()
  const editor = useEditorStore()
  const item = selectActiveDumpItem(editor)
  const target = presetTarget()
  const applying = useUiStore((s) => s.applyingPreset || s.formatChanging)
  const saveRequested = useUiStore((s) => s.presetSaveRequested)
  const [working, setWorking] = useState(false)
  const taskPending = useRef(false)
  const busy = working || applying
  const [search, setSearch] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [menu, setMenu] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ preset: UserPreset; target: ReturnType<typeof presetTarget> } | null>(null)
  const [modal, setModal] = useState<'save' | 'folder' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [name, setName] = useState('')
  const [location, setLocation] = useState<string | null>(null)
  const [fxIds, setFxIds] = useState<string[]>([])
  const canApply = !!target && !target.image.locked && !busy
  const selectedFolder = library.folders.find((f) => f.id === library.folderId)
  const selectedPath = new Set<string>()
  for (let folder = selectedFolder; folder && !selectedPath.has(folder.id); folder = library.folders.find((f) => f.id === folder?.parentId)) {
    selectedPath.add(folder.id)
  }
  const query = search.trim().toLocaleLowerCase()
  const showTree = !favoritesOnly && !query
  const favoritesCount = library.presets.filter((preset) => preset.favorite).length
  const isOpen = (id: string): boolean => expanded.has(id) || selectedPath.has(id)
  const results = library.presets.filter((preset) =>
    (!favoritesOnly || preset.favorite) &&
    (!query || `${preset.name} ${folderPath(library.folders, preset.folderId)}`.toLocaleLowerCase().includes(query)))
  const setHovered = usePresetHover(item ?? undefined, target?.image,
    !busy && !preview && !modal && !menu && !!target && editor.ui?.selectedLayerId === target.image.id)
  const active = library.presets.find((p) => p.id === library.activeId)

  useEffect(() => { void library.load().catch(console.error) }, [])

  const task = async (action: () => Promise<unknown>, errorKey = 'presetLibrary.failed'): Promise<void> => {
    if (busy || taskPending.current) return
    taskPending.current = true
    setWorking(true)
    try { await action() }
    catch (error) { console.error('[presets]', error); useUiStore.getState().pushToast('error', t(errorKey)) }
    finally { taskPending.current = false; setWorking(false) }
  }
  const importJson = (clipboard = false): void => { void task(() => presetActions.importJson(library.folderId, clipboard), 'presetLibrary.invalidJson') }
  const exportJson = (presetId?: string): void => { void task(() => presetActions.exportJson(presetId ? { presetId } : { folderId: library.folderId })) }
  const toggleFavorite = (preset: UserPreset): void => { void task(async () => {
    await ipc('presets:favorite', { id: preset.id, favorite: !preset.favorite })
    await library.load()
  }) }
  const openSave = (): void => {
    if (!target) return
    setName(t('presetLibrary.newPreset')); setLocation(library.folderId); setEditingId(undefined)
    setFavorite(false)
    const selectedIds = new Set(editor.ui?.selectedLayerIds ?? [])
    setFxIds([...new Set([...linkedPresetFx(target.item, target.image.id).filter((fx) => fx.visible).map((fx) => fx.id),
      ...target.item.layers.filter((fx) => fx.type === 'overlay' && selectedIds.has(fx.id) && !(fx.data as OverlayLayerData).imageLayerId).map((fx) => fx.id)])])
    setModal('save')
  }
  useEffect(() => {
    if (!saveRequested) return
    useUiStore.getState().setPresetSaveRequested(false)
    if (target && !target.image.locked) openSave()
  }, [saveRequested])
  const editPreset = (preset: UserPreset): void => { setName(preset.name); setLocation(preset.folderId); setEditingId(preset.id); setModal('edit'); setMenu(null) }
  const editFolder = (folder?: PresetFolder): void => { setName(folder?.name ?? ''); setLocation(folder ? folder.parentId : library.folderId); setEditingId(folder?.id); setModal('folder') }
  const remove = (preset?: UserPreset): void => {
    const folder = selectedFolder
    if (!preset && !folder) return
    useUiStore.getState().requestConfirm({ title: t(preset ? 'presetLibrary.deletePreset' : 'presetLibrary.deleteFolder'),
      message: preset ? t('presetLibrary.deletePresetConfirm', { name: preset.name }) : t('presetLibrary.deleteFolderConfirm', { name: folder!.name }),
      danger: true, confirmLabel: t('common.delete'), onConfirm: () => { void task(async () => {
        if (preset) await ipc('presets:delete', { id: preset.id })
        else await ipc('presets:deleteFolder', { id: folder!.id })
        setMenu(null); await library.load()
      }) }
    })
  }
  const submit = (event: FormEvent): void => {
    event.preventDefault()
    if (!name.trim() || busy) return
    if (modal === 'save') { void presetActions.save(name.trim(), location, fxIds, favorite).then((saved) => { if (saved) setModal(null) }); return }
    void task(async () => {
      if (modal === 'folder') {
        const id = await ipc('presets:saveFolder', { id: editingId, name: name.trim(), parentId: location })
        await library.load()
        setExpanded((previous) => new Set(previous).add(id))
        library.setFolder(id)
        setFavoritesOnly(false)
        setSearch('')
      } else if (editingId) {
        await ipc('presets:update', { id: editingId, name: name.trim(), folderId: location }); await library.load()
      }
      setModal(null)
    })
  }
  const apply = (preset: UserPreset): void => {
    if (!canApply) return
    setHovered(null)
    setMenu(null)
    void presetActions.apply(preset.look, preset.id)
  }
  const openPreview = (preset: UserPreset): void => {
    const layer = item?.layers.find((layer) => layer.id === editor.ui?.selectedLayerId)
    const hasSelectedPhoto = layer?.type === 'image' || (
      layer?.type === 'overlay' && (layer.data as OverlayLayerData).imageLayerId === target?.image.id
    )
    setHovered(null)
    setMenu(null)
    setPreview({ preset, target: hasSelectedPhoto ? target : null })
  }
  const applyPreview = async (): Promise<void> => {
    if (!preview?.target) return
    const { preset, target } = preview
    const applied = await presetActions.apply(preset.look, preset.id, { itemId: target.item.id, layerId: target.image.id })
    if (applied) setPreview(null)
  }
  function toggleFolder(folder: PresetFolder): void {
    const close = isOpen(folder.id)
    setHovered(null)
    setMenu(null)
    setExpanded((previous) => {
      const next = new Set(previous)
      if (close) next.delete(folder.id)
      else next.add(folder.id)
      return next
    })
    if (close) {
      if (selectedPath.has(folder.id)) library.setFolder(folder.parentId)
    } else {
      library.setFolder(folder.id)
    }
  }

  function chooseView(favorites: boolean): void {
    setHovered(null)
    setMenu(null)
    setFavoritesOnly(favorites)
    setSearch('')
    library.setFolder(null)
  }

  const presetsByFolder = new Map<string | null, UserPreset[]>()
  const foldersByParent = new Map<string | null, PresetFolder[]>()
  for (const preset of library.presets) {
    const group = presetsByFolder.get(preset.folderId) ?? []
    group.push(preset)
    presetsByFolder.set(preset.folderId, group)
  }
  for (const folder of library.folders) {
    const group = foldersByParent.get(folder.parentId) ?? []
    group.push(folder)
    foldersByParent.set(folder.parentId, group)
  }
  function expandedPresets(parentId: string | null): UserPreset[] {
    return [
      ...(foldersByParent.get(parentId) ?? []).flatMap((folder) => isOpen(folder.id) ? expandedPresets(folder.id) : []),
      ...(presetsByFolder.get(parentId) ?? [])
    ]
  }
  const navigablePresets = showTree ? expandedPresets(null) : results
  const activeIndex = navigablePresets.findIndex((preset) => preset.id === library.activeId)

  function presetRow(preset: UserPreset, depth: number): JSX.Element {
    const isActive = library.activeId === preset.id
    const path = !showTree && folderPath(library.folders, preset.folderId)
    return (
      <div key={preset.id} data-testid="preset-row"
        className={cn('group/row border-l-2 border-transparent', isActive && 'border-brand-accent bg-noir-selection')}
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(preset) }}
        onPointerLeave={() => setHovered(null)}
      >
        <div className="flex min-h-9 items-center gap-0.5 pr-1.5 transition-colors group-hover/row:bg-noir-hover" style={{ paddingLeft: 8 + Math.min(depth, 4) * 8 }}>
          <button type="button" disabled={busy} onClick={() => openPreview(preset)} title={preset.name}
            className={cn('min-w-0 flex-1 self-stretch py-1.5 text-left text-xs hover:text-brand-accent', isActive && 'font-semibold text-brand-accent')}>
            <span className="block truncate">{preset.name}</span>
            {path && <span className="block truncate text-[10px] font-normal text-noir-muted">{path}</span>}
          </button>
          <button type="button" aria-label={t('presetPreview.open', { name: preset.name })} title={t('presetPreview.title')} disabled={busy} onClick={() => openPreview(preset)} className={toolClass}><Eye size={14} /></button>
          <button type="button" aria-label={t('presetLibrary.applyNamed', { name: preset.name })} title={t('presetLibrary.applyNamed', { name: preset.name })} disabled={!canApply} onClick={() => apply(preset)} className={toolClass}><Check size={14} /></button>
          <button type="button" aria-label={t(preset.favorite ? 'presetLibrary.removeFavorite' : 'presetLibrary.addFavorite', { name: preset.name })} aria-pressed={preset.favorite}
            disabled={busy} onClick={() => toggleFavorite(preset)} className={cn(toolClass, preset.favorite && 'text-brand-accent')}><Star size={13} fill={preset.favorite ? 'currentColor' : 'none'} /></button>
          <button type="button" aria-label={t('presetLibrary.actions', { name: preset.name })} aria-expanded={menu === preset.id}
            disabled={busy} onClick={() => { setHovered(null); setMenu(menu === preset.id ? null : preset.id) }} className={toolClass}><MoreHorizontal size={15} /></button>
        </div>
        {menu === preset.id && (
          <div className="grid grid-cols-2 gap-1 border-t border-noir-border/60 px-2 py-2">
            <Button size="sm" variant="subtle" icon={<Pencil size={11} />} disabled={busy} onClick={() => editPreset(preset)}>{t('presetLibrary.edit')}</Button>
            <Button size="sm" variant="subtle" icon={<Copy size={11} />} disabled={busy} onClick={() => void presetActions.copy(preset.name, preset.look)}>{t('presetLibrary.copy')}</Button>
            <Button size="sm" variant="subtle" icon={<Download size={11} />} disabled={busy} onClick={() => exportJson(preset.id)}>{t('presetPreview.exportOne')}</Button>
            <Button size="sm" variant="danger" icon={<Trash2 size={11} />} disabled={busy} onClick={() => remove(preset)}>{t('common.delete')}</Button>
          </div>
        )}
      </div>
    )
  }

  function folderRows(parentId: string | null, depth = 0): JSX.Element[] {
    return (foldersByParent.get(parentId) ?? []).map((folder) => {
      const open = isOpen(folder.id)
      const children = presetsByFolder.get(folder.id) ?? []
      const subfolders = foldersByParent.get(folder.id) ?? []
      const selected = library.folderId === folder.id
      return (
        <section key={folder.id} className="border-t border-noir-border/65 first:border-t-0">
          <button type="button" aria-expanded={open} aria-current={selected ? 'true' : undefined} title={folderPath(library.folders, folder.id)}
            onClick={() => toggleFolder(folder)}
            className={cn('flex min-h-9 w-full items-center gap-2 pr-3 text-left text-xs font-medium hover:bg-noir-hover', selected && 'bg-noir-selection text-brand-accent')}
            style={{ paddingLeft: 10 + Math.min(depth, 4) * 8 }}>
            {open ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />}
            {open ? <FolderOpen size={14} className="shrink-0" /> : <Folder size={14} className="shrink-0" />}
            <span className="min-w-0 flex-1 truncate">{folder.name}</span>
            {children.length > 0 && <span className="text-2xs tabular-nums text-noir-muted">{children.length}</span>}
          </button>
          {open && <>
            {folderRows(folder.id, depth + 1)}
            {children.map((preset) => presetRow(preset, depth + 1))}
            {children.length === 0 && subfolders.length === 0 && <p className="px-5 py-2 text-2xs text-noir-muted">{t('presetLibrary.emptyFolder')}</p>}
          </>}
        </section>
      )
    })
  }
  const folderOptions = library.folders.filter((folder) => {
    if (modal !== 'folder' || !editingId) return true
    let current: PresetFolder | undefined = folder
    while (current) { if (current.id === editingId) return false; current = library.folders.find((f) => f.id === current!.parentId) }
    return true
  }).sort((a, b) => folderPath(library.folders, a.id).localeCompare(folderPath(library.folders, b.id)))
  const availableFx = target?.item.layers.filter((fx) => fx.type === 'overlay' && (!(fx.data as OverlayLayerData).imageLayerId || (fx.data as OverlayLayerData).imageLayerId === target.image.id)) ?? []

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="preset-panel">
      <div className="shrink-0 border-b border-noir-border bg-noir-panel">
        <div className="space-y-2.5 px-3 pb-2.5 pt-3">
          <label className="flex items-center gap-2 text-xs text-noir-muted">
            <span>{t('presetLibrary.target')}</span>
            <select aria-label={t('presetLibrary.target')} value={target?.image.id ?? ''} onChange={(e) => editor.selectLayer(e.target.value || null)}
              disabled={busy || !item} className={cn(inputClass, 'min-w-0 flex-1 py-1.5')}>
              <option value="" disabled>{t('presetLibrary.selectPhoto')}</option>
              {item?.layers.filter((layer) => layer.type === 'image').map((layer) => (
                <option key={layer.id} value={layer.id}>{layer.name}{layer.locked ? ` · ${t('presetLibrary.locked')}` : ''}</option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-1.5">
            <Button variant="primary" size="sm" className="min-w-0 flex-1 px-2" icon={<Plus size={14} />} disabled={!canApply} onClick={openSave}>
              {t('presetLibrary.saveLook')}
            </Button>
            <button type="button" aria-label={t('presetLibrary.newFolder')} title={t('presetLibrary.newFolder')} disabled={busy} onClick={() => editFolder()} className={toolClass}>
              <FolderPlus size={15} />
            </button>
            <button type="button" aria-label={t('presetLibrary.copy')} title={`${t('presetLibrary.copy')} (Ctrl+Shift+C)`} disabled={!target || busy}
              onClick={() => void presetActions.copyCurrent()} className={toolClass}>
              <Copy size={14} /><span className="sr-only">{t('presetLibrary.copy')}</span>
            </button>
            <button type="button" aria-label={t('presetLibrary.paste')} title={`${t('presetLibrary.paste')} (Ctrl+Shift+V)`} disabled={!canApply}
              onClick={() => void presetActions.paste()} className={toolClass}>
              <ClipboardPaste size={14} /><span className="sr-only">{t('presetLibrary.paste')}</span>
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="pointer-events-none absolute left-2.5 top-2.5 text-noir-muted" />
            <input aria-label={t('presetLibrary.search')} placeholder={t('presetLibrary.search')} value={search}
              onChange={(e) => { setHovered(null); setSearch(e.target.value) }} className={cn(inputClass, 'pl-8 pr-8')} />
            {search && <button type="button" aria-label={t('presetLibrary.clearSearch')} title={t('presetLibrary.clearSearch')} onClick={() => setSearch('')} className={cn(toolClass, 'absolute right-1 top-1')}><X size={13} /></button>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 px-2" role="group" aria-label={t('presetLibrary.library')}>
          <button type="button" aria-pressed={!favoritesOnly} onClick={() => chooseView(false)}
            className={cn('flex h-9 items-center justify-center gap-1.5 border-b-2 border-transparent text-xs hover:text-noir-text', !favoritesOnly ? 'border-brand-accent font-semibold text-brand-accent' : 'text-noir-muted')}>
            <Bookmark size={13} />{t('presetLibrary.collection')}<span className="text-2xs tabular-nums opacity-80">{library.presets.length}</span>
          </button>
          <button type="button" aria-pressed={favoritesOnly} onClick={() => chooseView(!favoritesOnly)}
            className={cn('flex h-9 items-center justify-center gap-1.5 border-b-2 border-transparent text-xs hover:text-noir-text', favoritesOnly ? 'border-brand-accent font-semibold text-brand-accent' : 'text-noir-muted')}>
            {t('presetLibrary.favorites')}<Star size={13} fill={favoritesOnly ? 'currentColor' : 'none'} /><span className="text-2xs tabular-nums opacity-80">{favoritesCount}</span>
          </button>
        </div>
      </div>

      <div className="min-h-24 flex-1 overflow-y-auto" data-testid="preset-list" aria-busy={library.loading}>
        {library.loading && <div className="flex justify-end px-3 py-2 text-noir-muted"><Loader2 size={13} className="animate-spin" /></div>}
        {library.error && (
          <div className="m-3 rounded-lg border border-noir-danger/30 p-3 text-xs text-noir-danger">
            <p>{t('presetLibrary.failed')}</p>
            <button className="mt-2 underline" onClick={() => void library.load().catch(console.error)}>{t('presetLibrary.retry')}</button>
          </div>
        )}
        {!library.loading && !library.error && results.length === 0 && (!showTree || library.folders.length === 0) && (
          <div className="mx-3 my-4 rounded-lg border border-dashed border-noir-border px-3 py-5 text-center">
            <Bookmark size={20} className="mx-auto mb-2 text-noir-muted" />
            <p className="text-xs font-medium">{t(query ? 'presetLibrary.noResults' : favoritesOnly ? 'presetLibrary.favoritesEmpty' : 'presetLibrary.empty')}</p>
            <p className="mt-1.5 text-2xs leading-relaxed text-noir-muted">{t(query ? 'presetLibrary.trySearch' : favoritesOnly ? 'presetLibrary.favoritesHint' : 'presetLibrary.emptyHint')}</p>
          </div>
        )}
        {showTree ? (
          <>
            {folderRows(null)}
            {(presetsByFolder.get(null)?.length ?? 0) > 0 && (
              <section className="border-t border-noir-border/65 first:border-t-0">
                <h3 className="px-3 pb-1 pt-2.5 text-2xs font-semibold text-noir-muted">{t('presetLibrary.ungrouped')}</h3>
                {presetsByFolder.get(null)?.map((preset) => presetRow(preset, 0))}
              </section>
            )}
          </>
        ) : (
          <>
            {query && <h3 className="px-3 pb-1 pt-2.5 text-2xs font-semibold text-noir-muted">{t('presetLibrary.results')} · {results.length}</h3>}
            {results.map((preset) => presetRow(preset, 0))}
          </>
        )}
      </div>

      <div className="shrink-0 space-y-2 border-t border-noir-border bg-noir-panel px-2.5 py-2">
        <div className="flex min-h-6 items-center gap-1">
          <span className="min-w-0 flex-1 truncate px-1 text-2xs text-noir-muted" title={selectedFolder ? folderPath(library.folders, selectedFolder.id) : t('presetPreview.exportLibrary')}>
            {selectedFolder ? folderPath(library.folders, selectedFolder.id) : t('presetLibrary.collection')}
          </span>
          {selectedFolder && <>
            <button type="button" title={t('presetLibrary.editFolder')} aria-label={t('presetLibrary.editFolder')} disabled={busy} onClick={() => editFolder(selectedFolder)} className={toolClass}><Pencil size={12} /></button>
            <button type="button" title={t('presetLibrary.deleteFolder')} aria-label={t('presetLibrary.deleteFolder')} disabled={busy} onClick={() => remove()} className={cn(toolClass, 'hover:text-noir-danger')}><Trash2 size={12} /></button>
          </>}
          {navigablePresets.length > 0 && <>
            <button type="button" aria-label={t('presetLibrary.previous')} title={t('presetLibrary.previous')} disabled={busy || activeIndex <= 0}
              onClick={() => openPreview(navigablePresets[activeIndex - 1])} className={toolClass}><ArrowLeft size={14} /></button>
            <button type="button" aria-label={t('presetLibrary.next')} title={t('presetLibrary.next')} disabled={busy || activeIndex >= navigablePresets.length - 1}
              onClick={() => openPreview(navigablePresets[activeIndex + 1])} className={toolClass}><ArrowRight size={14} /></button>
          </>}
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" className="min-w-0 flex-1 px-1.5" icon={<Upload size={12} />} disabled={busy} onClick={() => importJson()}>{t('presetLibrary.import')}</Button>
          <Button size="sm" className="min-w-0 flex-1 px-1.5" icon={<Download size={12} />} title={t(selectedFolder ? 'presetPreview.exportFolder' : 'presetPreview.exportLibrary')}
            disabled={busy || library.presets.length + library.folders.length === 0} onClick={() => exportJson()}>{t('presetLibrary.export')}</Button>
          <button type="button" disabled={busy} aria-label={t('presetLibrary.importClipboard')} title={t('presetLibrary.importClipboard')} onClick={() => importJson(true)} className={toolClass}>
            <ClipboardPaste size={14} /><span className="sr-only">{t('presetLibrary.importClipboard')}</span>
          </button>
        </div>
      </div>
    {preview && <PresetPreview preset={preview.preset} target={preview.target} busy={busy} onApply={applyPreview} onClose={() => setPreview(null)} />}
    {modal && <div onKeyDown={(event) => { event.stopPropagation(); if (event.key === 'Escape' && !busy) setModal(null) }}>
      <Modal width={480} title={t(modal === 'save' ? 'presetLibrary.saveLook' : modal === 'edit' ? 'presetLibrary.edit' : editingId ? 'presetLibrary.editFolder' : 'presetLibrary.newFolder')} onClose={() => { if (!busy) setModal(null) }}>
        <form onSubmit={submit} className="space-y-4" data-testid="preset-form">
          <label className="block text-xs text-noir-muted">{t('presetLibrary.name')}<input autoFocus required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className={cn(inputClass, 'mt-1.5')} /></label>
          <label className="block text-xs text-noir-muted">{t('presetLibrary.folder')}<select aria-label={t('presetLibrary.folder')} value={location ?? ''} onChange={(e) => setLocation(e.target.value || null)} className={cn(inputClass, 'mt-1.5')}><option value="">{t('presetLibrary.root')}</option>{folderOptions.map((folder) => <option key={folder.id} value={folder.id}>{folderPath(library.folders, folder.id)}</option>)}</select></label>
          {modal === 'save' && <label className="flex items-center gap-2 text-xs text-noir-text"><input type="checkbox" checked={favorite} onChange={(event) => setFavorite(event.target.checked)} className="accent-[rgb(var(--brand-accent-rgb))]" /><Star size={14} />{t('presetLibrary.saveFavorite')}</label>}
          {modal === 'save' && <><div className="rounded-lg bg-noir-selection p-3 text-xs leading-relaxed text-noir-text">{t('presetLibrary.includes')}</div><div><p className="mb-1.5 text-xs font-medium">{t('presetLibrary.includeFx')}</p><p className="mb-3 text-2xs leading-relaxed text-noir-muted">{t('presetLibrary.fxHint')}</p><div className="max-h-40 space-y-1 overflow-y-auto">{availableFx.length === 0 ? <p className="text-2xs text-noir-disabled">{t('presetLibrary.noFx')}</p> : availableFx.map((fx) => <label key={fx.id} className="flex items-center gap-2 rounded-md bg-noir-panel px-2 py-2 text-xs"><input type="checkbox" checked={fxIds.includes(fx.id)} onChange={(e) => setFxIds((ids) => e.target.checked ? [...ids, fx.id] : ids.filter((id) => id !== fx.id))} className="accent-[rgb(var(--brand-accent-rgb))]" /><span className="truncate">{fx.name}</span></label>)}</div></div></>}
          <div className="flex justify-end gap-2 border-t border-noir-border pt-4"><Button type="button" size="sm" disabled={busy} onClick={() => setModal(null)}>{t('common.cancel')}</Button><Button type="submit" size="sm" variant="primary" disabled={busy || !name.trim()} icon={busy ? <Loader2 size={13} className="animate-spin" /> : undefined}>{t('common.save')}</Button></div>
        </form>
      </Modal>
    </div>}
    </div>
  )
}
