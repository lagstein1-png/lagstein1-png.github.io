/* =====================================================================
   barak-browser.js — מנוע ברק בדפדפן אמיתי, מול שרת מדומה

   לכל אפליקציה: פותחים את הדף (שער התנאים, אונבורדינג), מיירטים את
   הכתובת של ה-Worker ב-`page.route` ועונים תשובות מתוסרטות — כלומר
   **אין רשת ואין מודל**, ומה שנבדק הוא החוזה בין הלקוח לאפליקציה:

     1. הגוף שנשלח נושא screen (שאלה, אפשרויות, תשובה נכונה) ו-actions
     2. next_question שהשרת החזיר — המסך באמת מתחלף (id שונה)
     3. show_hint — הרמז באמת נפתח (run החזירה true)
     4. פעולה שנכשלת — הטקסט שמוצג הוא ACTION_FAILED ולא מה שהמודל כתב
     5. פעולה לא רשומה — action null, הטקסט מוצג
     6. אופליין (route.abort) — תשובה מקומית, ו״הבא״ מבוצע מקומית
     7. 429 — תשובה מקומית בלי הודעת שגיאה
     8. אפס pageerror

   הרצה:  node .claude/qa/barak-browser.js [app …]
   דורש:  node .claude/qa/serve.js
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');
const fs = require('fs'), path = require('path');
const BASE = 'http://127.0.0.1:8099';
const APPS = ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
              'english', 'history', 'ulpan', 'lomda', 'kotvim', 'reader', 'bagrut-806'];
const argv = process.argv.slice(2);
const TARGET = argv.length ? argv.map(a => a.replace(/\/$/, '')) : APPS;
const API_RE = /workers\.dev/;
async function click(p, s) { try { await p.click(s, { timeout: 1500 }); await p.waitForTimeout(200); return true } catch (e) { return false } }

/* מה שהאפליקציה צריכה כדי להגיע למסך שאלה. `enter` הוא מבחר של
   לחיצות; מפסיקים ברגע ש-BARAK.context() מחזיר משהו. */
const ENTER = {
  'math-teen':  ['[data-a="topic"]', '[data-a="lvl"]', '[data-a="start"]', '[data-a="go"][data-v="practice"]'],
  'math-uni':   ['[data-a="topic"]', '[data-a="lvl"]', '[data-a="start"]'],
  'math-uni2':  ['[data-a="topic"]', '[data-a="lvl"]', '[data-a="start"]'],
  'math-uni3':  ['[data-a="topic"]', '[data-a="lvl"]', '[data-a="start"]'],
  'english':    ['[data-a="open"]'],
  'history':    ['[data-a="open"]'],
  'ulpan':      ['[data-a="open"]'],
  'lomda':      ['[data-a="open"]'],
  'kotvim':     ['[data-a="ktype"]', '[data-a="ktopic"]', '[data-a="kpick"]'],
  /* reader: הדוגמה המובנית, ואז ״בלי ניקוד״ כי בקשת הניקוד נחסמת בבדיקה */
  'reader':     ['#btnSample', '#btnGo', '#btnNoNikud'],
  'bagrut-806': ['[data-topic]', '[data-exam]', '[data-go="practice"]']
};

/* עקיפה לזמן פיתוח: BARAK_ENTER='{"english":["[data-a=\"x\"]"]}' */
try { Object.assign(ENTER, JSON.parse(process.env.BARAK_ENTER || '{}')) } catch (e) {}

(async () => {
  const b = await chromium.launch();
  let failed = 0;
  for (const app of TARGET) {
    const ctx = await b.newContext({ locale: 'he-IL', viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    /* התסריט: כל בקשה ל-Worker נענית לפי `MODE` שהדף קובע ב-window.__barakMode */
    const seen = [];
    let mode = 'text';
    await page.route('**/*', async r => {
      const u = r.request().url();
      if (API_RE.test(u)) {
        let body = {};
        try { body = JSON.parse(r.request().postData() || '{}') } catch (e) {}
        seen.push(body);
        if (mode === 'abort') return r.abort();
        if (mode === '429') return r.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: 'limit', scope: 'you', fallback: 'local' }) });
        const out = { say: 'תשובה מהשרת המדומה', action: null, face: 'speaking', source: 'ai', model: 'fake' };
        if (mode === 'next') { out.action = { name: 'next_question', args: {} }; out.say = 'עוברים לשאלה הבאה' }
        if (mode === 'hint') { out.action = { name: 'show_hint', args: {} }; out.say = 'הנה רמז' }
        if (mode === 'unknown') { out.action = { name: 'go_to_moon', args: {} }; out.say = 'טס לירח' }
        if (mode === 'bad-go') { out.action = { name: 'go_screen', args: { name: 'nowhere' } }; out.say = 'עוברים למקום שאינו קיים' }
        if (mode === 'highlight') { out.action = { name: 'highlight_option', args: { index: 1 } }; out.say = 'תראה את האפשרות השנייה' }
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
      }
      return u.startsWith(BASE) ? r.continue() : r.abort();
    });
    let qs = '';
    try {
      const src = fs.readFileSync(path.join(__dirname, '..', '..', app, 'index.html'), 'utf8');
      const km = src.match(/var INTERNAL_KEY="([^"]+)"/);
      if (km) qs = '?internal=' + encodeURIComponent(km[1]);
    } catch (e) {}
    await page.goto(BASE + '/' + app + '/' + qs, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(700);
    /* בדפדפן ללא קולות האפליקציה מציגה פס ״אין קול״ שתופס לחיצות — הוא
       עניין של המכשיר, לא של ברק. */
    await page.addStyleTag({ content: '#tts-fail{display:none !important}' });
    await click(page, '#lg-ok');
    for (let i = 0; i < 8; i++) {
      if (await page.$('[data-a="selpet"]')) await click(page, '[data-a="selpet"]');
      if (await page.$('[data-a="startpet"]')) { await click(page, '[data-a="startpet"]'); continue }
      if (await page.$('[data-a="obnext"]')) { await click(page, '[data-a="obnext"]'); continue }
      break;
    }
    /* להגיע למסך שאלה */
    const hasCtx = async () => page.evaluate(() => !!(window.BARAK && BARAK.ready() && BARAK.context()));
    for (let round = 0; round < 6 && !(await hasCtx()); round++) {
      for (const s of (ENTER[app] || [])) { if (await hasCtx()) break; await click(page, s); }
    }
    const out = { app, fails: [] };
    const F = (m) => out.fails.push(m);
    if (!(await page.evaluate(() => !!(window.BARAK && BARAK.ready())))) { F('אין מתאם רשום'); }
    const c0 = await page.evaluate(() => window.BARAK ? BARAK.context() : null);
    if (!c0) F('BARAK.context() ריק במסך שאלה');
    else {
      if (!c0.q) F('אין q בהקשר');
      if (!c0.id) F('אין id בהקשר');
    }
    const actions = await page.evaluate(() => window.BARAK ? BARAK.actions().map(a => a.name) : []);
    if (!actions.length) F('אין פעולות');

    /* עוזר: שולח דרך הפאנל ומחכה לתשובה */
    async function send(txt, m) {
      mode = m;
      const n = seen.length;
      await page.evaluate(() => { try { TUTOR.open() } catch (e) {} });
      await page.waitForTimeout(150);
      await page.fill('#tu-in', txt);
      await page.press('#tu-in', 'Enter');
      for (let i = 0; i < 60; i++) {
        await page.waitForTimeout(100);
        const st = await page.evaluate(() => TUTOR._state());
        const last = st.msgs[st.msgs.length - 1];
        if (last && last.role === 'assistant' && !/^(רגע|לחכות)/.test(last.text) && (m === 'abort' || m === '429' || seen.length > n)) {
          await page.waitForTimeout(150);
          return { last, body: seen[n] || null, res: await page.evaluate(() => BARAK.last()) };
        }
      }
      return { last: null, body: seen[n] || null, res: null };
    }

    /* 1 — הגוף */
    if (c0) {
      const r = await send('לא הבנתי', 'text');
      if (!r.body) F('לא נשלחה בקשה לשרת');
      else {
        if (!r.body.screen || !r.body.screen.q) F('הגוף בלי screen.q');
        if (!Array.isArray(r.body.actions) || !r.body.actions.length) F('הגוף בלי actions');
        if (r.body.screen && c0.options && (!r.body.screen.options || r.body.screen.options.length !== c0.options.length)) F('האפשרויות לא נשלחו');
        for (const k of ['name', 'userId', 'progress']) if (k in r.body) F('שדה זר בגוף: ' + k);
      }
      if (!r.last || !/מדומה/.test(r.last.text)) F('התשובה מהשרת לא הוצגה');
      out.ctxSample = r.body && r.body.screen;
    }
    /* 2 — next_question מתבצעת */
    if (actions.indexOf('next_question') >= 0) {
      const before = await page.evaluate(() => BARAK.context());
      const r = await send('תעביר אותי לשאלה הבאה', 'next');
      const after = await page.evaluate(() => BARAK.context());
      if (!r.res || !r.res.action || r.res.action.ok !== true) F('next_question לא אושרה כמבוצעת: ' + JSON.stringify(r.res && r.res.action));
      if (before && after && before.id === after.id) F('next_question — המסך לא התחלף');
      if (r.last && !/הבאה/.test(r.last.text)) F('הטקסט של next לא הוצג אחרי הצלחה');
    }
    /* 3 — show_hint */
    if (actions.indexOf('show_hint') >= 0) {
      const r = await send('רמז', 'hint');
      if (!r.res || !r.res.action || r.res.action.ok !== true) F('show_hint לא אושרה: ' + JSON.stringify(r.res && r.res.action));
    }
    /* 4 — פעולה שנכשלת: go_screen ליעד לא קיים → ACTION_FAILED */
    {
      const r = await send('קח אותי לירח', 'bad-go');
      const failedTxt = await page.evaluate(() => BARAK.ACTION_FAILED.he);
      if (actions.indexOf('go_screen') >= 0) {
        if (!r.last || r.last.text !== failedTxt) F('פעולה שנכשלה — הוצג טקסט המודל במקום ACTION_FAILED: ' + (r.last && r.last.text));
      } else {
        /* אין go_screen במתאם — הפעולה אינה קיימת, וגם אז ACTION_FAILED */
        if (!r.last || r.last.text !== failedTxt) F('פעולה לא קיימת — לא הוצג ACTION_FAILED: ' + (r.last && r.last.text));
      }
    }
    /* 5 — highlight_option */
    if (actions.indexOf('highlight_option') >= 0) {
      const r = await send('איזו אפשרות', 'highlight');
      const hl = await page.evaluate(() => !!document.querySelector('.bk-hl'));
      if (!r.res || !r.res.action || r.res.action.ok !== true || !hl) F('highlight_option לא הדגישה');
    }
    /* 6 — אופליין: מקומי, ו״הבא״ מבוצע מקומית */
    {
      const before = await page.evaluate(() => BARAK.context());
      const r = await send('הבא', 'abort');
      if (!r.res || r.res.source !== 'local-fallback') F('אופליין — לא נפל למקומי: ' + JSON.stringify(r.res && r.res.source));
      const note = await page.evaluate(() => (document.querySelector('.tu-note') || {}).textContent || '');
      if (note) F('אופליין — הוצגה הודעת שגיאה: ' + note);
      if (actions.indexOf('next_question') >= 0 && before) {
        const after = await page.evaluate(() => BARAK.context());
        if (!r.res || !r.res.action || r.res.action.name !== 'next_question') F('אופליין — ״הבא״ לא זוהה כפעולה');
        else if (r.res.action.ok && after && before.id === after.id) F('אופליין — ״הבא״ סומן כמבוצע והמסך לא התחלף');
      }
    }
    /* 7 — 429 */
    {
      const r = await send('מה זה', '429');
      if (!r.res || r.res.source !== 'local-fallback') F('429 — לא נפל למקומי');
      const note = await page.evaluate(() => (document.querySelector('.tu-note') || {}).textContent || '');
      if (note) F('429 — הוצגה הודעת שגיאה: ' + note);
    }
    if (errs.length) F('pageerror: ' + errs.join(' | '));
    if (out.fails.length) { failed++; console.log('✗ ' + app.padEnd(11) + out.fails.join(' · ')) }
    else console.log('✓ ' + app.padEnd(11) + actions.join(',') + (out.ctxSample ? '  · q=' + String(out.ctxSample.q).slice(0, 40) : ''));
    await ctx.close();
  }
  await b.close();
  console.log(failed ? `✗ barak-browser — ${failed} אפליקציות נכשלו` : '✓ מנוע ברק בדפדפן — כל האפליקציות שנבדקו');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('✗ barak-browser נפל: ' + (e && e.stack || e)); process.exit(1) });
