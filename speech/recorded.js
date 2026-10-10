/* ==================================================================
   השכבה המוקלטת — הועתקה מ״תאוריה מדברת״, 21.9.2026.

   **הוראת הבעלים:** ״תעתיק את המנוע, כבר שילמנו, ותיישם כמנוע
   שממנו לוקחים בעתיד — זו הייתה הכוונה מהתחלה.״

   **מה זה.** ב״תאוריה מדברת״ הלומד אינו שומע את קול המכשיר: הוא
   שומע קובץ MP3 שהוקלט מראש (ג׳מיני, קול Kore) לכל משפט במאגר —
   6,823 קבצים — וקול המכשיר נכנס רק כשקובץ חסר. זה ההבדל שהבעלים
   שמע (`FINDINGS.md`, `O-83`): לא מילון ולא כוונון, אלא הקלטות.

   **איך זה עובד, בשלושה משפטים.** מזהה הקובץ הוא גיבוב של הטקסט
   המוצג (אותה פונקציה בדיוק כמו שם — `audioId`), ולכן עריכת ניסוח
   מייצרת מזהה חדש ולעולם לא מנוגן קובץ ישן על טקסט שהשתנה. האפליקציה
   טוענת פעם אחת את `audio/manifest.json` — רשימת המזהים שיש להם
   קובץ — ושואלת אותו לפני כל הקראה. יש קובץ: מנגנים אותו; אין:
   `play` מחזיר false והאפליקציה ממשיכה לקול המכשיר כאילו השכבה
   הזאת לא קיימת.

   **הקבצים נוצרים ב-`.claude/qa/record.js`** על רנר של GitHub עם
   המפתח שב-Secrets, לעולם לא בדפדפן: אין מפתח בדף, אין תשלום לכל
   משפט של כל לומד, וזה עובד אופליין. זה בדיוק מה שהריפו הנפרד
   למד כשמחק את השכבה החיה שלו (`9eb4f2f3` שם).

   **מה זה אינו.** אין כאן בחירת קול, אין ניקוד ואין מילון —
   ההגייה של ההקלטה נקבעה בזמן ההקלטה, מהטקסט שעבר ב-`he-speech.js`.
   ההדגשה מילה־במילה אינה אפשרית על קובץ (אין `onboundary`), וזה
   נכון גם שם.

   שימוש באפליקציה:
     RECORDED.setup({ base: "audio" });          // פעם אחת, בטעינה
     if(RECORDED.play(text, "he", { rate: state.rate,
          onEnd: fn, onError: fn })) return;     // יש קובץ — מנגן
     speakDevice(...);                            // אין — קול המכשיר
     RECORDED.stop();                             // בעצירה
   ומאגר משותף (לימור): RECORDED.load("/tutor/audio") פעם אחת, ואז
     RECORDED.play(text, "he", { base: "/tutor/audio", … }).
   ================================================================== */
(function (g) {
  "use strict";

  /* **חייב להיות זהה ל-audioId שבריפו הנפרד ול-record.js** — אחרת
     הקבצים שנוצרו לא יימצאו. */
  function id(text) {
    var s = String(text == null ? "" : text).trim().replace(/\s+/g, " ");
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57, i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  var R = {
    base: "audio",
    have: {},          /* lang → Set של מזהים שיש להם קובץ */
    extra: {},         /* תיקייה משותפת → { have, ready } — ראו load */
    loaded: false,
    el: null,          /* אלמנט שמע אחד, קבוע */
    playing: null,     /* המזהה שמנגן עכשיו, כדי ש-onEnd של ניגון ישן לא ייכנס */
    gen: 0
  };

  /* ===== מקור קובצי הקול — 10.10.2026, הכרעת הבעלים =====
     22,406 קובצי ה-MP3 שקלו 984MB (נמדד ב-du), והאתר המפורסם חצה את
     מגבלת ה-1GB של GitHub Pages — O-191. הקבצים עוברים לריפואים
     נפרדים, וכל אחד מהם הוא אתר Pages משלו עם מגבלה משלו.

     **שניים ולא אחד, וזה נמדד ולא שוער.** `record.js --plan` אומר
     שחסרות 5,029 הקלטות, ובדיסק קובץ שוקל 44.9KB בממוצע — כלומר
     המאגר השלם הוא 1,143MB, מעל 1,024. שני דליים מאוזנים: 572MB
     ו-571MB כשיושלמו, עם כ-450MB מרווח לכל אחד.
     `audio-size.js` מפיל כשדלי חוצה את התקרה שלו.

     **המניפסט נשאר כאן, ורק ה-MP3 עוברים.** הוא קטן (768KB
     לארבעים האפליקציות), הוא נטען ב-`cache: "no-cache"`, והשארתו
     במקור של הדף חוסכת CORS בשאלה ״יש קובץ?״ — זו השאלה שנשאלת
     לפני כל הקראה, ותשובה שגויה לה משתיקה את הלומד.

     **ערך ריק = הקבצים מקומיים, בדיוק כמו עד 10.10.2026.** שתי
     המחרוזות האלה הן המתג היחיד של כל המעבר. */
  var HOST_1 = "";   /* lagstein1-png/bekol-audio  */
  var HOST_2 = "";   /* lagstein1-png/bekol-audio2 */
  var ON_2 = { civics: 1, geography: 1, tanakh: 1, biology: 1, "science-mid": 1,
               "geography-elem": 1, english: 1, "math-elem": 1, "tanakh-elem": 1,
               "culture-elem": 1, hebrew: 1, "hebrew-lit": 1, tutor: 1,
               "english-elem": 1 };

  /* "audio" יחסי לדף, ולכן באפליקציה הוא `/lomda/audio`. נתיב
     שמתחיל בלוכסן (`/tutor/audio` — המאגר המשותף של לימור) נשאר
     כפי שהוא. */
  function abs(dir) {
    dir = String(dir).replace(/\/+$/, "");
    if (dir.charAt(0) === "/") return dir;
    /* **בלי `location` הנתיב נשאר יחסי, כמו עד 10.10.2026.** אין דרך
       לדעת באיזו אפליקציה אנחנו, ולכן גם אין דרך לבנות כתובת מרוחקת
       — והיחסי הוא התשובה הנכונה ולא ברירת מחדל עצלה. בלי השורה הזאת
       `abs` זרקה, ה-`try` סביב `a.src` תפס, וכל קליפ היה נופל לקול
       המכשיר בשקט. ‏`recorded.js` תפס את זה ביום שהמעבר נכתב. */
    var p = (typeof location !== "undefined" && location && location.pathname) || "";
    if (!p) return dir;
    return p.slice(0, p.lastIndexOf("/") + 1) + dir;
  }
  function hostOf(dir) {
    var seg = abs(dir).split("/").filter(function (x) { return x; })[0] || "";
    return ON_2[seg] ? HOST_2 : HOST_1;
  }
  /* הכתובת המלאה של קליפ. זה המקום **היחיד** באתר שבונה אותה. */
  function clip(dir, lg, fid) {
    var path = abs(dir) + "/" + lg + "/" + fid + ".mp3";
    /* נתיב יחסי אינו ניתן לתלייה על מקור — `host + "audio/…"` היה
       יוצא בלי לוכסן. אין לוכסן פותח, אין מקור. */
    var h = path.charAt(0) === "/" ? hostOf(dir) : "";
    return h ? h.replace(/\/+$/, "") + path : path;
  }

  var SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

  /* ב-iOS ההיתר להשמיע ניתן לאלמנט שקיבל play() בתוך מגע אמיתי,
     ולא לדף. אלמנט חדש שנוצר אחרי fetch לא יקבל היתר לעולם. לכן
     אלמנט אחד, משוחרר במגע הראשון, ואחר כך מחליפים לו src. */
  function el() {
    if (!R.el) { try { R.el = new Audio(); } catch (e) { R.el = null; } }
    return R.el;
  }
  function unlock() {
    var a = el(); if (!a) return;
    try {
      a.src = SILENT_WAV;
      var pr = a.play();
      if (pr && pr.then) pr.then(function () { try { a.pause(); a.currentTime = 0; } catch (e) {} })
                           .catch(function () {});
    } catch (e) {}
  }
  try { document.addEventListener("pointerdown", unlock, { once: true }); } catch (e) {}

  /* טוען את רשימת המזהים. מניפסט ריק יושב בכל אפליקציה מראש — 404
     נרשם בקונסולה כשגיאה, ובדיקות הדפדפן סופרות אותה. אין קובץ בכל
     זאת — השכבה כבויה, בשקט. */
  function sets(m) {
    var out = {}, langs = (m && m.langs) || {};
    Object.keys(langs).forEach(function (lg) {
      var set = {};
      (langs[lg].ids || []).forEach(function (x) { set[x] = 1; });
      out[lg] = set;
    });
    return out;
  }

  function setup(opts) {
    opts = opts || {};
    if (opts.base) R.base = String(opts.base).replace(/\/+$/, "");
    R.loaded = false; R.have = {};
    var url = R.base + "/manifest.json";
    try {
      return fetch(url, { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error("no manifest");
        return r.json();
      }).then(function (m) {
        R.have = sets(m);
        R.loaded = true;
        return true;
      }).catch(function () { R.loaded = true; return false; });
    } catch (e) { R.loaded = true; return Promise.resolve(false); }
  }

  /* **מאגר נוסף, בתיקייה משותפת — לימור, 5.10.2026.** המשפטים הקבועים
     של המוח המקומי שלה (`/tutor/josh-local.js`) זהים בכל האפליקציות,
     ולכן הם מוקלטים פעם אחת ב-`/tutor/audio/` ולא בכל `audio/`. אותו
     אלמנט שמע — זה ששוחרר במגע — ומניפסט משלו, שנטען פעם אחת. */
  function load(dir) {
    dir = String(dir).replace(/\/+$/, "");
    if (R.extra[dir]) return R.extra[dir].ready;
    var e = R.extra[dir] = { have: {} };
    try {
      e.ready = fetch(dir + "/manifest.json", { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error("no manifest");
        return r.json();
      }).then(function (m) { e.have = sets(m); return true; })
        .catch(function () { return false; });
    } catch (x) { e.ready = Promise.resolve(false); }
    return e.ready;
  }

  function base(lang) { return String(lang || "he").replace("_", "-").split("-")[0].toLowerCase(); }

  function has(text, lang, dir) {
    var all = dir ? (R.extra[String(dir).replace(/\/+$/, "")] || {}).have || {} : R.have;
    var set = all[base(lang)];
    return !!(set && set[id(text)]);
  }

  /* מנגן אם יש קובץ. מחזיר true כשהניגון יצא לדרך, false כשאין
     קובץ — ואז הקורא ממשיך לקול המכשיר. כישלון *אחרי* true (קובץ
     פגום, רשת) מגיע ב-onError, והקורא נופל לקול המכשיר משם. */
  function play(text, lang, opts) {
    opts = opts || {};
    if (!has(text, lang, opts.base)) return false;
    var a = el(); if (!a) return false;
    var fid = id(text);
    /* stop קודם, ורק אז הדור: stop מקדם את הדור בעצמו, ודור שנלקח
       לפניו היה ישן עוד לפני שהניגון התחיל — onended לא היה נכנס
       לעולם. הבדיקה תפסה את זה ביום שנכתבה. */
    stop();
    var my = ++R.gen;
    R.playing = fid;
    a.onended = function () { if (my !== R.gen) return; R.playing = null; if (opts.onEnd) opts.onEnd(); };
    a.onerror = function () { if (my !== R.gen) return; R.playing = null; if (opts.onError) opts.onError(); };
    try {
      a.src = clip(opts.base || R.base, base(lang), fid);
      /* ההקלטה בקצב טבעי; הכפלה בבחירת הלומד בלבד, בלי הבסיס
         שהאפליקציה נותנת לקול המכשיר. */
      a.playbackRate = Math.max(0.5, Math.min(2, Number(opts.rate) || 1));
      var pr = a.play();
      if (pr && pr.catch) pr.catch(function () { if (my !== R.gen) return; R.playing = null; if (opts.onError) opts.onError(); });
    } catch (e) {
      R.playing = null;
      if (opts.onError) opts.onError();
      return true;   /* הניסיון היה, והכישלון דווח — הקורא לא יכפיל */
    }
    return true;
  }

  function stop() {
    R.gen++;
    R.playing = null;
    var a = R.el; if (!a) return;
    try { a.onended = null; a.onerror = null; a.pause(); } catch (e) {}
  }

  g.RECORDED = { id: id, setup: setup, load: load, has: has, play: play, stop: stop,
                 clip: clip, isPlaying: function () { return !!R.playing; }, _state: R };

  /* המודול מתחיל בעצמו: הקבצים יושבים תמיד ב-`audio/` של האפליקציה,
     ולכן אין מה לחווט. הקובץ הזה נטען בסוף הדף — אחרי הסקריפט של
     האפליקציה — ולכן קריאת setup מתוך האפליקציה הייתה רצה כש-RECORDED
     עוד לא קיים. הבדיקה בדפדפן תפסה את זה ביום שנכתבה. */
  setup({ base: "audio" });
})(typeof window !== "undefined" ? window : globalThis);
