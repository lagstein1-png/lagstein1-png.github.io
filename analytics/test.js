/* =====================================================================
   בדיקות השרת — node:test, בלי התקנה, בלי רשת, בלי Supabase.

     node --test analytics/test.js

   מה נבדק
     · ביקור ראשון נספר; רענון באותו session לא; session חדש כן
     · summary נעול בלי כניסה, נפתח אחרי כניסה נכונה, ומול Bearer
     · הגבלת קצב על ביקורים ועל ניסיונות כניסה
     · לא נשמר IP, לא סיסמה, לא סוד — לא באחסון ולא בתשובות
     · בלי Supabase השרת עובד ואומר במפורש שהוא בזיכרון
     · Supabase שנפל → 503 עם הודעה ברורה, ולא קריסה
     · מחיקה לפי retention שומרת את המניין הכולל
   ===================================================================== */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { createServer, uaFamily } = require('./server');
const { memoryStore, supabaseStore, dayOf, addDays } = require('./store');

const SECRET = 'test-secret-do-not-ship';
const PASSWORD = 'correct horse battery';
const TOKEN = 'bearer-token-for-scripts';

function listen(server) {
  return new Promise(res => server.listen(0, '127.0.0.1', () => res('http://127.0.0.1:' + server.address().port)));
}
function boot(extraEnv, store) {
  const env = Object.assign({
    ANALYTICS_SECRET: SECRET, ANALYTICS_ADMIN_PASSWORD: PASSWORD, ANALYTICS_ADMIN_TOKEN: TOKEN,
    ANALYTICS_ALLOWED_ORIGINS: 'https://example.test',
  }, extraEnv || {});
  const s = createServer({ env, store: store || memoryStore({}), quiet: true, noJobs: true });
  return listen(s).then(base => ({ server: s, base, store: s.analytics.store }));
}
async function post(base, path, body, headers) {
  const r = await fetch(base + path, { method: 'POST', body: JSON.stringify(body),
    headers: Object.assign({ 'Content-Type': 'text/plain', 'User-Agent': 'Mozilla/5.0 Chrome/120.0 Safari/537.36' }, headers || {}) });
  return { status: r.status, headers: r.headers, body: await r.json() };
}
async function get(base, path, headers) {
  const r = await fetch(base + path, { headers: headers || {} });
  const text = await r.text();
  let body = null; try { body = JSON.parse(text); } catch (e) { body = text; }
  return { status: r.status, headers: r.headers, body };
}
const sid = n => 'session' + String(n).padStart(4, '0') + 'abcdefghijklmnop';
async function login(base) {
  const r = await post(base, '/admin/analytics/login', { password: PASSWORD });
  assert.equal(r.status, 200);
  return { Cookie: r.headers.get('set-cookie').split(';')[0] };
}

test('ביקור ראשון נספר, רענון לא, session חדש כן', async t => {
  const { server, base } = await boot();
  t.after(() => server.close());
  const a = await post(base, '/api/analytics/visit', { sid: sid(1), page: '/', lang: 'he', ref: 'google.com' });
  assert.equal(a.status, 201); assert.equal(a.body.counted, true);
  const again = await post(base, '/api/analytics/visit', { sid: sid(1), page: '/' });
  assert.equal(again.status, 200); assert.equal(again.body.counted, false);
  const b = await post(base, '/api/analytics/visit', { sid: sid(2), page: '/pricing', lang: 'en' });
  assert.equal(b.body.counted, true);
  const cookie = await login(base);
  const s = await get(base, '/api/analytics/summary', cookie);
  assert.equal(s.status, 200);
  assert.equal(s.body.total, 2);
  assert.equal(s.body.today, 2);
  assert.equal(s.body.week, 2);
  assert.equal(s.body.days.at(-1).visits, 2);
  assert.equal(s.body.days.length, 30);
  assert.equal(s.body.activeNow, 2);
  assert.deepEqual(s.body.pages.map(p => p.page).sort(), ['/', '/pricing']);
  assert.equal(s.body.store, 'memory');
  assert.match(s.body.warning, /Supabase/);
});

test('summary נעול למי שאינו אדמין', async t => {
  const { server, base } = await boot();
  t.after(() => server.close());
  assert.equal((await get(base, '/api/analytics/summary')).status, 401);
  assert.equal((await get(base, '/api/analytics/summary', { Cookie: 'an_admin=123.deadbeef' })).status, 401);
  const forged = Date.now() + 1e6;
  assert.equal((await get(base, '/api/analytics/summary', { Cookie: 'an_admin=' + forged + '.' + 'a'.repeat(64) })).status, 401);
  assert.equal((await get(base, '/api/analytics/summary', { Authorization: 'Bearer wrong' })).status, 401);
  const wrong = await post(base, '/admin/analytics/login', { password: 'nope' });
  assert.equal(wrong.status, 401); assert.equal(wrong.body.error, 'bad_password');
  assert.equal((await get(base, '/api/analytics/summary', { Authorization: 'Bearer ' + TOKEN })).status, 200);
  const cookie = await login(base);
  assert.equal((await get(base, '/api/analytics/summary', cookie)).status, 200);
  const out = await post(base, '/admin/analytics/logout', {}, cookie);
  assert.match(out.headers.get('set-cookie'), /Max-Age=0/);
});

test('בלי סיסמת אדמין — המסך נעול לכולם עם הודעה ברורה', async t => {
  const { server, base } = await boot({ ANALYTICS_ADMIN_PASSWORD: '', ANALYTICS_ADMIN_TOKEN: '' });
  t.after(() => server.close());
  const r = await post(base, '/admin/analytics/login', { password: '' });
  assert.equal(r.status, 503); assert.equal(r.body.error, 'admin_disabled');
  assert.equal((await get(base, '/api/analytics/summary')).status, 401);
  const h = await get(base, '/api/analytics/health');
  assert.equal(h.body.adminEnabled, false);
});

test('הגבלת קצב — ביקורים וכניסות', async t => {
  const { server, base } = await boot({ ANALYTICS_RATE_VISIT: '5', ANALYTICS_RATE_LOGIN: '3' });
  t.after(() => server.close());
  const codes = [];
  for (let i = 0; i < 7; i++) codes.push((await post(base, '/api/analytics/visit', { sid: sid(100 + i) })).status);
  assert.deepEqual(codes, [201, 201, 201, 201, 201, 429, 429]);
  const r = await post(base, '/api/analytics/visit', { sid: sid(200) });
  assert.equal(r.body.error, 'rate_limited'); assert.ok(r.headers.get('retry-after'));
  /* IP אחר (מאחורי proxy) — חלון משלו */
  const other = await post(base, '/api/analytics/visit', { sid: sid(201) }, { 'X-Forwarded-For': '10.1.2.3' });
  assert.equal(other.status, 201);
  const l = [];
  for (let i = 0; i < 4; i++) l.push((await post(base, '/admin/analytics/login', { password: 'x' })).status);
  assert.deepEqual(l, [401, 401, 401, 429]);
});

test('אין דליפה: IP, סיסמה וסוד לא באחסון ולא בתשובות', async t => {
  const { server, base, store } = await boot();
  t.after(() => server.close());
  await post(base, '/api/analytics/visit',
    { sid: sid(7), page: '/', lang: 'he', ref: 'google.com', password: 'hunter2', apiKey: 'sk-live-123', card: '4111' },
    { 'X-Forwarded-For': '203.0.113.9', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0 Safari/537.36 Edg/120.0' });
  const dump = JSON.stringify(store._dump());
  for (const leak of ['203.0.113.9', '127.0.0.1', 'hunter2', 'sk-live', '4111', SECRET, PASSWORD, sid(7), 'Windows NT', 'Mozilla'])
    assert.ok(!dump.includes(leak), 'נשמר: ' + leak);
  const rec = store._dump().raw[0];
  assert.deepEqual(Object.keys(rec).sort(), ['at', 'h', 'language', 'page', 'referrer', 'ua']);
  assert.equal(rec.ua, 'Edge');
  assert.equal(rec.h.length, 32);
  const s = await get(base, '/api/analytics/summary', await login(base));
  const out = JSON.stringify(s.body);
  for (const leak of ['203.0.113.9', SECRET, PASSWORD, TOKEN, sid(7)]) assert.ok(!out.includes(leak), 'בתשובה: ' + leak);
});

test('קלט לא תקין — שגיאות ברורות, ושדות מזויפים נזרקים', async t => {
  const { server, base, store } = await boot();
  t.after(() => server.close());
  assert.equal((await post(base, '/api/analytics/visit', { sid: 'short' })).body.error, 'bad_session');
  assert.equal((await post(base, '/api/analytics/visit', { sid: '<script>' + 'a'.repeat(20) })).body.error, 'bad_session');
  const r = await fetch(base + '/api/analytics/visit', { method: 'POST', body: '{not json' });
  assert.equal(r.status, 400); assert.equal((await r.json()).error, 'bad_json');
  const big = await fetch(base + '/api/analytics/visit', { method: 'POST', body: 'x'.repeat(5000) });
  assert.equal(big.status, 413);
  assert.equal((await get(base, '/api/analytics/visit')).status, 405);
  assert.equal((await get(base, '/nope')).status, 404);
  await post(base, '/api/analytics/visit', { sid: sid(9), page: 'javascript:alert(1)', lang: '<b>', ref: 'http://evil/x?y' });
  const rec = store._dump().raw[0];
  assert.equal(rec.page, '/'); assert.equal(rec.language, null); assert.equal(rec.referrer, null);
});

test('CORS — רק מקור מורשה', async t => {
  const { server, base } = await boot();
  t.after(() => server.close());
  const ok = await fetch(base + '/api/analytics/visit', { method: 'OPTIONS', headers: { Origin: 'https://example.test' } });
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get('access-control-allow-origin'), 'https://example.test');
  const no = await fetch(base + '/api/analytics/visit', { method: 'OPTIONS', headers: { Origin: 'https://evil.test' } });
  assert.equal(no.headers.get('access-control-allow-origin'), null);
  const sum = await fetch(base + '/api/analytics/summary', { headers: { Origin: 'https://example.test' } });
  assert.equal(sum.headers.get('access-control-allow-origin'), null, 'ל-summary אין CORS בכלל');
});

test('בלי Supabase: health אומר זיכרון; מסך האדמין נטען בעברית RTL', async t => {
  const { server, base } = await boot();
  t.after(() => server.close());
  const h = await get(base, '/api/analytics/health');
  assert.equal(h.status, 200); assert.equal(h.body.store, 'memory'); assert.match(h.body.message, /אין Supabase/);
  const page = await get(base, '/admin/analytics');
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.match(page.body, /<html lang="he" dir="rtl">/);
  assert.match(page.headers.get('content-security-policy'), /default-src 'none'/);
  assert.equal(page.headers.get('x-frame-options'), 'DENY');
  for (const id of ['loading', 'login', 'error', 'empty', 'dash']) assert.match(page.body, new RegExp('id="' + id + '"'));
});

test('Supabase שנפל → 503 ברור; Supabase שעונה → נשמר', async t => {
  /* מדמה PostgREST: פעם עונה, פעם נופל */
  let mode = 'down';
  const fake = http.createServer((req, res) => {
    if (mode === 'down') { res.writeHead(500); return res.end('boom'); }
    if (req.method === 'GET') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('[]'); }
    if (req.url.startsWith('/rest/v1/rpc/analytics_summary')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ total: 42, today: 1, week: 2, days: [], pages: [], languages: [], referrers: [], browsers: [] }));
    }
    let body = ''; req.on('data', c => body += c); req.on('end', () => {
      assert.ok(!req.headers.authorization.includes(SECRET));
      const j = JSON.parse(body);
      assert.deepEqual(Object.keys(j).sort(), ['language', 'page', 'referrer', 'session_id_hash', 'user_agent_family', 'visited_at']);
      res.writeHead(201); res.end();
    });
  });
  const fakeBase = await listen(fake);
  t.after(() => fake.close());
  const store = supabaseStore({ url: fakeBase, key: 'service-key', timeoutMs: 1000 });
  const { server, base } = await boot({ SUPABASE_URL: fakeBase, SUPABASE_SERVICE_ROLE_KEY: 'service-key' }, store);
  t.after(() => server.close());
  const down = await post(base, '/api/analytics/visit', { sid: sid(3) });
  assert.equal(down.status, 503); assert.equal(down.body.error, 'analytics_unavailable'); assert.match(down.body.message, /אינו זמין/);
  const h = await get(base, '/api/analytics/health');
  assert.equal(h.status, 503); assert.equal(h.body.store, 'supabase'); assert.match(h.body.message, /לא זמין/);
  const cookie = await login(base);
  const s1 = await get(base, '/api/analytics/summary', cookie);
  assert.equal(s1.status, 503); assert.equal(s1.body.error, 'analytics_unavailable');
  mode = 'up';
  const up = await post(base, '/api/analytics/visit', { sid: sid(3) });
  assert.equal(up.status, 201);
  const s2 = await get(base, '/api/analytics/summary', cookie);
  assert.equal(s2.status, 200); assert.equal(s2.body.total, 42); assert.equal(s2.body.store, 'supabase'); assert.equal(s2.body.warning, null);
});

test('retention: ימים ישנים מסוכמים ונמחקים, והמניין הכולל נשמר', async () => {
  const store = memoryStore({});
  const tz = 'Asia/Jerusalem', now = Date.now(), day = 86400000;
  await store.record({ h: 'a', at: now, page: '/', language: 'he', referrer: null, ua: 'Chrome' }, 1000);
  await store.record({ h: 'b', at: now - 3 * day, page: '/', language: 'he', referrer: null, ua: 'Chrome' }, 1000);
  await store.record({ h: 'c', at: now - 100 * day, page: '/', language: 'he', referrer: null, ua: 'Chrome' }, 1000);
  await store.record({ h: 'd', at: now - 100 * day, page: '/pricing', language: 'he', referrer: null, ua: 'Chrome' }, 1000);
  assert.equal((await store.summary({ days: 7, tz })).total, 4);
  const r = await store.rollupAndPurge(90, tz);
  assert.equal(r.purged, 2);
  assert.equal(store._dump().raw.length, 2);
  const s = await store.summary({ days: 7, tz });
  assert.equal(s.total, 4, 'הימים שנמחקו עדיין נספרים');
  assert.equal(s.week, 2);
  assert.equal(s.days.length, 7);
  assert.equal(s.days[3].visits, 1);
  assert.equal(s.days[3].day, addDays(dayOf(now, tz), -3));
  /* הרצה שנייה אינה סופרת פעמיים */
  await store.rollupAndPurge(90, tz);
  assert.equal((await store.summary({ days: 7, tz })).total, 4);
});

test('קובץ: ביקורים שורדים אתחול', async () => {
  const fs = require('fs'), os = require('os'), path = require('path');
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'an-')), 'visits.json');
  const a = memoryStore({ file });
  await a.record({ h: 'x', at: Date.now(), page: '/', language: 'he', referrer: null, ua: 'Chrome' }, 1000);
  await new Promise(r => setTimeout(r, 400));
  const b = memoryStore({ file });
  assert.equal(b.kind, 'file');
  assert.equal((await b.summary({ days: 7, tz: 'Asia/Jerusalem' })).total, 1);
  assert.equal((await b.record({ h: 'x', at: Date.now(), page: '/', language: 'he', referrer: null, ua: 'Chrome' }, 60000)).counted, false);
});

test('משפחת דפדפן בלבד', () => {
  assert.equal(uaFamily('Mozilla/5.0 (Windows NT 10.0) Chrome/120 Safari/537.36 Edg/120'), 'Edge');
  assert.equal(uaFamily('Mozilla/5.0 (iPhone) AppleWebKit/605 Version/17 Safari/604.1'), 'Safari');
  assert.equal(uaFamily('Mozilla/5.0 (X11; Linux) Firefox/121.0'), 'Firefox');
  assert.equal(uaFamily('Mozilla/5.0 (Linux; Android) SamsungBrowser/23 Chrome/115 Safari/537.36'), 'Samsung');
  assert.equal(uaFamily(''), 'Other');
});
