/* =====================================================================
   העברית של ברק — `node .claude/qa/hebrew.js`

   **מקור: דיווח הבעלים, 18.9.2026 — ״העברית של ברק לא תקינה״.**
   זו הפעם השנייה. ב-17.9 נמצא ״מה שנעשה זה להשתמש ברמז״ — תרגום
   מילולי של *what we'll do is* — והתיקון היה **בקשה מהמודל**:
   שתי שורות ב-`CORE` ומפת `LANGRULE`. הדיווח חזר אחרי שהפרומפט
   נפרס, ולכן ההוראה לבדה אינה מחזיקה.

   **מה שהמדידה גילתה, וזה העיקר: לברק שלושה מקורות עברית, ורק
   אחד מהם היה מכוסה.**

       tutor-api/worker.js   הפרומפט למודל  ← כוסה ב-17.9
       tutor/josh-local.js   המוח המקומי    ← לא נבדק מעולם
       tutor/tutor.js        מחרוזות הממשק  ← לא נבדק מעולם
       tutor/barak-core.js   מנוע הפעולות   ← לא נבדק מעולם

   **המוח המקומי הוא מה שהלומד שומע בלי אינטרנט או כשהמכסה
   נגמרה**, והוא הגדול מכולם. תיקון שנוגע בפרומפט בלבד אינו
   נוגע בו כלל, וגם לא בגרסה שנפרסה.

   ── שתי בדיקות ──

   **1. אותו שומר, על הטקסט שלנו.** `badLang` שב-`worker.js`
   פוסל תרגום מילולי בתשובת המודל; הבדיקה מריצה אותו על **כל**
   מחרוזת עברית בשלושת קובצי הלקוח. אם הכלל טוב דיו למודל, הוא
   טוב דיו לנו — וטקסט שנכתב ביד אינו פטור ממנו.

   **2. ההוראה והשומר אינם נפרדים.** `LANGRULE.he` נוקב בתבניות
   במילים, ו-`HE_CALQUE` בביטויים רגולריים. שתי רשימות שמתארות
   אותו דבר נפרדות עם הזמן: מי שיוסיף תבנית לאחת ישכח את השנייה,
   וברק ימשיך לכתוב אותה בזמן שהפרומפט אוסר. הבדיקה דורשת שכל
   תבנית שב-`HE_CALQUE` מוזכרת גם ב-`LANGRULE.he`.

   ── מה שהבדיקה אינה עושה, ובכוונה ──

   היא אינה שופטת סגנון, אינה בודקת מין ומספר (אין לזה מדידה
   דטרמיניסטית בלי מנתח מורפולוגי, ותלות חיצונית אסורה כאן),
   ואינה מריצה את המודל. היא תופסת **תבנית שאין לה קריאה
   תקינה** — וזה מה שאפשר לאכוף בלי דפדפן ובלי רשת.
   ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = process.cwd();

/* שלושת קובצי הלקוח — כל מה שברק אומר בלי לעבור בשרת.

   **ו-`tutor-api/worker.js` אינו ברשימה, בכוונה.** סריקה שלו
   מחזירה מופע אחד: `LANGRULE.he` עצמו, שמצטט את ״מה שנעשה זה״
   כדי **לאסור** אותו. זו אותה מלכודת שמתועדת בראש
   `josh-local.js` ושהפילה את מניין הנושאים ב-`bible.js`:
   **טקסט שמזכיר תבנית אסורה הוא מופע שלה.** מי שיוסיף את
   הקובץ לכאן יקבל ממצא שהתיקון היחיד שלו הוא לשבור את ההוראה. */
const FILES = [
  'tutor/tutor.js',
  'tutor/josh-local.js',
  'tutor/barak-core.js',
];

const HEB = /[\u0590-\u05ea]/;
const STR = /"(?:[^"\\]|\\.)*"/g;

/* **מילות מפתח שהלומד מקליד אינן מה שברק אומר.** `josh-local.js`
   מחזיק ברשימות `words` את מה שהוא מחפש בקלט — ״מה אתה יודע
   לעשות״, ״תן לי את התשובה״ — ואלה ציטוטים של הלומד. מדידה
   ראשונה שלא הבדילה ביניהם דיווחה 55 מופעים של לשון זכר במוח
   המקומי, ורובם היו שם. */
function isKeywordLine(ln) {
  return /\bwords\s*:/.test(ln) || /\bkw\s*:/.test(ln) || /\bmatch\s*\(/.test(ln);
}

function strings(file) {
  const out = [];
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  src.split('\n').forEach((ln, i) => {
    const t = ln.trim();
    if (t.startsWith('*') || t.startsWith('/*') || t.startsWith('//')) return;
    if (isKeywordLine(ln)) return;
    for (const q of ln.match(STR) || []) {
      const b = q.slice(1, -1);
      if (HEB.test(b) && b.length >= 8) out.push({ line: i + 1, text: b });
    }
  });
  return out;
}

(async () => {
  /* `pathToFileURL` ולא נתיב גולמי — בווינדוס `import()` דוחה
     `C:\…` ואומר ״Received protocol 'c:'״. ראו `barak.js:77`
     ו-`simplify.js`, שנולד עם אותו באג. */
  const W = await import(pathToFileURL(
    path.join(ROOT, 'tutor-api', 'worker.js')).href);

  let bad = 0, seen = 0;

  /* ---- בדיקה 1: הטקסט שלנו עובר את השומר של המודל ---- */
  for (const f of FILES) {
    const rows = strings(f);
    const hits = rows.filter(r => W.badLang(r.text, 'he'));
    seen += rows.length;
    if (hits.length) {
      bad += hits.length;
      console.log('✗ ' + f + ' — ' + hits.length + ' מחרוזות עם תרגום מילולי');
      for (const h of hits.slice(0, 5))
        console.log('     ' + h.line + ': ' + h.text.slice(0, 70));
    } else {
      console.log('✓ ' + f.padEnd(22) + rows.length + ' מחרוזות, אין תרגום מילולי');
    }
  }

  /* ---- בדיקה 2: ההוראה והשומר אומרים את אותו דבר ---- */
  const rule = String((W.LANGRULE && W.LANGRULE.he) || '');
  if (!rule) { console.log('✗ LANGRULE.he חסר'); bad++; }
  else {
    /* כל תבנית והמילים שמזהות אותה ב-`LANGRULE.he`. הביטוי
       הרגולרי עצמו אינו מופיע שם כטקסט, ולכן ההשוואה היא על
       הביטוי בעברית שהכלל נוקב בו. */
    const PAIRS = [
      ['מה ש… זה ל…',   ['מה שנעשה זה']],
      ['אני הולך ל…',   ['אני הולך להסביר', 'אני הולך ל']],
      ['בכדי',          ['בכדי']],
      ['באם',           ['באם']],
    ];
    const missing = PAIRS.filter(([, alts]) => !alts.some(a => rule.includes(a)));
    if (missing.length) {
      bad += missing.length;
      console.log('✗ LANGRULE.he אינו נוקב ב-' + missing.map(m => m[0]).join(' · ') +
        ' — השומר פוסל את זה, וההוראה אינה מבקשת');
    } else {
      console.log('✓ LANGRULE.he         נוקב בכל ' + PAIRS.length + ' התבניות שהשומר פוסל');
    }
    /* וההפך: תבנית שההוראה מבקשת והשומר אינו פוסל היא הערה
       בלבד — ההוראה רחבה מהשומר בכוונה (מין ומספר, סלנג). */
  }

  /* ---- בדיקה 3: שתים־עשרה מחרוזות מדידה על השומר עצמו ----
     **שש שבורות ושש תקינות.** בלי החצי השני, כל הרחבה של
     `HE_CALQUE` נראית כמו שיפור: תבנית רחבה יותר תופסת יותר
     שגיאות **ויותר עברית תקינה**, והמחיר הוא ניסיון חוזר מיותר
     על כל תשובה. זה קרה בפועל — הניסוח הראשון של ״זה ל…״ הורחב
     ל-״זה …״ ופסל ״תראה מה שיש לי כאן, זה משהו אחר״. */
  const CASES = [
    ['מה שאני כן יודע זה איך לגשת', true],
    ['מה שנעשה זה להשתמש ברמז', true],
    ['מה שחשוב זה הסדר', true],
    ['מה שצריך לעשות זה לקרוא שוב', true],
    ['אני הולך להסביר לך את זה', true],
    ['בכדי לפתור צריך להתחיל מהסוף', true],
    ['תראה מה שיש לי כאן, זה משהו אחר', false],
    ['זה מה שהשאלה מבקשת ממך', false],
    ['מה שכתוב בשאלה הוא כל החומר', false],
    ['בוא נבדוק מה שכתבת. זה נראה טוב', false],
    ['כדי לפתור צריך להתחיל מהסוף', false],
    ['בוא נפרק את זה לשני חלקים', false],
  ];
  const wrong = CASES.filter(([t, want]) => W.badLang(t, 'he') !== want);
  if (wrong.length) {
    bad += wrong.length;
    console.log('✗ השומר טועה ב-' + wrong.length + ' מתוך ' + CASES.length + ' מחרוזות המדידה');
    for (const [t, want] of wrong)
      console.log('     ' + (want ? 'היה צריך להיפסל' : 'היה צריך לעבור  ') + ': ' + t);
  } else {
    console.log('✓ badLang             ' + CASES.length + ' מחרוזות מדידה — שש שבורות נפסלו, שש תקינות עברו');
  }

  /* ---- בדיקה 4: השומר מחובר ל-bad(), ולא רק מוגדר ---- */
  const wsrc = fs.readFileSync(path.join(ROOT, 'tutor-api', 'worker.js'), 'utf8');
  if (!/const bad = t =>[^\n]*badLang\(/.test(wsrc)) {
    console.log('✗ badLang מוגדר ואינו מחובר ל-bad() — פונקציה שאיש אינו קורא לה');
    bad++;
  } else {
    console.log('✓ badLang             מחובר ל-bad(), עם ניסיון חוזר');
  }

  console.log('\n' + seen + ' מחרוזות עבריות של ברק נבדקו, ' + bad + ' ממצאים');
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('✗ ' + e.message); process.exit(1) });
