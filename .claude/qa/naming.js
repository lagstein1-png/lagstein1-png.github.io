/* שומר על כלל השם.

   השם האנגלי הישן של ״תאוריה מדברת״ אסור לשימוש — חשש לזכויות
   יוצרים וסימן מסחר, 3.9.2026 — ובהחלטה מ-4.9.2026 הוא נמחק
   מהמאגר כליל, גם באות קטנה וגם כמזהה. אין שם חלופי.

   ולמה בדיקה ולא רק מסמך: אפליקציה חדשה נולדת מהעתקה של אפליקציה
   קיימת, ומחרוזת שיווקית מועתקת מדף לדף. מסמך אינו עוצר העתקה,
   וזה בדיוק הנימוק שכתוב ב-README על `cache.js`.

   **נשאר מופע חוקי אחד בכל המאגר**, והוא נתיב ולא שם: השדה `u`
   ברשומת האפליקציה שב-`DATA.APPS`. הכתובת שאליה הכרטיס מקשר
   נקבעת בשם הריפו הנפרד, ו-GitHub Pages מפרסם פרויקט תחת שם
   הריפו — ולכן היא לא ניתנת לשינוי מכאן. ברגע שהריפו יְשׁוּנֶה,
   השדה `u` נמחק והמזהה `theory` מספיק לבדו.

   הבדיקה אוכפת את זה: מחוץ לשדה הזה ולמסמכי הכלל, אף מופע אינו
   מותר — לא באות גדולה ולא באות קטנה.

   שני מסמכי הכלל — NAMING.md ו-CLAUDE.md — מוחרגים, כי הם המקום
   שבו הכלל מנוסח. מאותה סיבה מוחרג גם הקובץ הזה, שמכיל את המילה
   בביטוי הרגולרי ובהודעות. שלושת המוחרגים הם רשימה סגורה: קובץ
   רביעי שיזדקק למילה הוא סימן שמשהו זולג, ולא סיבה להאריך אותה.
*/
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BANNED = /drivewise/i;
/* המופע החוקי היחיד: שדה הנתיב ברשומת האפליקציה. הוא מנוכה מהשורה
   לפני החיפוש, ולכן מופע *נוסף* באותה שורה עדיין ייתפס. */
const LEGACY_PATH = '"u":"/drivewise/"';
const EXEMPT = new Set(['NAMING.md', 'CLAUDE.md', path.join('.claude', 'qa', 'naming.js')]);
const SKIP_DIR = new Set(['.git', 'img', 'vendor', 'node_modules', '.well-known']);
const TEXT = /\.(html|js|json|md|css|svg|txt|webmanifest)$/i;

/* השם הרשמי, ארבע שפות. מקור: NAMING.md */
const OFFICIAL = { he: 'תאוריה מדברת', ar: 'نظرية ناطقة', ru: 'Говорящая теория', en: 'Talking Theory' };

let bad = 0, scanned = 0;

/* --- 1. צורת המותג אינה מופיעה מחוץ למסמכי הכלל --- */
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIR.has(e.name)) walk(path.join(dir, e.name)); continue; }
    if (!TEXT.test(e.name)) continue;
    const full = path.join(dir, e.name);
    const rel = path.relative(ROOT, full);
    if (EXEMPT.has(rel)) continue;
    scanned++;
    const lines = fs.readFileSync(full, 'utf8').split('\n');
    lines.forEach((ln, i) => {
      if (BANNED.test(ln.split(LEGACY_PATH).join(''))) {
        console.log(`✗ ${rel}:${i + 1}: השם האנגלי הישן נמחק מהמאגר. השם הוא ״${OFFICIAL.he}״`);
        bad++;
      }
    });
  }
}
walk(ROOT);

/* --- 2. ארבע המחרוזות בכרטיס הן עדיין השם הרשמי --- */
/* הבדיקה הראשונה תופסת החזרה של השם האסור. היא לא הייתה תופסת
   החלפה של ״תאוריה מדברת״ בשם שלישי כלשהו, וזה אותו נזק. */
const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const a = home.indexOf('var DATA='), b = home.indexOf('\nvar APPS=DATA.APPS');
let card = null;
try {
  const D = JSON.parse(home.slice(a + 9, home.lastIndexOf('};', b) + 1));
  card = (D.APPS || []).find(x => x.id === 'theory');
} catch (e) { /* נופל לענף שמתחת */ }

if (!card) {
  console.log('✗ index.html: לא נמצאה רשומה עם id="theory" ב-DATA.APPS. ' +
    'אם המזהה שונה — לעדכן גם את ICONS, את apps.js ואת הבדיקה הזאת.');
  bad++;
} else {
  for (const lg of Object.keys(OFFICIAL)) {
    if ((card.n[lg] || '').trim() === OFFICIAL[lg]) continue;
    console.log(`✗ index.html: השם ב-${lg} הוא "${card.n[lg]}" ולא "${OFFICIAL[lg]}"`);
    bad++;
  }
  if (BANNED.test(card.k || '')) {
    console.log('✗ index.html: מילות החיפוש של הכרטיס מכילות את השם האסור');
    bad++;
  }
  if (!bad) console.log('✓ הכרטיס בדף הבית: ' +
    Object.keys(OFFICIAL).map(l => card.n[l]).join(' · '));
}

console.log(`\n${scanned} קבצים נסרקו, ${bad} ממצאים` +
  (bad ? '' : ' · השם הישן אינו מופיע מחוץ למסמכי הכלל ולשדה u'));
process.exit(bad ? 1 : 0);
