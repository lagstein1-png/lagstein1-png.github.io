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

   **ותא שחצה את הסף נמדד שוב לפני שהוא מפיל.** ארבעים הגרלות
   הן מדגם קטן: תא שהאמת שלו 50–60% חוצה 70% בחלק מהמדגמים, ולכן
   ב-10.9.2026 החבילה נפלה ארבע פעמים על ארבעה תאים שונים — בכל
   ריצה תא אחר, ובכל ריצה 73–75% מ-40. נמדד על העצים שנפלו, 200
   מדגמים לכל גודל (`FINDINGS.md`, 10.9): `matops L2` שאמיתו 59.9%
   חצה את הסף ב-10 מדגמים בני 40, באחד בן 120 ובאפס בני 400;
   `linear L4` (53.1%) ב-2, 0, 0; `cr L2` (49.9%) ב-1, 0, 0. ותא
   שבאמת ניתן לניחוש — `condprob L2` ב-100% — חצה ב-200 מתוך 200
   בכל גודל. לכן תא שחצה את הסף ב-`PER_CELL` הגרלות נבנה שוב
   `CONFIRM_N` פעמים, ורק אם גם שם הוא מעל הסף — הוא ממצא.
   `QA_BASE` מאפשר להריץ מול עץ ישן שמוגש בפורט אחר (`QA_PORT`
   ב-`serve.js`), וכך נעשתה ההוכחה.
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');

const BASE = process.env.QA_BASE || 'http://127.0.0.1:8099';
const APPS = ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3'];
const PER_CELL = Number(process.env.QA_N || 40);
const CONFIRM_N = Number(process.env.QA_CONFIRM || PER_CELL * 10);

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

/* only — רשימת "tid|lv"; כשהיא נתונה נמדדים רק התאים האלה (האישור). */
async function measure(page, perCell, only) {
  return page.evaluate(([n, only]) => {
    if (typeof buildQ !== 'function' || typeof TOPICS === 'undefined')
      return { skip: true };

    const cells = [];
    for (const t of TOPICS) {
      for (let lv = 1; lv <= 4; lv++) {
        if (only && only.indexOf(t.id + '|' + lv) < 0) continue;
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
  }, [perCell, only || null]);
}

/* שלושת המדדים של תא, לפי שם — אותו שם שמודפס */
function rates(c) {
  const tot = c.pos.reduce((a, b) => a + b, 0);
  return {
    'הארוכה ביותר': c.longU / c.n,
    'הקצרה ביותר':  c.shortU / c.n,
    'מיקום קבוע':   tot ? Math.max(...c.pos) / tot : 0,
  };
}
const pct = p => Math.round(p * 100);

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

    if (res.skip) { await ctx.close(); console.log(`· ${app.padEnd(10)} אין buildQ/TOPICS — דולג`); continue; }

    /* תא שלא נבנה בו כלום אינו "נקי" — הוא לא נמדד. */
    if (!res.cells.length) {
      await ctx.close();
      console.log(`✗ ${app.padEnd(10)} לא נמדד אף תא — הבדיקה שבורה, לא האפליקציה`);
      bad++;
      continue;
    }

    const raw = [], warns = [];
    for (const c of res.cells) {
      if (c.n < MIN_N) continue;
      checked++;
      const r = rates(c);
      for (const kind in r) {
        if (r[kind] > LIMIT) raw.push([c, kind, r[kind]]);
        else if (r[kind] > WARN) warns.push([c, kind, r[kind]]);
      }
    }

    /* אישור: רק התאים שחצו את הסף, ב-CONFIRM_N הגרלות כל אחד */
    const hits = [], cleared = [];
    if (raw.length) {
      const only = [...new Set(raw.map(([c]) => c.tid + '|' + c.lv))];
      const again = await measure(page, CONFIRM_N, only);
      const byKey = {};
      for (const c of (again.cells || [])) byKey[c.tid + '|' + c.lv] = c;
      for (const [c, kind, p] of raw) {
        const d = byKey[c.tid + '|' + c.lv];
        /* לא נבנה שוב — אין במה לנקות, הממצא הראשון נשאר */
        if (!d || d.n < MIN_N) { hits.push([c, kind, p, null]); continue; }
        const p2 = rates(d)[kind];
        if (p2 > LIMIT) hits.push([c, kind, p, d, p2]);
        else { cleared.push([c, kind, p, d, p2]); if (p2 > WARN) warned++; }
      }
    }
    await ctx.close();

    bad += hits.length;
    console.log(
      `${hits.length ? '✗' : '✓'} ${app.padEnd(10)} ${String(res.cells.length).padStart(3)} תאים · ` +
      `${hits.length ? hits.length + ' ניתנים לניחוש' : 'אין תא שאפשר לנחש בו'}`
    );
    for (const [c, kind, p, d, p2] of hits) {
      console.log(`    ✗ ${c.tid} L${c.lv} — ${kind} היא התשובה ב-${pct(p)}% מ-${c.n} הגרלות` +
                  (d ? `, ו-${pct(p2)}% מ-${d.n} באישור` : '') + ` (ניחוש עיוור: 25%)`);
    }
    for (const [c, kind, p, d, p2] of cleared) {
      console.log(`    · ${c.tid} L${c.lv} — ${kind} ב-${pct(p)}% מ-${c.n}, אבל ${pct(p2)}% מ-${d.n} ` +
                  `באישור — רעש דגימה, לא ממצא`);
    }
    /* אזהרות אינן מפילות, ולכן הן נספרות בנפרד ואינן נכנסות ל-bad. */
    warned += warns.length;
    for (const [c, kind, p] of warns) {
      console.log(`    · ${c.tid} L${c.lv} — ${kind} ב-${pct(p)}% ` +
                  `(מתחת לסף ${pct(LIMIT)}%, מעל קו הראייה ${pct(WARN)}%)`);
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
