/* Parses js/data.js and builds practice rounds. Vocabulary questions are generated from the word cards (emoji, listening,
   meaning, first letter); sentence and phrase questions are written by hand (Q lines). Distractors come from the same unit. */
function rnd(n){return Math.floor(Math.random()*n)}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(i+1),x=a[i];a[i]=a[j];a[j]=x}return a}
function sample(a,n){return shuffle(a).slice(0,n)}
var UN=[], cur=null;
(function parse(){
  RAW.split("\n").forEach(function(line){
    if(!line.trim())return;
    var k=line.charAt(0), f=line.slice(2).split("|");
    if(k==="S"){cur={id:f[0],icon:f[1],color:f[2],title:{he:f[3],ar:f[4],ru:f[5],en:f[6]},grade:f[7],kind:f[8],intro:null,cards:[],qs:[]};UN.push(cur)}
    else if(!cur)return;
    else if(k==="L")cur.intro={he:f[0],ar:f[1],ru:f[2],en:f[3]};
    else if(k==="T")cur.cards.push({letter:f[0],en:f[1],emoji:f[2],tr:{he:f[3],ar:f[4],ru:f[5]}});
    else if(k==="W")cur.cards.push({en:f[0],emoji:f[1],tr:{he:f[2],ar:f[3],ru:f[4]}});
    else if(k==="X")cur.cards.push({en:f[0],tr:{he:f[1],ar:f[2],ru:f[3]}});
    else if(k==="Q"){var st=f[0],listen=false;if(st.charAt(0)==="@"){listen=true;st=st.slice(1)}
      cur.qs.push({kind:"auth",stim:st,listen:listen,prompt:{he:f[1],ar:f[2],ru:f[3],en:f[4]},correct:f[5],d:f[6].split(";"),unit:cur.id})}
  });
})();
function unitBy(id){return UN.filter(function(u){return u.id===id})[0]}
var UNITS=UN.map(function(u){return{id:u.id,icon:u.icon,color:u.color}}).concat([{id:"mix",icon:"🎲",color:"#5f3dc4"}]);
function unitTitle(u,lang){return u.id==="mix"?t("mix",null,lang):unitBy(u.id).title[lang]}
/* a question: {kind, unit, w (word card), stim, listen, prompt (key or object), opts:[card | string], ans} */
function pickDistractors(pool,w,n,same){
  var seen={};seen[w.en]=1;var out=[];
  shuffle(pool).forEach(function(c){if(out.length>=n||seen[c.en])return;if(same&&!same(c,w))return;seen[c.en]=1;out.push(c)});
  return out;
}
function wordQ(u,w,kind){
  var pool=u.cards;
  if(kind==="aw"||kind==="al"||kind==="alisten"){
    if(kind==="aw"){var ds=pickDistractors(pool,w,3,function(c,x){return c.letter!==x.letter});var o=shuffle([w].concat(ds));return{kind:kind,unit:u.id,w:w,opts:o,ans:o.indexOf(w)}}
    var ls=pickDistractors(pool,w,3,function(c,x){return c.letter!==x.letter}),lo=shuffle([w].concat(ls));
    return{kind:kind,unit:u.id,w:w,opts:lo,ans:lo.indexOf(w)};
  }
  var d=pickDistractors(pool,w,3),opts=shuffle([w].concat(d));
  return{kind:kind,unit:u.id,w:w,opts:opts,ans:opts.indexOf(w)};
}
function authQ(q){
  var opts=shuffle([q.correct].concat(q.d));
  return{kind:"auth",unit:q.unit,stim:q.stim,listen:q.listen,prompt:q.prompt,opts:opts,ans:opts.indexOf(q.correct),correct:q.correct};
}
function kindsFor(u){return u.kind==="abc"?["aw","al","alisten"]:["emoji","listen","meaning"]}
function buildRound(unit){
  var out=[];
  if(unit.id==="mix"){
    var vocab=UN.filter(function(u){return u.kind!=="phrase"}), auth=[];UN.forEach(function(u){u.qs.forEach(function(q){auth.push(q)})});
    var picks=[];
    for(var i=0;i<8;i++){var u=vocab[rnd(vocab.length)],w=u.cards[rnd(u.cards.length)],ks=kindsFor(u);picks.push(wordQ(u,w,ks[rnd(ks.length)]))}
    sample(auth,4).forEach(function(q){picks.push(authQ(q))});
    return shuffle(picks);
  }
  var u=unitBy(unit.id);
  if(u.kind==="phrase")return sample(u.qs,Math.min(10,u.qs.length)).map(authQ);
  var ks=kindsFor(u);
  return sample(u.cards,Math.min(10,u.cards.length)).map(function(w,i){return wordQ(u,w,ks[i%ks.length])});
}
