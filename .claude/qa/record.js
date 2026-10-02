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
     GEMINI_API_KEY=… node .claude/qa/record.js english [--max 300]   מקליט מה שחסר (gemini)
     TTS_PROVIDER=gcloud TTS_KEY=… TTS_VOICE=he-IL-Chirp3-HD-Kore node .claude/qa/record.js english [--replace]

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
   אינו מופק שוב אם הוא כבר באיכות היעד. קליפ ישן נשמר עד שתחליף תקין מוכן.

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
const QUALITY = require('./record-quality.js');

/* שני ספקים, כמו ב-tools/tts-build.js שם: gemini (ברירת מחדל, PCM
   דרך ffmpeg) ו-gcloud (Cloud Text-to-Speech, LINEAR16 דרך אותו ffmpeg — ראו synthGcloud).
   הבעלים העלה 23.9.2026 חמש דוגמאות ״לדיבור נכון״: 32 kbps, 24 kHz,
   מונו, בלי ID3 ובלי Info — לא הצינור שלנו (ffmpeg מוסיף את שניהם)
   ולא ההקלטות שבריפו הנפרד; מתאים ל-MP3 שמחזיר Cloud TTS. לכן
   הספק הזה נכנס, ובוחרים אותו ב-TTS_PROVIDER=gcloud עם TTS_KEY. */
const PROVIDER = (process.env.TTS_PROVIDER || 'gemini').toLowerCase();
const KEY   = PROVIDER === 'gcloud'
  ? (process.env.TTS_KEY || '')
  : (process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || '');
const MODEL = PROVIDER === 'gcloud' ? 'cloud-tts' : (process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts');
/* מצב אצווה (--batch): בקשה אחת מקליטה ~40 מחרוזות. המכסה היומית
   במדרגה החינמית היא לבקשה ולמודל (O-71: כ-15 בקשות ליום), ולכן
   אצווה מכפילה את התפוקה פי גודל האצווה, וסבב בין שני מודלי 2.5
   מכפיל אותה שוב. הקול זהה (Kore) כדי שכל הקבצים יישמעו אחיד.
   הבעלים, 2.10.2026: מודל אחד, 2.5 Flash, ותקרה של $25 — Pro ו-3.1 Flash
   עולים פי שניים לאסימון אודיו ולא היו נכנסים בתקרה (`--plan`). */
const MODELS = (process.env.GEMINI_TTS_MODELS || 'gemini-2.5-flash-preview-tts')
  .split(',').map(x => x.trim()).filter(Boolean);
const BATCH = process.argv.includes('--batch') || /^(1|YES|true)$/i.test(process.env.TTS_BATCH || '');
const BATCH_SIZE = (() => { const i = process.argv.indexOf('--batch-size');
  return i >= 0 ? Math.max(2, parseInt(process.argv[i + 1], 10) || 40) : 40; })();
/* תווי קלט מקסימליים לאצווה: משאירים מקום להנחיה מתחת לתקרת
   8,192 אסימוני קלט (בעברית אסימון הוא פחות מ-4 תווים). */
const BATCH_MAX_CHARS = 16000;
/* תקרת שניות אודיו משוערת לאצווה: מתחת לתקרת 16,384 אסימוני פלט
   (25 אסימונים לשנייה = כ-655 שניות). ~11 תווים לשניית דיבור
   בעברית + 2.2 שניות שקט בין פריטים. */
const BATCH_MAX_SEC = 600;
const VOICE = process.env.TTS_VOICE || process.env.GEMINI_TTS_VOICE ||
              (PROVIDER === 'gcloud' ? 'he-IL-Chirp3-HD-Kore' : 'Kore');   /* הבעלים, 2.10.2026: Kore בכל האתר, כמו בתאוריה מדברת */
const API   = 'https://generativelanguage.googleapis.com/v1beta';
const GCLOUD = 'https://texttospeech.googleapis.com/v1/text:synthesize';
/* מחיר למיליון תווים, כפי שכתוב ב-tools/tts-build.js של הריפו הנפרד
   (gcloud 30, azure 16, elevenlabs 150; gemini ״לא נמדד״). אומדן, לא
   חשבונית — המחיר של היום נמצא בדף התמחור של גוגל. */
const PRICE_PER_M = { gcloud: 30, gemini: null };

/* --- תקרת הוצאה (2.10.2026) ----------------------------------------
   הבעלים: ״עלות מקסימלית $25 חד פעמי״. עד היום שום דבר בקוד לא
   עצר כסף — רק מכסה (429). עכשיו כל בקשה נבדקת לפני שהיא יוצאת:
   אם האומדן שלה יחצה את התקרה, עוצרים כמו על מכסה, ומה שהוקלט נשמר.
   אחרי התשובה נרשם המחיר לפי usageMetadata (אסימונים אמיתיים).
   ההוצאה מצטברת בין ריצות ב-record-spend.json, ש-record.yml דוחף.
   המחיר בדולר למיליון אסימונים [קלט טקסט, פלט אודיו] — מ-cloudprice.net
   ומחיפוש, 2.10.2026, **לא מדף התמחור של גוגל ולא מחשבונית**. מודל
   שאינו בטבלה מחויב במחיר היקר שבה. התקרה: TTS_BUDGET_USD (ברירת מחדל 25). */
const PRICES = { 'gemini-2.5-pro-preview-tts': [1, 20], 'gemini-2.5-flash-preview-tts': [0.5, 10],
                 'gemini-3.1-flash-tts-preview': [1, 20] };
const BUDGET = Number(process.env.TTS_BUDGET_USD || 25);
const SPEND_FILE = path.join(ROOT, '.claude', 'qa', 'record-spend.json');
const SPEND = (() => { try { return JSON.parse(fs.readFileSync(SPEND_FILE, 'utf8')); }
                       catch (e) { return { budgetUsd: BUDGET, usd: 0, requests: 0, byModel: {} }; } })();
class BudgetError extends Error {}
function costOf(model, inTok, outTok) {
  if (model === 'cloud-tts') return 0;
  const [i, o] = PRICES[model] || [1, 20];
  return (inTok * i + outTok * o) / 1e6;
}
/* אומדן לפני הבקשה: ~11 תווים לשניית דיבור, 2.2 שניות שקט בין
   פריטי אצווה, 25 אסימוני אודיו לשנייה (ההערות על BATCH_MAX_SEC);
   אסימון קלט ≈ 3 תווים, ועוד 200 להנחיה. gcloud — לפי תווים. */
function estimate(model, chars, n) {
  if (model === 'cloud-tts') return chars / 1e6 * PRICE_PER_M.gcloud;
  const sec = chars / 11 + (n > 1 ? 2.2 * n : 0);
  return costOf(model, chars / 3 + 200 * Math.ceil(n / BATCH_SIZE), sec * 25);
}
const guess = (model, texts) => estimate(model, texts.reduce((s, t) => s + t.length, 0), texts.length);
function spendGate(model, texts) {
  const g = guess(model, texts);
  if (SPEND.usd + g > BUDGET) throw new BudgetError('תקרת ההוצאה $' + BUDGET + ': הוצאו $' + SPEND.usd.toFixed(2) +
    ', והבקשה הבאה (' + model + ') עולה כ-$' + g.toFixed(2));
}
function spendAdd(model, texts, usage) {
  const u = usage || {};
  const c = model !== 'cloud-tts' && u.promptTokenCount != null && u.candidatesTokenCount != null
    ? costOf(model, u.promptTokenCount, u.candidatesTokenCount) : guess(model, texts);
  SPEND.usd = Math.round((SPEND.usd + c) * 1e4) / 1e4;
  SPEND.requests = (SPEND.requests || 0) + 1;
  SPEND.byModel = SPEND.byModel || {};
  SPEND.byModel[model] = Math.round(((SPEND.byModel[model] || 0) + c) * 1e4) / 1e4;
  SPEND.budgetUsd = BUDGET;
  fs.writeFileSync(SPEND_FILE, JSON.stringify(SPEND, null, 1) + '\n');
}
/* מכסה או תקרה: אין טעם לעבור לאפליקציה הבאה ב---all */
let STOPPED = '';
const KBPS  = 64;                 /* אושר דרך Main 30.9: נקי יותר ללומד; ה-6,823 של הריפו הנפרד נשארות 32k */
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
                   .filter(f => f.endsWith('.js')).sort().map(f => 'lomda/data/' + f),
  /* מבדק חוסרים 30.9 סעיף 4 - חמש האפליקציות שחוטמו לשכבה. */
  civics: ['civics/index.html'],
  hebrew: ['hebrew/bank.json'],
  literature: ['literature/index.html'],
  tanakh: ['tanakh/index.html'],
  'hebrew-arab': ['hebrew-arab/index.html']
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
    for (const m of s.matchAll(/\b"?he"?\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
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
function modelLabel() { return BATCH && PROVIDER !== 'gcloud' ? 'batch(' + MODELS.join('+') + ')' : MODEL; }
/* הקול במניפסט הוא הקול שבו הקבצים שעל הדיסק הוקלטו בפועל. build
   מעביר אותו (הוא יודע אם התחיל מדיסק ריק). בלי פרמטר (--manifest):
   דיסק ריק — הקול הנוכחי; יש קבצים — מה שהמניפסט כבר אומר עליהם. */
function writeManifest(app, voice) {
  const ids = [...onDisk(app)].sort();
  const old = readManifest(app);
  const fresh = !ids.length || !(old && old.voice);
  const kbpsById = Object.fromEntries(ids.map(id => [id, QUALITY.bitrate(path.join(dirOf(app), LANG, id + '.mp3'))]));
  const rates = Object.values(kbpsById);
  const m = { voice: voice || (ids.length ? (old && old.voice) || null : VOICE),
              model: fresh ? modelLabel() : old.model || modelLabel(),
              kbps: rates.length ? Math.min(...rates) : KBPS, targetKbps: KBPS, kbpsById, generated: new Date().toISOString().slice(0, 10),
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
  const pr = PRICE_PER_M.gcloud;
  console.log('אומדן חד־פעמי ב-Cloud TTS לפי $' + pr + ' למיליון תווים (tts-build.js שם): $' +
              (totChars / 1e6 * pr).toFixed(2));
  /* gemini באצווה: אותו אומדן ש-spendGate עושה, על כל מה שעוד חסר */
  let missChars = 0, missN = 0;
  for (const app of apps) { const c = corpus(app); if (!c) continue; const have = onDisk(app);
    for (const [id, text] of c) if (!have.has(id)) { missChars += text.length; missN++; } }
  for (const m of MODELS) console.log('אומדן gemini ל-' + missN + ' החסרות, הכול ב-' + m + ' ($' + (PRICES[m] || [1, 20]).join('/$') +
    ' למיליון אסימונים, cloudprice.net): $' + estimate(m, missChars, missN).toFixed(2));
  console.log('תקרה $' + BUDGET + ' · הוצאו עד היום $' + (SPEND.usd || 0).toFixed(2) + ' (record-spend.json)');
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
    spendGate(MODEL, [text]);
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
    spendAdd(MODEL, [text], j.usageMetadata);
    if (!inline || !inline.data) { await sleep(2000); continue; }   /* 200 בלי אודיו — רעש חולף, נמדד ב-voice.js */
    if (++PACE.ok >= 8) { PACE.ok = 0; PACE.gap = Math.max(PACE.min, Math.round(PACE.gap * 0.8)); }
    const rate = Number((/rate=(\d+)/.exec(inline.mimeType || '') || [])[1]) || 24000;
    return pcmToMp3(ffmpeg, Buffer.from(inline.data, 'base64'), rate);
  }
  throw new Error('תשובה בלי אודיו שש פעמים');
}

/* --- אצווה: בקשה אחת, K מחרוזות, פיצול לפי שקט ----------------
   ההנחיה מבקשת שתי שניות שקט מוחלט בין פריטים ושלא יקראו את
   המספרים. הפיצול מיפה לפי סדר: מספר המקטעים חייב להיות בדיוק K,
   אחרת אין לנו דרך לדעת איזה מקטע שייך לאיזו מחרוזת והאצווה כולה
   מושחרת (quarantine) — המחרוזות נשארות חסרות ויוקלטו בריצה אחרת. */
class QuotaError extends Error {}
async function synthBatch(model, texts) {
  const k = texts.length;
  const prompt = 'הקרא בקול ברור, חם וטבעי את ' + k + ' הפריטים הבאים, בדיוק כפי שהם כתובים. ' +
    'בין פריט לפריט עצור לשתי שניות של שקט מוחלט. אל תקרא את מספרי הפריטים ואל תוסיף דבר משלך.\n' +
    texts.map((t, i) => (i + 1) + '. ' + t).join('\n');
  for (let attempt = 0; attempt < 2; attempt++) {
    spendGate(model, texts);
    const r = await fetch(API + '/models/' + model + ':generateContent?key=' + encodeURIComponent(KEY), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } } })
    });
    if (r.status === 429) { const b = await r.text(); throw new QuotaError(model + ' 429 ' + b.replace(/\s+/g, ' ').slice(0, 120)); }
    if (r.status >= 500 && attempt === 0) { await sleep(PACE.gap); continue; }
    if (!r.ok) {
      const body = await r.text(); let msg = body;
      try { msg = JSON.parse(body).error.message; } catch (e) {}
      throw new Error('gemini ' + r.status + ' ' + String(msg).replace(/\s+/g, ' ').slice(0, 160));
    }
    const j = await r.json();
    const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
    const inline = parts.map(p => p.inlineData).filter(Boolean)[0];
    spendAdd(model, texts, j.usageMetadata);
    if (!inline || !inline.data) { if (attempt === 0) { await sleep(2000); continue; } throw new Error(model + ' החזיר תשובה בלי אודיו'); }
    const rate = Number((/rate=(\d+)/.exec(inline.mimeType || '') || [])[1]) || 24000;
    return Buffer.from(inline.data, 'base64');
  }
  throw new Error(model + ' — שתי פעמים בלי אודיו');
}

/* PCM של אצווה → K קבצי MP3, לפי זיהוי שקט. null = הפיצול לא תקף. */
function splitBatch(ffmpeg, pcm, rate, k) {
  const base = path.join(os.tmpdir(), 'recb-' + process.pid + '-' + Math.random().toString(36).slice(2));
  const wav = base + '.wav', full = base + '.mp3';
  try {
    /* PCM גולמי → WAV (כותרת בלבד, בלי דחיסה) כדי ש-silencedetect יעבוד על המקור */
    const hdr = Buffer.alloc(44);
    hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVEfmt ', 8);
    hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22);
    hdr.writeUInt32LE(rate, 24); hdr.writeUInt32LE(rate * 2, 28); hdr.writeUInt16LE(2, 32);
    hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
    fs.writeFileSync(wav, Buffer.concat([hdr, pcm]));
    /* זיהוי שקט אדפטיבי (29.9, אחרי שהפיצול של Gacrux נכשל על הפרוג
       של Kore): כל קול עוצר אחרת בין פריטים. מנסים שלושה ספים על אותו
       PCM בלי עלות API, ומקבלים רק מעבר שמחזיר בדיוק k מקטעים. */
    const PASSES = [['-35dB', 1.6], ['-45dB', 1.0], ['-50dB', 0.7]];
    const dur = pcm.length / 2 / rate;
    let segs = null;
    for (const [noise, mind] of PASSES) {
      const det = spawnSync(ffmpeg, ['-hide_banner', '-i', wav, '-af', 'silencedetect=noise=' + noise + ':d=' + mind, '-f', 'null', '-'], { encoding: 'utf8' });
      const starts = [], ends = [];
      for (const m of String(det.stderr).matchAll(/silence_start: ([\d.]+)/g)) starts.push(Number(m[1]));
      for (const m of String(det.stderr).matchAll(/silence_end: ([\d.]+)/g)) ends.push(Number(m[1]));
      const bounds = [];
      let cur = 0;
      for (let i = 0; i < starts.length && i < ends.length; i++) { bounds.push([cur, starts[i]]); cur = ends[i]; }
      bounds.push([cur, dur]);
      /* מקטע אפסי או חריגה מהסדר — הפיצול לא אמין */
      const cand = bounds.filter(b => b[1] - b[0] > 0.15);
      if (cand.length === k) { segs = cand; break; }
    }
    if (!segs) return null;
    /* לא ממירים דרך PCM כפול: חותכים ישר מה-WAV */
    const out = [];
    for (let i = 0; i < segs.length; i++) {
      const seg = base + '-s' + i + '.mp3';
      const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', wav,
        '-ss', segs[i][0].toFixed(2), '-to', segs[i][1].toFixed(2), '-b:a', KBPS + 'k', seg], { encoding: 'utf8' });
      if (r.status !== 0) return null;
      const b = fs.readFileSync(seg);
      try { fs.unlinkSync(seg); } catch (e) {}
      if (b.length < MIN_BYTES) return null;
      out.push(b);
    }
    return out;
  } finally { for (const f of [wav, full]) { try { fs.unlinkSync(f); } catch (e) {} } }
}

/* Cloud Text-to-Speech: בקשה אחת. MP3 של Cloud TTS יוצא ב-32 kbps
   (ההערה למעלה, דוגמאות הבעלים 23.9), והיעד כאן KBPS — לכן מבקשים
   LINEAR16 (PCM בתוך WAV) ומקודדים באותו pcmToMp3 של gemini: שני
   הספקים יוצאים מאותו צינור, באותו קצב, בלי דחיסה כפולה. */
function wavToPcm(buf) {
  if (buf.slice(0, 4).toString() !== 'RIFF') return { pcm: buf, rate: 24000 };
  let rate = 24000, i = 12;
  while (i + 8 <= buf.length) {
    const id = buf.slice(i, i + 4).toString(), size = buf.readUInt32LE(i + 4);
    if (id === 'fmt ') rate = buf.readUInt32LE(i + 12);
    if (id === 'data') return { pcm: buf.slice(i + 8, i + 8 + size), rate };
    i += 8 + size + (size & 1);
  }
  throw new Error('gcloud החזיר WAV בלי data');
}
async function synthGcloud(ffmpeg, text) {
  for (let attempt = 0; attempt < 6; attempt++) {
    spendGate('cloud-tts', [text]);
    const r = await fetch(GCLOUD, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({ input: { text }, voice: { languageCode: 'he-IL', name: VOICE },
                             audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000, speakingRate: 1.0, pitch: 0 } })
    });
    if (r.status === 429 || r.status >= 500) {
      PACE.ok = 0; PACE.gap = Math.min(PACE.max, Math.round(PACE.gap * 1.5));
      const body = await r.text();
      if (attempt === 5) throw new Error('gcloud ' + r.status + ' ' + body.replace(/\s+/g, ' ').slice(0, 160));
      await sleep(PACE.gap); continue;
    }
    if (!r.ok) {
      const body = await r.text(); let msg = body;
      try { msg = JSON.parse(body).error.message; } catch (e) {}
      throw new Error('gcloud ' + r.status + ' ' + String(msg).replace(/\s+/g, ' ').slice(0, 160));
    }
    const j = await r.json();
    spendAdd('cloud-tts', [text]);
    if (!j.audioContent) throw new Error('gcloud החזיר תשובה בלי אודיו');
    if (++PACE.ok >= 8) { PACE.ok = 0; PACE.gap = Math.max(PACE.min, Math.round(PACE.gap * 0.8)); }
    const w = wavToPcm(Buffer.from(j.audioContent, 'base64'));
    return pcmToMp3(ffmpeg, w.pcm, w.rate);
  }
  throw new Error('gcloud — שש פעמים בלי אודיו');
}

async function build(app, max) {
  const c = corpus(app);
  if (!c) { console.log('✗ ' + app + ' — אין מאגר קבוע להקלטה'); return 1; }
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) { console.log('✗ אין ffmpeg — FFMPEG=<נתיב> או ffmpeg ב-PATH'); return 1; }
  if (!QUALITY.probeOk()) { console.log('✗ אין ffprobe — FFPROBE=<נתיב> או ffprobe ב-PATH (בלעדיו אין בדיקת קצב)'); return 1; }
  if (!KEY) { console.log('✗ חסר ' + (PROVIDER === 'gcloud' ? 'TTS_KEY' : 'GEMINI_API_KEY')); return 1; }
  /* קול אחד לאפליקציה: ערבוב שני קולות נשמע כמו שני קריינים באותה
     שאלה. החלפת קול באפליקציה שיש בה הקלטות עדיין אינה נתמכת —
     עוצרים בלי למחוק דבר. אפליקציה בלי קבצים מוקלטת בקול הנוכחי,
     והוא שנרשם במניפסט (גם אם המניפסט הריק נשא קול אחר). */
  const m = readManifest(app);
  const have = onDisk(app);
  const oldVoice = m && m.voice;
  if (have.size && oldVoice !== VOICE) {
    console.log('✗ ' + app + ' הוקלטה בקול ' + (oldVoice || 'לא ידוע') + ' ועכשיו מבקשים ' + VOICE +
                '. החלפת קול באפליקציה עם הקלטות עדיין אינה נתמכת; אף קובץ לא נמחק.' +
                (oldVoice ? ' להמשך בקול הקיים: TTS_VOICE=' + oldVoice : ' חסר מניפסט תקין: node .claude/qa/record.js --manifest ' + app));
    return 1;
  }
  const liveVoice = have.size ? oldVoice : VOICE;
  const attempts = QUALITY.loadAttempts(dirOf(app));
  const current = id => QUALITY.ready(path.join(dirOf(app), LANG, id + '.mp3'), KBPS);
  /* קודם משדרגים קליפים קיימים שמתחת ליעד, אחר כך ממלאים חסרים.
     קליפ שמיצה MAX_TRIES ניסיונות יוצא מהתור (attempts.json). */
  const all = [...c].filter(([id]) => !current(id));
  const candidates = all.filter(([id]) => !QUALITY.exhausted(attempts, id));
  if (all.length > candidates.length) console.log('  מוצו ' + (all.length - candidates.length) + ' קליפים (' + QUALITY.MAX_TRIES + ' ניסיונות) — מחוץ לתור, ראו ' + app + '/audio/attempts.json');
  candidates.sort((a, b) => Number(have.has(b[0])) - Number(have.has(a[0])));
  const todo = candidates.slice(0, max);
  const installed = new Set();
  const outDir = path.join(dirOf(app), LANG);
  fs.mkdirSync(outDir, { recursive: true });
  console.log(app + ': ' + c.size + ' מחרוזות · מוקלטות ' + have.size + ' · בריצה הזאת עד ' + todo.length +
              ' · ספק ' + PROVIDER + ' · מודל ' + (BATCH ? MODELS.join('+') : MODEL) + ' · קול ' + VOICE);
  let made = 0, failed = 0, quota = false, requests = 0;
  const t0 = Date.now();
  if (BATCH && PROVIDER !== 'gcloud') {
    /* --- מצב אצווה --- */
    const batches = [];
    let cur = [], curChars = 0, curSec = 0;
    for (const [id, text] of todo) {
      const sec = text.length / 11 + 2.2;
      if (cur.length && (cur.length >= BATCH_SIZE || curChars + text.length > BATCH_MAX_CHARS || curSec + sec > BATCH_MAX_SEC)) {
        batches.push(cur); cur = []; curChars = 0; curSec = 0;
      }
      cur.push([id, text]); curChars += text.length; curSec += sec;
    }
    if (cur.length) batches.push(cur);
    console.log('  אצווה: ' + batches.length + ' בקשות מתוכננות (עד ' + BATCH_SIZE + ' מחרוזות לבקשה) · מודלים: ' + MODELS.join(' + '));
    /* אצווה שהפיצול שלה לא תקף מתחלקת פעם אחת לשניים ומנסה שוב —
       ככה אצווה ארוכה מדי לא נתקעת על אותה צורה כל יום. מקטע שכבר
       נכתב בריצה הזאת לא נכתב שוב (אותה תוכנית, אותו קובץ). */
    const doBatch = async (batch, model, depth) => {
      requests++;
      const pcm = await synthBatch(model, batch.map(x => H.spoken(x[1])));
      const segs = splitBatch(ffmpeg, pcm, 24000, batch.length);
      if (segs) {
        for (let i = 0; i < batch.length; i++) {
          const f = path.join(outDir, batch[i][0] + '.mp3');
          if (installed.has(batch[i][0]) || current(batch[i][0])) continue;
          /* קליפ שנדחה נספר ככישלון אחד, ואינו מפיל את שאר האצווה */
          try { QUALITY.install(f, segs[i], KBPS, ffmpeg); }
          catch (e) { failed++; QUALITY.fail(attempts, batch[i][0], e.message); console.log('  ✗ ' + batch[i][0] + ' ' + e.message); continue; }
          installed.add(batch[i][0]); delete attempts[batch[i][0]];
          made++;
        }
        console.log('  ' + made + '/' + todo.length + ' · בקשה ' + requests + ' (' + model + ') · ' + Math.round((Date.now() - t0) / 1000) + 'ש');
        return;
      }
      if (batch.length > 1 && depth < 6) {
        /* שרשרת חלוקה (29.9): 40 → 20 → 10 → 5 → 2 → 1. כישלון פיצול
           כבר שילם בקשה — אין שחרור לפני שמגיעים למחרוזת בודדת. */
        const half = Math.ceil(batch.length / 2);
        console.log('  הפיצול לא החזיר ' + batch.length + ' מקטעים — מתחלק לשתי אצוות ומנסה שוב (עומק ' + (depth + 1) + ')');
        await doBatch(batch.slice(0, half), model, depth + 1);
        await doBatch(batch.slice(half), model, depth + 1);
        return;
      }
      if (batch.length === 1) {
        /* נתיב אחרון: הקלטה ישירה של מחרוזת בודדת, בלי אצווה ובלי
           פיצול בכלל. שגיאת מכסה עולה ללולאה הראשית כרגיל. */
        try {
          requests++;
          const mp3 = PROVIDER === 'gcloud' ? await synthGcloud(ffmpeg, H.spoken(batch[0][1])) : await synth(ffmpeg, H.spoken(batch[0][1]));
          if (mp3.length >= MIN_BYTES) {
            const f = path.join(outDir, batch[0][0] + '.mp3');
            if (!installed.has(batch[0][0]) && !current(batch[0][0])) { QUALITY.install(f, mp3, KBPS, ffmpeg); installed.add(batch[0][0]); delete attempts[batch[0][0]]; made++; }
            console.log('  ' + made + '/' + todo.length + ' · מחרוזת בודדת אחרי כישלון פיצול (' + model + ')');
            return;
          }
        } catch (e2) {
          if (e2 instanceof QuotaError || e2 instanceof BudgetError || /429|RESOURCE_EXHAUSTED|quota/i.test(e2.message)) throw e2;
          QUALITY.fail(attempts, batch[0][0], e2.message);
        }
      }
      /* מחרוזת בודדת שגם ההקלטה הישירה שלה נכשלה — נספרת לה. אצווה
         שלמה שנכשלה אינה נספרת לכל אחת מ-40 המחרוזות: זו לא אשמתן. */
      if (batch.length === 1 && !attempts[batch[0][0]]) QUALITY.fail(attempts, batch[0][0], 'split');
      failed += batch.length;
      console.log('  ✗ אצווה של ' + batch.length + ' הושחרת: הפיצול לא החזיר ' + batch.length + ' מקטעים (יוקלטו בריצה אחרת)');
    };
    const tired = new Set();
    for (const batch of batches) {
      const model = MODELS.find(m => !tired.has(m));
      if (!model) { quota = true; STOPPED = 'quota'; console.log('  כל המודלים נגמרו להיום. מה שנכתב נשמר; הרצה מחר ממשיכה.'); break; }
      try {
        await doBatch(batch, model, 0);
      } catch (e) {
        if (e instanceof BudgetError) { quota = true; STOPPED = 'budget'; console.log('  ' + e.message + ' — עוצרים. מה שנכתב נשמר.'); break; }
        if (e instanceof QuotaError || /429|RESOURCE_EXHAUSTED|quota/i.test(e.message)) {
          tired.add(model);
          console.log('  מכסת ' + model + ' נגמרה (' + e.message.slice(0, 100) + ') — עוברים למודל הבא');
          /* אותה אצווה תנסה שוב עם המודל הבא בסיבוב */
          batches.unshift(batch);
          continue;
        }
        failed += batch.length;
        console.log('  ✗ אצווה נכשלה: ' + e.message.slice(0, 140));
      }
      await sleep(3000);
    }
    QUALITY.saveAttempts(dirOf(app), attempts);
    const n = writeManifest(app, liveVoice);
    console.log('\nנוצרו ' + made + ', נכשלו/הושחרו ' + failed + ' · בקשות ' + requests + ' · במניפסט ' + n + ' · ' +
                Math.round((Date.now() - t0) / 60000) + ' דק׳');
    return quota && !made ? 1 : 0;
  }
  /* --- מצב רגיל: בקשה לכל מחרוזת --- */
  for (const [id, text] of todo) {
    try {
      const mp3 = PROVIDER === 'gcloud' ? await synthGcloud(ffmpeg, H.spoken(text)) : await synth(ffmpeg, H.spoken(text));
      if (mp3.length < MIN_BYTES) throw new Error('קובץ ריק');
      QUALITY.install(path.join(outDir, id + '.mp3'), mp3, KBPS, ffmpeg);
      delete attempts[id];
      made++;
      if (made % 10 === 0) console.log('  ' + made + '/' + todo.length + ' · ' + Math.round((Date.now() - t0) / 1000) + 'ש · מרווח ' + PACE.gap + 'ms');
    } catch (e) {
      if (e instanceof BudgetError) { quota = true; STOPPED = 'budget'; console.log('  ' + e.message + ' — עוצרים. מה שנכתב נשמר.'); break; }
      failed++;
      console.log('  ✗ ' + id + ' ' + e.message.slice(0, 140));
      if (!/429|RESOURCE_EXHAUSTED|quota/i.test(e.message)) QUALITY.fail(attempts, id, e.message);
      if (/429|RESOURCE_EXHAUSTED|quota/i.test(e.message)) { quota = true; STOPPED = 'quota'; console.log('  המכסה נגמרה. מה שנכתב נשמר; הרצה חוזרת תמשיך מכאן.'); break; }
    }
    await sleep(PACE.gap);
  }
  QUALITY.saveAttempts(dirOf(app), attempts);
  const n = writeManifest(app, liveVoice);
  console.log('\nנוצרו ' + made + ', נכשלו ' + failed + ' · במניפסט ' + n + ' · ' +
              Math.round((Date.now() - t0) / 60000) + ' דק׳');
  return quota && !made ? 1 : 0;
}

/* --- main --------------------------------------------------------- */
(async () => {
  const args = process.argv.slice(2);
  const maxI = args.indexOf('--max');
  const max = maxI >= 0 ? Math.max(1, parseInt(args[maxI + 1], 10) || 300) : 300;
  const apps = args.includes('--all') ? Object.keys(SOURCES)
    : args.filter(a => !a.startsWith('--') && !(maxI >= 0 && a === args[maxI + 1]));
  if (args.includes('--check')) {
    const bad = check();
    console.log(bad ? '\n' + bad + ' אפליקציות עם מניפסט שאינו תואם לדיסק' : '\nהשכבה המוקלטת: המניפסטים תואמים לדיסק');
    process.exit(bad ? 1 : 0);
  }
  if (args.includes('--manifest')) {
    for (const app of apps.length ? apps : Object.keys(SOURCES)) console.log(app + ': ' + writeManifest(app) + ' במניפסט');
    process.exit(0);
  }
  /* קליפים קיימים שעדיין מתחת ל-KBPS ולא מיצו את הניסיונות */
  const pending = app => {
    const a = QUALITY.loadAttempts(dirOf(app));
    return [...onDisk(app)].filter(id => !QUALITY.exhausted(a, id) &&
      !QUALITY.ready(path.join(dirOf(app), LANG, id + '.mp3'), KBPS));
  };
  if (args.includes('--next') || args.includes('--pending')) {
    if (!QUALITY.probeOk()) { console.error('✗ אין ffprobe — אי אפשר לבדוק קצב'); process.exit(1); }
  }
  /* --pending <app>: כמה קליפים קיימים ממתינים לשדרוג (ל-MAX של record.yml) */
  if (args.includes('--pending')) { console.log(pending(apps[0] || 'english').length); process.exit(0); }
  /* --next: האפליקציה שהכי הרבה חסר בה — לריצה המתוזמנת, שאין לה קלט */
  if (args.includes('--next')) {
    /* קודם משדרגים את הקליפים הקיימים של אנגלית ל-KBPS, ואז התור הכללי.
       קליפ שמיצה את הניסיונות אינו נספר, ולכן אינו יכול לנעול את התור. */
    if (pending('english').length) { console.log('english'); process.exit(0); }
    let best = null, most = -1;
    for (const app of Object.keys(SOURCES)) {
      const c = corpus(app), a = QUALITY.loadAttempts(dirOf(app));
      const missing = [...c.keys()].filter(x => !QUALITY.exhausted(a, x) &&
        !QUALITY.ready(path.join(dirOf(app), LANG, x + '.mp3'), KBPS)).length;
      if (missing > most) { most = missing; best = app; }
    }
    console.log(most > 0 ? best : '');
    process.exit(0);
  }
  if (args.includes('--plan') || !apps.length) { plan(apps.length ? apps : Object.keys(SOURCES)); process.exit(0); }
  let code = 0;
  for (const app of apps) {
    if (STOPPED) { console.log('· ' + app + ' — דילוג (' + (STOPPED === 'budget' ? 'תקרת ההוצאה' : 'המכסה') + ')'); continue; }
    code = Math.max(code, await build(app, max));
  }
  process.exit(code);
})();
