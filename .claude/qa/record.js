#!/usr/bin/env node
/* =====================================================================
   record.js — הקלטת המאגרים לקבצי MP3, השכבה המוקלטת של תאוריה מדברת

   **הוראת הבעלים, 21.9.2026:** ״תעתיק את המנוע, כבר שילמנו, ותיישם
   כמנוע שממנו לוקחים בעתיד.״ המנוע שם הוא `tools/tts-build.js` +
   `audio/` + `STATIC` ב-`index.html`; כאן הוא שלושה קבצים:
   הקובץ הזה (ייצור), `/speech/recorded.js` (ניגון), ו-`recorded.js`
   שבתיקייה הזאת (הבדיקה).

   רץ על רנר של GitHub (`record.yml`) עם המפתח שב-Secrets — לא
   בסביבת הפיתוח (הרשת חסומה כאן) ולא בדפדפן (מפתח בדף).

     node .claude/qa/record.js --plan [app...]     כמה מחרוזות, כמה תווים, כיסוי — בלי רשת
     node .claude/qa/record.js --check             המניפסט תואם לקבצים — נכנס ל-all.js
     node .claude/qa/record.js --next              מי הכי חסרה — לריצה המתוזמנת
     GEMINI_API_KEY=… node .claude/qa/record.js english [--max 300]   מקליט מה שחסר

   **מה מוקלט.** כל מחרוזת `he:"…"` בת שתי מילים ומעלה במאגר של
   האפליקציה — שאלה, תשובות, הסברים, רמזים — אחרי אותו ניקוי
   שהאפליקציה עושה לפני הקראה (`plainOf`: בלי תגיות, רווח אחד).
   המזהה הוא גיבוב של הטקסט המנוקה (`RECORDED.id`, זהה ל-`audioId`
   שבריפו הנפרד); מה שנשלח למנוע הוא הטקסט אחרי `HESPEECH.spoken`,
   בדיוק כמו `forSpeech` שם. עריכת ניסוח = מזהה חדש = הקלטה חדשה,
   ולעולם לא קובץ ישן על טקסט שהשתנה.

   **הקצב נמדד שם ולא שוער:** מודל ה-TTS מוגבל לכ-5 בקשות לדקה
   גם במדרגה בתשלום (הערת `pace` ב-`tts-build.js` שם: 12 שניות,
   עובד אחד, ״התשלום פתח את החסימה, הוא לא הרים את התקרה לדקה״).
   לכן ריצה אחת מקליטה מאות, לא אלפים, וההרצה מתחדשת: קובץ קיים
   אינו מופק שוב.

   **המניפסט נגזר מהדיסק בסוף כל ריצה** — קובץ שקיים ואינו במניפסט
   לא ינוגן, ומזהה במניפסט בלי קובץ היה מנגן שקט במקום ליפול לקול
   המכשיר. `--check` נופל על שני הכיוונים.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
require(path.join(ROOT, 'speech', 'recorded.js'));
require(path.join(ROOT, 'tutor', 'he-speech.js'));
const R = globalThis.RECORDED, H = globalThis.HESPEECH;

const KEY   = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || '';
const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
const VOICE = process.env.GEMINI_TTS_VOICE || 'Kore';
const API   = 'https://generativelanguage.googleapis.com/v1beta';
const KBPS  = 32;                 /* כמו 6,823 ההקלטות שבריפו הנפרד */
const LANG  = 'he';
const MIN_BYTES = 512;            /* קובץ קטן מזה הוא תשובה ריקה, לא דיבור */

/* --- המאגרים: מאיפה מגיעות המחרוזות של כל אפליקציה ----------------
   מי שאינו כאן אינו ניתן להקלטה מראש: המתמטיקה מחוללת טקסט
   מפרמטרים, נתיב מקריא טקסט שהלומד הדביק, כותבים ביחד מרכיבה
   טקסט מחלקים, ורקיע ובגרות 806 בונות את הנאמר בזמן ריצה
   (כותרת + טקסט, נוסחה → מילים). הן ממשיכות בקול המכשיר. */
const SOURCES = {
  english: ['english/index.html'],
  history: ['history/index.html'],
  ulpan:   ['ulpan/index.html'],
  lomda:   () => fs.readdirSync(path.join(ROOT, 'lomda', 'data'))
                   .filter(f => f.endsWith('.js')).sort().map(f => 'lomda/data/' + f)
};

/* בדיוק מה ש-plainOf עושה באפליקציה: תגיות יורדות, ישויות נפתחות,
   רווחים מתכווצים. הטקסט הזה הוא מה שהאפליקציה מוסרת ל-play. */
function plainOf(h) {
  return String(h || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}
/* מחרוזת JS כפי שהיא כתובה בקובץ → הערך שלה */
function unquote(raw) {
  try { return JSON.parse('"' + raw + '"'); } catch (e) { return raw.replace(/\\"/g, '"'); }
}

function corpus(app) {
  const src = SOURCES[app];
  if (!src) return null;
  const files = typeof src === 'function' ? src() : src;
  const seen = new Map();       /* id → text, בסדר ההופעה */
  for (const f of files) {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of s.matchAll(/\bhe\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
      const text = plainOf(unquote(m[1]));
      if (!/[א-ת]/.test(text)) continue;
      if (text.split(' ').length < 2) continue;
      const id = R.id(text);
      if (!seen.has(id)) seen.set(id, text);
    }
  }
  return seen;
}

function dirOf(app) { return path.join(ROOT, app, 'audio'); }
function onDisk(app) {
  const d = path.join(dirOf(app), LANG);
  if (!fs.existsSync(d)) return new Set();
  return new Set(fs.readdirSync(d).filter(f => f.endsWith('.mp3'))
    .filter(f => fs.statSync(path.join(d, f)).size >= MIN_BYTES)
    .map(f => f.slice(0, -4)));
}
function readManifest(app) {
  const p = path.join(dirOf(app), 'manifest.json');
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return { broken: true }; }
}
function writeManifest(app) {
  const ids = [...onDisk(app)].sort();
  const m = { voice: VOICE, model: MODEL, kbps: KBPS, generated: new Date().toISOString().slice(0, 10),
              langs: { [LANG]: { count: ids.length, ids } } };
  fs.mkdirSync(dirOf(app), { recursive: true });
  fs.writeFileSync(path.join(dirOf(app), 'manifest.json'), JSON.stringify(m, null, 0) + '\n');
  return ids.length;
}

/* --- plan --------------------------------------------------------- */
function plan(apps) {
  let tot = 0, totChars = 0, totHave = 0;
  for (const app of apps) {
    const c = corpus(app); if (!c) { console.log('· ' + app.padEnd(9) + 'אין מאגר קבוע — קול המכשיר'); continue; }
    const have = onDisk(app);
    let chars = 0, got = 0;
    for (const [id, text] of c) { chars += text.length; if (have.has(id)) got++; }
    tot += c.size; totChars += chars; totHave += got;
    console.log('· ' + app.padEnd(9) + String(c.size).padStart(5) + ' מחרוזות · ' +
                String(chars).padStart(7) + ' תווים · מוקלטות ' + got + ' (' +
                (c.size ? Math.round(got / c.size * 100) : 0) + '%)');
  }
  console.log('\nסה״כ ' + tot + ' מחרוזות · ' + totChars + ' תווים · מוקלטות ' + totHave);
}

/* --- check -------------------------------------------------------- */
function check() {
  let bad = 0;
  for (const app of Object.keys(SOURCES)) {
    const m = readManifest(app), disk = onDisk(app);
    /* מניפסט ריק יושב בכל אפליקציה מהיום הראשון: 404 על manifest.json
       נרשם בקונסולה כשגיאה, ו-smoke/exam נפלו על זה ב-main (ריצה 814). */
    if ((!m || !(((m.langs || {})[LANG] || {}).ids || []).length) && !disk.size) { console.log('· ' + app.padEnd(9) + 'אין הקלטות עדיין — קול המכשיר'); continue; }
    if (!m || m.broken) { bad++; console.log('✗ ' + app.padEnd(9) + 'יש קבצים ואין manifest.json תקין — ' + disk.size + ' קבצים לא ינוגנו'); continue; }
    const ids = ((m.langs || {})[LANG] || {}).ids || [];
    const set = new Set(ids);
    const ghost = ids.filter(x => !disk.has(x));
    const orphan = [...disk].filter(x => !set.has(x));
    const c = corpus(app);
    const covered = c ? [...c.keys()].filter(x => set.has(x)).length : 0;
    if (ghost.length || orphan.length) {
      bad++;
      console.log('✗ ' + app.padEnd(9) + (ghost.length ? ghost.length + ' מזהים במניפסט בלי קובץ (ינגנו שקט) ' : '') +
                  (orphan.length ? orphan.length + ' קבצים שאינם במניפסט (לא ינוגנו)' : '') +
                  ' — node .claude/qa/record.js --manifest ' + app);
    } else {
      console.log('✓ ' + app.padEnd(9) + ids.length + ' הקלטות, המניפסט תואם לדיסק · כיסוי ' +
                  covered + '/' + (c ? c.size : 0));
    }
  }
  return bad;
}

/* --- build -------------------------------------------------------- */
function findFfmpeg() {
  for (const f of [process.env.FFMPEG, 'ffmpeg'].filter(Boolean)) {
    const r = spawnSync(f, ['-version'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return f;
  }
  return null;
}
function pcmToMp3(ffmpeg, pcm, rate) {
  const base = path.join(os.tmpdir(), 'rec-' + process.pid + '-' + Math.random().toString(36).slice(2));
  const src = base + '.pcm', dst = base + '.mp3';
  fs.writeFileSync(src, pcm);
  try {
    const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y',
      '-f', 's16le', '-ar', String(rate), '-ac', '1', '-i', src, '-b:a', KBPS + 'k', dst], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error('ffmpeg: ' + String(r.stderr).slice(0, 160));
    return fs.readFileSync(dst);
  } finally { for (const f of [src, dst]) { try { fs.unlinkSync(f); } catch (e) {} } }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ויסות כמו שם: מרווח שמתארך על 429 ומתקצר בזהירות אחרי רצף הצלחות */
const PACE = { gap: 12000, min: 5000, max: 60000, ok: 0 };
async function synth(ffmpeg, text) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const r = await fetch(API + '/models/' + MODEL + ':generateContent?key=' + encodeURIComponent(KEY), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text }] }],
        generationConfig: { responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } } })
    });
    if (r.status === 429 || r.status >= 500) {
      PACE.ok = 0; PACE.gap = Math.min(PACE.max, Math.round(PACE.gap * 1.5));
      const body = await r.text();
      if (attempt === 5) throw new Error('gemini ' + r.status + ' ' + body.replace(/\s+/g, ' ').slice(0, 160));
      await sleep(PACE.gap); continue;
    }
    if (!r.ok) {
      const body = await r.text(); let msg = body;
      try { msg = JSON.parse(body).error.message; } catch (e) {}
      throw new Error('gemini ' + r.status + ' ' + String(msg).replace(/\s+/g, ' ').slice(0, 160));
    }
    const j = await r.json();
    const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
    const inline = parts.map(p => p.inlineData).filter(Boolean)[0];
    if (!inline || !inline.data) { await sleep(2000); continue; }   /* 200 בלי אודיו — רעש חולף, נמדד ב-voice.js */
    if (++PACE.ok >= 8) { PACE.ok = 0; PACE.gap = Math.max(PACE.min, Math.round(PACE.gap * 0.8)); }
    const rate = Number((/rate=(\d+)/.exec(inline.mimeType || '') || [])[1]) || 24000;
    return pcmToMp3(ffmpeg, Buffer.from(inline.data, 'base64'), rate);
  }
  throw new Error('תשובה בלי אודיו שש פעמים');
}

async function build(app, max) {
  const c = corpus(app);
  if (!c) { console.log('✗ ' + app + ' — אין מאגר קבוע להקלטה'); return 1; }
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) { console.log('✗ אין ffmpeg — FFMPEG=<נתיב> או ffmpeg ב-PATH'); return 1; }
  if (!KEY) { console.log('✗ חסר GEMINI_API_KEY'); return 1; }
  const have = onDisk(app);
  const todo = [...c].filter(([id]) => !have.has(id)).slice(0, max);
  const outDir = path.join(dirOf(app), LANG);
  fs.mkdirSync(outDir, { recursive: true });
  console.log(app + ': ' + c.size + ' מחרוזות · מוקלטות ' + have.size + ' · בריצה הזאת עד ' + todo.length +
              ' · מודל ' + MODEL + ' · קול ' + VOICE);
  let made = 0, failed = 0, quota = false;
  const t0 = Date.now();
  for (const [id, text] of todo) {
    try {
      const mp3 = await synth(ffmpeg, H.spoken(text));
      if (mp3.length < MIN_BYTES) throw new Error('קובץ ריק');
      fs.writeFileSync(path.join(outDir, id + '.mp3'), mp3);
      made++;
      if (made % 10 === 0) console.log('  ' + made + '/' + todo.length + ' · ' + Math.round((Date.now() - t0) / 1000) + 'ש · מרווח ' + PACE.gap + 'ms');
    } catch (e) {
      failed++;
      console.log('  ✗ ' + id + ' ' + e.message.slice(0, 140));
      if (/429|RESOURCE_EXHAUSTED|quota/i.test(e.message)) { quota = true; console.log('  המכסה נגמרה. מה שנכתב נשמר; הרצה חוזרת תמשיך מכאן.'); break; }
    }
    await sleep(PACE.gap);
  }
  const n = writeManifest(app);
  console.log('\nנוצרו ' + made + ', נכשלו ' + failed + ' · במניפסט ' + n + ' · ' +
              Math.round((Date.now() - t0) / 60000) + ' דק׳');
  return quota && !made ? 1 : 0;
}

/* --- main --------------------------------------------------------- */
(async () => {
  const args = process.argv.slice(2);
  const maxI = args.indexOf('--max');
  const max = maxI >= 0 ? Math.max(1, parseInt(args[maxI + 1], 10) || 300) : 300;
  const apps = args.filter(a => !a.startsWith('--') && !(maxI >= 0 && a === args[maxI + 1]));
  if (args.includes('--check')) {
    const bad = check();
    console.log(bad ? '\n' + bad + ' אפליקציות עם מניפסט שאינו תואם לדיסק' : '\nהשכבה המוקלטת: המניפסטים תואמים לדיסק');
    process.exit(bad ? 1 : 0);
  }
  if (args.includes('--manifest')) {
    for (const app of apps.length ? apps : Object.keys(SOURCES)) console.log(app + ': ' + writeManifest(app) + ' במניפסט');
    process.exit(0);
  }
  /* --next: האפליקציה שהכי הרבה חסר בה — לריצה המתוזמנת, שאין לה קלט */
  if (args.includes('--next')) {
    let best = null, most = -1;
    for (const app of Object.keys(SOURCES)) {
      const c = corpus(app), have = onDisk(app);
      const missing = [...c.keys()].filter(x => !have.has(x)).length;
      if (missing > most) { most = missing; best = app; }
    }
    console.log(most > 0 ? best : '');
    process.exit(0);
  }
  if (args.includes('--plan') || !apps.length) { plan(apps.length ? apps : Object.keys(SOURCES)); process.exit(0); }
  let code = 0;
  for (const app of apps) code = Math.max(code, await build(app, max));
  process.exit(code);
})();
