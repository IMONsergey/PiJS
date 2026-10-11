import { Container, Graphics, Sprite, Text, SplitText, PerspectiveMesh } from 'pixi.js';

export const catalog = [
  { id: 'warp', title: 'Star Warp', category: 'PARTICLE SYSTEM', summary: 'Трёхмерная иллюзия скорости из сотен GPU-спрайтов.', tip: 'Двигай курсором и меняй интенсивность', indicator: '✦' },
  { id: 'magnet', title: 'Magnetic Field', category: 'INTERACTIVE PHYSICS', summary: 'Частицы мягко притягиваются к курсору и возвращаются на место.', tip: 'Веди курсор сквозь поле частиц', indicator: '⠿' },
  { id: 'waves', title: 'Flowing Waves', category: 'VECTOR GRAPHICS', summary: 'Генеративные контуры, изменяемые в каждом кадре.', tip: 'Двигай курсором: волны реагируют на движение', indicator: '≈' },
  { id: 'type', title: 'Kinetic Type', category: 'TYPOGRAPHY', summary: 'Посимвольная анимация и взаимодействие с текстом.', tip: 'Наведи курсор на буквы и увеличь интенсивность', indicator: 'Aa' },
  { id: 'perspective', title: 'Depth / Mesh', category: 'PERSPECTIVE MESH', summary: 'Трансформация плоскости с перспективой в WebGL.', tip: 'Веди курсор по разным углам кадра', indicator: '▱' },
  { id: 'trail', title: 'Motion Trail', category: 'POINTER INTERACTION', summary: 'Живой каллиграфический след с частицами и инерцией.', tip: 'Рисуй курсором, нажимай для вспышки', indicator: '↝' },
  { id: 'cards', title: 'Physical Cards', category: 'POINTER EVENTS', summary: 'Объекты сцены с drag-and-drop и плавной физикой.', tip: 'Перетаскивай карточки мышью или пальцем', indicator: '▣' },
];

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const mix = (a, b, t) => a + (b - a) * t;
const rng = (seed = 42) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const colorize = (accent, seed) => (seed % 5 === 0 ? 0xe9f1ec : accent);
const roundedText = (text, size, color, weight = '700') => new Text({ text, style: { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: size, fontWeight: weight, fill: color, letterSpacing: -0.5 } });

export function buildScene(id, { app, color, motion }) {
  const root = new Container();
  app.stage.addChild(root);
  const textures = [];
  const disposers = [];
  let dimensions = { w: app.screen.width, h: app.screen.height };

  function makeDisc(radius = 5) {
    const gfx = new Graphics().circle(radius + 1, radius + 1, radius).fill(0xffffff);
    const texture = app.renderer.generateTexture(gfx);
    textures.push(texture);
    gfx.destroy();
    return texture;
  }
  function makeSprite(texture, tint, opacity = 1) {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.tint = tint;
    sprite.alpha = opacity;
    root.addChild(sprite);
    return sprite;
  }
  function textAt(text, size, c, x, y, alpha = 1) {
    const item = roundedText(text, size, c);
    item.position.set(x, y);
    item.alpha = alpha;
    root.addChild(item);
    return item;
  }

  let scene;
  if (id === 'warp') {
    const random = rng(195);
    const texture = makeDisc(4);
    const stars = [];
    const count = dimensions.w < 700 ? 420 : 920;
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2;
      const distance = 22 + random() * 800;
      const z = 80 + random() * 1250;
      stars.push({ angle, distance, z, sprite: makeSprite(texture, colorize(color, i), 0.65) });
    }
    let t = 0;
    let cx = 0;
    let cy = 0;
    scene = {
      count,
      update(dt, pointer, power) {
        t += dt;
        cx = mix(cx, pointer.nx * 40 * power, 0.026 * dt);
        cy = mix(cy, pointer.ny * 40 * power, 0.026 * dt);
        const speed = (1.5 + power * 13) * dt;
        const { w, h } = dimensions;
        for (const s of stars) {
          s.z -= speed;
          if (s.z < 20) s.z += 1300;
          const x = Math.cos(s.angle) * s.distance;
          const y = Math.sin(s.angle) * s.distance;
          const scale = 330 / s.z;
          s.sprite.position.set(w / 2 + x * scale - cx, h / 2 + y * scale - cy);
          const r = clamp(scale * 0.5, 0.1, 3.0);
          s.sprite.scale.set(r, Math.max(r, r * (1 + power * (1 - Math.min(s.z / 1000, 1)) * 3)));
          s.sprite.alpha = clamp(1 - s.z / 1850, 0.12, 0.94);
          s.sprite.rotation = Math.atan2(y, x) - Math.PI / 2;
        }
      },
    };
  } else if (id === 'magnet') {
    const random = rng(61);
    const texture = makeDisc(2);
    const dots = [];
    const count = dimensions.w < 700 ? 400 : 850;
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2;
      const spread = Math.sqrt(random());
      const nx = Math.cos(angle) * spread;
      const ny = Math.sin(angle) * spread;
      const sp = makeSprite(texture, colorize(color, i), 0.35 + random() * 0.6);
      dots.push({ sp, nx, ny, x: 0, y: 0, vx: 0, vy: 0 });
    }
    const home = (d) => ({ x: dimensions.w / 2 + d.nx * Math.min(dimensions.w * 0.36, 365), y: dimensions.h / 2 + d.ny * Math.min(dimensions.h * 0.34, 255) });
    dots.forEach(d => { const p = home(d); d.x = p.x; d.y = p.y; d.sp.position.set(d.x, d.y); });
    scene = {
      count,
      update(dt, pointer, power) {
        const radius = 170 + power * 110;
        const targetX = pointer.x;
        const targetY = pointer.y;
        const stability = Math.pow(0.94, dt);
        for (const d of dots) {
          const desired = home(d);
          const dx = targetX - d.x;
          const dy = targetY - d.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const field = Math.max(0, 1 - dist / radius);
          const pull = pointer.inside ? field * power * 2.5 : 0;
          d.vx += ((desired.x - d.x) * 0.004 + dx / dist * pull) * dt;
          d.vy += ((desired.y - d.y) * 0.004 + dy / dist * pull) * dt;
          d.vx *= stability;
          d.vy *= stability;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.sp.position.set(d.x, d.y);
          d.sp.scale.set(0.5 + field * power * 0.65);
        }
      },
      resize() {
        for (const d of dots) {
          const p = home(d);
          d.x = p.x; d.y = p.y;
          d.vx = d.vy = 0;
        }
      },
    };
  } else if (id === 'waves') {
    const waves = [0, 1, 2, 3, 4].map(() => {
      const g = new Graphics();
      root.addChild(g);
      return g;
    });
    let time = 0;
    const colors = [color, color, 0xdde4e1, color, 0xf0f5f2];
    scene = {
      count: waves.length,
      update(dt, pointer, power) {
        time += 0.015 * dt;
        const { w, h } = dimensions;
        for (let l = 0; l < waves.length; l++) {
          const graph = waves[l];
          const baseline = h * (0.51 + l * 0.081);
          graph.clear().moveTo(0, h + 10).lineTo(0, baseline);
          const amplitude = (15 + power * 34) * (1 + l * 0.21);
          const mouseOffset = pointer.inside ? (pointer.nx * 22 + pointer.ny * 15) * power : 0;
          for (let x = 0; x <= w + 16; x += 13) {
            const a = x / w;
            const yy = baseline
              + Math.sin(a * 8 + time * (1 + l * 0.15) + l * 1.35) * amplitude
              + Math.sin(a * 16 - time * 0.72 - l * 0.3) * amplitude * 0.26
              + mouseOffset * Math.sin(a * Math.PI);
            graph.lineTo(x, yy);
          }
          graph.lineTo(w + 15, h + 15).closePath().fill({ color: colors[l], alpha: l === 4 ? 0.2 : 0.11 + l * 0.06 });
        }
      },
    };
  } else if (id === 'type') {
    const glow = new Graphics().roundRect(-295, -87, 590, 180, 18).stroke({ color, width: 1, alpha: 0.35 });
    root.addChild(glow);
    const split = new SplitText({ text: 'PIXI.JS', style: { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 108, fontWeight: '900', fill: color, letterSpacing: -5 } });
    root.addChild(split);
    const caption = textAt('TEXT AS A LIVE GRAPHIC OBJECT', 11, 0x9fa9a4, 0, 0);
    let frame = 0;
    const chars = split.chars;
    scene = {
      count: chars.length + 2,
      resize() {
        const { w, h } = dimensions;
        const sizeFactor = Math.min(1, (w - 84) / 680);
        split.scale.set(sizeFactor);
        split.position.set((w - split.width) / 2, h * 0.45 - split.height / 2);
        glow.scale.set(sizeFactor);
        glow.position.set(w / 2, h * 0.45);
        caption.position.set((w - caption.width) / 2, h * 0.45 + 94 * sizeFactor);
      },
      update(dt, pointer, power) {
        frame += 0.025 * dt;
        chars.forEach((ch, i) => {
          const ripple = Math.sin(frame * 1.5 + i * 0.63);
          const boost = pointer.inside ? Math.max(0, 1 - Math.abs(pointer.x - (split.x + i * split.width / chars.length)) / 180) : 0;
          ch.y = (ripple * 17 + boost * pointer.ny * 65) * power;
          ch.rotation = Math.sin(frame + i * 0.4) * 0.045 * power;
          ch.alpha = 0.75 + (ripple + 1) * 0.12;
        });
        glow.rotation = Math.sin(frame * 0.3) * 0.02 * power;
      },
    };
  } else if (id === 'perspective') {
    const src = new Container();
    src.addChild(new Graphics().roundRect(0, 0, 570, 360, 24).fill(0x19231f).stroke({ color, alpha: 0.8, width: 2 }));
    src.addChild(new Graphics().roundRect(24, 24, 522, 312, 14).stroke({ color: 0x8c9a92, alpha: 0.3, width: 1 }));
    for (let i = 0; i < 8; i++) {
      src.addChild(new Graphics().moveTo(40 + i * 70, 35).lineTo(40 + i * 70, 323).stroke({ color: 0xc9d5ca, alpha: 0.1, width: 1 }));
    }
    for (let i = 0; i < 5; i++) {
      src.addChild(new Graphics().moveTo(40, 50 + i * 65).lineTo(530, 50 + i * 65).stroke({ color: 0xc9d5ca, alpha: 0.1, width: 1 }));
    }
    const hero = roundedText('DEPTH', 92, color, '900');
    hero.position.set(40, 105);
    src.addChild(hero);
    const sub = roundedText('PERSPECTIVE MESH / 001', 18, 0xf0f4ef, '700');
    sub.position.set(44, 252);
    src.addChild(sub);
    const texture = app.renderer.generateTexture(src);
    textures.push(texture);
    src.destroy({ children: true });
    const mesh = new PerspectiveMesh({ texture, width: 570, height: 360, x: dimensions.w / 2, y: dimensions.h / 2, pivot: { x: 285, y: 180 } });
    root.addChild(mesh);
    let dx = 0;
    let dy = 0;
    scene = {
      count: 1,
      resize() {
        const { w, h } = dimensions;
        mesh.scale.set(Math.min(1, (w - 80) / 630, (h - 100) / 410));
        mesh.position.set(w / 2, h / 2);
      },
      update(dt, pointer, power) {
        dx = mix(dx, pointer.nx * power, 0.07 * dt);
        dy = mix(dy, pointer.ny * power, 0.07 * dt);
        const x = dx * 66;
        const y = dy * 38;
        mesh.setCorners(0 + x, 0 + y, 570 - x, 0 - y, 570 + x, 360 + y, 0 - x, 360 - y);
      },
    };
  } else if (id === 'trail') {
    const path = new Graphics();
    const glow = new Graphics();
    root.addChild(glow, path);
    const cursorTexture = makeDisc(3);
    const sparks = [];
    const random = rng(46);
    for (let i = 0; i < 90; i++) {
      const sprite = makeSprite(cursorTexture, i % 5 === 0 ? 0xffffff : color, 0);
      sparks.push({ sprite, x: -100, y: -100, vx: 0, vy: 0, life: 0 });
    }
    const points = [];
    let last = null;
    scene = {
      count: sparks.length + 2,
      resize() { points.length = 0; last = null; },
      click(pointer, power) {
        for (const s of sparks) {
          const a = random() * Math.PI * 2;
          s.x = pointer.x;
          s.y = pointer.y;
          s.vx = Math.cos(a) * (1.3 + random() * 8) * power;
          s.vy = Math.sin(a) * (1.3 + random() * 8) * power;
          s.life = 1;
        }
      },
      update(dt, pointer, power) {
        if (pointer.inside) {
          const x = pointer.x;
          const y = pointer.y;
          if (!last || Math.abs(x - last.x) + Math.abs(y - last.y) > 2) {
            points.push({ x, y, life: 1 });
            last = { x, y };
          }
        }
        for (const p of points) p.life -= 0.019 * dt;
        while (points.length && points[0].life <= 0) points.shift();
        path.clear();
        glow.clear();
        if (points.length > 1) {
          path.moveTo(points[0].x, points[0].y);
          glow.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            path.lineTo(points[i].x, points[i].y);
            glow.lineTo(points[i].x, points[i].y);
          }
          path.stroke({ color, width: 1.5 + power * 2.5, alpha: 0.93 });
          glow.stroke({ color, width: 12 + power * 12, alpha: 0.08 });
        }
        for (const s of sparks) {
          if (s.life <= 0) { s.sprite.alpha = 0; continue; }
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.vx *= Math.pow(0.97, dt);
          s.vy *= Math.pow(0.97, dt);
          s.life -= 0.015 * dt;
          s.sprite.position.set(s.x, s.y);
          s.sprite.alpha = Math.max(0, s.life * 0.9);
          s.sprite.scale.set(Math.max(0.1, s.life * 0.6));
        }
      },
    };
  } else if (id === 'cards') {
    const cards = [];
    const labels = ['DESIGN', 'MOTION', 'SYSTEM', 'PIXELS'];
    const random = rng(31);
    for (let i = 0; i < 4; i++) {
      const container = new Container();
      container.eventMode = 'static';
      container.cursor = 'grab';
      container.addChild(new Graphics().roundRect(-93, -125, 186, 250, 16).fill({ color: i % 2 ? 0x1c2520 : 0x242a26, alpha: 1 }).stroke({ color: i % 2 ? 0x5e7868 : color, width: 1, alpha: 0.85 }));
      container.addChild(new Graphics().circle(0, -26, 47 - i * 3).stroke({ color: i % 2 ? 0xa6bfb0 : color, width: 1.5, alpha: 0.9 }));
      container.addChild(new Graphics().circle(0, -26, 12 + i * 4).fill({ color, alpha: 0.25 }));
      const title = roundedText(labels[i], 15, 0xffffff, '700');
      title.anchor.set(0.5);
      title.y = 74;
      container.addChild(title);
      const subtitle = roundedText('INTERACTIVE • 0' + (i + 1), 9, 0xabb5ae, '700');
      subtitle.anchor.set(0.5);
      subtitle.y = 102;
      container.addChild(subtitle);
      root.addChild(container);
      cards.push({ container, initial: (i - 1.5) * 0.27, x: 0, y: 0, angle: (random() - 0.5) * 0.17, drag: false, ox: 0, oy: 0 });
      container.on('pointerdown', e => {
        const c = cards[i];
        c.drag = true;
        c.ox = e.global.x - c.x;
        c.oy = e.global.y - c.y;
        c.container.zIndex = 100 + i;
        c.container.cursor = 'grabbing';
      });
    }
    root.sortableChildren = true;
    let clock = 0;
    let dragged = null;
    scene = {
      count: cards.length * 6,
      resize() {
        const { w, h } = dimensions;
        const spacing = Math.min(132, w * 0.16);
        cards.forEach((c, i) => {
          if (!c.drag) {
            c.x = w / 2 + (i - 1.5) * spacing;
            c.y = h * 0.53 + (i % 2 ? -14 : 14);
          }
          c.container.scale.set(Math.min(1, (w - 30) / 650, (h - 80) / 350));
          c.container.position.set(c.x, c.y);
        });
      },
      pointerMove(pointer) {
        for (const c of cards) {
          if (!c.drag) continue;
          dragged = c;
          c.x = pointer.x - c.ox;
          c.y = pointer.y - c.oy;
        }
      },
      pointerUp() {
        for (const c of cards) {
          c.drag = false;
          c.container.cursor = 'grab';
        }
        dragged = null;
      },
      update(dt, pointer, power) {
        clock += dt * 0.017;
        cards.forEach((c, i) => {
          if (!c.drag) {
            c.container.rotation = mix(c.container.rotation, c.angle + Math.sin(clock + i) * 0.045 * power, 0.07 * dt);
          } else {
            c.container.rotation = mix(c.container.rotation, pointer.nx * 0.24, 0.1 * dt);
          }
          c.container.position.set(c.x, c.y + (c.drag ? 0 : Math.sin(clock * 1.2 + i) * 5 * power));
        });
      },
    };
    disposers.push(() => cards.forEach(c => c.container.removeAllListeners()));
  } else {
    throw new Error('Unknown scene: ' + id);
  }

  scene.resize?.();
  return {
    id,
    count: scene.count,
    update: scene.update,
    pointerMove: scene.pointerMove,
    pointerUp: scene.pointerUp,
    click: scene.click,
    resize(w, h) {
      dimensions = { w, h };
      scene.resize?.();
    },
    destroy() {
      for (const dispose of disposers) dispose();
      root.destroy({ children: true });
      for (const texture of textures) texture.destroy(true);
    },
  };
}
