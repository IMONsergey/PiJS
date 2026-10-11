// Static thumbnail rendering; no additional PixiJS application per card.
// Canvas 2D previews are illustrative sketches, not running GPU scenes.
const PI=Math.PI, TAU=PI*2;
const seed=n=>{let x=n*777+841;return ()=>((x=(x*1664525+1013904223)>>>0)/4294967296)};
const l=(a,b,t)=>a+(b-a)*t;

export function paintThumb(canvas,study) {
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)return;
  const W=320,H=220;
  canvas.width=W;canvas.height=H;
  const rand=seed(study.number),v=study.variant,col=study.accent;
  ctx.fillStyle='#0c1118';ctx.fillRect(0,0,W,H);
  let grad=ctx.createRadialGradient(W*.5,H*.45,5,W*.5,H*.5,230);
  grad.addColorStop(0,'#202934');grad.addColorStop(1,'#0d1117');
  ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  ctx.lineCap='round';ctx.lineJoin='round';
  const line=(points,stroke=col,width=1,alpha=.65)=>{
    if(!points.length)return;
    ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
    ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();ctx.globalAlpha=1;
  };
  const circle=(x,y,r,fill=col,alpha=.6)=>{ctx.globalAlpha=alpha;ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.globalAlpha=1;};
  const text=(t,size,x,y,fill='#dfe6dc')=>{ctx.fillStyle=fill;ctx.font='800 '+size+'px Arial, sans-serif';ctx.textAlign='center';ctx.fillText(t,x,y)};
  switch(study.family) {
    case 'typeWave': {
      const word=['FORM','TYPE','WAVE','MOVE','PULSE'][v];
      text(word,58,161,130,col);
      for(let i=0;i<word.length;i++)text(word[i],58,70+i*55,134+Math.sin(i+v)*24,'#e7e7df');
      break;
    }
    case 'typeOrbit': {
      for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(160,113,52+i*27,31+i*20,v*.14,0,TAU);ctx.strokeStyle=col;ctx.globalAlpha=.13+i*.10;ctx.stroke();ctx.globalAlpha=1;}
      const str='PIJS MOTION';for(let i=0;i<8;i++){const a=i/8*TAU+v*.12;text(str[i],32,160+Math.cos(a)*108,113+Math.sin(a)*54,col);}
      break;
    }
    case 'liquidLines': {
      for(let j=0;j<26;j++){const ps=[];for(let x=0;x<W+8;x+=7)ps.push([x,40+j*5.6+Math.sin(x*.026+j*.24+v)*12+Math.sin(x*.06+j*.15)*6]);line(ps,j%8===0?'#ffffff':col,.7,.08+j*.021);}
      break;
    }
    case 'shaderArt': {
      for(let y=0;y<H;y+=3){for(let x=0;x<W;x+=4){const f=Math.sin(x*.045+Math.sin(y*.03+v)*2)*Math.sin(y*.037+v);if(f>.32){ctx.globalAlpha=Math.max(.07,(f-.24)*.25);ctx.fillStyle=col;ctx.fillRect(x,y,4,3);}}}
      ctx.globalAlpha=1;text(['CHROMA','AURORA','METAL','ELECTRIC','PRISM'][v],23,160,120);
      break;
    }
    case 'particleDepth': {
      for(let i=0;i<400;i++){const a=rand()*TAU,r=Math.sqrt(rand())*220;circle(160+Math.cos(a)*r,110+Math.sin(a)*r*.65,.5+rand()*1.7,i%12===0?'#ffffff':col,.15+rand()*.65);}
      break;
    }
    case 'particleMorph': {
      for(let i=0;i<340;i++){const a=rand()*TAU,r=Math.sqrt(rand())*90,c=.6+.3*Math.sin(a*4+v);circle(160+Math.cos(a)*r*c,110+Math.sin(a)*r*.65,c*2,i%6===0?'#ffffff':col,.12+rand()*.72);}
      break;
    }
    case 'cursorMagnet': {
      for(let y=0;y<15;y++)for(let x=0;x<23;x++){
        const xx=30+x*11.5,yy=20+y*12.7,dx=xx-175,dy=yy-120,d=Math.hypot(dx,dy)+.1;
        const pull=Math.max(0,1-d/94)*(v%2?1:-1)*30;circle(xx+dx/d*pull,yy+dy/d*pull,1.2,col,.55);
      }
      break;
    }
    case 'cursorTrail': {
      const ps=[];for(let i=0;i<120;i++){const k=i/120;ps.push([W*.3+Math.sin(k*TAU*2+v)*W*.37*k,110+Math.cos(k*TAU*3+v)*65*k]);}
      line(ps,col,2,.8);for(let i=0;i<100;i+=2){const p=ps[i];circle(p[0],p[1],2*(1-i/100),col,.7-i*.005);}
      break;
    }
    case 'lineArt': {
      for(let j=0;j<36;j++){const ps=[];for(let x=0;x<W+5;x+=5)ps.push([x,20+j*5.4+Math.sin(x*.03+j*.33+v*.4)*15]);line(ps,col,.7,.08+j*.018);}
      break;
    }
    case 'geometryArt': {
      for(let j=0;j<9;j++){const ps=[],rr=15+j*11;for(let i=0;i<=120;i++){const a=i/120*TAU,r=rr*(1+.15*Math.sin(a*(4+v)+j*.4));ps.push([160+Math.cos(a)*r,110+Math.sin(a)*r*.72]);}line(ps,j%3===0?'white':col,1,.2+j*.055);}
      break;
    }
    case 'posterGallery': {
      for(let i=0;i<5;i++){ctx.save();ctx.translate(160+(i-2)*27,110+Math.sin(i+v)*17);ctx.rotate((i-2)*.1);ctx.globalAlpha=.5+i*.1;ctx.fillStyle=i%2===0?col:'#e0e4dc';ctx.fillRect(-38,-65,76,130);ctx.fillStyle='#101417';ctx.font='800 20px Arial';ctx.textAlign='center';ctx.fillText('0'+(i+1),0,0);ctx.restore();}
      ctx.globalAlpha=1;break;
    }
    case 'tileGallery': {
      for(let y=0;y<8;y++)for(let x=0;x<12;x++){ctx.save();ctx.translate(33+x*23,24+y*22);ctx.rotate(Math.sin(x*.4+y*.3+v)*.2);ctx.globalAlpha=.16+rand()*.62;ctx.fillStyle=(x+y+v)%5===0?'#ffffff':col;ctx.fillRect(-8,-7,16,15);ctx.restore();}
      ctx.globalAlpha=1;break;
    }
    case 'maskReveal': {
      ctx.fillStyle='#ebe5d4';ctx.fillRect(60,25,200,170);ctx.fillStyle='#1a252d';ctx.font='800 52px Arial';ctx.textAlign='center';ctx.fillText('REVEAL',160,128);
      ctx.save();ctx.beginPath();ctx.arc(160+v*8,108,40+v*9,0,TAU);ctx.clip();ctx.fillStyle=col;ctx.fillRect(40,10,240,200);ctx.fillStyle='#0c1015';ctx.fillText('REVEAL',160,128);ctx.restore();break;
    }
    case 'transition': {
      for(let i=0;i<12;i++){ctx.fillStyle=i%3===0?col:'#262f38';ctx.globalAlpha=.35+i*.04;const sw=320/12;ctx.fillRect(i*sw,0,sw+1,((i+v)%6)/6*H);}
      ctx.globalAlpha=1; text('CUT',62,160,125,'#ebece7');break;
    }
    case 'meshDepth': {
      ctx.save();ctx.translate(160,110);ctx.rotate((v-2)*.045);ctx.beginPath();ctx.moveTo(-103,-75);ctx.lineTo(111,-61+v*7);ctx.lineTo(88,71);ctx.lineTo(-124,74-v*6);ctx.closePath();ctx.fillStyle='#ddd4be';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#1a242d';ctx.font='800 44px Arial';ctx.textAlign='center';ctx.fillText('DEPTH',0,20);ctx.restore();break;
    }
    case 'spaceField': {
      for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse(160,110,17+i*13,10+i*8,(i%4)*.08,0,TAU);ctx.globalAlpha=.09+i*.016;ctx.strokeStyle=col;ctx.stroke();}
      ctx.globalAlpha=1;for(let i=0;i<21;i++){const a=rand()*TAU,r=rand()*130;circle(160+Math.cos(a)*r,110+Math.sin(a)*r*.68,1+rand()*3,col,.7);}break;
    }
    case 'dataFlow': {
      const nodes=[];for(let i=0;i<35;i++)nodes.push([25+rand()*270,16+rand()*182]);
      for(let i=0;i<35;i++)line([nodes[i],nodes[(i+7)%35]],col,.7,.12);
      for(let i=0;i<35;i++)circle(...nodes[i],1.4,col,.5+rand()*.5);
      break;
    }
    case 'spectrum': {
      for(let i=0;i<58;i++){const x=23+i*4.8,r=Math.abs(Math.sin(i*.43+v)*Math.cos(i*.12))*60+6;
      line([[x,110-r],[x,110+r]],i%8===0?'#fff':col,2,.45+rand()*.5);}
      break;
    }
    case 'physics': {
      for(let i=0;i<18;i++){const x=160+(i%6-2.5)*41,y=110+(Math.floor(i/6)-1)*46,rr=6+rand()*14;
        ctx.globalAlpha=.24+rand()*.5;ctx.fillStyle=i%5===0?'#fff':col;ctx.beginPath();
        if(i%2){ctx.rect(x-rr,y-rr,rr*2,rr*2);}else{ctx.arc(x,y,rr,0,TAU);}ctx.fill();}
      ctx.globalAlpha=1;break;
    }
    case 'abstract': {
      for(let j=0;j<11;j++){const ps=[];for(let k=0;k<95;k++){const a=k/95*TAU*2,r=(k/95)*112;ps.push([160+Math.cos(a*(2+v*.2)+j)*r,110+Math.sin(a*(2+v*.2)+j)*r*.72]);}line(ps,col,.75,.15+j*.038);}
      break;
    }
  }
  // Strictly decorative data; no external images.
  ctx.fillStyle='rgba(11,14,18,.6)';ctx.fillRect(12,H-27,112,17);
  ctx.fillStyle='#c4cfcb';ctx.font='700 9px Arial';ctx.textAlign='left';ctx.fillText('PIJS  /  '+study.id.replace('study-',''),20,H-16);
}
