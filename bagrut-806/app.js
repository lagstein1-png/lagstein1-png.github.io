/* =====================================================================
   בגרות 806 — הלוגיקה.
   שלב 1: שלד. ניווט בין שלושה מסכים, קריאת המאגר, שמירת התקדמות,
   והצגת שאלת הדמה כדי שהסכימה תיבדק בפועל ולא רק על הנייר.
   מה שעדיין לא כאן, ומסומן בממשק כך שאיש לא יחשוב שהוא שבור:
     שלב 2 — הקראה בקול (speech.js)
     שלב 3 — חשיפת רמזים אחד-אחד ובדיקת התשובה הסופית
     שלב 4 — דוח נושאים חלשים
   ===================================================================== */
(function () {
  "use strict";

  /* ============================================================
     כלים קטנים
     ============================================================ */
  var $ = function (s) { return document.querySelector(s); };
  function esc(x) {
    return String(x).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* המחרוזת שמקריאים לפריט. הכלל היחיד: אם יש נוסחה — מקריאים את
     `speech`, לעולם לא את ה-LaTeX. אין `speech`? מקריאים את הטקסט. */
  function speechOf(item) {
    if (item.latex) return item.speech || "";
    return item.speech || item.text || "";
  }

  /* ============================================================
     בדיקת שלמות המאגר.
     רצה בכל טעינה ומדפיסה לקונסולה. שדה `speech` חסר ליד `latex`
     אינו נראה לעין — הוא נשמע, ורק אצל התלמיד. עדיף שייתפס כאן.
     ============================================================ */
  function validate(exams) {
    var errs = [];
    if (!Array.isArray(exams) || !exams.length) return ["EXAMS ריק או חסר"];
    exams.forEach(function (ex) {
      if (!ex.id) errs.push("בחינה בלי id");
      if (!ex.durationMinutes) errs.push(ex.id + ": אין durationMinutes");
      (ex.questions || []).forEach(function (q) {
        var qn = ex.id + " שאלה " + q.number;
        if (!q.topic) errs.push(qn + ": אין נושא");
        if (q.latex && !q.speech) errs.push(qn + ": יש latex ואין speech");
        if (!(q.subQuestions || []).length) errs.push(qn + ": אין סעיפים");
        (q.subQuestions || []).forEach(function (s) {
          var sn = qn + " סעיף " + s.letter;
          if (s.latex && !s.speech) errs.push(sn + ": יש latex ואין speech");
          if (!s.finalAnswer) errs.push(sn + ": אין finalAnswer");
          else if (["number", "expression", "text"].indexOf(s.finalAnswer.type) < 0)
            errs.push(sn + ": finalAnswer.type לא מוכר — " + s.finalAnswer.type);
          if (!(s.steps || []).length) errs.push(sn + ": אין steps");
          (s.steps || []).forEach(function (st, i) {
            if (!st.hint || !st.detail)
              errs.push(sn + ": שלב " + (i + 1) + " חסר hint או detail");
          });
        });
      });
    });
    return errs;
  }

  /* ============================================================
     התקדמות — localStorage בלבד, ובתוך try. גלישה פרטית באייפון
     זורקת על עצם הכתיבה, ונפילה שם מפילה את כל האפליקציה.
     ============================================================ */
  var PKEY = "bagrut806-progress";
  var EMPTY = { solved: {}, scores: [], topics: {} };
  var progress = EMPTY;

  function loadProgress() {
    try {
      var raw = localStorage.getItem(PKEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o && typeof o === "object") {
        progress = {
          solved: o.solved || {},
          scores: Array.isArray(o.scores) ? o.scores : [],
          topics: o.topics || {}
        };
      }
    } catch (e) { progress = EMPTY; }
  }
  function saveProgress() {
    try { localStorage.setItem(PKEY, JSON.stringify(progress)); } catch (e) {}
  }
  function resetProgress() {
    progress = { solved: {}, scores: [], topics: {} };
    try { localStorage.removeItem(PKEY); } catch (e) {}
  }

  /* ============================================================
     מצב המסך
     ============================================================ */
  var EXAMS = window.EXAMS || [];
  var view = "home";        /* home | sim | practice */
  var practiceTopic = null; /* נושא נבחר במצב תרגול */

  function topics() {
    var seen = {}, out = [];
    EXAMS.forEach(function (ex) {
      (ex.questions || []).forEach(function (q) {
        if (q.topic && !seen[q.topic]) { seen[q.topic] = 1; out.push(q.topic); }
      });
    });
    return out;
  }
  function questionsOf(topic) {
    var out = [];
    EXAMS.forEach(function (ex) {
      (ex.questions || []).forEach(function (q) {
        if (!topic || q.topic === topic) out.push({ exam: ex, q: q });
      });
    });
    return out;
  }

  /* ============================================================
     חלקי ממשק חוזרים
     ============================================================ */

  /* כפתור הקראה. בשלב 1 הוא מושבת ואומר למה — כפתור שנראה פעיל
     ואינו עושה דבר הוא הדבר הגרוע ביותר עבור הקהל הזה. */
  function sayBtn(text) {
    if (!text) return "";
    var off = !window.Speech || !window.Speech.ready();
    return '<button class="say" type="button" ' + (off ? "disabled " : "") +
           'data-say="' + esc(text) + '" ' +
           'aria-label="' + (off ? "הקראה — שלב 2" : "הקרא בקול") + '" ' +
           'title="' + (off ? "ההקראה נוספת בשלב 2" : "הקרא בקול") + '">🔊</button>';
  }

  /* סוג התשובה הסופית מוצג לתלמיד, ולכן הוא בעברית. `number` באמצע
     משפט עברי גם קופץ לצד השני של השורה וגם אינו אומר לו דבר. */
  var ANSNAME = { number: "מספר", expression: "ביטוי", text: "טקסט" };

  function soonBox(what) {
    return '<p class="soon">' + esc(what) + '</p>';
  }

  function latexBox(item) {
    if (!item.latex) return "";
    /* KaTeX המקומי עדיין לא בריפו (ראו vendor/README). עד שיגיע,
       הנוסחה מוצגת כמקור ומסומנת ככזאת, ולא מתחזה לנוסחה מסודרת. */
    return '<div class="tex" dir="ltr" aria-hidden="true">' +
           esc(item.latex) + '</div>' +
           '<p class="texnote" role="math" ' +
           'aria-label="' + esc(item.speech || "נוסחה") + '">' +
           esc(item.speech || "") + '</p>';
  }

  /* ============================================================
     מסך הבית
     ============================================================ */
  function viewHome() {
    var n = questionsOf(null).length;
    return '' +
      '<section class="card intro">' +
        '<h2>שאלון 806 — מתמטיקה 5 יחידות</h2>' +
        '<p>שתי דרכים ללמוד. אפשר להתחיל בכל אחת מהן, ולעבור ביניהן מתי שרוצים.</p>' +
      '</section>' +

      '<div class="modes">' +
        '<button class="mode sim" type="button" data-go="sim">' +
          '<span class="ic" aria-hidden="true">⏱</span>' +
          '<span class="t">סימולציה</span>' +
          '<span class="d">בחינה מלאה עם שעון. בלי רמזים ובלי פתרונות עד הסיום.</span>' +
        '</button>' +
        '<button class="mode prc" type="button" data-go="practice">' +
          '<span class="ic" aria-hidden="true">◐</span>' +
          '<span class="t">תרגול מודרך</span>' +
          '<span class="d">שאלה אחת בכל פעם, רמזים נחשפים לאט, והפתרון המלא אחרון.</span>' +
        '</button>' +
      '</div>' +

      '<section class="card">' +
        '<h3>מה יש במאגר</h3>' +
        '<p class="stat"><b>' + EXAMS.length + '</b> בחינות · <b>' + n + '</b> שאלות · ' +
        '<b>' + topics().length + '</b> נושאים</p>' +
        '<p class="muted">המאגר עדיין נבנה. השאלה שבפנים היא שאלת דמה מלאה, ' +
        'שנועדה לוודא שהסכימה עובדת מקצה לקצה.</p>' +
      '</section>' +

      '<section class="card">' +
        '<h3>הנתונים שלי</h3>' +
        '<p class="muted">ההתקדמות נשמרת במכשיר הזה בלבד. היא לא נשלחת לשום מקום.</p>' +
        '<button class="btn ghost" type="button" id="reset">מחיקת כל הנתונים</button>' +
      '</section>';
  }

  /* ============================================================
     סימולציה — שלד. השעון עצמו נבנה עם המאגר האמיתי.
     ============================================================ */
  function viewSim() {
    var ex = EXAMS[0];
    if (!ex) return '<section class="card"><p>אין בחינות במאגר.</p></section>';
    var pts = 0;
    (ex.questions || []).forEach(function (q) {
      (q.subQuestions || []).forEach(function (s) { pts += (s.points || 0); });
    });
    return '' +
      '<section class="card">' +
        '<h2>סימולציה</h2>' +
        '<p class="stat">' + esc(ex.season) + ' ' + ex.year + ' · מועד ' + esc(ex.moed) + '</p>' +
        '<dl class="facts">' +
          '<dt>משך הבחינה</dt><dd>' + ex.durationMinutes + ' דקות</dd>' +
          '<dt>שאלות</dt><dd>' + (ex.questions || []).length + '</dd>' +
          '<dt>ניקוד במאגר</dt><dd>' + pts + ' נקודות</dd>' +
        '</dl>' +
      '</section>' +
      '<section class="card">' +
        '<h3>מה יקרה כאן</h3>' +
        '<ul class="list">' +
          '<li>שעון סופר לאחור לפי משך הבחינה.</li>' +
          '<li>אין רמזים ואין פתרונות עד שמסיימים.</li>' +
          '<li>בסיום — דוח לפי נושא, ומה כדאי לחזור עליו.</li>' +
        '</ul>' +
        soonBox("השעון והדוח נבנים בשלבים 3 ו-4. בינתיים אפשר לראות את השאלות במצב תרגול.") +
      '</section>';
  }

  /* ============================================================
     תרגול מודרך — בחירת נושא, ואז שאלה אחת
     ============================================================ */
  function viewPractice() {
    if (!practiceTopic) {
      var ts = topics();
      if (!ts.length) return '<section class="card"><p>אין נושאים במאגר.</p></section>';
      return '' +
        '<section class="card"><h2>תרגול מודרך</h2>' +
        '<p>בוחרים נושא, ופותרים שאלה אחת בכל פעם.</p></section>' +
        '<div class="topics">' +
          ts.map(function (t) {
            var c = questionsOf(t).length;
            return '<button class="topic" type="button" data-topic="' + esc(t) + '">' +
                   '<span class="t">' + esc(t) + '</span>' +
                   '<span class="c">' + c + ' שאלות</span></button>';
          }).join("") +
        '</div>';
    }

    var items = questionsOf(practiceTopic);
    if (!items.length)
      return '<section class="card"><p>אין שאלות בנושא הזה.</p></section>';

    var q = items[0].q, ex = items[0].exam;
    return '' +
      '<button class="btn ghost back2" type="button" data-topic="">← נושא אחר</button>' +
      '<section class="card q">' +
        '<p class="tag">' + esc(q.topic) + ' · ' + esc(ex.season) + ' ' + ex.year +
        ' מועד ' + esc(ex.moed) + ' · שאלה ' + q.number + '</p>' +
        '<div class="row"><p class="qtext">' + esc(q.text) + '</p>' +
          sayBtn(speechOf(q)) + '</div>' +
        latexBox(q) +
      '</section>' +
      (q.subQuestions || []).map(function (s) {
        return '<section class="card sub">' +
          '<div class="row"><h3>סעיף ' + esc(s.letter) +
            ' <span class="pts">' + (s.points || 0) + ' נק\'</span></h3></div>' +
          '<div class="row"><p>' + esc(s.text) + '</p>' + sayBtn(speechOf(s)) + '</div>' +
          latexBox(s) +
          '<p class="muted">' + (s.steps || []).length + ' שלבי רמז · ' +
            'תשובה סופית מסוג ' +
            esc(s.finalAnswer ? (ANSNAME[s.finalAnswer.type] || s.finalAnswer.type) : "—") +
            '</p>' +
          soonBox("חשיפת הרמזים ובדיקת התשובה נבנות בשלב 3.") +
        '</section>';
      }).join("");
  }

  /* ============================================================
     ציור ואירועים
     ============================================================ */
  var TITLES = { home: "בגרות 806", sim: "סימולציה", practice: "תרגול מודרך" };

  function render() {
    var app = $("#app");
    app.innerHTML = view === "sim" ? viewSim()
                  : view === "practice" ? viewPractice()
                  : viewHome();
    $("#back").hidden = (view === "home");
    $("#screen").textContent = TITLES[view] || "";
    app.focus();
    window.scrollTo(0, 0);
  }

  function go(v) {
    view = v;
    if (v !== "practice") practiceTopic = null;
    render();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-go]");
    if (t) { go(t.getAttribute("data-go")); return; }

    var tp = e.target.closest("[data-topic]");
    if (tp) { practiceTopic = tp.getAttribute("data-topic") || null; render(); return; }

    if (e.target.closest("#back")) { go("home"); return; }

    if (e.target.closest("#reset")) {
      if (confirm("למחוק את כל ההתקדמות במכשיר הזה?")) {
        resetProgress();
        render();
      }
      return;
    }
  });

  /* בורר המהירות קיים כבר עכשיו — הוא נשמר ב-localStorage, ושלב 2
     רק יקרא ממנו. כך ההעדפה של המשתמש לא מתאפסת כשהמנוע יגיע. */
  function paintRates() {
    var wrap = $("#rates");
    if (!wrap) return;
    var cur = window.Speech ? window.Speech.rate() : 1.0;
    wrap.innerHTML = window.Speech.RATES.map(function (r) {
      return '<button type="button" dir="ltr" class="rate' + (r === cur ? " on" : "") + '" ' +
             'data-rate="' + r + '" aria-pressed="' + (r === cur) + '" ' +
             'aria-label="מהירות הקראה ' + r.toFixed(1) + '">' +
             '\u00d7' + r.toFixed(1) + '</button>';
    }).join("");
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-rate]");
    if (!b) return;
    window.Speech.rate(parseFloat(b.getAttribute("data-rate")));
    paintRates();
  });

  /* ============================================================
     מצב כהה — העדפת המערכת, ודריסה ידנית שנשמרת
     ============================================================ */
  var TKEY = "bagrut806-theme";
  function applyTheme(v) {
    var r = document.documentElement;
    if (v) r.setAttribute("data-theme", v); else r.removeAttribute("data-theme");
    var dark = v ? v === "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
    var b = $("#theme");
    b.textContent = dark ? "☀" : "☾";
    b.setAttribute("aria-label", dark ? "מצב בהיר" : "מצב כהה");
    b.setAttribute("aria-pressed", dark ? "true" : "false");
  }
  function savedTheme() { try { return localStorage.getItem(TKEY) || ""; } catch (e) { return ""; } }
  $("#theme").addEventListener("click", function () {
    var dark = document.documentElement.getAttribute("data-theme") === "dark" ||
               (!savedTheme() && matchMedia("(prefers-color-scheme:dark)").matches);
    var next = dark ? "light" : "dark";
    try { localStorage.setItem(TKEY, next); } catch (e) {}
    applyTheme(next);
  });

  /* ============================================================
     הפעלה
     ============================================================ */
  var errs = validate(EXAMS);
  if (errs.length) console.warn("[bagrut-806] בעיות במאגר:\n" + errs.join("\n"));
  else console.log("[bagrut-806] המאגר תקין.");

  loadProgress();
  saveProgress();
  applyTheme(savedTheme());
  paintRates();
  render();
})();
