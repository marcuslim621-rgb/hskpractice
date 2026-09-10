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
function sfxClack(freq,at,dur,gain){
  const ctx=sfxCtx,t=ctx.currentTime+at;
  const src=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),ng=ctx.createGain();
  src.buffer=sfxNoise;
  bp.type='bandpass';bp.frequency.setValueAtTime(freq*2.1,t);bp.Q.value=1.1;
  ng.gain.setValueAtTime(gain,t);
  ng.gain.exponentialRampToValueAtTime(.0001,t+.032);
  src.connect(bp).connect(ng).connect(sfxMaster);
  src.start(t);src.stop(t+.05);
  /* two partials a rough minor-tenth apart read as wood rather than as a pitch */
  [[1,.55],[2.42,.24]].forEach(([mult,amp])=>{
    const osc=ctx.createOscillator(),g=ctx.createGain();
    osc.type='triangle';
    osc.frequency.setValueAtTime(freq*mult,t);
    osc.frequency.exponentialRampToValueAtTime(freq*mult*.86,t+dur);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(gain*amp,t+.005);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    osc.connect(g).connect(sfxMaster);
    osc.start(t);osc.stop(t+dur+.02);
  });
}
function sfx(name){
  if(!sfxReady())return;
  switch(name){
    case 'place': sfxClack(760,0,.10,.5);break;                       /* tile into a slot */
    case 'undo':  sfxClack(500,0,.08,.28);break;                      /* taken back */
    case 'lay':   sfxClack(620,0,.13,.42);sfxClack(560,.06,.12,.3);break; /* down into the meld */
    case 'deal':  for(let i=0;i<5;i++)sfxClack(600+Math.random()*260,i*.045,.07,.2);break;
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
