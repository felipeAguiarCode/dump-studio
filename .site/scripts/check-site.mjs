import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises'
import { resolve, join, extname, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const site=fileURLToPath(new URL('../',import.meta.url)),root=resolve(site,'..')
const scratch=await mkdtemp(join(tmpdir(),'my-dump-site-check-'))
const cache=join(root,'node_modules/.cache/my-dump-site-check');await mkdir(cache,{recursive:true})
await mkdir(join(site,'previews'),{recursive:true})
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain'}
const missing=[]
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const target=resolve(site,'.'+(path==='/'?'/index.html':path));if(!target.startsWith(site)||target===site)throw Error('Invalid path');const body=await readFile(target);res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream'});res.end(body)}catch{missing.push(req.url);res.writeHead(404);res.end('Not found')}})
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`
await writeFile(join(scratch,'preload.cjs'),`const nativeFetch=window.fetch.bind(window);window.fetch=async(input,options)=>{if(String(input).startsWith('https://api.github.com/repos/')){const mode=new URL(location.href).searchParams.get('release');if(mode==='ready')return new Response(JSON.stringify({tag_name:'v2.3.4',draft:false,prerelease:false,assets:[{name:'My-Dump-Studio-2.3.4-setup.exe',state:'uploaded',size:123456789,browser_download_url:'https://github.com/felipeAguiarCode/dump-studio/releases/download/v2.3.4/My-Dump-Studio-2.3.4-setup.exe'}]}),{status:200,headers:{'Content-Type':'application/json'}});if(mode==='error')throw new TypeError('Fixture network unavailable');return new Response('{}',{status:404});}return nativeFetch(input,options)};`)
await writeFile(join(cache,'main.cjs'),`
const assert=require('node:assert/strict'),fs=require('node:fs/promises');
const {app,BrowserWindow,session}=require('electron');
app.setPath('userData',${JSON.stringify(join(scratch,'user-data'))});
const pause=(ms)=>new Promise(r=>setTimeout(r,ms));
let win;const errors=[];const js=(source)=>win.webContents.executeJavaScript(source).catch(error=>{throw Error(source+': '+error.message)});
async function wait(expression){for(let i=0;i<200;i++){if(await js(expression))return;await pause(40)}throw Error('Timed out: '+expression)}
async function shot(name){await pause(1050);await fs.writeFile(${JSON.stringify(join(site,'previews'))}+'/'+name+'.png',(await win.webContents.capturePage()).toPNG())}
app.whenReady().then(async()=>{
win=new BrowserWindow({width:1440,height:1000,useContentSize:true,show:false,webPreferences:{offscreen:true,backgroundThrottling:false,contextIsolation:false,nodeIntegration:false,sandbox:false,preload:${JSON.stringify(join(scratch,'preload.cjs'))}}});
win.webContents.on('console-message',(_e,level,message)=>{if(level>=3)errors.push(message)});
await win.loadURL(${JSON.stringify(origin)});await wait('document.querySelectorAll(".dump-card").length===8');await js('document.fonts.ready.then(()=>true)');
assert.equal(await js('document.documentElement.lang'),'pt-BR');
assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true);
await wait('document.getElementById("download-button").getAttribute("aria-disabled")==="true"');
await wait('document.getElementById("hero-counter").textContent==="2 / 8"');
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
await js('(()=>{const s=document.querySelector(".manifesto"),nav=document.querySelector(".nav").offsetHeight;window.scrollTo({top:s.offsetTop-nav+(s.offsetHeight-innerHeight+nav)*.92,behavior:"instant"})})()');await pause(150);assert.equal(await js('getComputedStyle(document.querySelector(".manifesto-line")).fill'),'none','Manifesto must use outlined text');assert.equal(await js('Number(document.querySelectorAll(".manifesto-line")[3].style.opacity)>.8'),true,'Scroll reveals the final line');await shot('desktop-manifesto');
await js('document.getElementById("play").scrollIntoView({behavior:"instant"})');await wait('document.getElementById("editor-canvas").dataset.ready==="true"');
assert.equal(await js('Math.round(document.querySelector("header.nav").getBoundingClientRect().top)'),0,'Navigation must stay at the top after scrolling');
assert.equal(await js('document.getElementById("play-title").getBoundingClientRect().top>document.querySelector("header.nav").getBoundingClientRect().bottom'),true,'Section headings must clear the fixed menu');
const original=await js('document.getElementById("editor-canvas").toDataURL()');
await js('document.querySelectorAll(".look-choice")[4].click()');await wait('document.getElementById("editor-canvas").dataset.filter==="noir" && !document.getElementById("save-preview").disabled');
assert.notEqual(await js('document.getElementById("editor-canvas").toDataURL()'),original,'Actual shader must change the rendered pixels');
await js('document.getElementById("intensity").value="24";document.getElementById("intensity").dispatchEvent(new Event("input",{bubbles:true}))');await wait('document.getElementById("intensity-value").textContent==="24%" && !document.getElementById("save-preview").disabled');
await js('Array.from(document.querySelectorAll("#format-picker button")).find(b=>b.dataset.format==="9:16").click()');await wait('document.getElementById("editor-canvas").height===1920 && !document.getElementById("save-preview").disabled');
await js('document.getElementById("grain").click()');await pause(180);
const saved=new Promise(resolve=>win.webContents.session.once('will-download',(_event,item)=>{item.setSavePath(${JSON.stringify(join(scratch,'preview.png'))});item.once('done',(_e,state)=>resolve(state))}));
await js('document.getElementById("save-preview").click()');assert.equal(await saved,'completed');const png=await fs.readFile(${JSON.stringify(join(scratch,'preview.png'))});assert.equal(png.readUInt32BE(16),1080);assert.equal(png.readUInt32BE(20),1920);
await js('document.querySelector(".photo-choice:nth-child(3)").click()');await wait('!document.getElementById("save-preview").disabled');await js('document.getElementById("toast").classList.remove("visible")');await shot('desktop-editor');
await js('document.getElementById("comparison").scrollIntoView({behavior:"instant"})');await wait('document.getElementById("after-canvas").dataset.ready==="true"');
await js('document.getElementById("compare-range").value="28";document.getElementById("compare-range").dispatchEvent(new Event("input",{bubbles:true}))');assert.equal(await js('document.getElementById("comparison").style.getPropertyValue("--split")'),'28%');await shot('desktop-compare');
await js('document.querySelector(".ribbon-pink").scrollIntoView({behavior:"instant"})');await shot('desktop-ribbon');
await js('document.getElementById("language").click()');assert.equal(await js('document.documentElement.lang'),'en');assert.equal(await js('document.querySelector("[data-i18n=savePreview]").textContent'),'Save my preview · PNG');
await win.loadURL(${JSON.stringify(origin+'/?release=ready')});await wait('document.getElementById("download-button").textContent.includes("v2.3.4")');assert.equal(await js('document.getElementById("download-button").href'),'https://github.com/felipeAguiarCode/dump-studio/releases/download/v2.3.4/My-Dump-Studio-2.3.4-setup.exe');
await js('document.getElementById("download").scrollIntoView({behavior:"instant"})');await shot('desktop-download');
await win.loadURL(${JSON.stringify(origin+'/?release=error')});await wait('document.getElementById("download-button").href.endsWith("/releases")');assert.equal(await js('document.getElementById("download-button").hasAttribute("aria-disabled")'),false);
win.setContentSize(390,844);await win.loadURL(${JSON.stringify(origin+'/?lang=pt')});await wait('document.querySelectorAll(".dump-card").length===8');await js('document.fonts.ready.then(()=>true)');await pause(350);assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true,'No mobile horizontal overflow');await shot('mobile-hero');
await js('document.getElementById("play").scrollIntoView({behavior:"instant"})');await wait('document.getElementById("editor-canvas").dataset.ready==="true"');await shot('mobile-editor');
assert.equal(await js('Math.round(document.querySelector("header.nav").getBoundingClientRect().top)'),0,'Mobile navigation stays fixed');
for(const width of [320,768]){win.setContentSize(width,900);await pause(150);assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true,'No overflow at '+width+'px')}
win.setContentSize(390,844);
win.webContents.debugger.attach('1.3');await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await win.loadURL(${JSON.stringify(origin+'/?lang=pt')});await wait('document.querySelectorAll(".dump-dot").length===8');assert.equal(await js('document.getElementById("hero-toggle").getAttribute("aria-pressed")'),'true');assert.equal(await js('getComputedStyle(document.documentElement).scrollSnapType'),'none');assert.equal(await js('getComputedStyle(document.querySelector(".manifesto-line")).opacity'),'1');win.webContents.debugger.detach();
await win.loadURL(${JSON.stringify(origin+'/credits.html')});await wait('document.querySelectorAll(".credit-photo").length===12');assert.equal(await js('document.documentElement.scrollWidth<=innerWidth'),true);
assert.deepEqual(errors,[]);console.log('PASS: desktop/mobile layout, drag gesture, real WebGL looks/intensity/grain/formats, downloaded 1080×1920 PNG, before/after slider, PT/EN, release pending/ready/network fallback, and 12 photo credits.');app.exit(0)
}).catch(error=>{console.error(error);app.exit(1)});
`)
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE
const child=spawn(join(root,'node_modules/electron/dist/electron.exe'),[join(cache,'main.cjs')],{env,cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']})
let output='';for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>output+=chunk.toString())
const code=await new Promise((resolveExit,reject)=>{const timer=setTimeout(()=>{child.kill();reject(Error('Site verification timed out'))},90000);child.once('error',error=>{clearTimeout(timer);reject(error)});child.once('exit',code=>{clearTimeout(timer);resolveExit(code)})}).finally(()=>server.close())
console.log(output.trim());assert.equal(code,0,`Site verification failed; ${scratch}`);assert.deepEqual(missing,[],'All requested local assets must load');console.log('Screenshots: .site/previews/');
