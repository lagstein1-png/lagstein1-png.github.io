/* =====================================================================
   guess.js — האם אפשר לקלוע בלי לדעת את החומר

   `content.js` כבר מדווח `longest-answer` ו-`shortest-answer`, אבל
   כ-REVIEW — כלומר כשאלה שמופנית לאדם, שאפשר לדלג עליה. שני תאים
   הגיעו ככה ל-100% ונשארו בייצור: `math-uni condprob L2` ו-
   `math-uni3 err L1/L3`. תלמיד שבוחר תמיד את האפשרות הארוכה ביותר
   פתר אותם במלואם בלי לדעת הסתברות מותנית או תורת השגיאות.

   כאן זה שער חוסם. אורך התשובה אינו אמור לשאת מידע על נכונותה,
   וגם המיקום שלה לא.

   **המדד הוא ייחודיות, לא קיצוניות.** ״התשובה היא הארוכה ביותר״
   אינו ״אפשר לנחש לפי אורך״ — כששתי אפשרויות חולקות את המקסימום,
   האורך אינו אומר דבר. נספרת רק הגרלה שבה לאפשרות אחת בדיוק יש
   את האורך הקיצוני, והיא הנכונה. אותו לקח שהוריד את
   `shortest`/`longest` מ-~60 התראות ל-~8 אמיתיות.
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');

const BASE = 'http://127.0.0.1:8099';
const APPS = ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3'];
const PER_CELL = Number(process.env.QA_N || 40);

/* סף הכישלון זהה ל-content.js, כדי ששני הכלים לא יסתרו זה את זה.
   ניחוש עיוור מארבע אפשרויות הוא 25%.

   **ושכבת אזהרה מתחתיו, שאינה מפילה.** שמונת התאים שנסגרו ב-9.9
   לא הגיעו ל-100% ביום אחד — הם טיפסו, ואיש לא ראה אותם בדרך.
   אזהרה שמדפיסה בלי להפיל היא מה שהופך את הטיפוס לנראה.

   הסף נבחר מתוך מדידה ולא מהערכה: 224 תאים ב-math-app, math-teen,
   math-uni2 ו-math-uni3 (N=120) נתנו **אפס מעל 60%**, שישה ב-50–57%
   ו-211 מתחת ל-40%. 50% הוא לכן קו שמדבר על התא החריג ולא על הרעש,
   ובין 57% ל-70% יש מרווח שמונע הבהוב בין ריצות. */
const LIMIT = 0.70;
const WARN  = 0.50;
const MIN_N = 20;

async function measure(page, perCell) {
  return page.evaluate((n) => {
    if (typeof buildQ !== 'function' || typeof TOPICS === 'undefined')
      return { skip: true };

    const cells = [];
    for (const t of TOPICS) {
      for (let lv = 1; lv <= 4; lv++) {
        let built = 0, longU = 0, shortU = 0, pos = [0, 0, 0, 0, 0, 0];
        for (let k = 0; k < n; k++) {
          let q;
          try { q = buildQ(t.id, lv); } catch (e) { continue; }
          if (!q || !q.options || q.options.length < 2) continue;

          const opts = q.options.map(o => ({
            len: (typeof plainOf === 'function' ? plainOf(String(o.t ?? o.h ?? ''))
                                                : String(o.t ?? o.h ?? '')).trim().length,
            ok: !!o.ok,
          }));
          if (!opts.some(o => o.ok)) continue;
          built++;

          const mx = Math.max(...opts.map(o => o.len));
          const mn = Math.min(...opts.map(o => o.len));
          /* ייחודי בלבד — תיקו אינו רמז */
          if (opts.filter(o => o.len === mx).length === 1 &&
              opts.find(o => o.len === mx).ok) longU++;
          if (opts.filter(o => o.len === mn).length === 1 &&
              opts.find(o => o.len === mn).ok) shortU++;

          const idx = opts.findIndex(o => o.ok);
          if (idx >= 0 && idx < pos.length) pos[idx]++;
        }
        if (built) cells.push({ tid: t.id, lv, n: built, longU, shortU, pos });
      }
    }
    return { cells };
  }, perCell);
}

async function run() {
  const browser = await chromium.launch();
  let bad = 0, checked = 0, warned = 0;

  for (const app of APPS) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.route('**', r =>
      r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    await page.goto(`${BASE}/${app}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const res = await measure(page, PER_CELL);
    await ctx.close();

    if (res.skip) { console.log(`· ${app.padEnd(10)} אין buildQ/TOPICS — דולג`); continue; }

    /* תא שלא נבנה בו כלום אינו "נקי" — הוא לא נמדד. */
    if (!res.cells.length) {
      console.log(`✗ ${app.padEnd(10)} לא נמדד אף תא — הבדיקה שבורה, לא האפליקציה`);
      bad++;
      continue;
    }

    const hits = [], warns = [];
    for (const c of res.cells) {
      if (c.n < MIN_N) continue;
      checked++;
      const L = c.longU / c.n, S = c.shortU / c.n;
      const tot = c.pos.reduce((a, b) => a + b, 0);
      const P = tot ? Math.max(...c.pos) / tot : 0;
      if (L > LIMIT) hits.push([c, 'הארוכה ביותר', L]);
      else if (L > WARN) warns.push([c, 'הארוכה ביותר', L]);
      if (S > LIMIT) hits.push([c, 'הקצרה ביותר', S]);
      else if (S > WARN) warns.push([c, 'הקצרה ביותר', S]);
      if (P > LIMIT) hits.push([c, 'מיקום קבוע', P]);
      else if (P > WARN) warns.push([c, 'מיקום קבוע', P]);
    }

    bad += hits.length;
    console.log(
      `${hits.length ? '✗' : '✓'} ${app.padEnd(10)} ${String(res.cells.length).padStart(3)} תאים · ` +
      `${hits.length ? hits.length + ' ניתנים לניחוש' : 'אין תא שאפשר לנחש בו'}`
    );
    for (const [c, kind, p] of hits) {
      console.log(`    ✗ ${c.tid} L${c.lv} — ${kind} היא התשובה ב-${Math.round(p * 100)}% ` +
                  `מ-${c.n} הגרלות (ניחוש עיוור: 25%)`);
    }
    /* אזהרות אינן מפילות, ולכן הן נספרות בנפרד ואינן נכנסות ל-bad. */
    warned += warns.length;
    for (const [c, kind, p] of warns) {
      console.log(`    · ${c.tid} L${c.lv} — ${kind} ב-${Math.round(p * 100)}% ` +
                  `(מתחת לסף ${Math.round(LIMIT * 100)}%, מעל קו הראייה ${Math.round(WARN * 100)}%)`);
    }
  }

  await browser.close();
  console.log();
  if (bad) {
    console.log(`${bad} תאים שאפשר לנחש בהם בלי לדעת את החומר`);
    process.exit(1);
  }
  console.log(`✓ ${checked} תאים נמדדו, אין תא שאורך התשובה או מיקומה מסגירים אותה` +
              (warned ? ` (${warned} מעל קו הראייה — ראו למעלה)` : ''));
}

run().catch(e => { console.log('✗ ' + e.message); process.exit(1); });
