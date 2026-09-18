/* =====================================================================
   teentr.js — ב-math-teen, שלושת מילוני התרגום מחזיקים את אותם מפתחות

   הכלל ב-CLAUDE.md הוא ״המחרוזת העברית היא המפתח״, ו-`i18n.js` אוכף
   אותו — אבל **רק בשלוש אפליקציות האוניברסיטה**, שהמנגנון שלהן הוא
   `_()` מול `TR_KEYS`. ל-`math-teen` מנגנון אחר לגמרי: `_()` מול
   `TR_AR` / `TR_RU` / `TR_EN`, ושלושה מילוני `_BAG` שמוזגים אליהם
   בזמן ריצה. הוא לא היה מכוסה בשום בדיקה.

   מה שקרה בלי הכיסוי הזה (O-58, 16.9.2026): `TR_AR_BAG` — 479
   מפתחות של הנושאים המתקדמים — מוזג אל `TR_AR` בלבד, ולא נוצרו
   `TR_RU_BAG` ו-`TR_EN_BAG`. `_()` מחזירה את העברית **בשקט** כשאין
   מפתח, ולכן לא הייתה שגיאה ולא סימן: 293 מחרוזות ברוסית ו-298
   באנגלית נשארו עברית על המסך. נמצא ביד, תוקן ביד, ודבר לא שמר
   שלא יחזור.

   ---------------------------------------------------------------
   שתי דרכים נוסו לפני זו, ושתיהן נכשלו. שתיהן רשומות כאן כדי
   שלא ינוסו שוב:

   **1 · פרסינג סטטי של המילונים — מדד לא נכון.** `TR_AR` הוא שורה
   אחת של אלפי מפתחות, ומפרסר שסופר סוגריים עליה החזיר 2330 מפתחות
   כשבזמן ריצה יש 2360. הפער המומצא ייצר ״18 מחרוזות חסרות בערבית״
   שכולן היו מתורגמות. זה בדיוק הבאג של O-69, שבו 155 ״מפתחות בלי
   תרגום״ היו שגיאת מדידה.

   **2 · דגימה של `trTodo()` בדפדפן — לא נושכת.** הרצת כל הנושאים
   והרמות, שש שאלות בכל תא, והעברת כל שדה דרך `_()`: המונה החזיר
   אפס — וגם אחרי **מחיקה מלאה** של מפתח מ-`TR_RU_BAG` הוא נשאר
   אפס, מפני שאותה מחרוזת לא נדגמה. בדיקה שלא נראתה אדומה אינה
   בודקת כלום. (ובדרך נמצא שגם *ריקון* ערך אינו נתפס: `_()` מחזירה
   `v` כש-`v !== undefined`, ומחרוזת ריקה מקיימת את זה — הלומד
   מקבל כלום, והמונה שותק. לכן יש כאן גם בדיקת ערך ריק.)

   **מה שכן עובד:** קוראים את שלושת המילונים **מהדפדפן** — אחרי
   שה-`_BAG` מוזגו, ולכן נכון תמיד — ומשווים את הקבוצות במלואן.
   דטרמיניסטי, בלי דגימה, בלי פרסר.
   ---------------------------------------------------------------

   **ושישים מפתחות ב-`TR_RU` אינם ב-`TR_AR`, וזה תקין ומכוון.**
   אלה ערכי ההחלפה של `SAY_MAP` — ״ סינוס ״, ״ כפול ״, ״ שורש של ״ —
   טקסט הקראה ולא טקסט מסך. לערבית יש `SAY_MAP_AR` משלה (`جيب`,
   `في`, `جذر`), וההערה שם מסבירה למה: בלעדיה הקול הערבי היה מקבל
   מילים עבריות. **השוואה תמימה הייתה מפילה את ההבדל המכוון הזה**,
   ולכן ערכי `SAY_MAP` מוחרגים — מהמפה עצמה בזמן ריצה, ולא מרשימה
   קשיחה שתתיישן.

   הוכחת נפילה — ראו FINDINGS 18.9.2026.

   דורש שרת:  node .claude/qa/serve.js &
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');

const APP = 'math-teen';
const BASE = 'http://127.0.0.1:8099';

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ locale: 'he-IL' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.route('**/*', r =>
    r.request().url().startsWith(BASE) ? r.continue() : r.abort());

  await page.goto(`${BASE}/${APP}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(900);

  const R = await page.evaluate(() => {
    for (const n of ['TR_AR', 'TR_RU', 'TR_EN'])
      if (typeof window[n] === 'undefined') return { fatal: `אין ${n}` };

    /* ערכי ההחלפה של SAY_MAP — הקראה, לא מסך. לערבית SAY_MAP_AR. */
    const say = [];
    (window.SAY_MAP || []).forEach(e => { if (typeof e[1] === 'string') say.push(e[1]); });

    const dump = o => { const d = {}; for (const k in o) d[k] = o[k]; return d; };
    return { say, ar: dump(TR_AR), ru: dump(TR_RU), en: dump(TR_EN) };
  });

  await ctx.close();
  await b.close();

  let bad = 0;
  if (R.fatal) { console.log(`✗ ${APP}: ${R.fatal}`); process.exit(1); }
  if (errs.length) { console.log(`✗ ${APP}: ${errs.length} שגיאות JS — ${errs[0]}`); bad++; }

  const SAY = new Set(R.say);
  const D = { ar: R.ar, ru: R.ru, en: R.en };
  const K = { ar: Object.keys(D.ar), ru: Object.keys(D.ru), en: Object.keys(D.en) };
  console.log(`· ${APP}: TR_AR ${K.ar.length} · TR_RU ${K.ru.length} · TR_EN ${K.en.length} · ` +
    `${SAY.size} ערכי SAY_MAP מוחרגים מהערבית`);

  /* 1 — מפתח שיש בשפה אחת ואין באחרת. ערכי SAY_MAP מוחרגים מהערבית
         בלבד, מפני ש-SAY_MAP_AR מכסה אותם שם. */
  const pairs = [['ru', 'ar'], ['en', 'ar'], ['ar', 'ru'], ['ar', 'en'], ['ru', 'en'], ['en', 'ru']];
  for (const [from, to] of pairs) {
    const skipSay = (to === 'ar' || from === 'ar');
    const miss = K[from].filter(k => !(k in D[to]) && !(skipSay && SAY.has(k)));
    if (miss.length) {
      bad++;
      console.log(`✗ ${APP}: ${miss.length} מפתחות ב-TR_${from.toUpperCase()} ואינם ב-TR_${to.toUpperCase()} — הלומד יראה עברית`);
      for (const k of miss.slice(0, 8)) console.log(`    ${JSON.stringify(k.slice(0, 70))}`);
      if (miss.length > 8) console.log(`    … ועוד ${miss.length - 8}`);
    }
  }

  /* 2 — ערך ריק. _() מחזירה אותו כמות שהוא, והלומד מקבל כלום. */
  for (const L of ['ar', 'ru', 'en']) {
    const empty = K[L].filter(k => !String(D[L][k]).trim());
    if (empty.length) {
      bad++;
      console.log(`✗ ${APP}: ${empty.length} ערכים ריקים ב-TR_${L.toUpperCase()} — הלומד מקבל מחרוזת ריקה`);
      for (const k of empty.slice(0, 8)) console.log(`    ${JSON.stringify(k.slice(0, 70))}`);
    }
  }

  if (!bad) console.log(`✓ ${APP}: שלושת המילונים מחזיקים את אותם מפתחות, ואין ערך ריק`);
  console.log(`${bad ? '✗' : '✓'} ${APP}, ${bad} כשלים`);
  process.exit(bad ? 1 : 0);
})();
