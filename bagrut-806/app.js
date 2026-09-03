/* =====================================================================
   806 — לוגיקה.

   מה כאן ומה עוד לא:
     שלב 1  שלד, טעינת EXAMS, ניווט, הגדרות, שמירה במכשיר.
     שלב 2  speech.js — הקראה בעברית עם הדגשת המשפט הנקרא.
     שלב 3  חשיפת רמזים אחד־אחד ובדיקת תשובה סופית.
     שלב 4  PWA, אופליין מלא, ודוח נושאים חלשים.  ← עד כאן

   אין framework ואין build. הקובץ נטען כ-<script> רגיל, ואחרי
   data/exams.js — הוא סומך על window.EXAMS שכבר קיים.
   ===================================================================== */
(function () {
  "use strict";

  var BUILD = "x9 · 2026-09-03";

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
  /* אזור ההודעות לקורא מסך. אותה הודעה פעמיים ברצף — "עוד לא."
     על אותה תשובה שגויה — אינה שינוי טקסט, וקורא מסך שותק בפעם
     השנייה; המשתמש לוחץ "בדקו" ולא שומע דבר. תו רוחב־אפס מתחלף
     הופך אותה לשינוי, והוא עצמו אינו נהגה. */
  var ZWSP = String.fromCharCode(0x200b);
  function say(msg) {
    var l = $("#live");
    if (!l) return;
    var t = String(msg == null ? "" : msg);
    l.textContent = (l.textContent.split(ZWSP).join("") === t) ? t + ZWSP : t;
  }
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
      var over = el.scrollWidth > el.clientWidth + 1;
      el.classList.toggle("over", over);
      /* אזור שאפשר לגלול בו חייב להיות נגיש גם במקלדת. בלי tabindex
         מי שאינו משתמש בעכבר או במגע אינו יכול להזיז נוסחה רחבה
         מהמסך — כלומר החצי השני שלה אינו קיים בשבילו. נוסף רק
         כשהנוסחה באמת גולשת: תחנת טאב על כל נוסחה היא רעש. */
      if (over) {
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "group");
        el.setAttribute("aria-label", "נוסחה רחבה מהמסך — אפשר לגלול לצדדים");
      } else {
        el.removeAttribute("tabindex");
        el.removeAttribute("role");
        el.removeAttribute("aria-label");
      }
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
      /* בלי role="status" — ובכוונה. את המשוב מכריז #live, שקיים
         בדף מרגע הטעינה ולכן נקרא באמינות; אזור חי שנוצר יחד עם
         התוכן שבתוכו אינו מוכרז בכל קורא מסך. שני הערוצים יחד היו
         משמיעים "נכון" פעמיים. */
      h += '<div class="verdict ' + (st.res.ok ? "ok" : "no") + '">' +
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
  /* renderAns בונה את הקופסה מחדש, והכפתור שנלחץ נעלם יחד איתה —
     "הפתרון המלא" ו"סגרו" אפילו אינם נבנים שוב. הפוקוס נופל אז
     ל-body, וההקשה הבאה על Tab מתחילה מראש הדף: במסך תרגול עם
     ארבעה סעיפים זה עשרים הקשות בחזרה, בכל רמז. */
  function focusEl(t) {
    if (!t) return;
    if (!/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName) &&
        !t.hasAttribute("tabindex")) t.setAttribute("tabindex", "-1");
    try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); }
  }
  /* האחרון שמתאים בתוך קופסת הסעיף — הרמז שהרגע נחשף, ולא הראשון */
  function lastIn(id, sel) {
    var box = document.getElementById("ans-" + id);
    if (!box) return null;
    var all = box.querySelectorAll(sel);
    return all.length ? all[all.length - 1] : null;
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

  /* מסך הסימולציה ומסך התרגול מרנדרים את אותן שאלות, ולכן אותם
     מזהי t- ו-f- קיימים פעמיים במסמך בו־זמנית — המסך שעזבנו נשאר
     בנוי, רק hidden. getElementById מחזיר את הראשון לפי סדר המסמך,
     ו-scr-sim מופיע לפני scr-practice: ההדגשה סימנה טקסט במסך
     המוסתר, ובמסך שהמשתמש רואה שום דבר לא הודגש. מחפשים קודם בתוך
     המסך הפעיל, ורק אם אין — נופלים לחיפוש הרגיל. */
  function elIn(id) {
    var scope = document.getElementById("scr-" + state.screen);
    var hit = scope ? scope.querySelector("#" + id) : null;
    return hit || document.getElementById(id);
  }
  /* טקסט להקראה מתוך אלמנט שנבנה בלחיצה — רמז או פתרון. הפתרון הוא
     <ol>, ו-textContent מדביק פריט לפריט בלי רווח: שלב שאינו נגמר
     בנקודה היה נבלע לתוך השלב הבא במשפט אחד ארוך. */
  function elText(el) {
    var li = el.querySelectorAll("li");
    if (!li.length) return el.textContent;
    return Array.prototype.map.call(li, function (x) {
      var t = String(x.textContent || "").trim();
      return /[.!?;:]$/.test(t) ? t : t + ".";
    }).join(" ");
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
      return [{ text: item.text, el: elIn("t-" + base) },
              { text: item.speech, el: elIn("f-" + base) }];
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

  /* --- סימולציה (שלב 4) -----------------------------------------
     שלושה מצבים באותו מסך: לפני, תוך כדי, ואחרי. אין רמזים ואין
     פתרונות עד הסיום — זו כל ההבחנה בין המצב הזה לבין התרגול,
     ובלעדיה שני המצבים היו אותו דבר בשני שמות. */
  var SIM = { on: false, done: false, endsAt: 0, ans: {}, res: null, timer: null };

  function simStop() {
    if (SIM.timer) { clearInterval(SIM.timer); SIM.timer = null; }
  }
  function mmss(ms) {
    if (ms < 0) ms = 0;
    var t = Math.round(ms / 1000);
    var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
    function two(n) { return (n < 10 ? "0" : "") + n; }
    return (h ? h + ":" : "") + two(m) + ":" + two(sec);
  }
  function simSubs(ex) {
    var out = [];
    ex.questions.forEach(function (q) {
      (q.subQuestions || []).forEach(function (sub, si) {
        out.push({ q: q, sub: sub, id: "q" + q.number + "s" + si });
      });
    });
    return out;
  }
  function simStart(ex) {
    SIM.on = true; SIM.done = false; SIM.res = null; SIM.ans = {};
    SIM.endsAt = Date.now() + ex.durationMinutes * 60000;
    renderSim();
    simStop();
    SIM.timer = setInterval(tickSim, 1000);
  }
  function tickSim() {
    if (!SIM.on || SIM.done) { simStop(); return; }
    var ex = examById(state.examId);
    if (!ex || state.screen !== "sim") return;   /* השעון ממשיך לרוץ גם מחוץ למסך */
    var left = SIM.endsAt - Date.now();
    var el = $("#sim-clock");
    if (el) {
      var total = ex.durationMinutes * 60000;
      el.querySelector(".t").textContent = mmss(left);
      el.querySelector(".bar i").style.width =
        Math.max(0, Math.min(100, (left / total) * 100)).toFixed(2) + "%";
      el.classList.toggle("low", left <= 5 * 60000);
    }
    if (left <= 0) {
      simFinish(true);
    }
  }
  /* אוספים את מה שנכתב לפני כל רענון — אותו לקח מהתרגול. */
  function simKeep() {
    $$("[data-sim]").forEach(function (inp) { SIM.ans[inp.getAttribute("data-sim")] = inp.value; });
  }
  function simFinish(byTime) {
    simKeep();
    simStop();
    SIM.done = true; SIM.on = false;
    var ex = examById(state.examId);
    if (!ex) return;
    var got = 0, max = 0, byTopic = {}, rows = [];
    simSubs(ex).forEach(function (it) {
      var r = checkAnswer(it.sub.finalAnswer, SIM.ans[it.id] || "");
      var pts = Number(it.sub.points) || 0;
      max += pts;
      if (r.ok) got += pts;
      var t = byTopic[it.q.topic] || (byTopic[it.q.topic] = { ok: 0, n: 0, pts: 0, max: 0 });
      t.n++; t.max += pts;
      if (r.ok) { t.ok++; t.pts += pts; }
      recordResult(it.q, it.id, r.ok);
      rows.push({ id: it.id, letter: it.sub.letter, number: it.q.number,
                  topic: it.q.topic, ok: r.ok, pts: pts,
                  given: SIM.ans[it.id] || "", want: answerText(it.sub.finalAnswer) });
    });
    SIM.res = { got: got, max: max, byTopic: byTopic, rows: rows, byTime: !!byTime };
    var d = store.data;
    if (!d.sims) d.sims = [];
    d.sims.push({ examId: ex.id, at: Date.now(), got: got, max: max });
    if (d.sims.length > 50) d.sims = d.sims.slice(-50);
    store.save();
    renderSim();
    say(byTime ? "הזמן נגמר. הנה הדוח." : "הבחינה הוגשה. הנה הדוח.");
  }

  function simQuestionHtml(q) {
    var id = "q" + q.number;
    var h = '<div class="card"><div class="qhead"><span class="qnum">שאלה ' +
            esc(q.number) + '</span><span class="chip">' + esc(q.topic) + "</span>" +
            '<button class="btn wide" data-read="' + esc(id) + 'all" type="button">' +
            '<span aria-hidden="true">🔊</span> השאלה כולה</button></div>';
    h += '<div class="saybar">' + spkBtn(id, "הקריאו את השאלה") +
         '<div class="grow"><p id="t-' + id + '">' + sentHtml(q.text) + "</p></div></div>";
    h += formula(q.latex, "f-" + id);
    if (q.speech) h += '<p class="sr">בהקראה: ' + esc(q.speech) + "</p>";
    (q.subQuestions || []).forEach(function (sub, si) {
      var sid = id + "s" + si;
      h += '<div class="sub"><div class="saybar">' +
        spkBtn(sid, "הקריאו את סעיף " + sub.letter) +
        '<div class="grow"><h3 id="t-' + sid + '"><span class="letter">' + esc(sub.letter) +
        ".</span> " + sentHtml(sub.text) + "</h3>" +
        '<p class="meta">' + plural(sub.points, "נקודה אחת", "שתי נקודות", "נקודות") +
        "</p></div></div>";
      h += formula(sub.latex, "f-" + sid);
      /* בתרגול הניסוח העברי של הנוסחה מוצג על המסך; בסימולציה הוא
         לא, וקורא מסך נשאר עם ה-MathML שקורא נוסחה באנגלית. מוסיפים
         אותו כטקסט לקורא מסך בלבד: אפס שינוי חזותי, ואפס חשיפה —
         speech הוא ניסוח הנוסחה ולא התשובה. */
      if (sub.speech) h += '<p class="sr">בהקראה: ' + esc(sub.speech) + "</p>";
      h += '<div class="ansbox"><div class="ansrow">' +
        '<input type="text" data-sim="' + esc(sid) + '" ' +
        'dir="' + (sub.finalAnswer && sub.finalAnswer.type === "text" ? "rtl" : "ltr") + '" ' +
        'inputmode="' + (sub.finalAnswer && sub.finalAnswer.type === "number" ? "decimal" : "text") + '" ' +
        'autocomplete="off" spellcheck="false" ' +
        'value="' + esc(SIM.ans[sid] || "") + '" ' +
        'aria-label="התשובה לשאלה ' + esc(q.number) + " סעיף " + esc(sub.letter) + '" ' +
        'placeholder="' + esc(hintPlaceholder(sub.finalAnswer)) + '"></div></div>';
      h += "</div>";
    });
    return h + "</div>";
  }

  function simReportHtml(ex) {
    var r = SIM.res;
    var pct = r.max ? Math.round((r.got / r.max) * 100) : 0;
    var h = "";
    if (r.byTime) h += '<p class="note">הזמן נגמר, והבחינה הוגשה כפי שהייתה.</p>';
    h += '<div class="score"><div class="big">' + pct + "</div>" +
      "<div>" + r.got + " מתוך " + r.max + " נקודות</div></div>";

    var topics = Object.keys(r.byTopic);
    h += "<h2>לפי נושא</h2><table class=\"tbl\"><thead><tr>" +
      "<th>נושא</th><th>סעיפים</th><th>נקודות</th><th></th></tr></thead><tbody>";
    topics.forEach(function (t) {
      var x = r.byTopic[t];
      var p = x.max ? Math.round((x.pts / x.max) * 100) : 0;
      h += "<tr><td>" + esc(t) + "</td><td>" + x.ok + "/" + x.n + "</td><td>" +
        x.pts + "/" + x.max + '</td><td><div class="bar2' + (p < 60 ? " weak" : "") +
        '"><i style="width:' + p + '%"></i></div></td></tr>';
    });
    h += "</tbody></table>";

    /* הנושאים החלשים נאמרים במפורש ולא רק מצוירים: מי שקורא לאט
       לא מפענח גרף, והמשפט הזה הוא כל מה שהוא צריך מהדוח. */
    var weak = topics.filter(function (t) {
      var x = r.byTopic[t];
      return x.max && x.pts / x.max < 0.6;
    });
    h += '<p class="note">' + (weak.length
      ? "מה לחזור עליו קודם: " + weak.map(esc).join(", ") + "."
      : "אין נושא שנפל מתחת ל-60%. אפשר להמשיך הלאה.") + "</p>";

    h += "<h2>סעיף אחר סעיף</h2><table class=\"tbl\"><thead><tr>" +
      "<th>סעיף</th><th>מה נכתב</th><th>התשובה</th><th></th></tr></thead><tbody>";
    /* "1" ואחריו "א" בתוך תא בכיוון ימין־לשמאל מוצגים הפוך — "א1" —
       מפני שהספרה והאות הן שני כיוונים נגדיים. bdi בכיוון שמאל־לימין
       מבודד את הצירוף ומציג אותו כפי שנכתב, והתא כולו נשאר במקומו. */
    r.rows.forEach(function (x) {
      h += '<tr><td><bdi dir="ltr">' + esc(x.number) + esc(x.letter) + "</bdi></td><td>" +
        (x.given ? esc(x.given) : '<span class="meta">ריק</span>') + "</td><td>" +
        esc(x.want) + '</td><td><span class="tag ' + (x.ok ? "ok" : "no") + '">' +
        (x.ok ? "נכון" : "לא") + "</span></td></tr>";
    });
    h += "</tbody></table>";
    h += '<div class="hintbar" style="margin-top:1rem">' +
      '<button class="btn pri" data-go="practice" type="button">לתרגול מודרך, עם הפתרונות</button>' +
      '<button class="btn" data-simstart="1" type="button">בחינה נוספת</button></div>';
    return h;
  }

  function renderSim() {
    var ex = examById(state.examId);
    if (!ex) return;
    $("#sim-meta").textContent = examTitle(ex) + " · " + ex.durationMinutes + " דקות · " +
      plural(ex.questions.length, "שאלה אחת", "שתי שאלות", "שאלות");
    var box = $("#sim-body");

    if (SIM.done && SIM.res) { box.innerHTML = simReportHtml(ex); markOverflow(box); return; }

    if (!SIM.on) {
      box.innerHTML = '<p class="note">בסימולציה אין רמזים ואין פתרונות עד הסיום, ' +
        "והשעון רץ. ההקראה עובדת כרגיל — היא אינה עזרה חיצונית אלא הדרך " +
        "שבה האפליקציה הזאת מוגשת.</p>" +
        '<div class="card"><h2>' + esc(examTitle(ex)) + "</h2>" +
        '<p class="meta">' + plural(countSubs(ex), "סעיף אחד", "שני סעיפים", "סעיפים") +
        " · " + ex.durationMinutes + " דקות</p>" +
        '<button class="btn pri" data-simstart="1" type="button">התחילו את הבחינה</button></div>';
      return;
    }

    var total = ex.durationMinutes * 60000;
    var left = SIM.endsAt - Date.now();
    var h = '<div class="clock" id="sim-clock" role="timer" aria-label="הזמן שנותר">' +
      '<span class="t">' + mmss(left) + "</span>" +
      '<span class="bar"><i style="width:' +
      Math.max(0, Math.min(100, (left / total) * 100)).toFixed(2) + '%"></i></span>' +
      '<button class="btn" data-simend="1" type="button">סיימתי</button></div>';
    ex.questions.forEach(function (q) { h += simQuestionHtml(q); });
    h += '<button class="btn pri" data-simend="1" type="button" ' +
         'style="width:100%">סיימתי — הגישו את הבחינה</button>';
    box.innerHTML = h;
    markOverflow(box);
  }

  /* --- התקדמות מצטברת -------------------------------------------
     נבנית מ-weak, שנצבר גם בתרגול וגם בסימולציות. זה מה שהופך את
     הדוח מ"מה קרה בבחינה אחת" ל"מה חוזר אצלי". */
  function renderProg() {
    var d = store.data;
    var weak = d.weak || {};
    var topics = Object.keys(weak);
    var box = $("#prog-body");
    if (!topics.length) {
      box.innerHTML = '<div class="stub"><b>עוד לא נאסף מידע.</b>' +
        "כל תשובה שנבדקת — בתרגול או בסימולציה — נספרת כאן לפי נושא.</div>";
      return;
    }
    var rows = topics.map(function (t) {
      var x = weak[t], n = x.ok + x.no;
      return { t: t, ok: x.ok, n: n, p: n ? Math.round((x.ok / n) * 100) : 0 };
    }).sort(function (a, b) { return a.p - b.p; });

    var h = "<h2>לפי נושא</h2><table class=\"tbl\"><thead><tr>" +
      "<th>נושא</th><th>נכונות</th><th>אחוז</th><th></th></tr></thead><tbody>";
    rows.forEach(function (r) {
      h += "<tr><td>" + esc(r.t) + "</td><td>" + r.ok + "/" + r.n + "</td><td>" + r.p +
        '%</td><td><div class="bar2' + (r.p < 60 ? " weak" : "") +
        '"><i style="width:' + r.p + '%"></i></div></td></tr>';
    });
    h += "</tbody></table>";
    var w = rows.filter(function (r) { return r.p < 60; });
    h += '<p class="note">' + (w.length
      ? "הנושאים החלשים: " + w.map(function (r) { return esc(r.t); }).join(", ") + "."
      : "אין נושא מתחת ל-60%.") + "</p>";

    var sims = (d.sims || []).slice().reverse().slice(0, 8);
    if (sims.length) {
      h += "<h2>סימולציות אחרונות</h2><table class=\"tbl\"><thead><tr>" +
        "<th>מתי</th><th>ציון</th></tr></thead><tbody>";
      sims.forEach(function (x) {
        var dt = new Date(x.at);
        h += "<tr><td>" + dt.toLocaleDateString("he-IL") + "</td><td>" +
          (x.max ? Math.round((x.got / x.max) * 100) : 0) + " (" + x.got + "/" + x.max + ")</td></tr>";
      });
      h += "</tbody></table>";
    }
    box.innerHTML = h;
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
  var SCREENS = ["home", "mode", "sim", "practice", "prog", "settings"];
  var TITLES = {
    home: "שאלון 806", mode: "בחירת מצב", sim: "סימולציית בחינה",
    practice: "תרגול מודרך", prog: "ההתקדמות שלכם", settings: "הגדרות"
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
    /* יציאה מהסימולציה באמצע אינה מבטלת אותה: מה שנכתב נשמר,
       והשעון ממשיך לרוץ — בדיוק כמו בבחינה אמיתית. */
    if (state.screen === "sim" && screen !== "sim" && SIM.on) simKeep();
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
    if (screen === "prog") renderProg();
    if (screen === "settings") applyPrefs();
    /* הכפתור שנלחץ נמצא במסך שהרגע הוסתר, ולכן הפוקוס נופל ל-body:
       הקשה על Tab מתחילה מראש המסמך, ומי שמנווט במקלדת אינו יודע
       לאן הגיע. מעבירים את הפוקוס לכותרת המסך החדש. tabindex="-1"
       הופך אותה למוקדת בלי להוסיף תחנת טאב, ו-:focus-visible אינו
       נדלק על פוקוס תוכניתי אחרי לחיצת עכבר. */
    var head = $("#scr-" + screen).querySelector("h1");
    if (head) {
      head.setAttribute("tabindex", "-1");
      try { head.focus({ preventScroll: true }); } catch (e) { head.focus(); }
    }
    window.scrollTo(0, 0);
    /* שם המסך יורד לכותרת המסמך ולא ל-#live: הפוקוס על ה-h1 כבר
       הכריז אותו, ושני ערוצים על אותו משפט פירושם לשמוע את שם
       המסך פעמיים בכל מעבר. הכותרת מוסיפה מידע במקום לחזור עליו —
       היא זו שנקראת בהחלפת לשונית ובחזרה לאפליקציה. */
    document.title = TITLES[screen] +
      (screen === "home" ? " — בגרות במתמטיקה, חמש יחידות" : " · שאלון 806");
  }

  /* --- אירועים. האזנה אחת על המסמך, ולא מאזין לכל כפתור --------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest(
      "[data-go],[data-exam],[data-topic],[data-fs],[data-theme],[data-rate]," +
      "[data-read],[data-read-el],[data-check],[data-hint],[data-sol],[data-hclear]," +
      "[data-simstart],[data-simend]," +
      "#btn-reset,#btn-stop,#btn-try," +
      "#btn-pause,#btn-back,#btn-fwd") : null;
    if (!el) return;

    if (el.getAttribute("data-simstart")) {
      var exs = examById(state.examId);
      if (exs) simStart(exs);
      return;
    }
    if (el.getAttribute("data-simend")) {
      if (!window.confirm("להגיש את הבחינה? אחרי ההגשה אי אפשר לשנות תשובות.")) return;
      simFinish(false);
      return;
    }

    /* --- שלב 3: רמז, פתרון ובדיקה --- */
    var hint = el.getAttribute("data-hint");
    if (hint) {
      var sh = subOf(hint);
      var pst = pOf(hint);
      keepVal(hint);
      if (sh && pst.shown < (sh.sub.steps || []).length) pst.shown++;
      renderAns(hint);
      /* אל הרמז עצמו, ולא אל הכפתור: זה מה שהמשתמש ביקש לקרוא */
      focusEl(lastIn(hint, ".hint .grow"));
      say("רמז " + pst.shown);
      return;
    }
    var sol = el.getAttribute("data-sol");
    if (sol) {
      keepVal(sol);
      pOf(sol).sol = true;
      renderAns(sol);
      focusEl(lastIn(sol, ".solution .grow"));
      say("הפתרון המלא נפתח.");
      return;
    }
    var hcl = el.getAttribute("data-hclear");
    if (hcl) {
      keepVal(hcl);
      var pc = pOf(hcl); pc.shown = 0; pc.sol = false;
      renderAns(hcl);
      /* "סגרו" עצמו כבר לא קיים — חוזרים לשדה התשובה */
      focusEl(lastIn(hcl, "#in-" + hcl));
      say("הרמזים נסגרו.");
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
      /* אותו מידע שמופיע על המסך, ולא פחות ממנו: הנוסח שמופיע אחרי
         שני ניסיונות הוא הדרך היחידה קדימה למי שנתקע, ומי שמקשיב
         היה מפספס אותו לגמרי. */
      say(pc2.res.ok ? "נכון" :
          "עוד לא. " + (pc2.res.why || "") +
          (pc2.tries >= 2 && !pc2.sol ? " אפשר לקחת רמז, ואפשר לפתוח את הפתרון המלא." : ""));
      /* שגוי — חוזרים לשדה, שם צריך לתקן. נכון — חוזרים לכפתור
         "בדקו", כדי לא לפתוח מקלדת על סעיף שכבר נגמר. */
      if (!pc2.res.ok) focusEl(lastIn(chk, "#in-" + chk));
      else focusEl(lastIn(chk, "[data-check]"));
      return;
    }
    var relEl = el.getAttribute("data-read-el");
    if (relEl) {
      if (el.classList.contains("on")) { window.Speech.stop(); return; }
      var target = elIn(relEl);
      if (!target) return;
      window.Speech.speak([{ text: elText(target), el: target }], "el:" + relEl);
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
    if (rt) {
      store.data.rate = Number(rt); store.save();
      /* דרך setRate ולא בהשמה ישירה: שינוי קצב אינו משפיע על אמירה
         שכבר יצאה למנוע, ולכן setRate עוצר את ההקראה הנוכחית. בלי
         הקריאה הזאת המשתמש לחץ "לאט" באמצע הקראה, שמע את אותו קצב
         ממשיך, והסיק שהבורר שבור. applyPrefs לבדו לא מתאים כאן:
         הוא רץ גם על שינוי גודל טקסט ומראה, ושם עצירת ההקראה
         הייתה עונש על פעולה שאין לה קשר לקול. */
      if (window.Speech) window.Speech.setRate(store.data.rate);
      applyPrefs(); return;
    }

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
      store.reset(); applyPrefs(); state.examId = null;
      simStop(); SIM = { on: false, done: false, endsAt: 0, ans: {}, res: null, timer: null };
      P = {};
      go("home");
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
    if (!t || !t.getAttribute) return;
    if (t.getAttribute("data-ans")) pOf(t.getAttribute("data-ans")).val = t.value;
    if (t.getAttribute("data-sim")) SIM.ans[t.getAttribute("data-sim")] = t.value;
  });
  /* סגירת הכרטיסייה באמצע בחינה לא תשאיר את התלמיד בלי מה שכתב */
  window.addEventListener("pagehide", function () { if (SIM.on) simKeep(); });

  /* --- הפעלה ----------------------------------------------------- */
  /* כפתור ההקראה הפעיל מסומן, וסרגל העצירה נפתח רק כשבאמת מדברים.
     סרגל שנשאר פתוח אחרי שהקול נגמר הוא בדיוק סוג הבלבול שהאפליקציה
     הזאת אמורה למנוע. */
  if (window.Speech) {
    window.Speech.onstate = function (on) {
      $("#stopbar").hidden = !on;
      /* גם כפתורי הרמז והפתרון, ולא רק [data-read]. בלעדיהם הם לא
         קיבלו את הסימון "on" לעולם — ולכן גם הבדיקה שבלחיצה, שאמורה
         להפוך לחיצה שנייה לעצירה, לא הייתה נכונה אף פעם: מי שלחץ
         שוב על הרמז שמע אותו מתחיל מחדש במקום להיפסק. */
      $$("[data-read],[data-read-el]").forEach(function (b) {
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
        var sel = t.indexOf("el:") === 0
          ? '[data-read-el="' + t.slice(3) + '"]'
          : '[data-read="' + t + '"]';
        var b = document.querySelector(sel);
        if (b) { b.classList.add("on"); b.setAttribute("aria-pressed", "true"); }
      }
    };
  }

  /* --- רישום ה-service worker ------------------------------------
     מפתח המטמון גזור מ-BUILD ידנית ולא אוטומטית, וזה מכוון: כך
     אפשר לראות בעין אחת ששני המספרים תואמים. עדכנת את BUILD —
     עדכן גם את השורה הזאת, אחרת המשתמש לא יראה את התיקון. */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js?v=x9-pwa1").catch(function () {});
    });
  }

  store.load();
  applyPrefs();
  $("#build").textContent = BUILD;
  if (store.data.examId && examById(store.data.examId)) state.examId = store.data.examId;
  go("home");
})();
