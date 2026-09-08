/* בדיקת השומרים של ״עזרה מהמורה״.

   השומרים האלה הם כל ההבדל בין בוט שנותן רמז לבין בוט שנותן
   את התשובה בשורה הראשונה, ובין הסבר נכון לבין 8+7=16 שנכתב
   בביטחון. לכן הם נבדקים, ולא נסמכים על ההוראות למודל בלבד.

   מריצים:  node .claude/qa/tutor.js
*/
const path = require('path');
const URL_ = 'file://' + path.resolve(__dirname, '..', '..', 'tutor-api', 'worker.js');

let bad = 0;
function t(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { bad++; console.log(`✗ ${name}\n    קיבלנו: ${JSON.stringify(got)}\n    ציפינו: ${JSON.stringify(want)}`); }
  else console.log(`✓ ${name}`);
}

import(URL_).then(W => {
  /* --- 1. חשיפת התשובה --- */
  t('התשובה עצמה נתפסת',            W.revealsAnswer('התשובה היא 12', 12), true);
  t('התשובה בתוך משפט נתפסת',       W.revealsAnswer('נסה לספור עד 12 ואז עצור', 12), true);
  t('מספר שמכיל את התשובה אינו נתפס', W.revealsAnswer('יש לנו 120 עיגולים', 12), false);
  t('12 בתוך 512 אינו נתפס',        W.revealsAnswer('קח 512', 12), false);
  t('רמז בלי התשובה עובר',           W.revealsAnswer('כמה זה 5 ועוד 5?', 12), false);

  /* --- 2. משוואה שגויה --- */
  t('חיבור שגוי נתפס',   W.badEquation('קודם כל 8 + 7 = 16'), true);
  t('חיבור נכון עובר',    W.badEquation('קודם כל 8 + 7 = 15'), false);
  t('חיסור שגוי נתפס',   W.badEquation('אז 20 − 6 = 15'), true);
  t('כפל שגוי נתפס',     W.badEquation('כלומר 3 × 4 = 13'), true);
  t('חילוק נכון עובר',    W.badEquation('ולכן 12 : 3 = 4'), false);
  t('חילוק באפס נתפס',   W.badEquation('נחלק 5 : 0 = 0'), true);
  t('טקסט בלי משוואה עובר', W.badEquation('בוא נספור על האצבעות'), false);

  /* --- 3. אימות הקלט --- */
  t('גוף ריק נדחה', W.readBody({}), null);
  t('שיחה שנגמרת בבוט נדחית',
    W.readBody({ messages: [{ role: 'user', text: 'שלום' }, { role: 'assistant', text: 'היי' }] }), null);
  const okBody = W.readBody({
    lang: 'he', q: { kind: 'sub', a: 20, b: 6, level: 3 },
    messages: [{ role: 'user', text: 'לא הבנתי' }]
  });
  t('גוף תקין מתקבל', !!okBody && okBody.q.a === 20 && okBody.msgs.length === 1, true);
  t('שפה לא מוכרת נופלת לעברית',
    W.readBody({ lang: 'zz', messages: [{ role: 'user', text: 'היי' }] }).lang, 'he');
  t('הודעה ארוכה נחתכת',
    W.readBody({ messages: [{ role: 'user', text: 'א'.repeat(500) }] }).msgs[0].content.length, W.LIM.chars);
  t('תרגיל פגום מתקבל כלא־ידוע',
    W.readBody({ q: { kind: 'pow', a: 2, b: 3 }, messages: [{ role: 'user', text: 'היי' }] }).q, null);

  /* --- 4. ההקשר שנשלח --- */
  const c0 = W.contextBlock({ kind: 'add', a: 8, b: 7, level: 2 }, 15, 0);
  t('בתור הראשון ההקשר אוסר את התשובה', /אל תכתוב את המספר 15/.test(c0), true);
  const c3 = W.contextBlock({ kind: 'add', a: 8, b: 7, level: 2 }, 15, 3);
  t('בתור מאוחר האיסור מוסר', /אל תכתוב את המספר/.test(c3), false);
  t('בלי תרגיל — מבקשים מהתלמיד לכתוב', /בקש מהתלמיד לכתוב אותו/.test(W.contextBlock(null, null, 0)), true);

  /* --- 5. הוראות המערכת יושבות בשרת --- */
  t('הפרומפט הקבוע כולל את איסור הפרטים המזהים',
    /אל תבקש שם מלא, כתובת, טלפון או פרטים מזהים/.test(W.SYSTEM), true);

  /* --- 6. השער: הפעלת השירות מחייבת גרסת תנאים חדשה ---

     המשפט ״ההתקדמות שלכם אינה נשלחת לשום שרת״ נכון כל עוד
     TUTOR_API ריק. ברגע שממלאים בו כתובת, טקסט התנאים משתנה
     במהותו — מידע מתחיל לצאת מהמכשיר — ו-LEGAL.version הוא
     מה שמחייב את המשתמשים לקרוא ולאשר מחדש.

     מסמך אינו עוצר את זה; בדיקה כן. זה בדיוק הנימוק של
     cache.js, ולכן השער כאן ולא ב-README בלבד. */
  const fs = require('fs'), R = path.resolve(__dirname, '..', '..');
  const appSrc = fs.readFileSync(path.join(R, 'math-app', 'index.html'), 'utf8');
  const url = (appSrc.match(/var TUTOR_API="([^"]*)"/) || [])[1];
  const ver = (fs.readFileSync(path.join(R, 'legal', 'terms.js'), 'utf8')
               .match(/version:\s*"([^"]+)"/) || [])[1];
  if (url) {
    t('שירות מופעל — גרסת התנאים עלתה מעל 1.0', ver !== '1.0', true);
    if (ver === '1.0')
      console.log('    TUTOR_API מולא, ולכן legal/terms.js צריך version "1.1"\n' +
                  '    ואת שנים־עשר מפתחות הקאש — אחרת המשתמשים לא יתבקשו לאשר מחדש.');
  } else {
    console.log(`· TUTOR_API ריק — הכפתור אינו מופיע, ותנאי השימוש (${ver}) נשארים כפי שהם. תקין.`);
  }

  console.log(bad ? `\n✗ ${bad} בדיקות נכשלו` : '\n✓ כל בדיקות הבוט עברו');
  process.exit(bad ? 1 : 0);
});
