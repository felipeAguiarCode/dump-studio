# My Dump Studio — site

Site estático, local, com versões em português e inglês. Todos os arquivos necessários
para servir o site estão nesta pasta, incluindo fotos, fontes, motor de imagem e créditos.
Não depende de serviços de IA, contas ou uploads. O PNG é gerado no navegador.

## Abrir localmente

Na raiz do projeto:

```powershell
npm run site
```

Abra `http://127.0.0.1:4173`. Use um servidor HTTP; abrir `index.html` via `file://`
não permite carregar os módulos e o catálogo de fotos em todos os navegadores.
O comando serve sempre esta pasta, com o cache desativado para mostrar as últimas
alterações. Não use `npm run dev`: ele inicia o aplicativo desktop.
Se a porta estiver ocupada, use `npm run site -- --port 4174`.

## Download

O botão **Baixar pelo GitHub** abre as [Releases do My Dump Studio](https://github.com/felipeAguiarCode/dump-studio/releases), onde fica o instalador do Windows. A seção **Instalar no Windows** (`#download`) mostra as etapas da instalação.

## GitHub Pages

Endereço: **https://felipeaguiarcode.github.io/dump-studio/**.

A publicação usa GitHub Actions, definido em `.github/workflows/site.yml`, e envia apenas
o conteúdo de `.site` para o Pages. O branch `main` reúne o aplicativo e o site;
mudanças em `.site` nesse branch publicam automaticamente. O workflow também aceita
o branch `site`, usado no histórico de desenvolvimento da página.
`deploy/github-pages.yml` é uma cópia de referência do workflow ativo.

A página usa caminhos relativos, portanto funciona no subcaminho `/dump-studio/`.
O motor já está compilado; a publicação não instala dependências do aplicativo desktop.

## Movimento e navegação

- Hero: Polaroid flutuante à esquerda, texto e botões à direita. Cada foto passa por 35mm,
  Satin e Noir, processados pelo motor real, antes de avançar. Os três looks ficam prontos
  antes de iniciar os nove segundos da foto. A cada três segundos, o próximo filtro é
  revelado da direita para a esquerda sobre a mesma foto, com uma divisória acompanhando
  o deslize. Barras de Stories, bolinhas brancas, swipe, setas e pausa ficam sincronizados.
  Passar o mouse mantém a demonstração ativa; arrastar, foco por teclado, pausa manual,
  conteúdo fora da tela e abas ocultas pausam a sequência.
- Menu fixo e barras de rolagem nas cores da identidade. As âncoras descontam a altura do menu.
- Ondas animadas na hero e headline com cinco variações em um letreiro que vira.
  No celular, a composição fica centralizada, com navegação compacta para Mood, Colagens e Download.
- O mood mobile usa uma faixa horizontal de looks e abas para ajustes/formato; as colagens
  também oferecem estilos e miniaturas em faixas deslizantes. A edição e o PNG usam o motor real.
- A seção de download traz uma foto de street style do Pexels, um selo Cherry Pie com
  brilho e volume e órbitas luminosas no fundo. Fontes das fotos continuam nos créditos.
- Faixas animadas “Faz um dump”, botões com brilho e elevação, entradas suaves por seção.
- Os cards de presets, camadas e projetos locais têm composições ilustrativas próprias,
  bordas e profundidade, mantendo a leitura centralizada no celular.
- Manifesto centralizado, com texto preenchido em degradê sobre fundo suave. As linhas
  surgem, ficam legíveis e se dissipam conforme o scroll avança.
- Colagens interativas: catálogo e geometria reais do app, organizados por estilo.
  Selecione layouts, alterne os três formatos, troque as fotos e salve a colagem em PNG.
  Os layouts de carrossel contínuo mostram as duas partes do mesmo recorte.
- Movimento reduzido desativa autoplay, entradas animadas, alinhamento de scroll e a etapa
  fixa do manifesto, mantendo todo o conteúdo visível e os controles manuais disponíveis.

## Atualizar o motor de filtros

Para repetir a verificação funcional e gerar capturas desktop/mobile, com as dependências
da raiz instaladas:

```powershell
node .site/scripts/check-site.mjs
```

Para verificar apenas o ciclo e o deslize de filtros da hero, os cards e movimento reduzido:

```powershell
node .site/scripts/check-site.mjs --hero
```

A verificação usa Chromium/Electron em um perfil temporário, testa o PNG exportado
e confere o destino do botão de download.

A demo usa o mesmo shader, uniforms, defaults, catálogo de layouts e geometria do editor
desktop. Após mudar essas fontes, no checkout de desenvolvimento atualizado do aplicativo,
com as dependências da raiz instaladas:

```powershell
node .site/scripts/build-engine.mjs
```

O resultado pré-compilado `assets/editor-engine.js` já acompanha o site; não é necessário
instalar dependências para publicar ou visualizar a página.

## Imagens e design

- Fotografias: Pexels, fontes/autores/licenças em `assets/photo-credits.json` e `credits.html`.
- Fontes locais: Archivo Black para títulos e Jost para leitura. Licenças OFL em `assets/fonts/`.
- O símbolo de câmera da página é SVG original, separado do ícone final do desktop.
- Capturas reais do aplicativo: `assets/screenshots/`, feitas com dados temporários e fotos licenciadas.
- Inspiração de estrutura: Rasgo Photo Dump Maker. Textos e composição originais, focados nas funções reais do app.
- Sem métricas, clientes, depoimentos ou capacidades de geração por IA inventadas.

As miniaturas dos botões de look são referências visuais leves; a foto principal, o
comparador e o PNG exportado são processados pelo motor real. Formatos da demo: 1080×1350,
1080×1080 e 1080×1920. O enquadramento completo da foto é preservado com margens brancas.
