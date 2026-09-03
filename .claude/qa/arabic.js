/* =====================================================================
   האם הממשק הערבי באמת מוצג בגופן שיש בו גליפים ערביים.

     node .claude/qa/arabic.js                כל הדפים שיש בהם ערבית
     node .claude/qa/arabic.js english reader דפים נבחרים

   למה הבדיקה הזאת קיימת
   ---------------------
   Heebo, Fredoka ו-Assistant — שלושת הגופנים שהפורטפוליו נשען
   עליהם — אינם מכילים גליפים ערביים כלל. דף שמצהיר `font-family:
   Heebo` ומציג טקסט ערבי אינו נכשל ואינו מזהיר: הדפדפן נופל
   בשקט לגופן ברירת המחדל של המערכת, גליף אחר גליף. התוצאה תלויה
   במכשיר, לרוב מכוערת, ולעולם אינה מה שעוצב.

   זה לא היה תיאורטי. ב-3.9 נמדד שבשמונה מעשר הדפים הממשק הערבי
   הוצג כך — `Heebo` בשבעה, `Assistant` ב-reader — ואיש לא דיווח,
   מפני שמי שרואה את זה אינו קורא עברית וגם לא כותב באגים בעברית.

   מה נבדק
   -------
   1. הדף מצהיר על ממשק ערבי בכלל (יש לו מילון `ar`).
   2. הבקשה לגופנים כוללת משפחה ערבית.
   3. יש כלל CSS שמחיל אותה כשהממשק ערבי.

   הבדיקה קוראת קוד בלבד. אין דפדפן ואין שרת — ולכן היא זולה מספיק
   כדי לרוץ בכל פעם. את האימות בפועל עושים בדפדפן: מחליפים את
   הממשק לערבית ובודקים ‎getComputedStyle(el).fontFamily‎.
   ===================================================================== */
'use strict';

const fs = require('fs');

/* גופנים שאין בהם ערבית ומופיעים בפורטפוליו. הרשימה כאן כדי
   שההודעה תוכל לומר *איזה* גופן היה תופס, ולא רק ש"חסר". */
const NO_ARABIC = ['Heebo', 'Rubik', 'Fredoka', 'Assistant', 'Lexend'];
/* משפחות שיש בהן גליפים ערביים ומותר להסתמך עליהן */
const ARABIC_OK = /Noto\s*Sans\s*Arabic|Noto\+Sans\+Arabic|Cairo|Amiri|Tajawal|Almarai|IBM\s*Plex\s*Sans\s*Arabic/i;

const PAGES = process.argv.slice(2).length ? process.argv.slice(2)
  : ['.', 'math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
     'english', 'history', 'ulpan', 'reader', 'bagrut-806'];

let checked = 0, findings = 0;

for (const page of PAGES) {
  const file = page === '.' ? 'index.html' : page + '/index.html';
  if (!fs.existsSync(file)) { console.log(`· ${page.padEnd(11)} אין קובץ`); continue; }
  const src = fs.readFileSync(file, 'utf8');

  /* יש כאן ממשק ערבי בכלל? דף בעברית בלבד אינו ממצא. */
  const hasArabic = /[؀-ۿ]/.test(src) &&
                    /(^|[^A-Za-z])ar\s*:\s*[{"']|"ar"\s*:/.test(src);
  if (!hasArabic) { console.log(`· ${page.padEnd(11)} אין ממשק ערבי — לא נבדק`); continue; }
  checked++;

  /* "נטענת" פירושו שהמשפחה באמת נמשכת — מבקשת הגופנים או מ-@font-face.
     הגרסה הראשונה של הבדיקה חיפשה את השם בכל הקובץ, ולכן הצהרת
     `--ar:"Noto Sans Arabic"` לבדה סיפקה אותה: הסרתי את המשפחה
     מבקשת הגופנים והבדיקה עברה. שם משפחה בלי טעינה עובד רק אם
     היא מותקנת במכשיר, וזו הנחה שאי אפשר לסמוך עליה. */
  const linkHrefs = (src.match(/<link[^>]*href="[^"]*"[^>]*>/gi) || []).join(' ');
  const faces = (src.match(/@font-face\s*\{[^}]*\}/gi) || []).join(' ');
  const loads = ARABIC_OK.test(linkHrefs) || ARABIC_OK.test(faces);

  /* כלל שמחיל את המשפחה כשהממשק ערבי. שני ניסוחים תקינים ושונים
     קיימים בפורטפוליו, ושניהם עובדים: דף הבית נוקב בשם המשפחה
     בתוך הכלל, והאפליקציות עוברות דרך משתנה --ar. בדיקה שדרשה
     רק את השני הכשילה את דף הבית שנמדד בדפדפן כתקין — ובודק
     שמכשיל קוד עובד נזרק אחרי הפעם השנייה. */
  const varIsArabic = (() => {
    const m = /--ar\s*:\s*([^;]+);/.exec(src);
    return !!(m && ARABIC_OK.test(m[1]));
  })();
  let applies = false;
  const rule = /([^{}]*\[lang\s*=\s*["']?ar["']?\][^{}]*)\{([^}]*)\}/g;
  let r;
  while ((r = rule.exec(src))) {
    const body = r[2];
    if (!/font-family/.test(body)) continue;
    if (ARABIC_OK.test(body)) { applies = true; break; }
    if (/var\(\s*--ar\b/.test(body) && varIsArabic) { applies = true; break; }
  }

  if (loads && applies) {
    console.log(`✓ ${page.padEnd(11)} נטענת משפחה ערבית ומוחלת על lang="ar"`);
    continue;
  }
  findings++;
  const would = NO_ARABIC.filter(f => new RegExp('font[^;]*\\b' + f + '\\b', 'i').test(src))[0] || 'ברירת המחדל של המערכת';
  const why = !loads && !applies ? 'לא נטענת משפחה ערבית ואין כלל שמחיל אותה'
            : !loads ? 'המשפחה נזכרת ב-CSS אך אינה נטענת מבקשת הגופנים'
            : 'נטענת אך אין כלל שמחיל אותה על lang="ar"';
  console.log(`✗ ${page.padEnd(11)} ${why} — הערבית תוצג ב-${would}`);
}

console.log(`\n${checked} דפים עם ממשק ערבי נבדקו, ${findings} ממצאים`);
process.exit(findings ? 1 : 0);
