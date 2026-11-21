import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
const root = fileURLToPath(new URL('../', import.meta.url))
await build({ entryPoints: [resolve(root, 'engine-entry.ts')], outfile: resolve(root, 'assets/editor-engine.js'), bundle: true, platform: 'browser', format: 'esm', minify: true, target: 'es2020', tsconfig: resolve(root, '../tsconfig.web.json') })
console.log('Built the desktop photo engine for the static demo.')
