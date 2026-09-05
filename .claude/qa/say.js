/* =====================================================================
   מה נאמר לפני שעונים — האם ההקראה מסגירה את התשובה.

     node .claude/qa/say.js                      # ארבע אפליקציות החידון
     node .claude/qa/say.js history lomda        # רק אלה שנקבו בשמן
     node .claude/qa/say.js --n 120              # יותר שאלות לכל אפליקציה

   דורש את השרת המקומי: node .claude/qa/serve.js

   מקש הרווח בתרגול מקריא את השאלה. עד 5.9.2026 הוא הקריא את
   `P.q.say` בלי לבדוק אם כבר ענו, וב-`say` יושבת התשובה — במפנה
   ובלומדה כרטיס הפריט המלא, בניב ובאולפן המילה או המשפט שמחפשים.
   נמדד בדפדפן אמיתי: מפנה 60 מתוך 60, לומדה 54, ניב 21, אולפן 15
   (מתוך 60 שאלות שנדגמו בכל אחת, בלי שאלות האזנה). מי שקורא לאט לחץ
   רווח כדי לשמוע את השאלה, ושמע את הפתרון.

   הבדיקה: בכל אפליקציה נבנות n שאלות, לפני כל אחת נלחץ רווח, ומה
   ש-`speak` קיבל מושווה לתשובה. דליפה היא א־סימטרית — התשובה נאמרת
   ואף מסיח לא — כי הקראה שמונה את כל האפשרויות היא תפקידה. שאלת
   האזנה (`hear`) אינה נספרת: שם השמע **הוא** השאלה.

   קו הבסיס הוא אפס. הבאג הזה תוקן פעם אחת בענף שלא מוזג, ואפליקציה
   שנולדה בינתיים מהעתקה קיבלה אותו מחדש — לכן הוא נבדק כאן ולא
   נזכר.
   ===================================================================== */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const argv = process.argv.slice(2);
const N = argv.includes('--n') ? Number(argv[argv.indexOf('--n') + 1]) || 60 : 60;
const apps = argv.filter(a => !a.startsWith('--') && !/^\d+$/.test(a)).map(a => a.replace(/\/$/, ''));
const TARGET = apps.length ? apps : ['english', 'ulpan', 'history', 'lomda'];
const BASE = 'http://127.0.0.1:8099';

async function click(p, s) { try { await p.click(s, { timeout: 1500 }); await p.waitForTimeout(200); return true } catch (e) { return false } }

(async () => {
  const b = await chromium.launch();
  let failed = 0;
  for (const app of TARGET) {
    const ctx = await b.newContext({ locale: 'he-IL' });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    await page.goto(BASE + '/' + app + '/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(600);
    await click(page, '#lg-ok');
    for (let i = 0; i < 8; i++) {
      if (await page.$('[data-a="selpet"]')) await click(page, '[data-a="selpet"]');
      if (await page.$('[data-a="startpet"]')) { await click(page, '[data-a="startpet"]'); continue }
      if (await page.$('[data-a="obnext"]')) { await click(page, '[data-a="obnext"]'); continue }
      break;
    }
    const r = await page.evaluate(n => {
      const out = { n: 0, leak: 0, hear: 0, byType: {}, ex: [] };
      if (typeof newQuestion !== 'function' || typeof P === 'undefined') { out.err = 'אין newQuestion/P'; return out }
      let spoken = '';
      window.speak = function (t) { spoken = String(t || '') };
      const strip = s => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      try { state.screen = 'prac'; if (!state.level) state.level = 1 } catch (e) {}
      for (let i = 0; i < n; i++) {
        try { if (typeof TOPICS !== 'undefined' && TOPICS.length) state.topic = TOPICS[i % TOPICS.length].id } catch (e) {}
        try { newQuestion() } catch (e) { out.err = String(e); break }
        if (!P.q || P.done) continue;
        if (P.q.type === 'hear') { out.hear++; continue }
        spoken = '';
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
        const ans = strip(P.q.answer), sp = strip(spoken);
        if (!ans) continue;
        out.n++;
        const others = (P.q.opts || []).map(o => strip(typeof o === 'string' ? o : (o && o.h)))
                                        .filter(x => x && x !== ans);
        if (sp.indexOf(ans) >= 0 && !others.some(o => sp.indexOf(o) >= 0)) {
          out.leak++;
          out.byType[P.q.type] = (out.byType[P.q.type] || 0) + 1;
          if (out.ex.length < 3) out.ex.push(P.q.type + ': "' + ans.slice(0, 40) + '" ← "' + sp.slice(0, 70) + '"');
        }
      }
      return out;
    }, N);
    const bad = r.leak > 0 || r.err || errs.length;
    if (bad) failed++;
    console.log(`${bad ? '✗' : '✓'} ${app.padEnd(10)} ${r.n} שאלות (ועוד ${r.hear} האזנה שאינן נספרות), ${r.leak} דליפות` +
      (r.leak ? '  ' + JSON.stringify(r.byType) : '') + (r.err ? '  ' + r.err : '') +
      (errs.length ? '  JS: ' + errs[0] : ''));
    for (const e of r.ex) console.log('     ' + e);
    await ctx.close();
  }
  await b.close();
  console.log(failed ? `\n${failed} מתוך ${TARGET.length} מסגירות את התשובה` : `\n${TARGET.length} אפליקציות, אף אחת אינה מסגירה את התשובה לפני שעונים`);
  process.exit(failed ? 1 : 0);
})();
