import {catalog,categories,getItem} from './library/catalog.js';
import {componentMarkup} from './library/components.js';
import {mountInteractions} from './library/interactions.js';
import './library/shell.css';
import './library/components.css';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const tileGrid=$('#tile-grid'),search=$('#search'),sidebar=$('#sidebar'),
  viewer=$('#stage-viewport'),inner=$('#stage-inner'),dom=$('#stage-dom');
const icon={
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  pointer:'<path d="m4 3 7 18 3-8 8-3L4 3z"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5zm-9 9 9 5 9-5m-18 5 9 5 9-5"/>',
  type:'<path d="M4 7V4h16v3M12 4v16m-4 0h8"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1"/><path d="m4 18 6-6 4 4 3-3 4 4"/>',
  waves:'<path d="M2 7q5-5 10 0t10 0M2 13q5-5 10 0t10 0M2 19q5-5 10 0t10 0"/>',
  sparkles:'<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2z"/>',
};
const STORE='pijs_curated_favorites_v3';
const THM='pijs_library_theme';
const state={selected:getItem(location.hash.slice(1)),category:'all',query:'',favoritesOnly:false,
  favorites:new Set(),energy:.65,speed:1,paused:false,view:'preview',gpu:null,loading:null,mounted:null,
  theme:'light'
};
let toastHandle=0;
try{state.favorites=new Set(JSON.parse(localStorage.getItem(STORE)||'[]'));}catch{}
try{state.theme=localStorage.getItem(THM)==='dark'?'dark':'light';}catch{}
document.documentElement.dataset.theme=state.theme;
const save=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
const toast=message=>{const el=$('#toast');el.textContent=message;el.hidden=false;clearTimeout(toastHandle);toastHandle=setTimeout(()=>el.hidden=true,1700);};
const filtered=()=>catalog.filter(item=>{
  const q=state.query.trim().toLowerCase();
  return (state.category==='all'||item.category===state.category)&&
    (!state.favoritesOnly||state.favorites.has(item.id))&&
    (!q||[item.title,item.description,item.category,item.interaction].join(' ').toLowerCase().includes(q));
});
function renderNav(){
  const root=$('#sidebar-nav');root.replaceChildren();
  for(const cat of categories){
    const button=document.createElement('button');button.type='button';button.className='side-item';
    button.dataset.category=cat.id;
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+icon[cat.icon]+'</svg><span>'+cat.label+'</span><small>'+ (cat.id==='all'?catalog.length:catalog.filter(i=>i.category===cat.id).length) +'</small>';
    button.addEventListener('click',()=>{
      state.category=cat.id;state.favoritesOnly=false;closeNav();renderList();
      const first=filtered()[0];if(first)select(first.id,false);
    });
    root.appendChild(button);
  }
}
function closeNav(){
  document.body.classList.remove('nav-open');$('#mobile-shade').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');
}
function thumbMarkup(item){
  return '<div class="tile-art"><div class="tile-art-inner" inert aria-hidden="true">'+componentMarkup(item)+'</div></div>';
}
const tileScaleObserver=new ResizeObserver(entries=>{
  for(const entry of entries){
    const el=entry.target;
    const width=el.clientWidth,height=el.clientHeight;
    const category=el.closest('.tile')?.dataset.category||'buttons';
    const zoom={buttons:1.68,cards:1.21,typography:1.47,galleries:1.16,backgrounds:1.03,interfaces:1.36}[category]||1;
    el.style.setProperty('--tile-scale',(Math.min(width/760,height/510)*zoom).toFixed(5));
  }
});
function makeTile(item){
  const tile=document.createElement('article');tile.className='tile';
  tile.dataset.id=item.id;tile.dataset.category=item.category;
  tile.innerHTML='<div class="tile-preview">'+thumbMarkup(item)+'<div class="tile-shade"></div><span class="tile-play" aria-hidden="true">↗</span><button type="button" class="tile-cover" aria-label="Preview '+item.title+'"></button></div><div class="tile-title-row"><div class="tile-name">'+item.title+'<span>'+categories.find(c=>c.id===item.category)?.short+'</span></div><button type="button" class="tile-fave" aria-label="Favorite '+item.title+'" aria-pressed="false">☆</button></div>';
  tile.querySelector('.tile-cover').addEventListener('click',()=>select(item.id,true));
  tile.querySelector('.tile-title-row .tile-name').addEventListener('click',()=>select(item.id,true));
  tile.querySelector('.tile-fave').addEventListener('click',e=>{e.stopPropagation();toggleFavorite(item.id);});
  tileScaleObserver.observe(tile.querySelector('.tile-preview'));
  updateTile(tile,item);
  return tile;
}
function updateTile(tile,item){
  tile.classList.toggle('is-active',state.selected.id===item.id);
  const fav=tile.querySelector('.tile-fave'),on=state.favorites.has(item.id);
  fav.textContent=on?'★':'☆';fav.setAttribute('aria-pressed',String(on));
}
function renderList(){
  const items=filtered();
  const fragment=document.createDocumentFragment();
  for(const item of items)fragment.appendChild(makeTile(item));
  tileScaleObserver.disconnect();
  tileGrid.replaceChildren(fragment);
  $$('.tile .tile-preview').forEach(el=>tileScaleObserver.observe(el));
  const category=categories.find(c=>c.id===state.category);
  $('#filter-label').textContent=state.favoritesOnly?'Favorites':category?.label||'All components';
  $('#result-count').textContent=items.length+' '+(items.length===1?'component':'components');
  $('#empty-state').hidden=items.length>0;
  $('#fav-count').textContent=state.favorites.size;
  $('#favorites-filter').classList.toggle('is-active',state.favoritesOnly);
  $$('.side-item').forEach(btn=>btn.classList.toggle('is-active',btn.dataset.category===state.category&&!state.favoritesOnly));
}
function toggleFavorite(id){
  if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);
  save(STORE,JSON.stringify([...state.favorites]));
  renderList();toast(state.favorites.has(id)?'Added to favorites':'Removed from favorites');
}
function getSnippet(item){
  return [
    "import { getItem } from './src/library/catalog.js';",
    "import { componentMarkup } from './src/library/components.js';",
    "import { mountInteractions } from './src/library/interactions.js';",
    "import { createGraphics } from './src/library/gpu.js';",
    "import './src/library/components.css';",
    '',
    "const item = getItem('"+item.id+"');",
    "const stage = document.querySelector('#stage');",
    'stage.innerHTML = componentMarkup(item);',
    'const disposeUI = mountInteractions(stage, item);',
    'const graphics = await createGraphics(stage);',
    'graphics.select(item);',
    '',
    '// On unmount: disposeUI(); graphics.destroy();',
  ].join('\n');
}
function updateDetails(){
  const item=state.selected;
  $('#active-category').textContent=categories.find(c=>c.id===item.category)?.label.toUpperCase();
  $('#active-index').textContent=String(item.number).padStart(2,'0')+' / '+catalog.length;
  $('#active-title').textContent=item.title;$('#active-description').textContent=item.description;
  $('#interaction-hint').textContent=item.interaction;
  $('#component-detail').textContent=item.interaction+' · '+item.category;
  viewer.dataset.tone=item.tone;
  $('#sample-code').textContent=getSnippet(item);
  $('#source-file').href='https://github.com/IMONsergey/PiJS/blob/feat/curated-motion-components-v3/src/library/components.js';
  const url=new URL(location.href);url.hash=item.id;history.replaceState(null,'',url.pathname+url.search+url.hash);
  $$('.tile').forEach(tile=>tile.classList.toggle('is-active',tile.dataset.id===item.id));
}
function adaptStage(){
  const scale=Math.min(viewer.clientWidth/760,viewer.clientHeight/510);
  inner.style.setProperty('--stage-scale',scale.toFixed(4));
}
let gfxToken=0;
async function ensureGraphics(){
  if(state.gpu)return state.gpu;
  if(state.loading)return state.loading;
  const token=++gfxToken;
  state.loading=(async()=>{
    try{
      const {createGraphics}=await import('./library/gpu.js');
      if(token!==gfxToken)return null;
      const gpu=await createGraphics(inner,{
        onFailure:error=>{console.warn('PixiJS rendering fallback',error);}
      });
      state.gpu=gpu;
      if(!state.paused)gpu.resume();else gpu.pause();
      gpu.setEnergy(state.energy);gpu.setSpeed(state.speed);
      gpu.select(state.selected);
      return gpu;
    }catch(error){console.warn('WebGL initialization failed',error);$('#stage-error').hidden=false;return null;}
    finally{$('#stage-loading').hidden=true;state.loading=null;}
  })();
  return state.loading;
}
function select(id,scroll=false){
  const item=catalog.find(i=>i.id===id);
  if(!item)return;
  state.mounted?.();state.mounted=null;
  state.selected=item;
  dom.innerHTML=componentMarkup(item);
  state.mounted=mountInteractions(dom,item,{power:()=>state.energy,notify:toast});
  updateDetails();adaptStage();
  if(state.gpu){
    try{state.gpu.select(item);}catch(error){console.warn('GPU preset fallback:',error);$('#stage-error').hidden=false;}
  }else{
    $('#stage-loading').hidden=false;
    void ensureGraphics();
  }
  if(scroll&&matchMedia('(max-width:980px)').matches){
    window.scrollTo({top:0,behavior:'instant'});
  }
}
function step(n){
  const index=catalog.indexOf(state.selected);
  select(catalog[(index+n+catalog.length)%catalog.length].id,true);
}
function switchTab(name){
  state.view=name;
  $('#panel-preview').hidden=name!=='preview';
  $('#panel-code').hidden=name!=='code';
  $$('[data-tab]').forEach(b=>{const active=b.dataset.tab===name;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
}
function updateMotion(){
  state.gpu?.setEnergy(state.energy);
  state.gpu?.setSpeed(state.speed);
  inner.style.setProperty('--energy',state.energy);
  inner.style.setProperty('--speed',state.speed);
}
function refreshPause(){
  inner.classList.toggle('is-paused',state.paused);
  state.paused?state.gpu?.pause():state.gpu?.resume();
  $('#pause').setAttribute('aria-pressed',String(state.paused));
  $('#pause').innerHTML=state.paused?'▶ <span>Play</span>':'Ⅱ <span>Pause</span>';
}
function init(){
  renderNav();
  $('#item-count').textContent=catalog.length;
  $('#nav-count').textContent=catalog.length;
  renderList();
  const start=location.hash.replace('#','');
  select(catalog.some(i=>i.id===start)?start:catalog[0].id,false);
  $('#menu-toggle').addEventListener('click',()=>{
    const open=document.body.classList.toggle('nav-open');
    $('#menu-toggle').setAttribute('aria-expanded',String(open));$('#mobile-shade').hidden=!open;
  });
  $('#mobile-shade').addEventListener('click',closeNav);
  $('#favorites-filter').addEventListener('click',()=>{
    state.favoritesOnly=!state.favoritesOnly;state.category='all';renderList();closeNav();
  });
  search.addEventListener('input',event=>{state.query=event.target.value;renderList();});
  $('#reset-filter').addEventListener('click',()=>{state.category='all';state.favoritesOnly=false;search.value='';state.query='';renderList();});
  $('#prev').addEventListener('click',()=>step(-1));
  $('#next').addEventListener('click',()=>step(1));
  $('#theme-toggle').addEventListener('click',()=>{
    state.theme=state.theme==='light'?'dark':'light';document.documentElement.dataset.theme=state.theme;
    save(THM,state.theme);document.querySelector('meta[name="theme-color"]').content=state.theme==='light'?'#f6f6f6':'#101416';
  });
  $('#share').addEventListener('click',()=>{
    navigator.clipboard.writeText(location.href).then(()=>toast('Link copied')).catch(()=>toast('Copy the address from your browser'));
  });
  $('#copy-usage').addEventListener('click',()=>{
    navigator.clipboard.writeText(getSnippet(state.selected)).then(()=>toast('Usage copied')).catch(()=>toast('Clipboard unavailable'));
  });

  viewer.addEventListener('pointermove',e=>{
    const r=viewer.getBoundingClientRect();
    state.gpu?.setPointer((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);
  });
  $('#intensity').addEventListener('input',e=>{
    state.energy=Number(e.target.value)/100;$('#energy-value').textContent=e.target.value+'%';
    e.target.style.setProperty('--track',e.target.value+'%');updateMotion();
  });
  $('#speed').addEventListener('input',e=>{
    state.speed=Number(e.target.value)/100;$('#speed-value').textContent=state.speed.toFixed(1)+'×';
    e.target.style.setProperty('--track',((Number(e.target.value)-30)/150*100)+'%');updateMotion();
  });
  $('#restart').addEventListener('click',()=>select(state.selected.id,false));
  $('#pause').addEventListener('click',()=>{state.paused=!state.paused;refreshPause();});
  $$('[data-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
  $('#fullscreen').addEventListener('click',async()=>{try{document.fullscreenElement?await document.exitFullscreen():await viewer.requestFullscreen();}catch{toast('Fullscreen unavailable');}});
  document.addEventListener('keydown',e=>{
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
    if(e.key==='/'){search.focus();e.preventDefault();}
    if(e.key==='ArrowRight'){step(1);e.preventDefault();}
    if(e.key==='ArrowLeft'){step(-1);e.preventDefault();}
    if(e.code==='Space'){state.paused=!state.paused;refreshPause();e.preventDefault();}
  });
  window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id&&id!==state.selected.id)select(id,false);});
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  if(reduced.matches)state.paused=true;
  reduced.addEventListener?.('change',e=>{state.paused=e.matches;refreshPause();});
  const resize=new ResizeObserver(adaptStage);resize.observe(viewer);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)state.gpu?.pause();else if(!state.paused)state.gpu?.resume();});
  window.__PIJS_TEST__={catalog,select,getState:()=>({...state,gpu:!!state.gpu}),step,filter:category=>{state.category=category;renderList();},setPaused:v=>{state.paused=v;refreshPause();}};
}
init();
