import { useUiStore } from '../../stores/uiStore'
import { ExportDialog } from './ExportDialog'
import { PreferencesDialog } from './PreferencesDialog'
import { SnapshotsDialog } from './SnapshotsDialog'
import { PreviewOverlay } from './PreviewOverlay'

export function DialogHost(): JSX.Element | null {
  const dialog = useUiStore((s) => s.activeDialog)
  if (dialog === 'export') return <ExportDialog />
  if (dialog === 'preferences') return <PreferencesDialog />
  if (dialog === 'snapshots') return <SnapshotsDialog />
  if (dialog === 'preview') return <PreviewOverlay />
  return null
}
