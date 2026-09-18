/* =====================================================================
   mk-ephem.js — מחולל טבלאות האפמריס של רקיע

     node .claude/qa/rakia/mk-ephem.js <נתיב לחבילת astronomia>   כותב rakia/ephem-data.js
     node .claude/qa/rakia/mk-ephem.js --check                     הקובץ לא נערך ביד

   המקור: חבילת npm ‎astronomia (MIT) שמכילה את סדרות VSOP87D המלאות
   (Bretagnon & Francou 1988, ecliptic of date), את טבלאות פרק 47
   של Meeus לירח, פרק 37 לפלוטו ופרק 22 לנוטציה. היא **אינה תלות**
   של האפליקציה: היא נקראת פעם אחת כאן, והפלט הוא קובץ נתונים סטטי
   בלי שום require.

   הקיצוץ: מכל סדרה נשמרים רק איברים שמשרעתם מעל סף, ומחיר הקיצוץ
   נמדד ב-galileo.js מול Swiss Ephemeris ולא משוער. הספים למטה
   נבחרו כך שסטיית הקיצוץ בקו האורך קטנה משנייה אחת של קשת
   בטווח 1900–2100 (נמדד ב-`--measure`).

   --check: חתימת התוכן שבכותרת הקובץ שווה לחתימה של גופו. עריכה
   ידנית של מספר אחד מפילה את הבדיקה — טבלה מספרית אינה נערכת ביד.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const OUT = path.join(ROOT, 'rakia', 'ephem-data.js');
const MARK = '/* SIG:';

function sig(body) { return crypto.createHash('sha256').update(body).digest('hex').slice(0, 16); }

if (process.argv.includes('--check')) {
  if (!fs.existsSync(OUT)) { console.log('✗ rakia/ephem-data.js אינו קיים'); process.exit(1); }
  const src = fs.readFileSync(OUT, 'utf8');
  const i = src.indexOf(MARK);
  const head = src.slice(i, src.indexOf('*/', i) + 2);
  const want = head.slice(MARK.length, -2).trim();
  const body = src.slice(src.indexOf('*/', i) + 3);
  const got = sig(body);
  if (want !== got) { console.log(`✗ ephem-data.js: חתימה ${want} מול תוכן ${got} — נערך ביד או נכתב בלי המחולל`); process.exit(1); }
  console.log(`✓ ephem-data.js: חתימה ${got}, ${(src.length / 1024).toFixed(0)}KB`);
  process.exit(0);
}

const SRC = process.argv[2];
if (!SRC) { console.error('שימוש: node mk-ephem.js <נתיב astronomia> | --check'); process.exit(2); }

/* קובץ נתונים של astronomia הוא ESM עם `export default`; נטען כטקסט */
function loadData(name) {
  let t = fs.readFileSync(path.join(SRC, 'data', name + '.js'), 'utf8');
  t = t.replace(/export\s+default\s+\w+\s*;?/, '').replace(/^const\s+(\w+)\s*=/m, 'var m =');
  const fn = new Function(t + '\nreturn m;');
  return fn();
}
function loadSrc(name) { return fs.readFileSync(path.join(SRC, 'src', name + '.js'), 'utf8'); }

/* הספים, ברדיאנים ל-L ול-B, ב-AU ל-R. סדרה גבוהה יותר (L1, L2…)
   מוכפלת ב-t^n, ולכן הסף שלה מוכפל בהתאם ל-|t|≤0.1 (1900–2100). */
const TH = { mercury: 6e-7, venus: 6e-7, earth: 3e-7, mars: 6e-7, jupiter: 1e-6, saturn: 1e-6, uranus: 1e-6, neptune: 1e-6 };
function trunc(series, th) {
  const out = [];
  for (let k = 0; k < 6; k++) {
    const s = series[String(k)] || [];
    const lim = th / Math.pow(0.1, k);
    out.push(s.filter(([a]) => Math.abs(a) >= lim).map(([a, b, c]) => [a, b, c]));
  }
  while (out.length && !out[out.length - 1].length) out.pop();
  return out;
}
const vsop = {};
let terms = 0;
for (const p of Object.keys(TH)) {
  const d = loadData('vsop87D' + p);
  vsop[p] = { L: trunc(d.L, TH[p]), B: trunc(d.B, TH[p]), R: trunc(d.R, TH[p] * 4) };
  for (const k of ['L', 'B', 'R']) for (const s of vsop[p][k]) terms += s.length;
}

/* ירח — Meeus 47.A ו-47.B, כפי שהם ב-moonposition.js */
const moonSrc = loadSrc('moonposition');
function table(src, name) {
  const i = src.indexOf('const ' + name + ' = [');
  const j = src.indexOf('\n  ]', i);
  return JSON.parse(src.slice(i + ('const ' + name + ' = ').length, j + 4).replace(/\n/g, ''));
}
const moon = { ta: table(moonSrc, 'ta'), tb: table(moonSrc, 'tb') };

/* פלוטו — Meeus 37 */
const plutoSrc = loadSrc('pluto');
const pluto = [];
for (const m of plutoSrc.matchAll(/new Pt\(([^)]*)\)/g)) pluto.push(m[1].split(',').map(Number));

/* נוטציה — Meeus 22.A */
const nutSrc = loadSrc('nutation');
const nut = [];
{
  const i = nutSrc.indexOf('const table22A');
  const block = nutSrc.slice(i);
  const rows = block.match(/\[\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?[\d.]+\s*,\s*-?[\d.]+\s*,\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\]/g);
  for (const r of rows) nut.push(JSON.parse(r));
}
if (moon.ta.length !== 60 || moon.tb.length !== 60 || pluto.length !== 43 || nut.length !== 63)
  throw new Error(`טבלאות: ירח ${moon.ta.length}/${moon.tb.length}, פלוטו ${pluto.length}, נוטציה ${nut.length}`);

const body = 'var EPHEM=' + JSON.stringify({ vsop, moon, pluto, nut }) + ';\n';
const head = `/* =====================================================================
   רקיע — טבלאות האפמריס. קובץ נתונים שנוצר ב-.claude/qa/rakia/mk-ephem.js
   ואינו נערך ביד (\`--check\` משווה חתימה).

   vsop: VSOP87D מקוצר (Bretagnon & Francou 1988) — L, B ברדיאנים,
         R ב-AU, איבר = [A, B, C]: A·cos(B + C·t), t באלפי שנים יוליאניים
         מ-J2000. ${terms} איברים לשמונה גופים, מתוך הסדרות המלאות.
   moon: Meeus, Astronomical Algorithms, טבלאות 47.A ו-47.B.
   pluto: Meeus פרק 37, תוקף 1885–2099.
   nut:  Meeus טבלה 22.A (IAU 1980).
   ===================================================================== */
${MARK} ${sig(body)} */
`;
fs.writeFileSync(OUT, head + body);
console.log(`✓ נכתב ${OUT}: ${terms} איברי VSOP, ${(head.length + body.length) / 1024 | 0}KB, חתימה ${sig(body)}`);
