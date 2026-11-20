/* =====================================================================
   audio-adopt.js — קליפ שכבר שולם עליו לא מוקלט שוב.

     node .claude/qa/audio-adopt.js            דוח
     node .claude/qa/audio-adopt.js --run      מאמץ: מעתיק ומרענן מניפסט
     node .claude/qa/audio-adopt.js --check    נופל כשקליפ עומד להיות משולם פעמיים
     node .claude/qa/audio-adopt.js --prune    רשימת המשקל המת למחיקה (לא נוגע בדבר)
     node .claude/qa/audio-adopt.js --prune --apply   מוחק אותם ומרענן מניפסט

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

   **מחיקה — רק ב-`--prune --apply`** (הכרעה ב-21.10.2026, O-217).
   קליפ שהטקסט שלו עזב את כל האתר הוא משקל מת: אי אפשר לנגן אותו,
   כי שום דף אינו מבקש את המזהה שלו — ובכל זאת הוא מתפרסם, ו-Pages
   קרוב לתקרת ה-1GB (O-191). ‏`--prune` לבדו רק מדפיס את הרשימה.

   **מחיקה אינה תשלום חוזר — הקובץ נשאר בהיסטוריה של git.** מחזירים
   קליפ בלי להקליט שוב:
       git log --oneline -1 -- <app>/audio/he/<id>.mp3     ← הקומיט שמחק
       git checkout <הקומיט>^ -- <app>/audio/he/<id>.mp3   ← ההורה שלו, שבו הקובץ חי
       node .claude/qa/record.js --manifest <app>
   (וכל תיקייה בבת אחת: `git checkout <הקומיט>^ -- <app>/audio/he/`.)
   המזהה הוא גיבוב של הטקסט, ולכן טקסט שחזר מקבל את אותו מזהה בדיוק.

   **מה נמחק ומה לא.** נמחק קובץ שהמזהה שלו אינו במאגר של **אף**
   אפליקציה (`record.js --ids`) — לכן קליפ משותף או מאומץ, שאפליקציה
   אחרת צריכה, נשאר גם בתיקייה שאינה צריכה אותו.

   **״לא במאגר״ אינו ״לא מנוגן״ — ולכן יש שומר שני.** המאגר מחשב את
   המזהה על `saySpell(טקסט)`, אבל חלק מאתרי ההקראה שולחים את הטקסט
   **הגולמי**: רמקול האפשרות ב-civics (`data-say="'+esc(plainOf(o.h))`,
   ‏`civics/index.html:10707`) ו-`speak` אינו מפעיל saySpell. אפשרות
   עם ״ — ״ או מירכאות מבקשת אפוא את המזהה הישן — והקובץ הישן הוא מה
   שמתנגן בה היום. נמדד 21.10.2026: 467 מתוך 1,858 ״מתים״ הם בדיוק
   מחרוזת שעדיין כתובה בקוד של האפליקציה שלהם. לכן `--prune` מחשב את
   המזהה של כל מחרוזת עברית בקבצים של האפליקציה (גולמית, מפוענחת,
   ואחרי plainOf), ומשאיר כל קליפ שנמצא שם. זה שומר שמרני: טקסט
   שנבנה בזמן ריצה מחלקים אינו נראה לו, ואת זה מכסה רק המאגר עצמו. הכלי מסרב לגעת כשיש
   אפליקציה עם קבצים שהמאגר שלה לא נקרא (כשל `--ids` היה הופך את כל
   הקבצים שלה ל״מתים״). אחרי המחיקה המניפסט נגזר מחדש מהדיסק, והכלי
   מוודא שמה שירד ממנו הוא בדיוק מה שנמחק — ואף מזהה נדרש לא ירד.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const QA = __dirname;
const argv = process.argv.slice(2);
const RUN = argv.includes('--run');
const CHECK = argv.includes('--check');
const PRUNE = argv.includes('--prune');
const APPLY = argv.includes('--apply');
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
const unread = [];      /* אפליקציה שהמאגר שלה לא נקרא — --prune לא ייגע */
for (const app of list) {
  const out = rec(['--ids', app]);
  if (!out) { unread.push(app); continue; }
  try { need[app] = new Set(JSON.parse(out)); } catch (e) { unread.push(app); }
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
const deadList = [];    /* { app, id, bytes, file } */
for (const app of Object.keys(onDisk)) {
  for (const id of onDisk[app]) {
    if (allNeeded.has(id)) continue;
    const p = path.join(ROOT, app, 'audio', LANG, id + '.mp3');
    let kb = 0; try { kb = fs.statSync(p).size / 1024; } catch (e) {}
    dead++; deadKB += kb;
    deadList.push({ app, id, bytes: Math.round(kb * 1024), file: path.relative(ROOT, p) });
    deadBy[app] = deadBy[app] || { n: 0, kb: 0 };
    deadBy[app].n++; deadBy[app].kb += kb;
  }
}

/* --- דיווח --- */
if (!CHECK && !PRUNE) {
  if (adopt.length) {
    const by = {};
    for (const a of adopt) { by[a.app] = by[a.app] || {}; by[a.app][a.from] = (by[a.app][a.from] || 0) + 1; }
    console.log('לאימוץ — נדרש כאן, והקובץ קיים שם:');
    for (const app of Object.keys(by).sort())
      console.log('  ' + app.padEnd(16) + Object.entries(by[app]).map(([f, n]) => n + ' מ-' + f).join(', '));
  } else console.log('· אין מה לאמץ');
  const dRows = Object.entries(deadBy).sort((a, b) => b[1].n - a[1].n);
  if (dRows.length) {
    console.log('\nלא במאגר של אף אפליקציה (לא נמחק; חלקם עדיין מתנגנים מרמקול שמקריא טקסט גולמי — `--prune` מפריד):');
    for (const [app, v] of dRows) console.log('  ' + app.padEnd(16) + String(v.n).padStart(5) + ' קליפים ' + Math.round(v.kb / 1024) + 'MB');
  }
}
console.log(`\n${adopt.length} לאימוץ · ${dead} משקל מת (${Math.round(deadKB / 1024)}MB) · ${Object.keys(need).length} אפליקציות נבדקו`);

/* --- גיזום: --prune (רשימה בלבד) · --prune --apply (מוחק) --- */
function manifestIds(app) {
  try { const m = JSON.parse(fs.readFileSync(path.join(ROOT, app, 'audio', 'manifest.json'), 'utf8'));
        return new Set(((m.langs || {})[LANG] || {}).ids || []); }
  catch (e) { return null; }
}
/* כל מחרוזת עברית בקבצי האפליקציה → המזהה שלה. ארבעה מעברים נפרדים
   (״…״, '…', `…`, >טקסט<), כדי שגרש עברי שמבלבל מעבר אחד לא יסתיר
   מחרוזת ממעבר אחר. */
function liveIds(app) {
  require(path.join(ROOT, 'speech', 'recorded.js'));
  const id = globalThis.RECORDED.id;
  const plain = h => String(h || '').replace(/<br\s*\/?>/gi, '. ').replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  const un = r => { try { return JSON.parse('"' + r.replace(/\\'/g, "'").replace(/\\`/g, '`') + '"'); }
                    catch (e) { return r.replace(/\\(["'`\\])/g, '$1'); } };
  const RX = [/"((?:[^"\\\n]|\\.)*)"/g, /'((?:[^'\\\n]|\\.)*)'/g, /`((?:[^`\\]|\\.)*)`/g, />([^<>]+)</g];
  const out = new Set();
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'audio' || e.name[0] === '.') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!/\.(js|html)$/.test(e.name)) continue;
      const src = fs.readFileSync(p, 'utf8');
      for (const rx of RX) for (const m of src.matchAll(rx)) {
        const raw = m[1]; if (!/[א-ת]/.test(raw)) continue;
        const v = un(raw);
        for (const t of [raw, v, plain(raw), plain(v)]) out.add(id(t));
      }
    }
  };
  walk(path.join(ROOT, app));
  return out;
}

if (PRUNE) {
  /* שומר: אפליקציה עם קבצים שהמאגר שלה לא נקרא (או ריק) — כל הקבצים
     שלה היו נראים מתים. לא מוחקים על סמך קריאה שנכשלה. */
  const blind = Object.keys(onDisk).filter(a => onDisk[a].size && (!need[a] || !need[a].size));
  if (blind.length) {
    console.log('✗ --prune מסרב: יש קבצים, והמאגר לא נקרא או ריק — ' + blind.join(', ') +
                (unread.length ? ' (נכשל: record.js --ids ' + unread.join(', ') + ')' : ''));
    process.exit(1);
  }
  deadList.sort((a, b) => a.app.localeCompare(b.app) || a.id.localeCompare(b.id));
  const live = {}, kept = [];
  for (let i = deadList.length - 1; i >= 0; i--) {
    const d = deadList[i];
    if (!live[d.app]) live[d.app] = liveIds(d.app);
    if (live[d.app].has(d.id)) { kept.push(d); deadList.splice(i, 1); dead--; deadKB -= d.bytes / 1024; }
  }
  console.log('app\tid\tbytes\tpath\tin_manifest');
  const before = {};
  for (const d of deadList) {
    if (!before[d.app]) before[d.app] = manifestIds(d.app) || new Set();
    console.log([d.app, d.id, d.bytes, d.file, before[d.app].has(d.id) ? 'yes' : 'no'].join('\t'));
  }
  if (kept.length) {
    const by = {};
    for (const d of kept) by[d.app] = (by[d.app] || 0) + 1;
    console.log('\n# נשארים — לא במאגר, אבל הטקסט עדיין כתוב בקוד של האפליקציה, ואתר הקראה גולמי מבקש אותו: ' +
                kept.length + ' (' + Object.entries(by).map(([a, n]) => a + ' ' + n).join(', ') + ')');
  }
  if (!APPLY) {
    console.log(`\n${dead} קליפים (${Math.round(deadKB / 1024)}MB) — לא נמחק דבר. למחיקה: --prune --apply`);
    process.exit(0);
  }
  for (const d of deadList) fs.unlinkSync(path.join(ROOT, d.file));
  let bad = 0;
  for (const app of Object.keys(before)) {
    if (rec(['--manifest', app]) === null) { bad++; console.log('✗ ' + app + ': record.js --manifest נכשל'); continue; }
    const after = manifestIds(app) || new Set();
    const gone = new Set(deadList.filter(d => d.app === app).map(d => d.id));
    /* מה שירד מהמניפסט = בדיוק מה שנמחק; ושום מזהה נדרש לא ירד */
    const lost = [...before[app]].filter(id => !after.has(id) && !gone.has(id));
    const stuck = [...gone].filter(id => after.has(id));
    if (lost.length || stuck.length) {
      bad++;
      console.log('✗ ' + app + ': ' + (lost.length ? lost.length + ' מזהים ירדו מהמניפסט בלי שנמחקו (' + lost.slice(0, 3).join(', ') + ') ' : '') +
                  (stuck.length ? stuck.length + ' מזהים שנמחקו עדיין במניפסט' : ''));
    }
  }
  if (bad) { console.log('שחזור: git checkout HEAD -- ' + Object.keys(before).map(a => a + '/audio/').join(' ')); process.exit(1); }
  console.log(`\n✓ נמחקו ${dead} קליפים (${Math.round(deadKB / 1024)}MB) ב-${Object.keys(before).length} אפליקציות; ` +
              'המניפסט נגזר מחדש מהדיסק, ומה שירד ממנו הוא בדיוק מה שנמחק. החזרה: ראו ראש הקובץ (git checkout <קומיט>^)');
  process.exit(0);
}

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
