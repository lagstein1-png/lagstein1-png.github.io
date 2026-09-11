/* =====================================================================
   ארבעה ליקויי נגישות שאף בדיקה לא שאלה עליהם עד היום.

     node .claude/qa/aria.js                 כל הדפים
     node .claude/qa/aria.js math-app ulpan  נבחרים
     node .claude/qa/aria.js --file x.html   קובץ בודד (לבדיקת הבדיקה)

   הרשימה נולדה מכתיבת `ACCESSIBILITY.md` ב-11.9.2026: ארבעה דברים
   שעוברים את כל שלושים הבדיקות בשקט, ולכן נופלים על העין — ועין
   שוכחת. שלושתם הראשונים הם ליקוי מיידי למי שמנווט במקלדת או
   בקורא מסך; הרביעי הוא ליקוי שמתגלה רק בשפה שלא בדקת.

   כולם נבדקים בקריאת טקסט. אין דפדפן ואין שרת.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const args = process.argv.slice(2);
const single = args.indexOf('--file');
const FILES = single >= 0
  ? [args[single + 1]]
  : (args.length ? args.map(a => path.join(a, 'index.html'))
                 : fs.readdirSync(ROOT)
                     .filter(d => fs.existsSync(path.join(ROOT, d, 'index.html')))
                     .sort().map(d => path.join(d, 'index.html')));

let bad = 0, checked = 0;
const hit = (f, why, what) => { bad++; console.log('  ✗ ' + f + ' — ' + why + '\n      ' + what) };

/* בלוקי CSS: סלקטור + גוף.

   **סורקים רק את מה שבתוך `<style>`.** הגרסה הראשונה סרקה את כל
   הקובץ, וייצרה תשע־עשרה התראות שווא: `'+ ... {` בשרשור מחרוזות
   של JS נראה בדיוק כמו כלל CSS, ו-`#demo-start` נקרא כסלקטור.
   הקבצים כאן הם HTML עם CSS ו-JS באותו קובץ, ולכן ההפרדה הזאת
   אינה נוחות אלא תנאי לנכונות. */
function cssBlocks(src) {
  const out = [];
  const sre = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sm;
  while ((sm = sre.exec(src))) {
    /* הערות CSS מוסרות לפני הפרסור. בלעדי זה הערה שיושבת בין שני
       כללים נבלעת לתוך הסלקטור של הבא אחריה — וזה בדיוק מה שהסתיר
       את הזיווג `textarea:focus` ↔ `textarea:focus-visible`. */
    const css = sm[1].replace(/\/\*[\s\S]*?\*\//g, '');
    const re = /([^{}@;]+)\{([^{}]*)\}/g;
    let m;
    while ((m = re.exec(css))) out.push({ sel: m[1].trim(), body: m[2] });
  }
  return out;
}
/* מאפייני style= בתוך HTML, כולל כאלה שנבנים בשרשור מחרוזות */
function inlineStyles(src) {
  const out = [];
  const re = /style="([^"]*)"/g;
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

for (const rel of FILES) {
  const p = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
  if (!fs.existsSync(p)) { console.log('  · ' + rel + ' אינו קיים — דולג'); continue }
  const src = fs.readFileSync(p, 'utf8');
  checked++;

  /* ---------- 1 · מצב דו־מצבי עם ערך קבוע ----------
     `aria-pressed="true"` שנכתב ביד ואינו זז הוא שקר לקורא המסך,
     וגרוע מכלום: המשתמש שומע ״לחוץ״ על כפתור משוחרר. מותר רק
     כשהערך נגזר מביטוי, או כשהקוד מעדכן אותו ב-setAttribute.
     `[aria-pressed="true"]` הוא סלקטור CSS ואינו סימון — ולכן
     נבדק התו שלפני. */
  for (const attr of ['aria-pressed', 'aria-checked', 'aria-expanded', 'aria-selected']) {
    const re = new RegExp('(.)' + attr + '="(true|false)"', 'g');
    let m;
    while ((m = re.exec(src))) {
      if (m[1] === '[') continue;                    /* סלקטור CSS */
      const updates = new RegExp('setAttribute\\(["\']' + attr + '|\\.' + 
        attr.replace(/-(\w)/g, (s, c) => c.toUpperCase()) + '\\s*=').test(src);
      if (updates) continue;
      hit(rel, attr + ' עם ערך קבוע ואין קוד שמעדכן אותו',
          'קורא מסך ישמע את המצב הראשוני לנצח. יש לגזור מביטוי, או לעדכן ב-setAttribute.');
    }
  }

  /* ---------- 2 · outline שנמחק בתוך המיקוד עצמו ----------
     `outline:none` על מצב מנוחה הוא תקין — הוא מנקה, ו-`:focus`
     מסמן. בתוך `:focus` הוא מוחק את סימון המיקוד, וגובר בסגוליות
     על `:focus-visible` גלובלי שיושב באותו קובץ. נמדד ב-`reader`
     ב-11.9.2026, ב-`textarea:focus`. */
  const blocks = cssBlocks(src);
  for (const b of blocks) {
    if (!/:focus\b/.test(b.sel) || /:focus-visible/.test(b.sel)) continue;
    if (!/outline\s*:\s*(none|0)\b/.test(b.body)) continue;
    /* **פטור שהוא הדגם הנכון:** `x:focus{outline:none}` יחד עם
       `x:focus-visible{outline:…}` הוא בדיוק מה שרוצים — נקי
       בלחיצת עכבר, מסומן בניווט מקלדת. שתי הסגוליות שוות, ולכן
       סדר המקור מכריע, ולכן ה-`:focus-visible` חייב לבוא אחרי. */
    const base = b.sel.replace(/:focus\b/g, '').trim();
    const iSelf = blocks.indexOf(b);
    const paired = blocks.some((o, i) =>
      i > iSelf &&
      o.sel.replace(/:focus-visible/g, '').trim() === base &&
      /:focus-visible/.test(o.sel) &&
      /outline\s*:\s*(?!none|0\b)/.test(o.body));
    if (paired) continue;
    hit(rel, 'outline מבוטל בתוך כלל :focus, ואין :focus-visible שמחזיר',
        b.sel.slice(0, 70) + '  —  מי שמנווט במקלדת לא יראה איפה הוא.');
  }

  /* ---------- 3 · tabindex חיובי ----------
     שובר את סדר הניווט בכל הדף, ולא רק באלמנט שלו. 0 להכניס
     לסדר הטבעי, ‎-1 למיקוד תוכניתי. */
  {
    const re = /tabindex="([0-9]+)"/g;
    let m;
    while ((m = re.exec(src)))
      if (Number(m[1]) > 0)
        hit(rel, 'tabindex="' + m[1] + '" — חיובי',
            'שובר את סדר הניווט בכל הדף. מותר 0 ו-‎-1 בלבד.');
  }

  /* ---------- 4 · מאפיין פיזי בציר האופקי ----------
     `margin-left` נשבר בהיפוך כיוון, ותמיד רק בשפה אחת — ותמיד
     אצל מי שאינו בודק אותה. הלוגי (`margin-inline-start`) מתהפך
     לבד.

     **פטור, והוא עקרוני ולא נוחות:** כשאותו כלל מצהיר `direction`
     במפורש, הכיוון קבוע ואינו תלוי בשפה — `direction:ltr` עם
     `text-align:left` הוא קיבוע מכוון של מחרוזת לטינית, וזה
     נכון. כך גם סלקטור שכבר ממוקד ל-[dir=…]. נמדד 11.9.2026:
     כל שלושים המופעים הפיזיים במאגר הם מהסוג הזה. */
    const PHYS = /\b(margin|padding|border|inset)-(left|right)\b|\btext-align\s*:\s*(left|right)\b|\bfloat\s*:\s*(left|right)\b|(?:^|[;{"'\s])(left|right)\s*:/;
  /* שני פטורים מבניים, ושניהם אינם ״נוחות״ אלא חוסר־תלות בכיוון:

     · `left` ו-`right` שניהם מוגדרים — האלמנט נמתח משני הקצוות,
       והיפוך הכיוון אינו משנה דבר. `.tools{left:0;right:0}`.
     · `left:50%` עם `translateX(-50%)` — זהו ניב המרכוז, והוא
       סימטרי בהגדרה. `.play` ב-reader. */
  const neutral = s =>
    (/\bleft\s*:/.test(s) && /\bright\s*:/.test(s)) ||
    (/\b(left|right)\s*:\s*50%/.test(s) && /translate[XY]?\(\s*-50%/.test(s));
  const exempt = s => /direction\s*:/.test(s) || /unicode-bidi/.test(s) || neutral(s);
  for (const b of cssBlocks(src)) {
    if (/\[dir[=~|^$*]?/.test(b.sel)) continue;
    if (exempt(b.body)) continue;
    const m = b.body.match(PHYS);
    if (m) hit(rel, 'מאפיין פיזי במקום לוגי: ' + m[0].trim(),
               b.sel.slice(0, 60) + '  —  ישתמש ב-inline-start/end, או יצהיר direction.');
  }
  for (const st of inlineStyles(src)) {
    if (exempt(st)) continue;
    const m = st.match(PHYS);
    if (m) hit(rel, 'מאפיין פיזי ב-style=: ' + m[0].trim(), st.slice(0, 70));
  }
}

console.log('');
if (bad) { console.log(bad + ' ממצאי נגישות'); process.exit(1) }
console.log('✓ ' + checked + ' דפים נבדקו — מצב דו־מצבי, מיקוד, tabindex ומאפיין פיזי');
