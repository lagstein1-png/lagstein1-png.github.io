/* =====================================================================
   audio-size.js — תקרת הגודל של מאגרי הקול, ומי יושב בכל אחד מהם.

     node .claude/qa/audio-size.js            טבלה מלאה
     node .claude/qa/audio-size.js --check    נופל על חריגה — נכנס ל-all.js

   **למה הכלי הזה נולד.** ב-7.10.2026 נמצא (O-191) שהאתר המפורסם
   שוקל 1.2GB מול מגבלת ה-1GB של GitHub Pages, וש-21,475 קובצי MP3
   נוספו בשבוע אחד בלי ששום דבר מדד גודל לפני שדחף. ‏`record.yml`
   מוסיף הקלטות כל יום, ולכן תקרה שאין לה כלי תיחצה שוב — והפעם
   בריפו הקול.

   **למה שני מאגרים ולא אחד, בחשבון.** ‏`record.js --plan` ב-10.10.2026:
   25,102 מחרוזות, מוקלטות 20,073, חסרות 5,029. בדיסק 22,406 קבצים
   שוקלים 984MB — 44.9KB לקובץ — ולכן המאגר השלם הוא 1,143MB, מעל
   1,024. שני דליים מאוזנים יוצאים 572MB ו-571MB כשיושלמו.

   **הטבלה אינה כתובה כאן.** ‏`ON_2` שב-`speech/recorded.js` היא
   האמת — היא זו שנשלחת לדפדפן ובונה את הכתובת — והכלי גוזר אותה
   משם. שתי רשימות היו נפרדות ביום שאחד מהם ישתנה.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const CHECK = process.argv.includes('--check');

/* התקרה: 900MB לדלי. מגבלת Pages היא 1,024MB, והפער נשמר בכוונה —
   ריצת ההקלטה היומית מוסיפה בלי לשאול, ושער שנדלק ב-1,024 נדלק
   אחרי שהאתר כבר לא מתפרסם. */
const CEIL = 900;
const WARN = 750;

/* --- שתי הכתובות וה-origin שלהן, מ-recorded.js --- */
function hosts() {
  const src = fs.readFileSync(path.join(ROOT, 'speech', 'recorded.js'), 'utf8');
  const g = n => (src.match(new RegExp('var HOST_' + n + ' = "([^"]*)"')) || [, null])[1];
  const h1 = g(1), h2 = g(2);
  if (h1 === null || h2 === null) return null;
  const or = u => { try { return u ? new URL(u).origin : ''; } catch (e) { return '!' + u; } };
  return { h1: h1, h2: h2, origins: [...new Set([or(h1), or(h2)].filter(x => x))] };
}

/* --- ה-AUDIO של 41 קובצי sw.js --- */
function swAudio() {
  const out = {};
  const files = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name[0] !== '.')
    .map(d => path.join(d.name, 'sw.js'))
    .concat(['sw.js'])
    .filter(f => fs.existsSync(path.join(ROOT, f)));
  for (const f of files) {
    const m = fs.readFileSync(path.join(ROOT, f), 'utf8').match(/const AUDIO = "([^"]*)"/);
    out[f] = m ? m[1] : null;
  }
  return out;
}

/* --- מי בדלי 2: נגזר מ-recorded.js, לא כתוב כאן --- */
function bucket2() {
  const src = fs.readFileSync(path.join(ROOT, 'speech', 'recorded.js'), 'utf8');
  const m = src.match(/var ON_2 = \{([\s\S]*?)\};/);
  if (!m) return null;
  const out = {};
  for (const k of m[1].matchAll(/["']?([A-Za-z0-9_-]+)["']?\s*:\s*1/g)) out[k[1]] = 1;
  return out;
}

function mb(dir) {
  try { return Math.round(+execFileSync('du', ['-sk', dir], { encoding: 'utf8' }).split('\t')[0] / 1024); }
  catch (e) { return 0; }
}
function clips(dir) {
  try { return +execFileSync('bash', ['-c', `find ${JSON.stringify(dir)} -name '*.mp3' | wc -l`], { encoding: 'utf8' }).trim(); }
  catch (e) { return 0; }
}

const ON_2 = bucket2();
if (!ON_2) { console.log('✗ אין ON_2 ב-speech/recorded.js — הטבלה נגזרת ממנו ואין ממה לגזור'); process.exit(1); }

const rows = [];
for (const d of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name[0] === '.') continue;
  const a = path.join(ROOT, d.name, 'audio');
  if (!fs.existsSync(a)) continue;
  const n = clips(a);
  if (!n) continue;                      /* מניפסט בלבד — אין מה לשקול */
  rows.push({ app: d.name, mb: mb(a), n, b: ON_2[d.name] ? 2 : 1 });
}
rows.sort((x, y) => y.mb - x.mb);

const sum = b => rows.filter(r => r.b === b).reduce((s, r) => s + r.mb, 0);
const cnt = b => rows.filter(r => r.b === b).reduce((s, r) => s + r.n, 0);
const s1 = sum(1), s2 = sum(2);

if (!CHECK) {
  console.log('אפליקציה           דלי    MB   קליפים');
  for (const r of rows) console.log(r.app.padEnd(18) + String(r.b).padStart(3) + String(r.mb).padStart(6) + String(r.n).padStart(9));
  console.log('-'.repeat(44));
}
console.log(`דלי 1 (bekol-audio):  ${s1}MB · ${cnt(1)} קליפים · ${rows.filter(r => r.b === 1).length} אפליקציות`);
console.log(`דלי 2 (bekol-audio2): ${s2}MB · ${cnt(2)} קליפים · ${rows.filter(r => r.b === 2).length} אפליקציות`);

const bad = [];

/* ===== המתג מול ה-worker =====
   **זו הדריפט המסוכנת בכל המעבר.** ‏`recorded.js` בונה את הכתובת
   ו-41 קובצי ה-`sw.js` מחליטים אם המקור הזה בכלל נכנס למטמון. מי
   שהפך את `HOST_1` ושכח את ה-`sw.js` מקבל קול שעובד ברשת ומת
   אופליין — בלי שגיאה, בלי אזהרה, ובדיוק אצל מי שהתקין. */
const H = hosts();
if (!H) bad.push('אין HOST_1/HOST_2 ב-speech/recorded.js — הכתובת נגזרת משם');
else {
  for (const u of H.origins) if (u[0] === '!') bad.push(`כתובת קול שאינה חוקית ב-recorded.js — ${u.slice(1)}`);
  if (H.origins.length > 1)
    bad.push(`שני מקורות קול שונים (${H.origins.join(' , ')}), ול-sw.js יש מקום לאחד — ה-worker יפיל את השני`);
  const want = H.origins[0] || '';
  const sw = swAudio();
  const off = Object.keys(sw).filter(f => sw[f] !== want);
  if (off.length) {
    bad.push(`${off.length} מתוך ${Object.keys(sw).length} קובצי sw.js עם AUDIO שאינו "${want}" — הקול יעבוד ברשת וימות אופליין`);
    for (const f of off.slice(0, 6)) bad.push(`  ${f}: AUDIO = ${sw[f] === null ? 'אין' : '"' + sw[f] + '"'}`);
  } else {
    console.log(`· מקור הקול: ${want || 'מקומי'} — ${Object.keys(sw).length} קובצי sw.js תואמים`);
  }
}

for (const [b, s] of [[1, s1], [2, s2]]) {
  if (s > CEIL) bad.push(`דלי ${b} שוקל ${s}MB, התקרה ${CEIL}MB (מגבלת Pages 1024MB) — העבירו אפליקציה לדלי השני ב-ON_2 שב-speech/recorded.js`);
  else if (s > WARN) console.log(`· דלי ${b} ב-${s}MB, מעל סף האזהרה ${WARN}MB — ${CEIL - s}MB עד התקרה`);
}
if (bad.length) { for (const b of bad) console.log('✗ ' + b); process.exit(1); }
console.log(`✓ שני הדליים מתחת ל-${CEIL}MB`);
