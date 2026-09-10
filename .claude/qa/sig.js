/* =====================================================================
   חתימת התוכן שנסרק — כדי שדוח לא יטען על עץ שכבר אינו קיים.

   `content.js` ו-`content806.js` כותבים אותה לתוך הדוח, ו-`fresh.js`
   מחשב אותה מחדש ומשווה. השתיים כאן ולא בכל קובץ בנפרד, כדי שלא
   ייווצר הפרש בין מי שכותב למי שבודק.

   **למה זה נדרש.** נמדד 10.9.2026: `reports/lomda.json` שב-`main`
   אמר `REVIEW · lang-untranslated:3` — שלוש שאלות מתוך 540 במעבר
   הערבי נשאו טקסט עברי באפשרות. סריקה טרייה על אותו קוד החזירה
   `PASS`, וסריקה דטרמיניסטית של 9,492 מחרוזות `ar`/`ru`/`en` בכל
   19 קובצי התוכן החזירה אפס. הסיבה: הדוח נכתב ב-`11adb76` (01:05),
   ואחריו `lomda/data/` זז פעמיים — `c10bd22` ב-01:07 ו-`0488e6b`
   ב-01:27, 204 שורות בשלושה קבצים. הדוח תיאר עץ שכבר אינו קיים.

   ו-`REVIEW` מיושן הוא הכיוון הפחות מסוכן. `stage.js` קורא את
   `verdict` מאותו קובץ ואינו שואל מתי הוא נכתב, ולכן **`PASS`
   מיושן מעביר בשער תוכן שלא נסרק מעולם.**

   **מה נכנס לחתימה: מה שהדוח באמת קורא.** `sw.js` אינו בפנים —
   הוא חיווט מטמון ולא תוכן, והוא משתנה בכל העלאת גרסה.

   **ומחרוזות הגרסה מנוטרלות לפני החישוב.** העלאת `BUILD` ומפתח
   הקאש היא חובה בכל שינוי, ולכן בלי הנטרול כל שינוי גרסה היה
   מסמן את הדוח כמיושן — התראת שווא בדיוק בהיקף שהמאגר הזה מתעד
   שוב ושוב.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');

/* מקורות התוכן לכל אפליקציה — ורק מה שהדוח שלה קורא.
   ברירת המחדל היא `index.html` לבדו: שם יושבים גם הבנק וגם
   `buildQ`. `lomda` מחזיקה את התוכן ב-`data/`, ו-`bagrut-806`
   נסרקת על ידי `content806.js` שקורא את `data/exams.js` בלבד. */
function sourcesOf(app) {
  const out = [];
  if (app === 'bagrut-806') {
    out.push(path.join(ROOT, app, 'data', 'exams.js'));
    return out.filter(f => fs.existsSync(f));
  }
  out.push(path.join(ROOT, app, 'index.html'));
  const dataDir = path.join(ROOT, app, 'data');
  if (fs.existsSync(dataDir))
    for (const f of fs.readdirSync(dataDir).filter(x => x.endsWith('.js')).sort())
      out.push(path.join(dataDir, f));
  return out.filter(f => fs.existsSync(f));
}

/* מנטרל את שתי מחרוזות הגרסה, ואת שורת התאריך של הדוח אם נקלעה. */
function normalize(src) {
  return String(src)
    .replace(/var BUILD\s*=\s*"[^"]*"/g, 'var BUILD="—"')
    .replace(/sw\.js\?v=[A-Za-z0-9_.-]+/g, 'sw.js?v=—');
}

function sigOf(app) {
  const files = sourcesOf(app);
  if (!files.length) return null;
  const h = crypto.createHash('sha256');
  for (const f of files) {
    h.update(path.relative(ROOT, f).replace(/\\/g, '/'));
    h.update('\0');
    h.update(normalize(fs.readFileSync(f, 'utf8')));
    h.update('\0');
  }
  return h.digest('hex').slice(0, 16);
}

module.exports = { sigOf, sourcesOf, normalize, ROOT };
