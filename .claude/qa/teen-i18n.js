/* =====================================================================
   teen-i18n.js — ״שלב״ בארבע שפות בפועל: מה שנבנה מוצג ונשמע בלי עברית

   O-58 נמדד 16.9.2026: 293 מחרוזות ברוסית ו-298 באנגלית נשארו עברית
   על המסך. השורש — TR_AR_BAG בלי TR_RU_BAG/TR_EN_BAG — נסגר ב-O-65,
   ומה שנשאר (נמדד 18.9.2026: ערבית 9, רוסית 13, אנגלית 15) הוא שברי
   פיצול של trParts: מפתחות שנרשמו לפני תיקון המינוס הטיפוגרפי
   (״והשני −״, ״…√(b²−״), המקף המחבר לפני מינוס (״ו-−6״), ומילה
   עברית בתוך ביטוי שנשלח להקראה (״10 процентов מתוך 40״).

   הבדיקה, בדפדפן אמיתי, לכל אחת משלוש השפות:
     1. 24 נושאים × כל הרמות (LVL) × 6 שאלות; כל שדה שמוצג —
        ask, expr, options.h, options.why, steps.t/d/m, hint — עובר
        trHTML כפי שהמסך עושה, ו-window.trTodo() חייב לחזור ריק.
     2. q.say — מה שמגיע למנוע ההקראה — בלי אות עברית אחת.
     3. מילה מתורגמת שצמודה לספרה (״делим на2a״, ״and3״): המקף
        המחבר של העברית נשמט, והרווח שהיה צריך לבוא במקומו לא הגיע.
        ברוסית ובאנגלית זה שגוי תמיד; בערבית ו/ב חד־אותיות נצמדות
        בכוונה, ולכן נבדק רק אחרי מילה של שתי אותיות ומעלה.

   הוכחת נפילה: על 71c0b11 — ar 9 · ru 13 · en 15 מפתחות, ו-say עם
   עברית בשלוש השפות. אחרי התיקון — 0 בכל הסעיפים.
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');
const N = +(process.env.QA_N || 6);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ locale: 'he-IL' });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:8099') ? r.continue() : r.abort());
  await page.goto('http://127.0.0.1:8099/math-teen/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  const r = await page.evaluate((N) => {
    const HE = /[֐-׿]/;
    const out = {};
    for (const lg of ['ar', 'ru', 'en']) {
      LG = lg; for (const k in TR_TODO) delete TR_TODO[k];
      let qs = 0, sayBad = [], glue = [];
      const shown = [];
      const see = s => { if (s && HE.test(s)) shown.push(String(s)); };
      const LV = (typeof LVL !== 'undefined' && LVL.length) || 3;
      for (const t of TOPICS) for (let lv = 1; lv <= LV; lv++) for (let i = 0; i < N; i++) {
        let q; try { q = buildQ(t.id, lv); } catch (e) { continue; }
        if (!q) continue; qs++;
        see(q.ask); see(q.expr); see(q.hint); see(q.given);
        (q.options || []).forEach(o => { see(o.h); see(o.why); });
        (q.steps || []).forEach(s => { see(s.t); see(s.d); see(s.m); });
        if (q.say && HE.test(q.say) && sayBad.length < 6) sayBad.push(t.id + ' L' + lv + ': ' + q.say.slice(0, 80));
      }
      for (const s of shown) {
        const tr = trHTML('>' + s + '<');
        /* אות לא־עברית שצמודה לספרה, אחרי מילה של שתי אותיות ומעלה */
        const m = tr.match(lg === 'ar' ? /[؀-ۿ]{2,}\d/ : /[A-Za-zА-яЁё]{2,}\d/);
        /* בערבית ״بـ0.6״ נצמד בכוונה — התטוויל (U+0640) הוא הסימן */
        if (m && !(lg === 'ar' && /\u0640\d/.test(m[0])) && glue.length < 6) glue.push(tr.replace(/^>|<$/g, '').slice(0, 80));
      }
      out[lg] = { qs, todo: Object.keys(TR_TODO).sort(), sayBad, glue };
    }
    LG = 'he';
    return out;
  }, N);
  await b.close();
  let bad = 0;
  for (const lg of ['ar', 'ru', 'en']) {
    const x = r[lg];
    const n = x.todo.length + x.sayBad.length + x.glue.length;
    if (n) bad++;
    console.log(`${n ? '✗' : '✓'} ${lg}: ${x.qs} שאלות · ${x.todo.length} מפתחות חסרים · ${x.sayBad.length} הקראות עם עברית · ${x.glue.length} מילים צמודות לספרה`);
    x.todo.slice(0, 8).forEach(k => console.log('     מפתח: ' + k));
    x.sayBad.slice(0, 3).forEach(k => console.log('     הקראה: ' + k));
    x.glue.slice(0, 3).forEach(k => console.log('     צמוד: ' + k));
  }
  if (errs.length) { bad++; console.log('✗ JS: ' + errs[0]); }
  console.log(`${bad ? '✗' : '✓'} math-teen בשלוש שפות — ${bad} שפות עם עברית שנשארה`);
  process.exit(bad ? 1 : 0);
})();
