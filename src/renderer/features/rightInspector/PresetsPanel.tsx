import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Bookmark, Star, Plus, Copy, ClipboardPaste, Download, Upload, FolderPlus, Folder, FolderOpen, Search, MoreHorizontal, Pencil, Trash2, ChevronDown, ChevronRight, ArrowLeft, ArrowRight, SlidersHorizontal, Check, Loader2 } from 'lucide-react'
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

const inputClass = 'w-full rounded-lg border border-noir-border bg-noir-panel px-3 py-2 text-xs text-noir-text outline-none focus:border-noir-border-active'

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
  const applying = useUiStore((s) => s.applyingPreset)
  const saveRequested = useUiStore((s) => s.presetSaveRequested)
  const [working, setWorking] = useState(false)
  const taskPending = useRef(false)
  const busy = working || applying
  const [search, setSearch] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [foldersOpen, setFoldersOpen] = useState(false)
  const [menu, setMenu] = useState<string | null>(null)
  const [modal, setModal] = useState<'save' | 'folder' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [name, setName] = useState('')
  const [location, setLocation] = useState<string | null>(null)
  const [fxIds, setFxIds] = useState<string[]>([])
  const canApply = !!target && !target.image.locked && !busy
  const selectedFolder = library.folders.find((f) => f.id === library.folderId)
  const query = search.trim().toLocaleLowerCase()
  const visible = library.presets.filter((p) => (!favoritesOnly || p.favorite) && (query
    ? `${p.name} ${folderPath(library.folders, p.folderId)}`.toLocaleLowerCase().includes(query)
    : library.folderId === null || p.folderId === library.folderId))
  const activeIndex = visible.findIndex((p) => p.id === library.activeId)
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
        await library.load(); library.setFolder(id); setFoldersOpen(true)
      } else if (editingId) {
        await ipc('presets:update', { id: editingId, name: name.trim(), folderId: location }); await library.load()
      }
      setModal(null)
    })
  }
  const apply = (preset: UserPreset): void => { if (canApply) { setMenu(null); void presetActions.apply(preset.look, preset.id) } }
  const folderRows = (parentId: string | null, depth = 0): JSX.Element[] => library.folders.filter((f) => f.parentId === parentId).flatMap((folder) => {
    const children = library.folders.some((f) => f.parentId === folder.id)
    const isClosed = collapsed.has(folder.id), isSelected = library.folderId === folder.id
    return [<div key={folder.id} className="flex items-center" style={{ paddingLeft: depth * 12 }}>
      <button type="button" aria-label={folder.name} aria-expanded={children ? !isClosed : undefined} className="flex h-7 w-5 shrink-0 items-center justify-center text-noir-muted" onClick={() => setCollapsed((previous) => { const next = new Set(previous); if (next.has(folder.id)) next.delete(folder.id); else next.add(folder.id); return next })}>
        {children ? isClosed ? <ChevronRight size={11} /> : <ChevronDown size={11} /> : <span className="w-2" />}
      </button>
      <button type="button" onClick={() => { library.setFolder(folder.id); setSearch('') }} title={folderPath(library.folders, folder.id)} className={cn('flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs', isSelected ? 'bg-noir-selection text-brand-accent' : 'text-noir-muted hover:bg-noir-hover hover:text-noir-text')}>
        {isSelected ? <FolderOpen size={14} className="shrink-0" /> : <Folder size={14} className="shrink-0" />}<span className="truncate">{folder.name}</span>
      </button>
    </div>, ...(!isClosed ? folderRows(folder.id, depth + 1) : [])]
  })
  const folderOptions = library.folders.filter((folder) => {
    if (modal !== 'folder' || !editingId) return true
    let current: PresetFolder | undefined = folder
    while (current) { if (current.id === editingId) return false; current = library.folders.find((f) => f.id === current!.parentId) }
    return true
  }).sort((a, b) => folderPath(library.folders, a.id).localeCompare(folderPath(library.folders, b.id)))
  const availableFx = target?.item.layers.filter((fx) => fx.type === 'overlay' && (!(fx.data as OverlayLayerData).imageLayerId || (fx.data as OverlayLayerData).imageLayerId === target.image.id)) ?? []

  return <div className="flex h-full min-h-0 flex-col overflow-y-auto" data-testid="preset-panel">
    <div className="shrink-0 space-y-2 border-b border-noir-border px-3 py-3">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-accent"><Bookmark size={13} />{t('presetLibrary.yourLibrary')}</div>
      <label className="flex items-center gap-2 text-2xs text-noir-muted"><span>{t('presetLibrary.target')}</span>
        <select aria-label={t('presetLibrary.target')} value={target?.image.id ?? ''} onChange={(e) => editor.selectLayer(e.target.value || null)} disabled={busy || !item} className={cn(inputClass, 'min-w-0 flex-1')}>
          <option value="" disabled>{t('presetLibrary.selectPhoto')}</option>
          {item?.layers.filter((l) => l.type === 'image').map((l) => <option key={l.id} value={l.id}>{l.name}{l.locked ? ` · ${t('presetLibrary.locked')}` : ''}</option>)}
        </select>
      </label>
      <Button variant="primary" size="sm" className="w-full" icon={<Plus size={14} />} disabled={!canApply} onClick={openSave}>{t('presetLibrary.saveLook')}</Button>
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" icon={<Copy size={13} />} disabled={!target || busy} title="Ctrl+Shift+C" onClick={() => void presetActions.copyCurrent()}>{t('presetLibrary.copy')}</Button>
        <Button size="sm" icon={<ClipboardPaste size={13} />} disabled={!canApply} title="Ctrl+Shift+V" onClick={() => void presetActions.paste()}>{t('presetLibrary.paste')}</Button>
      </div>
    </div>
    <div className="shrink-0 space-y-2 border-b border-noir-border px-3 py-3">
      <div className="relative"><Search size={13} className="pointer-events-none absolute left-2.5 top-2.5 text-noir-muted" /><input aria-label={t('presetLibrary.search')} placeholder={t('presetLibrary.search')} value={search} onChange={(e) => setSearch(e.target.value)} className={cn(inputClass, 'pl-8')} /></div>
      <button type="button" aria-pressed={favoritesOnly} onClick={() => { setFavoritesOnly(!favoritesOnly); library.setFolder(null); setSearch('') }} className={cn('flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs', favoritesOnly ? 'bg-noir-selection text-brand-accent' : 'text-noir-muted hover:bg-noir-hover')}><Star size={14} fill={favoritesOnly ? 'currentColor' : 'none'} /><span>{t('presetLibrary.favorites')}</span><span className="ml-auto text-2xs">{library.presets.filter((preset) => preset.favorite).length}</span></button>
      <div className="flex items-center justify-between text-2xs text-noir-muted"><button aria-expanded={foldersOpen} onClick={() => setFoldersOpen(!foldersOpen)} className="flex items-center gap-1.5 rounded py-1 hover:text-noir-text">{foldersOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}{t('presetLibrary.folders')}<span className="text-noir-disabled">{library.folders.length}</span></button><button aria-label={t('presetLibrary.newFolder')} title={t('presetLibrary.newFolder')} disabled={busy} onClick={() => editFolder()} className="rounded p-1 hover:bg-noir-hover hover:text-noir-text"><FolderPlus size={15} /></button></div>
      <div className="max-h-28 overflow-auto">
        <button onClick={() => { library.setFolder(null); setSearch(''); setFavoritesOnly(false) }} className={cn('mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs', library.folderId === null && !favoritesOnly ? 'bg-noir-selection text-brand-accent' : 'text-noir-muted hover:bg-noir-hover')}><Bookmark size={14} /><span>{t('presetLibrary.all')}</span><span className="ml-auto text-2xs">{library.presets.length}</span></button>
        {foldersOpen && folderRows(null)}
      </div>
      {selectedFolder && <div className="flex min-w-0 items-center gap-1 border-t border-noir-border/60 pt-2"><span className="min-w-0 flex-1 truncate text-2xs text-noir-muted" title={folderPath(library.folders, selectedFolder.id)}>{folderPath(library.folders, selectedFolder.id)}</span><button title={t('presetLibrary.editFolder')} aria-label={t('presetLibrary.editFolder')} disabled={busy} onClick={() => editFolder(selectedFolder)} className="rounded p-1 text-noir-muted hover:bg-noir-hover"><Pencil size={12} /></button><button title={t('presetLibrary.deleteFolder')} aria-label={t('presetLibrary.deleteFolder')} disabled={busy} onClick={() => remove()} className="rounded p-1 text-noir-danger hover:bg-noir-hover"><Trash2 size={12} /></button></div>}
      <div className="grid grid-cols-2 gap-2"><Button size="sm" icon={<Upload size={12} />} disabled={busy} onClick={() => importJson()}>{t('presetLibrary.import')}</Button><Button size="sm" icon={<Download size={12} />} disabled={busy || library.presets.length + library.folders.length === 0} onClick={() => exportJson()}>{t('presetLibrary.export')}</Button></div>
      <button disabled={busy} onClick={() => importJson(true)} className="w-full text-center text-2xs text-noir-muted underline decoration-noir-border underline-offset-4 hover:text-noir-text">{t('presetLibrary.importClipboard')}</button>
    </div>
    <div className="min-h-24 flex-1 space-y-2 overflow-y-auto px-3 py-3" data-testid="preset-list">
      <div className="flex items-center justify-between px-1 text-2xs text-noir-muted"><span>{query ? t('presetLibrary.results') : selectedFolder?.name ?? t('presetLibrary.all')}</span>{library.loading ? <Loader2 size={12} className="animate-spin" /> : <span>{visible.length}</span>}</div>
      {library.error && <div className="rounded-lg border border-noir-danger/30 p-3 text-xs text-noir-danger"><p>{t('presetLibrary.failed')}</p><button className="mt-2 underline" onClick={() => void library.load().catch(console.error)}>{t('presetLibrary.retry')}</button></div>}
      {!library.loading && !library.error && visible.length === 0 && <div className="rounded-xl border border-dashed border-noir-border px-4 py-6 text-center"><Bookmark size={24} className="mx-auto mb-3 text-noir-disabled" /><p className="text-xs font-medium">{t(query ? 'presetLibrary.noResults' : favoritesOnly ? 'presetLibrary.favoritesEmpty' : 'presetLibrary.empty')}</p><p className="mt-2 text-2xs leading-relaxed text-noir-muted">{t(query ? 'presetLibrary.trySearch' : favoritesOnly ? 'presetLibrary.favoritesHint' : 'presetLibrary.emptyHint')}</p></div>}
      {visible.map((preset) => <div key={preset.id} className={cn('overflow-hidden rounded-xl border', library.activeId === preset.id ? 'border-noir-border-active/60 bg-noir-selection' : 'border-noir-border bg-noir-panel')}>
        <div className="flex items-stretch">
          <button disabled={!canApply} onClick={() => apply(preset)} aria-label={t('presetLibrary.applyNamed', { name: preset.name })} className="flex min-w-0 flex-1 items-center gap-2.5 p-2.5 text-left disabled:cursor-default">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-noir-hover text-brand-accent">{library.activeId === preset.id ? <Check size={17} /> : <SlidersHorizontal size={17} />}</span>
            <span className="min-w-0"><span className="block truncate text-xs font-medium" title={preset.name}>{preset.name}</span><span className="mt-1 block truncate text-[10px] text-noir-muted">{folderPath(library.folders, preset.folderId) || t('presetLibrary.root')}{preset.look.fx.length > 0 ? ` · ${preset.look.fx.length} FX` : ''}</span></span>
          </button>
          <button type="button" aria-label={t(preset.favorite ? 'presetLibrary.removeFavorite' : 'presetLibrary.addFavorite', { name: preset.name })} aria-pressed={preset.favorite} disabled={busy} onClick={() => toggleFavorite(preset)} className={cn('shrink-0 px-2 hover:bg-noir-hover', preset.favorite ? 'text-brand-accent' : 'text-noir-muted')}><Star size={14} fill={preset.favorite ? 'currentColor' : 'none'} /></button>
          <button aria-label={t('presetLibrary.actions', { name: preset.name })} aria-expanded={menu === preset.id} disabled={busy} onClick={() => setMenu(menu === preset.id ? null : preset.id)} className="shrink-0 px-2 text-noir-muted hover:bg-noir-hover"><MoreHorizontal size={16} /></button>
        </div>
        {menu === preset.id && <div className="grid grid-cols-2 gap-1 border-t border-noir-border/60 px-2 py-2">
          <Button size="sm" variant="subtle" icon={<Pencil size={11} />} disabled={busy} onClick={() => editPreset(preset)}>{t('presetLibrary.edit')}</Button>
          <Button size="sm" variant="subtle" icon={<Copy size={11} />} disabled={busy} onClick={() => void presetActions.copy(preset.name, preset.look)}>{t('presetLibrary.copy')}</Button>
          <Button size="sm" variant="subtle" icon={<Download size={11} />} disabled={busy} onClick={() => exportJson(preset.id)}>JSON</Button>
          <Button size="sm" variant="danger" icon={<Trash2 size={11} />} disabled={busy} onClick={() => remove(preset)}>{t('common.delete')}</Button>
        </div>}
      </div>)}
      {visible.length > 0 && <div className="flex items-center gap-2 pt-2"><Button size="sm" aria-label={t('presetLibrary.previous')} title={t('presetLibrary.previous')} disabled={!canApply || activeIndex <= 0} onClick={() => apply(visible[activeIndex - 1])}><ArrowLeft size={13} /></Button><span className="min-w-0 flex-1 truncate text-center text-[10px] text-noir-muted" title={active?.name}>{active?.name ?? t('presetLibrary.oneClick')}</span><Button size="sm" aria-label={t('presetLibrary.next')} title={t('presetLibrary.next')} disabled={!canApply || activeIndex >= visible.length - 1} onClick={() => apply(visible[activeIndex + 1])}><ArrowRight size={13} /></Button></div>}
      <p className="px-1 pt-2 text-[10px] leading-relaxed text-noir-muted">{t(!target ? 'presetLibrary.selectHint' : target.image.locked ? 'presetLibrary.lockedHint' : 'presetLibrary.preserveHint')}</p>
    </div>
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
}
