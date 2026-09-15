/* =====================================================================
   learning-core/ — הספרייה שאיש אינו טוען, ולמה זה חייב להישאר כך.

   `learning-core/` קיימת כדי שאפליקציה חדשה תיבנה ממנה. נמדד
   15.9.2026 שהיא **נסחפה מהמנוע החי**, ומי שיאמץ אותה היום יקבל
   באגים שכבר תוקנו בשתים־עשרה האפליקציות:

     מנגנון                       math-uni   core.js
     startKeepAlive — שומר-ער         2         2  ✓
     _activeU — ההפניה החיה           5         0
     ttsWatchdog — שומר הזמן          2         0
     _netVoiceOK — נפילה מקול רשת     3         0
     pure — המבחן הכיתתי              4         0

   כלומר הקראה שנתקעת בשלוש דרכים שקטות, ומבחן שבו המורה והתלמיד
   רואים שאלות אחרות. זה בדיוק ״אפליקציה חדשה נולדת מהעתקה ולכן
   מעתיקה גם את הבאג״ שב-CLAUDE.md, רק שכאן הבאג מחכה מראש.

   **הבדיקה אינה אוסרת את הספרייה ואינה מוחקת אותה.** היא אוסרת
   **אימוץ** כל עוד הפער קיים: ברגע שדף כלשהו יטען אותה, היא
   תיפול ותאמר איזה מנגנון חסר. מי שישלים את החמישה — הבדיקה
   תיתן לו לעבור.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const LIB = path.join(ROOT, 'learning-core');
let bad = 0;
const fail = m => { console.log('✗ ' + m); bad++; };

if (!fs.existsSync(LIB)) { console.log('· learning-core/ אינה קיימת — אין מה לבדוק'); process.exit(0); }

/* --- 1. הפער מול המנוע החי, נמדד ולא מרשימה קשיחה --- */
/* **הייחוס הוא איחוד על כל האפליקציות, ולא אפליקציה אחת.**
   גרסה ראשונה השוותה מול `math-uni` בלבד והחמיצה את `pure`:
   משפחת המתמטיקה מחוללת שאלה מפרמטרים ואינה משתמשת בו כלל
   (CLAUDE.md אומר את זה במפורש), ולכן הייחוס החזיר 0 והבדיקה
   הסיקה שאין מה לדרוש. מנגנון שקיים ולו באפליקציה חיה אחת
   הוא מנגנון שהספרייה חייבת לשאת. */
const core = fs.readFileSync(path.join(LIB, 'core.js'), 'utf8');
const NEED = ['startKeepAlive', '_activeU', 'ttsWatchdog', '_netVoiceOK', 'pure'];
const count = (s, n) => s.split(n).length - 1;
const APPS = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'learning-core'
            && fs.existsSync(path.join(ROOT, d.name, 'sw.js')))
  .map(d => d.name);
const inLive = new Set();
for (const a of APPS) {
  for (const f of ['index.html', 'app.js', 'speech.js']) {
    const fp = path.join(ROOT, a, f);
    if (!fs.existsSync(fp)) continue;
    const t = fs.readFileSync(fp, 'utf8');
    for (const n of NEED) if (count(t, n) > 0) inLive.add(n);
  }
}
const missing = NEED.filter(n => inLive.has(n) && count(core, n) === 0);

/* --- 2. אף דף אינו טוען אותה כל עוד הפער קיים --- */
/* נסרק כל HTML שנעקב, ולא רשימת אפליקציות — כדי שדף חדש
   שייטען אותה ייתפס גם הוא. */
const { execFileSync } = require('child_process');
const tracked = execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(Boolean).filter(f => !f.startsWith('learning-core/'));
const loaders = tracked.filter(f =>
  /learning-core\//.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));

if (loaders.length && missing.length) {
  for (const f of loaders)
    fail(`${f} טוען את learning-core/, וחסרים בה: ${missing.join(', ')}`);
  console.log('    השלם אותם ב-learning-core/core.js, או אל תטען אותה.');
} else if (loaders.length) {
  console.log(`· ${loaders.length} דפים טוענים את learning-core/, והיא מלאה מול המנוע החי`);
} else {
  console.log(`· אף דף אינו טוען את learning-core/ — ${missing.length ? 'חסרים בה: ' + missing.join(', ') : 'והיא מלאה'}`);
}

/* --- 3. מניין הבדיקות שהתיעוד נוקב בו מול מה ש-test.js מחזיר --- */
/* ARCHITECTURE.md נשא ״53 בדיקות״ ומיד אחר כך ציטוט פלט ״48
   עברו״ — שני מספרים סותרים, ושניהם שגויים. */
let ran = null;
try {
  const out = execFileSync(process.execPath, [path.join(LIB, 'test.js')], { encoding: 'utf8' });
  const m = out.match(/(\d+)\s+עברו/);
  if (m) ran = +m[1];
} catch (e) { fail('learning-core/test.js אינו רץ: ' + String(e.message).slice(0, 70)); }

if (ran !== null) {
  for (const doc of ['ARCHITECTURE.md', 'CLAUDE.md']) {
    const t = fs.readFileSync(path.join(ROOT, doc), 'utf8');
    const claims = [...t.matchAll(/\*?\*?(\d+)\*?\*?\s+בדיקות ב-`test\.js`|(\d+) בדיקות\s*\n?לוגיקה/g)]
      .map(x => +(x[1] || x[2])).filter(Boolean);
    for (const c of claims)
      if (c !== ran) fail(`${doc} נוקב ב-${c} בדיקות, ו-test.js מחזיר ${ran}`);
  }
  if (!bad) console.log(`✓ test.js מחזיר ${ran} בדיקות, והתיעוד תואם`);
}

/* --- 4. התבנית: מניפסט שאפליקציה אמיתית יכולה לצאת ממנו ------
   **נמדד 16.9.2026, ואיש לא הסתכל על התיקייה הזאת מעולם.**
   `learning-core/template/manifest.json` הפנה אל
   `./img/icon-512-maskable.png` — שם שאינו קיים באף אפליקציה
   במאגר. השם האמיתי הוא `icon-maskable-512.png`, בכל שתים־עשרה.
   אפליקציה שהייתה נולדת מהתבנית הייתה מקבלת אייקון maskable
   שבור, ו-`manifest.json` שאין בו `id`, `description`,
   `orientation`, `categories` ולא `screenshots` — כלומר גם
   הזהות של ה-PWA וגם חלון ההתקנה העשיר באנדרואיד.

   **וזו בדיוק המלכודת שהקובץ הזה נבנה בשבילה, בכיוון ההפוך.**
   שלוש הבדיקות למעלה חוסמות אימוץ של `learning-core` כל עוד
   היא נסחפת מהמנוע החי; הבדיקה הזאת שומרת שהתבנית עצמה לא
   תהיה שבורה כשמישהו כן יאמץ אותה.

   ההשוואה היא מול מניפסט **אמיתי** ולא מול רשימה שכתובה כאן,
   ולכן שדה שייכנס לאפליקציות יידרש מהתבנית מאליו. */
const TPL = path.join(LIB, 'template', 'manifest.json');
const REF = path.join(ROOT, 'ulpan', 'manifest.json');
if (fs.existsSync(TPL) && fs.existsSync(REF)) {
  let t = null, r = null;
  try { t = JSON.parse(fs.readFileSync(TPL, 'utf8')) } catch (e) { fail('התבנית אינה JSON תקין: ' + e.message) }
  try { r = JSON.parse(fs.readFileSync(REF, 'utf8')) } catch (e) {}
  if (t && r) {
    const miss = Object.keys(r).filter(k => !(k in t));
    if (miss.length) fail('התבנית חסרה שדות שיש במניפסט אמיתי: ' + miss.join(', '));

    /* כל src בתבנית חייב להיות שם קובץ שקיים באפליקציה אמיתית */
    const real = new Set(fs.readdirSync(path.join(ROOT, 'ulpan', 'img')));
    const srcs = [].concat(t.icons || [], t.screenshots || []).map(x => x && x.src).filter(Boolean);
    for (const src of srcs) {
      const base = src.split('/').pop();
      if (!real.has(base))
        fail(`התבנית מפנה ל-${src}, ואין קובץ בשם ${base} באף אפליקציה`);
    }
    if (!bad) console.log(`✓ התבנית: ${Object.keys(t).length} שדות ו-${srcs.length} נכסים, כולם כשל מניפסט אמיתי`);
  }
}

console.log(`\n${bad} ממצאים ב-learning-core/`);
process.exit(bad ? 1 : 0);
