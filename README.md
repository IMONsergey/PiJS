# PiJS Motion Library

A curated library of original, production-minded interactive UI motion studies, built on **PixiJS 8.22.0**, native HTML/CSS, and Vite.

**Live:** https://imonsergey.github.io/PiJS/
**Source branch:** feat/curated-motion-components-v3
**Original PixiJS engine:** unchanged in branch dev
**Early archive (100 experiments):** feat/awwwards-100-lab

## Why the catalog was rebuilt

The original 100 experiments were primarily broad shader/particle variations. They weren't useful reusable website components. This v3 replaces that collection with **36 individually authored UI examples** across six categories, each with a working real-world interface:

- **Buttons & actions (6):** edge-lit CTA, magnetic button, glass pill, split action, orbit button, light sweep.
- **Cards & surfaces (6):** spotlight card, depth portrait, glass editorial, project reveal, pricing dial, metrics.
- **Typography (6):** masked image headline, elastic letters, metallic type, split reveal, decoding, number drum.
- **Galleries (6):** perspective gallery, draggable image rail, aperture reveal, editorial grid, stack, filmstrip.
- **Hero backgrounds (6):** aurora, silk, light rails, contours, particles, grid.
- **Micro-interactions (6):** file-drop surface, progress orbit, command search, toggle, live chart, toast stack.

The old 100-study implementation remains in the archive branch. **36 handcrafted components are better than 100 superficial renamings.** Further components should be added only if they introduce genuinely new behavior.

## Layout

A three-part, no-dialog working environment:
1. Persistent category navigation on the left.
2. Compact, visually representative catalog cards in the middle.
3. Live interactive playback, controls and usage instructions on the right.

On mobile, the viewer moves above the card grid and navigation becomes a drawer. Every preview is selectable without navigating away or opening a modal.

UI surface tokens reuse the visual language of the owner's [APCOSYS Components Library](https://imonsergey.github.io/Apco-components-lib/). Instrument Sans and IBM Plex Mono are loaded from that publicly hosted library; browser sans/mono fallbacks remain available.

## Architecture

- src/app-v3.js — navigation, filtering, favorites, selection, scene lifecycle, controls and deep links.
- src/library/catalog.js — one typed-like metadata record per actual component.
- src/library/components.js — accessible, responsive HTML layouts (36 distinct compositions).
- src/library/interactions.js — real pointer, click, keyboard, gallery, upload, search and chart interactions.
- src/library/gpu.js — one PixiJS WebGL Application, dynamically imported and reused, shaders plus procedural light and particle effects.
- src/library/shell.css — restrained responsive documentation/library shell.
- src/library/components.css — independently styled components and motion scenes.
- public/media/ — 8 locally served, resized photographic assets.

PixiJS is kept off thumbnail cards to avoid 36 simultaneous WebGL contexts. Thumbnails contain **the same component HTML as the live stage**, rendered statically and marked inert so they cannot intercept keyboard or screen reader navigation. The live stage uses PixiJS for background, lighting and procedural animation; functional buttons, forms and accessible semantics remain HTML.

## Running

Requires Node 22+.

~~~sh
npm ci
npm run dev
npm test
npm run build
~~~

The Vite base path is /PiJS/ for GitHub Pages. Generated dist files publish to the gh-pages branch. Do not merge this library into the upstream engine dev branch.

## Limitations

- File upload is a **local interaction demo**, with MIME/size validation and simulated progress. It does not upload to a server.
- The pricing, revenue metric, search-command data and charts contain **sample values**, not connected business data.
- Background shaders use PixiJS and WebGL. If GPU rendering is unavailable, the HTML interface continues to function and a fallback notice appears.
- "Usage" demonstrates how to import these **source files together** into an existing project; it is not a single-file React/Framer export.

## Visual research, not copies

The library design was researched against OriginKit, ThreeUI, HorizonX, OpenSourceUI, BoardUI, Light Rails and Bklit. Those websites' component source code and proprietary assets were **not imported or copied**.

Original photographs downloaded as appropriately resized static files from images.unsplash.com, subject to the [Unsplash License](https://unsplash.com/license) (commercial use permitted, but standalone photo resale restrictions apply). Photo IDs:
- photo-1600607687939-ce8a6c25118c
- photo-1497366754035-f200968a6e72
- photo-1519608487953-e999c86e7455
- photo-1441974231531-c6227db76b6e
- photo-1518837695005-2083093ee35b
- photo-1470770841072-f978cf4d019e
- photo-1464822759023-fed622ff2c3b
- photo-1540959733332-eab4deabeeaf

PixiJS is MIT licensed. Its original license and history are preserved in dev; any downstream distribution using PixiJS must retain its required notice.
