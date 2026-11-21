import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawn } from 'node:child_process'
import { build } from 'esbuild'

const scratch = await mkdtemp(join(tmpdir(), 'noir-theme-check-'))
const cache = resolve('node_modules/.cache/noir-theme-check')
await mkdir(cache, { recursive: true })
const html = await readFile('out/renderer/index.html', 'utf8')
const styles = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)].map((match) => `<link rel="stylesheet" href="${pathToFileURL(resolve('out/renderer', match[1])).href}">`).join('')
assert.ok(styles, 'Build the application before checking themes')
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)?.[0] ?? ''
await build({ entryPoints: ['scripts/fixtures/check-themes-renderer.tsx'], bundle: true, platform: 'browser', format: 'iife', jsx: 'automatic', external: ['electron'], outfile: join(scratch, 'renderer.js') })
await writeFile(join(scratch, 'index.html'), `<!doctype html><html><head><meta charset="utf-8">${bootstrap}${styles}</head><body><div id="root"></div><script src="renderer.js"></script></body></html>`)
await build({
  stdin: { resolveDir: process.cwd(), contents: `
    import assert from 'node:assert/strict';
    import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
    import fs from 'node:fs/promises';
    import { initDatabase, closeDatabase } from './src/main/db/connection';
    import { preferencesService } from './src/main/services/preferencesService';
    import { preferencesRepo } from './src/main/repositories/preferences.repo';
    import { createDefaultPreferences } from './src/shared/defaults';
    import { applyNativeTheme } from './src/main/theme';
    app.setPath('userData', ${JSON.stringify(join(scratch, 'user-data'))});
    app.whenReady().then(async () => {
      await fs.mkdir(app.getPath('userData'), { recursive: true });
      initDatabase();
      const legacy = createDefaultPreferences(new Date().toISOString());
      legacy.appearance.theme = 'noir_dark';
      delete legacy.appearance.themeVersion;
      legacy.appearance.language = 'pt';
      legacy.editingDefaults.defaultFilterName = 'lab_lith';
      preferencesRepo.setRaw(JSON.stringify(legacy));
      const migrated = preferencesService.get();
      assert.equal(migrated.appearance.theme, 'instagram_light');
      assert.deepEqual(migrated.editingDefaults, legacy.editingDefaults);
      assert.deepEqual(migrated.projectDefaults, legacy.projectDefaults);
      preferencesService.set({ appearance: { ...migrated.appearance, theme: 'noir_dark', themeVersion: 1 } });
      closeDatabase(); initDatabase();
      assert.equal(preferencesService.get().appearance.theme, 'noir_dark');
      preferencesService.set({ appearance: { ...migrated.appearance, theme: 'instagram_light', themeVersion: 1 } });
      applyNativeTheme('instagram_light');
      let window = new BrowserWindow({ width: 980, height: 660, useContentSize: true, show: false, webPreferences: { nodeIntegration: true, contextIsolation: false, sandbox: false } });
      window.webContents.on('console-message', (_event, level, message) => { if (level >= 2) console.error(message); });
      ipcMain.handle('preferences:get', () => preferencesService.get());
      ipcMain.handle('preferences:set', (_event, patch) => { const prefs = preferencesService.set(patch); applyNativeTheme(prefs.appearance.theme); return prefs; });
      ipcMain.handle('theme-check:capture', async (_event, name) => {
        assert.equal(nativeTheme.themeSource, name === 'white-controls' ? 'light' : 'dark');
        await fs.writeFile(${JSON.stringify(scratch)} + '/' + name + '.png', (await window.webContents.capturePage()).toPNG());
      });
      ipcMain.once('theme-check:result', (_event, result) => { console.log(result.message); closeDatabase(); app.exit(result.ok ? 0 : 1); });
      await window.loadFile(${JSON.stringify(join(scratch, 'index.html'))}, { query: { theme: 'instagram_light' } });
    }).catch(error => { console.error(error); app.exit(1); });
  ` },
  bundle: true, platform: 'node', format: 'cjs', packages: 'external', outfile: join(cache, 'main.cjs')
})
const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE
const child = spawn(resolve('node_modules/electron/dist/electron.exe'), [join(cache, 'main.cjs')], { env, cwd: scratch, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
for (const stream of [child.stdout, child.stderr]) stream.on('data', (chunk) => { output += chunk.toString() })
const status = await new Promise((resolveExit, reject) => {
  const timer = setTimeout(() => { child.kill(); reject(new Error('Theme verification timed out')) }, 45_000)
  child.once('error', (error) => { clearTimeout(timer); reject(error) })
  child.once('exit', (code) => { clearTimeout(timer); resolveExit(code) })
})
if (output.trim()) console.log(output.trim())
assert.equal(status, 0, `Theme test failed; artifacts: ${scratch}`)
console.log(`Theme previews: ${scratch}`)
