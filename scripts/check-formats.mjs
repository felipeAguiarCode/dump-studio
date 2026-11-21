import assert from 'node:assert/strict'
import { build } from 'esbuild'

const requests = []
globalThis.__noirSaveRpc = (_channel, batch) => new Promise((resolve, reject) => requests.push({ batch, resolve, reject }))
const result = await build({
  stdin: { contents: `export { resizeComposition } from './src/shared/resizeComposition'; export { slotRectToTransform } from './src/shared/layoutGeometry'; export { INSTAGRAM_FORMATS } from './src/shared/constants'; export { AutosaveClient } from './src/renderer/services/autosaveClient';`, resolveDir: process.cwd() },
  bundle: true, write: false, format: 'esm', platform: 'node',
  plugins: [{ name: 'controlled-autosave', setup(plugin) {
    plugin.onResolve({ filter: /^\.\/ipcClient$/ }, () => ({ path: 'ipc', namespace: 'test' }))
    plugin.onResolve({ filter: /stores\/uiStore$/ }, () => ({ path: 'ui', namespace: 'test' }))
    plugin.onLoad({ filter: /.*/, namespace: 'test' }, ({ path }) => ({ contents: path === 'ipc' ? 'export const ipc = (...args) => globalThis.__noirSaveRpc(...args)' : 'export const useUiStore = { getState: () => ({ setSaveStatus() {} }) }' }))
  } }]
})
const { resizeComposition, slotRectToTransform, INSTAGRAM_FORMATS, AutosaveClient } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-6, `${label}: ${actual} != ${expected}`)
const base = { ...INSTAGRAM_FORMATS.portrait_post_3_4, format: 'portrait_post_3_4', backgroundColor: 'white', showGuides: true, showGrid: false }
const make = (type, data, transform = {}) => ({ id: type, type, visible: true, transform: { x: 100, y: 100, width: 400, height: 400, rotation: 0, scaleX: 1, scaleY: 1, ...transform }, data })
const layers = [
  make('image', { assetId: 'photo', border: { width: 8, color: '#fff', radius: { tl: 10, tr: 12, br: 14, bl: 16 } } }),
  make('text', { text: 'NOIR', fontSize: 60, lineHeight: 1.2, letterSpacing: 3 }, { y: 700, width: 600, height: 100 }),
  make('shape', { shape: 'circle', strokeWidth: 6, cornerRadius: 12 }, { x: 600, y: 200, width: 200, height: 200 }),
  make('border', { thickness: 12, cornerRadius: 24, gutter: 6 })
]
layers[0].crop = { rect: { x: .2, y: .1, width: .6, height: .7 }, rotation: 12 }
const original = structuredClone({ base, layers })

for (const target of Object.values(INSTAGRAM_FORMATS)) {
  const scale = Math.min(target.width / base.width, target.height / base.height)
  const resized = resizeComposition(base, layers, target)
  assert.equal(resized.canvas.width, target.width)
  assert.equal(resized.canvas.height, target.height)
  close(resized.layers[0].transform.width / resized.layers[0].transform.height, 1, 'photo remains square')
  close(resized.layers[2].transform.width / resized.layers[2].transform.height, 1, 'circle remains round')
  close(resized.layers[1].data.fontSize, 60 * scale, 'font scales with composition')
  close(resized.layers[0].data.border.width, 8 * scale, 'photo border scales')
  close(resized.layers[3].data.frame.width, base.width * scale, 'page border retains composition frame')
  assert.deepEqual(resized.layers[0].crop, layers[0].crop)
  for (const next of Object.values(INSTAGRAM_FORMATS)) {
    const intermediate = resizeComposition(resized.canvas, resized.layers, next)
    const restored = resizeComposition(intermediate.canvas, intermediate.layers, INSTAGRAM_FORMATS.portrait_post_3_4)
    for (let index = 0; index < layers.length; index++) {
      for (const key of ['x', 'y', 'width', 'height', 'rotation']) close(restored.layers[index].transform[key], layers[index].transform[key], `round trip ${target.id}/${next.id}/${key}`)
    }
    close(restored.layers[1].data.fontSize, 60, 'round-trip font')
  }
}
assert.deepEqual({ base, layers }, original, 'resizing never mutates the input project')

const layoutCanvas = { ...base, layout: { templateId: 'fixture', gutter: 20, slots: [{ x: .2, y: .2, w: .5, h: .4, rot: 23, seam: [0, 2] }] } }
const slotted = make('image', { assetId: 'photo', slotIndex: 0 })
slotted.crop = structuredClone(layers[0].crop)
for (const target of Object.values(INSTAGRAM_FORMATS)) {
  const before = slotRectToTransform(layoutCanvas.layout.slots[0], layoutCanvas, 20)
  const resized = resizeComposition(layoutCanvas, [slotted], target)
  const after = slotRectToTransform(resized.canvas.layout.slots[0], resized.canvas, resized.canvas.layout.gutter)
  const scale = Math.min(target.width / base.width, target.height / base.height)
  close(after.width, before.width * scale, 'layout width')
  close(after.height, before.height * scale, 'layout height')
  close(after.x, (target.width - base.width * scale) / 2 + before.x * scale, 'rotated layout position')
  close(resized.layers[0].transform.width, after.width, 'stored and rendered slot match')
  assert.deepEqual(resized.layers[0].crop, slotted.crop)
  assert.deepEqual(resized.canvas.layout.slots[0].seam, [0, 2])
}

const tick = () => new Promise((resolve) => setImmediate(resolve))
const client = new AutosaveClient()
client.enqueue({ kind: 'layer', id: 'photo', data: { name: 'first' } }, { immediate: true })
let drained = false
const barrier = client.drain().then(() => { drained = true })
client.enqueue({ kind: 'layer', id: 'photo', data: { name: 'latest' } })
await tick()
assert.equal(drained, false, 'drain must wait for the active save')
requests.shift().resolve({ savedAt: 'first' })
await tick()
assert.equal(drained, false, 'drain must also wait for edits queued during the active save')
assert.equal(requests[0].batch[0].data.name, 'latest')
requests.shift().resolve({ savedAt: 'second' })
await barrier
const failing = new AutosaveClient()
failing.enqueue({ kind: 'layer', id: 'photo', data: { name: 'old' } }, { immediate: true })
const rejected = assert.rejects(failing.drain(), /Pending edits/)
failing.enqueue({ kind: 'layer', id: 'photo', data: { name: 'new' } })
requests.shift().reject(new Error('fixture save failed'))
await rejected
const retry = failing.drain()
assert.equal(requests[0].batch[0].data.name, 'new', 'failed saves retain the newest queued edit')
requests.shift().resolve({ savedAt: 'retry' })
await retry
console.log('PASS: six formats, 36 format round trips, photo/text/shape/border proportions, rotated layouts/crops, and autosave barriers including failure/retry.')
