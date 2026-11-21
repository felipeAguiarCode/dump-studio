import assert from 'node:assert/strict'
import { mkdir, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { build } from 'esbuild'

const scratch = await mkdtemp(join(tmpdir(), 'noir-format-db-'))
const directory = resolve('node_modules/.cache/noir-format-check')
await mkdir(directory, { recursive: true })
const entry = join(directory, 'check.cjs')
await build({
  stdin: { resolveDir: process.cwd(), contents: `
    import assert from 'node:assert/strict';
    import { initDatabase, closeDatabase } from './src/main/db/connection';
    import { projectService } from './src/main/services/projectService';
    import { createDumpItem, createImageLayer } from './src/main/services/factories';
    import { dumpItemsRepo } from './src/main/repositories/dumpItems.repo';
    import { layersRepo } from './src/main/repositories/layers.repo';
    import { INSTAGRAM_FORMATS } from './src/shared/constants';
    import { randomUUID } from 'node:crypto';
    initDatabase();
    try {
      const originalFormat = 'portrait_post_3_4';
      const project = projectService.create({ name: 'Format persistence fixture', format: originalFormat });
      for (let index = project.dumpItems.length; index < 2; index++) {
        const page = createDumpItem(project.id, originalFormat, index, new Date().toISOString());
        dumpItemsRepo.insert(page);
        page.layers.forEach((layer) => layersRepo.insert(layer));
      }
      let before = projectService.open(project.id);
      for (const item of before.dumpItems) {
        const image = createImageLayer(item.id, { id: randomUUID(), fileName: 'fixture.png', internalCopyPath: '/fixture.png', width: 600, height: 400 }, 1, item.canvas, new Date().toISOString());
        layersRepo.insert(image);
        dumpItemsRepo.updateCanvas(item.id, { layout: { templateId: 'test', gutter: 20, slots: [{ x: .2, y: .2, w: .5, h: .4, rot: 15 }] } });
        layersRepo.update(image.id, { data: { ...image.data, slotIndex: 0 } });
      }
      before = projectService.open(project.id);
      for (const spec of Object.values(INSTAGRAM_FORMATS)) {
        projectService.setFormat(project.id, spec.id);
        const reopened = projectService.open(project.id);
        assert.equal(reopened.dumpItems.length, 2);
        for (const item of reopened.dumpItems) {
          assert.equal(item.canvas.width, spec.width);
          assert.equal(item.canvas.height, spec.height);
          assert.equal(item.canvas.format, spec.id);
          assert.ok(item.canvas.compositionFrame);
          assert.equal(item.canvas.layout.templateId, 'test');
          const image = item.layers.find((layer) => layer.type === 'image');
          assert.equal(image.data.slotIndex, 0);
          assert.deepEqual(image.crop, before.dumpItems.find((page) => page.id === item.id).layers.find((layer) => layer.type === 'image').crop);
        }
      }
      projectService.replaceTree(before);
      const restored = projectService.open(project.id);
      assert.deepEqual(restored.dumpItems.map((item) => item.canvas), before.dumpItems.map((item) => item.canvas));
      assert.deepEqual(restored.dumpItems.map((item) => item.layers.map((layer) => layer.transform)), before.dumpItems.map((item) => item.layers.map((layer) => layer.transform)));
      closeDatabase();
      initDatabase();
      assert.equal(projectService.open(project.id).format, originalFormat);
      console.log('PASS: actual SQLite transaction resizes both pages across all six formats, persists layouts/crops/composition frames, restores the undo tree, and survives database reopen.');
    } finally { closeDatabase(); }
  ` },
  bundle: true, platform: 'node', format: 'cjs', packages: 'external', outfile: entry,
  plugins: [{ name: 'isolated-electron-path', setup(plugin) {
    plugin.onResolve({ filter: /^electron$/ }, () => ({ path: 'electron', namespace: 'fixture' }))
    plugin.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const app = { getPath: () => process.env.NOIR_FORMAT_TEST_DIR }' }))
  } }]
})
const result = spawnSync(resolve('node_modules/electron/dist/electron.exe'), [entry], {
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', NOIR_FORMAT_TEST_DIR: scratch },
  windowsHide: true, encoding: 'utf8', timeout: 30_000
})
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
assert.equal(result.status, 0, result.error?.message ?? 'SQLite format integration failed')
console.log(`Isolated database: ${scratch}`)
