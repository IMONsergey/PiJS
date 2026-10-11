// PiJS / Motion Atlas 100
// Original motion studies inspired by the interaction vocabulary of contemporary award-winning websites.
// Not copies of third-party code, illustrations or brand assets.

export const collections = [
  {
    key: 'TYPE', label: 'Kinetic type', accent: '#d9f56e',
    reference: { label: 'Monolith Project / 2025', url: 'https://www.awwwards.com/sites/the-monolith-project' },
    families: [
      ['typeWave', ['Elastic Baseline','Chromatic Headline','Breathing Letterform','Letter Drift','Type Frequency']],
      ['typeOrbit', ['Circular Typography','Exploded Alphabet','Magnetic Glyphs','Type Constellation','Letter Tunnel']]
    ]
  },
  {
    key: 'LIQUID', label: 'Fluid & shaders', accent: '#8a9cfc',
    reference: { label: 'Floema / 2026', url: 'https://www.awwwards.com/sites/floema' },
    families: [
      ['liquidLines', ['Liquid Silk','Surface Tension','Viscous Horizons','Ripple Weave','Caustic Threads']],
      ['shaderArt', ['Chromatic Glass','Aurora Transmission','Mercury Surface','Electric Oil','Prismatic Heat']]
    ]
  },
  {
    key: 'PARTICLES', label: 'Particle systems', accent: '#ffb073',
    reference: { label: 'Oryzo AI / 2026', url: 'https://www.awwwards.com/sites/oryzo-ai' },
    families: [
      ['particleDepth', ['Stellar Flythrough','Nebula Dust','Orbiting Matter','Meteor Shower','Solar Halo']],
      ['particleMorph', ['Gravity Cloud','Particle Bloom','Flocking Sparks','Firework Sculpture','Morphing Swarm']]
    ]
  },
  {
    key: 'CURSOR', label: 'Pointer interaction', accent: '#7be7d1',
    reference: { label: 'The Monolith Project / 2025', url: 'https://www.awwwards.com/sites/the-monolith-project' },
    families: [
      ['cursorMagnet', ['Magnetic Lattice','Repulsion Matrix','Cursor Orbitals','Magnifying Field','Vortex Pointer']],
      ['cursorTrail', ['Ink Afterimage','Elastic Calligraphy','Shard Emitter','Comet Gesture','Smoke Trace']]
    ]
  },
  {
    key: 'GENERATIVE', label: 'Generative geometry', accent: '#f8a9cb',
    reference: { label: 'Indigo Laboratory / 2026', url: 'https://www.awwwards.com/sites/indigo-laboratory' },
    families: [
      ['lineArt', ['Moiré Field','Contour Topography','Sine Textile','Radar Lines','Spectral Stripes']],
      ['geometryArt', ['Petal Geometry','Radial Fan','Modular Oscillation','Lissajous Anatomy','Kinetic Monoliths']]
    ]
  },
  {
    key: 'GALLERY', label: 'Editorial galleries', accent: '#f3ca7c',
    reference: { label: 'Floema / 2026', url: 'https://www.awwwards.com/sites/floema' },
    families: [
      ['posterGallery', ['Editorial Carousel','Depth Poster Stack','Floating Covers','Panorama Sequence','Aperture Magazine']],
      ['tileGallery', ['Fragmented Image','Displacement Tiles','Folding Poster','Mosaic Composer','Elastic Columns']]
    ]
  },
  {
    key: 'REVEAL', label: 'Masks & transitions', accent: '#e1abff',
    reference: { label: 'Vectr / 2026', url: 'https://www.awwwards.com/sites/vectr' },
    families: [
      ['maskReveal', ['Circular Discovery','Moving Spotlight','Radial Cutout','Stripe Reveal','Brush Portal']],
      ['transition', ['Curtain Split','Iris Expansion','Editorial Shutters','Liquid Crossfade','Pixel Disintegration']]
    ]
  },
  {
    key: 'DEPTH', label: 'Depth & spatial', accent: '#9ec6ff',
    reference: { label: '21 Hrs on the Moon / 2026', url: 'https://www.awwwards.com/sites/21-hrs-on-the-moon' },
    families: [
      ['meshDepth', ['Perspective Print','Rippled Cloth','Twisting Canvas','Elastic Depth','Polar Mesh']],
      ['spaceField', ['Planetary Orbit','Cosmology Diagram','Infinite Grid','Geometric Wormhole','Parallax Universe']]
    ]
  },
  {
    key: 'SYSTEMS', label: 'Data & audio visuals', accent: '#aee6c1',
    reference: { label: 'MindMarket / 2026', url: 'https://www.awwwards.com/sites/mindmarket' },
    families: [
      ['dataFlow', ['Signal Routing','Digital Rain','Neural Links','Lidar Scan','Pulse Network']],
      ['spectrum', ['Spectrum Ribbons','Radial Equalizer','Analog Waveform','Sound Columns','Spectral Fabric']]
    ]
  },
  {
    key: 'PLAY', label: 'Experimental playground', accent: '#ffd4ae',
    reference: { label: 'Julien Calot / 2026', url: 'https://www.awwwards.com/sites/julien-calot' },
    families: [
      ['physics', ['Hanging Pendulums','Draggable Objects','Elastic Kinetics','Flocking Orbs','Physics Stack']],
      ['abstract', ['Chromatic Bloom','Digital Confetti','Automatic Drawing','Kaleidoscope Engine','Interactive Paint']]
    ]
  }
];

export const familyTips = {
  typeWave: 'Move the pointer to influence the letters. Each typographic system responds differently.',
  typeOrbit: 'Move the cursor through the typography and explore its spatial construction.',
  liquidLines: 'Move the cursor to bend the lines. Adjust intensity for a softer or stronger field.',
  shaderArt: 'Move the pointer to distort the shader; color and energy are updated on the GPU.',
  particleDepth: 'Move around the stage to shift the camera through a field of particles.',
  particleMorph: 'Draw with the cursor; click to add a pulse to the simulation.',
  cursorMagnet: 'Drive the magnetic field with the cursor; tap or click to reverse the force.',
  cursorTrail: 'Draw moving gestures. Click for an impulse; trails ease out smoothly.',
  lineArt: 'Shift the moiré or topographic pattern with the pointer.',
  geometryArt: 'Control shape, rotation and amplitude with pointer movement.',
  posterGallery: 'Move horizontally across the gallery; click to advance the artworks.',
  tileGallery: 'Hover and click to shuffle the visual grid.',
  maskReveal: 'Move the reveal window and click to swap the editorial surface.',
  transition: 'Click anywhere to replay the editorial transition.',
  meshDepth: 'Move the pointer to deform the image plane in perspective.',
  spaceField: 'Explore space with the pointer, click to change orbit or momentum.',
  dataFlow: 'Move through a network of signals. Click to transmit a pulse.',
  spectrum: 'Change the amplitude with the cursor; intensity controls signal level.',
  physics: 'Move and click to perturb the kinetic construction.',
  abstract: 'Paint with the cursor; click to trigger a new composition.'
};

export const catalog = collections.flatMap((collection, groupIndex) =>
  collection.families.flatMap(([family, names], familyIndex) =>
    names.map((title, variant) => {
      const no = groupIndex * 10 + familyIndex * 5 + variant + 1;
      return {
        id: 'study-' + String(no).padStart(3, '0'),
        number: no,
        title,
        category: collection.key,
        categoryLabel: collection.label,
        accent: collection.accent,
        family,
        variant,
        reference: collection.reference,
        tip: familyTips[family],
        summary: 'Independent PixiJS motion study: ' + title.toLowerCase() + '. Inspired by contemporary interactive web design.',
      };
    })
  )
);

export function findStudy(id) {
  return catalog.find(item => item.id === id) ?? catalog[0];
}
