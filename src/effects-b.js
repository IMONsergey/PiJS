import { Graphics, Sprite, PerspectiveMesh } from 'pixi.js';

const TAU=Math.PI*2, clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), lerp=(a,b,t)=>a+(b-a)*t;

function ptsStroke(g, pts, color, w=1,alpha=.6) {
  g.clear();if(!pts.length)return;
  g.moveTo(pts[0].x,pts[0].y);
  for(let j=1;j<pts.length;j++)g.lineTo(pts[j].x,pts[j].y);
  g.stroke({color,width:w,alpha});
}

function lineArt(ctx,v) {
  const n=[40,35,26,50,24][v],graphs=Array.from({length:n},()=>ctx.graphics());
  let time=0;
  return {count:n,update(dt,p,power) {
    time+=dt*.01;
    for(let i=0;i<n;i++){
      const g=graphs[i],k=i/n,pts=[];
      if(v===0) {
        for(let x=-25;x<ctx.w+25;x+=12)pts.push({x,y:ctx.h*(.22+.58*k)+Math.sin(x*.013+time*.7+i*.29)*35*(.3+k)+Math.cos(x*.028-time+i*.11)*8});
      } else if(v===1) {
        const cx=ctx.w*.5,cy=ctx.h*.53,r=(.06+.42*k)*Math.min(ctx.w,ctx.h);
        for(let a=0;a<=TAU+.05;a+=TAU/110) {
          const rr=r+(Math.sin(a*5+time*1.3+i*.12)+Math.sin(a*11-time))*(6+power*15);
          pts.push({x:cx+Math.cos(a)*rr*(1.35+.1*p.nx),y:cy+Math.sin(a)*rr*(.8+.12*p.ny)});
        }
      } else if(v===2) {
        for(let x=0;x<ctx.w+12;x+=10)pts.push({x,y:ctx.h*.16+k*ctx.h*.73+Math.sin(x*.04+i*.23+time*1.4)*Math.sin(x*.005+time)*25+Math.sin(x*.015-i*.11)*12});
      } else if(v===3) {
        const r=(.08+.55*k)*Math.min(ctx.w,ctx.h);
        for(let a=0;a<=TAU+.04;a+=TAU/140)pts.push({x:ctx.w*.5+Math.cos(a+time*.7)*r,y:ctx.h*.5+Math.sin(a+time*.7)*r*.7});
      } else {
        const y=ctx.h*(.19+k*.64);
        for(let x=0;x<ctx.w+10;x+=9)pts.push({x,y:y+Math.sin(x*.09+time+i*.4)*Math.sin(x*.02-time*.6)*8*power+Math.sin(x*.018+time*2)*4});
      }
      ptsStroke(g,pts,i%8===0?ctx.light:ctx.color,v===0?.7:1,.045+.36*(1-k));
    }
  }};
}

function geometryArt(ctx,v) {
  const layers=Array.from({length:v===4?26:16},()=>ctx.graphics());
  let time=0;
  return {count:layers.length,update(dt,p,power){
    time+=dt*.013;
    const side=Math.min(ctx.w,ctx.h),cx=ctx.w/2,cy=ctx.h/2;
    layers.forEach((g,i)=>{
      const k=i/layers.length,pts=[];
      if(v===0) {
        const petals=5+(i%4);
        for(let a=0;a<=TAU+.03;a+=.038){
          const r=side*(.12+k*.29)*(1+.35*Math.cos(a*petals+time*2+i*.18));
          pts.push({x:cx+Math.cos(a+time*.16)*r,y:cy+Math.sin(a+time*.16)*r});
        }
      } else if(v===1){
        const theta=i*TAU/layers.length+time*.3;
        const n=70;
        for(let j=0;j<n;j++){
          const a=theta+(j/n-.5)*Math.PI*(1.5+power);
          const r=side*(.09+j/n*.44);
          pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});
        }
      } else if(v===2) {
        const cols=4,row=Math.floor(i/cols),col=i%cols,x=cx+(col-1.5)*side*.22,y=cy+(row-1.5)*side*.22;
        const r=side*.08;
        for(let a=0;a<=TAU+.05;a+=.05){
          const f=1+.24*Math.sin(a*4+i+time*1.8);
          pts.push({x:x+Math.cos(a+time*(.3+i*.02))*r*f,y:y+Math.sin(a+time*(.3+i*.02))*r*f});
        }
      } else if(v===3) {
        for(let a=0;a<TAU*2;a+=.015){
          const r=side*(.11+k*.28);
          pts.push({x:cx+Math.sin(a*(2+i%4)+time)*r,y:cy+Math.sin(a*(3+i%5)-time*.8)*r*.71});
        }
      }else {
        const angle=time+i*.17,rr=side*(.14+k*.29),N=4+i%7;
        for(let j=0;j<=N;j++){
          const a=j/N*TAU+angle;
          pts.push({x:cx+Math.cos(a)*rr,y:cy+Math.sin(a)*rr*.8});
        }
      }
      ptsStroke(g,pts,i%4===0?ctx.light:ctx.color,.7+(i%3)*.3,.15+(1-k)*.45);
    });
  }};
}

function posterGallery(ctx,v) {
  const cards=[];
  for(let i=0;i<5;i++){
    const s=ctx.add(new Sprite(ctx.poster(12+i+v*5)));s.anchor.set(.5);
    s.eventMode='static';s.cursor='pointer';
    cards.push(s);
  }
  const badge=ctx.label('THE INDEX     /     0'+(v+1),15,ctx.light,true);
  let shift=0,target=0,time=0;
  const spread=()=>Math.min(ctx.w*.36,275);
  return {count:cards.length+1,click(){target=(target+1)%5;},update(dt,p,power) {
    time+=dt*.012;
    target+=((p.inside?p.nx:0)*.012*(.4+power));
    shift=lerp(shift,target,.025*dt);
    const size=Math.min(ctx.h*.70/720,ctx.w*.30/560,1.08);
    for(let i=0;i<cards.length;i++){
      const a=(i-shift)*Math.PI/3;
      const item=cards[i];
      let x=0,y=0,scale=size,rot=0,opacity=1;
      if(v===0){x=(i-2)*spread()*.87-shift*25;y=Math.sin(time+i)*20;rot=(i-2)*.06;}
      if(v===1){x=(i-2)*spread()*.23;y=(i-2)*13;rot=(i-2)*.09;scale*=1-i*.06;}
      if(v===2){x=Math.cos(a+time*.32)*spread()*1.22;y=Math.sin(a+time*.32)*ctx.h*.12;scale*=.72+.28*(Math.sin(a)+1)/2;}
      if(v===3){x=Math.sin(a)*spread()*1.55;y=Math.cos(a)*ctx.h*.1;rot=Math.sin(a)*.1;}
      if(v===4){x=(i-2)*spread()*.68-shift*40;y=Math.abs(i-2)*24;rot=(i-2)*-.15;}
      item.position.set(ctx.w/2+x,ctx.h*.52+y);
      item.scale.set(scale);
      item.rotation=rot+Math.sin(time+i*.8)*.013;
      item.alpha=clamp(opacity,.15,1);
    }
    badge.position.set(24,ctx.h-48);
  }};
}

function tileGallery(ctx,v) {
  const cols=ctx.w<700?8:13,rows=8,tiles=[],r=ctx.rand;
  const colors=[ctx.color,ctx.light,0x525965,0x20272d,0xb2bdc0];
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const g=ctx.graphics().roundRect(-.5,-.5,1,1,.075).fill({color:colors[(x+y*2+v)%colors.length],alpha:.35+r()*.55});
    tiles.push({x,y,g,seed:r()*TAU});
  }
  let t=0,burst=0;
  return {count:tiles.length,click(){burst=1;},update(dt,p,power) {
    t+=dt*.014;burst*=Math.pow(.95,dt);
    const cell=Math.min(ctx.w/(cols+2),ctx.h/(rows+2)),mx=ctx.w/2-(cols-1)*cell*.52,my=ctx.h/2-(rows-1)*cell*.52;
    for(const o of tiles){
      let x=mx+o.x*cell*1.04,y=my+o.y*cell*1.04;
      const dx=x-p.x,dy=y-p.y,d=Math.sqrt(dx*dx+dy*dy)+1,field=p.inside?Math.max(0,1-d/200)*power:0;
      if(v===0){x+=Math.sin(o.seed+t+o.x*.3)*17*power;y+=Math.cos(t*.7+o.y*.5)*17*power;}
      if(v===1){x+=Math.sin(o.y*.8+t+o.seed)*27;y+=Math.cos(o.x*.8-t)*19;}
      if(v===2){x+=Math.sin(t*.6+o.x*.7)*12;y+=Math.sin(t+o.y*.35)*12;}
      if(v===3){x+=Math.sin(t+o.seed)*18*power;y+=Math.cos(t+o.seed)*18*power;}
      if(v===4){x+=(o.x-cols/2)*Math.sin(t)*.6;y+=Math.cos(t+o.x*.4)*17;}
      x+=dx/d*field*(55+burst*110);y+=dy/d*field*(55+burst*110);
      o.g.position.set(x,y);
      const s=cell*(.65+field*.3);
      o.g.scale.set(s,s);
      o.g.rotation=v===2?Math.sin(t*.8+o.seed)*.5:(o.x+o.y)%3===0?Math.sin(t+o.seed)*.22:0;
      o.g.alpha=.6+field*.4;
    }
  }};
}

function maskReveal(ctx,v) {
  const bg=new Sprite(ctx.poster(26+v*3)),fg=new Sprite(ctx.poster(27+v*3));
  ctx.add(bg);ctx.add(fg);
  const mask=ctx.graphics();fg.mask=mask;
  const stroke=ctx.graphics();
  let t=0,swapped=false;
  const resize=()=>{
    const sc=Math.max(ctx.w/560,ctx.h/720);
    bg.position.set(ctx.w/2,ctx.h/2);fg.position.set(ctx.w/2,ctx.h/2);
    bg.anchor.set(.5);fg.anchor.set(.5);
    bg.scale.set(sc);fg.scale.set(sc);
  };
  resize();
  return {count:4,resize,click(){swapped=!swapped;const b=bg.texture;bg.texture=fg.texture;fg.texture=b;},update(dt,p,power) {
    t+=dt*.014;
    let x=p.inside?p.x:ctx.w*(.5+.19*Math.cos(t)),
        y=p.inside?p.y:ctx.h*(.5+.19*Math.sin(t));
    const r=Math.min(ctx.w,ctx.h)*(.12+power*.3);
    mask.clear();stroke.clear();
    if(v===0||v===1||v===4) {
      if(v===0){mask.circle(x,y,r).fill(0xffffff);stroke.circle(x,y,r).stroke({color:ctx.light,width:1,alpha:.6});}
      if(v===1){const rad=r*.73;mask.circle(x,y,rad).fill(0xffffff);stroke.circle(x,y,rad*1.04).stroke({color:ctx.color,width:1,alpha:.65});}
      if(v===4){
        for(let i=0;i<20;i++){
          const a=i*TAU/20+t;
          const xx=x+Math.cos(a)*r*.6, yy=y+Math.sin(a)*r*.6;
          mask.circle(xx,yy,Math.max(6,r*(.07+.12*Math.sin(t+i)))).fill(0xffffff);
        }
      }
    }else if(v===2){
      for(let i=0;i<16;i++){
        const a=i*TAU/16+t*.25,r1=r*.2,r2=r*(.8+Math.sin(t+i)*.2);
        mask.moveTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1)
          .lineTo(x+Math.cos(a+.11)*r2,y+Math.sin(a+.11)*r2)
          .lineTo(x+Math.cos(a+.22)*r1,y+Math.sin(a+.22)*r1).closePath().fill(0xffffff);
      }
    }else {
      for(let i=0;i<12;i++){
        const yy=(i+.5)*ctx.h/12;
        const width=ctx.w*(.23+.25*Math.sin(t+i*.72))*(.5+power*.5);
        mask.rect(x-width*.5,yy-ctx.h/26,width,ctx.h/14).fill(0xffffff);
      }
    }
  }};
}

function transition(ctx,v) {
  const back=ctx.add(new Sprite(ctx.poster(38+v*4))),
        front=ctx.add(new Sprite(ctx.poster(39+v*4)));
  const layer=ctx.graphics();
  back.anchor.set(.5);front.anchor.set(.5);
  const title=ctx.label(['SHIFT','REVEAL','CUT','FLOW','GLITCH'][v],Math.min(94,ctx.w*.115),ctx.light,true);
  title.anchor.set(.5);
  let elapsed=0,phase=0,swap=false;
  const resize=()=>{const sc=Math.max(ctx.w/560,ctx.h/720);back.scale.set(sc);front.scale.set(sc);
    back.position.set(ctx.w/2,ctx.h/2);front.position.set(ctx.w/2,ctx.h/2);};
  resize();
  const swapContent=()=>{const tmp=back.texture;back.texture=front.texture;front.texture=tmp;};
  return {count:4,resize,click(){elapsed=0;phase=0;swap=!swap;swapContent();},update(dt,p,power) {
    elapsed+=dt*(.005+.006*power);
    const a=Math.min(1,elapsed),ease=a*a*(3-2*a);
    layer.clear();
    if(v===0){const w=ctx.w*ease;layer.rect(0,0,w/2,ctx.h).fill({color:ctx.dark,alpha:.92}).rect(ctx.w-w/2,0,w/2,ctx.h).fill({color:ctx.dark,alpha:.92});}
    if(v===1){const r=Math.min(ctx.w,ctx.h)*ease*.8;layer.circle(ctx.w/2,ctx.h/2,r).stroke({color:ctx.color,width:Math.max(1,(1-ease)*46),alpha:1-ease});}
    if(v===2){for(let i=0;i<14;i++)layer.rect(0,i*ctx.h/14,ctx.w*Math.max(0,ease-i*.026),ctx.h/14+.5).fill({color:i%2?ctx.dark:ctx.color,alpha:(1-ease)*.9});}
    if(v===3){for(let i=0;i<26;i++){const x=i*ctx.w/26,dy=Math.sin(tiny(elapsed)+i*.6)*50*(1-ease);layer.rect(x,0,ctx.w/26+1,Math.min(ctx.h,ctx.h*ease+dy)).fill({color:i%3===0?ctx.color:ctx.dark,alpha:.8*(1-ease)});}}
    if(v===4){for(let i=0;i<58;i++){const r=ctx.rand(),x=r*ctx.w,y=ctx.rand()*ctx.h;if(r>ease)layer.rect(x,y,8+ctx.rand()*50,2+ctx.rand()*18).fill({color:ctx.color,alpha:.4*(1-ease)});}}
    front.alpha=clamp(ease*2,0,.55);
    title.position.set(ctx.w/2,ctx.h/2);title.alpha=.75+.25*Math.sin(elapsed*4);
    if(elapsed>=1.3&&phase===0){phase=1;elapsed=0;swapContent();}
  }};
}
function tiny(t){return t*2;}

function meshDepth(ctx,v) {
  const width=600,height=430;
  const tex=ctx.poster(67+v);
  const mesh=new PerspectiveMesh({texture:tex,width,height,pivot:{x:width/2,y:height/2},x:ctx.w/2,y:ctx.h/2});
  ctx.add(mesh);
  const lab=ctx.label('MESH / 00'+(v+1),12,ctx.light);
  lab.anchor.set(.5);
  let t=0,xx=0,yy=0;
  return {count:2,resize(){
    mesh.position.set(ctx.w*.5,ctx.h*.5);
    mesh.scale.set(Math.min(ctx.w/720,ctx.h/560,1.0));
  },update(dt,p,power){
    t+=dt*.012;xx=lerp(xx,p.nx,.04*dt);yy=lerp(yy,p.ny,.04*dt);
    const corners=[[0,0],[width,0],[width,height],[0,height]].map((pair,i)=>{
      const ox=i===0||i===3?-1:1,oy=i<2?-1:1;
      const sway=Math.sin(t*1.5+i*2)*(.025+.035*power)*width;
      let x=pair[0],y=pair[1];
      if(v===0){x+=ox*xx*25+oy*yy*28;y+=oy*yy*25;}
      if(v===1){y+=Math.sin(i*1.8+t*2)*40*power+ox*xx*20;}
      if(v===2){x+=oy*yy*62+sway;y+=ox*xx*52;}
      if(v===3){x+=oy*xx*36;y+=ox*yy*34+sway*.7;}
      if(v===4){x+=Math.cos(i*2+t)*55*power;y+=Math.sin(i*2+t)*45*power;}
      return {x,y};
    });
    mesh.setCorners(corners[0].x,corners[0].y,corners[1].x,corners[1].y,
                    corners[2].x,corners[2].y,corners[3].x,corners[3].y);
    lab.position.set(ctx.w/2,ctx.h*.87);
  }};
}

function spaceField(ctx,v) {
  const orbits=Array.from({length:9},()=>ctx.graphics()),planets=[];
  for(let i=0;i<28;i++){
    const sp=ctx.dot(3+(i%4)*1.5,i%6===0?ctx.light:ctx.color,.28+.5*ctx.rand());
    planets.push({sp,angle:ctx.rand()*TAU,radius:.2+ctx.rand()*.8,z:ctx.rand(),size:ctx.rand()});
  }
  const guide=ctx.graphics();
  let t=0,thrust=0;
  return {count:38,click(){thrust=1;},update(dt,p,power) {
    t+=dt*(.007+power*.014);thrust*=Math.pow(.94,dt);
    const cx=ctx.w*.5-p.nx*25,cy=ctx.h*.5-p.ny*20,size=Math.min(ctx.w,ctx.h);
    orbits.forEach((g,i)=>{
      const k=(i+1)/orbits.length,r=k*size*.54;
      g.clear();
      if(v===0||v===1){
        g.ellipse(cx,cy,r,r*(v===0?.51:.8)).stroke({color:ctx.color,width:1,alpha:.06+.19*(1-k)});
      }else if(v===2){
        const y=cy+(i-4)*size*.10;
        g.moveTo(0,y).lineTo(ctx.w,y).stroke({color:ctx.color,width:1,alpha:.10+.12*(1-k)});
      }else if(v===3){
        g.circle(cx,cy,r).stroke({color:ctx.color,width:1,alpha:.09});
      }else{
        g.ellipse(cx,cy,r*.95,r*.53).stroke({color:i%2?ctx.light:ctx.color,width:1,alpha:.09+.17*(1-k)});
      }
    });
    planets.forEach((o,i)=>{
      const a=o.angle+t*(1+o.z)*(.5+thrust),r=size*(.07+o.radius*.43);
      let x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.52;
      if(v===1){x=cx+Math.sin(a*2.5)*r;y=cy+Math.cos(a*1.4)*r*.75;}
      if(v===2){x=(o.z+t*.07)%1*ctx.w;y=(.14+o.radius*.72)*ctx.h;}
      if(v===3){const z=((o.z+t*.04)%1);const perspective=1/(z*.8+.15);x=cx+Math.cos(o.angle)*r*perspective;y=cy+Math.sin(o.angle)*r*.65*perspective;}
      if(v===4){x=cx+Math.cos(a+o.radius*3)*r;y=cy+Math.sin(a*1.7)*r*.55;}
      o.sp.position.set(x,y);o.sp.scale.set(.45+o.size*1.2*(v===3?1.5:1));
      o.sp.alpha=.3+.7*Math.sin(a*.5+1)**2;
    });
    guide.clear();
    if(v===2){
      for(let i=0;i<15;i++){
        const q=i/15;guide.moveTo(cx,cy).lineTo(q*ctx.w,ctx.h).stroke({color:ctx.color,width:1,alpha:.11});
      }
    }
  }};
}

export const buildsB={lineArt,geometryArt,posterGallery,tileGallery,maskReveal,transition,meshDepth,spaceField};
