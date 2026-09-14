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
   כתובת השרת — **ריקה בהוראת הבעלים, 14.9.2026.**

   לשונו: ״אני לא רוצה שג׳וש יוציא כסף. לנתק אותו מכל מה שעולה
   כסף, להשאיר מחובר רק למה שחינם.״ והנימוק, בהודעה שלפניה: ״כל
   תלמיד שלא משלם סנט אחד ייצר עלות״ — המוצר חינם ללומד, ולכן
   הצלחה גדולה יותר היא חשבון גדול יותר.

   כל עוד היא ריקה **אף בקשה אינה יוצאת מהמכשיר**, והתשובות
   נבנות ב-`tutor/josh-local.js`.

   **להחזרת השרת:** להחזיר לכאן את הכתובת, ואז שלושה־עשר מפתחות
   קאש. מילוי הכתובת הוא הרגע שבו מידע מתחיל לצאת מהמכשיר, ולכן
   הוא גם הרגע שבו `LEGAL.version` חייב לעלות —
   `node .claude/qa/tutor.js` נופל אם עשו את האחד בלי השני.
   --------------------------------------------------------------- */
var API = "";

/* **יש מוח, ולכן יש כפתור.** עד 14.9 השאלה ״האם ג׳וש קיים״ הייתה
   ״האם יש כתובת שרת״. מאז יש שני מוחות אפשריים, והשאלה היא האם
   קיים אחד מהם: השרת בתשלום, או המקומי שבחינם. כפתור שנבנה בלי
   אף אחד מהם הוא כפתור שבור, וזו הייתה הכוונה המקורית של השער. */
var BRAIN = !!API || typeof JOSHLOCAL !== "undefined";

var VOICE_KEY = "tutor-voice-v1"; /* הקול שהלומד בחר, מפתח לכל שפה */
var RATE_KEY = "tutor-rate-v1";   /* מהירות ההקראה. משותף בכוונה — מודול אחד, התנהגות אחת */
var DAY_KEY  = "tutor-day-v1";    /* מונה יומי. ילד אחד, תקציב אחד, בלי קשר לאפליקציה */
var LANG_KEY = "tutor-lang-v1";   /* רק לאפליקציה שאין בה בורר שפה משלה — ראו pickLang */
var DAY_MAX  = 20;                /* תקרה מקומית. החסם האמיתי בשרת */
var TURNS    = 12;                /* הודעות לשיחה אחת */
var MAXLEN   = 300;               /* תווים בהודעה של הילד */
/* 0.95 נוסף כברירת המחדל של ג׳וש — ראו JOSH_RATE. 1 נשאר
   כאפשרות, מפני שיש לומדים שרוצים את הקצב הרגיל. */
var RATES    = [0.7, 0.85, 0.95, 1, 1.15];

/* ---- ״עדין ורך״, בשני מספרים ----

   **גובה הקול.** קול גברי ברירת־מחדל נשמע נמוך ושטוח, ומול ילד
   שנתקע זה נקרא כנזיפה. 0.94 מרכך אותו מעט בלי להפוך אותו לקול
   אחר — מתחת ל-0.9 הוא נשמע מעוות, ומעל 1.0 הוא מאבד את
   הגבריות שנתבקשה.

   **הקצב.** 0.95, מעט איטי מהרגיל. זה מה שהופך ״גברי״ ל״גברי
   רך״ יותר מכל שינוי בגובה, והוא גם נכון לקהל: דיסלקציה ו-ADHD.

   שניהם ברירת מחדל בלבד — הלומד משנה בבורר, וזה נשמר. */
var JOSH_PITCH = 1.0;
var JOSH_RATE  = 0.95;

var DIR   = { he:"rtl", ar:"rtl", ru:"ltr", en:"ltr" };
var VOICE = { he:"he-IL", ar:"ar-SA", ru:"ru-RU", en:"en-US" };

var L = {
he:{ btn:"פאולה — עזרה מהמורה", title:"עזרה מהמורה", close:"סגירה", send:"שליחה",
  intro:"אפשר לשאול אותי על מה שעל המסך. אני נותן רמז אחד בכל פעם, ומחכה לתשובה.",
  nudge:{stuck:"שמתי לב שהשאלה הזאת תופסת זמן. רוצה שנפרק אותה יחד, צעד אחד בכל פעם?",frustrated:"אני רואה שזה לא הולך עכשיו, וזה בסדר גמור. בוא ננסה מכיוון אחר."}, greet:"היי, אני פאולה. אני כאן אם משהו לא ברור. כתוב לי מה, ונעבור על זה יחד.", ph:"מה לא ברור?", hello:"אני צריך עזרה במה שעל המסך.", wait:"רגע, חושבת…",
  err:"לא הצלחתי להתחבר. אפשר לנסות שוב עוד רגע.",
  setup:"העזרה עוד לא מוכנה. אפשר לנסות מאוחר יותר.",
  limit:"מספיק להיום — נמשיך מחר.",
  limitAll:"זה לא אתה — הגעתי לגבול היומי שלי. אפשר לנסות שוב מחר, וכל השאר באפליקציה עובד.",
  full:"דיברנו על זה הרבה. בוא ננסה, ובשאלה הבאה נתחיל מחדש.",
  privacy:"אל תכתבו כאן שם מלא, כתובת או טלפון.",
  play:"הקראה", stop:"עצירה", rate:"מהירות", off:"אין קול בשפה הזאת במכשיר הזה",
  voice:"קול", voiceAuto:"אוטומטי",
  mic:"דבר", micOn:"מקשיבהװװ", micNo:"הדפדפן הזה לא נותן לדבר. אפשר להקליד.",
  micDeny:"אין הרשאה למיקרופון. אפשר לאשר בהגדרות הדפדפן, או פשוט להקליד.",
  manNote:"אין במכשיר הזה קול נשי בשפה הזאת, ולכן גובה הקול הוגבה. זה לא קול נשי אמיתי." },
ar:{ btn:"باولا — مساعدة من المعلّم", title:"مساعدة من المعلّم", close:"إغلاق", send:"إرسال",
  intro:"يمكنك أن تسألني عمّا يظهر على الشاشة. أعطي تلميحًا واحدًا في كل مرة وأنتظر إجابتك.",
  nudge:{stuck:"لاحظت أن هذا السؤال يأخذ وقتًا. تريد أن نفكّكه معًا، خطوة واحدة في كل مرة؟",frustrated:"أرى أن الأمر لا يسير الآن، وهذا طبيعي تمامًا. لنجرّب من زاوية أخرى."}, greet:"مرحبًا، أنا باولا. أنا هنا إن كان شيء غير واضح. اكتب لي ما هو، ونمرّ عليه معًا.", ph:"ما الذي ليس واضحًا؟", hello:"أحتاج مساعدة فيما يظهر على الشاشة.", wait:"لحظة، أفكّر…",
  err:"لم أتمكّن من الاتصال. حاول مرّة أخرى بعد قليل.",
  setup:"المساعدة ليست جاهزة بعد. حاول لاحقًا.",
  limit:"يكفي لهذا اليوم — نُكمل غدًا.",
  limitAll:"ليست غلطتك — وصلتُ إلى حدّي اليوميّ. جرّب غدًا، وكلّ شيء آخر في التطبيق يعمل.",
  full:"تحدّثنا كثيرًا عن هذا. لنجرّب، ونبدأ من جديد في التالي.",
  privacy:"لا تكتب هنا اسمك الكامل أو عنوانك أو رقم هاتفك.",
  play:"استماع", stop:"إيقاف", rate:"السرعة", off:"لا يوجد صوت بهذه اللغة على هذا الجهاز",
  voice:"الصوت", voiceAuto:"تلقائي",
  mic:"تكلّم", micOn:"أسمعك…", micNo:"هذا المتصفّح لا يتيح التكلّم. يمكنك الكتابة.",
  micDeny:"لا يوجد إذن للميكروفون. يمكن السماح في إعدادات المتصفّح، أو الكتابة ببساطة.",
  manNote:"لا يوجد على هذا الجهاز صوت نسائيّ بهذه اللغة، لذلك رُفعت طبقة الصوت. هذا ليس صوتًا نسائيًّا حقيقيًّا." },
ru:{ btn:"Паула — помощь учителя", title:"Помощь учителя", close:"Закрыть", send:"Отправить",
  intro:"Можешь спросить меня о том, что на экране. Я даю по одной подсказке и жду ответа.",
  nudge:{stuck:"Я заметила, что этот вопрос отнимает время. Разберём его вместе, по одному шагу?",frustrated:"Вижу, что сейчас не идёт, и это совершенно нормально. Попробуем с другой стороны."}, greet:"Привет, я Паула. Я рядом, если что-то непонятно. Напиши, что именно, и разберём вместе.", ph:"Что непонятно?", hello:"Мне нужна помощь с тем, что на экране.", wait:"Минутку, думаю…",
  err:"Не удалось соединиться. Попробуй ещё раз через минуту.",
  setup:"Помощь ещё не готова. Попробуй позже.",
  limit:"На сегодня хватит — продолжим завтра.",
  limitAll:"Это не ты — я достиг своего дневного предела. Попробуй завтра, остальное в приложении работает.",
  full:"Мы много об этом говорили. Давай попробуем, а дальше начнём заново.",
  privacy:"Не пиши здесь полное имя, адрес или телефон.",
  play:"Прочитать", stop:"Стоп", rate:"Скорость", off:"На этом устройстве нет голоса для этого языка",
  voice:"Голос", voiceAuto:"Автоматически",
  mic:"Говори", micOn:"Слушаю…", micNo:"Этот браузер не позволяет говорить. Можно печатать.",
  micDeny:"Нет разрешения на микрофон. Разрешите в настройках браузера или просто печатайте.",
  manNote:"На этом устройстве нет женского голоса для этого языка, поэтому тон повышен. Это не настоящий женский голос." },
en:{ btn:"Paula — ask the teacher", title:"Ask the teacher", close:"Close", send:"Send",
  intro:"You can ask me about what is on the screen. I give one hint at a time, and wait for your answer.",
  nudge:{stuck:"I noticed this one is taking a while. Shall we break it down together, one step at a time?",frustrated:"I can see this is not working right now, and that is completely fine. Let us try another way."}, greet:"Hi, I am Paula. I am here if something is unclear. Write what it is, and we will go through it together.", ph:"What is unclear?", hello:"I need help with what is on the screen.", wait:"One moment, thinking…",
  err:"I could not connect. Try again in a moment.",
  setup:"The help is not ready yet. Try again later.",
  limit:"That is enough for today — we will carry on tomorrow.",
  limitAll:"It is not you — I have reached my daily limit. Try again tomorrow; everything else in the app still works.",
  full:"We have talked about this a lot. Let's try, and start fresh on the next one.",
  privacy:"Do not write your full name, address or phone number here.",
  play:"Read aloud", stop:"Stop", rate:"Speed", off:"This device has no voice for this language",
  voice:"Voice", voiceAuto:"Automatic",
  mic:"Speak", micOn:"Listening…", micNo:"This browser does not allow speaking. You can type instead.",
  micDeny:"No microphone permission. You can allow it in the browser settings, or simply type.",
  manNote:"This device has no female voice for this language, so the pitch is raised. It is not a real female voice." }
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
/* ברירת המחדל היא `JOSH_RATE` ולא 1 — ראו ״עדין ורך״ למעלה.
   הלומד יכול לשנות בבורר המהירות, וזה נשמר; מה שנקבע כאן הוא
   רק הקצב לפני שנגע בו. */
function rate(){
  try{ var v = parseFloat(localStorage.getItem(RATE_KEY)); return RATES.indexOf(v)>=0 ? v : JOSH_RATE }
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

/* ---------- מגדר הקול ----------

   **ג׳וש מדבר בקול גברי עדין ורך — הוראת הבעלים מ-14.9.2026**,
   והיא הופכת את זו של 13.9 שביקשה קול נשי. לשונו: ״ג׳וש מדבר
   בקול של אישה, תתקן לקול גברי עדין ורך״.

   **שלושה דברים השתנו, ולא אחד.** ״גברי״ הוא המיון; ״עדין ורך״
   הם גובה הקול והקצב, ובלעדיהם קול גברי ברירת־מחדל נשמע נוקשה —
   וזה ההפך ממה שנדרש מול ילד שנתקע.

   שתי התבניות הן **העתק מדויק** מתוך `math-app/index.html`, ולא
   רשימה חדשה: אותם שמות שהמערכות באמת מתקינות, לפי שפה. כתיבת
   רשימה שנייה הייתה מייצרת שני מקורות אמת שנפרדים בעדכון הבא.

   ו-"google" אינו מגדר אלא שם יצרן. הוא אינו ברשימה בכוונה —
   כשהוא נספר כנשי, ״Google עברית״, שהוא גברי בחלק מהמכשירים,
   נבחר דווקא כשמבקשים נשי. */
var VOICE_F=/(female|woman|#female|\bfem\b|carmit|hila|\bmiri\b|\bdana\b|shira|samantha|karen|moira|tessa|serena|victoria|\bava\b|allison|susan|vicki|nicky|\bzoe\b|fiona|\bkate\b|shelley|zira|hazel|aria|jenny|michelle|\bana\b|\beva\b|emma|libby|sonia|natasha|clara|\bamber\b|ashley|\bcora\b|elizabeth|monica|\bsara\b|\bsarah\b|\bjane\b|\bnancy\b|\bluna\b|\bmolly\b|irina|milena|svetlana|dariya|\belena\b|katja|ekaterina|\bkatya\b|tatyana|\balena\b|hoda|salma|zariyah|amina|\bhala\b|noura|laila|layla|fatima|zeina|\biman\b|\brana\b|\bsana\b|maryam|asma|heera|raveena|swara|neerja)/;
var VOICE_M=/(\bmale\b|\bman\b|#male|asaf|avri|yoni|moshe|\balex\b|daniel|\bfred\b|\btom\b|aaron|arthur|oliver|rishi|gordon|\blee\b|ralph|bruce|david|\bmark\b|\bguy\b|ryan|christopher|\beric\b|brian|andrew|roger|steffan|liam|william|george|james|\bthomas\b|benjamin|brandon|\bjason\b|\btony\b|dmitry|pavel|\byuri\b|artemi|maxim|nikolai|maged|tarik|naayf|hamed|shakir|\bomar\b|tarek|\bali\b|bassel|\bmoaz\b|hamdan|saleh|abdullah|\btaim\b|fahed|rakan|yasser|hemant|madhur|prabhat)/;
/* פאולה: נשי גבוה, גברי נמוך, ולא־ידוע בין השניים.
   השם נשאר `femScore` ולא `femScore` — ניקוד ששמו אומר את ההפך
   ממה שהוא עושה הוא בדיוק סוג הבאג שהמאגר הזה מתעד שוב ושוב. */
function femScore(v){
  var n = ((v && v.name) || "") + " " + ((v && v.lang) || "");
  n = n.toLowerCase();
  if(VOICE_F.test(n)) return 2;
  if(VOICE_M.test(n)) return 0;
  return 1;                                  /* לא ידוע — בין השניים */
}

/* שני המספרים של ״עדין ורך״ יושבים למעלה ב-JOSH_PITCH
   ו-JOSH_RATE, לפני rate() שקורא להם. */

/* כשאין קול נשי במכשיר. **זה אינו קול נשי** אלא אותו קול מעט
   גבוה יותר, וההודעה ללומד אומרת בדיוק את זה.

   **התחילית `TU_` אינה קישוט.** לכל אחת מהאפליקציות יש כבר
   `var FEM_PITCH=1.35` גלובלי משלה — שכבת ההקראה שלה עצמה —
   והקובץ הזה נטען לאותו scope בתגית נפרדת. שתי הכרזות `var`
   באותו שם הן מגירה משותפת: האחרונה מנצחת, ושינוי כאן היה
   מזיז בשקט את גובה ההקראה של האפליקציה בכל שתים־עשרה.
   נמדד בכרומיום לפני השינוי — `FEM_PITCH` הגלובלי החזיר 1.35
   ולא את הערך שנכתב כאן. */
var TU_FEM_PITCH = 1.28;
/* האם האמירה האחרונה נאמרה בנפילה לאחור. מתעדכן ב-speakSeg. */
var _femFallback = false;

/* **הקול שנבחר ביד גובר על כל מיון — מ-14.9.2026, ובצדק.**

   עד כאן ג׳וש ניסה לנחש קול גברי, ואם לא מצא — הנמיך את הגובה.
   **זה נכשל אצל הבעלים, והסיבה מבנית:** ברוב מנועי ההקראה של
   אנדרואיד `pitch` של Web Speech פשוט **אינו נאכף**, ולכן שום
   הנמכה לא נשמעת. ואין לי דרך לדעת מכאן אילו קולות מותקנים
   במכשיר שלו.

   מכאן שהתשובה אינה ניחוש טוב יותר אלא **בורר**: הלומד רואה את
   הקולות שיש לו בפועל ובוחר. ההעדפה האוטומטית נשארת כברירת
   מחדל למי שלא בחר.

   נשמר לכל שפה בנפרד — קול עברי אינו מועמד לרוסית. */
function savedVoices(){
  try{ return JSON.parse(localStorage.getItem(VOICE_KEY) || "{}") || {} }catch(e){ return {} }
}
function savedVoice(code){ var m = savedVoices(); return m[code] || "" }
function setVoice(code, uri){
  var m = savedVoices();
  if(uri) m[code] = uri; else delete m[code];
  try{ localStorage.setItem(VOICE_KEY, JSON.stringify(m)) }catch(e){}
}
/* כל הקולות שמתאימים לשפה — הרשימה שהבורר מציג. */
function voicesFor(code){
  var v = voices(), p = code.slice(0,2), out = [], i, l;
  for(i=0;i<v.length;i++){
    l = (v[i].lang||"").replace("_","-").toLowerCase();
    if(l.slice(0,2) === p) out.push(v[i]);
  }
  return out;
}
function pickVoice(code){
  /* בחירה מפורשת קודמת לכול — גם ל-voiceUsable. מי שבחר קול
     ורואה שהוא לא נאמר לא יבין למה, והשקט גרוע מקול לא-אידאלי. */
  var want = savedVoice(code);
  if(want){
    var all = voicesFor(code), j;
    for(j=0;j<all.length;j++) if(all[j].voiceURI === want) return all[j];
  }
  var v = voices(), p = code.slice(0,2), i, exact = [], loose = [], l;
  for(i=0;i<v.length;i++){
    l = (v[i].lang||"").replace("_","-").toLowerCase();
    if(l === code.toLowerCase()) exact.push(v[i]);
    else if(l.slice(0,2) === p) loose.push(v[i]);
  }
  var list = exact.length ? exact : loose;
  if(!list.length) return null;
  /* `voiceUsable` נשאר מפתח המיון **הראשון**, וזה לא סגנון: קול
     נוירלי מת שנבחר לפי מגדר הוא שקט, ושקט גרוע מקול גברי. הכלל
     הזה כתוב ב-CLAUDE.md, והמגדר נכנס אחריו — בדיוק כמו בשאר
     האפליקציות. */
  list.sort(function(a,b){
    return (voiceUsable(b) - voiceUsable(a)) || (femScore(b) - femScore(a));
  });
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
    /* **הריכוך חל תמיד** — זה האופי של ג׳וש ולא פיצוי. קול גברי
       בגובה ברירת־מחדל נשמע נוקשה מול ילד שנתקע.

       ואם אין קול גברי בשפה הזאת במכשיר — מנמיכים עוד, וזו נפילה
       לאחור **מוצהרת** ולא העמדת פנים: `manNote` אומרת ללומד שזה
       אינו קול גברי אמיתי. */
    u.pitch = JOSH_PITCH;
    if(femScore(v) < 2){ u.pitch = TU_FEM_PITCH; _femFallback = true }
    else _femFallback = false;
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
/* טיפוגרפיה לדיסלקציה, בהוראת הבעלים 14.9.2026.

   הקהל כאן הוא ילדים שמפענחים כל שורה פעמיים, ולכן ארבעת
   המספרים האלה אינם העדפת עיצוב אלא קריאוּת:

     19px          — מעל 16 הקודמים; אות גדולה יותר נדרשת פחות
                     פעמים לפענוח חוזר
     line-height   — 1.75 במקום 1.6. השורה הבאה רחוקה מספיק כדי
                     שהעין לא תקפוץ אליה באמצע הנוכחית
     letter/word   — אותיות שנדבקות הן הסימפטום הנפוץ ביותר.
                     .01em ו-.05em הם ריווח שמפריד בלי לפרק מילה
     color         — #17333c ולא #000: ניגודיות גבוהה אך לא
                     מסנוורת. שחור על לבן טהור מייצר הילה לחלק
                     מהקוראים

   **ואין נטוי בשום מקום בפאנל** — ראו הכלל מתחת ל-`.tu-m em`. */
+'#tu-bx{background:#fff;color:#17333c;border-radius:20px;width:100%;max-width:540px;'
+'max-height:88vh;display:flex;flex-direction:column;overflow:hidden;'
+'box-shadow:0 18px 50px rgba(0,0,0,.3);font-size:19px;line-height:1.75;'
+'letter-spacing:.01em;word-spacing:.05em}'
/* נטוי הוא הצורה שהכי קשה לפענח בדיסלקציה: האותיות נשענות זו על
   זו והמרווח ביניהן מתכווץ. כל הדגשה בפאנל היא משקל, לא הטיה. */
+'#tu-bx em,#tu-bx i,#tu-bx cite{font-style:normal;font-weight:700}'
+'#tu-hd{display:flex;align-items:center;gap:10px;padding:14px 18px;'
+'border-bottom:2px solid rgba(23,51,60,.12);flex-wrap:wrap}'

/* הפנים בכותרת.

   **שני תיקונים מ-14.9.2026, ושניהם דיווח של הבעלים:** הוא ראה
   ״ציור שלא זז ולא צף״. נמדד בדפדפן, ושניהם היו נכונים —
   הפרצוף היה **48×48 בפועל**, ובגודל הזה מצמוץ בן שתי נקודות
   ונשימה של אחוז וחצי אינם נראים כלל; ו-`animationName` על ה-svg
   החזיר `none`, כלומר לא הייתה שום ציפה.

   הוא עלה ל-68 — נמדד, ו-76 כבר שובר את הכותרת לשתי שורות — קיבל צל מוטל שמרים אותו מהלוח, וציפה של חמישה
   פיקסלים ב-3.6 שניות. **חמישה ולא עשרים:** תנועה שמושכת את
   העין מהטקסט היא בדיוק ההפך ממה שדרוש ללומד עם קשיי קשב.

   **והכלל הזה ישב קודם בתוך הכלל של `#tu-hd`** — השרשור ייצר
   `#tu-hd{...#tu-face{...}border-bottom:...}`, וזה עבד רק בזכות
   CSS nesting ילידי. בדפדפן ישן יותר כל הכלל נפסל, ואיתו גם
   הקו שמתחת לכותרת. עכשיו הוא כלל עצמאי. */
+'#tu-face{flex:0 0 auto;line-height:0;display:inline-block;'
+'filter:drop-shadow(0 5px 12px rgba(23,51,60,.22));'
+'animation:tu-float 3.2s ease-in-out infinite}'
+'@keyframes tu-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}'
+'@media (prefers-reduced-motion:reduce){#tu-face{animation:none}}'
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
/* כפתור הדיבור. אותו גובה כמו התיבה, ומרובע — הוא פעולה ולא טקסט. */
+'#tu-mic{flex:0 0 auto;background:#fff;color:#17333c;border:2px solid rgba(23,51,60,.2);'
+'border-radius:13px;padding:11px 14px;font:inherit;font-weight:600;cursor:pointer;min-height:46px}'
+'#tu-mic[aria-pressed="true"]{background:#c0392b;color:#fff;border-color:#a5301f;'
+'animation:tu-lis 1.1s ease-in-out infinite}'
+'@keyframes tu-lis{0%,100%{opacity:1}50%{opacity:.62}}'
+'@media (prefers-reduced-motion:reduce){#tu-mic[aria-pressed="true"]{animation:none}}'
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
    + '<button id="tu-mic" type="button" hidden aria-pressed="false"></button>'
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
    /* הרובוט, 14.9.2026. חזרה לדיוקן: `JOSHFACE.photo("/img/josh.jpg")`
       במקום השורה הזאת — שורה אחת, לשני הכיוונים. */
    JOSHFACE.photo("/img/josh-bot.jpg", JOSHFACE.MARKS_BOT);
    var fw = ov.querySelector("#tu-face");
    if(fw){ fw.innerHTML = JOSHFACE.markup(68); JOSHFACE.attach() }
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
  wireMic(ov);
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
    else if(e.target.id === "tu-vc"){
      setVoice(VOICE[lang()] || "he-IL", e.target.value);
      if(PLAYING>=0) stopSay();
      /* מדגם קצר, כדי שהבחירה תישמע מיד ולא רק בהודעה הבאה. */
      try{ speakSeg(T().mic, VOICE[lang()] || "he-IL", rate(), function(){return true}, function(){}) }catch(err){}
    }
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
    /* בורר הקול. מוצג רק כשיש יותר מקול אחד בשפה — במכשיר עם
       קול יחיד הוא תפריט בן פריט אחד, וזה רעש. */
    var vl = voicesFor(VOICE[lang()] || "he-IL");
    if(vl.length > 1){
      var cur = savedVoice(VOICE[lang()] || "he-IL");
      h += '<label class="tu-sys">' + esc(t.voice) + ' '
         + '<select id="tu-vc" aria-label="' + esc(t.voice) + '">'
         + '<option value=""' + (cur ? "" : " selected") + '>' + esc(t.voiceAuto) + '</option>';
      vl.forEach(function(v){
        h += '<option value="' + esc(v.voiceURI) + '"' + (v.voiceURI === cur ? " selected" : "")
           + '>' + esc(v.name) + '</option>';
      });
      h += '</select></label>';
    }
  }
  /* ההודעה מופיעה **אחרי** אמירה שנפלה לאחור ולא לפניה: לפני
     ההקראה הראשונה אין לדעת איזה קול המכשיר ייתן לשפה הזאת. */
  if(_femFallback && i === MSGS.length - 1)
    h += '<span class="tu-sys tu-man">' + esc(t.manNote) + '</span>';
  return h + '</div>';
}

/* ================= לדבר במקום להקליד =================

   **הבעלים ביקש את זה במפורש ב-14.9.2026:** ״אין אפשרות לדבר
   איתו חייבים להקליד, אני רוצה שתהיה אפשרות לדבר איתו מבלי
   להקליד.״ עד אז `.claude/qa/tutor.js` אסר מיקרופון בשורה
   ששמה ״אין מיקרופון **בשלב הזה**״ — החלטת שלב, והבעלים הכריע.

   **ומה שזה משנה בתנאים, ולכן הם עלו ל-1.3:** `SpeechRecognition`
   בדפדפן **אינו מקומי** — ברוב הדפדפנים ההקלטה נשלחת לשירות
   ההמרה של יצרן הדפדפן. התנאים אמרו ״מה ש**כתבתם**״ ו״אין צד
   שלישי נוסף״, ושניהם כבר לא היו נכונים. עכשיו הם אומרים זאת.

   **מה שנשמר כאן: כלום.** אין פתיחת זרם אודיו ביד — ה-API שעושה
   זאת אסור כאן, ו-`.claude/qa/tutor.js` אוכף את זה. **ושמו אינו
   כתוב כאן באותיות בכוונה:** הבדיקה מחפשת מחרוזת, והערה שמצטטת
   אותה היא מופע שלה — אותה מלכודת של `brain.js` ושל `josh.js`.
   המנוע של הדפדפן מחזיר טקסט, הטקסט נכנס לתיבה, ומשם הוא
   בדיוק כמו הקלדה. אין הקלטה על המכשיר ואין אחת שנשלחת אלינו.

   **לחיצה אחת לכל אמירה.** `continuous = false` — מיקרופון
   שנשאר פתוח הוא הבטחה אחרת לגמרי, וגם סוללה. */
var REC = null, RECON = false;
function recCtor(){
  return g.SpeechRecognition || g.webkitSpeechRecognition || null;
}
function micState(on){
  RECON = on;
  var b = EL && EL.mic; if(!b) return;
  var t = T();
  b.setAttribute("aria-pressed", on ? "true" : "false");
  b.textContent = on ? ("● " + t.micOn) : ("● " + t.mic);
}
function micStop(){
  if(REC){ try{ REC.stop() }catch(e){} }
  micState(false);
}
function wireMic(ov){
  var b = ov.querySelector("#tu-mic");
  if(!b) return;
  EL.mic = b;
  var C = recCtor();
  if(!C) return;                      /* אין תמיכה — הכפתור נשאר נסתר */
  b.hidden = false;
  micState(false);
  b.onclick = function(){
    if(RECON){ micStop(); return }
    /* ג׳וש מפסיק לדבר לפני שהוא מקשיב, אחרת הוא שומע את עצמו. */
    stopSay();
    try{ REC = new C() }catch(e){ NOTE = T().micNo; draw(); return }
    REC.lang = VOICE[lang()] || "he-IL";
    REC.continuous = false;
    REC.interimResults = false;
    REC.maxAlternatives = 1;
    REC.onresult = function(ev){
      var txt = "";
      try{ txt = ev.results[0][0].transcript || "" }catch(e){}
      micState(false);
      txt = String(txt).trim();
      if(!txt) return;
      /* נכנס לתיבה **ונשלח** — מי שדיבר לא רוצה ללחוץ אחר כך. */
      if(EL && EL.inp) EL.inp.value = txt;
      send(txt);
    };
    REC.onerror = function(ev){
      micState(false);
      var e = ev && ev.error;
      if(e === "not-allowed" || e === "service-not-allowed") NOTE = T().micDeny;
      else if(e !== "aborted" && e !== "no-speech") NOTE = T().micNo;
      draw();
    };
    REC.onend = function(){ micState(false) };
    try{ REC.start(); micState(true) }
    catch(e){ micState(false); NOTE = T().micNo; draw() }
  };
}

/* ================= השיחה ================= */
function qid(){
  var q = CFG && CFG.q ? CFG.q() : null;
  return q ? (q.id || q.expr || JSON.stringify(q)) : "none";
}

/* הברכה הפותחת כשג׳וש צץ מעצמו — **מקומית, בלי קריאת שרת.**

   `open()` בלחיצה שולח `T().hello` אל השרת, וזו ההתנהגות שסוכמה
   ואינה משתנה כאן. אבל פתיחה אוטומטית בכל אפליקציה היא סיפור
   אחר: לכל לומד עשרים הודעות ליום (`LIM` שב-`worker.js`), ולומד
   שפותח חמש אפליקציות היה שורף רבע מהמכסה על חמש ברכות לפני
   שהקליד מילה. כאן הברכה נכתבת בדפדפן, ולא עולה דבר.

   היא נכנסת ל-MSGS כדי שתיראה בשיחה, ו-`send` מסיר הודעת בוט
   פותחת לפני השליחה — שיחה חייבת להתחיל בתור של הלומד. */
function greetLocal(){
  MSGS.push({ role:"assistant", text:T().greet });
  startReveal(MSGS.length - 1);
  draw();
}

function open(auto){
  if(!BRAIN || !CFG) return;
  var id = qid(), lg = lang();
  /* תרגיל חדש — שיחה חדשה. וגם שפה חדשה: הבוט עונה בשפה שנשלחה
     אליו, ושיחה שהתחילה בעברית הייתה ממשיכה בעברית גם אחרי
     שהילד החליף את שפת האפליקציה. נמדד: הפאנל התחלף, הבוט לא. */
  if(QID !== id || LANGAT !== lg){ MSGS = []; NOTE = ""; QID = id; LANGAT = lg }
  build().ov.classList.add("on");
  draw();
  /* פתיחה אוטומטית אינה גונבת מיקוד. הפאנל הוא דיאלוג, ומיקוד
     שקופץ אליו בלי שהלומד ביקש מקפיץ גם קורא מסך באמצע משפט. */
  if(!MSGS.length){ if(auto) greetLocal(); else send(T().hello, true) }
  else if(!auto) focus();
}
function close(){
  micStop();
  stopSay(); stopReveal(); NOTE = "";
  if(EL) EL.ov.classList.remove("on");
  if(typeof JOSHFACE !== "undefined") JOSHFACE.emit("idle");
}
function focus(){ try{ EL.inp.focus() }catch(e){} }

/* ---- ג׳וש צץ מעצמו בכל אפליקציה שנפתחת ------------------------
   הכרעת הבעלים 13.9.2026: ״החלון שלו חייב להיות צץ בכל מקום
   שפותחים״. `mount` קורא לזה, ולכן זה חל על שלושה־עשר הדפים
   שטוענים את הקובץ הזה — בלי לגעת באף אחד מהם.

   **פעם אחת לכל אפליקציה בכל ביקור, ולא יותר.** הסימון נכתב
   *לפני* הפתיחה, ולכן לומד שסוגר את הפאנל אינו מקבל אותו שוב
   באותו ביקור. `sessionStorage` ולא `localStorage`: מי שחוזר
   מחר מקבל את ג׳וש שוב, ומי שעובר לאפליקציה אחרת מקבל אותו שם —
   וזה בדיוק ״בכל מקום שפותחים״.

   המפתח נושא את שם האפליקציה, לפי מלכודת ה-localStorage שב-
   `CLAUDE.md`: כל האפליקציות באותו מקור, ומפתח בלי שם היה מגירה
   משותפת שבה פתיחה באחת מבטלת את הפתיחה בשנייה.

   ההשהיה נותנת לאפליקציה לצייר את המסך קודם. פאנל שקופץ על מסך
   ריק נראה כמו תקלה, לא כמו מורה. */
var AUTO_KEY = "tutor-auto-v1:";
var AUTO_MS  = 900;
function autoSeen(){
  try{ return sessionStorage.getItem(AUTO_KEY + (CFG && CFG.app)) === "1" }
  catch(e){ return true }
}
function autoMark(){
  try{ sessionStorage.setItem(AUTO_KEY + (CFG && CFG.app), "1") }catch(e){}
}
/* שער התנאים קודם. נמדד בדפדפן 13.9.2026: בביקור ראשון `.lg-wrap`
   הוא `aria-modal` והוא מכסה את הפאנל — ג׳וש היה נפתח מאחוריו,
   והלומד היה סוגר את השער ומוצא חלון פתוח שלא ביקש. ההמתנה היא
   אותו אידיום בדיוק שהאונבורדינג משתמש בו (`math-app/index.html`,
   ליד `demoMount`): בודקים שוב כל חצי שנייה.

   התקרה קיימת כדי שלא ייווצר טיימר נצחי בלשונית שנשארה פתוחה על
   השער — אחרי כשלושים בדיקות מוותרים, והכפתור עדיין שם. */
/* ---- ג׳וש יוזם כשהלומד נתקע ------------------------------------
   הכרעת הבעלים 13.9.2026: ״שיזהה מה התלמיד עושה ומגיב ויוזם
   תגובה, על מנת להיות חברי וגם מאד מרתק״.

   הגלאי כבר קיים — `tutor/josh-state.js` מחזיר `ok`/`slow`/
   `stuck`/`frustrated` מתוך זמני התשובה, רצף הטעויות ובקשות
   הרמז. הוא אינו רואה את תוכן השאלות, והיוזמה כאן אינה מוסיפה
   לו מידע: היא רק קוראת את המסקנה.

   **שלושה בלמים, ובכוונה.** ג׳וש שקופץ בכל טעות אינו חבר אלא
   הצקה, והקהל כאן הוא ADHD ודיסלקציה:

     · `slow` אינו יוזם. לאט אינו תקוע, ולומד איטי שנקטע באמצע
       מחשבה מאבד אותה.
     · פעמיים בכל ביקור, לא יותר.
     · רק כשהמצב **השתנה** — `stuck` שנמשך אינו קופץ שוב ושוב.

   **הכול מקומי.** הנוסח נכתב בדפדפן ואינו עולה הודעה מהתקרה,
   בדיוק כמו הברכה. ג׳וש פותח פה, והלומד מחליט אם לענות.

   **ובמבחן כיתתי אין יוזמה כלל** — `JOSHSTATE.off()` מכבה את
   הרישום, ואז `state()` מחזיר `ok` תמיד. זה האיסור המפורש
   שב-O-47, והוא נאכף במקור ולא כאן. */
var NUDGE_MAX  = 2;
var NUDGE_MS   = 5000;
var nudges = 0, nudgeAt = "ok", nudgeTimer = null;

function nudgeTick(){
  if(nudges >= NUDGE_MAX) return stopNudge();
  if(typeof JOSHSTATE === "undefined") return stopNudge();
  var st;
  try{ st = JOSHSTATE.state() }catch(e){ return }
  if(st !== "stuck" && st !== "frustrated"){ nudgeAt = st; return }
  if(st === nudgeAt) return;
  nudgeAt = st;
  /* פאנל פתוח — הלומד כבר מדבר איתו, ואין מה ליזום. */
  if(EL && EL.ov && EL.ov.classList.contains("on")) return;
  if(document.querySelector(".lg-wrap")) return;
  var txt = (T().nudge || {})[st];
  if(!txt) return;
  nudges++;
  build().ov.classList.add("on");
  MSGS.push({ role:"assistant", text:txt });
  startReveal(MSGS.length - 1);
  draw();
}
function stopNudge(){ if(nudgeTimer){ clearInterval(nudgeTimer); nudgeTimer = null } }
function startNudge(){
  if(nudgeTimer || typeof JOSHSTATE === "undefined") return;
  nudgeTimer = setInterval(nudgeTick, NUDGE_MS);
}

var AUTO_TRIES = 30;
/* **לא בדפדפן מונחה.** חבילת ה-QA (`clicks`, `voice`, `exam` ועוד)
   מריצה כרומיום אמיתי, מאשרת את שער התנאים ומתחילה ללחוץ — ושנייה
   וחצי אחר כך `#tu-ov.on` היה נפרש על כל המסך וחוסם כל לחיצה
   (Playwright: "intercepts pointer events"). ריצות 440–446 על
   `main` נפלו על זה, 13.9.2026. `navigator.webdriver` הוא הסימן
   התקני של דפדפן מונחה, ואינו קיים אצל לומד; הפתיחה בלחיצה על
   הכפתור נשארת כפי שהיא גם שם, ולכן `deployed.js` עדיין רואה את
   ג׳וש נפתח. */
function autoOpen(tries){
  if(navigator.webdriver) return;
  if(autoSeen()) return;
  if(document.querySelector(".lg-wrap")){
    if((tries || 0) >= AUTO_TRIES) return;
    setTimeout(function(){ autoOpen((tries || 0) + 1) }, 500);
    return;
  }
  autoMark();
  setTimeout(function(){ try{ open(true) }catch(e){} }, AUTO_MS);
}

/* ---- סימן הלמידה, אם יש גלאי ----------------------------------
   `tutor/josh-state.js` מחזיר ארבע מילים, ו-`ok` אינה נשלחת:
   היא היעדר סימן, ונוכחות השדה היא עצמה המשמעות. אפליקציה שאין
   בה גלאי שולחת `null`, וזה בדיוק אותו דבר בשרת.

   **מה שנשלח הוא מילה אחת, ולא היסטוריה.** אין כאן זמנים, אין
   מניין תשובות ואין רצף — הגלאי מסכם בדפדפן, והשרת מקבל את
   המסקנה בלבד. זו אינה קמצנות ברוחב פס אלא גבול: מה שלא נשלח
   לא יכול לדלוף. */
function sign(){
  if(typeof JOSHSTATE === "undefined") return null;
  try{
    var s = JOSHSTATE.state();
    return s && s !== "ok" ? s : null;
  }catch(e){ return null }
}

/* המוח המקומי — התשובה כשאין שרת.

   הכרעת הבעלים 14.9.2026: ג׳וש לא יוציא כסף. `API` ריקה, וכל
   תשובה נבנית ב-`tutor/josh-local.js` בלי בקשה יוצאת אחת.

   **המונה היומי אינו נספר כאן במתכוון.** `bump()` קיים כדי להגן
   על תקציב, ומוח מקומי אינו עולה דבר — לומד שמדבר עם ג׳וש חמישים
   פעם ביום אינו עולה יותר מלומד שמדבר איתו פעם אחת. תקרה כאן
   הייתה מגבילה בלי שום דבר להגן עליו. */
function replyLocal(text){
  if(typeof JOSHLOCAL === "undefined") return false;
  var out;
  try{
    out = JOSHLOCAL.reply(text, {
      lang: lang(),
      q:    CFG && CFG.q ? CFG.q() : null,
      sign: sign()
    });
  }catch(e){ return false }
  if(!out || !out.text) return false;

  MSGS.push({ role:"assistant", text:out.text });
  startReveal(MSGS.length - 1);
  BUSY = false; draw(); focus();
  return true;
}

function send(text, auto){
  var t = T();
  text = String(text || "").trim().slice(0, MAXLEN);
  if(!text || BUSY) return;
  if(MSGS.length >= TURNS){ NOTE = t.full; draw(); return }

  /* אין שרת — עונים מקומית. זה הנתיב הרגיל מ-14.9.2026, ולא
     נפילה־אחורה: `API` ריקה בכוונה. */
  if(!API){
    stopReveal();
    MSGS.push({ role:"user", text:text });
    if(EL) EL.inp.value = "";
    NOTE = ""; draw();
    /* השהיה קצרה כדי שהפאנל יספיק לצייר את תור הלומד לפני
       התשובה. בלעדיה שתי השורות מופיעות יחד וזה נראה כמו טופס. */
    BUSY = true; draw();
    setTimeout(function(){ if(!replyLocal(text)){ BUSY = false; NOTE = t.err; draw() } }, 420);
    return;
  }

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
      sign: sign(),
      q: q,
      /* הברכה המקומית של הפתיחה האוטומטית היא הודעת בוט, והיא
         יושבת ראשונה ב-MSGS. שיחה שמתחילה בבוט נדחית, ולכן היא
         נחתכת כאן ואינה נשלחת. היא נשארת על המסך — הלומד רואה
         אותה, השרת לא. */
      messages: (MSGS.length && MSGS[0].role === "assistant") ? MSGS.slice(1) : MSGS
    })
  })
  .then(function(r){
    /* 429 נושא scope: "you" = התקרה של הלומד, "all" = חסם העלות
       של השירות. שתיהן 429, ולכן צריך לקרוא את הגוף כדי לדעת מה
       לומר — ובלי הקריאה הזאת לומד שמישהו אחר מילא את הגלובלית
       היה שומע ״מספיק להיום״, וזה שקר. גוף שאינו JSON נופל
       ל-"limit", שהוא הנוסח הזהיר מבין השניים. */
    if(r.status === 429)
      return r.json().catch(function(){ return {} }).then(function(j){
        throw new Error(j && j.scope === "all" ? "limitAll" : "limit");
      });
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
    NOTE = why === "limitAll" ? t.limitAll :
           why === "limit" ? t.limit : why === "setup" ? t.setup : t.err;
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
  on: function(){ return BRAIN },
  /* תווית הכפתור. באה מכאן ולא ממילון האפליקציה, מפני שבמילונים
     האלה המחרוזת העברית היא המפתח — הוספת מחרוזת חדשה שם היא
     נגיעה במנגנון התרגום, וכאן היא שורה במודול אחד. */
  label: function(){ return T().btn },
  mount: function(cfg){
    CFG = cfg || null;
    var ok = BRAIN && !!CFG;
    if(ok){ autoOpen(); startNudge() }
    return ok;
  },
  open: open,
  close: close,
  /* לבדיקות בלבד — אינם נקראים מהאפליקציות */
  _state: function(){ return { api:API, msgs:MSGS, playing:PLAYING, lang:lang(), dir:DIR[lang()] } },
  /* בחירת הקול חשופה כדי שאפשר יהיה לבדוק אותה מול רשימת קולות
     מזויפת. בלי זה הכלל ״voiceUsable ראשון, המגדר אחריו״ אינו
     ניתן לבדיקה בלי דפדפן עם קולות מותקנים — ואין כזה כאן. */
  _voice: function(code){ return pickVoice(code || "he-IL") }
};
})(window);
