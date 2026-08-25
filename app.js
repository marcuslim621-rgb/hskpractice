/* ---------- storage (localStorage with in-memory fallback) ---------- */
const mem={};
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):d}catch(e){return k in mem?mem[k]:d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){mem[k]=v}},
  del(k){try{localStorage.removeItem(k)}catch(e){delete mem[k]}}
};

/* ---------- daily streak ---------- */
function todayStr(){
  const d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function bumpStreak(){
  const today=todayStr();
  const s=store.get("hsk_streak",{count:0,last:null});
  if(s.last===today)return;
  const y=new Date();y.setDate(y.getDate()-1);
  const yesterday=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0");
  s.count=(s.last===yesterday)?s.count+1:1;
  s.last=today;
  store.set("hsk_streak",s);
  updateStreakFlame();
}
function updateStreakFlame(){
  const el=$("streakflame");
  if(!el)return;
  const s=store.get("hsk_streak",{count:0,last:null});
  const activeToday=s.last===todayStr();
  el.classList.toggle("active",activeToday && s.count>0);
  $("streakcount").textContent=s.count;
}

/* ---------- pinyin: tone numbers -> tone marks ---------- */
const TM={a:"āáǎà",e:"ēéěè",i:"īíǐì",o:"ōóǒò",u:"ūúǔù",v:"ǖǘǚǜ"};
function markSyl(sy,t){
  let out=sy;
  if(t>=1&&t<=4){
    let i=-1;
    if(sy.includes("a"))i=sy.indexOf("a");
    else if(sy.includes("e"))i=sy.indexOf("e");
    else if(sy.includes("ou"))i=sy.indexOf("o");
    else{for(let j=sy.length-1;j>=0;j--){if("iouv".includes(sy[j])){i=j;break}}}
    if(i>=0&&TM[sy[i]])out=sy.slice(0,i)+TM[sy[i]][t-1]+sy.slice(i+1);
  }
  return out.replace(/v/g,"ü");
}
function pin(p){
  return p.replace(/([a-zA-Z]+)([1-5])/g,(m,sy,t)=>{
    const cap=sy[0]===sy[0].toUpperCase();
    const r=markSyl(sy.toLowerCase(),+t);
    return cap?r[0].toUpperCase()+r.slice(1):r;
  });
}
function levelBadge(lv){
  if(lv===5)return"宗";
  if(lv===7)return"文";
  if(lv===6)return"＋";
  return lv+"级";
}

/* ---------- helpers ---------- */
const $=id=>document.getElementById(id);
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function show(name){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $("scr-"+name).classList.add("active");
  window.scrollTo(0,0);
  if(name==="home"){updateRefresherBadge();updateRefresherScopeLabel();updateSwipeCardSummary();updateStreakFlame()}
}
function updateRefresherBadge(){
  const badge=$("refresherbadge");
  if(!badge)return;
  const dueSet=new Set(wordsDueToday());
  const scopedChars=new Set(refresherScopedDict().map(w=>w[0]));
  let n=0;
  dueSet.forEach(c=>{if(scopedChars.has(c))n++});
  if(n>0){
    badge.textContent=n+" due";
    badge.style.display="";
  }else{
    badge.style.display="none";
  }
}
const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;");
const LEVELS=[[1,"HSK 1","Basic beginner words","一"],[2,"HSK 2","New HSK 2 words only","二"],[3,"HSK 3","New HSK 3 words only","三"],[4,"HSK 4","New HSK 4 words only","四"]];
const TABS=[...LEVELS,[5,"Master"],[7,"Master II"]];
const EDITOR_TABS=[...TABS,[6,"My Words"]];

/* ---------- level select ---------- */
const CATEGORY_TITLE={guessing:"Recognition",typing:"Typing",writing:"Writing",sentences:"Fill-in-the-Blank"};
const VARIANT_LABEL={arcade:"Arcade",unlimited:"Unlimited",timer:"Timer",competition:"Competition"};
let pendingCategory="guessing";
let pendingVariant="arcade";
function goCategory(cat){
  pendingCategory=cat;
  $("mstitle").textContent=CATEGORY_TITLE[cat];
  $("ms-competition").style.display=cat==="guessing"?"":"none";
  show("modeselect");
}
function pickVariant(v){
  pendingVariant=v;
  goLevels(pendingCategory);
}
let multiLevelMode=false;
let multiLevelSel=new Set();
function goLevels(category){
  pendingCategory=category;
  multiLevelMode=false;
  multiLevelSel=new Set();
  renderLevelRows();
  $("multitogglebtn").classList.remove("on");
  $("multitogglebtn").textContent="Select multiple";
  $("multilevelbar").style.display="none";
  pendingWordlistIds=new Set();
  renderLevelWordlists();
  show("levels");
}
function renderLevelRows(){
  const category=pendingCategory;
  const rows=LEVELS.map(([lv,name,desc,em])=>{
    const n=category==="sentences"?SENTQ.filter(s=>s[0]===lv).length:WORDS.filter(w=>w[3]===lv).length;
    const unit=category==="sentences"?"sentences":"words";
    const sel=multiLevelSel.has(lv);
    const cls=`card${multiLevelMode?" multimode":""}${sel?" multisel":""}`;
    const action=multiLevelMode?`toggleMultiLevel(${lv})`:`startLevel(${lv})`;
    return `<button class="${cls}" onclick="${action}">
      <div class="sealic quiet">${em}</div><div><div class="tt">${name}</div>
      <div class="dd">${desc} · ${n} ${unit}</div></div>
      <div class="multitick">✓</div><div class="chev">›</div></button>`;
  });
  if(!multiLevelMode&&(category==="guessing"||category==="typing"||category==="writing")){
    const mn=WORDS.filter(w=>w[3]===5).length;
    const mn2=WORDS.filter(w=>w[3]===7).length;
    rows.push(`<button class="card" onclick="startMaster(5)">
      <div class="sealic">宗</div><div><div class="tt">Master 宗师</div>
      <div class="dd">Rare characters, trap readings and literary chengyu — hard even for native speakers · ${mn} words</div></div>
      <div class="chev">›</div></button>`);
    rows.push(`<button class="card" onclick="startMaster(7)">
      <div class="sealic">文</div><div><div class="tt">Master II 文哲</div>
      <div class="dd">Literary allusions, classical idioms and abstract vocabulary from essays and prose — hard even for native speakers · ${mn2} words</div></div>
      <div class="chev">›</div></button>`);
  }
  $("levelrows").innerHTML=rows.join("");
}
function toggleMultiLevelMode(){
  multiLevelMode=!multiLevelMode;
  multiLevelSel=new Set();
  $("multitogglebtn").classList.toggle("on",multiLevelMode);
  $("multitogglebtn").textContent=multiLevelMode?"Cancel":"Select multiple";
  $("levelhint").textContent=multiLevelMode?"Tap all the levels you want to include":"Each level tests only the words introduced at that level";
  $("multilevelbar").style.display="none";
  renderLevelRows();
}
function toggleMultiLevel(lv){
  multiLevelSel.has(lv)?multiLevelSel.delete(lv):multiLevelSel.add(lv);
  renderLevelRows();
  $("multilevelcount").textContent=multiLevelSel.size;
  $("multilevelbar").style.display=multiLevelSel.size>0?"flex":"none";
}
function startMultiLevel(){
  const cat=pendingCategory,variant=pendingVariant;
  const levels=[...multiLevelSel].sort((a,b)=>a-b);
  if(!levels.length)return;
  const label=`HSK ${levels.join("+")} · ${CATEGORY_TITLE[cat]} · ${VARIANT_LABEL[variant]}`;
  if(cat==="sentences"){
    startSentQuiz(SENTQ.filter(s=>levels.includes(s[0])),label,variant);
    return;
  }
  const pool=WORDS.filter(w=>levels.includes(w[3]));
  if(cat==="typing"){startTypeQuiz(pool,label,variant);return}
  if(cat==="writing"){startWriteQuiz(pool,label,variant);return}
  startQuiz(pool,label,variant);
}
function renderLevelWordlists(){
  const lists=getWordlists();
  const entries=Object.entries(lists).sort((a,b)=>b[1].created-a[1].created);
  $("levelwlsection").style.display=entries.length?"block":"none";
  $("levelwlrows").innerHTML=entries.map(([id,l])=>{
    const on=pendingWordlistIds.has(id);
    return `<button class="wrow ${on?"sel":""}" onclick="toggleLevelWordlist('${id}')">
      <span style="font-family:var(--ui);font-size:14.5px;font-weight:600;min-width:0">${esc(l.name||"Untitled list")}</span>
      <span><div class="en">${l.words.length} word${l.words.length===1?"":"s"}</div></span>
      <span class="tick">✓</span></button>`;
  }).join("");
  updateLevelWordlistBar();
}
function toggleLevelWordlist(id){
  pendingWordlistIds=pendingWordlistIds.has(id)&&pendingWordlistIds.size===1?new Set():new Set([id]);
  renderLevelWordlists();
}
function updateLevelWordlistBar(){
  $("levelwlcount").textContent=pendingWordlistIds.size;
  $("levelwlbar").style.display=pendingWordlistIds.size>0?"flex":"none";
}
function startMaster(level){
  const lv=level||5;
  const cat=pendingCategory,variant=pendingVariant;
  const pool=WORDS.filter(w=>w[3]===lv);
  const tierName=lv===7?"Master II":"Master";
  const label=`${tierName} · ${CATEGORY_TITLE[cat]} · ${VARIANT_LABEL[variant]}`;
  if(cat==="typing")startTypeQuiz(pool,label,variant);
  else if(cat==="writing")startWriteQuiz(pool,label,variant);
  else startQuiz(pool,label,variant);
}
function startLevel(lv){
  const cat=pendingCategory,variant=pendingVariant;
  const label=`HSK ${lv} · ${CATEGORY_TITLE[cat]} · ${VARIANT_LABEL[variant]}`;
  if(cat==="sentences"){
    startSentQuiz(SENTQ.filter(s=>s[0]===lv),label,variant);
    return;
  }
  const pool=WORDS.filter(w=>w[3]===lv);
  if(cat==="typing"){startTypeQuiz(pool,label,variant);return}
  if(cat==="writing"){startWriteQuiz(pool,label,variant);return}
  startQuiz(pool,label,variant);
}

/* ---------- refresher ---------- */
/* ---------- refresher scope (which words Refresher draws from) ---------- */
function getRefresherScope(){
  return store.get("hsk_refresher_scope",{mode:"all",levels:[],wordlistIds:[]});
}
function saveRefresherScopeObj(scope){store.set("hsk_refresher_scope",scope)}
function refresherScopedDict(){
  const scope=getRefresherScope();
  const dict=allWords();
  if(scope.mode==="all")return dict;
  if(scope.mode==="levels"){
    if(!scope.levels.length)return dict;
    return dict.filter(w=>scope.levels.includes(w[3]));
  }
  if(scope.mode==="wordlists"){
    if(!scope.wordlistIds.length)return dict;
    const lists=getWordlists();
    const chars=new Set();
    scope.wordlistIds.forEach(id=>{
      const l=lists[id];
      if(l)l.words.forEach(c=>chars.add(c));
    });
    return dict.filter(w=>chars.has(w[0]));
  }
  return dict;
}
function refresherScopeLabel(){
  const scope=getRefresherScope();
  if(scope.mode==="all")return "All HSK levels";
  if(scope.mode==="levels"){
    if(!scope.levels.length)return "All HSK levels";
    return scope.levels.map(lv=>"HSK "+lv).join(", ");
  }
  if(scope.mode==="wordlists"){
    if(!scope.wordlistIds.length)return "All HSK levels";
    const lists=getWordlists();
    const names=scope.wordlistIds.map(id=>lists[id]?lists[id].name||"Untitled":null).filter(Boolean);
    if(!names.length)return "All HSK levels";
    return names.length===1?names[0]:names.length+" wordlists";
  }
  return "All HSK levels";
}
function updateRefresherScopeLabel(){
  const el=$("refresherscopelabel");
  if(el)el.textContent=refresherScopeLabel();
}
let refScopeDraft=null;
function openRefresherScope(){
  const current=getRefresherScope();
  refScopeDraft={mode:current.mode,levels:[...current.levels],wordlistIds:[...current.wordlistIds]};
  renderRefresherScopeSheet();
  $("refscopesheet").classList.add("show");
}
function closeRefresherScope(){
  $("refscopesheet").classList.remove("show");
}
function refScopeSetAll(){
  refScopeDraft={mode:"all",levels:[],wordlistIds:[]};
  renderRefresherScopeSheet();
}
function refScopeToggleLevel(lv){
  refScopeDraft.mode="levels";
  const i=refScopeDraft.levels.indexOf(lv);
  if(i>=0)refScopeDraft.levels.splice(i,1);else refScopeDraft.levels.push(lv);
  renderRefresherScopeSheet();
}
function refScopeToggleWordlist(id){
  refScopeDraft.mode="wordlists";
  const i=refScopeDraft.wordlistIds.indexOf(id);
  if(i>=0)refScopeDraft.wordlistIds.splice(i,1);else refScopeDraft.wordlistIds.push(id);
  renderRefresherScopeSheet();
}
function renderRefresherScopeSheet(){
  const lists=getWordlists();
  const listEntries=Object.entries(lists).sort((a,b)=>b[1].created-a[1].created);
  let html="";
  html+=`<button class="wrow ${refScopeDraft.mode==="all"?"sel":""}" onclick="refScopeSetAll()">
    <span><div class="py">All HSK levels</div><div class="en">Every word you've ever practiced</div></span>
    <span class="tick">✓</span></button>`;
  html+=`<div class="sechead" style="margin-top:14px">By level</div>`;
  LEVELS.forEach(([lv,name])=>{
    const on=refScopeDraft.mode==="levels"&&refScopeDraft.levels.includes(lv);
    html+=`<button class="wrow ${on?"sel":""}" onclick="refScopeToggleLevel(${lv})">
      <span><div class="py">${esc(name)}</div></span>
      <span class="tick">✓</span></button>`;
  });
  if(listEntries.length){
    html+=`<div class="sechead" style="margin-top:14px">By wordlist</div>`;
    listEntries.forEach(([id,l])=>{
      const on=refScopeDraft.mode==="wordlists"&&refScopeDraft.wordlistIds.includes(id);
      html+=`<button class="wrow ${on?"sel":""}" onclick="refScopeToggleWordlist('${id}')">
        <span><div class="py">${esc(l.name||"Untitled list")}</div><div class="en">${l.words.length} word${l.words.length===1?"":"s"}</div></span>
        <span class="tick">✓</span></button>`;
    });
  }
  $("refscopelist").innerHTML=html;
}
function saveRefresherScope(){
  saveRefresherScopeObj(refScopeDraft);
  updateRefresherScopeLabel();
  updateRefresherBadge();
  closeRefresherScope();
}

function startRefresher(){
  startRefresherMixed();
}

/* ---------- custom wordlists (create, edit, pick for testing) ---------- */
function getUserWords(){return store.get("hsk_userwords",[])}
function saveUserWords(arr){store.set("hsk_userwords",arr)}
function allWords(){return [...WORDS,...getUserWords()]}
function getWordlists(){return store.get("hsk_wordlists",{})}
function saveWordlists(obj){store.set("hsk_wordlists",obj)}
const MY_WORDS_LIST_ID="mywords";
function addToMyWordsList(zh){
  ensureMyWordsList();
  const lists=getWordlists();
  if(!lists[MY_WORDS_LIST_ID].words.includes(zh))lists[MY_WORDS_LIST_ID].words.push(zh);
  saveWordlists(lists);
}
// one-time migration from the old single anonymous selection, if present
(function migrateOldCustomSel(){
  if(store.get("hsk_wordlists",null)!==null)return;
  const oldSel=store.get("hsk_custom_sel",[]);
  const fresh={};
  if(oldSel.length){
    const id="wl_"+Date.now();
    fresh[id]={name:"My Custom Words",words:[...oldSel],created:Date.now()};
  }
  saveWordlists(fresh);
})();

let editingListId=null;
let editorTab=1;
let editorSel=new Set();

function createNewWordlist(){
  const lists=getWordlists();
  const id="wl_"+Date.now();
  lists[id]={name:"",words:[],created:Date.now()};
  saveWordlists(lists);
  openWordlistEditor(id);
}
function openWordlistEditor(id){
  const lists=getWordlists();
  if(!lists[id])return;
  editingListId=id;
  editorSel=new Set(lists[id].words);
  editorTab=1;
  $("editorname").value=lists[id].name;
  renderEditorTabs();
  renderEditorList();
  show("wordlisteditor");
}
function renderEditorTabs(){
  $("editortabs").innerHTML=EDITOR_TABS.map(([lv,name])=>
    `<button class="tab ${lv===editorTab?"on":""}" onclick="editorTab=${lv};renderEditorTabs();renderEditorList()">${name}</button>`).join("");
}
function editorVisible(){
  const q=$("editorsearch").value.trim().toLowerCase();
  return allWords().filter(w=>w[3]===editorTab&&(!q||w[0].includes(q)||pin(w[1]).toLowerCase().includes(q)||w[1].toLowerCase().includes(q)||w[2].toLowerCase().includes(q)));
}
function renderEditorList(){
  $("editorlist").innerHTML=editorVisible().map(w=>{
    const on=editorSel.has(w[0]);
    const badge=w[3]===6?`<span class="poschip custom">Custom</span>`:"";
    return `<button class="wrow ${on?"sel":""}" onclick="toggleEditorWord('${w[0]}')">
      <span class="zh">${w[0]}</span><span><div class="py">${pin(w[1])}</div><div class="en">${esc(w[2])}</div></span>
      ${badge}
      <span class="tick">✓</span></button>`;
  }).join("")||`<div class="empty">No words match your search</div>`;
  updateEditorCount();
}
function persistEditorSel(){
  const lists=getWordlists();
  if(!lists[editingListId])return;
  lists[editingListId].words=[...editorSel];
  saveWordlists(lists);
}
function toggleAddWordForm(){
  const f=$("addwordform");
  const open=f.style.display!=="none";
  f.style.display=open?"none":"block";
  $("addwordchev").textContent=open?"›":"▾";
  if(!open)$("neword-zh").focus();
}
function previewNewWordPinyin(){
  const raw=$("neword-py").value.trim();
  $("newordpreview").textContent=raw?("Preview: "+pin(raw)):"";
}
function addUserWord(){
  const zh=$("neword-zh").value.trim();
  const py=$("neword-py").value.trim();
  const en=$("neword-en").value.trim();
  if(!zh||!py||!en){alert("Please fill in the character(s), pinyin, and meaning.");return}
  if(allWords().some(w=>w[0]===zh)){alert("That word already exists — search for it above instead of adding a duplicate.");return}
  const words=getUserWords();
  words.push([zh,py,en,6,"custom"]);
  saveUserWords(words);
  editorSel.add(zh);
  persistEditorSel();
  editorTab=6;
  $("neword-zh").value="";$("neword-py").value="";$("neword-en").value="";
  $("newordpreview").textContent="";
  toggleAddWordForm();
  renderEditorTabs();
  renderEditorList();
}
function toggleEditorWord(c){
  editorSel.has(c)?editorSel.delete(c):editorSel.add(c);
  persistEditorSel();
  renderEditorList();
}
function editorBulk(on){
  editorVisible().forEach(w=>on?editorSel.add(w[0]):editorSel.delete(w[0]));
  persistEditorSel();renderEditorList();
}
function editorClearAll(){editorSel.clear();persistEditorSel();renderEditorList()}
function updateEditorCount(){$("editorcount").textContent=editorSel.size}
function renameCurrentWordlist(name){
  const lists=getWordlists();
  if(!lists[editingListId])return;
  lists[editingListId].name=name;
  saveWordlists(lists);
}
function deleteCurrentWordlist(){
  if(!confirm("Delete this wordlist? This can't be undone."))return;
  const lists=getWordlists();
  delete lists[editingListId];
  saveWordlists(lists);
  show("mywordlists");
  renderMyWordlists();
}
function renderMyWordlists(){
  const lists=getWordlists();
  const entries=Object.entries(lists).sort((a,b)=>b[1].created-a[1].created);
  $("mywordlistrows").innerHTML=entries.length?entries.map(([id,l])=>
    `<button class="card" onclick="openWordlistEditor('${id}')">
      <div class="sealic quiet">词</div>
      <div><div class="tt">${esc(l.name||"Untitled list")}</div>
      <div class="dd">${l.words.length} word${l.words.length===1?"":"s"}</div></div>
      <div class="chev">›</div></button>`).join("")
    :`<div class="empty">No wordlists yet — tap "New wordlist" above to create your first one</div>`;
}
let pendingWordlistIds=new Set();
let pendingWordlistPool=[];
let pendingWordlistLabel="";
function wordLevelOf(c){
  const w=allWords().find(x=>x[0]===c);
  return w?w[3]:null;
}
function confirmWordlistSelection(){
  const lists=getWordlists();
  const chars=new Set();
  const names=[];
  [...pendingWordlistIds].forEach(id=>{
    const l=lists[id];
    if(!l)return;
    names.push(l.name||"Untitled list");
    l.words.forEach(c=>chars.add(c));
  });
  pendingWordlistPool=[...chars];
  pendingWordlistLabel=names.length===1?names[0]:`${names.length} wordlists`;
  renderWordlistLevels();
  show("wordlistlevels");
}
const WL_LEVEL_META={5:["宗","Master 宗师"],7:["文","Master II 文哲"],6:["＋","My Words"]};
function renderWordlistLevels(){
  const wset=new Set(pendingWordlistPool);
  const matched=allWords().filter(w=>wset.has(w[0]));
  if(!matched.length){
    $("wordlistlevelrows").innerHTML=`<div class="empty">Your selected wordlist(s) don't have any words in them yet.</div>`;
    return;
  }
  const byLevel={};
  matched.forEach(w=>{(byLevel[w[3]]=byLevel[w[3]]||[]).push(w)});
  const rows=[];
  rows.push(`<button class="card" onclick="startWordlistFiltered(null)">
    <div class="sealic">词</div><div><div class="tt">All words</div>
    <div class="dd">Everything in ${esc(pendingWordlistLabel)} · ${matched.length} word${matched.length===1?"":"s"}</div></div>
    <div class="chev">›</div></button>`);
  LEVELS.forEach(([lv,name,desc,em])=>{
    const n=(byLevel[lv]||[]).length;
    if(!n)return;
    rows.push(`<button class="card" onclick="startWordlistFiltered(${lv})">
      <div class="sealic quiet">${em}</div><div><div class="tt">${name}</div>
      <div class="dd">Only the ${n} ${name} word${n===1?"":"s"} from your selection</div></div>
      <div class="chev">›</div></button>`);
  });
  [5,7,6].forEach(lv=>{
    const n=(byLevel[lv]||[]).length;
    if(!n)return;
    const [em,name]=WL_LEVEL_META[lv];
    rows.push(`<button class="card" onclick="startWordlistFiltered(${lv})">
      <div class="sealic ${lv===6?"quiet":""}">${em}</div><div><div class="tt">${name}</div>
      <div class="dd">Only the ${n} word${n===1?"":"s"} from your selection</div></div>
      <div class="chev">›</div></button>`);
  });
  $("wordlistlevelrows").innerHTML=rows.join("");
}
function startWordlistFiltered(level){
  const wset=new Set(pendingWordlistPool);
  const cat=pendingCategory,variant=pendingVariant;
  const levelName=level===null?"All words":level===5?"Master":level===7?"Master II":level===6?"My Words":`HSK ${level}`;
  const label=`${pendingWordlistLabel} · ${levelName} · ${CATEGORY_TITLE[cat]} · ${VARIANT_LABEL[variant]}`;
  if(cat==="sentences"){
    const pool=SENTQ.filter(s=>wset.has(s[2])&&(level===null||wordLevelOf(s[2])===level));
    if(!pool.length){alert("None of the sentence questions in this app target matching words yet — try a different level or practice category.");return}
    startSentQuiz(pool,label,variant);
    return;
  }
  const pool=allWords().filter(w=>wset.has(w[0])&&(level===null||w[3]===level));
  if(!pool.length)return;
  if(cat==="typing"){startTypeQuiz(pool,label,variant);return}
  if(cat==="writing"){startWriteQuiz(pool,label,variant);return}
  startQuiz(pool,label,variant);
}

/* ---------- quiz engine ---------- */
function heartsHTML(lives,broke){
  let s="";
  for(let i=0;i<5;i++){
    if(i<lives)s+='<span class="h">♥</span>';
    else if(i===lives&&broke)s+='<span class="h breaking">♡</span>';
    else s+='<span class="h">♡</span>';
  }
  return s;
}
function setFire(id,streak){
  // tiers: 2+ counter · 5+ rainbow · 10+ fire
  const card=$(id),b=$(id+"streak");
  card.classList.toggle("onfire",streak>=5);
  card.classList.toggle("blazing",streak>=10);
  if(streak>=2){
    b.textContent="Streak ×"+streak+(streak>=10?" 🔥":"");
    b.classList.toggle("rb",streak>=5);
    b.classList.add("show");
    b.classList.remove("pop");
    void b.offsetWidth; // restart the pop animation on every increment
    b.classList.add("pop");
  }else{
    b.classList.remove("show","pop","rb");
  }
}
let S=null;
function buildQueue(pool){
  const q=shuffle([...pool]);
  const seen=store.get("hsk_seen",{});
  return q.sort((a,b)=>(seen[a[0]]||0)-(seen[b[0]]||0)); // stable sort keeps ties shuffled
}
let againFn=null;
let quizTimer=null;
function startQuiz(pool,label,variant){
  againFn=()=>startQuiz(pool,label,variant);
  clearInterval(quizTimer);
  const lives=variant==="arcade"?5:variant==="competition"?3:Infinity;
  const timed=variant==="timer";
  S={variant,timed,label,pool,lives,queue:buildQueue(pool),i:0,ok:0,bad:0,streak:0,results:[],done:false};
  if(timed){S.deadline=Date.now()+120000;quizTimer=setInterval(quizTick,200)}
  setFire("qcard",0);
  show("quiz");renderQ();
}
function quizTick(){
  if(!S||S.done)return;
  const left=Math.max(0,S.deadline-Date.now());
  const s=Math.ceil(left/1000);
  $("qhearts").innerHTML=`<span class="timerbig ${s<=10?"low":""}">${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}</span>`;
  if(left<=0)quizTimeUp();
}
function quizTimeUp(){
  S.done=true;
  clearInterval(quizTimer);
  document.querySelectorAll("#opts-en .opt,#opts-py .opt").forEach(b=>b.disabled=true);
  saveSession();
  showSummary();
}
function toneVariants(p){
  const seen=new Set([p]),out=[];let g=0;
  while(out.length<3&&g++<300){
    const v=p.replace(/[1-5]/g,d=>{
      if(Math.random()<0.65){let n;do{n=1+Math.floor(Math.random()*4)}while(String(n)===d);return String(n)}
      return d;
    });
    if(!seen.has(v)){seen.add(v);out.push(v)}
  }
  let t=1;
  while(out.length<3){const v=p.replace(/[1-5]/,()=>String(t++));if(!seen.has(v)){seen.add(v);out.push(v)}if(t>5)break}
  return out;
}
function renderQ(){
  const w=S.queue[S.i];
  S.phase={enDone:false,pyDone:false,wrong:false};
  $("qchar").textContent=w[0];
  $("qseal").textContent=levelBadge(w[3]);
  if(S.timed){
    const left=Math.max(0,S.deadline-Date.now());const s=Math.ceil(left/1000);
    $("qhearts").innerHTML=`<span class="timerbig ${s<=10?"low":""}">${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}</span>`;
  }else if((S.variant==="arcade"||S.variant==="competition"))$("qhearts").innerHTML=heartsHTML(S.lives,false);
  else $("qhearts").textContent="♥ ∞";
  $("qok").textContent="✓ "+S.ok;$("qbad").textContent="✗ "+S.bad;
  $("qprog").textContent=(S.i+1)+" / "+S.queue.length+" words";
  $("qfill").style.width=(S.i/S.queue.length*100)+"%";
  $("qnext").disabled=true;
  $("pyhint").textContent="answer above first";
  // english options
  let dpool=WORDS.filter(x=>x[3]===w[3]&&x[2]!==w[2]);
  if(dpool.length<3)dpool=WORDS.filter(x=>x[2]!==w[2]);
  const others=shuffle(dpool.map(x=>x[2]));
  const enOpts=shuffle([w[2],...[...new Set(others)].slice(0,3)]);
  $("opts-en").innerHTML=enOpts.map(o=>`<button class="opt" onclick="answerEn(this,${o===w[2]})">${esc(o)}</button>`).join("");
  $("opts-en").classList.remove("off");
  // pinyin options (tone distractors)
  const pyOpts=shuffle([w[1],...toneVariants(w[1])]);
  $("opts-py").innerHTML=pyOpts.map(o=>`<button class="opt" onclick="answerPy(this,${o===w[1]})">${pin(o)}</button>`).join("");
  $("opts-py").classList.add("off");
}
function lock(container,btn,right){
  [...container.children].forEach(b=>b.disabled=true);
  btn.classList.add(right?"right":"wrong");
  if(!right){
    const w=S.queue[S.i];
    [...container.children].forEach(b=>{
      const correct=container.id==="opts-en"?b.textContent===w[2]:b.textContent===pin(w[1]);
      if(correct)b.classList.add("right");
    });
  }
}
function answerEn(btn,right){
  if(S.phase.enDone)return;S.phase.enDone=true;
  if(!right)S.phase.wrong=true;
  lock($("opts-en"),btn,right);
  $("opts-py").classList.remove("off");
  $("pyhint").textContent="choose the correct tones";
}
function answerPy(btn,right){
  if(!S.phase.enDone||S.phase.pyDone)return;S.phase.pyDone=true;
  if(!right)S.phase.wrong=true;
  lock($("opts-py"),btn,right);
  finishWord();
}
function finishWord(){
  const w=S.queue[S.i];
  S.results.push({c:w[0],ok:!S.phase.wrong});
  const seen=store.get("hsk_seen",{});
  seen[w[0]]=(seen[w[0]]||0)+1;
  store.set("hsk_seen",seen);
  if(S.phase.wrong){S.bad++;S.streak=0;if((S.variant==="arcade"||S.variant==="competition"))S.lives--}else{S.ok++;S.streak++}
  setFire("qcard",S.streak);
  if(!S.phase.wrong&&S.streak>=5)
    document.querySelectorAll("#opts-en .opt.right,#opts-py .opt.right")
      .forEach(b=>b.classList.add("rainbow"));
  $("qok").textContent="✓ "+S.ok;$("qbad").textContent="✗ "+S.bad;
  if(!S.timed){
    if((S.variant==="arcade"||S.variant==="competition"))$("qhearts").innerHTML=heartsHTML(S.lives,S.phase.wrong);
    else $("qhearts").textContent="♥ ∞";
  }
  $("qnext").disabled=false;
  $("qnext").textContent=(!S.timed&&(S.variant==="arcade"||S.variant==="competition")&&S.lives<=0)?"Results →":((!S.timed&&S.i+1>=S.queue.length)?"Finish →":"Next →");
}
function nextWord(){
  if(S.done)return;
  if(S.timed){
    S.i++;
    if(S.i>=S.queue.length){S.queue=shuffle([...S.pool]);S.i=0}
    renderQ();return;
  }
  if((S.variant==="arcade"||S.variant==="competition")&&S.lives<=0){saveSession();showGameOver();return}
  S.i++;
  if(S.i>=S.queue.length){
    if(REFR&&REFR.active){recordWordStats(S.results,"guessing");if(refrAdvance(S.results))return}
    saveSession();showSummary();return;
  }
  renderQ();
}
function endEarly(){
  clearInterval(quizTimer);
  if(S)S.done=true;
  if(REFR&&REFR.active){refrEndEarly();return}
  if(S&&S.results.length)saveSession();
  show("home");
}
function accuracy(){const t=S.ok+S.bad;return t?Math.round(S.ok/t*100):0}
let lastWasBest=false;
function recordBest(label,ok,bad){
  const best=store.get("hsk_best",{});
  const acc=ok+bad?Math.round(ok/(ok+bad)*100):0;
  const cur=best[label];
  if(ok>0&&(!cur||ok>cur.ok||(ok===cur.ok&&acc>cur.acc))){
    best[label]={ok,bad,acc,t:Date.now()};
    store.set("hsk_best",best);
    return true;
  }
  return false;
}
/* ---------- lifetime word-mastery stats (never trimmed) + SRS scheduling ---------- */
const SRS_DAY=86400000;
const SRS_MODES=["guessing","typing","writing","sentences"];
function emptyModeStat(){return {ok:0,bad:0,interval:1,due:0}}
function recordWordStats(results,mode){
  const stats=store.get("hsk_word_stats",{});
  const today=Date.now();
  results.forEach(r=>{
    const s=stats[r.c]||{lastSeen:0,byMode:{}};
    if(!s.byMode)s.byMode={};
    const m=s.byMode[mode]||emptyModeStat();
    if(r.ok){m.ok++;m.interval=Math.round((m.interval||1)*2.3)||1}
    else{m.bad++;m.interval=1}
    m.due=today+m.interval*SRS_DAY;
    s.byMode[mode]=m;
    s.lastSeen=today;
    stats[r.c]=s;
  });
  store.set("hsk_word_stats",stats);
}
function wordsDueToday(){
  // back-compat helper: any word due in ANY mode (used by the home badge count)
  const stats=store.get("hsk_word_stats",{});
  const now=Date.now();
  const out=new Set();
  Object.entries(stats).forEach(([c,s])=>{
    if(!s.byMode)return;
    Object.values(s.byMode).forEach(m=>{if(m.due<=now)out.add(c)});
  });
  return [...out];
}
function dueQueueForScope(scopedChars){
  // returns [{c, mode}] for every word×mode combo that's due, restricted to scopedChars (Set or null=all)
  const stats=store.get("hsk_word_stats",{});
  const now=Date.now();
  const out=[];
  Object.entries(stats).forEach(([c,s])=>{
    if(scopedChars&&!scopedChars.has(c))return;
    if(!s.byMode)return;
    SRS_MODES.forEach(mode=>{
      const m=s.byMode[mode];
      if(m&&m.due<=now)out.push({c,mode});
    });
  });
  return out;
}

/* ---------- mixed-mode refresher orchestrator ----------
   Drives the 4 existing quiz engines one question at a time, in whichever
   mode each due word was last wrong/scheduled in, so a single Refresher
   session can jump between Recognition/Typing/Writing/Sentences per-word. */
let REFR=null;
function refrBuildQueue(){
  const dict=allWords();
  const dueChars=new Set(wordsDueToday());
  const scopedChars=new Set(refresherScopedDict().map(w=>w[0]));
  let items=dueQueueForScope(scopedChars).filter(it=>dueChars.has(it.c));

  // mix in a few brand-new (never-practiced) words, Duolingo-style — default to Recognition
  const stats=store.get("hsk_word_stats",{});
  const NEW_WORD_COUNT=3;
  const scopedDict=refresherScopedDict();
  const unseen=scopedDict.filter(w=>!stats[w[0]]);
  if(unseen.length){
    shuffle([...unseen]).slice(0,NEW_WORD_COUNT).forEach(w=>items.push({c:w[0],mode:"guessing"}));
  }
  return shuffle(items);
}
function startRefresherMixed(){
  const queue=refrBuildQueue();
  if(!queue.length){alert("Nothing due right now within this scope — check back later, or widen the scope! 🎉");return}
  REFR={active:true,queue,i:0,ok:0,bad:0,results:[],startedAt:Date.now()};
  refrRunCurrent();
}
function refrRunCurrent(){
  if(!REFR||REFR.i>=REFR.queue.length){refrFinish();return}
  const {c,mode}=REFR.queue[REFR.i];
  const dict=allWords();
  const w=dict.find(x=>x[0]===c);
  if(!w){REFR.i++;refrRunCurrent();return} // word no longer exists (e.g. deleted custom word)
  const label="Refresher · "+CATEGORY_TITLE[mode];
  if(mode==="guessing")startQuiz([w],label,"unlimited");
  else if(mode==="typing")startTypeQuiz([w],label,"unlimited");
  else if(mode==="writing")startWriteQuiz([w],label,"unlimited");
  else if(mode==="sentences"){
    const sentMatches=SENTQ.filter(s=>s[2]===c);
    if(!sentMatches.length){REFR.i++;refrRunCurrent();return} // no sentence exists for this word
    startSentQuiz(sentMatches.slice(0,1),label,"unlimited");
  }
}
// called by each engine's own single-question "finished" branch when a refresher session is active
function refrAdvance(results){
  if(!REFR)return false;
  results.forEach(r=>{
    REFR.results.push(r);
    if(r.ok)REFR.ok++;else REFR.bad++;
  });
  REFR.i++;
  refrRunCurrent();
  return true;
}
function refrFinish(){
  const results=REFR.results,ok=REFR.ok,bad=REFR.bad;
  const hist=store.get("hsk_history",[]);
  hist.unshift({t:Date.now(),label:"Refresher (mixed)",ok,bad,words:results});
  store.set("hsk_history",hist.slice(0,200));
  bumpStreak();
  lastWasBest=recordBest("Refresher (mixed)",ok,bad);
  REFR=null;
  $("sumbest").classList.toggle("show",lastWasBest);
  $("sumlabel").textContent="Refresher · mixed practice";
  $("sumok").textContent=ok;$("sumbad").textContent=bad;
  const t=ok+bad;
  $("sumacc").textContent=(t?Math.round(ok/t*100):0)+"%";
  $("sumwords").innerHTML=breakdownHTML(results);
  show("summary");
}
function refrEndEarly(){
  if(REFR&&REFR.results.length){
    const hist=store.get("hsk_history",[]);
    hist.unshift({t:Date.now(),label:"Refresher (mixed)",ok:REFR.ok,bad:REFR.bad,words:REFR.results});
    store.set("hsk_history",hist.slice(0,200));
    bumpStreak();
    recordBest("Refresher (mixed)",REFR.ok,REFR.bad);
  }
  REFR=null;
  show("home");
}
function saveSession(){
  const hist=store.get("hsk_history",[]);
  hist.unshift({t:Date.now(),label:S.label,ok:S.ok,bad:S.bad,words:S.results});
  store.set("hsk_history",hist.slice(0,200));
  bumpStreak();
  recordWordStats(S.results,"guessing");
  lastWasBest=recordBest(S.label,S.ok,S.bad);
}
function breakdownHTML(results){
  return results.map(r=>{
    const w=allWords().find(x=>x[0]===r.c)||[r.c,"",""];
    const thumb=r.drawing?`<img class="drawthumb" src="${r.drawing}" onclick="event.stopPropagation();showDrawingLightbox(this.src)" alt="Your drawing of ${w[0]}">`:"";
    return `<div class="bitem ${r.ok?"ok":"bad"}"><span class="zh">${w[0]}</span>
      <span><div class="py">${pin(w[1])}</div><div class="en">${esc(w[2])}</div></span>
      ${thumb}
      <span class="mark">${r.ok?"✓":"✗"}</span></div>`;
  }).join("");
}
function showDrawingLightbox(src){
  $("drawlightboximg").src=src;
  $("drawlightbox").classList.add("show");
}
function showSummary(){
  $("sumbest").classList.toggle("show",lastWasBest);
  $("sumlabel").textContent=S.label;
  $("sumok").textContent=S.ok;$("sumbad").textContent=S.bad;$("sumacc").textContent=accuracy()+"%";
  $("sumwords").innerHTML=breakdownHTML(S.results);
  show("summary");
}
function showGameOver(){
  $("gobest").classList.toggle("show",lastWasBest);
  $("gook").textContent=S.ok;$("gobad").textContent=S.bad;$("goacc").textContent=accuracy()+"%";
  $("gowords").innerHTML=breakdownHTML(S.results.filter(r=>!r.ok));
  const isComp=S.variant==="competition";
  $("golivestext").textContent=isComp?"You used all 3 lives":"You used all 5 lives";
  $("compentry").style.display=isComp?"":"none";
  if(isComp){
    $("compname").value=store.get("hsk_last_name","");
    $("compdone").style.display="none";
    $("compname").disabled=false;
    $("compsubmitbtn").disabled=false;
    $("compsubmitbtn").textContent="Submit";
  }
  show("gameover");
}
function competitionScopeKey(label){
  // label looks like "HSK 2 · Recognition · Competition" or "Master · Recognition · Competition"
  return (label||"").split("·")[0].trim()||"Unknown";
}
function submitCompetitionScore(){
  const name=($("compname").value||"").trim().slice(0,18);
  if(!name){$("compname").focus();return}
  store.set("hsk_last_name",name);
  const scope=competitionScopeKey(S.label);
  const board=store.get("hsk_competition",{});
  const list=board[scope]||[];
  list.push({name,ok:S.ok,bad:S.bad,acc:accuracy(),t:Date.now()});
  list.sort((a,b)=>b.ok-a.ok||b.acc-a.acc);
  board[scope]=list.slice(0,50);
  store.set("hsk_competition",board);
  $("compdonelevel").textContent=scope;
  $("compdone").style.display="";
  $("compname").disabled=true;
  $("compsubmitbtn").disabled=true;
  $("compsubmitbtn").textContent="Saved ✓";
}
function playAgain(){if(againFn)againFn()}

/* ---------- typing quiz engine ---------- */
let TS=null;
function normPinyin(p){return p.toLowerCase().replace(/u:/g,"v").replace(/[^a-z]/g,"")}
function pinyinMatch(input,stored){
  const canon=normPinyin(stored);           // stored uses v for ü, digits stripped
  const inp=normPinyin(input);
  return inp===canon||inp===canon.replace(/v/g,"u");
}
let typeTimer=null;
function startTypeQuiz(pool,label,variant){
  againFn=()=>startTypeQuiz(pool,label,variant);
  clearInterval(typeTimer);
  const lives=variant==="arcade"?5:Infinity;
  const timed=variant==="timer";
  TS={variant,label,pool,timed,lives,queue:buildQueue(pool),i:0,ok:0,bad:0,streak:0,results:[],done:false};
  if(timed){
    TS.deadline=Date.now()+120000;
    typeTimer=setInterval(typeTick,200);
  }
  setFire("tcard",0);
  show("typequiz");renderType();
}
function typeTick(){
  if(!TS||TS.done)return;
  const left=Math.max(0,TS.deadline-Date.now());
  const s=Math.ceil(left/1000);
  const el=$("thearts");
  el.innerHTML=`<span class="timerbig ${s<=10?"low":""}">${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}</span>`;
  if(left<=0)typeTimeUp();
}
function typeTimeUp(){
  TS.done=true;
  clearInterval(typeTimer);
  $("tinput").readOnly=true;
  typeSave();
  $("sumlabel").textContent=TS.label;
  $("sumbest").classList.toggle("show",lastWasBest);
  $("sumok").textContent=TS.ok;$("sumbad").textContent=TS.bad;
  const t=TS.ok+TS.bad;
  $("sumacc").textContent=(t?Math.round(TS.ok/t*100):0)+"%";
  $("sumwords").innerHTML=breakdownHTML(TS.results);
  show("summary");
}
function renderType(){
  const w=TS.queue[TS.i];
  TS.answered=false;
  $("tchar").textContent=w[0];
  $("tseal").textContent=w[3]+"级";
  if(!TS.timed){
    if(TS.variant==="arcade")$("thearts").innerHTML=heartsHTML(TS.lives,false);
    else $("thearts").textContent="♥ ∞";
  }
  $("tok").textContent="✓ "+TS.ok;$("tbad").textContent="✗ "+TS.bad;
  $("tprog").textContent=(TS.i+1)+" / "+TS.queue.length+" words";
  $("tfill").style.width=(TS.i/TS.queue.length*100)+"%";
  const inp=$("tinput");
  inp.value="";inp.className="typeinput";inp.readOnly=false;inp.disabled=false;
  const res=$("tresult");
  res.className="typeresult";
  res.innerHTML="Tones aren't needed — for ü you can type u or v";
  $("tbtn").textContent="Check";
  inp.focus();
}
function typeAction(){TS.answered?typeNext():typeCheck()}
function typeKey(e){if(e.key==="Enter"){e.preventDefault();typeAction()}}
function typeCheck(){
  if(TS.answered||TS.done)return;
  const w=TS.queue[TS.i];
  const inp=$("tinput");
  if(!inp.value.trim())return;
  TS.answered=true;
  const right=pinyinMatch(inp.value,w[1]);
  inp.readOnly=true;
  inp.classList.add(right?"right":"wrong");
  const res=$("tresult");
  res.className="typeresult "+(right?"right":"wrong");
  res.innerHTML=`<span class="py">${pin(w[1])}</span><br>${esc(w[2])}`;
  inp.focus();
  TS.results.push({c:w[0],ok:right});
  if(right){TS.ok++;TS.streak++}else{TS.bad++;TS.streak=0;if(TS.variant==="arcade")TS.lives--}
  setFire("tcard",TS.streak);
  if(right&&TS.streak>=5)inp.classList.add("rainbow");
  const seen=store.get("hsk_seen",{});
  seen[w[0]]=(seen[w[0]]||0)+1;
  store.set("hsk_seen",seen);
  $("tok").textContent="✓ "+TS.ok;$("tbad").textContent="✗ "+TS.bad;
  if(!TS.timed){
    if(TS.variant==="arcade")$("thearts").innerHTML=heartsHTML(Math.max(TS.lives,0),!right);
    else $("thearts").textContent="♥ ∞";
  }
  $("tbtn").textContent=(!TS.timed&&TS.variant==="arcade"&&TS.lives<=0)?"Results →":((!TS.timed&&TS.i+1>=TS.queue.length)?"Finish →":"Next →");
}
function typeSave(){
  const hist=store.get("hsk_history",[]);
  hist.unshift({t:Date.now(),label:TS.label,ok:TS.ok,bad:TS.bad,words:TS.results});
  store.set("hsk_history",hist.slice(0,200));
  bumpStreak();
  recordWordStats(TS.results,"typing");
  lastWasBest=recordBest(TS.label,TS.ok,TS.bad);
}
function typeNext(){
  if(TS.done)return;
  if(TS.timed){
    TS.i++;
    if(TS.i>=TS.queue.length){TS.queue=shuffle([...TS.pool]);TS.i=0} // loop the deck until time runs out
    renderType();return;
  }
  if(TS.variant==="arcade"&&TS.lives<=0){
    typeSave();
    $("gook").textContent=TS.ok;$("gobad").textContent=TS.bad;
    const t=TS.ok+TS.bad;
    $("goacc").textContent=(t?Math.round(TS.ok/t*100):0)+"%";
    $("gowords").innerHTML=breakdownHTML(TS.results.filter(r=>!r.ok));
    show("gameover");return;
  }
  TS.i++;
  if(TS.i>=TS.queue.length){
    if(REFR&&REFR.active){recordWordStats(TS.results,"typing");if(refrAdvance(TS.results))return}
    typeSave();
    $("sumlabel").textContent=TS.label;
    $("sumok").textContent=TS.ok;$("sumbad").textContent=TS.bad;
    const t=TS.ok+TS.bad;
    $("sumacc").textContent=(t?Math.round(TS.ok/t*100):0)+"%";
    $("sumwords").innerHTML=breakdownHTML(TS.results);
    show("summary");return;
  }
  renderType();
}
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&TS&&TS.answered&&$("scr-typequiz").classList.contains("active")
     &&document.activeElement!==$("tinput")){
    e.preventDefault();typeNext();
  }
});
function typeEndEarly(){
  clearInterval(typeTimer);
  if(TS)TS.done=true;
  if(REFR&&REFR.active){refrEndEarly();return}
  if(TS&&TS.results.length)typeSave();
  show("home");
}

/* ---------- writing quiz engine (flashcard, self-graded) ---------- */
let WQ=null;
let writeTimer=null;
const WPAD={strokes:[],cur:null,size:0,cells:1,color:null,lockedCount:0};
function startWriteQuiz(pool,label,variant){
  againFn=()=>startWriteQuiz(pool,label,variant);
  clearInterval(writeTimer);
  const lives=variant==="arcade"?5:Infinity;
  const timed=variant==="timer";
  WQ={variant,timed,lives,label,pool,queue:buildQueue(pool),i:0,ok:0,bad:0,streak:0,results:[],done:false};
  if(timed){WQ.deadline=Date.now()+120000;writeTimer=setInterval(writeTick,200)}
  setFire("wcard",0);
  show("writequiz");
  requestAnimationFrame(()=>renderWrite());
}
function writeTick(){
  if(!WQ||WQ.done)return;
  const left=Math.max(0,WQ.deadline-Date.now());
  const s=Math.ceil(left/1000);
  $("whearts").innerHTML=`<span class="timerbig ${s<=10?"low":""}">${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}</span>`;
  if(left<=0)writeTimeUp();
}
function writeTimeUp(){
  WQ.done=true;
  clearInterval(writeTimer);
  writeFinish();
}
function renderWrite(){
  const w=WQ.queue[WQ.i];
  WQ.revealed=false;
  $("wen").textContent=w[2];
  $("wok").textContent="✓ "+WQ.ok;$("wbad").textContent="✗ "+WQ.bad;
  $("wprog").textContent=(WQ.i+1)+" / "+WQ.queue.length+" words";
  $("wfill").style.width=(WQ.i/WQ.queue.length*100)+"%";
  if(!WQ.timed){
    if(WQ.variant==="arcade")$("whearts").innerHTML=heartsHTML(WQ.lives,false);
    else $("whearts").textContent="♥ ∞";
  }
  $("wreveal").classList.remove("show");
  $("wgrade").classList.remove("show");
  $("wrevealbtn").style.display="block";
  setPenColor("ink");
  $("wpencolors").classList.remove("show");
  WPAD.strokes=[];WPAD.cur=null;WPAD.lockedCount=0;
  WPAD.cells=Math.min([...w[0]].length,4);
  sizeWCanvas();redrawWPad();
}
function writeReveal(){
  if(WQ.revealed)return;
  WQ.revealed=true;
  const w=WQ.queue[WQ.i];
  $("wzh").textContent=w[0];
  $("wpy").textContent=pin(w[1]);
  $("wreveal").classList.add("show");
  $("wrevealbtn").style.display="none";
  $("wgrade").classList.add("show");
  $("wpencolors").classList.add("show");
  WPAD.lockedCount=WPAD.strokes.length;
  setPenColor("red");
}
function setPenColor(key){
  WPAD.color=key==="ink"?null:key;
  ["ink","green","red"].forEach(k=>$("pc-"+k).classList.toggle("on",k===key));
}
function writeGrade(right){
  if(WQ.done)return;
  const w=WQ.queue[WQ.i];
  let drawing=null;
  try{ drawing=$("wcanvas").toDataURL("image/png"); }catch(e){}
  WQ.results.push({c:w[0],ok:right,drawing});
  if(right){WQ.ok++;WQ.streak++}else{WQ.bad++;WQ.streak=0;if(WQ.variant==="arcade")WQ.lives--}
  setFire("wcard",WQ.streak);
  const seen=store.get("hsk_seen",{});
  seen[w[0]]=(seen[w[0]]||0)+1;
  store.set("hsk_seen",seen);
  $("wok").textContent="✓ "+WQ.ok;$("wbad").textContent="✗ "+WQ.bad;
  if(!WQ.timed){
    if(WQ.variant==="arcade")$("whearts").innerHTML=heartsHTML(Math.max(WQ.lives,0),!right);
    else $("whearts").textContent="♥ ∞";
  }
  if(WQ.timed){
    WQ.i++;
    if(WQ.i>=WQ.queue.length){WQ.queue=shuffle([...WQ.pool]);WQ.i=0}
    renderWrite();return;
  }
  if(WQ.variant==="arcade"&&WQ.lives<=0){
    writeSave();
    $("gobest").classList.toggle("show",lastWasBest);
    $("gook").textContent=WQ.ok;$("gobad").textContent=WQ.bad;
    const t=WQ.ok+WQ.bad;
    $("goacc").textContent=(t?Math.round(WQ.ok/t*100):0)+"%";
    $("gowords").innerHTML=breakdownHTML(WQ.results.filter(r=>!r.ok));
    show("gameover");return;
  }
  WQ.i++;
  if(WQ.i>=WQ.queue.length){
    if(REFR&&REFR.active){recordWordStats(WQ.results,"writing");if(refrAdvance(WQ.results))return}
    writeFinish();return;
  }
  renderWrite();
}
function writeSave(){
  const hist=store.get("hsk_history",[]);
  hist.unshift({t:Date.now(),label:WQ.label,ok:WQ.ok,bad:WQ.bad,words:WQ.results});
  store.set("hsk_history",hist.slice(0,200));
  bumpStreak();
  recordWordStats(WQ.results,"writing");
  lastWasBest=recordBest(WQ.label,WQ.ok,WQ.bad);
}
function writeFinish(){
  writeSave();
  $("sumbest").classList.toggle("show",lastWasBest);
  $("sumlabel").textContent=WQ.label;
  $("sumok").textContent=WQ.ok;$("sumbad").textContent=WQ.bad;
  const t=WQ.ok+WQ.bad;
  $("sumacc").textContent=(t?Math.round(WQ.ok/t*100):0)+"%";
  $("sumwords").innerHTML=breakdownHTML(WQ.results);
  show("summary");
}
function writeEndEarly(){
  clearInterval(writeTimer);
  if(WQ)WQ.done=true;
  if(REFR&&REFR.active){refrEndEarly();return}
  if(WQ&&WQ.results.length)writeSave();
  show("home");
}
/* writing-mode drawing pad: one 米字格 cell per character */
function sizeWCanvas(){
  const c=$("wcanvas");
  const avail=c.parentElement.clientWidth-20;
  if(avail<=0)return;
  const cell=Math.min(avail/WPAD.cells,300);
  const w=cell*WPAD.cells,hgt=cell;
  const dpr=window.devicePixelRatio||1;
  WPAD.size=cell;
  c.width=w*dpr;c.height=hgt*dpr;
  c.style.width=w+"px";c.style.height=hgt+"px";
  c.style.margin="0 auto";
  c.getContext("2d").setTransform(dpr,0,0,dpr,0,0);
}
function redrawWPad(){
  const c=$("wcanvas"),ctx=c.getContext("2d"),cell=WPAD.size,n=WPAD.cells;
  if(!cell)return;
  ctx.clearRect(0,0,cell*n,cell);
  ctx.save();
  ctx.strokeStyle=cssVar("--line");ctx.lineWidth=1;
  for(let k=0;k<n;k++){
    const ox=k*cell;
    ctx.setLineDash([5,5]);
    ctx.beginPath();
    ctx.moveTo(ox+cell/2,0);ctx.lineTo(ox+cell/2,cell);
    ctx.moveTo(ox,cell/2);ctx.lineTo(ox+cell,cell/2);
    ctx.moveTo(ox,0);ctx.lineTo(ox+cell,cell);
    ctx.moveTo(ox+cell,0);ctx.lineTo(ox,cell);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeRect(ox+.5,.5,cell-1,cell-1);
  }
  ctx.restore();
  ctx.save();
  ctx.lineWidth=Math.max(5,cell/40);
  ctx.lineCap="round";ctx.lineJoin="round";
  const s=cell; // strokes normalised to cell height; x spans 0..n
  const COLORS={green:cssVar("--jade"),red:cssVar("--seal")};
  for(const st of WPAD.strokes){
    if(st.pts.length<2)continue;
    ctx.strokeStyle=COLORS[st.color]||cssVar("--ink");
    ctx.beginPath();
    ctx.moveTo(st.pts[0].x*s,st.pts[0].y*s);
    for(let i=1;i<st.pts.length-1;i++){
      const mx=(st.pts[i].x+st.pts[i+1].x)/2*s,my=(st.pts[i].y+st.pts[i+1].y)/2*s;
      ctx.quadraticCurveTo(st.pts[i].x*s,st.pts[i].y*s,mx,my);
    }
    const l=st.pts[st.pts.length-1];
    ctx.lineTo(l.x*s,l.y*s);
    ctx.stroke();
  }
  ctx.restore();
}
function wPadPoint(e){
  const r=$("wcanvas").getBoundingClientRect();
  return {x:(e.clientX-r.left)/WPAD.size,y:(e.clientY-r.top)/WPAD.size};
}
(function(){
  const c=$("wcanvas");
  c.addEventListener("pointerdown",e=>{
    e.preventDefault();
    c.setPointerCapture(e.pointerId);
    WPAD.cur={pts:[wPadPoint(e)],color:WPAD.color};
    WPAD.strokes.push(WPAD.cur);
  },{passive:false});
  c.addEventListener("pointermove",e=>{
    if(!WPAD.cur)return;
    e.preventDefault();
    WPAD.cur.pts.push(wPadPoint(e));
    redrawWPad();
  },{passive:false});
  const end=()=>{WPAD.cur=null};
  c.addEventListener("pointerup",end);
  c.addEventListener("pointercancel",end);
  c.addEventListener("touchmove",e=>e.preventDefault(),{passive:false});
  window.addEventListener("resize",()=>{
    if($("scr-writequiz").classList.contains("active")){sizeWCanvas();redrawWPad()}
  });
})();
function writeClear(){
  WPAD.strokes=WPAD.strokes.slice(0,WPAD.lockedCount);
  WPAD.cur=null;
  redrawWPad();
}
function writeUndo(){
  if(WPAD.strokes.length<=WPAD.lockedCount)return;
  WPAD.strokes.pop();
  WPAD.cur=null;
  redrawWPad();
}

/* ---------- sentence quiz engine ---------- */
let SS=null;
let sentTimer=null;
function startSentQuiz(pool,label,variant){
  againFn=()=>startSentQuiz(pool,label,variant);
  clearInterval(sentTimer);
  const lives=variant==="arcade"?5:Infinity;
  const timed=variant==="timer";
  SS={variant,timed,lives,label,pool,queue:shuffle([...pool]),i:0,ok:0,bad:0,streak:0,results:[],done:false};
  if(timed){SS.deadline=Date.now()+120000;sentTimer=setInterval(sentTick,200)}
  setFire("scard",0);
  show("sentquiz");renderSent();
}
function sentTick(){
  if(!SS||SS.done)return;
  const left=Math.max(0,SS.deadline-Date.now());
  const s=Math.ceil(left/1000);
  $("shearts").innerHTML=`<span class="timerbig ${s<=10?"low":""}">${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}</span>`;
  if(left<=0)sentTimeUp();
}
function sentTimeUp(){
  SS.done=true;
  clearInterval(sentTimer);
  document.querySelectorAll("#opts-sent .opt").forEach(b=>b.disabled=true);
  sentFinish();
}
function renderSent(){
  const q=SS.queue[SS.i];
  SS.answered=false;
  $("ssent").innerHTML=esc(q[1]).replace("___",'<span class="blank">＿＿＿</span>');
  $("sreveal").className="reveal";
  $("sok").textContent="✓ "+SS.ok;$("sbad").textContent="✗ "+SS.bad;
  $("sprog").textContent=(SS.i+1)+" / "+SS.queue.length;
  $("sfill").style.width=(SS.i/SS.queue.length*100)+"%";
  if(!SS.timed){
    if(SS.variant==="arcade")$("shearts").innerHTML=heartsHTML(SS.lives,false);
    else $("shearts").textContent="♥ ∞";
  }
  $("snext").disabled=true;
  const opts=shuffle([q[2],...q[3]]);
  $("opts-sent").innerHTML=opts.map(o=>
    `<button class="opt" onclick="answerSent(this,${o===q[2]})">${o}</button>`).join("");
}
function answerSent(btn,right){
  if(SS.answered||SS.done)return;SS.answered=true;
  const q=SS.queue[SS.i];
  [...$("opts-sent").children].forEach(b=>{b.disabled=true;if(b.textContent===q[2])b.classList.add("right")});
  if(!right)btn.classList.add("wrong");
  if(right){SS.ok++;SS.streak++}else{SS.bad++;SS.streak=0;if(SS.variant==="arcade")SS.lives--}
  setFire("scard",SS.streak);
  if(right&&SS.streak>=5)btn.classList.add("rainbow");
  SS.results.push({c:q[2],ok:right});
  $("ssent").innerHTML=esc(q[1]).replace("___",`<span class="filled ${right?"ok":""}">${q[2]}</span>`);
  $("srevealpy").textContent=pin(q[4]);
  $("srevealen").textContent=q[5];
  $("sreveal").className="reveal show "+(right?"right":"wrong");
  $("sok").textContent="✓ "+SS.ok;$("sbad").textContent="✗ "+SS.bad;
  if(!SS.timed){
    if(SS.variant==="arcade")$("shearts").innerHTML=heartsHTML(Math.max(SS.lives,0),!right);
    else $("shearts").textContent="♥ ∞";
  }
  $("snext").disabled=false;
  $("snext").textContent=(!SS.timed&&SS.variant==="arcade"&&SS.lives<=0)?"Results →":((!SS.timed&&SS.i+1>=SS.queue.length)?"Finish →":"Next →");
}
function sentNext(){
  if(SS.done)return;
  if(SS.timed){
    SS.i++;
    if(SS.i>=SS.queue.length){SS.queue=shuffle([...SS.pool]);SS.i=0}
    renderSent();return;
  }
  if(SS.variant==="arcade"&&SS.lives<=0){
    sentSaveGameOver();return;
  }
  SS.i++;
  if(SS.i>=SS.queue.length){
    if(REFR&&REFR.active){recordWordStats(SS.results,"sentences");if(refrAdvance(SS.results))return}
    sentFinish();return;
  }
  renderSent();
}
function sentSaveGameOver(){
  const hist=store.get("hsk_history",[]);
  hist.unshift({t:Date.now(),label:SS.label,ok:SS.ok,bad:SS.bad,words:SS.results});
  store.set("hsk_history",hist.slice(0,200));
  bumpStreak();
  recordWordStats(SS.results,"sentences");
  lastWasBest=recordBest(SS.label,SS.ok,SS.bad);
  $("gobest").classList.toggle("show",lastWasBest);
  $("gook").textContent=SS.ok;$("gobad").textContent=SS.bad;
  const t=SS.ok+SS.bad;
  $("goacc").textContent=(t?Math.round(SS.ok/t*100):0)+"%";
  $("gowords").innerHTML=breakdownHTML(SS.results.filter(r=>!r.ok));
  show("gameover");
}
function sentFinish(){
  const hist=store.get("hsk_history",[]);
  hist.unshift({t:Date.now(),label:SS.label,ok:SS.ok,bad:SS.bad,words:SS.results});
  store.set("hsk_history",hist.slice(0,200));
  bumpStreak();
  recordWordStats(SS.results,"sentences");
  lastWasBest=recordBest(SS.label,SS.ok,SS.bad);
  $("sumbest").classList.toggle("show",lastWasBest);
  $("sumlabel").textContent=SS.label;
  $("sumok").textContent=SS.ok;$("sumbad").textContent=SS.bad;
  const t=SS.ok+SS.bad;
  $("sumacc").textContent=(t?Math.round(SS.ok/t*100):0)+"%";
  $("sumwords").innerHTML=breakdownHTML(SS.results);
  show("summary");
}
function sentEndEarly(){
  clearInterval(sentTimer);
  if(SS)SS.done=true;
  if(REFR&&REFR.active){refrEndEarly();return}
  if(SS&&SS.results.length)sentFinish();else show("home");
}

/* ---------- leaderboard ---------- */
function renderLeaderboard(){
  const best=store.get("hsk_best",{});
  const entries=Object.entries(best).sort((a,b)=>b[1].ok-a[1].ok);
  $("lblist").innerHTML=entries.length?entries.map(([label,v],i)=>{
    const d=new Date(v.t);
    const date=d.toLocaleDateString(undefined,{day:"numeric",month:"short"});
    return `<div class="lbrow"><div class="rank">${i+1}</div>
      <div><div class="lbl">${esc(label)}</div>
      <div class="meta">${v.acc}% accuracy · ${date}</div></div>
      <div class="best">✓ ${v.ok}</div></div>`;
  }).join(""):`<div class="empty">No records yet — finish a session in any mode and your best score will appear here</div>`;
  renderCompBoard();
}
function clearBest(){
  if(confirm("Clear all personal bests?")){store.del("hsk_best");renderLeaderboard()}
}

/* ---------- competition leaderboard (named, per-level) ---------- */
let compBoardScope=null;
const COMP_SCOPE_ORDER=["HSK 1","HSK 2","HSK 3","HSK 4","Master","Master II"];
function renderCompBoard(){
  const board=store.get("hsk_competition",{});
  const scopes=Object.keys(board).sort((a,b)=>{
    const ia=COMP_SCOPE_ORDER.indexOf(a),ib=COMP_SCOPE_ORDER.indexOf(b);
    return (ia<0?99:ia)-(ib<0?99:ib);
  });
  if(!scopes.length){
    $("compboardtabs").innerHTML="";
    $("compboardlist").innerHTML=`<div class="empty">No competition scores yet — play Recognition → Competition and enter your name after a game to appear here</div>`;
    return;
  }
  if(!compBoardScope||!scopes.includes(compBoardScope))compBoardScope=scopes[0];
  $("compboardtabs").innerHTML=scopes.map(s=>
    `<div class="chip ${s===compBoardScope?"active":""}" onclick="setCompBoardScope('${esc(s)}')">${esc(s)}</div>`
  ).join("");
  const list=(board[compBoardScope]||[]).slice().sort((a,b)=>b.ok-a.ok||b.acc-a.acc);
  $("compboardlist").innerHTML=list.length?list.map((e,i)=>{
    const d=new Date(e.t);
    const date=d.toLocaleDateString(undefined,{day:"numeric",month:"short"});
    return `<div class="lbrow"><div class="rank">${i+1}</div>
      <div><div class="lbl">${esc(e.name)}</div>
      <div class="meta">${e.acc}% accuracy · ${date}</div></div>
      <div class="best">✓ ${e.ok}</div></div>`;
  }).join(""):`<div class="empty">No scores yet for ${esc(compBoardScope)}</div>`;
}
function setCompBoardScope(s){compBoardScope=s;renderCompBoard()}
function clearCompBoard(){
  if(confirm("Clear all competition leaderboard scores?")){store.del("hsk_competition");compBoardScope=null;renderCompBoard()}
}

/* ---------- statistics ---------- */
let statSort="worst";
function setStatSort(mode){
  statSort=mode;
  document.querySelectorAll("#statfilters .chip").forEach(c=>c.classList.toggle("active",c.dataset.sort===mode));
  renderStatWords();
}
function renderStats(){
  statSort="worst";
  document.querySelectorAll("#statfilters .chip").forEach(c=>c.classList.toggle("active",c.dataset.sort==="worst"));
  $("statsearch").value="";
  const hist=store.get("hsk_history",[]);
  const wstats=store.get("hsk_word_stats",{});
  const wordEntries=Object.entries(wstats);

  const totalSessions=hist.length;
  const totalOk=hist.reduce((a,h)=>a+h.ok,0);
  const totalBad=hist.reduce((a,h)=>a+h.bad,0);
  const totalAttempts=totalOk+totalBad;
  const overallAcc=totalAttempts?Math.round(totalOk/totalAttempts*100):0;
  const uniqueWords=wordEntries.length;
  const totalVocab=allWords().length;
  const daysActive=new Set(hist.map(h=>new Date(h.t).toDateString())).size;
  const masteredCount=wordEntries.filter(([,s])=>{
    const t=s.ok+s.bad;return t>=2&&Math.round(s.ok/t*100)>=80;
  }).length;

  $("statoverview").innerHTML=`
    <div class="statcard"><div class="num">${totalSessions}</div><div class="lbl">Sessions played</div></div>
    <div class="statcard"><div class="num jade">${overallAcc}%</div><div class="lbl">Overall accuracy</div></div>
    <div class="statcard"><div class="num">${uniqueWords}<span style="font-size:14px;color:var(--muted);font-weight:600"> / ${totalVocab}</span></div><div class="lbl">Words practiced</div></div>
    <div class="statcard"><div class="num jade">${masteredCount}</div><div class="lbl">Words mastered (80%+)</div></div>
    <div class="statcard"><div class="num seal">${totalBad}</div><div class="lbl">Total mistakes</div></div>
    <div class="statcard"><div class="num">${daysActive}</div><div class="lbl">Days active</div></div>
  `;
  renderAccuracyChart(hist);
  renderActivityChart(hist);
  renderStatWords();
}
function renderAccuracyChart(hist){
  const el=$("chartacc");
  if(!hist.length){
    $("chartacctitle").textContent="";
    el.innerHTML=`<div class="chart-empty">No sessions yet — play a round and your trend will show up here</div>`;
    return;
  }
  // hist is newest-first; take the most recent 20 and put in chronological order
  const recent=hist.slice(0,20).slice().reverse();
  $("chartacctitle").textContent=`Last ${recent.length} session${recent.length===1?"":"s"}`;
  const pts=recent.map(h=>{
    const t=h.ok+h.bad;
    return t?Math.round(h.ok/t*100):0;
  });
  const W=280,H=90,pad=8;
  const n=pts.length;
  const stepX=n>1?(W-pad*2)/(n-1):0;
  const toXY=(v,i)=>{
    const x=pad+i*stepX;
    const y=pad+(H-pad*2)*(1-v/100);
    return [x,y];
  };
  const coords=pts.map((v,i)=>toXY(v,i));
  const linePath=coords.map(([x,y],i)=>(i===0?"M":"L")+x.toFixed(1)+","+y.toFixed(1)).join(" ");
  const fillPath=linePath+` L${coords[coords.length-1][0].toFixed(1)},${H-pad} L${coords[0][0].toFixed(1)},${H-pad} Z`;
  const dots=coords.map(([x,y],i)=>
    `<circle class="chart-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i===coords.length-1?3.5:2.2}"></circle>`
  ).join("");
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <line class="chart-axis" x1="${pad}" y1="${pad}" x2="${pad}" y2="${H-pad}"></line>
    <line class="chart-axis" x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}"></line>
    <path class="chart-fill" d="${fillPath}"></path>
    <path class="chart-line" d="${linePath}"></path>
    ${dots}
  </svg>`;
}
function renderActivityChart(hist){
  const el=$("chartactivity");
  const DAYS=14;
  const today=new Date();today.setHours(0,0,0,0);
  const buckets=[];
  for(let i=DAYS-1;i>=0;i--){
    const d=new Date(today);d.setDate(d.getDate()-i);
    buckets.push({date:d,count:0,ok:0,bad:0});
  }
  hist.forEach(h=>{
    const d=new Date(h.t);d.setHours(0,0,0,0);
    const idx=buckets.findIndex(b=>b.date.getTime()===d.getTime());
    if(idx>=0){buckets[idx].count++;buckets[idx].ok+=h.ok;buckets[idx].bad+=h.bad}
  });
  const hasAny=buckets.some(b=>b.count>0);
  if(!hasAny){
    el.innerHTML=`<div class="chart-empty">No activity in the last ${DAYS} days yet</div>`;
    return;
  }
  const W=280,H=90,pad=6,gap=3;
  const barW=(W-pad*2-gap*(DAYS-1))/DAYS;
  const maxCount=Math.max(1,...buckets.map(b=>b.count));
  const bars=buckets.map((b,i)=>{
    const x=pad+i*(barW+gap);
    const h=b.count?Math.max(4,(H-pad*2)*(b.count/maxCount)):2;
    const y=H-pad-h;
    const isToday=i===DAYS-1;
    const cls=b.count?(isToday?"chart-bar today":"chart-bar"):"chart-bar empty";
    const label=b.date.toLocaleDateString(undefined,{weekday:"narrow"});
    return `<rect class="${cls}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="2"></rect>
      <text class="chart-tt" x="${(x+barW/2).toFixed(1)}" y="${H-pad+11}" text-anchor="middle">${label}</text>`;
  }).join("");
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H+14}" preserveAspectRatio="none">${bars}</svg>`;
}
function renderStatWords(){
  const wstats=store.get("hsk_word_stats",{});
  const q=($("statsearch").value||"").trim().toLowerCase();
  const dict=allWords();
  let rows=Object.entries(wstats).map(([c,s])=>{
    const w=dict.find(x=>x[0]===c)||[c,"",""];
    const t=s.ok+s.bad;
    const acc=t?Math.round(s.ok/t*100):0;
    return {c,py:w[1],en:w[2],ok:s.ok,bad:s.bad,acc,total:t,lastSeen:s.lastSeen||0};
  });
  if(q){
    rows=rows.filter(r=>r.c.includes(q)||pin(r.py).toLowerCase().includes(q)||r.en.toLowerCase().includes(q));
  }
  switch(statSort){
    case "worst": rows.sort((a,b)=>a.acc-b.acc||b.total-a.total); break;
    case "best": rows.sort((a,b)=>b.acc-a.acc||b.total-a.total); break;
    case "recent": rows.sort((a,b)=>b.lastSeen-a.lastSeen); break;
    case "most": rows.sort((a,b)=>b.total-a.total); break;
  }
  $("statwordlist").innerHTML=rows.length?rows.map(r=>{
    const accClass=r.acc>=80?"high":r.acc>=50?"mid":"low";
    return `<div class="wordstat-row">
      <div class="zh">${r.c}</div>
      <div class="info"><div class="py">${pin(r.py)}</div><div class="en">${esc(r.en)}</div></div>
      <div class="stat-nums">
        <div class="stat-acc ${accClass}">${r.acc}%</div>
        <div class="stat-counts">✓${r.ok} ✗${r.bad}</div>
      </div>
    </div>`;
  }).join(""):`<div class="empty">${q?"No words match your search":"No words practiced yet — finish a session and word-level stats will appear here"}</div>`;
}
function clearWordStats(){
  if(confirm("Clear all statistics? This removes word mastery data but keeps your past scores and leaderboard.")){
    store.del("hsk_word_stats");
    renderStats();
  }
}

/* ---------- history ---------- */
function renderHistory(){
  const hist=store.get("hsk_history",[]);
  $("historylist").innerHTML=hist.length?hist.map((h,i)=>{
    const d=new Date(h.t);
    const date=d.toLocaleDateString(undefined,{day:"numeric",month:"short"})+" "+d.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"});
    return `<div class="hitem" onclick="this.classList.toggle('open')">
      <div class="top"><span class="mode">${esc(h.label)}</span><span class="date">${date}</span></div>
      <div class="nums"><span class="ok">✓ ${h.ok}</span> · <span class="bad">✗ ${h.bad}</span> · ${h.ok+h.bad?Math.round(h.ok/(h.ok+h.bad)*100):0}% — tap for breakdown</div>
      <div class="breakdown">${breakdownHTML(h.words)}</div></div>`;
  }).join(""):`<div class="empty">No sessions yet — play a round and your scores will show up here</div>`;
}
function clearHistory(){
  if(confirm("Clear all past scores?")){store.del("hsk_history");renderHistory()}
}

/* ---------- word list + detail ---------- */
const POS_LABEL={noun:"Noun",verb:"Verb",adj:"Adj.",adv:"Adv.",pronoun:"Pron.",function:"Gram.",idiom:"Idiom",custom:"Custom"};
let wlTab=1;
let wlPos="all";
function wlCurrentWords(){
  if(typeof wlTab==="string"&&wlTab.startsWith("wl:")){
    const id=wlTab.slice(3);
    const lists=getWordlists();
    const l=lists[id];
    if(!l)return[];
    const chars=new Set(l.words);
    return allWords().filter(w=>chars.has(w[0]));
  }
  if(wlTab===6)return getUserWords();
  return WORDS.filter(w=>w[3]===wlTab);
}
function renderPosFilters(){
  const present=new Set(wlCurrentWords().map(w=>w[4]));
  const opts=[["all","All"],...Object.entries(POS_LABEL).filter(([k])=>present.has(k))];
  if(!opts.some(([k])=>k===wlPos))wlPos="all";
  $("wlposfilters").innerHTML=opts.map(([k,label])=>
    `<button class="tab ${wlPos===k?"on":""}" onclick="wlPos='${k}';renderPosFilters();renderWordlist()">${label}</button>`).join("");
}
function ensureMyWordsList(){
  const lists=getWordlists();
  if(!lists[MY_WORDS_LIST_ID]){
    lists[MY_WORDS_LIST_ID]={name:"My Words",words:[],created:Date.now(),pinned:true};
    saveWordlists(lists);
  }
}
function toggleWlFilters(){
  const el=$("wlposfilters");
  const btn=$("wlfilterbtn");
  const showing=el.style.display==="none"||!el.style.display;
  el.style.display=showing?"flex":"none";
  btn.classList.toggle("on",showing);
}
function openWordlist(){
  ensureMyWordsList();
  const lists=getWordlists();
  const wlEntries=Object.entries(lists).sort((a,b)=>{
    if(a[0]===MY_WORDS_LIST_ID)return 1;
    if(b[0]===MY_WORDS_LIST_ID)return -1;
    return b[1].created-a[1].created;
  });
  const hskTabsHtml=TABS.map(([lv,name])=>
    `<button class="tab ${lv===wlTab?"on":""}" onclick="wlTab=${lv};openWordlist()">${name}</button>`).join("");
  const wlTabsHtml=wlEntries.map(([id,l])=>
    `<button class="tab wl ${wlTab===("wl:"+id)?"on":""}" onclick="wlTab='wl:${id}';openWordlist()">${esc(l.name||"Untitled")}</button>`).join("");
  $("wltabs").innerHTML=hskTabsHtml+wlTabsHtml;
  renderPosFilters();
  renderWordlist();show("wordlist");
}
function renderWordlist(){
  const q=$("wlsearch").value.trim().toLowerCase();
  const list=wlCurrentWords().filter(w=>(wlPos==="all"||w[4]===wlPos)
    &&(!q||w[0].includes(q)||pin(w[1]).toLowerCase().includes(q)||w[1].toLowerCase().includes(q)||w[2].toLowerCase().includes(q)));
  const pinned=new Set(store.get("hsk_pins",[]));
  list.sort((a,b)=>(pinned.has(b[0])?1:0)-(pinned.has(a[0])?1:0)); // stable: pinned float up, order kept
  $("wlcount").textContent=list.length+" word"+(list.length===1?"":"s");
  $("wllist").innerHTML=list.map(w=>{
    const isCustom=w[3]===6;
    const actions=isCustom?`<span class="wrow-actions">
        <span class="wrow-edit" title="Edit" onclick="event.stopPropagation();openEditWord('${w[0]}')">✎</span>
        <span class="wrow-del" title="Delete" onclick="event.stopPropagation();deleteCustomWord('${w[0]}')">✕</span>
      </span>`:"";
    return `<button class="wrow" onclick="openDetail('${w[0]}')">
      <span class="zh">${w[0]}</span><span><div class="py">${pin(w[1])}</div><div class="en">${esc(w[2])}</div></span>
      <span class="poschip ${w[4]}">${POS_LABEL[w[4]]}</span>
      ${actions}
      <span class="pin ${pinned.has(w[0])?"on":""}" title="Pin to top"
        onclick="event.stopPropagation();togglePin('${w[0]}')">★</span></button>`;
  }).join("")
    ||`<div class="empty">No words match your search</div>`;
}
/* ---------- inline add-word form on the Word List page ---------- */
const WLADD_POS_OPTIONS=[["noun","Noun"],["verb","Verb"],["adj","Adj."],["adv","Adv."],["pronoun","Pron."],["function","Gram."],["idiom","Idiom"]];
let wladdPos="noun";
function renderWlAddPosChips(){
  $("wladdposchips").innerHTML=WLADD_POS_OPTIONS.map(([k,label])=>
    `<button type="button" class="awc-poschip ${wladdPos===k?"on":""}" onclick="wladdPos='${k}';renderWlAddPosChips()">${label}</button>`).join("");
}
function toggleWlAddForm(){
  const card=$("wladdcard");
  const open=card.classList.contains("open");
  card.classList.toggle("open",!open);
  $("wladdchev").textContent=open?"＋":"－";
  if(!open){renderWlAddPosChips();$("wladd-zh").focus()}
}
function previewWlAddPinyin(){
  const raw=$("wladd-py").value.trim();
  $("wladdpreview").textContent=raw?("Preview: "+pin(raw)):"";
}
function submitWlAddWord(){
  const zh=$("wladd-zh").value.trim();
  const py=$("wladd-py").value.trim();
  const en=$("wladd-en").value.trim();
  if(!zh||!py||!en){alert("Please fill in the character(s), pinyin, and meaning.");return}
  if(allWords().some(w=>w[0]===zh)){alert("That word already exists — search for it above instead of adding a duplicate.");return}
  const words=getUserWords();
  words.push([zh,py,en,6,wladdPos]);
  saveUserWords(words);
  addToMyWordsList(zh);
  $("wladd-zh").value="";$("wladd-py").value="";$("wladd-en").value="";
  $("wladdpreview").textContent="";
  wladdPos="noun";
  toggleWlAddForm();
  wlTab="wl:"+MY_WORDS_LIST_ID;
  openWordlist();
}

/* ---------- edit / delete custom words from the Word List page ---------- */
let editingWordChar=null;
let ewPos="noun";
function renderEwPosChips(){
  $("ewposchips").innerHTML=WLADD_POS_OPTIONS.map(([k,label])=>
    `<button type="button" class="awc-poschip ${ewPos===k?"on":""}" onclick="ewPos='${k}';renderEwPosChips()">${label}</button>`).join("");
}
function openEditWord(c){
  const w=allWords().find(x=>x[0]===c);
  if(!w||w[3]!==6)return; // only custom words are editable
  editingWordChar=c;
  $("ewzh").value=w[0];
  $("ewpy").value=w[1];
  $("ewen").value=w[2];
  $("ewpreview").textContent="Preview: "+pin(w[1]);
  ewPos=WLADD_POS_OPTIONS.some(([k])=>k===w[4])?w[4]:"noun";
  renderEwPosChips();
  $("editwordsheet").classList.add("show");
}
function closeEditWord(){
  $("editwordsheet").classList.remove("show");
  editingWordChar=null;
}
function previewEwPinyin(){
  const raw=$("ewpy").value.trim();
  $("ewpreview").textContent=raw?("Preview: "+pin(raw)):"";
}
function saveEditWord(){
  const zh=$("ewzh").value.trim();
  const py=$("ewpy").value.trim();
  const en=$("ewen").value.trim();
  if(!zh||!py||!en){alert("Please fill in the character(s), pinyin, and meaning.");return}
  if(zh!==editingWordChar&&allWords().some(w=>w[0]===zh)){alert("That word already exists — choose a different character.");return}
  const words=getUserWords();
  const idx=words.findIndex(w=>w[0]===editingWordChar);
  if(idx<0){closeEditWord();return}
  words[idx]=[zh,py,en,6,ewPos];
  saveUserWords(words);
  // keep the word in any personal wordlists / pins it was already part of, following the rename
  if(zh!==editingWordChar){
    const lists=getWordlists();
    let changed=false;
    Object.values(lists).forEach(l=>{
      const i=l.words.indexOf(editingWordChar);
      if(i>=0){l.words[i]=zh;changed=true}
    });
    if(changed)saveWordlists(lists);
    const pins=store.get("hsk_pins",[]);
    const pi=pins.indexOf(editingWordChar);
    if(pi>=0){pins[pi]=zh;store.set("hsk_pins",pins)}
  }
  closeEditWord();
  openWordlist();
}
function deleteCustomWord(c){
  const w=allWords().find(x=>x[0]===c);
  if(!w||w[3]!==6)return;
  if(!confirm(`Delete "${c}"? This removes it from your custom words and any wordlists it's in.`))return;
  const words=getUserWords().filter(x=>x[0]!==c);
  saveUserWords(words);
  const lists=getWordlists();
  let changed=false;
  Object.values(lists).forEach(l=>{
    const i=l.words.indexOf(c);
    if(i>=0){l.words.splice(i,1);changed=true}
  });
  if(changed)saveWordlists(lists);
  const pins=store.get("hsk_pins",[]).filter(x=>x!==c);
  store.set("hsk_pins",pins);
  openWordlist();
}

function togglePin(c){
  const pins=store.get("hsk_pins",[]);
  const i=pins.indexOf(c);
  i>=0?pins.splice(i,1):pins.push(c);
  store.set("hsk_pins",pins);
  renderWordlist();
}
function openDetail(c){
  const w=allWords().find(x=>x[0]===c);if(!w)return;
  $("dchar").textContent=w[0];$("dpy").textContent=pin(w[1]);$("den").textContent=w[2];
  $("dseal").textContent=levelBadge(w[3]);
  const p=$("dpos");p.textContent=POS_LABEL[w[4]];p.className="poschip "+w[4];
  detailTab("write");
  show("worddetail");
  setupPractice(w[0]);
  renderMySentences(w[0]);
}
function detailTab(which){
  $("dtabs").children[0].classList.toggle("on",which==="write");
  $("dtabs").children[1].classList.toggle("on",which==="sentences");
  $("panel-write").style.display=which==="write"?"block":"none";
  $("panel-sentences").style.display=which==="sentences"?"block":"none";
}
/* ---------- my sentences (word detail) ---------- */
let mySentChar=null;
function renderMySentences(c){
  mySentChar=c;
  const all=store.get("hsk_mysentences",{});
  const list=all[c]||[];
  $("mysentlist").innerHTML=list.length?list.map((s,i)=>
    `<div class="sent" style="position:relative">
      <button class="pin" style="position:absolute;top:10px;right:12px;color:var(--seal)" onclick="deleteMySentence(${i})">✕</button>
      <div class="zh" style="padding-right:22px">${esc(s.zh)}</div>
      ${s.py?`<div class="py">${esc(s.py)}</div>`:""}
      ${s.en?`<div class="en">${esc(s.en)}</div>`:""}
    </div>`).join("")
    :`<div class="empty">No sentences yet — write your own example below to help it stick</div>`;
}
function addMySentence(){
  const zh=$("msinput").value.trim();
  if(!zh)return;
  const py=$("mspyinput").value.trim();
  const en=$("msenginput").value.trim();
  const all=store.get("hsk_mysentences",{});
  if(!all[mySentChar])all[mySentChar]=[];
  all[mySentChar].push({zh,py,en});
  store.set("hsk_mysentences",all);
  $("msinput").value="";$("mspyinput").value="";$("msenginput").value="";
  renderMySentences(mySentChar);
}
function deleteMySentence(i){
  const all=store.get("hsk_mysentences",{});
  if(!all[mySentChar])return;
  all[mySentChar].splice(i,1);
  store.set("hsk_mysentences",all);
  renderMySentences(mySentChar);
}

/* ---------- help modal ---------- */
let _hp=0,_htx=null,_hty=null;
const _TOTAL=9;
const HELP_PAGE_FOR_SCREEN={
  wordlist:0,
  mywordlists:1,wordlisteditor:1,swipe:1,
  worddetail:2,
  quiz:3,
  typequiz:4,writequiz:4,
  sentquiz:5,
  history:6,
  stats:7,
  leaderboard:8
};
const HELP_PAGE_FOR_CATEGORY={guessing:3,typing:4,writing:4,sentences:5};
function helpPageForContext(){
  const active=document.querySelector(".screen.active");
  const id=active?active.id.slice(4):"";
  if(id==="modeselect"||id==="levels"||id==="wordlistlevels")
    return HELP_PAGE_FOR_CATEGORY[pendingCategory]??0;
  return HELP_PAGE_FOR_SCREEN[id]??0;
}
function openHelp(){
  _hp=helpPageForContext();
  _helpSync(false);
  document.getElementById("helpoverlay").classList.add("show");
  document.documentElement.style.overflow='hidden';
  document.body.style.overflow='hidden';
  const toggle=document.querySelector(".helptoggle");
  if(toggle)toggle.classList.add("seen");
  store.set("hsk_help_seen","1");
}
function closeHelp(e){
  if(!e||e.target===document.getElementById("helpoverlay")){
    document.getElementById("helpoverlay").classList.remove("show");
    document.documentElement.style.overflow='';
    document.body.style.overflow='';
  }
}
function helpNavPage(d){
  const cat=Math.floor(_hp/3);
  const idx=_hp%3;
  const newIdx=idx+d;
  if(newIdx<0||newIdx>=3){
    // crossed a category boundary — jump to next/prev category, always landing on page 1
    const newCat=cat+d;
    if(newCat<0||newCat>=3)return;
    _hp=newCat*3;
    _helpSync(true);
    return;
  }
  _hp=cat*3+newIdx;
  _helpSync(true);
}
function helpNavCat(d){
  const cat=Math.floor(_hp/3);
  const newCat=cat+d;
  if(newCat<0||newCat>=3)return;
  _hp=newCat*3;
  _helpSync(true);
}
function _helpSync(anim){
  const tr=document.getElementById("helptrack");
  tr.style.transition=anim?"transform .35s cubic-bezier(.34,.1,.68,1)":"none";
  tr.style.transform="translateX("+(-_hp*100)+"%)";
  const cat=Math.floor(_hp/3);
  const idx=_hp%3;
  
  // Update page counter in header
  const counter=document.getElementById("help-page-counter");
  if(counter)counter.textContent=`Page ${idx+1}/3`;
  
  // Update page dots (3 dots for current page position within category)
  document.querySelectorAll(".helpdot").forEach((d,i)=>d.classList.toggle("on",i===idx));
  
  // Update category button states
  const back=document.getElementById("help-btn-back");
  const fwd=document.getElementById("help-btn-fwd");
  
  if(back)back.disabled=cat===0;
  if(fwd)fwd.disabled=cat===2;

  // Page chevrons: single-page steps, disabled at the very first/last page
  const chevL=document.getElementById("help-chev-left");
  const chevR=document.getElementById("help-chev-right");
  if(chevL)chevL.disabled=_hp===0;
  if(chevR)chevR.disabled=_hp===8;
}
function helpTouchStart(e){_htx=e.touches[0].clientX;_hty=e.touches[0].clientY}
function helpTouchMove(e){if(_htx===null)return;if(Math.abs(e.touches[0].clientX-_htx)>Math.abs(e.touches[0].clientY-_hty)+6)e.preventDefault()}
function helpTouchEnd(e){
  if(_htx===null)return;
  const dx=e.changedTouches[0].clientX-_htx;_htx=null;_hty=null;
  if(Math.abs(dx)>80)helpNavPage(dx<0?1:-1);
}
(function(){
  const vp=document.getElementById("helpviewport");
  if(vp)vp.addEventListener("touchmove",helpTouchMove,{passive:false});
})();
document.addEventListener("keydown",e=>{
  if(!document.getElementById("helpoverlay").classList.contains("show"))return;
  if(e.key==="ArrowRight")helpNavPage(1);
  if(e.key==="ArrowLeft")helpNavPage(-1);
  if(e.key==="ArrowUp"||e.key===" ")helpNavCat(-1);
  if(e.key==="ArrowDown")helpNavCat(1);
  if(e.key==="Escape")closeHelp();
});

/* ---------- theme ---------- */
function applyTheme(t){
  document.documentElement.dataset.theme=t;
  store.set("hsk_theme",t);
  const dark=t==="dark";
  $("themedot").textContent=dark?"明":"暗";
  $("themelabel").textContent=dark?"Light":"Dark";
  let m=document.querySelector('meta[name="theme-color"]');
  if(!m){m=document.createElement("meta");m.name="theme-color";document.head.appendChild(m)}
  m.content=dark?"#16171C":"#F4F4F1";
}
let _themeTransitionTimer=null;
function toggleTheme(){
  const root=document.documentElement;
  root.classList.add("theme-transitioning");
  clearTimeout(_themeTransitionTimer);
  _themeTransitionTimer=setTimeout(()=>root.classList.remove("theme-transitioning"),420);
  applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark");
}
applyTheme(store.get("hsk_theme",window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"));
if(store.get("hsk_help_seen",false)){
  const toggle=document.querySelector(".helptoggle");
  if(toggle)toggle.classList.add("seen");
}

/* ---------- writing practice pad (word detail) ---------- */
const DW={chars:[],idx:0,strokes:[],cur:null,guide:true,size:0};
function cssVar(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
function setupPractice(word){
  DW.chars=[...word];DW.idx=0;DW.strokes=[];DW.cur=null;
  renderChips();
  requestAnimationFrame(()=>{sizeCanvas();redrawPad()});
}
function renderChips(){
  $("dchips").innerHTML=DW.chars.map((c,i)=>
    `<button class="charchip ${i===DW.idx?"on":""}" onclick="pickChip(${i})">${c}</button>`).join("");
  $("dchips").style.display=DW.chars.length>1?"flex":"none";
}
function pickChip(i){DW.idx=i;DW.strokes=[];renderChips();redrawPad()}
function sizeCanvas(){
  const c=$("dcanvas");
  const w=Math.min(c.parentElement.clientWidth-20,240);
  if(w<=0)return;
  const dpr=window.devicePixelRatio||1;
  DW.size=w;
  c.width=w*dpr;c.height=w*dpr;
  c.style.width=w+"px";c.style.height=w+"px";
  c.getContext("2d").setTransform(dpr,0,0,dpr,0,0);
}
function redrawPad(){
  const c=$("dcanvas"),ctx=c.getContext("2d"),s=DW.size;
  if(!s)return;
  ctx.clearRect(0,0,s,s);
  // 米字格 practice-paper guides
  ctx.save();
  ctx.strokeStyle=cssVar("--line");ctx.lineWidth=1;ctx.setLineDash([5,5]);
  ctx.beginPath();
  ctx.moveTo(s/2,0);ctx.lineTo(s/2,s);
  ctx.moveTo(0,s/2);ctx.lineTo(s,s/2);
  ctx.moveTo(0,0);ctx.lineTo(s,s);
  ctx.moveTo(s,0);ctx.lineTo(0,s);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeRect(.5,.5,s-1,s-1);
  ctx.restore();
  // faint template character to trace
  if(DW.guide&&DW.chars[DW.idx]){
    ctx.save();
    ctx.globalAlpha=.14;
    ctx.fillStyle=cssVar("--ink");
    ctx.font=`600 ${s*.72}px "Noto Serif SC","Songti SC","SimSun",serif`;
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(DW.chars[DW.idx],s/2,s*.54);
    ctx.restore();
  }
  // ink strokes (stored as 0..1 coordinates so resizing keeps them)
  ctx.save();
  ctx.strokeStyle=cssVar("--ink");
  ctx.lineWidth=Math.max(5,s/40);
  ctx.lineCap="round";ctx.lineJoin="round";
  for(const st of DW.strokes)drawStroke(ctx,st,s);
  ctx.restore();
}
function drawStroke(ctx,pts,s){
  if(pts.length<2)return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x*s,pts[0].y*s);
  for(let i=1;i<pts.length-1;i++){
    const mx=(pts[i].x+pts[i+1].x)/2*s,my=(pts[i].y+pts[i+1].y)/2*s;
    ctx.quadraticCurveTo(pts[i].x*s,pts[i].y*s,mx,my);
  }
  const l=pts[pts.length-1];
  ctx.lineTo(l.x*s,l.y*s);
  ctx.stroke();
}
function padPoint(e){
  const r=$("dcanvas").getBoundingClientRect();
  return {x:(e.clientX-r.left)/DW.size,y:(e.clientY-r.top)/DW.size};
}
(function(){
  const c=$("dcanvas");
  c.addEventListener("pointerdown",e=>{
    e.preventDefault();
    c.setPointerCapture(e.pointerId);
    DW.cur=[padPoint(e)];
    DW.strokes.push(DW.cur);
  },{passive:false});
  c.addEventListener("pointermove",e=>{
    if(!DW.cur)return;
    e.preventDefault();
    DW.cur.push(padPoint(e));
    redrawPad();
  },{passive:false});
  const end=e=>{DW.cur=null};
  c.addEventListener("pointerup",end);
  c.addEventListener("pointercancel",end);
  // belt-and-braces: some mobile browsers still scroll on touchmove unless
  // this is blocked directly, even with touch-action:none + pointer preventDefault
  c.addEventListener("touchmove",e=>e.preventDefault(),{passive:false});
  window.addEventListener("resize",()=>{
    if($("scr-worddetail").classList.contains("active")){sizeCanvas();redrawPad()}
  });
})();
function drawClear(){DW.strokes=[];DW.cur=null;redrawPad()}
function drawGuideToggle(){
  DW.guide=!DW.guide;
  $("dguidebtn").textContent="Guide: "+(DW.guide?"on":"off");
  redrawPad();
}

function openScopeFromTile(e){
  if(e){e.stopPropagation();e.preventDefault()}
  openRefresherScope();
}

/* ---------- wordlist swipe practice (home widget + full-screen session) ---------- */
function getSwipeFam(){return store.get("hsk_swipe_fam",{})}
function saveSwipeFam(o){store.set("hsk_swipe_fam",o)}
function getMasteredSwipeWords(){return new Set(store.get("hsk_mastered",[]))}
function markSwipeMastered(c){
  const m=store.get("hsk_mastered",[]);
  if(!m.includes(c)){m.push(c);store.set("hsk_mastered",m)}
}
function getSwipeScope(){return store.get("hsk_swipe_scope",{mode:"all"})}
function saveSwipeScopeObj(s){store.set("hsk_swipe_scope",s)}
function swipeScopedPool(){
  const scope=getSwipeScope();
  const dict=allWords();
  if(scope.mode==="level")return dict.filter(w=>w[3]===scope.level);
  if(scope.mode==="wordlist"){
    const lists=getWordlists();
    const l=lists[scope.id];
    if(!l)return dict;
    const chars=new Set(l.words);
    return dict.filter(w=>chars.has(w[0]));
  }
  return dict;
}
function swipeScopeLabel(){
  const scope=getSwipeScope();
  if(scope.mode==="level"){
    const found=LEVELS.find(l=>l[0]===scope.level);
    return found?found[1]:("HSK "+scope.level);
  }
  if(scope.mode==="wordlist"){
    const lists=getWordlists();
    const l=lists[scope.id];
    return l?(l.name||"Untitled list"):"All words";
  }
  return "All words";
}
function updateSwipeCardSummary(){
  const el=$("swipesub");
  if(!el)return;
  const pool=swipeScopedPool();
  el.textContent=swipeScopeLabel()+" · "+pool.length+" word"+(pool.length===1?"":"s");
  const mEl=$("swipemastered");
  if(mEl){
    const mastered=getMasteredSwipeWords();
    const count=pool.filter(w=>mastered.has(w[0])).length;
    mEl.textContent=count+" of "+pool.length+" word"+(pool.length===1?"":"s")+" mastered";
  }
}
function openSwipeListPicker(){
  renderSwipeListPicker();
  $("swipescopesheet").classList.add("show");
}
function closeSwipeListPicker(){
  $("swipescopesheet").classList.remove("show");
}
function pickSwipeScope(scope){
  saveSwipeScopeObj(scope);
  updateSwipeCardSummary();
  closeSwipeListPicker();
}
function pickSwipeScopeAll(){pickSwipeScope({mode:"all"})}
function pickSwipeScopeLevel(lv){pickSwipeScope({mode:"level",level:lv})}
function pickSwipeScopeWordlist(id){pickSwipeScope({mode:"wordlist",id:id})}
function renderSwipeListPicker(){
  const scope=getSwipeScope();
  const lists=getWordlists();
  const entries=Object.entries(lists).sort((a,b)=>b[1].created-a[1].created);
  let html=`<button class="wrow ${scope.mode==="all"?"sel":""}" onclick="pickSwipeScopeAll()">
    <span><div class="py">All words</div><div class="en">Every HSK level combined</div></span>
    <span class="tick">✓</span></button>`;
  html+=`<div class="sechead" style="margin-top:14px">By level</div>`;
  LEVELS.forEach(([lv,name])=>{
    const on=scope.mode==="level"&&scope.level===lv;
    html+=`<button class="wrow ${on?"sel":""}" onclick="pickSwipeScopeLevel(${lv})">
      <span><div class="py">${esc(name)}</div></span>
      <span class="tick">✓</span></button>`;
  });
  if(entries.length){
    html+=`<div class="sechead" style="margin-top:14px">My wordlists</div>`;
    entries.forEach(([id,l])=>{
      const on=scope.mode==="wordlist"&&scope.id===id;
      html+=`<button class="wrow ${on?"sel":""}" onclick="pickSwipeScopeWordlist('${id}')">
        <span><div class="py">${esc(l.name||"Untitled list")}</div><div class="en">${l.words.length} word${l.words.length===1?"":"s"}</div></span>
        <span class="tick">✓</span></button>`;
    });
  }
  $("swipescopelist").innerHTML=html;
}

// Cards are ordered least-familiar-first so words you already know sink to
// the back of the deck next time; swiping right nudges familiarity up
// (capped), swiping left resets it, pulling the word back to the front.
function buildSwipeDeck(pool){
  const fam=getSwipeFam();
  const withMeta=pool.map(w=>{
    const f=fam[w[0]];
    return {w,fam:f?f.fam:0,last:f?f.last:0,r:Math.random()};
  });
  withMeta.sort((a,b)=>(a.fam-b.fam)||(a.last-b.last)||(a.r-b.r));
  return withMeta.map(x=>x.w);
}

let SW=null;
function startSwipePractice(){
  const pool=swipeScopedPool();
  if(!pool.length){alert("This wordlist doesn't have any words yet.");return}
  SW={deck:buildSwipeDeck(pool),i:0,known:0,unknown:0,flipped:false,dragging:false,startX:0,curX:0,history:[]};
  $("swipelistlabel").textContent=swipeScopeLabel();
  $("swipebtns").style.display="";
  $("swipeempty").style.display="none";
  $("swipestage").style.display="";
  document.documentElement.classList.add("swipe-lock");
  show("swipe");
  renderSwipeCard();
  renderSwipeHistory();
}
function restartSwipe(){
  const pool=swipeScopedPool();
  if(!pool.length){exitSwipe();return}
  SW={deck:buildSwipeDeck(pool),i:0,known:0,unknown:0,flipped:false,dragging:false,startX:0,curX:0,history:[]};
  $("swipeempty").style.display="none";
  $("swipestage").style.display="";
  $("swipebtns").style.display="";
  renderSwipeCard();
  renderSwipeHistory();
}
function exitSwipe(){
  closeSwipeWrite();
  SW=null;
  document.documentElement.classList.remove("swipe-lock");
  updateSwipeCardSummary();
  show("home");
}
function swipeProgressText(){
  if(!SW)return"";
  return Math.min(SW.i+1,SW.deck.length)+" / "+SW.deck.length;
}
function renderSwipeCard(){
  if(!SW)return;
  closeSwipeWrite();
  if(SW.i>=SW.deck.length){finishSwipeSession();return}
  $("swipeprog").textContent=swipeProgressText();
  $("swipefill").style.width=(SW.deck.length?(SW.i/SW.deck.length*100):0)+"%";
  const w=SW.deck[SW.i];
  SW.flipped=false;
  $("swzh").textContent=w[0];
  $("swpy").textContent=pin(w[1]);
  $("swen").textContent=w[2];
  $("swseal").textContent=levelBadge(w[3]);
  updateSwipeStar();
  const inner=$("swinner");
  inner.classList.remove("flipped","dragging");
  inner.style.transform="";
  const card=$("swcard");
  card.style.display="";
  card.style.transition="";
  card.style.transform="";
  card.style.opacity=1;
  $("swhintleft").style.opacity=0;
  $("swhintright").style.opacity=0;
}
function finishSwipeSession(){
  $("swipeprog").textContent="";
  $("swipefill").style.width="100%";
  $("swipebtns").style.display="none";
  $("swcard").style.display="none";
  $("swipeempty").style.display="flex";
  $("swknowcount").textContent=SW.known;
  $("swunkcount").textContent=SW.unknown;
  $("swipesummary").textContent="You reviewed "+SW.deck.length+" word"+(SW.deck.length===1?"":"s")+" from "+esc(swipeScopeLabel())+".";
}
function recordSwipe(c,known){
  const fam=getSwipeFam();
  const now=Date.now();
  if(known){
    const cur=fam[c]?fam[c].fam:0;
    fam[c]={fam:Math.min(cur+1,5),last:now};
    markSwipeMastered(c);
  }else{
    fam[c]={fam:0,last:now};
  }
  saveSwipeFam(fam);
  bumpStreak();
}
function renderSwipeHistory(){
  const el=$("swipehistory");
  if(!el)return;
  const hist=(SW&&SW.history)||[];
  const pinned=new Set(store.get("hsk_pins",[]));
  el.innerHTML=hist.map(h=>
    `<div class="swipehist-item ${h.known?"know":"dont"}">
      <span class="zh">${esc(h.zh)}</span><span class="py">${esc(pin(h.py))}</span>
      <span class="pin ${pinned.has(h.zh)?"on":""}" title="Star this word"
        onclick="toggleSwipeHistoryStar('${h.zh}')">★</span>
      <span class="mk">${h.known?"✓":"✗"}</span>
    </div>`).join("");
}
function toggleSwipeHistoryStar(c){
  togglePin(c);
  renderSwipeHistory();
  updateSwipeStar();
}
function swipeAnswer(known){
  if(!SW||SW.i>=SW.deck.length)return;
  closeSwipeWrite();
  const w=SW.deck[SW.i];
  recordSwipe(w[0],known);
  if(known)SW.known++;else SW.unknown++;
  SW.history.push({zh:w[0],py:w[1],known});
  if(SW.history.length>5)SW.history.shift();
  renderSwipeHistory();
  const card=$("swcard");
  const dir=known?1:-1;
  card.style.transition="transform .3s ease, opacity .3s ease";
  card.style.transform="translateX("+(dir*520)+"px) rotate("+(dir*20)+"deg)";
  card.style.opacity=0;
  setTimeout(()=>{
    SW.i++;
    renderSwipeCard();
  },240);
}
function updateSwipeStar(){
  const el=$("swipestar");
  if(!el||!SW||SW.i>=SW.deck.length)return;
  const w=SW.deck[SW.i];
  const pinned=store.get("hsk_pins",[]).includes(w[0]);
  el.classList.toggle("on",pinned);
  el.textContent=pinned?"★":"☆";
}
function toggleSwipeStar(){
  if(!SW||SW.i>=SW.deck.length)return;
  togglePin(SW.deck[SW.i][0]);
  updateSwipeStar();
}
function swipeFlip(){
  if(!SW||SW.i>=SW.deck.length)return;
  SW.flipped=!SW.flipped;
  $("swinner").classList.toggle("flipped",SW.flipped);
}

/* ---------- writing practice pad, opened from the flipped swipe card ---------- */
const SWP={chars:[],idx:0,strokes:[],cur:null,guide:true,size:0,open:false};
function openSwipeWrite(){
  if(!SW||SW.i>=SW.deck.length)return;
  const w=SW.deck[SW.i];
  $("swwzh").textContent=w[0];
  $("swwpy").textContent=pin(w[1]);
  $("swwen").textContent=w[2];
  SWP.chars=[...w[0]];SWP.idx=0;SWP.strokes=[];SWP.cur=null;SWP.open=true;
  renderSwwChips();
  $("swwoverlay").classList.add("show");
  requestAnimationFrame(()=>{sizeSwwCanvas();redrawSwwPad()});
}
function closeSwipeWrite(){
  if(!SWP.open)return;
  SWP.open=false;SWP.cur=null;
  $("swwoverlay").classList.remove("show");
}
function renderSwwChips(){
  $("swwchips").innerHTML=SWP.chars.map((c,i)=>
    `<button class="charchip ${i===SWP.idx?"on":""}" onclick="pickSwwChip(${i})">${esc(c)}</button>`).join("");
  $("swwchips").style.display=SWP.chars.length>1?"flex":"none";
}
function pickSwwChip(i){SWP.idx=i;SWP.strokes=[];SWP.cur=null;renderSwwChips();redrawSwwPad()}
function sizeSwwCanvas(){
  const c=$("swwcanvas");
  const w=Math.min(c.parentElement.clientWidth-20,260);
  if(w<=0)return;
  const dpr=window.devicePixelRatio||1;
  SWP.size=w;
  c.width=w*dpr;c.height=w*dpr;
  c.style.width=w+"px";c.style.height=w+"px";
  c.getContext("2d").setTransform(dpr,0,0,dpr,0,0);
}
function redrawSwwPad(){
  const c=$("swwcanvas"),ctx=c.getContext("2d"),s=SWP.size;
  if(!s)return;
  ctx.clearRect(0,0,s,s);
  // 米字格 practice-paper guides
  ctx.save();
  ctx.strokeStyle=cssVar("--line");ctx.lineWidth=1;ctx.setLineDash([5,5]);
  ctx.beginPath();
  ctx.moveTo(s/2,0);ctx.lineTo(s/2,s);
  ctx.moveTo(0,s/2);ctx.lineTo(s,s/2);
  ctx.moveTo(0,0);ctx.lineTo(s,s);
  ctx.moveTo(s,0);ctx.lineTo(0,s);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeRect(.5,.5,s-1,s-1);
  ctx.restore();
  // faint template character to trace
  if(SWP.guide&&SWP.chars[SWP.idx]){
    ctx.save();
    ctx.globalAlpha=.14;
    ctx.fillStyle=cssVar("--ink");
    ctx.font=`600 ${s*.72}px "Noto Serif SC","Songti SC","SimSun",serif`;
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(SWP.chars[SWP.idx],s/2,s*.54);
    ctx.restore();
  }
  ctx.save();
  ctx.strokeStyle=cssVar("--ink");
  ctx.lineWidth=Math.max(5,s/40);
  ctx.lineCap="round";ctx.lineJoin="round";
  for(const st of SWP.strokes)drawStroke(ctx,st,s);
  ctx.restore();
}
function swwPoint(e){
  const r=$("swwcanvas").getBoundingClientRect();
  return {x:(e.clientX-r.left)/SWP.size,y:(e.clientY-r.top)/SWP.size};
}
(function(){
  const c=$("swwcanvas");
  if(!c)return;
  c.addEventListener("pointerdown",e=>{
    e.preventDefault();
    c.setPointerCapture(e.pointerId);
    SWP.cur=[swwPoint(e)];
    SWP.strokes.push(SWP.cur);
  },{passive:false});
  c.addEventListener("pointermove",e=>{
    if(!SWP.cur)return;
    e.preventDefault();
    SWP.cur.push(swwPoint(e));
    redrawSwwPad();
  },{passive:false});
  const end=()=>{SWP.cur=null};
  c.addEventListener("pointerup",end);
  c.addEventListener("pointercancel",end);
  c.addEventListener("touchmove",e=>e.preventDefault(),{passive:false});
  window.addEventListener("resize",()=>{
    if(SWP.open){sizeSwwCanvas();redrawSwwPad()}
  });
})();
function swwClear(){SWP.strokes=[];SWP.cur=null;redrawSwwPad()}
function swwUndo(){
  if(!SWP.strokes.length)return;
  SWP.strokes.pop();SWP.cur=null;
  redrawSwwPad();
}
function swwGuideToggle(){
  SWP.guide=!SWP.guide;
  $("swwguidebtn").textContent="Guide: "+(SWP.guide?"on":"off");
  redrawSwwPad();
}
document.addEventListener("keydown",e=>{
  if(SWP.open&&e.key==="Escape")closeSwipeWrite();
});
(function(){
  const card=$("swcard");
  if(!card)return;
  let moved=false;
  card.addEventListener("pointerdown",e=>{
    if(!SW||SW.i>=SW.deck.length)return;
    if(e.target.closest(".swipestar")||e.target.closest(".swipewritebtn"))return;
    SW.dragging=true;moved=false;
    SW.startX=e.clientX;SW.curX=e.clientX;
    try{card.setPointerCapture(e.pointerId)}catch(err){}
    $("swinner").classList.add("dragging");
  });
  card.addEventListener("pointermove",e=>{
    if(!SW||!SW.dragging)return;
    SW.curX=e.clientX;
    const dx=SW.curX-SW.startX;
    if(Math.abs(dx)>6)moved=true;
    card.style.transform="translateX("+dx+"px) rotate("+(dx/14)+"deg)";
    const hint=dx>0?$("swhintright"):$("swhintleft");
    const other=dx>0?$("swhintleft"):$("swhintright");
    other.style.opacity=0;
    hint.style.opacity=Math.min(Math.abs(dx)/80,1);
  });
  function endDrag(){
    if(!SW||!SW.dragging)return;
    SW.dragging=false;
    $("swinner").classList.remove("dragging");
    const dx=SW.curX-SW.startX;
    card.style.transition="transform .25s ease";
    if(Math.abs(dx)>90){
      swipeAnswer(dx>0);
    }else{
      card.style.transform="";
      $("swhintleft").style.opacity=0;
      $("swhintright").style.opacity=0;
      if(!moved)swipeFlip();
    }
    setTimeout(()=>{if(card)card.style.transition=""},260);
  }
  card.addEventListener("pointerup",endDrag);
  card.addEventListener("pointercancel",endDrag);
})();

updateSwipeCardSummary();
updateRefresherBadge();
updateRefresherScopeLabel();
updateStreakFlame();

