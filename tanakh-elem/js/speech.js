/* Read-aloud. Female voice only. Word highlight follows the voice (boundary events, with a timer fallback). */
var SP={tok:0,playing:false,noVoice:false,timers:[]};
/* המילון המשותף (כמו math-app), בתוספת /i — כאן בודקים את v.name כמו שהוא. voice.js, 3.10.2026 */
var VOICE_M=/(google[^a-z]{0,15}(arabic|العربية)|אברי|אסף|حامد|ماجد|طارق|ناصر|بسام|дмитрий|павел|юрий|максим|николай|\bmale\b|\bman\b|#male|asaf|avri|yoni|moshe|\balex\b|daniel|\bfred\b|\btom\b|aaron|arthur|oliver|rishi|gordon|\blee\b|ralph|bruce|david|\bmark\b|\bguy\b|ryan|christopher|\beric\b|brian|andrew|roger|steffan|liam|william|george|james|\bthomas\b|benjamin|brandon|\bjason\b|\btony\b|dmitry|pavel|\byuri\b|artemi|maxim|nikolai|maged|tarik|naayf|hamed|shakir|\bomar\b|tarek|\bali\b|bassel|\bmoaz\b|hamdan|saleh|abdullah|\btaim\b|fahed|rakan|yasser|hemant|madhur|prabhat)/i;
var VOICE_F=/(הילה|כרמית|زارية|سلمى|أمينة|امينة|هدى|فاطمة|ليلى|نورا|светлана|дарья|ирина|екатерина|татьяна|елена|female|woman|#female|\bfem\b|carmit|hila|\bmiri\b|\bdana\b|shira|samantha|karen|moira|tessa|serena|victoria|\bava\b|allison|susan|vicki|nicky|\bzoe\b|fiona|\bkate\b|shelley|zira|hazel|aria|jenny|michelle|\bana\b|\beva\b|emma|libby|sonia|natasha|clara|\bamber\b|ashley|\bcora\b|elizabeth|monica|\bsara\b|\bsarah\b|\bjane\b|\bnancy\b|\bluna\b|\bmolly\b|irina|milena|svetlana|dariya|\belena\b|katja|ekaterina|\bkatya\b|tatyana|\balena\b|hoda|salma|zariyah|amina|\bhala\b|noura|laila|layla|fatima|zeina|\biman\b|\brana\b|\bsana\b|maryam|asma|heera|raveena|swara|neerja)/i;
function allVoices(){try{return speechSynthesis.getVoices()||[]}catch(e){return[]}}
/* ---------------------------------------------------------------------
   ארבעת מנגנוני ההקראה ועוד חמישי. הועתקו מ-english-elem/js/speech.js
   (ושם מ-english/index.html, שבו הם כבר רצים ונבדקים ב-.claude/qa/voice.js)
   ולא נוסחו כאן מחדש. בהעתקה שממנה נולדה האפליקציה הזאת הם לא הגיעו,
   ובלעדיהם: ההקראה נחתכת אחרי 15 שניות בכרום שולחני, ו-onend אבוד
   נועל את התור לנצח.
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
/* 5 · שחרור במגע (המנגנון החמישי): ב-iOS לא תישמע שום אמירה עד שאחת יצאה
   מתוך handler של מגע אמיתי. כאן ההקראה הראשונה היא לרוב קובץ מוקלט
   (RECORDED), ואז speechSynthesis לא משוחרר — והמשך הרצף, שרץ מתוך
   onend ולא מתוך מגע, נבלע בשקט. אמירת רווח בעוצמה אפס, פעם אחת.
   קריאה ישירה, בלי הבטחה: הבטחה שוברת את שרשרת המגע. */
try{window.addEventListener("pointerdown",function(){try{var u=new SpeechSynthesisUtterance(" ");u.volume=0;speechSynthesis.speak(u)}catch(e){}},{once:true})}catch(e){}
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
/* ---------- מקטעים. הועתק מ-english/index.html כלשונו ---------- */
var SEG_MAX=90, SEG_GAP=260;
/* סימן פיסוק בין שתי ספרות הוא חלק מהמספר ולא מקום לחתוך בו:
   בלי הבדיקה הזאת "3,500" נשבר והמנוע קורא "שלוש, חמש מאות". */
function insideNumber(str,i){
  return i>0&&i+1<str.length&&/[0-9]/.test(str[i-1])&&/[0-9]/.test(str[i+1]);
}
function segments(spoken){
  var out=[],parts=[],from=0,i,j;
  function push(t,start){ if(String(t).trim())out.push({text:t,start:start}) }
  for(i=0;i<spoken.length;i++){
    if(".!?:;".indexOf(spoken[i])<0)continue;
    if(insideNumber(spoken,i))continue;
    j=i+1; while(j<spoken.length&&/\s/.test(spoken[j]))j++;
    parts.push({text:spoken.slice(from,j),start:from});
    from=j; i=j-1;
  }
  if(from<spoken.length)parts.push({text:spoken.slice(from),start:from});
  for(var k=0;k<parts.length;k++){
    var p=parts[k];
    if(p.text.length<=SEG_MAX){ push(p.text,p.start); continue }
    var rest=p.text,base=p.start;
    while(rest.length>SEG_MAX){
      var cut=rest.lastIndexOf(",",SEG_MAX);
      while(cut>0&&insideNumber(rest,cut))cut=rest.lastIndexOf(",",cut-1);
      if(cut<SEG_MAX*0.4)cut=rest.lastIndexOf(" ",SEG_MAX);
      if(cut<=0)break;
      push(rest.slice(0,cut+1),base);
      base+=cut+1; rest=rest.slice(cut+1);
    }
    push(rest,base);
  }
  /* מקטע זעיר — "12." או ")" — עם הפסקה של רבע שנייה אחריו נשמע
     כמו גמגום. מאחדים אותו לזה שאחריו. */
  var merged=[];
  for(i=0;i<out.length;i++){
    if(merged.length&&out[i].text.trim().length<12&&
       merged[merged.length-1].text.length+out[i].text.length<=SEG_MAX*1.4){
      merged[merged.length-1].text+=out[i].text; continue;
    }
    if(out[i].text.trim().length<12&&i+1<out.length){
      out[i+1]={text:out[i].text+out[i+1].text,start:out[i].start}; continue;
    }
    merged.push(out[i]);
  }
  out=merged;
  return out.length?out:[{text:spoken,start:0}];
}
function mk(text){
  var toks=String(text).split(/\s+/).filter(Boolean), parts=[], html=[];
  toks.forEach(function(tk){
    var clean=tk.replace(/_+/g,"");
    var disp=tk.replace(/_+/g,'<span class="blank"></span>');
    if(/[֐-׿a-zA-ZЀ-ӿ؀-ۿ0-9]/.test(clean)){parts.push(clean);html.push('<span class="w">'+disp+'</span>')}
    else html.push(disp);
  });
  return {html:html.join(" "),spoken:parts.join(" ")};
}
function clearHl(){
  SP.timers.forEach(clearTimeout);SP.timers=[];
  [].forEach.call(document.querySelectorAll(".w.hl,.opt.hl,.card.hl"),function(e){e.classList.remove("hl")});
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
    /* charIndex נמדד בתוך המקטע; seg.start הוא ההיסט שלו בנאמר כולו,
       ו-hlAt(seg.start+charIndex) הוא מה ששומר את ההדגשה במקום. */
    function hlAt(c){var k=0;for(var j=0;j<starts.length;j++){if(starts[j]<=c)k=j}hl(k)}
    var v=voiceFor(lang), segs=segments(s.t);
    /* מעל SEG_MAX מנועי מכשיר מאיצים ובולעים סופי מילים, ולכן כל אמירה
       ארוכה נחתכת על סוף משפט, ואם אין — על פסיק או רווח. */
    (function sayseg(n){
      if(finished||tok!==SP.tok)return;
      if(n>=segs.length){fin();return}
      /* moved מבטיח שמקטע מתקדם פעם אחת בלבד: onend ושומר-הסף
         יכולים שניהם לרצות לקדם אותו, וקידום כפול מדלג על מקטע. */
      var seg=segs[n], moved=false;
      function next(){
        if(moved||finished||tok!==SP.tok)return;
        moved=true; if(disarm){disarm();disarm=null}
        if(n+1<segs.length)SP.timers.push(setTimeout(function(){sayseg(n+1)},SEG_GAP));
        else fin();
      }
      var u=new SpeechSynthesisUtterance(seg.text);
      u.lang=LANG_TTS[lang];
      if(v)u.voice=v;else u.pitch=1.25;
      u.rate=rate();
      u.onboundary=function(e){
        if(tok!==SP.tok)return; if(e.name&&e.name!=="word")return; got=true;
        hlAt(seg.start+e.charIndex);
      };
      u.onend=next;
      u.onerror=function(e){
        if(moved||finished||tok!==SP.tok)return;
        var err=(e&&e.error)||"";
        /* ביטול יזום אינו תקלה - stopSpeech כבר ניקה אחריו */
        if(err==="canceled"||err==="interrupted"){moved=true;if(disarm){disarm();disarm=null}return}
        /* קול רשת שנכשל פירושו כמעט תמיד שאין אינטרנט. עוברים לקול מקומי
           וחוזרים על אותו מקטע, פעם אחת, כדי שלא יישבר בשקט באמצע שאלה. */
        if(!retried&&v&&v.localService===false){
          retried=true;_netVoiceOK=false;moved=true;_activeU=null;
          if(disarm){disarm();disarm=null}
          v=voiceFor(lang);
          SP.timers.push(setTimeout(function(){sayseg(n)},SEG_GAP));
          return;
        }
        moved=true;if(disarm){disarm();disarm=null}
        fin();
      };
      /* fallback: no boundary events (some Android voices). Estimate word timing. */
      if(ws.length){
        var sw=seg.text.split(/\s+/).filter(Boolean), off=[], q=0;
        sw.forEach(function(w){var k=seg.text.indexOf(w,q);off.push(k);q=k+w.length});
        SP.timers.push(setTimeout(function(){
          if(got||moved||tok!==SP.tok)return;
          var per=Math.max(260,(seg.text.length*72/u.rate)/Math.max(1,sw.length));
          sw.forEach(function(_,m){SP.timers.push(setTimeout(function(){if(!got&&tok===SP.tok)hlAt(seg.start+off[m])},m*per))});
        },700));
      }
      try{if(speechSynthesis.paused)speechSynthesis.resume()}catch(e2){}
      _activeU=u;                        /* מגן מפני איסוף זבל */
      speechSynthesis.speak(u);
      startKeepAlive();
      if(disarm)disarm();
      disarm=ttsWatchdog(function(){return !finished&&tok===SP.tok&&!moved},next);
    })(0);
  }
  /* layer 1: recorded file (speech/recorded.js), Hebrew only. A file exists only for text that record.js recorded exactly;
     no file or a failed file falls back to the device voice below. No word highlight on a file (no boundary events). */
  if(lang==="he"&&typeof RECORDED!=="undefined"){
    try{speechSynthesis.cancel()}catch(e0){}
    var ok=false;
    try{ok=RECORDED.play(s.raw||s.t,"he",{rate:rate(),onEnd:fin,onError:device})}catch(e1){ok=false}
    if(ok)return;
  }
  device();
}
