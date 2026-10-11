# PiJS Motion Atlas — 100 Interactive Studies

100 original interactive motion studies, organized into 10 collections, inspired by the visual interaction language seen across Awwwards sites from October 2025 to October 2026.

**[Open live demo](https://imonsergey.github.io/PiJS/)** · [Source branch](https://github.com/IMONsergey/PiJS/tree/feat/awwwards-100-lab) · [Original PixiJS](https://github.com/pixijs/pixijs)

## Architecture

- **100 studies**, 10 collections, 20 independent scene-builder families with five distinct variants per family.
- PixiJS **8.22.0**, WebGL renderer, Vite. No paid libraries, copied scripts, downloaded brand visuals or third-party imagery.
- **One active PixiJS Application** and one live scene at any time; GPU objects, textures and filters are destroyed on scene change.
- Static illustrative Canvas2D thumbnails are generated deterministically, lazily with IntersectionObserver.
- Palette overrides, adjustable motion intensity, pause, restart, fullscreen, favorites (localStorage), category filtering, fast search, random study, deep links and PNG extraction.
- Reduced motion preferences supported; frame-rate cap and DPR ceiling; mobile/touch interaction.
- Playable scene deep links: /#study-001 through /#study-100.

## 10 collections

| Collection | Entries | Builders |
|---|---:|---|
| Kinetic type | 001–010 | typeWave, typeOrbit |
| Fluid & shaders | 011–020 | liquidLines, shaderArt |
| Particles | 021–030 | particleDepth, particleMorph |
| Pointer | 031–040 | cursorMagnet, cursorTrail |
| Generative geometry | 041–050 | lineArt, geometryArt |
| Editorial galleries | 051–060 | posterGallery, tileGallery |
| Mask & reveals | 061–070 | maskReveal, transition |
| Spatial depth | 071–080 | meshDepth, spaceField |
| Data & audio visualizations | 081–090 | dataFlow, spectrum |
| Experimental playground | 091–100 | physics, abstract |

This catalog contains **100 distinct studies**, not 100 independent render engines. Each family shares low-level primitives but implements five different visual behaviors. Awwwards links are **research/inspiration references only**; examples are not claims of accurate reproductions, direct collaborations or awards.

### Representative research references

- [Floema](https://www.awwwards.com/sites/floema) — Awwwards Site of the Day, May 2026; interactive material, scroll-zoom and WebGL storytelling.
- [The Monolith Project](https://www.awwwards.com/sites/the-monolith-project) — spatial/infinite-canvas inspiration, autumn 2025.
- [Oryzo AI](https://www.awwwards.com/sites/oryzo-ai) — interaction, 3D–2D transitions and particle-led narrative, 2026.
- [Indigo Laboratory](https://www.awwwards.com/sites/indigo-laboratory) — shader and audio narrative inspiration.
- [21 Hrs on the Moon](https://www.awwwards.com/sites/21-hrs-on-the-moon), [MindMarket](https://www.awwwards.com/sites/mindmarket), [Vectr](https://www.awwwards.com/sites/vectr), [Julien Calot](https://www.awwwards.com/sites/julien-calot).

## Development

Requires recent Node.js (the test/build environment used Node 24).

    npm ci
    npm run dev
    npm run test
    npm run build

Dev server: http://127.0.0.1:5173/PiJS/ (Vite base is /PiJS/ for GitHub Pages).

## Browser stress diagnostics

Open the dev build with ?smoke=1, then inspect window.__PIJS_SMOKE_RESULT__. The built-in check repeatedly creates/destroys all 100 scenes and runs one update for each. This is an initialization smoke test, **not** a pixel/interaction validation for every scene.

## Publishing

- **PixiJS original mirror**: preserved unchanged under branch dev.
- **Motion Atlas source**: feat/awwwards-100-lab.
- **GitHub Pages**: compiled static build on gh-pages (do not merge the gallery into dev).
- Imported PixiJS upstream automation workflows are disabled in this mirror to avoid unintended CI/CD publication.

## License and attribution

PixiJS is available under MIT. Original upstream copyright notices and the LICENSE file remain intact in dev. The motion-study code is an independent implementation. Referenced Awwwards projects remain the intellectual property of their respective creators; no brand imagery or source code was copied.
