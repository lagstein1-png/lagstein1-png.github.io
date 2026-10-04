var KEY="civics-elem:v1";
var state={lang:"he",speed:"normal",slow:false,dark:false,done:{}};
try{var _s=JSON.parse(localStorage.getItem(KEY)||"null");if(_s){for(var k in _s)state[k]=_s[k]}}catch(e){}
if(!state.done)state.done={};
function save(){try{localStorage.setItem(KEY,JSON.stringify({lang:state.lang,speed:state.speed,slow:state.slow,dark:state.dark,done:state.done}))}catch(e){}}
var view="home", unit=null, R=null; /* R = practice round state */
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
  var langs=LANGS.map(function(l){return '<button class="lg'+(l===state.lang?' on':'')+'" data-lang="'+l+'" aria-pressed="'+(l===state.lang?"true":"false")+'" aria-label="'+LANG_LABEL[l]+'">'+(l==="he"?"עב":l==="ar"?"عر":l==="ru"?"RU":"EN")+'</button>'}).join("");
  return '<header class="top">'+(backTo?'<button class="back" id="backBtn" aria-label="'+t("back")+'">'+(dirOf(state.lang)==="rtl"?"➜":"⬅")+'</button>':'<span class="logo">🏛️</span>')+
   '<h1 id="pageTitle">'+esc(title)+'</h1><nav class="langs">'+langs+'</nav><button class="gear" id="gearBtn" aria-label="'+t("settings")+'">⚙️</button></header>';
}
function playRow(){
  return '<div class="playrow"><button class="bigbtn play" id="playBtn"><span>▶</span> '+t("play")+'</button>'+
   '<button class="bigbtn stop" id="stopBtn"><span>■</span> '+t("stop")+'</button>'+
   '<button class="bigbtn slow'+(state.slow?' on':'')+'" id="slowBtn" aria-pressed="'+(state.slow?"true":"false")+'"><span>🐢</span> '+t("slow")+'</button></div>';
}
function wire(){
  [].forEach.call(document.querySelectorAll("[data-lang]"),function(b){b.onclick=function(){state.lang=b.getAttribute("data-lang");save();stopSpeech();applyLang();render()}});
  var g=$("#gearBtn");if(g)g.onclick=function(){go("settings")};
  var bb=$("#backBtn");if(bb)bb.onclick=function(){
    if(view==="practice"||view==="done")go("lesson");else if(view==="settings")go(unit?"lesson":"home");else go("home")};
  var sb=$("#stopBtn");if(sb)sb.onclick=stopSpeech;
  var sl=$("#slowBtn");if(sl)sl.onclick=function(){state.slow=!state.slow;save();sl.classList.toggle("on",state.slow);sl.setAttribute("aria-pressed",state.slow?"true":"false")};
  var pb=$("#playBtn");if(pb)pb.onclick=function(){speakSeq(pageSegs())};
}
/* ---------- screens ---------- */
function storyText(s,l){return s.lines.map(function(x){return x[l||state.lang]}).join(" ")}
function pageSegs(){
  if(view==="home")return [{t:t("appTitle")+". "+t("appSub"),lang:state.lang,el:"#intro"}];
  if(view==="lesson"){
    if(unit.id==="mix")return [{t:t("mix")+".",lang:state.lang}];
    var s=storyById(unit.id),segs=[{t:uTitle(unit),raw:s.title.he,lang:state.lang}];
    s.lines.forEach(function(x,i){segs.push({t:mk(x[state.lang]).spoken,raw:x.he,lang:state.lang,el:"#ln"+i})});
    return segs;
  }
  if(view==="settings")return [{t:t("settings")+". "+t("lang")+". "+t("speed")+". "+t("privacy")+" "+t("credit"),lang:state.lang}];
  if(view==="done")return [{t:t("unitDone"),lang:state.lang,el:"#doneText"}];
  if(view==="practice")return practiceSegs();
  return [];
}
function renderHome(){
  var cards=UNITS.map(function(u){
    return '<button class="ucard" data-u="'+u.id+'" style="--c:'+u.color+'"><span class="ui">'+u.icon+'</span><span class="ut">'+esc(uTitle(u))+'</span>'+(state.done[u.id]?'<span class="ck" title="'+t("unitCheck")+'">✓</span>':'')+'</button>';
  }).join("");
  return topbar(t("appTitle"))+'<main>'+playRow()+'<p class="lead" id="intro"><b>'+esc(t("appTitle"))+'.</b> '+esc(t("appSub"))+'</p><h2>'+t("stories")+'</h2><div class="ucards">'+cards+'</div>'+
    '<p class="small">'+t("privacy")+'</p></main>';
}
function renderLesson(){
  if(unit.id==="mix")return topbar(t("mix"),1)+'<main>'+playRow()+'<div class="emoji" aria-hidden="true">'+unit.icon+'</div><h2>'+esc(t("mix"))+'</h2><button class="cta" id="startBtn" style="--c:'+unit.color+'">'+t("start")+'</button></main>';
  var s=storyById(unit.id), m={html:s.lines.map(function(x,i){return '<span class="ln" id="ln'+i+'">'+mk(x[state.lang]).html+'</span>'}).join(" ")};
  return topbar(uTitle(unit),1)+'<main>'+playRow()+'<div class="emoji" aria-hidden="true">'+unit.icon+'</div><h2>'+t("lesson")+'</h2><p class="lead story" id="lessonText" lang="'+state.lang+'" dir="'+dirOf(state.lang)+'">'+m.html+'</p>'+
    '<button class="cta" id="startBtn" style="--c:'+unit.color+'">'+t("start")+'</button></main>';
}
/* ---------- practice ---------- */
function curQ(){return R.qs[R.i]}
function optText(k,l){return entText(k)[l||state.lang]}
function qText(q,l){return q.q[l||state.lang]}
function practiceSegs(){
  var q=curQ(),segs=[{t:mk(qText(q)).spoken,raw:q.q.he,lang:state.lang,el:"#qtext"}];
  q.keys.forEach(function(k,i){segs.push({t:optText(k),raw:optText(k,"he"),lang:state.lang,box:"#opt"+i})});
  return segs;
}
function renderPractice(){
  var q=curQ(), dots="", l=state.lang, d=dirOf(l);
  for(var i=0;i<R.qs.length;i++)dots+='<i class="'+(i<R.i?"d":i===R.i?"c":"")+'"></i>';
  var opts=q.keys.map(function(k,i){
    /* המצב חוזר מ-R ולא מה-DOM. render() רץ גם באמצע שאלה (מעבר שפה),
       ובלעדי זה התשובה שכבר נענתה נמחקת, הכפתור הבא נעלם והמסך קופא. */
    var cls="opt", off=R.gone[i]&&i!==q.ans;
    if(R.locked&&i===q.ans)cls+=" right"; else if(off)cls+=" soft";
    return '<div class="optwrap"><button class="'+cls+'" lang="'+l+'" dir="'+d+'" data-i="'+i+'" id="opt'+i+'"'+(off?" disabled":"")+'>'+esc(optText(k))+'</button><button class="spk" data-opt="'+i+'" aria-label="'+t("play")+'">🔊</button></div>';
  }).join("");
  var st=storyById(q.story);
  return topbar(uTitle(unit),1)+'<main class="prac"><div class="prog" aria-label="'+t("qOf",{n:R.i+1,m:R.qs.length})+'">'+dots+'</div>'+
   playRow()+'<div class="stage"><div class="emoji" aria-hidden="true">'+st.icon+'</div><div class="sent" lang="'+l+'" dir="'+d+'" id="qtext">'+mk(qText(q)).html+'</div></div><div class="opts">'+opts+'</div>'+
   '<div class="fb'+(R.fb?" "+R.fb.c:"")+'" id="fb" role="status">'+(R.fb?esc(R.fb.m):"")+'</div>'+
   '<div class="helprow"><button class="hbtn hint" id="hintBtn">💡 '+t("hintBtn")+'</button><button class="hbtn limor" id="limorBtn"><span class="lav">ל</span> '+t("limorBtn")+'</button></div>'+
   '<button class="cta next'+(R.locked?" show":"")+'" id="nextBtn" style="--c:'+unit.color+'">'+t("next")+'</button></main>';
}
function startRound(u){
  unit=u;R={qs:buildRound(u),i:0,tries:0,hints:0,streak:0,locked:false,gone:{}};view="practice";render();
}
function wirePractice(){
  [].forEach.call(document.querySelectorAll(".opt"),function(b){b.onclick=function(){answer(+b.getAttribute("data-i"))}});
  [].forEach.call(document.querySelectorAll("[data-opt]"),function(b){b.onclick=function(e){e.stopPropagation();var i=+b.getAttribute("data-opt");
    speakSeq([{t:optText(curQ().keys[i]),raw:optText(curQ().keys[i],"he"),lang:state.lang,box:"#opt"+i}])}});
  $("#hintBtn").onclick=hint;$("#limorBtn").onclick=openLimor;
  $("#nextBtn").onclick=nextQ;
}
function say(msg,cls){var f=$("#fb");f.className="fb "+(cls||"");f.textContent=msg;if(R)R.fb={m:msg,c:cls||""};}
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
      var ans=optText(q.a);
      say(t("reveal")+" "+ans,"rev");$("#nextBtn").classList.add("show");
      speakSeq([{t:t("reveal"),lang:state.lang},{t:ans,lang:state.lang}]);
    }else{say(t("try1"),"try");speakSeq([{t:t("try1"),lang:state.lang}])}
  }
}
function nextQ(){
  stopSpeech();
  if(R.i+1>=R.qs.length){state.done[unit.id]=true;save();view="done";render();confetti(60);return}
  R.i++;R.tries=0;R.hints=0;R.locked=false;R.gone={};R.fb=null;render();window.scrollTo(0,0);
}
function eliminate(){
  var q=curQ(),wrong=[];q.keys.forEach(function(_,i){if(i!==q.ans&&!R.gone[i])wrong.push(i)});
  sample(wrong,Math.min(2,wrong.length)).forEach(function(i){R.gone[i]=1;var b=$("#opt"+i);b.classList.add("soft");b.disabled=true});
}
function hint(){
  if(R.locked)return;
  var q=curQ(),h=t("h_story",{s:storyById(q.story).title[state.lang]});R.hints++;
  if(R.hints===1){say("💡 "+h,"hint");speakSeq([{t:h,lang:state.lang}])}
  else if(R.hints===2){eliminate();say("💡 "+t("h2note")+" "+h,"hint");speakSeq([{t:t("h2note"),lang:state.lang}])}
  else openLimor();
}
/* ---------- Limor help ---------- */
function openLimor(){
  stopSpeech();var q=curQ(),st=storyById(q.story);
  var ov=document.createElement("div");ov.className="limorov";ov.id="limorOv";
  ov.innerHTML='<div class="limorbox"><div class="lhead"><span class="lav big"><img src="/img/limor.jpg" alt="" onerror="this.remove()">ל</span><b>'+t("lmTitle")+'</b><button class="x" id="lmClose" aria-label="'+t("back")+'">✕</button></div>'+
   '<div class="lplay"><button class="bigbtn play" id="lmPlay"><span>▶</span> '+t("play")+'</button><button class="bigbtn stop" id="lmStop"><span>■</span> '+t("stop")+'</button></div>'+
   '<p class="ltext" id="lmText" lang="'+state.lang+'" dir="'+dirOf(state.lang)+'">'+mk(t("lmR4")).html+'</p>'+
   '<div class="lask"><b>'+t("lmAsk")+'</b>'+
   '<button class="lq" data-k="lmR1">'+t("lmB1")+'</button><button class="lq" data-k="lmR2">'+t("lmB2")+'</button><button class="lq" data-k="lmR3">'+t("lmB3")+'</button><button class="lq" data-k="story">'+t("lmB4")+'</button><button class="lq alt" data-k="lmHow">'+t("lmOther")+'</button></div></div>';
  document.body.appendChild(ov);
  function playText(){speakSeq([{t:mk($("#lmText").textContent).spoken,lang:state.lang,el:"#lmText"}])}
  function show(k){
    if(k==="story"){$("#lmText").innerHTML=st.lines.map(function(x,i){return '<span class="ln" id="lm'+i+'">'+mk(x[state.lang]).html+'</span>'}).join(" ");
      speakSeq(st.lines.map(function(x,i){return{t:mk(x[state.lang]).spoken,raw:x.he,lang:state.lang,el:"#lm"+i}}));return}
    $("#lmText").innerHTML=mk(t(k)).html;
    if(k==="lmR3"&&!R.locked)eliminate();
    if(k==="lmR1"){closeL();speakSeq(practiceSegs());return}
    playText();
  }
  function closeL(){stopSpeech();ov.remove()}
  $("#lmClose").onclick=closeL;$("#lmPlay").onclick=playText;$("#lmStop").onclick=stopSpeech;
  [].forEach.call(ov.querySelectorAll(".lq"),function(b){b.onclick=function(){show(b.getAttribute("data-k"))}});
  /* Limor never names the answer: she sends the child back to the story and to the question */
  playText();
}
/* ---------- done / settings ---------- */
function renderDone(){
  return topbar(uTitle(unit),1)+'<main class="done"><div class="trophy">🌟</div><p class="lead" id="doneText">'+mk(t("unitDone")).html+'</p>'+playRow()+
   '<button class="cta" id="againBtn" style="--c:'+unit.color+'">'+t("again")+'</button><button class="cta alt" id="unitsBtn">'+t("stories")+'</button></main>';
}
function renderSettings(){
  return topbar(t("settings"),1)+'<main>'+playRow()+
   '<section class="set"><h2>'+t("speed")+'</h2><div class="seg"><button class="chip'+(state.speed==="slow"?" on":"")+'" data-sp="slow" aria-pressed="'+(state.speed==="slow"?"true":"false")+'">'+t("speedSlow")+'</button><button class="chip'+(state.speed!=="slow"?" on":"")+'" data-sp="normal" aria-pressed="'+(state.speed!=="slow"?"true":"false")+'">'+t("speedNormal")+'</button></div></section>'+
   '<section class="set"><h2>'+t("theme")+'</h2><button class="chip'+(state.dark?" on":"")+'" id="darkBtn" aria-pressed="'+(state.dark?"true":"false")+'">'+(state.dark?"🌙 ✓":"🌙")+'</button></section>'+
   '<section class="set"><h2>'+t("lang")+'</h2><div class="seg">'+LANGS.map(function(l){return '<button class="chip'+(l===state.lang?" on":"")+'" data-lang="'+l+'" aria-pressed="'+(l===state.lang?"true":"false")+'">'+LANG_LABEL[l]+'</button>'}).join("")+'</div><p class="small">'+t("mtNote")+'</p></section>'+
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
  if(view==="lesson")$("#startBtn").onclick=function(){startRound(unit)};
  if(view==="practice")wirePractice();
  if(view==="done"){$("#againBtn").onclick=function(){startRound(unit)};$("#unitsBtn").onclick=function(){go("home")}}
  if(view==="settings"){
    [].forEach.call(document.querySelectorAll("[data-sp]"),function(b){b.onclick=function(){state.speed=b.getAttribute("data-sp");save();render()}});
    $("#darkBtn").onclick=function(){state.dark=!state.dark;save();render()};
    $("#resetBtn").onclick=function(){if(confirm(t("resetSure"))){state.done={};save();go("home")}};
  }
  if(!("speechSynthesis" in window)||(allVoices().length&&!voiceFor(state.lang)&&view==="home")){
    var n=document.createElement("p");n.className="small warn";n.textContent=t("noVoice");var m=$("main");if(m)m.appendChild(n);}
}
try{speechSynthesis.onvoiceschanged=function(){}}catch(e){}
if(!window.__GATED)render();
/* ---------- Limor (shared tutor), mounted only when the shared scripts exist ---------- */
if(window.TUTOR&&!window.__GATED){
  TUTOR.mount({app:"civics-elem",lang:function(){return state.lang},
    q:function(){if(view!=="practice"||!R)return null;var q=curQ();return {expr:qText(q),ans:null,level:unit?uTitle(unit,"he"):""}},
    stopHost:function(){stopSpeech()}});
  if(window.BARAK)BARAK.register({app:"civics-elem",
    getScreenContext:function(){if(view!=="practice"||!R)return null;var q=curQ();
      return {id:"mc"+R.i+"-"+unit.id,type:"mcq",q:qText(q,"he"),options:q.keys.map(function(k){return optText(k,"he")}),correct:null,student:null,topic:uTitle(unit,"he"),level:"יסודי",curriculum:"מולדת ואזרחות, בית ספר יסודי"}},
    actions:{read_aloud:{desc:"מקריא את השאלה בקול",run:function(){if(view!=="practice")return false;speakSeq(practiceSegs());return true}},
      show_hint:{desc:"מציג את הרמז הבא",run:function(){if(view!=="practice"||R.locked)return false;var n=R.hints;hint();return R.hints>n}},
      next_question:{desc:"עובר לשאלה הבאה אחרי שנענתה",run:function(){if(view!=="practice"||!R.locked)return false;nextQ();return true}}}});
}
