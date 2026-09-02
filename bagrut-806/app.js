/* =====================================================================
   806 — לוגיקה. שלב 1: שלד, סכימה, ומעבר בין מסכים.

   מה כאן ומה עוד לא:
     שלב 1 (זה)  שלד, טעינת EXAMS, ניווט, הגדרות, שמירה במכשיר.
     שלב 2       speech.js — הקראה בעברית עם הדגשת המשפט הנקרא.
     שלב 3       חשיפת רמזים אחד־אחד ובדיקת תשובה סופית.
     שלב 4       PWA, אופליין מלא, ודוח נושאים חלשים.

   אין framework ואין build. הקובץ נטען כ-<script> רגיל, ואחרי
   data/exams.js — הוא סומך על window.EXAMS שכבר קיים.
   ===================================================================== */
(function () {
  "use strict";

  var BUILD = "x2 · 2026-09-02";

  /* --- עוזרים קצרים --------------------------------------------- */
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  /* כל טקסט שמגיע מהנתונים עובר כאן לפני שהוא נכנס ל-innerHTML.
     גם כשהמקור הוא קובץ שלנו: יום אחד מישהו יעתיק לתוכו סימן <
     מתוך PDF של בחינה, ואז זה כבר לא יהיה תיאורטי. */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function say(msg) { var l = $("#live"); if (l) l.textContent = msg; }
  /* "1 שאלות" הוא בדיוק סוג המשפט שגורם לקורא מתקשה לעצור ולחזור
     אחורה. עברית מבחינה גם בשניים, ולכן שלוש צורות ולא שתיים. */
  function plural(n, one, two, many) {
    if (n === 1) return one;
    if (n === 2) return two;
    return n + " " + many;
  }

  /* --- שמירה במכשיר ---------------------------------------------
     מפתח אחד, עם מספר גרסה. שינוי מבנה עתידי מעלה את המספר ומתעלם
     ממה שנשמר, במקום להתרסק על צורה שכבר לא קיימת. */
  var SKEY = "bagrut806-v1";
  var store = {
    data: null,
    blank: function () {
      return { fs: 1, theme: "auto", rate: 1, examId: null, solved: {}, sims: [], weak: {} };
    },
    load: function () {
      try {
        var raw = localStorage.getItem(SKEY);
        this.data = raw ? JSON.parse(raw) : this.blank();
      } catch (e) { this.data = this.blank(); }
      var b = this.blank();
      for (var k in b) if (!(k in this.data)) this.data[k] = b[k];
      return this.data;
    },
    save: function () {
      /* מצב פרטי בספארי זורק על כתיבה. אפליקציה שנופלת בגלל שלא
         הצליחה לשמור העדפה היא גרועה יותר מאפליקציה ששוכחת אותה. */
      try { localStorage.setItem(SKEY, JSON.stringify(this.data)); } catch (e) {}
    },
    reset: function () {
      try { localStorage.removeItem(SKEY); } catch (e) {}
      this.data = this.blank();
    }
  };

  /* --- מצב ------------------------------------------------------- */
  var state = { screen: "home", examId: null, topic: null, back: "home" };

  /* --- מראה וגודל טקסט ------------------------------------------ */
  function applyPrefs() {
    var d = store.data;
    document.documentElement.style.setProperty("--fs", (1.06 * d.fs).toFixed(3) + "rem");
    if (d.theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", d.theme);
    $$("[data-fs]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-fs")) === d.fs));
    });
    $$("[data-theme]").forEach(function (b) {
      if (b.tagName !== "BUTTON") return;
      b.setAttribute("aria-pressed", String(b.getAttribute("data-theme") === d.theme));
    });
    $$("[data-rate]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-rate")) === d.rate));
    });
    if (window.Speech) window.Speech.rate = d.rate;
    voiceState();
  }

  /* --- מצב הקול, כפי שהוא מוצג למשתמש ---------------------------
     "אין קול" בלי הסבר נראה כמו תקלה באפליקציה. אומרים מה חסר
     ואיפה מתקינים, כי זו הגדרה של המכשיר ולא שלנו. */
  function voiceState() {
    var el = $("#voice-state"), btn = $("#btn-try");
    if (!el) return;
    if (!window.Speech || !window.Speech.available()) {
      el.textContent = "הדפדפן הזה אינו תומך בהקראה.";
      if (btn) btn.disabled = true;
      return;
    }
    window.Speech.ready().then(function () {
      if (window.Speech.hasHebrewVoice()) {
        el.textContent = "קול עברי במכשיר: " + window.Speech.voiceName();
        if (btn) btn.disabled = false;
      } else {
        el.textContent = "אין במכשיר קול עברי. אפשר להתקין אחד בהגדרות המכשיר — " +
          "באנדרואיד: הגדרות ← נגישות ← טקסט לדיבור; באייפון: הגדרות ← נגישות ← תוכן מדובר ← קולות.";
        if (btn) btn.disabled = false;
      }
    });
  }

  /* --- נוסחאות ---------------------------------------------------
     KaTeX מקומי. אם מסיבה כלשהי הוא לא נטען, מוצג ה-LaTeX כטקסט
     ולא נופלת השאלה כולה — עדיף שורה מכוערת על מסך ריק. */
  function formula(tex, id) {
    if (!tex) return "";
    var html;
    try {
      html = window.katex.renderToString(tex, { displayMode: true, throwOnError: false });
    } catch (e) {
      html = "<code>" + esc(tex) + "</code>";
    }
    return '<div class="formula"' + (id ? ' id="' + esc(id) + '"' : "") + ">" + html + "</div>";
  }
  /* הסימן שאפשר לגלול נוסף אחרי הציור, כי רק אז ידוע אם הנוסחה
     באמת רחבה מהמסך. סימן שמופיע תמיד הוא רעש; סימן שלא מופיע
     כשצריך הוא נוסחה חתוכה שאיש לא ידע להזיז. */
  function markOverflow(root) {
    $$(".formula").forEach(function (el) {
      if (root && !root.contains(el)) return;
      el.classList.toggle("over", el.scrollWidth > el.clientWidth + 1);
    });
  }

  /* --- הקראה -----------------------------------------------------
     המשפטים נעטפים כאן באותו מפצל שהמנוע משתמש בו, ולכן המשפט
     שמודגש הוא בדיוק המשפט שנאמר. שני מפצלים נפרדים היו מתפצלים
     ביום שמישהו יגע באחד מהם. */
  function sentHtml(text) {
    var ss = (window.Speech && window.Speech.sentences)
      ? window.Speech.sentences(String(text))
      : [String(text)];
    return ss.map(function (x) { return '<span class="sent">' + esc(x) + "</span>"; }).join("");
  }
  function spkBtn(id, label) {
    return '<button class="spk" data-read="' + esc(id) + '" type="button" ' +
           'aria-label="' + esc(label) + '" title="' + esc(label) + '">🔊</button>';
  }

  /* --- בחירת בחינה ---------------------------------------------- */
  function examById(id) {
    var all = window.EXAMS || [];
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function examTitle(ex) {
    return ex.season + " " + ex.year + (ex.moed && ex.moed !== "—" ? " · מועד " + ex.moed : "");
  }
  function countSubs(ex) {
    var n = 0;
    ex.questions.forEach(function (q) { n += (q.subQuestions || []).length; });
    return n;
  }

  function renderHome() {
    var all = window.EXAMS || [];
    var box = $("#exam-list");
    if (!all.length) {
      box.innerHTML = '<div class="stub"><b>אין עדיין בחינות.</b>' +
        "הבחינות יושבות ב־<code>data/exams.js</code>.</div>";
      return;
    }
    box.innerHTML = all.map(function (ex) {
      var demo = ex.season === "הדגמה"
        ? ' <span class="chip warn">בחינת הדגמה — לא בחינה אמיתית</span>' : "";
      return '<button class="card pick" data-exam="' + esc(ex.id) + '">' +
        "<h3>" + esc(examTitle(ex)) + demo + "</h3>" +
        '<p class="meta">' +
        plural(ex.questions.length, "שאלה אחת", "שתי שאלות", "שאלות") + " · " +
        plural(countSubs(ex), "סעיף אחד", "שני סעיפים", "סעיפים") + " · " +
        ex.durationMinutes + " דקות</p></button>";
    }).join("");
  }

  /* --- תצוגת השאלה. בשלב הזה קריאה והקראה, בלי רמזים ------------ */
  function subHtml(q, sub, si) {
    var id = "q" + q.number + "s" + si;
    /* הנוסחה יוצאת מעמודת הטקסט בכוונה: בתוכה היא מאבדת את רוחב
       הכפתור, ועל מסך צר זה בדיוק ההפרש בין נוסחה שנכנסת לנוסחה
       שצריך לגרור. */
    var h = '<div class="sub"><div class="saybar">' +
      spkBtn(id, "הקריאו את סעיף " + sub.letter) +
      '<div class="grow"><h3 id="t-' + id + '"><span class="letter">' + esc(sub.letter) +
      ".</span> " + sentHtml(sub.text) + "</h3>" +
      '<p class="meta">' + plural(sub.points, "נקודה אחת", "שתי נקודות", "נקודות") +
      "</p></div></div>";
    h += formula(sub.latex, "f-" + id);
    if (sub.speech) h += '<p class="saytxt">בהקראה: ' + esc(sub.speech) + "</p>";
    var steps = sub.steps || [];
    h += '<p class="meta">' +
         plural(steps.length, "שלב רמז אחד", "שני שלבי רמז", "שלבי רמז") +
         " · תשובה סופית מסוג " +
         esc(sub.finalAnswer ? sub.finalAnswer.type : "—") + "</p>";
    return h + "</div>";
  }
  function questionHtml(q) {
    var id = "q" + q.number;
    var h = '<div class="card"><div class="qhead"><span class="qnum">שאלה ' +
            esc(q.number) + '</span><span class="chip">' + esc(q.topic) + "</span></div>";
    h += '<div class="saybar">' + spkBtn(id, "הקריאו את השאלה") +
         '<div class="grow"><p id="t-' + id + '">' + sentHtml(q.text) + "</p></div></div>";
    h += formula(q.latex, "f-" + id);
    if (q.speech) h += '<p class="saytxt">בהקראה: ' + esc(q.speech) + "</p>";
    (q.subQuestions || []).forEach(function (sub, si) { h += subHtml(q, sub, si); });
    return h + "</div>";
  }

  /* מאתר מה להקריא לפי המזהה שעל הכפתור. הטקסט תמיד ראשון והנוסחה
     אחריו, ומה שנאמר על נוסחה הוא השדה speech — לעולם לא ה-LaTeX. */
  function readUnits(id) {
    var ex = examById(state.examId);
    if (!ex) return [];
    var m = /^q(\d+)(?:s(\d+))?$/.exec(id);
    if (!m) return [];
    var q = null;
    ex.questions.forEach(function (x) { if (String(x.number) === m[1]) q = x; });
    if (!q) return [];
    var src = m[2] === undefined ? q : (q.subQuestions || [])[Number(m[2])];
    if (!src) return [];
    return [{ text: src.text, el: document.getElementById("t-" + id) },
            { text: src.speech, el: document.getElementById("f-" + id) }];
  }

  function topicsOf(ex) {
    var seen = {}, out = [];
    ex.questions.forEach(function (q) {
      if (!seen[q.topic]) { seen[q.topic] = 1; out.push(q.topic); }
    });
    return out;
  }

  function renderPractice() {
    var ex = examById(state.examId);
    if (!ex) return;
    $("#prac-meta").textContent = examTitle(ex);
    var topics = topicsOf(ex);
    if (!state.topic || topics.indexOf(state.topic) < 0) state.topic = topics[0] || null;
    $("#topic-list").innerHTML = topics.map(function (t) {
      return '<button class="btn" data-topic="' + esc(t) + '" aria-pressed="' +
             (t === state.topic) + '">' + esc(t) + "</button>";
    }).join("");
    var qs = ex.questions.filter(function (q) { return q.topic === state.topic; });
    $("#prac-preview").innerHTML = qs.map(questionHtml).join("") ||
      '<div class="stub">אין שאלות בנושא הזה.</div>';
    markOverflow($("#prac-preview"));
  }

  function renderSim() {
    var ex = examById(state.examId);
    if (!ex) return;
    $("#sim-meta").textContent = examTitle(ex) + " · " + ex.durationMinutes + " דקות · " +
      plural(ex.questions.length, "שאלה אחת", "שתי שאלות", "שאלות");
  }

  function renderMode() {
    var ex = examById(state.examId);
    if (!ex) return;
    $("#mode-title").textContent = examTitle(ex);
    $("#mode-meta").textContent =
      plural(ex.questions.length, "שאלה אחת", "שתי שאלות", "שאלות") + " · " +
      plural(countSubs(ex), "סעיף אחד", "שני סעיפים", "סעיפים") + " · " +
      ex.durationMinutes + " דקות";
  }

  /* --- ניווט ----------------------------------------------------- */
  var SCREENS = ["home", "mode", "sim", "practice", "settings"];
  var TITLES = {
    home: "שאלון 806", mode: "בחירת מצב", sim: "סימולציית בחינה",
    practice: "תרגול מודרך", settings: "הגדרות"
  };
  function go(screen) {
    if (SCREENS.indexOf(screen) < 0) screen = "home";
    /* אי אפשר להיכנס למצב בלי בחינה. פתיחה ישירה של #practice
       בלי בחירה הייתה מגיעה למסך שמתייחס ל-examId שאינו קיים. */
    if ((screen === "mode" || screen === "sim" || screen === "practice") && !state.examId)
      screen = "home";
    /* מי שנכנס להגדרות באמצע תרגול כדי להאט את ההקראה חוזר לשם,
       ולא לרשימת הבחינות. שלוש לחיצות כדי לחזור למקום שבו היית
       הן בדיוק העומס שהאפליקציה הזאת נועדה להוריד. */
    if (screen === "settings" && state.screen !== "settings") state.back = state.screen;
    state.screen = screen;
    /* מעבר מסך בזמן הקראה משאיר קול שמדבר על טקסט שכבר אינו על
       המסך, וההדגשה נשארת על אלמנט מוסתר. */
    if (window.Speech) window.Speech.stop();
    SCREENS.forEach(function (s) { $("#scr-" + s).hidden = s !== screen; });
    var back = $("#btn-home");
    back.hidden = screen === "home";
    back.textContent = screen === "settings" && state.back !== "home" ? "חזרה" : "לבחינות";
    back.setAttribute("data-go", screen === "settings" ? state.back : "home");
    if (screen === "home") renderHome();
    if (screen === "mode") renderMode();
    if (screen === "sim") renderSim();
    if (screen === "practice") renderPractice();
    if (screen === "settings") applyPrefs();
    window.scrollTo(0, 0);
    say(TITLES[screen]);
  }

  /* --- אירועים. האזנה אחת על המסמך, ולא מאזין לכל כפתור --------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest(
      "[data-go],[data-exam],[data-topic],[data-fs],[data-theme],[data-rate]," +
      "[data-read],#btn-reset,#btn-stop,#btn-try") : null;
    if (!el) return;

    var read = el.getAttribute("data-read");
    if (read) {
      /* לחיצה חוזרת על אותו כפתור עוצרת. אחרת מי שלחץ פעמיים
         שומע את עצמו מתחיל מחדש ולא מבין למה. */
      if (el.classList.contains("on")) { window.Speech.stop(); return; }
      window.Speech.speak(readUnits(read), read);
      return;
    }
    if (el.id === "btn-stop") { window.Speech.stop(); return; }
    if (el.id === "btn-try") {
      window.Speech.speak([{ text: "שלום. כך נשמעת ההקראה בקצב שנבחר.", el: null }]);
      return;
    }
    var rt = el.getAttribute("data-rate");
    if (rt) { store.data.rate = Number(rt); store.save(); applyPrefs(); return; }

    var exam = el.getAttribute("data-exam");
    if (exam) { state.examId = exam; store.data.examId = exam; store.save(); go("mode"); return; }

    var topic = el.getAttribute("data-topic");
    if (topic) { state.topic = topic; renderPractice(); return; }

    var fs = el.getAttribute("data-fs");
    if (fs) { store.data.fs = Number(fs); store.save(); applyPrefs(); return; }

    var th = el.tagName === "BUTTON" ? el.getAttribute("data-theme") : null;
    if (th) { store.data.theme = th; store.save(); applyPrefs(); return; }

    if (el.id === "btn-reset") {
      if (!window.confirm("למחוק את כל מה שנשמר במכשיר הזה?")) return;
      store.reset(); applyPrefs(); state.examId = null; go("home");
      say("הנתונים נמחקו.");
      return;
    }

    var to = el.getAttribute("data-go");
    if (to) go(to);
  });

  /* --- הפעלה ----------------------------------------------------- */
  /* כפתור ההקראה הפעיל מסומן, וסרגל העצירה נפתח רק כשבאמת מדברים.
     סרגל שנשאר פתוח אחרי שהקול נגמר הוא בדיוק סוג הבלבול שהאפליקציה
     הזאת אמורה למנוע. */
  if (window.Speech) {
    window.Speech.onstate = function (on) {
      $("#stopbar").hidden = !on;
      $$(".spk").forEach(function (b) { b.classList.remove("on"); });
      if (!on) return;
      var t = window.Speech.tag;
      if (t) {
        var b = document.querySelector('.spk[data-read="' + t + '"]');
        if (b) b.classList.add("on");
      }
    };
  }

  store.load();
  applyPrefs();
  $("#build").textContent = BUILD;
  if (store.data.examId && examById(store.data.examId)) state.examId = store.data.examId;
  go("home");
})();
