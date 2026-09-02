/* ============================================================
   בגרות 806 — מנוע ההקראה
   ------------------------------------------------------------
   Web Speech API, בלי שום שירות חיצוני ובלי בקשת רשת אחת.

   שש מלכודות שכבר שולם עליהן במחיר מלא באפליקציות האחרות בריפו,
   וכתובות כאן כדי שלא ישולמו שוב:

   1. `getVoices()` מחזיר רשימה ריקה בקריאה הראשונה. `voiceschanged`
      לבדו אינו פתרון — ספארי לא תמיד יורה אותו — ולכן גם דגימה,
      וגם תקרת זמן: יש מכשירים שמחזירים רשימה ריקה לצמיתות
      ומדברים מצוין.
   2. **האמירה הראשונה חייבת לצאת בתוך המגע.** אמירה שנדחית עד
      שהרשימה תגיע נזרקת בשקט באנדרואיד ובספארי. לכן `speak` בוחר
      קול אם הרשימה כבר כאן, ואם לא — מדבר עם `u.lang` בלבד.
      ההמתנה לרשימה שמורה לבורר הקולות, שם היא במקומה.
   3. קוד השפה של עברית הוא `he` **וגם** `iw`. `iw` הוא הקוד הישן,
      ומכשירים אמיתיים עדיין מחזירים אותו.
   4. יש קולות בלי שדה `lang` כלל. סינון לפי `lang` בלבד הסתיר
      אותם, והאפליקציה הכריזה "אין קול עברי" על מכשיר שיש בו אחד.
      השם הוא הרמז היחיד שנשאר.
   5. כרום קוטע אמירה ארוכה באמצע. התשובה היא פירוק למקטעים
      קצרים ושרשור מ-`onend`, ולא טקסט אחד ארוך.
   6. `onboundary` אינו אמין בספארי ובאייפון. לכן ההדגשה כאן היא
      **ברמת המשפט** ונגזרת מ-`onend` של המקטע — היא עובדת בכל
      דפדפן, ולא רק בזה שיורה אירועי גבול.

   ומעל הכול הכלל של האפליקציה הזאת: **לנוסחה קוראים את `speech`,
   לעולם לא את ה-LaTeX.** זה נאכף במבנה ולא במשמעת: `collect()`
   לוקח מכל אלמנט שיש לו `data-speech` את הערך הזה ואינו יורד
   לתוכן שלו כלל. אלמנט הנוסחה נושא `data-speech`, ולכן ה-LaTeX
   פשוט לא נמצא בזרם הטקסט שמגיע למנוע.
   ============================================================ */
(function (g) {
  "use strict";

  var RATES = [
    { id: "slow",   label: "איטי", rate: 0.7 },
    { id: "normal", label: "רגיל", rate: 1.0 },
    { id: "fast",   label: "מהיר", rate: 1.3 }
  ];
  var SEG_MAX = 90;      /* אורך מקטע. מעבר לזה כרום קוטע. */
  var SEG_GAP = 200;     /* הפוגה בין מקטעים, במילישניות */
  var RATE_KEY = "bagrut806-rate";

  var HE = /^(he|iw)/i;
  var HE_NAME = /עברית|hebrew|ivrit/i;

  var state = { rate: "normal", node: null, gen: 0, err: "" };
  var listeners = [];
  var restore = null;    /* { node, html } — להחזרת ה-DOM אחרי הדגשה */

  function emit() { for (var i = 0; i < listeners.length; i++) try { listeners[i](); } catch (e) {} }
  function onChange(cb) { listeners.push(cb); }

  /* ---------- זמינות ---------- */
  function supported() {
    try { return !!(g.speechSynthesis && g.SpeechSynthesisUtterance); }
    catch (e) { return false; }
  }
  function ready() { return supported(); }
  function unavailableReason() {
    if (!supported()) return "הדפדפן הזה אינו תומך בהקראה קולית.";
    return "";
  }

  /* ---------- קולות ---------- */
  function allVoices() {
    try { return g.speechSynthesis.getVoices() || []; } catch (e) { return []; }
  }
  function hebrewVoices() {
    return allVoices().filter(function (v) {
      var l = String(v.lang || "");
      return l ? HE.test(l) : HE_NAME.test(v.name || "");
    });
  }
  function pickVoice() {
    var he = hebrewVoices();
    if (!he.length) return null;
    /* קול מקומי עדיף על קול רשת: הוא עובד אופליין ומגיב מיד. */
    for (var i = 0; i < he.length; i++) if (he[i].localService) return he[i];
    return he[0];
  }
  /* המתנה לרשימת הקולות — לבורר הקולות בלבד, לא לאמירה. */
  var voicesP = null;
  function voicesReady() {
    if (voicesP) return voicesP;
    voicesP = new Promise(function (done) {
      if (!supported() || allVoices().length) { done(); return; }
      var poll = null, cap = null, fired = false;
      function finish() {
        if (fired) return; fired = true;
        clearInterval(poll); clearTimeout(cap);
        try { g.speechSynthesis.removeEventListener("voiceschanged", finish); } catch (e) {}
        done();
      }
      try { g.speechSynthesis.addEventListener("voiceschanged", finish); } catch (e) {}
      poll = setInterval(function () { if (allVoices().length) finish(); }, 120);
      cap = setTimeout(finish, 4000);
    });
    return voicesP;
  }

  /* ---------- מהירות ---------- */
  function setRate(id) {
    for (var i = 0; i < RATES.length; i++) if (RATES[i].id === id) {
      state.rate = id;
      try { localStorage.setItem(RATE_KEY, id); } catch (e) {}
      emit(); return true;
    }
    return false;
  }
  function getRate() { return state.rate; }
  function rateValue() {
    for (var i = 0; i < RATES.length; i++) if (RATES[i].id === state.rate) return RATES[i].rate;
    return 1;
  }
  function rates() { return RATES.slice(); }

  /* ---------- פירוק לטקסט ולמשפטים ---------- */
  /* נקודה בין ספרות היא נקודה עשרונית ולא סוף משפט: "0.35" נחתך
     ל"אפס" ואחריו "שלושים וחמש", ונשמע כמו שני מספרים. */
  function insideNumber(s, i) {
    return /\d/.test(s.charAt(i - 1)) && /\d/.test(s.charAt(i + 1));
  }
  function sentences(text) {
    var out = [], from = 0, i, j;
    for (i = 0; i < text.length; i++) {
      if (".!?:;".indexOf(text.charAt(i)) < 0) continue;
      if (insideNumber(text, i)) continue;
      j = i + 1;
      while (j < text.length && /\s/.test(text.charAt(j))) j++;
      out.push(text.slice(from, j));
      from = j; i = j - 1;
    }
    if (from < text.length) out.push(text.slice(from));
    return out.filter(function (s) { return s.trim(); });
  }
  /* מקטוע לצורך המנוע בלבד. ההדגשה נשארת על המשפט כולו. */
  function chunks(text) {
    if (text.length <= SEG_MAX) return [text];
    var out = [], rest = text, cut;
    while (rest.length > SEG_MAX) {
      cut = rest.lastIndexOf(",", SEG_MAX);
      if (cut < SEG_MAX * 0.4) cut = rest.lastIndexOf(" ", SEG_MAX);
      if (cut <= 0) { cut = SEG_MAX - 1; }
      out.push(rest.slice(0, cut + 1));
      rest = rest.slice(cut + 1);
    }
    if (rest.trim()) out.push(rest);
    return out;
  }

  /* ---------- מה נקרא, ומה מודגש ----------
     עוברים על הבלוק ובונים יחידות הקראה. אלמנט עם `data-speech`
     תורם את הערך שלו ואיננו נפתח — כך ה-LaTeX שבתוכו אינו מגיע
     למנוע לעולם. כפתורים וכל דבר עם `data-nospeak` מדולגים. */
  function unitsFrom(node) {
    var units = [];
    (function walk(n) {
      for (var i = 0; i < n.childNodes.length; i++) {
        var c = n.childNodes[i];
        if (c.nodeType === 3) {
          if (String(c.nodeValue).trim()) units.push({ text: c.nodeValue, node: c, isText: true });
          continue;
        }
        if (c.nodeType !== 1) continue;
        if (c.hasAttribute("data-nospeak") || c.tagName === "BUTTON") continue;
        if (c.hasAttribute("data-speech")) {
          var sp = c.getAttribute("data-speech");
          if (sp && sp.trim()) units.push({ text: sp, node: c, isText: false });
          continue;                       /* לא יורדים פנימה — שם יושב ה-LaTeX */
        }
        walk(c);
      }
    })(node);
    return units;
  }

  /* עוטפים כל משפט ב-span כדי שאפשר יהיה להדגיש אותו. את ה-HTML
     המקורי שומרים ומחזירים בסוף — הכפתורים עובדים דרך delegation
     על document, ולכן החלפת innerHTML אינה מאבדת מאזינים. */
  function prepare(node) {
    var units = unitsFrom(node), spoken = [];
    restore = { node: node, html: node.innerHTML };
    units.forEach(function (u) {
      if (!u.isText) { spoken.push({ text: u.text, el: u.node }); return; }
      var parts = sentences(u.text);
      if (parts.length <= 1) {
        var one = document.createElement("span");
        one.className = "sn"; one.textContent = u.text;
        u.node.parentNode.replaceChild(one, u.node);
        spoken.push({ text: u.text, el: one });
        return;
      }
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        var sp = document.createElement("span");
        sp.className = "sn"; sp.textContent = p;
        frag.appendChild(sp);
        spoken.push({ text: p, el: sp });
      });
      u.node.parentNode.replaceChild(frag, u.node);
    });
    return spoken;
  }
  function unprepare() {
    if (!restore) return;
    try { restore.node.innerHTML = restore.html; } catch (e) {}
    restore = null;
  }
  function clearHl() {
    try {
      var on = document.querySelectorAll(".sn.now, .say.reading");
      for (var i = 0; i < on.length; i++) on[i].classList.remove("now", "reading");
    } catch (e) {}
  }

  /* ---------- הקראה ---------- */
  function stop() {
    state.gen++;
    state.node = null;
    try { g.speechSynthesis.cancel(); } catch (e) {}
    clearHl();
    unprepare();
    emit();
  }

  /* node — הבלוק שמקריאים ומדגישים בתוכו. חובה. */
  function speak(node) {
    if (!supported() || !node) return false;
    var same = (state.node === node);
    stop();
    if (same) return false;                 /* לחיצה שנייה על אותו כפתור עוצרת */

    var units = prepare(node);
    if (!units.length) { unprepare(); return false; }

    state.node = node; state.err = "";
    node.classList.add("reading");
    var my = ++state.gen;
    var voice = pickVoice();
    var lang = (voice && voice.lang) || "he-IL";
    var rate = rateValue();
    emit();

    /* האמירה הראשונה יוצאת כאן, בתוך הלחיצה. */
    (function sayUnit(k) {
      if (my !== state.gen) return;
      if (k >= units.length) { finish(my); return; }
      var u = units[k];
      try { if (u.el && u.el.classList) u.el.classList.add("now"); } catch (e) {}
      var segs = chunks(u.text);
      (function saySeg(j) {
        if (my !== state.gen) return;
        if (j >= segs.length) {
          try { if (u.el && u.el.classList) u.el.classList.remove("now"); } catch (e) {}
          setTimeout(function () { sayUnit(k + 1); }, SEG_GAP);
          return;
        }
        try {
          var utt = new g.SpeechSynthesisUtterance(segs[j]);
          utt.lang = lang;
          if (voice) { try { utt.voice = voice; } catch (e) {} }
          utt.rate = rate; utt.pitch = 1; utt.volume = 1;
          utt.onend = function () { saySeg(j + 1); };
          utt.onerror = function (e) { fail(my, e && e.error); };
          g.speechSynthesis.speak(utt);
        } catch (e) { fail(my, "speak-threw"); }
      })(0);
    })(0);
    return true;
  }

  function finish(my) {
    if (my !== state.gen) return;
    state.node = null;
    clearHl(); unprepare();
    emit();
  }
  /* שגיאה שנבלעת עולה יום של חיפוש: מנוע שנכשל מחזיר שקט, והמשתמש
     חושב שהאפליקציה שבורה. לכן הסיבה נשמרת ומוצגת. */
  function fail(my, why) {
    if (my !== state.gen) return;
    if (why === "interrupted" || why === "canceled") return;   /* עצירה שלנו */
    state.err = why || "unknown";
    state.node = null;
    clearHl(); unprepare();
    emit();
  }

  try { var r = localStorage.getItem(RATE_KEY); if (r) setRate(r); } catch (e) {}
  /* הרשימה מגיעה מאוחר — כשהיא מגיעה, המסך מתעדכן ומראה איזה קול נבחר. */
  try { if (supported()) g.speechSynthesis.addEventListener("voiceschanged", emit); } catch (e) {}
  /* מעבר בין דפים באמצע הקראה משאיר את הקול מדבר לבד. */
  try { g.addEventListener("pagehide", stop); } catch (e) {}

  g.Speech = {
    supported: supported, ready: ready, unavailableReason: unavailableReason,
    speak: speak, stop: stop,
    speaking: function () { return !!state.node; },
    currentNode: function () { return state.node; },
    error: function () { return state.err; },
    setRate: setRate, getRate: getRate, rates: rates,
    voice: pickVoice, hebrewVoices: hebrewVoices, voicesReady: voicesReady,
    onChange: onChange,
    /* חשופים לבדיקה */
    _sentences: sentences, _chunks: chunks, _units: unitsFrom
  };
})(window);
