/* =====================================================================
   המנוע — האם העותקים עדיין זהים.

     node .claude/qa/engine.js
     node .claude/qa/engine.js --show   גם כשאין סחיפה, להראות מה נבדק

   למה הבדיקה הזאת קיימת
   ---------------------
   אין כאן build step ואין קבצים משותפים בזמן ריצה, וזו החלטה ולא
   פשרה: לכל אפליקציה `sw.js` משלה ומטמון משלה, והיא עובדת אופליין
   בלי להיות תלויה בקובץ שאפליקציה אחרת מביאה. המחיר הוא שהמנוע
   קיים בשמונה עותקים.

   **עותק מתוקן במקום אחד ולא בשבעה האחרים הוא הבאג המרכזי של
   הריפו הזה.** CLAUDE.md מתאר בדיוק את זה: אפליקציה חדשה נולדת
   מהעתקה, ולכן היא יורשת גם באג שכבר תוקן במקום אחר. הבדיקה כאן
   הופכת את הסחיפה הזאת לגלויה ברגע שהיא קורית, במקום ימים אחרי.

   הבלוקים כאן אינם רשימת משאלות — כל אחד מהם **נמדד כזהה היום**,
   ולכן כל הבדל שיופיע מחר הוא שינוי אמיתי ולא רעש היסטורי.

   מה שמותר להיות שונה — שם המטמון, מפתח המורה — מנורמל לפני
   ההשוואה. זה בדיוק הגבול בין "פרמטר" ל"מנוע".

   הבדיקה קוראת קוד בלבד. אין דפדפן ואין שרת.
   ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const SHOW = process.argv.includes('--show');

/* תשע אפליקציות שהמנוע בהן זהה. `lomda` מצטרפת לשלושת בלוקי
   ה-index.html, אבל **לא** ל-sw.js: היא מצרפת מראש את קובצי התוכן
   שלה, ולכן ה-PRE שלה שונה — בדיוק כמו ב-bagrut-806, שמצרף KaTeX.
   ההבדל הזה מכוון ומתועד, ולכן אינו סחיפה. */
const APPS9 = ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
               'english', 'history', 'ulpan', 'lomda'];

/* ה-sw.js של השורש **אינו** ברשימה, וגם זה מכוון. הוא רשום ב-scope
   `/` ולכן הוא רואה גם ניווט לאפליקציה אחרת בביקור הראשון, ויש בו
   שומר בעלות שאין באף אחד מהאחרים — ואסור שיהיה. הוא נבדק
   ב-`cache.js`, שדורש את השומר בשורש ואוסר אותו בשאר; כאן הוא היה
   מדווח כסחיפה על ההבדל שהוא עצם התפקיד שלו. */
const SW9 = APPS9.filter(a => a !== 'lomda').concat(['reader']);

/* נרמול: מה שמותר להשתנות בין אפליקציה לאפליקציה */
const normCache   = s => s.replace(/"[a-z0-9-]+-"\s*\+\s*V/g, '"APP-"+V')
                          .replace(/startsWith\("[a-z0-9-]+-"\)/g, 'startsWith("APP-")');
const normTeacher = s => s.replace(/"[a-z0-9-]+-teacher"/g, '"APP-teacher"');

/* שער התנאים נכתב פעם אחת והועתק, ושלושה דברים בו נקשרים לאפליקציה
   ולכן אינם סחיפה:
     · שם מפתח המורה
     · שמות עוזרי התרגום — xt/xf במחוללים, teT/teF ב-math-teen
     · הביטוי שממנו נגזר כיוון הכתיבה: LG, state.lang או
       state.settings.lang, לפי המשפחה
   שלושתם מנורמלים כאן. מה שיישאר שונה אחרי זה הוא סחיפה אמיתית.

   הערה שנמדדה ומתועדת ב-README: ב-math-teen שורת הכיוון היא
   `var dirv="rtl"` קבוע, ולא נגזרת מ-LANGS. היום זה שקול — לאפליקציה
   הזאת יש עברית וערבית בלבד, ושתיהן RTL — וביום שתתווסף לה שפה
   LTR זה יהפוך לבאג. הנרמול כאן מכסה גם אותו בכוונה, כדי שהבדיקה
   לא תצעק על מה שכבר ידוע; הפריט חי ב-README ולא כאן. */
const normGate = s => normTeacher(s)
  .replace(/\b(?:xt|teT)\(/g, 'T_(')
  .replace(/\b(?:xf|teF)\(/g, 'F_(')
  .replace(/var dirv=.*$/m, 'var dirv=DIR;');

/* הבלוקים. from/to הם עוגנים; הבלוק הוא מ-from ועד השורה שלפני to. */
const BLOCKS = [
  {
    id: 'service worker',
    apps: SW9,
    file: 'sw.js',
    whole: true,
    norm: normCache,
    why: 'תשעה קבצים, זהים חוץ משם המטמון. השורש נבדק ב-cache.js',
  },
  {
    id: 'אונבורדינג demo',
    apps: APPS9,
    file: 'index.html',
    from: 'function demoEl',
    to: 'function demoMount\\b',
    why: '155 שורות, הגרעין שאינו תלוי באפליקציה',
  },
  {
    id: 'מבחן כיתתי',
    apps: APPS9,
    file: 'index.html',
    from: 'function examId',
    to: 'function gradeResult',
    why: 'קידוד הקישור, הזרעים והציונים — הלב של המבחן',
  },
  {
    id: 'שער התנאים',
    apps: APPS9,
    file: 'index.html',
    from: 'function teHas',
    to: 'function waitLegal',
    norm: normGate,
    why: 'זהה חוץ ממפתח המורה, שמות עוזרי התרגום וביטוי הכיוון',
  },
];

const md5 = s => crypto.createHash('md5').update(s).digest('hex').slice(0, 12);

function slice(app, b) {
  const f = path.join(ROOT, app, b.file);
  if (!fs.existsSync(f)) return null;
  const src = fs.readFileSync(f, 'utf8');
  if (b.whole) return src;

  const lines = src.split('\n');
  const si = lines.findIndex(l => new RegExp(b.from).test(l));
  if (si < 0) return null;
  const ei = lines.findIndex((l, i) => i > si && new RegExp(b.to).test(l));
  if (ei < 0) return null;
  return lines.slice(si, ei).join('\n');
}

let findings = 0;

for (const b of BLOCKS) {
  const groups = new Map();          /* md5 → [apps] */
  const missing = [];

  for (const app of b.apps) {
    const txt = slice(app, b);
    if (txt == null) { missing.push(app); continue; }
    const h = md5(b.norm ? b.norm(txt) : txt);
    if (!groups.has(h)) groups.set(h, []);
    groups.get(h).push(app);
  }

  const label = b.id.padEnd(16);

  if (missing.length) {
    console.log(`✗ ${label} לא נמצא ב: ${missing.join(', ')}`);
    findings += missing.length;
  }

  if (groups.size === 0) continue;

  if (groups.size === 1) {
    const [h, apps] = [...groups][0];
    if (SHOW || missing.length) console.log(`✓ ${label} ${h}  ×${apps.length}  — ${b.why}`);
    continue;
  }

  /* סחיפה: יותר מקבוצה אחת. הרוב הוא הבסיס, והחריגים הם הממצא. */
  const sorted = [...groups].sort((a, b2) => b2[1].length - a[1].length);
  const [baseH, baseApps] = sorted[0];
  console.log(`✗ ${label} סחיפה — ${groups.size} גרסאות שונות`);
  console.log(`     ${baseH}  ×${baseApps.length}  ${baseApps.join(', ')}   ← הרוב`);
  for (const [h, apps] of sorted.slice(1)) {
    console.log(`     ${h}  ×${apps.length}  ${apps.join(', ')}   ← שונה`);
    findings++;
  }
  console.log(`     (${b.why})`);
}

/* ------------------------------------------------------------------
   סימון שהועתק בלי ה-CSS שלו.

   כפתור התשובה במבחן הכיתתי נבנה בכל האפליקציות כ-
   `<span class="k">מספר</span><span class="m">ערך</span>`, והוא
   תלוי בשני כללי CSS: `.opts` שנותן לו פריסה, ו-`.opt .k` שהופך
   את המספר לתג. שניהם נכתבו פעם אחת ב-english והועתקו.

   ב-math-app הסימון הועתק וה-CSS לא בא איתו, ולכן `.k` נפל לטקסט
   inline רגיל ונדבק ל-`.m`: התשובה 18 בכפתור הראשון הוצגה "118",
   ו-`.opts` בלי display פרש ארבעה כפתורים בשורה אחת. אין שגיאת JS,
   אין ממצא ב-options.js — הוא בודק את הנתונים ולא את מה שמצויר —
   והמסך פשוט משקר לתלמיד. נמדד בכרומיום: display "block",
   ‏"116" "223" "327" "420" במקום 16, 23, 27, 20.

   זו אותה משפחה של cache.js: באג שאינו נכתב אלא מועתק. */
{
  let cssBad = 0;
  for (const app of APPS9) {
    const f = path.join(ROOT, app, 'index.html');
    if (!fs.existsSync(f)) continue;
    const src = fs.readFileSync(f, 'utf8');
    if (!/<span class="k">/.test(src)) continue;
    const miss = [];
    if (!/\.opts\s*\{[^}]*display\s*:/.test(src)) miss.push('.opts{display:…}');
    if (!/\.opt\s+\.k\s*\{/.test(src) && !/\.opts\s+\.opt\s+\.k\s*\{/.test(src))
      miss.push('.opt .k{…}');
    if (miss.length) {
      console.log(`✗ ${app}/index.html: יש <span class="k"> ואין ${miss.join(' ו-')} — התג יידבק לערך`);
      cssBad++;
    }
  }
  if (!cssBad && SHOW) console.log('✓ כל אפליקציה שיש בה <span class="k"> נושאת גם את ה-CSS שלו');
  findings += cssBad;
}

if (!findings && !SHOW) {
  console.log(`${BLOCKS.length} בלוקי מנוע נבדקו — כל העותקים זהים`);
} else {
  console.log(`\n${BLOCKS.length} בלוקי מנוע נבדקו, ${findings} ממצאים`);
}
process.exit(findings ? 1 : 0);
