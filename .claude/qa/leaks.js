/* =====================================================================
   leaks.js — התיאור של פריט מתוארך אינו מצטט את הכותרת שלו.

   שאלת ״על איזה אירוע מדובר?״ בלומדה מקריאה את התיאור (w) ומבקשת את
   הכותרת (t). תיאור שמכיל את הכותרת מילה במילה מסגיר את התשובה למי
   שמאזין — בדיוק מה ש-say.js תופס, אבל say.js דוגם 60 שאלות באקראי
   מתוך אלפים ולכן מאדים רק לפעמים (8.9.2026: ירוק מקומית, אדום ב-CI
   על אותו קומיט). הבדיקה הזאת עוברת על כל פריט בכל מאגר, בארבע
   השפות, ואינה תלויה במזל.

   הוכחת נפילה (8.9.2026, לפני התיקון): 7 ממצאים — edu.js ×6, geo.js ×1.
   אחרי הניסוח מחדש: 0.

   ---------------------------------------------------------------------
   9.9.2026 — אותה דליפה בדיוק בפריט `C`, ולמה היא נעדרה כאן.

   שאלת מושג מציגה את המושג (t) ומבקשת לבחור את ההגדרה (d) מארבע.
   הגדרה שמכילה את המושג מסמנת את עצמה, והלומד בוחר נכון בהתאמת
   מחרוזת — הציון מודד זיכרון ויזואלי במקום ידע. עד היום הבדיקה
   סיננה `it.k !== 'e'` ולכן לא שאלה את השאלה על `C` כלל.

   נמדד לפני התיקון: **325 דליפות ב-594 פריטי C, ב-14 מתוך 18
   קבצים** — geo 96, edu 91, chem 46, phys 25, eng 20, heat 12,
   science 10, civics 9, bio 6, media 3, health 3, digital 2,
   med 1, money 1. המשפחה נסגרה ידנית פעמיים לפני כן בשלושה
   קבצים בלבד, וחזרה — מפני שלא היה שומר.

   **ההשוואה היא לפי גבול מילה ולא תת־מחרוזת, וזה נלמד ביוקר.**
   `ion` יושב בתוך `solution`, ו-`הר` בתוך `הרבה`. השוואת
   `includes` סימנה את שניהם, וההגדרה האנגלית של ״יון״ שונתה
   מ-`a solution conduct electricity` ל-`the liquid` כדי לספק
   מדד שטעה — כלומר **המדד הכריח הורדת דיוק**. הניסוח הוחזר,
   וההשוואה נעשית היום מול `(^|לא-אות)מונח($|לא-אות)` עם דגל
   `u`, בארבע השפות.

   מגבלה ידועה ומוצהרת: **צורה נטויה אינה נתפסת.** ״יונים״ מול
   המושג ״יון״ יעבור. זו בחירה — הרחבה מורפולוגית הייתה מחזירה
   את השקר של `solution`, ובדיקה שנדלקת על תוכן תקין מאמנת
   להתעלם ממנה.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const DIR = path.join(ROOT, 'lomda', 'data');
const LANGS = ['he', 'ar', 'ru', 'en'];

/* גבול מילה ולא תת־מחרוזת: `ion` יושב בתוך `solution`, `הר` בתוך
   `הרבה`. \b של JS הוא ASCII בלבד ואינו מכיר עברית, ערבית וקירילית,
   ולכן הגבול נכתב במפורש כ"תחילת מחרוזת או תו שאינו אות". */
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function hasWord(hay, needle) {
  try {
    return new RegExp('(^|[^\\p{L}])' + esc(needle) + '($|[^\\p{L}])', 'iu').test(hay);
  } catch (e) { return hay.indexOf(needle) >= 0; }
}

const ctx = { window: { BANKS: [] }, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(DIR, 'schema.js'), 'utf8'), ctx, { filename: 'schema.js' });

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.js') && f !== 'schema.js').sort();
let items = 0, concepts = 0, bad = 0;
for (const f of files) {
  const before = ctx.window.BANKS.length;
  vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), ctx, { filename: f });
  for (const b of ctx.window.BANKS.slice(before))
    for (const tp of (b.topics || []))
      for (const L of (tp.L || []))
        for (const it of (Array.isArray(L) ? L : (L.items || []))) {
          if (!it) continue;
          if (it.k === 'e') {
            items++;
            for (const lg of LANGS) {
              const t = (it.t || {})[lg], w = (it.w || {})[lg];
              if (t && w && w.indexOf(t) >= 0) {
                console.log(`✗ ${f} · ${it.y} · ${lg}: התיאור מצטט את הכותרת ״${t}״ — ההקראה מסגירה את התשובה`);
                bad++;
              }
            }
          } else if (it.k === 'c') {
            concepts++;
            for (const lg of LANGS) {
              const t = ((it.t || {})[lg] || '').trim(), d = ((it.d || {})[lg] || '').trim();
              if (t && d && hasWord(d, t)) {
                console.log(`✗ ${f} · ${lg}: ההגדרה מכילה את המושג ״${t}״ — אפשר לבחור בהתאמת מחרוזת בלי לדעת`);
                bad++;
              }
            }
          }
        }
}
console.log(`${bad ? '✗' : '✓'} ${items} פריטי E ו-${concepts} פריטי C ב-${files.length} קבצים, ${bad} שמצטטים את מה שהם אמורים ללמד`);
process.exit(bad ? 1 : 0);
