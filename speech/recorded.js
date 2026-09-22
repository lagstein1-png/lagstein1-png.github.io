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
    loaded: false,
    el: null,          /* אלמנט שמע אחד, קבוע */
    playing: null,     /* המזהה שמנגן עכשיו, כדי ש-onEnd של ניגון ישן לא ייכנס */
    gen: 0
  };

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
        var langs = (m && m.langs) || {};
        Object.keys(langs).forEach(function (lg) {
          var set = {};
          (langs[lg].ids || []).forEach(function (x) { set[x] = 1; });
          R.have[lg] = set;
        });
        R.loaded = true;
        return true;
      }).catch(function () { R.loaded = true; return false; });
    } catch (e) { R.loaded = true; return Promise.resolve(false); }
  }

  function base(lang) { return String(lang || "he").replace("_", "-").split("-")[0].toLowerCase(); }

  function has(text, lang) {
    var set = R.have[base(lang)];
    return !!(set && set[id(text)]);
  }

  /* מנגן אם יש קובץ. מחזיר true כשהניגון יצא לדרך, false כשאין
     קובץ — ואז הקורא ממשיך לקול המכשיר. כישלון *אחרי* true (קובץ
     פגום, רשת) מגיע ב-onError, והקורא נופל לקול המכשיר משם. */
  function play(text, lang, opts) {
    opts = opts || {};
    if (!has(text, lang)) return false;
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
      a.src = R.base + "/" + base(lang) + "/" + fid + ".mp3";
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

  g.RECORDED = { id: id, setup: setup, has: has, play: play, stop: stop,
                 isPlaying: function () { return !!R.playing; }, _state: R };

  /* המודול מתחיל בעצמו: הקבצים יושבים תמיד ב-`audio/` של האפליקציה,
     ולכן אין מה לחווט. הקובץ הזה נטען בסוף הדף — אחרי הסקריפט של
     האפליקציה — ולכן קריאת setup מתוך האפליקציה הייתה רצה כש-RECORDED
     עוד לא קיים. הבדיקה בדפדפן תפסה את זה ביום שנכתבה. */
  setup({ base: "audio" });
})(typeof window !== "undefined" ? window : globalThis);
