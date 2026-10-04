/* Read-aloud. Female voice only. Word highlight follows the voice (boundary events, with a timer fallback).
   English words and sentences are spoken in an English voice (lang "en"), instructions in the interface language. */
var SP={tok:0,playing:false,noVoice:false,timers:[]};
var VOICE_M=/(google[^a-z]{0,15}(arabic|العربية)|אברי|אסף|حامد|ماجد|طارق|ناصر|بسام|дмитрий|павел|юрий|максим|николай|\bmale\b|\bman\b|#male|asaf|avri|yoni|moshe|\balex\b|daniel|\bfred\b|\btom\b|aaron|arthur|oliver|rishi|gordon|\blee\b|ralph|bruce|david|\bmark\b|\bguy\b|ryan|christopher|\beric\b|brian|andrew|roger|steffan|liam|william|george|james|\bthomas\b|benjamin|brandon|\bjason\b|\btony\b|dmitry|pavel|\byuri\b|artemi|maxim|nikolai|maged|tarik|naayf|hamed|shakir|\bomar\b|tarek|\bali\b|bassel|\bmoaz\b|hamdan|saleh|abdullah|\btaim\b|fahed|rakan|yasser|hemant|madhur|prabhat)/i;
var VOICE_F=/(הילה|כרמית|زارية|سلمى|أمينة|امينة|هدى|فاطمة|ليلى|نورا|светлана|дарья|ирина|екатерина|татьяна|елена|female|woman|#female|\bfem\b|carmit|hila|\bmiri\b|\bdana\b|shira|samantha|karen|moira|tessa|serena|victoria|\bava\b|allison|susan|vicki|nicky|\bzoe\b|fiona|\bkate\b|shelley|zira|hazel|aria|jenny|michelle|\bana\b|\beva\b|emma|libby|sonia|natasha|clara|\bamber\b|ashley|\bcora\b|elizabeth|monica|\bsara\b|\bsarah\b|\bjane\b|\bnancy\b|\bluna\b|\bmolly\b|irina|milena|svetlana|dariya|\belena\b|katja|ekaterina|\bkatya\b|tatyana|\balena\b|hoda|salma|zariyah|amina|\bhala\b|noura|laila|layla|fatima|zeina|\biman\b|\brana\b|\bsana\b|maryam|asma|heera|raveena|swara|neerja)/i;
function allVoices(){try{return speechSynthesis.getVoices()||[]}catch(e){return[]}}
/* ---------------------------------------------------------------------
   ארבעת מנגנוני ההקראה ועוד חמישי. הועתקו מ-english/index.html (שם הם
   כבר רצים ונבדקים ב-.claude/qa/voice.js) ולא נוסחו כאן מחדש. בהעתקה
   שממנה נולדה האפליקציה הזאת הם לא הגיעו, ובלעדיהם: iOS שותק, ההקראה
   נחתכת אחרי 15 שניות בכרום שולחני, ו-onend אבוד נועל את התור לנצח.
   --------------------------------------------------------------------- */
/* 1 · שומר-ער. ההקראה נחתכת אחרי כ-15 שניות בכרום/אדג׳ שולחניים.
   במובייל אין את הבאג ופעולה כזאת דווקא מקרטעת שם. */
var NEEDS_KEEPALIVE=/Chrome|Chromium|Edg\//.test(navigator.userAgent)
                 &&!/Android|Mobile/i.test(navigator.userAgent);
var _kaTimer=null;
function startKeepAlive(){
  if(!NEEDS_KEEPALIVE||!("speechSynthesis" in window)||_kaTimer)return;
  _kaTimer=setInterval(function(){
    try{
      if(!speechSynthesis.speaking){stopKeepAlive();return}
      if(speechSynthesis.paused)return;   /* עצירה מכוונת - לא נוגעים */
      speechSynthesis.pause();speechSynthesis.resume();
    }catch(e){stopKeepAlive()}
  },9000);
}
function stopKeepAlive(){if(_kaTimer){clearInterval(_kaTimer);_kaTimer=null}}
function maybeStopKeepAlive(){
  try{if(speechSynthesis.speaking||speechSynthesis.pending)return}catch(e){}
  stopKeepAlive();
}
/* 2 · הפניה חיה ל-utterance. כרום אוסף אובייקט שאין אליו הפניה, ואיתו
   נעלמים onend ו-onboundary: המקטע הבא לא יוצא לעולם. */
var _activeU=null;
/* 3 · קול רשת שנכשל. מרגע שאחד נכשל, מיון ראשון מעדיף קול מקומי. */
var _netVoiceOK=true;
function voiceUsable(v){
  if(!v||v.localService!==false)return 1;
  return (_netVoiceOK&&navigator.onLine!==false)?1:0;
}
function byUsable(a){return a.slice().sort(function(x,y){return voiceUsable(y)-voiceUsable(x)})}
/* 4 · שומר זמן. יש מכשירים שבהם onend פשוט לא נורה. ארבע שניות שבהן
   המנוע לא מדבר ולא ממתין נחשבות סוף. מחזיר פונקציית ביטול. */
function ttsWatchdog(alive,onSilent){
  var idle=0,dog=setInterval(function(){
    if(!alive()){clearInterval(dog);return}
    var busy=false;
    try{busy=!!(speechSynthesis.speaking||speechSynthesis.pending)}catch(e){}
    if(busy){idle=0;return}
    if(++idle>=4){clearInterval(dog);onSilent()}
  },1000);
  return function(){clearInterval(dog)};
}
/* 5 · שחרור במגע. iOS לא ישמיע כלום עד שאמירה אחת יצאה מתוך handler של
   מגע אמיתי. אמירה שיוצאת אחרי await - וכאן RECORDED.play אסינכרוני
   ומחזיר שליטה ל-device() מחוץ למגע - נבלעת בשקט. קריאה ישירה, בלי
   הבטחה: הבטחה שוברת את שרשרת המגע וספארי כבר לא יזהה יוזמת משתמש.
   (שחרור אלמנט השמע לקובץ המוקלט נעשה ב-/speech/recorded.js.) */
try{document.addEventListener("pointerdown",function(){
  try{speechSynthesis.speak(new SpeechSynthesisUtterance(""))}catch(e){}
},{once:true});}catch(e){}
/* עוזבים את הדף - הקול נעצר. בלעדיו הוא ממשיך ברקע אחרי מעבר לטאב אחר. */
try{document.addEventListener("visibilitychange",function(){
  if(document.hidden)stopSpeech();
});}catch(e){}
function voiceFor(lang){
  var code=LANG_TTS[lang].toLowerCase(), pre=code.slice(0,2);
  var vs=allVoices().filter(function(v){var l=(v.lang||"").toLowerCase().replace("_","-");return l.indexOf(pre)===0});
  var ok=vs.filter(function(v){return !VOICE_M.test(v.name)});
  var f=ok.filter(function(v){return VOICE_F.test(v.name)});
  /* מגדר קודם (הסינון למעלה), ובתוך כל קבוצה voiceUsable הוא מפתח המיון
     הראשון: קול רשת שלא יעבוד עכשיו אינו "פחות טוב", הוא פשוט ישתוק. */
  f=byUsable(f);ok=byUsable(ok);
  return (f[0]||ok[0]||null);   /* all-male device: null, default voice + raised pitch */
}
function mk(text){
  var toks=String(text).split(/\s+/).filter(Boolean), parts=[], html=[];
  toks.forEach(function(tk){
    var clean=tk.replace(/_+/g,"");
    var disp=tk.replace(/_+/g,'<span class="blank"></span>');
    if(/[\u0590-\u05FFa-zA-Z\u0400-\u04FF\u0600-\u06FF0-9]/.test(clean)){parts.push(clean);html.push('<span class="w">'+disp+'</span>')}
    else html.push(disp);
  });
  return {html:html.join(" "),spoken:parts.join(" ")};
}
/* a sentence with a blank, for speech: the blank becomes a short pause */
function spokenStim(s){return String(s).replace(/_+/g,", ,").replace(/↔/g,",")}
function clearHl(){
  SP.timers.forEach(clearTimeout);SP.timers=[];
  [].forEach.call(document.querySelectorAll(".w.hl,.opt.hl,.card.hl,.wc.hl,.xc.hl"),function(e){e.classList.remove("hl")});
}
function stopSpeech(){
  SP.tok++;SP.playing=false;clearHl();stopKeepAlive();_activeU=null;
  try{speechSynthesis.cancel()}catch(e){}
  try{if(typeof RECORDED!=="undefined")RECORDED.stop()}catch(e){}
  var p=document.getElementById("playBtn");if(p)p.classList.remove("on");
}
function rate(){return state.slow?0.62:(state.speed==="slow"?0.75:0.92)}
/* segs: [{t, lang, raw (text the recorder knows), el:'#id' (words inside get highlighted), box:'#id' (whole element highlighted)}] */
function speakSeq(segs,done){
  stopSpeech();
  if(!("speechSynthesis" in window)){SP.noVoice=true;return}
  var tok=SP.tok,i=0;SP.playing=true;
  var pb=document.getElementById("playBtn");if(pb)pb.classList.add("on");
  (function next(){
    if(tok!==SP.tok)return;
    if(i>=segs.length){SP.playing=false;clearHl();if(pb)pb.classList.remove("on");if(done)done();return}
    var s=segs[i++];
    if(!s.t){next();return}
    speakOne(s,tok,next);
  })();
}
function speakOne(s,tok,cb){
  var root=s.el?document.querySelector(s.el):null, ws=root?root.querySelectorAll(".w"):[];
  var box=s.box?document.querySelector(s.box):null; if(box)box.classList.add("hl");
  var words=s.t.split(/\s+/).filter(Boolean), cur=-1, got=false, finished=false, lang=s.lang||"he";
  var disarm=null, retried=false;
  function hl(k){if(k===cur||!ws[k])return;if(ws[cur])ws[cur].classList.remove("hl");cur=k;ws[k].classList.add("hl");
    try{ws[k].scrollIntoView({block:"nearest"})}catch(e){}}
  function fin(){if(finished)return;finished=true;
    if(disarm){disarm();disarm=null}
    maybeStopKeepAlive();
    SP.timers.forEach(clearTimeout);SP.timers=[];
    if(ws[cur])ws[cur].classList.remove("hl");if(box)box.classList.remove("hl");
    if(tok===SP.tok)cb()}
  function device(){
    if(finished||tok!==SP.tok)return;
    var starts=[],p=0;
    words.forEach(function(w){var k=s.t.indexOf(w,p);starts.push(k);p=k+w.length});
    var u=new SpeechSynthesisUtterance(s.t), v=voiceFor(lang);
    u.lang=LANG_TTS[lang];
    if(v)u.voice=v;else u.pitch=1.25;
    u.rate=rate();
    u.onboundary=function(e){
      if(tok!==SP.tok)return; if(e.name&&e.name!=="word")return; got=true;
      var k=0;for(var j=0;j<starts.length;j++){if(starts[j]<=e.charIndex)k=j}hl(k);
    };
    u.onend=fin;
    u.onerror=function(e){
      if(finished||tok!==SP.tok)return;
      var err=(e&&e.error)||"";
      /* ביטול יזום אינו תקלה - stopSpeech כבר ניקה אחריו */
      if(err==="canceled"||err==="interrupted"){finished=true;if(disarm){disarm();disarm=null}return}
      /* קול רשת שנכשל פירושו כמעט תמיד שאין אינטרנט. עוברים לקול מקומי
         וחוזרים על אותו מקטע, פעם אחת, כדי שלא יישבר בשקט באמצע שאלה. */
      if(!retried&&v&&v.localService===false){
        retried=true;_netVoiceOK=false;_activeU=null;
        if(disarm){disarm();disarm=null}
        SP.timers.push(setTimeout(device,260));
        return;
      }
      fin();
    };
    /* fallback: no boundary events (some Android voices). Estimate word timing. */
    if(ws.length){
      SP.timers.push(setTimeout(function(){
        if(got||tok!==SP.tok)return;
        var per=Math.max(260,(s.t.length*72/u.rate)/Math.max(1,words.length));
        words.forEach(function(_,k){SP.timers.push(setTimeout(function(){if(!got&&tok===SP.tok)hl(k)},k*per))});
      },700));
    }
    try{if(speechSynthesis.paused)speechSynthesis.resume()}catch(e){}
    _activeU=u;                        /* מגן מפני איסוף זבל */
    speechSynthesis.speak(u);
    startKeepAlive();
    if(disarm)disarm();
    disarm=ttsWatchdog(function(){return !finished&&tok===SP.tok},fin);
  }
  /* layer 1: recorded file (speech/recorded.js, Kore). A file exists only for text that record.js recorded exactly,
     in the language folder audio/<lang>/. No file, or a failed file: the device voice below. No word highlight on a file. */
  if(typeof RECORDED!=="undefined"){
    try{speechSynthesis.cancel()}catch(e0){}
    var ok=false;
    try{ok=RECORDED.play(s.raw||s.t,lang,{rate:rate(),onEnd:fin,onError:device})}catch(e1){ok=false}
    if(ok)return;
  }
  device();
}
