const TAU=Math.PI*2;
const mix=(a,b,t)=>a+(b-a)*t;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));

function centerText(ctx,label,y,sz=14,color=0xb1b9ba) {
  const t=ctx.label(label,sz,color);
  t.anchor.set(.5);t.position.set(ctx.w*.5,y);return t;
}
function stroke(g,points,color,width=1,alpha=.8) {
  g.clear();
  if(!points.length)return;
  g.moveTo(points[0].x,points[0].y);
  for(let j=1;j<points.length;j++)g.lineTo(points[j].x,points[j].y);
  g.stroke({color,width,alpha});
}

function typeWave(ctx,v) {
  const words=['KINETIC','SPECTRUM','UNFOLD','MOVEMENT','RESONATE'];
  const str=words[v],chars=[...str].map(ch=>{
    const o=ctx.label(ch,110,ctx.color,true);
    o.anchor.set(.5);return o;
  });
  const shadows=[...str].map(ch=>{
    const o=ctx.label(ch,110,0xe9aafa,true);
    o.anchor.set(.5);o.alpha=.2;return o;
  });
  const tag=centerText(ctx,'TYPE / '+String(v+1).padStart(2,'0')+'   —   LIVE LETTERFORMS',ctx.h*.68,12,0x859093);
  let t=0,fit=1;
  function resize() {
    fit=Math.min(1.12,(ctx.w-36)/(str.length*89),ctx.h/560);
    tag.position.set(ctx.w/2,ctx.h*.76);
  }
  resize();
  return {count:chars.length*2+1,resize,update(dt,p,power) {
    t+=dt*.025;
    const step=89*fit,start=ctx.w/2-(str.length-1)*step/2;
    for(let i=0;i<chars.length;i++){
      const s=chars[i],sh=shadows[i],swing=Math.sin(t*1.45+i*.65),px=(i/Math.max(1,chars.length-1)-.5);
      let y=0,x=0,sc=1,rot=0;
      if(v===0){y=Math.sin(t*2+i*.6)*32*power+p.ny*px*60*power;rot=Math.sin(t+i*.4)*.08*power;}
      if(v===1){x=Math.sin(t*2+i*.9)*12*power;y=Math.cos(t*3+i*.8)*12*power;sc=1+.08*swing*power;}
      if(v===2){sc=1+Math.sin(t*1.5+i*.52)*.32*power;y=Math.sin(t+i*.7)*20*power;}
      if(v===3){x=px*125*Math.sin(t*.8)*power;y=Math.cos(i*1.5+t)*24*power;rot=swing*.25*power;}
      if(v===4){y=Math.sin(t*4+i*.45)*10*power;rot=swing*.15*power;sc=.85+.25*(Math.sin(t*2+i)+1)/2;}
      const boost=p.inside?Math.max(0,1-Math.abs(p.x-(start+i*step))/160):0;
      s.position.set(start+i*step+x+p.nx*boost*24,ctx.h*.47+y+p.ny*boost*45);
      s.scale.set(fit*sc);s.rotation=rot;
      sh.position.set(s.x+(-6+p.nx*14)*power,s.y+8*power);
      sh.scale.set(fit*sc);sh.rotation=-rot;
    }
  }};
}

function typeOrbit(ctx,v) {
  const text=['P I J S','MOTION','FORM','INFINITE','STUDIO'][v].replaceAll(' ','');
  const glyphs=[...text].map((ch,i)=>{const o=ctx.label(ch,68,i%2?ctx.color:ctx.light,true);o.anchor.set(.5);return o;});
  const rings=Array.from({length:3},()=>ctx.graphics());
  const line=centerText(ctx,'A L P H A B E T  /  S P A T I A L  S Y S T E M',ctx.h*.82,12);
  let t=0,spin=0;
  return {count:glyphs.length+3,update(dt,p,power){
    t+=dt*.014;spin=mix(spin,p.nx,.035*dt);
    const r=Math.min(ctx.w,ctx.h)*(.20+v*.018);
    rings.forEach((g,i)=>{
      const rad=r*(.6+i*.31);g.clear().circle(ctx.w/2,ctx.h/2,rad).stroke({color:i===1?ctx.color:0xffffff,width:1,alpha:.10+i*.09});
    });
    glyphs.forEach((g,i)=>{
      const a=i/glyphs.length*TAU+t*(v===3?-.8:.45)+spin*.5;
      let rr=r;
      if(v===0)rr=r*(1+.08*Math.sin(a*4+t));
      if(v===1)rr=r*(.15+(.75+.45*Math.sin(t*1.5+i))*.7);
      if(v===2)rr=r*(1+.6*(p.inside?Math.cos(a-Math.atan2(p.ny,p.nx)):.25));
      if(v===3)rr=r*(.4+i/glyphs.length*.95);
      if(v===4)rr=r*(.22+i/glyphs.length*1.5);
      g.position.set(ctx.w/2+Math.cos(a)*rr,ctx.h/2+Math.sin(a)*rr*.73);
      g.rotation=v===2?-a:Math.sin(a+t)*.25*power;g.scale.set(clamp(Math.min(ctx.w,ctx.h)/610,.55,1.2)*(v===4?.6+i/glyphs.length:.75));
      g.alpha=.55+.45*(Math.sin(a+t)+1)/2;
    });
    line.position.set(ctx.w/2,ctx.h*.84);
  }};
}

function liquidLines(ctx,v) {
  const n=[20,15,28,18,26][v], layers=Array.from({length:n},()=>ctx.graphics());
  const label=centerText(ctx,['SILK','TENSION','HORIZONS','RIPPLE','CAUSTICS'][v],ctx.h*.35,18,ctx.light);
  let time=0;
  return {count:n,update(dt,p,power){
    time+=.009*dt*(1+power);
    const step=Math.max(5,ctx.w/130), cx=ctx.w/2;
    layers.forEach((g,k)=>{
      const points=[],kf=k/Math.max(1,n-1);
      for(let x=-20;x<=ctx.w+20;x+=step){
        const a=x/Math.max(1,ctx.w);
        const mouse=p.inside?Math.exp(-Math.pow((x-p.x)/(115+power*120),2))*p.ny*power*130:0;
        let y=0;
        if(v===0)y=ctx.h*(.27+kf*.56)+Math.sin(a*9+time*2+k*.19)*34*(1-kf*.6)+mouse*(1-kf);
        if(v===1)y=ctx.h*.50+Math.sin(a*12+kf*5+time)*52+Math.cos(a*21-time*1.4+k*.32)*20+(kf-.5)*ctx.h*.32+mouse*.4;
        if(v===2)y=ctx.h*(.25+kf*.55)+Math.sin(a*7+time*2+k*.12)*30+Math.sin(a*21-time*.9)*15+mouse*.6;
        if(v===3)y=ctx.h*.50+(kf-.5)*ctx.h*.52+Math.sin(a*22+time+kf*12)*19*(.2+kf)+Math.sin(a*5-time*.7+k)*28+mouse*.9;
        if(v===4)y=ctx.h*.28+kf*ctx.h*.47+Math.sin(a*14+time*.9)*Math.sin(kf*5+time)*38+Math.sin(a*31-time*2+kf*9)*7+mouse*.4;
        points.push({x,y});
      }
      stroke(g,points,k%4===0?ctx.light:ctx.color,v===2?1.2:1.8,.10+kf*.58);
    });
    label.position.set(cx,ctx.h*.19);
  }};
}

function shaderArt(ctx,v) {
  const shader=ctx.shader(v),name=ctx.label(['CHROMA','AURORA','MERCURY','ELECTRIC','PRISM'][v],Math.min(108,ctx.w*.12),ctx.light,true);
  name.anchor.set(.5);name.alpha=.88;
  const line=centerText(ctx,'GLSL FILTER / GPU RENDERED / REAL TIME',ctx.h*.8,11,0xc6c8d0);
  let time=0;
  return {count:2,resize(){shader.resize();},update(dt,p,power){
    time+=dt*.016;shader.update(time,power,p);name.position.set(ctx.w*.5,ctx.h*.50);name.rotation=Math.sin(time*.55)*.025;name.scale.set(.86+.03*Math.sin(time));
    line.position.set(ctx.w*.5,ctx.h*.78);
  }};
}


function particleDepth(ctx,v) {
  const n=ctx.w<720?320:620,arr=[];
  for(let i=0;i<n;i++){
    const angle=ctx.rand()*TAU,z=.12+ctx.rand()*.88,r=(.08+ctx.rand()*.92);
    const sp=ctx.dot(1.6,i%13===0?ctx.light:ctx.color,.3+ctx.rand()*.7);
    arr.push({angle,z,r,sp,phase:ctx.rand()*TAU,speed:.25+ctx.rand()*.8});
  }
  let time=0;
  const label=centerText(ctx,['WARP DRIVE','COSMIC DUST','ORBITAL FIELD','METEOR STREAM','SOLAR HALO'][v],ctx.h*.78,12,0x96a0a7);
  return {count:n+1,update(dt,p,power) {
    time+=dt*.012*(.5+power);
    const size=Math.min(ctx.w,ctx.h),cx=ctx.w/2-p.nx*25*power,cy=ctx.h/2-p.ny*25*power;
    arr.forEach((o,i)=>{
      let x=0,y=0,s=.45,alpha=.5;
      const ph=o.phase,angle=o.angle+time*.38;
      if(v===0) {
        o.z-=dt*(.0012+power*.005)*o.speed;if(o.z<=.02)o.z=1;
        const rr=o.r*size*(.13+1.1/(o.z*2+.15));
        x=Math.cos(o.angle)*rr;y=Math.sin(o.angle)*rr*.68;
        s=clamp(2/(o.z*8+.6),.35,3.5);alpha=1-o.z*.65;
        o.sp.rotation=o.angle;
      }else if(v===1){
        const rr=Math.sqrt(o.r)*size*.49;
        x=Math.cos(angle+Math.sin(time+ph)*.06)*rr;y=Math.sin(angle)*rr*.52;
        x+=Math.cos(time*2+ph)*9;y+=Math.sin(time+ph)*12;
        s=.5+o.r*.7;alpha=.23+Math.sin(time+ph)*.17+.35;
      }else if(v===2){
        const rr=(.13+o.r*.41)*size;
        const tilt=(o.r-.5)*1.4;
        x=Math.cos(angle+tilt)*rr;y=Math.sin(angle+tilt)*rr*.37;
        s=.4+Math.cos(angle)*.5;alpha=.45+Math.cos(angle)*.3;
      }else if(v===3){
        const phase=(o.z+time*(.22+power*.18))%1;
        x=(phase-.5)*ctx.w*1.8+o.r*ctx.w*.5;
        y=ctx.h*(o.r*1.05)-phase*ctx.h*.47;
        s=.45+phase*1.2;alpha=1-phase*.5;o.sp.rotation=-.48;
      }else{
        const rr=(.27+Math.cos(o.angle*5+time*2)*.055+o.r*.1)*size;
        x=Math.cos(angle)*rr;y=Math.sin(angle)*rr*.65;
        s=.75+Math.sin(time*2+ph)*.35;alpha=.45+.48*Math.sin(time+ph)**2;
      }
      o.sp.position.set(cx+x,cy+y);o.sp.scale.set(s);o.sp.alpha=clamp(alpha,.04,1);
    });
    label.position.set(ctx.w*.5,ctx.h*.86);
  }};
}

function particleMorph(ctx,v) {
  const n=ctx.w<720?310:520,dots=[],random=ctx.rand;
  let time=0, impulse=0;
  function target(o,t) {
    const theta=o.theta;
    const size=Math.min(ctx.w,ctx.h)*.34;
    if(v===0)return {x:ctx.w*.5+Math.cos(theta)*o.radius*size,
                      y:ctx.h*.5+Math.sin(theta)*o.radius*size*.6};
    if(v===1)return {x:ctx.w*.5+Math.sin(theta*3+t)*Math.cos(theta)*size*.6*o.radius,
                      y:ctx.h*.5+Math.cos(theta*2+t*.5)*size*.58*o.radius};
    if(v===2)return {x:ctx.w*.5+Math.cos(theta+t*.25)*size*o.radius,
                      y:ctx.h*.5+Math.sin(theta*3+t*.5)*size*.55*o.radius};
    if(v===3)return {x:ctx.w*.5+Math.cos(theta*7+t*.7)*size*.95*o.radius,
                      y:ctx.h*.5+Math.sin(theta*5+t*.6)*size*.6*o.radius};
    return {x:ctx.w*.5+Math.sin(theta*3+t+o.radius*7)*size*o.radius,
            y:ctx.h*.5+Math.sin(theta*2-t+o.radius*4)*size*.7*o.radius};
  }
  for(let i=0;i<n;i++){
    const o={theta:random()*TAU,radius:Math.sqrt(random()),x:ctx.w/2,y:ctx.h/2,vx:0,vy:0,
      sp:ctx.dot(.7+random()*1.5,i%9===0?ctx.light:ctx.color,.25+random()*.75)};
    const pos=target(o,0);o.x=pos.x;o.y=pos.y;dots.push(o);
  }
  return {count:n,click(){impulse=1.6;},update(dt,p,power){
    time+=dt*.012*(1+power);impulse*=Math.pow(.94,dt);
    for(const o of dots) {
      const dest=target(o,time),dx=o.x-p.x,dy=o.y-p.y,dist=Math.sqrt(dx*dx+dy*dy)+.001;
      const force=p.inside?Math.max(0,1-dist/180)*power:0;
      const kick=impulse*Math.max(0,1-dist/250);
      o.vx+=((dest.x-o.x)*.007+(dx/dist)*(force*.9+kick*2.5))*dt;
      o.vy+=((dest.y-o.y)*.007+(dy/dist)*(force*.9+kick*2.5))*dt;
      o.vx*=Math.pow(.91,dt);o.vy*=Math.pow(.91,dt);
      o.x+=o.vx*dt;o.y+=o.vy*dt;
      o.sp.position.set(o.x,o.y);
    }
  }};
}

function cursorMagnet(ctx,v) {
  const nx=ctx.w<720?18:26,ny=ctx.w<720?12:17,points=[];
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
    const sp=ctx.dot(1.2,((x+y)%13===0)?ctx.light:ctx.color,.28+((x+y)%6)*.11);
    points.push({nx:x/(nx-1),ny:y/(ny-1),sp,x:0,y:0,vx:0,vy:0});
  }
  const ring=ctx.graphics(),line=centerText(ctx,['MAGNETIC','REPEL','ORBITAL','LENS','VORTEX'][v],ctx.h*.15,13);
  let flip=false,t=0;
  function home(o){return {x:ctx.w*(.12+o.nx*.76),y:ctx.h*(.15+o.ny*.7)};}
  for(const o of points){const h=home(o);o.x=h.x;o.y=h.y;}
  return {count:points.length+2,click(){flip=!flip;},resize(){for(const o of points){const h=home(o);o.x=h.x;o.y=h.y;o.vx=0;o.vy=0;}},update(dt,p,power) {
    t+=dt*.02;
    const radius=(.12+power*.27)*Math.min(ctx.w,ctx.h);
    for(const o of points){
      const h=home(o),dx=o.x-p.x,dy=o.y-p.y,r=Math.hypot(dx,dy)+.01,
            field=p.inside?Math.max(0,1-r/radius):0;
      let fx=0,fy=0;
      if(v===0||v===1) {const sign=(v===0? -1:1)*(flip?-1:1);fx=sign*dx/r*field*power*6;fy=sign*dy/r*field*power*6;}
      else if(v===2){fx=-dy/r*field*power*8;fy=dx/r*field*power*8;}
      else if(v===3){const d=field*power;fx=(h.x-p.x)*d*.035;fy=(h.y-p.y)*d*.035;}
      else {const twist=field*power*13;fx=-dy/r*twist-dx/r*field*3;fy=dx/r*twist-dy/r*field*3;}
      o.vx+=((h.x-o.x)*.015+fx)*dt;o.vy+=((h.y-o.y)*.015+fy)*dt;
      o.vx*=Math.pow(.82,dt);o.vy*=Math.pow(.82,dt);o.x+=o.vx*dt;o.y+=o.vy*dt;
      o.sp.position.set(o.x,o.y);
      o.sp.scale.set(.55+field*power*1.8);
      o.sp.alpha=.32+field*.65;
    }
    ring.clear();
    if(p.inside) ring.circle(p.x,p.y,radius).stroke({color:ctx.color,width:1,alpha:.28});
    line.position.set(ctx.w*.5,ctx.h*.10);
  }};
}

function cursorTrail(ctx,v) {
  const count=120,trails=[];
  for(let i=0;i<count;i++){
    const sp=ctx.dot(1.2,i%11===0?ctx.light:ctx.color,.6);
    trails.push({sp,x:ctx.w*.5,y:ctx.h*.5,phase:ctx.rand()*TAU,scale:ctx.rand()});
  }
  const graphics=ctx.graphics(),center=centerText(ctx,['AFTERIMAGE','CALLIGRAPHIC','SHATTER','COMET','SMOKE'][v],ctx.h*.18,16);
  let time=0,kick=0;
  return {count:count+2,click(){kick=1;},update(dt,p,power){
    time+=dt*.023;kick*=Math.pow(.95,dt);
    const q=p.inside?p:{x:ctx.w*(.5+Math.cos(time*.5)*.27),y:ctx.h*(.5+Math.sin(time*.7)*.22),inside:true};
    const pts=[];
    for(let i=0;i<trails.length;i++){
      const o=trails[i],prev=i===0?q:trails[i-1],following=.34-i/count*.16;
      const wobble=(v===1?Math.sin(time*2+i*.16)*16:v===4?Math.sin(time+i*.33)*34:0)*power;
      o.x+=(prev.x-o.x)*following*dt;
      o.y+=(prev.y-o.y)*following*dt;
      const t=i/count;
      let dx=0,dy=0;
      if(v===2){dx=Math.sin(i*12+time*2)*t*100*(kick+.15);dy=Math.cos(i*6+time)*t*100*(kick+.15);}
      if(v===3){dx=Math.cos(time+i*.15)*t*30;dy=Math.sin(time+i*.15)*t*30;}
      if(v===4){dx=Math.cos(o.phase+time*.6)*t*45;dy=Math.sin(o.phase+time*.8)*t*45;}
      o.sp.position.set(o.x+dx+wobble,o.y+dy);
      o.sp.scale.set(clamp((1-t)*(v===3?2.8:2)+.1,.1,3.3));
      o.sp.alpha=Math.pow(1-t,1.1)*.9;
      if(i%3===0)pts.push({x:o.x+dx,y:o.y+dy});
    }
    graphics.clear();
    if(v===1||v===3||v===0){
      if(pts.length){graphics.moveTo(pts[0].x,pts[0].y);pts.slice(1).forEach(o=>graphics.lineTo(o.x,o.y));graphics.stroke({color:ctx.color,width:v===1?2.2:1,alpha:.36});}
    }
    center.position.set(ctx.w*.5,ctx.h*.14);
  }};
}

export const buildsA={typeWave,typeOrbit,liquidLines,shaderArt,particleDepth,particleMorph,cursorMagnet,cursorTrail};
