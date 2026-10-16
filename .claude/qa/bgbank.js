/* =====================================================================
   bgbank.js — מסלול הבגרות של english (BGP), בלי דפדפן.

     node .claude/qa/bgbank.js              english/index.html
     node .claude/qa/bgbank.js <file>       קובץ אחר (הוכחת נפילה)

   למה בדיקה משלה (O-195, 16.10.2026)
   ------------------------------------
   ‏`english-bagrut` היא כרטיס־כינוי ב-stages.json (‏`bank:"none"`,
   ‏`external:true`) למסלול שיושב בתוך `english/index.html` — ‏`var BGP=[`,
   ‏16 קטעי קריאה ו-72 שאלות, ציבורי מ-27.9.2026 (`var BGON=true`).
   ‏`content.js` מדלג על `bank:"none"`, ו-`content.js english` סורק את
   `buildQ` — ואף אחת מחמש ההופעות של BGP אינה בתוכו. כלומר 72 שאלות
   שהלומד רואה, ושאף סורק לא קרא. פעם שלישית באותו מנגנון, אחרי
   civics (O-141) ו-geography-elem.

   מה נבדק
   -------
   1. המבנה: לכל קטע m/title/text, ולכל שאלה q/a/why ו-w של שלושה
      מסיחים — מחרוזות לא ריקות.
   2. ארבע אפשרויות שונות זו מזו (בלי רישיות ורווחים).
   3. אנגלית בלבד בקטע, בשאלה ובאפשרויות — אין אות עברית, ערבית או
      קירילית (״В״ קירילית שנראית לטינית — ההקראה תשבור אותה).
   4. השאלה אינה מכילה את התשובה (מעל 3 תווים).
   5. התשובה אינה הארוכה בבירור (פי 1.3 ויותר מ-6 תווים מעל המסיח
      הארוך) — אחרת מנחשים לפי אורך. אותו סף כמו geobank.js.
   6. שאלה אינה חוזרת, ושם קטע אינו חוזר.
   7. כל מודול שהממשק מציע (bgMods: a–g) מחזיק קטע אחד לפחות, או
      הנחיית ספרות (BGL[*][4]) בארבע השפות — מודול ריק הוא כפתור
      שלוחצים עליו ואין אחריו דבר.
   8. ההסבר (why) הוא משפט: עד 120 תווים, בלי סימני נוסחה — כמו
      clearwhy.js. נבדק על התוכן, לא בדפדפן.
   9. המניין: מדווח, ואינו מפיל — תוכן שגדל אינו באג.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const FILE = process.argv[2] || path.join(ROOT, 'english', 'index.html');

const src = fs.readFileSync(FILE, 'utf8');
const a = src.indexOf('var BGP=[');
const b = src.indexOf('var _bghN', a);
if (a < 0 || b < 0) { console.log('✗ לא נמצא BGP ב-' + FILE + ' — המסלול זז או שונה שמו; הבדיקה חייבת לזוז איתו'); process.exit(1); }
let BGP;
try { BGP = vm.runInNewContext(src.slice(a, b) + ';BGP'); }
catch (e) { console.log('✗ BGP אינו נטען: ' + e.message); process.exit(1); }
/* המודולים שהממשק מציע — מתוך bgMods עצמה, לא מרשימה כאן. */
const mm = src.match(/function bgMods\(\)\{([^\n]*?)\}/);
const MODS = mm ? [...new Set([...mm[1].matchAll(/'([a-z])'/g)].map(m => m[1]))] : [];
if (!MODS.length) { console.log('✗ bgMods לא נמצאה — אי אפשר לדעת אילו מודולים מוצעים'); process.exit(1); }

/* ===== קו בסיס לסעיף 5 — ראצ׳ט, לא פטור (16.10.2026) =====
   בריצה הראשונה נמצאו 25 מתוך 72 שאלות שבהן התשובה הנכונה ארוכה
   בבירור מכל מסיח — לומד שבוחר ״את הארוכה״ קולע בהן בלי לקרוא את
   הקטע. זה ממצא תוכן אמיתי, ותיקונו (מסיחים ארוכים יותר, או תשובה
   קצרה יותר) הוא עבודה של maayan — לא של הבודק. עד אז הן כאן בשמן:
   שאלה **חדשה** עם אותו פגם מפילה; שאלה מהרשימה שתוקנה — מדווחת,
   כדי שתימחק מכאן והרשימה רק תתקצר. */
/* 16.10.2026 (O-222, maayan): 25 השאלות תוקנו — המסיחים נוסחו מחדש
   באורך דומה לתשובה, והתשובות לא נגעו. הרשימה ריקה: כל שאלה שהנכונה
   בה ארוכה בבירור מפילה. */
const LENGTH_BASELINE = new Set([]);

const bad = [], seenQ = new Map(), seenT = new Map(), perMod = {};
const str = x => typeof x === 'string' && x.trim().length > 0;
const norm = x => String(x).toLowerCase().replace(/\s+/g, ' ').trim();
const FOREIGN = /[֐-׿؀-ۿЀ-ӿ]/;
let nQ = 0;
const lenKnown = new Set();
BGP.forEach((p, i) => {
  const at = `קטע ${i} (${p && p.m}: ${p && p.title})`;
  if (!p || !str(p.m) || !str(p.title) || !str(p.text) || !Array.isArray(p.questions) || !p.questions.length) { bad.push(`${at}: חסר m/title/text/questions`); return; }
  if (!MODS.includes(p.m)) bad.push(`${at}: המודול ${p.m} אינו מוצע בממשק — הקטע לעולם לא יוצג`);
  perMod[p.m] = (perMod[p.m] || 0) + 1;
  if (FOREIGN.test(p.title + p.text)) bad.push(`${at}: אות שאינה לטינית בקטע`);
  const t = norm(p.title);
  if (seenT.has(t)) bad.push(`${at}: שם הקטע חוזר על קטע ${seenT.get(t)}`); else seenT.set(t, i);
  p.questions.forEach((q, j) => {
    nQ++;
    const aq = `${at} שאלה ${j + 1}`;
    if (!q || !str(q.q) || !str(q.a) || !str(q.why) || !Array.isArray(q.w) || q.w.length !== 3 || !q.w.every(str)) { bad.push(`${aq}: צריך q, a, why ושלושה מסיחים לא ריקים`); return; }
    const opts = [q.a].concat(q.w);
    if (new Set(opts.map(norm)).size !== 4) bad.push(`${aq}: אפשרויות כפולות`);
    if (FOREIGN.test(q.q + opts.join(''))) bad.push(`${aq}: אות שאינה לטינית בשאלה או באפשרות`);
    if (q.a.trim().length > 3 && norm(q.q).includes(norm(q.a))) bad.push(`${aq}: השאלה מכילה את התשובה`);
    const longest = Math.max(...q.w.map(x => x.trim().length)), al = q.a.trim().length;
    if (al > 1.3 * longest && al - longest > 6) {
      if (LENGTH_BASELINE.has(q.q)) { lenKnown.add(q.q); }
      else bad.push(`${aq}: הנכונה הארוכה בבירור (${al} מול ${longest}) — מנחשים לפי אורך`);
    }
    if (q.why.length > 120) bad.push(`${aq}: ההסבר ${q.why.length} תווים (עד 120)`);
    if (/[=^_{}\\]|→|=>/.test(q.why)) bad.push(`${aq}: סימן נוסחה בהסבר — ״${q.why.slice(0, 50)}״`);
    const k = norm(q.q);
    if (seenQ.has(k)) bad.push(`${aq}: השאלה חוזרת על ${seenQ.get(k)}`); else seenQ.set(k, aq);
  });
});
/* מודול בלי קטעים הוא מודול ספרות (b, d, f) — ההנחיה שלו ב-BGL[*][4],
   לפי המודול. נגזר מ-BGL ולא מרשימה כאן: מודול מוצע חייב קטע או
   הנחיית ספרות בכל ארבע השפות. */
const g = src.indexOf('var BGL=');
let BGL = null;
try { BGL = vm.runInNewContext(src.slice(g, src.indexOf('\n', g)) + ';BGL'); } catch (e) { bad.push('BGL אינו נטען: ' + e.message); }
const LIT = {};
if (BGL) for (const l of ['he', 'ar', 'ru', 'en']) {
  if (!Array.isArray(BGL[l]) || BGL[l].length !== (BGL.en || []).length) bad.push(`BGL.${l}: חסר, או באורך שונה מ-en`);
  for (const [m, t] of Object.entries((BGL[l] || [])[4] || {})) if (str(t)) (LIT[m] = LIT[m] || []).push(l);
}
for (const m of MODS) {
  if (perMod[m]) continue;
  const langs = LIT[m] || [];
  if (langs.length !== 4) bad.push(`מודול ${m}: מוצע בממשק (bgMods), אין בו קטע, והנחיית הספרות שלו קיימת ב-${langs.join('/') || 'אף שפה'} בלבד`);
}
for (const q of LENGTH_BASELINE) if (!lenKnown.has(q))
  console.log(`· ״${q}״ — ברשימת קו הבסיס של סעיף 5 ואינה נופלת עוד (תוקנה או נמחקה); מחק אותה מ-LENGTH_BASELINE`);
if (lenKnown.size) console.log(`· סעיף 5: ${lenKnown.size} שאלות מקו הבסיס — הנכונה ארוכה בבירור. ממצא תוכן פתוח (maayan), לא נכשל כאן`);

for (const x of bad) console.log('✗ ' + x);
console.log(`${bad.length ? '✗' : '✓'} BGP: ${BGP.length} קטעים, ${nQ} שאלות, מודולים ${MODS.map(m => m + ':' + (perMod[m] || (LIT[m] ? 'ספרות' : 0))).join(' ')} — ${bad.length} ממצאים`);
process.exit(bad.length ? 1 : 0);
