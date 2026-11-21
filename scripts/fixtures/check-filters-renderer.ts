import { ipcRenderer } from 'electron'
import { FILTERS, FILTER_SESSIONS } from '../../src/engine/filters/registry'
import { getGLContext } from '../../src/engine/pipeline/glContext'
import { buildUniforms } from '../../src/engine/pipeline/params'
import { DEFAULT_ADJUSTMENTS } from '../../src/shared/defaults'
import { composeDumpItem } from '../../src/engine/render/exportRenderer'
import { en } from '../../src/renderer/i18n/en'
import { pt } from '../../src/renderer/i18n/pt'
import type { DumpItem, PhotoFilterName } from '../../src/shared/types'

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function run(): Promise<void> {
  const originalSettings = JSON.stringify(DEFAULT_ADJUSTMENTS)
  check(FILTER_SESSIONS.length === 8, 'Expected eight filter sections')
  check(FILTERS.length === 44, 'Expected 36 existing filters and eight new filters')
  check(new Set(FILTERS.map((filter) => filter.name)).size === 44, 'Filter IDs must be unique')
  check(pt.shadersPanel.sessions.games === 'Aberrações Cromáticas', 'Portuguese texture label was not renamed')
  check(en.shadersPanel.sessions.games === 'Chromatic Aberrations', 'English texture label was not renamed')
  const newFilters = FILTER_SESSIONS.filter((session) => ['editorial', 'laboratory'].includes(session.id)).flatMap((session) => {
    check(session.filters.length === 4, `${session.id} must have four filters`)
    return session.filters
  })

  // A deterministic exposure/color chart exercises shadows, highlights, skin-like colors and edges.
  const source = document.createElement('canvas')
  source.width = 256
  source.height = 160
  const context = source.getContext('2d')!
  const ramp = context.createLinearGradient(0, 0, source.width, 0)
  ramp.addColorStop(0, '#000000')
  ramp.addColorStop(1, '#ffffff')
  context.fillStyle = ramp
  context.fillRect(0, 0, 256, 160)
  const colors = ['#5d3030', '#bd8068', '#edc5a5', '#d5bb71', '#49754f', '#478d9b', '#5f77b8', '#ac6e9a']
  colors.forEach((color, index) => { context.fillStyle = color; context.fillRect(index * 32, 85, 32, 75) })
  context.strokeStyle = '#eeeeee'
  context.lineWidth = 2
  context.strokeRect(36, 21, 76, 98)
  context.strokeStyle = '#151515'
  context.beginPath()
  context.arc(183, 60, 34, 0, Math.PI * 2)
  context.stroke()
  const image = new Image()
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Could not load the test chart'))
    image.src = source.toDataURL()
  })
  Object.assign(globalThis, { __noirFilterChart: source.toDataURL() })
  const pipeline = getGLContext()
  const render = (name: PhotoFilterName | null, intensity = 100): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')
    pipeline.process('filter-test-chart', image, buildUniforms(DEFAULT_ADJUSTMENTS, { name, intensity }, 1080, 0), canvas, 256, 160)
    return canvas
  }
  const pixels = (canvas: HTMLCanvasElement): Uint8ClampedArray => canvas.getContext('2d')!.getImageData(0, 0, 256, 160).data
  const difference = (first: Uint8ClampedArray, second: Uint8ClampedArray): number => {
    let total = 0
    for (let index = 0; index < first.length; index++) if (index % 4 !== 3) total += Math.abs(first[index] - second[index])
    return total / (256 * 160 * 3)
  }
  const baseline = render(null)
  const baselinePixels = pixels(baseline)
  const grid = document.getElementById('grid')!
  const card = (canvas: HTMLCanvasElement, name: string, section: string): void => {
    const element = document.createElement('article')
    const label = document.createElement('h2')
    label.textContent = name
    const caption = document.createElement('p')
    caption.textContent = section
    element.append(canvas, label, caption)
    grid.append(element)
  }
  card(baseline, 'Sem filtro', 'Referência de exposição e cor')
  const fingerprints = new Set<string>()
  const exportedFiles: { name: string; dataUrl: string }[] = []
  for (let index = 0; index < FILTERS.length; index++) {
    const filter = FILTERS[index]
    const uniforms = buildUniforms(DEFAULT_ADJUSTMENTS, { name: filter.name, intensity: 100 }, 1080, 0)
    check(uniforms.uFilter === index + 1, `Filter index changed or missing: ${filter.name}`)
    check(en.filters.items[filter.name]?.label && pt.filters.items[filter.name]?.description, `Missing translations for ${filter.name}`)
    const output = render(filter.name)
    const outputPixels = pixels(output)
    check(outputPixels.some((value, offset) => offset % 4 !== 3 && value > 20), `Blank output: ${filter.name}`)
    if (!newFilters.some((item) => item.name === filter.name)) continue
    check(difference(outputPixels, baselinePixels) > 0.5, `New filter has no visible effect: ${filter.name}`)
    check(difference(pixels(render(filter.name, 0)), baselinePixels) < 0.1, `Zero intensity does not restore the reference: ${filter.name}`)
    const half = pixels(render(filter.name, 50))
    let blendError = 0
    for (let offset = 0; offset < half.length; offset++) if (offset % 4 !== 3) blendError += Math.abs(half[offset] - (baselinePixels[offset] + outputPixels[offset]) / 2)
    check(blendError / (256 * 160 * 3) < 1.5, `Intensity is not a smooth blend: ${filter.name}`)
    let hash = 2166136261
    for (const value of outputPixels) hash = Math.imul(hash ^ value, 16777619)
    fingerprints.add(String(hash))
    card(output, pt.filters.items[filter.name].label, filter.name.startsWith('edit_') ? 'Editorial' : 'Laboratório')
    const page: DumpItem = {
      id: 'fixture', projectId: 'fixture', orderIndex: 0, title: filter.name, createdAt: '', updatedAt: '',
      canvas: { width: 256, height: 160, format: 'square_post_1_1', backgroundColor: 'white', showGrid: false, showGuides: false },
      layers: [{ id: 'photo', dumpItemId: 'fixture', type: 'image', name: 'Chart', visible: true, locked: false, opacity: 1, orderIndex: 0, createdAt: '', updatedAt: '',
        transform: { x: 0, y: 0, width: 256, height: 160, rotation: 0, scaleX: 1, scaleY: 1 },
        data: { assetId: 'filter-test-chart', sourcePath: '', originalWidth: 256, originalHeight: 160 },
        adjustments: DEFAULT_ADJUSTMENTS, filter: { name: filter.name, intensity: 100 }
      }]
    }
    for (const format of ['png', 'jpg'] as const) {
      const dataUrl = await composeDumpItem(page, { format, quality: 92 })
      const exported = new Image()
      await new Promise<void>((resolve, reject) => { exported.onload = () => resolve(); exported.onerror = () => reject(new Error('Could not decode export')); exported.src = dataUrl })
      check(exported.naturalWidth === 256 && exported.naturalHeight === 160, `Export dimensions changed: ${filter.name}`)
      const decoded = document.createElement('canvas')
      decoded.width = 256; decoded.height = 160
      decoded.getContext('2d')!.drawImage(exported, 0, 0)
      check(difference(pixels(decoded), outputPixels) < (format === 'png' ? 0.2 : 6), `Preview and ${format} export differ: ${filter.name}`)
      exportedFiles.push({ name: `${filter.name}.${format}`, dataUrl })
    }
  }
  check(fingerprints.size === 8, 'New filters must produce eight distinct looks')
  check(JSON.stringify(DEFAULT_ADJUSTMENTS) === originalSettings, 'Rendering a filter must not mutate shared adjustments')
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  ipcRenderer.send('filter-check-result', { ok: true, exportedFiles, message: 'PASS: all 44 filters rendered in actual WebGL; eight distinct new looks, legacy indices and PT/EN labels preserved, smooth 0/50/100 intensity, and 16 PNG/JPG exports matching the preview.' })
}

void run().catch((error: unknown) => ipcRenderer.send('filter-check-result', { ok: false, message: String(error instanceof Error ? error.stack : error) }))
