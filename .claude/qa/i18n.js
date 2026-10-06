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
/* 6.10.2026 — **והרשימה החמישית.** ‏`electric` משתמשת באותו מנגנון
   בדיוק (`_()` + `TR_KEYS` + `trAt`) ומעולם לא נבדקה כאן, מפני
   שהרשימה מנתה שלושה שמות. נמצא כשהרחבת רמה 4 הוסיפה מחרוזות
   חדשות: `content.js` דיווח `lang-untranslated` ×122 — מחרוזות
   שהלומד הערבי, הרוסי והאנגלי רואה בעברית. הרשימה נגזרת עכשיו
   מהקוד עצמו: כל אפליקציה שיש בה `var TR_KEYS = [` נכנסת. */
const APPS = require('./applist.js').local().filter(a => {
  try { return /var TR_KEYS\s*=\s*\[/.test(fs.readFileSync(path.join(ROOT, a, 'index.html'), 'utf8')); }
  catch (e) { return false; }
});
const LANGS = ['ar', 'ru', 'en'];

let bad = 0;
for (const app of APPS) {
  const src = fs.readFileSync(path.join(ROOT, app, 'index.html'), 'utf8');
  const km = src.match(/var TR_KEYS\s*=\s*(\[[\s\S]*?\]);\s*\n/);
  if (!km) { console.log(`✗ ${app}: אין TR_KEYS`); bad++; continue; }
  /* 6.10.2026 — **המערך נבנה בסדר הריצה, ולא מהליטרל בלבד.**
     ‏`TR_KEYS.push("…")` אחרי `load()` הוא קוד, והבודק קרא רק את
     הליטרל: 283 מחרוזות ב-`electric` דווחו ״אין מפתח כזה״ בזמן
     שהיה להן מפתח ותרגום מלא. וגרוע מזה — `trAt("ar",
     TR_KEYS.length-3, […])` נמדד מול אורך הליטרל ולא מול האורך
     בדפדפן, ולכן הצמיד תרגומי זנב למפתחות אחרים לגמרי **ועבר
     בירוק**, כי אותם מפתחות היו מתורגמים ממילא. בודק שבונה
     מילון שגוי ומדווח ירוק גרוע מבודק שאינו קיים.
     כאן הליטרל וה-push מורצים בסדר שבו הם מופיעים בקובץ — בדיוק
     כמו הדפדפן. נמצא ב-math-uni, ב-math-uni2 וב-math-uni3. */
  const KEYS = vm.runInNewContext(km[1]);
  /* `push` ו-`trAt` מורצים **בסדר שבו הם מופיעים בקובץ**, ולא זה
     אחרי זה. ב-math-uni3 יש שני בלוקי push, והאחרון שבהם מופיע
     **אחרי** קריאות ה-trAt שביניהם: להריץ את שניהם קודם מזיז את
     `TR_KEYS.length-3` באחד, וממציא ״מפתח בלי תרגום״ שאינו קיים. */
  const EVENTS = [];
  for (const m of src.matchAll(/^[ \t]*TR_KEYS\.push\(([\s\S]*?)\);[ \t]*$/gm))
    EVENTS.push({ at: m.index, push: m[1] });
  for (const m of src.matchAll(/^[ \t]*tr(?:At|Part)\("(?:ar|ru|en)"/gm))
    EVENTS.push({ at: m.index, call: true });
  EVENTS.sort((a, b) => a.at - b.at);

  const D = { ar: {}, ru: {}, en: {} };
  const ctx = vm.createContext({
    TR_KEYS: KEYS,
    trAt(l, start, arr) { if (start >= 0) arr.forEach((v, i) => { if (v) D[l][KEYS[start + i]] = v; }); },
    trPart(l, arr) { ctx.trAt(l, 0, arr); },
  });
  let calls = 0, broken = 0;
  for (const ev of EVENTS) {
    if (ev.push) {
      try { KEYS.push(...vm.runInNewContext('[' + ev.push + ']')); }
      catch (e) { console.log(`✗ ${app}: TR_KEYS.push שלא נקרא — ${e.message}`); bad++; }
      continue;
    }
    /* הקריאות ל-trAt מורצות כקוד ולא מפוענחות בביטוי רגולרי. הגרסה
       הקודמת קראה את הארגומנט השני ב-([^,]+), ומפתח שנמסר כ-
       TR_KEYS.indexOf("…, …") — עם פסיק בתוך המחרוזת — נשבר באמצעו
       ולא נספר. כך נרשמו 155 מפתחות ״בלי תרגום״ (O-69) שכולם מתורגמים. */
    let end = ev.at, ok = false;
    while ((end = src.indexOf(']);', end)) !== -1) {
      end += 3;
      try { vm.runInContext(src.slice(ev.at, end), ctx); ok = true; break; }
      catch (e) { if (!(e instanceof SyntaxError)) throw e; }
    }
    if (ok) calls++; else broken++;
  }
  const set = new Set(KEYS);

  /* 1 — כל מחרוזת שנקראת ב-_() קיימת כמפתח  (אחרי בניית המערך) */
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

  /* 2 — כל מפתח מתורגם בשלוש השפות  ← מפיל.
     המילון נבנה למעלה, יחד עם המערך, בסדר הריצה. */
  /* ועוגן שאינו קבוע נאמר בקול, ואינו מפיל: המודל כאן כבר נאמן
     לדפדפן, ולכן זו שבירוּת ולא שגיאה. מפתח שיתווסף לסוף הליטרל
     **יזיז** כל `TR_KEYS.length-N` שאחריו, בלי שאיש ירגיש.
     `TR_KEYS.indexOf("…")` אינו זז לעולם. */
  let drifty = 0;
  for (const m of src.matchAll(/tr(?:At|Part)\(\s*"(?:ar|ru|en)"\s*,\s*([^,[]+),/g)) {
    const a = m[1].trim();
    if (/^\d+$/.test(a) || /^TR_KEYS\.indexOf\(\s*"/.test(a)) continue;
    drifty++;
  }
  if (drifty) console.log(`· ${app}: ${drifty} עוגני trAt שאינם קבועים (\`TR_KEYS.length-N\`) — ` +
    `מפתח שיתווסף לסוף יזיז אותם בשקט. \`TR_KEYS.indexOf("…")\` אינו זז.`);

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
