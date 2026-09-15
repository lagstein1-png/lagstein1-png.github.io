/* =====================================================================
   shadow.js — פונקציה גלובלית שנדרסה בשקט

     node .claude/qa/shadow.js [app...]

   **הבאג שהוליד את הבדיקה, 16.9.2026.** ב-`math-teen` ישבו שתי
   הצהרות באותו סקופ:

       :3771   function txt(x,y,s,anchor){ … }   בונה תווית <text> ל-SVG
       :7831   var txt=function(x){ … }          מסיר תגיות HTML

   `var` אינו מוגבל לבלוק, וההשמה רצה בכל טעינה (`if(window.TUTOR)`
   מתקיים תמיד). מרגע זה `txt` הוא מסיר ה-HTML, ו**כל תוויות
   האיורים נמחקו**.

   נמדד בדפדפן, לפני התיקון: `txt.length === 1` במקום 4,
   ו-`txt(140,172,"12") === "140"` במקום אלמנט `<text>`.
   האיור של טריגונומטריה רמה 1 יצא עם **אפס** אלמנטי `<text>`.

   **ולמה זה קריטי ולא ״תקלה ויזואלית״:** ב-trig רמה 1 ה-`expr`
   **ריק**, והאיור הוא מקור הנתונים היחיד. הלומד ראה משולש בלי
   מספרים ונשאל ״מהו cos α?״ — שאלה בלי פתרון, עם ארבע אפשרויות
   שנראות סבירות. אין שגיאה בקונסולה, אין מסך שבור, ואף אחת
   מ-47 הבדיקות לא ראתה: `entropy` בודקת שהתשובה אינה קבועה,
   `options` שיש ארבע, `guess` שאי אפשר לנחש — וכולן עברו.

   **השיטה: מקור מול זמן ריצה, ולא ניתוח סקופ.** כל
   `function NAME(a,b,c)` שמוצהר בתחילת שורה נספר עם מספר
   הפרמטרים שלו, ואז נשאל הדפדפן מה `window[NAME].length`.
   פער פירושו שמישהו דרס. זה מה שתפס את הבאג בפועל, וזה אינו
   דורש מנתח JS.

   **מה זה אינו תופס, ונאמר כאן במפורש:** דריסה בין שתי פונקציות
   בעלות אותו מספר פרמטרים. לכך צריך ניתוח סקופ אמיתי, והוא לא
   נבנה כאן.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('./pw.js');
const ROOT = path.resolve(__dirname, '..', '..');
const BASE = process.env.QA_BASE || 'http://127.0.0.1:8099';
const APPS = process.argv.slice(2).length ? process.argv.slice(2) :
  ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
   'ulpan', 'english', 'history', 'lomda', 'reader', 'kotvim', '.'];

/* הצהרה בתחילת שורה — כלומר בסקופ העליון של הסקריפט */
const DECL = /^function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/gm;

(async () => {
  const browser = await chromium.launch();
  let bad = 0, checked = 0;
  for (const app of APPS) {
    const dir = app === '.' ? ROOT : path.join(ROOT, app);
    const file = path.join(dir, 'index.html');
    if (!fs.existsSync(file)) { console.log(`· ${app} — אין index.html`); continue }
    const src = fs.readFileSync(file, 'utf8');
    const want = {};
    let m; DECL.lastIndex = 0;
    while ((m = DECL.exec(src))) {
      const args = m[2].trim();
      /* ארגומנט עם ערך ברירת מחדל או ...rest אינו נספר ב-Function.length */
      if (/=|\.\.\./.test(args)) continue;
      want[m[1]] = args ? args.split(',').length : 0;
    }
    const names = Object.keys(want);
    if (!names.length) { console.log(`· ${app} — אין הצהרות בסקופ העליון`); continue }

    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.route('**', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    await page.goto(`${BASE}/${app === '.' ? '' : app + '/'}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(800);
    const got = await page.evaluate(ns => {
      const o = {};
      for (const n of ns) {
        const v = window[n];
        o[n] = (typeof v === 'function') ? v.length : (v === undefined ? null : 'לא-פונקציה');
      }
      return o;
    }, names);
    await ctx.close();

    let n = 0;
    for (const name of names) {
      const g = got[name];
      /* לא מוגדר = הקובץ לא הגיע לשם, או שהוא בתוך IIFE. אינו ממצא. */
      if (g === null) continue;
      checked++;
      if (g === 'לא-פונקציה') {
        bad++; n++;
        console.log(`✗ ${app} — ${name} הוצהר כפונקציה, ובזמן ריצה אינו פונקציה כלל`);
      } else if (g !== want[name]) {
        bad++; n++;
        console.log(`✗ ${app} — ${name}: המקור מצהיר ${want[name]} פרמטרים, ובזמן ריצה ${g}`);
        console.log(`    משהו דרס את ההצהרה. חפשו \`var ${name}=\` או \`${name}=\` באותו סקופ.`);
      }
    }
    if (!n) console.log(`✓ ${app.padEnd(10)} ${names.length} הצהרות בסקופ העליון, אף אחת לא נדרסה`);
  }
  console.log(`\n${bad ? '✗' : '✓'} ${checked} פונקציות גלובליות נבדקו בזמן ריצה, ${bad} נדרסו`);
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
