/* ============================================================
   בגרות 806 — לוגיקה
   ------------------------------------------------------------
   שלב 1: שלד. מה שקיים כאן ועובד באמת —
     · טעינת `window.EXAMS` ובדיקת תקינות הסכמה, עם דיווח על המסך.
     · ניווט בין שלושה מסכים.
     · שמירת התקדמות ב-localStorage, וכפתור איפוס.
     · תצוגת שאלת ההדגמה, כדי שהסכמה תיראה מקצה לקצה.
   מה שעוד אינו קיים ומסומן ככזה על המסך —
     · הקראה (שלב 2), רמזים ובדיקת תשובה (שלב 3), PWA ודוח (שלב 4).
   ============================================================ */
(function (g) {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------- שמירת התקדמות ---------- */
  var LS_KEY = "bagrut806-v1";
  var store = { solved: {}, sims: [], weak: {} };

  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o && typeof o === "object") {
        store.solved = o.solved || {};
        store.sims   = o.sims   || [];
        store.weak   = o.weak   || {};
      }
    } catch (e) { /* מכשיר שחוסם אחסון — האפליקציה עובדת בלעדיו */ }
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(store)); }
    catch (e) { /* אותו דבר */ }
  }
  function resetAll() {
    store = { solved: {}, sims: [], weak: {} };
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
  }

  /* ---------- בדיקת הסכמה ----------
     נבדק בטעינה ומוצג על המסך. שדה `speech` חסר ליד נוסחה אינו
     קוסמטיקה: הוא אומר שההקראה תקרא LaTeX גולמי, וזה בדיוק מה
     שהאפליקציה הזאת קיימת כדי למנוע. */
  function validate(exams) {
    var errs = [];
    function need(cond, msg) { if (!cond) errs.push(msg); }
    if (!Array.isArray(exams)) return ["window.EXAMS אינו מערך."];
    if (!exams.length) return ["window.EXAMS ריק."];
    exams.forEach(function (ex, i) {
      var at = "בחינה " + (ex.id || "#" + i);
      need(ex.id, at + ": חסר id.");
      need(typeof ex.durationMinutes === "number", at + ": durationMinutes חייב להיות מספר.");
      need(Array.isArray(ex.questions) && ex.questions.length, at + ": אין שאלות.");
      (ex.questions || []).forEach(function (q) {
        var qa = at + ", שאלה " + q.number;
        need(typeof q.number === "number", qa + ": חסר number.");
        need(!!q.topic, qa + ": חסר topic.");
        need(!!q.text, qa + ": חסר text.");
        if (q.latex) need(!!q.speech, qa + ": יש latex בלי speech — ההקראה תקרא LaTeX גולמי.");
        need(Array.isArray(q.subQuestions) && q.subQuestions.length, qa + ": אין subQuestions.");
        (q.subQuestions || []).forEach(function (sq) {
          var sa = qa + " סעיף " + (sq.letter || "?");
          need(!!sq.letter, sa + ": חסרה letter.");
          need(!!sq.text, sa + ": חסר text.");
          need(typeof sq.points === "number", sa + ": points חייב להיות מספר.");
          if (sq.latex) need(!!sq.speech, sa + ": יש latex בלי speech.");
          if (sq.finalAnswer) {
            need(["number", "expression", "text"].indexOf(sq.finalAnswer.type) >= 0,
                 sa + ": finalAnswer.type חייב להיות number, expression או text.");
          }
          need(Array.isArray(sq.steps) && sq.steps.length, sa + ": אין steps.");
          (sq.steps || []).forEach(function (st, k) {
            need(!!st.hint,   sa + ", שלב " + (k + 1) + ": חסר hint.");
            need(!!st.detail, sa + ", שלב " + (k + 1) + ": חסר detail.");
          });
        });
      });
    });
    return errs;
  }

  /* ---------- נוסחאות ----------
     כאן, ורק כאן, נכנס KaTeX בהמשך. עד אז מוצג ה-LaTeX כמו שהוא
     ומסומן ככזה — עדיף מלהעמיד פנים שהוא עוּבד.
     `vendor/katex/` ריקה בכוונה: אי אפשר להוריד ספרייה מסביבת
     הפיתוח (הרשת חסומה), והורדה מ-CDN בזמן ריצה אסורה. */
  function renderMath(latex, speech) {
    if (!latex) return "";
    var has = !!(g.katex && typeof g.katex.renderToString === "function");
    if (has) {
      try {
        return '<span class="tex" data-speech="' + esc(speech || "") + '">' +
               g.katex.renderToString(latex, { throwOnError: false, displayMode: true }) + "</span>";
      } catch (e) { /* נופלים לתצוגה הגולמית */ }
    }
    return '<span class="tex raw" data-speech="' + esc(speech || "") + '">' +
           '<code>' + esc(latex) + '</code>' +
           '<em>KaTeX עוד לא הותקן — הנוסחה מוצגת כמקור</em></span>';
  }

  /* ---------- מסכים ---------- */
  var view = "home";

  function speechBtn(label) {
    var on = g.Speech && g.Speech.ready();
    return '<button class="btn ghost spk" type="button" ' + (on ? "" : 'disabled aria-disabled="true" ') +
      'title="' + esc(on ? "הקראה" : (g.Speech ? g.Speech.unavailableReason() : "")) + '">' +
      '<span aria-hidden="true">🔊</span><span class="sr">' + esc(label) + '</span></button>';
  }

  function viewHome() {
    var ex = (g.EXAMS || [])[0];
    var h = '<h1>בגרות 806</h1>' +
      '<p class="lead">מתמטיקה, 5 יחידות. כל טקסט וכל נוסחה נשמעים לפני שקוראים אותם.</p>';
    h += '<div class="grid">' +
      '<button class="tile" data-go="sim"><span class="tn">סימולציה</span>' +
        '<span class="td">בחינה מלאה עם שעון' + (ex ? ' · ' + ex.durationMinutes + ' דקות' : '') +
        '. בלי רמזים ובלי פתרונות עד הסיום.</span></button>' +
      '<button class="tile" data-go="practice"><span class="tn">תרגול מודרך</span>' +
        '<span class="td">שאלה אחת בכל פעם, רמזים נחשפים אחד-אחד, והפתרון המלא אחרון.</span></button>' +
      '</div>';
    h += '<section class="card build"><h2>מצב הבנייה</h2><ol class="stages">' +
      '<li class="done">שלד, סכמת הנתונים, שאלת דמה, ושני המצבים כמסכים</li>' +
      '<li>מנוע ההקראה</li>' +
      '<li>רמזים שלב-אחר-שלב ובדיקת תשובה סופית</li>' +
      '<li>PWA, אופליין, ודוח נושאים חלשים</li>' +
      '</ol></section>';
    h += '<section class="card"><h2>הנתונים שלי</h2>' +
      '<p class="sub">נשמרים במכשיר הזה בלבד, ולא נשלחים לשום מקום.</p>' +
      '<p class="sub">נפתרו ' + Object.keys(store.solved).length + ' סעיפים · ' +
      store.sims.length + ' סימולציות</p>' +
      '<button class="btn danger" data-act="reset">איפוס הנתונים</button></section>';
    return h;
  }

  function viewSim() {
    var ex = (g.EXAMS || [])[0];
    return '<h1>סימולציה</h1>' +
      '<p class="lead">בחינה מלאה' + (ex ? ', ' + ex.durationMinutes + ' דקות' : '') +
      '. שעון סופר לאחור, בלי רמזים ובלי פתרונות עד הסיום, ובסוף דוח לפי נושא.</p>' +
      '<div class="card todo"><h2>המסך הזה עוד ריק</h2>' +
      '<p>השעון, ניווט בין השאלות ודוח הסיום נבנים בשלבים 3 ו-4.</p></div>';
  }

  function subHtml(sq) {
    var h = '<li class="sub-q"><div class="row"><b>סעיף ' + esc(sq.letter) + '</b>' +
      '<span class="pts">' + sq.points + ' נק\'</span>' + speechBtn("הקראת סעיף " + sq.letter) + '</div>' +
      '<p>' + esc(sq.text) + '</p>';
    if (sq.latex) h += renderMath(sq.latex, sq.speech);
    h += '<p class="sub">' + sq.steps.length + ' שלבי רמז · תשובה סופית מסוג ' +
         esc(sq.finalAnswer ? sq.finalAnswer.type : "—") + ' — נחשפים בשלב 3.</p></li>';
    return h;
  }

  function viewPractice() {
    var ex = (g.EXAMS || [])[0];
    var h = '<h1>תרגול מודרך</h1>' +
      '<p class="lead">בחירת נושא, שאלה אחת בכל פעם, ורמזים שנחשפים רק כשמבקשים.</p>' +
      '<div class="card todo"><h2>המסך הזה עוד ריק</h2>' +
      '<p>בחירת הנושא וחשיפת הרמזים נבנות בשלב 3. מתחת מוצגת שאלת ההדגמה, ' +
      'כדי שאפשר יהיה לראות שהסכמה עובדת מקצה לקצה.</p></div>';
    if (!ex) return h;
    var q = ex.questions[0];
    h += '<article class="card q">' +
      '<div class="row"><span class="chip">' + esc(q.topic) + '</span>' +
      (ex.demo ? '<span class="chip warn">שאלת הדגמה — לא מתוך שאלון אמיתי</span>' : '') +
      speechBtn("הקראת השאלה") + '</div>' +
      '<h2>שאלה ' + q.number + '</h2>' +
      '<p>' + esc(q.text) + '</p>' +
      renderMath(q.latex, q.speech) +
      '<ol class="subs">' + q.subQuestions.map(subHtml).join("") + '</ol></article>';
    return h;
  }

  function render() {
    var body = view === "sim" ? viewSim() : view === "practice" ? viewPractice() : viewHome();
    var back = view === "home" ? "" :
      '<button class="btn ghost back" data-go="home">→ חזרה</button>';
    $("#app").innerHTML = back + body;
    $("#app").focus();
    window.scrollTo(0, 0);
  }

  function showErrors(errs) {
    if (!errs.length) return;
    var box = document.createElement("div");
    box.className = "schema-errs";
    box.setAttribute("role", "alert");
    box.innerHTML = "<b>הסכמה אינה תקינה (" + errs.length + "):</b><ul>" +
      errs.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>";
    document.body.insertBefore(box, document.body.firstChild);
  }

  /* ---------- הפעלה ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-go],[data-act]");
    if (!el) return;
    var go = el.getAttribute("data-go");
    if (go) { view = go; render(); return; }
    if (el.getAttribute("data-act") === "reset") {
      if (confirm("למחוק את כל ההתקדמות במכשיר הזה?")) { resetAll(); render(); }
    }
  });

  load();
  showErrors(validate(g.EXAMS));
  render();
  g.APP = { validate: validate, render: render, store: function () { return store; } };
})(window);
