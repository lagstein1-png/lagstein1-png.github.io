/* =====================================================================
   i18n.js — המחרוזת העברית היא המפתח: כל _("…") יושבת ב-TR_KEYS

   הכלל כתוב ב-CLAUDE.md, ״תרגום — המחרוזת העברית היא המפתח״:
   באפליקציות האוניברסיטה _() מחפשת את המחרוזת העברית עצמה במילון,
   ושינוי מילה בעברית בלי לעדכן את המפתח מוחק את התרגום בשקט — אין
   שגיאה, _() מחזירה עברית לערבי ולרוסי. הכלל היה כתוב בלבד.

   מה נמצא כשהוא נכתב (16.9.2026): ב-math-uni3 המסיח ״זה מספר
   הספרות, לא החסם״ הוחלף ב-״עיגלתם לספרה אחת יותר מדי…״ — ההערה
   שליד השינוי מסבירה למה — והמפתח הישן נשאר ב-TR_KEYS בלי שהחדש
   נוסף. הלומד בערבית, ברוסית ובאנגלית ראה את המסיח הזה בעברית.

   הבדיקה, בשלוש אפליקציות האוניברסיטה:
     1. כל מחרוזת בתוך _("…") או _f("…") קיימת ב-TR_KEYS  ← מפיל
     2. כמה מפתחות ב-TR_KEYS חסרי תרגום בכל שפה              ← מידע בלבד
   הסעיף השני אינו מפיל: הוא מונה חוב תרגום קיים (שם האפליקציה,
   הוראות התקנת קול, וקבוצה של הסברים) שאינו נולד משינוי מפתח,
   והוא נרשם ב-FINDINGS כפתוח. הסעיף הראשון הוא מה שהכלל מבטיח.
   סטטית, בלי דפדפן.

   הוכחת נפילה: על 308786f — math-uni3, מפתח אחד. אחרי התיקון — 0.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const APPS = ['math-uni', 'math-uni2', 'math-uni3'];
const LANGS = ['ar', 'ru', 'en'];

let bad = 0;
for (const app of APPS) {
  const src = fs.readFileSync(path.join(ROOT, app, 'index.html'), 'utf8');
  const km = src.match(/var TR_KEYS\s*=\s*(\[[\s\S]*?\]);\s*\n/);
  if (!km) { console.log(`✗ ${app}: אין TR_KEYS`); bad++; continue; }
  const KEYS = vm.runInNewContext(km[1]);
  const set = new Set(KEYS);

  /* 1 — כל מחרוזת שנקראת ב-_() קיימת כמפתח */
  const lits = new Map();
  for (const m of src.matchAll(/\b_f?\(\s*"((?:[^"\\]|\\.)*)"/g)) {
    const s = JSON.parse('"' + m[1] + '"');
    if (!lits.has(s)) lits.set(s, src.slice(0, m.index).split('\n').length);
  }
  let miss = 0;
  for (const [s, line] of lits) {
    if (!set.has(s)) { miss++; console.log(`✗ ${app}/index.html:${line}: _("${s.slice(0, 50)}…") — אין מפתח כזה ב-TR_KEYS, הלומד יראה עברית`); }
  }
  if (miss) bad++;
  else console.log(`✓ ${app}: ${lits.size} מחרוזות ב-_(), כולן ב-TR_KEYS (${KEYS.length} מפתחות)`);

  /* 2 — חוב תרגום קיים, לספירה בלבד */
  const D = { ar: {}, ru: {}, en: {} };
  const ctx = { TR_KEYS: KEYS };
  for (const m of src.matchAll(/trAt\("(ar|ru|en)",([^,]+),(\[[\s\S]*?\])\);/g)) {
    const start = vm.runInNewContext(m[2], ctx), arr = vm.runInNewContext(m[3]);
    arr.forEach((v, i) => { if (v) D[m[1]][KEYS[start + i]] = v; });
  }
  for (const m of src.matchAll(/trPart\("(ar|ru|en)",(\[[\s\S]*?\])\);/g)) {
    vm.runInNewContext(m[2]).forEach((v, i) => { if (v) D[m[1]][KEYS[i]] = v; });
  }
  const debt = LANGS.map(l => `${l} ${KEYS.filter(k => !D[l][k]).length}`).join(' · ');
  console.log(`· ${app}: מפתחות בלי תרגום — ${debt}`);
}
console.log(`${bad ? '✗' : '✓'} ${APPS.length} אפליקציות, ${bad} עם מחרוזת שאינה מפתח`);
process.exit(bad ? 1 : 0);
