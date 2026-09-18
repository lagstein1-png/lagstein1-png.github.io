/* =====================================================================
   קריינות לסרטונים — מופקת ב-Gemini TTS, קובץ לכל כתובית.

   **למה זה קיים, ולמה זה לא ״נחמד שיהיה״.** `README.md` הציע
   לפרסם את הסרטונים שקטים, בנימוק שרוב הצפיות בפייסבוק הן בלי
   קול. הבעלים תיקן 18.9.2026: ״אתה אולי לא זוכר את הקהל שלנו,
   אני זקוק לקריינות״. והוא צודק, וזה לא עניין של טעם:

   קהל היעד הוא **דיסלקציה, ADHD, עולים חדשים ונהגים מבוגרים**
   (`CLAUDE.md`, השורה הראשונה). סרטון על אפליקציה **שמקריאה**,
   שמוגש כטקסט שצריך לקרוא, מבקש בדיוק את הדבר שהקהל מתקשה בו —
   והוא גם סותר את המוצר בתוך חמש השניות הראשונות. כתוביות נשארות
   (כלל 1 של `video-scripts.md`), אבל הן אינן תחליף לקול.

   **למה דווקא כאן, אחרי ששלוש דרכים נכשלו.** `README.md` מתעד
   שלוש מדידות מאותו יום: הקולות הנוירליים של Edge — הפרוקסי
   מסרב ל-WebSocket (403); ההקראה של גוגל — הכתובת חסומה במדיניות
   הרשת; `espeak-ng` — קורא עברית בלי ניקוד כרצף עיצורים. כולן
   נמדדו **בסביבת הפיתוח**, וזו בדיוק הנקודה: **הרנרים של GitHub
   אינם חסומים** — זה כתוב ב-`CLAUDE.md` ועליו עומדים `live-check`
   ו-`deploy-tutor`. הקובץ הזה אינו רץ כאן; הוא רץ שם.

   **ולמה Gemini ולא ספק אחר:** המפתח כבר קיים כ-Secret
   (`GEMINI_API_KEY`, אותו מפתח של ברק), הוא בשכבה החינמית, והוא
   בצד שרת בלבד — ארבעת התנאים של סעיף 1 ב-`CLAUDE.md`. אין מפתח
   בריפו, ואין תלות חדשה: `fetch` מובנה ב-Node, ו-ffmpeg כבר נדרש
   ל-`audio.js`.

   **הקול הוא `Kore`** — אותו קול נשי שממנו הופקו 6,823 קובצי
   ההקראה בריפו הנפרד, זה שהבעלים שמע וביקש ״קול נשי עדין כמו
   בתאוריה מדברת״ (17.9.2026). אין כאן בחירה חדשה, יש המשך.

   **מה מוקרא:** שורות ה-`.srt` עצמן. הן נכתבו כדי להיקרא, הן
   מתוזמנות לצעד שעל המסך, ו-`audio.js` מניח כל קובץ בדיוק בזמן
   השורה שלו ומנמיך את המוזיקה בזמן שהקול מדבר. כלומר הטקסט כבר
   כתוב ומאושר — אין כאן תסריט חדש שאיש לא בדק.

     GEMINI_API_KEY=xxx node marketing/media/voice.js        כל הסרטונים
     GEMINI_API_KEY=xxx node marketing/media/voice.js reader  סרטון אחד
     node marketing/media/voice.js --check                    כיסוי, בלי רשת

   **ההרצה מתחדשת:** קובץ שכבר קיים אינו מופק שוב. נפלה באמצע —
   מריצים שוב והיא ממשיכה מאיפה שנעצרה.

   **ואחרי זה מריצים `audio.js`** — הוא זה שמערבל את הקבצים
   לתוך ה-mp4. `voice.js` רק כותב אותם.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');

const VID = path.join(__dirname, 'video');
const OUT = path.join(__dirname, 'voice');
const KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || '';
const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
const API = 'https://generativelanguage.googleapis.com/v1beta';
const VOICE = process.env.GEMINI_TTS_VOICE || 'Kore';
const KBPS = 32;                     /* מתיישר עם ההקלטות שבריפו הנפרד */
const GAP_MS = 400;                  /* נשימה בין פניות, כדי לא לדפוק במכסה */

/* ---- קריאת ה-srt ---------------------------------------------------
   שורה ב-srt היא שלושה חלקים: מספר, זמנים, וטקסט (אולי כמה שורות).
   המפריד הוא שורה ריקה. הטקסט מאוחד לשורה אחת — קריין אינו עוצר
   באמצע משפט רק מפני שהכתובית נשברה לשתי שורות על המסך. */
function srtRows(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const rows = [];
  for (const block of raw.split(/\n\s*\n/)) {
    const lines = block.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 3) continue;
    const n = parseInt(lines[0], 10);
    const t = /(\d+):(\d+):(\d+),(\d+) --> (\d+):(\d+):(\d+),(\d+)/.exec(lines[1]);
    if (!n || !t) continue;
    const at = (+t[1]) * 3600 + (+t[2]) * 60 + (+t[3]) + (+t[4]) / 1000;
    const to = (+t[5]) * 3600 + (+t[6]) * 60 + (+t[7]) + (+t[8]) / 1000;
    rows.push({ n, at, to, text: lines.slice(2).join(' ').trim() });
  }
  return rows;
}

function names() {
  if (!fs.existsSync(VID)) return [];
  return fs.readdirSync(VID).filter(f => f.endsWith('.srt'))
    .map(f => path.basename(f, '.srt')).sort();
}

/* ---- Gemini -------------------------------------------------------- */
function findFfmpeg() {
  for (const f of [process.env.FFMPEG, 'ffmpeg'].filter(Boolean)) {
    if (spawnSync(f, ['-version'], { encoding: 'utf8' }).status === 0) return f;
  }
  return null;
}

/* Gemini מחזיר PCM גולמי ולא mp3, ולכן ffmpeg. הקצב נקרא מה-mimeType
   ואינו מונח: תשובה ב-24000 שנכתבת כ-44100 נשמעת איטית ונמוכה. */
function pcmToMp3(ffmpeg, pcm, rate) {
  const base = path.join(os.tmpdir(), 'voice-' + process.pid + '-' + Math.random().toString(36).slice(2));
  const src = base + '.pcm', dst = base + '.mp3';
  fs.writeFileSync(src, pcm);
  try {
    const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y',
      '-f', 's16le', '-ar', String(rate), '-ac', '1', '-i', src,
      '-b:a', KBPS + 'k', dst], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error('ffmpeg: ' + String(r.stderr).slice(0, 160));
    return fs.readFileSync(dst);
  } finally {
    for (const f of [src, dst]) { try { fs.unlinkSync(f) } catch (e) { } }
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function speak(ffmpeg, text) {
  /* 429 הוא מכסה ולא תקלה — ממתינים ומנסים שוב, פעמיים. כל שאר
     השגיאות נזרקות מיד: ניסיון חוזר על 400 רק שורף מכסה. */
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(API + '/models/' + MODEL + ':generateContent?key=' + encodeURIComponent(KEY), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } }
        }
      })
    });
    if (r.status === 429 && attempt < 2) { await sleep(20000 * (attempt + 1)); continue }
    if (!r.ok) {
      const body = await r.text();
      let msg = body;
      try { msg = JSON.parse(body).error.message } catch (e) { }
      throw new Error('gemini ' + r.status + ' ' + String(msg).replace(/\s+/g, ' ').slice(0, 160));
    }
    const j = await r.json();
    const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
    const inline = parts.map(p => p.inlineData).filter(Boolean)[0];
    if (!inline || !inline.data) throw new Error('תשובה בלי אודיו');
    const rate = Number((/rate=(\d+)/.exec(inline.mimeType || '') || [])[1]) || 24000;
    return pcmToMp3(ffmpeg, Buffer.from(inline.data, 'base64'), rate);
  }
}

/* ---- כיסוי, בלי רשת ------------------------------------------------ */
function check() {
  let bad = 0, total = 0, have = 0, dirs = 0;
  for (const name of names()) {
    const rows = srtRows(path.join(VID, name + '.srt'));
    const dir = path.join(OUT, name);
    total += rows.length;
    if (!fs.existsSync(dir)) continue;
    dirs++;
    const got = rows.filter(r => ['mp3', 'wav', 'm4a', 'ogg']
      .some(x => fs.existsSync(path.join(dir, r.n + '.' + x)))).length;
    have += got;
    if (got === rows.length) { console.log(`✓ ${name.padEnd(20)} ${got}/${rows.length} שורות`) }
    else { bad++; console.log(`✗ ${name.padEnd(20)} ${got}/${rows.length} שורות — קריינות חלקית`) }
  }
  if (!dirs) {
    console.log(`· אין עדיין קריינות. ${names().length} סרטונים, ${total} שורות כתובית ממתינות.`);
    console.log('  הפקה: Actions → voice → Run workflow (דורש GEMINI_API_KEY).');
    return 0;
  }
  console.log(`\n${dirs} סרטונים עם קריינות, ${have} קובצי קול`);
  /* קריינות חלקית היא כשל: audio.js יערבל את מה שיש, והסרטון
     יֵצא מדבר בחציו ושותק בחציו — וזה נראה כמו תקלה ולא כמו בחירה. */
  return bad ? 1 : 0;
}

/* ---- הפקה ---------------------------------------------------------- */
async function build(only) {
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) { console.log('✗ אין ffmpeg — FFMPEG=<נתיב> או ffmpeg ב-PATH'); return 1 }
  if (!KEY) {
    console.log('✗ אין GEMINI_API_KEY בסביבה. הקובץ הזה אינו רץ בסביבת הפיתוח —');
    console.log('  הרשת כאן חסומה מול ספקי הדיבור. Actions → voice → Run workflow.');
    return 1;
  }
  let made = 0, skipped = 0, failed = 0;
  for (const name of names()) {
    if (only && name !== only) continue;
    const rows = srtRows(path.join(VID, name + '.srt'));
    const dir = path.join(OUT, name);
    fs.mkdirSync(dir, { recursive: true });
    for (const row of rows) {
      const dst = path.join(dir, row.n + '.mp3');
      if (fs.existsSync(dst)) { skipped++; continue }
      if (!row.text) continue;
      try {
        const mp3 = await speak(ffmpeg, row.text);
        fs.writeFileSync(dst, mp3);
        made++;
        console.log(`✓ ${name}/${row.n}  ${row.text.slice(0, 46)}`);
      } catch (e) {
        failed++;
        console.log(`✗ ${name}/${row.n}  ${e.message}`);
        /* מכסה שנגמרה תכשיל את כל השאר באותה הודעה. עוצרים, ומה
           שכבר נכתב נשמר — ההרצה הבאה תמשיך מכאן. */
        if (/RESOURCE_EXHAUSTED|quota|429/i.test(e.message)) {
          console.log('  המכסה נגמרה. מה שנכתב נשמר; הרצה חוזרת תמשיך מכאן.');
          console.log(`\nנוצרו ${made}, דולגו ${skipped}, נכשלו ${failed}`);
          return 1;
        }
      }
      await sleep(GAP_MS);
    }
  }
  console.log(`\nנוצרו ${made}, דולגו ${skipped}, נכשלו ${failed}`);
  return failed ? 1 : 0;
}

/* ---- main ---------------------------------------------------------- */
(async () => {
  const args = process.argv.slice(2);
  if (args.includes('--check')) { process.exit(check()) }
  const only = args.filter(a => !a.startsWith('--'))[0] || '';
  if (only && !names().includes(only)) {
    console.log(`✗ אין סרטון בשם ${only}. יש: ${names().join(', ')}`);
    process.exit(1);
  }
  process.exit(await build(only));
})();
