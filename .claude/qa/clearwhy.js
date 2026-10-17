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

const { BASE } = require('./port.js');   /* QA_PORT, ברירת מחדל 8099 — O-197 */
const PER_CELL = Number(process.env.QA_N || 4);
const MAXLEN = Number(process.env.QA_WHYLEN || 120);

/* משפחת החידון בלבד. במשפחת המתמטיקה ההסבר **הוא** נוסחה, וזה
   נכון שם: ״הכפלתם ב-3 במקום ב-2״ יושב ליד תרגיל.

   6.10.2026 — **הרשימה הפוכה עכשיו, וזה העיקר.** היא הייתה חמישה
   שמות כתובים ביד, ולכן `civics` — שיש בה 1,536 הסברי מסיחים
   בארבע שפות — דולגה בכל ריצה, גם ב-`all.js`. הכלי קורא אותה
   מצוין כשנותנים לו את השם. אותה משפחת ממצאים של O-141 ושל
   O-135: **רשימה שנכתבת ביד מדלגת בשקט על מה שנוסף אחריה.**

   לכן המשפחה נגזרת מ-`stages.json`, וההחרגה היא שנכתבת ביד —
   משפחת המתמטיקה והמחוללים, שבהם ההסבר הוא נוסחה. אפליקציה
   חדשה **נכנסת** כברירת מחדל, ומי שמחריג אותה אומר למה. */
const MATHY = new Set(['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
                       'math-g7', 'math-elem', 'electric', 'science', 'science-mid',
                       'geography-elem', 'bagrut-806', 'bagrut-history']);
const REG = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'stages.json'), 'utf8'));
const APPS = Object.keys(REG.apps)
  .filter(k => ['buildQ', 'UNITS', 'js/data.js'].includes(REG.apps[k].bank))
  .filter(k => !MATHY.has(k))
  .concat(['kotvim']);

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
      console.log(`✗ ${app.padEnd(13)} הדף לא נטען — ${e.message}`);
      bad++; await ctx.close(); continue;
    }

    const res = await page.evaluate(({ per, maxlen, symSrc, natSrc }) => {
      const mk = (typeof buildQuestion === 'function')
        ? (t, lv) => buildQuestion(t, lv, undefined, true)
        : (typeof buildQ === 'function') ? (t, lv) => buildQ(t, lv) : null;
      const SYM = new RegExp(symSrc), NAT = new RegExp(natSrc);
      /* O-174 — משפחת `js/{app,data,engine}.js` (civics-elem ועוד). אין בה
         buildQ ולא מסיחים עם הסבר; יש שדה `why` אחד לשאלה, בארבע שפות
         (שורת `Y` אחרי `Q` ב-data.js, או `why` באובייקט ב-science-12).
         כאן הדרישה מחמירה בשני דברים: הכתב חייב להיות של **השפה הזאת**
         (עברית בעברית, ערבית בערבית, קירילית ברוסית), וההסבר הוא **משפט
         אחד** — אין סוף משפט ואחריו עוד טקסט. שאלה בלי `why` אינה ממצא. */
      if (!mk && typeof ALL_Q !== 'undefined' && Array.isArray(ALL_Q)) {
        const SCRIPT = { he: /[א-ת]/, ar: /[ء-ي]/, ru: /[А-яЁё]/, en: /[A-Za-z]/ };
        const fam = { family: true, total: ALL_Q.length, with: 0 };
        for (const lg of ['he', 'ar', 'ru', 'en']) fam[lg] = { n: 0, sym: 0, foreign: 0, long: 0, multi: 0, ex: [] };
        for (const q of ALL_Q) {
          if (!q.why) continue;
          fam.with++;
          for (const lg of ['he', 'ar', 'ru', 'en']) {
            const r = fam[lg], w = String(q.why[lg] || '').trim();
            r.n++;
            const hitSym = SYM.test(w);
            const hitFor = !SCRIPT[lg].test(w);
            const hitLong = w.length > maxlen;
            const hitMulti = /[.!?؟;]\s+\S/.test(w);
            if (hitSym) r.sym++;
            if (hitFor) r.foreign++;
            if (hitLong) r.long++;
            if (hitMulti) r.multi++;
            if ((hitSym || hitFor || hitLong || hitMulti) && r.ex.length < 3)
              r.ex.push((hitSym ? 'סימן' : hitFor ? 'חסר או לא בשפת הלומד' : hitLong ? 'ארוך' : 'יותר ממשפט אחד') +
                        ': ' + (w || '(ריק)').slice(0, 74));
          }
        }
        return fam;
      }
      if (!mk) return { skip: true };

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
    if (res.skip) { console.log(`· ${app.padEnd(13)}אין buildQ/TOPICS — דולג`); continue }
    if (res.family) {
      if (!res.total) { console.log(`✗ ${app.padEnd(13)}ALL_Q ריק — הבדיקה שבורה, לא האפליקציה`); bad++; continue }
      if (!res.with) { console.log(`· ${app.padEnd(13)}0 מתוך ${res.total} שאלות עם הסבר (why) — אין עדיין תוכן`); continue }
      checked++;
      let famBad = 0; const fl = [];
      for (const lg of ['he', 'ar', 'ru', 'en']) {
        const r = res[lg], n = r.sym + r.foreign + r.long + r.multi;
        if (!n) continue;
        famBad += n;
        fl.push(`     ${lg}: ${r.sym} עם סימן · ${r.foreign} חסר או לא בשפת הלומד · ${r.long} ארוך מ-${MAXLEN} · ${r.multi} יותר ממשפט אחד`);
        for (const e of r.ex) fl.push('        ' + e);
      }
      if (famBad) { bad += famBad; console.log(`✗ ${app.padEnd(13)}${famBad} הסברים שאינם משפט קריא (${res.with} מתוך ${res.total} שאלות עם why)`); fl.forEach(l => console.log(l)) }
      else console.log(`✓ ${app.padEnd(13)}${res.with} מתוך ${res.total} שאלות עם הסבר, בארבע שפות — משפט אחד, בשפת הלומד, בלי סימנים`);
      continue;
    }

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
    if (!tot) { console.log(`✗ ${app.padEnd(13)}לא נמדד אף הסבר — הבדיקה שבורה, לא האפליקציה`); bad++; continue }
    checked++;
    if (appBad) { bad += appBad; console.log(`✗ ${app.padEnd(13)}${appBad} הסברים שאינם משפט קריא`); lines.forEach(l => console.log(l)) }
    else console.log(`✓ ${app.padEnd(13)}${tot} הסברים בארבע שפות — משפט, בשפת הלומד, בלי סימנים`);
  }

  await browser.close();
  console.log(`\n${checked} אפליקציות נמדדו, ${bad} ממצאים`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('✗ ' + e.message); process.exit(1) });
