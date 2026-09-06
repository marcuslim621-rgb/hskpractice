/* Mahjong recognition: each word is prompted once in a shuffled hand. */
let tileRound=null;
const tileMotion=new Set();
function stopTileMotion(){for(const animation of tileMotion)animation.cancel();tileMotion.clear();}
function moveTileElement(element,frames,options){
  if(!element||matchMedia('(prefers-reduced-motion: reduce)').matches)return null;
  const animation=element.animate(frames,options);tileMotion.add(animation);
  animation.finished.then(()=>tileMotion.delete(animation),()=>tileMotion.delete(animation));return animation;
}
function startTileRecognition(pool,label){
  const chosen=[],characters=new Set(),readings=new Set(),meanings=new Set();
  for(const w of shuffle([...pool])){
    const reading=pin(w[1]).trim().toLowerCase(),meaning=w[2].trim().toLowerCase();
    if(characters.has(w[0])||readings.has(reading)||meanings.has(meaning))continue;
    characters.add(w[0]);readings.add(reading);meanings.add(meaning);chosen.push(w);
    if(chosen.length===10)break;
  }
  if(!chosen.length){alert('No words available for this hand.');return;}
  const kinds=shuffle(chosen.map((_,i)=>i%2?'english':'pinyin'));
  tileRound={pool,label,hand:shuffle([...chosen]),questions:shuffle([...chosen]).map((w,i)=>({w,kind:kinds[i]})),i:0,results:[],matched:[],missed:false,answered:false,saved:false};
  if(!$('scr-recognition')){const screen=document.createElement('section');screen.id='scr-recognition';screen.className='screen';document.querySelector('.app').append(screen);}
  show('recognition');renderTileRecognition('deal');
}
function tilePile(){return `<div class="rt-pile" aria-label="${tileRound.matched.length} matched tiles">${tileRound.matched.map((w,i)=>`<div class="rt-tile" data-pile-index="${i}" style="left:${12+(i%5)*25}px;top:${Math.floor(i/5)*30+5}px;transform:rotate(${i%2?5:-4}deg)">${esc(w[0])}</div>`).join('')}</div>`;}
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
  const question=r.questions[r.i];
  screen.innerHTML=`<div class="rt-game"><header class="rt-head"><button class="rt-exit" type="button">← Leave hand</button><span>Hanzi Daily · Recognition</span></header><div class="rt-table"><div class="rt-wall" aria-hidden="true">${'<i></i>'.repeat(12)}</div><div class="rt-eyebrow">${done?'Hand complete':'Find it in your hand'}</div><h1>${done?'Nicely played.':question.kind==='pinyin'?'Match the pinyin':'Match the English meaning'}</h1><div class="rt-status"><span>${done?r.questions.length+' words practised':'Question '+(r.i+1)+' of '+r.questions.length}</span><span>${r.matched.length} tiles matched</span></div><progress max="${r.questions.length}" value="${r.matched.length}" aria-label="Words matched"></progress>${done?`<div class="rt-clue">${r.results.filter(v=>v.ok).length} / ${r.questions.length}</div><p class="rt-feedback">Correct on the first try. Your practice is saved.</p>`:`<div class="rt-clue">${esc(question.kind==='pinyin'?pin(question.w[1]):question.w[2])}</div><p class="rt-feedback" aria-live="polite">${r.answered?esc(question.w[0]+' · '+pin(question.w[1])+' · '+question.w[2]):'Pick the matching tile below.'}</p>`}<div class="rt-next-wrap">${done?'<button class="rt-next">Shuffle a new hand →</button>':r.answered?'<button class="rt-next">'+(r.i+1===r.questions.length?'Finish hand':'Next question →')+'</button>':''}</div>${tilePile()}<div class="rt-hand" style="--rt-letters:${Math.max(...r.hand.map(w=>w[0].length))}" aria-label="Character tiles">${r.hand.map((w,i)=>`<button class="rt-tile ${r.matched.includes(w)?'rt-matched':''}" data-hand-index="${i}" aria-label="Choose ${esc(w[0])}" ${done||r.answered||r.matched.includes(w)?'disabled':''}><span>${esc(w[0])}</span></button>`).join('')}</div><p class="rt-foot">${r.questions.length} tiles · mixed pinyin & English</p></div></div>`;
  screen.querySelector('.rt-exit').onclick=exitTileRecognition;
  const next=screen.querySelector('.rt-next');if(next)next.onclick=()=>{if(done){startTileRecognition(r.pool,r.label);return;}r.i++;r.answered=false;r.missed=false;if(r.i===r.questions.length)saveTileRecognition();renderTileRecognition();};
  screen.querySelectorAll('[data-hand-index]').forEach(button=>button.onclick=()=>{
    if(r!==tileRound||r.answered)return;const picked=r.hand[Number(button.dataset.handIndex)];
    if(picked!==question.w){r.missed=true;screen.querySelector('.rt-feedback').textContent=picked[0]+' is '+pin(picked[1])+' ('+picked[2]+'). Try another tile.';button.getAnimations().forEach(a=>a.cancel());moveTileElement(button,[{transform:'translateX(0)'},{transform:'translateX(-3px) rotate(-2deg)'},{transform:'translateX(3px) rotate(2deg)'},{transform:'translateX(0)'}],{duration:260,easing:'ease-out'});return;}
    const source=button.getBoundingClientRect();r.answered=true;r.matched.push(picked);r.results.push({c:wordKey(picked),ok:!r.missed});renderTileRecognition('answer');animateTileToPile(source,r.matched.length-1,picked[0]);
  });
  if(phase==='deal')screen.querySelectorAll('[data-hand-index]').forEach((tile,i)=>moveTileElement(tile,[{transform:'translateY(-28px) rotate(-8deg) scale(.92)',opacity:0},{transform:'translateY(2px) rotate(1deg)',opacity:1,offset:.8},{transform:'translateY(0) rotate(0)',opacity:1}],{duration:430,delay:i*35,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'}));
  if(phase!=='answer')moveTileElement(screen.querySelector('.rt-clue'),[{transform:'translateY(10px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:280,easing:'cubic-bezier(.2,.75,.25,1)'});
  if(done)screen.querySelectorAll('.rt-pile .rt-tile').forEach((tile,i)=>moveTileElement(tile,[{translate:'0 0'},{translate:'0 -7px',offset:.45},{translate:'0 0'}],{duration:380,delay:i*35,easing:'ease-in-out'}));
}
function animateTileToPile(source,index,text){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const screen=$('scr-recognition'),target=screen.querySelector('[data-pile-index="'+index+'"]');if(!target)return;
  const end=target.getBoundingClientRect(),base=screen.getBoundingClientRect(),flying=document.createElement('div');
  flying.className='rt-tile rt-flying';flying.textContent=text;flying.setAttribute('aria-hidden','true');Object.assign(flying.style,{left:source.left-base.left+'px',top:source.top-base.top+'px'});screen.append(flying);target.style.visibility='hidden';
  const pile=target.parentElement.getBoundingClientRect(),dx=pile.left+target.offsetLeft-source.left,dy=pile.top+target.offsetTop-source.top,angle=index%2?5:-4;
  const next=screen.querySelector('.rt-next');if(next)next.disabled=true;
  const animation=moveTileElement(flying,[{transform:`scale(${source.width/38},${source.height/50})`,filter:'brightness(1)'},{transform:`translate(${dx*.18}px,${dy*.25-18}px) scale(${source.width/38*1.08},${source.height/50*1.08}) rotate(-6deg)`,filter:'brightness(1.08)',offset:.25},{transform:`translate(${dx}px,${dy-5}px) rotate(${angle}deg)`,filter:'brightness(1)',offset:.82},{transform:`translate(${dx}px,${dy}px) rotate(${angle}deg)`}],{duration:560,easing:'cubic-bezier(.25,.65,.3,1)',fill:'forwards'});
  const finish=()=>{target.style.visibility='';flying.remove();if(next)next.disabled=false;};
  if(!animation){finish();return;}
  animation.finished.then(()=>{finish();moveTileElement(target,[{translate:'0 -2px'},{translate:'0 1px',offset:.5},{translate:'0 0'}],{duration:160,easing:'ease-out'});moveTileElement(next,[{transform:'translateY(4px)',opacity:.6},{transform:'translateY(0)',opacity:1}],{duration:180,easing:'ease-out'});},finish);
}
