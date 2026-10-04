/* Parses the topic data (js/data.js) and builds practice rounds. Every answer comes from the data; distractors come from the same entity type. */
function rnd(n){return Math.floor(Math.random()*n)}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(i+1),x=a[i];a[i]=a[j];a[j]=x}return a}
function sample(a,n){return shuffle(a).slice(0,n)}
var ENT={}, STORIES=[];
SCIENCE_DATA.forEach(function(u){
 var s={id:u.id,icon:u.icon,color:u.color,title:u.title,lines:u.lines,hint:u.hint,help:u.help,qs:[]};
 u.qs.forEach(function(q,n){var keys=q.opts.map(function(tx,i){var id=u.id+"_"+n+"_"+i;ENT[id]={type:u.id+"_"+n,tx:tx};return id});s.qs.push({story:u.id,q:q.q,a:keys[q.correct],d:keys.filter(function(k,i){return i!==q.correct})})});STORIES.push(s);
});
function entText(key){
    return ENT[key].tx;
}
function poolFor(key){
  var ty=ENT[key].type;
  return Object.keys(ENT).filter(function(k){return ENT[k].type===ty});
}
function storyById(id){return STORIES.filter(function(s){return s.id===id})[0]}
var ALL_Q=[];STORIES.forEach(function(s){s.qs.forEach(function(q){ALL_Q.push(q)})});
function makeQ(q){
  var pool=poolFor(q.a).filter(function(k){return k!==q.a});
  var d=q.d?q.d.slice():sample(pool,3);
  var keys=shuffle([q.a].concat(d));
  return {story:q.story,q:q.q,a:q.a,keys:keys,ans:keys.indexOf(q.a)};
}
function buildRound(unit){
  var src=unit.id==="mix"?ALL_Q:storyById(unit.id).qs;
  var n=unit.id==="mix"?12:Math.min(10,src.length);
  return sample(src,n).map(makeQ);
}
var UNITS=STORIES.map(function(s){return{id:s.id,icon:s.icon,color:s.color}}).concat([{id:"mix",icon:"🎲",color:"#5f3dc4"}]);
function unitTitle(u,lang){return u.id==="mix"?t("mix",null,lang):storyById(u.id).title[lang]}
