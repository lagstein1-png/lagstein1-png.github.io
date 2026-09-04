/* שומר על כלל השם.

   ״DriveWise״ אסור כשם מותג (3.9.2026, חשש לזכויות יוצרים וסימן
   מסחר), והשם הרשמי הוא ״תאוריה מדברת״. ביום שההחלטה התקבלה הכלל
   כבר התקיים בקוד — הבדיקה הזאת אינה מתקנת דבר, היא מונעת נסיגה.

   ולמה בדיקה ולא רק מסמך: אפליקציה חדשה נולדת מהעתקה של אפליקציה
   קיימת, ומחרוזת שיווקית מועתקת מדף לדף. מסמך אינו עוצר העתקה,
   וזה בדיוק הנימוק שכתוב ב-README על `cache.js`.

   שני מסמכי הכלל — NAMING.md ו-CLAUDE.md — מוחרגים, כי הם המקום
   היחיד במאגר שבו השם מופיע בכוונה. בלי ההחרגה הבדיקה הייתה
   נכשלת על הכלל שהיא באה לאכוף. מאותה סיבה בדיוק מוחרג גם הקובץ
   הזה: הוא מכיל את השם האסור בביטוי הרגולרי ובהודעת השגיאה, ובלי
   ההחרגה הוא היה נכשל על עצמו בכל הרצה.

   שלושת המוחרגים הם רשימה סגורה. קובץ רביעי שיצטרך להזכיר את השם
   הוא סימן שמשהו זולג, ולא סיבה להאריך את הרשימה.
*/
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BANNED = /DriveWise|Drivewise|DRIVEWISE/;
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
      if (BANNED.test(ln)) {
        console.log(`✗ ${rel}:${i + 1}: ״DriveWise״ אסור כשם מותג. השם הוא ״${OFFICIAL.he}״`);
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
  card = (D.APPS || []).find(x => x.id === 'drivewise');
} catch (e) { /* נופל לענף שמתחת */ }

if (!card) {
  console.log('✗ index.html: לא נמצאה רשומת drivewise ב-DATA.APPS. ' +
    'אם הנתיב שונה — לעדכן גם את ICONS, את מסמכי marketing ואת הבדיקה הזאת.');
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
  (bad ? '' : ' · ״DriveWise״ אינו מופיע מחוץ ל-NAMING.md ול-CLAUDE.md'));
process.exit(bad ? 1 : 0);
