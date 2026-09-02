/* =====================================================================
   בודק את שנים־עשר קובצי ה-sw.js. שתי שאלות, ושתיהן נשאלות על כל
   האפליקציות יחד — כי שתיהן באגים שנולדים בהעתקה מקובץ קיים ולכן
   מגיעים לאפליקציה חדשה בלי שאיש שם לב.

     node .claude/qa/cache.js            # כל האפליקציות
     node .claude/qa/cache.js math-app   # רק אלה שנקבו בשמן

   1. **`caches.match` הגלובלי.** קריאה בלי שם מטמון סורקת את כל
      המטמונים של המקור, ולכן עותק ישן ששמר worker של אפליקציה אחרת
      עלול להיענות ראשון. ההגשה חייבת להיות `caches.open(CACHE)` ואז
      `c.match(req)` בתוכו. `caches.match` בתוך הערה הוא תקין — זו
      בדיוק ההערה שמסבירה למה לא משתמשים בו — ולכן ההערות מוסרות
      לפני החיפוש.

   2. **`BUILD` מול `?v=`.** מפתח המטמון גזור מ-`?v=` שבכתובת הרישום
      ואינו נגזר מ-`BUILD`. עדכון של אחד מהם לבדו משאיר את המשתמש עם
      הקוד הישן, וזו התקלה שהכי קשה לאבחן. הבדיקה משווה את הטוקן
      הראשון ב-`BUILD` לטוקן שלפני `-pwa1`.

   לדף הבית ול-`reader` אין `BUILD` כלל, מפני שאין להם פוטר שמציג
   גרסה. זה תקין ואינו נספר כשגיאה — הם נבדקים על מפתח קאש בלבד.
   ===================================================================== */
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

/* דפים בלי פוטר גרסה. לא חסר להם BUILD — הם פשוט לא מציגים אותו. */
const NO_BUILD = new Set(['.', 'reader']);

/* מחרוזת הרישום ו-BUILD יושבות ב-index.html, ובבגרות 806 ב-app.js.
   מחפשים בשני הקבצים ומדווחים באיזה מהם נמצאו. */
const HOSTS = ['index.html', 'app.js'];

/* גם /* *\/ וגם // — כדי ש-caches.match שבתוך הערה לא ייחשב שימוש.
   מחרוזות אינן מטופלות: אין ב-sw.js מחרוזת שמכילה "//" או "/*". */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
            .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
}

function lineOf(src, idx) { return src.slice(0, idx).split('\n').length; }

/* כל תיקייה שיש בה sw.js. "." הוא דף הבית. */
function allApps() {
  const out = fs.existsSync(path.join(ROOT, 'sw.js')) ? ['.'] : [];
  for (const e of fs.readdirSync(ROOT, { withFileTypes: true }))
    if (e.isDirectory() && !e.name.startsWith('.') &&
        fs.existsSync(path.join(ROOT, e.name, 'sw.js'))) out.push(e.name);
  return out;
}

const want = process.argv.slice(2).map(a => a.replace(/\/+$/, ''));
const apps = want.length ? want : allApps();

let bad = 0, checked = 0;
for (const app of apps) {
  const dir = path.join(ROOT, app);
  const sw = path.join(dir, 'sw.js');
  const name = app === '.' ? '(שורש)' : app;
  if (!fs.existsSync(sw)) { console.log(`✗ ${name}: אין sw.js`); bad++; continue; }
  checked++;

  /* 1 — caches.match מחוץ להערה */
  const code = stripComments(fs.readFileSync(sw, 'utf8'));
  const hits = [];
  const re = /caches\s*\.\s*match\s*\(/g;
  for (let m; (m = re.exec(code));) hits.push(lineOf(code, m.index));
  if (hits.length) {
    console.log(`✗ ${name}/sw.js: caches.match גלובלי בשורה ${hits.join(', ')}`);
    bad++;
  }

  /* 2 — BUILD מול ?v= */
  let host = null, src = null;
  for (const h of HOSTS) {
    const f = path.join(dir, h);
    if (!fs.existsSync(f)) continue;
    const t = fs.readFileSync(f, 'utf8');
    if (/serviceWorker\s*\.\s*register\s*\(\s*["'][^"']*sw\.js\?v=/.test(t)) { host = h; src = t; break; }
  }
  if (!host) { console.log(`✗ ${name}: לא נמצאה קריאת register עם sw.js?v=`); bad++; continue; }

  const reg = src.match(/serviceWorker\s*\.\s*register\s*\(\s*["'][^"']*sw\.js\?v=([^"'&]+)["']/);
  const key = reg[1];                       // למשל b40-pwa1
  const keyVer = key.replace(/-pwa\d*$/, '');
  const bm = src.match(/\bBUILD\s*=\s*["']([^"']+)["']/);

  if (!bm) {
    if (NO_BUILD.has(app)) console.log(`· ${name}: מפתח ${key} — אין BUILD, וזה תקין`);
    else { console.log(`✗ ${name}/${host}: מפתח ${key} אבל אין BUILD`); bad++; }
    continue;
  }
  const buildVer = bm[1].trim().split(/[\s·]+/)[0];
  if (buildVer === keyVer) console.log(`✓ ${name}/${host}: BUILD ${buildVer} = ?v=${key}`);
  else { console.log(`✗ ${name}/${host}: BUILD ${buildVer} אבל ?v=${key}`); bad++; }
}

console.log(`\n${checked} sw.js נבדקו, ${bad} ממצאים`);
process.exit(bad ? 1 : 0);
