/* =====================================================================
   record-safety.js — ההקלטה אינה מוחקת, אינה ננעלת ואינה נופלת על gcloud
     node .claude/qa/record-safety.js

   **למה זה קיים.** record.js רץ לבד ב-Actions (record.yml) ודוחף
   ל-main. ארבעה באגים נמצאו 30.9.2026 בשינוי שהוסיף את שדרוג
   האיכות (record-quality.js), ואף אחד מהם לא נראה בלי ריצה אמיתית:
     1. מניפסט ריק נושא קול ישן → הריצה הראשונה מקליטה בקול החדש
        ורושמת את הישן → הריצה השנייה נחסמת.
     2. Cloud TTS מחזיר MP3 ב-32k, והיעד 64 → כל קליפ gcloud נדחה.
     3. קליפ אחד שנדחה באצווה מפיל את שאר האצווה.
     4. קליפ שנכשל תמיד נועל את --next על אנגלית לתמיד.
   ועוד אחד: שגיאת מכסה אינה נספרת כניסיון שנכשל.

   **איך.** עץ זמני עם record.js, record-quality.js ושני המודולים
   שהם טוענים; ffmpeg ו-ffprobe מדומים (סקריפטים שכותבים ״MP3״ עם
   הקצב בתוכו); fetch מדומה (node -r) ל-Gemini ול-Cloud TTS. אין רשת,
   אין מפתח, והתיקיות האמיתיות של האודיו אינן נגעות.
   RECORD_SRC=<תיקייה> מריץ את התרחישים על record.js אחר (ההוכחה האדומה).
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');
const QA = __dirname, ROOT = path.resolve(QA, '..', '..');
const SRC = process.env.RECORD_SRC ? path.resolve(process.env.RECORD_SRC) : QA;
require(path.join(ROOT, 'speech', 'recorded.js'));
const R = globalThis.RECORDED;

const BASE = fs.mkdtempSync(path.join(os.tmpdir(), 'record-safety-'));
const BIN = path.join(BASE, 'bin');
fs.mkdirSync(BIN);

/* --- ffmpeg / ffprobe / fetch מדומים ------------------------------ */
fs.writeFileSync(path.join(BIN, 'ffmpeg'), `#!/usr/bin/env node
const fs = require('fs'); const a = process.argv.slice(2);
if (a.includes('-version')) { console.log('ffmpeg fake'); process.exit(0); }
const inp = a[a.indexOf('-i') + 1]; const src = fs.readFileSync(inp);
if (a.includes('-af')) {                         /* silencedetect: שקט בסוף כל שנייה */
  const rate = src.readUInt32LE(24), dur = (src.length - 44) / 2 / rate;
  let e = ''; for (let i = 0; i < Math.floor(dur) - 1; i++) e += 'silence_start: ' + (i + 0.9) + '\\nsilence_end: ' + (i + 1) + '\\n';
  process.stderr.write(e); process.exit(0);
}
if (a.includes('null')) {                        /* בדיקת פענוח */
  if (src.includes('CORRUPT')) { process.stderr.write('corrupt frame'); process.exit(1); }
  process.exit(0);
}
const kb = (a[a.indexOf('-b:a') + 1] || '0k').replace('k', '');
const ss = a.includes('-ss') ? a[a.indexOf('-ss') + 1] : null;
const bad = src.includes('CORRUPT') || (ss && ss === process.env.FAKE_BAD_SS);
const body = Buffer.from('FAKEMP3 kbps=' + kb + ' ' + (bad ? 'CORRUPT ' : ''));
fs.writeFileSync(a[a.length - 1], Buffer.concat([body, Buffer.alloc(900 - body.length, 46)]));
`);
fs.writeFileSync(path.join(BIN, 'ffprobe'), `#!/usr/bin/env node
const fs = require('fs'); const a = process.argv.slice(2);
if (a.includes('-version')) { console.log('ffprobe fake'); process.exit(0); }
const m = /kbps=(\\d+)/.exec(fs.readFileSync(a[a.length - 1]).toString('latin1'));
if (!m) process.exit(1);
console.log(Number(m[1]) * 1000);
`);
for (const f of ['ffmpeg', 'ffprobe']) fs.chmodSync(path.join(BIN, f), 0o755);
const PRE = path.join(BIN, 'fake-fetch.js');
fs.writeFileSync(PRE, `
const pcm = (sec, head) => { const b = Buffer.alloc(Math.round(sec * 48000), 1); if (head) b.write(head, 0); return b; };
const wav = p => { const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + p.length, 4); h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(24000, 24);
  h.writeUInt32LE(48000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(p.length, 40);
  return Buffer.concat([h, p]); };
const ok = j => ({ status: 200, ok: true, json: async () => j, text: async () => JSON.stringify(j) });
const realTimeout = globalThis.setTimeout;
globalThis.setTimeout = f => setImmediate(f);
globalThis.fetch = async (url, o) => {
  const b = JSON.parse(o.body);
  if (process.env.FAKE_DELAY) await new Promise(r => realTimeout(r, Number(process.env.FAKE_DELAY)));
  if (process.env.FAKE_QUOTA) return { status: 429, ok: false, text: async () => 'RESOURCE_EXHAUSTED' };
  if (/texttospeech/.test(url)) {
    const enc = b.audioConfig.audioEncoding;
    /* Cloud TTS: MP3 חוזר ב-32k; LINEAR16 חוזר כ-WAV */
    const out = enc === 'MP3' ? Buffer.concat([Buffer.from('FAKEMP3 kbps=32 '), Buffer.alloc(900, 46)]) : wav(pcm(1));
    return ok({ audioContent: out.toString('base64') });
  }
  const text = b.contents[0].parts[0].text;
  const k = /את (\\d+) הפריטים/.test(text) ? Number(/את (\\d+) הפריטים/.exec(text)[1]) : 0;
  /* ״Model tried to generate text״ (ריצה 30): משפט שנראה כמו שאלה נדחה, אלא אם יש לפניו הוראת הקראה */
  if (process.env.FAKE_TEXTGEN && !k && text.includes('שאלה') && !/^הקרא בקול ברור את המשפט/.test(text))
    return { status: 400, ok: false, text: async () => JSON.stringify({ error: { message: 'Model tried to generate text, but it should only be used for TTS.' } }) };
  const data = k ? pcm(k) : pcm(1, text.includes('תקול') ? 'CORRUPT' : '');
  const usage = process.env.FAKE_USAGE ? { usageMetadata: { promptTokenCount: 1000, candidatesTokenCount: 50000 } } : {};
  return ok(Object.assign({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/L16;rate=24000', data: data.toString('base64') } }] } }] }, usage));
};
`);

/* --- עץ זמני ------------------------------------------------------ */
const APPS = ['english', 'history', 'ulpan', 'civics', 'literature', 'tanakh', 'hebrew-arab', 'islam'];
function tree(name, strings) {
  const T = path.join(BASE, name);
  for (const [rel, from] of [['.claude/qa/record.js', SRC], ['.claude/qa/record-quality.js', SRC],
                             ['speech/recorded.js', path.join(ROOT, 'speech')], ['tutor/he-speech.js', path.join(ROOT, 'tutor')]]) {
    fs.mkdirSync(path.dirname(path.join(T, rel)), { recursive: true });
    fs.copyFileSync(path.join(from, path.basename(rel)), path.join(T, rel));
  }
  for (const a of APPS) {
    fs.mkdirSync(path.join(T, a), { recursive: true });
    fs.writeFileSync(path.join(T, a, 'index.html'), (strings[a] || []).map(s => '{he:"' + s + '"}').join('\n'));
  }
  fs.mkdirSync(path.join(T, 'hebrew'), { recursive: true });
  fs.writeFileSync(path.join(T, 'hebrew', 'bank.json'), '{}');
  fs.mkdirSync(path.join(T, 'lomda', 'data'), { recursive: true });
  return T;
}
function manifest(T, app, voice, ids) {
  fs.mkdirSync(path.join(T, app, 'audio', 'he'), { recursive: true });
  fs.writeFileSync(path.join(T, app, 'audio', 'manifest.json'),
    JSON.stringify({ voice, model: 'x', kbps: 32, langs: { he: { count: ids.length, ids } } }));
}
function clip(T, app, text, kbps) {
  const f = path.join(T, app, 'audio', 'he', R.id(text) + '.mp3');
  fs.writeFileSync(f, Buffer.concat([Buffer.from('FAKEMP3 kbps=' + kbps + ' '), Buffer.alloc(900, 46)]));
  return f;
}
function run(T, args, env) {
  const r = spawnSync(process.execPath, ['-r', PRE, path.join(T, '.claude/qa/record.js')].concat(args), {
    cwd: T, encoding: 'utf8', timeout: 60000,
    env: Object.assign({}, process.env, { FFMPEG: path.join(BIN, 'ffmpeg'), FFPROBE: path.join(BIN, 'ffprobe'),
      GEMINI_API_KEY: 'fake', TTS_KEY: 'fake', TTS_BATCH: '', TTS_PROVIDER: '', TTS_VOICE: 'Kore' }, env || {}) });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}
const kbpsOf = f => { const m = fs.existsSync(f) && /kbps=(\d+)/.exec(fs.readFileSync(f).toString('latin1')); return m ? +m[1] : 0; };
const attemptsOf = (T, app) => { try { return JSON.parse(fs.readFileSync(path.join(T, app, 'audio', 'attempts.json'), 'utf8')); } catch (e) { return {}; } };

let bad = 0;
function check(name, ok, detail) { console.log((ok ? '✓ ' : '✗ ') + name + (ok ? '' : ' — ' + detail)); if (!ok) bad++; }
const S = ['שלום לכולם היום', 'אנחנו לומדים יחד', 'זה משפט שלישי'];

/* 1. אפליקציה ריקה, מניפסט בקול Gacrux, מקליטים בקול Kore */
{
  const T = tree('voice', { english: S });
  manifest(T, 'english', 'Gacrux', []);
  const r1 = run(T, ['english', '--max', '1']);
  const m = JSON.parse(fs.readFileSync(path.join(T, 'english', 'audio', 'manifest.json'), 'utf8'));
  check('1א. דיסק ריק: המניפסט רושם את הקול שבו הוקלט (Kore)', m.voice === 'Kore', 'נרשם ' + m.voice + ' · ' + r1.out.slice(-160));
  const r2 = run(T, ['english', '--max', '5']);
  check('1ב. הריצה השנייה באותו קול אינה נחסמת', r2.code === 0 && !/✗ english/.test(r2.out), 'יציאה ' + r2.code + ' · ' + r2.out.split('\n').find(l => /✗/.test(l)));
  const r3 = run(T, ['english', '--max', '5'], { TTS_VOICE: 'Charon' });
  const still = S.every(s => fs.existsSync(path.join(T, 'english', 'audio', 'he', R.id(s) + '.mp3')));
  check('1ג. קול אחר על אפליקציה מוקלטת: עוצר ואף קובץ לא נמחק', r3.code === 1 && still, 'יציאה ' + r3.code + ', כל הקבצים קיימים: ' + still);
}

/* 2. gcloud: הקליפ נכתב ביעד (64k) ולא נדחה */
{
  const T = tree('gcloud', { english: S.slice(0, 2) });
  manifest(T, 'english', 'he-IL-Chirp3-HD-Kore', []);
  const r = run(T, ['english', '--max', '2'], { TTS_PROVIDER: 'gcloud', TTS_VOICE: 'he-IL-Chirp3-HD-Kore' });
  const rates = S.slice(0, 2).map(s => kbpsOf(path.join(T, 'english', 'audio', 'he', R.id(s) + '.mp3')));
  check('2. gcloud: שני הקליפים נכתבו ב-64k', rates.every(k => k === 64), 'קצבים ' + rates.join(',') + ' · ' + r.out.split('\n').filter(l => /✗/.test(l)).slice(0, 2).join(' | '));
}

/* 3. אצווה: מקטע אחד פגום אינו מפיל את השאר */
{
  const T = tree('batch', { english: S });
  manifest(T, 'english', 'Kore', []);
  const r = run(T, ['english', '--max', '3', '--batch'], { FAKE_BAD_SS: '1.00' });
  const have = S.map(s => fs.existsSync(path.join(T, 'english', 'audio', 'he', R.id(s) + '.mp3')));
  check('3א. אצווה של 3 עם מקטע פגום באמצע: הראשון והשלישי נכתבו', have[0] && !have[1] && have[2], 'קיימים ' + have.join(',') + ' · ' + r.out.split('\n').filter(l => /✗/.test(l)).slice(0, 2).join(' | '));
  check('3ב. המקטע הפגום נספר ניסיון אחד', (attemptsOf(T, 'english')[R.id(S[1])] || {}).n === 1, JSON.stringify(attemptsOf(T, 'english')));
}

/* 4. קליפ אנגלית שנכשל תמיד אינו נועל את --next */
{
  const broken = 'משפט תקול שאינו מתפענח';
  const T = tree('queue', { english: [broken, S[0]], history: ['היסטוריה של העם', 'עוד משפט בהיסטוריה'] });
  manifest(T, 'english', 'Kore', [R.id(broken)]);
  clip(T, 'english', broken, 32);
  manifest(T, 'history', 'Kore', []);
  const picks = [];
  for (let i = 0; i < 5; i++) {
    const app = run(T, ['--next']).out.trim().split('\n').pop();
    picks.push(app);
    if (app !== 'english') break;
    run(T, ['english', '--max', '5']);
  }
  const old = kbpsOf(path.join(T, 'english', 'audio', 'he', R.id(broken) + '.mp3'));
  check('4א. אחרי 3 כישלונות --next עובר לאפליקציה אחרת', picks.includes('history') && picks.indexOf('history') <= 3, 'בחירות: ' + picks.join(' → '));
  check('4ב. הקליפ הישן (32k) נשאר מנגן לאורך כל הניסיונות', old === 32, 'קצב ' + old);
}

/* 5. שגיאת מכסה אינה נספרת */
{
  const T = tree('quota', { english: S.slice(0, 1) });
  manifest(T, 'english', 'Kore', []);
  for (let i = 0; i < 3; i++) run(T, ['english', '--max', '1'], { FAKE_QUOTA: '1' });
  const n = (attemptsOf(T, 'english')[R.id(S[0])] || {}).n || 0;
  const app = run(T, ['--next']).out.trim().split('\n').pop();
  check('5. שלוש ריצות 429: אין ניסיון שנספר, והמחרוזת עדיין בתור', n === 0 && app === 'english', 'ניסיונות ' + n + ', --next ' + app);
}

/* 6. תקרת ההוצאה (הבעלים, 2.10.2026: ״עלות מקסימלית $25״). מחרוזת
   של 16 תווים ב-Pro עולה באומדן כ-$0.00094 — תקרה של $0.0015 מרשה
   בקשה אחת בלבד, ו---all אינו ממשיך לאפליקציה הבאה. */
{
  const T = tree('budget', { english: S, history: ['היסטוריה של העם', 'עוד משפט בהיסטוריה'] });
  manifest(T, 'english', 'Kore', []); manifest(T, 'history', 'Kore', []);
  const r = run(T, ['--all', '--max', '5'], { TTS_BUDGET_USD: '0.0015', GEMINI_TTS_MODEL: 'gemini-2.5-pro-preview-tts' });
  const made = S.filter(s => fs.existsSync(path.join(T, 'english', 'audio', 'he', R.id(s) + '.mp3'))).length;
  const hist = fs.existsSync(path.join(T, 'history', 'audio', 'he')) ? fs.readdirSync(path.join(T, 'history', 'audio', 'he')).length : 0;
  let sp = {}; try { sp = JSON.parse(fs.readFileSync(path.join(T, '.claude/qa/record-spend.json'), 'utf8')); } catch (e) {}
  check('6א. תקרה של בקשה אחת: קובץ אחד, ההיסטוריה לא נגעה, ההוצאה נרשמה מתחת לתקרה',
        made === 1 && hist === 0 && sp.requests === 1 && sp.usd > 0 && sp.usd <= 0.0015,
        'נוצרו ' + made + ', היסטוריה ' + hist + ', ' + JSON.stringify(sp) + ' · ' + r.out.split('\n').filter(l => /תקרת|✗/.test(l)).slice(0, 2).join(' | '));
  /* ההוצאה נספרת לפי usageMetadata כשהיא קיימת: 1,000 קלט + 50,000 פלט ב-Pro = $1.001 */
  const T2 = tree('usage', { english: S });
  manifest(T2, 'english', 'Kore', []);
  run(T2, ['english', '--max', '5'], { TTS_BUDGET_USD: '1.0005', FAKE_USAGE: '1', GEMINI_TTS_MODEL: 'gemini-2.5-pro-preview-tts' });
  let sp2 = {}; try { sp2 = JSON.parse(fs.readFileSync(path.join(T2, '.claude/qa/record-spend.json'), 'utf8')); } catch (e) {}
  check('6ב. המחיר נרשם מהאסימונים האמיתיים, והבקשה שאחריה נחסמת', sp2.usd === 1.001 && sp2.requests === 1, JSON.stringify(sp2));
}

/* 7. עצירה בזמן (ריצה 27, 3.10.2026): SIGINT באמצע ריצה — הקבצים שכבר
   נוצרו נכנסים למניפסט, ההוצאה רשומה, והריצה אינה ממשיכה לבקשה הבאה.
   כל בקשה מדומה לוקחת 400ms; SIGINT אחרי 1.5 שניות. */
{
  const many = Array.from({ length: 12 }, (_, i) => 'משפט מספר ' + i + ' לבדיקה');
  const T = tree('time', { english: many });
  manifest(T, 'english', 'Kore', []);
  const r = spawnSync(process.execPath, ['-r', PRE, path.join(T, '.claude/qa/record.js'), 'english', '--max', '12'], {
    cwd: T, encoding: 'utf8', timeout: 1500, killSignal: 'SIGINT',
    env: Object.assign({}, process.env, { FFMPEG: path.join(BIN, 'ffmpeg'), FFPROBE: path.join(BIN, 'ffprobe'),
      GEMINI_API_KEY: 'fake', TTS_BATCH: '', TTS_PROVIDER: '', TTS_VOICE: 'Kore', FAKE_DELAY: '400' }) });
  const out = (r.stdout || '') + (r.stderr || '');
  const disk = fs.readdirSync(path.join(T, 'english', 'audio', 'he')).filter(f => f.endsWith('.mp3')).length;
  let m = {}; try { m = JSON.parse(fs.readFileSync(path.join(T, 'english', 'audio', 'manifest.json'), 'utf8')); } catch (e) {}
  const inMan = ((m.langs || {}).he || {}).count || 0;
  let sp = {}; try { sp = JSON.parse(fs.readFileSync(path.join(T, '.claude/qa/record-spend.json'), 'utf8')); } catch (e) {}
  check('7. SIGINT: מה שנוצר נכנס למניפסט, ההוצאה רשומה, ולא הוקלט הכול',
        disk > 0 && disk < 12 && inMan === disk && sp.requests >= disk && m.voice === 'Kore',
        'בדיסק ' + disk + ', במניפסט ' + inMan + ', ' + JSON.stringify(sp) + ' · ' + out.split('\n').slice(-3).join(' | '));
}

/* 8. ״Model tried to generate text״ (ריצה 30, 11 מתוך 200 ב-ulpan): המשפט
   שנדחה מוקלט בניסיון חוזר עם הוראת הקראה ונרשם ב-prompted.json; משפט
   רגיל נשלח בלי הוראה. */
{
  const ask = ['מה שאלה טובה לשאול היום', 'זה משפט רגיל לגמרי'];
  const T = tree('prompt', { english: ask });
  manifest(T, 'english', 'Kore', []);
  const r = run(T, ['english', '--max', '5'], { FAKE_TEXTGEN: '1' });
  const have = ask.map(s => fs.existsSync(path.join(T, 'english', 'audio', 'he', R.id(s) + '.mp3')));
  let pr = []; try { pr = JSON.parse(fs.readFileSync(path.join(T, 'english', 'audio', 'prompted.json'), 'utf8')); } catch (e) {}
  check('8. 400 ״generate text״: הוקלט עם הוראה ונרשם, והמשפט הרגיל בלי',
        have[0] && have[1] && pr.length === 1 && pr[0] === R.id(ask[0]) && !attemptsOf(T, 'english')[R.id(ask[0])],
        'קיימים ' + have.join(',') + ', prompted ' + JSON.stringify(pr) + ' · ' + r.out.split('\n').filter(l => /✗|↺/.test(l)).slice(0, 2).join(' | '));
}

fs.rmSync(BASE, { recursive: true, force: true });
console.log(bad ? '\n✗ ' + bad + ' תרחישים נפלו' : '\n✓ ההקלטה בטוחה: שמונה תרחישים');
process.exit(bad ? 1 : 0);
