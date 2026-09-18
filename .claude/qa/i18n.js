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
     2. כל מפתח ב-TR_KEYS מתורגם לערבית, לרוסית ולאנגלית     ← מפיל
   הסעיף השני היה ״מידע בלבד״ ומנה 155 מפתחות חסרים (O-69). הם לא
   היו חסרים: הספירה פענחה את trAt בביטוי רגולרי שנשבר על פסיק בתוך
   TR_KEYS.indexOf("…"). נמדד 18.9.2026 — כשהקריאות מורצות, החוב
   הוא אפס בשלוש האפליקציות, ולכן הסעיף הפך למפיל. סטטית, בלי דפדפן.

   הוכחת נפילה: סעיף 1 — על 308786f, math-uni3, מפתח אחד; אחרי התיקון 0.
   סעיף 2 — תרגום ערבי אחד שרוקן ב-math-uni2, ומפתח חדש בלי תרגום
   ב-math-uni: שניהם אדומים; העץ עצמו ירוק. הפלט ב-FINDINGS.
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

  /* 2 — כל מפתח מתורגם בשלוש השפות  ← מפיל
     הקריאות ל-trAt מורצות כקוד ולא מפוענחות בביטוי רגולרי. הגרסה
     הקודמת קראה את הארגומנט השני ב-([^,]+), ומפתח שנמסר כ-
     TR_KEYS.indexOf("…, …") — עם פסיק בתוך המחרוזת — נשבר באמצעו
     ולא נספר. כך נרשמו 155 מפתחות ״בלי תרגום״ (O-69) שכולם מתורגמים. */
  const D = { ar: {}, ru: {}, en: {} };
  const ctx = vm.createContext({
    TR_KEYS: KEYS,
    trAt(l, start, arr) { if (start >= 0) arr.forEach((v, i) => { if (v) D[l][KEYS[start + i]] = v; }); },
    trPart(l, arr) { ctx.trAt(l, 0, arr); },
  });
  let calls = 0, broken = 0;
  for (const m of src.matchAll(/^[ \t]*tr(?:At|Part)\("(?:ar|ru|en)"/gm)) {
    let end = m.index, ok = false;
    while ((end = src.indexOf(']);', end)) !== -1) {
      end += 3;
      try { vm.runInContext(src.slice(m.index, end), ctx); ok = true; break; }
      catch (e) { if (!(e instanceof SyntaxError)) throw e; }
    }
    if (ok) calls++; else broken++;
  }
  const debt = LANGS.map(l => [l, KEYS.filter(k => !D[l][k])]);
  const total = debt.reduce((n, [, ks]) => n + ks.length, 0);
  if (total || broken || !calls) {
    bad++;
    console.log(`✗ ${app}: מפתחות בלי תרגום — ${debt.map(([l, ks]) => `${l} ${ks.length}`).join(' · ')}` +
      (broken ? ` · ${broken} קריאות trAt שלא נקראו` : ''));
    for (const [l, ks] of debt) for (const k of ks.slice(0, 5))
      console.log(`    ${l} #${KEYS.indexOf(k)}: ${k.slice(0, 60)}`);
  } else {
    console.log(`✓ ${app}: ${calls} קריאות trAt, כל ${KEYS.length} המפתחות מתורגמים לשלוש השפות`);
  }
}
console.log(`${bad ? '✗' : '✓'} ${APPS.length} אפליקציות, ${bad} כשלים (מחרוזת שאינה מפתח, או מפתח בלי תרגום)`);
process.exit(bad ? 1 : 0);
