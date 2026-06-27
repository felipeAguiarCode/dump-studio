import { useEffect } from 'react'
import { useUiStore } from './stores/uiStore'
import { usePreferencesStore } from './stores/preferencesStore'
import { ipc } from './services/ipcClient'
import { projectActions } from './services/projectActions'
import { RecentProjectsScreen } from './features/home/RecentProjectsScreen'
import { AppShell } from './features/shell/AppShell'
import { ToastSystem } from './features/feedback/ToastSystem'
import { DialogHost } from './features/dialogs/DialogHost'
import { ConfirmDialog } from './features/dialogs/ConfirmDialog'

export function App(): JSX.Element {
  const view = useUiStore((s) => s.view)

  useEffect(() => {
    void usePreferencesStore.getState().load()
    void ipc('app:bootInfo').then(async ({ autoOpenProjectId, exportDir, openDialog }) => {
      if (!autoOpenProjectId) return
      await projectActions.openProject(autoOpenProjectId)
      if (openDialog) useUiStore.getState().openDialog(openDialog as 'export' | 'preferences' | 'snapshots')
      // Auto-export para verificação de desenvolvimento (gated).
      if (exportDir) {
        const { useEditorStore } = await import('./stores/editorStore')
        const { composeDumpItems } = await import('../engine/render/exportRenderer')
        const project = useEditorStore.getState().project
        if (project) {
          const images = await composeDumpItems(project.dumpItems, { format: 'jpg', quality: 92 })
          await ipc('export:run', {
            projectId: project.id,
            scope: 'all',
            format: 'jpg',
            jpgQuality: 92,
            destinationPath: exportDir,
            fileNamingPattern: 'noir-dump-{index}',
            images
          })
          console.log('[export-test] concluído')
        }
      }
    })
  }, [])

  return (
    <>
      {view === 'home' ? <RecentProjectsScreen /> : <AppShell />}
      <DialogHost />
      <ConfirmDialog />
      <ToastSystem />
    </>
  )
}
