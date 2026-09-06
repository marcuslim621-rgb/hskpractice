const test=require('node:test');
const assert=require('node:assert/strict');
const R=require('./rewards');
test('attempts upgrade to correct without duplicate XP across modes',()=>{
  let a=R.earn(null,'2026-09-06',[{c:'你',ok:false}]);
  assert.equal(a.earned,2);
  a=R.earn(a.state,'2026-09-06',[{c:'你',ok:true}]);
  assert.equal(a.earned,8);
  assert.equal(R.earn(a.state,'2026-09-06',[{c:'你',ok:true}]).earned,0);
});
test('quests award once, levels advance and the next day resets only daily progress',()=>{
  const words=Array.from({length:10},(_,i)=>({c:String(i),ok:true}));
  const a=R.earn(null,'2026-09-06',words);
  assert.equal(a.state.xp,150);assert.equal(a.unlocked.length,2);assert.equal(a.leveled,true);
  assert.equal(R.earn(a.state,'2026-09-06',words).earned,0);
  const next=R.earn(a.state,'2026-09-07',[]);
  assert.equal(next.state.xp,150);assert.deepEqual(next.state.claimed,[]);assert.deepEqual(next.state.words,{});
  assert.equal(R.earn(next.state,'2026-09-07',words).earned,150);
  assert.equal(a.state.day,'2026-09-06');
});
test('empty sessions earn nothing and level boundaries are continuous',()=>{
  assert.equal(R.earn(null,'2026-09-06',[]).earned,0);
  assert.deepEqual([0,99,100,399,400].map(x=>R.level(x)),[1,1,2,2,3]);
});
