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

  var BUILD = "x1 · 2026-09-02";

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
      return { fs: 1, theme: "auto", examId: null, solved: {}, sims: [], weak: {} };
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
  var state = { screen: "home", examId: null, topic: null };

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
  }

  /* --- נוסחאות ---------------------------------------------------
     KaTeX מקומי. אם מסיבה כלשהי הוא לא נטען, מוצג ה-LaTeX כטקסט
     ולא נופלת השאלה כולה — עדיף שורה מכוערת על מסך ריק. */
  function formula(tex) {
    if (!tex) return "";
    var html;
    try {
      html = window.katex.renderToString(tex, { displayMode: true, throwOnError: false });
    } catch (e) {
      html = "<code>" + esc(tex) + "</code>";
    }
    return '<div class="formula">' + html + "</div>";
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

  /* --- תצוגת השאלה. בשלב הזה קריאה בלבד ------------------------- */
  function subHtml(sub) {
    var h = '<div class="sub"><h3><span class="letter">' + esc(sub.letter) +
            ".</span> " + esc(sub.text) + "</h3>";
    h += '<p class="meta">' + plural(sub.points, "נקודה אחת", "שתי נקודות", "נקודות") + "</p>";
    h += formula(sub.latex);
    if (sub.speech) h += '<p class="saytxt">בהקראה: ' + esc(sub.speech) + "</p>";
    var steps = sub.steps || [];
    h += '<p class="meta">' +
         plural(steps.length, "שלב רמז אחד", "שני שלבי רמז", "שלבי רמז") +
         " · תשובה סופית מסוג " +
         esc(sub.finalAnswer ? sub.finalAnswer.type : "—") + "</p>";
    return h + "</div>";
  }
  function questionHtml(q) {
    var h = '<div class="card"><div class="qhead"><span class="qnum">שאלה ' +
            esc(q.number) + '</span><span class="chip">' + esc(q.topic) + "</span></div>";
    h += "<p>" + esc(q.text) + "</p>";
    h += formula(q.latex);
    if (q.speech) h += '<p class="saytxt">בהקראה: ' + esc(q.speech) + "</p>";
    (q.subQuestions || []).forEach(function (s) { h += subHtml(s); });
    return h + "</div>";
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
    state.screen = screen;
    SCREENS.forEach(function (s) { $("#scr-" + s).hidden = s !== screen; });
    $("#btn-home").hidden = screen === "home";
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
    var el = e.target.closest ? e.target.closest("[data-go],[data-exam],[data-topic],[data-fs],[data-theme],#btn-reset") : null;
    if (!el) return;

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
  store.load();
  applyPrefs();
  $("#build").textContent = BUILD;
  if (store.data.examId && examById(store.data.examId)) state.examId = store.data.examId;
  go("home");
})();
