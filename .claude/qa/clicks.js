/* =====================================================================
   clicks.js — כל לחיצה מושמעת (O-27, החלטת הבעלים 9.9.2026)

   כשההקראה דולקת, כפתור שנלחץ מוקרא בשמו בשפת הממשק. הבדיקה מחליפה
   את speak במונה, מדליקה את ההקראה, לוחצת על כפתור ניווט אחד (לא
   אפשרות תשובה — אלה מדברות בעצמן, ולפני הבחירה אסור), ומצפה שהתווית
   שלו תיאמר תוך שנייה. אפליקציה שלא אמרה — אדומה.

   הוכחת נפילה (9.9.2026, לפני sayClick): תשע אפליקציות, אפס אמירות.
   O-28 (אותו יום): kotvim, reader ו-bagrut-806 — שלוש אדומות לפני, אפס אחרי.
   O-29 (10.9.2026): המתג. כבוי → שקט. שלוש בלי מתג — אדומות לפני, אפס אחרי.
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');
const BASE = 'http://127.0.0.1:8099';
const APPS = ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
              'english', 'history', 'ulpan', 'lomda', 'kotvim', 'reader', 'bagrut-806'];
/* שלוש בלי שליח [data-a] אחיד (O-28): איפה נתפסת האמירה, ועל מה לוחצים.
   reader מדבר ישר אל speechSynthesis; bagrut-806 דרך Speech.say. */
const SPECIAL = {
  reader:       { stub: 'speech', pick: '#btnTheme',            off: '#btnSay' },
  'bagrut-806': { stub: 'Speech', pick: '[data-go="settings"]', off: '[data-say="0"]' },
  kotvim:       { off: '[data-a="tog"][data-v="sayBtn"]', open: '[data-a="set"]' },
};
/* O-29: המתג. בתשע — state.settings.tts; בשלוש — כפתור במסך ההגדרות
   (off), ולפעמים צריך קודם להגיע למסך (open). כשהמתג כבוי, לחיצה
   חייבת לשתוק. */
/* מה לא לוחצים: תשובות (מדברות בעצמן), מתג ההקראה (היה מכבה אותה),
   כפתורי הקראה (מדברים תוכן), ומסכי הפתיחה. */
const SKIP = /^(ans|pick|sitans|tts|say|sayline|ksay|selpet|startpet|obnext|vmode|slot|unslot)$/;
const argv = process.argv.slice(2);
const TARGET = argv.length ? argv.map(a => a.replace(/\/$/, '')) : APPS;

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
    /* אפליקציה בשלב internal נושאת שער; המפתח נקרא מהקובץ עצמו, לא מוקלד כאן */
    let qs = '';
    try {
      const src = require('fs').readFileSync(require('path').join(__dirname, '..', '..', app, 'index.html'), 'utf8');
      const km = src.match(/var INTERNAL_KEY="([^"]+)"/);
      if (km) qs = '?internal=' + encodeURIComponent(km[1]);
    } catch (e) {}
    await page.goto(BASE + '/' + app + '/' + qs, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(600);
    await click(page, '#lg-ok');
    for (let i = 0; i < 8; i++) {
      if (await page.$('[data-a="selpet"]')) await click(page, '[data-a="selpet"]');
      if (await page.$('[data-a="startpet"]')) { await click(page, '[data-a="startpet"]'); continue }
      if (await page.$('[data-a="obnext"]')) { await click(page, '[data-a="obnext"]'); continue }
      break;
    }
    const sp = SPECIAL[app] || null;
    const r = await page.evaluate(async ([skip, sp]) => {
      const out = { label: '', said: [], err: '' };
      window.said = [];
      if (!sp || !sp.stub) {
        try { state.settings.tts = true; } catch (e) { /* kotvim: אין מתג, ההקראה תמיד זמינה */ }
        window.speak = function (t) { window.said.push(String(t || '')) };
      } else if (sp.stub === 'speech') {
        speechSynthesis.speak = function (u) { window.said.push(String(u && u.text || '')) };
      } else if (sp.stub === 'Speech') {
        if (!window.Speech || !window.Speech.say) { out.err = 'אין Speech.say'; return out }
        window.Speech.say = function (t) { window.said.push(String(t || '')) };
      }
      const re = new RegExp(skip);
      const btn = (sp && sp.pick) ? document.querySelector(sp.pick)
        : Array.prototype.find.call(document.querySelectorAll('button[data-a]'), el => {
        const a = el.getAttribute('data-a');
        if (re.test(a) || el.disabled) return false;
        const t = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();
        return t && t.length <= 60 && el.offsetParent !== null;
      });
      if (!btn) { out.err = 'לא נמצא כפתור ניווט ללחוץ עליו'; return out }
      out.label = (btn.getAttribute('aria-label') || btn.textContent || '').replace(/\s+/g, ' ').trim();
      out.action = btn.getAttribute('data-a') || btn.getAttribute('data-go') || btn.id;
      btn.click();
      await new Promise(f => setTimeout(f, 1000));
      out.said = window.said.map(s => s.replace(/\s+/g, ' ').trim());
      return out;
    }, [SKIP.source, sp]);
    /* --- המתג כבוי: אותה לחיצה, שום אמירה --- */
    const q = await page.evaluate(async (sp) => {
      const out = { said: [], err: '' };
      try {
        if (sp && sp.open) { const o = document.querySelector(sp.open); if (o) { o.click(); await new Promise(f => setTimeout(f, 300)); } }
        if (sp && sp.off) {
          const t = document.querySelector(sp.off);
          if (!t) { out.err = 'אין מתג ' + sp.off; return out }
          /* המתג עצמו יכול לדבר לפני שהוא כבה — מחכים שיסיים */
          t.click(); await new Promise(f => setTimeout(f, 800));
          if (sp.off === '#btnSay' && t.getAttribute('aria-pressed') !== 'false') { t.click(); await new Promise(f => setTimeout(f, 800)); }
          if (sp.off.indexOf('tog') >= 0 && t.getAttribute('aria-checked') !== 'false') { t.click(); await new Promise(f => setTimeout(f, 800)); }
        } else { state.settings.tts = false; }
        window.said = [];
        const btn = document.querySelector((sp && sp.pick) || 'button[data-a="prog"],button[data-a="go"]');
        if (!btn) { out.err = 'אין כפתור ללחוץ עליו כשהמתג כבוי'; return out }
        btn.click(); await new Promise(f => setTimeout(f, 1000));
        out.said = window.said.slice();
      } catch (e) { out.err = String(e) }
      return out;
    }, sp);
    const okOn = !r.err && r.said.some(s => s === r.label) && !errs.length;
    const okOff = !q.err && q.said.length === 0;
    const ok = okOn && okOff;
    if (!ok) failed++;
    console.log(`${ok ? '✓' : '✗'} ${app.padEnd(10)} ${r.err || `"${r.label}" (${r.action}) → נאמר: ${JSON.stringify(r.said.slice(0, 3))}`}` +
                (okOff ? '  · כבוי: שקט' : '  · כבוי: ' + (q.err || 'נאמר ' + JSON.stringify(q.said.slice(0, 2)))) +
                (errs.length ? '  JS: ' + errs[0] : ''));
    await ctx.close();
  }
  await b.close();
  console.log(`\n${failed} מתוך ${TARGET.length} לא מקריאות את הכפתור שנלחץ`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1) });
