import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawn } from 'node:child_process'
import { build } from 'esbuild'

const root = process.cwd()
const scratch = await mkdtemp(join(tmpdir(), 'noir-presets-check-'))
const cache = resolve('node_modules/.cache/noir-presets-check')
await mkdir(cache, { recursive: true })
const html = await readFile('out/renderer/index.html', 'utf8')
const styles = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)].map((m) => `<link rel="stylesheet" href="${pathToFileURL(resolve('out/renderer', m[1])).href}">`).join('')
assert.ok(styles, 'Build the application before testing presets')
await build({ entryPoints: ['scripts/fixtures/check-presets-renderer.tsx'], bundle: true, platform: 'browser', format: 'iife', jsx: 'automatic', external: ['electron'], loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.css': 'empty' }, outfile: join(scratch, 'renderer.js') })
await writeFile(join(scratch, 'index.html'), `<!doctype html><html data-theme="instagram_light"><head><meta charset="utf-8">${styles}</head><body><div id="root"></div><script src="renderer.js"></script></body></html>`)
await build({ entryPoints: ['scripts/fixtures/check-presets-main.ts'], bundle: true, platform: 'node', format: 'cjs', packages: 'external', outfile: join(cache, 'main.cjs') })
const env = { ...process.env, NOIR_PRESETS_TEST_DIR: scratch, NOIR_FIXTURE_ROOT: root }
delete env.ELECTRON_RUN_AS_NODE
const child = spawn(resolve('node_modules/electron/dist/electron.exe'), [join(cache, 'main.cjs')], { env, cwd: scratch, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
for (const stream of [child.stdout, child.stderr]) stream.on('data', (chunk) => { output += chunk.toString() })
const code = await new Promise((resolveExit, reject) => {
  const timer = setTimeout(() => { child.kill(); reject(new Error(`Preset tests timed out; ${scratch}`)) }, 90_000)
  child.once('error', (error) => { clearTimeout(timer); reject(error) })
  child.once('exit', (status) => { clearTimeout(timer); resolveExit(status) })
})
console.log(output.trim())
assert.equal(code, 0, `Preset verification failed; ${scratch}`)
console.log(`Preset test database and screenshots: ${scratch}`)
