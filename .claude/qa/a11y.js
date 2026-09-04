/* =====================================================================
   האם ששת מצבי הנגישות באמת מחווטים — בכל אפליקציה, בכל שם.

     node .claude/qa/a11y.js                 כל האפליקציות
     node .claude/qa/a11y.js ulpan math-app  אפליקציות נבחרות

   למה הבדיקה הזאת קיימת
   ---------------------
   שלוש המשפחות קוראות לאותו מצב בשלושה שמות: פונט קריא הוא
   `clear-font` ב-math-app, `clearfont` במחוללים ו-`clear` בחידון.
   ניגודיות היא `hi-contrast` מול `hc`. לכן `grep` על שם אחד מדווח
   "חסר" על אפליקציה שהמצב בה עובד מצוין — וזה קרה בפועל: שלוש
   קביעות שגויות נכנסו ל-ARCHITECTURE.md בדיוק כך.

   הבדיקה כאן שואלת על *יכולת*, ולא על מחרוזת, ומאמתת את כל השרשרת:

       applyModes מדליק מחלקה   →   ל-CSS יש כלל שמשתמש בה

   חוליה שבורה בכל אחד משני השלבים פירושה מתג שהמשתמש מפעיל ולא
   קורה כלום — בלי שגיאה, בלי אזהרה, ובדיוק אצל מי שהכי תלוי בו:
   דיסלקציה, ADHD, וקורא שצריך ניגודיות.

   הבדיקה קוראת קוד בלבד. אין דפדפן ואין שרת.
   ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

/* תשע אפליקציות הלימוד שיש בהן applyModes. reader ו-voice הם כלים
   ולא אפליקציות לימוד, ול-bagrut-806 שלד משלו — הם אינם נבדקים כאן. */
const APPS = ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
              'english', 'history', 'ulpan', 'lomda'];

/* יכולת → כל השמות שראינו לה בפועל. שם חדש מתווסף כאן, ולא בקוד. */
const CAPS = [
  { id: 'פונט קריא',    names: ['clear-font', 'clearfont', 'clear'] },
  { id: 'ניגודיות',     names: ['hi-contrast', 'hc'] },
  { id: 'תנועה מופחתת', names: ['reduce-motion', 'rm'] },
  { id: 'ריווח',        names: ['spaced'] },
  { id: 'גודל טקסט',    names: ['ts2', 'ts3'], alt: 'fs' },
  { id: 'ערכת צבע',     names: [], alt: 'theme' },
];

/* גוף פונקציה לפי איזון סוגריים — הקבצים כאן הם HTML עם JS בתוכו,
   ולכן אין דרך לייבא אותם, ואין תחליף לקריאת הטקסט. */
function body(src, name) {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) return '';
  let d = 0;
  for (let k = src.indexOf('{', i); k < src.length; k++) {
    if (src[k] === '{') d++;
    else if (src[k] === '}') { d--; if (!d) return src.slice(i, k + 1); }
  }
  return '';
}

/* האם ל-CSS יש כלל שבאמת משתמש במחלקה. מחפשים אותה כסלקטור —
   `:root.hc`, `html.hc`, `.hc .card` — ולא כמחרוזת חופשית, אחרת
   ההופעה בתוך classList.toggle עצמו הייתה נספרת כאילו היא CSS. */
function hasCss(src, cls) {
  const c = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(?:^|[\\s,{}])(?::root|html|body)?\\.' + c + '(?![\\w-])', 'm').test(src);
}

const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
const list = only.length ? only : APPS;

let findings = 0;
let checked = 0;

for (const app of list) {
  const file = path.join(ROOT, app, 'index.html');
  if (!fs.existsSync(file)) { console.log(`✗ ${app}: אין index.html`); findings++; continue; }

  const src = fs.readFileSync(file, 'utf8');
  const am = body(src, 'applyModes');
  if (!am) { console.log(`✗ ${app}: אין applyModes`); findings++; continue; }
  checked++;

  /* מה applyModes מדליק בפועל */
  const toggled = new Set();
  let m;
  const re = /classList\.toggle\(\s*["']([^"']+)["']/g;
  while ((m = re.exec(am))) toggled.add(m[1]);

  const setsTheme = /setAttribute\(\s*["']data-theme["']|removeAttribute\(\s*["']data-theme["']/.test(am);
  const setsFs    = /setProperty\(\s*["']--fs["']/.test(am);

  const rows = [];
  let bad = 0;

  for (const cap of CAPS) {
    /* ערכת צבע וגודל טקסט עשויים להיות מיושמים במשתנה CSS ולא במחלקה */
    if (cap.alt === 'theme') {
      if (setsTheme && /\[data-theme/.test(src)) rows.push([cap.id, 'data-theme', 'ok']);
      else { rows.push([cap.id, setsTheme ? 'data-theme' : '—', setsTheme ? 'אין CSS' : 'לא מחווט']); bad++; }
      continue;
    }

    const found = cap.names.filter(n => toggled.has(n));

    if (!found.length && cap.alt === 'fs') {
      /* `var(--fs,17px)` — עם ערך גיבוי — הוא הכתיב שבשימוש, ולכן
         אין לדרוש סוגר מיד אחרי השם. הדרישה הזאת הפילה שלוש
         אפליקציות תקינות בגרסה הראשונה של הבדיקה הזאת. */
      if (setsFs && /var\(\s*--fs\b/.test(src)) { rows.push([cap.id, '--fs', 'ok']); continue; }
      rows.push([cap.id, setsFs ? '--fs' : '—', setsFs ? 'אין CSS' : 'לא מחווט']); bad++; continue;
    }

    if (!found.length) { rows.push([cap.id, '—', 'לא מחווט']); bad++; continue; }

    /* נמצאה מחלקה — עכשיו האם ה-CSS משתמש בה */
    const dead = found.filter(n => !hasCss(src, n));
    if (dead.length) { rows.push([cap.id, found.join(', '), 'אין CSS ל-' + dead.join(', ')]); bad++; }
    else rows.push([cap.id, found.join(', '), 'ok']);
  }

  if (bad) {
    findings += bad;
    console.log(`✗ ${app}`);
    for (const [id, cls, st] of rows) if (st !== 'ok') console.log(`     ${id.padEnd(14)} ${String(cls).padEnd(22)} ${st}`);
  } else {
    console.log(`✓ ${app.padEnd(11)} ${rows.map(r => r[1]).join(' · ')}`);
  }
}

console.log(`\n${checked} אפליקציות נבדקו, ${findings} ממצאים`);
process.exit(findings ? 1 : 0);
