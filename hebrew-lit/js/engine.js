/* Question generators. Every correct answer is derived from the data tables above. */
function rnd(n){return Math.floor(Math.random()*n)}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(i+1),x=a[i];a[i]=a[j];a[j]=x}return a}
function sample(a,n){return shuffle(a).slice(0,n)}
function picWords(){return WORDS.filter(function(w){return w.e&&w.pic!==0})}
function sylWords(){return WORDS.filter(function(w){return w.s})}
function groupOf(letter){for(var i=0;i<SOUND_GROUPS.length;i++)if(SOUND_GROUPS[i].indexOf(letter)>-1)return SOUND_GROUPS[i];return [letter]}
function finish(q,correctText,opts){
  /* opts: array of option objects, first is the correct one; shuffle and set ans */
  var sh=shuffle(opts), ai=0;
  for(var i=0;i<sh.length;i++) if(sh[i]===opts[0]) ai=i;
  q.opts=sh; q.ans=ai; q.reveal=correctText; return q;
}
var GEN={
 first:function(){
  var w=pick1(picWords()), L=w.p[0], bad=LETTERS.filter(function(l){return groupOf(L).indexOf(l)<0});
  var d=sample(bad,3);
  return finish({type:"first",ins:"i_first",item:{emoji:w.e},say:[{t:w.w,lang:"he"}],speakers:true,h:"h_first",help:"l_first",hideWordSpeak:false},
    L,[{t:L,say:L,big:1}].concat(d.map(function(l){return{t:l,say:l,big:1}})));
 },
 pic:function(){
  var w=pick1(picWords()), ws=picWords().filter(function(x){return x.p[0]!==w.p[0]&&x!==w});
  var d=sample(ws,3);
  return finish({type:"pic",ins:"i_pic",item:{emoji:w.e},say:[],speakers:true,h:"h_pic",help:"l_pic"},
    w.w,[{t:w.w,say:w.w}].concat(d.map(function(x){return{t:x.w,say:x.w}})));
 },
 syl:function(){
  var sw=sylWords().filter(function(w){return w.s.length>1}), w=pick1(sw), s0=w.s[0];
  var bad=sylWords().filter(function(x){return x.s[0]!==s0});
  /* include one word with same letter but another vowel, when it exists */
  var near=bad.filter(function(x){return x.s[0][0]===s0[0]});
  var d=near.length?[pick1(near)]:[];
  d=d.concat(sample(bad.filter(function(x){return d.indexOf(x)<0}),3-d.length));
  return finish({type:"syl",ins:"i_syl",item:{big:s0},say:[{t:s0,lang:"he"}],speakers:true,h:"h_syl",help:"l_syl"},
    w.w,[{t:w.w,say:w.w}].concat(d.map(function(x){return{t:x.w,say:x.w}})));
 },
 build:function(){
  var w=pick1(sylWords().filter(function(w){return w.s.length>=2&&w.s.length<=3})), bad=sylWords().filter(function(x){return x!==w&&x.s.join("")!==w.s.join("")});
  var share=bad.filter(function(x){return x.s[0]===w.s[0]||x.s[x.s.length-1]===w.s[w.s.length-1]});
  var d=sample(share,1); d=d.concat(sample(bad.filter(function(x){return d.indexOf(x)<0}),3-d.length));
  return finish({type:"build",ins:"i_build",item:{big:w.s.join("  +  ")},say:w.s.map(function(s){return{t:s,lang:"he"}}),speakers:true,h:"h_build",help:"l_build"},
    w.w,[{t:w.w,say:w.w}].concat(d.map(function(x){return{t:x.w,say:x.w}})));
 },
 listen:function(){
  var w=pick1(WORDS.filter(function(x){return x.s})), pool=WORDS.filter(function(x){return x!==w&&x.p!==w.p});
  var near=pool.filter(function(x){return x.p[0]===w.p[0]||Math.abs(x.p.length-w.p.length)===0});
  var d=sample(near,2); d=d.concat(sample(pool.filter(function(x){return d.indexOf(x)<0}),3-d.length));
  return finish({type:"listen",ins:"i_listen",item:{listen:1},say:[{t:w.w,lang:"he"}],speakers:false,h:"h_listen",help:"l_listen"},
    w.w,[{t:w.w,say:w.w}].concat(d.map(function(x){return{t:x.w,say:x.w}})));
 },
 cloze:function(){
  var c;
  if(Math.random()<0.65){
   var v=pick1(CT_VERBS),sj=pick1(CT_SUBJ),a=pick1(v.ok);
   c={w:sj[0]+" "+(sj[1]==="m"?v.m:v.f)+" ___.",a:a,d:sample(v.bad().filter(function(x){return x!==a}),3)};
  } else c=pick1(CLOZE);
  return finish({type:"cloze",ins:"i_cloze",item:{sentence:c.w},say:[{t:c.w.replace("___"," "),lang:"he"}],speakers:true,h:"h_cloze",help:"l_cloze"},
    c.a,[{t:c.a,say:c.a}].concat(c.d.map(function(x){return{t:x,say:x}})));
 },
 sentqa:function(){
  var c=pick1(SENT_QA);
  return finish({type:"cloze",ins:"i_comp",item:{passage:c.w,question:c.q},say:[{t:c.w,lang:"he"},{t:c.q,lang:"he"}],speakers:true,h:"h_comp",help:"l_comp"},
    c.a,[{t:c.a,say:c.a}].concat(c.d.map(function(x){return{t:x,say:x}})));
 },
 count:function(){
  var w=pick1(sylWords()), n=w.s.length, opts=[1,2,3,4];
  var o=opts.map(function(k){return{t:String(k),say:String(k),big:1,n:k}});
  return finish({type:"count",ins:"i_count",item:{emoji:w.pic===0?"":w.e,text:w.w},say:[{t:w.w,lang:"he"}],speakers:true,h:"h_count",help:"l_count"},
    String(n),[o[n-1]].concat(o.filter(function(x,i){return i!==n-1})));
 },
 rhyme:function(){
  var g=pick1(RHYME_GROUPS), a=pick1(g), b=pick1(g.filter(function(x){return x!==a}));
  var last=function(s){return s.replace(/[^א-ת]/g,"").slice(-1)};
  var pool=WORDS.filter(function(x){return g.indexOf(x.w)<0&&last(x.w)!==last(a)&&last(x.w)!==last(b)&&x.p.length>2});
  var d=sample(pool,3), ai=WORDS.filter(function(x){return x.w===a})[0];
  return finish({type:"rhyme",ins:"i_rhyme",item:{emoji:ai&&ai.pic!==0?ai.e:"",text:a},say:[{t:a,lang:"he"}],speakers:true,h:"h_rhyme",help:"l_rhyme"},
    b,[{t:b,say:b}].concat(d.map(function(x){return{t:x.w,say:x.w}})));
 },
 same:function(){
  var w=pick1(WORDS.filter(function(x){return x.w.replace(/[^א-ת]/g,"").length>=3})), v=[];
  for(var i=0;i<w.w.length;i++){var c=w.w[i],alts=LOOKALIKE[c];
    if(alts&&i<w.w.length){ alts.forEach(function(a){v.push(w.w.slice(0,i)+a+w.w.slice(i+1))}); } }
  v=v.filter(function(x,i){return x!==w.w&&v.indexOf(x)===i});
  if(v.length<3) return GEN.same();
  var d=sample(v,3);
  return finish({type:"same",ins:"i_same",item:{big:w.w},say:[],speakers:false,h:"h_same",help:"l_same"},
    w.w,[{t:w.w,say:""}].concat(d.map(function(x){return{t:x,say:""}})));
 },
 final:function(){
  var fw=WORDS.filter(function(x){return /[ךםןףץ]$/.test(x.p)}), w=pick1(fw);
  var plain=w.w, idx=-1; for(var i=plain.length-1;i>=0;i--){ if(plain[i]>="א"&&plain[i]<="ת"){idx=i;break} }
  var fin=plain[idx], stem=plain.slice(0,idx), twin=FINAL_PAIRS[fin];
  var others=sample(Object.keys(FINAL_PAIRS).filter(function(k){return k!==fin}),1).concat(sample(LETTERS.filter(function(l){return l!==twin}),1));
  return finish({type:"final",ins:"i_final",item:{emoji:w.e&&w.pic!==0?w.e:"",stem:stem+"_"},say:[{t:w.w,lang:"he"}],speakers:false,h:"h_final",help:"l_final"},
    fin,[{t:fin,say:"",big:1},{t:twin,say:"",big:1}].concat(others.map(function(l){return{t:l,say:"",big:1}})));
 },
 pos:function(){
  var kind=pick1(["noun","verb","adj","prep"]), w;
  if(kind==="noun")w=pick1(picWords()).w;else if(kind==="verb")w=pick1(POS_VERBS);else if(kind==="adj")w=pick1(POS_ADJ);else w=pick1(POS_PREP);
  var names={noun:"שֵׁם עֵצֶם",verb:"פֹּעַל",adj:"שֵׁם תֹּאַר",prep:"מִלַּת יַחַס"};
  var order=["noun","verb","adj","prep"], opts=order.map(function(k){return{t:names[k],say:names[k],gloss:"g_"+k}});
  var ai=order.indexOf(kind);
  return finish({type:"pos",ins:"i_pos",item:{big:w},say:[{t:w,lang:"he"}],speakers:true,h:"h_pos",help:"l_pos"},
    names[kind],[opts[ai]].concat(opts.filter(function(_,i){return i!==ai})));
 },
 family:function(){
  var fs=FAMILIES.filter(function(f){return f.w.length>=3}), f=pick1(fs), pair=sample(f.w,2);
  var others=sample(fs.filter(function(x){return x!==f}),3).map(function(x){return pick1(x.w)});
  return finish({type:"family",ins:"i_family",item:{big:pair[0]},say:[{t:pair[0],lang:"he"}],speakers:true,h:"h_family",help:"l_family"},
    pair[1],[{t:pair[1],say:pair[1]}].concat(others.map(function(x){return{t:x,say:x}})));
 },
 spell:function(){
  var known={};WORDS.forEach(function(w){known[w.p]=1});"אץ עש אוף עד אד תל טל כל קל כד קד כן קן עם אם את אט טוב עב אב עת עט קם כם טם אתה עתה גע נע כב קב עז אז".split(" ").forEach(function(x){known[x]=1});
  var cand=picWords().concat(SPELL_EXTRA).filter(function(w){return w.p.length>=3&&/[תטכקאע]/.test(w.p)}), w=pick1(cand), vs=[];
  for(var i=0;i<w.p.length;i++){var s=SWAP[w.p[i]];if(s){var v=w.p.slice(0,i)+s+w.p.slice(i+1);if(!known[v]&&vs.indexOf(v)<0)vs.push(v)}}
  if(vs.length<3){ /* add two-letter swaps */
    for(var a=0;a<w.p.length;a++)for(var b=a+1;b<w.p.length;b++){var x=SWAP[w.p[a]],y=SWAP[w.p[b]];
      if(x&&y){var v2=w.p.slice(0,a)+x+w.p.slice(a+1,b)+y+w.p.slice(b+1);if(!known[v2]&&vs.indexOf(v2)<0)vs.push(v2)}}
  }
  if(vs.length<3) return GEN.spell();
  var d=sample(vs,3);
  return finish({type:"spell",ins:"i_spell",item:{emoji:w.e},say:[{t:w.w,lang:"he"}],speakers:false,h:"h_spell",help:"l_spell"},
    w.p,[{t:w.p,say:""}].concat(d.map(function(x){return{t:x,say:""}})));
 },
 comp:function(tx,qi){
  var q=tx.qs[qi];
  return finish({type:"comp",ins:"i_comp",item:{passage:tx.text,nk:tx.nk,title:tx.title,question:q.q,tr:tx.tr},say:[{t:tx.title+".",lang:"he"},{t:tx.text,lang:"he"},{t:q.q,lang:"he"}],speakers:true,h:"h_comp",help:"l_comp"},
    q.a,[{t:q.a,say:q.a}].concat(q.d.map(function(x){return{t:x,say:x}})));
 }
};
function pick1(a){return a[rnd(a.length)]}
/* units: grade, gen name, number of questions per round */
var UNITS=[
 {id:"u1",grade:1,icon:"🔤",color:"#c64c0a",gen:"first",n:10},
 {id:"u2",grade:1,icon:"🖼️",color:"#29853c",gen:"pic",n:10},
 {id:"u3",grade:1,icon:"🧩",color:"#1a76c9",gen:"syl",n:10},
 {id:"u4",grade:1,icon:"🔗",color:"#9c36b5",gen:"build",n:10},
 {id:"u5",grade:1,icon:"🎧",color:"#c2255c",gen:"listen",n:10},
 {id:"u6",grade:1,icon:"✏️",color:"#0b7f92",gen:["cloze","sentqa"],n:10},
 {id:"u12",grade:1,icon:"📄",color:"#5f3dc4",gen:"comp",texts:"TEXTS1",n:9},
 {id:"u13",grade:3,icon:"🌱",color:"#1a76c9",gen:"family",n:10},
 {id:"u14",grade:3,icon:"✍️",color:"#29853c",gen:"spell",n:10},
 {id:"u15",grade:3,icon:"📰",color:"#c2255c",gen:"comp",texts:"TEXTS3",n:10},
 {id:"u16",grade:4,icon:"🏷️",color:"#9c36b5",gen:"pos",n:10},
 {id:"u7",grade:2,icon:"👏",color:"#c64c0a",gen:"count",n:10},
 {id:"u8",grade:2,icon:"🎵",color:"#29853c",gen:"rhyme",n:10},
 {id:"u9",grade:2,icon:"🔍",color:"#1a76c9",gen:"same",n:10},
 {id:"u10",grade:2,icon:"🔚",color:"#9c36b5",gen:"final",n:10},
 {id:"u11",grade:2,icon:"📖",color:"#c2255c",gen:"comp",n:9}
];
function buildRound(u){
  var out=[], seen={};
  if(u.gen==="comp"){
    var txs=sample(u.texts==="TEXTS1"?TEXTS1:u.texts==="TEXTS3"?TEXTS3:TEXTS,3);
    txs.forEach(function(tx){tx.qs.forEach(function(_,i){out.push(GEN.comp(tx,i))})});
    return out;
  }
  var gens=[].concat(u.gen), guard=0;
  while(out.length<u.n && guard++<400){
    var q=GEN[gens[out.length%gens.length]]();
    var key=q.type+"|"+q.reveal+"|"+(q.item.sentence||q.item.passage||q.item.big||q.item.emoji||"");
    if(seen[key])continue; seen[key]=1; out.push(q);
  }
  return out;
}
