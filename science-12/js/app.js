var KEY="science-12:v1";
var state={lang:"he",speed:"normal",slow:false,dark:false,textSize:1,clearFont:false,contrast:false,spaced:false,reduceMotion:false,done:{}};
try{var _s=JSON.parse(localStorage.getItem(KEY)||"null");if(_s){for(var k in _s)state[k]=_s[k]}}catch(e){}
if(!state.done)state.done={};
function save(){try{localStorage.setItem(KEY,JSON.stringify({lang:state.lang,speed:state.speed,slow:state.slow,dark:state.dark,textSize:state.textSize,clearFont:state.clearFont,contrast:state.contrast,spaced:state.spaced,reduceMotion:state.reduceMotion,done:state.done}))}catch(e){}}
var view="home", unit=null, R=null; /* R = practice round state */
var $=function(s){return document.querySelector(s)};
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function dirOf(l){return(l==="he"||l==="ar")?"rtl":"ltr"}
/* ששת מצבי הנגישות. עד 5.10.2026 הייתה כאן ערכת הצבע בלבד — חמישה
   מצבים שהאתר כולו מחזיק פשוט לא היו באפליקציה הזאת, ו-`a11y.js`
   לא מדדה אותה כלל. `applyModes` נקראת מ-`applyLang`, כלומר בכל
   רינדור, ולכן המצב חוזר גם אחרי רענון ואחרי מעבר שפה. */
function applyModes(){
  var r=document.documentElement;
  r.setAttribute("data-theme",state.dark?"dark":"light");
  r.classList.toggle("ts2",state.textSize===2);
  r.classList.toggle("ts3",state.textSize===3);
  r.classList.toggle("clear-font",!!state.clearFont);
  r.classList.toggle("hi-contrast",!!state.contrast);
  r.classList.toggle("spaced",!!state.spaced);
  r.classList.toggle("reduce-motion",!!state.reduceMotion);
}
function applyLang(){
  document.documentElement.lang=state.lang;document.documentElement.dir=dirOf(state.lang);
  applyModes();
  if(!window.__GATED)document.title=t("appTitle")+" · bekol";
}
function go(v,extra){stopSpeech();view=v;if(extra){for(var k in extra)window[k]=extra[k]}render();window.scrollTo(0,0)}
function unitById(id){return UNITS.filter(function(u){return u.id===id})[0]}
function uTitle(u,l){return unitTitle(u,l||state.lang)}
/* ---------- chrome ---------- */
function unitIcon(id){
 var drawings={
 senses:'<path d="M30 46c-14-5-15-33 2-35 17-2 19 21 7 26-6 2-5 13-12 12"/><path d="M26 31c-4-8 0-16 7-15 7 1 8 9 3 13"/>',
 animals:'<ellipse cx="32" cy="41" rx="13" ry="11"/><ellipse cx="16" cy="25" rx="5" ry="7"/><ellipse cx="28" cy="17" rx="5" ry="7"/><ellipse cx="40" cy="18" rx="5" ry="7"/><ellipse cx="49" cy="29" rx="5" ry="7"/>',
 plants:'<path d="M32 54V24"/><path d="M32 33C10 34 9 14 12 12c20 0 21 14 20 21ZM32 42c20 1 24-18 22-21-21-1-24 12-22 21Z"/>',
 seasons:'<path d="M14 48C45 56 55 26 50 11 25 9 11 23 14 48ZM14 48l30-29M26 37l-1-13M33 30l12 1"/>',
 water:'<path d="M32 8C26 21 13 33 13 41a19 19 0 0038 0c0-8-13-20-19-33Z"/><path d="M22 41c0 6 4 9 9 10"/>',
 daynight:'<circle cx="32" cy="32" r="23"/><path d="M32 9v46"/><path d="M32 10a22 22 0 000 44Z" fill="currentColor"/>',
 mix:'<rect x="10" y="10" width="44" height="44" rx="9"/><circle cx="23" cy="23" r="2" fill="currentColor"/><circle cx="41" cy="41" r="2" fill="currentColor"/><circle cx="32" cy="32" r="2" fill="currentColor"/>'};
 return '<svg class="uniticon" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">'+(drawings[id]||drawings.plants)+'</svg>';
}
function topbar(title,backTo){
  var langs=LANGS.map(function(l){return '<button class="lg'+(l===state.lang?' on':'')+'" data-lang="'+l+'" aria-pressed="'+(l===state.lang?"true":"false")+'" aria-label="'+LANG_LABEL[l]+'">'+(l==="he"?"עב":l==="ar"?"عر":l==="ru"?"RU":"EN")+'</button>'}).join("");
  return '<header class="top">'+(backTo?'<button class="back" id="backBtn" aria-label="'+t("back")+'">'+(dirOf(state.lang)==="rtl"?"➜":"⬅")+'</button>':'<span class="logo">'+unitIcon('plants')+'</span>')+
   '<h1 id="pageTitle">'+esc(title)+'</h1><nav class="langs">'+langs+'</nav><button class="gear" id="gearBtn" aria-label="'+t("settings")+'">⚙️</button></header>';
}
function playRow(){
  return '<div class="playrow"><button class="bigbtn play" id="playBtn"><span>▶</span> '+t("play")+'</button>'+
   '<button class="bigbtn stop" id="stopBtn"><span>■</span> '+t("stop")+'</button>'+
   '<button class="bigbtn slow'+(state.slow?' on':'')+'" id="slowBtn" aria-pressed="'+(state.slow?"true":"false")+'"><span aria-hidden="true">◷</span> '+t("slow")+'</button></div>';
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
  if(view==="home")return [{t:t("appTitle")+". "+t("appSub"),lang:state.lang,el:"#intro"}].concat(UNITS.map(function(u){return {t:uTitle(u),lang:state.lang,el:"#ut-"+u.id}}));
  if(view==="lesson"){
    if(unit.id==="mix")return [{t:t("mix")+".",lang:state.lang}];
    var s=storyById(unit.id),segs=[{t:uTitle(unit),raw:s.title.he,lang:state.lang}];
    s.lines.forEach(function(x,i){segs.push({t:mk(x[state.lang]).spoken,raw:x.he,lang:state.lang,el:"#ln"+i})});
    return segs;
  }
  if(view==="settings")return [{t:["settings","speed","speedSlow","speedNormal","theme","lang","mtNote","privacy","credit","reset"].map(function(k){return t(k)}).join(". "),lang:state.lang}];
  if(view==="done")return [{t:t("unitDone")+" "+t("again")+" "+t("stories"),lang:state.lang,el:"#doneText"}];
  if(view==="practice")return practiceSegs();
  return [];
}
function renderHome(){
  var cards=UNITS.map(function(u){
    return '<button class="ucard" data-u="'+u.id+'" style="--c:'+u.color+'"><span class="ui">'+unitIcon(u.id)+'</span><span class="ut" id="ut-'+u.id+'">'+mk(uTitle(u)).html+'</span>'+(state.done[u.id]?'<span class="ck" role="img" aria-label="'+t("unitCheck")+'">✓</span>':'')+'</button>';
  }).join("");
  return topbar(t("appTitle"))+'<main>'+playRow()+'<p class="lead" id="intro"><b>'+esc(t("appTitle"))+'.</b> '+esc(t("appSub"))+'</p><h2>'+t("stories")+'</h2><div class="ucards">'+cards+'</div>'+
    '<p class="small">'+t("privacy")+'</p></main>';
}
function renderLesson(){
  if(unit.id==="mix")return topbar(t("mix"),1)+'<main>'+playRow()+'<div class="emoji" aria-hidden="true">'+unitIcon(unit.id)+'</div><h2>'+esc(t("mix"))+'</h2><button class="cta" id="startBtn" style="--c:'+unit.color+'">'+t("start")+'</button></main>';
  var s=storyById(unit.id), m={html:s.lines.map(function(x,i){return '<span class="ln" id="ln'+i+'">'+mk(x[state.lang]).html+'</span>'}).join(" ")};
  return topbar(uTitle(unit),1)+'<main>'+playRow()+'<div class="emoji" aria-hidden="true">'+unitIcon(unit.id)+'</div><h2>'+t("lesson")+'</h2><p class="lead story" id="lessonText" lang="'+state.lang+'" dir="'+dirOf(state.lang)+'">'+m.html+'</p>'+
    '<button class="cta" id="startBtn" style="--c:'+unit.color+'">'+t("start")+'</button></main>';
}
/* ---------- practice ---------- */
function curQ(){return R.qs[R.i]}
function optText(k,l){return entText(k)[l||state.lang]}
function qText(q,l){return q.q[l||state.lang]}
function practiceSegs(){
  var q=curQ(),segs=[{t:mk(qText(q)).spoken,raw:q.q.he,lang:state.lang,el:"#qtext"}];
  q.keys.forEach(function(k,i){segs.push({t:optText(k),raw:optText(k,"he"),lang:state.lang,el:"#opt"+i})});
  return segs;
}
function renderPractice(){
  var q=curQ(), dots="", l=state.lang, d=dirOf(l);
  for(var i=0;i<R.qs.length;i++)dots+='<i class="'+(i<R.i?"d":i===R.i?"c":"")+'"></i>';
  var opts=q.keys.map(function(k,i){
    /* המצב חוזר מ-R ולא מה-DOM. render() רץ גם באמצע שאלה (מעבר שפה),
       ובלעדי זה התשובה שכבר נענתה נמחקת, כפתור הבא נעלם והמסך קופא. */
    var cls="opt", off=R.gone[i]&&i!==q.ans;
    if(R.locked&&i===q.ans)cls+=" right"; else if(off)cls+=" soft";
    return '<div class="optwrap"><button class="'+cls+'" lang="'+l+'" dir="'+d+'" data-i="'+i+'" id="opt'+i+'"'+(off?" disabled":"")+'>'+mk(optText(k)).html+'</button><button class="spk" data-opt="'+i+'" aria-label="'+t("answerSpeak")+'">🔊</button></div>';
  }).join("");
  var st=storyById(q.story);
  return topbar(uTitle(unit),1)+'<main class="prac"><div class="prog" role="img" aria-label="'+t("qOf",{n:R.i+1,m:R.qs.length})+'">'+dots+'</div>'+
   playRow()+'<div class="stage">'+(unit.id==="mix"?'<div class="emoji" role="img" aria-label="'+esc(st.title[l])+'">'+unitIcon(st.id)+'</div>':'<div class="emoji" aria-hidden="true">'+unitIcon(st.id)+'</div>')+'<div class="sent" lang="'+l+'" dir="'+d+'" id="qtext">'+mk(qText(q)).html+'</div></div><div class="opts">'+opts+'</div>'+
   '<div class="fb'+(R.fb?" "+R.fb.c:"")+'" id="fb" role="status">'+(R.fb?esc(R.fb.m):"")+'</div>'+
   '<div class="helprow"><button class="hbtn hint" id="hintBtn">? '+t("hintBtn")+'</button><button class="hbtn limor" id="limorBtn"><span class="lav"><img src="/img/limor.jpg" alt=""></span> '+t("limorBtn")+'</button></div>'+
   '<button class="hbtn solution" id="solutionBtn">'+t("solution")+'</button><button class="cta next'+(R.locked?" show":"")+'" id="nextBtn" style="--c:'+unit.color+'">'+t("next")+'</button></main>';
}
function startRound(u){
  unit=u;R={qs:buildRound(u),i:0,tries:0,hints:0,streak:0,locked:false,gone:{},fb:null};view="practice";render();
}
function wirePractice(){
  [].forEach.call(document.querySelectorAll(".opt"),function(b){b.onclick=function(){answer(+b.getAttribute("data-i"))}});
  [].forEach.call(document.querySelectorAll("[data-opt]"),function(b){b.onclick=function(e){e.stopPropagation();var i=+b.getAttribute("data-opt");
    speakSeq([{t:optText(curQ().keys[i]),raw:optText(curQ().keys[i],"he"),lang:state.lang,el:"#opt"+i}])}});
  $("#hintBtn").onclick=hint;$("#limorBtn").onclick=openLimor;
  $("#nextBtn").onclick=nextQ;$("#solutionBtn").onclick=function(){showSolution()};
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
    say(t("try1"),"try");speakSeq([{t:t("try1"),lang:state.lang}]);
    if(R.tries>=3){R.gone={};[].forEach.call(document.querySelectorAll(".opt"),function(x){x.disabled=false;x.classList.remove("soft")});R.tries=0}

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
function showSolution(){
 var q=curQ(),msg=t("reveal")+" "+optText(q.a);
 R.locked=true;$("#opt"+q.ans).classList.add("right");$("#nextBtn").classList.add("show");
 say(msg,"rev");speakSeq([{t:msg,lang:state.lang}]);
}
function hint(){
 if(R.locked)return;
 var q=curQ(),h=storyById(q.story).hint[state.lang];R.hints++;
 say("? "+h,"hint");speakSeq([{t:h,lang:state.lang}]);
}
/* ---------- Limor help ---------- */
function openLimor(){
  stopSpeech();var q=curQ(),st=storyById(q.story);
  var ov=document.createElement("div");ov.className="limorov";ov.id="limorOv";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label",t("lmTitle"));var focusBefore=document.activeElement;
  ov.innerHTML='<div class="limorbox"><div class="lhead"><span class="lav big"><img src="/img/limor.jpg" alt="" onerror="this.remove()">ל</span><b>'+t("lmTitle")+'</b><button class="x" id="lmClose" aria-label="'+t("back")+'">✕</button></div>'+
   '<div class="lplay"><button class="bigbtn play" id="lmPlay"><span>▶</span> '+t("play")+'</button><button class="bigbtn stop" id="lmStop"><span>■</span> '+t("stop")+'</button></div>'+
   '<p class="ltext" id="lmText" lang="'+state.lang+'" dir="'+dirOf(state.lang)+'">'+mk(t("lmR4")).html+'</p>'+
   '<div class="lask"><b>'+t("lmAsk")+'</b>'+
   '<button class="lq" data-k="lmR1">'+t("lmB1")+'</button><button class="lq" data-k="lmR2">'+t("lmB2")+'</button><button class="lq" data-k="lmR3">'+t("lmB3")+'</button><button class="lq" data-k="story">'+t("lmB4")+'</button><button class="lq alt" data-k="lmHow">'+t("lmOther")+'</button></div></div>';
  document.body.appendChild(ov);
  function playText(){speakSeq([{t:mk($("#lmText").textContent).spoken,lang:state.lang,el:"#lmText"}])}
  function show(k){
    if(k==="story"){$("#lmText").innerHTML=mk(st.help[state.lang]).html;playText();return}
    $("#lmText").innerHTML=mk(t(k)).html;

    if(k==="lmR1"){closeL();speakSeq(practiceSegs());return}
    playText();
  }
  /* Escape ברמת המסמך, כמו ב-civics-elem/js/app.js: מאזין על ov לבדו נורה רק
     כשהמיקוד בתוכו, ולחיצה על הרקע מחזירה את המיקוד ל-body — ואז החלון נתקע פתוח. */
  function onKey(e){if(e.key==="Escape"||e.key==="Esc"){e.preventDefault();closeL()}}
  function closeL(){stopSpeech();document.removeEventListener("keydown",onKey);ov.remove();
    try{if(focusBefore&&focusBefore.focus)focusBefore.focus()}catch(e){}}
  document.addEventListener("keydown",onKey);
  $("#lmClose").onclick=closeL;$("#lmPlay").onclick=playText;$("#lmStop").onclick=stopSpeech;
  [].forEach.call(ov.querySelectorAll(".lq"),function(b){b.onclick=function(){show(b.getAttribute("data-k"))}});
  /* מלכודת המיקוד נשארת על ov — היא קיימת כאן ואין לה מקבילה ב-civics-elem. */
  ov.onkeydown=function(e){if(e.key==="Tab"){var f=ov.querySelectorAll("button"),first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
  try{$("#lmClose").focus()}catch(e){}
  /* Limor never names the answer: she sends the child back to the story and to the question */
  playText();
}
/* ---------- done / settings ---------- */
function renderDone(){
  return topbar(uTitle(unit),1)+'<main class="done"><div class="trophy" aria-hidden="true">🌟</div><p class="lead" id="doneText">'+mk(t("unitDone")).html+'</p>'+playRow()+
   '<button class="cta" id="againBtn" style="--c:'+unit.color+'">'+t("again")+'</button><button class="cta alt" id="unitsBtn">'+t("stories")+'</button></main>';
}
function renderSettings(){
  return topbar(t("settings"),1)+'<main>'+playRow()+
   '<section class="set"><h2>'+t("speed")+'</h2><div class="seg"><button class="chip'+(state.speed==="slow"?" on":"")+'" data-sp="slow" aria-pressed="'+(state.speed==="slow"?"true":"false")+'">'+t("speedSlow")+'</button><button class="chip'+(state.speed!=="slow"?" on":"")+'" data-sp="normal" aria-pressed="'+(state.speed!=="slow"?"true":"false")+'">'+t("speedNormal")+'</button></div></section>'+
   '<section class="set"><h2>'+t("theme")+'</h2><button class="chip'+(state.dark?" on":"")+'" id="darkBtn" aria-pressed="'+(state.dark?"true":"false")+'">'+(state.dark?"🌙 ✓":"🌙")+'</button></section>'+
   '<section class="set"><h2>'+t("a11y")+'</h2>'+
   '<p class="small">'+t("textSize")+'</p><div class="seg">'+[[1,"tsNormal"],[2,"tsBig"],[3,"tsHuge"]].map(function(x){
     return '<button class="chip'+((state.textSize||1)===x[0]?" on":"")+'" data-ts="'+x[0]+'" aria-pressed="'+(((state.textSize||1)===x[0])?"true":"false")+'">'+t(x[1])+'</button>'}).join("")+'</div>'+
   '<div class="seg" style="margin-top:8px;flex-wrap:wrap">'+[["clearFont","clearFont"],["contrast","contrastMode"],["spaced","spacedMode"],["reduceMotion","motionMode"]].map(function(x){
     return '<button class="chip'+(state[x[0]]?" on":"")+'" data-mode="'+x[0]+'" aria-pressed="'+(state[x[0]]?"true":"false")+'">'+t(x[1])+(state[x[0]]?" ✓":"")+'</button>'}).join("")+'</div></section>'+
   '<section class="set"><h2>'+t("lang")+'</h2><div class="seg">'+LANGS.map(function(l){return '<button class="chip'+(l===state.lang?" on":"")+'" data-lang="'+l+'" aria-pressed="'+(l===state.lang?"true":"false")+'">'+LANG_LABEL[l]+'</button>'}).join("")+'</div><p class="small">'+t("mtNote")+'</p></section>'+
   '<p class="small">'+t("privacy")+'</p><p class="small">'+t("credit")+'</p>'+
   '<button class="chip danger" id="resetBtn">'+t("reset")+'</button></main>';
}
/* ---------- confetti ---------- */
function confetti(n){
  var c=document.createElement("div");c.className="confetti";c.setAttribute("aria-hidden","true");var em=["🎉","⭐","✨","🌟","🎈"];
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
    [].forEach.call(document.querySelectorAll("[data-ts]"),function(b){b.onclick=function(){state.textSize=+b.getAttribute("data-ts");save();render()}});
    [].forEach.call(document.querySelectorAll("[data-mode]"),function(b){b.onclick=function(){var k=b.getAttribute("data-mode");state[k]=!state[k];save();render()}});
    $("#resetBtn").onclick=function(){if(confirm(t("resetSure"))){state.done={};save();go("home")}};
  }
  /* שתי תקלות שונות, שתי הודעות. בלי מנוע הקראה אי אפשר להקריא בכלל,
     וזה המקרה היחיד שבו נכון לבקש מהלומד לקרוא לבד. כשיש מנוע ואין בו
     קול נשי — ההקראה כן יוצאת, בקול ברירת המחדל (speech.js, u.pitch=1.25). */
  var warnKey=!("speechSynthesis" in window)?"noSpeech"
             :(allVoices().length&&!voiceFor(state.lang)&&view==="home")?"noVoice":null;
  if(warnKey){
    var n=document.createElement("p");n.className="small warn";n.textContent=t(warnKey);var m=$("main");if(m)m.appendChild(n);}
}
try{speechSynthesis.onvoiceschanged=function(){}}catch(e){}
if(!window.__GATED)render();
/* ---------- לימור ----------

   עד 5.10.2026 ישבה כאן הערה: ״השלד המשותף נטען, אבל ל-science-12
   עדיין אין תפקיד פרוס בשרת, ולכן בכוונה איננו מחברים אפליקציה
   שאינה נתמכת ואיננו משתמשים בתפקיד של מקצוע אחר.״ **זה היה נכון,
   והיא התיישנה:** התפקיד `science-12` נוסף ל-ROLE ונפרס.

   הפער שנשאר היה גרוע מהשניים שההערה מנעה — הכרטיס בדף הבית נושא
   `tTeacher`, כלומר מבטיח ללומד מורה, והאפליקציה לא חיברה אותו
   בכלל. מחובר עכשיו באותו נוסח של civics-elem, שממנה היא נולדה. */
if(window.TUTOR&&!window.__GATED){
  TUTOR.mount({app:"science-12",lang:function(){return state.lang},
    q:function(){if(view!=="practice"||!R)return null;var q=curQ();
      return {expr:qText(q),ans:null,level:unit?uTitle(unit,"he"):""}},
    stopHost:function(){stopSpeech()}});
  if(window.BARAK)BARAK.register({app:"science-12",
    getScreenContext:function(){if(view!=="practice"||!R)return null;var q=curQ();
      return {id:"mc"+R.i+"-"+(unit?unit.id:""),type:"mcq",q:qText(q,"he"),
        options:q.keys.map(function(k){return optText(k,"he")}),
        correct:null,student:null,topic:unit?uTitle(unit,"he"):"",
        level:"יסודי",curriculum:"מדע וטכנולוגיה, כיתות א׳-ב׳"}},
    actions:{
      read_aloud:{desc:"מקריא את השאלה בקול",
        run:function(){if(view!=="practice")return false;speakSeq(practiceSegs());return true}},
      show_hint:{desc:"מציג את הרמז הבא",
        run:function(){if(view!=="practice"||R.locked)return false;var n=R.hints;hint();return R.hints>n}},
      next_question:{desc:"עובר לשאלה הבאה אחרי שנענתה",
        run:function(){if(view!=="practice"||!R.locked)return false;nextQ();return true}}}});
}
