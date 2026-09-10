/* Sound effects, synthesised rather than loaded. The app ships no external
   assets and works offline, so a few oscillators beat a folder of audio files:
   nothing to download, nothing to cache, and a cue is retuned by changing a
   number.

   Every tunable number lives in SFX_MATERIAL and SFX_CUES below rather than in
   the synthesis, so sound-lab.html can drive the real thing live. Whatever the
   lab prints can be pasted straight back over those two objects. */

/* The material the tiles are cut from. Stone rings high, its modes are
   inharmonic — the 1 : 2.76 : 5.40 of a struck free bar, which is why a tapped
   stone reads as a "tock" and not as a note — and it barely damps, so it holds
   pitch and rings on where wood thuds and bends flat. Each mode is
   [frequency multiple, amplitude, how far into the decay it lasts]. */
const SFX_MATERIAL={
  master:.55,          /* peaks land near -17dBFS, clear of clipping */
  tick:{cut:2800,dur:.010,gain:.5}, /* the contact itself: short, bright, highpassed */
  attack:.002,
  modes:[[1,.40,1],[2.76,.36,.70],[5.40,.22,.46]]
};
/* C5 D5 E5 G5 A5 C6 — pentatonic, where Chinese folk music sits and, usefully,
   a scale in which any combination of notes is consonant, so a flourish cannot
   land on a sour interval. */
const SFX_SCALE=[523.25,587.33,659.25,783.99,880.00,1046.50];
const SFX_CUES={
  place: {kind:'stone',freq:1660,dur:.28,gain:.30},
  undo:  {kind:'stone',freq:1420,dur:.22,gain:.18},
  lay:   {kind:'stone',freq:1460,dur:.32,gain:.27,echo:{freq:1290,at:.055,dur:.26,gain:.18}},
  deal:  {kind:'roll', freq:1380,spread:560,count:5,step:.045,dur:.15,gain:.13},
  win:   {kind:'run',  notes:[0,1,2,3],step:.065,dur:.34,gain:.34,durStep:-.03,gainStep:-.05},
  wrong: {kind:'pair', freq:184,freq2:146,at2:.055,dur:.20,dur2:.24,gain:.30,gain2:.26},
  skip:  {kind:'pair', freq:494,freq2:392,at2:.075,dur:.16,dur2:.22,gain:.20,gain2:.17},
  finish:{kind:'run',  notes:[0,1,2,3,4,5],step:.085,dur:.34,gain:.26,lastDur:.85,lastGain:.34}
};

let sfxCtx=null,sfxMaster=null,sfxNoise=null,sfxOn=true;
function sfxReady(){
  if(!sfxOn)return null;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return null;
  if(!sfxCtx){
    sfxCtx=new AC();
    sfxMaster=sfxCtx.createGain();
    sfxMaster.connect(sfxCtx.destination);
    const n=Math.floor(sfxCtx.sampleRate*.2);
    sfxNoise=sfxCtx.createBuffer(1,n,sfxCtx.sampleRate);
    const d=sfxNoise.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  }
  sfxMaster.gain.value=SFX_MATERIAL.master;
  /* Browsers park the context until a gesture touches it; every cue here is
     downstream of a tap, so resuming on use is enough. An OfflineAudioContext
     also reports "suspended" but renders on demand and rejects resume(), so the
     sound lab's measuring pass has to be left alone. */
  if(sfxCtx.state==='suspended'&&!sfxCtx.startRendering)sfxCtx.resume();
  return sfxCtx;
}
function sfxTone(freq,at,dur,gain,type){
  const ctx=sfxCtx,t=ctx.currentTime+at;
  const osc=ctx.createOscillator(),g=ctx.createGain();
  osc.type=type||'triangle';
  osc.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.014);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  osc.connect(g).connect(sfxMaster);
  osc.start(t);osc.stop(t+dur+.02);
}
function sfxStrike(freq,at,dur,gain){
  const ctx=sfxCtx,t=ctx.currentTime+at,M=SFX_MATERIAL;
  const src=ctx.createBufferSource(),hp=ctx.createBiquadFilter(),ng=ctx.createGain();
  src.buffer=sfxNoise;
  hp.type='highpass';hp.frequency.setValueAtTime(M.tick.cut,t);
  ng.gain.setValueAtTime(Math.max(.0002,gain*M.tick.gain),t);
  ng.gain.exponentialRampToValueAtTime(.0001,t+M.tick.dur);
  src.connect(hp).connect(ng).connect(sfxMaster);
  src.start(t);src.stop(t+M.tick.dur+.02);
  M.modes.forEach(([mult,amp,len])=>{
    const osc=ctx.createOscillator(),g=ctx.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(freq*mult,t);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain*amp),t+M.attack);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur*len);
    osc.connect(g).connect(sfxMaster);
    osc.start(t);osc.stop(t+dur*len+.02);
  });
}
function sfx(name){
  if(!sfxReady())return;
  const c=SFX_CUES[name];
  if(!c)return;
  if(c.kind==='stone'){
    sfxStrike(c.freq,0,c.dur,c.gain);
    if(c.echo)sfxStrike(c.echo.freq,c.echo.at,c.echo.dur,c.echo.gain);
  }else if(c.kind==='roll'){
    for(let i=0;i<c.count;i++)sfxStrike(c.freq+Math.random()*c.spread,i*c.step,c.dur,c.gain);
  }else if(c.kind==='run'){
    c.notes.forEach((n,i)=>{
      const last=i===c.notes.length-1;
      sfxTone(SFX_SCALE[n]||SFX_SCALE[0],
        i*c.step,
        last&&c.lastDur?c.lastDur:c.dur+(c.durStep||0)*i,
        last&&c.lastGain?c.lastGain:c.gain+(c.gainStep||0)*i);
    });
  }else if(c.kind==='pair'){
    sfxTone(c.freq,0,c.dur,c.gain,'sine');
    sfxTone(c.freq2,c.at2,c.dur2,c.gain2,'sine');
  }
}
/* ---------- settings ---------- */
function applySound(on){
  sfxOn=!!on;
  if(typeof store!=='undefined')store.set('hsk_sound',sfxOn);
  const dot=document.getElementById('sounddot'),label=document.getElementById('soundlabel');
  if(dot)dot.textContent=sfxOn?'声':'静';
  if(label)label.textContent=sfxOn?'On':'Off';
}
/* the preview belongs to the tap, not to page load */
function toggleSound(){applySound(!sfxOn);if(sfxOn)sfx('place')}
applySound(typeof store!=='undefined'?store.get('hsk_sound',true):true);
