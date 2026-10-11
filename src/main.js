import { Application } from 'pixi.js';
import { buildScene, catalog } from './scenes.js';
import './style.css';

const $ = (selector) => document.querySelector(selector);
const viewport = $('#viewport');
const list = $('#scene-list');
const params = new URLSearchParams(window.location.search);
const accentOptions = {
  green: { hex: 0x04e061, css: '#04e061', title: 'NEON GREEN' },
  blue: { hex: 0x54abff, css: '#54abff', title: 'SKY BLUE' },
  purple: { hex: 0xb08cff, css: '#b08cff', title: 'LILAC' },
  coral: { hex: 0xff6d79, css: '#ff6d79', title: 'CORAL' },
};

let app = null;
let active = null;
let selectedId = catalog.some(s => s.id === params.get('scene')) ? params.get('scene') : catalog[0].id;
let accentKey = 'green';
let intensity = 0.65;
let paused = false;
let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let statMs = 0;
let state = 'booting';
const pointer = { x: 0, y: 0, nx: 0, ny: 0, inside: false };

function setAccent(key) {
  if (!accentOptions[key]) return;
  accentKey = key;
  const color = accentOptions[key];
  document.documentElement.style.setProperty('--accent', color.css);
  $('#color-name').textContent = color.title;
  document.querySelectorAll('[data-accent]').forEach(button => {
    const active = button.dataset.accent === key;
    button.classList.toggle('is-current', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (state === 'ready') activate(selectedId);
}

function renderNavigation() {
  list.innerHTML = '';
  catalog.forEach((entry, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'scene-item';
    button.dataset.scene = entry.id;
    button.innerHTML = `<span class="scene-item-index">${String(index + 1).padStart(2, '0')}</span><span class="scene-item-label">${entry.title}<small>${entry.category}</small></span><span class="scene-item-icon" aria-hidden="true">${entry.indicator}</span>`;
    button.addEventListener('click', () => activate(entry.id));
    list.appendChild(button);
  });
}

function updateNavigation() {
  document.querySelectorAll('[data-scene]').forEach(button => {
    const selected = button.dataset.scene === selectedId;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-current', selected ? 'true' : 'false');
  });
}

function activate(id) {
  const entry = catalog.find(item => item.id === id);
  if (!entry) return;
  selectedId = id;
  const index = catalog.indexOf(entry);
  const number = String(index + 1).padStart(2, '0');
  $('#breadcrumb').textContent = entry.title;
  $('#viewport-index').textContent = `${number} / 07`;
  $('#viewport-kind').textContent = entry.category;
  $('#scene-title').textContent = entry.title;
  $('#scene-description').textContent = entry.summary;
  $('#scene-tip').textContent = entry.tip;
  updateNavigation();
  const query = new URL(window.location.href);
  query.searchParams.set('scene', id);
  window.history.replaceState(null, '', query.pathname + query.search + query.hash);
  if (!app || state !== 'ready') return;
  active?.destroy();
  active = buildScene(id, { app, color: accentOptions[accentKey].hex, motion: reduced });
  active.resize(app.screen.width, app.screen.height);
  $('#object-value').textContent = Intl.NumberFormat('en-US').format(active.count);
  $('#stage-status').textContent = 'SCENE ACTIVE';
  if (paused) setPause(false);
}

function setPause(shouldPause) {
  paused = shouldPause;
  $('#pause-label').textContent = paused ? 'RESUME SCENE' : 'PAUSE SCENE';
  $('#pause-symbol').textContent = paused ? '▶' : 'Ⅱ';
  $('#stage-status').textContent = paused ? 'SCENE PAUSED' : 'SCENE ACTIVE';
  $('#motion-mode').textContent = paused ? 'PAUSED' : reduced ? 'REDUCED' : 'ENABLED';
  if (app) {
    if (paused) app.stop(); else app.start();
  }
}

function setReducedMotion(next) {
  reduced = next;
  $('#reduce-motion').setAttribute('aria-pressed', String(reduced));
  $('#reduce-motion').classList.toggle('is-on', reduced);
  $('#motion-mode').textContent = reduced ? 'REDUCED' : paused ? 'PAUSED' : 'ENABLED';
}

function refreshPointer(e) {
  const bounds = viewport.getBoundingClientRect();
  pointer.x = Math.max(0, Math.min(bounds.width, e.clientX - bounds.left));
  pointer.y = Math.max(0, Math.min(bounds.height, e.clientY - bounds.top));
  pointer.nx = (pointer.x / Math.max(1, bounds.width) - 0.5) * 2;
  pointer.ny = (pointer.y / Math.max(1, bounds.height) - 0.5) * 2;
  active?.pointerMove?.(pointer);
  $('#pointer-status').textContent = `${Math.round(pointer.x)} : ${Math.round(pointer.y)} / POINTER`;
}

function setFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else viewport.requestFullscreen?.().catch(() => {});
}

function keyboard(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const tag = event.target?.tagName;
  if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(tag)) return;
  if (event.code === 'ArrowRight' || event.code === 'ArrowLeft') {
    const i = catalog.findIndex(s => s.id === selectedId);
    const next = (i + (event.code === 'ArrowRight' ? 1 : -1) + catalog.length) % catalog.length;
    activate(catalog[next].id);
    event.preventDefault();
  } else if (event.code === 'Space') {
    setPause(!paused);
    event.preventDefault();
  } else if (event.key.toLowerCase() === 'r') {
    activate(selectedId);
  }
}

function bindControls() {
  $('#intensity').addEventListener('input', e => {
    const amount = Number(e.target.value);
    intensity = amount / 100;
    $('#intensity-value').textContent = amount + '%';
    e.target.style.setProperty('--progress', `${amount}%`);
  });
  $('#intensity').style.setProperty('--progress', '65%');
  document.querySelectorAll('[data-accent]').forEach(button => button.addEventListener('click', () => setAccent(button.dataset.accent)));
  $('#toggle-pause').addEventListener('click', () => setPause(!paused));
  $('#reset-scene').addEventListener('click', () => activate(selectedId));
  $('#reduce-motion').addEventListener('click', () => setReducedMotion(!reduced));
  $('#fullscreen').addEventListener('click', setFullscreen);
  $('#retry').addEventListener('click', () => location.reload());
  setReducedMotion(reduced);
  viewport.addEventListener('pointerenter', () => { pointer.inside = true; });
  viewport.addEventListener('pointerleave', () => { pointer.inside = false; });
  viewport.addEventListener('pointermove', refreshPointer);
  viewport.addEventListener('pointerdown', e => { refreshPointer(e); active?.click?.(pointer, intensity); });
  document.addEventListener('pointermove', e => {
    if (e.target !== viewport && !viewport.contains(e.target) && e.buttons) refreshPointer(e);
  });
  document.addEventListener('pointerup', () => active?.pointerUp?.());
  document.addEventListener('pointercancel', () => active?.pointerUp?.());
  document.addEventListener('keydown', keyboard);
  document.addEventListener('visibilitychange', () => {
    if (!app || paused) return;
    if (document.hidden) app.stop(); else app.start();
  });
}

async function start() {
  renderNavigation();
  bindControls();
  activate(selectedId);
  try {
    app = new Application();
    await app.init({
      preference: 'webgl',
      resizeTo: viewport,
      backgroundAlpha: 0,
      antialias: false,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoStart: true,
      sharedTicker: false,
    });
    app.ticker.maxFPS = 60;
    app.canvas.className = 'render-canvas';
    app.canvas.setAttribute('aria-label', 'Интерактивная графическая сцена PixiJS');
    viewport.prepend(app.canvas);
    pointer.x = app.screen.width / 2;
    pointer.y = app.screen.height / 2;
    $('#renderer-value').textContent = app.renderer.name.replace('Renderer', '').toUpperCase();
    $('#resolution-value').textContent = app.renderer.resolution.toFixed(1) + '×';
    state = 'ready';
    activate(selectedId);
    $('#loading-overlay').classList.add('is-hidden');
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (!app || !active) return;
        app.resize();
        active.resize(app.screen.width, app.screen.height);
      });
    });
    ro.observe(viewport);
    app.ticker.add(({ deltaTime, deltaMS }) => {
      const factor = reduced ? 0.18 : 1;
      active?.update(Math.min(deltaTime, 3) * factor, pointer, intensity * 1.3);
      statMs += deltaMS;
      if (statMs > 500) {
        statMs = 0;
        $('#fps-value').textContent = String(Math.round(app.ticker.FPS));
      }
    });
  } catch (error) {
    console.error('PiJS initialization failed:', error);
    state = 'failed';
    $('#loading-overlay').classList.add('is-hidden');
    $('#error-overlay').hidden = false;
  }
}

void start();
