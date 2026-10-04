var KEY="english-elem:v1";
var state={lang:"he",speed:"normal",slow:false,dark:false,done:{}};
try{var _s=JSON.parse(localStorage.getItem(KEY)||"null");if(_s){for(var k in _s)state[k]=_s[k]}}catch(e){}
if(!state.done)state.done={};
function save(){try{localStorage.setItem(KEY,JSON.stringify({lang:state.lang,speed:state.speed,slow:state.slow,dark:state.dark,done:state.done}))}catch(e){}}
var view="home", prevView="home", unit=null, R=null; /* R = practice round state */
var $=function(s){return document.querySelector(s)};
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function dirOf(l){return(l==="he"||l==="ar")?"rtl":"ltr"}
function applyLang(){
  document.documentElement.lang=state.lang;document.documentElement.dir=dirOf(state.lang);
  document.documentElement.setAttribute("data-theme",state.dark?"dark":"light");
  document.title=t("appTitle")+" · bekol";
}
function go(v,extra){stopSpeech();view=v;if(extra){for(var k in extra)window[k]=extra[k]}render();window.scrollTo(0,0)}
function unitById(id){return UNITS.filter(function(u){return u.id===id})[0]}
function uTitle(u,l){return unitTitle(u,l||state.lang)}
/* ---------- chrome ---------- */
function topbar(title,backTo){
  var langs=LANGS.map(function(l){return '<button class="lg'+(l===state.lang?' on':'')+'" data-lang="'+l+'" aria-pressed="'+(l===state.lang)+'" aria-label="'+LANG_LABEL[l]+'">'+(l==="he"?"עב":l==="ar"?"عر":l==="ru"?"RU":"EN")+'</button>'}).join("");
  return '<header class="top">'+(backTo?'<button class="back" id="backBtn" aria-label="'+t("back")+'">'+(dirOf(state.lang)==="rtl"?"➜":"⬅")+'</button>':'<span class="logo">🔤</span>')+
   '<h1 id="pageTitle">'+esc(title)+'</h1><nav class="langs">'+langs+'</nav><button class="gear" id="gearBtn" aria-label="'+t("settings")+'">⚙️</button></header>';
}
function playRow(){
  return '<div class="playrow"><button class="bigbtn play" id="playBtn"><span>▶</span> '+t("play")+'</button>'+
   '<button class="bigbtn stop" id="stopBtn"><span>■</span> '+t("stop")+'</button>'+
   '<button class="bigbtn slow'+(state.slow?' on':'')+'" id="slowBtn" aria-pressed="'+(state.slow?"true":"false")+'"><span>🐢</span> '+t("slow")+'</button></div>';
}
function wire(){
  [].forEach.call(document.querySelectorAll("[data-lang]"),function(b){b.onclick=function(){state.lang=b.getAttribute("data-lang");save();stopSpeech();applyLang();render()}});
  var g=$("#gearBtn");if(g)g.onclick=function(){if(view!=="settings")prevView=view;go("settings")};
  var bb=$("#backBtn");if(bb)bb.onclick=function(){
    if(view==="practice"||view==="done")go("lesson");
    /* חזרה מההגדרות - למסך שממנו נפתחו. "unit?lesson:home" החזיר את מי
       שפתח הגדרות מדף הבית ליחידה שסגר לפני רגע, כי unit נשאר מלא. */
    else if(view==="settings")go(prevView==="lesson"&&unit?"lesson":"home");
    else go("home")};
  var sb=$("#stopBtn");if(sb)sb.onclick=stopSpeech;
  var sl=$("#slowBtn");if(sl)sl.onclick=function(){state.slow=!state.slow;save();sl.classList.toggle("on",state.slow);sl.setAttribute("aria-pressed",state.slow?"true":"false")};
  var pb=$("#playBtn");if(pb)pb.onclick=function(){speakSeq(pageSegs())};
}
/* ---------- cards ---------- */
function trOf(c){return state.lang==="en"?"":(c.tr[state.lang]||"")}
function cardSegs(c,i,u){
  var segs=[];
  if(c.letter)segs.push({t:c.letter.toLowerCase()===c.letter?c.letter:c.letter,lang:"en",box:"#c"+i});
  segs.push({t:c.en,lang:"en",box:"#c"+i});
  var tr=trOf(c);if(tr)segs.push({t:tr,lang:state.lang});
  return segs;
}
function cardHtml(c,i,u){
  var tr=trOf(c);
  if(u.kind==="phrase")return '<button class="xc" id="c'+i+'" data-c="'+i+'"><span class="en" lang="en" dir="ltr">'+esc(c.en)+'</span>'+(tr?'<span class="tr" lang="'+state.lang+'" dir="'+dirOf(state.lang)+'">'+esc(tr)+'</span>':'')+'</button>';
  return '<button class="wc'+(c.letter?' abc':'')+'" id="c'+i+'" data-c="'+i+'">'+(c.letter?'<b class="big" lang="en" dir="ltr">'+c.letter+c.letter.toLowerCase()+'</b>':'')+'<span class="em" aria-hidden="true">'+c.emoji+'</span><span class="en" lang="en" dir="ltr">'+esc(c.en)+'</span>'+(tr?'<span class="tr" lang="'+state.lang+'" dir="'+dirOf(state.lang)+'">'+esc(tr)+'</span>':'')+'</button>';
}
/* ---------- screens ---------- */
function pageSegs(){
  if(view==="home")return [{t:t("appTitle")+". "+t("appSub"),lang:state.lang,el:"#intro"}];
  if(view==="lesson"){
    if(unit.id==="mix")return [{t:t("mix")+".",lang:state.lang}];
    var u=unitBy(unit.id),segs=[{t:uTitle(unit),raw:u.title.he,lang:state.lang},{t:mk(u.intro[state.lang]).spoken,raw:u.intro.he,lang:state.lang,el:"#intro"}];
    u.cards.forEach(function(c,i){cardSegs(c,i,u).forEach(function(s){segs.push(s)})});
    return segs;
  }
  if(view==="settings")return [{t:t("settings")+". "+t("lang")+". "+t("speed")+". "+t("privacy")+" "+t("credit"),lang:state.lang}];
  if(view==="done")return [{t:t("unitDone"),lang:state.lang,el:"#doneText"}];
  if(view==="practice")return practiceSegs();
  return [];
}
function renderHome(){
  var cards=UNITS.map(function(u){
    var un=u.id==="mix"?null:unitBy(u.id);
    return '<button class="ucard" data-u="'+u.id+'" style="--c:'+u.color+'"><span class="ui">'+u.icon+'</span><span class="ut">'+esc(uTitle(u))+(un?'<small class="gr">'+t(un.grade)+'</small>':'')+'</span>'+(state.done[u.id]?'<span class="ck" title="'+t("unitCheck")+'">✓</span>':'')+'</button>';
  }).join("");
  return topbar(t("appTitle"))+'<main>'+playRow()+'<p class="lead" id="intro"><b>'+esc(t("appTitle"))+'.</b> '+esc(t("appSub"))+'</p><h2>'+t("stories")+'</h2><div class="ucards">'+cards+'</div>'+
    '<p class="small">'+t("privacy")+'</p></main>';
}
function renderLesson(){
  if(unit.id==="mix")return topbar(t("mix"),1)+'<main>'+playRow()+'<div class="emoji" aria-hidden="true">'+unit.icon+'</div><h2>'+esc(t("mix"))+'</h2><button class="cta" id="startBtn" style="--c:'+unit.color+'">'+t("start")+'</button></main>';
  var u=unitBy(unit.id);
  return topbar(uTitle(unit),1)+'<main>'+playRow()+'<h2>'+t("lesson")+'</h2><p class="lead" id="intro" lang="'+state.lang+'" dir="'+dirOf(state.lang)+'">'+mk(u.intro[state.lang]).html+'</p><p class="small">'+t("tapCard")+'</p>'+
    '<div class="cards'+(u.kind==="phrase"?' xs':'')+'">'+u.cards.map(function(c,i){return cardHtml(c,i,u)}).join("")+'</div>'+
    '<button class="cta" id="startBtn" style="--c:'+unit.color+'">'+t("start")+'</button></main>';
}
/* ---------- practice ---------- */
function curQ(){return R.qs[R.i]}
function promptText(q,l){return q.kind==="auth"?q.prompt[l||state.lang]:t(q.kind==="emoji"?"p_emoji":q.kind==="listen"?"p_listen":q.kind==="meaning"?"p_meaning":q.kind==="aw"?"p_aw":q.kind==="al"?"p_al":"p_alisten",null,l)}
/* what an option shows and says */
function optInfo(q,i,l){
  l=l||state.lang;var o=q.opts[i];
  if(q.kind==="auth")return{text:o,lang:"en",speak:o};
  if(q.kind==="emoji"||q.kind==="listen")return{text:o.en,lang:"en",speak:o.en};
  if(q.kind==="meaning"){if(l==="en")return{text:o.emoji,lang:"en",speak:o.en,big:true};return{text:o.tr[l],lang:l,speak:o.tr[l]}}
  if(q.kind==="aw")return{text:o.emoji+" "+o.en,lang:"en",speak:o.en};
  return{text:o.letter,lang:"en",speak:o.letter,big:true};
}
function optText(q,i,l){return optInfo(q,i,l).text}
/* the thing above the options */
function stimInfo(q){
  var w=q.w;
  if(q.kind==="auth")return q.stim?{html:q.listen?"":esc(q.stim),speak:spokenStim(q.stim),listen:q.listen}:null;
  if(q.kind==="emoji")return{html:'<span class="bigem" aria-hidden="true">'+w.emoji+'</span>',speak:null};
  if(q.kind==="meaning")return{html:'<span class="bigen" lang="en" dir="ltr">'+esc(w.en)+'</span>',speak:w.en};
  if(q.kind==="aw")return{html:'<span class="bigen" lang="en" dir="ltr">'+w.letter+w.letter.toLowerCase()+'</span>',speak:w.letter};
  if(q.kind==="al")return{html:'<span class="bigem" aria-hidden="true">'+w.emoji+'</span><span class="bigen" lang="en" dir="ltr">'+esc(w.en)+'</span>',speak:w.en};
  return{html:"",speak:w.en,listen:true};   /* listen, alisten */
}
function practiceSegs(){
  var q=curQ(),si=stimInfo(q),segs=[{t:mk(promptText(q)).spoken,raw:q.kind==="auth"?q.prompt.he:promptText(q,"he"),lang:state.lang,el:"#qtext"}];
  if(si&&si.speak)segs.push({t:si.speak,lang:"en"});
  q.opts.forEach(function(_,i){var o=optInfo(q,i);segs.push({t:o.speak,raw:o.speak,lang:o.lang,box:"#opt"+i})});
  return segs;
}
function renderPractice(){
  var q=curQ(), dots="", l=state.lang, d=dirOf(l), si=stimInfo(q);
  for(var i=0;i<R.qs.length;i++)dots+='<i class="'+(i<R.i?"d":i===R.i?"c":"")+'"></i>';
  var opts=q.opts.map(function(_,i){
    var o=optInfo(q,i);
    return '<div class="optwrap"><button class="opt'+(o.big?' bigopt':'')+'" lang="'+o.lang+'" dir="'+dirOf(o.lang)+'" data-i="'+i+'" id="opt'+i+'">'+esc(o.text)+'</button><button class="spk" data-opt="'+i+'" aria-label="'+t("play")+': '+esc(o.speak||o.text)+'">🔊</button></div>';
  }).join("");
  var stim=si?'<div class="stim">'+(si.listen?'<button class="bigbtn play stimplay" id="stimPlay"><span>🔊</span> '+t("play")+'</button>':'')+(si.html?'<div class="sentEn" lang="en" dir="ltr">'+si.html+'</div>':'')+'</div>':'';
  return topbar(uTitle(unit),1)+'<main class="prac"><div class="prog" role="img" aria-label="'+t("qOf",{n:R.i+1,m:R.qs.length})+'">'+dots+'</div>'+
   playRow()+'<div class="stage"><div class="sent" lang="'+l+'" dir="'+d+'" id="qtext">'+mk(promptText(q)).html+'</div>'+stim+'</div><div class="opts">'+opts+'</div>'+
   '<div class="fb" id="fb" role="status"></div>'+
   '<div class="helprow"><button class="hbtn hint" id="hintBtn">💡 '+t("hintBtn")+'</button><button class="hbtn limor" id="limorBtn"><span class="lav">ל</span> '+t("limorBtn")+'</button></div>'+
   '<button class="cta next" id="nextBtn" style="--c:'+unit.color+'">'+t("next")+'</button></main>';
}
function startRound(u){
  unit=u;R={qs:buildRound(u),i:0,tries:0,hints:0,streak:0,locked:false,gone:{}};view="practice";render();
}
function wirePractice(){
  [].forEach.call(document.querySelectorAll(".opt"),function(b){b.onclick=function(){answer(+b.getAttribute("data-i"))}});
  [].forEach.call(document.querySelectorAll("[data-opt]"),function(b){b.onclick=function(e){e.stopPropagation();var i=+b.getAttribute("data-opt"),o=optInfo(curQ(),i);
    speakSeq([{t:o.speak,raw:o.speak,lang:o.lang,box:"#opt"+i}])}});
  var sp=$("#stimPlay");if(sp)sp.onclick=function(){var si=stimInfo(curQ());speakSeq([{t:si.speak,lang:"en"}])};
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
    $("#nextBtn").classList.add("show");
    speakSeq([{t:msg,lang:state.lang}]);
  }else{
    R.streak=0;R.tries++;R.gone[i]=1;b.classList.add("soft");b.disabled=true;
    if(R.tries>=2){
      R.locked=true;$("#opt"+q.ans).classList.add("right");
      var o=optInfo(q,q.ans),shown=q.kind==="meaning"&&state.lang==="en"?q.opts[q.ans].en:o.text;
      say(t("reveal")+" "+shown,"rev");$("#nextBtn").classList.add("show");
      speakSeq([{t:t("reveal"),lang:state.lang},{t:o.speak,lang:o.lang}]);
    }else{say(t("try1"),"try");speakSeq([{t:t("try1"),lang:state.lang}])}
  }
}
function nextQ(){
  stopSpeech();
  if(R.i+1>=R.qs.length){state.done[unit.id]=true;save();view="done";render();confetti(60);return}
  R.i++;R.tries=0;R.hints=0;R.locked=false;R.gone={};render();window.scrollTo(0,0);
}
/* משאירים תמיד שתי אפשרויות. מי שכבר טעה פעם אחת נשאר לו מסיח אחד להסרה;
   לפני התיקון הוסרו שניים ונשארה רק התשובה הנכונה. */
function eliminate(){
  var q=curQ(),wrong=[];q.opts.forEach(function(_,i){if(i!==q.ans&&!R.gone[i])wrong.push(i)});
  sample(wrong,Math.max(0,wrong.length-1)).forEach(function(i){R.gone[i]=1;var b=$("#opt"+i);b.classList.add("soft");b.disabled=true});
}
function hintKey(q){return q.kind==="auth"?"h_auth":q.kind==="alisten"?"h_al":"h_"+q.kind}
function hint(){
  if(R.locked)return;
  var q=curQ(),h=t(hintKey(q));R.hints++;
  if(R.hints===1){say("💡 "+h,"hint");speakSeq([{t:h,lang:state.lang}])}
  else if(R.hints===2){eliminate();say("💡 "+t("h2note")+" "+h,"hint");speakSeq([{t:t("h2note"),lang:state.lang}])}
  else openLimor();
}
/* ---------- Limor help ---------- */
/* an example card that is not the answer, so the explanation never names it */
function exampleFor(q){
  var letterKind=q.kind==="aw"||q.kind==="al"||q.kind==="alisten";
  var pool=unitBy(letterKind?"abc":(q.unit&&unitBy(q.unit).kind!=="phrase"?q.unit:"animals")).cards;
  var bad=q.w?q.w.en:(q.correct||"");
  var pick=pool.filter(function(c){return c.en!==bad&&c.en.length<8})[0]||pool[0];
  return pick;
}
function explain(){
  var q=curQ(),ex=exampleFor(q),k=q.kind==="auth"?"lmX_auth":q.kind==="alisten"?"lmX_al":"lmX_"+q.kind;
  var letter=(ex.letter||ex.en.charAt(0)).toUpperCase(),tr=state.lang==="en"?ex.emoji:ex.tr[state.lang];
  return t(k,{w:ex.en,l:letter,e:ex.emoji,t:tr});
}
function openLimor(){
  stopSpeech();var q=curQ(),u=unitBy(q.unit);
  var back=document.activeElement;
  var ov=document.createElement("div");ov.className="limorov";ov.id="limorOv";
  ov.innerHTML='<div class="limorbox" role="dialog" aria-modal="true" aria-label="'+t("lmTitle")+'" tabindex="-1"><div class="lhead"><span class="lav big"><img src="/img/limor.jpg" alt="" onerror="this.remove()">ל</span><b>'+t("lmTitle")+'</b><button class="x" id="lmClose" aria-label="'+t("back")+'">✕</button></div>'+
   '<div class="lplay"><button class="bigbtn play" id="lmPlay"><span>▶</span> '+t("play")+'</button><button class="bigbtn stop" id="lmStop"><span>■</span> '+t("stop")+'</button></div>'+
   '<p class="ltext" id="lmText" lang="'+state.lang+'" dir="'+dirOf(state.lang)+'">'+mk(explain()).html+'</p>'+
   '<div class="lask"><b>'+t("lmAsk")+'</b>'+
   '<button class="lq" data-k="lmR1">'+t("lmB1")+'</button><button class="lq" data-k="lmR2">'+t("lmB2")+'</button><button class="lq" data-k="lmR3">'+t("lmB3")+'</button><button class="lq" data-k="cards">'+t("lmB4")+'</button><button class="lq alt" data-k="explain">'+t("lmOther")+'</button></div></div>';
  document.body.appendChild(ov);
  function playText(){speakSeq([{t:mk($("#lmText").textContent).spoken,lang:state.lang,el:"#lmText"}])}
  function show(k){
    if(k==="cards"){
      $("#lmText").innerHTML='<span class="cl">'+u.cards.map(function(c,i){return '<span class="clr" id="lm'+i+'"><b lang="en" dir="ltr">'+esc(c.en)+'</b>'+(trOf(c)?' – '+esc(trOf(c)):'')+'</span>'}).join("")+'</span>';
      var segs=[{t:t("lmR4"),lang:state.lang}];u.cards.forEach(function(c,i){var tr=trOf(c);segs.push({t:c.en,lang:"en",box:"#lm"+i});if(tr)segs.push({t:tr,lang:state.lang})});
      speakSeq(segs);return}
    if(k==="explain"){$("#lmText").innerHTML=mk(explain()).html;playText();return}
    $("#lmText").innerHTML=mk(t(k)).html;
    if(k==="lmR3"&&!R.locked)eliminate();
    if(k==="lmR1"){closeL();speakSeq(practiceSegs());return}
    playText();
  }
  function onKey(e){if(e.key==="Escape"||e.key==="Esc"){e.preventDefault();closeL()}}
  function closeL(){stopSpeech();document.removeEventListener("keydown",onKey);ov.remove();
    try{if(back&&back.focus)back.focus()}catch(e){}}
  document.addEventListener("keydown",onKey);
  try{$("#lmClose").focus()}catch(e){}
  $("#lmClose").onclick=closeL;$("#lmPlay").onclick=playText;$("#lmStop").onclick=stopSpeech;
  [].forEach.call(ov.querySelectorAll(".lq"),function(b){b.onclick=function(){show(b.getAttribute("data-k"))}});
  /* Limor never names the answer: she explains how to find it, with an example from another word */
  playText();
}
/* ---------- done / settings ---------- */
function renderDone(){
  return topbar(uTitle(unit),1)+'<main class="done"><div class="trophy">🌟</div><p class="lead" id="doneText">'+mk(t("unitDone")).html+'</p>'+playRow()+
   '<button class="cta" id="againBtn" style="--c:'+unit.color+'">'+t("again")+'</button><button class="cta alt" id="unitsBtn">'+t("stories")+'</button></main>';
}
function renderSettings(){
  return topbar(t("settings"),1)+'<main>'+playRow()+
   '<section class="set"><h2>'+t("speed")+'</h2><div class="seg"><button class="chip'+(state.speed==="slow"?" on":"")+'" data-sp="slow" aria-pressed="'+(state.speed==="slow")+'">'+t("speedSlow")+'</button><button class="chip'+(state.speed!=="slow"?" on":"")+'" data-sp="normal" aria-pressed="'+(state.speed!=="slow")+'">'+t("speedNormal")+'</button></div></section>'+
   '<section class="set"><h2>'+t("theme")+'</h2><button class="chip'+(state.dark?" on":"")+'" id="darkBtn" aria-pressed="'+(state.dark?"true":"false")+'">'+(state.dark?"🌙 ✓":"🌙")+'</button></section>'+
   '<section class="set"><h2>'+t("lang")+'</h2><div class="seg">'+LANGS.map(function(l){return '<button class="chip'+(l===state.lang?" on":"")+'" data-lang="'+l+'" aria-pressed="'+(l===state.lang)+'">'+LANG_LABEL[l]+'</button>'}).join("")+'</div><p class="small">'+t("mtNote")+'</p></section>'+
   '<p class="small">'+t("privacy")+'</p><p class="small">'+t("credit")+'</p>'+
   '<button class="chip danger" id="resetBtn">'+t("reset")+'</button></main>';
}
/* ---------- confetti ---------- */
function confetti(n){
  var c=document.createElement("div");c.className="confetti";var em=["🎉","⭐","✨","🌟","🎈"];
  for(var i=0;i<n;i++){var s=document.createElement("span");s.textContent=em[i%em.length];
    s.style.left=(Math.random()*100)+"%";s.style.animationDelay=(Math.random()*0.5)+"s";s.style.fontSize=(16+Math.random()*18)+"px";c.appendChild(s)}
  document.body.appendChild(c);setTimeout(function(){c.remove()},2600);
}
/* ---------- render ---------- */
function render(){
  applyLang();var h="";
  if(view==="home")h=renderHome();else if(view==="lesson")h=renderLesson();
  else if(view==="practice")h=renderPractice();else if(view==="done")h=renderDone();else if(view==="settings")h=renderSettings();
  $("#app").innerHTML=h;wire();
  [].forEach.call(document.querySelectorAll("[data-u]"),function(b){b.onclick=function(){unit=unitById(b.getAttribute("data-u"));go("lesson")}});
  if(view==="lesson"){
    $("#startBtn").onclick=function(){startRound(unit)};
    if(unit.id!=="mix"){var u=unitBy(unit.id);[].forEach.call(document.querySelectorAll("[data-c]"),function(b){b.onclick=function(){var i=+b.getAttribute("data-c");speakSeq(cardSegs(u.cards[i],i,u))}})}
  }
  if(view==="practice")wirePractice();
  if(view==="done"){$("#againBtn").onclick=function(){startRound(unit)};$("#unitsBtn").onclick=function(){go("home")}}
  if(view==="settings"){
    [].forEach.call(document.querySelectorAll("[data-sp]"),function(b){b.onclick=function(){state.speed=b.getAttribute("data-sp");save();render()}});
    $("#darkBtn").onclick=function(){state.dark=!state.dark;save();render()};
    $("#resetBtn").onclick=function(){if(confirm(t("resetSure"))){state.done={};save();go("home")}};
  }
  if(view==="home"){
    var warn=null;
    if(!("speechSynthesis" in window))warn=t("noVoice");
    else if(allVoices().length&&!voiceFor("en"))warn=t("noEnVoice");
    else if(allVoices().length&&!voiceFor(state.lang))warn=t("noVoice");
    if(warn){var n=document.createElement("p");n.className="small warn";n.textContent=warn;var m=$("main");if(m)m.appendChild(n)}
  }
}
try{speechSynthesis.onvoiceschanged=function(){}}catch(e){}
if(!window.__GATED){
  if(typeof RECORDED!=="undefined")try{RECORDED.setup({base:"audio"})}catch(e){}
  var _q=new URLSearchParams(location.search),_l=_q.get("lang");if(_l&&LANGS.indexOf(_l)>=0)state.lang=_l;
  render();
  var _g=_q.get("go");   /* ?go=unit:animals | lesson:animals | practice:animals — for checks and screenshots */
  if(_g){var _p=_g.split(":");unit=unitById(_p[1]);if(unit){if(_p[0]==="lesson")go("lesson");else if(_p[0]==="practice")startRound(unit)}}
}
/* ---------- Limor (shared tutor), mounted only when the shared scripts exist ---------- */
/* מה שכתוב ללומד על המסך, ולא יותר. בשאלת הקשבה הטקסט מוסתר בכוונה,
   ובשאלת תמונה או אות המילה היא התשובה — לימור מקבלת correct:null,
   ועד כאן קיבלה את התשובה בתוך השאלה עצמה. */
function visibleStim(q){
  if(q.kind==="auth")return q.listen?"":(q.stim||"");
  if(!q.w)return "";
  if(q.kind==="listen"||q.kind==="alisten")return "";
  if(q.kind==="emoji")return q.w.emoji;
  if(q.kind==="aw")return q.w.letter;
  return q.w.en;   /* meaning, al — המילה כתובה על המסך */
}
function screenQ(){if(view!=="practice"||!R)return null;var q=curQ();return {stim:visibleStim(q),prompt:promptText(q,"he")}}
if(window.TUTOR&&!window.__GATED){
  TUTOR.mount({app:"english-elem",lang:function(){return state.lang},
    q:function(){var s=screenQ();if(!s)return null;return {expr:(s.stim?s.stim+" — ":"")+s.prompt,ans:null,level:unit?uTitle(unit,"he"):""}},
    stopHost:function(){stopSpeech()}});
  if(window.BARAK)BARAK.register({app:"english-elem",
    getScreenContext:function(){var s=screenQ();if(!s)return null;var q=curQ();
      return {id:"en"+R.i+"-"+unit.id,type:"mcq",q:(s.stim?s.stim+" — ":"")+s.prompt,options:q.opts.map(function(_,i){return optInfo(q,i,"he").speak}),correct:null,student:null,topic:uTitle(unit,"he"),level:"יסודי",curriculum:"אנגלית, בית ספר יסודי"}},
    actions:{read_aloud:{desc:"מקריא את השאלה בקול",run:function(){if(view!=="practice")return false;speakSeq(practiceSegs());return true}},
      show_hint:{desc:"מציג את הרמז הבא",run:function(){if(view!=="practice"||R.locked)return false;var n=R.hints;hint();return R.hints>n}},
      next_question:{desc:"עובר לשאלה הבאה אחרי שנענתה",run:function(){if(view!=="practice"||!R.locked)return false;nextQ();return true}}}});
}
