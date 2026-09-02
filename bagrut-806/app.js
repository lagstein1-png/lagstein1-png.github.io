/* =====================================================================
   806 — לוגיקה.

   מה כאן ומה עוד לא:
     שלב 1  שלד, טעינת EXAMS, ניווט, הגדרות, שמירה במכשיר.
     שלב 2  speech.js — הקראה בעברית עם הדגשת המשפט הנקרא.
     שלב 3  חשיפת רמזים אחד־אחד ובדיקת תשובה סופית.  ← עד כאן
     שלב 4  PWA, אופליין מלא, ודוח נושאים חלשים.

   אין framework ואין build. הקובץ נטען כ-<script> רגיל, ואחרי
   data/exams.js — הוא סומך על window.EXAMS שכבר קיים.
   ===================================================================== */
(function () {
  "use strict";

  var BUILD = "x4 · 2026-09-02";

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
  /* נוסחה בלי `speech` פשוט אינה מוקראת, וזה נכון — אבל בשקט זה
     נראה ככפתור הקראה שבור. השורה הזאת פונה לכותב התוכן, והיא
     הדרך היחידה שבה חוסר כזה מתגלה לפני שתלמיד נתקל בו. */
  function saySrc(item) {
    if (item.speech) return '<p class="saytxt">בהקראה: ' + esc(item.speech) + "</p>";
    if (item.latex) return '<p class="saytxt bad">חסר ניסוח להקראה, ולכן הנוסחה ' +
      "הזאת לא תוקרא. מוסיפים <code>speech</code> ליד ה־<code>latex</code>.</p>";
    return "";
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
  /* הקראה של אלמנט שקיים רק אחרי לחיצה — רמז או פתרון. הטקסט אינו
     בקובץ התוכן במבנה שאפשר לשלוף לפי מזהה, ולכן הוא נקרא מהמסך. */
  function spkElBtn(elId, label) {
    return '<button class="spk" data-read-el="' + esc(elId) + '" type="button" ' +
           'aria-label="' + esc(label) + '" title="' + esc(label) + '">🔊</button>';
  }
  function spkBtn(id, label) {
    return '<button class="spk" data-read="' + esc(id) + '" type="button" ' +
           'aria-label="' + esc(label) + '" title="' + esc(label) + '">🔊</button>';
  }

  /* --- בדיקת התשובה הסופית (שלב 3) -------------------------------
     הבדיקה סלחנית בכתיב ונוקשה במתמטיקה. תלמיד שכתב 7/12 במקום
     0.5833 יודע את החומר, ואפליקציה שפוסלת אותו מלמדת אותו שהיא
     לא הוגנת — ומאותו רגע הוא לא סומך עליה גם כשהיא צודקת. */
  function parseNum(raw) {
    var t = String(raw == null ? "" : raw).trim();
    if (!t) return NaN;
    t = t.replace(/[\u00a0\s]/g, "");
    var pct = /%$/.test(t);
    if (pct) t = t.slice(0, -1);
    /* פסיק בעברית וברוסית הוא גם מפריד אלפים וגם נקודה עשרונית.
       1,234 או 12,345,678 הם אלפים; 0,58 הוא עשרוני. */
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, "");
    else t = t.replace(/,/g, ".");
    var v;
    var frac = /^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/.exec(t);
    if (frac) {
      var d = Number(frac[2]);
      if (!d) return NaN;
      v = Number(frac[1]) / d;
    } else {
      if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
      v = Number(t);
    }
    if (!isFinite(v)) return NaN;
    return pct ? v / 100 : v;
  }
  /* רווחים כפולים, סימן בסוף המשפט ואות גדולה אינם טעות בתוכן. */
  function normText(x) {
    return String(x == null ? "" : x).trim().toLowerCase()
      .replace(/[\u00a0\s]+/g, " ")
      .replace(/[.,;:!?׳״"']+$/, "");
  }
  function normExpr(x) {
    return String(x == null ? "" : x).toLowerCase()
      .replace(/[\u00a0\s]/g, "")
      .replace(/\*\*/g, "^")
      .replace(/·|×/g, "*");
  }
  function checkAnswer(fa, raw) {
    if (!fa) return { ok: false, why: "לסעיף הזה אין עדיין תשובה סופית בקובץ התוכן." };
    if (!String(raw || "").trim()) return { ok: false, why: "עוד לא נכתבה תשובה." };
    if (fa.type === "number") {
      var v = parseNum(raw);
      if (isNaN(v)) return { ok: false, why: "זה לא נקרא כמספר. אפשר לכתוב 0.8, גם 0,8 וגם 4/5." };
      var tol = typeof fa.tolerance === "number" ? fa.tolerance : 0;
      return { ok: Math.abs(v - fa.value) <= tol + 1e-12, why: "" };
    }
    var norm = fa.type === "expression" ? normExpr : normText;
    var want = [fa.value].concat(fa.accept || []).map(norm);
    return { ok: want.indexOf(norm(raw)) >= 0, why: "" };
  }
  function answerText(fa) {
    if (!fa) return "—";
    if (fa.type !== "number") return String(fa.value);
    /* 0.5833 ולא 0.58330000000000001 */
    return String(Math.round(fa.value * 1e6) / 1e6);
  }

  /* --- מצב התרגול, בזיכרון -------------------------------------
     כמה רמזים נחשפו, האם הפתרון נפתח, ומה נכתב בשדה. נשמר בזיכרון
     ולא במכשיר בכוונה: רמז שנחשף אתמול אינו אמור להיות פתוח היום.
     מה שכן נשמר הוא התוצאה, וזו ההפרדה הנכונה. */
  var P = {};
  function pOf(id) {
    if (!P[id]) P[id] = { shown: 0, sol: false, val: "", res: null, tries: 0 };
    return P[id];
  }
  /* התוצאה נשמרת במכשיר: solved לסעיף, ו-weak לפי נושא. דוח
     הנושאים החלשים בשלב 4 נבנה בדיוק מהשניים האלה. */
  function recordResult(q, subId, ok) {
    var d = store.data;
    if (!d.solved) d.solved = {};
    if (!d.weak) d.weak = {};
    if (ok) d.solved[subId] = true;
    var w = d.weak[q.topic] || (d.weak[q.topic] = { ok: 0, no: 0 });
    if (ok) w.ok++; else w.no++;
    store.save();
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
    h += saySrc(sub);
    h += '<div class="ansbox" id="ans-' + id + '">' + ansHtml(q, sub, si) + "</div>";
    return h + "</div>";
  }

  /* --- רמזים, תשובה ומשוב ---------------------------------------
     שלושה כפתורים ולא אחד: "בדקו" אינו חושף כלום, "רמז" מקדם שלב
     אחד, ו"הפתרון המלא" נפרד מהם ודורש לחיצה משלו. תלמיד שנתקע
     צריך דרך קדימה שאינה "תראה לי את התשובה", וזה בדיוק הפער
     שהרמזים ממלאים. */
  function hintPlaceholder(fa) {
    if (!fa) return "התשובה";
    if (fa.type === "number") return "מספר — למשל 0.8, 0,8 או 4/5";
    if (fa.type === "expression") return "ביטוי — למשל 2x+3";
    return "התשובה במילים";
  }
  function ansHtml(q, sub, si) {
    var id = "q" + q.number + "s" + si;
    var st = pOf(id);
    var steps = sub.steps || [];
    var h = "";

    h += '<div class="ansrow">' +
      /* מספר וביטוי נכתבים משמאל לימין; תשובה במילים היא עברית.
         שדה בכיוון הלא נכון מזיז את הסמן לקצה הלא נכון בכל תו. */
      '<input type="text" id="in-' + id + '" data-ans="' + esc(id) + '" ' +
      'dir="' + (sub.finalAnswer && sub.finalAnswer.type === "text" ? "rtl" : "ltr") + '" ' +
      'inputmode="' + (sub.finalAnswer && sub.finalAnswer.type === "number" ? "decimal" : "text") + '" ' +
      'autocomplete="off" spellcheck="false" ' +
      'value="' + esc(st.val) + '" ' +
      'aria-label="התשובה הסופית לסעיף ' + esc(sub.letter) + '" ' +
      'placeholder="' + esc(hintPlaceholder(sub.finalAnswer)) + '">' +
      '<button class="btn pri" data-check="' + esc(id) + '" type="button">בדקו</button></div>';

    if (st.res) {
      h += '<div class="verdict ' + (st.res.ok ? "ok" : "no") + '" role="status">' +
        "<span>" + (st.res.ok ? "נכון." : "עוד לא.") + "</span>" +
        (st.res.why ? '<span class="why">' + esc(st.res.why) + "</span>" : "") +
        (!st.res.ok && st.tries >= 2 && !st.sol
          ? '<span class="why">אפשר לקחת רמז, ואפשר לפתוח את הפתרון המלא.</span>' : "") +
        "</div>";
    }

    if (steps.length) {
      var left = steps.length - st.shown;
      h += '<div class="hintbar">';
      if (st.shown < steps.length)
        h += '<button class="btn" data-hint="' + esc(id) + '" type="button">' +
             (st.shown ? "רמז נוסף" : "רמז ראשון") + "</button>";
      if (!st.sol)
        h += '<button class="btn" data-sol="' + esc(id) + '" type="button">הפתרון המלא</button>';
      if (st.shown || st.sol)
        h += '<button class="btn ghost" data-hclear="' + esc(id) + '" type="button">סגרו</button>';
      if (st.shown < steps.length)
        h += '<span class="left">' +
             (st.shown ? plural(left, "נשאר רמז אחד", "נשארו שני רמזים", "רמזים נוספים")
                       : plural(steps.length, "רמז אחד", "שני רמזים", "רמזים")) + "</span>";
      h += "</div>";
    }

    for (var i = 0; i < st.shown && i < steps.length; i++) {
      /* מספר הרמז יושב מחוץ לאלמנט שמוקרא. בתוכו המנוע אמר
         "אחת" ואז את הרמז בלי הפסקה, ומי שמקשיב שמע מספר תלוש
         בתחילת המשפט. */
      h += '<div class="hint saybar">' +
        spkElBtn("h-" + id + "-" + i, "הקריאו את הרמז") +
        '<span class="n" aria-hidden="true">' + (i + 1) + "</span>" +
        '<div class="grow" id="h-' + id + "-" + i + '">' +
        sentHtml(steps[i].hint) + "</div></div>";
    }

    if (st.sol) {
      h += '<div class="solution saybar">' +
        spkElBtn("d-" + id, "הקריאו את הפתרון המלא") +
        '<div class="grow"><h4>הפתרון המלא</h4><ol id="d-' + id + '">';
      steps.forEach(function (x) { h += "<li>" + sentHtml(x.detail) + "</li>"; });
      if (sub.finalAnswer)
        h += "<li><b>התשובה הסופית: " + esc(answerText(sub.finalAnswer)) + "</b></li>";
      h += "</ol></div></div>";
    }
    return h;
  }

  /* מרעננים רק את הקופסה של הסעיף. רענון כל המסך היה מאבד את מה
     שנכתב בשדות של שאר הסעיפים, ומחזיר את הגלילה למעלה. */
  function renderAns(id) {
    var box = document.getElementById("ans-" + id);
    if (!box) return;
    var m = /^q(\d+)s(\d+)$/.exec(id);
    var ex = examById(state.examId);
    if (!m || !ex) return;
    var q = null;
    ex.questions.forEach(function (x) { if (String(x.number) === m[1]) q = x; });
    if (!q) return;
    var sub = (q.subQuestions || [])[Number(m[2])];
    if (!sub) return;
    box.innerHTML = ansHtml(q, sub, Number(m[2]));
    markOverflow(box);
  }
  /* כל רענון של הקופסה בונה את ה-input מחדש. בלי לקרוא ממנו קודם,
     תלמיד שכתב תשובה ואז לחץ "רמז" היה מוצא שדה ריק. */
  function keepVal(id) {
    var inp = document.getElementById("in-" + id);
    if (inp) pOf(id).val = inp.value;
  }
  function subOf(id) {
    var m = /^q(\d+)s(\d+)$/.exec(id);
    var ex = examById(state.examId);
    if (!m || !ex) return null;
    var q = null;
    ex.questions.forEach(function (x) { if (String(x.number) === m[1]) q = x; });
    if (!q) return null;
    var sub = (q.subQuestions || [])[Number(m[2])];
    return sub ? { q: q, sub: sub } : null;
  }
  function questionHtml(q) {
    var id = "q" + q.number;
    /* כפתור אחד לשאלה על סעיפיה. בלעדיו תלמיד שרוצה לשמוע את
       השאלה כולה לוחץ ארבע פעמים ומחכה בין לחיצה ללחיצה, ובדיוק
       שם הוא מאבד את החוט. */
    var h = '<div class="card"><div class="qhead"><span class="qnum">שאלה ' +
            esc(q.number) + '</span><span class="chip">' + esc(q.topic) + "</span>" +
            '<button class="btn wide" data-read="' + esc(id) + 'all" type="button">' +
            '<span aria-hidden="true">🔊</span> השאלה כולה</button></div>';
    h += '<div class="saybar">' + spkBtn(id, "הקריאו את השאלה") +
         '<div class="grow"><p id="t-' + id + '">' + sentHtml(q.text) + "</p></div></div>";
    h += formula(q.latex, "f-" + id);
    h += saySrc(q);
    (q.subQuestions || []).forEach(function (sub, si) { h += subHtml(q, sub, si); });
    return h + "</div>";
  }

  /* מאתר מה להקריא לפי המזהה שעל הכפתור. הטקסט תמיד ראשון והנוסחה
     אחריו, ומה שנאמר על נוסחה הוא השדה speech — לעולם לא ה-LaTeX. */
  function readUnits(id) {
    var ex = examById(state.examId);
    if (!ex) return [];
    var m = /^q(\d+)(?:s(\d+)|(all))?$/.exec(id);
    if (!m) return [];
    var q = null;
    ex.questions.forEach(function (x) { if (String(x.number) === m[1]) q = x; });
    if (!q) return [];
    function pair(item, base) {
      return [{ text: item.text, el: document.getElementById("t-" + base) },
              { text: item.speech, el: document.getElementById("f-" + base) }];
    }
    if (m[3]) {
      var qid = "q" + m[1];
      var out = pair(q, qid);
      (q.subQuestions || []).forEach(function (sub, si) {
        out = out.concat(pair(sub, qid + "s" + si));
      });
      return out;
    }
    var src = m[2] === undefined ? q : (q.subQuestions || [])[Number(m[2])];
    if (!src) return [];
    return pair(src, id);
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
      "[data-read],[data-read-el],[data-check],[data-hint],[data-sol],[data-hclear]," +
      "#btn-reset,#btn-stop,#btn-try," +
      "#btn-pause,#btn-back,#btn-fwd") : null;
    if (!el) return;

    /* --- שלב 3: רמז, פתרון ובדיקה --- */
    var hint = el.getAttribute("data-hint");
    if (hint) {
      var sh = subOf(hint);
      var pst = pOf(hint);
      keepVal(hint);
      if (sh && pst.shown < (sh.sub.steps || []).length) pst.shown++;
      renderAns(hint);
      say("רמז " + pst.shown);
      return;
    }
    var sol = el.getAttribute("data-sol");
    if (sol) {
      keepVal(sol);
      pOf(sol).sol = true;
      renderAns(sol);
      say("הפתרון המלא נפתח.");
      return;
    }
    var hcl = el.getAttribute("data-hclear");
    if (hcl) {
      keepVal(hcl);
      var pc = pOf(hcl); pc.shown = 0; pc.sol = false;
      renderAns(hcl);
      return;
    }
    var chk = el.getAttribute("data-check");
    if (chk) {
      var sc = subOf(chk);
      if (!sc) return;
      var pc2 = pOf(chk);
      keepVal(chk);
      pc2.res = checkAnswer(sc.sub.finalAnswer, pc2.val);
      pc2.tries++;
      recordResult(sc.q, chk, pc2.res.ok);
      renderAns(chk);
      say(pc2.res.ok ? "נכון" : "עוד לא. " + (pc2.res.why || ""));
      var again = document.getElementById("in-" + chk);
      if (again && !pc2.res.ok) again.focus();
      return;
    }
    var relEl = el.getAttribute("data-read-el");
    if (relEl) {
      if (el.classList.contains("on")) { window.Speech.stop(); return; }
      var target = document.getElementById(relEl);
      if (!target) return;
      window.Speech.speak([{ text: target.textContent, el: target }], "el:" + relEl);
      return;
    }

    var read = el.getAttribute("data-read");
    if (read) {
      /* לחיצה חוזרת על אותו כפתור עוצרת. אחרת מי שלחץ פעמיים
         שומע את עצמו מתחיל מחדש ולא מבין למה. */
      if (el.classList.contains("on")) { window.Speech.stop(); return; }
      window.Speech.speak(readUnits(read), read);
      return;
    }
    if (el.id === "btn-stop") { window.Speech.stop(); return; }
    if (el.id === "btn-pause") {
      if (window.Speech.paused()) window.Speech.resume(); else window.Speech.pause();
      return;
    }
    if (el.id === "btn-back") { window.Speech.back(); return; }
    if (el.id === "btn-fwd") { window.Speech.fwd(); return; }
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

  /* Enter בשדה התשובה שווה ללחיצה על "בדקו". מי שמקליד בנייד מקבל
     מקש "אישור" במקלדת, ובלי זה הוא לוחץ עליו ולא קורה דבר. */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var t = e.target;
    if (!t || !t.getAttribute) return;
    var id = t.getAttribute("data-ans");
    if (!id) return;
    e.preventDefault();
    var b = document.querySelector('[data-check="' + id + '"]');
    if (b) b.click();
  });
  /* מה שנכתב נשמר בזיכרון גם בלי לחיצה, כדי שמעבר נושא וחזרה לא
     ימחק אותו. */
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-ans")) pOf(t.getAttribute("data-ans")).val = t.value;
  });

  /* --- הפעלה ----------------------------------------------------- */
  /* כפתור ההקראה הפעיל מסומן, וסרגל העצירה נפתח רק כשבאמת מדברים.
     סרגל שנשאר פתוח אחרי שהקול נגמר הוא בדיוק סוג הבלבול שהאפליקציה
     הזאת אמורה למנוע. */
  if (window.Speech) {
    window.Speech.onstate = function (on) {
      $("#stopbar").hidden = !on;
      $$("[data-read]").forEach(function (b) {
        b.classList.remove("on");
        b.setAttribute("aria-pressed", "false");
      });
      var pz = window.Speech.paused();
      $("#btn-pause").textContent = pz ? "המשיכו" : "השהו";
      $("#btn-pause").setAttribute("aria-label", pz ? "המשיכו את ההקראה" : "השהו את ההקראה");
      $("#stopbar .lbl").textContent = pz ? "מושהה" : "קורא…";
      if (!on) return;
      var t = window.Speech.tag;
      if (t) {
        var b = document.querySelector('[data-read="' + t + '"]');
        if (b) { b.classList.add("on"); b.setAttribute("aria-pressed", "true"); }
      }
    };
  }

  store.load();
  applyPrefs();
  $("#build").textContent = BUILD;
  if (store.data.examId && examById(store.data.examId)) state.examId = store.data.examId;
  go("home");
})();
