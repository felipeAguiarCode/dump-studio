import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { build } from 'esbuild'

/** Seed only an isolated smoke-test database, using the real preference service. */
export async function seedTheme(userData, theme) {
  assert.ok(['instagram_light', 'noir_dark'].includes(theme), 'Unknown smoke-test theme')
  await mkdir(userData, { recursive: true })
  const output = resolve('node_modules/.cache/noir-theme-fixture', `seed-${theme}.cjs`)
  await build({
    stdin: { resolveDir: process.cwd(), contents: `
      import { initDatabase, closeDatabase } from './src/main/db/connection';
      import { preferencesService } from './src/main/services/preferencesService';
      initDatabase();
      const prefs = preferencesService.get();
      preferencesService.set({ appearance: { ...prefs.appearance, theme: ${JSON.stringify(theme)}, themeVersion: 1 } });
      closeDatabase();
    ` },
    bundle: true, platform: 'node', format: 'cjs', packages: 'external', outfile: output,
    plugins: [{ name: 'isolated-path', setup(plugin) {
      plugin.onResolve({ filter: /^electron$/ }, () => ({ path: 'electron', namespace: 'fixture' }))
      plugin.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const app = { getPath: () => process.env.NOIR_THEME_TEST_DIR }' }))
    } }]
  })
  const child = spawnSync(resolve('node_modules/electron/dist/electron.exe'), [output], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', NOIR_THEME_TEST_DIR: userData }, windowsHide: true, encoding: 'utf8', timeout: 30_000
  })
  assert.equal(child.status, 0, child.stderr || 'Could not seed theme fixture')
}
