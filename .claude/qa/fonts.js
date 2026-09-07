/* =====================================================================
   האם הממשק הערבי והממשק הרוסי באמת מוצגים בגופן שיש בו את הכתב שלהם.

     node .claude/qa/fonts.js                 כל הדפים שיש בהם ערבית או רוסית
     node .claude/qa/fonts.js english reader  דפים נבחרים

   למה הבדיקה הזאת קיימת
   ---------------------
   Heebo, Fredoka, Assistant ו-Lexend — הגופנים שהפורטפוליו נשען
   עליהם — אינם מכילים גליפים ערביים, ורובם גם לא קיריליים. דף
   שמצהיר `font-family: Heebo` ומציג טקסט ערבי או רוסי אינו נכשל
   ואינו מזהיר: הדפדפן נופל בשקט לגופן ברירת המחדל של המערכת,
   גליף אחר גליף. התוצאה תלויה במכשיר, לרוב מכוערת, ולעולם אינה
   מה שעוצב.

   זה לא היה תיאורטי. ב-3.9 נמדד שבשמונה מעשר הדפים הממשק הערבי
   הוצג כך — `Heebo` בשבעה, `Assistant` ב-reader — ואיש לא דיווח,
   מפני שמי שרואה את זה אינו קורא עברית וגם לא כותב באגים בעברית.
   הערבית תוקנה אז; ב-7.9 נמדד שהרוסית הייתה באותו מצב בכל אחד־עשר
   הדפים שיש בהם ממשק רוסי, ולכן הבדיקה הורחבה מ-arabic.js לכאן.

   מה נבדק, לכל כתב בנפרד
   ----------------------
   1. הדף מצהיר על ממשק בשפה הזאת בכלל (יש לו מילון `ar` / `ru`).
   2. הבקשה לגופנים כוללת משפחה שיש בה את הכתב.
   3. יש כלל CSS שמחיל אותה כשהממשק בשפה הזאת.

   הבדיקה קוראת קוד בלבד. אין דפדפן ואין שרת — ולכן היא זולה מספיק
   כדי לרוץ בכל פעם. את האימות בפועל עושים בדפדפן: מחליפים את
   הממשק ובודקים ‎getComputedStyle(el).fontFamily‎.
   ===================================================================== */
'use strict';

const fs = require('fs');

/* גופנים שמופיעים בפורטפוליו ואין בהם את הכתב. הרשימה כאן כדי
   שההודעה תוכל לומר *איזה* גופן היה תופס, ולא רק ש"חסר". */
const SCRIPTS = {
  ar: {
    name: 'ערבית',
    chars: /[؀-ۿ]/,
    dict: /(^|[^A-Za-z])ar\s*:\s*[{"']|"ar"\s*:/,
    ok: /Noto[\s+]Sans[\s+]Arabic|Cairo|Amiri|Tajawal|Almarai|IBM[\s+]Plex[\s+]Sans[\s+]Arabic/i,
    lacks: ['Heebo', 'Rubik', 'Fredoka', 'Assistant', 'Lexend'],
    varName: '--ar',
  },
  ru: {
    name: 'רוסית',
    chars: /[Ѐ-ӿ]/,
    dict: /(^|[^A-Za-z])ru\s*:\s*[{"']|"ru"\s*:/,
    /* "Noto Sans" לבדו — ולא "Noto Sans Arabic" או "Noto Sans Hebrew",
       שאין בהם קירילית. Rubik מכיל קירילית, ולכן אינו ברשימת החסרים. */
    ok: /Noto[\s+]Sans(?![\s+]*(Arabic|Hebrew))|Roboto|Open[\s+]Sans|PT[\s+]Sans|Rubik|Arimo|Golos/i,
    lacks: ['Heebo', 'Fredoka', 'Assistant', 'Lexend'],
    varName: '--ru',
  },
};

const PAGES = process.argv.slice(2).length ? process.argv.slice(2)
  : ['.', 'pricing', 'math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
     'english', 'history', 'ulpan', 'lomda', 'reader', 'bagrut-806'];

let checked = 0, findings = 0;

for (const page of PAGES) {
  const file = page === '.' ? 'index.html' : page + '/index.html';
  if (!fs.existsSync(file)) { console.log(`· ${page.padEnd(11)} אין קובץ`); continue; }
  const src = fs.readFileSync(file, 'utf8');

  /* "נטענת" פירושו שהמשפחה באמת נמשכת — מבקשת הגופנים או מ-@font-face.
     הגרסה הראשונה של הבדיקה חיפשה את השם בכל הקובץ, ולכן הצהרת
     `--ar:"Noto Sans Arabic"` לבדה סיפקה אותה: הסרתי את המשפחה
     מבקשת הגופנים והבדיקה עברה. שם משפחה בלי טעינה עובד רק אם
     היא מותקנת במכשיר, וזו הנחה שאי אפשר לסמוך עליה. */
  const linkHrefs = (src.match(/<link[^>]*href="[^"]*"[^>]*>/gi) || []).join(' ');
  const faces = (src.match(/@font-face\s*\{[^}]*\}/gi) || []).join(' ');

  for (const [lg, sc] of Object.entries(SCRIPTS)) {
    /* יש כאן ממשק בשפה הזאת בכלל? דף בלי המילון אינו ממצא. */
    if (!(sc.chars.test(src) && sc.dict.test(src))) {
      console.log(`· ${page.padEnd(11)} ${lg}: אין ממשק ${sc.name} — לא נבדק`);
      continue;
    }
    checked++;
    const loads = sc.ok.test(linkHrefs) || sc.ok.test(faces);

    /* כלל שמחיל את המשפחה כשהממשק בשפה הזאת. שני ניסוחים תקינים
       ושונים קיימים בפורטפוליו, ושניהם עובדים: דף הבית נוקב בשם
       המשפחה בתוך הכלל, והאפליקציות עוברות דרך משתנה --ar / --ru.
       בדיקה שדרשה רק את השני הכשילה את דף הבית שנמדד בדפדפן כתקין —
       ובודק שמכשיל קוד עובד נזרק אחרי הפעם השנייה. */
    const varOk = (() => {
      const m = new RegExp(sc.varName + '\\s*:\\s*([^;]+);').exec(src);
      return !!(m && sc.ok.test(m[1]));
    })();
    let applies = false;
    const rule = new RegExp('([^{}]*\\[lang\\s*=\\s*["\']?' + lg + '["\']?\\][^{}]*)\\{([^}]*)\\}', 'g');
    let r;
    while ((r = rule.exec(src))) {
      const body = r[2];
      if (!/font-family/.test(body)) continue;
      if (sc.ok.test(body)) { applies = true; break; }
      if (new RegExp('var\\(\\s*' + sc.varName + '\\b').test(body) && varOk) { applies = true; break; }
    }

    if (loads && applies) {
      console.log(`✓ ${page.padEnd(11)} ${lg}: נטענת משפחה ל${sc.name} ומוחלת על lang="${lg}"`);
      continue;
    }
    findings++;
    const would = sc.lacks.filter(f => new RegExp('font[^;]*\\b' + f + '\\b', 'i').test(src))[0] || 'ברירת המחדל של המערכת';
    const why = !loads && !applies ? 'לא נטענת משפחה ואין כלל שמחיל אותה'
              : !loads ? 'המשפחה נזכרת ב-CSS אך אינה נטענת מבקשת הגופנים'
              : `נטענת אך אין כלל שמחיל אותה על lang="${lg}"`;
    console.log(`✗ ${page.padEnd(11)} ${lg}: ${why} — ה${sc.name} תוצג ב-${would}`);
  }
}

console.log(`\n${checked} בדיקות דף×כתב, ${findings} ממצאים`);
process.exit(findings ? 1 : 0);
