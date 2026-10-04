/* =====================================================================
   barak-browser.js — מנוע לימור בדפדפן אמיתי, מול שרת מדומה

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
/* O-125, 4.10.2026: הרשימה נגזרת מ-stages.json ולא נכתבת ביד — הרשימה
   הידנית דילגה על electric, שנולדה אחריה. הקריטריון הוא מה שהבדיקה
   בודקת: מתאם לימור רשום (`BARAK.register(`) באחד מקובצי האפליקציה —
   `index.html`, `app.js` (bagrut-806 ודומותיה) או `js/*.js` (משפחת
   hebrew-lit). `TUTOR.mount` לבדו אינו מספיק: literature, math-elem
   ואחרות מציגות את לימור בלי מתאם, ושם הבדיקה הייתה נכשלת על
   ״אין מתאם רשום״ — שזה חוזה אחר, לא באג של המתאם. */
const ROOT = path.resolve(__dirname, '..', '..');
const REG = JSON.parse(fs.readFileSync(path.join(__dirname, 'stages.json'), 'utf8'));
function appSources(a) {
  const d = path.join(ROOT, a), out = [];
  for (const f of ['index.html', 'app.js']) if (fs.existsSync(path.join(d, f))) out.push(path.join(d, f));
  const js = path.join(d, 'js');
  if (fs.existsSync(js)) for (const f of fs.readdirSync(js).filter(x => x.endsWith('.js'))) out.push(path.join(js, f));
  return out;
}
const APPS = Object.keys(REG.apps).filter(a =>
  appSources(a).some(f => /BARAK\.register\(/.test(fs.readFileSync(f, 'utf8'))));
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
  /* electric הועתקה מ-math-uni3 (24.9.2026) — אותו מסלול כניסה. O-125 */
  'electric':   ['[data-a="topic"]', '[data-a="lvl"]', '[data-a="start"]'],
  'english':    ['[data-a="open"]'],
  'history':    ['[data-a="open"]'],
  'ulpan':      ['[data-a="open"]'],
  'lomda':      ['[data-a="open"]'],
  'kotvim':     ['[data-a="ktype"]', '[data-a="ktopic"]', '[data-a="kpick"]'],
  /* reader: הדוגמה המובנית, ואז ״בלי ניקוד״ כי בקשת הניקוד נחסמת בבדיקה */
  'reader':     ['#btnSample', '#btnGo', '#btnNoNikud'],
  'bagrut-806': ['[data-topic]', '[data-exam]', '[data-go="practice"]'],
  /* O-125, 4.10.2026: נכנסו עם הגזירה מ-stages.json. המסלולים נמדדו
     בדפדפן — BARAK.context() מחזיר שאלת mcq/open אחרי הלחיצה האחרונה. */
  'bagrut-history': ['[data-exam]', '[data-go="practice"]'],
  'hebrew-lit':  ['[data-g="1"]', '[data-u]', '#startBtn'],
  'tanakh-elem': ['[data-u]', '#startBtn'],
  'civics-elem': ['[data-u]', '#startBtn']
};

/* **מדולגות בקול, לא בשקט.** יש להן מתאם, אבל הכניסה היא שיעור
   (`?lesson=…`) ולא שאלה: במסך השיעור `next_question` מחזירה false
   בצדק, ותרגול נפתח רק אחרי צעדים אינטראקטיביים שמשתנים משיעור
   לשיעור — אין רצף לחיצות קבוע. כל אחת מודפסת בכל ריצה עם הסיבה.
   מי שמוסיף להן `ENTER` — מוחק אותה מכאן. O-125. */
const NO_ENTER = {
  'science':        'כניסה דרך שיעור (?lesson=) — אין מסלול לחיצות קבוע לתרגול',
  'geography-elem': 'כניסה דרך שיעור (?lesson=) — אין מסלול לחיצות קבוע לתרגול'
};

/* **כשל ידוע, מוצהר ומודפס — O-125, 4.10.2026.** הגזירה מ-stages.json
   הכניסה אפליקציות שאף פעם לא נבדקו כאן, והבדיקה מצאה בהן כשלים
   אמיתיים במתאם שתיקונם בקובצי האפליקציה ובהכרעת מוצר — לא בכלי.
   כשל שתואם ל-`re` מודפס `~` ואינו מפיל; כל כשל **אחר** באותה
   אפליקציה מפיל כרגיל; **וכשל ידוע שנעלם מפיל גם הוא** — כדי
   שהשורה תימחק מכאן ולא תכסה באג חדש שיגיע במקומו. */
const KNOWN = {
};

/* **״הבא״ רק אחרי מענה — התנהגות מוצהרת, לא כשל ידוע. O-128, 4.10.2026.**
   ב-hebrew-lit, ‏tanakh-elem ו-civics-elem ‏`next_question` מסרבת לשאלה
   שלא נענתה (התיאור: ״עובר לשאלה הבאה אחרי שנענתה״; `run` מחזירה false
   כל עוד `!R.locked`). הכרעה: זו הכוונה לגיל הצעיר — אין דילוג בלי
   ניסיון. עד היום זה ישב ב-`KNOWN` כאילו היה באג; עכשיו זה **נאכף**:
   לפני מענה — סירוב, המסך לא זז, ומוצג ACTION_FAILED; אחרי מענה — מעבר.
   אפליקציה מכאן שתתחיל לדלג על שאלה שלא נענתה — נופלת. */
const NEXT_AFTER_ANSWER = { 'hebrew-lit': 1, 'tanakh-elem': 1, 'civics-elem': 1 };

/* עקיפה לזמן פיתוח: BARAK_ENTER='{"english":["[data-a=\"x\"]"]}' */
try { Object.assign(ENTER, JSON.parse(process.env.BARAK_ENTER || '{}')) } catch (e) {}

(async () => {
  const b = await chromium.launch();
  let failed = 0;
  for (const app of TARGET) {
    if (NO_ENTER[app] && !ENTER[app]) { console.log('· ' + app.padEnd(11) + 'מדולגת — ' + NO_ENTER[app]); continue }
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
        /* ריצה 5 של barak-live: המודל הכריז על מעבר בלי להחזיר קריאת פונקציה. */
        if (mode === 'claim') { out.action = null; out.say = 'עוברים לשאלה הבאה.' }
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
       עניין של המכשיר, לא של לימור. */
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
    /* כל תרחיש מתחיל משיחה נקייה. בלי זה שבעת התרחישים צוברים
       ארבעה־עשר תורים על אותה שאלה, האחרון נבלם ב-`TURNS` ואינו
       רץ כלל — והבדיקה מדווחת על הודעת אורך השיחה כאילו הייתה
       שגיאה. נמדד על הרנר בריצה 617 (`english`). */
    async function send(txt, m) {
      mode = m;
      const n = seen.length;
      await page.evaluate(() => { try { TUTOR._clear() } catch (e) {} });
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
    /* ההקשר הגולמי של המתאם, ולא BARAK.context(): זה קוטע את id ל-80
       תווים לפני השליחה לשרת, ו-barak-core מאמת את המעבר על הגולמי.
       O-82: שאלה שהתחלפה עם id זהה היא באג במתאם (id קטוע), לא מזל
       רע בהגרלה — barak-core מסמן אותה ככישלון ולימור אומר ללומד
       ״לא הצלחתי״ בזמן שהמסך כבר התחלף. */
    const raw = () => page.evaluate(() => { const a = BARAK.adapter(); try { return a && a.getScreenContext() } catch (e) { return null } });
    if (actions.indexOf('next_question') >= 0 && NEXT_AFTER_ANSWER[app]) {
      /* O-128 — הצד הראשון: לפני מענה, סירוב בנימוק המוצהר. */
      const desc = await page.evaluate(() => ((BARAK.actions() || []).filter(a => a.name === 'next_question')[0] || {}).desc || '');
      if (!/אחרי שנענתה/.test(desc)) F('O-128: התיאור של next_question אינו אומר ״אחרי שנענתה״: ' + desc);
      const failedTxt = await page.evaluate(() => BARAK.ACTION_FAILED.he);
      const before = await raw();
      const r = await send('תעביר אותי לשאלה הבאה', 'next');
      const after = await raw();
      if (!r.res || !r.res.action || r.res.action.ok !== false) F('O-128: next_question דילגה על שאלה שלא נענתה (צפוי סירוב): ' + JSON.stringify(r.res && r.res.action));
      if (before && after && (before.id !== after.id || before.q !== after.q)) F('O-128: המסך התחלף לפני מענה');
      if (!r.last || r.last.text !== failedTxt) F('O-128: הסירוב לא הוצג כ-ACTION_FAILED: ' + (r.last && r.last.text));
      /* הצד השני: עונים (לחיצה על אפשרות עד שהשאלה ננעלת — נכונה, או
         שתי טעויות וחשיפה), ואז ״הבא״ חייב לעבור. בלי זה סירוב גורף
         (`run` שמחזירה תמיד false) היה עובר את הבדיקה. */
      for (let i = 0; i < 4 && !(await page.evaluate(() => !!(window.R && R.locked))); i++) {
        await page.evaluate(() => { const o = document.querySelector('button.opt:not([disabled])'); if (o) o.click() });
        await page.waitForTimeout(150);
      }
      if (!(await page.evaluate(() => !!(window.R && R.locked)))) F('O-128: לא הצלחתי לענות על השאלה (R.locked לא נדלק)');
      else {
        const b2 = await raw();
        const r2 = await send('תעביר אותי לשאלה הבאה', 'next');
        const a2 = await raw();
        if (!r2.res || !r2.res.action || r2.res.action.ok !== true) F('O-128: next_question לא עברה גם אחרי מענה: ' + JSON.stringify(r2.res && r2.res.action));
        if (b2 && a2 && b2.id === a2.id && b2.q === a2.q) F('O-128: אחרי מענה — המסך לא התחלף');
      }
    } else if (actions.indexOf('next_question') >= 0) {
      const before = await raw();
      const r = await send('תעביר אותי לשאלה הבאה', 'next');
      const after = await raw();
      if (!r.res || !r.res.action || r.res.action.ok !== true) F('next_question לא אושרה כמבוצעת: ' + JSON.stringify(r.res && r.res.action));
      if (before && after && before.id === after.id) {
        if (before.q !== after.q) F('next_question — השאלה התחלפה אבל id לא (id קטוע במתאם, O-82): ' + before.id);
        else F('next_question — המסך לא התחלף');
      }
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
      const before = await raw();
      const r = await send('הבא', 'abort');
      if (!r.res || r.res.source !== 'local-fallback') F('אופליין — לא נפל למקומי: ' + JSON.stringify(r.res && r.res.source));
      const note = await page.evaluate(() => (document.querySelector('.tu-note') || {}).textContent || '');
      if (note) F('אופליין — הוצגה הודעת שגיאה: ' + note);
      if (actions.indexOf('next_question') >= 0 && before) {
        const after = await raw();
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
    /* 8 — השרת הכריז על מעבר ולא החזיר פעולה (barak-live ריצה 5).
       או שהמסך התחלף באמת, או שהטקסט אינו מכריז — שלישית אין. */
    if (ENTER[app] && actions.indexOf('next_question') >= 0) {
      await page.evaluate(() => window.TUTOR._clear());
      /* ההקשר הגולמי ולא BARAK.context(), שקוטע id ל-80 תווים — אחרי
         O-82 שתי שאלות שונות עם הוראה ארוכה נראו שם זהות (O-130). */
      const before = await raw();
      const r = await send('תעבור לשאלה הבאה', 'claim');
      const after = await raw();
      const moved = before && after && (before.id !== after.id || before.q !== after.q);
      const claims = r.res && /עוברים לשאלה הבאה/.test(String(r.res.say || ''));
      if (claims && !moved) F('הכרזה בלי ביצוע — נאמר ״עוברים לשאלה הבאה״ והמסך לא התחלף');
      if (moved && !(r.res && r.res.action && r.res.action.name === 'next_question')) F('המסך התחלף ולא דווחה פעולה');
    }
    /* 9 — הצד השני של אותו שומר: הלומד כתב ״הבא״ בתוך שאלה, והמודל
       ענה תשובה רגילה. שום דבר לא אמור לזוז. תנאי אחד לבדו — כוונת
       הלומד בלי הכרזת המודל — היה מדלג לשאלה הבאה באמצע הסבר. */
    if (ENTER[app] && actions.indexOf('next_question') >= 0) {
      await page.evaluate(() => window.TUTOR._clear());
      const before = await page.evaluate(() => window.BARAK.context());
      const r = await send('מה הצעד הבא בפתרון?', 'text');
      const after = await page.evaluate(() => window.BARAK.context());
      if (before && after && before.id !== after.id) F('דילג לשאלה הבאה על שאלה שרק הזכירה ״הבא״');
      if (r.res && r.res.action) F('דווחה פעולה על תשובה שלא הכריזה על אחת: ' + r.res.action.name);
    }
    if (errs.length) F('pageerror: ' + errs.join(' | '));
    const K = KNOWN[app];
    const known = K ? out.fails.filter(m => K.re.test(m)) : [];
    out.fails = out.fails.filter(m => known.indexOf(m) < 0);
    if (K && !known.length) out.fails.push('כשל ידוע נעלם — למחוק את ' + app + ' מ-KNOWN (' + K.why + ')');
    if (known.length) console.log('~ ' + app.padEnd(11) + 'ידוע: ' + K.why + ' [' + known.length + ']');
    if (out.fails.length) { failed++; console.log('✗ ' + app.padEnd(11) + out.fails.join(' · ')) }
    else if (!known.length) console.log('✓ ' + app.padEnd(11) + actions.join(',') + (out.ctxSample ? '  · q=' + String(out.ctxSample.q).slice(0, 40) : ''));
    await ctx.close();
  }
  await b.close();
  console.log(failed ? `✗ barak-browser — ${failed} אפליקציות נכשלו` : '✓ מנוע לימור בדפדפן — כל האפליקציות שנבדקו');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('✗ barak-browser נפל: ' + (e && e.stack || e)); process.exit(1) });
