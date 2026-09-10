/* הפעלת ״עזרה מהמורה״ — צעד אחד במקום שבעה.

     node .claude/qa/enable-tutor.js https://tutor.xxx.workers.dev
     node .claude/qa/enable-tutor.js --off        # לכבות בחזרה

   למה כלי ולא רשימת הוראות: הפעלת הבוט אינה שינוי אחד אלא
   חמישה־עשר, וכולם חייבים לקרות יחד. כתובת בלי גרסת תנאים
   חדשה משאירה משתמשים בלי אישור מחדש; גרסת תנאים בלי מפתחות
   קאש משאירה אותם עם העותק הישן של `legal/`. `tutor.js` תופס
   את הראשון, `cache.js` את השני — אבל עדיף לא להגיע לשם.

   מה זה עושה, בסדר הזה:

     1. כותב את הכתובת ל-`tutor/tutor.js` → `var API`
     2. מעלה `LEGAL.version` מ-1.0 ל-1.1 — זה מה שמחייב את כל
        המשתמשים לקרוא ולאשר את התנאים מחדש, ומרגע הכתובת מידע
        מתחיל לצאת מהמכשיר
     3. מעלה את שלושה־עשר מפתחות הקאש, כי `legal/` השתנה.
        **הרשימה קשיחה, וזו המלכודת שלה:** `kotvim` נוספה
        למאגר ולא לרשימה, ולכן היא נשארה מאחור — היא מצרפת
        מראש את אותו `legal/terms.js`, וללא העלאת המפתח שלה
        הלומד שם נשאר עם התנאים הישנים לצמיתות. מוסיפים
        אפליקציה — מוסיפים אותה גם כאן.
     4. מרענן את `STATUS.md`

   ואינו מבצע commit. הבדיקות רצות אחריו, והמיזוג נשאר החלטה.
*/
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const W = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);

const arg = process.argv[2];
const OFF = arg === '--off';
if (!arg) {
  console.log('שימוש:  node .claude/qa/enable-tutor.js <כתובת ה-Worker>');
  console.log('        node .claude/qa/enable-tutor.js --off');
  process.exit(1);
}
if (!OFF && !/^https:\/\/[a-z0-9.-]+\/?$/i.test(arg)) {
  console.log('✗ הכתובת אינה נראית תקינה: ' + arg);
  console.log('  מצופה משהו כמו https://tutor.שם.workers.dev');
  process.exit(1);
}
const URL = OFF ? '' : arg.replace(/\/+$/, '') + '/';

/* --- 1. הכתובת --- */
let t = R('tutor/tutor.js');
const m = t.match(/var API = "([^"]*)";/);
if (!m) { console.log('✗ לא נמצא var API ב-tutor/tutor.js'); process.exit(1) }
t = t.replace(m[0], 'var API = "' + URL + '";');
W('tutor/tutor.js', t);
console.log((OFF ? '· כובה: ' : '· כתובת: ') + (URL || '(ריק)'));

/* --- 2. גרסת התנאים --- */
let lg = R('legal/terms.js');
const vm = lg.match(/version:\s*"([^"]+)"/);
if (!vm) { console.log('✗ לא נמצא version ב-legal/terms.js'); process.exit(1) }
const want = OFF ? '1.0' : '1.1';
if (vm[1] !== want) {
  lg = lg.replace(vm[0], 'version: "' + want + '"');
  W('legal/terms.js', lg);
  console.log('· תנאי השימוש: ' + vm[1] + ' → ' + want + '  (כל המשתמשים יתבקשו לאשר מחדש)');
} else console.log('· תנאי השימוש כבר ' + want);

/* --- 3. שלושה־עשר מפתחות הקאש --- */
const KEYS = [
  ['index.html', null], ['reader/index.html', null],
  ['math-app/index.html', 'math-app/index.html'],
  ['math-teen/index.html', 'math-teen/index.html'],
  ['math-uni/index.html', 'math-uni/index.html'],
  ['math-uni2/index.html', 'math-uni2/index.html'],
  ['math-uni3/index.html', 'math-uni3/index.html'],
  ['lomda/index.html', 'lomda/index.html'],
  ['english/index.html', 'english/index.html'],
  ['history/index.html', 'history/index.html'],
  ['ulpan/index.html', 'ulpan/index.html'],
  ['kotvim/index.html', 'kotvim/index.html'],
  ['bagrut-806/app.js', 'bagrut-806/app.js']
];
let bumped = 0;
for (const [reg, bf] of KEYS) {
  let s = R(reg);
  const km = s.match(/sw\.js\?v=([a-z]*)(\d+)-pwa1/);
  if (!km) { console.log('✗ ' + reg + ': לא נמצא מפתח קאש'); process.exit(1) }
  const pre = km[1], next = String(Number(km[2]) + 1);
  s = s.replace(km[0], 'sw.js?v=' + pre + next + '-pwa1');
  if (bf === reg) {
    const bm = s.match(new RegExp('var BUILD ?= ?"' + pre + km[2] + ' · (\\d{4}-\\d{2}-\\d{2})"'));
    if (!bm) { console.log('✗ ' + reg + ': BUILD אינו תואם למפתח'); process.exit(1) }
    const today = new Date().toISOString().slice(0, 10);
    s = s.replace(bm[0], 'var BUILD' + (bm[0].indexOf('var BUILD =') === 0 ? ' = ' : '=') +
                         '"' + pre + next + ' · ' + today + '"');
  }
  W(reg, s);
  console.log('  ' + reg.padEnd(22) + pre + km[2] + ' → ' + pre + next);
  bumped++;
}
console.log('· ' + bumped + ' מפתחות קאש עלו (legal/ השתנה, ולכן כולם יחד)');

/* --- 4. STATUS --- */
try {
  const want2 = cp.execSync('node .claude/qa/status.js --md',
    { cwd: ROOT, encoding: 'utf8' }).trim().split('\n');
  let d = R('STATUS.md').split('\n');
  const s0 = d.findIndex(l => l.startsWith('| אפליקציה | BUILD'));
  let e0 = s0; while (e0 < d.length && d[e0].startsWith('|')) e0++;
  /* `--md` מדפיס גם שורת פוטר, ולא רק שורות טבלה. בליעה של שורות
     `|` בלבד השאירה את הפוטר הישן במקומו והוסיפה חדש מתחתיו —
     `status.js --check` סופר אותם ונופל על ״הודבקה טבלה על טבלה״.
     לכן בולעים גם את השורה הריקה ואת הפוטר שאחריה. */
  if (d[e0] === '' && /^נוצר ב-`node \.claude\/qa\/status\.js --md`/.test(d[e0 + 1] || ''))
    e0 += 2;
  W('STATUS.md', d.slice(0, s0).concat(want2).concat(d.slice(e0)).join('\n'));
  console.log('· STATUS.md רוענן');
} catch (e) { console.log('· STATUS.md לא רוענן: ' + e.message) }

console.log('\nעכשיו:  node .claude/qa/all.js');
