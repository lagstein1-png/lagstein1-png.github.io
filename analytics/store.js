/* =====================================================================
   אחסון הביקורים — שני מימושים מאחורי ממשק אחד.

   · supabase — כשיש SUPABASE_URL ו-SUPABASE_SERVICE_ROLE_KEY. הכול דרך
     REST רגיל (PostgREST) עם fetch המובנה של Node, בלי ספרייה.
   · memory   — כשאין. הביקורים נשמרים בזיכרון התהליך, ואם
     ANALYTICS_DATA_FILE מוגדר — גם בקובץ JSON, כדי שאתחול לא ימחק אותם.

   שניהם עונים על אותן שאלות, כדי שהשרת והבדיקות לא ידעו מי מאחור:

     ready()                          → {ok, message}
     record(visit, dedupMs)           → {counted}     ביקור; כפילות של אותו session לא נספרת
     summary({days, tz})              → {total, today, week, days:[…], pages:[…], …}
     rollupAndPurge(retentionDays,tz) → {rolled, purged}

   הרשומה שנשמרת: session_id_hash, visited_at, page, language, referrer,
   user_agent_family. אין IP, אין user-agent מלא, אין שם. מה שאין כאן
   אי אפשר להדליף.

   מניין כולל: ביקורים גולמיים נמחקים אחרי retention ימים, ולכן לפני
   המחיקה כל יום שלם מסוכם לטבלה יומית (יום, דף, מונה). "סך הכול" =
   סיכום הימים שכבר אינם בגולמי + מניין הגולמי. יום נמחק בשלמותו,
   ולכן אף יום לא נספר פעמיים.
   ===================================================================== */
'use strict';

const fs = require('fs');

/* תאריך מקומי YYYY-MM-DD באזור זמן נתון. en-CA נותן בדיוק את הצורה הזאת. */
const fmtCache = new Map();
function dayOf(ts, tz) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    fmtCache.set(tz, f);
  }
  return f.format(new Date(ts));
}
function addDays(day, n) {
  const d = new Date(day + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function topN(rows, key, n) {
  const m = new Map();
  for (const r of rows) { const k = r[key] || '—'; m.set(k, (m.get(k) || 0) + 1); }
  return [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ [key]: k, visits: v }));
}

/* ------------------------------------------------------------------
   memory / file
   ------------------------------------------------------------------ */
function memoryStore(opts) {
  const file = opts.file || '';
  let raw = [];                 /* {h, at, page, language, referrer, ua} */
  const daily = new Map();      /* "day|page" → visits */
  const last = new Map();       /* h → at אחרון, לזיהוי כפילות */
  let saveTimer = null;

  if (file && fs.existsSync(file)) {
    try {
      const j = JSON.parse(fs.readFileSync(file, 'utf8'));
      raw = Array.isArray(j.raw) ? j.raw : [];
      for (const [k, v] of Object.entries(j.daily || {})) daily.set(k, v);
      for (const r of raw) last.set(r.h, Math.max(last.get(r.h) || 0, r.at));
    } catch (e) { /* קובץ פגום — מתחילים ריק, ולא נופלים */ }
  }
  function save() {
    if (!file) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        fs.writeFileSync(file, JSON.stringify({ raw, daily: Object.fromEntries(daily) }));
      } catch (e) { /* דיסק לקריאה בלבד — הזיכרון עדיין עובד */ }
    }, 200);
    if (saveTimer.unref) saveTimer.unref();
  }

  return {
    kind: file ? 'file' : 'memory',
    async ready() {
      return { ok: true, message: file
        ? 'אין Supabase — הביקורים נשמרים בקובץ ' + file
        : 'אין Supabase — הביקורים נשמרים בזיכרון בלבד ויאבדו באתחול' };
    },
    async record(v, dedupMs) {
      const prev = last.get(v.h);
      if (prev && v.at - prev < dedupMs) return { counted: false };
      raw.push({ h: v.h, at: v.at, page: v.page, language: v.language, referrer: v.referrer, ua: v.ua });
      last.set(v.h, v.at);
      save();
      return { counted: true };
    },
    async summary({ days, tz }) {
      const today = dayOf(Date.now(), tz);
      const first = raw.length ? raw.map(r => dayOf(r.at, tz)).sort()[0] : null;
      let total = raw.length;
      for (const [k, v] of daily) if (!first || k.split('|')[0] < first) total += v;
      const from = addDays(today, -(days - 1)), weekFrom = addDays(today, -6);
      const rawByDay = new Map();
      let todayN = 0, week = 0;
      const recent = [];
      for (const r of raw) {
        const d = dayOf(r.at, tz);
        if (d === today) todayN++;
        if (d >= weekFrom) week++;
        if (d >= from) { rawByDay.set(d, (rawByDay.get(d) || 0) + 1); recent.push(r); }
      }
      const dailyByDay = new Map();
      for (const [k, v] of daily) { const d = k.split('|')[0]; dailyByDay.set(d, (dailyByDay.get(d) || 0) + v); }
      const series = [];
      for (let d = from; d <= today; d = addDays(d, 1)) {
        const fromRaw = first && d >= first;
        series.push({ day: d, visits: fromRaw ? (rawByDay.get(d) || 0) : (dailyByDay.get(d) || 0) });
      }
      return {
        total, today: todayN, week, days: series,
        pages: topN(recent, 'page', 10), languages: topN(recent, 'language', 6),
        referrers: topN(recent, 'referrer', 10), browsers: topN(recent, 'ua', 6),
      };
    },
    async rollupAndPurge(retentionDays, tz) {
      const today = dayOf(Date.now(), tz), cutoff = addDays(today, -retentionDays);
      const counts = new Map();
      for (const r of raw) {
        const d = dayOf(r.at, tz);
        if (d < today) { const k = d + '|' + r.page; counts.set(k, (counts.get(k) || 0) + 1); }
      }
      for (const [k, v] of counts) daily.set(k, v);
      const before = raw.length;
      raw = raw.filter(r => dayOf(r.at, tz) >= cutoff);
      for (const [h, at] of last) if (dayOf(at, tz) < cutoff) last.delete(h);
      save();
      return { rolled: counts.size, purged: before - raw.length };
    },
    /* לבדיקות בלבד: מה באמת יושב באחסון */
    _dump() { return { raw: raw.slice(), daily: Object.fromEntries(daily) }; },
  };
}

/* ------------------------------------------------------------------
   supabase — PostgREST דרך fetch
   ------------------------------------------------------------------ */
function supabaseStore(opts) {
  const base = opts.url.replace(/\/+$/, '') + '/rest/v1/';
  const headers = {
    apikey: opts.key,
    Authorization: 'Bearer ' + opts.key,
    'Content-Type': 'application/json',
  };
  const timeoutMs = opts.timeoutMs || 5000;

  async function call(path, init) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const r = await fetch(base + path, { ...init, headers: { ...headers, ...(init.headers || {}) }, signal: ac.signal });
      const text = await r.text();
      if (!r.ok) {
        const err = new Error('supabase ' + r.status + ': ' + text.slice(0, 200));
        err.status = r.status;
        throw err;
      }
      return text ? JSON.parse(text) : null;
    } finally { clearTimeout(t); }
  }

  return {
    kind: 'supabase',
    async ready() {
      try {
        await call('analytics_visits?select=id&limit=1', { method: 'GET' });
        return { ok: true, message: 'Supabase מחובר' };
      } catch (e) {
        return { ok: false, message: 'Supabase לא זמין: ' + e.message };
      }
    },
    async record(v, dedupMs) {
      const since = new Date(v.at - dedupMs).toISOString();
      const dup = await call(
        'analytics_visits?select=id&session_id_hash=eq.' + encodeURIComponent(v.h) +
        '&visited_at=gte.' + encodeURIComponent(since) + '&limit=1', { method: 'GET' });
      if (dup && dup.length) return { counted: false };
      await call('analytics_visits', {
        method: 'POST', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          session_id_hash: v.h, visited_at: new Date(v.at).toISOString(), page: v.page,
          language: v.language, referrer: v.referrer, user_agent_family: v.ua,
        }),
      });
      return { counted: true };
    },
    async summary({ days, tz }) {
      return call('rpc/analytics_summary', { method: 'POST', body: JSON.stringify({ p_days: days, p_tz: tz }) });
    },
    async rollupAndPurge(retentionDays, tz) {
      return call('rpc/analytics_rollup_and_purge', {
        method: 'POST', body: JSON.stringify({ p_retention_days: retentionDays, p_tz: tz }) });
    },
  };
}

function createStore(env) {
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    return supabaseStore({ url: env.SUPABASE_URL, key: env.SUPABASE_SERVICE_ROLE_KEY,
                           timeoutMs: +env.SUPABASE_TIMEOUT_MS || 5000 });
  }
  return memoryStore({ file: env.ANALYTICS_DATA_FILE || '' });
}

module.exports = { createStore, memoryStore, supabaseStore, dayOf, addDays };
