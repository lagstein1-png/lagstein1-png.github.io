/* =====================================================================
   guide.js — שם כפתור שהמדריך מבטיח, וכבר אינו בממשק

   `GUIDE.md` מפנה את הלומד לכפתורים בשמם. שם שהשתנה בקוד הופך את
   המדריך למסלול אל כפתור שאינו קיים — והלומד שמחפש אותו אינו יודע
   שהמסמך התיישן, הוא חושב שהוא לא מוצא.

   **זה קרה, ותוך יממה אחת.** המדריך נכתב 11.9.2026, וכבר למחרת
   בבוקר שלוש מההפניות שבו היו שגויות אחרי קומיט אחד (5a7b5b3):

     · ״עזרה מהמורה״      → ״ג׳וש — עזרה מהמורה״   (tutor/tutor.js)
     · ״בפינת המסך״        → בשורה של ״רמז״          (lomda/index.html)
     · ״כפתור הבית בסרגל״  → פוטר ״כל האפליקציות״    (שתים־עשרה)

   השלישית הייתה הגרועה: היא הפנתה לכפתור שמעולם לא היה קיים.
   `naming.js` ו-`cache.js` שומרים על התיעוד הטכני; על המדריך לא
   שמר איש, והוא נבדק רק כשמישהו קרא אותו.

   **מה נבדק:** כל מחרוזת ב-`GUIDE.md` שעטופה ב-`**״…״**`. זו
   ההצהרה ״ככה הכפתור נקרא במסך״, והיא נחפשת מילולית בקובצי
   הממשק. נמצאה — עובר; לא נמצאה — כישלון, עם השם והשורה במדריך.

   **וכיוון אחד אינו מספיק — נמדד.** הבדיקה הזאת לבדה עוברת על
   המדריך **שלפני** התיקון: ״עזרה מהמורה״ אמנם ירד מהכפתור, אבל
   הוא שרד ב-`title:` של אותו קובץ, ולכן החיפוש מצא אותו. בדיקה
   שאינה נופלת על המקרה שבגללו נבנתה אינה בודקת כלום.

   לכן יש **שער שני, בכיוון ההפוך**: תווית שהיא מקור ידוע —
   `he:{ btn: … }` ב-`tutor/tutor.js`, שם הכפתור של ג׳וש —
   **חייבת להופיע במדריך כלשונה**. שינוי שם שם מפיל את הבדיקה עד
   שהמדריך מתעדכן, וזה בדיוק מה שקרה ב-5a7b5b3.

   **מה אינו נבדק, ומוצהר:** סימנים שאינם בגרשיים — ▶, ⏮, ⏭
   שבמקריא — אינם נתפסים בתבנית. הם כתובים במדריך כתווים ולא
   כשם, ובדיקה עליהם הייתה רשימה קשיחה שמתיישנת בעצמה. וכן:
   השער הראשון מאשר שהמחרוזת קיימת **אי־שם** בקובצי הממשק, ולא
   שהיא דווקא על כפתור — הבחנה כזאת דורשת לדעת איזה מפתח במילון
   הוא הכפתור, וזה ידוע רק במקורות של השער השני.

   הרצה: node .claude/qa/guide.js [שורש]
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '..', '..');

const GUIDE = path.join(ROOT, 'GUIDE.md');
if (!fs.existsSync(GUIDE)) { console.log('✗ GUIDE.md אינו קיים'); process.exit(1); }

/* קובצי הממשק: כל index.html בשורש ובתיקיות הבת, ה-app.js של 806,
   והתשתית של ג׳וש. רשימה נגזרת ולא קשיחה — אפליקציה חדשה נכנסת לבד. */
const FACES = [];
const push = p => { const f = path.join(ROOT, p); if (fs.existsSync(f)) FACES.push(p); };
push('index.html');
for (const d of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name.startsWith('.')) continue;
  push(path.join(d.name, 'index.html'));
  push(path.join(d.name, 'app.js'));
}
push(path.join('tutor', 'tutor.js'));

const hay = FACES.map(f => ({ f, s: fs.readFileSync(path.join(ROOT, f), 'utf8') }));

/* ״…״ — גרשיים עבריים (U+05F4), וזה מה שהמדריך משתמש בו לשמות כפתורים */
const lines = fs.readFileSync(GUIDE, 'utf8').split('\n');
const RE = /\*\*״([^״]+)״\*\*/g;

const seen = new Map();                 /* שם → השורה הראשונה שבה הוא מוזכר */
lines.forEach((ln, i) => {
  let m; RE.lastIndex = 0;
  while ((m = RE.exec(ln))) if (!seen.has(m[1])) seen.set(m[1], i + 1);
});

let missing = 0, drifted = 0;
for (const [label, line] of seen) {
  const hit = hay.find(h => h.s.indexOf(label) >= 0);
  if (hit) continue;
  missing++;
  console.log(`✗ GUIDE.md:${line} — ״${label}״ אינו נמצא באף קובץ ממשק`);
}

/* ---- שער שני: מקור ידוע חייב להופיע במדריך ----
   הכיוון ההפוך. כאן הממשק הוא המקור והמדריך הוא מי שצריך להתיישר,
   ולכן שינוי שם בקוד מפיל את הבדיקה במקום להיבלע. */
const guideText = fs.readFileSync(GUIDE, 'utf8');
const SOURCES = [
  { file: path.join('tutor', 'tutor.js'), re: /he:\s*\{\s*btn:\s*"([^"]+)"/, what: 'שם הכפתור של ג׳וש' }
];
for (const src of SOURCES) {
  const full = path.join(ROOT, src.file);
  if (!fs.existsSync(full)) { console.log(`✗ ${src.file} אינו קיים`); drifted++; continue; }
  const m = fs.readFileSync(full, 'utf8').match(src.re);
  if (!m) { console.log(`✗ ${src.file} — לא נמצא ${src.what}; התבנית התיישנה`); drifted++; continue; }
  if (guideText.indexOf(m[1]) < 0) {
    drifted++;
    console.log(`✗ ${src.what} הוא ״${m[1]}״ (${src.file}) — והמדריך אינו מזכיר אותו`);
  }
}

const n = seen.size;
if (missing || drifted) {
  const part = [];
  if (missing) part.push(`${missing} מתוך ${n} שמות שהמדריך מבטיח אינם בממשק`);
  if (drifted) part.push(`${drifted} מתוך ${SOURCES.length} מקורות ידועים שהמדריך אינו מזכיר`);
  console.log(`\n✗ ${part.join(' · ')} · ${FACES.length} קובצי ממשק נסרקו`);
  process.exit(1);
}
console.log(`✓ ${n} שמות כפתורים במדריך קיימים בממשק, ו-${SOURCES.length} מקורות ידועים מופיעים בו · ${FACES.length} קובצי ממשק`);
