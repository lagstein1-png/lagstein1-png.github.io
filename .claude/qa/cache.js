/* =====================================================================
   בודק את אחד־עשר קובצי ה-sw.js. שתי שאלות, ושתיהן נשאלות על כל
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

   3. **שם המטמון מול מה ש-`activate` מוחק.** `activate` מוחק לפי
      תחילית, ו-`caches.delete` אינו מוגבל ל-scope: תחילית שאינה
      תואמת ל-`CACHE` מוחקת את המטמון של אפליקציה אחרת, או משאירה את
      המטמון של האפליקציה עצמה לנצח. גם התחיליות בין האפליקציות
      נבדקות — אם אחת היא רישא של אחרת, ה-`activate` של הקצרה מוחק
      את הארוכה.

   4. **נתיבי ה-`PRE` שקיימים בדיסק.** ההתקנה עושה
      `c.add(u).catch(() => {})`, ולכן נתיב שגוי נבלע בשקט: האפליקציה
      נרשמת, מבטיחה אופליין, והקובץ פשוט אינו שם.

   5. **שומר הבעלות של דף הבית — בשורש בלבד.** ה-worker בשורש רשום
      ב-scope `/` ולכן רואה גם ניווט לאפליקציה אחרת בביקור הראשון,
      ומדלג עליו כדי לא לשמור עותק כפול. ל-worker של אפליקציה יש
      scope משלו, והשומר הזה בתוכו היה מבטל לו את כל הקאשינג. לכן:
      חובה בשורש, אסור בכל השאר.

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

/* שלוש התיקיות שאין להן sw.js משלהן, ולכן ה-worker של השורש מגיש
   אותן. הרשימה חייבת להיות זהה לזו שבשומר שבתוך sw.js של השורש. */
const ROOT_OWNS = ['img', 'legal', 'voice'];

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
const prefixes = [];
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

  /* 3 — שם המטמון מול מה ש-activate מוחק */
  const cm = code.match(/CACHE\s*=\s*["']([^"']+)["']/);
  const am = code.match(/startsWith\(\s*["']([^"']+)["']/);
  if (!cm || !am) {
    console.log(`✗ ${name}/sw.js: לא נמצא ${cm ? 'startsWith ב-activate' : 'CACHE'}`);
    bad++;
  } else if (cm[1] !== am[1]) {
    console.log(`✗ ${name}/sw.js: CACHE "${cm[1]}" אבל activate מוחק "${am[1]}"`);
    bad++;
  } else {
    prefixes.push([name, cm[1]]);
  }

  /* 4 — נתיבי PRE שקיימים בדיסק */
  const pm = code.match(/PRE\s*=\s*\[([\s\S]*?)\]/);
  if (!pm) { console.log(`✗ ${name}/sw.js: לא נמצאה רשימת PRE`); bad++; }
  else {
    const missing = [];
    for (const [, u] of pm[1].matchAll(/["']([^"']+)["']/g)) {
      /* נתיב מוחלט הוא מן השורש; יחסי — מתיקיית האפליקציה. */
      let f = u.startsWith('/') ? path.join(ROOT, u) : path.join(dir, u);
      if (u.endsWith('/')) f = path.join(f, 'index.html');
      if (!fs.existsSync(f)) missing.push(u);
    }
    if (missing.length) {
      console.log(`✗ ${name}/sw.js: PRE מצרף נתיב שאיננו קיים — ${missing.join(', ')}`);
      bad++;
    }
  }

  /* 5 — שומר הבעלות: בשורש בלבד */
  const guard = ROOT_OWNS.every(d => new RegExp(`["']${d}["']`).test(code));
  if (app === '.' && !guard) {
    console.log(`✗ (שורש)/sw.js: חסר השומר שמדלג על נתיבי אפליקציות אחרות (${ROOT_OWNS.join(', ')})`);
    bad++;
  } else if (app !== '.' && guard) {
    console.log(`✗ ${name}/sw.js: שומר הבעלות של דף הבית הועתק לכאן — הוא מבטל לאפליקציה את כל הקאשינג`);
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

/* התנגשות בין אפליקציות אינה תכונה של קובץ אחד, ולכן היא נבדקת
   בסוף ועל כל האפליקציות גם כשביקשו ממנו אחת. המטמון הוא
   prefix+V, ולכן תחילית אחת שהיא רישא של אחרת — ה-activate שלה
   מוחק את המטמון של השנייה בכל הפעלה. */
const all = [];
for (const app of allApps()) {
  const m = stripComments(fs.readFileSync(path.join(ROOT, app, 'sw.js'), 'utf8'))
              .match(/CACHE\s*=\s*["']([^"']+)["']/);
  if (m) all.push([app === '.' ? '(שורש)' : app, m[1]]);
}
for (const [a, pa] of all)
  for (const [b2, pb] of all)
    if (a !== b2 && pb.startsWith(pa)) {
      console.log(`✗ ${a} מוחק את המטמון של ${b2}: "${pa}" היא רישא של "${pb}"`);
      bad++;
    }

console.log(`\n${checked} sw.js נבדקו, ${bad} ממצאים`);
process.exit(bad ? 1 : 0);
