/* Mahjong recognition: each word is prompted once in a shuffled hand. The rack
   holds one character per tile, so a multi-character word is answered by laying
   its characters out in order. */
let tileRound=null;
const tileMotion=new Set();
const RT_HAND_WORDS=5;
const RT_MAX_TILES=14; /* the rack wraps, but past this it stops reading as a hand */
function stopTileMotion(){for(const animation of tileMotion)animation.cancel();tileMotion.clear();}
function moveTileElement(element,frames,options){
  if(!element||matchMedia('(prefers-reduced-motion: reduce)').matches)return null;
  const animation=element.animate(frames,options);tileMotion.add(animation);
  animation.finished.then(()=>tileMotion.delete(animation),()=>tileMotion.delete(animation));return animation;
}
function startTileRecognition(pool,label){
  const chosen=[],characters=new Set(),readings=new Set(),meanings=new Set();
  let tiles=0;
  for(const w of shuffle([...pool])){
    const reading=pin(w[1]).trim().toLowerCase(),meaning=w[2].trim().toLowerCase();
    if(characters.has(w[0])||readings.has(reading)||meanings.has(meaning))continue;
    /* the cap only applies once the hand is playable, so a pool of long words
       still deals rather than failing */
    if(chosen.length>=3&&tiles+[...w[0]].length>RT_MAX_TILES)continue;
    characters.add(w[0]);readings.add(reading);meanings.add(meaning);
    chosen.push(w);tiles+=[...w[0]].length;
    if(chosen.length===RT_HAND_WORDS)break;
  }
  if(!chosen.length){alert('No words available for this hand.');return;}
  const kinds=shuffle(chosen.map((_,i)=>i%2?'english':'pinyin'));
  const rack=[];
  chosen.forEach((w,wi)=>[...w[0]].forEach((ch,ci)=>rack.push({id:wi+'-'+ci,ch})));
  tileRound={pool,label,hand:[...chosen],rack:shuffle(rack),staged:[],reject:null,
    questions:shuffle([...chosen]).map((w,i)=>({w,kind:kinds[i]})),
    i:0,results:[],matched:[],missed:false,answered:false,saved:false};
  if(!$('scr-recognition')){const screen=document.createElement('section');screen.id='scr-recognition';screen.className='screen';document.querySelector('.app').append(screen);}
  show('recognition');renderTileRecognition('deal');
}
/* The meld lays out in flow, grouped a word at a time. The tilt is kept inline
   because flyTileToMeld lands the flying tile on the same angle. */
function tileMeld(){
  const r=tileRound;let n=0;
  return `<div class="rt-meld" aria-label="${r.matched.length} words matched">${r.matched.map(w=>
    `<span class="rt-set">${[...w[0]].map(ch=>`<span class="rt-tile" data-meld-index="${n}" style="transform:rotate(${n++%2?4:-3}deg)">${esc(ch)}</span>`).join('')}</span>`
  ).join('')}</div>`;
}
/* One slot per character of the answer, so the word's length is visible up front. */
function tileStage(){
  const r=tileRound,len=[...r.questions[r.i].w[0]].length,out=[];
  for(let k=0;k<len;k++){
    const e=r.staged[k];
    out.push(e
      ?`<button class="rt-tile rt-staged${r.answered?' rt-won':''}" type="button" data-staged="${k}"${r.answered?' disabled':''} aria-label="${r.answered?esc(e.ch):'Take back '+esc(e.ch)}">${esc(e.ch)}</button>`
      :`<span class="rt-slot" aria-hidden="true"></span>`);
  }
  return `<div class="rt-stage" aria-label="Your answer, ${len} character${len===1?'':'s'}">${out.join('')}</div>`;
}
function saveTileRecognition(){
  const r=tileRound;if(!r||r.saved||!r.results.length)return;r.saved=true;
  const ok=r.results.filter(v=>v.ok).length,bad=r.results.length-ok;
  const hist=store.get('hsk_history',[]);hist.unshift({t:Date.now(),label:r.label,ok,bad,words:r.results});store.set('hsk_history',hist.slice(0,200));
  recordWordStats(r.results,'guessing');bumpStreak();recordBest(r.label,ok,bad);
  const seen=store.get('hsk_seen',{});r.results.forEach(v=>seen[v.c]=(seen[v.c]||0)+1);store.set('hsk_seen',seen);
}
function exitTileRecognition(){stopTileMotion();saveTileRecognition();tileRound=null;show('home');}
function renderTileRecognition(phase='question'){
  stopTileMotion();
  const r=tileRound,screen=$('scr-recognition'),done=r.i===r.questions.length;
  const question=done?null:r.questions[r.i];
  /* the rack empties one question before the hand formally ends, so it collapses
     on "every tile laid" rather than on `done` — otherwise it leaves a gap */
  const spent=!r.rack.length;
  screen.innerHTML=`<div class="rt-game${done?' rt-done':''}${spent?' rt-spent':''}"><header class="rt-head"><button class="rt-exit" type="button">← Leave hand</button><span>Hanzi Daily · Recognition</span></header><div class="rt-table"><div class="rt-wall" aria-hidden="true">${'<i></i>'.repeat(r.questions.length-r.matched.length)}</div><div class="rt-eyebrow">${done?'Hand complete':'Lay it out in order'}</div><h1>${done?'Nicely played.':question.kind==='pinyin'?'Match the pinyin':'Match the English meaning'}</h1><div class="rt-status"><span>${done?r.questions.length+' words practised':'Question '+(r.i+1)+' of '+r.questions.length}</span><span>${r.matched.length} of ${r.questions.length} laid</span></div><progress max="${r.questions.length}" value="${r.matched.length}" aria-label="Words matched"></progress><div class="rt-center">${done
    ?`<div class="rt-clue">${r.results.filter(v=>v.ok).length} / ${r.questions.length}</div><p class="rt-feedback">matched on the first try · practice saved</p>`
    :`<div class="rt-clue">${esc(question.kind==='pinyin'?pin(question.w[1]):question.w[2])}</div>${tileStage()}<p class="rt-feedback${r.answered&&!r.missed?' is-hit':r.reject?' is-miss':''}" aria-live="polite">${r.answered?esc(question.w[0]+' · '+pin(question.w[1])+' · '+question.w[2]):r.reject?esc(r.reject)+' is not it. Try again.':'Tap or drag characters into the slots, in order.'}</p>`
  }</div>${tileMeld()}<div class="rt-next-wrap">${done?'<button class="rt-next">Shuffle a new hand →</button>':r.answered?'<button class="rt-next">'+(r.i+1===r.questions.length?'Finish hand':'Next question →')+'</button>':''}</div><div class="rt-hand" aria-label="Character tiles">${r.rack.map((e,i)=>{const inUse=r.staged.includes(e);return `<button class="rt-tile${inUse?' rt-inuse':''}" type="button" data-rack-index="${i}" aria-label="Choose ${esc(e.ch)}"${done||r.answered||inUse?' disabled':''}>${esc(e.ch)}</button>`}).join('')}</div><p class="rt-foot">${r.questions.length} words · mixed pinyin & English</p></div></div>`;
  screen.querySelector('.rt-exit').onclick=exitTileRecognition;
  const next=screen.querySelector('.rt-next');
  if(next)next.onclick=()=>{
    if(done){startTileRecognition(r.pool,r.label);return;}
    meldStandingWord(r,screen,()=>{
      r.i++;r.answered=false;r.missed=false;r.reject=null;
      if(r.i===r.questions.length)saveTileRecognition();
      renderTileRecognition();
    });
  };
  screen.querySelectorAll('[data-staged]').forEach(button=>{
    button.onclick=()=>{if(r!==tileRound||r.answered)return;r.staged.splice(Number(button.dataset.staged),1);r.reject=null;renderTileRecognition('stage');};
  });
  screen.querySelectorAll('[data-rack-index]').forEach(button=>{
    /* a tap flies from the tile's place in the rack; a drop flies from where it
       was let go, so both gestures land the same way */
    const stage=from=>stageTile(r,Number(button.dataset.rackIndex),screen,from||button.getBoundingClientRect());
    wireTileDrag(button,stage,screen);
  });
  if(phase==='deal')screen.querySelectorAll('[data-rack-index]').forEach((tile,i)=>moveTileElement(tile,[{transform:'translateY(-28px) rotate(-8deg) scale(.92)',opacity:0},{transform:'translateY(2px) rotate(1deg)',opacity:1,offset:.8},{transform:'translateY(0) rotate(0)',opacity:1}],{duration:430,delay:i*30,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'}));
  if(phase==='question')moveTileElement(screen.querySelector('.rt-clue'),[{transform:'translateY(10px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:280,easing:'cubic-bezier(.2,.75,.25,1)'});
  if(done)screen.querySelectorAll('.rt-meld .rt-tile').forEach((tile,i)=>moveTileElement(tile,[{translate:'0 0'},{translate:'0 -7px',offset:.45},{translate:'0 0'}],{duration:380,delay:i*35,easing:'ease-in-out'}));
}
function stageTile(r,rackIndex,screen,from){
  if(r!==tileRound||r.answered)return;
  const entry=r.rack[rackIndex],question=r.questions[r.i],target=[...question.w[0]];
  if(!entry||r.staged.includes(entry)||r.staged.length>=target.length)return;
  r.staged.push(entry);r.reject=null;
  const slot=r.staged.length-1,complete=r.staged.length===target.length;
  renderTileRecognition('stage');
  /* the word is only judged once the last tile has actually landed in its slot */
  flyTile(from,screen.querySelector(`[data-staged="${slot}"]`),{duration:340,done:()=>{
    if(complete&&r===tileRound&&!r.answered)resolveStagedWord(r,screen);
  }});
}
function resolveStagedWord(r,screen){
  const question=r.questions[r.i];
  if(r.staged.map(e=>e.ch).join('')!==question.w[0]){
    r.missed=true;r.reject=r.staged.map(e=>e.ch).join('');
    /* leave the wrong word standing for a beat so it can be read, then take it back */
    renderTileRecognition('stage');
    screen.querySelectorAll('.rt-staged').forEach(t=>moveTileElement(t,[{transform:'translateX(0)'},{transform:'translateX(-3px) rotate(-2deg)'},{transform:'translateX(3px) rotate(2deg)'},{transform:'translateX(0)'}],{duration:260,easing:'ease-out'}));
    setTimeout(()=>{if(r!==tileRound||r.answered||!r.staged.length)return;r.staged=[];renderTileRecognition('stage');},700);
    return;
  }
  /* Correct: the word stays standing in its slots and spins to show it is
     locked in. It is not melded here — that happens on the way to the next
     question, so `matched` (and with it the wall and the progress bar) only
     advances when the tiles actually come down. */
  r.answered=true;r.results.push({c:wordKey(question.w),ok:!r.missed});
  r.rack=r.rack.filter(e=>!r.staged.includes(e));
  renderTileRecognition('answer');
  /* The tile jumps, turning left to right (rotateY) on the way up, then bounces
     twice more in decreasing arcs. Translate before rotate, so the jump stays
     vertical on screen rather than being carried around by the turn. The spin
     finishes as it first lands, so the squash-and-stretch after that happens
     face-on where it reads. Easing lives on the keyframes rather than the
     options: rises decelerate and falls accelerate, which is what makes it
     read as gravity instead of a float. */
  const RISE='cubic-bezier(.22,.6,.4,1)',FALL='cubic-bezier(.55,0,.85,.45)';
  screen.querySelectorAll('.rt-staged').forEach((tile,i)=>moveTileElement(tile,[
    {transform:'translateY(0) rotateY(0deg) scale(1,1)',easing:RISE},
    {transform:'translateY(-30px) rotateY(200deg) scale(1.06,1.06)',offset:.28,easing:FALL},
    {transform:'translateY(0) rotateY(360deg) scale(1.09,.91)',offset:.5,easing:RISE},
    {transform:'translateY(-14px) rotateY(360deg) scale(.97,1.05)',offset:.63,easing:FALL},
    {transform:'translateY(0) rotateY(360deg) scale(1.05,.95)',offset:.77,easing:RISE},
    {transform:'translateY(-5px) rotateY(360deg) scale(.99,1.02)',offset:.88,easing:FALL},
    {transform:'translateY(0) rotateY(360deg) scale(1.03,.97)',offset:.95,easing:'cubic-bezier(.3,.5,.5,1)'},
    {transform:'translateY(0) rotateY(360deg) scale(1,1)'}
  ],{duration:820,delay:i*140,easing:'linear',fill:'backwards'}));
}
/* Lays the standing word into the meld, then moves on. Called from the Next
   button, which is the only way out of an answered question. */
function meldStandingWord(r,screen,after){
  /* a tile caught mid-spin measures as a squashed box, so settle the spin
     before reading where the tiles are */
  const sources=r.staged.map((_,k)=>{
    const t=screen.querySelector(`[data-staged="${k}"]`);
    if(!t)return null;
    t.getAnimations().forEach(a=>a.cancel());
    return t.getBoundingClientRect();
  });
  const meldStart=r.matched.reduce((n,w)=>n+[...w[0]].length,0);
  r.matched.push(r.questions[r.i].w);r.staged=[];
  after();
  animateTilesToMeld(sources,meldStart);
}
function wireTileDrag(button,submit,screen){
  let drag=null,suppressClick=false;
  button.onclick=()=>{if(suppressClick){suppressClick=false;return;}submit();};
  button.onpointerdown=e=>{
    if(button.disabled||e.button!==0||drag)return;
    button.getAnimations().forEach(a=>a.cancel());
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,source:button.getBoundingClientRect(),moved:false};
    button.setPointerCapture(e.pointerId);
  };
  button.onpointermove=e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)<6)return;
    if(!drag.moved){drag.moved=true;suppressClick=true;screen.classList.add('rt-lifting');drag.clone=button.cloneNode(true);drag.clone.removeAttribute('data-rack-index');drag.clone.disabled=true;drag.clone.className='rt-tile rt-dragging';drag.clone.setAttribute('aria-hidden','true');const base=screen.getBoundingClientRect();Object.assign(drag.clone.style,{left:drag.source.left-base.left+'px',top:drag.source.top-base.top+'px',width:drag.source.width+'px',height:drag.source.height+'px'});screen.append(drag.clone);button.style.opacity='.15';}
    drag.clone.style.transform=`translate(${dx}px,${dy}px) rotate(${Math.max(-5,Math.min(5,dx/20))}deg)`;
    const zone=screen.querySelector('.rt-center'),rect=zone.getBoundingClientRect();
    drag.over=e.clientX>=rect.left-12&&e.clientX<=rect.right+12&&e.clientY>=rect.top-12&&e.clientY<=rect.bottom+12;
    zone.classList.toggle('rt-drop-ready',drag.over);
  };
  const finish=(e,cancelled)=>{
    if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;
    button.style.opacity='';screen.classList.remove('rt-lifting');screen.querySelector('.rt-center')?.classList.remove('rt-drop-ready');
    if(button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId);
    if(!d.moved)return;
    if(!cancelled&&d.over){const from=d.clone.getBoundingClientRect();d.clone.remove();submit(from);}else{
      const motion=moveTileElement(d.clone,[{transform:d.clone.style.transform},{transform:'translate(0,0) rotate(0)'}],{duration:220,easing:'cubic-bezier(.2,.75,.25,1)'});
      if(motion)motion.finished.then(()=>d.clone.remove(),()=>d.clone.remove());else d.clone.remove();
    }
    setTimeout(()=>{suppressClick=false;},0);
  };
  button.onpointerup=e=>finish(e,false);button.onpointercancel=e=>finish(e,true);button.onlostpointercapture=e=>finish(e,true);
}
function animateTilesToMeld(sources,startIndex){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const screen=$('scr-recognition'),next=screen.querySelector('.rt-next');
  let pending=sources.length;
  if(next&&pending)next.disabled=true;
  const release=()=>{if(--pending<=0&&next)next.disabled=false;};
  sources.forEach((source,k)=>flyTileToMeld(source,startIndex+k,release));
}
/* Sends a tile from wherever it currently is to wherever it has just been
   rendered: rack to slot on a tap, drop point to slot on a drag, slot to meld
   once a word resolves. The destination element is already in place — it is
   hidden, flown to, then revealed — so the flight can never land off-target.
   offsetLeft/Top are used rather than the destination's rect because they
   ignore its tilt; `done` always runs, animation or not. */
function flyTile(source,target,opts){
  const {angle=0,duration=340,done}=opts||{};
  const settleDone=()=>{if(done)done()};
  if(!source||!target||matchMedia('(prefers-reduced-motion: reduce)').matches){settleDone();return;}
  const screen=$('scr-recognition'),parent=target.offsetParent||screen;
  const parentRect=parent.getBoundingClientRect(),base=screen.getBoundingClientRect();
  const flying=document.createElement('div');
  flying.className='rt-tile rt-flying';flying.textContent=target.textContent;flying.setAttribute('aria-hidden','true');
  Object.assign(flying.style,{left:source.left-base.left+'px',top:source.top-base.top+'px',width:source.width+'px',height:source.height+'px'});
  screen.append(flying);target.style.visibility='hidden';
  const dx=parentRect.left+target.offsetLeft-source.left,dy=parentRect.top+target.offsetTop-source.top;
  const sx=target.offsetWidth/source.width,sy=target.offsetHeight/source.height;
  const lift=Math.min(24,Math.max(9,Math.hypot(dx,dy)*.13)); /* longer throws arc higher */
  const animation=moveTileElement(flying,[
    {transform:'translate(0,0) scale(1,1) rotate(0deg)',filter:'brightness(1)'},
    {transform:`translate(${dx*.45}px,${dy*.45-lift}px) scale(${sx*1.07},${sy*1.07}) rotate(${angle*.4-4}deg)`,filter:'brightness(1.07)',offset:.5},
    {transform:`translate(${dx}px,${dy-4}px) scale(${sx},${sy}) rotate(${angle}deg)`,filter:'brightness(1)',offset:.85},
    {transform:`translate(${dx}px,${dy}px) scale(${sx},${sy}) rotate(${angle}deg)`}
  ],{duration,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'});
  const settle=()=>{target.style.visibility='';flying.remove();settleDone()};
  if(!animation){settle();return;}
  animation.finished.then(()=>{settle();moveTileElement(target,[{translate:'0 -2px'},{translate:'0 1px',offset:.5},{translate:'0 0'}],{duration:150,easing:'ease-out'});},settle);
}
function flyTileToMeld(source,index,release){
  const meld=$('scr-recognition').querySelector('.rt-meld');
  flyTile(source,meld&&meld.querySelector('[data-meld-index="'+index+'"]'),
    {angle:index%2?4:-3,duration:520,done:release});
}
