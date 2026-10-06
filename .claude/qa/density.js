/* =====================================================================
   density.js — כמה שאלות באמת יש בכל תא נושא×רמה

     node .claude/qa/density.js [app…]

   **למה זה נולד (O-136ו, 6.10.2026).** ממצא השער אמר ״מאגר דק״
   על `geography` ו-`islam`. המדידה על כל האפליקציות שמחזיקות מאגר
   `topic()`/`Q()` החזירה תמונה אחרת ורחבה יותר:

       literature / tanakh / hebrew-arab   9.00 שאלות לתא
       motal                              17.00
       islam                               5.73
       russian                             4.00
       geography                           3.27
       biology                             2.00   ← הדק ביותר בריפו

   **9 לתא הוא התקן של הבית**, ולא מספר שהומצא כאן: שלוש אפליקציות
   הבגרות הכתובות ביד מחזיקות בדיוק אותו. ‏`biology` מחזיקה **שתיים**,
   כלומר לומד שפותח נושא ברמה אחת רואה את אותן שתי שאלות — ואז חזרה.
   ‏`biology` כלל לא הופיעה בממצא השער.

   **מה הבדיקה עושה, ובמילים מדודות.** היא **ראצ׳ט**: לכל אפליקציה
   רשום כאן בסיס, והיא נופלת כשהצפיפות ירדה מתחתיו. אפליקציה שהגיעה
   ל-9 נשמרת ב-9. השורות שמתחת ל-9 הן **החוב הפתוח**, מוצהר ומודפס
   בכל ריצה — ולא פטור: כשנוסף תוכן, מעלים כאן את הבסיס באותו קומיט.
   כך הוספה של תוכן אינה יכולה להיעלם, וגריעה אינה יכולה לעבור בשקט.

   הבדיקה קוראת קוד בלבד. אין דפדפן ואין שרת.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const AL = require('./applist.js');

const ROOT = path.join(__dirname, '..', '..');

/* התקן, והחוב. מספר = המינימום לתא. מי שעלה — מעלים כאן. */
const FLOOR = 9;
const BASE = {
  'motal': 17,
  'literature': 9, 'tanakh': 9, 'hebrew-arab': 9,
  /* החוב הפתוח — O-136(ו). כל מספר כאן נמדד ב-6.10.2026. */
  /* `biology` עלתה מ-2 ל-9 ב-6.10.2026 — 105 שאלות חדשות — ולכן
     היא עברה לקו התקן ואינה חוב. */
  /* `geography` עלתה מ-3.27 ל-9 ב-6.10.2026 — 172 שאלות חדשות. */
  /* `russian` עלתה מ-4 ל-9 ב-6.10.2026 — 135 שאלות חדשות. */
  /* `islam` עלתה מ-5.73 ל-9 ב-6.10.2026 — 49 שאלות חדשות. */
  /* `civics` עלתה מ-7 ל-9 ב-6.10.2026 — 48 שאלות חדשות. **וכאן נגמר
     החוב**: כל תשעת המאגרים שהכלי קורא עומדים על הבסיס שלהם, וחמישה
     מהם על 9 או מעליו. */
  /* **חוב חדש, נמדד 6.10.2026** — שלושת המאגרים האלה לא נקראו עד
     שנוספו הבדלים `PARA`/`E`/`C`/`Sc`. המספר הוא התא הדק שנמדד
     היום, ולא יעד: הוא מקבע את הקיים ומונע ירידה. */
  'english': 4, 'history': 3, 'ulpan': 3,
  /* **והמחסן הדק ביותר שנמדד אי־פעם** — O-146(ב), 6.10.2026.
     ‏`science` מחזיקה 52 שורות ל-12 תאים, ו-`eco b2` נושאת
     **שתיים**. תא אחד משרת שתי רמות, ולכן לומד שמתרגל `eco`
     ברמה 3 או 4 רואה את אותן שתי שאלות שוב ושוב — וזה בדיוק
     מה ש-`content.js` מדווח כ-`low-variety` ב-22 תאים. */
  'science': 2,
};

/* המאגר נקרא בהרצה ולא ב-grep: `topic(...)` בונה את TOPICS, ו-`Q`
   מוחלפת בבדל. אפליקציה בלי שני אלה אינה בהיקף (מחולל, lomda,
   משפחת ה-elem עם js/data.js). */
/* 6.10.2026 — O-144(ב). שתי אפליקציות מחזיקות מחסן שטוח ולא שלד
   `topic()`: ‏`science` (`SCIBANK`) ו-`geography-elem` (`GEOBANK`).
   השורה היא `[kind, bucket, {lang:[...]}]`, ו-`genQ` מגריל מתוך
   `kind`+`bucket` — ולכן **התא הוא הצירוף הזה**, ולא ״נושא ורמה״.
   ‏`bucket` אחד משרת שתי רמות (`d<=2?1:(d<=4?2:3)`), ולכן מחסן של
   52 שורות ב-12 תאים הוא ארבע שאלות לתא בפועל. */
function flatBank(app) {
  const f = path.join(ROOT, app, 'index.html');
  if (!fs.existsSync(f)) return null;
  const src = fs.readFileSync(f, 'utf8');
  const m = src.match(/\n(?:const|var) ([A-Z]+BANK)\s*=\s*\[/);
  if (!m) return null;
  const start = src.indexOf('[', src.indexOf(m[0]));
  /* סוף המערך בספירת סוגריים, ולא ב-regex: בתוכו יש סוגריים בטקסט. */
  let depth = 0, end = -1, inStr = null;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (c === '\\') i++; else if (c === inStr) inStr = null; continue }
    if (c === '"' || c === "'") { inStr = c; continue }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (!depth) { end = i + 1; break } }
  }
  if (end < 0) return { err: m[1] + ' — לא נמצא סוף המערך' };
  let rows;
  try { rows = JSON.parse(src.slice(start, end)) }
  catch (e) { return { err: m[1] + ' — ' + e.message } }
  const cells = {};
  for (const r of rows) {
    if (!Array.isArray(r) || r.length < 3) continue;
    const k = r[0] + ' b' + r[1];
    cells[k] = (cells[k] || 0) + 1;
  }
  return { name: m[1], cells: cells, rows: rows.length };
}

function banks(app) {
  const f = path.join(ROOT, app, 'index.html');
  if (!fs.existsSync(f)) return null;
  const src = fs.readFileSync(f, 'utf8');
  const start = src.indexOf('function topic(');
  const end = src.indexOf('function poolOf');
  if (start < 0 || end < 0) return null;
  /* בדלים לכל מה שמאגר עשוי לקרוא לו תוך כדי בנייה: `W` ו-`S`
     (מסיח וצעד במשפחת math-uni), `L` (ארבע שפות), `fig*`. מאגר
     שקורא למשהו שאינו כאן מדווח ואינו מושתק. */
  const code = 'var TOPICS=[];' +
    'function Q(){return{o:arguments[2]}}' +
    'function W(){return{}}function S(){return{}}function L(){return{}}' +
    'function figBox(){return""}function figLine(){return""}function fig(){return""}' +
    /* `PARA` (english, ulpan) ו-`E` (history) הם פריטי מאגר שאינם `Q`:
       קטע קריאה ופריט ציר זמן. הם נספרים כפריטים, כי זה מה שהלומד
       מקבל בהגרלה. נוספו 6.10.2026, אחרי ששלוש אפליקציות דווחו
       ״הכלי אינו קורא את המאגר הזה״. */
    'function PARA(){return{k:"p"}}function E(){return{k:"e"}}function C(){return{k:"c"}}function Sc(){return{k:"p"}}' +
    src.slice(start, end);
  const ctx = {};
  try {
    vm.createContext(ctx);
    vm.runInContext(code, ctx, { timeout: 8000 });
  } catch (e) { return { err: e.message } }
  if (!Array.isArray(ctx.TOPICS) || !ctx.TOPICS.length) return null;
  return ctx.TOPICS;
}

const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
const list = only.length ? only : AL.local();

let bad = 0, scanned = 0, debt = 0, unread = 0;
for (const app of list) {
  const T = banks(app) || flatBank(app);
  if (!T) continue;
  /* **מאגר שלא נקרא הוא מגבלה של הכלי, לא ממצא באפליקציה** — וזה
     נאמר בקול ולא מושתק. לכל מאגר כאן יש עוזרים משלו (`PARA`
     ב-english ו-ulpan, `E` ב-history), והרצה בבדלים אינה יכולה
     לכסות את כולם. מי שמוסיף בדל — מוחק את השורה הזאת לאפליקציה. */
  if (T.err) { console.log(`· ${app}: הכלי אינו קורא את המאגר הזה (${T.err}) — לא נמדד`); unread++; continue }
  scanned++;
  let cells = 0, items = 0, min = Infinity, minAt = '';
  if (T.cells) {
    for (const k of Object.keys(T.cells)) {
      const n = T.cells[k];
      cells++; items += n;
      if (n < min) { min = n; minAt = k }
    }
  } else for (const t of T) (t.L || []).forEach((lv, i) => {
    const n = (lv || []).length;
    cells++; items += n;
    if (n < min) { min = n; minAt = `${t.id} L${i + 1}` }
  });
  const avg = items / cells;
  const base = BASE[app] === undefined ? FLOOR : BASE[app];
  const line = `${app.padEnd(14)} ${String(items).padStart(4)} שאלות · ${String(cells).padStart(3)} תאים · ` +
               `${avg.toFixed(2)} לתא · הדק: ${minAt} (${min}) · בסיס ${base}`;
  if (min < base) { console.log('✗ ' + line + ' — ירד מתחת לבסיס'); bad++; continue }
  if (base < FLOOR) { console.log('· ' + line + ` — חוב פתוח, התקן ${FLOOR}`); debt++; continue }
  console.log('✓ ' + line);
}

console.log(`\n${scanned} מאגרים נמדדו · ${debt} עם חוב מוצהר · ${unread} שהכלי אינו קורא · ${bad} מתחת לבסיס`);
process.exit(bad ? 1 : 0);
