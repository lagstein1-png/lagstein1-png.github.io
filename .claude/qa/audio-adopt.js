/* =====================================================================
   audio-adopt.js — קליפ שכבר שולם עליו לא מוקלט שוב.

     node .claude/qa/audio-adopt.js            דוח
     node .claude/qa/audio-adopt.js --run      מאמץ: מעתיק ומרענן מניפסט
     node .claude/qa/audio-adopt.js --check    נופל כשקליפ עומד להיות משולם פעמיים

   **למה הכלי הזה נולד.** מזהה הקליפ הוא גיבוב של **הטקסט**, ולא של
   האפליקציה. לכן אותו משפט בשתי אפליקציות הוא אותו מזהה בדיוק —
   וכשנושא עובר מאפליקציה לאפליקציה (ב-10.10.2026 שש יחידות עברו
   מ-`lomda` לאפליקציות משלהן), הקליפ נשאר בתיקייה הישנה, החדשה אינה
   מוצאת קובץ, ו-`record.yml` **מקליט ומשלם עליו שוב**.

   נמדד ביום שהכלי נכתב: 67 קליפים במצב הזה. זה לא כסף גדול — אבל
   זה מצב שחוזר בכל מעבר נושא, והוא גם מה שמונע מהלומד לשמוע קול
   מוקלט בנושא שעבר, עד שהריצה היומית תגיע אליו.

   **המניפסט אינו נכתב כאן ביד.** ‏`writeManifest` שב-`record.js`
   גוזר אותו מהקבצים שעל הדיסק (`record.js:803`), ולכן האימוץ הוא
   העתקת קובץ ואחריה `record.js --manifest <אפליקציה>`. מניפסט שנכתב
   ביד נסחף מהדיסק, וזו תקלה שאין לה אזהרה.

   **מה הוא אינו עושה: הוא אינו מוחק.** קליפ שהטקסט שלו עזב את כל
   האתר הוא משקל מת — אבל שולם עליו, ומחיקתו הפיכה רק בתשלום נוסף.
   הכלי מודד ומדווח; המחיקה היא הכרעת בעלים.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const QA = __dirname;
const argv = process.argv.slice(2);
const RUN = argv.includes('--run');
const CHECK = argv.includes('--check');
const LANG = 'he';

function rec(args) {
  try { return execFileSync(process.execPath, [path.join(QA, 'record.js')].concat(args),
                            { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { return null; }
}

/* --- האפליקציות שיש להן מאגר קבוע, ומה כל אחת צריכה היום --- */
const list = (rec(['--list']) || '').trim().split(/\s+/).filter(Boolean);
if (!list.length) { console.log('✗ record.js --list לא החזיר אפליקציות'); process.exit(1); }

const need = {};        /* אפליקציה → Set של מזהים שהיא צריכה היום */
for (const app of list) {
  const out = rec(['--ids', app]);
  if (!out) continue;
  try { need[app] = new Set(JSON.parse(out)); } catch (e) { /* אפליקציה בלי מאגר */ }
}

/* --- מה יש בדיסק, ואצל מי. הדיסק הוא העובדה, לא המניפסט. --- */
const owner = {};       /* מזהה → [אפליקציות שיש להן הקובץ] */
const onDisk = {};      /* אפליקציה → Set */
for (const d of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name[0] === '.') continue;
  const dir = path.join(ROOT, d.name, 'audio', LANG);
  if (!fs.existsSync(dir)) continue;
  const s = new Set();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.mp3')) continue;
    const id = f.slice(0, -4);
    s.add(id);
    (owner[id] = owner[id] || []).push(d.name);
  }
  onDisk[d.name] = s;
}

/* --- 1 · אימוץ: אפליקציה צריכה מזהה שיש לו קובץ אצל אחרת --- */
const adopt = [];
for (const app of Object.keys(need)) {
  const have = onDisk[app] || new Set();
  for (const id of need[app]) {
    if (have.has(id)) continue;
    const from = (owner[id] || []).filter(a => a !== app)[0];
    if (from) adopt.push({ app, id, from });
  }
}

/* --- 2 · משקל מת: קובץ בדיסק שאף אפליקציה אינה צריכה --- */
const allNeeded = new Set();
for (const app of Object.keys(need)) for (const id of need[app]) allNeeded.add(id);
let dead = 0, deadKB = 0;
const deadBy = {};
for (const app of Object.keys(onDisk)) {
  for (const id of onDisk[app]) {
    if (allNeeded.has(id)) continue;
    const p = path.join(ROOT, app, 'audio', LANG, id + '.mp3');
    let kb = 0; try { kb = fs.statSync(p).size / 1024; } catch (e) {}
    dead++; deadKB += kb;
    deadBy[app] = deadBy[app] || { n: 0, kb: 0 };
    deadBy[app].n++; deadBy[app].kb += kb;
  }
}

/* --- דיווח --- */
if (!CHECK) {
  if (adopt.length) {
    const by = {};
    for (const a of adopt) { by[a.app] = by[a.app] || {}; by[a.app][a.from] = (by[a.app][a.from] || 0) + 1; }
    console.log('לאימוץ — נדרש כאן, והקובץ קיים שם:');
    for (const app of Object.keys(by).sort())
      console.log('  ' + app.padEnd(16) + Object.entries(by[app]).map(([f, n]) => n + ' מ-' + f).join(', '));
  } else console.log('· אין מה לאמץ');
  const dRows = Object.entries(deadBy).sort((a, b) => b[1].n - a[1].n);
  if (dRows.length) {
    console.log('\nמשקל מת — שולם, והטקסט עזב את כל האתר (לא נמחק):');
    for (const [app, v] of dRows) console.log('  ' + app.padEnd(16) + String(v.n).padStart(5) + ' קליפים ' + Math.round(v.kb / 1024) + 'MB');
  }
}
console.log(`\n${adopt.length} לאימוץ · ${dead} משקל מת (${Math.round(deadKB / 1024)}MB) · ${Object.keys(need).length} אפליקציות נבדקו`);

/* --- ביצוע --- */
if (RUN && adopt.length) {
  const dirty = new Set();
  for (const a of adopt) {
    const src = path.join(ROOT, a.from, 'audio', LANG, a.id + '.mp3');
    const dst = path.join(ROOT, a.app, 'audio', LANG, a.id + '.mp3');
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    dirty.add(a.app);
  }
  for (const app of dirty) console.log('· ' + (rec(['--manifest', app]) || '').trim());
  console.log(`✓ ${adopt.length} קליפים אומצו ב-${dirty.size} אפליקציות, והמניפסט נגזר מחדש מהדיסק`);
  process.exit(0);
}

if (CHECK) {
  if (adopt.length) {
    const by = {};
    for (const a of adopt) { by[a.app] = by[a.app] || {}; by[a.app][a.from] = (by[a.app][a.from] || 0) + 1; }
    for (const app of Object.keys(by).sort())
      console.log(`✗ ${app.padEnd(16)} ${Object.entries(by[app]).map(([f, n]) => n + ' קליפים קיימים ב-' + f).join(', ')} — record.yml יקליט וישלם עליהם שוב`);
    console.log('תיקון: node .claude/qa/audio-adopt.js --run');
    process.exit(1);
  }
  console.log('✓ אין קליפ שעומד להיות משולם פעמיים');
}
