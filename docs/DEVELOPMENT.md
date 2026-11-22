# Desenvolvimento do My Dump Studio

Execute os comandos na raiz do repositório. A edição atual do My Dump Studio é **1.0.0 — Cherry Pie Version**.

## Preparar o ambiente

```powershell
npm install
npm run dev
```

O `postinstall` prepara `better-sqlite3` e `sharp` para o Electron. O desenvolvimento e o build geram os recursos de branding a partir de `assets/branding/`.

Se a compilação dos módulos nativos falhar no Windows, instale o Visual Studio Build Tools com o workload **Desktop development with C++** e execute `npm run rebuild`. Não use um rebuild voltado ao Node para rodar módulos nativos dentro do Electron.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Aplicativo desktop com HMR. |
| `npm run site` | Site em `http://127.0.0.1:4173`, com cache desativado. |
| `npm run build:branding` | Ícones, ICO e arte da splash. |
| `npm run typecheck` | TypeScript do main/preload e do renderer. |
| `npm run build` | Build de produção em `out/`. |
| `npm run start` | Executar o build desktop. |
| `npm run dist` | Build e instalador Windows NSIS. |
| `npm run check:startup` | Inicialização do executável empacotado. |
| `npm run check:formats` | Formatos, composição, persistência e autosave. |
| `npm run check:filters` | Shader e filtros em WebGL real. |
| `npm run check:themes` | Temas e preferências após build. |
| `npm run check:presets` | Biblioteca, favoritos, pastas, JSON, FX, copiar/colar e undo após build. |
| `node .site/scripts/check-site.mjs` | Demo desktop/mobile, controles, colagens, PNG e estados de release. |
| `node .site/scripts/check-site.mjs --hero` | Três filtros por foto, transições, navegação, cards e movimento reduzido. |

Os testes de integração usam dados temporários, sem modificar os projetos reais. Os testes do aplicativo que dependem de `out/` devem ser executados depois de `npm run build`. Em um clone limpo, execute `npm run build:branding` antes do typecheck para preparar os recursos gerados.

## Distribuição

O instalador `My-Dump-Studio-1.0.0-Cherry-Pie-Version-setup.exe` é gerado em `dist/1.0.0 - Cherry Pie Version/`. Para rodar sem instalação, mantenha `My Dump Studio.exe` junto da pasta `win-unpacked` completa.

O build gera os PNGs de 16 a 1024 px em `build/icons/`, o ICO do Windows e a arte do assistente. O ID do instalador permanece estável para upgrades. Se existir um banco do antigo Noir Dump Studio e ainda não existir um banco do My Dump Studio, o app usa o perfil anterior no mesmo local para preservar as referências às fotos.

Dependências, builds, instaladores, certificados e bancos locais ficam fora do Git. Publique os instaladores como assets de uma release; eles não são armazenados na árvore de código-fonte.

## Arquitetura

```text
src/
  shared/     Tipos, defaults, validação e contrato IPC
  main/       Electron, SQLite, repositories, services e filesystem
  preload/    Bridge tipado window.noir
  renderer/   React, ferramentas, temas e stores Zustand
  engine/     Pipeline WebGL e composição/exportação
.site/        Site estático, assets e demonstração interativa
scripts/      Build de branding e verificações de integração
```

A stack combina Electron, React, TypeScript, electron-vite, SQLite, Zustand, Konva, regl/WebGL e sharp. O código de `src/shared` deve permanecer sem APIs de Node, Electron ou DOM.

**Ajustes de imagem pertencem à foto selecionada.** O canvas armazena propriedades estruturais, como formato e fundo. Preserve essa separação no processamento, no autosave, nos presets e na exportação.

Persistência segue o fluxo IPC → service → repository → SQLite. As migrations em `src/main/db/migrations` são versionadas; novas alterações devem usar novas migrations, preservando dados existentes. Autosave e undo passam pelos stores e serviços do editor.

## Presets

A biblioteca é compartilhada entre projetos. Um preset captura ajustes, curvas, cores, filtro, câmera, texturas, borda, opacidade e os FX selecionados. Recorte, posição, foto original, textos e layout do destino são preservados.

- `Ctrl+Shift+C` / `Ctrl+Shift+V`: copiar e colar look.
- `Ctrl+C` / `Ctrl+V`: copiar e colar camadas.
- `Ctrl+Z`: desfazer a aplicação do preset ou a mudança de formato.
- JSON pode incluir um preset, uma pasta com subpastas ou a biblioteca inteira.
- A importação preserva presets existentes e cria cópias com nomes distintos.
- Favoritos persistem e acompanham a exportação; o JSON não inclui fotos nem caminhos originais.

## Verificação visual

Ganchos de desenvolvimento, sem efeito durante o uso normal:

| Variável | Comportamento |
| --- | --- |
| `NOIR_SEED=<pasta>` | Cria um projeto de exemplo quando o banco está vazio. |
| `NOIR_SEED_TAB=<painel>` | Escolhe o painel inicial dos dados de exemplo. |
| `NOIR_SHOT=<arquivo.png>` | Captura a janela e encerra o aplicativo. |
| `NOIR_SPLASH_SHOT=<arquivo.png>` | Captura a splash durante a inicialização. |
| `NOIR_EXPORT=<pasta>` | Exporta automaticamente o projeto aberto. |
| `NOIR_DIALOG=preferences|snapshots|export|about` | Abre um diálogo no boot. |

Use sempre um `--user-data-dir` temporário ao verificar migrações, semear dados ou produzir capturas. As imagens demonstrativas têm seus [créditos e licenças](../.site/assets/photo-credits.json) registrados.

## Site

O [guia do site](../.site/README.md) descreve os recursos da demo, a atualização do motor e o deploy. O workflow `.github/workflows/site.yml` publica `.site/` no GitHub Pages. O site consulta o último release público estável e ativa o download quando encontra um instalador `*setup*.exe`.

A publicação do site e a publicação de um instalador são operações separadas.
