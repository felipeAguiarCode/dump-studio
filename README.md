# Noir Dump Studio

Editor desktop minimalista para criação de **photo dumps** em preto e branco (estética noir) para Instagram. Local-first, com persistência completa em SQLite e autosave confiável.

> Aplicação construída a partir da especificação em [`prompt.md`](./prompt.md).

## Stack

- **Electron** + **electron-vite** (main / preload / renderer)
- **React** + **TypeScript** + **Vite**
- **better-sqlite3** (persistência local em `userData`, migrations versionadas)
- **Zustand** + **immer** (estado do editor, undo/redo)
- **Konva** / **react-konva** (composição do canvas)
- **regl** / WebGL2 (pipeline de processamento de imagem por camada)
- **sharp** (thumbnails e metadados de imagem)
- **Tailwind CSS** (tokens noir)

## Desenvolvimento

```bash
npm install     # instala deps e recompila módulos nativos para o Electron
npm run dev     # abre o app em modo desenvolvimento (HMR)
npm run typecheck
npm run build   # build de produção
npm run dist    # empacota instalador Windows (nsis)
```

### Pré-requisitos no Windows

Os módulos nativos (`better-sqlite3`, `sharp`) são recompilados para a ABI do Electron
no `postinstall` (`electron-builder install-app-deps`). Se a recompilação falhar, instale
o **Visual Studio Build Tools** com o workload *"Desktop development with C++"*:

```powershell
winget install Microsoft.VisualStudio.2022.BuildTools
```

E rode novamente: `npm run rebuild`.

## Arquitetura

```
src/
  shared/     tipos e contrato IPC compartilhados (sem electron/node/DOM)
  main/       processo Electron: DB, repositories, services, IPC, filesystem
  preload/    bridge contextIsolation → window.noir (tipado)
  renderer/   UI React (features, stores Zustand, services)
  engine/     motor de imagem: compositor Konva + pipeline WebGL + export
```

**Regra crítica:** ajustes e filtros fotográficos são aplicados **somente à camada de
imagem selecionada**, nunca globalmente no canvas. O canvas só tem propriedades
estruturais (formato, background, guias, grid, bordas).

## Ganchos de desenvolvimento (gated por variáveis de ambiente)

Úteis para testes/screenshots; nenhum efeito em produção:

- `NOIR_SEED=<pasta>` — se o banco estiver vazio, cria um projeto e importa as imagens da pasta.
- `NOIR_SHOT=<arquivo.png>` — captura a janela após o carregamento e encerra o app.
- `NOIR_EXPORT=<pasta>` — auto-exporta o dump aberto para a pasta (verificação de exportação).
- `NOIR_DIALOG=preferences|snapshots|export` — abre o diálogo no boot.

> Módulos nativos são compilados para a ABI do Electron — scripts Node avulsos não
> conseguem carregar `better-sqlite3` (apenas o app Electron). `sharp` (N-API) carrega em ambos.
