#!/usr/bin/env node
/* =====================================================================
   מונה מבקרים — שרת קטן ב-Node בלבד, בלי npm ובלי ספרייה.

     node analytics/server.js                 מאזין על PORT (ברירת מחדל 8787)

   נקודות קצה
     POST /api/analytics/visit     ביקור אחד ל-session. גוף: {sid, page, lang, ref}
     POST /api/analytics/ping      "אני עדיין כאן" — למניין הפעילים עכשיו בלבד
     GET  /api/analytics/summary   סיכום — לאדמין בלבד (cookie אחרי כניסה, או Bearer)
     GET  /api/analytics/health    האם השרת חי ומה מאחוריו (Supabase / זיכרון)
     GET  /admin/analytics         מסך האדמין (עברית, RTL)
     POST /admin/analytics/login   כניסה בסיסמה → cookie
     POST /admin/analytics/logout

   מה נשמר ומה לא
     · ה-session id מגיע מהדפדפן (sessionStorage) ונשמר רק כ-HMAC עם
       ANALYTICS_SECRET. אי אפשר לשחזר ממנו את המזהה, ולא לחבר בין שרתים.
     · IP אינו נשמר ואינו נרשם ללוג. הוא משמש רק להגבלת קצב, בזיכרון,
       ואף שם רק כ-hash.
     · מה-user-agent נשמרת משפחת הדפדפן בלבד (Chrome / Safari / …).
     · שדות שלא ביקשנו נזרקים. שרת המדידה לא יודע מה זו סיסמה.

   משתני סביבה — הפירוט ב-README.md שבתיקייה.
   ===================================================================== */
'use strict';

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { createStore } = require('./store');

const ADMIN_HTML = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');

/* ---------- הגבלת קצב: חלון מתגלגל, בזיכרון ---------- */
function limiter() {
  const hits = new Map();   /* key → [timestamps] */
  let lastSweep = Date.now();
  return function allow(key, max, windowMs) {
    const now = Date.now();
    if (now - lastSweep > 60000) {            /* ניקוי, שהמפה לא תגדל לנצח */
      for (const [k, arr] of hits) if (now - arr[arr.length - 1] > windowMs) hits.delete(k);
      lastSweep = now;
    }
    let arr = hits.get(key);
    if (!arr) { arr = []; hits.set(key, arr); }
    while (arr.length && now - arr[0] > windowMs) arr.shift();
    if (arr.length >= max) return Math.ceil((windowMs - (now - arr[0])) / 1000);
    arr.push(now);
    return 0;
  };
}

/* ---------- עזרים ---------- */
function json(res, status, body, extra) {
  const s = JSON.stringify(body);
  res.writeHead(status, Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  }, extra || {}));
  res.end(s);
}
function fail(res, status, code, message, extra) {
  return json(res, status, { ok: false, error: code, message }, extra);
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(new Error('too_large')); chunks.length = 0; return; }   /* ממשיכים לרוקן, כדי שהתשובה תצא */
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
function uaFamily(ua) {
  ua = String(ua || '');
  if (!ua) return 'Other';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/SamsungBrowser\//.test(ua)) return 'Samsung';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Chrome\/|CriOS\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Other';
}
function parseCookies(h) {
  const out = {};
  String(h || '').split(';').forEach(p => {
    const i = p.indexOf('='); if (i < 0) return;
    out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}
function safeEq(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

/* ---------- אימות שדות מהלקוח — מה שלא עובר נזרק, לא נשמר ---------- */
const SID_RE  = /^[A-Za-z0-9_-]{16,64}$/;
const PAGE_RE = /^\/[A-Za-z0-9/_.-]{0,63}$/;
const LANG_RE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/;
const REF_RE  = /^[a-z0-9.-]{1,80}$/;

function createServer(opts) {
  opts = opts || {};
  const env = opts.env || process.env;
  const store = opts.store || createStore(env);
  const secret = env.ANALYTICS_SECRET || crypto.randomBytes(32).toString('hex');
  const secretIsTemp = !env.ANALYTICS_SECRET;
  const adminPassword = env.ANALYTICS_ADMIN_PASSWORD || '';
  const adminToken = env.ANALYTICS_ADMIN_TOKEN || '';
  const origins = new Set(String(env.ANALYTICS_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean));
  const retention = Math.max(1, +env.ANALYTICS_RETENTION_DAYS || 90);
  const tz = env.ANALYTICS_TZ || 'Asia/Jerusalem';
  const dedupMs = +env.ANALYTICS_DEDUP_MINUTES > 0 ? env.ANALYTICS_DEDUP_MINUTES * 60000 : 30 * 60000;
  const activeMs = 5 * 60000;
  const cookieName = 'an_admin';
  const log = opts.quiet ? () => {} : (...a) => console.log(new Date().toISOString(), ...a);

  const allow = limiter();
  const LIMITS = {
    visit:   [+env.ANALYTICS_RATE_VISIT   || 30,  60000],
    ping:    [+env.ANALYTICS_RATE_PING    || 120, 60000],
    login:   [+env.ANALYTICS_RATE_LOGIN   || 5,   15 * 60000],
    summary: [+env.ANALYTICS_RATE_SUMMARY || 60,  60000],
  };
  const active = new Map();   /* session hash → last seen. בזיכרון בלבד, לא נשמר */

  function hmac(s) { return crypto.createHmac('sha256', secret).update(s).digest('hex'); }
  function sessionHash(sid) { return hmac('sid:' + sid).slice(0, 32); }
  function ipOf(req) {
    const xf = req.headers['x-forwarded-for'];
    const ip = xf ? String(xf).split(',')[0].trim() : (req.socket.remoteAddress || '');
    return hmac('ip:' + ip).slice(0, 16);   /* ה-IP עצמו לא נשמר בשום מקום */
  }
  function activeNow() {
    const cut = Date.now() - activeMs; let n = 0;
    for (const [h, t] of active) { if (t < cut) active.delete(h); else n++; }
    return n;
  }
  function isHttps(req) {
    return req.headers['x-forwarded-proto'] === 'https' || env.ANALYTICS_SECURE_COOKIE === '1';
  }
  function makeCookie(req) {
    const exp = Date.now() + 12 * 3600 * 1000;
    const v = exp + '.' + hmac('admin:' + exp);
    return cookieName + '=' + v + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200' + (isHttps(req) ? '; Secure' : '');
  }
  function clearCookie() { return cookieName + '=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'; }
  function isAdmin(req) {
    const auth = req.headers.authorization || '';
    if (adminToken && /^Bearer\s+/i.test(auth) && safeEq(auth.replace(/^Bearer\s+/i, '').trim(), adminToken)) return true;
    const c = parseCookies(req.headers.cookie)[cookieName];
    if (!c) return false;
    const [exp, sig] = c.split('.');
    if (!exp || !sig || +exp < Date.now()) return false;
    return safeEq(sig, hmac('admin:' + exp));
  }
  function cors(req, res) {
    const o = req.headers.origin;
    if (!o || !origins.has(o)) return;
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
  }
  async function parseJson(req, res) {
    let raw;
    try { raw = await readBody(req, 2048); }
    catch (e) { fail(res, 413, 'too_large', 'הגוף גדול מדי'); return null; }
    try {
      const b = JSON.parse(raw || '{}');
      if (!b || typeof b !== 'object' || Array.isArray(b)) throw new Error();
      return b;
    } catch (e) { fail(res, 400, 'bad_json', 'הגוף אינו JSON תקין'); return null; }
  }
  function limited(res, name, key) {
    const [max, win] = LIMITS[name];
    const retry = allow(name + ':' + key, max, win);
    if (retry) { fail(res, 429, 'rate_limited', 'יותר מדי בקשות, נסו שוב בעוד ' + retry + ' שניות', { 'Retry-After': String(retry) }); return true; }
    return false;
  }

  /* ---------- הנתיבים ---------- */
  async function visit(req, res) {
    const ip = ipOf(req);
    if (limited(res, 'visit', ip)) return;
    const b = await parseJson(req, res); if (!b) return;
    if (typeof b.sid !== 'string' || !SID_RE.test(b.sid)) return fail(res, 400, 'bad_session', 'מזהה session חסר או לא תקין');
    const page = typeof b.page === 'string' && PAGE_RE.test(b.page) ? b.page : '/';
    const language = typeof b.lang === 'string' && LANG_RE.test(b.lang) ? b.lang.toLowerCase().slice(0, 5) : null;
    const referrer = typeof b.ref === 'string' && REF_RE.test(b.ref) ? b.ref : null;
    const h = sessionHash(b.sid);
    const now = Date.now();
    active.set(h, now);
    try {
      const r = await store.record({ h, at: now, page, language, referrer, ua: uaFamily(req.headers['user-agent']) }, dedupMs);
      return json(res, r.counted ? 201 : 200, { ok: true, counted: r.counted });
    } catch (e) {
      log('visit store error:', e.message);
      return fail(res, 503, 'analytics_unavailable', 'שירות המדידה אינו זמין כרגע. הביקור לא נשמר.');
    }
  }
  async function ping(req, res) {
    if (limited(res, 'ping', ipOf(req))) return;
    const b = await parseJson(req, res); if (!b) return;
    if (typeof b.sid !== 'string' || !SID_RE.test(b.sid)) return fail(res, 400, 'bad_session', 'מזהה session חסר או לא תקין');
    active.set(sessionHash(b.sid), Date.now());
    return json(res, 200, { ok: true });
  }
  async function summary(req, res) {
    if (limited(res, 'summary', ipOf(req))) return;
    if (!isAdmin(req)) return fail(res, 401, 'unauthorized', 'נדרשת כניסת אדמין');
    const days = Math.min(365, Math.max(7, +new URL(req.url, 'http://x').searchParams.get('days') || 30));
    try {
      const s = await store.summary({ days, tz });
      return json(res, 200, Object.assign({ ok: true }, s, {
        activeNow: activeNow(), store: store.kind, retentionDays: retention, tz,
        warning: store.kind === 'supabase' ? null
          : (store.kind === 'file' ? 'אין Supabase — הנתונים נשמרים בקובץ בשרת בלבד'
                                   : 'אין Supabase — הנתונים בזיכרון בלבד ויאבדו באתחול השרת'),
      }));
    } catch (e) {
      log('summary store error:', e.message);
      return fail(res, 503, 'analytics_unavailable', 'מסד הנתונים אינו זמין כרגע: ' + e.message.slice(0, 120));
    }
  }
  async function health(req, res) {
    const r = await store.ready();
    return json(res, r.ok ? 200 : 503, { ok: r.ok, store: store.kind, message: r.message, adminEnabled: !!adminPassword });
  }
  async function login(req, res) {
    if (limited(res, 'login', ipOf(req))) return;
    if (!adminPassword) return fail(res, 503, 'admin_disabled', 'לא הוגדרה סיסמת אדמין (ANALYTICS_ADMIN_PASSWORD)');
    const b = await parseJson(req, res); if (!b) return;
    if (typeof b.password !== 'string' || !safeEq(b.password, adminPassword)) return fail(res, 401, 'bad_password', 'סיסמה שגויה');
    return json(res, 200, { ok: true }, { 'Set-Cookie': makeCookie(req) });
  }
  function logout(req, res) { return json(res, 200, { ok: true }, { 'Set-Cookie': clearCookie() }); }
  function adminPage(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src data:; form-action 'self'; base-uri 'none'",
    });
    res.end(ADMIN_HTML);
  }

  const server = http.createServer(async (req, res) => {
    const url = req.url.split('?')[0];
    try {
      if (url === '/api/analytics/visit' || url === '/api/analytics/ping') {
        cors(req, res);
        if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
        if (req.method !== 'POST') return fail(res, 405, 'method_not_allowed', 'רק POST', { Allow: 'POST, OPTIONS' });
        return url.endsWith('visit') ? await visit(req, res) : await ping(req, res);
      }
      if (url === '/api/analytics/summary') {
        if (req.method !== 'GET') return fail(res, 405, 'method_not_allowed', 'רק GET', { Allow: 'GET' });
        return await summary(req, res);
      }
      if (url === '/api/analytics/health') return await health(req, res);
      if (url === '/admin/analytics' || url === '/admin/analytics/') {
        if (req.method !== 'GET') return fail(res, 405, 'method_not_allowed', 'רק GET', { Allow: 'GET' });
        return adminPage(req, res);
      }
      if (url === '/admin/analytics/login') {
        if (req.method !== 'POST') return fail(res, 405, 'method_not_allowed', 'רק POST', { Allow: 'POST' });
        return await login(req, res);
      }
      if (url === '/admin/analytics/logout') {
        if (req.method !== 'POST') return fail(res, 405, 'method_not_allowed', 'רק POST', { Allow: 'POST' });
        return logout(req, res);
      }
      return fail(res, 404, 'not_found', 'אין כאן כלום');
    } catch (e) {
      log('unhandled:', e.message);
      if (!res.headersSent) fail(res, 500, 'internal', 'שגיאה פנימית');
      else res.end();
    }
  });

  /* מחיקה לפי retention: בהפעלה, ואחר כך כל שש שעות */
  let job = null;
  async function purge() {
    try { const r = await store.rollupAndPurge(retention, tz); log('rollup/purge:', JSON.stringify(r)); }
    catch (e) { log('rollup/purge failed:', e.message); }
  }
  server.on('listening', () => {
    if (secretIsTemp) log('אזהרה: ANALYTICS_SECRET לא הוגדר — ה-hash של הביקורים ישתנה בכל אתחול');
    if (!adminPassword) log('אזהרה: ANALYTICS_ADMIN_PASSWORD לא הוגדר — מסך האדמין נעול לכולם');
    if (!opts.noJobs) {
      purge();
      job = setInterval(purge, 6 * 3600 * 1000);
      if (job.unref) job.unref();
    }
  });
  server.on('close', () => { if (job) clearInterval(job); });
  server.analytics = { store, purge, activeNow };
  return server;
}

if (require.main === module) {
  const port = +process.env.PORT || 8787;
  const s = createServer();
  s.listen(port, () => {
    console.log(new Date().toISOString(), 'analytics listening on', port, '— store:', s.analytics.store.kind);
    s.analytics.store.ready().then(r => console.log(new Date().toISOString(), r.message));
  });
}

module.exports = { createServer, uaFamily };
