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

/* עשר אפליקציות הלימוד. reader ו-voice הם כלים ולא אפליקציות
   לימוד, ולכן אינם נבדקים כאן.

   **ל-bagrut-806 שלד מודולרי, והיא הייתה מוחרגת בגללו עד
   17.9.2026.** ה-CSS שלה ב-`index.html` וה-JS ב-`app.js`, והפונקציה
   נקראת `applyPrefs`. ההחרגה לא הייתה פטור מהדרישה אלא מגבלה של
   הבדיקה — וכשהיא הוסרה נמצא שארבעה מששת המצבים באמת חסרו שם.
   מפה של צורה, ולא רשימת פטורים: אפליקציה שתפצל קובץ מחר תתווסף
   כאן בשורה אחת. */
/* **הרשימה נגזרת, והשלד גם הוא — O-135, 5.10.2026.** עד היום ישבו
   כאן שנים־עשר שמות מוקלדים ומפת `SHAPE` ידנית, ולכן 26 אפליקציות
   לא נמדדו מעולם; ושבע מהן (משפחת ה-`elem`) מחזיקות מצב אחד מתוך
   שישה. במקום להוסיף שורה ידנית לכל אפליקציה שמפצלת קובץ, ה-CSS
   וה-JS נאספים מתוך ה-`index.html` עצמו: כל `<link rel=stylesheet>`
   מקומי וכל `<script src>` מקומי, ועוד ה-`index.html` עצמו. */
const AL = require('./applist.js');
const APPS = AL.local();
/* **ושם הפונקציה גם הוא נמצא ולא מוקלד.** `applyModes` ב-11,
   `applyPrefs` ב-bagrut-806, `applyDisplay` ב-bagrut-history — ועל
   השם השלישי הבדיקה דיווחה ״אין applyModes״ על אפליקציה שכל ששת
   המצבים מחווטים בה. נבחרת הפונקציה שגוף שלה מדליק הכי הרבה
   מחלקות מצב; אפס מחלקות = אין פונקציה כזאת, וזה ממצא אמיתי. */
const MODE_CLASSES = new Set(['clear-font', 'clearfont', 'clear', 'hi-contrast', 'hc',
  'reduce-motion', 'rm', 'spaced', 'ts2', 'ts3', 'big']);
function modesFn(js) {
  let best = '', score = -1, m;
  const re = /function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  while ((m = re.exec(js))) {
    const b = body(js, m[1]);
    if (!b) continue;
    let n = 0, t;
    const tr = /classList\.toggle\(\s*["']([^"']+)["']/g;
    while ((t = tr.exec(b))) if (MODE_CLASSES.has(t[1])) n++;
    if (/setProperty\(\s*["']--fs["']/.test(b)) n++;
    if (n > score) { score = n; best = m[1] }
  }
  return score > 0 ? best : '';
}

/* קבצים מקומיים ש-index.html מושך, לפי סוג. נתיב שמתחיל ב-`/`
   הוא משותף לכל האתר (`/tutor/…`) ואינו של האפליקציה. */
function pulled(src, app, re) {
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    const href = m[1];
    if (/^(https?:)?\/\//.test(href) || href.startsWith('/') || href.startsWith('data:')) continue;
    const f = path.join(ROOT, app, href.split('?')[0]);
    if (fs.existsSync(f)) out.push(fs.readFileSync(f, 'utf8'));
  }
  return out;
}
function cssOf(src, app) {
  return [src].concat(pulled(src, app, /<link[^>]+rel=["']?stylesheet["']?[^>]*href=["']([^"']+)["']/gi))
              .concat(pulled(src, app, /<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi)).join('\n');
}
function jsOf(src, app) {
  return [src].concat(pulled(src, app, /<script[^>]+src=["']([^"']+)["']/gi)).join('\n');
}

/* יכולת → כל השמות שראינו לה בפועל. שם חדש מתווסף כאן, ולא בקוד. */
const CAPS = [
  { id: 'פונט קריא',    names: ['clear-font', 'clearfont', 'clear'] },
  { id: 'ניגודיות',     names: ['hi-contrast', 'hc'] },
  { id: 'תנועה מופחתת', names: ['reduce-motion', 'rm'] },
  { id: 'ריווח',        names: ['spaced'] },
  /* `big` — צעד יחיד של הגדלה (math-elem, math-g7). אותה יכולת,
     שם אחר; הבדיקה שואלת על יכולת ולא על מחרוזת. 5.10.2026 */
  { id: 'גודל טקסט',    names: ['ts2', 'ts3', 'big'], alt: 'fs' },
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

  const raw = fs.readFileSync(file, 'utf8');
  const src = cssOf(raw, app);                        /* ה-CSS — גם מקובץ נפרד */
  const js = jsOf(raw, app);                          /* ה-JS  — גם מקובץ נפרד */
  const fn = modesFn(js);
  if (!fn) { console.log(`✗ ${app}: אין פונקציה שמדליקה מצבי נגישות`); findings += 6; continue; }
  const am = body(js, fn);
  checked++;

  /* מה applyModes מדליק בפועל */
  const toggled = new Set();
  let m;
  const re = /classList\.toggle\(\s*["']([^"']+)["']/g;
  while ((m = re.exec(am))) toggled.add(m[1]);

  const setsTheme = /setAttribute\(\s*["']data-theme["']|removeAttribute\(\s*["']data-theme["']/.test(am);
  /* גודל טקסט אינו חייב להיות `--fs`: science-mid מזיזה את
     `documentElement.style.fontSize` בין שני גדלים, וזו אותה יכולת
     בדיוק. הבדיקה שואלת על יכולת ולא על מחרוזת — 5.10.2026. */
  const setsFs    = /setProperty\(\s*["']--fs["']/.test(am);
  const setsRootFs = /\.style\.fontSize\s*=/.test(am);
  /* reader — כלי ולא אפליקציית לימוד, ושלוש היכולות האלה מיושמות בו
     במשתני CSS משלו: `--size` לגודל, `--ls`/`--ws` לריווח, ומחלקת
     `light` לערכת הצבע. אותן יכולות, מימוש אחר. 5.10.2026 */
  const setsVarFs = /setProperty\(\s*["']--size["']/.test(am) && /var\(\s*--size\b/.test(src);
  const setsVarSp = /setProperty\(\s*["']--(?:ls|ws)["']/.test(am) && /var\(\s*--(?:ls|ws)\b/.test(src);
  const setsLight = /classList\.toggle\(\s*["']light["']/.test(am) && hasCss(src, 'light');

  const rows = [];
  let bad = 0;

  for (const cap of CAPS) {
    /* ערכת צבע וגודל טקסט עשויים להיות מיושמים במשתנה CSS ולא במחלקה */
    if (cap.alt === 'theme') {
      if (setsTheme && /\[data-theme/.test(src)) rows.push([cap.id, 'data-theme', 'ok']);
      else if (setsLight) rows.push([cap.id, '.light', 'ok']);
      else { rows.push([cap.id, setsTheme ? 'data-theme' : '—', setsTheme ? 'אין CSS' : 'לא מחווט']); bad++; }
      continue;
    }

    const found = cap.names.filter(n => toggled.has(n));

    if (!found.length && cap.alt === 'fs') {
      /* `var(--fs,17px)` — עם ערך גיבוי — הוא הכתיב שבשימוש, ולכן
         אין לדרוש סוגר מיד אחרי השם. הדרישה הזאת הפילה שלוש
         אפליקציות תקינות בגרסה הראשונה של הבדיקה הזאת. */
      if (setsFs && /var\(\s*--fs\b/.test(src)) { rows.push([cap.id, '--fs', 'ok']); continue; }
      if (setsRootFs) { rows.push([cap.id, 'style.fontSize', 'ok']); continue; }
      if (setsVarFs)  { rows.push([cap.id, '--size', 'ok']); continue; }
      rows.push([cap.id, setsFs ? '--fs' : '—', setsFs ? 'אין CSS' : 'לא מחווט']); bad++; continue;
    }

    if (!found.length && cap.id === 'ריווח' && setsVarSp) { rows.push([cap.id, '--ls/--ws', 'ok']); continue; }
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
