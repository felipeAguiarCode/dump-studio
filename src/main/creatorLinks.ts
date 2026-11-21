import { shell } from 'electron'
import { APP_CREATOR } from '@shared/appInfo'

/** Creator links open in the system browser, while the app keeps its own window. */
export function openCreatorLink({ url }: { url: string }): { action: 'deny' } {
  if (url === APP_CREATOR.github || url === APP_CREATOR.linkedin) {
    void shell.openExternal(url).catch((error) => console.error('[creator-link]', error))
  }
  return { action: 'deny' }
}
