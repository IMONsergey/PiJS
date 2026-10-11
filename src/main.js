import { catalog, collections, findStudy } from './data.js';
import { paintThumb } from './thumbs.js';
import './style.css';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const gallery = $('#gallery');
const dialog = $('#study-dialog');
const viewport = $('#viewport');
const root = $('.app');
const search = $('#search');
const nav = $('#category-nav');
const reducedMedia = matchMedia('(prefers-reduced-motion: reduce)');
const accentColors = { lime:'#d9f56e', blue:'#80a9ff', orange:'#ff8d60', lavender:'#bb98ff', ice:'#f6f4ec' };
const cards = new Map();
const pointer = { x:0,y:0,nx:0,ny:0,inside:false };
const state = {
  category: 'ALL',
  query: '',
  favoritesOnly: false,
  favorites: new Set(),
  selected: findStudy(location.hash.substring(1)),
  color: 'original',
  intensity: .68,
  reduced: reducedMedia.matches,
  paused: false,
  app: null,
  scene: null,
  createStudy: null,
};
let cardObserver, resizeObserver, initPromise, tickElapsed = 0, sceneSerial = 0;
let originFocus = null, toastTimer = 0;

const readStorage = key => { try{return localStorage.getItem(key);}catch{return null;} };
const saveStorage = (key,value) => { try{localStorage.setItem(key,value);}catch{} };
try { state.favorites = new Set(JSON.parse(readStorage('pijs_motion_favorites_v1')||'[]')); } catch { state.favorites = new Set(); }
document.documentElement.dataset.theme = readStorage('pijs_library_theme') === 'dark' ? 'dark' : 'light';
document.querySelector('meta[name="theme-color"]').content = document.documentElement.dataset.theme==='dark'?'#0d1113':'#f6f6f6';

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.hidden = true, 1700);
}

function createNavItem(name, count, key, icon = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-item';
  button.dataset.category = key;
  const ico = document.createElement('span');
  ico.className = 'nav-icon';
  ico.setAttribute('aria-hidden','true');
  ico.textContent = icon;
  const label = document.createElement('span');
  label.textContent = name;
  const amount = document.createElement('span');
  amount.className = 'nav-count';
  amount.textContent = count;
  button.append(ico,label,amount);
  button.addEventListener('click', () => {
    state.category = key;
    state.favoritesOnly = false;
    updateCatalog();
    closeSidebar();
    window.scrollTo({top:0,behavior:state.reduced?'instant':'smooth'});
  });
  return button;
}
function renderNav() {
  nav.appendChild(createNavItem('All animations','100','ALL','▦'));
  const label = document.createElement('div');
  label.className = 'sidebar-group-label';
  label.textContent = 'CATEGORIES';
  nav.appendChild(label);
  for (const group of collections) nav.appendChild(createNavItem(group.label==='Experimental playground'?'Experimental':group.label,'10',group.key));
}
function makeCard(study) {
  const card = document.createElement('article');
  card.className = 'motion-card';
  card.dataset.id = study.id;
  const header = document.createElement('div');
  header.className = 'motion-card-head';
  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'motion-open';
  open.setAttribute('aria-label', 'Открыть: ' + study.title);
  const title = document.createElement('span');
  title.textContent = study.title;
  const arrow = document.createElementNS('http://www.w3.org/2000/svg','svg');
  arrow.setAttribute('viewBox','0 0 24 24');
  arrow.setAttribute('aria-hidden','true');
  arrow.innerHTML = '<path d="M5 12h14m-6-6 6 6-6 6"/>';
  open.append(title,arrow);
  open.addEventListener('click', () => openStudy(study.id, true));
  const fav = document.createElement('button');
  fav.className = 'favorite-button';
  fav.type = 'button';
  fav.title = 'Избранное';
  fav.setAttribute('aria-label','Избранное: '+study.title);
  fav.addEventListener('click', () => toggleFavorite(study.id));
  header.append(open,fav);
  const preview = document.createElement('div');
  preview.className = 'motion-preview';
  const previewButton = document.createElement('button');
  previewButton.type = 'button';
  previewButton.className = 'motion-preview-button';
  previewButton.setAttribute('aria-label','Смотреть '+study.title);
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden','true');
  previewButton.appendChild(canvas);
  previewButton.addEventListener('click', () => openStudy(study.id, true));
  preview.appendChild(previewButton);
  const footer = document.createElement('div');
  footer.className = 'motion-card-foot';
  const category = document.createElement('span');
  category.textContent = study.categoryLabel;
  const index = document.createElement('span');
  index.textContent = String(study.number).padStart(3,'0')+' / 100';
  footer.append(category,index);
  card.append(header,preview,footer);
  cards.set(study.id, {card,canvas,fav});
  syncFavoriteButton(study.id);
  cardObserver?.observe(card);
  return card;
}
function initCatalog() {
  renderNav();
  if ('IntersectionObserver' in window) {
    cardObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        const study = findStudy(entry.target.dataset.id);
        const item = cards.get(study.id);
        if (item && !item.canvas.dataset.painted) {
          paintThumb(item.canvas,study);
          item.canvas.dataset.painted='1';
        }
        cardObserver.unobserve(entry.target);
      }
    },{rootMargin:'300px'});
  }
  const fragment = document.createDocumentFragment();
  for (const study of catalog) fragment.appendChild(makeCard(study));
  gallery.appendChild(fragment);
  updateCatalog();
}
function syncFavoriteButton(id) {
  const item = cards.get(id);
  if (!item) return;
  const on = state.favorites.has(id);
  item.fav.textContent = on ? '★' : '☆';
  item.fav.setAttribute('aria-pressed',String(on));
  if (state.selected.id === id) {
    const button = $('#dialog-favorite');
    button.textContent = on ? '★' : '☆';
    button.setAttribute('aria-pressed',String(on));
    button.setAttribute('aria-label',on?'Убрать из избранного':'Добавить в избранное');
  }
}
function toggleFavorite(id) {
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  saveStorage('pijs_motion_favorites_v1',JSON.stringify([...state.favorites]));
  syncFavoriteButton(id);
  $('#favorites-count').textContent=String(state.favorites.size);
  if (state.favoritesOnly) updateCatalog();
  toast(state.favorites.has(id)?'Added to favorites':'Removed from favorites');
}
function updateCatalog() {
  const q=state.query.trim().toLowerCase();
  let count=0;
  for (const study of catalog) {
    const item=cards.get(study.id);
    const byCategory=state.category==='ALL'||study.category===state.category;
    const byQuery=!q||[study.title,study.categoryLabel,study.category,study.family,String(study.number)].join(' ').toLowerCase().includes(q);
    const byFav=!state.favoritesOnly||state.favorites.has(study.id);
    const visible=byCategory&&byQuery&&byFav;
    item.card.hidden=!visible;
    if (visible) {
      count++;
      if (!cardObserver&&!item.canvas.dataset.painted) {
        paintThumb(item.canvas,study);
        item.canvas.dataset.painted='1';
      } else if(cardObserver&&!item.canvas.dataset.painted) {
        cardObserver.observe(item.card);
      }
    }
  }
  const name=state.favoritesOnly?'Favorites':
    state.category==='ALL'?'All animations':collections.find(c=>c.key===state.category)?.label||'All animations';
  $('#section-title').textContent=name;
  $('#visible-count').textContent=count+' '+(count===1?'animation':'animations');
  $('#empty-state').hidden=count!==0;
  $('#favorites-count').textContent=String(state.favorites.size);
  $('#favorites-nav').classList.toggle('is-active',state.favoritesOnly);
  $$('.nav-item[data-category]').forEach(btn => {
    const active = !state.favoritesOnly&&btn.dataset.category===state.category;
    btn.classList.toggle('is-active',active);
    btn.setAttribute('aria-current',active?'page':'false');
  });
}
function closeSidebar() {
  document.body.classList.remove('nav-open');
  $('#menu-toggle').setAttribute('aria-expanded','false');
  $('#sidebar-shade').hidden=true;
}
function toggleSidebar() {
  const open=document.body.classList.toggle('nav-open');
  $('#menu-toggle').setAttribute('aria-expanded',String(open));
  $('#sidebar-shade').hidden=!open;
}
function selectedAccent() {
  return state.color==='original'?state.selected.accent:accentColors[state.color];
}
function updateSwatches() {
  const origin=$('[data-color="original"]');
  origin.style.setProperty('--swatch',state.selected.accent);
  $$('[data-color]').forEach(button=>{
    const current=button.dataset.color===state.color;
    button.classList.toggle('is-current',current);
    button.setAttribute('aria-pressed',String(current));
  });
}
function updateDialogLabels() {
  const study=state.selected;
  $('#dialog-number').textContent=String(study.number).padStart(2,'0')+' / 100';
  $('#dialog-category').textContent=study.categoryLabel;
  $('#dialog-title').textContent=study.title;
  $('#detail-tip').textContent=study.tip;
  $('#reference-link').textContent='Inspiration: '+study.reference.label+' ↗';
  $('#reference-link').href=study.reference.url;
  document.title=study.title+' — PiJS Motion library';
  updateSwatches();
  syncFavoriteButton(study.id);
}
function updateHash(id,mode) {
  const url=new URL(location.href);
  url.hash=id?'#'+id:'';
  if(mode==='push')history.pushState({pijsStudy:id},'',url.pathname+url.search+url.hash);
  else history.replaceState({pijsStudy:id},'',url.pathname+url.search+url.hash);
}
function openStudy(id,pushToHistory=false) {
  const study=catalog.find(item=>item.id===id);
  if (!study) return;
  const wasOpen=dialog.open;
  if (!wasOpen) {
    originFocus=pushToHistory?document.activeElement:null;
    dialog.showModal();
    state.paused=false;
  }
  state.selected=study;
  updateDialogLabels();
  if(pushToHistory) updateHash(id,wasOpen?'replace':'push');
  const token=++sceneSerial;
  void renderStudy(token);
}
async function ensureApp() {
  if (state.app) return state.app;
  if (initPromise) return initPromise;
  initPromise=(async()=>{
    const {Application,createStudy}=await import('./runtime.js');
    const app=new Application();
    await app.init({
      preference:'webgl',resizeTo:viewport,
      backgroundAlpha:0,antialias:false,autoDensity:true,
      resolution:Math.min(devicePixelRatio||1,2),sharedTicker:false,autoStart:true
    });
    state.app=app;
    state.createStudy=createStudy;
    app.ticker.maxFPS=60;
    app.canvas.className='render-canvas';
    app.canvas.setAttribute('role','img');
    app.canvas.setAttribute('aria-label','Интерактивная графическая сцена PixiJS');
    viewport.prepend(app.canvas);
    pointer.x=app.screen.width/2;pointer.y=app.screen.height/2;
    resizeObserver=new ResizeObserver(()=>{
      requestAnimationFrame(()=>{
        if(!state.app||!state.scene||!dialog.open)return;
        state.app.resize();
        state.scene.resize(state.app.screen.width,state.app.screen.height);
      });
    });
    resizeObserver.observe(viewport);
    app.ticker.add(({deltaTime,deltaMS})=>{
      if(!dialog.open||!state.scene)return;
      try{
        state.scene.update(Math.min(deltaTime,2.4)*(state.reduced?.14:1),pointer,state.intensity);
      }catch(error){
        console.error('Pixi animation error',state.selected.id,error);
        showStageError(error);
        app.stop();
      }
      tickElapsed+=deltaMS;
      if(tickElapsed>650){tickElapsed=0;$('#fps').textContent=Math.round(app.ticker.FPS)+' FPS';}
    });
    return app;
  })();
  try{return await initPromise;}finally{initPromise=null;}
}
function showStageError(error) {
  $('#stage-loading').classList.add('is-hidden');
  $('#stage-error').hidden=false;
  $('#error-details').textContent=error?.message||String(error)||'WebGL unavailable';
}
async function renderStudy(token) {
  $('#stage-error').hidden=true;
  $('#stage-loading').classList.remove('is-hidden');
  try {
    const app=await ensureApp();
    if(!dialog.open||token!==sceneSerial){app.stop();return;}
    state.scene?.destroy();
    state.scene=state.createStudy(app,state.selected,Number.parseInt(selectedAccent().slice(1),16));
    app.resize(); state.scene.resize(app.screen.width,app.screen.height);
    $('#stage-loading').classList.add('is-hidden');
    if (!state.paused&&!document.hidden)app.start();else app.stop();
  } catch(error) {
    console.error('PiJS preview failed',state.selected.id,error);
    if(dialog.open&&token===sceneSerial)showStageError(error);
  }
}
function closeDialog() {
  if (dialog.open) {
    if (location.hash.startsWith('#study-')) updateHash(null,'replace');
    dialog.close();
  }
}
dialog.addEventListener('close',()=>{
  ++sceneSerial;
  try{state.scene?.destroy();}catch(error){console.warn('Scene cleanup',error);}
  state.scene=null;
  state.app?.stop();
  $('#stage-error').hidden=true;
  $('#stage-loading').classList.remove('is-hidden');
  document.title='Motion library — PiJS';
  if(location.hash.startsWith('#study-'))updateHash(null,'replace');
  originFocus?.focus?.();
  originFocus=null;
});
function nextStudy(dir) {
  const idx=catalog.findIndex(item=>item.id===state.selected.id);
  openStudy(catalog[(idx+dir+catalog.length)%catalog.length].id,true);
}
function setPaused(paused) {
  state.paused=paused;
  $('#pause-label').textContent=paused?'Play':'Pause';
  $('#pause-icon').textContent=paused?'▶':'Ⅱ';
  if(!state.app)return;
  if(paused||document.hidden)state.app.stop();else state.app.start();
}
function setAdvanced(open) {
  $('#advanced-controls').hidden=!open;
  $('#settings-toggle').setAttribute('aria-expanded',String(open));
}
function pointFromEvent(event) {
  const rect=viewport.getBoundingClientRect();
  pointer.x=Math.max(0,Math.min(rect.width,event.clientX-rect.left));
  pointer.y=Math.max(0,Math.min(rect.height,event.clientY-rect.top));
  pointer.nx=(pointer.x/Math.max(1,rect.width)-.5)*2;
  pointer.ny=(pointer.y/Math.max(1,rect.height)-.5)*2;
}
function initHandlers() {
  search.addEventListener('input',event=>{state.query=event.target.value;updateCatalog();});
  $('#menu-toggle').addEventListener('click',toggleSidebar);
  $('#sidebar-shade').addEventListener('click',closeSidebar);
  $('#favorites-nav').addEventListener('click',()=>{
    state.favoritesOnly=!state.favoritesOnly;
    state.category='ALL';
    updateCatalog();
    closeSidebar();
  });
  $('#theme-toggle').addEventListener('click',()=>{
    const next=document.documentElement.dataset.theme==='light'?'dark':'light';
    document.documentElement.dataset.theme=next;
    saveStorage('pijs_library_theme',next);
    document.querySelector('meta[name="theme-color"]').content=next==='light'?'#f6f6f6':'#0d1113';
  });
  $('.header-search').addEventListener('click',()=>{
    if(matchMedia('(max-width:580px)').matches&&!root.classList.contains('search-open')){
      root.classList.add('search-open');
      requestAnimationFrame(()=>search.focus());
    }
  });
  search.addEventListener('blur',()=>{
    if(matchMedia('(max-width:580px)').matches&&!search.value){
      setTimeout(()=>{if(document.activeElement!==search)root.classList.remove('search-open');},100);
    }
  });
  $('#clear-filters').addEventListener('click',()=>{
    state.category='ALL';state.favoritesOnly=false;state.query='';
    search.value='';
    updateCatalog();
  });
  $('#shuffle').addEventListener('click',()=>{
    const visible=catalog.filter(study=>!cards.get(study.id).card.hidden);
    const pool=visible.length?visible:catalog;
    const index=Math.floor(Math.random()*pool.length);
    openStudy(pool[index].id,true);
  });
  $('#dialog-close').addEventListener('click',closeDialog);
  $('#dialog-favorite').addEventListener('click',()=>toggleFavorite(state.selected.id));
  $('#prev-study').addEventListener('click',()=>nextStudy(-1));
  $('#next-study').addEventListener('click',()=>nextStudy(1));
  $('#fullscreen').addEventListener('click',async()=>{
    try {if(document.fullscreenElement)await document.exitFullscreen();else await viewport.requestFullscreen();}
    catch {toast('Fullscreen unavailable');}
  });
  $('#settings-toggle').addEventListener('click',()=>setAdvanced($('#advanced-controls').hidden));
  $('#pause').addEventListener('click',()=>setPaused(!state.paused));
  $('#restart').addEventListener('click',()=>{
    openStudy(state.selected.id,false);
    setPaused(false);
  });
  $('#retry').addEventListener('click',()=>openStudy(state.selected.id,false));
  $('#intensity').addEventListener('input',event=>{
    const value=Number(event.target.value);
    state.intensity=value/100;
    $('#intensity-value').textContent=value+'%';
    event.target.style.setProperty('--range',value+'%');
  });
  $$('[data-color]').forEach(button=>button.addEventListener('click',()=>{
    state.color=button.dataset.color;
    updateSwatches();
    openStudy(state.selected.id,false);
  }));
  $('#reduced-motion').addEventListener('click',()=>{
    state.reduced=!state.reduced;
    $('#reduced-motion').setAttribute('aria-pressed',String(state.reduced));
    $('#reduced-motion').textContent='Reduced motion: '+(state.reduced?'on':'off');
  });
  $('#copy-url').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(location.href);toast('Link copied');}
    catch{toast('Copy the URL from the address bar');}
  });
  $('#export-png').addEventListener('click',async()=>{
    if(!state.app||!state.scene)return;
    const button=$('#export-png');button.disabled=true;
    try {
      const data=await state.app.renderer.extract.base64(state.app.stage);
      const a=document.createElement('a');
      a.href=data;a.download='pijs-'+state.selected.id+'.png';
      document.body.appendChild(a);a.click();a.remove();toast('PNG saved');
    }catch(error){console.error(error);toast('Export unavailable');}
    finally{button.disabled=false;}
  });
  viewport.addEventListener('pointerenter',()=>pointer.inside=true);
  viewport.addEventListener('pointerleave',()=>pointer.inside=false);
  viewport.addEventListener('pointermove',event=>{pointFromEvent(event);pointer.inside=true;});
  viewport.addEventListener('pointerdown',event=>{
    pointFromEvent(event);pointer.inside=true;
    state.scene?.click(pointer,state.intensity);
  });
  viewport.addEventListener('pointerup',()=>state.scene?.pointerUp());
  viewport.addEventListener('pointercancel',()=>state.scene?.pointerUp());
  document.addEventListener('visibilitychange',()=>{
    if(state.app) {
      if(document.hidden||state.paused||!dialog.open)state.app.stop();
      else state.app.start();
    }
  });
  window.addEventListener('popstate',()=>{
    const id=location.hash.slice(1);
    if(catalog.some(study=>study.id===id))openStudy(id,false);
    else closeDialog();
  });
  window.addEventListener('hashchange',()=>{
    const id=location.hash.slice(1);
    if(catalog.some(study=>study.id===id)&&id!==state.selected.id)openStudy(id,false);
    else if(!id&&dialog.open)closeDialog();
  });
  document.addEventListener('keydown',event=>{
    const tag=event.target?.tagName;
    if(event.ctrlKey||event.altKey||event.metaKey)return;
    if (event.key==='Escape'&&root.classList.contains('search-open')) {
      root.classList.remove('search-open');search.blur();return;
    }
    if (dialog.open) {
      if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;
      if(event.key==='ArrowRight'){nextStudy(1);event.preventDefault();}
      if(event.key==='ArrowLeft'){nextStudy(-1);event.preventDefault();}
      if(event.code==='Space'&&tag!=='BUTTON'){setPaused(!state.paused);event.preventDefault();}
      return;
    }
    if (event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(tag)) {
      root.classList.add('search-open');search.focus();event.preventDefault();
    }
  });
}
function start() {
  initCatalog();
  initHandlers();
  updateSwatches();
  $('#reduced-motion').setAttribute('aria-pressed',String(state.reduced));
  $('#reduced-motion').textContent='Reduced motion: '+(state.reduced?'on':'off');
  const id=location.hash.slice(1);
  if(catalog.some(study=>study.id===id))openStudy(id,false);
}
start();
