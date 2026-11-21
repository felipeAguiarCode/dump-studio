/** Browser preview of the desktop catalog; geometry and crop rules come from the app bundle. */
export async function setupCollages({photos,loadImage,engine,getLanguage,toast}) {
  const {LAYOUT_SESSIONS,slotRectToTransform,coverRect}=await engine();
  const $=selector=>document.querySelector(selector),canvas=$('#collage-canvas');
  let session=LAYOUT_SESSIONS.find(item=>item.id==='editorial'),template=session.templates[0],format='4:5',offset=0,ticket=0,images;
  const pool=Promise.all(photos.map(data=>loadImage(`./${data.file}`))).then(result=>images=result);
  const en=()=>getLanguage()==='en';
  const sessionsEn={grades:'Grids',tiras:'Strips',destaque:'Spotlight',editorial:'Editorial',stories:'Stories','stories-mix':'Story mix',polaroid:'Polaroids',dynamics:'Dynamic',carousel:'Seamless'};
  const words=[['Carrossel Contínuo','Seamless carousel'],['lado a lado','side by side'],['empilhadas','stacked'],['horizontais','horizontal'],['verticais','vertical'],['inclinada','tilted'],['inclinadas','tilted'],['paisagem','landscape'],['Retrato','Portrait'],['direita','right'],['esquerda','left'],['Destaque','Spotlight'],['Losango','Diamond'],['losangos','diamonds'],['Cata-vento','Pinwheel'],['Revista','Magazine'],['Panorama','Panorama'],['Faixa','Strip'],['faixa','strip'],['faixas','strips'],['baixo','bottom'],['cima','top'],['esq.','left'],['dir.','right'],['foto','photo'],['fotos','photos'],['cheia','full frame'],['Leque','Fan'],['leque','fan'],['Explosão','Burst'],['Meio','Middle'],['lado','side'],['base','base'],['Mosaico','Mosaic']];
  words.push(['Cruz em X','X cross'],['Confronto','Face-off'],['Zigue-zague','Zigzag'],['Estilhaços','Shards'],['inclinadas','tilted'],['espalhadas','scattered'],['retratos','portraits'],['Contato','Contact sheet'],['paralelas','parallel'],['diagonais','diagonals'],['destaque','spotlight'],['grande','large'],['Corte','Cut'],['corte','cut'],['esp.','mirrored']);words.sort((a,b)=>b[0].length-a[0].length);
  function label(value){if(!en())return value;for(const [from,to]of words)value=value.split(from).join(to);return value;}
  function dimensions(){return {width:1080,height:format==='1:1'?1080:format==='9:16'?1920:1350};}
  function draw(target,selected,group,thumbnail=false){
    const size=dimensions();target.width=thumbnail?120:size.width;target.height=thumbnail?Math.round(120*size.height/size.width):size.height;
    const ctx=target.getContext('2d');ctx.scale(target.width/size.width,target.height/size.height);
    ctx.fillStyle=selected.background||group.background||'white';ctx.fillRect(0,0,size.width,size.height);
    for(const [index,cell]of selected.cells.entries()){
      const slot=slotRectToTransform(cell,size,group.gutter??14),image=images?.[(index+offset)%photos.length];
      ctx.save();ctx.translate(slot.x,slot.y);ctx.rotate(slot.rotation*Math.PI/180);ctx.beginPath();ctx.rect(0,0,slot.width,slot.height);ctx.clip();
      if(image){
        // Seam templates share the same wide image and exact crop fraction across both pages.
        const source=cell.seam?images[photos.findIndex(p=>p.file.endsWith('/amalfi-film.jpg'))]:image;
        const [part,count]=cell.seam||[0,1],crop=coverRect(source.naturalWidth,source.naturalHeight,slot.width*count,slot.height);
        const sw=crop.w/count*source.naturalWidth,sx=(crop.x+crop.w/count*part)*source.naturalWidth;
        ctx.drawImage(source,sx,crop.y*source.naturalHeight,sw,crop.h*source.naturalHeight,0,0,slot.width,slot.height);
      }else{ctx.fillStyle=['#dba8bf','#c8bcdf','#f0c4b4'][index%3];ctx.fillRect(0,0,slot.width,slot.height);}
      ctx.restore();
    }
  }
  function localize(){
    $('#collage-name').textContent=`${en()?sessionsEn[session.id]||session.label:session.label} / ${label(template.label)}`;
    $('#collage-canvas').setAttribute('aria-label',en()?'Live collage preview':'Prévia da colagem');
    $('#collage-sessions').setAttribute('aria-label',en()?'Collage styles':'Estilos de colagem');$('#collage-templates').setAttribute('aria-label',en()?'App layouts':'Layouts do aplicativo');$('#collage-formats').setAttribute('aria-label',en()?'Collage format':'Formato da colagem');
    for(const button of $('#collage-sessions').children){const group=LAYOUT_SESSIONS.find(s=>s.id===button.dataset.session);button.textContent=en()?sessionsEn[group.id]||group.label:group.label;button.setAttribute('aria-pressed',String(group===session));}
    for(const button of $('#collage-templates').children){const item=session.templates.find(t=>t.id===button.dataset.template);button.querySelector('span').textContent=label(item.label);button.setAttribute('aria-pressed',String(item===template));}
  }
  async function render(){const current=++ticket;$('#collage-save').disabled=true;try{await pool;if(current!==ticket)return;draw(canvas,template,session);canvas.dataset.template=template.id;canvas.dataset.format=format;canvas.dataset.ready='true';$('#collage-size').textContent=`${canvas.width} × ${canvas.height}`;$('#collage-save').disabled=false;$('#collage-message').textContent='';for(const button of $('#collage-templates').children)draw(button.querySelector('canvas'),session.templates.find(t=>t.id===button.dataset.template),session,true);}catch{if(current===ticket)$('#collage-message').textContent=en()?'Could not load this collage. Please try again.':'Não foi possível carregar a colagem. Tente novamente.';}}
  function templates(){const list=$('#collage-templates');list.replaceChildren();for(const item of session.templates){const button=document.createElement('button');button.className='collage-choice';button.dataset.template=item.id;const thumb=document.createElement('canvas');thumb.setAttribute('aria-hidden','true');draw(thumb,item,session,true);button.append(thumb,document.createElement('span'));button.addEventListener('click',()=>{template=item;localize();void render();});list.append(button);}localize();}
  for(const group of LAYOUT_SESSIONS){const button=document.createElement('button');button.dataset.session=group.id;button.addEventListener('click',()=>{session=group;template=group.templates[0];templates();void render();});$('#collage-sessions').append(button);}
  for(const button of $('#collage-formats').children)button.addEventListener('click',()=>{format=button.dataset.format;for(const item of $('#collage-formats').children)item.setAttribute('aria-pressed',String(item===button));templates();void render();});
  $('#collage-shuffle').addEventListener('click',()=>{offset=(offset+3)%photos.length;void render();});
  $('#collage-save').addEventListener('click',()=>canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`my-dump-studio-collage-${template.id}-${format.replace(':','x')}.png`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);toast(en()?'Your collage is ready.':'Sua colagem está pronta.');},'image/png'));
  templates();localize();const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){void render();observer.disconnect();}},{rootMargin:'350px'});observer.observe($('#collages'));
  return {localize};
}
