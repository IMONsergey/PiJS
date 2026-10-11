import {Application,Container,Graphics,Sprite,Texture,Filter,GlProgram} from 'pixi.js';

const TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const randGen=(n=1)=>()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
const vertex=[
'in vec2 aPosition;','out vec2 vTextureCoord;',
'uniform vec4 uInputSize;','uniform vec4 uOutputFrame;','uniform vec4 uOutputTexture;',
'vec4 filterVertexPosition(void) {',
' vec2 pos=aPosition*uOutputFrame.zw+uOutputFrame.xy;',
' pos.x=pos.x*(2.0/uOutputTexture.x)-1.0;',
' pos.y=pos.y*(2.0*uOutputTexture.z/uOutputTexture.y)-uOutputTexture.z;',
' return vec4(pos,0.,1.);',
'}','vec2 filterTextureCoord(void) {return aPosition*(uOutputFrame.zw*uInputSize.zw);}',
'void main(void) {gl_Position=filterVertexPosition();vTextureCoord=filterTextureCoord();}'
].join('\n');
const fragment=[
'in vec2 vTextureCoord;','uniform sampler2D uTexture;',
'uniform float uTime;','uniform float uPower;','uniform float uMode;',
'uniform vec2 uPointer;','uniform vec3 uAccent;',
'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
'float noise(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}',
'void main(void){',
' vec2 uv=vTextureCoord; vec2 q=uv-.5; float t=uTime;',
' float n=noise(uv*vec2(5.,3.)+vec2(t*.07,-t*.035));',
' vec3 col=vec3(.016,.03,.051);',
' if(uMode<.5){',
'   float a=uv.y-.45-.12*sin(uv.x*5.3+t*.22+n*.75);',
'   float b=uv.y-.67-.16*sin(uv.x*4.1-t*.18+n*.55);',
'   float c=uv.y-.28-.09*sin(uv.x*7.6+t*.17);',
'   float f=exp(-a*a*39.)*.9+exp(-b*b*52.)*.7+exp(-c*c*78.)*.35;',
'   col+=vec3(.06,.27,.35)*f*.8+vec3(.19,.11,.35)*exp(-a*a*24.)*.45;',
'   col+=vec3(.01,.1,.13)*n*.2;',
' }else if(uMode<1.5){',
'   vec2 p=q*vec2(2.2,1.5);',
'   p.y+=.19*sin(p.x*3.4+t*.23)+.06*sin(p.x*11.-t*.3);',
'   float f=sin(p.y*12.+sin(p.x*4.+t*.25)*3.);',
'   float silk=pow(max(0.,f),10.);',
'   col+=vec3(.23,.25,.42)*silk*.95+vec3(.10,.13,.30)*abs(f)*.38;',
' }else if(uMode<2.5){',
'   vec2 p=q; p.x+=p.y*.46+.09*sin(p.y*4.+t*.22);',
'   float rail=pow(1.-abs(sin(p.x*23.+sin(p.y*5.-t*.4)*2.)),37.);',
'   col+=vec3(.18,.61,.69)*rail*.48;',
'   float flare=exp(-pow(p.x-.12*sin(t*.3),2.)*18.);',
'   col+=vec3(.04,.28,.29)*flare*.28;',
' }else{',
'   vec2 p=q*vec2(1.7,1.2);',
'   float hills=sin(p.x*4.+t*.25)*.16+sin(p.x*8.-t*.1)*.06;',
'   float f=p.y-hills+.12*noise(p*5.+t*.1);',
'   float contour=pow(1.-abs(sin(f*58.)),38.);',
'   col+=vec3(.20,.16,.33)*contour*.68+vec3(.025,.08,.18)*noise(p*7.)*.38;',
' }',
' float light=exp(-length((uv-uPointer)*vec2(1.4,.95))*4.5)*uPower;',
' col+=uAccent*light*.12;',
' col+=vec3(noise(uv*vec2(102.,89.))-.5)*.015;',
' gl_FragColor=vec4(clamp(col,0.,1.),1.);',
'}'
].join('\n');

function makeHaloTexture(){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const c=canvas.getContext('2d');
  const gr=c.createRadialGradient(128,128,0,128,128,126);
  gr.addColorStop(0,'rgba(255,255,255,.85)');
  gr.addColorStop(.27,'rgba(255,255,255,.35)');
  gr.addColorStop(.65,'rgba(255,255,255,.07)');
  gr.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=gr;c.fillRect(0,0,256,256);
  return Texture.from(canvas);
}
function seededPoints(n,rnd){
  return Array.from({length:n},()=>({x:rnd()*760,y:rnd()*510,phase:rnd()*TAU,r:.4+rnd()*2,depth:.3+rnd()*.7,angle:rnd()*TAU}));
}
export async function createGraphics(host,{onFailure}={}){
  const app=new Application();
  await app.init({
    resizeTo:host,preference:'webgl',backgroundAlpha:0,autoDensity:true,
    antialias:false,resolution:Math.min(devicePixelRatio||1,1.5),
    sharedTicker:false,autoStart:true
  });
  app.canvas.className='pixi-layer';
  app.canvas.setAttribute('aria-hidden','true');
  host.prepend(app.canvas);
  app.ticker.maxFPS=60;
  const halo=makeHaloTexture();
  let root=null,cleanup=()=>{},update=()=>{},item=null,elapsed=0,energy=.65,speed=1,paused=false;
  const pointer={x:.5,y:.5};
  function select(selected){
    cleanup();cleanup=()=>{};update=()=>{};
    if(root){root.destroy({children:true});root=null;}
    root=new Container();app.stage.addChild(root);
    item=selected;elapsed=0;
    const rnd=randGen(selected.number*101+97),mode=selected.gpu;
    const baseColor=selected.tone==='stone'?0x2d8f9c:0x6bd8e3;
    if(mode.startsWith('shader:')){
      const filter=new Filter({
        glProgram:new GlProgram({vertex,fragment}),
        resources:{motion:{
          uTime:{value:0,type:'f32'},uPower:{value:.65,type:'f32'},
          uMode:{value:Number(mode.slice(7)),type:'f32'},
          uPointer:{value:[.5,.5],type:'vec2<f32>'},
          uAccent:{value:[.26,.68,.8],type:'vec3<f32>'}
        }}
      });
      const sprite=new Sprite(Texture.WHITE);sprite.width=760;sprite.height=510;sprite.filters=[filter];
      root.addChild(sprite);cleanup=()=>filter.destroy();
      update=()=>{
        const u=filter.resources.motion.uniforms;
        u.uTime=elapsed;u.uPower=energy;u.uPointer[0]=pointer.x;u.uPointer[1]=pointer.y;
      };
    }else if(mode==='orbit'||mode==='orbital'){
      const rings=[new Graphics(),new Graphics(),new Graphics()];rings.forEach(x=>root.addChild(x));
      const dots=seededPoints(mode==='orbit'?64:36,rnd);
      dots.forEach(d=>{
        const sp=new Sprite(halo);sp.anchor.set(.5);sp.tint=baseColor;sp.alpha=.18;sp.scale.set(.06);
        root.addChild(sp);d.sp=sp;
      });
      update=()=>{
        const cx=mode==='orbit'?480:380,cy=255,radius=mode==='orbit'?145:225;
        rings.forEach((g,i)=>{
          g.clear();
          if(mode==='orbit')g.ellipse(cx,cy,radius+i*26,(radius+i*26)*.54).stroke({color:baseColor,width:1,alpha:.06+i*.035});
          else g.circle(cx,cy,radius*(.4+i*.3)).stroke({color:baseColor,width:1,alpha:.05+i*.02});
        });
        dots.forEach((d,i)=>{
          const a=d.angle+elapsed*(.15+d.depth*.16)*(i%2?-1:1);
          d.sp.position.set(cx+Math.cos(a)*radius*(.6+d.depth*.62),cy+Math.sin(a)*radius*.5*(.7+d.depth));
          d.sp.alpha=.08+.25*Math.sin(a*2+elapsed)**2;d.sp.scale.set(.03+d.r*.04);
        });
      };
    }else if(mode==='grid'){
      const grid=new Graphics();root.addChild(grid);
      update=()=>{
        grid.clear();
        for(let i=0;i<16;i++){
          const x=i*53-20,y=i*38-30,off=(pointer.x-.5)*30*energy;
          grid.moveTo(x+off,0).lineTo(x*1.28+off,510).stroke({color:baseColor,alpha:.055,width:1});
          grid.moveTo(0,y).lineTo(760,y+Math.sin(elapsed+i)*2).stroke({color:baseColor,alpha:.035,width:1});
        }
      };
    }else if(['beam','rays','liquid','halo'].includes(mode)){
      const glow=new Sprite(halo);glow.anchor.set(.5);glow.tint=baseColor;root.addChild(glow);
      const lines=new Graphics();root.addChild(lines);
      update=()=>{
        lines.clear();
        const x=pointer.x*760,y=pointer.y*510;
        glow.position.set(mode==='rays'?550:mode==='beam'?380:x,mode==='rays'?190:mode==='beam'?250:y);
        glow.scale.set(mode==='liquid'?2.3:1.8);glow.alpha=.06+energy*.065;
        if(mode==='rays')for(let i=0;i<12;i++){
          const a=i*TAU/12+elapsed*.05;
          lines.moveTo(390+Math.cos(a)*105,250+Math.sin(a)*105)
            .lineTo(390+Math.cos(a)*252,250+Math.sin(a)*252).stroke({color:baseColor,width:.7,alpha:.045});
        }
        else if(mode==='beam')for(let i=0;i<4;i++){
          const q=i*22;
          lines.moveTo(-40+q+elapsed*15,460).bezierCurveTo(225,260+q,510,315-q,800,40)
            .stroke({color:baseColor,width:.8,alpha:.025+i*.013});
        }
        else if(mode==='liquid')for(let i=0;i<7;i++){
          const yy=90+i*54;
          lines.moveTo(0,yy).bezierCurveTo(180,yy+30*Math.sin(elapsed),370,yy-20*Math.sin(elapsed),760,yy)
            .stroke({color:baseColor,width:.8,alpha:.03});
        }
      };
    }else if(mode==='dust'||mode==='graph'){
      const dots=seededPoints(mode==='dust'?95:28,rnd);
      dots.forEach(d=>{
        const sp=new Sprite(halo);sp.anchor.set(.5);sp.tint=baseColor;sp.scale.set(.03+d.depth*.07);sp.alpha=.06;
        root.addChild(sp);d.sp=sp;
      });
      const lines=new Graphics();root.addChild(lines);
      update=()=>{
        lines.clear();
        dots.forEach(d=>{
          const a=d.phase+elapsed*(.16+d.depth*.18);
          d.sp.position.set(d.x+Math.cos(a)*8,d.y+Math.sin(a)*6);
          d.sp.alpha=.06+d.depth*.15;
        });
        if(mode==='graph')for(let i=0;i<13;i++)
          lines.moveTo(65+i*50,100).lineTo(65+i*50,490).stroke({color:baseColor,alpha:.04,width:1});
      };
    }
    update();
  }
  app.ticker.add(({deltaTime})=>{
    if(!root||paused)return;
    elapsed+=Math.min(deltaTime,2)*.014*speed;
    try{update();}catch(error){console.warn('Pixi motion:',error);onFailure?.(error);}
  });
  return {
    app,select,
    setEnergy:x=>energy=clamp(x,0,1),
    setSpeed:x=>speed=clamp(x,.3,1.8),
    setPointer:(x,y)=>{pointer.x=clamp(x,0,1);pointer.y=clamp(y,0,1);},
    pause(){paused=true;app.stop();},
    resume(){paused=false;app.start();},
    destroy(){cleanup();if(root)root.destroy({children:true});halo.destroy(true);app.destroy();}
  };
}
