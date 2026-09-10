/* Sound effects, synthesised rather than loaded. The app ships no external
   assets and works offline, so a few oscillators beat a folder of audio files:
   nothing to download, nothing to cache, and the clack can be retuned by
   changing a number.

   A mahjong tile is bone or bamboo struck on a wooden table, which is a noise
   transient plus a couple of quickly-decaying woody partials — that is what
   clack() builds. The musical cues use a pentatonic scale, which is both the
   scale most Chinese folk music sits in and, conveniently, one where any
   combination of notes is consonant. */
let sfxCtx=null,sfxMaster=null,sfxNoise=null;
let sfxOn=true;
const SFX_PENT=[523.25,587.33,659.25,783.99,880.00,1046.50]; /* C5 D5 E5 G5 A5 C6 */
function sfxReady(){
  if(!sfxOn)return null;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return null;
  if(!sfxCtx){
    sfxCtx=new AC();
    sfxMaster=sfxCtx.createGain();
    sfxMaster.gain.value=.55; /* peaks land near -14dBFS, clear of clipping */
    sfxMaster.connect(sfxCtx.destination);
    const n=Math.floor(sfxCtx.sampleRate*.2);
    sfxNoise=sfxCtx.createBuffer(1,n,sfxCtx.sampleRate);
    const d=sfxNoise.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  }
  /* browsers park the context until a gesture touches it; every cue here is
     downstream of a tap, so resuming on use is enough */
  if(sfxCtx.state==='suspended')sfxCtx.resume();
  return sfxCtx;
}
function sfxTone(freq,at,dur,gain,type){
  const ctx=sfxCtx,t=ctx.currentTime+at;
  const osc=ctx.createOscillator(),g=ctx.createGain();
  osc.type=type||'triangle';
  osc.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(gain,t+.014);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  osc.connect(g).connect(sfxMaster);
  osc.start(t);osc.stop(t+dur+.02);
}
/* Marble rather than wood. Three things separate them, and all three matter:
   stone rings far higher; its modes are inharmonic (the 1 : 2.76 : 5.40 of a
   struck free bar, which is why a tapped stone reads as a "tock" and not as a
   note); and it barely damps, so it holds its pitch and rings on, where wood
   thuds and bends flat as it dies. Sines, not triangles — the hardness lives in
   the contact tick, and triangle harmonics on top of it just muddy the ring. */
const SFX_STONE_MODES=[[1,.40,1],[2.76,.36,.70],[5.40,.22,.46]];
function sfxClack(freq,at,dur,gain){
  const ctx=sfxCtx,t=ctx.currentTime+at;
  /* the contact itself: very short and very bright, highpassed rather than
     bandpassed so nothing warm survives it */
  const src=ctx.createBufferSource(),hp=ctx.createBiquadFilter(),ng=ctx.createGain();
  src.buffer=sfxNoise;
  hp.type='highpass';hp.frequency.setValueAtTime(2800,t);
  ng.gain.setValueAtTime(gain*.5,t);
  ng.gain.exponentialRampToValueAtTime(.0001,t+.010);
  src.connect(hp).connect(ng).connect(sfxMaster);
  src.start(t);src.stop(t+.03);
  SFX_STONE_MODES.forEach(([mult,amp,len])=>{
    const osc=ctx.createOscillator(),g=ctx.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(freq*mult,t);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(gain*amp,t+.002);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur*len);
    osc.connect(g).connect(sfxMaster);
    osc.start(t);osc.stop(t+dur*len+.02);
  });
}
function sfx(name){
  if(!sfxReady())return;
  switch(name){
    /* stone rings high, so these gains sit lower than the wooden ones did —
       equal-loudness makes 1.5kHz read far hotter than 700Hz at the same level */
    case 'place': sfxClack(1660,0,.28,.30);break;                     /* tile into a slot */
    case 'undo':  sfxClack(1420,0,.22,.18);break;                     /* taken back: same stone, lifted not struck */
    case 'lay':   sfxClack(1460,0,.32,.27);sfxClack(1290,.055,.26,.18);break; /* down into the meld */
    case 'deal':  for(let i=0;i<5;i++)sfxClack(1380+Math.random()*560,i*.045,.15,.13);break;
    case 'win':   [0,1,2,3].forEach((n,i)=>sfxTone(SFX_PENT[n],i*.065,.34-i*.03,.34-i*.05));break;
    case 'wrong': sfxTone(184,0,.20,.30,'sine');sfxTone(146,.055,.24,.26,'sine');break;
    case 'skip':  sfxTone(494,0,.16,.20,'sine');sfxTone(392,.075,.22,.17,'sine');break;
    case 'finish':[0,1,2,3,4,5].forEach((n,i)=>sfxTone(SFX_PENT[n],i*.085,i===5?.85:.34,i===5?.34:.26));break;
  }
}
/* ---------- settings ---------- */
function applySound(on){
  sfxOn=!!on;
  store.set('hsk_sound',sfxOn);
  const dot=$('sounddot'),label=$('soundlabel');
  if(dot)dot.textContent=sfxOn?'声':'静';
  if(label)label.textContent=sfxOn?'On':'Off';
}
/* the preview belongs to the tap, not to page load */
function toggleSound(){applySound(!sfxOn);if(sfxOn)sfx('place')}
applySound(store.get('hsk_sound',true));
