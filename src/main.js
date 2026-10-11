import { Application } from 'pixi.js';
import { catalog, collections, findStudy } from './data.js';
import { createStudy } from './engine.js';
import { paintThumb } from './thumbs.js';
import './style.css';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const gallery=$('#gallery'),viewport=$('#viewport'),player=$('.player-pane'),params=new URLSearchParams(location.search);
const palette={lime:'#d9f56e',blue:'#80a9ff',orange:'#ff8d60',lavender:'#bb98ff',ice:'#f6f4ec'};
const matchReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const state={
  chosen:findStudy(location.hash.replace('#','') || params.get('scene')),
  filter:'ALL',query:'',favoritesOnly:false,favorites:new Set(),
  color:'original',power:.68,paused:false,reduced:matchReduced.matches,
  app:null,active:null,ready:false,loading:false,lastMouse:false
};
const pointer={x:0,y:0,nx:0,ny:0,inside:false};
const cards=new Map();
let observer=null, statsTimer=0,toastTimeout=0,selectSerial=0,ro=null;

try {
  state.favorites=new Set(JSON.parse(localStorage.getItem('pijs_motion_favorites_v1')||'[]'));
} catch(error) {console.debug('Local favorites unavailable',error);}
const toHex=str=>parseInt(str.slice(1),16);

function toast(message) {
  const el=$('#toast');el.textContent=message;el.hidden=false;
  clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>{el.hidden=true;},1750);
}

function createCard(entry) {
  const card=document.createElement('article');
  card.className='study-card';card.dataset.id=entry.id;
  card.dataset.category=entry.category;
  const open=document.createElement('button');
  open.className='study-open';open.type='button';
  open.setAttribute('aria-label',entry.number+' — '+entry.title+', '+entry.categoryLabel);
  const thumb=document.createElement('div');thumb.className='thumb';
  const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
  const num=document.createElement('span');num.className='thumb-number';num.textContent=String(entry.number).padStart(3,'0');
  thumb.append(canvas,num);
  const body=document.createElement('div');body.className='card-body';
  const category=document.createElement('div');category.className='card-tag';category.textContent=entry.categoryLabel.toUpperCase();
  const title=document.createElement('div');title.className='card-title';title.textContent=entry.title;
  body.append(category,title);
  const arrow=document.createElement('span');arrow.className='card-arrow';arrow.textContent='↗';
  open.append(thumb,body,arrow);
  const fav=document.createElement('button');
  fav.type='button';fav.className='fave-toggle';fav.textContent=state.favorites.has(entry.id)?'★':'☆';
  fav.setAttribute('aria-label','Избранное: '+entry.title);
  fav.setAttribute('aria-pressed',String(state.favorites.has(entry.id)));
  fav.classList.toggle('is-active',state.favorites.has(entry.id));
  fav.addEventListener('click',()=>toggleFavorite(entry.id));
  open.addEventListener('click',()=>select(entry.id,true));
  card.append(open,fav);
  cards.set(entry.id,{card,canvas,fav});
  observer?.observe(card);
  return card;
}
function makeCatalog() {
  const fragment=document.createDocumentFragment();
  for(const entry of catalog) fragment.appendChild(createCard(entry));
  gallery.appendChild(fragment);
  if(observer){for(const item of cards.values())observer.observe(item.card);}
}

function initThumbs() {
  if('IntersectionObserver' in window) {
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting){
        const study=findStudy(entry.target.dataset.id);
        const item=cards.get(study.id);
        if(item && !item.canvas.dataset.drawn){
          paintThumb(item.canvas,study);item.canvas.dataset.drawn='1';
        }
        observer.unobserve(entry.target);
      }
    },{rootMargin:'350px'});
  }
}
function updateCards() {
  const q=state.query.toLocaleLowerCase('ru').trim();
  let visible=0;
  for(const entry of catalog){
    const item=cards.get(entry.id);
    const matches=state.filter==='ALL'||entry.category===state.filter;
    const searched=!q||(entry.title+' '+entry.family+' '+entry.categoryLabel+' '+entry.category).toLowerCase().includes(q);
    const fav=!state.favoritesOnly||state.favorites.has(entry.id);
    const ok=matches&&searched&&fav;
    item.card.hidden=!ok;
    if(ok)visible++;
    item.card.classList.toggle('is-current',state.chosen.id===entry.id);
    if(ok&&!observer&&!item.canvas.dataset.drawn){paintThumb(item.canvas,entry);item.canvas.dataset.drawn='1';}
  }
  $('#visible-count').textContent=visible+' / 100';
  $('#catalog-results').textContent=visible+' '+(visible===1?'STUDY':'STUDIES');
  $('#empty-state').hidden=visible>0;
  $('#favorites-count').textContent=String(state.favorites.size);
  $('#favorites-filter').classList.toggle('is-active',state.favoritesOnly);
  $('#favorites-filter').setAttribute('aria-pressed',String(state.favoritesOnly));
  $$('.filter').forEach(b=>{
    const selected=b.dataset.filter===state.filter;
    b.classList.toggle('is-active',selected);
    b.setAttribute('aria-pressed',String(selected));
  });
  if(observer){for(const item of cards.values())if(!item.card.hidden&&!item.canvas.dataset.drawn)observer.observe(item.card);}
}

function renderFilters() {
  const box=$('#filters');
  const filters=[{key:'ALL',label:'ALL',count:100},...collections.map(c=>({key:c.key,label:c.label,count:10}))];
  for(const entry of filters){
    const btn=document.createElement('button');
    btn.className='filter';btn.type='button';btn.dataset.filter=entry.key;
    btn.innerHTML=entry.label.toUpperCase()+' <span class="filter-count">'+entry.count+'</span>';
    btn.addEventListener('click',()=>{state.filter=entry.key;updateCards();});
    box.appendChild(btn);
  }
}
function saveFavorites(){
  try {localStorage.setItem('pijs_motion_favorites_v1',JSON.stringify([...state.favorites]));}
  catch(error){console.debug('Favorites were not persisted',error);}
}
function toggleFavorite(id){
  if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);
  const item=cards.get(id),on=state.favorites.has(id);
  item.fav.classList.toggle('is-active',on);item.fav.textContent=on?'★':'☆';
  item.fav.setAttribute('aria-pressed',String(on));
  saveFavorites();updateCards();
  toast(on?'Added to favorites':'Removed from favorites');
}
function currentColor(){
  return state.color==='original'?state.chosen.accent:palette[state.color];
}
function refreshSwatches(){
  const hex=currentColor();
  document.documentElement.style.setProperty('--accent',hex);
  document.querySelector('[data-color="original"]').style.setProperty('--swatch',state.chosen.accent);
  $$('[data-color]').forEach(b=>{
    const active=b.dataset.color===state.color;
    b.classList.toggle('is-current',active);
    b.setAttribute('aria-pressed',String(active));
  });
}

function updateLabels(){
  const study=state.chosen;
  $('#active-number').textContent=String(study.number).padStart(3,'0')+' / 100';
  $('#stage-category').textContent=study.category+' / MOTION';
  $('#stage-title').textContent=study.title.toUpperCase();
  $('#detail-title').textContent=study.title;
  $('#detail-category').textContent=study.categoryLabel.toUpperCase();
  $('#detail-count').textContent=String(study.number).padStart(2,'0')+' / 100';
  $('#detail-description').textContent=study.summary;
  $('#detail-tip').textContent=study.tip;
  $('#reference-link').textContent=study.reference.label.toUpperCase()+' ↗';
  $('#reference-link').href=study.reference.url;
  document.title=study.title+' — PiJS Motion Atlas / 100';
  refreshSwatches();
}
function setPause(paused) {
  state.paused=paused;
  $('#pause-label').textContent=paused?'RESUME':'PAUSE';
  $('#pause-icon').textContent=paused?'▶':'Ⅱ';
  $('#render-status').textContent=paused?'PAUSED / STANDBY':state.reduced?'LIVE / REDUCED MOTION':'LIVE / RENDERING';
  if(state.app){if(paused||document.hidden)state.app.stop();else state.app.start();}
}
function select(id,fromClick=false) {
  const next=catalog.find(s=>s.id===id);
  if(!next)return false;
  ++selectSerial;
  state.chosen=next;updateLabels();updateCards();
  const url=new URL(location.href);url.hash=next.id;
  history.replaceState(null,'',url.pathname+url.search+url.hash);
  if(!state.ready)return true;
  try {
    state.active?.destroy();
    state.active=null;
    state.active=createStudy(state.app,next,toHex(currentColor()));
    state.active.resize(state.app.screen.width,state.app.screen.height);
    $('#objects').textContent=new Intl.NumberFormat('en-US').format(state.active.count);
    $('#stage-error').hidden=true;$('#stage-loading').classList.add('is-hidden');
    if(state.paused)setPause(false);
    if(fromClick&&window.matchMedia('(max-width:1000px)').matches){
      player.scrollIntoView({block:'start',behavior:state.reduced?'instant':'smooth'});
    }
  } catch(error){
    console.error('Study error:',next.id,error);
    state.active=null;
    $('#stage-loading').classList.add('is-hidden');
    $('#stage-error').hidden=false;
    $('#error-details').textContent=String(error?.message||error);
  }
  return true;
}
function step(direction){
  const current=catalog.findIndex(x=>x.id===state.chosen.id);
  select(catalog[(current+direction+catalog.length)%catalog.length].id);
}
function randomStudy(){
  const allowed=catalog.filter(s=>!cards.get(s.id).card.hidden);
  const pool=allowed.length?allowed:catalog;
  const choices=pool.filter(s=>s.id!==state.chosen.id);
  select((choices.length?choices:pool)[Math.floor(Math.random()*(choices.length?choices.length:pool.length))].id);
}
function getPointer(event){
  const rect=viewport.getBoundingClientRect();
  pointer.x=Math.max(0,Math.min(rect.width,event.clientX-rect.left));
  pointer.y=Math.max(0,Math.min(rect.height,event.clientY-rect.top));
  pointer.nx=(pointer.x/Math.max(1,rect.width)-.5)*2;
  pointer.ny=(pointer.y/Math.max(1,rect.height)-.5)*2;
}
function bindEvents(){
  $('#search').addEventListener('input',e=>{state.query=e.target.value;updateCards();});
  $('#favorites-filter').addEventListener('click',()=>{state.favoritesOnly=!state.favoritesOnly;updateCards();});
  $('#clear-filters').addEventListener('click',()=>{
    state.filter='ALL';state.query='';state.favoritesOnly=false;$('#search').value='';updateCards();
  });
  $('#shuffle').addEventListener('click',randomStudy);
  $('#prev-study').addEventListener('click',()=>step(-1));
  $('#next-study').addEventListener('click',()=>step(1));
  $('#pause').addEventListener('click',()=>setPause(!state.paused));
  $('#restart').addEventListener('click',()=>select(state.chosen.id));
  $('#retry').addEventListener('click',()=>select(state.chosen.id));
  $('#fullscreen').addEventListener('click',async()=>{
    try{if(document.fullscreenElement)await document.exitFullscreen();else await viewport.requestFullscreen();}
    catch(error){toast('Fullscreen unavailable');}
  });
  $('#intensity').addEventListener('input',e=>{
    const value=Number(e.target.value);
    state.power=value/100;
    $('#intensity-value').textContent=value+'%';
    e.target.style.setProperty('--range',value+'%');
  });
  $$('[data-color]').forEach(button=>button.addEventListener('click',()=>{
    state.color=button.dataset.color;
    refreshSwatches();select(state.chosen.id);
  }));
  $('#reduced-motion').addEventListener('click',()=>{
    state.reduced=!state.reduced;
    $('#reduced-motion').setAttribute('aria-pressed',String(state.reduced));
    $('#render-status').textContent=state.reduced?'LIVE / REDUCED MOTION':'LIVE / RENDERING';
  });
  $('#copy-url').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(location.href);toast('Link copied');}
    catch(error){toast('Copy this address from the browser');}
  });
  $('#export-png').addEventListener('click',async()=>{
    if(!state.app||!state.active)return;
    const button=$('#export-png');button.disabled=true;
    try{
      const data=await state.app.renderer.extract.base64(state.app.stage);
      const a=document.createElement('a');a.href=data;a.download='pijs-'+state.chosen.id+'.png';
      document.body.appendChild(a);a.click();a.remove();toast('PNG exported');
    }catch(error){console.error(error);toast('Export unavailable');}
    finally{button.disabled=false;}
  });
  viewport.addEventListener('pointerenter',()=>{pointer.inside=true;});
  viewport.addEventListener('pointerleave',()=>{pointer.inside=false;});
  viewport.addEventListener('pointermove',e=>{getPointer(e);pointer.inside=true;});
  viewport.addEventListener('pointerdown',e=>{
    getPointer(e);pointer.inside=true;
    if(e.pointerType==='touch')viewport.setPointerCapture(e.pointerId);
    state.active?.click(pointer,state.power);
  });
  viewport.addEventListener('pointerup',()=>state.active?.pointerUp());
  viewport.addEventListener('pointercancel',()=>state.active?.pointerUp());
  window.addEventListener('hashchange',()=>{
    const candidate=location.hash.slice(1);
    if(catalog.some(s=>s.id===candidate)&&candidate!==state.chosen.id)select(candidate);
  });
  document.addEventListener('keydown',event=>{
    const tag=event.target?.tagName;
    if(event.ctrlKey||event.altKey||event.metaKey||['INPUT','TEXTAREA','SELECT'].includes(tag))return;
    if(event.key==='/'){event.preventDefault();$('#search').focus();}
    else if(event.code==='ArrowRight'){step(1);event.preventDefault();}
    else if(event.code==='ArrowLeft'){step(-1);event.preventDefault();}
    else if(event.code==='Space'&&tag!=='BUTTON'){setPause(!state.paused);event.preventDefault();}
    else if(event.key.toLowerCase()==='r'&&tag!=='BUTTON')select(state.chosen.id);
  });
  document.addEventListener('visibilitychange',()=>{if(state.app)document.hidden?state.app.stop():state.paused?null:state.app.start();});
  matchReduced.addEventListener?.('change',e=>{
    state.reduced=e.matches;$('#reduced-motion').setAttribute('aria-pressed',String(state.reduced));
  });
}
async function runCatalogSmoke(){
  const report={total:catalog.length,ok:0,fail:[],engine:state.app.renderer.name};
  for(const study of catalog){
    try {
      select(study.id);
      if(!state.active)throw Error('No active scene');
      state.active.update(1,{x:state.app.screen.width*.5,y:state.app.screen.height*.5,nx:0,ny:0,inside:false},.7);
      report.ok++;
    }catch(error){report.fail.push({id:study.id,message:String(error.message||error)});}
    if(study.number%10===0)await new Promise(r=>requestAnimationFrame(r));
  }
  window.__PIJS_SMOKE_RESULT__=report;
  document.documentElement.dataset.smokeFinished='true';
  document.documentElement.dataset.smokeFailures=String(report.fail.length);
  console.info('PIJS_SMOKE_RESULT',report);
  return report;
}

async function start(){
  initThumbs();renderFilters();makeCatalog();bindEvents();updateLabels();updateCards();
  try{
    const app=new Application();
    await app.init({
      preference:'webgl',resizeTo:viewport,backgroundAlpha:0,antialias:false,
      autoDensity:true,resolution:Math.min(devicePixelRatio||1,2),
      sharedTicker:false,autoStart:true
    });
    state.app=app;state.ready=true;
    app.ticker.maxFPS=60;
    app.canvas.className='render-canvas';
    app.canvas.setAttribute('role','img');
    app.canvas.setAttribute('aria-label','Живая графическая сцена на PixiJS; управление мышью или касанием');
    viewport.prepend(app.canvas);
    pointer.x=app.screen.width/2;pointer.y=app.screen.height/2;
    select(state.chosen.id);
    ro=new ResizeObserver(()=>requestAnimationFrame(()=>{
      if(!state.app||!state.active)return;
      try{state.app.resize();state.active.resize(state.app.screen.width,state.app.screen.height);}
      catch(error){console.error('Resize',error);}
    }));
    ro.observe(viewport);
    app.ticker.add(({deltaTime,deltaMS})=>{
      if(!state.active)return;
      try{
        state.active.update(Math.min(deltaTime,2.4)*(state.reduced?.12:1),pointer,state.power);
      }catch(error){
        console.error('Animation frame error',state.chosen.id,error);
        $('#stage-error').hidden=false;$('#error-details').textContent='Rendering error: '+error.message;
        app.stop();
      }
      statsTimer+=deltaMS;
      if(statsTimer>=550){statsTimer=0;$('#fps').textContent=String(Math.round(app.ticker.FPS));}
    });
    window.__PIJS_DEBUG__={catalog,select,runCatalogSmoke,app};
    if(params.get('smoke')==='1')await runCatalogSmoke();
  }catch(error){
    console.error('Unable to initialize PiJS WebGL',error);
    $('#stage-loading').classList.add('is-hidden');
    $('#stage-error').hidden=false;$('#error-details').textContent=error.message||String(error);
  }
}
void start();
