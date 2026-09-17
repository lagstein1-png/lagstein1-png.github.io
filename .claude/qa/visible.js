/* =====================================================================
   מסיח שכבר כתוב בשאלה — `node .claude/qa/visible.js [אפליקציה…]`

   **הממצא, 17.9.2026, ב-`english`.** שאלת השלמה מציגה משפט עם
   חסר, והמסיחים נשלפים מהמילים של אותה רמה — **בלי לדחות מילה
   שנשארה גלויה במשפט עצמו.** נמדד על 80 שאלות השלמה: ב-**26
   מהן, 33%**, אפשרות שגויה אחת לפחות הופיעה כבר בתוך המשפט:

       Could you _____ a bit more slowly?
       אפשרויות:  speak · Could · yet · spell

   הלומד פוסל את "Could" **בלי לדעת אנגלית** — היא כתובה מול
   עיניו. ארבע אפשרויות הופכות בשקט לשלוש, וניחוש עיוור עולה
   מ-25% ל-33%.

   **ולמה זה לא נתפס עד היום.** `guess.js` מכויל למה שאפשר
   לנחש מ**צורת** האפשרויות — אורך התשובה ומיקומה — ולא ממה
   שכתוב בגוף השאלה. שני הרמזים שונים לגמרי, ולכן זו בדיקה
   נפרדת ולא סעיף שם: `guess.js` מחזיק מעבר אישור עם עשירית
   מהדגימות, ואין סיבה להכניס לתוכו לוגיקה שאינה מודדת ניחוש
   סטטיסטי.

   **מה נחשב ״כתוב בשאלה״.** מילה שלמה, שלושה תווים ומעלה,
   בגוף השאלה בלבד — `gapHtml`, `expr`, `ask`, `lead`, `prompt`
   ו-`subject`. לא הסבר, לא רמז ולא צעדי פתרון: אלה נפתחים
   **אחרי** המענה, ואינם רמז.

   **שלושה תווים ולא שניים** — כדי שמשתנה (`x`, `y`) ומילית לא
   ייחשבו. וההשוואה היא על מילה שלמה ולא על הכלה: "sing" בתוך
   "singing" אינה אותה מילה, ופסילה כזאת הייתה מדווחת על תקין.

   **והבדיקה מוגבלת לשאלת חסר, אחרי שהגרסה הרחבה דיווחה על
   תוכן תקין.** הגרסה הראשונה בדקה כל שאלה, ומצאה 38 ״ממצאים״
   בחמש אפליקציות — ורובם המכריע היו נכונים לגמרי:

       math-uni2  ״האם הטור מתכנס?״      אפשרויות: מתכנס · מתבדר
       math-uni3  ״האם הפונקציה אנליטית?״  אפשרויות: אנליטית · אינה

   שם המונח **חייב** להופיע בשאלה — זו שאלת כן/לא, והאפשרויות
   הן שני צדי אותו מונח. לומד אינו יכול לפסול ״מתכנס״ רק מפני
   שהמילה כתובה למעלה; הוא עדיין צריך להכריע.

   **ההיגיון של הממצא תקף רק כשהשאלה היא משפט עם חסר**: שם
   האפשרויות הן מועמדים למילוי החסר, ומילה שכבר גלויה במשפט
   אינה מועמד — היא נפסלת בלי ידע. לכן הבדיקה דורשת חסר בגוף
   השאלה (`gapHtml`, או `_____` בטקסט), וכל השאר מדולג.

   זה בדיוק הכלל של `FINDINGS.md`: בדיקה שמדווחת על תקין גרועה
   מבדיקה שאינה קיימת, מפני שהיא מלמדת להתעלם ממנה.

   נמדד אחרי הצמצום: `english` 0 מתוך 80 שאלות חסר (היה 26),
   ושאר האפליקציות — אין בהן שאלות חסר כלל.
   ===================================================================== */
'use strict';

const { chromium } = require('./pw.js');

const BASE = process.env.QA_BASE || 'http://127.0.0.1:8099';
const PER_CELL = Number(process.env.QA_N || 6);

/* הרשימה נגזרת מ-`stages.json` ואינה כתובה ביד — רשימה קשיחה
   מתיישנת בכל אפליקציה שנוספת או נמחקת, וזה בדיוק מה שקרה
   ל-`fonts.js` (מנתה `pricing` שנמחקה, החמיצה את `kotvim`). */
const STAGES = require('./stages.json');
const LOCAL = Object.entries(STAGES.apps || {})
  .filter(([, v]) => !(v && v.external))
  .map(([k]) => k);

const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
const APPS = only.length ? only : LOCAL;

/* מפריד מילים בעברית, ערבית, קירילית ולטינית. */
const SPLIT = /[^A-Za-z֐-׿؀-ۿЀ-ӿ']+/;

async function scan(page, per) {
  return page.evaluate(({ per, splitSrc }) => {
    const SP = new RegExp(splitSrc.slice(1, splitSrc.lastIndexOf('/')),
                          splitSrc.slice(splitSrc.lastIndexOf('/') + 1));
    /* שני שמות לאותו דבר: משפחת החידון חושפת `buildQuestion` עם
       `pure`, ומשפחת המתמטיקה `buildQ(tid, lv)`. */
    const mk = (typeof buildQuestion === 'function')
      ? (t, lv) => buildQuestion(t, lv, undefined, true)
      : (typeof buildQ === 'function') ? (t, lv) => buildQ(t, lv) : null;
    if (!mk || typeof TOPICS === 'undefined' || !TOPICS || !TOPICS.length)
      return { skip: true };

    const d = document.createElement('div');
    const txt = h => { d.innerHTML = String(h == null ? '' : h);
                       return (d.textContent || '').replace(/\s+/g, ' ').trim() };

    let n = 0, bad = 0;
    const ex = [];
    for (const t of TOPICS) {
      for (const lv of [1, 2, 3, 4]) {
        for (let k = 0; k < per; k++) {
          let q;
          try { q = mk(t.id, lv) } catch (e) { continue }
          /* **שני שמות לשדה, וזה מה שהפיל את הגרסה הראשונה.**
             משפחת החידון מחזירה `opts`, ומשפחת המתמטיקה
             `options` — שני המערכים באותו מבנה `{h,t,ok,why}`.
             הבדיקה הראשונה הכירה רק `opts`, ולכן דיווחה ״לא
             נמדדה אף שאלה״ על חמש אפליקציות תקינות; זה נראה
             כמו ממצא והיה באג בבדיקה. */
          const opts = (q.opts && q.opts.length) ? q.opts
                     : (q.options && q.options.length) ? q.options : null;
          if (!opts || opts.length < 2) continue;
          /* גוף השאלה בלבד. רמז, הסבר וצעדים נפתחים אחרי המענה. */
          const stem = [q.gapHtml, q.expr, q.ask, q.lead, q.prompt, q.subject]
            .map(txt).join(' ').toLowerCase();
          if (!stem.trim()) continue;
          /* **רק שאלת חסר.** ראו הנימוק בראש הקובץ: בשאלת כן/לא
             המונח חייב להופיע בשאלה, והאפשרויות הן שני צדיו. */
          if (!q.gapHtml && stem.indexOf('_____') < 0) continue;
          n++;
          const words = new Set(stem.split(SP).filter(Boolean));
          for (const o of opts) {
            if (o.ok) continue;
            const w = txt(o.h).toLowerCase();
            if (w.length >= 3 && words.has(w)) {
              bad++;
              if (ex.length < 3) ex.push(t.id + ' L' + lv + ': "' + w +
                '" כבר בשאלה — ' + stem.slice(0, 60));
              break;
            }
          }
        }
      }
    }
    return { n, bad, ex };
  }, { per, splitSrc: String(SPLIT) });
}

(async () => {
  const browser = await chromium.launch();
  let bad = 0, checked = 0;

  for (const app of APPS) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.route('**', r =>
      r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    try {
      await page.goto(`${BASE}/${app}/`, { waitUntil: 'domcontentloaded' });
      /* המתנה לתנאי ולא לשעון — אותו תיקון שנעשה ב-`content.js`:
         שעון קבוע קרא מצב חלקי במכונה עמוסה. */
      await page.waitForFunction(
        () => (typeof buildQuestion === 'function' || typeof buildQ === 'function') &&
              typeof TOPICS !== 'undefined' && TOPICS && TOPICS.length > 0,
        { timeout: 8000 }).catch(() => {});
    } catch (e) {
      console.log(`✗ ${app.padEnd(11)} הדף לא נטען — ${e.message}`);
      bad++; await ctx.close(); continue;
    }

    const r = await scan(page, PER_CELL);
    await ctx.close();

    if (r.skip) { console.log(`· ${app.padEnd(11)}אין buildQ/TOPICS — דולג`); continue }
    /* אפליקציה בלי שאלות חסר אינה כשל — רוב האפליקציות כאלה.
       הכשל היחיד שנשאר הוא ״אין buildQ/TOPICS״ שמעלה `skip`. */
    if (!r.n)   { console.log(`· ${app.padEnd(11)}אין שאלות חסר — דולג`); continue }

    checked++;
    if (r.bad) {
      bad += r.bad;
      console.log(`✗ ${app.padEnd(11)}${r.bad} מתוך ${r.n} שאלות חסר עם מסיח שכבר גלוי במשפט`);
      for (const e of r.ex) console.log('     ' + e);
    } else {
      console.log(`✓ ${app.padEnd(11)}${r.n} שאלות חסר, אף מסיח אינו גלוי במשפט`);
    }
  }

  await browser.close();
  console.log(`\n${checked} אפליקציות נמדדו, ${bad} ממצאים`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('✗ ' + e.message); process.exit(1) });
