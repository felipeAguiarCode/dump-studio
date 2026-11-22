# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

My Dump Studio is a local-first **Electron desktop app** for creating Instagram photo dumps: import photos, edit each one non-destructively (adjustments, filters, crop, film/texture effects), compose multi-photo pages, and export at exact Instagram resolutions. UI labels are end-user-facing in **English + Portuguese** (i18n). The original spec lives in `prompt.md`; `README.md` has the dev quickstart.

## Commands

```bash
npm install        # installs deps; postinstall rebuilds native modules (better-sqlite3, sharp) for Electron's ABI
npm run dev        # electron-vite dev with HMR — the normal way to run the app
npm run typecheck  # tsc for BOTH projects (node + web); run this after every change — it's the primary gate
npm run build      # production build into out/
npm run dist        # build + package a Windows installer (nsis)
npm run rebuild     # re-run electron-rebuild if native modules fail to load (see Gotchas)
```

- **There is no automated test suite** (no jest/vitest). Verification = `npm run typecheck` + running the app (see *Dev verification hooks*). When you change behavior, run it.
- `npm run typecheck` runs `typecheck:node` then `typecheck:web` — both must pass. They use different tsconfigs (see below); a change can pass one and fail the other.

## Process & module layout

Electron-vite builds three targets, plus shared and engine code compiled into them:

```
src/
  shared/    domain types + the IPC contract. MUST stay free of electron/node/DOM APIs (compiled into both sides).
  main/      Electron main process: SQLite, repositories, services, IPC handlers, filesystem, asset protocol.
  preload/   contextBridge → exposes the typed `window.noir` API to the renderer.
  renderer/  React UI (features, Zustand stores, services, i18n). Runs in the browser context (DOM).
  engine/    image engine: WebGL pipeline + Konva compositing + export renderer. Runs in the RENDERER (DOM/WebGL).
```

**tsconfig boundary** (enforces the above): `tsconfig.node.json` compiles `main`+`preload`+`shared` (Node types, no DOM); `tsconfig.web.json` compiles `renderer`+`shared`+`engine` (DOM + react-jsx). Because `shared` is in both, never import electron/node/DOM into it.

**Path aliases** (`electron.vite.config.ts` + tsconfig): `@shared/*` everywhere; `@renderer/*` in the renderer. The `engine/` dir is imported via relative paths from the renderer (no alias).

## The one critical product rule

**Photo adjustments and filters apply ONLY to the selected image layer — never globally to the canvas/page.** The canvas owns only structural properties (format, background, borders, guides, grid). Every adjustment/filter/crop/shader is stored per image layer and rendered per layer (including at export). The IPC `AutosavePatch` union encodes this: there is no "canvas adjustments" patch — photo edits are always keyed by `layerId`. Preserve this invariant in any new editing feature.

## IPC & persistence (renderer → main → SQLite)

The contract is the single source of truth: **`src/shared/ipc/contract.ts`** — one `IpcContract` interface mapping each `'<domain>:<action>'` channel to its `{ args; result }`. Both sides derive their types from it, so adding a channel updates both ends' type-checking.

Flow for any call:
```
renderer: ipc('projects:open', {id})        // src/renderer/services/ipcClient.ts — thin typed wrapper + error unwrap
  → window.noir.invoke(channel, ...args)     // src/preload/api.ts — typed bridge over ipcRenderer.invoke
  → ipcMain.handle(...) via handle<C>(...)   // src/main/ipc/registerHandlers.ts — one registration site
  → service                                  // src/main/services/* — orchestrates, wraps multi-write ops in a tx
  → repository                               // src/main/repositories/* — raw SQL + row↔domain mappers (mappers.ts)
  → SQLite                                   // src/main/db/connection.ts (userData/noir-dump-studio.db, WAL)
```

- **Services orchestrate; repositories do SQL.** Don't write SQL outside a repo, and wrap multi-statement writes in `getDb().transaction(() => { ... })()`.
- **Migrations**: `src/main/db/migrations/NNN_*.ts`, registered in that dir's index and run idempotently by `src/main/db/migrator.ts` (tracks a `schema_version` row; never reapplies, never drops user data). Add a new numbered migration — don't edit old ones.
- **Autosave** is centralized in `src/renderer/services/autosaveClient.ts`: a debounced (400ms), coalesce-by-target-key, self-retrying queue. Store actions call `autosaveClient.enqueue(patch, { immediate? })`; slider drags coalesce, structural changes flush immediately. Don't scatter `ipc('autosave:patch')` calls in components.
- **Undo/redo & snapshot restore** replace the whole project tree in one transaction via `projects:replaceTree`. `src/renderer/stores/historyStore.ts` keeps `past`/`future` stacks of full `Project` clones (capacity 80); `captureHistory()` pushes the current tree *before* a mutation.

## Renderer state & UI

- **Stores** (Zustand + immer): `editorStore.ts` (the open `project` tree + `ui` state, and all editing actions like `updateLayerData`, `updateAdjustment(s)`, `setFilter`, `updateCrop`, `applyCameraLook`, `captureHistory`/`undo`/`redo`); `uiStore.ts` (view routing `home`|`editor`, active tool, save status, dialogs); `preferencesStore.ts` (user prefs, incl. language for i18n).
- **Editing pattern**: call a store action (which mutates immer state, captures history when appropriate, and enqueues the autosave patch) — never mutate store state directly, and never call IPC autosave yourself.
- **Routing**: `src/renderer/App.tsx` renders `RecentProjectsScreen` (home) or `AppShell` (editor) off `uiStore.view`. `projectActions` (`src/renderer/services/projectActions.ts`) orchestrates open/close/hydrate.
- **Features** live under `src/renderer/features/<region>/`: `canvas/`, `leftSidebar/`, `rightInspector/` (the edit tabs: Adjustments, Filters, Crop, Textures/Shaders, Layouts, plus text/shape/canvas panels), `topbar/`, `filmstrip`/`assets/`, `home/`, `dialogs/`, `shell/`, `feedback/`.

## Image engine (WebGL via regl)

All photo processing is a **single-pass GLSL fragment shader** (`src/engine/pipeline/shaders.ts`) driven by `regl` through a singleton `getGLContext()` (`src/engine/pipeline/glContext.ts`). Per image layer:

```
useProcessedLayer (src/renderer/features/canvas/useProcessedLayer.ts)
  → buildUniforms(adjustments, filter, refWidth, seed, crop, shaders)   // src/engine/pipeline/params.ts
  → getGLContext().process(assetId, image, uniforms, outCanvas, w, h)   // draws quad, reads back into a 2D canvas
  → Konva Image displays it (and the same path runs at export)
```

Conventions when touching the pipeline:
- `buildUniforms()` normalizes domain values (mostly `/100`) to GLSL ranges. `UNIFORM_NAMES` (same file) lists every uniform — **glContext registers regl props from this list, so a uniform missing here never reaches the shader.** A new scalar uniform must be added in **both** `buildUniforms()` and `UNIFORM_NAMES`, and declared in `shaders.ts`.
- **Array uniforms** (`uniform float x[N]`) must *also* be added to `ARRAY_UNIFORMS` in `glContext.ts` (it expands them to indexed `x[0]..x[N-1]` props). Forgetting this throws at draw time, which `useProcessedLayer` swallows → **every image silently renders blank/black**, not an error.
- `sampleUv(uv)` in the shader is the single function mapping screen UV → texture UV (crop/rotate/flip); all texture taps go through it, so geometric effects (e.g. lens distortion) belong there.
- **Export** reuses the exact same `getGLContext().process()` for WYSIWYG. `src/engine/render/exportRenderer.ts` composes each page (Konva, full resolution) into a dataURL in the renderer; `export:run` then hands the dataURLs to main to write files with **sharp**.

### Recipe: add a stackable texture/shader effect
This pattern repeats across the "Textures" panel. Touch all of: `ShaderEffects` interface (`src/shared/types/domain.ts`) → `DEFAULT_SHADERS` (`src/shared/defaults.ts`) → `buildUniforms()` + `UNIFORM_NAMES` (`params.ts`) → uniform decl + logic in `shaders.ts` → register in `TEXTURE_SESSIONS` (`src/renderer/features/rightInspector/ShadersPanel.tsx`) → i18n keys in `en.ts` + `pt.ts`. No store/DB/migration change is needed — `shaders` is a JSON blob on the image layer, and `buildUniforms` merges `DEFAULT_SHADERS` so old projects stay valid.

## i18n

`src/renderer/i18n/index.ts` exposes `useT()` (reactive hook for components) and `t` (imperative, for toasts/services), plus `t.plural(key, count)`. **`en.ts` is the source of truth for keys; `pt.ts` must mirror its exact shape** — the `Dictionary` type enforces this, so a missing/extra key in `pt.ts` fails `typecheck`. Keys are nested by feature and accessed by dot-path (`t('shadersPanel.intensity')`); dynamic keys (`t(\`shadersPanel.effects.${k}.label\`)`) are allowed.

## Assets

Imported images are copied into `userData/projects/<projectId>/assets/` (originals never modified), deduped by SHA-256 checksum, with a 512px JPEG thumbnail in `…/thumbnails/`. They reach the renderer via a custom **`noir-asset://asset/<id>`** (full) or **`noir-asset://thumb/<id>`** (thumb) protocol registered in `src/main/fs/assetProtocol.ts` — not `file://`. Import/thumbnailing lives in `src/main/fs/assetStore.ts` (sharp).

## Dev verification hooks (env-gated, no-op in production)

Useful for running/screenshotting headlessly (`src/main`):
- `NOIR_SEED=<image-folder>` — if the DB is empty, creates a project and imports that folder; `NOIR_SEED_TAB=<tab>` sets the active right tab.
- `NOIR_SHOT=<file.png>` — screenshot the window ~2.5s after load, then quit.
- `NOIR_EXPORT=<folder>` — auto-export the open dump; `NOIR_DIALOG=preferences|snapshots|export` opens a dialog on boot.
- **Isolation**: never delete the real `%APPDATA%\Noir Dump Studio` (holds the user's projects). To test against throwaway data: `npm run build`, then `npx electron . --user-data-dir="<scratch>/udata"` with the `NOIR_*` envs. (`APPDATA` override does **not** work — only `--user-data-dir` isolates.)
- Caveat: a freshly-seeded project's full-res texture loads async and is often not ready by the 2.5s `NOIR_SHOT`, so the canvas/export can come out **black** — that's not a shader bug. To verify shader math, port the GLSL arithmetic to a throwaway node script and assert the numbers; verify UI chrome separately via screenshot.

## Gotchas

- **Native modules are built for Electron's ABI.** `better-sqlite3` only loads inside the Electron app — a plain `node` script can't (`NODE_MODULE_VERSION` mismatch). `sharp` is N-API and loads in both. If native modules fail after an install, run `npm run rebuild` (needs VS Build Tools "Desktop development with C++" on Windows).
- Lingering dev Electron processes can hold the DB file open. The user often has their own `npm run dev` running that hot-reloads on your edits — don't kill it; check process ownership before touching any electron process.
