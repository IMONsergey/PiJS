const TAU=Math.PI*2;
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));

function dataFlow(ctx,v) {
  const random=ctx.rand,n=v===1?64:36,nodes=[],net=ctx.graphics(),grid=ctx.graphics();
  for(let i=0;i<n;i++){
    const nx=random(),ny=random(),dot=ctx.dot(1.4+random()*2,i%8===0?ctx.light:ctx.color,.5+random()*.45);
    nodes.push({nx,ny,dot,phase:random()*TAU,r:random(),x:0,y:0});
  }
  const label=ctx.label(['SIGNAL ROUTING','DATA STREAM','NEURAL SYSTEM','SCAN / 019','PULSE NETWORK'][v],14,ctx.light,true);
  let t=0,pulse=0;
  return {count:n+2,click(){pulse=1;},update(dt,p,power) {
    t+=dt*.014;pulse*=Math.pow(.96,dt);
    net.clear();grid.clear();
    nodes.forEach((node,i)=>{
      let x=node.nx*ctx.w,y=node.ny*ctx.h;
      if(v===0){x=.12*ctx.w+node.nx*.76*ctx.w;y=.12*ctx.h+node.ny*.73*ctx.h;}
      if(v===1){x=ctx.w*(.08+node.nx*.84);y=(node.ny+t*(.12+node.r*.4))%1*ctx.h;}
      if(v===2){x=ctx.w/2+Math.cos(node.phase+t*.25)*(node.nx*.45*ctx.w);y=ctx.h/2+Math.sin(node.phase+t*.25)*(node.ny*.4*ctx.h);}
      if(v===3){x=ctx.w*(.1+node.nx*.8);y=ctx.h*(.15+node.ny*.7);}
      if(v===4){x=ctx.w/2+Math.cos(node.phase)*node.nx*.46*ctx.w;y=ctx.h/2+Math.sin(node.phase)*node.ny*.43*ctx.h;}
      x+=(p.x-x)*.022*(p.inside?power:0)*(v===4?2:1);
      node.x=x;node.y=y;node.dot.position.set(x,y);
      const intensity=Math.sin(t*3+node.phase)*.5+.5;
      node.dot.alpha=.25+intensity*.7;
      node.dot.scale.set(v===1?.35+.9*node.r:.6+intensity*.6);
    });
    if(v===0||v===2||v===4){
      for(let i=0;i<n;i++){
        const a=nodes[i],b=nodes[(i+7)%n],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
        if(d<Math.min(ctx.w,ctx.h)*.42){
          net.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:ctx.color,width:.7,alpha:.05+(1-d/ctx.w)*.2+pulse*.19});
        }
      }
    }else if(v===1){
      for(let i=0;i<30;i++){
        const x=i/30*ctx.w;
        grid.moveTo(x,0).lineTo(x,ctx.h).stroke({color:ctx.color,width:.7,alpha:.06});
      }
    }else if(v===3){
      const y=(t*.11%1)*ctx.h;
      grid.rect(0,y,ctx.w,2).fill({color:ctx.color,alpha:.7});
      for(let i=0;i<24;i++){
        const xx=i/24*ctx.w;grid.moveTo(xx,0).lineTo(xx,ctx.h).stroke({color:ctx.color,width:.5,alpha:.075});
      }
    }
    label.position.set(22,24);
  }};
}

function spectrum(ctx,v) {
  const graph=ctx.graphics(),graph2=ctx.graphics(),bars=Array.from({length:72},()=>ctx.graphics());
  const note=ctx.label(['SPECTRAL RESPONSE','RADIAL FREQUENCY','OSCILLOSCOPE','SYNTH COLUMNS','SOUND WEAVE'][v],12,ctx.light);
  note.anchor.set(.5);
  let t=0;
  return {count:75,update(dt,p,power){
    t+=dt*.025;
    graph.clear();graph2.clear();
    const cx=ctx.w/2,cy=ctx.h/2,space=ctx.w*.8,bass=(.2+.8*power);
    const amp=x=>{
      const f=Math.abs(Math.sin(x*11+t)+.35*Math.sin(x*30-t*1.9)+.25*Math.cos(x*53+t*1.5));
      return (.2+f*.55)*bass;
    };
    bars.forEach((g,i)=>{
      const k=i/(bars.length-1),a=k*TAU,frequency=amp(k);
      g.clear();
      if(v===0){
        const x=ctx.w*.12+k*space,y=cy+Math.sin(k*TAU*3+t)*ctx.h*.09;
        g.moveTo(x,y-frequency*130).lineTo(x,y+frequency*130).stroke({color:i%7===0?ctx.light:ctx.color,width:2.2,alpha:.23+frequency*.6});
      }else if(v===1) {
        const r=ctx.h*.13,end=r+ctx.h*.26*frequency;
        g.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)
          .lineTo(cx+Math.cos(a)*end,cy+Math.sin(a)*end).stroke({color:ctx.color,width:3,alpha:.28+frequency*.7});
      }else if(v===2) {
        const x=ctx.w*.08+k*ctx.w*.84,y=cy+Math.sin(k*50+t)*frequency*140;
        g.circle(x,y,1+frequency*2).fill({color:i%5===0?ctx.light:ctx.color,alpha:.35+frequency*.5});
      }else if(v===3) {
        const x=ctx.w*.10+k*ctx.w*.8,h=frequency*ctx.h*.55;
        g.roundRect(x,cy-h*.5,Math.max(1,ctx.w*.0045),h,2).fill({color:i%8===0?ctx.light:ctx.color,alpha:.3+frequency*.65});
      }else{
        const x=ctx.w*.06+k*ctx.w*.88;
        const y=cy+Math.sin(k*TAU*5+t)*frequency*100;
        g.circle(x,y,1.3+frequency*2.6).fill({color:ctx.color,alpha:.32+frequency*.6});
      }
    });
    if(v===2||v===4){
      for(let layer=0;layer<(v===4?9:3);layer++){
        const points=[];
        for(let i=0;i<180;i++){
          const k=i/179,x=k*ctx.w;
          const y=cy+(Math.sin(k*TAU*6+t+layer*.4)+.33*Math.cos(k*TAU*19-t*1.2))*(25+power*65)*(v===4?layer*.16+.2:1);
          points.push({x,y});
        }
        const G=layer%2?graph2:graph;
        if(layer===0)G.clear();
        G.moveTo(points[0].x,points[0].y);
        for(const pt of points.slice(1))G.lineTo(pt.x,pt.y);
        G.stroke({color:layer%2===0?ctx.color:ctx.light,width:1,alpha:v===4?.12:.4});
      }
    }
    note.position.set(cx,ctx.h*.89);
  }};
}

function physics(ctx,v) {
  const n=v===4?13:19,bodies=[],random=ctx.rand;
  const line=ctx.graphics();
  let t=0,burst=0,dragIndex=-1;
  for(let i=0;i<n;i++){
    const s=ctx.graphics().roundRect(-22,-22,44,44,i%2?22:9).fill({color:i%4===0?ctx.light:ctx.color,alpha:.42+random()*.45});
    s.eventMode='static';s.cursor='grab';
    bodies.push({s,i,x:0,y:0,vx:0,vy:0,phase:random()*TAU,weight:.5+random(),homeX:0,homeY:0});
  }
  function reset(){
    bodies.forEach((b,i)=>{
      const cols=5;
      b.homeX=ctx.w/2+((i%cols)-(cols-1)/2)*Math.min(ctx.w*.135,94);
      b.homeY=ctx.h/2+(Math.floor(i/cols)-1.5)*Math.min(ctx.h*.18,100);
      b.x=b.homeX;b.y=b.homeY;b.vx=0;b.vy=0;
    });
  }
  reset();
  return {count:n+1,resize:reset,click(p){burst=1.3;for(const b of bodies){
    const d=Math.hypot(b.x-p.x,b.y-p.y);if(d<80){b.vx+=(b.x-p.x)*.08;b.vy+=(b.y-p.y)*.08;}
  }},update(dt,p,power){
    t+=dt*.014;burst*=Math.pow(.94,dt);
    line.clear();
    bodies.forEach((b,i)=>{
      let targetX=b.homeX,targetY=b.homeY;
      if(v===0){targetY=ctx.h*.20+Math.sin(t+b.phase)*ctx.h*.28;targetX=ctx.w/2+(i-(n-1)/2)*Math.min(ctx.w*.036,22);}
      if(v===2){targetX+=Math.sin(t*2+i)*30;targetY+=Math.cos(t*1.4+i*.5)*25;}
      if(v===3){targetX=ctx.w/2+Math.sin(t+b.phase)*(120+b.weight*80);targetY=ctx.h/2+Math.cos(t*.7+b.phase)*120;}
      if(v===4){targetY=ctx.h*.70-(i%5)*29;targetX=ctx.w/2+(Math.floor(i/5)-1)*140+(i%5)*4;}
      const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)+.001,field=p.inside?Math.max(0,1-d/210):0;
      b.vx+=((targetX-b.x)*.016+(dx/d)*field*(v===1?10:5)*power)*dt;
      b.vy+=((targetY-b.y)*.016+(dy/d)*field*5*power)*dt;
      b.vx*=Math.pow(.84,dt);b.vy*=Math.pow(.84,dt);
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      b.s.position.set(b.x,b.y);
      b.s.rotation=Math.sin(t+i*.5)*.21+(b.vx+b.vy)*.004;
      const sc=v===3?.5+b.weight*.45:.47+b.weight*.25;
      b.s.scale.set(sc*(1+field*.26));
      if(v===0)line.moveTo(b.homeX,0).lineTo(b.x,b.y).stroke({color:ctx.color,width:1,alpha:.23});
      if(v===4&&i>0)line.moveTo(bodies[i-1].x,bodies[i-1].y).lineTo(b.x,b.y).stroke({color:ctx.light,width:1,alpha:.12});
    });
  }};
}

function abstract(ctx,v) {
  const g=ctx.graphics(),g2=ctx.graphics(),particles=[],random=ctx.rand;
  const n=v===1?130:65;
  for(let i=0;i<n;i++){
    const sp=ctx.dot(1+random()*4,i%5===0?ctx.light:ctx.color,.3+random()*.7);
    particles.push({sp,angle:random()*TAU,r:random(),x:random()*ctx.w,y:random()*ctx.h,speed:.4+random()*.9});
  }
  let t=0,impulse=0;
  return {count:n+2,click(){impulse=1;},update(dt,p,power){
    t+=dt*.018;impulse*=Math.pow(.955,dt);
    g.clear();g2.clear();
    const cx=ctx.w/2,cy=ctx.h/2,R=Math.min(ctx.w,ctx.h)*.34;
    for(let j=0;j<(v===2?6:15);j++){
      const a=j*TAU/15+t*.5,pts=[];
      if(v===0||v===3){
        for(let k=0;k<74;k++){
          const angle=k/73*TAU*1.1+TAU*j/(v===3?8:15),
                r=R*(.15+.8*k/74)*(v===3?Math.sin(angle*4+t)+1:.6+.22*Math.sin(angle*5+t));
          pts.push({x:cx+Math.cos(angle)*r,y:cy+Math.sin(angle)*r});
        }
      } else if(v===2){
        for(let k=0;k<130;k++){
          const fraction=k/129,angle=fraction*TAU*(1+j*.2)+t+j*.5,r=R*fraction;
          pts.push({x:cx+Math.cos(angle)*r,y:cy+Math.sin(angle)*r});
        }
      } else if(v===4){
        for(let k=0;k<50;k++){
          const angle=k/50*TAU,r=R*(.25+.65*Math.sin(angle*3+t+j*.04)**2);
          pts.push({x:cx+Math.cos(angle+j)*r,y:cy+Math.sin(angle+j)*r});
        }
      }
      if(pts.length){
        g.moveTo(pts[0].x,pts[0].y);
        for(const pt of pts.slice(1))g.lineTo(pt.x,pt.y);
        g.stroke({color:j%4===0?ctx.light:ctx.color,width:v===0?.9:1.3,alpha:.13+j*.011});
      }
    }
    for(const o of particles){
      const a=o.angle+t*(.6+o.speed);
      let x=cx+Math.cos(a)*R*o.r,y=cy+Math.sin(a)*R*o.r;
      if(v===1){o.x+=Math.cos(a)*o.speed*dt*3;o.y+=Math.sin(a)*o.speed*dt*3;if(o.x>ctx.w)o.x=0;if(o.y>ctx.h)o.y=0;x=o.x;y=o.y;}
      if(v===2){x=cx+Math.sin(a*4)*R*o.r;y=cy+Math.cos(a*3)*R*o.r;}
      if(v===3){x=cx+Math.cos(a*6)*R*o.r;y=cy+Math.sin(a*6)*R*o.r;}
      if(v===4){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy)+1,field=p.inside?Math.max(0,1-d/160):0;x+=dx/d*field*(120+impulse*150)*power;y+=dy/d*field*130*power;}
      o.sp.position.set(x,y);o.sp.alpha=.23+.66*Math.sin(a*2)**2;
    }
  }};
}
export const buildsC={dataFlow,spectrum,physics,abstract};
