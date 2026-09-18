/* =====================================================================
   tutor-timeout.js — ספק שתולה, והפאנל של ברק אינו נתקע (O-72)

   שני נתיבים בדפדפן אמיתי, math-app, מול `page.route` שאינו עונה
   לעולם על כתובת ה-Worker:

     1. הנתיב הרגיל — `send()` דרך `BARAK.ask` (barak-core.js טעון)
     2. הנתיב הישן — `sendLegacy()`, כש-`/tutor/barak-core.js` נחסם
        (route.abort) ולכן `BARAK` אינו מוגדר — בדיוק מה שקורה
        כשהקובץ לא נטען

   בשניהם: תוך 12 שניות מגיעה תשובה של ברק (מהמוח המקומי) או הערה
   קריאה, ושדה הקלט חוזר לפעול. ״רגע, חושב…״ שנשאר — כישלון.

   הוכחת נפילה 18.9.2026, לפני התיקון: הנתיב הישן נשאר BUSY אחרי
   13,329 ms, #tu-in ו-#tu-go מנוטרלים, אין תשובה.

   הרצה:  node .claude/qa/tutor-timeout.js
   דורש:  node .claude/qa/serve.js
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');
const BASE = 'http://127.0.0.1:8099';
const APP = 'math-app';
const LIMIT_MS = 12000;

(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const legacy of [false, true]) {
    const ctx = await b.newContext({ locale: 'he-IL', viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    let hung = 0;
    await page.route('**/*', r => {
      const u = r.request().url();
      if (/workers\.dev/.test(u)) { hung++; return; }                 /* תולה לעולם */
      if (legacy && /\/tutor\/barak-core\.js/.test(u)) return r.abort();
      return u.startsWith(BASE) ? r.continue() : r.abort();
    });
    await page.goto(BASE + '/' + APP + '/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(700);
    await page.addStyleTag({ content: '#tts-fail{display:none !important}' });
    try { await page.click('#lg-ok', { timeout: 1500 }) } catch (e) {}
    for (let i = 0; i < 8; i++) {
      let did = false;
      for (const s of ['[data-a="selpet"]', '[data-a="startpet"]', '[data-a="obnext"]']) {
        if (await page.$(s)) { try { await page.click(s, { timeout: 1500 }); did = true } catch (e) {} }
      }
      if (!did) break;
      await page.waitForTimeout(200);
    }
    const ready = await page.evaluate(() => !!(window.BARAK && BARAK.ready()));
    if (legacy === ready) { console.log(`✗ ${legacy ? 'legacy' : 'barak'}: הנתיב לא הושג (BARAK.ready=${ready})`); bad++; await ctx.close(); continue; }
    await page.evaluate(() => { try { TUTOR._clear() } catch (e) {} try { TUTOR.open() } catch (e) {} });
    await page.waitForTimeout(300);
    await page.fill('#tu-in', 'לא הבנתי');
    const t0 = Date.now();
    await page.press('#tu-in', 'Enter');
    let reply = null, note = '', at = null;
    while (Date.now() - t0 < LIMIT_MS) {
      await page.waitForTimeout(150);
      const st = await page.evaluate(() => ({
        msgs: TUTOR._state().msgs,
        inOff: document.querySelector('#tu-in').disabled,
        note: (document.querySelector('.tu-note') || {}).textContent || ''
      }));
      const last = st.msgs[st.msgs.length - 1];
      if (last && last.role === 'assistant' && !st.inOff) { reply = last; at = Date.now() - t0; break }
      if (!st.inOff && st.note.trim()) { note = st.note.trim(); at = Date.now() - t0; break }
    }
    const name = legacy ? 'sendLegacy (barak-core.js חסום)' : 'send דרך BARAK';
    if (reply || note) {
      console.log(`✓ ${name}: ${reply ? 'תשובה מקומית' : 'הערה ״' + note + '״'} אחרי ${at} ms, ${hung} בקשה תלויה`);
    } else {
      console.log(`✗ ${name}: אחרי ${LIMIT_MS} ms אין תשובה ואין הערה — הפאנל תקוע`);
      bad++;
    }
    if (errs.length) { console.log('  pageerror: ' + errs.join(' | ')); bad++; }
    await ctx.close();
  }
  await b.close();
  console.log(bad ? `${bad} ממצאים` : '2 נתיבים, 0 ממצאים');
  process.exit(bad ? 1 : 0);
})();
