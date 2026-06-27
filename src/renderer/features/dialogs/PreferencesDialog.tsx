import { useState } from 'react'
import { Palette, FolderCog, SlidersHorizontal, Upload, Save } from 'lucide-react'
import type { UserPreferences } from '@shared/types'
import { INSTAGRAM_FORMATS } from '@shared/constants'
import { FILTERS } from '../../../engine/filters/registry'
import { useUiStore } from '../../stores/uiStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { useT, LANGUAGE_OPTIONS } from '@renderer/i18n'
import { Modal } from '../../components/ui/Modal'
import { Toggle } from '../../components/ui/Toggle'
import { Select } from '../../components/ui/Select'
import { Slider } from '../../components/ui/Slider'
import { cn } from '../../lib/cn'

type TabId = 'appearance' | 'project' | 'editing' | 'export' | 'autosave'

const TAB_META: { id: TabId; icon: JSX.Element }[] = [
  { id: 'appearance', icon: <Palette size={15} /> },
  { id: 'project', icon: <FolderCog size={15} /> },
  { id: 'editing', icon: <SlidersHorizontal size={15} /> },
  { id: 'export', icon: <Upload size={15} /> },
  { id: 'autosave', icon: <Save size={15} /> }
]

export function PreferencesDialog(): JSX.Element | null {
  const t = useT()
  const closeDialog = useUiStore((s) => s.closeDialog)
  const prefs = usePreferencesStore((s) => s.prefs)
  const patch = usePreferencesStore((s) => s.patch)
  const [tab, setTab] = useState<TabId>('appearance')

  if (!prefs) return null

  const setAppearance = (a: Partial<UserPreferences['appearance']>): void => void patch({ appearance: { ...prefs.appearance, ...a } })
  const setProjectDefaults = (a: Partial<UserPreferences['projectDefaults']>): void => void patch({ projectDefaults: { ...prefs.projectDefaults, ...a } })
  const setEditing = (a: Partial<UserPreferences['editingDefaults']>): void => void patch({ editingDefaults: { ...prefs.editingDefaults, ...a } })
  const setExport = (a: Partial<UserPreferences['exportDefaults']>): void => void patch({ exportDefaults: { ...prefs.exportDefaults, ...a } })
  const setAutosave = (a: Partial<UserPreferences['autosave']>): void => void patch({ autosave: { ...prefs.autosave, ...a } })

  return (
    <Modal title={t('preferences.title')} onClose={closeDialog} width={660}>
      <div className="flex min-h-[360px] gap-5">
        {/* Abas verticais à esquerda */}
        <nav className="flex w-40 shrink-0 flex-col gap-0.5 border-r border-noir-border/60 pr-3">
          {TAB_META.map((tm) => (
            <button
              key={tm.id}
              onClick={() => setTab(tm.id)}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition-colors',
                tab === tm.id ? 'bg-noir-selection text-noir-text' : 'text-noir-muted hover:bg-noir-hover hover:text-noir-text'
              )}
            >
              {tm.icon}
              {t(`preferences.tabs.${tm.id}`)}
            </button>
          ))}
        </nav>

        {/* Conteúdo da aba */}
        <div className="min-w-0 flex-1">
          {tab === 'appearance' && (
            <Group>
              <Select
                label={t('preferences.language')}
                value={prefs.appearance.language}
                options={LANGUAGE_OPTIONS}
                onChange={(v) => setAppearance({ language: v })}
              />
              <Select
                label={t('preferences.density')}
                value={prefs.appearance.density}
                options={[{ value: 'comfortable', label: t('preferences.comfortable') }, { value: 'compact', label: t('preferences.compact') }]}
                onChange={(v) => setAppearance({ density: v })}
              />
              <Toggle label={t('preferences.filmstripCollapsed')} checked={prefs.appearance.defaultFilmstripCollapsed} onChange={(v) => setAppearance({ defaultFilmstripCollapsed: v })} />
              <Toggle label={t('preferences.showTooltips')} checked={prefs.appearance.showTooltips} onChange={(v) => setAppearance({ showTooltips: v })} />
              <Toggle label={t('preferences.gridByDefault')} checked={prefs.appearance.showGridByDefault} onChange={(v) => setAppearance({ showGridByDefault: v })} />
              <Toggle label={t('preferences.rulersByDefault')} checked={prefs.appearance.showRulersByDefault} onChange={(v) => setAppearance({ showRulersByDefault: v })} />
              <Toggle label={t('preferences.smartGuidesByDefault')} checked={prefs.appearance.showSmartGuidesByDefault} onChange={(v) => setAppearance({ showSmartGuidesByDefault: v })} />
              <Toggle label={t('preferences.snapByDefault')} checked={prefs.appearance.snapByDefault} onChange={(v) => setAppearance({ snapByDefault: v })} />
              <Toggle label={t('preferences.accordionAdjustments')} checked={prefs.appearance.accordionAdjustments} onChange={(v) => setAppearance({ accordionAdjustments: v })} />
              <div className="pt-1">
                <Slider
                  label={t('preferences.overlayLineThickness')}
                  value={prefs.appearance.overlayLineThickness}
                  min={1}
                  max={6}
                  defaultValue={2}
                  onChange={(v) => setAppearance({ overlayLineThickness: v })}
                />
              </div>
            </Group>
          )}

          {tab === 'project' && (
            <Group>
              <Select
                label={t('preferences.defaultFormat')}
                value={prefs.projectDefaults.defaultFormat}
                options={Object.values(INSTAGRAM_FORMATS).map((s) => ({ value: s.id, label: s.label }))}
                onChange={(v) => setProjectDefaults({ defaultFormat: v })}
              />
              <Toggle label={t('preferences.confirmBeforeFormatChange')} checked={prefs.projectDefaults.confirmBeforeFormatChange} onChange={(v) => setProjectDefaults({ confirmBeforeFormatChange: v })} />
            </Group>
          )}

          {tab === 'editing' && (
            <Group>
              <Toggle label={t('preferences.autoSelectImported')} checked={prefs.editingDefaults.autoSelectImportedPhoto} onChange={(v) => setEditing({ autoSelectImportedPhoto: v })} />
              <Select
                label={t('preferences.defaultFilter')}
                value={prefs.editingDefaults.defaultFilterName ?? 'none'}
                options={[{ value: 'none', label: t('preferences.filterNone') }, ...FILTERS.map((f) => ({ value: f.name, label: t(`filters.items.${f.name}.label`) }))]}
                onChange={(v) => setEditing({ defaultFilterName: v === 'none' ? null : (v as UserPreferences['editingDefaults']['defaultFilterName']) })}
              />
              <Slider label={t('preferences.defaultGrain')} value={prefs.editingDefaults.defaultGrain} min={0} max={100} defaultValue={0} onChange={(v) => setEditing({ defaultGrain: v })} />
              <Slider label={t('preferences.defaultVignette')} value={prefs.editingDefaults.defaultVignette} min={-100} max={100} defaultValue={0} onChange={(v) => setEditing({ defaultVignette: v })} />
            </Group>
          )}

          {tab === 'export' && (
            <Group>
              <Select
                label={t('preferences.exportFormat')}
                value={prefs.exportDefaults.format}
                options={[{ value: 'jpg', label: 'JPG' }, { value: 'png', label: 'PNG' }]}
                onChange={(v) => setExport({ format: v })}
              />
              <Slider label={t('preferences.jpgQuality')} value={prefs.exportDefaults.jpgQuality} min={70} max={100} defaultValue={90} onChange={(v) => setExport({ jpgQuality: v })} />
            </Group>
          )}

          {tab === 'autosave' && (
            <Group>
              <Toggle label={t('preferences.showSaveStatus')} checked={prefs.autosave.showStatus} onChange={(v) => setAutosave({ showStatus: v })} />
              <Toggle label={t('preferences.snapshotBeforeExport')} checked={prefs.autosave.createSnapshotBeforeExport} onChange={(v) => setAutosave({ createSnapshotBeforeExport: v })} />
              <Toggle label={t('preferences.snapshotBeforeFormatChange')} checked={prefs.autosave.createSnapshotBeforeFormatChange} onChange={(v) => setAutosave({ createSnapshotBeforeFormatChange: v })} />
            </Group>
          )}

          <p className="mt-5 text-[10px] text-noir-disabled">{t('preferences.footer')}</p>
        </div>
      </div>
    </Modal>
  )
}

function Group({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="space-y-1">{children}</div>
}
