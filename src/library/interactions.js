import { asset } from './catalog.js';

const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const float=(e,el)=>{const r=el.getBoundingClientRect();return {x:(e.clientX-r.left)/Math.max(r.width,1),y:(e.clientY-r.top)/Math.max(r.height,1)};};
const add=(el,event,fn,opt,cleanup)=>{if(!el)return;el.addEventListener(event,fn,opt);cleanup.push(()=>el.removeEventListener(event,fn,opt));};
const query=(el,s)=>el.querySelector(s);
const queryAll=(el,s)=>[...el.querySelectorAll(s)];

export function mountInteractions(root,item,{notify=()=>{},power=()=>.65}={}) {
  const disposers=[],timers=new Set(),timeouts=new Set();
  const later=(fn,ms)=>{const t=setTimeout(()=>{timeouts.delete(t);fn();},ms);timeouts.add(t);return t;};
  const every=(fn,ms)=>{const t=setInterval(fn,ms);timers.add(t);return t;};
  const id=item.id;
  const actions=queryAll(root,'[data-action=cta]');
  for(const b of actions){
    add(b,'click',()=>{
      const label=query(b,'span:first-child');
      if(!label)return;
      const before=label.textContent;
      label.textContent='Added to shortlist';
      later(()=>{if(b.isConnected)label.textContent=before;},1250);
    },undefined,disposers);
  }

  if(id==='edge-beam'||id==='light-sweep'){
    const b=query(root,id==='edge-beam'?'.edge-cta':'.sweep-button');
    add(b,'pointermove',e=>{
      const p=float(e,b);
      b.style.setProperty('--mx',p.x*100+'%');
      b.style.setProperty('--my',p.y*100+'%');
    },undefined,disposers);
  }
  if(id==='magnetic-cta'){
    const b=query(root,'.magnetic-cta');
    add(b,'pointermove',e=>{
      const p=float(e,b);
      b.style.transform='translate('+(p.x-.5)*20*power()+'px,'+(p.y-.5)*15*power()+'px)';
    },undefined,disposers);
    add(b,'pointerleave',()=>b.style.transform='',undefined,disposers);
  }
  if(id==='spotlight-card'){
    const card=query(root,'.spotlight-panel');
    add(card,'pointermove',e=>{
      const p=float(e,card);
      card.style.setProperty('--px',p.x*100+'%');
      card.style.setProperty('--py',p.y*100+'%');
      card.style.transform='perspective(900px) rotateX('+(.5-p.y)*4*power()+'deg) rotateY('+(p.x-.5)*-4*power()+'deg)';
    },undefined,disposers);
    add(card,'pointerleave',()=>{card.style.transform='';},undefined,disposers);
  }
  if(id==='depth-portrait'||id==='glass-editorial'){
    const card=query(root,'[data-card-tilt]');
    add(root,'pointermove',e=>{
      const p=float(e,root);
      const x=(p.x-.5)*7*power(),y=(.5-p.y)*7*power();
      if(id==='depth-portrait'){
        card.style.setProperty('--rx',y+'deg');
        card.style.setProperty('--ry',x+'deg');
      } else card.style.transform='translate('+x*2+'px,'+y*1.5+'px)';
    },undefined,disposers);
    add(root,'pointerleave',()=>{card.style.transform='';card.style.removeProperty('--rx');card.style.removeProperty('--ry');},undefined,disposers);
  }
  if(id==='reveal-project'){
    const card=query(root,'.project-reveal');
    add(query(root,'[data-action=card]'),'click',()=>card.classList.toggle('is-expanded'),undefined,disposers);
    add(card,'pointerleave',()=>card.classList.remove('is-expanded'),undefined,disposers);
  }
  if(id==='pricing-dial'){
    const buttons=queryAll(root,'[data-price-option]'),price=query(root,'[data-price]');
    buttons.forEach(button=>add(button,'click',()=>{
      buttons.forEach(b=>b.classList.toggle('is-active',b===button));
      price.textContent=button.dataset.priceOption==='yearly'?'23':'29';
    },undefined,disposers));
  }
  if(id==='metric-card'){
    const metric=query(root,'[data-metric]'),line=query(root,'.metric-line');
    let turn=0;
    add(query(root,'[data-action=metric]'),'click',()=>{
      turn++;
      metric.textContent='$'+(148920+turn*840).toLocaleString('en-US');
      line.style.animation='none';void line.getBoundingClientRect();line.style.animation='';
    },undefined,disposers);
  }

  if(id==='masked-headline'||id==='chrome-type'){
    const target=id==='masked-headline'?query(root,'.type-mask-layer'):query(root,'.chrome-word');
    add(root,'pointermove',e=>{
      const p=float(e,root);
      if(id==='masked-headline'){
        target.style.setProperty('--px',p.x*100+'%');
        target.style.setProperty('--py',p.y*100+'%');
        target.style.setProperty('--reveal',20+power()*28+'%');
      }else target.style.setProperty('--shine',(p.x*100)+'%');
    },undefined,disposers);
  }
  if(id==='elastic-type'){
    const word=query(root,'[data-elastic]');
    word.innerHTML=[...word.textContent].map(ch=>'<span aria-hidden="true">'+ch+'</span>').join('');
    word.setAttribute('aria-label','STRETCH');
    const letters=queryAll(word,'span');
    const respond=e=>{
      const r=word.getBoundingClientRect();
      letters.forEach(letter=>{
        const b=letter.getBoundingClientRect(),center=(b.left+b.right)/2,dist=Math.abs(e.clientX-center),
          influence=clamp(1-dist/190,0,1)*power();
        letter.style.setProperty('--ty',-influence*27+'px');
        letter.style.setProperty('--sc',1+influence*.17);
        letter.style.setProperty('--rot',((e.clientY-r.top)/r.height-.5)*influence*11+'deg');
      });
    };
    add(root,'pointermove',respond,undefined,disposers);
    add(root,'pointerleave',()=>letters.forEach(l=>{l.style.removeProperty('--ty');l.style.removeProperty('--sc');l.style.removeProperty('--rot');}),undefined,disposers);
  }
  if(id==='split-reveal'){
    const group=query(root,'.reveal-words');
    const replay=()=>{group.classList.remove('is-playing');void group.offsetWidth;group.classList.add('is-playing');};
    add(query(root,'[data-action=reveal]'),'click',replay,undefined,disposers);replay();
  }
  if(id==='scramble-title'){
    const el=query(root,'[data-decode]'),end='DISCOVER',pool='WXYZ▢□01<>@#%';
    let handle=null;
    const start=()=>{
      if(handle){clearInterval(handle);timers.delete(handle);}
      let step=0;
      handle=every(()=>{
        step++;
        el.textContent=[...end].map((ch,i)=>{
          if(i<step/2.7)return ch;
          return pool[Math.floor(Math.random()*pool.length)];
        }).join('');
        if(step>25){el.textContent=end;clearInterval(handle);timers.delete(handle);handle=null;}
      },42);
    };
    add(query(root,'[data-action=decode]'),'click',start,undefined,disposers);start();
  }
  if(id==='number-drum'){
    const el=query(root,'[data-counter]'),value=[24600,32500,18480,48620],start=performance.now();
    let seq=0;
    const change=()=>{
      seq++;
      const to=value[seq%value.length],from=Number(el.textContent.replaceAll(',',''))||24600,t0=performance.now(),duration=820;
      function frame(now){
        if(!el.isConnected)return;
        const t=clamp((now-t0)/duration,0,1),ease=1-(1-t)**3;
        el.textContent=Math.round(from+(to-from)*ease).toLocaleString('en-US');
        if(t<1)raf=requestAnimationFrame(frame);
      }
      let raf=requestAnimationFrame(frame);disposers.push(()=>cancelAnimationFrame(raf));
    };
    add(query(root,'[data-action=counter]'),'click',change,undefined,disposers);
  }

  const galleries=['depth-gallery','elastic-rail','cover-stack','editorial-grid','focus-filmstrip'];
  if(galleries.includes(id)){
    let index=0,originX=null;
    const slides=queryAll(root,'.depth-slide img'), rail=query(root,'.rail-track'),
      covers=queryAll(root,'.cover img'),images=queryAll(root,'[data-image]'),
      feature=query(root,'[data-image-feature] img');
    const update=()=>{
      if(slides.length)slides.forEach((img,i)=>img.src=asset((index+i+8)%8));
      if(rail){
        rail.style.setProperty('--rail-x',-(index%3)*218+'px');
        if(index%3===2)rail.style.setProperty('--rail-x','-400px');
      }
      if(covers.length)covers.forEach((img,i)=>img.src=asset((index+i+5)%8));
      if(feature&&images.length){
        const selected=images[index%images.length];
        if(selected){
          feature.src=asset(Number(selected.dataset.image));
          images.forEach(btn=>btn.classList.toggle('is-active',btn===selected));
        }
      }
      queryAll(root,'[data-gallery-index]').forEach(el=>el.textContent=String(index+1).padStart(2,'0')+' / 08');
    };
    queryAll(root,'[data-step]').forEach(button=>add(button,'click',()=>{index=(index+8+Number(button.dataset.step))%8;update();},undefined,disposers));
    images.forEach((button,i)=>add(button,'click',()=>{index=i;update();},undefined,disposers));
    queryAll(root,'.cover').forEach(button=>add(button,'click',()=>{index=(index+1)%8;update();},undefined,disposers));
    const draggable=query(root,'[data-gallery]');
    if(draggable){
      add(draggable,'pointerdown',e=>{originX=e.clientX;draggable.style.cursor='grabbing';},undefined,disposers);
      add(window,'pointerup',e=>{
        if(originX!==null){
          const dx=e.clientX-originX;originX=null;draggable.style.cursor='';
          if(Math.abs(dx)>45){index=(index+(dx<0?1:7))%8;update();}
        }
      },undefined,disposers);
    }
    update();
  }
  if(id==='image-aperture'){
    const mask=query(root,'.aperture-front');
    add(root,'pointermove',e=>{
      const p=float(e,root);
      mask.style.setProperty('--px',p.x*100+'%');mask.style.setProperty('--py',p.y*100+'%');
      mask.style.setProperty('--hole',(12+power()*28)+'%');
    },undefined,disposers);
  }

  if(id==='upload-studio'){
    const zone=query(root,'[data-upload-zone]'),input=query(root,'[data-file-input]'),
    status=query(root,'[data-upload-status]'),title=query(root,'[data-upload-title]'),
    details=query(root,'[data-upload-details]'),bar=query(root,'[data-upload-progress]'),
    percent=query(root,'[data-upload-percent]'),name=query(root,'[data-upload-name]');
    let upload=null;
    const handleFile=file=>{
      if(!file)return;
      if(upload){clearInterval(upload);timers.delete(upload);upload=null;}
      const allowed=['application/pdf','image/jpeg','image/png'];
      const valid=allowed.includes(file.type)||/\.(pdf|jpe?g|png)$/i.test(file.name);
      if(!valid||file.size>8*1024*1024){
        title.textContent='File not supported';
        details.textContent='Choose a PDF, JPG or PNG up to 8 MB';
        status.hidden=true;return;
      }
      title.textContent='Ready to preview';details.textContent='Local UI simulation — no server upload';
      name.textContent=file.name;status.hidden=false;
      let value=0;bar.style.width='0%';percent.textContent='0%';
      upload=every(()=>{
        value=Math.min(100,value+5+Math.round(Math.random()*13));
        bar.style.width=value+'%';percent.textContent=value+'%';
        if(value===100){clearInterval(upload);timers.delete(upload);upload=null;percent.textContent='Ready';}
      },160);
    };
    add(input,'change',e=>handleFile(e.target.files[0]),undefined,disposers);
    add(zone,'dragover',e=>{e.preventDefault();zone.classList.add('is-dragged');},undefined,disposers);
    add(zone,'dragleave',()=>zone.classList.remove('is-dragged'),undefined,disposers);
    add(zone,'drop',e=>{e.preventDefault();zone.classList.remove('is-dragged');handleFile(e.dataTransfer?.files[0]);},undefined,disposers);
  }
  if(id==='orbit-loader'){
    let value=72,running=false;
    const el=query(root,'[data-loader-value]');
    add(query(root,'[data-action=loader]'),'click',()=>{
      if(running)return;
      value=0;running=true;el.textContent='0%';
      const timer=every(()=>{
        value=Math.min(100,value+4);
        el.textContent=value+'%';
        if(value>=100){clearInterval(timer);timers.delete(timer);running=false;}
      },85);
    },undefined,disposers);
  }
  if(id==='command-search'){
    const input=query(root,'[data-command-input]'),results=query(root,'[data-command-results]');
    const cmds=[['Open dashboard','↗','Navigation'],['Create a new project','+','Action'],['Search across workspace','⌕','Search'],['View account settings','⚙','Settings'],['Export activity report','↓','Export']];
    let focus=0,visible=cmds;
    const draw=()=>{
      const q=input.value.trim().toLowerCase();
      visible=cmds.filter(c=>c[0].toLowerCase().includes(q));
      focus=0;
      results.innerHTML=visible.length?visible.map((c,i)=>'<button class="command-row '+(i===focus?'is-active':'')+'" data-command-index="'+i+'"><span class="command-icon">'+c[1]+'</span><span>'+c[0]+'</span><small>'+c[2]+'</small></button>').join(''):'<div class="command-no-results">No commands found.</div>';
    };
    draw();
    add(input,'input',draw,undefined,disposers);
    add(input,'keydown',e=>{
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){
        e.preventDefault();if(!visible.length)return;
        focus=(focus+(e.key==='ArrowDown'?1:visible.length-1))%visible.length;
        queryAll(results,'.command-row').forEach((r,i)=>r.classList.toggle('is-active',i===focus));
      }
      if(e.key==='Enter'&&visible[focus]){e.preventDefault();notify(visible[focus][0]);input.value='';draw();}
    },undefined,disposers);
    add(results,'click',e=>{const row=e.target.closest('.command-row');if(row){notify(visible[Number(row.dataset.commandIndex)]?.[0]||'Command selected');input.value='';draw();}},undefined,disposers);
  }
  if(id==='signal-toggle'){
    const switchEl=query(root,'[data-toggle-switch]'),container=query(root,'.toggle-shell'),
    detail=query(root,'[data-toggle-detail]'),title=query(root,'[data-toggle-title]');
    add(switchEl,'click',()=>{
      const checked=switchEl.getAttribute('aria-checked')!=='true';
      switchEl.setAttribute('aria-checked',String(checked));
      container.classList.toggle('is-enabled',checked);
      detail.textContent=checked?'Enabled':'Disabled';
      title.textContent=checked?'You’re in focus':'Ambient focus';
    },undefined,disposers);
  }
  if(id==='live-chart'){
    const svg=query(root,'[data-ui-chart]'),path=query(root,'[data-chart-line]'),fill=query(root,'[data-chart-fill]'),
    value=query(root,'[data-chart-value]'),point=query(root,'[data-chart-point]');
    const values=[136,128,132,102,111,75,89,68,78,36,57,22,42,32,16];
    const curve=()=>{
      const line=values.map((v,i)=>(i?'L':'M')+(i/(values.length-1)*560).toFixed(1)+' '+v.toFixed(1)).join(' ');
      path.setAttribute('d',line);fill.setAttribute('d',line+' L560 198 L0 198 Z');
    };
    curve();
    add(svg,'pointermove',e=>{
      const rect=svg.getBoundingClientRect(),index=clamp(Math.round((e.clientX-rect.left)/rect.width*(values.length-1)),0,values.length-1);
      point.setAttribute('cx',String(index/(values.length-1)*560));
      point.setAttribute('cy',String(values[index]));
      value.textContent='$'+(42860+index*460).toLocaleString('en-US');
    },undefined,disposers);
    add(svg,'pointerleave',()=>value.textContent='$42,860',undefined,disposers);
  }
  if(id==='toast-stack'){
    const stack=query(root,'[data-toast-stack]');
    let count=0;
    add(query(root,'[data-action=toast]'),'click',()=>{
      count++;
      const el=document.createElement('div');el.className='toast-item';
      el.innerHTML='<span>✓</span><strong>Changes saved successfully</strong><button aria-label="Dismiss notification">×</button>';
      stack.prepend(el);
      el.querySelector('button').addEventListener('click',()=>el.remove());
      later(()=>el.remove(),3700);
      if(stack.children.length>3)stack.lastElementChild.remove();
    },undefined,disposers);
  }
  return ()=>{
    disposers.forEach(fn=>{try{fn();}catch{}});
    for(const timer of timers)clearInterval(timer);
    for(const timer of timeouts)clearTimeout(timer);
  };
}
