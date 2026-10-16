/* =====================================================================
   contrast.js — האם הטקסט בכלל נראה

     node .claude/qa/contrast.js [app...]

   **למה זה נדרש, ובמילים מדודות.** 15.9.2026 נמצאו שלושה מקומות
   שבהם הלומד רואה לבן על לבן:

     math-teen  .seg button.on   כהה   1.18:1   מסך ההגדרות
     math-app   .brc             בהיר  1.18:1   תרגיל הנשימה
     ארבע אפליקציות  .btn-p      כהה   1.76–2.98:1  כפתור הפעולה

   `.seg button.on` הוא מסך בחירת גודל האותיות והניגודיות — כלומר
   בדיוק המקום שלומד עם דיסלקציה הולך אליו ראשון, והוא לא יכול
   לקרוא בו. `.brc` הוא מסך ההפוגה של ילד שנתקע, והמילה ״שאיפה״
   לא נראתה.

   **ואף אחת מ-35 הבדיקות לא מדדה ניגודיות.** `a11y.js` בודקת
   שששת המצבים מחווטים, `aria.js` בודקת מיקוד, `tabindex` ומאפיין
   פיזי — ואיש לא בדק אם הטקסט נראה. שלושת הממצאים נמצאו בעין.

   **מה נמדד כאן:** יחס הניגודיות לפי WCAG 2.2 — sRGB ← לומיננס
   יחסי ← (L1+0.05)/(L2+0.05). הסף 4.5:1 לטקסט רגיל ו-3:1 לטקסט
   גדול (≥24px, או ≥18.66px מודגש), בשני מצבי הצבע.

   **הרקע נלקח מהשרשרת ולא מהאלמנט.** רקע שקוף אינו ״שחור״ — עולים
   בהורים עד לרקע אטום ראשון. **וגרדיאנט הוא לא רקע ריק:**
   `background-color` של אלמנט עם `linear-gradient` הוא
   `transparent`, ולכן בדיקה תמימה הייתה משווה את הטקסט לרקע
   הדף ומפספסת בדיוק את `.btn-p` — הבאג השלישי. כאן נשלפות נקודות
   הצבע מהגרדיאנט ונמדדת **הגרועה שבהן**.

   **מה הבדיקה מצהירה על עצמה, ואינה מסתירה:** רוב המסכים חבויים
   מאחורי ניווט, ולכן `[hidden]` מוסר לפני הסריקה כדי שכל המסכים
   יהיו על הדף יחד. זה משנה פריסה ואינו משנה צבע — הצבעים באים
   מכללי CSS. אלמנט שגם אחרי זה אינו מרונדר **נספר ומדווח**, ולא
   נחשב ״עבר״. מספר הכיסוי מודפס בכל ריצה.

   **ומעבר שלישי: ניגודיות גבוהה (O-173, 16.10.2026).** עד היום נמדדו
   `light`/`dark` בלבד, והפקד שנבנה בדיוק לקהל הזה לא הודלק מעולם.
   המעבר מדליק את המחלקה אחרי הטעינה ולא ב-`addInitScript`: כל אפליקציה
   מריצה בעלייה `classList.toggle("hc", !!s.hc)`, שהיה מוחק מחלקה
   שהוצבה לפניה. שני השמות שבשימוש — `hc` ו-`hi-contrast` — מודלקים
   על `html` ועל `body` יחד. **ומעברי CSS מכובים לפני המדידה:** בלעדי
   זה נמדד `.btn-p` בחמש אפליקציות כ״לבן על לבן 1:1״ — זה רקע שעוד
   לא הספיק לעבור מהגרדיאנט אל `--accent`, ולא באג. דף שאין בו כלל
   CSS של ניגודיות גבוהה (`reader`, `bagrut-806`, דף הבית…) מדולג
   במעבר הזה ונספר.
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');
const { BASE } = require('./port.js');   /* QA_PORT, ברירת מחדל 8099 — O-197 */
/* **הרשימה נגזרת, לא כתובה ביד — O-135, 5.10.2026.** עד היום היא
   הייתה 25 שמות מוקלדים, וחמש־עשרה האפליקציות שפורסמו ב-5.10 לא
   נכנסו לאף אחת מהן. ההרצה הראשונה עליהן החזירה **50 ממצאים בעשר
   אפליקציות** — ובהן כפתור ההקראה של כל משפחת ה-elem (3.45:1) וכרטיס
   היחידה (2.48:1). כל אפליקציה שב-`stages.json` וקיימת כאן נמדדת
   עכשיו, ועוד `legal/` ודף הבית, שאינם אפליקציות. */
const AL = require('./applist.js');
const EXTRA = ['legal', '.'];
const APPS = process.argv.slice(2).length ? process.argv.slice(2)
  : AL.local().concat(EXTRA);

const SCAN = () => {
  /* --- WCAG 2.2 --- */
  const lum = ([r, g, b]) => {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const parse = s => {
    const m = String(s || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (p.length < 3 || p.some(isNaN)) return null;
    return { c: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
  };
  /* מיזוג צבע חצי־שקוף אל מה שמתחתיו */
  const over = (fg, bg) => fg.c.map((v, i) => v * fg.a + bg[i] * (1 - fg.a));

  /* כל נקודות הצבע שבגרדיאנט — הגרועה שבהן היא הקובעת */
  const gradStops = bi => {
    const out = [];
    const re = /rgba?\([^)]+\)/g; let m;
    while ((m = re.exec(bi || ''))) { const p = parse(m[0]); if (p) out.push(p) }
    return out;
  };

  /* --- הרקע האפקטיבי ------------------------------------------
     **רקע חצי־שקוף ממוזג אל מה שבאמת מתחתיו, ולא אל לבן.**
     הגרסה הראשונה כאן מיזגה כל שכבה אל לבן, וזה הפיל את `reader`
     ב-2.3:1 בשני המצבים — מספר שנראה אמיתי ולא היה. שם הרקע הוא
     `rgba(90,169,230,.12)`, ומיזוג שלו אל לבן נותן בדיוק
     `rgb(235,245,252)`: כלומר הבדיקה המציאה רקע בהיר מתחת לכפתור
     שיושב על דף כהה. `html.light` שם מגדיר `--accent:#1662a4`
     שעובר בקלות, ולא היה שום באג.

     הנכון: אוספים את השכבות מהאלמנט כלפי מעלה עד השכבה האטומה
     הראשונה, ואז ממזגים **מלמטה למעלה**. לבן הוא הבסיס רק אם לא
     נמצאה שכבה אטומה כלל — כלומר הקנבס של הדפדפן. */
  function bgOf(el) {
    const stack = [];            /* מהאלמנט כלפי מעלה */
    let base = [255, 255, 255];  /* הקנבס, אם לא נמצא רקע אטום */
    let node = el;
    outer:
    while (node && node.nodeType === 1) {
      const cs = getComputedStyle(node);
      const stops = gradStops(cs.backgroundImage);
      const solid = parse(cs.backgroundColor);
      const layers = [];
      if (solid && solid.a > 0) layers.push(solid);
      /* גרדיאנט נצבע מעל צבע הרקע, ולכן הוא נכנס אחריו */
      for (const st of stops) if (st.a > 0) layers.push(st);
      for (const L of layers) {
        if (L.a === 1) { base = L.c; stack.length = 0; /* אטום — הכול מתחת נמחק */ }
        else stack.unshift(L);
      }
      if (layers.some(L => L.a === 1)) {
        /* השכבות שמעל האטומה באותו אלמנט עדיין נספרות */
        const after = layers.slice(layers.findIndex(L => L.a === 1) + 1);
        for (const L of after) stack.push(L);
        break outer;
      }
      node = node.parentElement;
    }
    /* גרדיאנט נותן כמה מועמדים — מחזירים את כולם, והגרוע קובע */
    const grads = stack.filter(L => L.a === 1);
    const fold = pick => {
      let cur = base.slice();
      for (const L of stack) cur = over(L, cur);
      return cur;
    };
    const out = [fold()];
    /* אם יש גרדיאנט אטום בערימה, כל נקודה שלו היא מועמד בפני עצמו */
    for (const g of grads) out.push(g.c);
    return out.length ? out : [[255, 255, 255]];
  }

  document.querySelectorAll('[hidden]').forEach(e => e.removeAttribute('hidden'));

  /* **קישור הדילוג נמדד ממוקד, וזו לא פינה — זו כל הנקודה.**
     `.skip` יושב ב-`inset-inline-start:-9999px` ונצבע רק ב-`:focus`.
     הריצה הראשונה כאן דיווחה עליו 1.88:1 בשבעה דפים, והמספר היה
     נכון ו**חסר משמעות**: הוא נמדד במצב שבו הוא מחוץ למסך, כלומר
     על צבע ברירת המחדל של הדפדפן לקישור. הלומד לעולם אינו רואה
     את המצב הזה.

     שער שמפיל דווקא את מנגנון הנגישות שהוא נבנה להגן עליו מאמן
     את מי שקורא אותו להתעלם ממנו. לכן: ממקדים אותו, ומודדים את
     מה שרואים. */
  document.querySelectorAll('a.skip, .skip').forEach(e => { try { e.focus() } catch (x) {} });

  const out = [], seenSel = {};
  let scanned = 0, unrendered = 0, svg = 0;
  const sel = el => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.className && typeof el.className === 'string')
      s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    return s;
  };

  for (const el of document.querySelectorAll('body *')) {
    const txt = [...el.childNodes].filter(n => n.nodeType === 3)
      .map(n => n.textContent).join('').trim();
    if (!txt) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) { unrendered++; continue }
    /* **מחוץ למסך אינו ״לא נראה מספיק״ — הוא לא נראה.** זהו דפוס
       ה-visually-hidden: `-9999px`, `-100px`, או ריבוע של פיקסל.
       מדידת ניגודיות עליו היא מדידה של משהו שאיש אינו רואה. */
    if (r.right < 0 || r.bottom < 0 || r.width * r.height <= 1) { unrendered++; continue }
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0') { unrendered++; continue }
    /* **`aria-hidden` הוא הפטור, ולא ״נראה לי שזה קישוט״.** WCAG
       אינו דורש ניגודיות מטקסט שאינו נחשף. הריצה השנייה כאן
       דיווחה `span.fl` ב-1.06:1 ב-math-app — עשרה סימני חשבון
       שצפים ברקע ב-`opacity:.06`, בתוך `div#bg` שכבר נושא
       `aria-hidden="true"`. זה קישוט, והמספר נכון וחסר משמעות.

       **והפטור נקבע לפי הסימון ולא לפי השקיפות**, וזה מכוון:
       אלמנט קישוטי שאינו מסומן ימשיך להפיל כאן — וזה נכון, כי
       אז קורא המסך מכריז עליו. פטור שנשען על `opacity` נמוך היה
       מכשיר גם טקסט אמיתי שדהה בטעות. */
    if (el.closest('[aria-hidden="true"]')) { unrendered++; continue }
    /* **טקסט בתוך SVG אינו נמדד, ונספר בנפרד (O-230).** הצבע שלו הוא
       `fill` ולא `color`, והרקע שלו הוא צורה שכנה בתוך ה-SVG ולא הורה
       בשרשרת — ולכן המדידה כאן הייתה מספר בדוי לשני הכיוונים: בשיעור של
       math-elem היא דיווחה 1.07:1 על ספרה שחורה על רקע בהיר. */
    if (el.closest('svg')) { svg++; continue }
    const fg = parse(cs.color);
    if (!fg) continue;
    scanned++;
    const size = parseFloat(cs.fontSize) || 16;
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    let worst = Infinity, worstBg = null;
    for (const bg of bgOf(el)) {
      const v = ratio(over(fg, bg), bg);
      if (v < worst) { worst = v; worstBg = bg }
    }
    if (worst + 0.01 < need) {
      const k = sel(el) + '|' + cs.color;
      if (seenSel[k]) continue;
      seenSel[k] = 1;
      out.push({ sel: sel(el), ratio: +worst.toFixed(2), need,
                 fg: cs.color, bg: 'rgb(' + worstBg.map(Math.round).join(',') + ')',
                 size: Math.round(size), txt: txt.slice(0, 28) });
    }
  }
  return { out, scanned, unrendered, svg };
};

/* מדליק ניגודיות גבוהה ומחזיר false כשאין לדף כלל CSS כזה */
const HC_ON = () => {
  const re = /\.(hc|hi-contrast)\b/;
  let has = false;
  const walk = l => { for (const r of l) {
    if (r.selectorText && re.test(r.selectorText)) { has = true; return }
    if (r.cssRules) walk(r.cssRules);
  } };
  for (const ss of document.styleSheets) { try { walk(ss.cssRules) } catch (e) {} if (has) break }
  if (!has) return false;
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
  document.head.appendChild(st);
  for (const n of [document.documentElement, document.body]) n.classList.add('hc', 'hi-contrast');
  return true;
};

/* =====================================================================
   **מעבר רביעי: השיעורים המודרכים (O-230, 16.10.2026).** שלושת המעברים
   שלמעלה סורקים את הדף כפי שהוא נטען, והשיעור המודרך נבנה רק אחרי
   כניסה אליו — ולכן טקסט אפור קבוע (`#475569`) על כרטיס כהה (`#17262a`)
   ישב שם ב-2.06:1 בלי שאיש ראה. אותו עיוורון הסתיר את O-209.

   **הרשימה נגזרת מהקוד, לא נכתבת ביד:** כל אפליקציה שיש בה
   `function lessonView` או `function xxxLessonView`. כתובת הכניסה
   נגזרת מהדגל שמדליק את השיעור — `var X_ON=/(^|[?&])lesson=sci2(&|$)/`
   שמופיע ב-`view==="lesson"&&X_ON`. שיעור בלי דגל כזה (math-elem,
   math-g7) נפתח בלחיצה: היחידה הראשונה ← ״שיעור״ (רק היחידה הראשונה). פונקציית שיעור שאין אליה
   שום כניסה **מודפסת**, ואינה נחשבת ״עברה״.

   **בתוך השיעור:** בכל שלב סורקים, לוחצים על כל תשובה (כדי שההסבר
   לטעות ולנכון יופיע) וסורקים שוב, לוחצים על פעולות השלב (״בואו
   נבדוק״, ״חלקו״…) וסורקים, ואז ״הבא״ — עד שאין ״הבא״.
   ===================================================================== */
const fsL = require('fs'), pathL = require('path');
const ROOTL = pathL.join(__dirname, '..', '..');
function lessonTargets(apps) {
  const out = [], dead = [];
  for (const app of apps) {
    if (app === '.' || app === 'legal') continue;
    const dir = pathL.join(ROOTL, app);
    let files = ['index.html'];
    for (const sub of ['', 'js']) {
      try { for (const f of fsL.readdirSync(pathL.join(dir, sub))) if (/\.js$/.test(f)) files.push(pathL.join(sub, f)) } catch (e) {}
    }
    const src = files.map(f => { try { return fsL.readFileSync(pathL.join(dir, f), 'utf8') } catch (e) { return '' } }).join('\n');
    const fns = [...src.matchAll(/function\s+(\w*[lL]essonView)\s*\(/g)].map(m => m[1]);
    if (!fns.length) continue;
    const reached = new Set();
    /* דגל URL: var X_ON=/(^|[?&])lesson=sci2(&|$)/ , ו-view==="lesson"&&X_ON)html+=fn() */
    const flags = {};
    for (const m of src.matchAll(/var\s+(\w+_ON)\s*=\s*\/\(\^\|\[\?&\]\)([\w=-]+)\(&\|\$\)\//g)) flags[m[1]] = m[2];
    for (const m of src.matchAll(/view\s*===?\s*["']lesson["']\s*&&\s*(\w+_ON)\s*\)\s*html\s*\+=\s*(\w+)\(/g)) {
      if (flags[m[1]] && fns.includes(m[2])) { out.push({ app, fn: m[2], q: '?' + flags[m[1]], click: false }); reached.add(m[2]) }
    }
    /* בלי דגל: view==="lesson" ... lessonView() ונכנסים בלחיצה */
    for (const fn of fns) {
      if (reached.has(fn)) continue;
      /* `view==="lesson")h+=fn()` או מפת מסכים `{lesson:fn,...}` */
      const callRe = new RegExp('["\']lesson["\'][^\\n]{0,80}\\b' + fn + '\\(\\)|\\blesson\\s*:\\s*' + fn + '\\b');
      if (callRe.test(src) && /data-a="lesson"/.test(src)) { out.push({ app, fn, q: '', click: true }); reached.add(fn) }
      else dead.push(app + ' ' + fn);
    }
  }
  return { out, dead };
}

/* נכנס לשיעור. מחזיר false אם לא נמצאה דרך פנימה */
const LESSON_OPEN = (click) => {
  const ok = document.querySelector('#lg-ok'); if (ok) ok.click();
  if (click) {
    if (!document.querySelector('[data-a="lesson"]')) {
      const u = document.querySelector('[data-a="unit"]'); if (u) u.click();
    }
    const l = document.querySelector('[data-a="lesson"]'); if (!l) return false;
    l.click(); return true;
  }
  /* דגל ה-URL מדליק את השיעור; בחלק מהאפליקציות (math-app) צריך גם
     לעבור למסך — אותו מסך שכפתור הניווט ״שיעור״ פותח */
  if (typeof view !== 'undefined' && view !== 'lesson' && typeof render === 'function') { view = 'lesson'; render() }
  return typeof view === 'undefined' || view === 'lesson';
};
/* מצב הכפתורים בשלב הנוכחי: תשובות (data-i), פעולות, ו״הבא״ */
/* `pre` היא תחילית הפעולות של השיעור (`s2`, `g1`, `ls`, `l`) — נלמדת
   מ״הבא״ הראשון ונשמרת, כי בשלב שמחכה לתשובה אין ״הבא״ */
const LESSON_BTNS = (known) => {
  const all = [...document.querySelectorAll('main [data-a], #app [data-a]')];
  const nx = all.find(b => /next$/.test(b.dataset.a) && !/nextlesson/i.test(b.dataset.a));
  const pre = known != null ? known : nx ? nx.dataset.a.replace(/next$/, '') : null;
  const mine = a => pre !== null ? a.startsWith(pre) : true;
  const ans = all.filter(b => b.hasAttribute('data-i') && mine(b.dataset.a) && !/hear/.test(b.dataset.a)).map(b => b.dataset.a + '#' + b.dataset.i);
  const act = all.filter(b => !b.hasAttribute('data-i') && pre && b.dataset.a.startsWith(pre) &&
    !/(next|back|prev|again|hear)$/.test(b.dataset.a) && !/^(lang|lesson|lv)/.test(b.dataset.a)).map(b => b.dataset.a);
  const sig = (document.querySelector('main') || document.body).innerText.slice(0, 200);
  return { ans, act, next: nx ? nx.dataset.a : null, sig, pre };
};
const LESSON_CLICK = (key) => {
  const [a, i] = key.split('#');
  const sel = i === undefined ? `[data-a="${a}"]:not([data-i])` : `[data-a="${a}"][data-i="${i}"]`;
  const b = document.querySelector(sel); if (!b) return false;
  b.click(); return true;
};

(async () => {
  const browser = await chromium.launch();
  let bad = 0, scanned = 0, unrendered = 0, noHc = 0, noHcL = 0, svgSkip = 0;
  for (const app of APPS) {
    for (const scheme of ['light', 'dark', 'hc']) {
      const ctx = await browser.newContext({ colorScheme: scheme === 'hc' ? 'light' : scheme });
      const page = await ctx.newPage();
      await page.route('**', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
      try {
        await page.goto(`${BASE}/${app === '.' ? '' : app + '/'}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      } catch (e) { console.log(`✗ ${app} [${scheme}] — לא נטען: ${e.message.split('\n')[0]}`); bad++; await ctx.close(); continue }
      await page.waitForTimeout(700);
      if (scheme === 'hc') {
        const has = await page.evaluate(HC_ON);
        if (!has) { noHc++; await ctx.close(); continue }
      }
      const r = await page.evaluate(SCAN);
      scanned += r.scanned; unrendered += r.unrendered; svgSkip += r.svg;
      for (const f of r.out) {
        bad++;
        console.log(`✗ ${app} [${scheme}] ${f.sel} — ${f.ratio}:1, נדרש ${f.need}:1`);
        console.log(`    ${f.fg} על ${f.bg} · ${f.size}px · ‹${f.txt}›`);
      }
      await ctx.close();
    }
  }
  /* --- מעבר רביעי: השיעורים המודרכים --- */
  const LT = lessonTargets(APPS);
  let lessonScans = 0, lessonBad = 0, lessonFail = 0;
  for (const d of LT.dead) console.log(`· ${d} — פונקציית שיעור שאין אליה כניסה; לא נמדדה`);
  for (const L of LT.out) {
    for (const scheme of ['light', 'dark', 'hc']) {
      const ctx = await browser.newContext({ colorScheme: scheme === 'hc' ? 'light' : scheme });
      const page = await ctx.newPage();
      await page.route('**', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
      const tag = `${L.app} [${scheme}] שיעור ${L.fn}${L.q ? ' ' + L.q : ''}`;
      try {
        await page.goto(`${BASE}/${L.app}/${L.q}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      } catch (e) { console.log(`✗ ${tag} — לא נטען`); bad++; lessonFail++; await ctx.close(); continue }
      await page.waitForTimeout(600);
      const opened = await page.evaluate(LESSON_OPEN, L.click);
      await page.waitForTimeout(150);
      if (!opened) { console.log(`✗ ${tag} — לא נפתח`); bad++; lessonFail++; await ctx.close(); continue }
      const seen = new Set();
      const scan = async () => {
        if (scheme === 'hc') { const has = await page.evaluate(HC_ON); if (!has) return false }
        /* SCAN מסיר [hidden] אבל אינו מוחק תוכן, ו-render הבא מצייר מחדש */
        const r = await page.evaluate(SCAN);
        lessonScans++;
        scanned += r.scanned; unrendered += r.unrendered; svgSkip += r.svg;
        for (const f of r.out) {
          const k = f.sel + '|' + f.fg + '|' + f.bg;
          if (seen.has(k)) continue; seen.add(k);
          bad++; lessonBad++;
          console.log(`✗ ${tag} ${f.sel} — ${f.ratio}:1, נדרש ${f.need}:1`);
          console.log(`    ${f.fg} על ${f.bg} · ${f.size}px · ‹${f.txt}›`);
        }
        return true;
      };
      const click = async k => { const ok = await page.evaluate(LESSON_CLICK, k); if (ok) await page.waitForTimeout(80); return ok };
      if (scheme === 'hc' && !(await page.evaluate(HC_ON))) { noHcL++; await ctx.close(); continue }
      let steps = 0, lastSig = null, pre = null;
      while (steps++ < 25) {
        await scan();
        let st = await page.evaluate(LESSON_BTNS, pre);
        if (pre === null) pre = st.pre;
        for (const k of st.ans) { if (await click(k)) await scan() }
        for (const k of st.act) { if (await click(k)) await scan() }
        st = await page.evaluate(LESSON_BTNS, pre);
        /* ״הבא״ מופיע רק אחרי תשובה נכונה — אם הלחיצה האחרונה הייתה שגויה,
           לוחצים שוב על כל תשובה עד שהוא מופיע */
        if (!st.next) for (const k of st.ans) { await click(k); st = await page.evaluate(LESSON_BTNS, pre); if (st.next) break }
        if (!st.next || st.sig === lastSig) break;
        lastSig = st.sig;
        await click(st.next);
      }
      await ctx.close();
    }
  }
  console.log(`\n${lessonBad || lessonFail ? '✗' : '✓'} שיעורים מודרכים: ${LT.out.length} שיעורים ב-${new Set(LT.out.map(l => l.app)).size} אפליקציות × 3 מצבים · ${lessonScans} סריקות · ${lessonBad} מתחת לסף · ${lessonFail} לא נפתחו · ${LT.dead.length} בלי כניסה · ${noHcL} בלי ניגודיות גבוהה`);

  console.log(`\n${bad ? '✗' : '✓'} ${APPS.length} דפים × 3 מצבים (בהיר, כהה, ניגודיות גבוהה — ${APPS.length - noHc} דפים שיש בהם)` +
              ` · ${scanned} אלמנטים עם טקסט נמדדו · ${unrendered} לא רונדרו ולכן לא נמדדו · ${svgSkip} טקסטים ב-SVG לא נמדדו · ${bad} מתחת לסף`);
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
