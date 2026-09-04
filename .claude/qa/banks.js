/* =====================================================================
   הלומדה — האם מאגר התוכן מחווט בשלושת המקומות, ובסדר הנכון.

     node .claude/qa/banks.js
     node .claude/qa/banks.js lomda      אפליקציה מסוימת

   למה הבדיקה הזאת קיימת
   ---------------------
   ב-`lomda` התוכן אינו בתוך `index.html` אלא בקובצי `data/*.js`,
   ולכן נושא חדש נכנס בקובץ אחד — וזו כל הנקודה. המחיר הוא שהחיווט
   נעשה בשלושה מקומות, ושכל אחד מהם נכשל **בשקט**:

     1. תגית `<script src="data/…">` ב-`index.html`
     2. אותו נתיב ב-`PRE` שב-`sw.js`
     3. והתגית חייבת לבוא **לפני** הסקריפט של המנוע

   השלישי הוא זה שנשבר בפועל בבנייה הראשונה. שלוש התגיות הושמו בזנב
   הקובץ, ליד `/legal/`, בעוד שהמנוע יושב בסקריפט שנפתח מיד אחרי
   `<div id="app">` — כלומר סעיף 7 רץ כשעדיין אין `window.BANKS`.
   `TRACKS` ו-`TOPICS` יצאו ריקים, ולא נזרקה שום שגיאה: המסך פשוט
   הראה אפס נושאים, `smoke` החזיר `clean`, ורק `exam.js` נפל — במקום
   אחר לגמרי, על `spec` שהוא null.

   הבדיקה גם טוענת כל מאגר ב-node ובודקת את התוכן עצמו: ארבע שפות
   בכל שדה, שנה לכל פריט מתוארך, ולפחות ארבעה פריטים ברמה — פחות
   מזה, ומסיח רביעי אמיתי אינו קיים.

   קוראת קוד בלבד. אין דפדפן ואין שרת.
   ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const LANGS = ['he', 'ar', 'ru', 'en'];

/* אפליקציות שהתוכן שלהן חי ב-data/. אפליקציה שנבנתה על אותו דגם
   מתווספת כאן. */
const APPS = process.argv.slice(2).length ? process.argv.slice(2) : ['lomda'];

let findings = 0;
const bad = (m) => { console.log('✗ ' + m); findings++; };

for (const app of APPS) {
  const dir = path.join(ROOT, app);
  const dataDir = path.join(dir, 'data');
  if (!fs.existsSync(dataDir)) { bad(`${app}: אין תיקיית data/`); continue; }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.js')).sort();
  if (!files.length) { bad(`${app}/data: אין קובצי תוכן`); continue; }
  if (!files.includes('schema.js')) bad(`${app}/data: אין schema.js`);

  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(dir, 'sw.js'), 'utf8');

  /* --- 1+3. תגית לכל קובץ, וכולן לפני המנוע --- */
  /* המנוע הוא הסקריפט הראשון שאין לו src. */
  const engineAt = html.search(/<script>\s*\n/);
  for (const f of files) {
    const at = html.indexOf(`<script src="data/${f}"`);
    if (at < 0) { bad(`${app}: אין תגית <script src="data/${f}"> ב-index.html`); continue; }
    if (engineAt >= 0 && at > engineAt)
      bad(`${app}: data/${f} נטען אחרי המנוע — סעיף 7 ירוץ לפניו, והנושאים ייצאו ריקים`);
  }
  /* schema.js קודם לכולם, אחרת קובץ תוכן קורא לפונקציה שאינה קיימת */
  const schemaAt = html.indexOf('<script src="data/schema.js"');
  for (const f of files) {
    if (f === 'schema.js') continue;
    const at = html.indexOf(`<script src="data/${f}"`);
    if (at >= 0 && schemaAt >= 0 && at < schemaAt)
      bad(`${app}: data/${f} נטען לפני schema.js`);
  }

  /* --- 2. אותו נתיב ב-PRE --- */
  for (const f of files) {
    if (!sw.includes(`./data/${f}`))
      bad(`${app}/sw.js: data/${f} אינו ב-PRE — הנושא לא יעבוד אופליין`);
  }

  /* --- 4. התוכן עצמו, בסדר שבו הדפדפן טוען אותו --- */
  /* לא בסדר האלפביתי: `civics.js` קודם ל-`schema.js` בו, ואז קובץ
     תוכן קורא ל-BANK שעוד אינו קיים. הסדר הוא סדר התגיות. */
  const order = [];
  const tag = /<script src="data\/([A-Za-z0-9_.-]+)"/g;
  let tm;
  while ((tm = tag.exec(html))) if (files.includes(tm[1])) order.push(tm[1]);
  for (const f of files) if (!order.includes(f)) bad(`${app}: data/${f} אינו נטען באף תגית`);

  const win = {};
  let banks = null;
  try {
    const runner = new Function('window',
      order.map(f => fs.readFileSync(path.join(dataDir, f), 'utf8')).join('\n;\n') +
      '\nreturn window.BANKS;');
    banks = runner(win);
  } catch (e) { bad(`${app}/data: הטעינה נכשלה — ${e.message}`); }
  if (!banks || !banks.length) { bad(`${app}/data: אין אף מאגר ב-window.BANKS`); continue; }

  const chk = (o, where) => {
    if (!o) { bad(`${where}: ריק`); return; }
    for (const lg of LANGS) {
      if (!(lg in o)) bad(`${where}: אין ${lg}`);
      else if (typeof o[lg] === 'string' && !o[lg].trim()) bad(`${where}: ${lg} ריק`);
      else if (Array.isArray(o[lg]) && !o[lg].length) bad(`${where}: ${lg} ריק`);
    }
  };

  const ids = new Set(), tids = new Set();
  let items = 0;
  for (const b of banks) {
    const tr = (b || {}).track || {};
    if (!tr.id) { bad(`${app}: מאגר בלי מזהה מסלול`); continue; }
    if (ids.has(tr.id)) bad(`${app}: מסלול "${tr.id}" מופיע פעמיים — השני לא ייטען`);
    ids.add(tr.id);
    chk(tr.n, `${app} track ${tr.id}.n`);
    chk(tr.d, `${app} track ${tr.id}.d`);
    for (const tp of (b.topics || [])) {
      if (!tp || !tp.id) { bad(`${app}/${tr.id}: נושא בלי מזהה`); continue; }
      if (tids.has(tp.id)) bad(`${app}: נושא "${tp.id}" מופיע פעמיים`);
      tids.add(tp.id);
      chk(tp.n, `${app} ${tp.id}.n`);
      chk(tp.d, `${app} ${tp.id}.d`);
      if ((tp.L || []).length !== 3) bad(`${app} ${tp.id}: ${(tp.L || []).length} רמות ולא שלוש`);
      (tp.L || []).forEach((lvl, li) => {
        const at = `${app} ${tp.id} L${li + 1}`;
        if (lvl.length < 4) bad(`${at}: ${lvl.length} פריטים — פחות מארבע, ואין מסיח רביעי אמיתי`);
        lvl.forEach((it, ii) => {
          items++;
          const w = `${at} #${ii}`;
          if (it.k === 'e') {
            if (typeof it.y !== 'number') bad(`${w}: פריט מתוארך בלי שנה`);
            ['t', 'w', 'c', 'e'].forEach(f => chk(it[f], `${w}.${f}`));
          } else if (it.k === 'c') {
            ['t', 'd'].forEach(f => chk(it[f], `${w}.${f}`));
          } else if (it.k === 'p') {
            chk(it.lines, `${w}.lines`);
            if (!(it.qs || []).length) bad(`${w}: קטע בלי שאלות`);
            (it.qs || []).forEach((q, qi) => {
              const wq = `${w} Q${qi}`;
              chk(q.q, `${wq}.q`); chk(q.a, `${wq}.a`);
              if ((q.w || []).length !== 3) bad(`${wq}: ${(q.w || []).length} מסיחים ולא שלושה`);
              if ((q.y || []).length !== (q.w || []).length)
                bad(`${wq}: ${(q.y || []).length} נימוקים מול ${(q.w || []).length} מסיחים`);
              (q.w || []).forEach((x, k) => chk(x, `${wq}.w${k}`));
              (q.y || []).forEach((x, k) => chk(x, `${wq}.y${k}`));
            });
          } else bad(`${w}: סוג פריט לא מוכר "${it.k}"`);
        });
      });
    }
  }
  console.log(`${findings ? '·' : '✓'} ${app.padEnd(8)} ${banks.length} מאגרים · ` +
              `${tids.size} נושאים · ${items} פריטים · ${files.length} קובצי data`);
}

console.log(`\n${APPS.length} אפליקציות נבדקו, ${findings} ממצאים`);
process.exit(findings ? 1 : 0);
