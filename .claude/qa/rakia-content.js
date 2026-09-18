/* =====================================================================
   rakia-content.js — 469 הטקסטים של רקיע: מבנה, מניין, אורך, ייחוד

     node .claude/qa/rakia-content.js           הכול
     node .claude/qa/rakia-content.js --file f  קובץ אחד, מניין חלקי (לכותב)

   מה נבדק:
   1. **המניין.** 120 + 120 + 225 + 4 = 469, ואף תא ריק: כל פלנטה
      בכל מזל, כל פלנטה בכל בית, כל 45 הזוגות בחמשת האספקטים,
      ארבעת היסודות.
   2. **המבנה.** כל טקסט הוא אובייקט {he} — מוכן לארבע שפות —
      ולא מחרוזת חשופה.
   3. **האורך.** 80–360 תווים, 2–4 משפטים. קורא עם דיסלקציה לא
      מסיים פסקה; קטע קצר מדי אינו אומר דבר.
   4. **הייחוד.** אין שני טקסטים זהים, ואין שניים שמתחילים באותן
      30 אותיות — טקסט שהועתק ושונה בסופו הוא כפילות.
   5. **עברית.** אין אות לטינית ואין ספרה בטקסט; אין סוגריים.
   6. **המילון.** rakia/data/glossary.js — לפחות 30 מונחים, לכל
      אחד term והגדרה {he}, ואין מונח כפול.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const DIR = path.join(ROOT, 'rakia', 'data');
const args = process.argv.slice(2);
const fi = args.indexOf('--file');
const partial = fi >= 0;
const files = partial ? [path.resolve(args[fi + 1])]
  : fs.readdirSync(DIR).filter(f => /^texts-.*\.js$/.test(f)).sort().map(f => path.join(DIR, f));

const sb = { window: {} }; sb.globalThis = sb;
const ctx = vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(DIR, 'schema.js'), 'utf8'), ctx, { filename: 'schema.js' });
let bad = 0;
for (const f of files) {
  try { vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: path.basename(f) }); }
  catch (e) { console.log(`✗ ${path.basename(f)}: אינו נטען — ${e.message}`); bad++; }
}
const R = sb.window.RAKIA, TX = R.TEXTS;
const items = [];   // [key, he]
function take(key, v) {
  if (!v || typeof v !== 'object' || typeof v.he !== 'string') { bad++; console.log(`✗ ${key}: אינו אובייקט {he}`); return; }
  items.push([key, v.he]);
}
/* 1 — המניין */
let expected = 0, present = 0;
const cell = (key, v) => { expected++; if (v) { present++; take(key, v); } else if (!partial) { bad++; console.log(`✗ חסר: ${key}`); } };
for (const p of R.PLANETS) for (const s of R.SIGNS) cell(`planetSign.${p}.${s}`, TX.planetSign[p] && TX.planetSign[p][s]);
for (const p of R.PLANETS) for (const h of R.HOUSES) cell(`planetHouse.${p}.${h}`, TX.planetHouse[p] && TX.planetHouse[p][h]);
for (let i = 0; i < R.PLANETS.length; i++) for (let j = i + 1; j < R.PLANETS.length; j++) {
  const k = R.PLANETS[i] + '-' + R.PLANETS[j];
  for (const a of R.ASPECTS) cell(`aspect.${k}.${a}`, TX.aspect[k] && TX.aspect[k][a]);
}
for (const e of R.ELEMENTS) cell(`element.${e}`, TX.element[e]);
/* 3, 5 — אורך ועברית */
for (const [key, he] of items) {
  const len = he.length, sent = (he.match(/[.!?…]+(\s|$)/g) || []).length;
  if (len < 80 || len > 360) { bad++; console.log(`✗ ${key}: ${len} תווים (80–360)`); }
  if (sent < 2 || sent > 4) { bad++; console.log(`✗ ${key}: ${sent} משפטים (2–4)`); }
  if (/[A-Za-z]/.test(he)) { bad++; console.log(`✗ ${key}: אות לטינית`); }
  if (/\d/.test(he)) { bad++; console.log(`✗ ${key}: ספרה`); }
  if (/[()]/.test(he)) { bad++; console.log(`✗ ${key}: סוגריים`); }
}
/* 4 — ייחוד */
const seen = new Map(), head = new Map();
for (const [key, he] of items) {
  const norm = he.replace(/\s+/g, ' ').trim();
  if (seen.has(norm)) { bad++; console.log(`✗ ${key}: זהה ל-${seen.get(norm)}`); } else seen.set(norm, key);
  const h = norm.slice(0, 30);
  if (head.has(h)) { bad++; console.log(`✗ ${key}: מתחיל כמו ${head.get(h)} — ״${h}״`); } else head.set(h, key);
}
/* 6 — המילון */
if (!partial) {
  const g = path.join(DIR, 'glossary.js');
  if (!fs.existsSync(g)) { bad++; console.log('✗ glossary.js אינו קיים'); }
  else {
    try {
      vm.runInContext(fs.readFileSync(g, 'utf8'), ctx, { filename: 'glossary.js' });
      const G = R.GLOSSARY || [];
      const terms = new Set();
      if (G.length < 30) { bad++; console.log(`✗ glossary: ${G.length} מונחים (לפחות 30)`); }
      for (const e of G) {
        if (!e.term || !e.def || typeof e.def.he !== 'string' || e.def.he.length < 20) { bad++; console.log(`✗ glossary: ${JSON.stringify(e).slice(0, 60)}`); }
        if (terms.has(e.term)) { bad++; console.log(`✗ glossary: מונח כפול ${e.term}`); }
        terms.add(e.term);
      }
      console.log(`· מילון: ${G.length} מונחים`);
    } catch (e) { bad++; console.log(`✗ glossary.js: ${e.message}`); }
  }
}
console.log(`${bad ? '✗' : '✓'} ${present}/${expected} טקסטים${partial ? ' (קובץ אחד)' : ''}, ${bad} ממצאים`);
process.exit(bad ? 1 : 0);
