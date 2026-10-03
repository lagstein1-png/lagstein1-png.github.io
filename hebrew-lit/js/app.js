var KEY="hebrew-lit:v1";
var state={lang:"he",speed:"normal",slow:false,dark:false,done:{}};
try{var _s=JSON.parse(localStorage.getItem(KEY)||"null");if(_s){for(var k in _s)state[k]=_s[k]}}catch(e){}
if(!state.done)state.done={};
function save(){try{localStorage.setItem(KEY,JSON.stringify({lang:state.lang,speed:state.speed,slow:state.slow,dark:state.dark,nikud:state.nikud,done:state.done}))}catch(e){}}
var view="home", gradeSel=1, unit=null, R=null; /* R = practice round state */
var $=function(s){return document.querySelector(s)};
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function he(s){return '<span class="he" lang="he" dir="rtl">'+esc(s)+'</span>'}
function applyLang(){
  var rtl=(state.lang==="he"||state.lang==="ar");
  document.documentElement.lang=state.lang;document.documentElement.dir=rtl?"rtl":"ltr";
  document.documentElement.setAttribute("data-theme",state.dark?"dark":"light");
  document.title=t("appTitle")+" · bekol";
}
function go(v,extra){stopSpeech();view=v;if(extra){for(var k in extra)window[k]=extra[k]}render();window.scrollTo(0,0)}
function unitById(id){return UNITS.filter(function(u){return u.id===id})[0]}
var GRADE_LETTER={1:"א",2:"ב",3:"ג",4:"ד",5:"ה",6:"ו"};
var GRADE_COLOR={1:"#e8590c",2:"#2b8a3e",3:"#1c7ed6",4:"#9c36b5",5:"#c2255c",6:"#0c8599"};
/* ---------- chrome ---------- */
function topbar(title,backTo){
  var langs=LANGS.map(function(l){return '<button class="lg'+(l===state.lang?' on':'')+'" data-lang="'+l+'" aria-label="'+LANG_LABEL[l]+'">'+(l==="he"?"עב":l==="ar"?"عر":l==="ru"?"RU":"EN")+'</button>'}).join("");
  return '<header class="top">'+(backTo?'<button class="back" id="backBtn" aria-label="'+t("back")+'">'+(state.lang==="he"||state.lang==="ar"?"➜":"⬅")+'</button>':'<span class="logo">📚</span>')+
   '<h1 id="pageTitle">'+esc(title)+'</h1><nav class="langs">'+langs+'</nav><button class="gear" id="gearBtn" aria-label="'+t("settings")+'">⚙️</button></header>';
}
function playRow(){
  return '<div class="playrow"><button class="bigbtn play" id="playBtn"><span>▶</span> '+t("play")+'</button>'+
   '<button class="bigbtn stop" id="stopBtn"><span>■</span> '+t("stop")+'</button>'+
   '<button class="bigbtn slow'+(state.slow?' on':'')+'" id="slowBtn"><span>🐢</span> '+t("slow")+'</button></div>';
}
function spk(id){return '<button class="spk" data-say="'+id+'" aria-label="'+t("play")+'">🔊</button>'}
function wire(){
  [].forEach.call(document.querySelectorAll("[data-lang]"),function(b){b.onclick=function(){state.lang=b.getAttribute("data-lang");save();stopSpeech();applyLang();render()}});
  var g=$("#gearBtn");if(g)g.onclick=function(){go("settings")};
  var bb=$("#backBtn");if(bb)bb.onclick=function(){
    if(view==="practice"||view==="lesson"||view==="done")go("grade");else if(view==="settings")go(unit?"grade":"home");else go("home")};
  var sb=$("#stopBtn");if(sb)sb.onclick=stopSpeech;
  var sl=$("#slowBtn");if(sl)sl.onclick=function(){state.slow=!state.slow;save();sl.classList.toggle("on",state.slow)};
  var pb=$("#playBtn");if(pb)pb.onclick=function(){speakSeq(pageSegs())};
  [].forEach.call(document.querySelectorAll("[data-say]"),function(b){b.onclick=function(e){e.stopPropagation();var el=document.getElementById(b.getAttribute("data-say"));
    if(el)speakSeq([{t:el.getAttribute("data-t"),lang:el.getAttribute("data-l")||state.lang,box:"#"+el.id}])}});
}
/* ---------- screens ---------- */
function pageSegs(){
  if(view==="home")return [{t:t("appTitle")+". "+t("appSub"),lang:state.lang,el:"#intro"}];
  if(view==="grade"){
    if(gradeSel>4)return [{t:t("grade"+gradeSel)+". "+t("plan"+gradeSel),lang:state.lang,el:"#plan"}];
    return [{t:t("grade"+gradeSel)+". "+t("gband"+gradeSel)+". "+UNITS.filter(function(u){return u.grade===gradeSel}).map(function(u){return t(u.id)}).join(". "),lang:state.lang}];
  }
  if(view==="lesson")return [{t:t(unit.id)+".",lang:state.lang},{t:t("le_"+unit.id),lang:state.lang,el:"#lessonText"}];
  if(view==="settings")return [{t:t("settings")+". "+t("lang")+". "+t("speed")+". "+t("privacy")+" "+t("credit"),lang:state.lang}];
  if(view==="done")return [{t:t("unitDone"),lang:state.lang,el:"#doneText"}];
  if(view==="practice")return practiceSegs();
  return [];
}
function renderHome(){
  var cards=[1,2,3,4,5,6].map(function(g){
    var open=g<=4, n=UNITS.filter(function(u){return u.grade===g}).length, d=UNITS.filter(function(u){return u.grade===g&&state.done[u.id]}).length;
    return '<button class="gcard" data-g="'+g+'" style="--c:'+GRADE_COLOR[g]+'"><span class="gl">'+GRADE_LETTER[g]+'׳</span><span class="gt"><b>'+t("grade"+g)+'</b>'+
      (open?'<small>'+t("gband"+g)+'</small><em>'+d+' / '+n+' ✓</em>':'<small>'+t("plan"+g).replace(/^[^:]*:\s*/,"")+'</small><em class="soon">'+t("soon")+'</em>')+'</span></button>';
  }).join("");
  return topbar(t("appTitle"))+'<main>'+playRow()+'<p class="lead" id="intro"><b>'+esc(t("appTitle"))+'.</b> '+esc(t("appSub"))+'</p><div class="gcards">'+cards+'</div>'+
    '<p class="small">'+t("privacy")+'</p></main>';
}
function renderGrade(){
  var g=gradeSel;
  if(g>4)return topbar(t("grade"+g),1)+'<main>'+playRow()+'<div class="plan" id="plan" style="--c:'+GRADE_COLOR[g]+'"><span class="gl big">'+GRADE_LETTER[g]+'׳</span><p>'+esc(t("plan"+g))+'</p></div></main>';
  var us=UNITS.filter(function(u){return u.grade===g}).map(function(u){
    return '<button class="ucard" data-u="'+u.id+'" style="--c:'+u.color+'"><span class="ui">'+u.icon+'</span><span class="ut">'+esc(t(u.id))+'</span>'+(state.done[u.id]?'<span class="ck" title="'+t("unitCheck")+'">✓</span>':'')+'</button>';
  }).join("");
  return topbar(t("grade"+g)+" · "+t("gband"+g),1)+'<main>'+playRow()+'<h2>'+t("units")+'</h2><div class="ucards">'+us+'</div></main>';
}
function lessonExamples(u){
  var pw=picWords(),sw=sylWords(),x;
  function ex(h){return '<div class="exrow">'+h+'</div>'}
  switch(u.id){
   case "u1": case "u2": return sample(pw,4).map(function(w){return '<div class="ex"><span class="em">'+w.e+'</span>'+he(w.w)+'</div>'}).join("");
   case "u3": return sample(sw.filter(function(w){return w.s.length>1}),3).map(function(w){return '<div class="ex">'+he(w.s[0])+'<small>→</small>'+he(w.w)+'</div>'}).join("");
   case "u4": return sample(sw.filter(function(w){return w.s.length>1&&w.s.length<4}),3).map(function(w){return '<div class="ex">'+he(w.s.join(" + "))+'<small>=</small>'+he(w.w)+'</div>'}).join("");
   case "u5": return '<div class="ex"><span class="em">🎧</span>'+he("חָתוּל")+'</div>';
   case "u6": return '<div class="ex">'+he("הַכֶּלֶב רָץ בַּגִּנָּה.")+'</div>';
   case "u7": return sample(sw,3).map(function(w){return '<div class="ex">'+he(w.s.join(" - "))+'<small>'+"👏".repeat(w.s.length)+'</small></div>'}).join("");
   case "u8": return '<div class="ex">'+he("בָּלוֹן")+'<small>♪</small>'+he("חַלּוֹן")+'</div>';
   case "u9": return '<div class="ex">'+he("כֶּלֶב")+'<small>≠</small>'+he("בֶּלֶב")+'</div><div class="ex">'+he("דָּג")+'<small>≠</small>'+he("רָג")+'</div>';
   case "u10": return '<div class="ex">'+he("ך")+'<small>←</small>'+he("כ")+'</div><div class="ex">'+he("ם")+'<small>←</small>'+he("מ")+'</div><div class="ex">'+he("ן")+'<small>←</small>'+he("נ")+'</div><div class="ex">'+he("ף")+'<small>←</small>'+he("פ")+'</div><div class="ex">'+he("ץ")+'<small>←</small>'+he("צ")+'</div>';
   case "u13": return '<div class="ex">'+he("שׁוֹלֵחַ")+'<small>=</small>'+he("מִשְׁלוֹחַ")+'</div>';
   case "u14": return '<div class="ex">'+he("ת")+'<small>≠</small>'+he("ט")+'</div><div class="ex">'+he("כ")+'<small>≠</small>'+he("ק")+'</div><div class="ex">'+he("א")+'<small>≠</small>'+he("ע")+'</div>';
   case "u16": return '<div class="ex">'+he("כֶּלֶב")+'<small>'+t("g_noun")+'</small></div><div class="ex">'+he("אָכַל")+'<small>'+t("g_verb")+'</small></div><div class="ex">'+he("גָּדוֹל")+'<small>'+t("g_adj")+'</small></div><div class="ex">'+he("עַל")+'<small>'+t("g_prep")+'</small></div>';
   case "u15": case "u12": case "u11": return '<div class="ex"><span class="em">📖</span>'+he("קוראים. מחפשים. עונים.")+'</div>';
  }
  return "";
}
function renderLesson(){
  var m=mk(t("le_"+unit.id));
  return topbar(t(unit.id),1)+'<main>'+playRow()+'<h2>'+t("lesson")+'</h2><p class="lead" id="lessonText">'+m.html+'</p><div class="exs">'+lessonExamples(unit)+'</div>'+
    '<button class="cta" id="startBtn" style="--c:'+unit.color+'">'+t("start")+'</button></main>';
}
/* ---------- practice ---------- */
function curQ(){return R.qs[R.i]}
function psg(it){return(state.nikud&&it.nk)?it.nk:it.passage}
function itemHtml(q){
  var it=q.item, h="";
  if(it.emoji)h+='<div class="emoji" aria-hidden="true">'+it.emoji+'</div>';
  if(it.text&&q.type!=="rhyme"&&q.type!=="count")h+='<div class="itemword">'+he(it.text)+'</div>';
  if(q.type==="rhyme"||q.type==="count")h+='<div class="itemword" id="itemWord">'+mkHe(it.text).html+'</div>';
  if(it.big)h+='<div class="bigitem">'+he(it.big)+'</div>';
  if(it.listen)h+='<div class="emoji" aria-hidden="true">🎧</div>';
  if(it.stem)h+='<div class="bigitem">'+he(it.stem)+'</div>';
  if(it.sentence)h+='<div class="sent he" lang="he" dir="rtl" id="item">'+mk(it.sentence).html+'</div>';
  if(it.passage&&!it.title)h+='<div class="sent he" lang="he" dir="rtl" id="item">'+mk(it.passage).html+'</div><div class="qtext he" lang="he" dir="rtl" id="qtext">'+mk(it.question).html+'</div>';
  if(it.title){
    h+='<div class="pass"><div class="ptitle he" lang="he" dir="rtl">'+esc(it.title)+'</div><div class="sent he" lang="he" dir="rtl" id="item">'+mk(psg(it)).html+'</div>'+(it.nk?'<button class="nkbtn" id="nkBtn">'+(state.nikud?t("nkOff"):t("nkOn"))+'</button>':'');
    if(state.lang!=="he"&&it.tr&&it.tr[state.lang])h+='<div class="trans" dir="'+(state.lang==="ar"?"rtl":"ltr")+'">'+esc(it.tr[state.lang])+'</div>';
    h+='</div><div class="qtext he" lang="he" dir="rtl" id="qtext">'+mk(it.question).html+'</div>';
  }
  return h;
}
function mkHe(s){return mk(s)}
function practiceSegs(){
  var q=curQ(),it=q.item,segs=[{t:mk(t(q.ins)).spoken,lang:state.lang,el:"#ins"}];
  if(it.sentence)segs.push({t:mk(it.sentence).spoken,lang:"he",el:"#item"});
  else if(it.title){segs.push({t:it.title,lang:"he"});segs.push({t:mk(psg(it)).spoken,lang:"he",el:"#item"});segs.push({t:mk(it.question).spoken,lang:"he",el:"#qtext"})}
  else if(it.passage){segs.push({t:mk(it.passage).spoken,lang:"he",el:"#item"});segs.push({t:mk(it.question).spoken,lang:"he",el:"#qtext"})}
  else if(q.type==="count"||q.type==="rhyme")segs.push({t:it.text,lang:"he",el:"#itemWord"});
  else q.say.forEach(function(s){segs.push({t:s.t,lang:"he"})});
  return segs;
}
function renderPractice(){
  var q=curQ(), dots="";
  for(var i=0;i<R.qs.length;i++)dots+='<i class="'+(i<R.i?"d":i===R.i?"c":"")+'"></i>';
  var opts=q.opts.map(function(o,i){
    var cls="opt"+(o.big?" bigopt":"");
    return '<div class="optwrap"><button class="'+cls+' he" lang="he" dir="rtl" data-i="'+i+'" id="opt'+i+'">'+esc(o.t)+(o.gloss&&state.lang!=="he"?'<small class="gloss" dir="auto">'+t(o.gloss)+'</small>':'')+'</button>'+(q.speakers&&o.say?'<button class="spk" data-opt="'+i+'" aria-label="'+t("play")+'">🔊</button>':'')+'</div>';
  }).join("");
  var m=mk(t(q.ins));
  return topbar(t(unit.id),1)+'<main class="prac"><div class="prog" aria-label="'+t("qOf",{n:R.i+1,m:R.qs.length})+'">'+dots+'</div>'+
   playRow()+'<p class="ins" id="ins">'+m.html+'</p><div class="stage">'+itemHtml(q)+'</div><div class="opts">'+opts+'</div>'+
   '<div class="fb" id="fb" role="status"></div>'+
   '<div class="helprow"><button class="hbtn hint" id="hintBtn">💡 '+t("hintBtn")+'</button><button class="hbtn limor" id="limorBtn"><span class="lav">ל</span> '+t("limorBtn")+'</button></div>'+
   '<button class="cta next" id="nextBtn" style="--c:'+unit.color+'">'+t("next")+'</button></main>';
}
function startRound(u){
  unit=u;R={qs:buildRound(u),i:0,tries:0,hints:0,streak:0,locked:false,gone:{}};view="practice";render();
}
function wirePractice(){
  [].forEach.call(document.querySelectorAll(".opt"),function(b){b.onclick=function(){answer(+b.getAttribute("data-i"))}});
  [].forEach.call(document.querySelectorAll("[data-opt]"),function(b){b.onclick=function(e){e.stopPropagation();var i=+b.getAttribute("data-opt"),o=curQ().opts[i];
    speakSeq([{t:o.say,lang:"he",box:"#opt"+i}])}});
  var nk=$("#nkBtn");if(nk)nk.onclick=function(){stopSpeech();state.nikud=!state.nikud;save();$("#item").innerHTML=mk(psg(curQ().item)).html;nk.textContent=state.nikud?t("nkOff"):t("nkOn")};
  $("#hintBtn").onclick=hint;$("#limorBtn").onclick=openLimor;
  $("#nextBtn").onclick=nextQ;
}
function say(msg,cls){var f=$("#fb");f.className="fb "+(cls||"");f.textContent=msg;}
function answer(i){
  if(R.locked||R.gone[i])return;
  var q=curQ(),b=$("#opt"+i);
  if(i===q.ans){
    R.locked=true;R.streak++;b.classList.add("right");
    var msg=(R.streak===3)?t("streak"):t("good"+(1+rnd(4)));
    say("✔ "+msg,"ok");confetti(R.streak>=3?44:22);
    $("#nextBtn").classList.add("show");sfx(true);
    speakSeq([{t:msg,lang:state.lang}]);
  }else{
    R.streak=0;R.tries++;R.gone[i]=1;b.classList.add("soft");b.disabled=true;
    if(R.tries>=2){
      R.locked=true;$("#opt"+q.ans).classList.add("right");
      say(t("reveal")+" "+q.reveal,"rev");$("#nextBtn").classList.add("show");
      speakSeq([{t:t("reveal"),lang:state.lang},{t:q.reveal,lang:"he"}]);
    }else{say(t("try1"),"try");speakSeq([{t:t("try1"),lang:state.lang}])}
  }
}
function nextQ(){
  stopSpeech();
  if(R.i+1>=R.qs.length){state.done[unit.id]=true;save();view="done";render();confetti(60);return}
  R.i++;R.tries=0;R.hints=0;R.locked=false;R.gone={};render();window.scrollTo(0,0);
}
function eliminate(){
  var q=curQ(),wrong=[];q.opts.forEach(function(_,i){if(i!==q.ans&&!R.gone[i])wrong.push(i)});
  sample(wrong,Math.min(2,wrong.length)).forEach(function(i){R.gone[i]=1;var b=$("#opt"+i);b.classList.add("soft");b.disabled=true});
}
function hint(){
  if(R.locked)return;
  var q=curQ();R.hints++;
  if(R.hints===1){say("💡 "+t(q.h),"hint");speakSeq([{t:t(q.h),lang:state.lang}])}
  else if(R.hints===2){eliminate();say("💡 "+t("h2note")+" "+t(q.h),"hint");speakSeq([{t:t("h2note"),lang:state.lang}])}
  else openLimor();
}
/* ---------- Limor help ---------- */
function openLimor(){
  stopSpeech();var q=curQ();
  var ov=document.createElement("div");ov.className="limorov";ov.id="limorOv";
  ov.innerHTML='<div class="limorbox"><div class="lhead"><span class="lav big"><img src="/img/limor.jpg" alt="" onerror="this.remove()">ל</span><b>'+t("lmTitle")+'</b><button class="x" id="lmClose" aria-label="'+t("back")+'">✕</button></div>'+
   '<div class="lplay"><button class="bigbtn play" id="lmPlay"><span>▶</span> '+t("play")+'</button><button class="bigbtn stop" id="lmStop"><span>■</span> '+t("stop")+'</button></div>'+
   '<p class="ltext" id="lmText">'+mk(t(q.help)).html+'</p>'+
   '<div class="lask"><b>'+t("lmAsk")+'</b>'+
   '<button class="lq" data-k="lmR1">'+t("lmB1")+'</button><button class="lq" data-k="lmR2">'+t("lmB2")+'</button><button class="lq" data-k="lmR3">'+t("lmB3")+'</button><button class="lq alt" data-k="lmHow">'+t("lmOther")+'</button></div></div>';
  document.body.appendChild(ov);
  function playText(){speakSeq([{t:mk($("#lmText").textContent).spoken,lang:state.lang,el:"#lmText"}])}
  function show(k){
    $("#lmText").innerHTML=mk(t(k)).html;
    if(k==="lmR3"&&!R.locked)eliminate();
    if(k==="lmR1"){closeL();hintReadQ();return}
    playText();
  }
  function closeL(){stopSpeech();ov.remove()}
  function hintReadQ(){speakSeq(practiceSegs())}
  $("#lmClose").onclick=closeL;$("#lmPlay").onclick=playText;$("#lmStop").onclick=stopSpeech;
  [].forEach.call(ov.querySelectorAll(".lq"),function(b){b.onclick=function(){show(b.getAttribute("data-k"))}});
  /* Limor's help text names no answer: it models the method on a different example */
  playText();
}
/* ---------- done / settings ---------- */
function renderDone(){
  return topbar(t(unit.id),1)+'<main class="done"><div class="trophy">🌟</div><p class="lead" id="doneText">'+mk(t("unitDone")).html+'</p>'+playRow()+
   '<button class="cta" id="againBtn" style="--c:'+unit.color+'">'+t("again")+'</button><button class="cta alt" id="unitsBtn">'+t("units")+'</button></main>';
}
function renderSettings(){
  return topbar(t("settings"),1)+'<main>'+playRow()+
   '<section class="set"><h2>'+t("speed")+'</h2><div class="seg"><button class="chip'+(state.speed==="slow"?" on":"")+'" data-sp="slow">'+t("speedSlow")+'</button><button class="chip'+(state.speed!=="slow"?" on":"")+'" data-sp="normal">'+t("speedNormal")+'</button></div></section>'+
   '<section class="set"><h2>'+t("theme")+'</h2><button class="chip'+(state.dark?" on":"")+'" id="darkBtn">'+(state.dark?"🌙 ✓":"🌙")+'</button></section>'+
   '<section class="set"><h2>'+t("lang")+'</h2><div class="seg">'+LANGS.map(function(l){return '<button class="chip'+(l===state.lang?" on":"")+'" data-lang="'+l+'">'+LANG_LABEL[l]+'</button>'}).join("")+'</div><p class="small">'+t("mtNote")+'</p></section>'+
   '<p class="small">'+t("privacy")+'</p><p class="small">'+t("credit")+'</p>'+
   '<button class="chip danger" id="resetBtn">'+t("reset")+'</button></main>';
}
/* ---------- confetti / sfx ---------- */
function confetti(n){
  var c=document.createElement("div");c.className="confetti";var em=["🎉","⭐","✨","🌟","🎈"];
  for(var i=0;i<n;i++){var s=document.createElement("span");s.textContent=em[i%em.length];
    s.style.left=(Math.random()*100)+"%";s.style.animationDelay=(Math.random()*0.5)+"s";s.style.fontSize=(16+Math.random()*18)+"px";c.appendChild(s)}
  document.body.appendChild(c);setTimeout(function(){c.remove()},2600);
}
function sfx(){}
/* ---------- render ---------- */
function render(){
  applyLang();var h="";
  if(view==="home")h=renderHome();else if(view==="grade")h=renderGrade();else if(view==="lesson")h=renderLesson();
  else if(view==="practice")h=renderPractice();else if(view==="done")h=renderDone();else if(view==="settings")h=renderSettings();
  $("#app").innerHTML=h;wire();
  [].forEach.call(document.querySelectorAll("[data-g]"),function(b){b.onclick=function(){gradeSel=+b.getAttribute("data-g");go("grade")}});
  [].forEach.call(document.querySelectorAll("[data-u]"),function(b){b.onclick=function(){unit=unitById(b.getAttribute("data-u"));go("lesson")}});
  if(view==="lesson")$("#startBtn").onclick=function(){startRound(unit)};
  if(view==="practice")wirePractice();
  if(view==="done"){$("#againBtn").onclick=function(){startRound(unit)};$("#unitsBtn").onclick=function(){go("grade")}}
  if(view==="settings"){
    [].forEach.call(document.querySelectorAll("[data-sp]"),function(b){b.onclick=function(){state.speed=b.getAttribute("data-sp");save();render()}});
    $("#darkBtn").onclick=function(){state.dark=!state.dark;save();render()};
    $("#resetBtn").onclick=function(){if(confirm(t("resetSure"))){state.done={};save();go("home")}};
  }
  if(!("speechSynthesis" in window)||(allVoices().length&&!voiceFor(state.lang)&&view==="home")){/* visible note, see below */
    var n=document.createElement("p");n.className="small warn";n.textContent=t("noVoice");var m=$("main");if(m)m.appendChild(n);}
}
try{speechSynthesis.onvoiceschanged=function(){}}catch(e){}
render();
/* ---------- Limor (shared tutor), mounted only when the shared scripts exist ---------- */
if(window.TUTOR){
  TUTOR.mount({app:"hebrew-lit",lang:function(){return state.lang},
    q:function(){if(view!=="practice"||!R)return null;var q=curQ();return {expr:(q.item.sentence||q.item.passage||q.item.text||q.item.big||""),ans:null,level:unit?t(unit.id,null,"he"):""}},
    stopHost:function(){stopSpeech()}});
  if(window.BARAK)BARAK.register({app:"hebrew-lit",
    getScreenContext:function(){if(view!=="practice"||!R)return null;var q=curQ();
      return {id:"hl"+R.i+"-"+unit.id,type:"mcq",q:t(q.ins,null,"he")+" "+(q.item.sentence||q.item.passage||q.item.text||q.item.big||"")+" "+(q.item.question||""),options:q.opts.map(function(o){return o.t}),correct:null,student:null,topic:t(unit.id,null,"he"),level:"כיתה "+unit.grade,curriculum:"עברית, קריאה ושפה, כיתות א׳–ב׳"}},
    actions:{read_aloud:{desc:"מקריא את השאלה בקול",run:function(){if(view!=="practice")return false;speakSeq(practiceSegs());return true}},
      show_hint:{desc:"מציג את הרמז הבא",run:function(){if(view!=="practice"||R.locked)return false;var n=R.hints;hint();return R.hints>n}},
      next_question:{desc:"עובר לשאלה הבאה אחרי שנענתה",run:function(){if(view!=="practice"||!R.locked)return false;nextQ();return true}}}});
}
