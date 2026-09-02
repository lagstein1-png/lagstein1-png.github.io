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

  /* כל בלוק שאפשר להקריא מקבל מזהה. הכפתור מצביע עליו ב-data-say,
     ומנוע ההקראה שואב את הטקסט מה-DOM עצמו — ולכן מה שנשמע הוא
     בדיוק מה שכתוב על המסך, בלי מחרוזת מקבילה שיכולה להתיישן. */
  var sayN = 0;
  function sayId() { return "say" + (++sayN); }
  function speechBtn(id, label) {
    var on = g.Speech && g.Speech.ready();
    var live = on && g.Speech.currentNode() && g.Speech.currentNode().id === id;
    return '<button class="btn ghost spk' + (live ? " live" : "") + '" type="button" data-say="' + id + '" ' +
      (on ? "" : 'disabled aria-disabled="true" ') +
      'aria-pressed="' + (live ? "true" : "false") + '" ' +
      'title="' + esc(on ? (live ? "עצירה" : "הקראה") : (g.Speech ? g.Speech.unavailableReason() : "")) + '">' +
      '<span aria-hidden="true">' + (live ? "\u25A0" : "\uD83D\uDD0A") + '</span>' +
      '<span class="sr">' + esc((live ? "עצירת ההקראה של " : "הקראת ") + label) + '</span></button>';
  }
  /* פסקה שאפשר להקריא: הטקסט והכפתור באותו בלוק. */
  function sayBlock(html, label, cls) {
    var id = sayId();
    return '<div class="say ' + (cls || "") + '" id="' + id + '">' + html +
           speechBtn(id, label) + '</div>';
  }

  /* בורר המהירות. שלוש מהירויות, כפתורים גדולים, והבחירה נשמרת. */
  function rateBar() {
    if (!(g.Speech && g.Speech.ready())) {
      return '<p class="sub warn-line" role="status">' + esc(g.Speech ? g.Speech.unavailableReason() : "") + '</p>';
    }
    var cur = g.Speech.getRate();
    var err = g.Speech.error();
    var h = '<div class="rate" role="group" aria-label="מהירות ההקראה" data-nospeak>' +
      '<span class="sub">מהירות</span>' +
      g.Speech.rates().map(function (r) {
        return '<button class="btn ghost' + (r.id === cur ? " on" : "") + '" data-rate="' + r.id + '" ' +
               'aria-pressed="' + (r.id === cur ? "true" : "false") + '">' + esc(r.label) + '</button>';
      }).join("") + '</div>';
    if (err) h += '<p class="sub bad-line" role="alert">מנוע ההקראה של המכשיר החזיר שגיאה (' +
                  esc(err) + '). נסו שוב, או בדקו שהקול פועל בהגדרות המכשיר.</p>';
    return h;
  }

  function viewHome() {
    var ex = (g.EXAMS || [])[0];
    var h = '<h1>בגרות 806</h1>' +
      sayBlock('<p class="lead">מתמטיקה, 5 יחידות. כל טקסט וכל נוסחה נשמעים לפני שקוראים אותם.</p>',
               "הכותרת") + rateBar();
    h += '<div class="grid">' +
      '<button class="tile" data-go="sim"><span class="tn">סימולציה</span>' +
        '<span class="td">בחינה מלאה עם שעון' + (ex ? ' · ' + ex.durationMinutes + ' דקות' : '') +
        '. בלי רמזים ובלי פתרונות עד הסיום.</span></button>' +
      '<button class="tile" data-go="practice"><span class="tn">תרגול מודרך</span>' +
        '<span class="td">שאלה אחת בכל פעם, רמזים נחשפים אחד-אחד, והפתרון המלא אחרון.</span></button>' +
      '</div>';
    h += '<section class="card build"><h2>מצב הבנייה</h2><ol class="stages">' +
      '<li class="done">שלד, סכמת הנתונים, שאלת דמה, ושני המצבים כמסכים</li>' +
      '<li class="done">מנוע ההקראה</li>' +
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
      sayBlock('<p class="lead">בחינה מלאה' + (ex ? ', ' + ex.durationMinutes + ' דקות' : '') +
      '. שעון סופר לאחור, בלי רמזים ובלי פתרונות עד הסיום, ובסוף דוח לפי נושא.</p>', "הסבר הסימולציה") +
      '<div class="card todo"><h2>המסך הזה עוד ריק</h2>' +
      '<p>השעון, ניווט בין השאלות ודוח הסיום נבנים בשלבים 3 ו-4.</p></div>';
  }

  function subHtml(sq) {
    var body = '<p>' + esc(sq.text) + '</p>' + (sq.latex ? renderMath(sq.latex, sq.speech) : "");
    return '<li class="sub-q">' +
      '<div class="row" data-nospeak><b>סעיף ' + esc(sq.letter) + '</b>' +
      '<span class="pts">' + sq.points + ' נק\'</span></div>' +
      sayBlock(body, "סעיף " + sq.letter) +
      '<p class="sub" data-nospeak>' + sq.steps.length + ' שלבי רמז · תשובה סופית מסוג ' +
      esc(sq.finalAnswer ? sq.finalAnswer.type : "—") + ' — נחשפים בשלב 3.</p></li>';
  }

  function viewPractice() {
    var ex = (g.EXAMS || [])[0];
    var h = '<h1>תרגול מודרך</h1>' +
      sayBlock('<p class="lead">בחירת נושא, שאלה אחת בכל פעם, ורמזים שנחשפים רק כשמבקשים.</p>',
               "הסבר התרגול") + rateBar() +
      '<div class="card todo"><h2>המסך הזה עוד ריק</h2>' +
      '<p>בחירת הנושא וחשיפת הרמזים נבנות בשלב 3. מתחת מוצגת שאלת ההדגמה, ' +
      'כדי שאפשר יהיה לראות שהסכמה עובדת מקצה לקצה.</p></div>';
    if (!ex) return h;
    var q = ex.questions[0];
    h += '<article class="card q">' +
      '<div class="row" data-nospeak><span class="chip">' + esc(q.topic) + '</span>' +
      (ex.demo ? '<span class="chip warn">שאלת הדגמה — לא מתוך שאלון אמיתי</span>' : '') + '</div>' +
      '<h2 data-nospeak>שאלה ' + q.number + '</h2>' +
      sayBlock('<p>' + esc(q.text) + '</p>' + renderMath(q.latex, q.speech), "השאלה") +
      '<ol class="subs">' + q.subQuestions.map(subHtml).join("") + '</ol></article>';
    return h;
  }

  function render() {
    sayN = 0;
    var body = view === "sim" ? viewSim() : view === "practice" ? viewPractice() : viewHome();
    var back = view === "home" ? "" :
      '<button class="btn ghost back" data-go="home">→ חזרה</button>';
    $("#app").innerHTML = back + body;
    $("#app").focus();
    window.scrollTo(0, 0);
  }
  /* ציור מחדש מוחק את הבלוק שמוקרא ממנו. עוצרים לפני. */
  function goTo(v) {
    if (g.Speech) g.Speech.stop();
    view = v; render();
  }
  /* המנוע מודיע על התחלה, עצירה וסיום — והכפתור מתחלף בהתאם.
     מרעננים רק את הכפתורים ואת בורר המהירות, ולא את כל המסך:
     ציור מלא היה מוחק את ה-span-ים שההדגשה יושבת עליהם. */
  function syncButtons() {
    var cur = g.Speech.currentNode();
    var btns = document.querySelectorAll(".spk");
    for (var i = 0; i < btns.length; i++) {
      var live = !!(cur && cur.id === btns[i].getAttribute("data-say"));
      btns[i].classList.toggle("live", live);
      btns[i].setAttribute("aria-pressed", live ? "true" : "false");
      btns[i].title = live ? "עצירה" : "הקראה";
      var icon = btns[i].firstChild;
      if (icon) icon.textContent = live ? "\u25A0" : "\uD83D\uDD0A";
    }
    var bars = document.querySelectorAll(".rate button");
    for (var k = 0; k < bars.length; k++) {
      var on = bars[k].getAttribute("data-rate") === g.Speech.getRate();
      bars[k].classList.toggle("on", on);
      bars[k].setAttribute("aria-pressed", on ? "true" : "false");
    }
    /* שגיאת מנוע חייבת להופיע מיד ולא בציור הבא. בלי זה המשתמש
       לוחץ, לא שומע כלום, ואין על המסך דבר שיסביר למה — וזו בדיוק
       התקלה שנראית כמו אפליקציה שבורה בזמן שהמנוע של המכשיר הוא
       שנכשל. */
    var err = g.Speech.error();
    var boxes = document.querySelectorAll(".rate");
    for (var m = 0; m < boxes.length; m++) {
      var nx = boxes[m].nextElementSibling;
      var has = nx && nx.classList.contains("bad-line");
      if (err && !has) {
        var p = document.createElement("p");
        p.className = "sub bad-line"; p.setAttribute("role", "alert");
        p.setAttribute("data-nospeak", "");
        p.textContent = "מנוע ההקראה של המכשיר החזיר שגיאה (" + err +
          "). נסו שוב, או בדקו שהקול פועל בהגדרות המכשיר.";
        boxes[m].parentNode.insertBefore(p, boxes[m].nextSibling);
      } else if (!err && has) {
        nx.parentNode.removeChild(nx);
      }
    }
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
    var el = e.target.closest("[data-go],[data-act],[data-say],[data-rate]");
    if (!el) return;

    var say = el.getAttribute("data-say");
    if (say) {
      /* בתוך המגע ממש, בלי await ובלי setTimeout: אמירה שיוצאת
         מאוחר יותר נזרקת בשקט באנדרואיד ובספארי. */
      g.Speech.speak(document.getElementById(say));
      return;
    }
    var rate = el.getAttribute("data-rate");
    if (rate) {
      g.Speech.setRate(rate);
      /* המהירות נכנסת לתוקף באמירה הבאה. אם כרגע מקריאים —
         מתחילים מחדש את אותו בלוק, אחרת השינוי נראה כאילו לא קרה. */
      var cur = g.Speech.currentNode();
      if (cur) { var id = cur.id; g.Speech.stop(); g.Speech.speak(document.getElementById(id)); }
      return;
    }
    var go = el.getAttribute("data-go");
    if (go) { goTo(go); return; }
    if (el.getAttribute("data-act") === "reset") {
      if (confirm("למחוק את כל ההתקדמות במכשיר הזה?")) { g.Speech.stop(); resetAll(); render(); }
    }
  });

  load();
  showErrors(validate(g.EXAMS));
  render();
  g.Speech.onChange(syncButtons);
  g.APP = { validate: validate, render: render, store: function () { return store; } };
  /* רשימת הקולות מגיעה מאוחר; כשהיא כאן, בורר המהירות מתעדכן. */
  if (g.Speech.ready()) g.Speech.voicesReady().then(syncButtons);
})(window);
