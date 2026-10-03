/* Parses the story data (js/data.js) and builds practice rounds. Every answer comes from the data; distractors come from the same entity type. */
function rnd(n){return Math.floor(Math.random()*n)}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(i+1),x=a[i];a[i]=a[j];a[j]=x}return a}
function sample(a,n){return shuffle(a).slice(0,n)}
var ENT={}, STORIES=[], cur=null;
(function parse(){
  RAW.split("\n").forEach(function(line){
    if(!line.trim())return;
    var k=line.charAt(0), f=line.slice(2).split("|");
    if(k==="E")ENT[f[0]]={type:f[1],tx:{he:f[2],ar:f[3],ru:f[4],en:f[5]}};
    else if(k==="S"){cur={id:f[0],icon:f[1],color:f[2],title:{he:f[3],ar:f[4],ru:f[5],en:f[6]},lines:[],qs:[]};STORIES.push(cur)}
    else if(k==="L"&&cur)cur.lines.push({he:f[0],ar:f[1],ru:f[2],en:f[3]});
    else if(k==="Q"&&cur)cur.qs.push({story:cur.id,q:{he:f[0],ar:f[1],ru:f[2],en:f[3]},a:f[4],d:f[5]?f[5].split(","):null});
  });
})();
var NUMS=["1","2","3","4","5","6","7","10","12","40","100"];
function entText(key){
  var m=/^n(\d+)$/.exec(key);
  if(m){var s=m[1];return{he:s,ar:s,ru:s,en:s}}
  return ENT[key].tx;
}
function poolFor(key){
  if(/^n\d+$/.test(key))return NUMS.map(function(x){return "n"+x});
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
