/* =====================================================================
   ״עזרה מהמורה״ — התשתית המשותפת לכל האפליקציות.

   קובץ אחד, כמו `legal/`. אפליקציה אינה מחזיקה קוד בוט משלה; היא
   קוראת ל-`TUTOR.mount(...)` ומוסיפה כפתור. הסיבה כתובה ב-CLAUDE.md:
   כל עותק נוסף של מנוע הוא משטח באגים נוסף, ובוט שהועתק אחת־עשרה
   פעמים היה מייצר אחת־עשרה גרסאות של אותו תיקון.

   מה שאינו כאן, במתכוון:

   · **הוראות המערכת.** הן ב-`tutor-api/worker.js`, בשרת. דפדפן
     אפשר לערוך, ולכן מורה שמוגדר בדפדפן אינו מורה אלא הצעה.
   · **מפתח API.** אין ולא יהיה. השרת מחזיק אותו כ-Secret.
   · **שמירת שיחות.** השיחה יושבת בזיכרון בלבד, נמחקת כשמשתנה
     התרגיל, ואינה נכתבת ל-localStorage ולא נשלחת לשום מקום נוסף.

   הפאנל נבנה פעם אחת ונתלה על `document.body` — ולא בתוך `#app` —
   מפני שכל האפליקציות בונות את `#app` מחדש בכל `render()`, ופאנל
   שיושב בפנים היה נמחק באמצע הקלדה.
   ===================================================================== */
(function(g){
"use strict";

/* ---------------------------------------------------------------
   כתובת השרת. ריקה = אין בוט: הכפתור אינו נבנה, הפאנל אינו קיים,
   ואף בקשה אינה יוצאת. זו ברירת המחדל במאגר, והיא מכוונת —
   מי שלא פרס שרת לא רואה כפתור שנשבר.
   מילוי הכתובת הוא הרגע שבו מידע מתחיל לצאת מהמכשיר, ולכן הוא
   גם הרגע שבו LEGAL.version חייב לעלות. `node .claude/qa/tutor.js`
   נופל אם עשו את האחד בלי השני.
   --------------------------------------------------------------- */
var API = "https://tutor.lagstein1.workers.dev/";

var RATE_KEY = "tutor-rate-v1";   /* מהירות ההקראה. משותף בכוונה — מודול אחד, התנהגות אחת */
var DAY_KEY  = "tutor-day-v1";    /* מונה יומי. ילד אחד, תקציב אחד, בלי קשר לאפליקציה */
var LANG_KEY = "tutor-lang-v1";   /* רק לאפליקציה שאין בה בורר שפה משלה — ראו pickLang */
var DAY_MAX  = 20;                /* תקרה מקומית. החסם האמיתי בשרת */
var TURNS    = 12;                /* הודעות לשיחה אחת */
var MAXLEN   = 300;               /* תווים בהודעה של הילד */
var RATES    = [0.7, 0.85, 1, 1.15];

var DIR   = { he:"rtl", ar:"rtl", ru:"ltr", en:"ltr" };
var VOICE = { he:"he-IL", ar:"ar-SA", ru:"ru-RU", en:"en-US" };

var L = {
he:{ btn:"ג׳וש — עזרה מהמורה", title:"עזרה מהמורה", close:"סגירה", send:"שליחה",
  intro:"אפשר לשאול אותי על מה שעל המסך. אני נותן רמז אחד בכל פעם, ומחכה לתשובה.",
  ph:"מה לא ברור?", hello:"אני צריך עזרה במה שעל המסך.", wait:"רגע, חושב…",
  err:"לא הצלחתי להתחבר. אפשר לנסות שוב עוד רגע.",
  setup:"העזרה עוד לא מוכנה. אפשר לנסות מאוחר יותר.",
  limit:"מספיק להיום — נמשיך מחר.",
  full:"דיברנו על זה הרבה. בוא ננסה, ובשאלה הבאה נתחיל מחדש.",
  privacy:"אל תכתבו כאן שם מלא, כתובת או טלפון.",
  play:"הקראה", stop:"עצירה", rate:"מהירות", off:"אין קול בשפה הזאת במכשיר הזה" },
ar:{ btn:"جوش — مساعدة من المعلّم", title:"مساعدة من المعلّم", close:"إغلاق", send:"إرسال",
  intro:"يمكنك أن تسألني عمّا يظهر على الشاشة. أعطي تلميحًا واحدًا في كل مرة وأنتظر إجابتك.",
  ph:"ما الذي ليس واضحًا؟", hello:"أحتاج مساعدة فيما يظهر على الشاشة.", wait:"لحظة، أفكّر…",
  err:"لم أتمكّن من الاتصال. حاول مرّة أخرى بعد قليل.",
  setup:"المساعدة ليست جاهزة بعد. حاول لاحقًا.",
  limit:"يكفي لهذا اليوم — نُكمل غدًا.",
  full:"تحدّثنا كثيرًا عن هذا. لنجرّب، ونبدأ من جديد في التالي.",
  privacy:"لا تكتب هنا اسمك الكامل أو عنوانك أو رقم هاتفك.",
  play:"استماع", stop:"إيقاف", rate:"السرعة", off:"لا يوجد صوت بهذه اللغة على هذا الجهاز" },
ru:{ btn:"Джош — помощь учителя", title:"Помощь учителя", close:"Закрыть", send:"Отправить",
  intro:"Можешь спросить меня о том, что на экране. Я даю по одной подсказке и жду ответа.",
  ph:"Что непонятно?", hello:"Мне нужна помощь с тем, что на экране.", wait:"Минутку, думаю…",
  err:"Не удалось соединиться. Попробуй ещё раз через минуту.",
  setup:"Помощь ещё не готова. Попробуй позже.",
  limit:"На сегодня хватит — продолжим завтра.",
  full:"Мы много об этом говорили. Давай попробуем, а дальше начнём заново.",
  privacy:"Не пиши здесь полное имя, адрес или телефон.",
  play:"Прочитать", stop:"Стоп", rate:"Скорость", off:"На этом устройстве нет голоса для этого языка" },
en:{ btn:"Josh — ask the teacher", title:"Ask the teacher", close:"Close", send:"Send",
  intro:"You can ask me about what is on the screen. I give one hint at a time, and wait for your answer.",
  ph:"What is unclear?", hello:"I need help with what is on the screen.", wait:"One moment, thinking…",
  err:"I could not connect. Try again in a moment.",
  setup:"The help is not ready yet. Try again later.",
  limit:"That is enough for today — we will carry on tomorrow.",
  full:"We have talked about this a lot. Let's try, and start fresh on the next one.",
  privacy:"Do not write your full name, address or phone number here.",
  play:"Read aloud", stop:"Stop", rate:"Speed", off:"This device has no voice for this language" }
};

var CFG = null, MSGS = [], BUSY = false, NOTE = "", QID = null, LANGAT = null;
var EL = null, PLAYING = -1;

function T(){ return L[lang()] || L.he }
function lang(){
  /* אפליקציה שיש בה בורר שפה — הבוט הולך אחריו, וזו הדרישה.
     אפליקציה שאין בה בורר (bagrut-806 עברית בלבד) מסמנת
     pickLang, ואז לפאנל בורר משלו: שפת הבוט אינה תלויה בתרגום
     של האפליקציה כולה, שהוא עבודה אחרת לגמרי. */
  if(CFG && CFG.pickLang){
    try{ var v = localStorage.getItem(LANG_KEY); if(L[v]) return v }catch(e){}
  }
  var k = CFG && CFG.lang ? CFG.lang() : "he";
  return L[k] ? k : "he";
}
function setLang(v){
  if(!L[v]) return;
  try{ localStorage.setItem(LANG_KEY, v) }catch(e){}
}
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")
  .replace(/>/g,"&gt;").replace(/"/g,"&quot;") }

/* ---------- המונה היומי ----------
   אינו הגנה — מי שרוצה ימחק אותו — אלא בלם מפני לחיצה חוזרת.
   החסם האמיתי הוא בשרת, ואותו אי אפשר למחוק מהדפדפן. */
function today(){ return new Date().toISOString().slice(0,10) }
function left(){
  try{ var r = JSON.parse(localStorage.getItem(DAY_KEY)||"{}");
       return r.d === today() ? Math.max(0, DAY_MAX-(r.n||0)) : DAY_MAX }
  catch(e){ return DAY_MAX }
}
function bump(){
  try{ var r = JSON.parse(localStorage.getItem(DAY_KEY)||"{}");
       localStorage.setItem(DAY_KEY, JSON.stringify(
         { d: today(), n: r.d === today() ? (r.n||0)+1 : 1 })) }catch(e){}
}
function rate(){
  try{ var v = parseFloat(localStorage.getItem(RATE_KEY)); return RATES.indexOf(v)>=0 ? v : 1 }
  catch(e){ return 1 }
}
function setRate(v){ try{ localStorage.setItem(RATE_KEY, String(v)) }catch(e){} }

/* ================= הקראה =================
   מנוע משלה, ולא ה-speak של האפליקציה המארחת. שלוש סיבות:
   הדרישה היא כפתורי הקראה/עצירה/מהירות על תשובת הבוט עצמה;
   לכל אפליקציה חתימת speak אחרת (ויש שתיים בלי speak בכלל);
   וכך אין נגיעה בהקראה הקיימת של האפליקציה.

   הטקסט **נשאר על המסך** כל זמן ההקראה — אין כאן מסך שמתחלף.

   קטע בין « » הוא בשפה הנלמדת (`target`) ולא בשפת ההסבר, והוא
   מוקרא בקול של אותה שפה. זה מה שמפריד בין השתיים בלימודי שפה.
   ========================================================= */
function voices(){ try{ return speechSynthesis.getVoices()||[] }catch(e){ return [] } }

/* רשימת הקולות מגיעה כמעט תמיד **אחרי** הציור הראשון, ולכן פאנל
   שנפתח מהר הציג ״אין קול בשפה הזאת״ ונשאר כך: הכפתורים לא היו
   חוזרים עד ציור הבא. נמדד בכרום — getVoices() החזיר 0 בפתיחה.
   ההאזנה הזאת מציירת מחדש ברגע שהרשימה מתמלאת. */
try{
  if(window.speechSynthesis && typeof speechSynthesis.addEventListener === "function")
    speechSynthesis.addEventListener("voiceschanged", function(){
      if(EL && EL.ov.classList.contains("on")) draw();
    });
}catch(e){}
/* ================= מנוע ההקראה — ארבעה מנגנונים =================
   אותם ארבעה שיושבים בכל אחת עשרה האפליקציות, ומכסים כשלים שקטים
   של Web Speech שכולם נראים למשתמש אותו דבר: הקול מפסיק באמצע.
   הפאנל הזה הוא קורא שנים עשר, והוא נבנה בלעדיהם.

   1 · שומר-ער — Chrome ו-Edge בשולחן העבודה חותכים הקראה אחרי
       כ-15 שניות. במובייל אין את הבאג והפעולה מקרטעת שם.
   2 · _activeU — הפניה חיה ל-utterance. בלעדיה Chrome אוסף אותו
       ואיתו את onend, והמקטע הבא לא יוצא לעולם.
   3 · ttsWatchdog — יש מכשירים שבהם onend לא נורה כלל.
   4 · נפילה מקול רשת — קול נוירלי של Edge שותק בלי אינטרנט.

   תשובה של ג׳וש היא עד 700 טוקנים, כלומר בקלות מעל 15 שניות. */
var NEEDS_KEEPALIVE = /Chrome|Chromium|Edg\//.test(navigator.userAgent)
                   && !/Android|Mobile/i.test(navigator.userAgent);
var _kaTimer = null, _activeU = null, _netVoiceOK = true;

function startKeepAlive(){
  if(!NEEDS_KEEPALIVE || !("speechSynthesis" in window) || _kaTimer) return;
  _kaTimer = setInterval(function(){
    try{
      if(!speechSynthesis.speaking){ stopKeepAlive(); return }
      if(speechSynthesis.paused) return;   /* עצירה מכוונת — לא נוגעים */
      speechSynthesis.pause(); speechSynthesis.resume();
    }catch(e){ stopKeepAlive() }
  }, 9000);
}
function stopKeepAlive(){ if(_kaTimer){ clearInterval(_kaTimer); _kaTimer = null } }
/* עוצרים רק כששום דבר כבר לא מדבר — אחרת מקטע שהתחיל זה עתה מאבד
   את השמירה שלו כשהקודם מסיים להתנקות. */
function maybeStopKeepAlive(){
  try{ if(speechSynthesis.speaking || speechSynthesis.pending) return }catch(e){}
  stopKeepAlive();
}

/* קול רשת שאי אפשר להשתמש בו עכשיו אינו ״פחות טוב״ — הוא לא יעבוד.
   לכן מיון ראשון ולא סעיף בניקוד: קנס לא הספיק במאגר הזה, מפני
   שקול נוירלי צובר על שם היצרן יותר ממה שכל קנס סביר מוריד. */
function voiceUsable(v){
  if(!v || v.localService !== false) return 1;
  return (_netVoiceOK && navigator.onLine !== false) ? 1 : 0;
}

function ttsWatchdog(alive, onSilent){
  var idle = 0, dog = setInterval(function(){
    if(!alive()){ clearInterval(dog); return }
    var busy = false;
    try{ busy = !!(speechSynthesis.speaking || speechSynthesis.pending) }catch(e){}
    if(busy){ idle = 0; return }
    if(++idle >= 4){ clearInterval(dog); onSilent() }
  }, 1000);
  return function(){ clearInterval(dog) };
}

function pickVoice(code){
  var v = voices(), p = code.slice(0,2), i, exact = [], loose = [], l;
  for(i=0;i<v.length;i++){
    l = (v[i].lang||"").replace("_","-").toLowerCase();
    if(l === code.toLowerCase()) exact.push(v[i]);
    else if(l.slice(0,2) === p) loose.push(v[i]);
  }
  var list = exact.length ? exact : loose;
  if(!list.length) return null;
  list.sort(function(a,b){ return voiceUsable(b) - voiceUsable(a) });
  return list[0];
}
function hasVoice(code){ return !!pickVoice(code) }

function segments(text){
  /* מפצל לקטעים לפי « », ומסמן לכל אחד את השפה שלו */
  var out = [], re = /«([^»]*)»/g, last = 0, m;
  var base = lang(), tgt = (CFG && CFG.target) || base;
  while((m = re.exec(text))){
    if(m.index > last) out.push({ t: text.slice(last, m.index), l: base });
    if(m[1]) out.push({ t: m[1], l: tgt });
    last = re.lastIndex;
  }
  if(last < text.length) out.push({ t: text.slice(last), l: base });
  return out.filter(function(s){ return s.t.replace(/\s/g,"") });
}

/* ================= מבנה התשובה =================
   ג׳וש כותב מהתור השלישי תשובה מובנית — נקודות, צעדים ממוספרים
   והדגשה — ולכן צריך שלושה דברים, ולא אחד:

   · `fmt`      — מה שנראה על המסך. רץ **אחרי** `esc`, ולכן אין
                  בו דרך להזריק HTML: כל `<` כבר `&lt;`.
   · `stripMd`  — מה שנאמר בקול. בלעדיו מנוע ההקראה אומר ״מינוס״
                  ו״כוכבית כוכבית״ בכל שורת רשימה, וזה בדיוק
                  הכשל ש-`saysym.js` נבנה נגדו.
   · `splitSugg`— הצעות ההמשך, שאינן חלק מהתשובה: לא מוצגות
                  בבועה ולא מוקראות.

   « » אינם מוסרים ב-`stripMd`: `segments` צריך אותם כדי לתת לכל
   שפה את הקול שלה. `fmt` כן מסיר אותם — הם סימון להקראה, לא
   טקסט לקורא. */
var SUGG = "[[?]]";
function splitSugg(text){
  var i = String(text).indexOf(SUGG);
  if(i < 0) return { body: String(text), sugg: [] };
  var out = [], rest = String(text).slice(i + SUGG.length).split("\n");
  for(var k = 0; k < rest.length && out.length < 3; k++){
    var one = rest[k].trim();
    if(one) out.push(one.slice(0, 60));
  }
  return { body: String(text).slice(0, i).replace(/\s+$/, ""), sugg: out };
}
function stripMd(text){
  return String(text)
    .replace(/\*\*/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/^\s*#{1,6}\s+/gm, "");
}
function bold(s){ return s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") }
function fmt(text){
  var lines = esc(String(text).replace(/«|»/g, "")).split("\n"),
      out = [], list = null;
  function shut(){ if(list){ out.push("</" + list + ">"); list = null } }
  lines.forEach(function(ln){
    var one = ln.trim();
    var b = one.match(/^[-•]\s+(.*)$/), n = one.match(/^\d+[.)]\s+(.*)$/);
    if(b){ if(list !== "ul"){ shut(); out.push("<ul class=\"tu-l\">"); list = "ul" }
           out.push("<li>" + bold(b[1]) + "</li>"); return }
    if(n){ if(list !== "ol"){ shut(); out.push("<ol class=\"tu-l\">"); list = "ol" }
           out.push("<li>" + bold(n[1]) + "</li>"); return }
    shut();
    if(one) out.push("<p>" + bold(one) + "</p>");
  });
  shut();
  return out.join("");
}

/* ================= החשיפה ההדרגתית =================
   **זו אינה הזרמה מהמודל, וחשוב לא לבלבל.** השרת בודק את התשובה
   **השלמה** לפני שהוא שולח אותה — `revealsAnswer` פוסל פתרון
   בשני התורים הראשונים, ו-`badEquation` פוסל 8+7=16 — ואם היא
   נפסלת נשלחת אחרת במקומה. הזרמה אמיתית הייתה מציגה לילד בדיוק
   את התשובה שהשומר עומד לפסול.

   לכן: הטקסט מגיע שלם ומאומת, ומתגלה על המסך מילה־מילה. התחושה
   של Gemini, בלי לוותר על השומר שהוא כל הרעיון. */
var REV = -1, REVN = 0, REVT = null;
function stopReveal(){ if(REVT){ clearInterval(REVT); REVT = null } REV = -1 }
function startReveal(i){
  stopReveal();
  var m = MSGS[i]; if(!m) return;
  REV = i; REVN = 0;
  REVT = setInterval(function(){
    var cur = MSGS[REV];
    if(!cur){ stopReveal(); draw(); return }
    REVN += 4;
    if(REVN >= cur.text.length) stopReveal();
    draw();
  }, 28);
}

function stopSay(){
  PLAYING = -1;
  stopKeepAlive(); _activeU = null;
  try{ speechSynthesis.cancel() }catch(e){}
  draw();
}
function say(i){
  var m = MSGS[i]; if(!m) return;
  /* עוצרים גם את ההקראה של האפליקציה עצמה, אם יש לה כזאת */
  if(CFG && CFG.stopHost) try{ CFG.stopHost() }catch(e){}
  try{ speechSynthesis.cancel() }catch(e){}
  var segs = segments(stripMd(splitSugg(m.text).body)), r = rate(), n = 0;
  if(!segs.length) return;
  PLAYING = i; draw();
  (function next(){
    if(PLAYING !== i || n >= segs.length){
      if(PLAYING === i){ PLAYING = -1; draw() }
      _activeU = null; maybeStopKeepAlive(); return;
    }
    var s = segs[n++], code = VOICE[s.l] || VOICE.he;
    speakSeg(s.t, code, r, function(){ return PLAYING === i }, next);
  })();
}

/* מקטע אחד, ושלושת המנגנונים שסביבו. `done` נקרא בדיוק פעם אחת —
   בסוף תקין, בשגיאה, או כשהשומר גילה שקט מוחלט. */
function speakSeg(text, code, r, alive, done){
  var moved = false, disarm = null, retried = false;
  function fin(){
    if(moved) return;
    moved = true;
    if(disarm){ disarm(); disarm = null }
    done();
  }
  (function go(){
    var u = new SpeechSynthesisUtterance(text);
    u.lang = code; u.rate = r;
    var v = pickVoice(code); if(v) u.voice = v;
    u.onend = fin;
    u.onerror = function(){
      /* 4 · קול רשת ששתק. מכבים את הדגל, ואותו טקסט נאמר שוב פעם
         אחת בלבד — הפעם עם קול שהמיון החדש כבר מעדיף. */
      if(!retried && v && v.localService === false && alive()){
        retried = true; _netVoiceOK = false; _activeU = null;
        if(disarm){ disarm(); disarm = null }
        go(); return;
      }
      fin();
    };
    _activeU = u;                                      /* 2 */
    try{ speechSynthesis.speak(u) }catch(e){ fin(); return }
    startKeepAlive();                                  /* 1 */
    disarm = ttsWatchdog(function(){ return alive() && !moved }, fin);  /* 3 */
  })();
}

/* ================= הפאנל ================= */
var CSS = ''
+'#tu-ov{position:fixed;inset:0;background:rgba(20,30,35,.55);display:none;'
+'place-items:center;z-index:9000;padding:16px}'
+'#tu-ov.on{display:grid}'
+'#tu-bx{background:#fff;color:#17333c;border-radius:20px;width:100%;max-width:540px;'
+'max-height:88vh;display:flex;flex-direction:column;overflow:hidden;'
+'box-shadow:0 18px 50px rgba(0,0,0,.3);font-size:16px;line-height:1.6}'
+'#tu-hd{display:flex;align-items:center;gap:10px;padding:14px 18px;'
/* הפנים בכותרת: קטנות, לא גוזלות מקום מהטקסט, ולא נדחסות
   כשהשאלה שלצידן ארוכה. */
+'#tu-face{flex:0 0 auto;line-height:0;display:inline-block}'
+'border-bottom:2px solid rgba(23,51,60,.12);flex-wrap:wrap}'
+'#tu-hd b{font-size:1.05rem}'
+'#tu-q{background:#fff3ce;border:1px solid #e6b800;border-radius:9px;padding:3px 9px;'
+'font-weight:600;direction:ltr;unicode-bidi:isolate;font-size:.95rem}'
+'#tu-log{padding:14px 18px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:10px}'
+'.tu-m{max-width:88%;border-radius:15px;padding:10px 14px;white-space:pre-wrap;word-break:break-word}'
+'.tu-me{align-self:flex-end;background:#dff1fa;border:2px solid rgba(88,183,224,.45)}'
+'.tu-bot{align-self:flex-start;background:#d9f2ec;border:2px solid rgba(14,156,141,.4)}'
+'.tu-m p{margin:0 0 .45em}.tu-m p:last-child{margin-bottom:0}'
+'.tu-l{margin:.2em 0 .45em;padding-inline-start:1.25em}.tu-l li{margin:.15em 0}'
+'.tu-m>*:last-child{margin-bottom:0}'
/* ההצעות אינן בועה: הן פעולה, ולכן הן נראות ככפתורים ולא כטקסט. */
+'.tu-sg{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;max-width:88%}'
+'.tu-sg button{font:inherit;font-size:.92em;border-radius:999px;cursor:pointer;'
+'padding:6px 13px;background:#eef8fb;color:#17333c;border:2px solid rgba(88,183,224,.55)}'
+'.tu-sg button:hover{background:#dff1fa}'
+'.tu-sys{color:#4c666e;font-size:.92rem}'
+'.tu-note{background:#fff3ce;border:2px solid rgba(230,184,0,.55);border-radius:13px;padding:10px 14px}'
+'.tu-ctl{display:flex;gap:6px;align-items:center;margin-top:7px;flex-wrap:wrap}'
+'.tu-ctl button{border:1px solid rgba(23,51,60,.28);background:#fff;color:#17333c;'
+'border-radius:9px;padding:4px 11px;font:inherit;font-size:.85rem;cursor:pointer;min-height:32px}'
+'.tu-ctl button[aria-pressed="true"]{background:#0e9c8d;color:#fff;border-color:#0b7568}'
+'.tu-ctl select{border:1px solid rgba(23,51,60,.28);border-radius:9px;padding:4px 8px;'
+'font:inherit;font-size:.85rem;min-height:32px;background:#fff;color:#17333c}'
+'#tu-ft{padding:12px 18px;border-top:2px solid rgba(23,51,60,.12)}'
+'#tu-row{display:flex;gap:8px}'
+'#tu-in{flex:1;padding:11px 14px;border:2px solid rgba(23,51,60,.2);border-radius:13px;'
+'font:inherit;font-size:1rem;background:#fff;color:#17333c;min-width:0}'
+'#tu-go{background:#0e9c8d;color:#fff;border:0;border-radius:13px;padding:11px 18px;'
+'font:inherit;font-weight:600;cursor:pointer}'
+'#tu-go[disabled],#tu-in[disabled]{opacity:.55}'
+'#tu-pv{color:#5a7178;font-size:.78rem;margin:7px 0 0}'
+'#tu-lg{border:1px solid rgba(23,51,60,.28);border-radius:9px;padding:5px 8px;'
+'font:inherit;font-size:.85rem;background:#fff;color:#17333c;margin-inline-start:auto}'
+'#tu-x{margin-inline-start:auto;background:transparent;border:1px solid rgba(23,51,60,.25);'
+'border-radius:9px;padding:5px 12px;font:inherit;cursor:pointer;color:#17333c}'
+'@media(prefers-color-scheme:dark){#tu-bx{background:#16232a;color:#eef5f7}'
+'#tu-in,.tu-ctl button,.tu-ctl select,#tu-lg,#tu-x{background:#1e2f38;color:#eef5f7;'
+'border-color:rgba(238,245,247,.3)}'
+'.tu-me{background:#1d3b4a;border-color:#2f6a86}.tu-bot{background:#14403a;border-color:#1c7e70}'
+'.tu-sg button{background:#12303d;color:#eaf6fa;border-color:#2f6a86}'
+'.tu-sg button:hover{background:#1d3b4a}'
+'.tu-sys{color:#a9c2ca}#tu-pv{color:#93aeb7}}';

/* שלושת המצבים שהפאנל באמת יודע עליהם, ותו לא:
   ממתין לשרת → חושב · מקריא → מדבר · אחרת → מקשיב.
   `josh-face.js` הוא שכבת תצוגה; ההחלטה מה נכון היא כאן. */
function faceState(){
  if(typeof JOSHFACE === "undefined") return;
  JOSHFACE.emit(BUSY ? "thinking" : PLAYING >= 0 ? "speaking" : "listening");
}

function build(){
  if(EL) return EL;
  var st = document.createElement("style"); st.textContent = CSS;
  document.head.appendChild(st);
  var ov = document.createElement("div"); ov.id = "tu-ov";
  ov.innerHTML =
    '<div id="tu-bx" role="dialog" aria-modal="true" aria-labelledby="tu-ti">'
    + '<div id="tu-hd"><span id="tu-face"></span><b id="tu-ti"></b><span id="tu-q" hidden></span>'
    + '<select id="tu-lg" hidden></select>'
    + '<button id="tu-x" type="button"></button></div>'
    + '<div id="tu-log" aria-live="polite"></div>'
    + '<div id="tu-ft"><div id="tu-row">'
    + '<input id="tu-in" type="text" autocomplete="off" maxlength="' + MAXLEN + '" />'
    + '<button id="tu-go" type="button"></button></div><p id="tu-pv"></p></div></div>';
  document.body.appendChild(ov);

  /* ---------------------------------------------------------------
     הפנים של ג׳וש. `/tutor/josh-face.js` נטען לפני הקובץ הזה בכל
     אפליקציה, ולכן הבדיקה כאן היא על קיום ולא על סדר.

     **זו נקודת החיווט האחת לכל שתים־עשרה האפליקציות.** הפאנל הזה
     כבר מותקן בכולן; הוספת הפנים כאן מגיעה לכולן בלי לגעת באף
     `index.html`. זה בדיוק ההיגיון שבגללו הבוט עצמו יושב בקובץ
     אחד ולא בשנים־עשר עותקים.

     הדיוקן מגיע מ-`/img/josh.jpg` — נתיב מוחלט, קובץ אחד לכל
     האתר. `photo()` דוחה כתובת עם סכימה, ונתיב שמתחיל בלוכסן
     יחיד עובר.
     --------------------------------------------------------------- */
  if(typeof JOSHFACE !== "undefined"){
    JOSHFACE.photo("/img/josh.jpg");
    var fw = ov.querySelector("#tu-face");
    if(fw){ fw.innerHTML = JOSHFACE.markup(46); JOSHFACE.attach() }
  }

  EL = {
    ov: ov, bx: ov.querySelector("#tu-bx"), ti: ov.querySelector("#tu-ti"),
    q: ov.querySelector("#tu-q"), x: ov.querySelector("#tu-x"),
    lg: ov.querySelector("#tu-lg"),
    log: ov.querySelector("#tu-log"), inp: ov.querySelector("#tu-in"),
    go: ov.querySelector("#tu-go"), pv: ov.querySelector("#tu-pv")
  };
  EL.x.onclick = close;
  EL.lg.onchange = function(){
    setLang(this.value);
    /* שפה חדשה — שיחה חדשה, אחרת הבוט ממשיך בשפה הקודמת */
    MSGS = []; NOTE = ""; LANGAT = lang();
    stopSay(); draw(); send(T().hello, true);
  };
  EL.go.onclick = function(){ send(EL.inp.value) };
  ov.addEventListener("click", function(e){ if(e.target === ov) close() });
  EL.inp.addEventListener("keydown", function(e){
    if(e.key === "Enter"){ e.preventDefault(); e.stopPropagation(); send(EL.inp.value) }
  });
  ov.addEventListener("keydown", function(e){
    if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); close() }
  });
  EL.log.addEventListener("click", function(e){
    var b = e.target.closest("[data-tu]"); if(!b) return;
    var a = b.getAttribute("data-tu"), i = +b.getAttribute("data-i");
    if(a === "say") say(i);
    else if(a === "stop") stopSay();
    else if(a === "sugg") send(b.getAttribute("data-s"));
  });
  EL.log.addEventListener("change", function(e){
    if(e.target.id === "tu-rate"){ setRate(parseFloat(e.target.value)); if(PLAYING>=0) stopSay() }
  });
  return EL;
}

/* כיוון הכתיבה נקבע לפי שפת הבוט, ולא לפי כיוון האפליקציה:
   ילד שבחר רוסית באפליקציה עברית צריך פאנל משמאל לימין. */
function draw(){
  var t = T(), lg = lang(), d = DIR[lg] || "rtl", e = build();
  e.bx.setAttribute("lang", lg);
  e.bx.setAttribute("dir", d);
  e.ti.textContent = t.title;
  e.x.textContent = t.close;
  e.go.textContent = t.send;
  e.inp.placeholder = t.ph;
  e.inp.setAttribute("aria-label", t.ph);
  e.pv.textContent = t.privacy;
  if(CFG && CFG.pickLang){
    e.lg.hidden = false;
    var opt = "";
    for(var k in L) if(L.hasOwnProperty(k))
      opt += '<option value="' + k + '"' + (k === lg ? " selected" : "") + '>' + esc(L[k].title) + '</option>';
    if(e.lg.innerHTML !== opt) e.lg.innerHTML = opt;
    e.lg.value = lg;
  } else e.lg.hidden = true;
  e.inp.disabled = BUSY; e.go.disabled = BUSY;
  faceState();

  var q = CFG && CFG.q ? CFG.q() : null;
  if(q && q.expr){ e.q.hidden = false; e.q.textContent = q.expr }
  else e.q.hidden = true;

  var h = '<p class="tu-sys">' + esc(t.intro) + '</p>';
  MSGS.forEach(function(m, i){
    /* ההודעה הפותחת נשלחת על ידי האפליקציה ולא על ידי הילד */
    if(i === 0 && m.role === "user") return;
    var mine = m.role === "user";
    /* הודעת הילד נשארת טקסט; רק ג׳וש כותב מבנה. */
    if(mine){
      h += '<div class="tu-m tu-me">' + esc(m.text.replace(/«|»/g, "")) + '</div>';
      return;
    }
    var sp = splitSugg(i === REV ? m.text.slice(0, REVN) : m.text);
    h += '<div class="tu-m tu-bot">' + fmt(sp.body) + '</div>';
    h += ctl(i);
    /* ההצעות מופיעות רק כשהתשובה כולה על המסך, ורק על האחרונה —
       שרשרת של הצעות ישנות היא רעש, ולחיצה עליהן שולחת שאלה
       שכבר נענתה. */
    if(i === REV || i !== MSGS.length - 1 || BUSY) return;
    if(sp.sugg.length){
      h += '<div class="tu-sg">';
      sp.sugg.forEach(function(one){
        h += '<button type="button" data-tu="sugg" data-s="' + esc(one) + '">'
           + esc(one) + '</button>';
      });
      h += '</div>';
    }
  });
  if(BUSY) h += '<div class="tu-sys">' + esc(t.wait) + '</div>';
  if(NOTE) h += '<div class="tu-note">' + esc(NOTE) + '</div>';
  e.log.innerHTML = h;
  e.log.scrollTop = e.log.scrollHeight;
}

function ctl(i){
  var t = T(), on = PLAYING === i, r = rate();
  if(!hasVoice(VOICE[lang()] || "he-IL"))
    return '<div class="tu-ctl tu-sys">' + esc(t.off) + '</div>';
  var h = '<div class="tu-ctl">'
    + '<button type="button" data-tu="say" data-i="' + i + '" aria-pressed="' + (on ? "true" : "false")
    + '">▶ ' + esc(t.play) + '</button>'
    + '<button type="button" data-tu="stop" data-i="' + i + '">■ ' + esc(t.stop) + '</button>';
  /* בורר המהירות מופיע פעם אחת, על ההודעה האחרונה */
  if(i === MSGS.length - 1){
    h += '<label class="tu-sys">' + esc(t.rate) + ' '
       + '<select id="tu-rate" aria-label="' + esc(t.rate) + '">';
    RATES.forEach(function(v){
      h += '<option value="' + v + '"' + (v === r ? " selected" : "") + '>' + v + '×</option>';
    });
    h += '</select></label>';
  }
  return h + '</div>';
}

/* ================= השיחה ================= */
function qid(){
  var q = CFG && CFG.q ? CFG.q() : null;
  return q ? (q.id || q.expr || JSON.stringify(q)) : "none";
}

function open(){
  if(!API || !CFG) return;
  var id = qid(), lg = lang();
  /* תרגיל חדש — שיחה חדשה. וגם שפה חדשה: הבוט עונה בשפה שנשלחה
     אליו, ושיחה שהתחילה בעברית הייתה ממשיכה בעברית גם אחרי
     שהילד החליף את שפת האפליקציה. נמדד: הפאנל התחלף, הבוט לא. */
  if(QID !== id || LANGAT !== lg){ MSGS = []; NOTE = ""; QID = id; LANGAT = lg }
  build().ov.classList.add("on");
  draw();
  if(!MSGS.length) send(T().hello, true);
  else focus();
}
function close(){
  stopSay(); stopReveal(); NOTE = "";
  if(EL) EL.ov.classList.remove("on");
  if(typeof JOSHFACE !== "undefined") JOSHFACE.emit("idle");
}
function focus(){ try{ EL.inp.focus() }catch(e){} }

function send(text, auto){
  var t = T();
  text = String(text || "").trim().slice(0, MAXLEN);
  if(!text || BUSY || !API) return;
  if(MSGS.length >= TURNS){ NOTE = t.full; draw(); return }
  if(left() <= 0){ NOTE = t.limit; draw(); return }

  stopReveal();
  MSGS.push({ role:"user", text:text });
  if(EL) EL.inp.value = "";
  BUSY = true; NOTE = ""; draw();
  bump();

  var q = CFG.q ? CFG.q() : null;
  fetch(API, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      app: CFG.app,
      lang: lang(),
      target: CFG.target || null,
      q: q,
      messages: MSGS
    })
  })
  .then(function(r){
    if(r.status === 429) throw new Error("limit");
    if(r.ok) return r.json();
    /* 500 ו-503 הם תקלת הקמה ולא תקלת רשת: מפתח שלא הוגדר, או
       מונה יומי שלא הוגדר ולא הוצהר. הן נראות בדיוק כמו ״אין
       אינטרנט״, ומי שמקים את השירות מחפש את הסיבה שעה.
       לכן ההודעה למסך אומרת ״עוד לא מוכן״, והסיבה המדויקת —
       שהיא טקסט למקים ולא לילד — נכתבת לקונסולה. */
    if(r.status === 500 || r.status === 503)
      return r.json().catch(function(){ return {} }).then(function(d){
        try{ console.error("[tutor] " + r.status + " " +
             ((d && (d.detail || d.error)) || "הגדרה חסרה בשרת")) }catch(e){}
        throw new Error("setup");
      });
    /* **וכל השאר גם הוא תקלת הקמה, ורק נראה כמו רשת.**
       502 (`upstream`) הוא מה שמפתח API שגוי או פג מחזיר, והוא
       יחזור כך לתמיד — אבל ההודעה למסך היא ״נסה שוב עוד רגע״,
       מפני ש-502 יכול להיות גם עומס חולף אצל הספק, ואין דרך
       להבחין ביניהם מהדפדפן. לכן ההודעה נשארת, והשורה לקונסולה
       נוספת: היא הדבר היחיד שמפריד בין ״נסה שוב״ לבין שעה של
       חיפוש. נמדד 10.9.2026 מול השרת המקומי עם מפתח דמה: שתי
       בקשות, שתיהן 502, אפס שורות בקונסולה. */
    return r.json().catch(function(){ return {} }).then(function(d){
      try{ console.error("[tutor] " + r.status + " " +
           ((d && (d.detail || d.error)) || "תשובה שאינה תקינה מהשרת")) }catch(e){}
      throw new Error("http");
    });
  })
  .then(function(d){
    BUSY = false;
    var reply = String((d && d.text) || "").trim();
    if(!reply) throw new Error("empty");
    MSGS.push({ role:"assistant", text:reply });
    startReveal(MSGS.length - 1);
    draw(); focus();
  })
  .catch(function(err){
    BUSY = false;
    /* ההודעה הפותחת נכשלה — מסירים אותה, אחרת השיחה מתחילה
       מתור של הילד שהוא בעצם שלנו */
    if(auto) MSGS = [];
    var why = String(err && err.message);
    NOTE = why === "limit" ? t.limit : why === "setup" ? t.setup : t.err;
    draw();
  });
}

/* ================= הממשק לאפליקציה =================
   mount(cfg) מחזיר true אם הבוט פעיל. אפליקציה בונה את הכפתור
   רק כשהתשובה חיובית, ולכן בלי כתובת שרת אין כפתור בשום מקום.

   cfg = { app:"math-app",
           lang: function(){...},      שפת הממשק הנוכחית
           q:    function(){...},      התרגיל שעל המסך, או null
           target:"en",                השפה הנלמדת — רק בלימודי שפה
           stopHost: function(){...} } ההקראה של האפליקציה, לעצירה
   ================================================== */
g.TUTOR = {
  on: function(){ return !!API },
  /* תווית הכפתור. באה מכאן ולא ממילון האפליקציה, מפני שבמילונים
     האלה המחרוזת העברית היא המפתח — הוספת מחרוזת חדשה שם היא
     נגיעה במנגנון התרגום, וכאן היא שורה במודול אחד. */
  label: function(){ return T().btn },
  mount: function(cfg){ CFG = cfg || null; return !!API && !!CFG },
  open: open,
  close: close,
  /* לבדיקות בלבד — אינו נקרא מהאפליקציות */
  _state: function(){ return { api:API, msgs:MSGS, playing:PLAYING, lang:lang(), dir:DIR[lang()] } }
};
})(window);
