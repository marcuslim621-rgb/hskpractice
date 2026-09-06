/* Daily rewards are independent of score history, which users can clear. */
const Rewards = {
  fresh(day) { return {xp:0, day, words:{}, claimed:[]}; },
  level(xp) { return Math.floor(Math.sqrt(xp / 100)) + 1; },
  quests(state) {
    const values=Object.values(state.words);
    return [
      {id:'practice', title:'Explore 10 words', value:values.length, target:10, bonus:30},
      {id:'correct', title:'Know 5 words', value:values.filter(v=>v===10).length, target:5, bonus:20}
    ];
  },
  earn(previous, day, results) {
    const state=JSON.parse(JSON.stringify(previous || this.fresh(day)));
    if(state.day!==day){state.day=day;state.words={};state.claimed=[];}
    const before=state.xp;
    for(const r of results){
      if(!r.c)continue;
      const key='word:'+r.c, points=r.ok?10:2;
      const old=state.words[key]||0;
      state.xp+=Math.max(0,points-old);
      state.words[key]=Math.max(old,points);
    }
    const unlocked=[];
    for(const q of this.quests(state)){
      if(q.value>=q.target&&!state.claimed.includes(q.id)){
        state.claimed.push(q.id);state.xp+=q.bonus;unlocked.push(q.title);
      }
    }
    return {state, earned:state.xp-before, unlocked, leveled:this.level(state.xp)>this.level(before)};
  }
};
if(typeof module!=='undefined')module.exports=Rewards;
