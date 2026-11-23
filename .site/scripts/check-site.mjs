import assert from 'node:assert/strict'
import { createSiteServer } from './serve.mjs'
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const site=fileURLToPath(new URL('../',import.meta.url)),root=resolve(site,'..')
const heroOnly=process.argv.includes('--hero')
const setupOnly=process.argv.includes('--setup-paths')
const scratch=await mkdtemp(join(tmpdir(),'my-dump-site-check-'))
const cache=join(root,'node_modules/.cache/my-dump-site-check');await mkdir(cache,{recursive:true})
await mkdir(join(site,'previews'),{recursive:true})
const missing=[]
const server=createSiteServer({onMissing:url=>missing.push(url)})
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`
await writeFile(join(scratch,'preload.cjs'),`const nativeFetch=window.fetch.bind(window);window.fetch=async(input,options)=>{if(String(input).startsWith('https://api.github.com/repos/')){const mode=new URL(location.href).searchParams.get('release');if(mode==='ready')return new Response(JSON.stringify({tag_name:'v2.3.4',draft:false,prerelease:false,assets:[{name:'My-Dump-Studio-2.3.4-setup.exe',state:'uploaded',size:123456789,browser_download_url:'https://github.com/felipeAguiarCode/dump-studio/releases/download/v2.3.4/My-Dump-Studio-2.3.4-setup.exe'}]}),{status:200,headers:{'Content-Type':'application/json'}});if(mode==='error')throw new TypeError('Fixture network unavailable');return new Response('{}',{status:404});}return nativeFetch(input,options)};`)
await writeFile(join(cache,'main.cjs'),`
const assert=require('node:assert/strict'),fs=require('node:fs/promises');
const {app,BrowserWindow,session}=require('electron');
app.setPath('userData',${JSON.stringify(join(scratch,'user-data'))});
const pause=(ms)=>new Promise(r=>setTimeout(r,ms));
let win;const errors=[];const js=(source)=>win.webContents.executeJavaScript(source,true).catch(error=>{throw Error(source+': '+error.message)});
async function wait(expression){for(let i=0;i<375;i++){if(await js(expression))return;await pause(40)}throw Error('Timed out: '+expression)}
async function shot(name){await pause(1050);await fs.writeFile(${JSON.stringify(join(site,'previews'))}+'/'+name+'.png',(await win.webContents.capturePage()).toPNG())}
app.whenReady().then(async()=>{
win=new BrowserWindow({width:1440,height:1000,useContentSize:true,show:false,webPreferences:{offscreen:true,backgroundThrottling:false,contextIsolation:false,nodeIntegration:false,sandbox:false,preload:${JSON.stringify(join(scratch,'preload.cjs'))}}});
win.webContents.setFrameRate(12);
win.webContents.on('console-message',(_e,level,message)=>{if(level>=3){errors.push(message);console.error('[renderer] '+message)}});
await win.loadURL(${JSON.stringify(origin)});await wait('document.querySelectorAll(".dump-card").length===8');await js('document.fonts.ready.then(()=>true)');
if(${setupOnly}){
  win.webContents.debugger.attach('1.3');
  await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const capture=async (name,id)=>{
    await js('document.getElementById('+JSON.stringify(id)+').scrollIntoView({behavior:"instant"})');
    await wait('(()=>{const b=document.getElementById('+JSON.stringify(id)+').getBoundingClientRect();return b.top>=0&&b.top<innerHeight/2})()');
    await pause(1000);
    await fs.writeFile(${JSON.stringify(scratch)}+'/'+name+'.png',(await win.webContents.capturePage()).toPNG());
  };
  assert.equal(await js('document.querySelectorAll("#download .install-steps li").length'),3);
  assert.equal(await js('!document.getElementById("source") && !Array.from(document.links).some(link=>link.hash==="#source")'),true);
  assert.equal(await js('document.title'),'My Dump Studio | Seu dump. Suas regras.');
  assert.equal(await js('document.getElementById("download-button").getAttribute("aria-disabled")'),'true');
  await capture('desktop-install','download');
  await js('document.getElementById("language").click()');
  assert.equal(await js('document.title'),'My Dump Studio | Your dump. Your rules.');
  assert.equal(await js('document.querySelector("#download .section-kicker").textContent'),'Install on Windows');
  win.setContentSize(390,844);await win.loadURL(${JSON.stringify(origin+'/?release=ready&lang=pt#download')});
  await wait('document.getElementById("download-button").href.endsWith("-setup.exe")');
  await capture('mobile-install','download');
  assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true);
  assert.deepEqual(errors,[]);
  console.log('PASS: Windows installation steps, translation, page title, responsive layout and installer release link.');
  app.exit(0);return;
}
if(${heroOnly}){
  const hero=()=>js('(()=>{const s=document.getElementById("dump-stage"),card=document.querySelector(".dump-card.is-current"),base=card.querySelector(".hero-photo"),layer=card.querySelector(".hero-filter-layer");return {photo:document.getElementById("hero-counter").textContent,look:s.dataset.look,incoming:s.dataset.incomingLook,transition:s.dataset.filterTransition,baseLook:base.dataset.look,src:base.src,layerHidden:layer.hidden,clip:getComputedStyle(layer).clipPath,dividerHidden:card.querySelector(".hero-filter-divider").hidden,playing:s.classList.contains("is-playing")}})()');
  await wait('document.getElementById("dump-stage").dataset.look==="vint_seventies" && document.getElementById("dump-stage").dataset.filterTransition==="idle"');
  const bounds=await js('(()=>{const r=document.getElementById("dump-stage").getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()');win.webContents.sendInputEvent({type:'mouseMove',x:bounds.x,y:bounds.y});await pause(100);assert.equal((await hero()).playing,true,'Hovering must not stop the filter demonstration');
  await wait('document.getElementById("dump-stage").dataset.incomingLook==="edit_satin" && document.getElementById("dump-stage").dataset.filterTransition==="sliding"');await pause(150);let state=await hero();assert.equal(state.photo,'1 / 8');assert.equal(state.baseLook,'vint_seventies');assert.equal(state.layerHidden,false);assert.equal(state.dividerHidden,false);const edge=parseFloat(state.clip.split(' ').at(-1));assert.ok(edge>0&&edge<100,'The incoming filter must cover only part of the photo during the pull');
  await wait('document.getElementById("dump-stage").dataset.look==="edit_satin" && document.getElementById("dump-stage").dataset.filterTransition==="idle"');const satin=await hero();assert.notEqual(satin.src,'');assert.equal(satin.layerHidden,true);
  await wait('document.getElementById("dump-stage").dataset.incomingLook==="noir" && document.getElementById("dump-stage").dataset.filterTransition==="sliding"');await js('document.getElementById("hero-toggle").click();document.querySelectorAll(".is-filter-sliding .hero-filter-layer,.is-filter-sliding .hero-filter-divider").forEach(el=>el.getAnimations().forEach(a=>{a.pause();a.currentTime=425}))');await pause(100);await fs.writeFile(${JSON.stringify(join(site,'previews','desktop-hero-filter-slide.png'))},(await win.webContents.capturePage()).toPNG());await js('document.querySelectorAll(".is-filter-sliding .hero-filter-layer,.is-filter-sliding .hero-filter-divider").forEach(el=>el.getAnimations().forEach(a=>a.play()))');
  await wait('document.getElementById("dump-stage").dataset.look==="noir" && document.getElementById("dump-stage").dataset.filterTransition==="idle"');state=await hero();assert.equal(state.photo,'1 / 8');assert.notEqual(state.src,satin.src,'The third real look must replace the second only after its wipe');
  await js('document.getElementById("hero-toggle").click()');await wait('document.getElementById("hero-counter").textContent==="2 / 8"');await wait('document.getElementById("dump-stage").dataset.incomingLook==="edit_satin"');await js('document.getElementById("hero-next").click()');await wait('document.getElementById("hero-counter").textContent==="3 / 8" && document.querySelector(".dump-card.is-current .hero-photo").dataset.look==="vint_seventies" && document.getElementById("dump-stage").dataset.filterTransition==="idle"');assert.equal(await js('Array.from(document.querySelectorAll(".hero-filter-layer")).every(layer=>layer.hidden)'),true,'Changing photos cancels old filter layers');
  await js('document.getElementById("hero-toggle").click()');const paused=await hero();await pause(3300);state=await hero();assert.equal(state.photo,paused.photo);assert.equal(state.look,paused.look,'Pause must stop the filter cycle');
  await js('document.querySelector(".feature-details").scrollIntoView({behavior:"instant"})');await shot('desktop-feature-cards');
  win.setContentSize(390,844);await win.loadURL(${JSON.stringify(origin+'/?lang=pt')});await wait('document.getElementById("dump-stage").dataset.incomingLook==="noir" && document.getElementById("dump-stage").dataset.filterTransition==="sliding"');await pause(180);assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true);await fs.writeFile(${JSON.stringify(join(site,'previews','mobile-hero-filter-slide.png'))},(await win.webContents.capturePage()).toPNG());
  win.webContents.debugger.attach('1.3');await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await wait('document.getElementById("dump-stage").dataset.filterTransition==="idle" && !document.getElementById("dump-stage").classList.contains("is-playing")');assert.equal(await js('Array.from(document.querySelectorAll(".hero-filter-layer")).every(layer=>layer.hidden)'),true,'Reduced motion removes the moving filter boundary');
  const still=await hero();await pause(3300);state=await hero();assert.equal(state.photo,still.photo);assert.equal(state.look,still.look);await js('document.querySelector(".feature-details").scrollIntoView({behavior:"instant"})');await shot('mobile-feature-cards');
  assert.deepEqual(errors,[]);console.log('PASS: three real looks per photo, partial filter pull with moving divider, hover continuity, rapid navigation cancellation, manual pause, responsive cards and reduced motion.');app.exit(0);return;
}
const initialHeadline=await js('document.getElementById("hero-headline-word").textContent');
assert.equal(await js('document.documentElement.lang'),'pt-BR');
assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true);
await wait('document.getElementById("download-button").getAttribute("aria-disabled")==="true"');
await wait('document.getElementById("dump-stage").dataset.look==="vint_seventies"');const heroFilm=await js('document.querySelector(".dump-card img").src');
await wait('document.getElementById("dump-stage").dataset.look==="edit_satin"');assert.equal(await js('document.getElementById("hero-counter").textContent'),'1 / 8');assert.notEqual(await js('document.querySelector(".dump-card img").src'),heroFilm,'Hero must render another real look on the same photo');
await wait('document.getElementById("dump-stage").dataset.look==="noir"');assert.equal(await js('document.getElementById("hero-counter").textContent'),'1 / 8');
await wait('document.getElementById("hero-counter").textContent==="2 / 8"');
assert.notEqual(await js('document.getElementById("hero-headline-word").textContent'),initialHeadline,'The hero headline must flip to another phrase');
assert.equal(await js('Array.from(document.querySelectorAll(".dump-dot")).findIndex(b=>b.getAttribute("aria-pressed")==="true")'),1,'Automatic slideshow and white dots must advance together');
await js('document.getElementById("hero-toggle").click()');const pausedCounter=await js('document.getElementById("hero-counter").textContent');await pause(4100);assert.equal(await js('document.getElementById("hero-counter").textContent'),pausedCounter,'Pause stops automatic photos');
await js('document.getElementById("hero-toggle").focus();document.getElementById("hero-toggle").click()');await wait('document.getElementById("hero-counter").textContent!=='+JSON.stringify(pausedCounter));await js('document.getElementById("hero-toggle").click()');
await js('document.querySelectorAll(".dump-dot")[2].click()');assert.equal(await js('document.getElementById("hero-counter").textContent'),'3 / 8','Dots navigate directly to their photos');
await js('document.getElementById("hero-next").click()');await pause(550);const firstX=await js('getComputedStyle(document.getElementById("dump-track")).transform');
const stage=await js('(()=>{const r=document.getElementById("dump-stage").getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()');
assert.equal(await js('document.getElementById("dump-stage").getBoundingClientRect().right<document.getElementById("hero-title").getBoundingClientRect().left'),true,'Hero preview belongs left of the headline');
const dragStart=Math.round(stage.x+stage.width*.75),dragEnd=Math.round(stage.x+stage.width*.25),dragY=Math.round(stage.y+100);
win.webContents.sendInputEvent({type:'mouseMove',x:dragStart,y:dragY});win.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,x:dragStart,y:dragY});await pause(50);win.webContents.sendInputEvent({type:'mouseMove',x:dragEnd,y:dragY});win.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,x:dragEnd,y:dragY});await pause(100);
assert.notEqual(await js('getComputedStyle(document.getElementById("dump-track")).transform'),firstX,'Pointer dragging must move hero photos');
await shot('desktop-hero');
console.log('CHECK: hero looks, headline, autoplay, pause and swipe passed.');
await js('(()=>{const s=document.querySelector(".manifesto"),nav=document.querySelector(".nav").offsetHeight;window.scrollTo({top:s.offsetTop-nav+(s.offsetHeight-innerHeight+nav)*.98,behavior:"instant"})})()');await pause(150);assert.equal(await js('Number(document.querySelectorAll(".manifesto-line")[3].style.opacity)<.2'),true,'Manifesto dissipates as the section ends');
await js('(()=>{const s=document.querySelector(".manifesto"),nav=document.querySelector(".nav").offsetHeight;window.scrollTo({top:s.offsetTop-nav+(s.offsetHeight-innerHeight+nav)*.6,behavior:"instant"})})()');await pause(150);assert.equal(await js('document.querySelector(".manifesto-line").getAttribute("text-anchor")'),'middle');assert.equal(await js('Number(document.querySelectorAll(".manifesto-line")[3].style.opacity)>.95'),true,'Manifesto remains readable before fading');await shot('desktop-manifesto');
await js('document.getElementById("play").scrollIntoView({behavior:"instant"})');await wait('document.getElementById("editor-canvas").dataset.ready==="true"');
console.log('CHECK: editor preview loaded.');
assert.equal(await js('Math.round(document.querySelector("header.nav").getBoundingClientRect().top)'),0,'Navigation must stay at the top after scrolling');
assert.equal(await js('document.getElementById("play-title").getBoundingClientRect().top>document.querySelector("header.nav").getBoundingClientRect().bottom'),true,'Section headings must clear the fixed menu');
const original=await js('document.getElementById("editor-canvas").toDataURL()');
await js('document.querySelectorAll(".look-choice")[4].click()');await wait('document.getElementById("editor-canvas").dataset.filter==="noir" && !document.getElementById("save-preview").disabled');
assert.notEqual(await js('document.getElementById("editor-canvas").toDataURL()'),original,'Actual shader must change the rendered pixels');
await js('document.getElementById("intensity").value="24";document.getElementById("intensity").dispatchEvent(new Event("input",{bubbles:true}))');await wait('document.getElementById("intensity-value").textContent==="24%" && !document.getElementById("save-preview").disabled');
await js('Array.from(document.querySelectorAll("#format-picker button")).find(b=>b.dataset.format==="9:16").click()');await wait('document.getElementById("editor-canvas").height===1920 && !document.getElementById("save-preview").disabled');
await js('document.getElementById("grain").click()');await wait('document.getElementById("editor-canvas").dataset.grain==="true" && !document.getElementById("save-preview").disabled');
console.log('CHECK: editor grain rendered, starting PNG download.');
const saved=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Preview PNG download did not complete')),20000);win.webContents.session.once('will-download',(_event,item)=>{item.setSavePath(${JSON.stringify(join(scratch,'preview.png'))});item.once('done',(_e,state)=>{clearTimeout(timer);resolve(state)})})});
await js('document.getElementById("save-preview").click()');assert.equal(await saved,'completed');const png=await fs.readFile(${JSON.stringify(join(scratch,'preview.png'))});assert.equal(png.readUInt32BE(16),1080);assert.equal(png.readUInt32BE(20),1920);
await js('document.querySelector(".photo-choice:nth-child(3)").click()');await wait('!document.getElementById("save-preview").disabled');await js('document.getElementById("toast").classList.remove("visible")');await shot('desktop-editor');
console.log('CHECK: real editor controls and downloaded PNG passed.');
await js('document.getElementById("collages").scrollIntoView({behavior:"instant"})');await wait('document.getElementById("collage-canvas").dataset.ready==="true"');const collageOriginal=await js('document.getElementById("collage-canvas").toDataURL()');
await js('document.getElementById("collage-shuffle").click()');await wait('!document.getElementById("collage-save").disabled');assert.notEqual(await js('document.getElementById("collage-canvas").toDataURL()'),collageOriginal,'Switching photos must redraw the collage');
await js('document.querySelector("[data-session=polaroid]").click();document.querySelector("[data-template=pol-4-scatter]").click()');await wait('document.getElementById("collage-canvas").dataset.template==="pol-4-scatter" && !document.getElementById("collage-save").disabled');await shot('desktop-collages');
await js('Array.from(document.querySelectorAll("#collage-formats button")).find(b=>b.dataset.format==="1:1").click()');await wait('document.getElementById("collage-canvas").height===1080 && !document.getElementById("collage-save").disabled');
const collageSaved=new Promise(resolve=>win.webContents.session.once('will-download',(_event,item)=>{item.setSavePath(${JSON.stringify(join(scratch,'collage.png'))});item.once('done',(_e,state)=>resolve(state))}));await js('document.getElementById("collage-save").click()');assert.equal(await collageSaved,'completed');const collagePng=await fs.readFile(${JSON.stringify(join(scratch,'collage.png'))});assert.equal(collagePng.readUInt32BE(16),1080);assert.equal(collagePng.readUInt32BE(20),1080);
await js('document.querySelector("[data-session=carousel]").click()');await wait('document.getElementById("collage-canvas").dataset.template==="car-pano-1"');const firstHalf=await js('document.getElementById("collage-canvas").toDataURL()');await js('document.querySelector("[data-template=car-pano-2]").click()');await wait('document.getElementById("collage-canvas").dataset.template==="car-pano-2"');assert.notEqual(await js('document.getElementById("collage-canvas").toDataURL()'),firstHalf,'Seamless carousel previews must show different halves');
console.log('CHECK: collage layouts, shuffle, formats, PNG and seamless crops passed.');
await js('document.getElementById("comparison").scrollIntoView({behavior:"instant"})');await wait('document.getElementById("after-canvas").dataset.ready==="true"');
await js('document.getElementById("compare-range").value="28";document.getElementById("compare-range").dispatchEvent(new Event("input",{bubbles:true}))');assert.equal(await js('document.getElementById("comparison").style.getPropertyValue("--split")'),'28%');await shot('desktop-compare');
await js('document.querySelector(".ribbon-pink").scrollIntoView({behavior:"instant"})');await shot('desktop-ribbon');
await js('document.getElementById("language").click()');assert.equal(await js('document.documentElement.lang'),'en');assert.equal(await js('document.querySelector("[data-i18n=savePreview]").textContent'),'Save my preview · PNG');
await win.loadURL(${JSON.stringify(origin+'/?release=ready')});await wait('document.getElementById("download-button").textContent.includes("v2.3.4")');assert.equal(await js('document.getElementById("download-button").href'),'https://github.com/felipeAguiarCode/dump-studio/releases/download/v2.3.4/My-Dump-Studio-2.3.4-setup.exe');
await js('document.getElementById("download").scrollIntoView({behavior:"instant"})');await shot('desktop-download');
await win.loadURL(${JSON.stringify(origin+'/?release=error')});await wait('document.getElementById("download-button").href.endsWith("/releases")');assert.equal(await js('document.getElementById("download-button").hasAttribute("aria-disabled")'),false);
win.setContentSize(390,844);await win.loadURL(${JSON.stringify(origin+'/?lang=pt')});await wait('document.querySelectorAll(".dump-card").length===8');await js('document.fonts.ready.then(()=>true)');await pause(350);assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true,'No mobile horizontal overflow');await shot('mobile-hero');
await js('document.getElementById("play").scrollIntoView({behavior:"instant"})');await wait('document.getElementById("editor-canvas").dataset.ready==="true"');await shot('mobile-editor');
await js('document.querySelector("[data-editor-tab=adjust]").click()');assert.equal(await js('getComputedStyle(document.getElementById("look-picker")).display'),'none');assert.notEqual(await js('getComputedStyle(document.getElementById("intensity-control")).display'),'none');
await js('document.getElementById("intensity").value="55";document.getElementById("intensity").dispatchEvent(new Event("input",{bubbles:true}))');await wait('document.getElementById("intensity-value").textContent==="55%" && !document.getElementById("save-preview").disabled');
await js('document.querySelector("[data-editor-tab=format]").click();Array.from(document.querySelectorAll("#format-picker button")).find(b=>b.dataset.format==="1:1").click()');await wait('document.getElementById("editor-canvas").height===1080 && !document.getElementById("save-preview").disabled');
await js('document.querySelector("[data-editor-tab=looks]").click();document.querySelectorAll(".look-choice")[4].click()');await wait('document.getElementById("editor-canvas").dataset.filter==="noir" && !document.getElementById("save-preview").disabled');
assert.equal(await js('getComputedStyle(document.getElementById("look-picker")).overflowX'),'auto');await js('document.querySelector(".editor-controls").scrollIntoView({behavior:"instant"})');await shot('mobile-mood-controls');
await js('document.getElementById("download").scrollIntoView({behavior:"instant"})');await shot('mobile-download');
await js('document.getElementById("collages").scrollIntoView({behavior:"instant"})');await wait('document.getElementById("collage-canvas").dataset.ready==="true"');assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true);await shot('mobile-collages');
assert.equal(await js('Math.round(document.querySelector("header.nav").getBoundingClientRect().top)'),0,'Mobile navigation stays fixed');
for(const width of [320,768]){win.setContentSize(width,900);await pause(150);assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true,'No overflow at '+width+'px')}
win.setContentSize(390,844);
win.webContents.debugger.attach('1.3');await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await win.loadURL(${JSON.stringify(origin+'/?lang=pt')});await wait('document.querySelectorAll(".dump-dot").length===8');assert.equal(await js('document.getElementById("hero-toggle").getAttribute("aria-pressed")'),'true');assert.equal(await js('getComputedStyle(document.documentElement).scrollSnapType'),'none');assert.equal(await js('getComputedStyle(document.querySelector(".manifesto-line")).opacity'),'1');win.webContents.debugger.detach();
await win.loadURL(${JSON.stringify(origin+'/credits.html')});await wait('document.querySelectorAll(".credit-photo").length===12');assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true);
assert.deepEqual(errors,[]);console.log('PASS: desktop/mobile layout, fixed navigation, three real hero looks, Stories autoplay/pause/swipe, scroll manifesto, interactive app collages and PNG export, real WebGL looks/intensity/grain/formats, downloaded 1080×1920 PNG, before/after slider, PT/EN, release pending/ready/network fallback, and 12 photo credits.');app.exit(0)
}).catch(error=>{console.error(error);app.exit(1)});
`)
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE
const child=spawn(join(root,'node_modules/electron/dist/electron.exe'),[join(cache,'main.cjs')],{env,cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']})
let output='';for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>output+=chunk.toString())
const code=await new Promise((resolveExit,reject)=>{const timer=setTimeout(()=>{output+='\nSite verification timed out.\n';child.kill();resolveExit(-1)},180000);child.once('error',error=>{clearTimeout(timer);reject(error)});child.once('exit',code=>{clearTimeout(timer);resolveExit(code)})}).finally(()=>server.close())
console.log(output.trim());assert.equal(code,0,`Site verification failed; ${scratch}`);assert.deepEqual(missing,[],'All requested local assets must load');console.log('Screenshots: '+(setupOnly?scratch:'.site/previews/'));
