import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import { DATABASE_FILENAME } from './db/connection'

/** Keep older projects at their existing paths, including the photos referenced by the database. */
export function configureUserData(): void {
  if (app.commandLine.hasSwitch('user-data-dir')) return

  const appData = app.getPath('appData')
  const current = app.getPath('userData')
  const profiles = [current, join(appData, 'Noir Dump Studio'), join(appData, 'noir-dump-studio')]
  const profile = profiles.find((path) => existsSync(join(path, DATABASE_FILENAME))) ?? current
  mkdirSync(profile, { recursive: true })
  app.setPath('userData', profile)
}
