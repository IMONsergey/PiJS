# PiJS Interactive Graphics Lab

A separate, interactive showcase for the complete PixiJS mirror at [IMONsergey/PiJS](https://github.com/IMONsergey/PiJS).

- 7 GPU-accelerated experiments.
- PixiJS `8.22.0` from npm; the complete engine source remains preserved in the main `dev` branch.
- WebGL rendering, pause/resume, color controls, intensity, touch/pointer interactivity, optional reduced motion, FPS telemetry.
- Built with Vite. Source is available in the `showcase-src` branch; built files live in the `gh-pages` branch.

## Local run

```sh
npm install
npm run dev
npm run build
```

## Publish

Publish the content of `dist/` to the `gh-pages` branch and configure GitHub Pages to deploy from `gh-pages` at `/`.

PixiJS is Copyright (c) Mathew Groves, Chad Engler, et al. Licensed under MIT. The original license text is in the mirrored repository.
