/* =====================================================================
   806 — מנוע ההקראה. שלב 2.

   Web Speech API בלבד. אין שירות ענן, אין מפתח, אין בקשה לרשת —
   ולכן ההקראה עובדת גם אופליין וגם בטיסה, ואינה עולה דבר.

   ארבע תקלות שכבר נלמדו ביוקר באפליקציות האחרות בריפו, וכולן
   מטופלות כאן במפורש:

   1. הקולות נטענים אסינכרונית. מי שמקריא לפני שהרשימה הגיעה מקבל
      את ברירת המחדל של הדפדפן — לרוב קול אנגלי שמקריא עברית.
      `voiceschanged` לבדו אינו מספיק: ספארי לא תמיד יורה אותו.
      לכן גם דגימה, וגם תקרת זמן — יש מכשירים שמחזירים רשימה ריקה
      לצמיתות ומדברים מצוין, ועדיף לדבר בקול ברירת מחדל מלשתוק.
   2. אמירה ארוכה נבלעת. מנועי מכשיר מאיצים ובולעים סופי מילים
      אחרי כמאה תווים, ולכן הטקסט נשלח במקטעים קצרים.
   3. פיסוק בין שתי ספרות אינו מקום לחתוך בו. בלי הבדיקה הזאת
      "3,500" נשבר והמנוע קורא "שלוש, חמש מאות".
   4. כרום עוצר הקראה ארוכה אחרי כחמש־עשרה שניות. פינג של
      pause/resume כל כמה שניות מחזיק אותה.

   ולכלל אחד של האפליקציה הזאת: **לעולם לא מקריאים LaTeX גולמי.**
   מי שקורא נוסחה שולח לכאן את השדה `speech`, ואם אין כזה — שותק.
   תלמיד ששומע "backslash frac" מפסיק להקשיב, וזו בדיוק האוכלוסייה
   שהאפליקציה נבנתה בשבילה.
   ===================================================================== */
(function () {
  "use strict";

  var LANG = "he-IL";
  /* הקצב שנשלח למנוע הוא בדיוק מה שנבחר בבורר. באפליקציות האחיות
     בריפו נמצא שמנועי מכשיר בעברית רצים מהר מדי ו"רגיל" שם הוא
     0.82 — אם יתברר שגם כאן, זה השינוי: שורה אחת. */
  var RATE_BASE = 1;
  var SEG_MAX = 90;      /* תווים לאמירה אחת */
  var SEG_GAP = 240;     /* מילישניות בין אמירות — נשימה, לא גמגום */
  var KEEPALIVE = 4000;  /* פינג נגד עצירת כרום */

  var api = {
    rate: 1,
    speaking: false,
    tag: null,        /* מי ביקש את ההקראה — כדי שה-UI ידע איזה כפתור פעיל */
    onstate: null        /* נקרא בכל שינוי מצב, כדי שה-UI יתעדכן */
  };

  function supported() {
    try { return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window; }
    catch (e) { return false; }
  }
  function allVoices() {
    try { return (window.speechSynthesis.getVoices() || []); } catch (e) { return []; }
  }

  /* --- המתנה לרשימת הקולות ------------------------------------- */
  var voicesP = null;
  function voicesReady() {
    if (voicesP) return voicesP;
    voicesP = new Promise(function (done) {
      if (!supported()) { done(); return; }
      if (allVoices().length) { done(); return; }
      var poll = null, cap = null, fired = false;
      function finish() {
        if (fired) return;
        fired = true;
        clearInterval(poll); clearTimeout(cap);
        try { speechSynthesis.removeEventListener("voiceschanged", finish); } catch (e) {}
        done();
      }
      try { speechSynthesis.addEventListener("voiceschanged", finish); } catch (e) {}
      poll = setInterval(function () { if (allVoices().length) finish(); }, 120);
      cap = setTimeout(finish, 4000);
    });
    return voicesP;
  }

  /* --- בחירת הקול העברי -----------------------------------------
     קול מותג (גוגל, מיקרוסופט, אפל) נשמע אחרת לגמרי מ-espeak,
     והפער הזה גדול יותר מכל הבדל אחר במסך הזה. */
  function hebrewVoices() {
    return allVoices().filter(function (v) {
      return /^he/i.test(String(v.lang || "").replace("_", "-"));
    });
  }
  function bestVoice() {
    var pool = hebrewVoices();
    if (!pool.length) return null;
    function score(v) {
      var s = 0, n = ((v.name || "") + " " + (v.lang || "")).toLowerCase();
      if (String(v.lang || "").replace("_", "-").toLowerCase() === LANG.toLowerCase()) s += 12;
      if (/\b(google|microsoft|apple)\b/.test(n)) s += 30;
      if (/natural|neural|enhanced|premium|siri/.test(n)) s += 22;
      if (/espeak|compact|pico/.test(n)) s -= 40;
      if (v.localService) s += 6;   /* עובד גם בלי רשת */
      if (v.default) s += 4;
      return s;
    }
    return pool.slice().sort(function (a, b) { return score(b) - score(a); })[0];
  }
  api.hasHebrewVoice = function () { return hebrewVoices().length > 0; };
  api.voiceName = function () { var v = bestVoice(); return v ? v.name : ""; };

  /* --- פיצול לאמירות --------------------------------------------
     שתי רמות: משפט, שהוא יחידת ההדגשה, ומקטע, שהוא יחידת האמירה.
     משפט ארוך נאמר בכמה מקטעים ונשאר מודגש לכל אורכם. */
  function insideNumber(str, i) {
    return i > 0 && i + 1 < str.length &&
           /[0-9]/.test(str[i - 1]) && /[0-9]/.test(str[i + 1]);
  }
  function sentences(text) {
    var out = [], from = 0, i, j;
    for (i = 0; i < text.length; i++) {
      if (".!?".indexOf(text[i]) < 0) continue;
      if (insideNumber(text, i)) continue;
      j = i + 1;
      while (j < text.length && /\s/.test(text[j])) j++;
      out.push(text.slice(from, j));
      from = j; i = j - 1;
    }
    if (from < text.length) out.push(text.slice(from));
    return out.filter(function (s) { return s.trim(); });
  }
  function chunks(sentence) {
    if (sentence.length <= SEG_MAX) return [sentence];
    var out = [], rest = sentence;
    while (rest.length > SEG_MAX) {
      var cut = rest.lastIndexOf(",", SEG_MAX);
      while (cut > 0 && insideNumber(rest, cut)) cut = rest.lastIndexOf(",", cut - 1);
      if (cut < SEG_MAX * 0.4) cut = rest.lastIndexOf(" ", SEG_MAX);
      if (cut <= 0) break;
      out.push(rest.slice(0, cut + 1));
      rest = rest.slice(cut + 1);
    }
    if (rest.trim()) out.push(rest);
    /* מקטע זעיר עם רבע שנייה אחריו נשמע כמו גמגום — מאחדים אחורה */
    for (var k = out.length - 1; k > 0; k--) {
      if (out[k].trim().length < 12) { out[k - 1] += out[k]; out.splice(k, 1); }
    }
    return out.length ? out : [sentence];
  }

  /* --- מצב ההשמעה ------------------------------------------------ */
  var queue = [];     /* [{text, unit, sent}] — מקטע, היחידה והמשפט שבו */
  var qi = 0;
  var current = null;
  var keep = null;
  var paused = false;
  var held = null;    /* הצעד שממתין להמשך, כשהמנוע התעלם מ-pause */
  var token = 0;      /* עולה בכל עצירה — אמירה ישנה שמסתיימת מאוחר לא תמשיך */

  function clearMarks() {
    var els = document.querySelectorAll(".is-reading,.sent.on");
    Array.prototype.forEach.call(els, function (e) {
      e.classList.remove("is-reading"); e.classList.remove("on");
    });
  }
  function mark(item) {
    clearMarks();
    if (!item || !item.unit || !item.unit.el) return;
    var el = item.unit.el;
    var spans = el.querySelectorAll(".sent");
    /* יש משפטים — מסמנים את המשפט. אין — מסמנים את היחידה כולה,
       וזה המקרה של תיבת הנוסחה, שאין בה טקסט לחלק. */
    if (spans.length && item.sent < spans.length) spans[item.sent].classList.add("on");
    else el.classList.add("is-reading");
  }
  function fire() { if (typeof api.onstate === "function") api.onstate(api.speaking); }

  function stop() {
    token++;
    queue = []; qi = 0; current = null; api.tag = null;
    paused = false; held = null;
    if (keep) { clearInterval(keep); keep = null; }
    try { speechSynthesis.cancel(); } catch (e) {}
    clearMarks();
    if (api.speaking) { api.speaking = false; fire(); }
  }
  api.stop = stop;

  function step(my) {
    if (my !== token) return;
    if (qi >= queue.length) { stop(); return; }
    var item = queue[qi++];
    mark(item);
    var u = new SpeechSynthesisUtterance(item.text);
    var v = bestVoice();
    if (v) u.voice = v;
    u.lang = v ? v.lang : LANG;
    u.rate = Math.max(0.5, Math.min(2, RATE_BASE * api.rate));
    u.pitch = 1;
    u.onend = function () {
      if (my !== token) return;
      /* אנדרואיד מתעלם מ-pause. לכן גם דגל משלנו: מנוע שמכבד
         יישתק מיד, ומי שלא — יסיים את המקטע הנוכחי ויעצור כאן. */
      if (paused) { held = function () { step(my); }; return; }
      setTimeout(function () { if (!paused) step(my); else held = function () { step(my); }; }, SEG_GAP);
    };
    /* שגיאה באמצע רצף אינה סיבה לשתוק עד הסוף: ממשיכים למקטע הבא,
       ורק אם כולם נכשלו המשתמש רואה שדבר לא קרה. */
    u.onerror = function () {
      if (my !== token) return;
      setTimeout(function () { step(my); }, 60);
    };
    current = u;
    try { speechSynthesis.speak(u); } catch (e) { stop(); }
  }

  /* --- ההפעלה מבחוץ ---------------------------------------------
     units = [{ text, el }] — טקסט לומר, ואלמנט להדגיש בזמן שהוא
     נאמר. יחידה בלי טקסט נזרקת בשקט: כך "הקריאו את הסעיף" עובד
     גם כשאין לו נוסחה, בלי שהקורא צריך לדעת. */
  api.speak = function (units, tag) {
    if (!supported()) return;
    stop();
    api.tag = tag || null;
    var list = (units || []).filter(function (u) { return u && String(u.text || "").trim(); });
    if (!list.length) return;
    var my = ++token;
    voicesReady().then(function () {
      if (my !== token) return;
      queue = []; qi = 0;
      list.forEach(function (u) {
        var ss = sentences(String(u.text));
        ss.forEach(function (s, si) {
          chunks(s).forEach(function (c) { queue.push({ text: c, unit: u, sent: si }); });
        });
      });
      api.speaking = true; fire();
      if (keep) clearInterval(keep);
      keep = setInterval(function () {
        /* כרום עוצר הקראה ארוכה. resume על תור פעיל אינו מזיק.
           אבל כשהמשתמש השהה בעצמו — הפינג הזה היה מחזיר את הקול
           תוך ארבע שניות, כלומר מבטל את הכפתור שהוא הרגע לחץ. */
        if (paused) return;
        try { if (speechSynthesis.speaking) { speechSynthesis.pause(); speechSynthesis.resume(); } }
        catch (e) {}
      }, KEEPALIVE);
      step(my);
    });
  };

  /* --- השהיה וניווט במשפטים -------------------------------------
     הקהל של האפליקציה הזאת מאבד את השאלה באמצע. "עצרו" לבדו מחייב
     אותו להתחיל את השאלה מהתחלה, וזה בדיוק מה שגרם לו לוותר. */
  api.paused = function () { return paused; };
  api.pause = function () {
    if (!api.speaking || paused) return;
    paused = true;
    try { speechSynthesis.pause(); } catch (e) {}
    fire();
  };
  api.resume = function () {
    if (!api.speaking || !paused) return;
    paused = false;
    try { speechSynthesis.resume(); } catch (e) {}
    if (held) { var f = held; held = null; f(); }
    fire();
  };
  /* המקטע הראשון של המשפט שהמקטע במקום `i` שייך אליו */
  function sentStart(i) {
    var it = queue[i];
    if (!it) return 0;
    var k = i;
    while (k > 0 && queue[k - 1].unit === it.unit && queue[k - 1].sent === it.sent) k--;
    return k;
  }
  function jump(i) {
    if (!api.speaking) return;
    if (i < 0) i = 0;
    if (i >= queue.length) { stop(); return; }
    var my = ++token;
    paused = false; held = null;
    try { speechSynthesis.cancel(); } catch (e) {}
    qi = i;
    fire();
    step(my);
  }
  /* "אחורה" מהמקטע הראשון של משפט חוזר למשפט הקודם; מאמצעו הוא
     חוזר לתחילת אותו משפט — כמו כל נגן, ובלי להסביר. */
  api.back = function () {
    var cur = sentStart(qi - 1);
    jump(qi - 1 > cur ? cur : sentStart(cur - 1));
  };
  api.fwd = function () {
    var i = qi;
    var it = queue[qi - 1];
    while (i < queue.length && it && queue[i].unit === it.unit && queue[i].sent === it.sent) i++;
    jump(i);
  };

  api.setRate = function (r) {
    r = Number(r) || 1;
    api.rate = r;
    /* שינוי קצב באמצע אמירה אינו משפיע על אמירה שכבר יצאה. עוצרים,
       כדי שלא ייווצר רושם שהבורר שבור. */
    if (api.speaking) stop();
  };
  api.available = supported;
  api.ready = voicesReady;
  /* מיוצא כדי שהמסך יעטוף בדיוק את אותם משפטים שהמנוע אומר.
     שני מפצלים נפרדים היו נפרדים ביום שמישהו יגע באחד מהם,
     וההדגשה הייתה מסמנת משפט אחד בזמן שנאמר אחר. */
  api.sentences = sentences;

  /* --- שחרור ההשמעה ב-iOS ---------------------------------------
     ספארי בנייד מתיר דיבור רק אחרי מגע. אמירה ריקה במגע הראשון
     פותחת את הערוץ, ומאותו רגע כפתור הקראה עובד כרגיל. */
  var unlocked = false;
  function unlock() {
    if (unlocked || !supported()) return;
    unlocked = true;
    try {
      var u = new SpeechSynthesisUtterance(" ");
      u.volume = 0; u.rate = 1;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  document.addEventListener("touchend", unlock, { once: true, passive: true });
  document.addEventListener("mousedown", unlock, { once: true });

  /* יציאה מהדף בזמן הקראה משאירה קול שממשיך לדבר מעל אפליקציה
     אחרת. עוצרים גם על הסתרה וגם על עזיבה. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
  });
  window.addEventListener("pagehide", stop);

  if (supported()) voicesReady();
  window.Speech = api;
})();
