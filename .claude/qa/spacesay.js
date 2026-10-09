/* =====================================================================
   מקש הרווח במסך התרגול — שתי שאלות, שתיהן סריקה סטטית בכל האפליקציות.

     node .claude/qa/spacesay.js            # כל האפליקציות שב-stages.json
     node .claude/qa/spacesay.js civics     # רק זו

   **שאלה 1: הרווח מקריא את `P.q.say` לפני שענו.**
   **שאלה 2: הרווח על כפתור ממוקד יורה פעמיים** (נוסף 9.10.2026).

   **למה סטטי, כשיש כבר `say.js`.** `say.js` מריץ דפדפן אמיתי וזו
   הבדיקה החזקה — אבל היא מכוונת לארבע אפליקציות בשם (`english`,
   `ulpan`, `history`, `lomda`), ודפדפן על ארבעים אפליקציות אינו
   ריאלי. הבאג הזה אינו של אפליקציה אחת: הוא נולד מהעתקה. ב-4.10.2026
   הוא נמצא בעשר אפליקציות בבת אחת — `literature`, `hebrew-arab`,
   `tanakh`, `motal`, `geography`, `russian`, `biology`, `islam`,
   `civics` — וכולן ירוקות ב-`say.js`, מפני שאף אחת מהן אינה ברשימה.
   כאן אין הרצה ואין רשימה: נקראים כל קובצי ה-`index.html`.

   **מה נבדק.** המטפל `if(e.key===" ")` במסך התרגול. `P.q.say` נבנה
   כ״השאלה, התשובה הנכונה וההסבר״ ונועד להישמע *אחרי* המענה. אם
   הוא מוקרא בלי לשאול `P.done`, מי שלוחץ רווח כדי לשמוע את השאלה
   שומע את הפתרון — וזה בדיוק הלומד שבשבילו האפליקציה נכתבה.

   הנוסח התקין, מ-`literature`:
       speak(saySpell(P.done?P.q.say:(P.q.lead||"")),state.lang)
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const AL = require('./applist.js');

const ROOT = AL.ROOT;

/* הבלוק שאחרי `if(e.key===" ")`: ספירת סוגריים מסולסלים מהראשון. */
function blockAt(src, from) {
  const open = src.indexOf('{', from);
  if (open < 0) return src.slice(from, from + 200);
  let d = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') d++;
    else if (src[i] === '}') { d--; if (!d) return src.slice(open, i + 1) }
  }
  return src.slice(open, open + 400);
}

/* `applist` מחזיר רק את מי שקיים כאן, ולכן ״תאוריה מדברת״ ו-
   `english-bagrut` — ריפואים אחרים — אינם מדווחים כחסרים. */
const targets = AL.pick(process.argv.slice(2), AL.local());
let findings = 0, scanned = 0, withHandler = 0;

for (const app of targets) {
  const f = path.join(ROOT, app, 'index.html');
  if (!fs.existsSync(f)) { console.log(`· ${app.padEnd(15)} אין index.html`); continue }
  const src = fs.readFileSync(f, 'utf8');
  scanned++;
  const hits = [];
  let i = 0;
  while ((i = src.indexOf('e.key===" "', i)) >= 0) {
    const body = blockAt(src, i);
    if (body.indexOf('P.q.say') >= 0) {
      hits.push({ line: src.slice(0, i).split('\n').length, guarded: body.indexOf('P.done') >= 0, body });
    }
    i += 11;
  }
  if (!hits.length) continue;
  withHandler++;
  const bad = hits.filter(h => !h.guarded);
  if (!bad.length) { console.log(`✓ ${app.padEnd(15)} ${hits.length} מטפל/ים, כולם שואלים P.done`); continue }
  findings += bad.length;
  for (const h of bad) {
    console.log(`✗ ${app.padEnd(15)} שורה ${h.line}: הרווח מקריא את P.q.say בלי לשאול P.done`);
    console.log('   ' + h.body.replace(/\s+/g, ' ').slice(0, 150));
  }
}

/* ---------------------------------------------------------------------
   שאלה 2 — הרווח על כפתור ממוקד יורה פעמיים.

   רווח או Enter על כפתור ממוקד הם **הפעלה שלו**: הדפדפן יורה `click`
   מעצמו. מטפל גלובלי שלא בודק על מה המיקוד יושב יורה בנוסף את הקיצור
   שלו — ולכן רמקול של תא תשובה שהגיעו אליו בטאב הקריא ברווח את השאלה
   במקום את התא, ואחרי שעונים Enter עליו דילג לשאלה הבאה במקום להקריא.
   זה פוגע בדיוק במי שעובד במקלדת בלבד.

   **נמדד 9.10.2026: השומר היה בשבע אפליקציות, וחסר בשלוש־עשרה.**
   `history`, `kotvim`, `lomda`, `motal`, `reader`, `tanakh` ו-`ulpan`
   נשאו אותו; `biology`, `civics`, `electric`, `english`, `geography`,
   `hebrew-arab`, `islam`, `literature`, `math-teen`, `math-uni`,
   `math-uni2`, `math-uni3` ו-`russian` לא. באג של העתקה, כמו שאלה 1.

   **מה נבדק, ולמה כך.** המטפל שנבדק הוא זה שיש בו גם ענף `1-4`
   (תשובה) וגם ענף `" "` — כלומר מטפל התרגול, ולא כל `keydown` באתר.
   מטפל צר שכבר שואל על מה המיקוד יושב (`[data-a='gvoice']` ב-`biology`,
   `[data-a="pl"]` ב-`rakia`) אינו נכנס לסריקה מאליו, ואינו ממצא.
   --------------------------------------------------------------------- */
const GUARD = /closest\(\s*["'`]button,\[role=['"]button['"]\],a\[href\]["'`]\s*\)/;
const ANSWER = /\/\^\[1-4\]\$\//;
let unguarded = 0, practice = 0;

for (const app of targets) {
  const f = path.join(ROOT, app, 'index.html');
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  let i = 0;
  while ((i = src.indexOf('addEventListener', i)) >= 0) {
    const head = src.slice(i, i + 40);
    if (!/addEventListener\s*\(\s*["'`]keydown/.test(head)) { i += 16; continue }
    const body = blockAt(src, i);
    i += 16;
    if (!ANSWER.test(body) || body.indexOf('e.key===" "') < 0) continue;
    practice++;
    const line = src.slice(0, src.indexOf(body)).split('\n').length;
    if (GUARD.test(body)) { console.log(`✓ ${app.padEnd(15)} שורה ${line}: מטפל התרגול שואל על מה המיקוד יושב`); continue }
    unguarded++;
    console.log(`✗ ${app.padEnd(15)} שורה ${line}: רווח/Enter על כפתור ממוקד יורה גם את הקיצור — חסר השומר`);
    console.log(`   העתק מ-lomda: if((e.key===" "||e.key==="Enter")&&e.target&&e.target.closest("button,[role='button'],a[href]"))return;`);
  }
}

console.log(`\n${scanned} אפליקציות נסרקו · ${withHandler} עם מטפל רווח שמקריא say, ${findings} ממצאים · ${practice} מטפלי תרגול, ${unguarded} בלי שומר המיקוד`);
process.exit(findings + unguarded ? 1 : 0);
