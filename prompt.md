# Mega Prompt — Noir Dump Studio

Use este documento como especificação completa para gerar a aplicação **Noir Dump Studio** no Claude Code.

---

```txt
Você é um engenheiro sênior especialista em Electron, React, TypeScript, UI/UX desktop, edição de imagem e aplicações local-first.

Crie uma aplicação desktop chamada:

NOIR DUMP STUDIO

A aplicação é um editor minimalista de fotos para Instagram, focado em edição de “photo dumps” em preto e branco, com estética noir, sofisticada, limpa e monocromática.

A aplicação deve ser construída com:

- Electron
- React
- TypeScript
- Vite
- SQLite local para persistência dos projetos
- CSS/Tailwind ou CSS Modules
- Canvas HTML5/Fabric.js/Konva.js ou biblioteca equivalente para manipulação visual das imagens
- Arquitetura organizada por módulos
- Código limpo, componentizado e fácil de manter

O objetivo principal é permitir que o usuário importe várias fotos de um projeto, edite cada uma delas, crie composições/collages, aplique ajustes semelhantes ao editor de fotos nativo do iPhone, aplique filtros preto e branco, navegue entre as fotos como em um carrossel do Instagram e exporte imagens prontas para Feed, Stories ou Reels.

====================================================================
0. REGRA CRÍTICA — ESCOPO DE EDIÇÃO
====================================================================

Esta regra é obrigatória e deve orientar toda a arquitetura do editor.

O canvas NÃO deve receber filtros nem ajustes globais de imagem.

O canvas é apenas a área de composição visual do post/carrossel. Ele contém:
- Background do canvas
- Camadas de imagem
- Camadas de texto
- Camadas de forma
- Bordas
- Grids
- Elementos decorativos simples

Ajustes e filtros devem ser aplicados somente na FOTO selecionada, ou seja, na camada de imagem selecionada dentro do canvas.

Exemplo:
- Se o canvas tiver 3 fotos em uma collage, o usuário pode selecionar apenas a Foto 1 e aplicar nela o filtro "Noir".
- A Foto 2 e a Foto 3 continuam sem alteração, a menos que o usuário selecione cada uma e aplique ajustes/filtros nelas também.
- O background do canvas não muda ao aplicar filtros.
- Textos, bordas, formas e grids não recebem filtros fotográficos.

O único controle global permitido para o canvas é a configuração visual do background da página:
- Preto
- Branco
- Cinza claro
- Cinza médio
- Cinza escuro
- Transparente, se tecnicamente viável
- Cor customizada dentro da paleta monocromática

A sidebar direita deve sempre operar sobre o alvo atualmente selecionado:
- Se uma camada de imagem estiver selecionada: mostrar Ajustes, Filtros e Cortar para essa foto.
- Se uma camada de texto estiver selecionada: mostrar controles de texto, não filtros fotográficos.
- Se uma forma/borda estiver selecionada: mostrar controles de forma/borda.
- Se nenhuma camada estiver selecionada: mostrar uma mensagem orientando o usuário a selecionar uma foto ou editar apenas o background do canvas.

Critérios de aceite desta regra:
- Aplicar filtro em uma foto não altera outras fotos do mesmo canvas.
- Aplicar ajuste em uma foto não altera o canvas como um todo.
- O canvas não possui propriedades globais de exposição, contraste, nitidez, granulação ou filtro.
- O canvas possui apenas propriedades estruturais e visuais, como formato, background, guias, grids e bordas.
- Cada camada de imagem mantém seus próprios ajustes, filtro, crop, transformação e dados de exportação.
- Na exportação, cada foto/camada deve ser renderizada com seus próprios ajustes e filtros individuais.


====================================================================
1. IDENTIDADE DO PRODUTO
====================================================================

Nome da aplicação:
Noir Dump Studio

Conceito:
Um editor desktop minimalista, elegante e noir para criação de photo dumps de Instagram.

Direção visual:
- Interface escura
- Paleta quase exclusivamente preto, branco e tons de cinza
- Visual refinado, limpo, silencioso e premium
- Inspirado em apps nativos de desktop, especialmente macOS
- Nada colorido na interface principal, exceto quando tecnicamente necessário em sliders de matiz/temperatura
- O foco visual deve estar nas fotos
- O app deve parecer uma ferramenta de edição premium, não um editor genérico

Paleta sugerida:
- Background principal: #080808
- Painéis laterais: #101010
- Painel elevado: #171717
- Bordas: #2A2A2A
- Bordas ativas: #F5F5F5
- Texto principal: #F2F2F2
- Texto secundário: #A0A0A0
- Texto desabilitado: #666666
- Canvas/background de trabalho: #0B0B0B
- Branco de destaque: #FFFFFF
- Hover: #1F1F1F
- Seleção ativa: #252525

Tipografia:
- Usar uma fonte moderna e limpa, preferencialmente Inter, SF Pro, Geist ou equivalente.
- Títulos pequenos, elegantes e com bom espaçamento.
- Interface com labels em português brasileiro.

====================================================================
2. ESTRUTURA GERAL DA INTERFACE
====================================================================

A aplicação deve ter um layout principal dividido em:

1. Top Bar
2. Sidebar esquerda de projeto e camadas
3. Área central de edição/canvas
4. Sidebar direita de ajustes e filtros
5. Filmstrip inferior com fotos do projeto, colapsável

Layout geral:

- Topo: barra da aplicação com nome "Noir Dump Studio", controles de navegação entre fotos, undo/redo, zoom e exportação.
- Esquerda: painel de projeto com formatos de Instagram e controle de camadas.
- Centro: canvas principal da foto/post selecionado.
- Direita: painel de edição com abas "Ajustes", "Filtros" e "Cortar".
- Inferior: galeria horizontal de todas as fotos do projeto, chamada "Fotos do Projeto", colapsável.

A interface deve ser responsiva para desktop, funcionando bem em telas grandes e notebooks.

====================================================================
3. TOP BAR
====================================================================

A Top Bar deve conter:

À esquerda:
- Ícone/app mark minimalista com as letras “ND”
- Nome da aplicação: Noir Dump Studio

Ao centro:
- Controle de navegação entre fotos do dump:
  - Botão seta para esquerda
  - Label central: "Foto 03 de 10"
  - Botão seta para direita

À direita:
- Botão desfazer
- Botão refazer
- Controle de zoom atual, exemplo: "100%"
- Botão de tela cheia/fit canvas
- Botão Exportar
- Ícone de configurações

Comportamento da navegação:
- Clicar na seta direita vai para a próxima foto do projeto.
- Clicar na seta esquerda vai para a foto anterior.
- Se estiver na primeira foto, a seta esquerda deve ficar desabilitada.
- Se estiver na última foto, a seta direita deve ficar desabilitada.
- O usuário também deve conseguir navegar usando as teclas ← e →.
- O label deve sempre refletir a posição real da foto selecionada.
- Ao navegar para outra foto/página do dump, o canvas central e o painel de camadas devem ser atualizados para a página ativa.
- A aba de Ajustes/Filtros deve refletir a camada de imagem selecionada dentro da página ativa, nunca o canvas inteiro.

Critérios de aceite:
- A navegação entre fotos funciona por clique e por teclado.
- O label "Foto X de Y" sempre mostra o índice correto.
- A foto selecionada no filmstrip inferior acompanha a foto ativa.
- Alterações feitas em uma foto não afetam indevidamente as outras.
- Undo/redo funciona por foto/projeto.

====================================================================
4. FORMATOS DE PROJETO INSTAGRAM
====================================================================

A aplicação deve permitir escolher entre dois formatos fixos:

1. Post Feed
- Proporção: 4:5
- Tamanho: 1080 × 1350 px
- Uso: Feed do Instagram
- Deve maximizar a visualização em mobile

2. Stories / Reels
- Proporção: 9:16
- Tamanho: 1080 × 1920 px
- Uso: Stories e Reels
- Deve preencher a tela inteira vertical

Na sidebar esquerda, deve haver uma seção:

"Formato do Instagram"

Com dois cards de seleção:

Card 1:
- Nome: Post (Feed)
- Proporção: 4:5
- Tamanho: 1080 × 1350 px
- Ícone de retângulo vertical moderado

Card 2:
- Nome: Stories / Reels
- Proporção: 9:16
- Tamanho: 1080 × 1920 px
- Ícone de retângulo vertical alto

Comportamento:
- Ao criar novo projeto, o usuário escolhe um desses formatos.
- O formato define o tamanho base do canvas.
- O usuário pode trocar o formato depois, mas a aplicação deve avisar que isso pode alterar o enquadramento.
- Ao trocar formato, as imagens devem tentar se adaptar mantendo proporção e posição relativa sempre que possível.

Critérios de aceite:
- Não existe opção genérica chamada "tamanho".
- A interface usa o termo "Formato do Instagram".
- O canvas respeita exatamente 1080x1350 ou 1080x1920 no momento da exportação.
- A prévia na interface mantém a proporção correta.
- Exportar uma imagem Feed gera 1080x1350.
- Exportar uma imagem Stories/Reels gera 1080x1920.

====================================================================
5. ÁREA CENTRAL / CANVAS PRINCIPAL
====================================================================

A área central é o coração do editor.

Ela deve exibir o canvas da foto/post atual selecionado no dump.

Requisitos:
- O canvas deve ficar centralizado.
- Deve ter fundo escuro ao redor.
- Deve mostrar a composição atual da foto selecionada.
- Deve permitir adicionar uma ou mais imagens ao canvas.
- Deve permitir transformar imagens:
  - Mover
  - Redimensionar
  - Cortar
  - Girar
  - Reposicionar
  - Ajustar enquadramento dentro de um frame
  - Duplicar
  - Remover
  - Bloquear camada
  - Ocultar camada
- Deve permitir criar colagens com várias fotos dentro da mesma página.
- Deve permitir bordas brancas ou cinzas entre fotos, simulando layouts elegantes de dump.
- Deve permitir configurar o background global do canvas/página em preto, branco, tons de cinza ou transparente.
- O background do canvas é a única propriedade visual global da página.
- O canvas não deve possuir filtros globais nem ajustes globais de imagem.
- Deve permitir zoom do canvas.
- Deve permitir pan/mão para mover a visualização.
- Deve permitir fit-to-screen.

Menu de ativação rápida / Quick Activation Menu:
Deve existir um menu de ativação rápida próximo ao canvas, preferencialmente na parte superior da área central ou como uma micro toolbar discreta no topo do workspace.

Esse menu é voltado para ativar e desativar rapidamente recursos visuais de apoio ao alinhamento e à composição.

Controles obrigatórios do menu de ativação rápida:
- Toggle de Grid de Fotos
- Toggle de Réguas
- Toggle de Guias Inteligentes
- Toggle de Snap / Encaixe
- Toggle de Margens Seguras, opcional mas recomendado

Detalhamento dos controles:

1. Grid de Fotos
- Deve permitir ativar um grid visual sobre o canvas, inspirado na grade do celular/câmera.
- Deve ter pelo menos:
  - Off
  - Grid 3x3 estilo celular
  - Grid denso opcional para composições mais precisas
- O grid deve servir apenas como apoio visual.
- O grid não deve aparecer na exportação final.

2. Réguas
- Deve permitir ativar régua horizontal e vertical ao redor do canvas.
- O usuário pode usar as réguas para alinhar elementos visualmente.
- Se tecnicamente viável, permitir criar guias arrastando a partir da régua.
- As réguas não devem aparecer na exportação final.

3. Guias Inteligentes
- Devem aparecer durante o movimento/redimensionamento de elementos.
- Devem indicar alinhamento com centro, bordas e outros elementos.
- Devem facilitar a montagem de collages e dumps organizados.

4. Snap / Encaixe
- Deve permitir que elementos se encaixem em grid, guias, centro do canvas e bordas de outros elementos.
- Deve poder ser ligado ou desligado rapidamente.

5. Margens Seguras
- Opcional, mas recomendado.
- Pode mostrar áreas seguras para composição, principalmente para Stories/Reels.
- Não aparece na exportação.

Regras importantes:
- Esses overlays são auxiliares de edição, não conteúdo final.
- Grid, réguas, guias e snap não devem interferir na imagem exportada.
- O estado desses toggles deve poder ser salvo nas preferências do usuário e também restaurado no estado do projeto.

Critérios de aceite do menu de ativação rápida:
- O usuário consegue ativar e desativar grid rapidamente sem abrir menus profundos.
- O usuário consegue ativar e desativar réguas rapidamente sem abrir menus profundos.
- Grid, réguas e guias inteligentes ajudam no alinhamento, mas não aparecem na exportação.
- O estado visual desses recursos pode ser restaurado ao reabrir o projeto.

Abaixo do canvas deve existir uma visualização de bolinhas igual ao Instagram, representando o carrossel/dump.

Exemplo:
● ○ ○ ○ ○ ○ ○

Comportamento das bolinhas:
- Cada bolinha representa uma foto/página do projeto.
- A bolinha ativa fica branca.
- As demais ficam cinza.
- Clicar em uma bolinha deve navegar para aquela foto.
- As bolinhas devem ficar centralizadas abaixo do canvas.
- Se houver muitas fotos, limitar visualmente ou adaptar com scroll discreto.

Critérios de aceite:
- A área central simula claramente um post/carrossel do Instagram.
- A navegação por bolinhas funciona.
- A bolinha ativa corresponde à foto ativa.
- O canvas mantém a proporção correta do formato escolhido.
- É possível trabalhar com uma foto única ou com uma colagem de múltiplas imagens.
- A edição visual é precisa e responsiva.

====================================================================
6. TOOLBAR VERTICAL DO CANVAS
====================================================================

Ao lado esquerdo do canvas central, deve existir uma toolbar vertical com ícones minimalistas.

Ferramentas obrigatórias:

1. Selecionar / Mover
- Seleciona elementos no canvas.
- Permite mover imagens, textos e formas.

2. Mão / Pan
- Move a visualização do canvas quando houver zoom.

3. Cortar
- Ativa modo de crop da camada selecionada.
- Deve permitir cortes livres e cortes proporcionais.

4. Transformar
- Permite redimensionar, girar e reposicionar a imagem.

5. Ajuste local / Máscara simples
- Pode ser implementado como ferramenta futura, mas deixar botão visual preparado.
- Inicialmente pode abrir painel "em breve" se não implementado.

6. Texto
- Permite adicionar texto minimalista em branco, cinza ou preto.
- Texto deve poder ser movido, redimensionado e alinhado.

7. Formas / Molduras
- Permite adicionar retângulos, linhas, bordas e grids simples.

8. Zoom
- Permite zoom in/out e fit.

9. Seleção múltipla
- O usuário deve conseguir selecionar mais de um elemento no canvas segurando Ctrl no Windows/Linux ou Cmd no macOS.
- Também é recomendado permitir seleção por caixa/marquee arrastando no canvas.
- A seleção múltipla deve funcionar para imagens, textos, formas e bordas, respeitando elementos bloqueados.
- Deve haver feedback visual claro de múltiplos itens selecionados.

10. Alinhamento e distribuição
- Quando houver múltiplos elementos selecionados, o sistema deve permitir alinhar o conjunto.
- Ações obrigatórias: alinhar à esquerda, centralizar horizontalmente, alinhar à direita, alinhar ao topo, centralizar verticalmente e alinhar à base.
- Também é recomendado incluir distribuir horizontalmente e distribuir verticalmente.

Critérios de aceite:
- Toolbar vertical fica próxima ao canvas.
- Ícones são simples, monocromáticos e elegantes.
- Ferramenta ativa tem estado visual claro.
- Cada ferramenta possui tooltip.
- A ferramenta Selecionar é padrão ao abrir projeto.

--------------------------------------------------------------------
6.1 Bubble contextual de seleção
--------------------------------------------------------------------

Sempre que o usuário selecionar um elemento no canvas, deve aparecer um bubble contextual flutuante próximo à seleção, inspirado na experiência de ferramentas como PowerPoint, mas com linguagem visual minimalista e noir.

Esse bubble deve ser compacto, elegante, monocromático e contextual.

Comportamento geral:
- Se 1 elemento estiver selecionado, o bubble mostra ações relevantes para aquele tipo de elemento.
- Se múltiplos elementos estiverem selecionados, o bubble mostra ações coletivas de alinhamento, agrupamento e organização.
- O bubble deve aparecer próximo à caixa de seleção sem encobrir demais o conteúdo.
- O bubble deve desaparecer ao desmarcar a seleção ou pressionar Esc.

Ações obrigatórias no bubble:

1. Alinhamento
- Alinhar à esquerda
- Centralizar horizontalmente
- Alinhar à direita
- Alinhar ao topo
- Centralizar verticalmente
- Alinhar à base

2. Agrupamento
- Agrupar
- Desagrupar

3. Organização
- Trazer para frente
- Enviar para trás
- Duplicar
- Excluir

4. Filtro rápido
- Quando a seleção envolver camada(s) de imagem, deve existir uma ação de filtro rápido no bubble.
- Ao clicar, abrir um mini popover com opções como:
  - Preto e Branco Alto Contraste
  - Tons de Prata
  - Vintage
  - Mono
  - Tonal
  - Noir
  - Silvertone
  - Jornal Noir
- Também deve permitir remover filtro rapidamente.
- Se apenas 1 camada de imagem estiver selecionada, o filtro rápido é aplicado somente nela.
- Se múltiplas camadas de imagem estiverem selecionadas, o sistema pode aplicar o mesmo filtro individualmente a cada camada selecionada, sem transformar isso em filtro global do canvas.
- Se a seleção for mista e incluir elementos que não sejam imagem, o botão de filtro rápido deve ficar desabilitado ou restringir a ação somente às camadas de imagem selecionadas.

5. Ações contextuais por tipo
- Para texto: alinhar texto, agrupar, duplicar, excluir.
- Para formas/bordas: alinhar, agrupar, duplicar, excluir.
- Para imagens: alinhar, agrupar, duplicar, excluir e filtro rápido.

Regras de alinhamento:
- Quando múltiplos elementos forem selecionados, o usuário deve poder alinhar todos na mesma direção.
- O alinhamento pode ocorrer com base:
  - na bounding box da seleção
  - no canvas/página, quando fizer sentido
- Deve ser previsível e consistente.

Critérios de aceite:
- Selecionar um elemento exibe um bubble contextual.
- Segurar Ctrl/Cmd permite selecionar múltiplos elementos.
- O bubble em seleção múltipla permite alinhar os elementos à esquerda, centro, direita, topo, meio e base.
- O bubble permite agrupar e desagrupar quando aplicável.
- O bubble permite filtro rápido para imagens selecionadas.
- O bubble não substitui o painel lateral detalhado; ele apenas acelera ações comuns.

====================================================================
7. FILMSTRIP INFERIOR — FOTOS DO PROJETO
====================================================================

Na parte inferior da interface deve existir uma seção chamada:

"Fotos do Projeto"

Essa seção é fundamental, pois o app é focado em edição de dumps de foto.

A seção deve exibir todas as fotos/páginas do projeto em miniaturas horizontais.

Cada thumbnail deve mostrar:
- Número da foto no dump, exemplo: 01, 02, 03
- Prévia da composição
- Borda branca quando estiver selecionada
- Estado de hover
- Ícone discreto se houver ajustes aplicados
- Ícone discreto se houver filtro aplicado

Funcionalidades:
- Adicionar fotos
- Selecionar foto
- Reordenar fotos por drag and drop
- Duplicar foto
- Remover foto
- Renomear foto opcionalmente
- Abrir menu contextual com botão direito
- Navegar horizontalmente quando houver muitas fotos
- Mostrar contador: "10 fotos"

A seção deve ser colapsável.

Estados da seção:
1. Expandida:
- Mostra todas as thumbnails.
- Altura aproximada entre 140px e 180px.
- Permite drag and drop.
- Mostra botão "Adicionar Fotos".

2. Colapsada:
- Fica como uma barra fina inferior.
- Mostra apenas:
  - Texto "Fotos do Projeto"
  - Quantidade de fotos
  - Foto ativa
  - Botão para expandir
- Deve liberar mais espaço para o canvas.

Controles da seção:
- Botão para colapsar/expandir no canto direito da barra.
- Slider para alterar tamanho das thumbnails.
- Toggle de visualização:
  - Thumbnail grande
  - Thumbnail compacta
  - Grade pequena

Critérios de aceite:
- A seção inferior pode ser colapsada e expandida.
- Ao clicar em uma thumbnail, o canvas muda para aquela foto.
- Ao navegar pelas setas do topo, a thumbnail ativa também muda.
- É possível reordenar as fotos por drag and drop.
- A ordem do filmstrip define a ordem do carrossel/exportação.
- A seção suporta pelo menos 50 fotos sem quebrar layout.
- A seleção ativa é visualmente clara.

====================================================================
8. SIDEBAR ESQUERDA — PROJETO E CAMADAS
====================================================================

A sidebar esquerda deve conter:

1. Seção Projeto
2. Seção Formato do Instagram
3. Seção Camadas
4. Botão Adicionar Foto

--------------------------------------------------------------------
8.1 Seção Projeto
--------------------------------------------------------------------

Campos:
- Nome do projeto
- Status de salvamento automático
- Formato atual
- Quantidade de fotos

Exemplo:
Projeto
Nome: Novo Projeto
Formato: Post Feed 4:5
Fotos: 10
Status: Salvo automaticamente

Critérios de aceite:
- Nome do projeto pode ser editado.
- Status de salvamento muda para:
  - Salvando...
  - Salvo
  - Erro ao salvar
- Dados persistem ao fechar e abrir o app.

--------------------------------------------------------------------
8.2 Seção Camadas
--------------------------------------------------------------------

A seção de camadas deve listar todos os elementos da foto/página ativa.

Exemplo:
- Borda
- Imagem 4
- Imagem 3
- Imagem 2
- Imagem 1
- Plano de Fundo

Cada camada deve ter:
- Thumbnail pequena
- Nome da camada
- Ícone de visibilidade
- Ícone de bloqueio
- Alça de arrastar/reordenar
- Estado selecionado
- Menu de opções

Funcionalidades por camada:
- Selecionar
- Renomear
- Mostrar/ocultar
- Bloquear/desbloquear
- Reordenar
- Duplicar
- Excluir
- Alterar opacidade
- Resetar transformações
- Enviar para frente
- Enviar para trás
- Agrupar/desagrupar, se possível

Tipos de camada:
- Imagem
- Texto
- Forma
- Borda
- Fundo

Critérios de aceite:
- Selecionar uma camada seleciona o elemento correspondente no canvas.
- Selecionar elemento no canvas seleciona a camada correspondente.
- Reordenar camadas altera a ordem visual no canvas.
- Camada bloqueada não pode ser movida nem editada.
- Camada oculta desaparece do canvas e não aparece na exportação.
- Camada de fundo pode ser bloqueada por padrão.
- O painel de camadas sempre mostra apenas as camadas da foto ativa.

====================================================================
9. SIDEBAR DIREITA — ABAS DE EDIÇÃO
====================================================================

A sidebar direita deve ter abas no topo:

1. Ajustes
2. Filtros
3. Cortar

A aba ativa deve ter destaque visual branco ou sublinhado discreto.

A sidebar direita deve exibir claramente o alvo de edição atual.

Exemplo de label no topo:
"Editando: Foto 2"

Regras:
- Ajustes e Filtros só aparecem ativos quando uma camada de imagem estiver selecionada.
- Se o usuário selecionar o canvas/background, mostrar apenas controles de background.
- Se o usuário selecionar texto, mostrar controles de texto.
- Se o usuário selecionar forma/borda, mostrar controles de forma/borda.
- Se nenhuma foto estiver selecionada, os sliders de Ajustes e os cards de Filtros devem ficar desabilitados ou mostrar um estado vazio elegante.

====================================================================
10. ABA AJUSTES
====================================================================

A aba Ajustes deve ser inspirada no editor de fotos nativo do iPhone.

IMPORTANTE:
A aba Ajustes deve editar somente a camada de imagem selecionada dentro do canvas. Ela não deve alterar o canvas inteiro, nem outras fotos da mesma composição.

No topo da aba deve existir um pequeno indicador de alvo:
- "Editando: Foto selecionada"
- Nome da camada selecionada, exemplo: "Imagem 3"

Se nenhuma camada de imagem estiver selecionada, mostrar:
"Selecione uma foto no canvas para editar os ajustes.

Ela deve ter um botão no topo:

[ Automático ]

Ao clicar em Automático:
- A aplicação aplica uma correção automática equilibrada de exposição, contraste, sombras, realces, ponto preto, nitidez e redução de ruído somente na foto/camada de imagem selecionada.
- O usuário pode desfazer.
- O botão deve indicar quando automático foi aplicado.

A aba deve ser dividida em grupos colapsáveis:

1. Luz
2. Cor
3. Preto e Branco
4. Detalhes
5. Granulação / ISO
6. Óptica
7. Presets de Ajuste
8. Reset

--------------------------------------------------------------------
10.1 Grupo Luz
--------------------------------------------------------------------

Sliders obrigatórios:

1. Exposição
- Range: -100 a +100
- Default: 0
- Afeta a luminosidade geral da foto selecionada.

2. Brilho Inteligente / Brilliance
- Range: -100 a +100
- Default: 0
- Recupera detalhes em áreas claras e escuras da foto selecionada de forma equilibrada.

3. Realces
- Range: -100 a +100
- Default: 0
- Controla áreas claras da foto selecionada.

4. Sombras
- Range: -100 a +100
- Default: 0
- Controla áreas escuras da foto selecionada.

5. Contraste
- Range: -100 a +100
- Default: 0
- Aumenta ou reduz a diferença entre tons claros e escuros da foto selecionada.

6. Luminosidade
- Range: -100 a +100
- Default: 0
- Controla o brilho simples da foto selecionada.

7. Ponto Preto
- Range: -100 a +100
- Default: 0
- Intensifica ou suaviza os pretos da foto selecionada.

Critérios de aceite:
- Cada slider exibe valor numérico.
- Dois cliques no nome ou botão reset individual volta o slider para 0.
- Alterações aparecem em tempo real somente na foto selecionada.
- Ajustes são não destrutivos.
- Ajustes ficam salvos individualmente por camada de imagem.
- Alterar um slider não deve modificar outras fotos, textos, formas, bordas ou background do canvas.

--------------------------------------------------------------------
10.2 Grupo Cor
--------------------------------------------------------------------

Mesmo sendo um app preto e branco, a aba Cor deve existir para controle fino antes da conversão monocromática.

Sliders obrigatórios:

1. Saturação
- Range: -100 a +100
- Default: 0
- Controla intensidade das cores originais antes da conversão/filtro.

2. Vivacidade
- Range: -100 a +100
- Default: 0
- Ajusta intensidade seletiva de tons menos saturados.

3. Temperatura
- Range: -100 a +100
- Default: 0
- Visual do slider pode ter gradiente frio/quente.
- Mesmo em P&B, influencia a interpretação tonal.

4. Matiz
- Range: -100 a +100
- Default: 0
- Visual do slider pode ter gradiente cromático discreto.
- Mesmo em P&B, influencia a separação tonal.

Critérios de aceite:
- Sliders funcionam mesmo em imagens preto e branco.
- Quando um filtro P&B está ativo, os controles de cor continuam podendo influenciar o mapeamento tonal.
- UI permanece majoritariamente monocromática, com gradientes mínimos apenas onde necessário.

--------------------------------------------------------------------
10.3 Grupo Preto e Branco
--------------------------------------------------------------------

Controles específicos para estética noir:

1. Intensidade P&B
- Range: 0 a 100
- Default: 100
- Controla quanto da imagem vira preto e branco.

2. Separação Tonal
- Range: -100 a +100
- Default: 0
- Aumenta distinção entre tons próximos.

3. Profundidade dos Pretos
- Range: -100 a +100
- Default: 0
- Dá mais peso às sombras.

4. Brancos Brilhantes
- Range: -100 a +100
- Default: 0
- Realça pontos de luz.

5. Fade
- Range: 0 a 100
- Default: 0
- Levanta os pretos para um visual mais vintage.

6. Curva Noir
- Seleção:
  - Suave
  - Clássica
  - Alta Contraste
  - Cinemática
  - Vintage

Critérios de aceite:
- O usuário consegue criar visual noir forte sem depender apenas dos filtros.
- As alterações são aplicadas em tempo real.
- O grupo pode ser colapsado.
- Valores persistem individualmente por camada de imagem.

--------------------------------------------------------------------
10.4 Grupo Detalhes
--------------------------------------------------------------------

Sliders obrigatórios:

1. Nitidez
- Range: 0 a 100
- Default: 0
- Aumenta definição de bordas.

2. Definição
- Range: 0 a 100
- Default: 0
- Aumenta microcontraste.

3. Redução de Ruído
- Range: 0 a 100
- Default: 0
- Suaviza ruído digital.

4. Claridade
- Range: -100 a +100
- Default: 0
- Controla presença de médios tons.

5. Textura
- Range: -100 a +100
- Default: 0
- Controla sensação de superfície/detalhe.

Critérios de aceite:
- Nitidez e definição não devem destruir a imagem em valores moderados.
- Redução de ruído deve suavizar sem borrar excessivamente.
- Todos os ajustes devem ser não destrutivos e aplicados somente à camada de imagem selecionada.

--------------------------------------------------------------------
10.5 Grupo Granulação / ISO
--------------------------------------------------------------------

Este grupo é essencial para o conceito noir.

Controles obrigatórios:

1. Granulação
- Range: 0 a 100
- Default: 0
- Adiciona grão de filme.

2. Tamanho do Grão
- Range: 1 a 10
- Default: 3
- Controla escala do grão.

3. Aspereza do Grão
- Range: 0 a 100
- Default: 30
- Controla irregularidade.

4. ISO Simulado
- Seleção:
  - ISO 100
  - ISO 200
  - ISO 400
  - ISO 800
  - ISO 1600
  - ISO 3200

5. Tipo de Grão
- Seleção:
  - Digital suave
  - Filme 35mm
  - Filme antigo
  - Jornal noir
  - Cinemático

Critérios de aceite:
- Granulação aparece na prévia e na exportação somente sobre a foto selecionada.
- O grão deve parecer orgânico, não apenas ruído aleatório feio.
- O grão respeita a resolução final exportada.
- O usuário pode desligar completamente a granulação.

--------------------------------------------------------------------
10.6 Grupo Óptica
--------------------------------------------------------------------

Sliders obrigatórios:

1. Vinheta
- Range: -100 a +100
- Default: 0
- Valores positivos escurecem bordas.
- Valores negativos clareiam bordas.

2. Intensidade da Vinheta
- Range: 0 a 100
- Default: 50

3. Suavidade da Vinheta
- Range: 0 a 100
- Default: 50

4. Centro da Vinheta
- Controle visual opcional ou valores X/Y.
- Default: centro da imagem.

5. Distorção Sutil
- Range: -50 a +50
- Default: 0
- Simula leve distorção de lente.

Critérios de aceite:
- Vinheta é aplicada em tempo real somente na foto selecionada.
- Vinheta aparece na exportação somente sobre a foto/camada correspondente.
- O usuário consegue criar visual noir cinematográfico.

--------------------------------------------------------------------
10.7 Presets de Ajuste
--------------------------------------------------------------------

Criar presets rápidos:

1. Noir Suave
2. Noir Alto Contraste
3. Prata Limpa
4. Vintage Fade
5. Filme Granulado
6. Jornal Antigo

Cada preset deve alterar os sliders de Ajustes, mas continuar editável pelo usuário.

Critérios de aceite:
- Aplicar preset muda os sliders correspondentes.
- O usuário pode ajustar depois.
- É possível resetar para estado original.
- Preset aplicado deve aparecer como label discreta.

--------------------------------------------------------------------
10.8 Reset
--------------------------------------------------------------------

A aba Ajustes deve ter:
- Botão "Redefinir Ajustes"
- Botão "Resetar Grupo" dentro de cada grupo
- Reset individual por slider

Critérios de aceite:
- Reset geral volta todos os ajustes da foto/camada para padrão.
- Reset de grupo afeta apenas aquele grupo.
- Reset individual afeta apenas um slider.

====================================================================
11. ABA FILTROS
====================================================================

A aba Filtros deve apresentar presets visuais em preto e branco.

IMPORTANTE:
Os filtros são aplicados somente à foto/camada de imagem selecionada dentro do canvas. Eles não são aplicados no canvas inteiro.

Exemplo:
- Em uma composição com 4 fotos, o usuário pode aplicar "Tons de Prata" apenas na imagem superior esquerda.
- Depois pode selecionar outra imagem da mesma composição e aplicar "Vintage".
- O background, as bordas, os textos e as demais imagens permanecem intactos.

Se nenhuma camada de imagem estiver selecionada, a aba Filtros deve mostrar:
"Selecione uma foto no canvas para aplicar um filtro.

Layout:
- Lista vertical de cards
- Cada card com thumbnail de preview
- Nome do filtro
- Breve descrição
- Estado selecionado
- Slider de intensidade do filtro

No topo:
Título:
"Predefinições em Preto e Branco"

Filtros obrigatórios:

1. Preto e Branco Alto Contraste
Descrição:
"Contraste intenso com pretos profundos e brancos brilhantes."

Características:
- Pretos densos
- Realces fortes
- Ideal para fotos urbanas, noite, chuva, sombras e silhuetas

2. Tons de Prata
Descrição:
"P&B elegante com médios tons brilhantes e acabamento refinado."

Características:
- Cinzas suaves
- Menos contraste agressivo
- Aparência premium/editorial
- Bom para retratos, moda e fotos de lifestyle

3. Vintage
Descrição:
"Preto e branco suavizado, com fade, textura e sensação atemporal."

Características:
- Pretos levantados
- Contraste moderado
- Granulação sutil
- Aparência de filme antigo

4. Mono
Descrição:
"Preto e branco limpo e neutro, inspirado no visual clássico de edição mobile."

Características:
- Conversão P&B equilibrada
- Contraste médio
- Pouca interferência estética

5. Tonal
Descrição:
"Contraste equilibrado com cinzas ricos e transição suave entre tons."

Características:
- Mais controle de médios tons
- Aparência elegante
- Bom para arquitetura, cafés, ruas e retratos

6. Noir
Descrição:
"P&B dramático com sombras profundas e atmosfera cinematográfica."

Características:
- Alto contraste
- Vinheta leve
- Pretos marcantes
- Ideal para estética noir

7. Silvertone
Descrição:
"Realces brilhantes com sensação metálica e acabamento de prata."

Características:
- Brancos destacados
- Cinzas frios
- Visual sofisticado

8. Jornal Noir
Descrição:
"Textura granulada e contraste seco, inspirado em fotografia impressa antiga."

Características:
- Grão mais visível
- Contraste seco
- Pretos fortes

Cada filtro deve ter:
- Intensidade: 0 a 100
- Default: 100 ao aplicar
- Botão aplicar
- Estado selecionado
- Preview baseado na foto/camada de imagem selecionada

Comportamento:
- Apenas um filtro principal pode estar ativo por camada de imagem.
- O usuário pode ajustar a intensidade.
- O filtro deve ser não destrutivo.
- O filtro deve combinar com os ajustes manuais da mesma foto selecionada.
- Os ajustes manuais da foto selecionada não devem ser perdidos ao trocar filtro.
- A ordem de processamento deve ser previsível:
  1. Transformação/crop
  2. Ajustes básicos
  3. Conversão/filtro
  4. Granulação
  5. Vinheta
  6. Exportação

Critérios de aceite:
- A aba Filtros exibe todos os filtros obrigatórios.
- Cada filtro possui preview visual.
- Clicar no filtro aplica imediatamente somente na foto/camada de imagem selecionada.
- Slider de intensidade funciona em tempo real.
- Filtro aplicado aparece marcado.
- O usuário pode remover filtro e voltar ao estado sem filtro.
- Filtros persistem individualmente por camada de imagem.
- Aplicar um filtro em uma imagem não altera as demais imagens da mesma página/canvas.
- O canvas/background nunca recebe filtro fotográfico.

====================================================================
12. ABA CORTAR
====================================================================

A aba Cortar deve permitir edição de enquadramento semelhante ao iPhone.

Controles obrigatórios:

1. Proporção
- Livre
- Original
- Quadrado 1:1
- Feed 4:5
- Stories/Reels 9:16
- Horizontal 16:9

2. Girar
- Botão girar 90° para esquerda
- Botão girar 90° para direita

3. Espelhar
- Horizontal
- Vertical

4. Endireitar
- Slider -45° a +45°
- Default 0

5. Perspectiva
- Vertical: -100 a +100
- Horizontal: -100 a +100

6. Botões
- Aplicar corte
- Cancelar corte
- Resetar corte

Critérios de aceite:
- O modo crop mostra overlay visual.
- O usuário pode confirmar ou cancelar.
- O corte não destrói o arquivo original.
- Crop aparece corretamente na exportação.
- Proporções fixas funcionam corretamente.

====================================================================
13. ADICIONAR FOTOS
====================================================================

O usuário deve conseguir adicionar fotos de várias formas:

- Botão "Adicionar Fotos" no filmstrip inferior
- Botão "+" na sidebar de camadas
- Drag and drop de arquivos para a janela
- Menu Arquivo > Importar Fotos

Formatos aceitos:
- JPG
- JPEG
- PNG
- WEBP
- HEIC, se possível
- TIFF opcional

Comportamento:
- Ao adicionar uma foto ao projeto, ela entra no filmstrip inferior.
- A foto recebe um número sequencial.
- A primeira foto adicionada vira a foto ativa.
- Fotos adicionais entram após a foto atual ou no final, conforme escolha.
- Deve suportar múltiplo upload de uma vez.
- Deve preservar o arquivo original.

Critérios de aceite:
- É possível importar múltiplas fotos.
- As fotos aparecem no filmstrip inferior.
- Cada foto pode ser editada separadamente.
- O app não altera os arquivos originais.
- O projeto salva referências locais e/ou cópias seguras das imagens.

====================================================================
14. COMPOSIÇÕES E COLLAGES
====================================================================

O Noir Dump Studio deve permitir criar composições dentro de cada foto/página.

Funcionalidades:
- Adicionar múltiplas imagens no mesmo canvas
- Criar layout manual
- Criar grid simples
- Ajustar espaçamento entre imagens
- Adicionar borda externa
- Adicionar divisórias internas
- Alterar cor da borda:
  - Branco
  - Cinza claro
  - Cinza escuro
  - Preto
- Alterar espessura da borda
- Arredondamento opcional, mas default deve ser 0 para visual editorial
- Alinhar elementos
- Distribuir elementos
- Snap to grid
- Guias inteligentes

Templates de collage opcionais:
- 1 foto cheia
- 2 fotos verticais
- 2 fotos horizontais
- 1 grande à esquerda + 2 pequenas à direita
- 1 grande em cima + 2 pequenas embaixo
- Grade 2x2
- Triptych vertical
- Layout editorial assimétrico

Critérios de aceite:
- É possível criar uma composição manual sem template.
- É possível aplicar templates de collage.
- Bordas e espaçamentos aparecem corretamente na exportação.
- Elementos podem ser alinhados visualmente.
- O app não deve parecer um editor infantil de collage; manter visual premium.

====================================================================
15. EXPORTAÇÃO
====================================================================

O botão Exportar deve permitir:

Exportar foto atual:
- PNG
- JPG
- Qualidade JPG configurável

Exportar dump completo:
- Exporta todas as fotos do projeto na ordem do filmstrip
- Arquivos nomeados sequencialmente:
  - noir-dump-01.jpg
  - noir-dump-02.jpg
  - noir-dump-03.jpg

Configurações de exportação:
- Formato de arquivo: JPG ou PNG
- Qualidade JPG: 70 a 100
- Pasta de destino
- Exportar foto atual
- Exportar todas as fotos
- Manter tamanho final:
  - 1080x1350 para Feed
  - 1080x1920 para Stories/Reels

Critérios de aceite:
- Exportação respeita resolução exata.
- Exportação respeita ordem do filmstrip.
- Exportação inclui ajustes, filtros, crop, textos, bordas, grão e vinheta, respeitando o escopo individual de cada camada de imagem.
- Arquivos exportados possuem nomes organizados.
- Usuário recebe feedback de sucesso ou erro.

====================================================================
16. PERSISTÊNCIA LOCAL, PROJETOS, PREFERÊNCIAS E ESTADOS SALVOS
====================================================================

A aplicação deve ser local-first e deve persistir tudo em SQLite, rodando junto com o Electron.

O usuário deve poder:
- Criar projetos.
- Salvar projetos automaticamente.
- Fechar a aplicação e continuar depois exatamente de onde parou.
- Abrir projetos recentes.
- Duplicar projetos.
- Renomear projetos.
- Arquivar ou excluir projetos.
- Salvar estados específicos de um projeto para voltar depois.
- Salvar preferências pessoais da aplicação.
- Manter configurações de exportação padrão.
- Manter preferências visuais da interface.

Regra fundamental:
Todo ajuste relevante feito pelo usuário deve ser salvo automaticamente no SQLite.

Isso inclui:
- Criação de projeto.
- Alteração do nome do projeto.
- Alteração do formato do Instagram.
- Adição de fotos.
- Remoção de fotos.
- Reordenação de fotos no dump.
- Seleção da foto ativa.
- Alteração do canvas estrutural.
- Alteração da cor de background do canvas.
- Adição, remoção ou alteração de camadas.
- Reordenação de camadas.
- Visibilidade e bloqueio de camadas.
- Transformações de camadas.
- Crop de camadas de imagem.
- Ajustes individuais de camadas de imagem.
- Filtros individuais de camadas de imagem.
- Intensidade dos filtros.
- Granulação, vinheta e níveis da foto selecionada.
- Estado de painel aberto/fechado.
- Estado do menu de ativação rápida.
- Grid ligado/desligado e tipo de grid ativo.
- Réguas ligadas/desligadas.
- Guias inteligentes ligadas/desligadas.
- Snap ligado/desligado.
- Filmstrip inferior expandido ou colapsado.
- Último zoom usado.
- Última foto selecionada.
- Preferências do usuário.
- Configurações de exportação.

--------------------------------------------------------------------
16.1 Projetos salvos
--------------------------------------------------------------------

Cada projeto deve ser salvo no banco SQLite local.

A tela inicial deve permitir:
- Criar novo projeto.
- Abrir projeto existente.
- Ver projetos recentes.
- Ver nome do projeto.
- Ver formato do projeto.
- Ver quantidade de fotos.
- Ver data de última edição.
- Duplicar projeto.
- Excluir projeto.

Ao abrir um projeto salvo, a aplicação deve restaurar:
- Formato escolhido.
- Lista e ordem das fotos do dump.
- Foto/página ativa.
- Canvas de cada foto/página.
- Camadas de cada canvas.
- Posição, tamanho, rotação e opacidade das camadas.
- Ajustes individuais de cada camada de imagem.
- Filtro individual de cada camada de imagem.
- Crop individual de cada camada de imagem.
- Background do canvas.
- Estado das bolinhas do carrossel.
- Estado do filmstrip inferior.
- Estado do menu de ativação rápida.
- Estado de grid, réguas, guias inteligentes e snap.
- Zoom e posição de visualização, se possível.

Critérios de aceite:
- O usuário consegue fechar o app e continuar depois sem perder trabalho.
- A lista de projetos recentes aparece corretamente na abertura.
- A última edição de cada projeto aparece com data/hora.
- Duplicar um projeto cria uma cópia independente.
- Excluir projeto pede confirmação antes.
- Ao reabrir projeto, a aparência do canvas deve ser equivalente ao momento do último autosave.

--------------------------------------------------------------------
16.2 Estados salvos do projeto / snapshots
--------------------------------------------------------------------

Além do autosave contínuo, o app deve permitir salvar estados nomeados de um projeto.

Nome sugerido da funcionalidade:
- Estados do Projeto
- Snapshots
- Versões Salvas

O usuário deve poder criar um estado manual com nome, por exemplo:
- Antes dos filtros
- Versão feed final
- Versão com prata
- Teste vintage
- Cliente revisão 01

Cada estado salvo deve armazenar uma fotografia completa do projeto naquele momento:
- Dados do projeto.
- Formato.
- Ordem das fotos.
- Todos os canvases.
- Todas as camadas.
- Todos os ajustes por camada de imagem.
- Todos os filtros por camada de imagem.
- Configurações de background.
- Configurações de exportação.

Interface sugerida:
- Botão ou menu discreto no Top Bar: "Salvar Estado"
- Menu secundário: "Estados do Projeto"
- Lista de estados salvos com:
  - Nome
  - Data/hora
  - Miniatura da foto ativa no momento
  - Ações: Restaurar, Duplicar, Renomear, Excluir

Comportamento:
- Restaurar um estado deve substituir o estado atual do projeto após confirmação.
- Antes de restaurar, oferecer opção de salvar o estado atual.
- Estados salvos devem ser persistidos no SQLite.
- Snapshots devem ser compactos sempre que possível, mas completos o bastante para restauração fiel.

Critérios de aceite:
- O usuário consegue salvar manualmente um estado do projeto.
- O usuário consegue restaurar um estado anterior.
- A restauração recupera fotos, ordem, camadas, filtros e ajustes corretamente.
- Estados salvos continuam disponíveis depois de fechar e abrir o app.
- Restaurar estado não altera os arquivos originais importados.

--------------------------------------------------------------------
16.3 Preferências do usuário
--------------------------------------------------------------------

O usuário deve poder salvar preferências globais da aplicação.

Criar uma área de Preferências/Settings acessível por ícone no Top Bar.

Preferências obrigatórias:

Aparência:
- Tema escuro noir como padrão.
- Densidade da interface:
  - Compacta
  - Confortável
- Tamanho padrão das thumbnails do filmstrip.
- Filmstrip iniciar expandido ou colapsado.
- Mostrar ou ocultar tooltips.
- Mostrar ou ocultar guias do canvas por padrão.
- Mostrar ou ocultar grid por padrão.
- Mostrar ou ocultar réguas por padrão.
- Mostrar ou ocultar guias inteligentes por padrão.
- Ativar ou desativar snap por padrão.

Projeto:
- Formato padrão de novo projeto:
  - Post Feed 4:5 — 1080x1350
  - Stories/Reels 9:16 — 1080x1920
- Nome padrão de projeto, exemplo: "Novo Dump"
- Criar primeira página automaticamente ao iniciar projeto.
- Perguntar antes de trocar formato do projeto.

Edição:
- Selecionar automaticamente foto ao importar.
- Aplicar filtro padrão ao importar, opcional.
- Filtro padrão:
  - Nenhum
  - Preto e Branco Alto Contraste
  - Tons de Prata
  - Vintage
  - Mono
  - Tonal
  - Noir
  - Silvertone
  - Jornal Noir
- Intensidade padrão do filtro.
- Granulação padrão.
- Vinheta padrão.
- Manter ajustes individuais por foto sempre ativado.

Exportação:
- Formato padrão:
  - JPG
  - PNG
- Qualidade JPG padrão.
- Pasta padrão de exportação.
- Padrão de nome dos arquivos, exemplo:
  - noir-dump-{index}
  - {project-name}-{index}
- Exportar foto atual ou dump completo como padrão.
- Sempre exportar na resolução oficial do formato escolhido.

Autosave:
- Autosave ativado por padrão e não deve ser removido.
- Intervalo/debounce técnico configurável internamente.
- Mostrar status de salvamento.
- Criar snapshots automáticos opcionais em intervalos importantes, como:
  - Ao abrir projeto
  - Antes de exportar
  - Antes de restaurar estado
  - Antes de alteração de formato

Critérios de aceite:
- Preferências persistem após fechar e abrir o app.
- Preferências são salvas no SQLite.
- Novo projeto respeita preferências padrão.
- Exportação respeita preferências padrão.
- Estado visual da interface respeita preferências salvas.
- Preferências não sobrescrevem dados específicos de projetos já existentes sem confirmação.

--------------------------------------------------------------------
16.4 Banco SQLite
--------------------------------------------------------------------

Usar SQLite local como fonte principal de verdade.

O banco deve ser criado automaticamente na primeira abertura do app.

Requisitos técnicos:
- Criar migrations versionadas.
- Não recriar banco se já existir.
- Não perder dados em atualizações.
- Ter camada de repository/service para abstrair acesso ao banco.
- Evitar queries SQL espalhadas pela UI.
- Usar transações para operações grandes, como importar múltiplas fotos, reordenar dump, salvar snapshot e restaurar estado.
- Salvar payloads complexos como JSON quando fizer sentido, mas manter campos essenciais indexáveis.

Estrutura sugerida de tabelas:

app_preferences
- id
- key
- value_json
- created_at
- updated_at

projects
- id
- name
- format
- default_export_format
- default_export_quality
- last_opened_at
- created_at
- updated_at
- archived_at

project_ui_state
- id
- project_id
- active_dump_item_id
- selected_layer_id
- selected_layer_ids_json
- filmstrip_collapsed
- filmstrip_thumbnail_size
- active_right_tab
- canvas_zoom
- canvas_pan_x
- canvas_pan_y
- quick_menu_grid_enabled
- quick_menu_grid_type
- quick_menu_rulers_enabled
- quick_menu_smart_guides_enabled
- quick_menu_snap_enabled
- quick_menu_safe_margins_enabled
- left_sidebar_collapsed
- right_sidebar_collapsed
- created_at
- updated_at

project_dump_items
- id
- project_id
- order_index
- title
- preview_path
- canvas_width
- canvas_height
- canvas_background
- canvas_settings_json
- created_at
- updated_at

layers
- id
- dump_item_id
- type
- name
- order_index
- visible
- locked
- opacity
- transform_json
- data_json
- created_at
- updated_at

image_layer_adjustments
- id
- layer_id
- exposure
- brilliance
- highlights
- shadows
- contrast
- brightness
- black_point
- saturation
- vibrance
- temperature
- tint
- bw_intensity
- tonal_separation
- black_depth
- white_boost
- fade
- clarity
- texture
- sharpness
- definition
- noise_reduction
- grain
- grain_size
- grain_roughness
- iso_simulation
- vignette
- vignette_softness
- vignette_intensity
- created_at
- updated_at

image_layer_filters
- id
- layer_id
- filter_name
- intensity
- created_at
- updated_at

image_layer_crops
- id
- layer_id
- aspect_ratio
- rotation
- straighten
- perspective_vertical
- perspective_horizontal
- flip_horizontal
- flip_vertical
- crop_json
- created_at
- updated_at

project_export_settings
- id
- project_id
- export_format
- jpg_quality
- destination_path
- file_naming_pattern
- export_scope
- created_at
- updated_at

project_snapshots
- id
- project_id
- name
- thumbnail_path
- snapshot_json
- created_at

original_assets
- id
- project_id
- source_path
- internal_copy_path
- file_name
- mime_type
- width
- height
- size_bytes
- checksum
- created_at

Critérios de aceite:
- O banco SQLite é criado automaticamente.
- Projetos, preferências, estados e ajustes persistem corretamente.
- Ajustes e filtros são salvos por layer_id, nunca globalmente no canvas.
- O estado de UI do projeto é restaurado ao abrir.
- Migrations são executadas sem apagar dados existentes.
- Operações críticas usam transação.

====================================================================
17. AUTOSAVE E CONTINUIDADE DE EDIÇÃO
====================================================================

O app deve salvar automaticamente todo ajuste feito pelo usuário.

O autosave é uma característica central do Noir Dump Studio, não um detalhe secundário.

Comportamento:
- Após qualquer alteração relevante, salvar no SQLite com debounce.
- Alterações de slider devem ser salvas sem travar a interface.
- Enquanto o usuário arrasta um slider, a UI deve atualizar em tempo real.
- O banco deve receber a versão consolidada após debounce, não necessariamente a cada pixel de movimento.
- Alterações estruturais importantes devem salvar imediatamente ou com debounce curto.
- Exibir status no rodapé, sidebar ou top bar:
  - Salvando...
  - Salvo às 14:32
  - Erro ao salvar
  - Offline/local — salvo neste dispositivo, se fizer sentido

Eventos que devem disparar autosave:
- Criar projeto.
- Renomear projeto.
- Trocar formato.
- Adicionar fotos.
- Remover fotos.
- Reordenar fotos no filmstrip.
- Selecionar foto ativa.
- Colapsar/expandir filmstrip.
- Mudar tamanho das thumbnails.
- Adicionar camada.
- Remover camada.
- Mover camada.
- Redimensionar camada.
- Girar camada.
- Alterar opacidade.
- Ocultar/mostrar camada.
- Bloquear/desbloquear camada.
- Reordenar camadas.
- Aplicar crop em camada de imagem.
- Alterar qualquer slider de Ajustes na foto selecionada.
- Aplicar ou remover filtro na foto selecionada.
- Alterar intensidade de filtro.
- Alterar background do canvas.
- Alterar configurações de exportação.
- Alterar preferências do usuário.
- Criar, renomear, excluir ou restaurar snapshot.

Regras de continuidade:
- Ao reabrir o app, mostrar a tela inicial com projetos recentes.
- Se o usuário fechou com um projeto aberto, oferecer opção de continuar do último projeto.
- Ao abrir um projeto, restaurar a última foto ativa e a última camada selecionada, se ainda existir.
- Restaurar filmstrip expandido/colapsado conforme último estado ou preferência do usuário.
- Restaurar aba direita ativa, por exemplo Ajustes ou Filtros.
- Restaurar zoom e pan do canvas quando possível.

Tratamento de erro:
- Se o autosave falhar, mostrar aviso discreto, mas claro.
- Não apagar alterações da UI imediatamente se o salvamento falhar.
- Tentar salvar novamente quando possível.
- Manter fila simples de alterações pendentes, se necessário.
- Evitar corrupção do banco usando transações.

Critérios de aceite:
- Toda alteração importante é salva automaticamente no SQLite.
- O app não perde dados ao fechar e abrir.
- Sliders de ajustes são autosave por foto/camada de imagem selecionada.
- Filtros são autosave por foto/camada de imagem selecionada.
- Preferências globais são autosave.
- Projetos recentes aparecem na tela inicial.
- Estados/snapshots salvos manualmente permanecem disponíveis após reiniciar o app.
- Status visual de salvamento é claro.
- Debounce evita gravações excessivas sem comprometer a continuidade.
- O usuário consegue continuar a edição depois sem perceber perda de contexto.

====================================================================
18. ATALHOS DE TECLADO
====================================================================

Implementar atalhos:

Navegação:
- Seta direita: próxima foto
- Seta esquerda: foto anterior

Edição:
- Ctrl/Cmd + Z: desfazer
- Ctrl/Cmd + Shift + Z: refazer
- Delete/Backspace: excluir camada selecionada
- Ctrl/Cmd + D: duplicar camada
- Ctrl/Cmd + S: salvar manualmente
- Ctrl/Cmd + E: exportar
- Ctrl/Cmd + O: abrir projeto
- Ctrl/Cmd + N: novo projeto
- Ctrl/Cmd + clique: adicionar/remover item da seleção múltipla
- Esc: limpar seleção ou fechar bubble contextual
- Espaço: pan temporário
- +: zoom in
- -: zoom out
- 0: fit canvas
- 1: zoom 100%

Critérios de aceite:
- Atalhos funcionam no Windows, macOS e Linux.
- Atalhos não conflitam com inputs de texto.
- Undo/redo registra alterações importantes.

====================================================================
19. ESTADOS VAZIOS
====================================================================

A aplicação deve ter estados vazios elegantes.

Quando não houver projeto:
- Mostrar tela inicial com:
  - Criar novo projeto
  - Abrir projeto existente
  - Projetos recentes

Quando projeto não tiver fotos:
- Canvas central deve mostrar área de drop:
  "Arraste suas fotos para começar"
- Botão "Adicionar Fotos"

Quando nenhuma camada estiver selecionada:
- Sidebar direita não deve mostrar ajustes fotográficos globais.
- Deve mostrar mensagem:
  "Selecione uma foto no canvas para editar ajustes, filtros e corte."
- Opcionalmente, pode mostrar apenas controles estruturais do canvas, como background, guias e grid.

Critérios de aceite:
- Nenhuma área fica quebrada ou vazia sem orientação.
- Estados vazios são elegantes e úteis.
- O usuário entende imediatamente o próximo passo.

====================================================================
20. COMPONENTES PRINCIPAIS
====================================================================

Criar os seguintes componentes:

AppShell
- Estrutura geral da aplicação

TopBar
- Nome do app
- Navegação entre fotos
- Undo/redo
- Zoom
- Exportar

ProjectSidebar
- Projeto
- Formato do Instagram
- Camadas

FormatSelector
- Cards Post Feed e Stories/Reels

LayersPanel
- Lista de camadas
- Ações de camada

CanvasEditor
- Área principal de edição

CanvasToolbar
- Toolbar vertical de ferramentas

QuickActivationMenu
- Menu de ativação rápida para grid, réguas, guias inteligentes, snap e margens seguras

SelectionBubble
- Bubble contextual de seleção com alinhamento, agrupamento e filtro rápido

CarouselDots
- Bolinhas estilo Instagram

RightInspector
- Container das abas Ajustes, Filtros e Cortar

AdjustmentsPanel
- Sliders e grupos colapsáveis

FiltersPanel
- Lista de filtros com previews e intensidade

CropPanel
- Ferramentas de crop

ProjectFilmstrip
- Fotos do projeto
- Thumbnails
- Drag and drop
- Colapsável

ExportDialog
- Configurações de exportação

PreferencesDialog
- Preferências globais do usuário
- Aparência, projeto, edição, exportação e autosave

ProjectSnapshotsPanel
- Estados salvos do projeto
- Criar, restaurar, renomear e excluir snapshots

RecentProjectsScreen
- Tela inicial com projetos recentes
- Criar, abrir, duplicar e excluir projetos

EmptyState
- Estados vazios

ToastSystem
- Feedbacks rápidos

====================================================================
21. CRITÉRIOS GERAIS DE QUALIDADE
====================================================================

A aplicação deve atender aos seguintes critérios:

UI/UX:
- Interface elegante e minimalista
- Visual noir consistente
- Nada visualmente poluído
- Espaçamentos bem definidos
- Ícones monocromáticos
- Tooltips nos ícones
- Estados de hover, ativo, selecionado e desabilitado

Performance:
- Suportar projetos com pelo menos 50 fotos
- Thumbnails devem ser otimizadas
- Canvas não deve travar em operações comuns
- Sliders devem atualizar em tempo real com boa performance

Edição:
- Ajustes não destrutivos
- Filtros não destrutivos
- Crop não destrutivo
- Exportação fiel à prévia
- Grid, réguas, guias e overlays de edição nunca aparecem na exportação
- Cada foto mantém seu próprio estado

Arquitetura:
- Código componentizado
- Separar camada de UI, estado, persistência e processamento de imagem
- Criar camada clara de repositories/services para SQLite
- Criar migrations versionadas
- Tipos TypeScript bem definidos
- Evitar arquivos gigantes
- Criar estrutura clara de pastas
- Autosave deve ser implementado como serviço, não espalhado nos componentes visuais

Acessibilidade:
- Labels nos botões
- Tooltips
- Navegação básica por teclado
- Contraste adequado

====================================================================
22. MODELOS DE DADOS TYPESCRIPT
====================================================================

Criar tipos como:

type InstagramFormat = "feed_4_5" | "story_reel_9_16";

type Project = {
  id: string;
  name: string;
  format: InstagramFormat;
  dumpItems: DumpItem[];
  createdAt: string;
  updatedAt: string;
};


type UserPreferences = {
  id: string;
  appearance: {
    theme: "noir_dark";
    density: "compact" | "comfortable";
    defaultFilmstripCollapsed: boolean;
    defaultThumbnailSize: "small" | "medium" | "large";
    showTooltips: boolean;
    showGuidesByDefault: boolean;
    showGridByDefault: boolean;
    showRulersByDefault: boolean;
    showSmartGuidesByDefault: boolean;
    snapByDefault: boolean;
  };
  projectDefaults: {
    defaultFormat: InstagramFormat;
    defaultProjectName: string;
    createFirstDumpItemAutomatically: boolean;
    confirmBeforeFormatChange: boolean;
  };
  editingDefaults: {
    autoSelectImportedPhoto: boolean;
    defaultFilterName?: PhotoFilter["name"];
    defaultFilterIntensity: number;
    defaultGrain: number;
    defaultVignette: number;
  };
  exportDefaults: {
    format: "jpg" | "png";
    jpgQuality: number;
    destinationPath?: string;
    fileNamingPattern: string;
    exportScope: "current" | "all";
  };
  autosave: {
    enabled: true;
    showStatus: boolean;
    createSnapshotBeforeExport: boolean;
    createSnapshotBeforeFormatChange: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

type ProjectUiState = {
  projectId: string;
  activeDumpItemId?: string;
  selectedLayerId?: string;
  selectedLayerIds?: string[];
  filmstripCollapsed: boolean;
  filmstripThumbnailSize: number;
  activeRightTab: "adjustments" | "filters" | "crop" | "canvas";
  canvasZoom: number;
  canvasPanX: number;
  canvasPanY: number;
  quickMenu: {
    gridEnabled: boolean;
    gridType: "off" | "3x3" | "dense";
    rulersEnabled: boolean;
    smartGuidesEnabled: boolean;
    snapEnabled: boolean;
    safeMarginsEnabled: boolean;
  };
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  updatedAt: string;
};

type ProjectSnapshot = {
  id: string;
  projectId: string;
  name: string;
  thumbnailPath?: string;
  snapshotJson: Record<string, unknown>;
  createdAt: string;
};

// DumpItem representa uma página/foto do carrossel do Instagram.
// Cada item pode conter uma única foto ou uma composição/collage com várias camadas de imagem.
type DumpItem = {
  id: string;
  projectId: string;
  orderIndex: number;
  title: string;
  previewPath?: string;
  canvas: CanvasSettings;
  layers: Layer[];
  createdAt: string;
  updatedAt: string;
};

type CanvasSettings = {
  width: number;
  height: number;
  format: InstagramFormat;
  backgroundColor: "black" | "white" | "light_gray" | "medium_gray" | "dark_gray" | "transparent" | string;
  showGuides: boolean;
  showGrid: boolean;
  // Overlays de apoio são salvos no estado do projeto/UI e não devem ser exportados.
};

type Layer = {
  id: string;
  dumpItemId: string;
  type: "image" | "text" | "shape" | "border" | "background";
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  orderIndex: number;
  transform: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
  };
  data: Record<string, unknown>;

  // Somente camadas type="image" podem possuir ajustes, filtros e crop fotográfico.
  adjustments?: PhotoAdjustments;
  filter?: PhotoFilter;
  crop?: CropSettings;
};

type ImageLayerData = {
  sourcePath: string;
  originalWidth: number;
  originalHeight: number;
  previewPath?: string;
};

type TextLayerData = {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
};

type PhotoAdjustments = {
  exposure: number;
  brilliance: number;
  highlights: number;
  shadows: number;
  contrast: number;
  brightness: number;
  blackPoint: number;
  saturation: number;
  vibrance: number;
  temperature: number;
  tint: number;
  bwIntensity: number;
  tonalSeparation: number;
  blackDepth: number;
  whiteBoost: number;
  fade: number;
  clarity: number;
  texture: number;
  sharpness: number;
  definition: number;
  noiseReduction: number;
  grain: number;
  grainSize: number;
  grainRoughness: number;
  isoSimulation: "100" | "200" | "400" | "800" | "1600" | "3200";
  vignette: number;
  vignetteSoftness: number;
  vignetteIntensity: number;
};

type PhotoFilter = {
  name:
    | "high_contrast_bw"
    | "silver_tones"
    | "vintage"
    | "mono"
    | "tonal"
    | "noir"
    | "silvertone"
    | "newspaper_noir";
  intensity: number;
};

type CropSettings = {
  aspectRatio: "free" | "original" | "1_1" | "4_5" | "9_16" | "16_9";
  rotation: number;
  straighten: number;
  perspectiveVertical: number;
  perspectiveHorizontal: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
};

Regra de modelo:
- Project guarda o projeto inteiro.
- DumpItem guarda cada página/foto do carrossel.
- CanvasSettings guarda apenas propriedades estruturais e background.
- Layer guarda os elementos visuais.
- PhotoAdjustments, PhotoFilter e CropSettings pertencem somente a camadas de imagem.
- UserPreferences guarda preferências globais do usuário.
- ProjectUiState guarda continuidade visual e operacional do projeto, inclusive seleção múltipla e estado do menu de ativação rápida.
- ProjectSnapshot guarda estados nomeados/restauráveis do projeto.
- Nunca salvar filtro ou ajuste no canvas global.
- Todo ajuste relevante deve ter autosave no SQLite.

====================================================================
23. FLUXO PRINCIPAL DO USUÁRIO
====================================================================

Fluxo esperado:

1. Usuário abre o Noir Dump Studio.
2. Tela inicial mostra projetos recentes e opção de continuar último projeto.
3. Usuário cria um novo projeto ou abre um projeto salvo.
4. Se criar novo projeto, escolhe formato:
   - Post Feed 4:5 1080x1350
   - Stories/Reels 9:16 1080x1920
5. Preferências salvas definem padrões iniciais, como formato, filmstrip, exportação e visual.
6. Usuário adiciona várias fotos ao projeto.
7. As fotos aparecem no filmstrip inferior.
8. Tudo é salvo automaticamente no SQLite.
9. Usuário seleciona uma página/foto do dump.
10. A página aparece no canvas central.
11. Usuário seleciona uma foto/camada de imagem dentro do canvas.
12. Usuário ajusta crop, níveis, ajustes gerais e filtros somente nessa foto selecionada.
13. Cada alteração é salva automaticamente por camada de imagem.
14. Usuário pode salvar um estado nomeado do projeto, como "Antes dos filtros" ou "Versão final feed".
15. Usuário navega para próxima foto/página do dump usando:
   - Seta no top bar
   - Teclado
   - Bolinhas abaixo do canvas
   - Filmstrip inferior
16. Usuário repete o processo para o dump inteiro.
17. Usuário exporta uma foto/página ou todas as fotos/páginas em sequência.
18. Antes de exportar, o app pode criar snapshot automático opcional.
19. Arquivos saem prontos para Instagram.
20. Ao fechar e reabrir o app, o projeto continua do ponto salvo.

====================================================================
24. IMPORTANTE
====================================================================

Não criar uma aplicação genérica de edição de imagens.

O foco absoluto é:

- Photo dumps
- Instagram
- Preto e branco
- Estética noir
- Fluxo rápido de edição em lote visual
- Navegação entre fotos
- Filmstrip inferior colapsável
- Ajustes estilo iPhone aplicados por foto/camada de imagem selecionada
- Filtros P&B elegantes aplicados por foto/camada de imagem selecionada
- Camadas e colagens
- Exportação precisa para Instagram

A aplicação deve parecer um produto real, polido e premium.

Reforço final obrigatório:
- O nome correto é Noir Dump Studio.
- Não usar Noar em nenhum lugar da UI, código, README ou metadados.
- Filtros e ajustes nunca são globais no canvas.
- Filtros e ajustes pertencem às fotos/camadas de imagem selecionadas.
- O canvas só pode ter controles globais de composição, formato, background, guias, grids e exportação.
- Todo ajuste, filtro, crop, camada, ordem de fotos, preferência e estado de projeto deve ser salvo no SQLite.
- O app deve permitir continuar projetos depois, com autosave confiável.
- O app deve permitir salvar estados/snapshots nomeados do projeto para restauração futura.
- Preferências globais do usuário devem persistir e influenciar novos projetos.

Comece criando a estrutura do projeto Electron + React + TypeScript + Vite, depois implemente a UI principal completa, depois a persistência local, depois as ferramentas de edição, depois filtros/exportação.

Entregue código funcional, organizado e pronto para evoluir.
```
