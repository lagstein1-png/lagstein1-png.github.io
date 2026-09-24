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
var API = "https://tutor.lagstein1.workers.dev/";

/* **יש מוח, ולכן יש כפתור.** עד 14.9 השאלה ״האם ג׳וש קיים״ הייתה
   ״האם יש כתובת שרת״. מאז יש שני מוחות אפשריים, והשאלה היא האם
   קיים אחד מהם: השרת בתשלום, או המקומי שבחינם. כפתור שנבנה בלי
   אף אחד מהם הוא כפתור שבור, וזו הייתה הכוונה המקורית של השער. */
var BRAIN = !!API || typeof JOSHLOCAL !== "undefined";

var VOICE_KEY = "tutor-voice-v1"; /* הקול שהלומד בחר, מפתח לכל שפה */
var RATE_KEY = "tutor-rate-v1";   /* מהירות ההקראה. משותף בכוונה — מודול אחד, התנהגות אחת */
var DAY_KEY  = "tutor-day-v1";    /* מונה יומי. ילד אחד, תקציב אחד, בלי קשר לאפליקציה */
var LANG_KEY = "tutor-lang-v1";   /* רק לאפליקציה שאין בה בורר שפה משלה — ראו pickLang */
var LEGACY_TIMEOUT_MS = 8000;      /* O-72 — כמו TIMEOUT_MS ב-barak-core.js */
var DAY_MAX  = 10;                /* תקרה מקומית, כמו perDay בשרת. החסם האמיתי בשרת */
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
/* הריכוך חל תמיד — זה האופי של ברק ולא פיצוי. קול גברי בגובה
   ברירת־מחדל נשמע נוקשה מול ילד שנתקע. */
var JOSH_PITCH = 0.94;
var JOSH_RATE  = 0.95;

var DIR   = { he:"rtl", ar:"rtl", ru:"ltr", en:"ltr" };
var VOICE = { he:"he-IL", ar:"ar-SA", ru:"ru-RU", en:"en-US" };

var L = {
/* **״מהמוֹרֶה״ בניקוד — 24.9.2026.** הבעלים: ״ברק אומר עזרה מהמורָה במקום
   מהמורֶה זכר״. בכתב בלי ניקוד המילה זהה לזכר ולנקבה, ומנוע ההקראה
   וקורא המסך בחרו בנקבה. ניקוד על מילה אחת מכריע גם בעין וגם באוזן,
   ושם התכונה — ״עזרה מהמורה״ בתנאים ובמדריך — אינו משתנה. */
he:{ btn:"ברק — עזרה מהמוֹרֶה", title:"עזרה מהמוֹרֶה", close:"סגירה", send:"שליחה",
  intro:"אפשר לשאול אותי על מה שעל המסך. אני נותן רמז אחד בכל פעם, ומחכה לתשובה.",
  nudge:{stuck:"שמתי לב שהשאלה הזאת לוקחת זמן. רוצה שנפרק אותה יחד, צעד אחד בכל פעם?",frustrated:"אני רואה שזה לא הולך עכשיו, וזה בסדר גמור. בוא ננסה מכיוון אחר."}, greet:"היי, אני ברק. אני כאן אם משהו לא ברור. כתוב לי מה בדיוק, ונעבור על זה יחד.", ph:"מה לא ברור?", hello:"אני צריך עזרה במה שעל המסך.", wait:"רגע, חושב…",
  err:"לא הצלחתי להתחבר. אפשר לנסות שוב עוד רגע.",
  local:"התשובה מהמכשיר, לא מהשרת",
  setup:"העזרה עוד לא מוכנה. אפשר לנסות מאוחר יותר.",
  limit:"מספיק להיום — נמשיך מחר.",
  limitAll:"זה לא אתה — הגעתי לגבול היומי שלי. אפשר לנסות שוב מחר, וכל השאר באפליקציה עובד.",
  full:"דיברנו על זה הרבה. בוא ננסה, ובשאלה הבאה נתחיל מחדש.",
  privacy:"אל תכתבו כאן שם מלא, כתובת או טלפון.",
  play:"הקראה", stop:"עצירה", rate:"מהירות", off:"אין קול בשפה הזאת במכשיר הזה",
  voice:"קול", voiceAuto:"אוטומטי",
  vSample:"שלום, אני ברק. כך אני נשמע במכשיר שלך.",
  mic:"דבר", micOn:"מקשיב…", micNo:"הדפדפן הזה לא נותן לדבר. אפשר להקליד.",
  micDeny:"אין הרשאה למיקרופון. אפשר לאשר בהגדרות הדפדפן, או פשוט להקליד.",
  edgeBtn:"לפתוח ב-Edge",
  edgeNote:"הקול במחשב הזה בסיסי ונשמע רובוטי. בדפדפן Microsoft Edge, שמותקן בכל Windows, ברק מדבר בקול טבעי — פותחים את אותו הדף שם.",
  manNote:"אין במכשיר הזה קול גברי בשפה הזאת, ולכן גובה הקול הונמך. זה לא קול גברי אמיתי.",
  simplifyBtn:"ברק — גרסה פשוטה", simplifyAsk:"תן לי גרסה קצרה ופשוטה של הטקסט שהדבקתי",
  simplifyEmpty:"קודם הדביקו טקסט, ואז אבקש מברק גרסה פשוטה שלו.",
  simplifyCut:"הטקסט ארוך, ולכן נשלחה רק תחילתו — {n} תווים." },
ar:{ btn:"باراك — مساعدة من المعلّم", title:"مساعدة من المعلّم", close:"إغلاق", send:"إرسال",
  intro:"يمكنك أن تسألني عمّا يظهر على الشاشة. أعطي تلميحًا واحدًا في كل مرة وأنتظر إجابتك.",
  nudge:{stuck:"لاحظت أن هذا السؤال يأخذ وقتًا. تريد أن نفكّكه معًا، خطوة واحدة في كل مرة؟",frustrated:"أرى أن الأمر لا يسير الآن، وهذا طبيعي تمامًا. لنجرّب من زاوية أخرى."}, greet:"مرحبًا، أنا باراك. أنا هنا إن كان شيء غير واضح. اكتب لي ما هو، ونمرّ عليه معًا.", ph:"ما الذي ليس واضحًا؟", hello:"أحتاج مساعدة فيما يظهر على الشاشة.", wait:"لحظة، أفكّر…",
  err:"لم أتمكّن من الاتصال. حاول مرّة أخرى بعد قليل.",
  local:"الجواب من الجهاز، لا من الخادم",
  setup:"المساعدة ليست جاهزة بعد. حاول لاحقًا.",
  limit:"يكفي لهذا اليوم — نُكمل غدًا.",
  limitAll:"ليست غلطتك — وصلتُ إلى حدّي اليوميّ. جرّب غدًا، وكلّ شيء آخر في التطبيق يعمل.",
  full:"تحدّثنا كثيرًا عن هذا. لنجرّب، ونبدأ من جديد في التالي.",
  privacy:"لا تكتب هنا اسمك الكامل أو عنوانك أو رقم هاتفك.",
  play:"استماع", stop:"إيقاف", rate:"السرعة", off:"لا يوجد صوت بهذه اللغة على هذا الجهاز",
  voice:"الصوت", voiceAuto:"تلقائي",
  vSample:"مرحبًا، أنا باراك. هكذا سأبدو على جهازك.",
  mic:"تكلّم", micOn:"أسمعك…", micNo:"هذا المتصفّح لا يتيح التكلّم. يمكنك الكتابة.",
  micDeny:"لا يوجد إذن للميكروفون. يمكن السماح في إعدادات المتصفّح، أو الكتابة ببساطة.",
  edgeBtn:"افتحوا في Edge",
  edgeNote:"الصوت على هذا الحاسوب بسيط ويبدو آليًّا. في متصفّح Microsoft Edge، المثبّت في كل Windows، يتكلّم باراك بصوت طبيعي — افتحوا الصفحة نفسها هناك.",
  manNote:"لا يوجد على هذا الجهاز صوت رجاليّ بهذه اللغة، لذلك خُفضت طبقة الصوت. هذا ليس صوتًا رجاليًّا حقيقيًّا.",
  simplifyBtn:"باراك — نسخة مبسّطة", simplifyAsk:"أعطني نسخة قصيرة وبسيطة من النصّ الذي لصقته",
  simplifyEmpty:"الصقوا نصًّا أولًا، ثم أطلب من باراك نسخة مبسّطة منه.",
  simplifyCut:"النصّ طويل، لذلك أُرسل أوّله فقط — {n} حرفًا." },
ru:{ btn:"Барак — помощь учителя", title:"Помощь учителя", close:"Закрыть", send:"Отправить",
  intro:"Можешь спросить меня о том, что на экране. Я даю по одной подсказке и жду ответа.",
  nudge:{stuck:"Я заметил, что этот вопрос отнимает время. Разберём его вместе, по одному шагу?",frustrated:"Вижу, что сейчас не идёт, и это совершенно нормально. Попробуем с другой стороны."}, greet:"Привет, я Барак. Я рядом, если что-то непонятно. Напиши, что именно, и разберём вместе.", ph:"Что непонятно?", hello:"Мне нужна помощь с тем, что на экране.", wait:"Минутку, думаю…",
  err:"Не удалось соединиться. Попробуй ещё раз через минуту.",
  local:"Ответ с устройства, не с сервера",
  setup:"Помощь ещё не готова. Попробуй позже.",
  limit:"На сегодня хватит — продолжим завтра.",
  limitAll:"Это не ты — я достиг своего дневного предела. Попробуй завтра, остальное в приложении работает.",
  full:"Мы много об этом говорили. Давай попробуем, а дальше начнём заново.",
  privacy:"Не пиши здесь полное имя, адрес или телефон.",
  play:"Прочитать", stop:"Стоп", rate:"Скорость", off:"На этом устройстве нет голоса для этого языка",
  voice:"Голос", voiceAuto:"Автоматически",
  vSample:"Привет, я Барак. Вот как я звучу на вашем устройстве.",
  mic:"Говори", micOn:"Слушаю…", micNo:"Этот браузер не позволяет говорить. Можно печатать.",
  micDeny:"Нет разрешения на микрофон. Разрешите в настройках браузера или просто печатайте.",
  edgeBtn:"Открыть в Edge",
  edgeNote:"Голос на этом компьютере простой и звучит как робот. В браузере Microsoft Edge, который есть в каждом Windows, Барак говорит естественным голосом — откройте эту же страницу там.",
  manNote:"На этом устройстве нет мужского голоса для этого языка, поэтому тон понижен. Это не настоящий мужской голос.",
  simplifyBtn:"Барак — простая версия", simplifyAsk:"Дай мне короткую и простую версию вставленного текста",
  simplifyEmpty:"Сначала вставьте текст, и тогда я попрошу у Барака его простую версию.",
  simplifyCut:"Текст длинный, поэтому отправлено только его начало — {n} знаков." },
en:{ btn:"Barak — ask the teacher", title:"Ask the teacher", close:"Close", send:"Send",
  intro:"You can ask me about what is on the screen. I give one hint at a time, and wait for your answer.",
  nudge:{stuck:"I noticed this one is taking a while. Shall we break it down together, one step at a time?",frustrated:"I can see this is not working right now, and that is completely fine. Let us try another way."}, greet:"Hi, I am Barak. I am here if something is unclear. Write what it is, and we will go through it together.", ph:"What is unclear?", hello:"I need help with what is on the screen.", wait:"One moment, thinking…",
  err:"I could not connect. Try again in a moment.",
  local:"Answered on the device, not by the server",
  setup:"The help is not ready yet. Try again later.",
  limit:"That is enough for today — we will carry on tomorrow.",
  limitAll:"It is not you — I have reached my daily limit. Try again tomorrow; everything else in the app still works.",
  full:"We have talked about this a lot. Let's try, and start fresh on the next one.",
  privacy:"Do not write your full name, address or phone number here.",
  play:"Read aloud", stop:"Stop", rate:"Speed", off:"This device has no voice for this language",
  voice:"Voice", voiceAuto:"Automatic",
  vSample:"Hi, I am Barak. This is how I sound on your device.",
  mic:"Speak", micOn:"Listening…", micNo:"This browser does not allow speaking. You can type instead.",
  micDeny:"No microphone permission. You can allow it in the browser settings, or simply type.",
  edgeBtn:"Open in Edge",
  edgeNote:"The voice on this computer is basic and sounds robotic. In Microsoft Edge, which comes with every Windows, Barak speaks in a natural voice — open this same page there.",
  manNote:"This device has no male voice for this language, so the pitch is lowered. It is not a real male voice.",
  simplifyBtn:"Barak — simple version", simplifyAsk:"Give me a short, simple version of the text I pasted",
  simplifyEmpty:"Paste a text first, and then I will ask Barak for a simple version of it.",
  simplifyCut:"The text is long, so only its beginning was sent — {n} characters." }
};

var CFG = null, MSGS = [], BUSY = false, NOTE = "", QID = null, LANGAT = null;
var EL = null, PLAYING = -1;
/* ההסבר ״אפשר לשאול אותי...״ הוא אוריינטציה חד־פעמית, לא כותרת קבועה.
   draw() נקרא מחדש בכל הודעה ובכל תרגיל חדש (MSGS מתאפס), ובלי הדגל
   הזה הוא היה חוזר בכל פעם — נראה כאילו ברק מציג את עצמו כל פעם
   שפונים אליו, ולא רק בתחילת השימוש באפליקציה. נכבה לצמיתות רק אחרי
   שהילד באמת כתב הודעה ראשונה — עד אז הוא עדיין ״בהתחלה״, גם אם
   הפתיחה שלו ל-Barak נמשכת כמה ציורים (חשיפת ההודעה תו־אחר־תו). */
var INTRO_SEEN = false;

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
var VOICE_F=/(הילה|כרמית|زارية|سلمى|أمينة|امينة|هدى|فاطمة|ليلى|نورا|светлана|дарья|ирина|екатерина|татьяна|елена|female|woman|#female|\bfem\b|carmit|hila|\bmiri\b|\bdana\b|shira|samantha|karen|moira|tessa|serena|victoria|\bava\b|allison|susan|vicki|nicky|\bzoe\b|fiona|\bkate\b|shelley|zira|hazel|aria|jenny|michelle|\bana\b|\beva\b|emma|libby|sonia|natasha|clara|\bamber\b|ashley|\bcora\b|elizabeth|monica|\bsara\b|\bsarah\b|\bjane\b|\bnancy\b|\bluna\b|\bmolly\b|irina|milena|svetlana|dariya|\belena\b|katja|ekaterina|\bkatya\b|tatyana|\balena\b|hoda|salma|zariyah|amina|\bhala\b|noura|laila|layla|fatima|zeina|\biman\b|\brana\b|\bsana\b|maryam|asma|heera|raveena|swara|neerja)/;
var VOICE_M=/(אברי|אסף|حامد|ماجد|طارق|ناصر|بسام|дмитрий|павел|юрий|максим|николай|\bmale\b|\bman\b|#male|asaf|avri|yoni|moshe|\balex\b|daniel|\bfred\b|\btom\b|aaron|arthur|oliver|rishi|gordon|\blee\b|ralph|bruce|david|\bmark\b|\bguy\b|ryan|christopher|\beric\b|brian|andrew|roger|steffan|liam|william|george|james|\bthomas\b|benjamin|brandon|\bjason\b|\btony\b|dmitry|pavel|\byuri\b|artemi|maxim|nikolai|maged|tarik|naayf|hamed|shakir|\bomar\b|tarek|\bali\b|bassel|\bmoaz\b|hamdan|saleh|abdullah|\btaim\b|fahed|rakan|yasser|hemant|madhur|prabhat)/;
/* **ברק: גברי גבוה, נשי נמוך — 15.9.2026.**

   **והשם `femScore` נשאר, וזה חוב מוצהר ולא נוחות.** הוא מחולץ
   בשמו ב-`.claude/qa/tutor.js`, ולכן החלפה כאן לבדה שוברת את
   הבדיקה. ניקוד ששמו אומר את ההפך ממה שהוא עושה הוא בדיוק סוג
   הבאג שהמאגר הזה מתעד שוב ושוב — מי שנוגע כאן בפעם הבאה
   יחליף את השם בשני הקבצים יחד.

   **וההעדפה נשארת המפתח השני ולא הראשון.** `voiceUsable` קודם,
   מפני שקול מת הוא שקט ושקט גרוע מקול במגדר הלא־מבוקש. הכלל
   הזה כתוב ב-`CLAUDE.md` ואינו משתנה עם הדמות. */
function femScore(v){
  var n = ((v && v.name) || "") + " " + ((v && v.lang) || "");
  n = n.toLowerCase();
  if(VOICE_M.test(n)) return 2;
  if(VOICE_F.test(n)) return 0;
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
/* **הנפילה לאחור כשאין קול גברי במכשיר.**

   0.62 ולא 0.88: הפרש התדר הבסיסי בין קול נשי לגברי הוא כפי
   0.6, והנמכה של 12% אינה משנה מגדר נתפס. **וזה עדיין לא יעזור
   בכל מכשיר** — ברוב מנועי ההקראה של אנדרואיד `pitch` של
   Web Speech אינו נאכף כלל, ולכן בורר הקול (`#tu-vc`) הוא
   התשובה האמיתית שם. */
var TU_FEM_PITCH = 0.62;
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
    for(j=0;j<all.length;j++) if(all[j].voiceURI === want){
      /* **מנגנון 4 גובר על הבחירה הידנית, ורק עליה ורק אחרי כישלון.**
         הבחירה המפורשת עקפה את `voiceUsable` לגמרי, ולכן לומד
         שנעץ קול רשת ואיבד אינטרנט קיבל אותו קול מת גם בניסיון
         החוזר — כלומר מנגנון ״נפילה מקול רשת״ היה מחזיר את מה
         שזה עתה שתק, והבלם היחיד היה `retried`. התוצאה ללומד
         היא שקט מוחלט, בדיוק מה שארבעת המנגנונים קיימים למנוע.

         **קול מקומי שנבחר ביד נשאר תמיד** — `voiceUsable` מחזיר
         לו 1 תמיד. וכשהרשת חוזרת והדגל נדלק, הבחירה חוזרת מאליה.

         **והתנאי הוא `voiceUsable` עצמו ולא חצי ממנו.** בגרסה
         הראשונה כתבתי כאן `_netVoiceOK` בלבד, ובדיקה מול
         `speechSynthesis` מזויף הראתה שקול רשת נעוץ עדיין נבחר
         כשהרשת מנותקת — מפני ש-`voiceUsable` בודק **שני** דברים,
         את הדגל ואת `navigator.onLine`. מקור אמת אחד. */
      if(voiceUsable(all[j])) return all[j];
      break;
    }
  }
  var v = voices(), p = code.slice(0,2), i, list = [], l;
  for(i=0;i<v.length;i++){
    l = (v[i].lang||"").replace("_","-").toLowerCase();
    if(l.slice(0,2) === p) list.push(v[i]);
  }
  if(!list.length) return null;
  /* **רשימה אחת, ולא ״מדויק ואם אין אז רופף״ — תוקן 15.9.2026.**

     הקוד הקודם בנה שתי רשימות, `exact` ו-`loose`, ובחר
     `exact.length ? exact : loose`. כלומר תג השפה הוכרע **לפני**
     המגדר, וקול גברי שרשום `he` נפל מהמועמדים ברגע שהיה ולו קול
     אחד ב-`he-IL`. נמדד ב-vm על מנוע ההקראה עצמו:

       Carmit (he-IL) + Microsoft Asaf (he)  →  נבחר Carmit
       כלומר קול גברי היה במכשיר, ולא נשקל.

     היום כולם מועמדים, והדיוק הוא מפתח מיון שלישי:

       1. voiceUsable  — קול מת הוא שקט, ושקט גרוע מכל קול.
                         הכלל כתוב ב-CLAUDE.md ואינו משתנה.
       2. מגדר         — ברק גברי, וזו דרישת הדמות.
       3. איכות        — קול טבעי לפני קול בסיסי (23.9.2026).
       4. תג מדויק     — he-IL לפני he. מכריע רק בין שווים.

     **איכות נוספה אחרי שהבעלים שמע ״קול מאוד רובוטי״.** ב-Edge
     יושבים שני קולות גבריים בעברית: Microsoft Asaf (מקומי, סינתזה
     ישנה) ו-Microsoft Avri Online (Natural). שניהם 2 במגדר ושניהם
     he-IL, ולכן הסדר של `getVoices` הכריע — והמקומי רשום ראשון.
     המפתח יושב **אחרי** המגדר, כמו שהכלל ב-CLAUDE.md דורש. */
  var want = code.toLowerCase();
  function exactness(x){
    return ((x.lang||"").replace("_","-").toLowerCase() === want) ? 1 : 0;
  }
  list.sort(function(a,b){
    return (voiceUsable(b) - voiceUsable(a))
        || (femScore(b)    - femScore(a))
        || (natural(b)     - natural(a))
        || (exactness(b)   - exactness(a));
  });
  return list[0];
}
function hasVoice(code){ return !!pickVoice(code) }
/* קול טבעי — נוירלי של Microsoft, משופר של Apple, רשת של Google. */
function natural(v){
  return /natural|online|neural|premium|enhanced|wavenet/i.test((v && v.name) || "") ? 1 : 0;
}
/* **הקול במחשב הזה בסיסי — 23.9.2026.** ב-Chrome על Windows הקול
   העברי היחיד הוא Microsoft Asaf, סינתזה מקומית ישנה שנשמעת
   רובוטית, ובורר הקול מוסתר מפני שאין מה לבחור. הקולות הטבעיים
   של Microsoft זמינים ל-Web Speech רק ב-Edge, ו-Edge מותקן בכל
   Windows. לכן ההודעה אומרת את הדבר האחד שעובד. */
var _basicVoice = false;
function basicVoice(v){
  var ua = navigator.userAgent || "";
  return !!v && /Windows/i.test(ua) && !/Edg\//.test(ua)
      && /^Microsoft /i.test(v.name || "") && !natural(v);
}

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
/* **סימני LaTeX — 23.9.2026.** המודל כותב לפעמים ״$(5, 0)$״ למרות
   ההנחיה, והבעלים צילם את זה בחלון. מסירים זוג $ שעוטף ביטוי — בלי
   רווח מיד אחרי הפותח ומיד לפני הסוגר, כדי ש״$5 and $10״ יישאר.
   בלי lookbehind בכוונה: Safari ישן זורק עליו שגיאת תחביר, והקובץ
   כולו — ברק בכל שלוש־עשרה — לא היה נטען. */
function noTex(text){
  return String(text).replace(/\$\$?([^\s$][^$\n]*?[^\s$]|[^\s$])\$\$?/g, "$1");
}
function stripMd(text){
  return noTex(text)
    .replace(/\*\*/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/^\s*#{1,6}\s+/gm, "");
}
function bold(s){ return s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") }
function fmt(text){
  var lines = esc(noTex(text).replace(/«|»/g, "")).split("\n"),
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
    speakSeg(heSpoken(spoken(s.t, s.l), s.l), code, r, function(){ return PLAYING === i }, next);
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
    /* **`=== 0` ולא `< 2` — תוקן 17.9.2026.**

       `femScore` מחזיר 2 לגברי, 0 לנשי, ו**1 ללא־ידוע**. `< 2`
       הפעיל את הנפילה לאחור גם על הלא־ידוע — כלומר הנמיך את
       הגובה של קול שאיננו יודעים שאינו גברי, **ואמר ללומד
       ״אין במכשיר הזה קול גברי״ בלי שנמדד.**

       וזה בדיוק המקרה הנפוץ: ״Google עברית״ אינו ברשימת השמות
       הגבריים ואינו ברשימה הנשית — הוא שם יצרן. באנדרואיד הוא
       הקול העברי היחיד ברוב המכשירים, ולכן **הנתיב השגוי היה
       הנתיב הרגיל שם.** */
    if(femScore(v) === 0){ u.pitch = TU_FEM_PITCH; _femFallback = true }
    else _femFallback = false;
    _basicVoice = basicVoice(v);
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

/* ================= חזקות, כיוון, ומה נאמר =================
   ``2x<sup>2</sup> + 4x`` הגיע לבועת השאלה כ-״2x 2 + 4x״: המתאם
   של כל אפליקציה מחק תגיות HTML לרווח לפני ששלח את התרגיל
   לכאן ולשרת (הצילום של הבעלים, 17.9.2026). `plain` הוא המחליף
   של אותו עוזר — אותה מחיקה, אבל `<sup>` ו-`<sub>` הופכים קודם
   לכתב עילי ותחתי ביוניקוד (``2x²``, ``a₁``), ומה שאין לו תו
   כזה נכתב ``^(…)``. הפלט הוא טקסט חלק, ולכן הוא טוב לבועה,
   לשרת ולמוח המקומי כאחד. */
var SUP = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹",
            "+":"⁺","-":"⁻","−":"⁻","(":"⁽",")":"⁾","n":"ⁿ","x":"ˣ","i":"ⁱ"," ":"" };
var SUB = { "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉",
            "+":"₊","-":"₋","−":"₋","(":"₍",")":"₎","n":"ₙ","x":"ₓ","i":"ᵢ"," ":"" };
function script(inner, map, mark){
  var out = "", i, c;
  for(i = 0; i < inner.length; i++){
    c = inner.charAt(i);
    if(!map.hasOwnProperty(c)) return mark + (inner.length > 1 ? "(" + inner + ")" : inner);
    out += map[c];
  }
  return out;
}
function plain(x){
  return String(x == null ? "" : x)
    .replace(/<sup\b[^>]*>([^<]*)<\/sup>/gi, function(_, v){ return script(v, SUP, "^") })
    .replace(/<sub\b[^>]*>([^<]*)<\/sub>/gi, function(_, v){ return script(v, SUB, "_") })
    .replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}
/* הבועה: הכיוון הוא של הפאנל, וכל רצף בלי אות עברית או ערבית
   שיש בו ספרה, אות לטינית או סימן חשבון נעטף ב-`<bdi dir="ltr">`.
   כך משפט עברי נקרא מימין לשמאל והנוסחה שבתוכו משמאל לימין.
   רץ אחרי `esc`, ולכן אין כאן דרך להזריק HTML. */
/* **הפיסוק של המשפט נשאר מחוץ לקופסה — 24.9.2026.** צילום: ״ש-21 אוהבים
   קפה, 10 אוהבים תה״ הוצג ״ש21- … קפה10 ,״. הריצה שבין שתי אותיות עבריות
   כללה את המקף ואת הפסיק, ו-`dir="ltr"` הפך את מקומם. מקף מיד אחרי אות
   עברית הוא מקף עברי (״ש-21״) ולא סימן מינוס, ולכן הוא יוצא החוצה; פסיק
   ונקודה בקצוות — גם. מינוס בתחילת ביטוי (״-3 + 5״) נשאר בפנים. */
function mathHTML(s){
  return esc(s).replace(/[^\u0590-\u05FF\u0600-\u06FF\n]+/g, function(run, at, all){
    if(!/[0-9A-Za-z\u00B2\u00B3\u00B9\u2070-\u209F=+\u2212\u00D7\u00F7\u221A\^]/.test(run)) return run;
    var m = run.match(/^([\s,.;:]*)([\s\S]*?)([\s,.;:?!]*)$/), lead = m[1], mid = m[2];
    if(at > 0 && /[\u05D0-\u05EA]/.test(all.charAt(at - 1)) && /^-/.test(mid)){
      lead += "-"; mid = mid.slice(1);
    }
    if(!mid) return run;
    return lead + '<bdi dir="ltr">' + mid + '</bdi>' + m[3];
  });
}
/* מה נאמר: כתב עילי אינו נקרא במנוע ההקראה, ולכן ``x²`` נאמר
   ״x בריבוע״ ו-``xⁿ⁻¹`` ״x בחזקת n-1״, בשפת הקטע. כתב תחתי
   חוזר לתו הרגיל. אותה טבלה בדיוק כמו במשפחת המתמטיקה. */
var POW = { he:[" בריבוע "," בשלישית "," בחזקת "], ar:[" تربيع "," تكعيب "," أس "],
            ru:[" в квадрате "," в кубе "," в степени "], en:[" squared "," cubed "," to the power of "] };
var SUPCH = "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁽⁾ⁿˣⁱ", SUBCH = "₀₁₂₃₄₅₆₇₈₉₊₋₍₎ₙₓᵢ", PLAINCH = "0123456789+-()nxi";
function spoken(text, lg){
  var w = POW[lg] || POW.he;
  return String(text)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁽⁾ⁿˣⁱ]+/g, function(run){
      var p = "", i;
      for(i = 0; i < run.length; i++) p += PLAINCH.charAt(SUPCH.indexOf(run.charAt(i)));
      return p === "2" ? w[0] : p === "3" ? w[1] : w[2] + p + " ";
    })
    .replace(/[₀₁₂₃₄₅₆₇₈₉₊₋₍₎ₙₓᵢ]/g, function(c){ return " " + PLAINCH.charAt(SUBCH.indexOf(c)) + " " });
}
/* ---------- מנוע ההגייה העברי, 18.9.2026 ----------

   **ברק היה הנתיב היחיד באתר שלא עבר בו.** `/tutor/he-speech.js`
   הועתק מ״תאוריה מדברת״ ב-17.9 בהוראת הבעלים — הוא שמע ״שלב״
   מוקראת לא נכון — והוא טעון בשתים־עשרה האפליקציות וב-`PRE` של
   כולן. שתים־עשרה מעבירות בו את ההקראה שלהן (`math-app:1556`,
   `bagrut-806/speech.js:36`), **ו-`tutor.js` לא הזכיר אותו באף
   שורה.** נמדד ב-grep: אפס מופעים.

   כלומר הבעלים התקין מנוע הגייה, וברק — שהוא הקול שמדבר אליו
   ישירות — המשיך לומר ״משלש״, ״מצין״ ו״מאד״.

   **ומתוך 169 המחרוזות הכתובות של ברק רק ארבע נשמעות אחרת**
   (לעבור, לעצור, חצי) — אבל זה אינו המספר שקובע: **תשובת המודל
   אינה כתובה מראש.** היא עברית חופשית, וכל 45 מילות המילון
   עלולות להופיע בה.

   **כאן ולא ב-`speakSeg`:** `spoken()` הוא כבר השלב שממיר תצוגה
   לדיבור (כתב עילי → ״בריבוע״), ושני נתיבי ההקראה עוברים בו.
   אחרי ההמרה ולא לפניה, כדי שהמנוע יראה את הטקסט הסופי.

   **מוגן, ועברית בלבד** — אותה תבנית בדיוק כמו ב-`bagrut-806`:
   `tutor.js` נטען גם בדף הבית, ובביקור ראשון אופליין הקובץ עשוי
   לא להיות שם. תלות קשיחה הייתה משתיקה את ברק לגמרי. */
function heSpoken(text, lg){
  if((lg || "he") !== "he" || typeof HESPEECH === "undefined") return text;
  try{ return HESPEECH.spoken(text) }catch(e){ return text }
}

/* ================= המקלדת ================= */
/* כרום באנדרואיד אינו מכווץ את `innerHeight` כשהמקלדת נפתחת —
   רק `visualViewport` מתכווץ (ראו ההערה ליד `tu-kb` ב-CSS).
   ההפרש ביניהם הוא המקלדת; 120px ומעלה נחשב פתוחה. `scale` > 1
   הוא זום־צביטה ולא מקלדת, ואינו נחשב. */
var VV = g.visualViewport || null, KB = false, QX = false;
function kbOpen(){
  if(!VV) return false;
  if(VV.scale && VV.scale > 1.01) return false;
  return ((g.innerHeight || 0) - VV.height) >= 120;
}
function kbSync(){
  if(!EL) return;
  var on = kbOpen();
  if(on){
    EL.ov.style.top = Math.max(0, VV.offsetTop) + "px";
    EL.ov.style.height = VV.height + "px";
  } else { EL.ov.style.top = ""; EL.ov.style.height = "" }
  if(on === KB) return;
  KB = on;
  if(!on) QX = false;
  EL.ov.classList.toggle("tu-kb", on);
  draw();
}

/* ================= הפאנל ================= */
var CSS = ''
/* ---- מנוע ברק, 16.9.2026: הפאנל אינו מסתיר את התרגיל ----

   עד כאן הפאנל היה חלון במרכז המסך מעל רקע מוחשך — כלומר ברק
   כיסה את השאלה, את האפשרויות ואת הכפתורים בדיוק ברגע שהלומד
   ביקש עזרה עליהם, ופעולה כמו ״הדגש אפשרות״ הייתה קורית מאחורי
   וילון. המנדט: ״ברק הוא עזר ולא המטרה. הוא לא מסתיר שאלה,
   תשובות או כפתורים״.

   **הבחירה השמרנית** (D-17, ממתין לאישור יהושע): אותה קופסה,
   אותם צבעים, אותו דיוקן — רק המיקום. בטלפון: גיליון תחתון עד
   60vh, בלי הכהיה, והמסך שמעליו חי ולחיץ; במסך רחב (≥ 900px):
   עמודה בצד ההתחלה של הכתיבה, ברוחב 400px, לגובה המסך.
   `#tu-min` מקפל את הגיליון לפס של שורת קלט אחת. הלחיצה מחוץ
   לקופסה כבר אינה סוגרת — יש X ויש Escape. */
+'#tu-ov{position:fixed;inset:0;background:transparent;display:none;'
+'place-items:end center;z-index:9000;padding:0;pointer-events:none}'
+'#tu-ov.on{display:grid}'
+'#tu-ov.on>#tu-bx{pointer-events:auto}'
+'#tu-ov.tu-min #tu-log,#tu-ov.tu-min #tu-pv,#tu-ov.tu-min #tu-q{display:none}'
+'#tu-ov.tu-min #tu-bx{max-height:none}'
/* ---- מקלדת פתוחה — מצב קומפקטי, 17.9.2026 ----

   הבעלים צילם באנדרואיד: כשהמקלדת נפתחת הכותרת, הדיוקן ובועת
   השאלה תפסו כמעט את כל מה שנשאר מהמסך, ואזור השיחה התכווץ
   לאפס (נמדד ב-`keyboard.js` על הקוד הישן: 28px). הסיבה: כרום
   באנדרואיד (מגרסה 108, `resizes-visual`) **אינו מכווץ** את
   `innerHeight` ואת `position:fixed;inset:0` כשהמקלדת נפתחת —
   רק `window.visualViewport` מתכווץ. הפאנל נשאר בגובה של המסך
   המלא, והמקלדת כיסתה את חציו.

   לכן: `kbSync` קורא את `visualViewport`, וכשהמקלדת פתוחה הוא
   מציב את `#tu-ov` **בתוך החלון הנראה** (top/height בשורה,
   מהמדידה) ומדליק `tu-kb`. במצב הזה הפאנל ממלא את החלון הנראה
   כולו, הכותרת שורה אחת — דיוקן 56px בעיגול, ▾ ו-✕ כאייקונים —
   בועת השאלה שורה אחת שנפתחת בלחיצה, ואזור השיחה מקבל את כל
   מה שנשאר וגולל בפנים. המקלדת נסגרת — הכול חוזר. */
+'#tu-ov.tu-kb{inset:auto;left:0;right:0}'
+'#tu-ov.tu-kb #tu-bx{height:100%;max-height:100%;border-radius:0}'
+'#tu-ov.tu-kb.tu-min #tu-bx{height:auto}'
+'#tu-ov.tu-kb #tu-hd{flex-wrap:nowrap;padding:6px 10px;gap:8px}'
/* הדיוקן: אותו DOM, אותן שכבות תנועה — רק חלון עגול של 56px
   על החלק העליון של התצלום (2:3, ולכן 56×84; העיניים ב-28%
   והלסת ב-47.5% מהגובה, שתיהן בתוך העיגול). הציפה כבויה כאן
   כי היא הייתה מזיזה את הפנים אל מחוץ לחלון. */
+'#tu-ov.tu-kb #tu-face{display:block;width:56px;height:56px;overflow:hidden;border-radius:50%}'
+'#tu-ov.tu-kb #tu-face .jf{width:56px!important;animation:none}'
+'#tu-ov.tu-kb #tu-ti{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:1rem}'
+'#tu-ov.tu-kb #tu-lg{font-size:.8rem;padding:3px 4px;max-width:96px}'
+'#tu-ov.tu-kb #tu-min,#tu-ov.tu-kb #tu-x{flex:0 0 auto;width:36px;height:36px;padding:0;'
+'display:inline-grid;place-items:center;border-radius:50%;font-size:1.05rem}'
+'#tu-ov.tu-kb #tu-q{margin:6px 10px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}'
+'#tu-ov.tu-kb #tu-q.tu-qx{white-space:normal;overflow-y:auto;max-height:5.6em}'
+'#tu-ov.tu-kb #tu-log{padding:8px 10px}'
+'#tu-ov.tu-kb #tu-ft{padding:6px 10px}'
+'#tu-ov.tu-kb #tu-pv{display:none}'
+'#tu-min{background:transparent;border:1px solid rgba(23,51,60,.25);border-radius:9px;'
+'padding:5px 10px;font:inherit;cursor:pointer;color:#17333c}'
+'@media(min-width:900px){#tu-ov{place-items:stretch start;padding:0}'
+'#tu-bx{max-width:400px;max-height:none;border-radius:0;height:100%;'
+'box-shadow:8px 0 30px rgba(0,0,0,.18)}}'
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
+'#tu-bx{background:#fff;color:#17333c;border-radius:20px 20px 0 0;width:100%;max-width:540px;'
/* 60 ולא 46 — 18.9.2026. הבעלים צילם תשובה שממנה נראתה שורה
   אחת. נמדד ב-`keyboard.js` על 46dvh בטלפון בגובה 740: הכותרת
   132px, בועת השאלה, והפוטר 115px השאירו לשיחה 39–52px — פחות
   מבועה אחת. הגובה חל רק כשיש מה לקרוא: ברכה קצרה נשארת קופסה
   קטנה, ו-`#tu-min` מקפל תמיד. */
+'max-height:60vh;max-height:60dvh;display:flex;flex-direction:column;overflow:hidden;'
+'box-shadow:0 18px 50px rgba(0,0,0,.3);font-size:19px;line-height:1.75;'
+'letter-spacing:.01em;word-spacing:.05em}'
/* נטוי הוא הצורה שהכי קשה לפענח בדיסלקציה: האותיות נשענות זו על
   זו והמרווח ביניהן מתכווץ. כל הדגשה בפאנל היא משקל, לא הטיה. */
+'#tu-bx em,#tu-bx i,#tu-bx cite{font-style:normal;font-weight:700}'
+'#tu-hd{display:flex;align-items:center;gap:10px;padding:14px 18px;'
+'border-bottom:2px solid rgba(23,51,60,.12);flex-wrap:wrap;flex:0 0 auto}'

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
+'}'   /* הציפה עברה ל-josh-face.js וחלה על כל הפנים */
+'@media (prefers-reduced-motion:reduce){#tu-face{animation:none}}'
+'#tu-hd b{font-size:1.05rem}'
/* בועת השאלה — שורה משלה מתחת לכותרת, ולא פריט בתוכה: בתוך
   הכותרת היא דחפה את ▾ ו״סגירה״ לשורה שלישית כמעט ריקה.
   `<button>` כדי שאפשר יהיה להרחיב אותה במקלדת במצב הקומפקטי;
   במצב המלא היא מוצגת בשלמותה ואינה לחיצה (`disabled`).
   הכיוון הוא של הפאנל, והנוסחה עצמה עטופה ב-`<bdi dir="ltr">`
   (`mathHTML`) — כך ״מצא את הנגזרת של f(x) = 2x² + 4x״ נקרא
   מימין לשמאל, והנוסחה בתוכו משמאל לימין. */
+'#tu-q{display:block;flex:0 0 auto;margin:8px 18px 0;background:#fff3ce;border:1px solid #e6b800;'
+'border-radius:9px;padding:3px 9px;font:inherit;font-weight:600;font-size:.95rem;color:#17333c;'
+'text-align:start;unicode-bidi:isolate;cursor:default;max-width:calc(100% - 36px);box-sizing:border-box}'
+'#tu-q[hidden]{display:none}'
+'#tu-q:disabled{opacity:1;color:#17333c}'
+'#tu-q bdi{unicode-bidi:isolate}'
+'#tu-log{padding:14px 18px;overflow-y:auto;flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}'
+'.tu-m{max-width:88%;border-radius:15px;padding:10px 14px;white-space:pre-wrap;word-break:break-word}'
+'.tu-me{align-self:flex-end;background:#dff1fa;border:2px solid rgba(88,183,224,.45)}'
+'.tu-bot{align-self:flex-start;background:#d9f2ec;border:2px solid rgba(14,156,141,.4)}'
+'.tu-src{align-self:flex-start;font-size:.78em;color:#5b6770;margin:-4px 8px 0}'
+'.tu-m p{margin:0 0 .45em}.tu-m p:last-child{margin-bottom:0}'
+'.tu-l{margin:.2em 0 .45em;padding-inline-start:1.25em}.tu-l li{margin:.15em 0}'
+'.tu-m>*:last-child{margin-bottom:0}'
/* ההצעות אינן בועה: הן פעולה, ולכן הן נראות ככפתורים ולא כטקסט. */
/* שורה אחת שגוללת אופקית — בטלפון עם מקלדת פתוחה שורה שנייה
   של הצעות נחתכה באמצע (הצילום מ-17.9.2026). במסך רחב אין
   מקלדת ואין גלגלת אופקית נוחה, ולכן שם הן עוטפות כמו קודם.
   `flex:0 0 auto` חובה: פריט עם `overflow` בתוך עמודת flex מאבד
   את `min-height:auto`, וכשהשיחה גולשת הוא היחיד שמתכווץ —
   נמדד 3px, והכפתורים יצאו ממנו. */
+'.tu-sg{display:flex;flex:0 0 auto;flex-wrap:nowrap;gap:6px;align-self:stretch;max-width:100%;'
+'overflow-x:auto;overflow-y:hidden;padding-bottom:3px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}'
+'.tu-sg button{flex:0 0 auto;white-space:nowrap;font:inherit;font-size:.92em;border-radius:999px;cursor:pointer;'
+'padding:6px 13px;background:#eef8fb;color:#17333c;border:2px solid rgba(88,183,224,.55)}'
+'@media(min-width:900px){.tu-sg{flex-wrap:wrap;overflow:visible;align-self:flex-start;max-width:88%}'
+'.tu-sg button{white-space:normal}}'
+'.tu-sg button:hover{background:#dff1fa}'
+'.tu-sys{color:#4c666e;font-size:.92rem}'
+'.tu-note{background:#fff3ce;border:2px solid rgba(230,184,0,.55);border-radius:13px;padding:10px 14px}'
+'.tu-ctl{display:flex;gap:6px;align-items:center;margin-top:7px;flex-wrap:wrap}'
+'.tu-ctl button{border:1px solid rgba(23,51,60,.28);background:#fff;color:#17333c;'
+'border-radius:9px;padding:4px 11px;font:inherit;font-size:.85rem;cursor:pointer;min-height:32px}'
+'.tu-ctl button[aria-pressed="true"]{background:#0e9c8d;color:#fff;border-color:#0b7568}'
+'.tu-ctl select{border:1px solid rgba(23,51,60,.28);border-radius:9px;padding:4px 8px;'
+'font:inherit;font-size:.85rem;min-height:32px;background:#fff;color:#17333c}'
+'#tu-ft{padding:12px 18px;border-top:2px solid rgba(23,51,60,.12);flex:0 0 auto}'
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
/* **סגירה בצבע משלה — 24.9.2026, הבעלים: ״הכפתור סגירה בצבע אחר״.**
   שקוף ודק היה נראה כמו תווית ולא ככפתור. #b03a2e עם לבן — 6.02:1 (חושב לפי WCAG). */
+'#tu-x{margin-inline-start:auto;background:#b03a2e;border:1px solid #b03a2e;'
+'border-radius:9px;padding:5px 12px;font:inherit;font-weight:700;cursor:pointer;color:#fff}'
+'#tu-x:hover{background:#8f2d23;border-color:#8f2d23}'
/* ״זה צריך להיות מודגש ובכתב גדול יותר״ (הבעלים, 24.9.2026) — ההודעה
   היחידה בחלון שאומרת ללומד לעשות משהו כדי לשמוע טוב יותר. */
+'#tu-edge{background:#fff3ce;border:1px solid #d9b44a;border-radius:10px;padding:8px 10px;margin:0 0 8px;'
+'display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}'
+'#tu-edge[hidden]{display:none}'
+'#tu-ov.tu-kb #tu-edge{display:none}'
+'.tu-edge{flex:1 1 14rem;font-weight:700;font-size:1.05rem;color:#17333c;line-height:1.5}'
+'.tu-edgebtn{display:inline-block;background:#0f6b8a;color:#fff;font-weight:700;'
+'font-size:1.05rem;text-decoration:none;border-radius:10px;padding:8px 16px}'
+'.tu-edgebtn:hover{background:#0b5570}'
+'@media(prefers-color-scheme:dark){#tu-bx{background:#16232a;color:#eef5f7}'
+'#tu-q,#tu-q:disabled{background:#3d3410;border-color:#8a6d00;color:#fff3ce}'
+'#tu-in,.tu-ctl button,.tu-ctl select,#tu-lg{background:#1e2f38;color:#eef5f7;'
+'border-color:rgba(238,245,247,.3)}'
+'.tu-me{background:#1d3b4a;border-color:#2f6a86}.tu-bot{background:#14403a;border-color:#1c7e70}'
+'.tu-sg button{background:#12303d;color:#eaf6fa;border-color:#2f6a86}'
+'.tu-sg button:hover{background:#1d3b4a}'
+'.tu-sys{color:#a9c2ca}#tu-pv{color:#93aeb7}.tu-edge{color:#fff3ce}'
+'#tu-edge{background:#3d3410;border-color:#8a6d00}}';

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
    '<div id="tu-bx" role="dialog" aria-modal="false" aria-labelledby="tu-ti">'
    + '<div id="tu-hd"><span id="tu-face"></span><b id="tu-ti"></b>'
    + '<select id="tu-lg" hidden></select>'
    + '<button id="tu-min" type="button" aria-expanded="true"></button>'
    + '<button id="tu-x" type="button"></button></div>'
    + '<button id="tu-q" type="button" hidden disabled></button>'
    + '<div id="tu-log" aria-live="polite"></div>'
    + '<div id="tu-ft"><div id="tu-edge" hidden></div><div id="tu-row">'
    + '<button id="tu-mic" type="button" hidden aria-pressed="false"></button>'
    /* `enterkeyhint="send"`: המקש הראשי במקלדת אומר ״שליחה״ ולא
       ״ירידת שורה״. `autocomplete="off"` — אין כאן מה להשלים,
       וזה גם מה שמבקש מכרום לא להציג פס מילוי מעל המקלדת. */
    + '<input id="tu-in" type="text" autocomplete="off" enterkeyhint="send" maxlength="' + MAXLEN + '" />'
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

     **ההערה הזאת אמרה `/img/paula.jpg` עד 17.9.2026**, בזמן
     שהקריאה שלושים שורות מתחתיה טוענת את `josh.jpg`. מי שקרא
     אותה הסיק דבר שגוי — אותה מלכודת שה-`CLAUDE.md` מתעד
     לגבי ״ג׳וש כבוי״.
     --------------------------------------------------------------- */
  if(typeof JOSHFACE !== "undefined"){
    /* פאולה, 14.9.2026 — מהתמונה שהבעלים יצר. שני הקודמים נשארו
       בעץ ומחווטים לשורה אחת: `photo("/img/josh-bot.jpg",
       JOSHFACE.MARKS_BOT)` או `photo("/img/josh.jpg")`. */
    /* **ברק — הוראת הבעלים, 15.9.2026:** ״אל תחליף את הגבר,
       תחזיר אותו לכולם, נקרא לו בינתיים ברק״, ואחריה ״לא ג׳וש״.

       **בלי ארגומנט שני בכוונה.** שלוש המסכות של `josh-face.js`
       מכוילות בברירת המחדל שלהן **לחתך הזה בדיוק** — זה מה
       ש-`FACE.md` מתעד, וזו הסיבה שהמצמוץ ותנועת הלסת עובדים
       כאן בלי מדידה חדשה. */
    JOSHFACE.photo("/img/josh.jpg");
    var fw = ov.querySelector("#tu-face");
    if(fw){ fw.innerHTML = JOSHFACE.markup(68); JOSHFACE.attach() }
  }

  EL = {
    ov: ov, bx: ov.querySelector("#tu-bx"), ti: ov.querySelector("#tu-ti"),
    q: ov.querySelector("#tu-q"), x: ov.querySelector("#tu-x"),
    lg: ov.querySelector("#tu-lg"),
    log: ov.querySelector("#tu-log"), inp: ov.querySelector("#tu-in"),
    go: ov.querySelector("#tu-go"), pv: ov.querySelector("#tu-pv"),
    edge: ov.querySelector("#tu-edge")
  };
  EL.x.onclick = close;
  EL.q.onclick = function(){ QX = !QX; draw() };
  if(VV){ VV.addEventListener("resize", kbSync); VV.addEventListener("scroll", kbSync) }
  EL.min = ov.querySelector("#tu-min");
  EL.min.onclick = function(){
    var on = ov.classList.toggle("tu-min");
    EL.min.setAttribute("aria-expanded", on ? "false" : "true");
    draw();
  };
  EL.lg.onchange = function(){
    setLang(this.value);
    /* שפה חדשה — שיחה חדשה, אחרת הבוט ממשיך בשפה הקודמת */
    MSGS = []; NOTE = ""; LANGAT = lang();
    stopSay(); draw(); greetLocal();   /* ברכה מקומית — ראו open() */
  };
  EL.go.onclick = function(){ send(EL.inp.value) };
  wireMic(ov);
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
      /* `T().mic` הוא **תווית כפתור המיקרופון** — ״דבר״. הלומד
         בחר קול כדי לשמוע אותו, והקול אמר לו ״דבר״: הוראה, לא
         הדגמה. `vSample` היא משפט מדגם אמיתי בארבע השפות. */
      try{ speakSeg(T().vSample || T().mic, VOICE[lang()] || "he-IL", rate(), function(){return true}, function(){}) }catch(err){}
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
  /* במצב הקומפקטי ״סגירה״ הוא אייקון; השם נשאר לקורא המסך. */
  e.x.textContent = KB ? "✕" : t.close;
  e.x.setAttribute("aria-label", t.close);
  e.x.title = t.close;
  if(e.min) e.min.textContent = e.ov.classList.contains("tu-min") ? "▴" : "▾";
  e.go.textContent = t.send;
  e.inp.placeholder = t.ph;
  e.inp.setAttribute("aria-label", t.ph);
  e.pv.textContent = t.privacy;
  /* **ההודעה על Edge, עם כפתור — מעל שדה הקלט ולא בתוך השיחה (24.9.2026).**
     בתוך השיחה היא ישבה מתחת לתשובה האחרונה, והחלון גולל אל ראש
     התשובה בכוונה — ולכן הכפתור נחתך מחוץ לתצוגה (נמדד בצילום).
     כאן היא תמיד נראית. `_basicVoice` נקבע ב-`speakSeg`, ולכן היא
     מופיעה אחרי ההקראה הראשונה ולא לפניה — עד אז לא ידוע איזה קול.
     הכפתור — אותה סכימה כמו `edgeNote()` בהגדרות של כל אפליקציה:
     `microsoft-edge:` פותחת את אותה כתובת ב-Edge מכל דפדפן בווינדוס.
     אוטומטית אי אפשר: דפדפן אינו מעביר לדפדפן אחר בלי לחיצה. */
  if(e.edge){
    e.edge.hidden = !_basicVoice;
    var eh = _basicVoice ? '<span class="tu-edge">' + esc(t.edgeNote) + '</span>'
      + '<a class="tu-edgebtn" href="microsoft-edge:' + esc(location.href.split("#")[0]) + '">'
      + esc(t.edgeBtn) + '</a>' : "";
    if(e.edge.innerHTML !== eh) e.edge.innerHTML = eh;
  }
  /* **המיקרופון בשפה של עכשיו — 23.9.2026.** התווית נכתבה רק ב-`micState`,
     כלומר בבנייה ובלחיצה. מי שעבר מערבית לאנגלית קיבל ״تكلّم״ במסך
     אנגלי (צילום הבעלים). */
  if(e.mic) e.mic.textContent = "● " + (RECON ? t.micOn : t.mic);
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
  if(q && q.expr){
    e.q.hidden = false;
    var qh = mathHTML(q.expr);
    if(e.q.innerHTML !== qh) e.q.innerHTML = qh;
    /* לחיץ ומתרחב רק כשהמקלדת פתוחה; במצב המלא הוא מוצג בשלמותו */
    e.q.disabled = !KB;
    e.q.classList.toggle("tu-qx", KB && QX);
    if(KB) e.q.setAttribute("aria-expanded", QX ? "true" : "false");
    else e.q.removeAttribute("aria-expanded");
  }
  else e.q.hidden = true;

  var h = "";
  if(!INTRO_SEEN){
    h += '<p class="tu-sys">' + esc(t.intro) + '</p>';
    if(MSGS.some(function(m){ return m.role === "user" })) INTRO_SEEN = true;
  }
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
    /* השורה האפורה אומרת למה התשובה מהמכשיר — במילים של השפה,
       לא באסימון (״· limit״ הופיע כך בממשק עברי, נמדד 18.9.2026).
       רק לסיבות שיש להן משפט מוכן; לכל השאר די ב-t.local. */
    if(m.local){
      var whyT = (m.local === "limit" || m.local === "limitAll" || m.local === "setup") ? t[m.local] : "";
      h += '<div class="tu-src">' + esc(t.local) + (whyT ? ' · ' + esc(whyT) : '') + '</div>';
    }
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
  scrollLog(e);
}

/* לאן גוללים אחרי ציור. עד 18.9.2026 — תמיד לתחתית, וזה הסתיר את
   התשובה: הבעלים צילם ב-lomda תשובה של ארבע שורות שממנה נראתה
   השורה האחרונה בלבד, ומתחתיה כפתורי ההקראה. נמדד ב-390×844:
   אזור השיחה 141px, הבועה 323px, נראו 50px. לכן כשההודעה
   האחרונה היא של ברק — ראש הבועה שלו בראש אזור השיחה, והלומד
   קורא מההתחלה וגולל למטה אל ההמשך, ההקראה וההצעות. כשהילד
   שלח, כשברק עדיין חושב, או כשיש הערה — התחתית, כמו קודם.
   הגלילה מוגבלת ממילא: תשובה קצרה שנכנסת כולה נשארת עם הכפתורים
   על המסך. */
function scrollLog(e){
  var m = MSGS[MSGS.length - 1];
  var bots = e.log.querySelectorAll(".tu-bot"), last = bots[bots.length - 1];
  if(m && m.role !== "user" && !BUSY && !NOTE && last){
    var pad = parseFloat(getComputedStyle(e.log).paddingTop) || 0;
    e.log.scrollTop += last.getBoundingClientRect().top - e.log.getBoundingClientRect().top - pad;
  }
  else e.log.scrollTop = e.log.scrollHeight;
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
    h += '<span class="tu-sys tu-man">' + esc(t.manNote) + ' ' + esc(voiceHow()) + '</span>';
  return h + '</div>';
}

/* **איך משיגים קול גברי — 17.9.2026.**
   `manNote` אמרה עד כה ״אין קול גברי, לכן הגובה הונמך״ ולא אמרה
   מה לעשות. הבעלים דיווח מהטלפון ״הקול של ברק לא של גבר״, ובורר
   הקול (`#tu-vc`) **מוסתר כשיש קול אחד בשפה** — כלומר מי שיש לו
   קול עברי יחיד ונשי נשאר בלי בורר, בלי הסבר מעשי, ובלי דרך.

   הנוסח מועתק מ-`reader`, ששם הוא כבר מדויק עד רמת סמסונג
   (באנדרואיד של גוגל ההגדרה תחת ״נגישות״, בסמסונג תחת ״ניהול
   כללי״), והופך מ״קול נשי״ ל״קול גברי״. */
function voiceHow(){
  var ua = navigator.userAgent || "", L = lang();
  var A = { he:"באנדרואיד: הגדרות ← נגישות ← טקסט לדיבור (בסמסונג: הגדרות ← ניהול כללי ← טקסט לדיבור) ← גלגל השיניים ליד המנוע ← התקנת נתוני קול ← לבחור וריאנט גברי.",
            ar:"في أندرويد: الإعدادات ← إمكانية الوصول ← النص إلى كلام (في سامسونج: الإعدادات ← الإدارة العامة ← النص إلى كلام) ← الترس بجانب المحرّك ← تثبيت بيانات الصوت ← اختيار نسخة رجاليّة.",
            ru:"На Android: Настройки ← Специальные возможности ← Синтез речи (в Samsung: Настройки ← Общие настройки ← Синтез речи) ← шестерёнка рядом с движком ← Установка голосовых данных ← выбрать мужской вариант.",
            en:"On Android: Settings → Accessibility → Text-to-speech (on Samsung: Settings → General management → Text-to-speech) → the gear next to the engine → Install voice data → pick a male variant." };
  var I = { he:"באייפון או באייפד: הגדרות ← נגישות ← תוכן מדובר ← קולות ← לבחור קול גברי ולהוריד.",
            ar:"في آيفون أو آيباد: الإعدادات ← إمكانية الوصول ← المحتوى المنطوق ← الأصوات ← اختيار صوت رجاليّ وتنزيله.",
            ru:"На iPhone или iPad: Настройки ← Универсальный доступ ← Устный контент ← Голоса ← выбрать мужской голос и загрузить.",
            en:"On iPhone or iPad: Settings → Accessibility → Spoken Content → Voices → pick a male voice and download it." };
  var M = { he:"במק: הגדרות המערכת ← נגישות ← תוכן מדובר ← קול המערכת ← ניהול קולות ← להוריד קול גברי בעברית.",
            ar:"في ماك: إعدادات النظام ← إمكانية الوصول ← المحتوى المنطوق ← صوت النظام ← إدارة الأصوات ← تنزيل صوت رجاليّ.",
            ru:"На Mac: Системные настройки ← Универсальный доступ ← Устный контент ← Системный голос ← Управление голосами ← загрузить мужской голос.",
            en:"On Mac: System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → download a male voice." };
  var W = { he:"בווינדוס: הגדרות ← שעה ושפה ← דיבור ← ניהול קולות ← הוספת קולות.",
            ar:"في ويندوز: الإعدادات ← الوقت واللغة ← الكلام ← إدارة الأصوات ← إضافة أصوات.",
            ru:"В Windows: Параметры ← Время и язык ← Речь ← Управление голосами ← Добавить голоса.",
            en:"On Windows: Settings → Time & language → Speech → Manage voices → Add voices." };
  var tbl = /Android/i.test(ua) ? A
          : (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) ? I
          : /Mac OS X|Macintosh/i.test(ua) ? M : W;
  return tbl[L] || tbl.he;
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
  kbSync();
  draw();
  /* פתיחה אוטומטית אינה גונבת מיקוד. הפאנל הוא דיאלוג, ומיקוד
     שקופץ אליו בלי שהלומד ביקש מקפיץ גם קורא מסך באמצע משפט. */
  /* **הברכה תמיד מקומית — 16.9.2026.** פתיחה ידנית שלחה ״אני צריך
     עזרה במה שעל המסך״ לשרת, כלומר כל פתיחת פאנל עלתה בקשה אחת
     מתוך 10 ליום ל-IP (`perDay` ב-worker.js) — לפני שהלומד כתב
     מילה. הברכה היא טקסט קבוע, ואין סיבה לשלם עליה. */
  if(!MSGS.length) greetLocal();
  if(!auto) focus();
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

/* המוח המקומי — התשובה כשאין שרת, אין רשת, או שהמכסה נגמרה.

   הכרעת הבעלים 14.9.2026 הייתה ״ג׳וש לא יוציא כסף״ ו-`API` ריקה;
   ב-15.9 השרת עבר ל-Gemini בשכבה החינמית, וב-16.9 הבעלים הורה
   לחבר: ``API`` מלאה, והקובץ הזה הוא **הנפילה לאחור** — ראו
   `send()`.

   **המונה היומי אינו נספר כאן במתכוון.** `bump()` קיים כדי להגן
   על תקציב, ומוח מקומי אינו עולה דבר — לומד שמדבר עם ג׳וש חמישים
   פעם ביום אינו עולה יותר מלומד שמדבר איתו פעם אחת. תקרה כאן
   הייתה מגבילה בלי שום דבר להגן עליו. */
/* `why` — למה לא השרת: "offline", "quota" (המונה במכשיר), או
   הסיבה מה-`catch` (limit / limitAll / setup / http / err / empty).
   **כשיש כתובת שרת, התשובה המקומית מסומנת ללומד** בשורה קטנה
   ואפורה, ״התשובה מהמכשיר, לא מהשרת״ + הסיבה. זו אינה שגיאה —
   התשובה כן הגיעה — אלא יושר: הבעלים בדק מ-`localhost` ב-16.9.2026,
   קיבל ״אני מוח קטן… בלי חיבור לאינטרנט״ בכל אפליקציה, ולא הייתה
   דרך לדעת מהמסך אם השרת נפל, נחסם, או שהמכסה (10 ליום ל-IP) נגמרה. */
function replyLocal(text, why){
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

  MSGS.push({ role:"assistant", text:out.text, local: API ? (why || "local") : "" });
  startReveal(MSGS.length - 1);
  BUSY = false; draw(); focus();
  return true;
}

/* ---- מנוע ברק, 16.9.2026 ----------------------------------------
   כשהדף טען את `/tutor/barak-core.js` והאפליקציה רשמה מתאם, הקריאה
   לשרת עוברת דרכו: הוא אוסף את ההקשר המלא של המסך (שאלה, אפשרויות,
   תשובה נכונה, מה התלמיד ענה, נושא, תוכנית), שולח את רשימת הפעולות
   שהאפליקציה מציעה, **מבצע** את הפעולה שהמודל בחר, ונופל למוח
   המקומי בכל כישלון — בלי שגיאה ללומד. הפאנל הזה נשאר הפאנל:
   ההודעות, החשיפה ההדרגתית, ההקראה והפנים כולם כאן.

   `sendLegacy` הוא הנתיב הישן, לדף שלא טען את המנוע. */
function send(text, auto){
  if(typeof BARAK === "undefined" || !BARAK.ready()) return sendLegacy(text, auto);
  var t = T();
  text = String(text || "").trim().slice(0, MAXLEN);
  if(!text || BUSY) return;
  if(MSGS.length >= TURNS){ NOTE = t.full; draw(); return }
  stopReveal();
  MSGS.push({ role:"user", text:text });
  if(EL) EL.inp.value = "";
  BUSY = true; NOTE = ""; draw();
  /* `online` שלילי — לא מנסים את השרת: אין רשת, או שהמונה במכשיר
     נגמר. המונה עולה רק כשהשרת מנוסה. */
  var tryServer = !!API && navigator.onLine !== false && left() > 0;
  if(tryServer) bump();
  var hist = (MSGS.length && MSGS[0].role === "assistant") ? MSGS.slice(1, -1) : MSGS.slice(0, -1);
  BARAK.ask(text, {
    api: API, lang: lang(), target: CFG.target || null,
    sign: sign(),
    q: CFG.q ? CFG.q() : null,
    history: hist, mode: "chat",
    online: tryServer,
    why: !API ? "" : navigator.onLine === false ? "offline" : "quota"
  }).then(function(res){
    BUSY = false;
    if(!res || !res.say){ NOTE = t.err; if(auto) MSGS = []; draw(); return }
    /* תשובה מקומית מסומנת ללומד — ראו replyLocal. */
    MSGS.push({ role:"assistant", text:res.say, local: (API && res.source !== "ai") ? (res.why || "local") : "" });
    startReveal(MSGS.length - 1);
    draw(); focus();
  }, function(){
    BUSY = false;
    if(!replyLocal(text, "network")){ NOTE = t.err; draw() }
  });
}

function sendLegacy(text, auto){
  var t = T();
  text = String(text || "").trim().slice(0, MAXLEN);
  if(!text || BUSY) return;
  if(MSGS.length >= TURNS){ NOTE = t.full; draw(); return }

  /* **שני מוחות, סדר אחד — 16.9.2026, בהוראת הבעלים.** יש רשת
     ויש מכסה — השאלה הולכת ל-`API` (Gemini Flash בשכבה החינמית,
     דרך ה-Worker). אין שרת, אין רשת, או שהמכסה היומית של המכשיר
     נגמרה — עונים מ-`josh-local.js`, **בלי שגיאה ללומד**. זה
     התנאי השלישי בסעיף 1 של `CLAUDE.md`: ״חריגה מהמכסה נופלת
     בחזרה למוח המקומי, בלי שגיאה ללומד״. `navigator.onLine`
     אינו אמין לחיוב (״מחובר״ לרשת בלי אינטרנט), ולכן הוא רק
     מקצר כשהוא **שלילי**; כל כישלון אחר נתפס ב-`catch` למטה. */
  if(!API || navigator.onLine === false || left() <= 0){
    stopReveal();
    MSGS.push({ role:"user", text:text });
    if(EL) EL.inp.value = "";
    NOTE = ""; draw();
    /* השהיה קצרה כדי שהפאנל יספיק לצייר את תור הלומד לפני
       התשובה. בלעדיה שתי השורות מופיעות יחד וזה נראה כמו טופס. */
    BUSY = true; draw();
    var why = !API ? "" : navigator.onLine === false ? "offline" : "quota";
    setTimeout(function(){ if(!replyLocal(text, why)){ BUSY = false; NOTE = t.err; draw() } }, 420);
    return;
  }

  stopReveal();
  MSGS.push({ role:"user", text:text });
  if(EL) EL.inp.value = "";
  BUSY = true; NOTE = ""; draw();
  bump();

  var q = CFG.q ? CFG.q() : null;
  /* O-72 — אותו timeout כמו fetchWithTimeout ב-barak-core.js:227:
     8 שניות ואז AbortError, שנופל ל-catch למטה ומשם למוח המקומי.
     בלי זה ספק שתולה השאיר את הפאנל ב-״רגע, חושב…״ לנצח — נמדד
     18.9.2026: 13,329 ms ועדיין BUSY. */
  var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
  var timer = setTimeout(function(){ if(ctl) ctl.abort() }, LEGACY_TIMEOUT_MS);
  fetch(API, {
    signal: ctl ? ctl.signal : undefined,
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
    clearTimeout(timer);
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
    clearTimeout(timer);
    BUSY = false;
    var why = String(err && err.message);
    /* **הנפילה למוח המקומי.** רשת שנפלה, 429 של הלומד או של
       השירות, 500/503 של הקמה, 502 מהספק, גוף ריק — לכולם אותה
       תשובה: עונים מהמכשיר, והלומד אינו רואה שגיאה. הסיבה נשארת
       בקונסולה (נכתבה למעלה, לפי הסטטוס) למי שמקים את השירות.
       ״מספיק להיום״ ו״לא הצלחתי להתחבר״ מוצגים רק כשגם המוח
       המקומי אינו קיים — כלומר בדף שלא טען את `josh-local.js`. */
    /* שגיאת רשת של הדפדפן נושאת הודעה חופשית (״Failed to fetch״);
       ללומד מציגים מילה אחת קבועה. */
    if(!/^(limit|limitAll|setup|http|empty)$/.test(why)) why = "network";
    /* שגיאת רשת של הדפדפן נושאת הודעה חופשית (״Failed to fetch״);
       ללומד מציגים מילה אחת קבועה. */
    if(!/^(limit|limitAll|setup|http|empty)$/.test(why)) why = "network";
    if(replyLocal(text, why)){ NOTE = ""; draw(); return }
    /* ההודעה הפותחת נכשלה — מסירים אותה, אחרת השיחה מתחילה
       מתור של הילד שהוא בעצם שלנו */
    if(auto) MSGS = [];
    NOTE = why === "limitAll" ? t.limitAll :
           why === "limit" ? t.limit : why === "setup" ? t.setup : t.err;
    draw();
  });
}

/* ================= ״גרסה פשוטה״ — reader, 17.9.2026 =================
   הלומד הדביק טקסט — הודעה מבית הספר, פרק, מאמר — ורוצה אותו קצר
   ופשוט בשפת הממשק. הקהל כאן הוא דיסלקציה ועולים חדשים, ומסמך
   ארוך בעברית הוא מכשול לפני שהלמידה בכלל התחילה.

   **אותו פאנל, אותה שיחה, אותו סדר מוחות.** התשובה נכנסת ל-MSGS
   כמו כל תשובה: החשיפה ההדרגתית, ההקראה בארבעת המנגנונים, בורר
   הקול והסימון ״מהמכשיר, לא מהשרת״ — הכול כבר כאן, ואין שכבת
   תצוגה שנייה. `BARAK.ask` במצב `simplify` שולח את הטקסט בשדה
   `doc` (עד `BARAK.DOC_MAX`), ובלי שרת — `JOSHLOCAL.simplify`
   מחלק למשפטים ואומר ללומד שזה חילוק ולא קיצור.

   **הטקסט יוצא מהמכשיר רק בלחיצה על הכפתור הזה, ורק אז.** השיחה
   הרגילה של reader שולחת את המשפט הנוכחי בלבד, וזה נשאר כך; מה
   שנשלח כאן כתוב ב-`legal/terms.js`, ״עזרה מהמורה״.

   `simplify(doc)` מחזירה true אם הבקשה יצאה לדרך. טקסט ריק פותח
   את הפאנל עם ההסבר במקום שגיאה בדף — מקום אחד להודעות. */
function simplify(doc){
  if(!BRAIN || !CFG) return false;
  var t = T();
  doc = String(doc || "").replace(/\r\n?/g, "\n").trim();
  if(!EL || !EL.ov.classList.contains("on")) open(true);
  if(!doc){ NOTE = t.simplifyEmpty; draw(); return false }
  if(typeof BARAK === "undefined" || !BARAK.ready()) return false;
  if(BUSY) return false;
  if(MSGS.length >= TURNS){ NOTE = t.full; draw(); return false }
  stopReveal();
  MSGS.push({ role:"user", text:t.simplifyAsk });
  BUSY = true; NOTE = "";
  var max = BARAK.DOC_MAX || 3000;
  if(doc.length > max) NOTE = t.simplifyCut.replace("{n}", String(max));
  draw();
  var tryServer = !!API && navigator.onLine !== false && left() > 0;
  if(tryServer) bump();
  BARAK.ask(t.simplifyAsk, {
    api: API, lang: lang(), target: null, sign: null, q: null,
    history: [], mode: "simplify", doc: doc.slice(0, max),
    online: tryServer,
    why: !API ? "" : navigator.onLine === false ? "offline" : "quota"
  }).then(function(res){
    BUSY = false;
    if(!res || !res.say){ NOTE = t.err; draw(); return }
    MSGS.push({ role:"assistant", text:res.say, local: (API && res.source !== "ai") ? (res.why || "local") : "" });
    startReveal(MSGS.length - 1);
    draw(); focus();
  }, function(){
    BUSY = false; NOTE = t.err; draw();
  });
  return true;
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
  /* ״גרסה פשוטה״ — reader בלבד היום. התווית מכאן, מאותה סיבה
     כמו `label`. */
  simplify: simplify,
  simplifyLabel: function(){ return T().simplifyBtn },
  /* טקסט חלק מתוך HTML של תרגיל, עם חזקות שנשמרות — המתאמים של
     משפחת המתמטיקה קוראים לזה במקום עוזר מקומי. ראו `plain`. */
  plain: plain,
  /* לבדיקות בלבד — אינם נקראים מהאפליקציות */
  _state: function(){ return { api:API, msgs:MSGS, playing:PLAYING, lang:lang(), dir:DIR[lang()] } },
  /* **מאפס את השיחה, ורק לבדיקות.** `barak-browser.js` מריץ שבעה
     תרחישים על אותה שאלה, וכל אחד מוסיף שני תורים — כלומר התרחיש
     השביעי נבלם ב-`TURNS` ולא רץ כלל, והבדיקה נראתה עוברת בשישה
     ונפלה בשביעי על הודעת ״דיברנו על זה הרבה״. זה קרה על הרנר
     ולא מקומית, מפני שהסף נחצה בדיוק שם (ריצה 617, `english`).
     לומד אינו קורא לזה: `TURNS` הוא בלם אמיתי ונשאר כפי שהוא. */
  _clear: function(){ stopReveal(); MSGS = []; NOTE = ""; if(EL) draw(); return true },
  /* בחירת הקול חשופה כדי שאפשר יהיה לבדוק אותה מול רשימת קולות
     מזויפת. בלי זה הכלל ״voiceUsable ראשון, המגדר אחריו״ אינו
     ניתן לבדיקה בלי דפדפן עם קולות מותקנים — ואין כזה כאן. */
  _voice: function(code){ return pickVoice(code || "he-IL") }
};
})(window);
