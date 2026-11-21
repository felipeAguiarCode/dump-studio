import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { build } from 'esbuild'

const scratch = await mkdtemp(join(tmpdir(), 'noir-filter-check-'))
await build({
  entryPoints: ['scripts/fixtures/check-filters-renderer.ts'], bundle: true, platform: 'browser', format: 'iife', external: ['electron'], loader: { '.css': 'empty' }, logLimit: 4, outfile: join(scratch, 'renderer.js'),
  plugins: [{ name: 'image-only-export-fixture', setup(plugin) {
    // The image compositor is real; unrelated font/overlay loading and the asset URL use fixtures.
    plugin.onResolve({ filter: /renderer\/services\/assetUrls$/ }, () => ({ path: 'asset', namespace: 'fixture' }))
    plugin.onResolve({ filter: /renderer\/styles\/fonts$/ }, () => ({ path: 'fonts', namespace: 'fixture' }))
    plugin.onResolve({ filter: /renderer\/lib\/overlays$/ }, () => ({ path: 'overlays', namespace: 'fixture' }))
    plugin.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents: path === 'asset'
      ? 'export const assetUrl = () => globalThis.__noirFilterChart'
      : path === 'fonts' ? 'export const ensureFontsLoaded = async () => {}'
      : 'export function overlayUrl() { throw Error("Unexpected overlay in image fixture") }; export const tintOverlay = overlayUrl'
    }))
  } }]
})
await writeFile(join(scratch, 'index.html'), `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}body{margin:0;padding:24px;background:#101113;color:#f2f2f2;font-family:system-ui,sans-serif}h1{margin:0 0 5px;font-size:21px;font-weight:550}header p{margin:0 0 22px;color:#aaa;font-size:12px}#grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}article{padding:10px;background:#202123;border:1px solid #38393c;border-radius:10px}canvas{display:block;width:100%;height:auto;border-radius:4px}h2{margin:9px 0 2px;font-size:13px;font-weight:550}article p{margin:0;color:#aaa;font-size:10px}
  canvas{max-width:192px;margin:0 auto}
  </style></head><body><header><h1>Editorial + Laboratório</h1><p>Prévia dos oito novos filtros · renderização real do motor WebGL</p></header><div id="grid"></div><script src="renderer.js"></script></body></html>`)
await writeFile(join(scratch, 'main.cjs'), `
  const { app, BrowserWindow, ipcMain } = require('electron');
  const fs = require('node:fs/promises');
  app.setPath('userData', ${JSON.stringify(join(scratch, 'user-data'))});
  let window;
  app.whenReady().then(async () => {
    window = new BrowserWindow({ width: 980, height: 700, useContentSize: true, show: false, webPreferences: { nodeIntegration: true, contextIsolation: false, sandbox: false } });
    window.webContents.on('console-message', (_event, level, message) => { if (level >= 2) console.error(message); });
    ipcMain.once('filter-check-result', async (_event, result) => {
      if (!result.ok) { console.error(result.message); app.exit(1); return; }
      await fs.mkdir(${JSON.stringify(join(scratch, 'exports'))}, { recursive: true });
      for (const file of result.exportedFiles) await fs.writeFile(require('node:path').join(${JSON.stringify(join(scratch, 'exports'))}, file.name), Buffer.from(file.dataUrl.split(',')[1], 'base64'));
      const image = await window.webContents.capturePage();
      await fs.writeFile(${JSON.stringify(join(scratch, 'filters-preview.png'))}, image.toPNG());
      console.log(result.message);
      app.exit(0);
    });
    await window.loadFile(${JSON.stringify(join(scratch, 'index.html'))});
  }).catch(error => { console.error(error); app.exit(1); });
`)
const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE
const child = spawn(resolve('node_modules/electron/dist/electron.exe'), [join(scratch, 'main.cjs')], { env, cwd: scratch, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
for (const stream of [child.stdout, child.stderr]) stream.on('data', (chunk) => { output += chunk.toString() })
const code = await new Promise((resolveExit, reject) => {
  const timer = setTimeout(() => { child.kill(); reject(new Error('WebGL filter check timed out')) }, 45_000)
  child.once('error', (error) => { clearTimeout(timer); reject(error) })
  child.once('exit', (status) => { clearTimeout(timer); resolveExit(status) })
})
if (output.trim()) console.log(output.trim())
assert.equal(code, 0, `WebGL filter verification failed; artifacts: ${scratch}`)
console.log(`Filter preview: ${join(scratch, 'filters-preview.png')}`)
