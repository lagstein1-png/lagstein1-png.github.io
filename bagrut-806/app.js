/* ============================================================
   בגרות 806 — לוגיקה
   ------------------------------------------------------------
   שני מצבי עבודה, ושניהם רצים מעל אותו מאגר:
     · תרגול מודרך — בחירת נושא, שאלה אחת בכל פעם, רמזים שנחשפים
       אחד-אחד, והפתרון המלא אחרון.
     · סימולציה — בחינה מלאה עם שעון סופר לאחור, בלי רמזים ובלי
       פתרונות עד הסיום, ובסוף דוח לפי נושא.

   שלושה עקרונות שקבעו את המבנה:
   1. **רמז אינו פתרון.** `hint` שואל שאלה ומכוון; `detail` פותר.
      השניים לא מתערבבים, והפתרון אינו נחשף בטעות בדרך.
   2. **תשובה שגויה אינה סוף.** היא מציעה את הרמז הבא, לא את
      התשובה. הרמז נחשף רק בבקשה מפורשת.
   3. **מה שנקרא הוא מה שכתוב.** כל בלוק טקסט מקבל כפתור הקראה,
      ומנוע ההקראה שואב את הטקסט מה-DOM. לנוסחה יש `data-speech`,
      ולכן ה-LaTeX אינו מגיע לקול לעולם.
   ============================================================ */
(function (g) {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ============================================================
     1. שמירת התקדמות
     ============================================================ */
  var LS_KEY = "bagrut806-v1";
  var SIM_KEY = "bagrut806-sim";
  var store = { solved: {}, sims: [], weak: {} };

  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (o && typeof o === "object") {
        store.solved = o.solved || {};
        store.sims   = o.sims   || [];
        store.weak   = o.weak   || {};
      }
    } catch (e) { /* מכשיר שחוסם אחסון — האפליקציה עובדת בלעדיו */ }
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch (e) {}
  }
  function resetAll() {
    store = { solved: {}, sims: [], weak: {} };
    try { localStorage.removeItem(LS_KEY); localStorage.removeItem(SIM_KEY); } catch (e) {}
    sim = null;
  }
  /* נושא נחשב חלש לפי היחס בין נכון לשגוי, ולא לפי מונה שגיאות:
     מי שפתר עשרים שאלות ונפל בשתיים אינו חלש יותר ממי שפתר שתיים
     ונפל באחת. */
  function noteTopic(topic, ok) {
    var w = store.weak[topic] || (store.weak[topic] = { right: 0, wrong: 0 });
    if (ok) w.right++; else w.wrong++;
    save();
  }
  function topicScore(topic) {
    var w = store.weak[topic];
    if (!w || (w.right + w.wrong) === 0) return null;
    return Math.round(100 * w.right / (w.right + w.wrong));
  }

  /* ============================================================
     2. בדיקת הסכמה
     נבדקת בטעינה ומוצגת על המסך. `latex` בלי `speech` אינו ליקוי
     קוסמטי: הוא אומר שההקראה תקרא LaTeX גולמי — בדיוק מה
     שהאפליקציה קיימת כדי למנוע.
     ============================================================ */
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
            need(["number", "expression", "text", "open"].indexOf(sq.finalAnswer.type) >= 0,
                 sa + ": finalAnswer.type חייב להיות number, expression, text או open.");
            /* open הוא סעיף שאין לו תשובה יחידה — "הוכיחו ש…",
               "הסבירו", "שרטטו". `value` בו הוא תשובת מופת להשוואה
               עצמית, ולכן הוא רשות. בשאר הסוגים הוא חובה. */
            if (sq.finalAnswer.type !== "open") {
              need(sq.finalAnswer.value !== undefined && sq.finalAnswer.value !== null,
                   sa + ": finalAnswer בלי value.");
            }
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

  /* ============================================================
     3. בדיקת התשובה הסופית
     ------------------------------------------------------------
     תלמיד שכותב את התשובה הנכונה בכתיב אחר ומקבל "טעית" מפסיק
     לסמוך על האפליקציה. לכן הנרמול כאן רחב בכוונה, וכל כלל בו
     הוא כתיב שתלמיד באמת כותב:
       0.1333 · 2/15 · 13.33% · 0,1333 · x = 1 · ‎-3 עם מינוס יוניקוד
     מה שאינו מנורמל הוא הערך עצמו. סובלנות היא שדה בסכמה, לא
     ניחוש של הקוד.
     ============================================================ */
  var BIDI = /[‎‏؜‪-‮]/g;
  var DASH = /[־‐-―−﹣－]/g;

  function parseNum(raw) {
    var t = String(raw == null ? "" : raw).trim();
    if (!t) return null;
    var pct = /%\s*$/.test(t);
    t = t.replace(BIDI, "").replace(DASH, "-").replace(/%/g, "")
         .replace(/^[^\d\-.,/]*=/, "")        /* "x =" , "P =" , "התשובה:" */
         .replace(/\s+/g, "");
    /* פסיק הוא נקודה עשרונית רק כשאין נקודה במחרוזת. "1,000.5"
       הוא מפריד אלפים, "0,35" הוא שבר עשרוני. */
    if (t.indexOf(".") >= 0) t = t.replace(/,/g, "");
    else if (/^-?\d+,\d+$/.test(t)) t = t.replace(",", ".");
    else t = t.replace(/,/g, "");
    var v, m = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (m) { if (+m[2] === 0) return null; v = (+m[1]) / (+m[2]); }
    else if (/^-?\d+(?:\.\d+)?$/.test(t)) v = +t;
    else return null;
    return pct ? v / 100 : v;
  }
  function normExpr(raw) {
    return String(raw == null ? "" : raw).trim().toLowerCase()
      .replace(BIDI, "").replace(DASH, "-")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4")
      .replace(/^[a-z]'?\s*\([a-z]\)\s*=/, "")   /* "f'(x) =" */
      .replace(/^[a-z]\s*=/, "")                  /* "y =" */
      .replace(/[·×∙*]/g, "")                     /* כפל מפורש ומשתמע — אותו דבר */
      .replace(/\s+/g, "")
      .replace(/^\+/, "");
  }
  function normText(raw) {
    return String(raw == null ? "" : raw).trim().toLowerCase()
      .replace(BIDI, "")
      .replace(/[֑-ׇ]/g, "")            /* ניקוד וטעמים */
      .replace(/["'״׳`]/g, "")
      .replace(/[.!?,;:]+$/, "")
      .replace(/\s+/g, " ");
  }
  /* מחזיר null כשאין מה לבדוק, אחרת {ok, msg} */
  /* סעיף פתוח — אין מה להשוות אליו. סעיף בלי finalAnswer כלל נחשב
     פתוח גם הוא: עדיף להציג אותו כ"לבדיקה עצמית" מאשר לסמן אותו
     כשגוי, וזה בדיוק מה שקרה עד כאן. */
  function isOpen(sq) { return !sq || !sq.finalAnswer || sq.finalAnswer.type === "open"; }

  function checkAnswer(fa, raw) {
    if (!fa || fa.type === "open") return null;
    if (!String(raw == null ? "" : raw).trim()) return { ok: false, msg: "עוד לא כתבתם תשובה." };
    if (fa.type === "number") {
      var v = parseNum(raw);
      if (v === null) return { ok: false, msg: "לא הצלחתי לקרוא את זה כמספר. אפשר לכתוב 0.35, או 7/20, או 35%." };
      var tol = typeof fa.tolerance === "number" ? fa.tolerance : 0;
      return { ok: Math.abs(v - fa.value) <= tol + 1e-9, msg: "" };
    }
    if (fa.type === "expression") return { ok: normExpr(raw) === normExpr(fa.value), msg: "" };
    return { ok: normText(raw) === normText(fa.value), msg: "" };
  }
  /* ערך תשובה בתוך משפט עברי. "3x^2-12x+9" מוצג הפוך כשהוא יושב
     בזרם RTL, ו-"9+12x-2^3x" אינו התשובה שהתלמיד כתב. <bdi> מבודד
     את הקטע ומסיק את כיוונו לבד — ולכן ביטוי יוצא משמאל לימין
     ומילה עברית נשארת מימין לשמאל, באותו קוד. */
  function ansTxt(v) { return "<bdi>" + esc(String(v == null || v === "" ? "—" : v)) + "</bdi>"; }

  var TYPE_HINT = {
    number: "מספר. אפשר גם שבר (7/20) וגם אחוז (35%).",
    expression: "ביטוי. חזקה נכתבת עם ^, למשל 3x^2.",
    text: "מילה או שתיים.",
    open: "סעיף פתוח — כתבו את התשובה במילים שלכם. אין כאן בדיקה אוטומטית."
  };

  /* ============================================================
     4. עזרי מאגר
     ============================================================ */
  function exam() { return (g.EXAMS || [])[0] || null; }
  function topics() {
    var ex = exam(), seen = {}, out = [];
    if (!ex) return out;
    ex.questions.forEach(function (q) {
      if (!seen[q.topic]) { seen[q.topic] = { topic: q.topic, qs: [] }; out.push(seen[q.topic]); }
      seen[q.topic].qs.push(q);
    });
    return out;
  }
  function subId(q, sq) { return (exam() ? exam().id : "?") + "/" + q.number + "/" + sq.letter; }
  function allSubs() {
    var out = [], ex = exam();
    if (ex) ex.questions.forEach(function (q) {
      q.subQuestions.forEach(function (sq) { out.push({ q: q, sq: sq, id: subId(q, sq) }); });
    });
    return out;
  }

  /* ============================================================
     5. נוסחאות
     כאן, ורק כאן, נכנס KaTeX. עד שהוא יותקן מוצג ה-LaTeX כמקור
     ומסומן ככזה — עדיף מלהעמיד פנים שהוא עוּבד.
     ============================================================ */
  function renderMath(latex, speech) {
    if (!latex) return "";
    if (g.katex && typeof g.katex.renderToString === "function") {
      try {
        return '<span class="tex" data-speech="' + esc(speech || "") + '">' +
               g.katex.renderToString(latex, { throwOnError: false, displayMode: true }) + "</span>";
      } catch (e) { /* נופלים לתצוגה הגולמית */ }
    }
    return '<span class="tex raw" data-speech="' + esc(speech || "") + '">' +
           "<code>" + esc(latex) + "</code>" +
           "<em>KaTeX עוד לא הותקן — הנוסחה מוצגת כמקור</em></span>";
  }

  /* ============================================================
     6. הקראה — בלוקים, כפתורים ובורר מהירות
     ============================================================ */
  var sayN = 0;
  function sayId() { return "say" + (++sayN); }
  function speechBtn(id, label) {
    var on = g.Speech && g.Speech.ready();
    var live = on && g.Speech.currentNode() && g.Speech.currentNode().id === id;
    return '<button class="btn ghost spk' + (live ? " live" : "") + '" type="button" data-say="' + id + '" ' +
      (on ? "" : 'disabled aria-disabled="true" ') +
      'aria-pressed="' + (live ? "true" : "false") + '" ' +
      'title="' + esc(on ? (live ? "עצירה" : "הקראה") : (g.Speech ? g.Speech.unavailableReason() : "")) + '">' +
      '<span aria-hidden="true">' + (live ? "■" : "🔊") + "</span>" +
      '<span class="sr">' + esc((live ? "עצירת ההקראה של " : "הקראת ") + label) + "</span></button>";
  }
  function sayBlock(html, label, cls) {
    var id = sayId();
    return '<div class="say ' + (cls || "") + '" id="' + id + '">' + html + speechBtn(id, label) + "</div>";
  }
  function rateBar() {
    if (!(g.Speech && g.Speech.ready())) {
      return '<p class="sub warn-line" role="status" data-nospeak>' +
             esc(g.Speech ? g.Speech.unavailableReason() : "") + "</p>";
    }
    var cur = g.Speech.getRate();
    return '<div class="rate" role="group" aria-label="מהירות ההקראה" data-nospeak>' +
      '<span class="sub">מהירות</span>' +
      g.Speech.rates().map(function (r) {
        return '<button class="btn ghost' + (r.id === cur ? " on" : "") + '" data-rate="' + r.id + '" ' +
               'aria-pressed="' + (r.id === cur ? "true" : "false") + '">' + esc(r.label) + "</button>";
      }).join("") + "</div>";
  }

  /* ============================================================
     7. מצב המסך
     ============================================================ */
  var view = "home";
  var pr = { topic: null, qi: 0, si: 0, reveal: 0, full: false, said: "", tries: 0, noted: false };
  var draft = {};      /* מה שנכתב בתיבות, לפי מזהה סעיף */
  var sim = null;      /* הסימולציה הפעילה */

  function clockTxt(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (ss < 10 ? "0" : "") + ss;
  }

  /* ============================================================
     8. תרגול מודרך
     ============================================================ */
  function prTopicList() {
    var h = "<h1>תרגול מודרך</h1>" +
      sayBlock('<p class="lead">בוחרים נושא, פותרים שאלה אחת בכל פעם, ומבקשים רמז רק כשצריך. ' +
               "הפתרון המלא מחכה בסוף — הוא לא קופץ מעצמו.</p>", "הסבר התרגול") + rateBar();
    h += '<div class="grid" data-nospeak>' + topics().map(function (t) {
      var sc = topicScore(t.topic);
      var n = 0; t.qs.forEach(function (q) { n += q.subQuestions.length; });
      var done = 0;
      t.qs.forEach(function (q) {
        q.subQuestions.forEach(function (sq) { if (store.solved[subId(q, sq)]) done++; });
      });
      return '<button class="tile" data-topic="' + esc(t.topic) + '">' +
        '<span class="tn">' + esc(t.topic) + "</span>" +
        '<span class="td">' + t.qs.length + " שאלות · " + n + " סעיפים · נפתרו " + done + "</span>" +
        (sc === null ? "" : '<span class="bar" aria-hidden="true"><i style="width:' + sc + '%"></i></span>' +
          '<span class="td">' + sc + "% נכון עד כה</span>") +
        "</button>";
    }).join("") + "</div>";
    return h;
  }

  function prQuestion() {
    var list = topics().filter(function (t) { return t.topic === pr.topic; })[0];
    if (!list) { pr.topic = null; return prTopicList(); }
    var q = list.qs[Math.min(pr.qi, list.qs.length - 1)];
    var sq = q.subQuestions[Math.min(pr.si, q.subQuestions.length - 1)];
    var id = subId(q, sq);
    var rec = store.solved[id];
    var res = pr.said ? checkAnswer(sq.finalAnswer, pr.said) : null;

    var h = '<div class="row" data-nospeak>' +
      '<button class="btn ghost" data-go="practice">→ ' + esc(pr.topic) + "</button>" +
      '<span class="chip">שאלה ' + q.number + " · סעיף " + esc(sq.letter) + "</span>" +
      '<span class="pts">' + sq.points + " נק'</span>" +
      (rec ? '<span class="chip ok">נפתר</span>' : "") + "</div>" + rateBar();

    h += '<article class="card q">' +
      sayBlock("<p>" + esc(q.text) + "</p>" + renderMath(q.latex, q.speech), "השאלה") +
      sayBlock('<p class="ask">' + esc(sq.text) + "</p>" + renderMath(sq.latex, sq.speech),
               "סעיף " + sq.letter, "ask-block");

    /* --- תיבת התשובה --- */
    if (isOpen(sq)) {
      h += '<div class="answer" data-nospeak>' +
        '<label for="ans">התשובה שלכם</label>' +
        '<p class="sub">' + esc(TYPE_HINT.open) + "</p>" +
        '<textarea id="ans" class="field ta" rows="4" spellcheck="false" ' +
        'placeholder="כתבו כאן">' + esc(draft[id] || "") + "</textarea></div>";
    } else {
      h += '<div class="answer" data-nospeak>' +
        '<label for="ans">התשובה שלכם</label>' +
        '<p class="sub">' + esc(TYPE_HINT[sq.finalAnswer.type] || "") + "</p>" +
        '<div class="row">' +
        '<input id="ans" class="field" value="' + esc(draft[id] || "") + '" ' +
        'inputmode="' + (sq.finalAnswer.type === "number" ? "decimal" : "text") + '" ' +
        'autocomplete="off" autocapitalize="off" spellcheck="false" ' +
        'aria-describedby="ansmsg" placeholder="כתבו כאן">' +
        '<button class="btn" data-act="check">בדיקה</button></div>';
      h += '<p id="ansmsg" role="status" class="msg' +
           (res ? (res.ok ? " ok" : " bad") : "") + '">' +
           (res ? (res.ok ? "נכון. " + (pr.tries === 1 ? "מהניסיון הראשון." : "אחרי " + pr.tries + " ניסיונות.")
                          : (res.msg || "לא זו התשובה. אפשר לנסות שוב, או לבקש רמז."))
                : "") + "</p>";
      h += "</div>";
    }

    /* --- רמזים. נחשפים אחד-אחד ורק בבקשה --- */
    var steps = sq.steps || [];
    h += '<div class="hints">';
    for (var i = 0; i < Math.min(pr.reveal, steps.length); i++) {
      h += sayBlock('<p class="hint"><b data-nospeak>רמז ' + (i + 1) + "</b> " + esc(steps[i].hint) + "</p>",
                    "רמז " + (i + 1), "hint-block");
    }
    if (pr.reveal < steps.length) {
      h += '<button class="btn ghost w" data-act="hint" data-nospeak>' +
           (pr.reveal ? "עוד רמז (" + (pr.reveal + 1) + " מתוך " + steps.length + ")"
                      : "רמז ראשון (מתוך " + steps.length + ")") + "</button>";
    } else if (!pr.full) {
      h += '<button class="btn ghost w" data-act="full" data-nospeak>הפתרון המלא</button>';
    }
    if (pr.full) {
      h += '<div class="solution"><h3 data-nospeak>הפתרון המלא</h3>' +
        steps.map(function (st, k) {
          return sayBlock('<p><b data-nospeak>שלב ' + (k + 1) + "</b> " + esc(st.detail) + "</p>",
                          "שלב " + (k + 1), "step-block");
        }).join("") +
        (sq.finalAnswer && sq.finalAnswer.value !== undefined && sq.finalAnswer.value !== null ?
          '<p class="final" data-nospeak><b>' + (isOpen(sq) ? "תשובת מופת: " : "התשובה: ") + "</b>" +
          ansTxt(sq.finalAnswer.value) + "</p>" : "") +
        "</div>";
    }
    h += "</div></article>";

    /* --- מעבר לסעיף הבא --- */
    var flat = [], k;
    list.qs.forEach(function (qq, qi) {
      qq.subQuestions.forEach(function (ss, si) { flat.push({ qi: qi, si: si }); });
    });
    var at = -1;
    for (k = 0; k < flat.length; k++) if (flat[k].qi === list.qs.indexOf(q) && flat[k].si === q.subQuestions.indexOf(sq)) at = k;
    h += '<div class="row nav-row" data-nospeak>' +
      (at > 0 ? '<button class="btn ghost" data-act="prev">→ הקודם</button>' : "") +
      (at >= 0 && at < flat.length - 1 ? '<button class="btn" data-act="next">הסעיף הבא ←</button>'
                                       : '<button class="btn" data-go="practice">סיימנו את הנושא</button>') +
      "</div>";
    return h;
  }

  /* ============================================================
     9. סימולציה
     ------------------------------------------------------------
     השעון והתשובות נשמרים במכשיר. תלמיד שהדפדפן שלו רענן באמצע
     בחינה לא מאבד את התשובות, וגם לא מקבל זמן נוסף במתנה: שעת
     ההתחלה נשמרת, לא הזמן שנותר.
     ============================================================ */
  function simSave() {
    try { localStorage.setItem(SIM_KEY, JSON.stringify(sim)); } catch (e) {}
  }
  function simLoad() {
    try {
      var o = JSON.parse(localStorage.getItem(SIM_KEY) || "null");
      if (o && o.examId && o.startedAt) sim = o;
    } catch (e) {}
  }
  function simDrop() { sim = null; try { localStorage.removeItem(SIM_KEY); } catch (e) {} }
  function simLeft() {
    if (!sim) return 0;
    var ex = exam();
    return (sim.startedAt + (ex ? ex.durationMinutes : 0) * 60000) - Date.now();
  }
  function simStart() {
    var ex = exam(); if (!ex) return;
    sim = { examId: ex.id, startedAt: Date.now(), answers: {}, done: false };
    simSave(); view = "simrun"; render(); tick();
  }
  /* סעיף פתוח אינו נכשל — הוא יוצא מהמניין. עד כאן הוא נספר כשגוי
     והנקודות שלו נשארו במכנה, ולכן תלמיד שכתב הוכחה מושלמת קיבל
     עליה אפס. בבגרות אמיתית יש "הוכיחו ש…", "הסבירו" ו"שרטטו"
     כמעט בכל שאלון, ולכן זה לא מקרה קצה אלא רוב התוכן. */
  function simGrade() {
    var per = {}, got = 0, tot = 0, rows = [], open = [], openPts = 0;
    allSubs().forEach(function (s) {
      var raw = sim.answers[s.id] || "";
      if (isOpen(s.sq)) {
        openPts += s.sq.points;
        open.push({ id: s.id, q: s.q, sq: s.sq, raw: raw });
        return;
      }
      var r = checkAnswer(s.sq.finalAnswer, raw);
      var ok = !!(r && r.ok);
      tot += s.sq.points; if (ok) got += s.sq.points;
      var p = per[s.q.topic] || (per[s.q.topic] = { topic: s.q.topic, got: 0, tot: 0, wrong: [] });
      p.tot += s.sq.points; if (ok) p.got += s.sq.points; else p.wrong.push(s.q.number + esc(s.sq.letter));
      rows.push({ id: s.id, q: s.q, sq: s.sq, raw: raw, ok: ok });
    });
    var list = [];
    for (var t in per) list.push(per[t]);
    list.sort(function (a, b) { return (a.got / a.tot) - (b.got / b.tot); });
    return { got: got, tot: tot, pct: tot ? Math.round(100 * got / tot) : 0,
             byTopic: list, rows: rows, open: open, openPts: openPts };
  }
  function simFinish() {
    if (!sim || sim.done) return;
    sim.done = true; sim.endedAt = Date.now();
    var res = simGrade();
    res.rows.forEach(function (r) { noteTopic(r.q.topic, r.ok); });
    store.sims.unshift({
      examId: sim.examId, at: new Date().toISOString().slice(0, 10),
      pct: res.pct, got: res.got, tot: res.tot,
      minutes: Math.max(1, Math.round((sim.endedAt - sim.startedAt) / 60000)),
      byTopic: res.byTopic.map(function (t) { return { topic: t.topic, got: t.got, tot: t.tot }; })
    });
    store.sims = store.sims.slice(0, 20);
    save(); simSave();
    view = "simreport"; render();
  }

  var ticker = null;
  function tick() {
    if (ticker) { clearInterval(ticker); ticker = null; }
    if (!sim || sim.done) return;
    ticker = setInterval(function () {
      if (!sim || sim.done || view !== "simrun") { clearInterval(ticker); ticker = null; return; }
      var el = $("#clock");
      var left = simLeft();
      if (left <= 0) { clearInterval(ticker); ticker = null; simFinish(); return; }
      if (el) {
        el.textContent = clockTxt(left);
        el.classList.toggle("low", left < 10 * 60000);
      }
    }, 1000);
  }

  function simIntro() {
    var ex = exam();
    var h = "<h1>סימולציה</h1>" +
      sayBlock('<p class="lead">בחינה מלאה' + (ex ? ", " + ex.durationMinutes + " דקות" : "") +
        ". השעון סופר לאחור ובסופו הבחינה מוגשת מעצמה. אין רמזים ואין פתרונות עד הסיום — " +
        "בדיוק כמו בבחינה עצמה. יציאה באמצע אינה מוחקת דבר.</p>", "הסבר הסימולציה") + rateBar();
    if (sim && !sim.done) {
      h += '<div class="card" data-nospeak><h2>יש סימולציה פתוחה</h2>' +
        "<p>נותרו " + clockTxt(simLeft()) + ".</p>" +
        '<div class="row"><button class="btn" data-act="simresume">חזרה אליה</button>' +
        '<button class="btn danger" data-act="simdrop">לוותר עליה</button></div></div>';
    } else {
      h += '<button class="btn w big" data-act="simstart" data-nospeak>מתחילים את הבחינה</button>';
    }
    if (store.sims.length) {
      h += '<section class="card" data-nospeak><h2>סימולציות קודמות</h2>' +
        store.sims.slice(0, 5).map(function (s) {
          return '<div class="hist"><span>' + esc(s.at) + "</span>" +
            '<span class="chip ' + (s.pct >= 70 ? "ok" : s.pct >= 55 ? "warn" : "bad") + '">' + s.pct + "</span>" +
            '<span class="sub">' + s.got + " מתוך " + s.tot + " נק' · " + s.minutes + " דק'</span></div>";
        }).join("") + "</section>";
    }
    return h;
  }

  function simRun() {
    var ex = exam(); if (!ex || !sim) { view = "sim"; return simIntro(); }
    var left = simLeft();
    var answered = 0, total = 0;
    allSubs().forEach(function (s) { total++; if ((sim.answers[s.id] || "").trim()) answered++; });
    var h = '<div class="simbar" data-nospeak>' +
      '<span class="chip' + (left < 10 * 60000 ? " bad" : "") + '" id="clock" aria-live="off">' + clockTxt(left) + "</span>" +
      '<span class="sub">' + answered + " מתוך " + total + " סעיפים נענו</span>" +
      '<button class="btn" data-act="simsubmit">הגשה</button></div>';
    h += rateBar();
    ex.questions.forEach(function (q) {
      h += '<article class="card q">' +
        '<div class="row" data-nospeak><span class="chip">' + esc(q.topic) + "</span>" +
        "<b>שאלה " + q.number + "</b></div>" +
        sayBlock("<p>" + esc(q.text) + "</p>" + renderMath(q.latex, q.speech), "שאלה " + q.number);
      q.subQuestions.forEach(function (sq) {
        var id = subId(q, sq);
        h += '<div class="sub-q">' +
          '<div class="row" data-nospeak><b>סעיף ' + esc(sq.letter) + "</b>" +
          '<span class="pts">' + sq.points + " נק'</span></div>" +
          sayBlock("<p>" + esc(sq.text) + "</p>" + renderMath(sq.latex, sq.speech), "סעיף " + sq.letter) +
          '<div class="answer" data-nospeak>' +
            '<label class="sr" for="a-' + esc(id) + '">תשובה לסעיף ' + esc(sq.letter) + "</label>" +
            (isOpen(sq) ?
              '<textarea id="a-' + esc(id) + '" class="field ta" data-sim="' + esc(id) + '" rows="4" ' +
              'spellcheck="false" placeholder="' + esc(TYPE_HINT.open) + '">' +
              esc(sim.answers[id] || "") + "</textarea>" :
              '<input id="a-' + esc(id) + '" class="field" data-sim="' + esc(id) + '" ' +
              'inputmode="' + (sq.finalAnswer.type === "number" ? "decimal" : "text") + '" ' +
              'autocomplete="off" spellcheck="false" placeholder="' + esc(TYPE_HINT[sq.finalAnswer.type] || "") + '" ' +
              'value="' + esc(sim.answers[id] || "") + '">') + "</div>" +
          "</div>";
      });
      h += "</article>";
    });
    h += '<button class="btn w big" data-act="simsubmit" data-nospeak>הגשת הבחינה</button>';
    return h;
  }

  function simReport() {
    var res = simGrade();
    var h = "<h1>הבחינה הוגשה</h1>" +
      '<div class="score" data-nospeak><span class="big-num ' +
      (res.pct >= 70 ? "ok" : res.pct >= 55 ? "warn" : "bad") + '">' + res.pct + "</span>" +
      "<span>" + res.got + " נקודות מתוך " + res.tot +
      (res.openPts ? " · " + res.openPts + " נק' בסעיפים פתוחים אינן נבדקות אוטומטית" : "") +
      "</span></div>";
    h += sayBlock('<p class="lead">הציון הזה אינו ציון בגרות. מה שיש לו ערך הוא הטבלה שמתחת: ' +
                  "היא אומרת באיזה נושא ליפול פחות בפעם הבאה.</p>", "הסבר הדוח") + rateBar();
    h += '<section class="card" data-nospeak><h2>לפי נושא</h2>' +
      '<p class="sub">מהחלש לחזק.</p>' +
      res.byTopic.map(function (t) {
        var p = t.tot ? Math.round(100 * t.got / t.tot) : 0;
        return '<button class="hist wide" data-topic="' + esc(t.topic) + '">' +
          '<span class="tt"><b>' + esc(t.topic) + "</b>" +
          "<span>" + t.got + " מתוך " + t.tot + " נק'" +
          (t.wrong.length ? " · נפלתם ב-" + t.wrong.join(", ") : "") + "</span></span>" +
          '<span class="chip ' + (p >= 70 ? "ok" : p >= 40 ? "warn" : "bad") + '">' + p + "</span></button>";
      }).join("") + "</section>";
    if (res.open.length) {
      h += '<section class="card"><h2 data-nospeak>לבדיקה עצמית</h2>' +
        '<p class="sub" data-nospeak>' + res.open.length + " סעיפים פתוחים · " + res.openPts +
        " נק' שאינן נכללות בציון שלמעלה. אין להם תשובה יחידה, ולכן אין כאן בדיקה אוטומטית — " +
        "משווים למה שכתבתם.</p>" +
        res.open.map(function (r) {
          var model = r.sq.finalAnswer && r.sq.finalAnswer.value;
          return '<div class="hist wide" style="display:block">' +
            "<b>" + r.q.number + esc(r.sq.letter) + " · " + esc(r.q.topic) + " · " + r.sq.points + " נק'</b>" +
            '<p class="sub" data-nospeak>כתבתם:</p><p class="openans">' +
            (r.raw ? esc(r.raw) : "— לא נכתבה תשובה") + "</p>" +
            (model ? '<p class="sub" data-nospeak>תשובת מופת:</p><p class="openans model">' +
                     esc(String(model)) + "</p>" : "") +
            "</div>";
        }).join("") + "</section>";
    }
    h += '<section class="card"><h2 data-nospeak>סעיף אחרי סעיף</h2>' +
      res.rows.map(function (r) {
        var corr = r.sq.finalAnswer ? r.sq.finalAnswer.value : "—";
        return '<div class="hist wide"><span class="tt">' +
          "<b>" + r.q.number + esc(r.sq.letter) + " · " + esc(r.q.topic) + "</b>" +
          "<span>" + (r.ok ? "נכון" : "כתבתם: " + ansTxt(r.raw) + " · הנכונה: " + ansTxt(corr)) + "</span></span>" +
          '<span class="chip ' + (r.ok ? "ok" : "bad") + '">' + (r.ok ? "✓" : "✗") + "</span></div>";
      }).join("") + "</section>";
    h += '<div class="row nav-row" data-nospeak>' +
      '<button class="btn" data-act="simclear">סימולציה חדשה</button>' +
      '<button class="btn ghost" data-go="practice">לתרגול מודרך</button></div>';
    return h;
  }

  /* ============================================================
     10. בית ודוח נושאים חלשים
     ============================================================ */
  function viewHome() {
    var ex = exam();
    var solved = Object.keys(store.solved).length;
    var total = allSubs().filter(function (s) { return !isOpen(s.sq); }).length;
    var h = "<h1>בגרות 806</h1>" +
      sayBlock('<p class="lead">מתמטיקה, 5 יחידות. כל טקסט וכל נוסחה נשמעים לפני שקוראים אותם.</p>',
               "הכותרת") + rateBar();
    h += '<div class="grid" data-nospeak>' +
      '<button class="tile" data-go="sim"><span class="tn">סימולציה</span>' +
        '<span class="td">בחינה מלאה עם שעון' + (ex ? " · " + ex.durationMinutes + " דקות" : "") +
        ". בלי רמזים ובלי פתרונות עד הסיום.</span></button>" +
      '<button class="tile" data-go="practice"><span class="tn">תרגול מודרך</span>' +
        '<span class="td">שאלה אחת בכל פעם, רמזים נחשפים אחד-אחד, והפתרון המלא אחרון.</span></button>' +
      "</div>";

    var weak = weakList();
    if (weak.length) {
      h += '<section class="card" data-nospeak><h2>מה חלש אצלכם</h2>' +
        '<p class="sub">לפי מה שנפתר עד כה, מהחלש לחזק. לחיצה פותחת תרגול בנושא.</p>' +
        weak.map(function (w) {
          return '<button class="hist wide" data-topic="' + esc(w.topic) + '">' +
            '<span class="tt"><b>' + esc(w.topic) + "</b><span>" +
            w.right + " נכון · " + w.wrong + " שגוי</span></span>" +
            '<span class="bar" aria-hidden="true"><i style="width:' + w.pct + '%"></i></span>' +
            '<span class="chip ' + (w.pct >= 70 ? "ok" : w.pct >= 40 ? "warn" : "bad") + '">' + w.pct + "</span></button>";
        }).join("") + "</section>";
    }

    h += '<section class="card" data-nospeak><h2>הנתונים שלי</h2>' +
      '<p class="sub">נשמרים במכשיר הזה בלבד, ולא נשלחים לשום מקום.</p>' +
      '<p class="sub">נפתרו ' + solved + " מתוך " + total + " סעיפים · " +
      store.sims.length + " סימולציות</p>" +
      '<button class="btn danger" data-act="reset">איפוס הנתונים</button></section>';
    return h;
  }
  function weakList() {
    var out = [];
    for (var t in store.weak) {
      var w = store.weak[t], n = w.right + w.wrong;
      if (!n) continue;
      out.push({ topic: t, right: w.right, wrong: w.wrong, pct: Math.round(100 * w.right / n) });
    }
    out.sort(function (a, b) { return a.pct - b.pct; });
    return out;
  }

  /* ============================================================
     11. ציור
     ============================================================ */
  function render() {
    sayN = 0;
    var body =
      view === "practice" ? prTopicList() :
      view === "prq"      ? prQuestion() :
      view === "sim"      ? simIntro() :
      view === "simrun"   ? simRun() :
      view === "simreport"? simReport() : viewHome();
    var back = (view === "home" || view === "simrun") ? "" :
      '<button class="btn ghost back" data-go="home" data-nospeak>→ חזרה</button>';
    $("#app").innerHTML = back + body;
    $("#app").focus();
    if (view !== "prq") window.scrollTo(0, 0);
    if (view === "simrun") tick();
    /* הודעת שגיאת ההקראה נוספת ב-syncButtons ולא בציור. בלי
       הקריאה הזאת היא נעלמה בכל מעבר מסך, והמשתמש נשאר עם שקט
       בלי הסבר — בדיוק מה שהמנגנון נועד למנוע. */
    syncButtons();
  }
  function goTo(v) { if (g.Speech) g.Speech.stop(); view = v; render(); }

  function syncButtons() {
    var cur = g.Speech.currentNode();
    var btns = document.querySelectorAll(".spk"), i, k, m;
    for (i = 0; i < btns.length; i++) {
      var live = !!(cur && cur.id === btns[i].getAttribute("data-say"));
      btns[i].classList.toggle("live", live);
      btns[i].setAttribute("aria-pressed", live ? "true" : "false");
      btns[i].title = live ? "עצירה" : "הקראה";
      var icon = btns[i].firstChild;
      if (icon) icon.textContent = live ? "■" : "🔊";
    }
    var bars = document.querySelectorAll(".rate button");
    for (k = 0; k < bars.length; k++) {
      var on = bars[k].getAttribute("data-rate") === g.Speech.getRate();
      bars[k].classList.toggle("on", on);
      bars[k].setAttribute("aria-pressed", on ? "true" : "false");
    }
    /* שגיאת מנוע חייבת להופיע מיד ולא בציור הבא. שקט בלי הסבר
       נראה כמו אפליקציה שבורה, בזמן שהמנוע של המכשיר הוא שנכשל. */
    var err = g.Speech.error(), boxes = document.querySelectorAll(".rate");
    for (m = 0; m < boxes.length; m++) {
      var nx = boxes[m].nextElementSibling;
      var has = nx && nx.classList.contains("bad-line");
      if (err && !has) {
        var p = document.createElement("p");
        p.className = "sub bad-line"; p.setAttribute("role", "alert"); p.setAttribute("data-nospeak", "");
        p.textContent = "מנוע ההקראה של המכשיר החזיר שגיאה (" + err +
          "). נסו שוב, או בדקו שהקול פועל בהגדרות המכשיר.";
        boxes[m].parentNode.insertBefore(p, boxes[m].nextSibling);
      } else if (!err && has) { nx.parentNode.removeChild(nx); }
    }
  }

  function showErrors(errs) {
    if (!errs.length) return;
    var box = document.createElement("div");
    box.className = "schema-errs"; box.setAttribute("role", "alert");
    box.innerHTML = "<b>הסכמה אינה תקינה (" + errs.length + "):</b><ul>" +
      errs.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>";
    document.body.insertBefore(box, document.body.firstChild);
  }

  /* ============================================================
     12. פעולות
     ============================================================ */
  function curSub() {
    var list = topics().filter(function (t) { return t.topic === pr.topic; })[0];
    if (!list) return null;
    var q = list.qs[Math.min(pr.qi, list.qs.length - 1)];
    var sq = q.subQuestions[Math.min(pr.si, q.subQuestions.length - 1)];
    return { list: list, q: q, sq: sq, id: subId(q, sq) };
  }
  function prReset() { pr.reveal = 0; pr.full = false; pr.said = ""; pr.tries = 0; pr.noted = false; }
  function prMove(d) {
    var c = curSub(); if (!c) return;
    var flat = [];
    c.list.qs.forEach(function (qq, qi) {
      qq.subQuestions.forEach(function (ss, si) { flat.push({ qi: qi, si: si }); });
    });
    var at = 0, i;
    for (i = 0; i < flat.length; i++)
      if (flat[i].qi === c.list.qs.indexOf(c.q) && flat[i].si === c.q.subQuestions.indexOf(c.sq)) at = i;
    var to = Math.max(0, Math.min(flat.length - 1, at + d));
    pr.qi = flat[to].qi; pr.si = flat[to].si;
    prReset();
    if (g.Speech) g.Speech.stop();
    render(); window.scrollTo(0, 0);
  }

  document.addEventListener("input", function (e) {
    var el = e.target;
    if (el.id === "ans") {
      var c = curSub(); if (c) draft[c.id] = el.value;
      return;
    }
    var sid = el.getAttribute && el.getAttribute("data-sim");
    if (sid && sim) { sim.answers[sid] = el.value; simSave(); }
  });

  document.addEventListener("keydown", function (e) {
    /* בתיבה פתוחה Enter הוא שורה חדשה, לא הגשה. */
    if (e.key === "Enter" && e.target.id === "ans" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault(); doCheck();
    }
  });

  function doCheck() {
    var c = curSub(); if (!c || isOpen(c.sq)) return;
    var el = $("#ans");
    var raw = el ? el.value : (draft[c.id] || "");
    draft[c.id] = raw;
    pr.said = raw;
    var r = checkAnswer(c.sq.finalAnswer, raw);
    if (r && !r.msg) pr.tries++;
    if (r && r.ok) {
      if (!store.solved[c.id]) {
        store.solved[c.id] = { hints: pr.reveal, tries: pr.tries, at: new Date().toISOString().slice(0, 10) };
        /* נכון מהניסיון הראשון ובלי רמזים — זה מה שנספר כידיעה. */
        noteTopic(c.q.topic, pr.tries === 1 && pr.reveal === 0);
        save();
      }
    } else if (r && !r.msg && !pr.noted) {
      /* נספר פעם אחת לסעיף. תלמיד שמנסה חמש פעמים אינו חמישה
         כישלונות באותו נושא — הוא כישלון אחד שהתעקש. */
      pr.noted = true;
      noteTopic(c.q.topic, false);
    }
    render();
    var again = $("#ans"); if (again) { again.focus(); }
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-go],[data-act],[data-say],[data-rate],[data-topic]");
    if (!el) return;

    var say = el.getAttribute("data-say");
    if (say) { g.Speech.speak(document.getElementById(say)); return; }

    var rate = el.getAttribute("data-rate");
    if (rate) {
      g.Speech.setRate(rate);
      var cur = g.Speech.currentNode();
      if (cur) { var cid = cur.id; g.Speech.stop(); g.Speech.speak(document.getElementById(cid)); }
      return;
    }

    var topic = el.getAttribute("data-topic");
    if (topic) {
      pr.topic = topic; pr.qi = 0; pr.si = 0; prReset();
      goTo("prq"); return;
    }

    var go = el.getAttribute("data-go");
    if (go) { goTo(go); return; }

    switch (el.getAttribute("data-act")) {
      case "check":     doCheck(); break;
      case "hint":      pr.reveal++; render(); break;
      case "full":      pr.full = true; render(); break;
      case "next":      prMove(1); break;
      case "prev":      prMove(-1); break;
      case "simstart":  simStart(); break;
      case "simresume": goTo("simrun"); break;
      case "simdrop":
        if (confirm("לוותר על הסימולציה הפתוחה? התשובות יימחקו.")) { simDrop(); render(); }
        break;
      case "simsubmit":
        if (confirm("להגיש את הבחינה? אחרי ההגשה אי אפשר לשנות תשובות.")) { g.Speech.stop(); simFinish(); }
        break;
      case "simclear":  simDrop(); goTo("sim"); break;
      case "reset":
        if (confirm("למחוק את כל ההתקדמות במכשיר הזה?")) { g.Speech.stop(); resetAll(); render(); }
        break;
    }
  });

  /* ============================================================
     13. הפעלה
     ============================================================ */
  load();
  simLoad();
  showErrors(validate(g.EXAMS));
  /* סימולציה שהזמן שלה נגמר בזמן שהאפליקציה הייתה סגורה מוגשת
     בפתיחה, ולא מציגה שעון שלילי. */
  if (sim && !sim.done && simLeft() <= 0) {
    simFinish();
  } else if (sim && !sim.done) {
    /* השעון רץ בין אם מסתכלים עליו ובין אם לא. מסך בית בזמן
       שבחינה פתוחה מטעה — חוזרים ישר לבחינה. */
    view = "simrun"; render(); tick();
  } else { render(); }
  g.Speech.onChange(syncButtons);
  if (g.Speech.ready()) g.Speech.voicesReady().then(syncButtons);

  g.APP = {
    validate: validate, render: render,
    store: function () { return store; },
    check: checkAnswer, parseNum: parseNum, normExpr: normExpr, normText: normText,
    grade: function () { return simGrade(); },
    _sim: function () { return sim; }
  };
})(window);
