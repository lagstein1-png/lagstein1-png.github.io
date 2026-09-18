/* =====================================================================
   הסבר הטעות נכתב כמשפט — `node .claude/qa/clearwhy.js [אפליקציה…]`

   **הוראת הבעלים, 18.9.2026:** ״we make mistakes clear and
   understandable for the audience that we're dealing with״.

   **מה שהיה, וזה שלי מאתמול.** ב-17.9 נסגר `O-66` — 25% מהמסיחים
   ב-`english` היו בלי הסבר — והתיקון היה נכון ובנוי לא נכון: הוא
   ייצר **נוסחאות**.

       sit = לשבת
       again ≠ Nice · Nice to meet you.

   השני הוא שלי. אין בו **אף מילה בשפה של הלומד**, ויש בו `≠` —
   סימן מתמטי בתוך שיעור אנגלית. קהל היעד כאן הוא דיסלקציה, ADHD
   ועולים חדשים, ולומד כזה אינו קורא נוסחה; הוא קורא משפט, ורק אם
   הוא קצר.

   **והרף היה כבר בקובץ.** שאלות הקטע (`comp`) נכתבו ביד, וההסברים
   שם הם משפטים שלמים שאומרים **למה** זה שגוי — ״שמות רחובות אינם
   נזכרים בקטע כלל״. הבדיקה הזאת דורשת שכל הסבר שנוצר במחולל יעמוד
   באותו רף.

   ── שלוש דרישות, וכולן נגזרות ממה שנמדד ──

   **1. אין סימן מתמטי בהסבר של שאלה מילולית.** `≠`, `→`, `·`
   ו-`=` בין שתי מילים. באפליקציות המתמטיקה **מותר** — שם הנושא
   הוא הסימן עצמו, ולכן הן מחוץ להיקף.

   **2. ההסבר מכיל לפחות מילה אחת בשפת הלומד.** הסבר שכולו
   אנגלית, מול לומד שבחר עברית או רוסית, אינו הסבר אלא עוד שאלה.
   נמדד לפי כתב, לא לפי מילון: אות עברית, ערבית או קירילית.
   **באנגלית הדרישה אינה חלה** — שם שפת הלומד היא אנגלית.

   **3. ההסבר קצר דיו לקריאה.** 120 תווים. הרף אינו שרירותי:
   ההסברים הכתובים ביד ב-`comp` נמדדו ונמצאו 40–100, והארוך
   שנוצר במחולל אחרי התיקון הוא 97.

   ── מה שהבדיקה אינה עושה ──

   אינה שופטת אם ההסבר **נכון**, ואינה מזהה דימוי אטום. ״שם
   נמצאת הפעם הבאה״ הוא עברית תקינה, קצרה ובשפת הלומד — והוא
   היה אטום לבן שתים־עשרה. זה נתפס בקריאה של אדם, לא ברגקס,
   וזו הסיבה שהבדיקה הזאת אינה מחליפה את סוכנת התוכן.
   ===================================================================== */
'use strict';

const { chromium } = require('./pw.js');

const BASE = process.env.QA_BASE || 'http://127.0.0.1:8099';
const PER_CELL = Number(process.env.QA_N || 4);
const MAXLEN = Number(process.env.QA_WHYLEN || 120);

/* משפחת החידון בלבד. במשפחת המתמטיקה ההסבר **הוא** נוסחה, וזה
   נכון שם: ״הכפלתם ב-3 במקום ב-2״ יושב ליד תרגיל. */
const APPS = ['english', 'history', 'ulpan', 'lomda', 'kotvim'];

/* סימנים שאין להם מקום בהסבר של שאלה מילולית.

   **ו-`·` אינו אחד מהם, אחרי מדידה.** הגרסה הראשונה פסלה אותו
   וקיבלה **6,702 ממצאים** — כמעט כולם תקינים: ב-`lomda` הוא מפריד
   כותרת משנה בפריט מתוארך (״טוריצ׳לי מדד את לחץ האוויר · 1643״),
   וזה קריא לגמרי. הוא גם המפריד הטיפוגרפי המקובל בכל המאגר הזה.

   מה שנשאר הוא **סימן שאין לו קריאה בפרוזה**: `≠` ו-`→`,
   ו-`=` בין שני רצפים לא-ריקים — כך ש-״sit = לשבת״ נפסל
   ו-״שווה ל-5״ עובר. */
const SYMBOL = /[≠→]|\S\s*=\s*\S/;
/* עברית · ערבית · קירילית */
const NATIVE = /[֐-׿؀-ۿЀ-ӿ]/;

(async () => {
  const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const list = only.length ? only : APPS;
  const browser = await chromium.launch();
  let bad = 0, checked = 0;

  for (const app of list) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.route('**', r =>
      r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    try {
      await page.goto(`${BASE}/${app}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(
        () => (typeof buildQuestion === 'function' || typeof buildQ === 'function') &&
              typeof TOPICS !== 'undefined' && TOPICS && TOPICS.length > 0,
        { timeout: 8000 }).catch(() => {});
    } catch (e) {
      console.log(`✗ ${app.padEnd(9)} הדף לא נטען — ${e.message}`);
      bad++; await ctx.close(); continue;
    }

    const res = await page.evaluate(({ per, maxlen, symSrc, natSrc }) => {
      const mk = (typeof buildQuestion === 'function')
        ? (t, lv) => buildQuestion(t, lv, undefined, true)
        : (typeof buildQ === 'function') ? (t, lv) => buildQ(t, lv) : null;
      if (!mk) return { skip: true };
      const SYM = new RegExp(symSrc), NAT = new RegExp(natSrc);

      const out = {};
      for (const lg of ['he', 'ar', 'ru', 'en']) {
        try {
          if (typeof state === 'object' && state) {
            if ('lang' in state) state.lang = lg;
            if (state.settings) state.settings.lang = lg;
          }
          if (typeof applyModes === 'function') applyModes();
        } catch (e) {}
        const r = { n: 0, sym: 0, foreign: 0, long: 0, ex: [] };
        for (const t of TOPICS) {
          for (const lv of [1, 2, 3, 4]) {
            for (let k = 0; k < per; k++) {
              let q;
              try { q = mk(t.id, lv) } catch (e) { continue }
              if (!q) continue;
              const opts = (q.opts && q.opts.length) ? q.opts
                         : (q.options && q.options.length) ? q.options : null;
              if (!opts) continue;
              for (const o of opts) {
                if (o.ok || !o.why) continue;
                const w = String(o.why);
                r.n++;
                const hitSym = SYM.test(w);
                const hitFor = lg !== 'en' && !NAT.test(w);
                const hitLong = w.length > maxlen;
                if (hitSym) r.sym++;
                if (hitFor) r.foreign++;
                if (hitLong) r.long++;
                if ((hitSym || hitFor || hitLong) && r.ex.length < 3)
                  r.ex.push((hitSym ? 'סימן' : hitFor ? 'אין שפת הלומד' : 'ארוך') +
                            ': ' + w.slice(0, 74));
              }
            }
          }
        }
        out[lg] = r;
      }
      return out;
    }, { per: PER_CELL, maxlen: MAXLEN, symSrc: SYMBOL.source, natSrc: NATIVE.source });

    await ctx.close();
    if (res.skip) { console.log(`· ${app.padEnd(9)}אין buildQ/TOPICS — דולג`); continue }

    let appBad = 0, tot = 0;
    const lines = [];
    for (const lg of ['he', 'ar', 'ru', 'en']) {
      const r = res[lg]; if (!r) continue;
      tot += r.n;
      const n = r.sym + r.foreign + r.long;
      if (!n) continue;
      appBad += n;
      lines.push(`     ${lg}: ${r.sym} עם סימן · ${r.foreign} בלי שפת הלומד · ${r.long} ארוך מ-${MAXLEN}`);
      for (const e of r.ex) lines.push('        ' + e);
    }
    if (!tot) { console.log(`✗ ${app.padEnd(9)}לא נמדד אף הסבר — הבדיקה שבורה, לא האפליקציה`); bad++; continue }
    checked++;
    if (appBad) { bad += appBad; console.log(`✗ ${app.padEnd(9)}${appBad} הסברים שאינם משפט קריא`); lines.forEach(l => console.log(l)) }
    else console.log(`✓ ${app.padEnd(9)}${tot} הסברים בארבע שפות — משפט, בשפת הלומד, בלי סימנים`);
  }

  await browser.close();
  console.log(`\n${checked} אפליקציות נמדדו, ${bad} ממצאים`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('✗ ' + e.message); process.exit(1) });
