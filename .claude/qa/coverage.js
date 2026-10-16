/* =====================================================================
   coverage.js — האחוז שהלומד רואה הוא כיסוי, ולא דיוק (O-189)

     node .claude/qa/coverage.js                  העץ
     node .claude/qa/coverage.js history          אפליקציה אחת
     node .claude/qa/coverage.js --rev=HEAD       הקוד כפי שהוא בקומיט (הוכחת נפילה)

   מה נמצא (O-189, 16.10.2026): בשלוש־עשרה אפליקציות הסרגל על כרטיס
   הנושא, בסרגל הרמה ובמסך ההתקדמות הציג ok/max(6,seen) — דיוק עם מכנה
   קבוע של 6, בלי קשר לגודל התא. תא של 17 (motal) הציג 100% אחרי כשישה
   פריטים, ותא של 3 לא היה יכול להגיע ל-100% בלי לענות פעמיים על אותה
   שאלה. אותו מספר קבע גם ״נשלט״.

   ההכרעה (ארתור): התקדמות = כיסוי — פריטים שנענו נכון לפחות פעם אחת
   מתוך כל מה שהמאגר של התא יכול להציג. ״נשלט״ = כיסוי גבוה וגם דיוק
   אחרון סביר.

   הבדיקה מריצה את הקוד האמיתי של כל אפליקציה ב-vm — לא העתק שלו:
   הבלוק מ-function stKey עד function barCls, itemId, poolOf, chooseIndex
   ושורת הרישום שב-record. המספר ״המוצג״ הוא הפונקציה שסרגל הרמה קורא
   לה (var m=…), ו״נשלט״ הוא התנאי שמסך ההתקדמות סופר בו (…mast++).
     1. סימולציה, תא של 17: לומד שעונה נכון תמיד, הבחירה ב-chooseIndex
        של האפליקציה. 1,000 ריצות. אסור ש-100% יוצג לפני שכל 17 נענו,
        ואחרי 6 תשובות נכונות המוצג < 100% ואינו ״נשלט״.        ← מפיל
     2. תא של 3: שלוש תשובות נכונות שונות ⇒ 100% ו״נשלט״.      ← מפיל
     3. כיסוי מלא ואחריו עשר טעויות ⇒ אינו ״נשלט״ (הדיוק האחרון). ← מפיל
     4. התקדמות שמורה מלפני התיקון (בלי s.r): 13 מתוך 17 פריטים עם
        ok>0, שניים עם ok=0, השאר בלי מידע ⇒ מוצג 13/17 ו״נשלט״.  ← מפיל
     5. הבלוק זהה בכל העותקים, רישום התשובה מעדכן את s.r (recPush),
        אין ok/Math.max(6 ואין mastery(, והתוויות ofL/covL בארבע שפות. ← מפיל

   הוכחת נפילה: --rev=HEAD על d770e305 — אדום (תא של 17 מציג 100% אחרי
   ~5.9 פריטים, תא של 3 אינו מגיע ל-100%). על העץ — ירוק. הפלט ב-FINDINGS.
   סטטית, בלי דפדפן.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { execFileSync } = require('child_process');
const AL = require('./applist.js');
const ROOT = AL.ROOT;

const REV = (process.argv.find(a => a.startsWith('--rev=')) || '').slice(6);
const ARGS = process.argv.slice(2).filter(a => !a.startsWith('--'));
const RUNS = 1000;

function read(app) {
  const rel = app + '/index.html';
  if (REV) {
    try { return execFileSync('git', ['show', REV + ':' + rel], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }); }
    catch (e) { return null; }
  }
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (e) { return null; }
}

/* הרשימה נגזרת: כל אפליקציה שיש בה stOf ומנוע חזרה מרווחת (chooseIndex),
   ופונקציית התקדמות — mastery( הישנה או coverage( החדשה. */
const DERIVED = AL.local().filter(a => {
  const s = read(a);
  return s && /function stOf\(/.test(s) && /function chooseIndex\(/.test(s) &&
         /function (mastery|coverage)\(/.test(s);
});
const APPS = AL.pick(ARGS, DERIVED);
if (APPS === DERIVED && DERIVED.length < 13) {
  console.log(`✗ הגזירה החזירה ${DERIVED.length} אפליקציות (נמדדו 13 ב-16.10.2026) — הזיהוי נשבר`);
  process.exit(1);
}

/* גוף פונקציה לפי איזון סוגריים מסולסלים */
function fnText(src, name) {
  const at = src.indexOf('function ' + name + '(');
  if (at < 0) return null;
  let depth = 0;
  for (let i = src.indexOf('{', at); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(at, i + 1);
  }
  return null;
}

const MARK = '/* ההתקדמות בתא היא כיסוי';
function blockOf(src) {
  const a = src.indexOf(MARK), b = src.indexOf('function barCls(');
  return a >= 0 && b > a ? src.slice(a, b) : null;
}

function harness(app, src) {
  const errs = [];
  const a = src.indexOf('function stKey('), b = src.indexOf('function barCls(');
  if (a < 0 || b < a) return { errs: ['אין בלוק stKey…barCls'] };
  const parts = [src.slice(a, b), fnText(src, 'barCls'), fnText(src, 'itemId'), fnText(src, 'poolOf'), fnText(src, 'chooseIndex')];
  if (parts.some(p => !p)) return { errs: ['חסרה אחת מ-barCls/itemId/poolOf/chooseIndex'] };
  const shown = (src.match(/var m=(\w+)\(tp\.id,i\);/) || [])[1];
  const mast = (src.match(/if\(s&&s\.seen\)\{seen\+\+;if\((.+?)\)mast\+\+/) || [])[1];
  const recLine = (src.match(/var (?:s|st)=stOf\([^)]*\);[^\n]*/) || [])[0];
  if (!shown) errs.push('סרגל הרמה: לא נמצא var m=…(tp.id,i)');
  if (!mast) errs.push('מסך ההתקדמות: לא נמצא התנאי של mast++');
  if (!recLine) errs.push('record: לא נמצאה שורת stOf');
  if (errs.length) return { errs };

  const ctx = {
    state: null, TOP: {},
    clamp: (x, lo, hi) => Math.max(lo, Math.min(hi, x)),
    pick: arr => arr[Math.floor(Math.random() * arr.length)],
    t: k => k, topicOf: id => ctx.TOP[id] || null,
  };
  vm.createContext(ctx);
  vm.runInContext(parts.join('\n') + `
    function __shown(tid,lv){return ${shown}(tid,lv)}
    function __mast(tid,l){var tp={id:tid};return !!(${mast})}
    function __answer(tid,lv,idx,ok){
      var q={tid:tid,lv:lv,id:itemId(tid,lv,idx)};
      ${recLine.replace(/\/\*.*$/, '')}
      var id=itemId(tid,lv,idx); if(!state.item[id])state.item[id]={n:0,ok:0};
      state.item[id].n++; if(ok)state.item[id].ok++;
    }`, ctx, { filename: app + '/index.html' });
  const fresh = () => { ctx.state = { stats: {}, item: {} }; };
  const cell = (id, n) => { ctx.TOP[id] = { id, L: [Array.from({ length: n }, (_, i) => ({ i }))] }; };
  return { ctx, fresh, cell, errs };
}

let fails = 0, motalAvg = null;
const out = [];
for (const app of APPS) {
  const src = read(app);
  const bad = [];
  if (!src) { out.push(`✗ ${app}: אין index.html`); fails++; continue; }
  const H = harness(app, src);
  if (H.errs.length) { bad.push(...H.errs); }
  else {
    const { ctx, fresh, cell } = H;
    cell('T17', 17); cell('T3', 3);
    /* 1 — תא של 17 */
    let early = 0, sumDistinct = 0, hits = 0, after6 = 0, mast6 = 0;
    for (let run = 0; run < RUNS; run++) {
      fresh();
      const seen = new Set(); let prev, k;
      for (k = 1; k <= 300; k++) {
        const pool = ctx.TOP.T17.L[0];
        const idx = vm.runInContext(`chooseIndex("T17",1,TOP.T17.L[0],${prev === undefined ? 'undefined' : prev})`, ctx);
        ctx.__answer('T17', 1, idx, true); seen.add(idx); prev = idx;
        const v = ctx.__shown('T17', 1);
        if (k === 6) { if (v >= 1) after6++; if (ctx.__mast('T17', 1)) mast6++; }
        if (v >= 1) { hits++; sumDistinct += seen.size; if (seen.size < pool.length) early++; break; }
      }
    }
    const avg = hits ? sumDistinct / hits : NaN;
    if (app === 'motal') motalAvg = avg;
    if (early) bad.push(`תא של 17: 100% מוצג לפני שכל הפריטים נענו ב-${early}/${RUNS} ריצות (ממוצע ${avg.toFixed(2)} פריטים)`);
    if (after6) bad.push(`תא של 17: אחרי 6 תשובות נכונות מוצג 100% (${after6}/${RUNS})`);
    if (mast6) bad.push(`תא של 17: ״נשלט״ אחרי 6 תשובות (${mast6}/${RUNS})`);
    if (!hits) bad.push('תא של 17: 100% לא הושג גם אחרי 300 תשובות נכונות');
    /* 2 — תא של 3 */
    fresh(); [0, 1, 2].forEach(i => ctx.__answer('T3', 1, i, true));
    const v3 = ctx.__shown('T3', 1);
    if (v3 < 1) bad.push(`תא של 3: אחרי שלוש תשובות נכונות שונות מוצג ${Math.round(v3 * 100)}%`);
    if (!ctx.__mast('T3', 1)) bad.push('תא של 3: אחרי שלוש תשובות נכונות שונות אינו ״נשלט״');
    /* 3 — כיסוי מלא ואחריו עשר טעויות */
    for (let i = 0; i < 10; i++) ctx.__answer('T3', 1, i % 3, false);
    if (ctx.__mast('T3', 1)) bad.push('תא של 3: ״נשלט״ גם אחרי עשר טעויות ברצף — הדיוק האחרון אינו נבדק');
    /* 4 — התקדמות שמורה מלפני התיקון */
    fresh();
    ctx.state.stats['T17|1'] = { seen: 20, ok: 18, bad: 2 };
    for (let i = 0; i < 13; i++) ctx.state.item['T17|1|' + i] = { n: 1, ok: 1 };
    ctx.state.item['T17|1|13'] = { n: 1, ok: 0 }; ctx.state.item['T17|1|14'] = { n: 1, ok: 0 };
    const vOld = ctx.__shown('T17', 1);
    if (Math.abs(vOld - 13 / 17) > 1e-9) bad.push(`התקדמות שמורה: מוצג ${Math.round(vOld * 100)}% במקום 13/17 (${Math.round(1300 / 17)}%)`);
    if (!ctx.__mast('T17', 1)) bad.push('התקדמות שמורה: 13/17 ודיוק 90% אינו ״נשלט״');
  }
  /* 5 — חיווט וזהות */
  if (/ok\/Math\.max\(6/.test(src)) bad.push('נשאר ok/Math.max(6,…)');
  if (/\bmastery\(/.test(src)) bad.push('נשאר mastery(');
  const rec = src.match(/var (?:s|st)=stOf\([^)]*\);[^\n]*/g) || [];
  if (!rec.length || rec.some(l => !/recPush\(/.test(l))) bad.push('רישום התשובה אינו קורא ל-recPush — הדיוק האחרון אינו נצבר');
  for (const k of ['ofL', 'covL']) {
    const c = (src.match(new RegExp('\\b' + k + ':"[^"]+"', 'g')) || []).length;
    if (c !== 4) bad.push(`התווית ${k} מופיעה ${c} פעמים (צריך 4 — עב/ער/רו/אנ)`);
  }
  if (!blockOf(src)) bad.push('אין בלוק ״ההתקדמות בתא היא כיסוי״');
  if (bad.length) { fails += bad.length; out.push(`✗ ${app}`); bad.forEach(b => out.push('    ' + b)); }
  else out.push(`✓ ${app}`);
}

/* זהות בין העותקים */
const blocks = {};
for (const app of APPS) { const s = read(app); const b = s && blockOf(s); if (b) (blocks[b] = blocks[b] || []).push(app); }
const variants = Object.values(blocks);
if (variants.length > 1) {
  fails++;
  out.push(`✗ בלוק הכיסוי אינו זהה בין העותקים — ${variants.length} גרסאות: ` + variants.map(v => v.join(',')).join(' | '));
}

console.log(out.join('\n'));
if (motalAvg !== null) console.log(`  motal, תא של 17: 100% מוצג אחרי ${motalAvg.toFixed(2)} פריטים שונים בממוצע (${RUNS} ריצות)`);
console.log(fails ? `\n✗ ${fails} ממצאים ב-${APPS.length} אפליקציות${REV ? ' (' + REV + ')' : ''}`
                  : `\n✓ ${APPS.length} אפליקציות — ההתקדמות היא כיסוי, ״נשלט״ דורש גם דיוק אחרון, הבלוק זהה`);
process.exit(fails ? 1 : 0);
