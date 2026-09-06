/* =====================================================================
   בדיקה בדפדפן אמיתי — דף הבית שולח ביקור אחד ל-session.

     node analytics/test-browser.js

   מרים בעצמו את שרת המדידה (זיכרון) ואת השרת הסטטי של הריפו, טוען
   את דף הבית האמיתי עם data-endpoint שמצביע לשרת המדידה, ובודק:
     1. טעינה ראשונה — ביקור אחד נספר
     2. רענון באותה לשונית — עדיין אחד
     3. הקשר דפדפן חדש (sessionStorage חדש) — שניים
     4. אפס שגיאות JS בדף
     5. כשהשרת נופל — הדף נטען נקי, בלי שגיאה
   ===================================================================== */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { createServer } = require('./server');
const { memoryStore } = require('./store');

const ROOT = path.resolve(__dirname, '..');
const wait = ms => new Promise(r => setTimeout(r, ms));

/* שרת סטטי משלנו, ולא יירוט של Playwright: דף שמוגש דרך route.fulfill
   מקבל בכרום address space "unknown", וכל בקשה ממנו ל-127.0.0.1 נחסמת
   (Private Network Access). לכן דף הבית מוגש כאן ישירות, עם
   data-endpoint שהוחלף בדרך. בייצור שני הצדדים ציבוריים ואין בעיה. */
function staticServer(endpointRef) {
  const mime = { '.html': 'text/html;charset=utf-8', '.js': 'text/javascript;charset=utf-8',
                 '.json': 'application/json;charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    let body = fs.readFileSync(f);
    if (p === '/index.html') body = body.toString('utf8').replace('data-endpoint=""', 'data-endpoint="' + endpointRef.value + '"');
    res.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' });
    res.end(body);
  });
}

(async () => {
  const endpointRef = { value: '' };
  const serve = staticServer(endpointRef);
  await new Promise(r => serve.listen(0, '127.0.0.1', r));
  const STATIC = 'http://127.0.0.1:' + serve.address().port;
  const api = createServer({
    env: { ANALYTICS_SECRET: 's', ANALYTICS_ADMIN_TOKEN: 't', ANALYTICS_ADMIN_PASSWORD: 'pw-for-test', ANALYTICS_ALLOWED_ORIGINS: STATIC },
    store: memoryStore({}), quiet: true, noJobs: true,
  });
  await new Promise(r => api.listen(0, '127.0.0.1', r));
  const API = 'http://127.0.0.1:' + api.address().port;

  const total = async () => (await (await fetch(API + '/api/analytics/summary', { headers: { Authorization: 'Bearer t' } })).json()).total;
  const browser = await chromium.launch();
  let failed = 0;
  const check = (ok, msg) => { console.log((ok ? '✓ ' : '✗ ') + msg); if (!ok) failed++; };

  async function open(ctx, endpoint) {
    endpointRef.value = endpoint;
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    /* רק הרשת החיצונית (גופנים) נחסמת; הבקשות המקומיות אינן מיורטות */
    await page.route(u => !u.href.startsWith(STATIC) && !u.href.startsWith(API), r => r.abort());
    await page.goto(STATIC + '/', { waitUntil: 'load', timeout: 20000 });
    await wait(900);
    return { page, errs };
  }

  try {
    const ctx1 = await browser.newContext({ locale: 'he-IL' });
    const a = await open(ctx1, API + '/api/analytics/visit');
    check(await total() === 1, 'ביקור ראשון נספר (total=1)');
    await a.page.reload({ waitUntil: 'load' }); await wait(900);
    check(await total() === 1, 'רענון באותו session לא נספר (total=1)');
    await a.page.goto(STATIC + '/', { waitUntil: 'load' }); await wait(900);
    check(await total() === 1, 'ניווט חוזר באותה לשונית לא נספר (total=1)');
    check(a.errs.length === 0, 'אפס שגיאות JS בדף הבית' + (a.errs.length ? ': ' + a.errs.join(' | ') : ''));
    await ctx1.close();

    const ctx2 = await browser.newContext({ locale: 'he-IL' });
    const b = await open(ctx2, API + '/api/analytics/visit');
    check(await total() === 2, 'session חדש נספר (total=2)');
    const s = await (await fetch(API + '/api/analytics/summary', { headers: { Authorization: 'Bearer t' } })).json();
    check(s.activeNow === 2, 'פעילים עכשיו = 2');
    check(s.pages.length === 1 && s.pages[0].page === '/', 'הדף שנרשם הוא "/"');
    check(JSON.stringify(s).indexOf('127.0.0.1') < 0, 'אין IP בסיכום');
    await ctx2.close();

    /* מסך האדמין: נעול, נפתח בסיסמה, ומציג את המספרים בעברית */
    const ctx5 = await browser.newContext({ locale: 'he-IL', viewport: { width: 1100, height: 900 } });
    const admin = await ctx5.newPage();
    const adminErrs = [];
    admin.on('pageerror', e => adminErrs.push(e.message));
    await admin.goto(API + '/admin/analytics', { waitUntil: 'load' });
    await admin.waitForSelector('#login:not([hidden])', { timeout: 5000 });
    check(await admin.$('#dash[hidden]') !== null, 'מסך האדמין: בלי כניסה רואים טופס ולא נתונים');
    await admin.fill('#pw', 'wrong');
    await admin.click('#loginForm button');
    await admin.waitForSelector('#loginErr:not([hidden])', { timeout: 5000 });
    check(true, 'סיסמה שגויה — הודעה ברורה: ' + await admin.textContent('#loginErr'));
    await admin.fill('#pw', 'pw-for-test');
    await admin.click('#loginForm button');
    await admin.waitForSelector('#dash:not([hidden])', { timeout: 5000 });
    check((await admin.textContent('#tTotal')).trim() === '2', 'אחרי כניסה: סך הכול = 2');
    check((await admin.$$('#chart rect.bar')).length === 30, 'גרף — 30 עמודות יום');
    check(await admin.getAttribute('html', 'dir') === 'rtl', 'המסך ב-RTL');
    check(adminErrs.length === 0, 'אפס שגיאות JS במסך האדמין');
    if (process.env.SHOT) await admin.screenshot({ path: process.env.SHOT, fullPage: true });
    await ctx5.close();

    /* השרת נפל — הדף חייב להיטען נקי */
    const ctx3 = await browser.newContext({ locale: 'he-IL' });
    const c = await open(ctx3, 'http://127.0.0.1:1/api/analytics/visit');
    check(c.errs.length === 0, 'שירות מדידה שאינו זמין — הדף נטען בלי שגיאת JS');
    check(await c.page.$('#apps') !== null, 'הדף עצמו הוצג');
    await ctx3.close();

    /* בלי endpoint — שום בקשה לא יוצאת */
    endpointRef.value = '';
    const ctx4 = await browser.newContext({ locale: 'he-IL' });
    const page4 = await ctx4.newPage();
    let posts = 0;
    page4.on('request', r => { if (r.method() === 'POST') posts++; });
    await page4.route(u => !u.href.startsWith(STATIC), r => r.abort());
    await page4.goto(STATIC + '/', { waitUntil: 'load' }); await wait(700);
    check(posts === 0, 'data-endpoint ריק — אפס בקשות POST');
    await ctx4.close();
  } finally {
    await browser.close();
    api.close();
    serve.close();
  }
  console.log(failed ? failed + ' נכשלו' : 'הכול עבר');
  process.exit(failed ? 1 : 0);
})();
