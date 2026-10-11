import { Container, Graphics, Sprite, Text, Texture, Filter, GlProgram } from 'pixi.js';
import { buildsA } from './effects-a.js';
import { buildsB } from './effects-b.js';
import { buildsC } from './effects-c.js';

export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const seeded = (initial = 1) => { let seed = initial >>> 0; return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); };
export const rgb = hex => ({ r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 });
export const mixColor = (a,b,t) => {
  const x=rgb(a),y=rgb(b);
  return ((lerp(x.r,y.r,t)|0)<<16)|((lerp(x.g,y.g,t)|0)<<8)|(lerp(x.b,y.b,t)|0);
};
export const P = (x,y) => ({x,y});

const VERTEX = [
  'in vec2 aPosition;',
  'out vec2 vTextureCoord;',
  'uniform vec4 uInputSize;',
  'uniform vec4 uOutputFrame;',
  'uniform vec4 uOutputTexture;',
  'vec4 filterVertexPosition() {',
  'vec2 p = aPosition * uOutputFrame.zw + uOutputFrame.xy;',
  'p.x = p.x * (2.0 / uOutputTexture.x) - 1.0;',
  'p.y = p.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;',
  'return vec4(p,0.0,1.0);',
  '}',
  'vec2 filterTextureCoord() { return aPosition * (uOutputFrame.zw * uInputSize.zw); }',
  'void main(void) { gl_Position = filterVertexPosition(); vTextureCoord=filterTextureCoord(); }'
].join('\n');

const FRAGMENT = [
  'in vec2 vTextureCoord;',
  'uniform sampler2D uTexture;',
  'uniform float uTime;',
  'uniform float uPower;',
  'uniform vec2 uPointer;',
  'uniform float uMode;',
  'uniform vec3 uAccent;',
  'float h21(vec2 p) { p = fract(p * vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }',
  'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+1.),f.x),f.y);}',
  'void main(void){',
  ' vec2 uv=vTextureCoord;',
  ' vec2 p=(uv-.5)*vec2(1.75,1.0);',
  ' vec2 m=(uPointer-.5)*vec2(1.75,1.0);',
  ' float t=uTime*.6, energy=.4+uPower*.6, d=length(p-m);',
  ' float f=0.;',
  ' if(uMode<.5){ p.x+=sin(p.y*7.+t)*.16*energy; f=sin(p.x*11.+sin(p.y*7.+t)*2.)*sin(p.y*8.-t*.7); }',
  ' else if(uMode<1.5){ float r=length(p);float a=atan(p.y,p.x);f=sin(18.*r-3.*t+2.*sin(5.*a+t)); }',
  ' else if(uMode<2.5){ vec2 q=p; q+=.15*sin(q.yx*vec2(9.,11.)+t);float n=noise(q*5.+t*.3);f=sin(q.x*10.+n*11.-t*2.)*sin(q.y*6.+n*6.); }',
  ' else if(uMode<3.5){float r=length(p-m);float a=atan(p.y-m.y,p.x-m.x);f=cos(17.*r-3.*t)*sin(a*5.+t*1.8);}',
  ' else {p.x+=.15*sin(p.y*19.+t)*energy;f=sin(p.x*18.+sin(p.y*8.+t)*3.);}',
  ' float detail=noise(p*vec2(34.,24.)+t*.25);',
  ' float line=smoothstep(.24,.95,f)*.87+smoothstep(.72,1.,detail)*.12;',
  ' float glow=.24/(.23+abs(f));',
  ' vec3 dark=vec3(.016,.020,.031);',
  ' vec3 col=mix(dark,uAccent*1.15,clamp(line*.87+glow*.12,0.,1.));',
  ' col += vec3(.035,.05,.055)*smoothstep(.5,0.,d)*energy;',
  ' col *= .9+.11*sin(t*.7+p.x*2.);',
  ' gl_FragColor=vec4(clamp(col,0.,1.),1.);',
  '}'
].join('\n');

export function makeShader(ctx, v) {
  const c = rgb(ctx.color);
  const filter = new Filter({
    glProgram: new GlProgram({ vertex: VERTEX, fragment: FRAGMENT }),
    resources: {
      motion: {
        uTime: {value:0,type:'f32'},
        uPower: {value:.5,type:'f32'},
        uPointer: {value:[.5,.5],type:'vec2<f32>'},
        uMode: {value:v,type:'f32'},
        uAccent: {value:[c.r/255,c.g/255,c.b/255],type:'vec3<f32>'}
      }
    }
  });
  ctx.disposers.push(() => filter.destroy());
  const surface = new Sprite(Texture.WHITE);
  surface.width=ctx.w; surface.height=ctx.h;
  surface.filters=[filter];
  ctx.root.addChild(surface);
  return {
    update(t, power, pointer) {
      const u=filter.resources.motion.uniforms;
      u.uTime=t; u.uPower=power;
      u.uPointer[0]=pointer.x/Math.max(1,ctx.w);
      u.uPointer[1]=pointer.y/Math.max(1,ctx.h);
    },
    resize(){surface.width=ctx.w;surface.height=ctx.h;}
  };
}

export function createStudy(app, study, hex) {
  const root=new Container();
  app.stage.addChild(root);
  const textures=[];
  const disposers=[];
  const cache=new Map();
  const rand=seeded(study.number*1009+43);
  const ctx={
    app, root, textures, disposers, rand, color:hex,
    w:app.screen.width, h:app.screen.height, variant:study.variant,
    light:0xf2f0e8, dim:0x677079, dark:0x11151d,
    add(obj){root.addChild(obj);return obj;},
    graphics(){return this.add(new Graphics());},
    label(text,size=18,col=this.light,bold=false) {
      return this.add(new Text({
        text,style:{fontFamily:'Arial, Helvetica, sans-serif',fontSize:size,fill:col,fontWeight:bold?'800':'500',letterSpacing:-size*.026}
      }));
    },
    textureDisc(radius=5) {
      const key='d'+radius;
      if(cache.has(key))return cache.get(key);
      const shape=new Graphics().circle(radius+1,radius+1,radius).fill(0xffffff);
      const texture=app.renderer.generateTexture(shape);
      textures.push(texture);cache.set(key,texture);shape.destroy();
      return texture;
    },
    dot(radius=2,tint=hex,opacity=1) {
      const s=new Sprite(this.textureDisc(Math.max(1,Math.ceil(radius))));
      s.anchor.set(.5);s.scale.set(radius/Math.max(1,Math.ceil(radius)));
      s.tint=tint;s.alpha=opacity;return this.add(s);
    },
    shader(variant=0) { return makeShader(this, variant); },
    poster(seed=0) {
      const k='p'+seed;
      if(cache.has(k))return cache.get(k);
      const R=seeded(seed*777+27);
      const stage=new Container();
      const bg=new Graphics().rect(0,0,560,720).fill([0x242b30,0x1a3141,0x4b302a,0xeee5d0,0x343b34,0x22212d][seed%6]);
      stage.addChild(bg);
      // Controlled generative editorial artwork: wholly original, no third-party images.
      for(let i=0;i<9;i++){
        const x=R()*560,y=R()*720,w=55+R()*270,h=16+R()*170;
        const g=new Graphics();
        if(i%3===0)g.ellipse(x,y,w*.5,h*.75).stroke({color:mixColor(hex,0xf7e9d8,R()),width:2+R()*13,alpha:.35+R()*.4});
        else g.roundRect(x,y,w,h,R()*24).fill({color:mixColor(hex,0xf1f1e9,R()),alpha:.16+R()*.55});
        g.rotation=(R()-.5)*1.25;stage.addChild(g);
      }
      const l=new Text({text:['FUTURE','FORM','OFFGRID','MOVEMENT','AFTER','STUDY'][seed%6],
        style:{fontFamily:'Arial, Helvetica, sans-serif',fontSize:74,fontWeight:'900',letterSpacing:-5,fill:seed%6===3?0x141414:0xf5f2e8}});
      l.x=29;l.y=490;stage.addChild(l);
      const fine=new Text({text:'PiJS  /  INDEPENDENT  MOTION  STUDY  /  '+String(seed).padStart(3,'0'),
        style:{fontFamily:'Arial, Helvetica, sans-serif',fontSize:12,fill:seed%6===3?0x141414:0xc5cbd0}});
      fine.x=29;fine.y=651;stage.addChild(fine);
      const texture=app.renderer.generateTexture(stage);
      textures.push(texture);cache.set(k,texture);stage.destroy({children:true});
      return texture;
    }
  };
  const builds={...buildsA,...buildsB,...buildsC};
  const factory=builds[study.family];
  if(!factory) {root.destroy();throw Error('Missing study renderer: '+study.family);}
  let behavior;
  try {behavior=factory(ctx,study.variant) ?? {};}
  catch(error){root.destroy({children:true});textures.forEach(t=>t.destroy(true));throw error;}
  return {
    id:study.id, get count(){return behavior.count ?? root.children.length;},
    update(dt,pointer,power){behavior.update?.(dt,pointer,power);},
    resize(w,h){ctx.w=w;ctx.h=h;behavior.resize?.(w,h);},
    click(pointer,power){behavior.click?.(pointer,power);},
    pointerUp(){behavior.pointerUp?.();},
    destroy(){
      try {behavior.destroy?.();} finally {
        root.destroy({children:true});
        for(const dispose of disposers)try{dispose();}catch(e){console.warn('Filter cleanup',e);}
        for(const texture of textures)try{texture.destroy(true);}catch(e){console.warn('Texture cleanup',e);}
      }
    }
  };
}
