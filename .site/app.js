import { RELEASE_REPO } from './config.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const dictionaries = {
  pt: {
    skip:'Pular para o conteúdo',navPlay:'Experimente',navTools:'O que dá pra fazer',navDownload:'Download',getApp:'Quero o app',heroNote:'Para os momentos que não cabem em uma foto.',heroTitle1:'Seu dump.',heroTitle2:'Suas regras.',heroDesc:'O look do seu feed começa no seu rolo de câmera. Junte os cliques, dê seu tom e faça deles uma história.',tryNow:'Brincar com as fotos',noAccount:'Sem conta. Só suas ideias.',dragHint:'Arraste seu próximo dump',rotatePrefix:'Hoje eu quero ',rotate:['montar meu dump.','encontrar meu look.','salvar meu preset.','exportar pro feed.'],manifesto:'Um date. Um café. Um look que deu certo. O cotidiano merece um lugar no seu feed.',playKicker:'Um gostinho do studio',playTitle:'Menos imaginar.<br>Mais experimentar.',playDesc:'Escolha uma foto, encontre seu look e veja o seu dump ganhar personalidade. Tudo acontece aqui no seu navegador.',loadingPhoto:'Carregando foto…',yourMood:'Qual é o mood?',yourMoodDesc:'Mesma foto. Outra sensação.',reset:'Resetar',intensity:'Intensidade',format:'Cabe no seu feed',grain:'Um toque de filme',grainDesc:'Textura analógica, na medida.',savePreview:'Salvar minha prévia · PNG',demoNote:'Esta é uma amostra. No app você tem camadas, layouts, curvas, câmeras, FX e seus próprios presets.',compareKicker:'O detalhe muda tudo',compareTitle:'É a sua foto.<br>Com o seu olhar.',compareDesc:'Deslize e sinta a diferença. Um tratamento de filme, a mesma luz e uma história com muito mais de você.',before:'Antes',after:'Depois',samePhoto:'A mesma foto, dos dois lados.',compareLook:'Look 35mm · motor real do app',possibilitiesKicker:'Seu novo ritual criativo',possibilitiesTitle:'Tem muito mais<br>no seu studio.',possibilitiesDesc:'De um clique bonito a um carrossel inteiro. As ferramentas trabalham juntas para o resultado ter a sua cara.',layoutTitle:'Cada clique encontra seu lugar.',layoutDesc:'Colagens, Polaroids e carrosséis contínuos. Monte a composição e troque o formato preservando suas fotos.',layoutTag:'Do quadrado aos Stories',filtersTitle:'Um look para cada versão sua.',filtersDesc:'44 filtros, simulações de câmera, texturas e ajustes finos. Editorial, filme, preto e branco ou pura experimentação.',filtersTag:'O seu original continua intacto',presetsTitle:'Encontrou seu tom? Guarda.',presetsDesc:'Seus ajustes, filtros e FX viram presets. Organize em pastas e leve seus looks em JSON.',layersTitle:'Liberdade em cada camada.',layersDesc:'Fotos, textos, bordas e efeitos. Ajuste um elemento de cada vez e desfaça quando quiser.',offlineTitle:'O seu processo é seu.',offlineDesc:'Edite no computador, com projetos locais e salvamento automático. Exporte suas páginas em JPG ou PNG.',downloadKicker:'My Dump Studio para Windows',downloadTitle:'Seu próximo dump<br>começa aqui.',downloadDesc:'Leve o studio para o seu computador. Sem prazo de expiração. Sem interromper suas ideias.',comingSoon:'Primeira release em breve',seeGithub:'Conhecer no GitHub',releasePending:'O download será ativado quando o instalador estiver disponível em uma release pública.',faqTitle:'Só mais uma coisa.',faq1q:'Preciso criar uma conta?',faq1a:'Não. O aplicativo trabalha localmente no seu computador. A demonstração desta página também funciona sem conta.',faq2q:'Funciona no Mac ou no celular?',faq2a:'O instalador disponível é para Windows. Você pode experimentar esta página no celular, mas o editor completo é um aplicativo desktop.',faq3q:'As fotos do exemplo são minhas para usar?',faq3a:'As imagens de demonstração vêm de bancos com licença de reutilização. Os autores e as fontes estão na página de créditos.',photoCredits:'Créditos das fotos',faq4q:'Onde encontro a versão mais recente?',faq4a:'O botão de download consulta o último release público do GitHub e seleciona o instalador para Windows. Se a consulta estiver indisponível, você pode conferir os releases no GitHub.',seeReleases:'Ver releases',credits:'Créditos',saved:'Sua prévia está pronta. Agora é só postar.',renderError:'Não foi possível abrir a prévia. Experimente outra foto ou um navegador com WebGL ativado.',downloadError:'Não foi possível consultar a versão agora. Confira os releases no GitHub.',downloadFallback:'Conferir releases',downloadReady:'Baixar para Windows',photosLabel:'Fotos de exemplo',formatLabel:'Formato',compareLabel:'Comparar antes e depois',previous:'Foto anterior',next:'Próxima foto',appTitle:'Por dentro do studio.',appDesc:'Capturas reais do editor desktop. Seu espaço para ir além da demonstração.',appFilters:'Filtros e ajustes na foto selecionada.',appLayouts:'Layouts, composição e edição por camadas.',
  },
  en: {
    skip:'Skip to content',navPlay:'Try it out',navTools:'What you can make',navDownload:'Download',getApp:'Get the app',heroNote:'For the moments one photo can’t hold.',heroTitle1:'Your dump.',heroTitle2:'Your rules.',heroDesc:'Your next feed starts in your camera roll. Bring your shots together, find your look, and make a story of them.',tryNow:'Play with the photos',noAccount:'No account. Just your ideas.',dragHint:'Drag your next photo dump',rotatePrefix:'Today I want to ',rotate:['build my dump.','find my look.','save my preset.','make it feed-ready.'],manifesto:'A date. A coffee. An outfit that just worked. Everyday life deserves a place in your feed.',playKicker:'A taste of the studio',playTitle:'Less imagining.<br>More experimenting.',playDesc:'Pick a photo, find your look, and give your dump a little personality. Everything happens right here in your browser.',loadingPhoto:'Loading photo…',yourMood:'What’s the mood?',yourMoodDesc:'Same photo. Different feeling.',reset:'Reset',intensity:'Intensity',format:'Made for your feed',grain:'A touch of film',grainDesc:'Just enough analog texture.',savePreview:'Save my preview · PNG',demoNote:'A little preview of the possibilities. The app adds layers, layouts, curves, camera looks, FX, and your own presets.',compareKicker:'A little change. A whole new feeling.',compareTitle:'Your photo.<br>Your point of view.',compareDesc:'Slide and feel the difference. A film treatment, the same light, and a story that feels a little more like you.',before:'Before',after:'After',samePhoto:'The very same photo, on both sides.',compareLook:'35mm look · the real app engine',possibilitiesKicker:'Your new creative ritual',possibilitiesTitle:'There’s more<br>in your studio.',possibilitiesDesc:'From one good shot to an entire carousel. Tools that work together to make the result feel like you.',layoutTitle:'Every shot finds its place.',layoutDesc:'Collages, Polaroids, and seamless carousels. Compose your pages and switch formats while keeping your photos intact.',layoutTag:'From square posts to Stories',filtersTitle:'A look for every side of you.',filtersDesc:'44 filters, camera simulations, textures, and fine adjustments. Editorial, film, monochrome, or a little experimentation.',filtersTag:'Your original stays intact',presetsTitle:'Found your look? Keep it.',presetsDesc:'Turn adjustments, filters, and FX into presets. Organize folders and take your looks with you as JSON.',layersTitle:'Freedom in every layer.',layersDesc:'Photos, text, borders, and effects. Fine-tune one element at a time, and undo whenever you want.',offlineTitle:'Your process is yours.',offlineDesc:'Edit on your computer with local projects and automatic saving. Export your pages as JPG or PNG.',downloadKicker:'My Dump Studio for Windows',downloadTitle:'Your next dump<br>starts here.',downloadDesc:'Bring the studio to your computer. No expiration date. Nothing to interrupt your ideas.',comingSoon:'First release coming soon',seeGithub:'Explore on GitHub',releasePending:'Download will be enabled when a Windows installer is available in a public release.',faqTitle:'One more little thing.',faq1q:'Do I need an account?',faq1a:'No. The app works locally on your computer. This page’s demo also works without an account.',faq2q:'Does it run on Mac or mobile?',faq2a:'The installer is for Windows. You can try this page on your phone, but the full editor is a desktop application.',faq3q:'Can I use the example photos?',faq3a:'The demo images come from stock photo libraries with reuse licenses. Find the photographers and sources on the credits page.',photoCredits:'Photo credits',faq4q:'Where can I find the latest version?',faq4a:'The download button checks the latest public GitHub release and selects the Windows installer. If the check is unavailable, you can browse releases on GitHub.',seeReleases:'View releases',credits:'Credits',saved:'Your preview is ready. Make it a post.',renderError:'Could not load this preview. Try another photo or a browser with WebGL enabled.',downloadError:'Could not check the latest version. Browse releases on GitHub.',downloadFallback:'Browse releases',downloadReady:'Download for Windows',photosLabel:'Example photos',formatLabel:'Format',compareLabel:'Compare before and after',previous:'Previous photo',next:'Next photo',appTitle:'Inside the studio.',appDesc:'Real screenshots from the desktop editor. Your space to go beyond the demo.',appFilters:'Filters and adjustments on the selected photo.',appLayouts:'Layouts, composition, and editing in layers.',
  }
};
Object.assign(dictionaries.pt, {heroDownload:'Quero meu studio',ribbonAction:'Faz um dump. Experimente o studio.',ribbonMake:'FAZ UM DUMP',ribbonYours:'DO SEU JEITO',ribbonRoll:'DO ROLO PRO FEED',ribbonDownload:'Do rolo pro feed. Conheça o aplicativo.'});
Object.assign(dictionaries.en, {heroDownload:'Get my studio',ribbonAction:'Make a dump. Try the studio.',ribbonMake:'MAKE A DUMP',ribbonYours:'MAKE IT YOURS',ribbonRoll:'CAMERA ROLL TO FEED',ribbonDownload:'Camera roll to feed. Discover the app.'});
Object.assign(dictionaries.pt, {pauseSlideshow:'Pausar fotos automáticas',playSlideshow:'Reproduzir fotos automaticamente',goToPhoto:'Ir para a foto',manifestoLine1:'Um date. Um café.',manifestoLine2:'Um look que deu certo.',manifestoLine3:'O cotidiano merece',manifestoLine4:'um lugar no seu feed.'});
Object.assign(dictionaries.en, {pauseSlideshow:'Pause automatic slideshow',playSlideshow:'Play automatic slideshow',goToPhoto:'Go to photo',manifestoLine1:'A date. A coffee.',manifestoLine2:'An outfit that just worked.',manifestoLine3:'Everyday life deserves',manifestoLine4:'a place in your feed.'});
let lang = 'pt';
try { lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('my-dump-site-lang') || 'pt'; } catch {}
if (!dictionaries[lang]) lang = 'pt';
const t = (key) => dictionaries[lang][key];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let releaseState = { status:'pending' };
let photos = [], photoIndex = 0, lookIndex = 1, intensity = 80, format = '4:5', grain = false, renderTicket = 0, rendered = false;
let rotateIndex = 0;
const looks = [
  {label:'Original',filter:null,css:'none'}, {label:'35mm',filter:'vint_seventies',css:'sepia(.25) saturate(.8)'},
  {label:'City girl',filter:'fuji_classic_chrome',css:'saturate(.68) contrast(1.12)'}, {label:'Satin',filter:'edit_satin',css:'contrast(.85) saturate(.8) brightness(1.1)'},
  {label:'Noir',filter:'noir',css:'grayscale(1) contrast(1.3)'}, {label:'Golden',filter:'cine_golden',css:'sepia(.4) saturate(1.25)'},
  {label:'Flash',filter:'nost_disposable',css:'contrast(1.2) saturate(.8)'}, {label:'Cyan',filter:'lab_cyanotype',css:'grayscale(1) sepia(1) hue-rotate(170deg) saturate(2)'}
];
const imageCache = new Map();
const engine = () => import('./assets/editor-engine.js');
function loadImage(src) {
  if (!imageCache.has(src)) imageCache.set(src, new Promise((resolve,reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = () => {imageCache.delete(src);reject(new Error('Image unavailable'));}; image.src = src;
  }));
  return imageCache.get(src);
}
function photo(name) { return photos.find((p) => p.file.endsWith(`/${name}.jpg`)) || photos[0]; }
function makeImage(data, eager = false) { const image = document.createElement('img');image.src = `./${data.file}`;image.alt = data.alt[lang];image.width = data.width;image.height = data.height;image.loading = eager ? 'eager' : 'lazy';image.decoding = 'async';return image; }
function toast(message) { $('#toast').textContent = message;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer = setTimeout(() => $('#toast').classList.remove('visible'), 3500); }
function localize() {
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  $$('[data-i18n]').forEach((element) => { const value = t(element.dataset.i18n);if (value) element.innerHTML = value; });
  $('#language').textContent = lang === 'pt' ? 'EN' : 'PT';$('#language').setAttribute('aria-label',lang === 'pt' ? 'Switch to English' : 'Mudar para português');
  $('#hero-prev').setAttribute('aria-label',t('previous'));$('#hero-next').setAttribute('aria-label',t('next'));
  $('#photo-picker').setAttribute('aria-label',t('photosLabel'));$('#format-picker').setAttribute('aria-label',t('formatLabel'));$('#compare-range').setAttribute('aria-label',t('compareLabel'));
  $('#editor-canvas').setAttribute('aria-label',lang === 'pt' ? 'Prévia da foto editada' : 'Edited photo preview');
  $('#after-canvas').setAttribute('aria-label',lang === 'pt' ? 'Foto com tratamento de filme' : 'Photo with film treatment');
  $('#before-image').alt = lang === 'pt' ? 'Foto original' : 'Original photo';
  const appShots = $$('.app-shots img');
  if(appShots[0]) appShots[0].alt = t('appFilters');
  if(appShots[1]) appShots[1].alt = t('appLayouts');
  $('#rotating-copy').textContent = t('rotate')[rotateIndex];
  $('#hero-toggle').setAttribute('aria-label',t(manualPaused?'playSlideshow':'pauseSlideshow'));
  $$('.dump-dot').forEach((button,index)=>button.setAttribute('aria-label',`${t('goToPhoto')} ${index+1}`));
  document.title = `My Dump Studio — ${t('heroTitle1')} ${t('heroTitle2')}`;
  $$('[data-photo-file]').forEach((image) => { const data = photos.find((p) => p.file === image.dataset.photoFile); if(data) image.alt = data.alt[lang]; });
  $$('.photo-choice').forEach((button,index) => button.setAttribute('aria-label',photos[index]?.alt[lang] || 'Photo'));
  renderReleaseState();
}
$('#language').addEventListener('click',() => {lang = lang === 'pt' ? 'en' : 'pt';try{localStorage.setItem('my-dump-site-lang',lang);}catch{}localize();});

const stage = $('#dump-stage'), track = $('#dump-track');
let trackX = 0, pointer = null, heroPosition = 0, autoTimer, manualPaused = reducedMotion, hovering = false, focusWithin = false, heroVisible = true;
function trackBounds() {return Math.min(0,stage.clientWidth-track.scrollWidth);}
function positionTrack(value, animate = false) {trackX = Math.max(trackBounds(),Math.min(0,value));track.style.transition = animate && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'transform .65s cubic-bezier(.22,.7,.15,1)' : 'none';track.style.transform = `translateX(${trackX}px)`;const cards = $$('.dump-card');heroPosition = Math.min(cards.length-1,Math.max(0,Math.round(-trackX/stage.clientWidth)));$('#hero-counter').textContent = `${heroPosition+1} / ${cards.length}`;$$('.dump-dot').forEach((button,index)=>button.setAttribute('aria-pressed',String(index===heroPosition)));}
function scheduleAutoplay() {clearTimeout(autoTimer);if(manualPaused||hovering||focusWithin||pointer||document.hidden||!heroVisible||matchMedia('(prefers-reduced-motion: reduce)').matches||!track.children.length)return;autoTimer=setTimeout(()=>advance(1),3800);}
function goToSlide(index) {const count=track.children.length;if(!count)return;const next=(index+count)%count;const wraps=Math.abs(next-heroPosition)>1;positionTrack(-next*stage.clientWidth,!wraps);scheduleAutoplay();}
function advance(direction) {goToSlide(heroPosition+direction);rotateCopy(direction);}
$('#hero-prev').addEventListener('click',() => advance(-1));$('#hero-next').addEventListener('click',() => advance(1));
stage.addEventListener('keydown',(event) => {if(event.target!==stage)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();advance(event.key==='ArrowRight'?1:-1);}});
stage.addEventListener('pointerdown',(event) => {if(event.button!==0||event.target.closest('button'))return;pointer = {id:event.pointerId,x:event.clientX,trackX,index:heroPosition};clearTimeout(autoTimer);stage.setPointerCapture(event.pointerId);stage.classList.add('dragging');});
stage.addEventListener('pointermove',(event) => {if(!pointer || pointer.id!==event.pointerId)return;positionTrack(pointer.trackX+event.clientX-pointer.x);});
function endDrag(event) {if(pointer?.id!==event.pointerId)return;const delta=event.clientX-pointer.x,index=pointer.index;pointer=null;stage.classList.remove('dragging');if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);goToSlide(index+(event.type==='pointercancel'?0:Math.abs(delta)>stage.clientWidth*.16?(delta<0?1:-1):0));}
stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
stage.addEventListener('pointerenter',(event)=>{if(event.pointerType==='mouse'){hovering=true;scheduleAutoplay();}});stage.addEventListener('pointerleave',()=>{hovering=false;scheduleAutoplay();});
stage.addEventListener('focusin',()=>{focusWithin=true;scheduleAutoplay();});stage.addEventListener('focusout',()=>queueMicrotask(()=>{focusWithin=stage.contains(document.activeElement);scheduleAutoplay();}));
$('#hero-toggle').addEventListener('click',()=>{manualPaused=!manualPaused;if(!manualPaused){hovering=false;focusWithin=false;}$('#hero-toggle').setAttribute('aria-pressed',String(manualPaused));$('#hero-toggle').setAttribute('aria-label',t(manualPaused?'playSlideshow':'pauseSlideshow'));scheduleAutoplay();});
document.addEventListener('visibilitychange',scheduleAutoplay);matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',scheduleAutoplay);
new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;scheduleAutoplay();},{threshold:.1}).observe(stage);
window.addEventListener('resize',() => positionTrack(-heroPosition*stage.clientWidth));
function rotateCopy(direction = 1) {rotateIndex = (rotateIndex+direction+t('rotate').length)%t('rotate').length;$('#rotating-copy').textContent=t('rotate')[rotateIndex];}
if(!reducedMotion) setInterval(() => {if(!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches)rotateCopy();},5200);

function selectedButtons() {
  $$('.photo-choice').forEach((button,index) => button.setAttribute('aria-pressed',String(index===photoIndex)));
  $$('.look-choice').forEach((button,index) => button.setAttribute('aria-pressed',String(index===lookIndex)));
  $$('#format-picker button').forEach((button) => button.setAttribute('aria-pressed',String(button.dataset.format===format)));
}
async function renderEditor() {
  if(!photos.length)return;
  const ticket=++renderTicket;rendered=false;$('#save-preview').disabled=true;$('#render-status').hidden=false;$('#editor-message').textContent='';
  try {
    const [image, {renderPhoto}] = await Promise.all([loadImage(`./${photos[photoIndex].file}`),engine()]);
    if(ticket!==renderTicket)return;
    const processed = renderPhoto(image,looks[lookIndex].filter,intensity,grain);
    const canvas = $('#editor-canvas');const dims = format === '1:1' ? [1080,1080] : format === '9:16' ? [1080,1920] : [1080,1350];
    [canvas.width,canvas.height]=dims;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,...dims);
    const padding=36,scale=Math.min((dims[0]-padding*2)/processed.width,(dims[1]-padding*2)/processed.height);const w=processed.width*scale,h=processed.height*scale;
    ctx.drawImage(processed,(dims[0]-w)/2,(dims[1]-h)/2,w,h);
    $('#preview-name').textContent=looks[lookIndex].label;$('#preview-dimensions').textContent=`${dims[0]} × ${dims[1]}`;
    $('#editor-canvas').dataset.ready='true';$('#editor-canvas').dataset.filter=looks[lookIndex].filter||'original';rendered=true;$('#save-preview').disabled=false;
  } catch(error) {console.error('[demo]',error);if(ticket===renderTicket)$('#editor-message').textContent=t('renderError');}
  finally {if(ticket===renderTicket)$('#render-status').hidden=true;}
}
let renderFrame;
function scheduleRender() {cancelAnimationFrame(renderFrame);renderFrame=requestAnimationFrame(renderEditor);}
$('#intensity').addEventListener('input',(event) => {intensity=Number(event.target.value);$('#intensity-value').textContent=`${intensity}%`;scheduleRender();});
$('#grain').addEventListener('change',(event) => {grain=event.target.checked;scheduleRender();});
$$('#format-picker button').forEach((button) => button.addEventListener('click',() => {format=button.dataset.format;selectedButtons();scheduleRender();}));
$('#reset').addEventListener('click',() => {lookIndex=0;intensity=80;format='4:5';grain=false;$('#intensity').value=80;$('#intensity-value').textContent='80%';$('#grain').checked=false;selectedButtons();scheduleRender();});
$('#save-preview').addEventListener('click',() => {
  if(!rendered)return;
  $('#editor-canvas').toBlob((blob) => {if(!blob){toast(t('renderError'));return;}const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`my-dump-studio-${looks[lookIndex].label.toLowerCase().replace(/\s/g,'-')}-${format.replace(':','x')}.png`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);toast(t('saved'));},'image/png');
});
$('#compare-range').addEventListener('input',(event) => $('#comparison').style.setProperty('--split',`${event.target.value}%`));
async function setupComparison() {
  const data=photo('city-romance');$('#before-image').src=`./${data.file}`;
  try{const [image,{renderPhoto}]=await Promise.all([loadImage(`./${data.file}`),engine()]);const processed=renderPhoto(image,'vint_seventies',85,true);const out=$('#after-canvas');out.width=processed.width;out.height=processed.height;out.getContext('2d').drawImage(processed,0,0);out.dataset.ready='true';}
  catch(error){console.error('[comparison]',error);$('#after-canvas').hidden=true;$('#compare-range').disabled=true;$('#compare-line').hidden=true;$('.compare-label.after').hidden=true;$('.compare-caption').firstElementChild.textContent=t('renderError');}
}

function renderReleaseState() {
  const button=$('#download-button'),label=$('#download-label'),note=$('#release-status');
  if(releaseState.status==='ready') {label.textContent=`${t('downloadReady')} · ${releaseState.tag}`;button.href=releaseState.url;button.removeAttribute('aria-disabled');note.textContent=`Windows · ${releaseState.size} MB · GitHub Releases`;}
  else if(releaseState.status==='error') {label.textContent=t('downloadFallback');button.href=`https://github.com/${RELEASE_REPO}/releases`;button.removeAttribute('aria-disabled');note.textContent=t('downloadError');}
  else {label.textContent=t('comingSoon');button.href=`https://github.com/${RELEASE_REPO}/releases/latest`;button.setAttribute('aria-disabled','true');note.textContent=t('releasePending');}
}
$('#download-button').addEventListener('click',(event) => {if(event.currentTarget.getAttribute('aria-disabled')==='true'){event.preventDefault();toast(t('releasePending'));}});
async function checkRelease() {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try {const response=await fetch(`https://api.github.com/repos/${RELEASE_REPO}/releases/latest`,{headers:{Accept:'application/vnd.github+json'},credentials:'omit',signal:controller.signal});
    if(response.status===404){releaseState={status:'pending'};return;}
    if(!response.ok)throw new Error('Release lookup unavailable');const data=await response.json();
    const asset=data.assets?.find((a)=>/setup.*\.exe$/i.test(a.name)&&a.state==='uploaded');
    if(!asset || data.draft || data.prerelease){releaseState={status:'pending'};return;}
    const prefix=`https://github.com/${RELEASE_REPO}/releases/download/`;
    if(!asset.browser_download_url?.startsWith(prefix))throw new Error('Unexpected download destination');
    releaseState={status:'ready',tag:String(data.tag_name).slice(0,40),url:asset.browser_download_url,size:(asset.size/1024/1024).toFixed(1)};
  }catch(error){console.info('[release] Using GitHub releases fallback.',error.name);releaseState={status:'error'};}
  finally{clearTimeout(timer);renderReleaseState();}
}

function setupScrollReveal() {
  if(reducedMotion || !('IntersectionObserver' in window))return;
  const targets=$$('.section-heading, .playground, .comparison, .compare-caption, .feature-layout > article, .feature-details > article, .app-gallery > h2, .app-gallery > p, .app-shots > figure, .download-inner > div, .faq > h2, .faq details, .footer');
  const observer=new IntersectionObserver((entries)=>{
    for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}
  },{threshold:.08,rootMargin:'0px 0px -35px 0px'});
  targets.forEach((element)=>{element.classList.add('scroll-reveal');observer.observe(element);});
  document.documentElement.classList.add('reveal-ready');
  // A changed system preference takes effect without a reload and never leaves content hidden.
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',(event)=>{
    if(event.matches){document.documentElement.classList.remove('reveal-ready');observer.disconnect();}
  });
}
setupScrollReveal();

function setupManifesto() {
  const section=$('.manifesto'),lines=$$('.manifesto-line');let queued=false;
  function paint(){queued=false;const rect=section.getBoundingClientRect(),nav=$('.nav').offsetHeight;const distance=Math.max(1,section.offsetHeight-innerHeight+nav);const progress=Math.max(0,Math.min(1,(nav+80-rect.top)/distance));const still=matchMedia('(prefers-reduced-motion: reduce)').matches;lines.forEach((line,index)=>{const phase=still?1:Math.max(0,Math.min(1,progress*4.4-index));line.style.opacity=String(.12+.88*phase);line.style.transform=`translateY(${(1-phase)*16}px)`;});}
  function requestPaint(){if(!queued){queued=true;requestAnimationFrame(paint);}}
  addEventListener('scroll',requestPaint,{passive:true});addEventListener('resize',requestPaint);matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',requestPaint);paint();
}
setupManifesto();

async function init() {
  localize();void checkRelease();
  try {const result=await fetch('./assets/photo-credits.json');if(!result.ok)throw new Error('Photo catalog unavailable');photos=(await result.json()).photos;
    const heroNames=['city-muse','cafe-moment','city-romance','amalfi-film','golden-street','beach-romance','leopard-city','paris-cafe'];
    const captions=['city girl diary','slow mornings','just us ♡','a little getaway','golden state of mind','wish you were here','outfit on repeat','little rituals'];
    heroNames.forEach((name,index)=>{const data=photo(name),figure=document.createElement('figure');figure.className='dump-card';const image=makeImage(data,index<2);image.dataset.photoFile=data.file;if(index===0)image.fetchPriority='high';figure.append(image);const caption=document.createElement('figcaption');caption.textContent=captions[index];figure.append(caption);track.append(figure);const dot=document.createElement('button');dot.className='dump-dot';dot.setAttribute('aria-label',`${t('goToPhoto')} ${index+1}`);dot.addEventListener('click',()=>goToSlide(index));$('#dump-pagination').append(dot);});
    photos.forEach((data,index)=>{const button=document.createElement('button');button.className='photo-choice';button.setAttribute('aria-label',data.alt[lang]);const image=makeImage(data);image.alt='';button.append(image);button.addEventListener('click',()=>{photoIndex=index;selectedButtons();scheduleRender();});$('#photo-picker').append(button);});
    const thumb=photo('golden-street');looks.forEach((look,index)=>{const button=document.createElement('button');button.className='look-choice';button.setAttribute('aria-label',`Look ${look.label}`);const image=makeImage(thumb);image.alt='';image.style.filter=look.css;const label=document.createElement('span');label.textContent=look.label;button.append(image,label);button.addEventListener('click',()=>{lookIndex=index;selectedButtons();scheduleRender();});$('#look-picker').append(button);});
    ['city-muse','cafe-moment','city-romance'].forEach((name)=>$('#mini-collage').append(makeImage(photo(name))));
    for(let i=0;i<3;i++)$('#look-fan').append(makeImage(photo('golden-street')));
    $('#download-photo').append(makeImage(photo('white-dress')));
    selectedButtons();positionTrack(0);localize();$('#hero-toggle').setAttribute('aria-pressed',String(manualPaused));scheduleAutoplay();
    const observer=new IntersectionObserver((entries)=>{for(const entry of entries)if(entry.isIntersecting){if(entry.target.id==='play')void renderEditor();else void setupComparison();observer.unobserve(entry.target);}},{rootMargin:'350px'});observer.observe($('#play'));observer.observe($('#comparison'));
  }catch(error){console.error('[site]',error);$('#editor-message').textContent=t('renderError');$('#save-preview').disabled=true;}
}
void init();
