/* =====================================================================
   pure.js — המבחן הכיתתי אינו מביט בהתקדמות הלומד: כל קריאה
   ל-buildQuestion מתוך buildQ מעבירה pure=true

   הכלל כתוב ב-CLAUDE.md, ״המבחן הכיתתי אינו מביט בהתקדמות הלומד״:
   buildQ הוא הנתיב היחיד של המבחן, והוא מעביר pure=true תמיד.
   הבדיקה שהייתה — exam.js — משווה מורה מול תלמיד באותו דפדפן, ושם
   state.item זהה בהגדרה; לכן היא לא יכולה לראות קריאה שנפלה חזרה
   ל-chooseIndex. הכלל היה כתוב בלבד, ולא נאכף.

   מה נמצא כשהוא נכתב (16.9.2026): ב-english וב-ulpan הקריאה הראשונה
   ב-buildQ מעבירה true, אבל לולאת הנפילה שמתחתיה — ״תרגיל סידור
   המשפט ... מגרילים צורה אחרת״ — קוראת buildQuestion(tid,lv,undefined)
   בלי pure, עד 16 פעמים. ההערה מעליה מבטיחה ״ההגרלה זהה אצל המורה
   ואצל התלמיד״, והקוד מתחתיה שוקל לפי state.item. בדיוק המקרה
   שהכלל נועד למנוע, ובדיוק בשליש שאלות המשפטים שההערה מזכירה.

   הבדיקה: בארבע אפליקציות החידון —
     1. יש function buildQuestion(tid,lv,avoid,pure) ויש pureIndex
     2. יש function buildQ
     3. כל buildQuestion( בתוך גוף buildQ — הארגומנט הרביעי הוא true
   סטטית, בלי דפדפן.

   הוכחת נפילה: על 308786f — english ו-ulpan, שורה אחת בכל אחת.
   אחרי התיקון — 0.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const APPS = ['english', 'history', 'ulpan', 'lomda'];

/* גוף פונקציה לפי איזון סוגריים מסולסלים, מהשורה שמצהירה עליה */
function bodyOf(src, decl) {
  const at = src.indexOf(decl);
  if (at < 0) return null;
  const open = src.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return { text: src.slice(open, i + 1), line: src.slice(0, at).split('\n').length, open };
  }
  return null;
}

let bad = 0;
for (const app of APPS) {
  const file = path.join(ROOT, app, 'index.html');
  const src = fs.readFileSync(file, 'utf8');
  if (!/function buildQuestion\(tid,lv,avoid,pure\)/.test(src) || !/function pureIndex\(/.test(src)) {
    console.log(`✗ ${app}: אין buildQuestion(tid,lv,avoid,pure) או אין pureIndex — האפליקציה לא ירשה את תיקון pure`);
    bad++; continue;
  }
  const q = bodyOf(src, 'function buildQ(');
  if (!q) { console.log(`✗ ${app}: אין function buildQ`); bad++; continue; }
  const calls = [...q.text.matchAll(/\bbuildQuestion\(([^)]*)\)/g)];
  let n = 0;
  for (const m of calls) {
    const args = m[1].split(',').map(s => s.trim());
    if (args[3] !== 'true') {
      const line = q.line + q.text.slice(0, m.index).split('\n').length - 1;
      console.log(`✗ ${app}/index.html:${line}: buildQuestion(${m[1]}) בתוך buildQ — בלי pure=true, המבחן שוקל לפי state.item`);
      n++;
    }
  }
  if (n) bad++;
  else console.log(`✓ ${app}: ${calls.length} קריאות ל-buildQuestion ב-buildQ, כולן pure=true`);
}
console.log(`${bad ? '✗' : '✓'} ${APPS.length} אפליקציות, ${bad} עם נתיב מבחן שמביט בלומד`);
process.exit(bad ? 1 : 0);
