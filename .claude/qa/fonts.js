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

/* **הרשימה נגזרת ואינה כתובה ביד — 17.9.2026.**
   היא מנתה `pricing`, תיקייה שנמחקה, ו**לא** מנתה `kotvim`,
   אפליקציה מפורסמת ב-`DATA.APPS`. `node .claude/qa/fonts.js kotvim`
   במפורש עובר ירוק — כלומר זו הייתה פרצת כיסוי ולא באג חי: עריכת
   גופנים ב-kotvim פשוט לא נבדקה.

   רשימה שנכתבת ביד מתיישנת בכל אפליקציה שנוספת או נמחקת, ולכן
   המקור הוא `stages.json` — אותו מקור אמת ש-`stage.js` אוכף. */
const STAGES = require('./stages.json');
const LOCAL = Object.entries(STAGES.apps || {})
  .filter(([, v]) => !(v && v.external))
  .map(([k]) => k);
const PAGES = process.argv.slice(2).length ? process.argv.slice(2)
  : ['.'].concat(LOCAL);

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
  let faces = (src.match(/@font-face\s*\{[^}]*\}/gi) || []).join(' ');

  /* **גופנים מקומיים — 1.10.2026.** הדפים מקשרים ל-/fonts/fonts.css
     (תגית link או @import) במקום לגוגל. שם המשפחה כבר אינו בכתובת,
     ולכן קוראים את הקובץ עצמו ולוקחים ממנו את ה-@font-face. ולצד זה —
     הקבצים של הכתב חייבים להיות ב-PRE של ה-worker של אותה אפליקציה:
     גופן שאינו מצורף מראש אינו מגיע אופליין, וזו כל הסיבה שהועברו לכאן. */
  const localCss = [...src.matchAll(/(?:href="|@import url\(['"]?)(\/fonts\/[^"')]+\.css)/g)].map(m => m[1]);
  const faceFiles = {};
  for (const css of localCss) {
    const f = css.slice(1);
    if (!fs.existsSync(f)) { console.log(`✗ ${page.padEnd(11)} ${css} — הקובץ אינו קיים`); findings++; continue; }
    for (const ff of fs.readFileSync(f, 'utf8').match(/@font-face\s*\{[^}]*\}/gi) || []) {
      faces += ' ' + ff;
      const fam = (ff.match(/font-family:\s*['"]?([^'";]+)/) || [])[1];
      const url = (ff.match(/url\(([^)]+)\)/) || [])[1];
      if (fam && url) (faceFiles[fam] = faceFiles[fam] || []).push({ url: url.replace(/['"]/g, ''), range: (ff.match(/unicode-range:\s*([^;]+)/) || [])[1] || '' });
    }
  }
  const swFile = page === '.' ? 'sw.js' : page + '/sw.js';
  const pre = fs.existsSync(swFile) ? ((fs.readFileSync(swFile, 'utf8').match(/const PRE = \[([\s\S]*?)\];/) || [])[1] || '') : null;

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

    /* הקובץ שמכסה את הכתב (unicode-range מכיל את התו הראשון שלו)
       של משפחה שמתאימה — חייב להיות ב-PRE. */
    let offline = true, offMsg = '';
    if (localCss.length && pre !== null) {
      const first = { ar: 0x0627, ru: 0x0430 }[lg];
      const inRange = r => r.split(',').some(x => { const m = x.trim().match(/U\+([0-9A-F]+)(?:-([0-9A-F]+))?/i);
        if (!m) return false; const a = parseInt(m[1], 16), b = m[2] ? parseInt(m[2], 16) : a; return first >= a && first <= b; });
      const need = Object.entries(faceFiles).filter(([fam]) => sc.ok.test(fam))
        .flatMap(([, fl]) => fl.filter(x => inRange(x.range)).map(x => x.url));
      const missing = need.filter(u => !pre.includes('"' + u + '"'));
      if (!need.length || missing.length) { offline = false; offMsg = need.length ? 'חסר ב-PRE של sw.js: ' + missing.join(', ') : 'אין קובץ גופן לכתב הזה ב-' + localCss.join(', '); }
      if (!pre.includes('"' + localCss[0] + '"')) { offline = false; offMsg += (offMsg ? '; ' : '') + localCss[0] + ' חסר ב-PRE של sw.js'; }
    }
    if (loads && applies && !offline) {
      findings++;
      console.log(`✗ ${page.padEnd(11)} ${lg}: הגופן ל${sc.name} נטען, אבל לא יגיע אופליין — ${offMsg}`);
      continue;
    }
    if (loads && applies) {
      console.log(`✓ ${page.padEnd(11)} ${lg}: נטענת משפחה ל${sc.name} ומוחלת על lang="${lg}"` + (localCss.length && pre !== null ? ' · מקומית ובמטמון' : ''));
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
