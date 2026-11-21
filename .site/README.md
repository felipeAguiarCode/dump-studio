# My Dump Studio — site

Site estático, local, com versões em português e inglês. Todos os arquivos necessários
para servir o site estão nesta pasta, incluindo fotos, fontes, motor de imagem e créditos.
Não depende de serviços de IA, contas ou uploads. O PNG é gerado no navegador.

## Abrir localmente

Na raiz do projeto:

```powershell
python -m http.server 4173 --directory .site --bind 127.0.0.1
```

Abra `http://127.0.0.1:4173`. Use um servidor HTTP; abrir `index.html` via `file://`
não permite carregar os módulos e o catálogo de fotos em todos os navegadores.

## Download

`config.js` define o repositório `felipeAguiarCode/dump-studio`. O site consulta a API
pública de releases do GitHub, seleciona um asset `*setup*.exe` do último release estável
e usa seu `browser_download_url`. Não contém token nem credenciais.

- Sem release ou instalador: informa **Primeira release em breve** e impede um download quebrado.
- Com instalador publicado: ativa o download automaticamente, sem versão fixa no código.
- Falha de rede ou limite da API: oferece a página de releases como alternativa.

O instalador é publicado separadamente do site. Nenhum release foi criado por este trabalho.

## GitHub Pages

Endereço: **https://felipeaguiarcode.github.io/dump-studio/**.

A publicação usa GitHub Actions, definido em `.github/workflows/site.yml`, e envia apenas
o conteúdo de `.site` para o Pages. O branch `site` reúne a versão publicada da página;
mudanças em `.site` nesse branch publicam automaticamente. O workflow também aceita
`main`, para quando as alterações do site forem integradas ao branch principal.
`deploy/github-pages.yml` é uma cópia de referência do workflow ativo.

A página usa caminhos relativos, portanto funciona no subcaminho `/dump-studio/`.
O motor já está compilado; a publicação não instala dependências do aplicativo desktop.

## Movimento e navegação

- Hero: Polaroid flutuante à esquerda, texto e botões à direita. Cada foto passa por 35mm,
  Satin e Noir, processados pelo motor real, antes de avançar. Os três looks ficam prontos
  antes de iniciar os seis segundos da foto. Barras de Stories, bolinhas brancas, swipe,
  setas e pausa ficam sincronizados. A passagem pausa durante interação, fora da tela e
  em abas ocultas.
- Menu fixo e barras de rolagem nas cores da identidade. As âncoras descontam a altura do menu.
- Faixas animadas “Faz um dump”, botões com brilho e elevação, entradas suaves por seção.
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

Ela usa Chromium/Electron em um perfil temporário, testa o PNG exportado e simula os
estados da API de releases. Não altera projetos do usuário nem publica arquivos.

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
