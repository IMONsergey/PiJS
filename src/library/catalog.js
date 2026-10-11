// PiJS Curated Motion Library v3 — original, usable interface motion studies.
// Every record identifies an implemented component, not a renamed shader preset.
export const categories = [
  { id:'all', label:'All components', short:'All', icon:'grid' },
  { id:'buttons', label:'Buttons & actions', short:'Buttons', icon:'pointer' },
  { id:'cards', label:'Cards & surfaces', short:'Cards', icon:'layers' },
  { id:'typography', label:'Typography', short:'Text', icon:'type' },
  { id:'galleries', label:'Image galleries', short:'Galleries', icon:'image' },
  { id:'backgrounds', label:'Hero backgrounds', short:'Backgrounds', icon:'waves' },
  { id:'interfaces', label:'Micro interactions', short:'Interfaces', icon:'sparkles' },
];
const rows = [
 // id, title, category, description, interaction, GPU effect type, tone
 ['edge-beam','Edge Beam','buttons','A refined CTA with a moving, pointer-lit perimeter.','Hover / click','beam','ink'],
 ['magnetic-cta','Magnetic CTA','buttons','A tactile call to action with subtle attraction and snap-back.','Hover / click','orbital','ink'],
 ['liquid-pill','Liquid Glass','buttons','A luminous glass capsule with animated optical depth.','Hover / click','liquid','ink'],
 ['split-action','Split Action','buttons','A practical two-part button with an animated arrow well.','Hover / click','rays','stone'],
 ['orbit-button','Orbit Button','buttons','A quiet circular action surrounded by orbiting signal points.','Hover / click','orbit','ink'],
 ['light-sweep','Light Sweep','buttons','A directional highlight follows focus and intent.','Hover / click','beam','stone'],
 ['spotlight-card','Spotlight Card','cards','Interactive product surface with moving, contained edge lighting.','Pointer move','halo','ink'],
 ['depth-portrait','Depth Portrait','cards','Editorial photography with restrained 3D tilt and depth.','Pointer move','dust','ink'],
 ['glass-editorial','Glass Editorial','cards','A translucent information panel over atmospheric artwork.','Pointer move','liquid','ink'],
 ['reveal-project','Reveal Project','cards','A compact portfolio card that unveils its project story.','Hover / click','rays','stone'],
 ['pricing-dial','Pricing Dial','cards','A functional pricing widget with graceful plan transitions.','Click','orbital','stone'],
 ['metric-card','Metric Surface','cards','A live analytics card with a responsive animated sparkline.','Hover / click','graph','stone'],
 ['masked-headline','Masked Headline','typography','Large editorial type with image reveal controlled by the cursor.','Pointer move','beam','ink'],
 ['elastic-type','Elastic Type','typography','A responsive wordmark whose characters react to proximity.','Pointer move','orbit','ink'],
 ['chrome-type','Chrome Type','typography','Subtle shader-lit metal lettering, without oversaturated gradients.','Pointer move','liquid','ink'],
 ['split-reveal','Split Reveal','typography','Words rise through their masks in a repeatable sequence.','Click','rays','stone'],
 ['scramble-title','Decode Text','typography','A deliberate information decode with a crisp final state.','Click','grid','stone'],
 ['number-drum','Number Drum','typography','Smooth rolling numerical counters suited to product dashboards.','Click','graph','stone'],
 ['depth-gallery','Depth Gallery','galleries','An editorial carousel with a tactile, camera-like transition.','Drag / arrows','dust','ink'],
 ['elastic-rail','Elastic Rail','galleries','A horizontal image rail with inertial drag and snapping.','Drag / arrows','rays','stone'],
 ['image-aperture','Image Aperture','galleries','Masked photo reveal driven by pointer position.','Pointer move','halo','ink'],
 ['editorial-grid','Editorial Grid','galleries','Selectable photography in a composed magazine grid.','Click','dust','stone'],
 ['cover-stack','Cover Stack','galleries','A stacked collection of campaign art with rotating covers.','Click / arrows','orbit','ink'],
 ['focus-filmstrip','Focus Filmstrip','galleries','A compact art-direction strip with a highlighted selection.','Click / arrows','beam','stone'],
 ['aurora-field','Aurora Field','backgrounds','Atmospheric luminous ribbons for a premium hero.','Pointer move','shader:0','ink'],
 ['silk-flux','Silk Flux','backgrounds','Soft, folded movement with a restrained spectral palette.','Pointer move','shader:1','ink'],
 ['light-rails','Light Rails','backgrounds','Fine animated beams and sweeping paths without visual clutter.','Pointer move','shader:2','ink'],
 ['contour-field','Contour Field','backgrounds','Reactive contour lines with dimensional depth.','Pointer move','shader:3','ink'],
 ['particle-orbit','Particle Orbit','backgrounds','An elegant orbital arrangement of luminous particles.','Pointer move','orbit','ink'],
 ['ambient-grid','Ambient Grid','backgrounds','A luminous architectural grid that responds to position.','Pointer move','grid','ink'],
 ['upload-studio','File Upload','interfaces','A real dropzone with file validation and an animated progress state.','Drop / select','halo','stone'],
 ['orbit-loader','Orbit Loader','interfaces','A circular progress specimen with intentional loading states.','Click','orbit','ink'],
 ['command-search','Command Search','interfaces','A usable keyboard-search overlay with highlighted suggestions.','Type / arrows','grid','stone'],
 ['signal-toggle','Signal Toggle','interfaces','A crisp animated switch with coordinated visual states.','Click','rays','stone'],
 ['live-chart','Live Chart','interfaces','A responsive plotted data story with hover inspection.','Hover / click','graph','stone'],
 ['toast-stack','Toast Stack','interfaces','A restrained stacked notification system with motion and dismissal.','Click / dismiss','dust','stone'],
];
export const catalog = rows.map(([id,title,category,description,interaction,gpu,tone],i)=>({
  id,title,category,description,interaction,gpu,tone,
  number:i+1, tags:[category,interaction.toLowerCase(),'pixijs'],
}));
export const asset = n => '/PiJS/media/'+[
 'photo-1600607687939-ce8a6c25118c',
 'photo-1497366754035-f200968a6e72',
 'photo-1519608487953-e999c86e7455',
 'photo-1441974231531-c6227db76b6e',
 'photo-1518837695005-2083093ee35b',
 'photo-1470770841072-f978cf4d019e',
 'photo-1464822759023-fed622ff2c3b',
 'photo-1540959733332-eab4deabeeaf'
][(n+80)%8]+'.jpg';
export const getItem = id => catalog.find(c=>c.id===id) || catalog[0];
