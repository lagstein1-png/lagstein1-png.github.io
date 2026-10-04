/* =====================================================================
   רשימת האפליקציות לבדיקה — נגזרת, לא כתובה ביד.

     const AL = require('./applist.js');
     AL.local()                      // כל מה שב-stages.json, קיים בריפו, לא external
     AL.withFile('js/speech.js')     // מי שיש לו את הקובץ הזה
     AL.matching(/RECORDED\.play/)   // מי שה-index.html שלו מכיל את התבנית
     AL.pick(argv, AL.local())       // שמות מפורשים בשורת הפקודה גוברים

   **למה הקובץ הזה נולד (4.10.2026).** `CLAUDE.md` קובע כבר היום
   ש״רשימת אפליקציות בבדיקה נגזרת מ-`stages.json`, לא נכתבת ביד״,
   ו-`visible.js` אף מסביר למה: רשימה קשיחה מתיישנת בכל אפליקציה
   שנוספת או נמחקת, וכך `fonts.js` מנתה `pricing` שנמחקה והחמיצה
   את `kotvim`. אבל מתוך חמישה־עשר כלים שנבדקו **רק `visible.js`
   באמת עשה זאת** — והמחיר נמדד באותו יום:

   • דליפת מקש הרווח (ההקראה מסגירה את התשובה לפני שעונים) ישבה
     ב-**עשר** אפליקציות, וכולן היו ירוקות ב-`say.js` — מפני
     ש-`say.js` מכוון לארבע אפליקציות בשם.
   • `clearwhy.js` מודד ארבע. הרצה ידנית שלו על `electric` החזירה
     **25 הסברים ארוכים מ-120 תווים**, שהריצה הרגילה אינה רואה.
   • `voice.js` מכוון לשלוש־עשרה, וכל שבע אפליקציות ה-`elem`
     הרב־קובציות מחוצה לו. בכל אחת מהן באמת חסרו ארבעה מתוך חמשת
     מנגנוני ההקראה.

   **ולא כל רשימה היא באג.** ב-`engine.js` הרשימה היא *ההגדרה* —
   אלה עותקי המנוע שחייבים להיות זהים; ב-`saysym.js` אלה
   האפליקציות שיש בהן סימנים מתמטיים. לכלי כזה השתמשו ב-`matching`
   או ב-`withFile`, שגוזרים מתוך תוכן הקוד ולא מתוך שם שהוקלד.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const STAGES = require('./stages.json');

/* אפליקציה ב-stages.json שאינה external ושהתיקייה שלה קיימת כאן.
   `external` הוא ריפו אחר (״תאוריה מדברת״), ואין מה לקרוא בו. */
function local() {
  return Object.entries(STAGES.apps || STAGES)
    .filter(([, v]) => !(v && v.external))
    .map(([k]) => k)
    .filter(a => fs.existsSync(path.join(ROOT, a)));
}

function stage(...names) {
  const want = new Set(names);
  return local().filter(a => {
    const v = (STAGES.apps || STAGES)[a];
    return want.has((v && v.stage) || v);
  });
}

function withFile(rel, apps) {
  return (apps || local()).filter(a => fs.existsSync(path.join(ROOT, a, rel)));
}

/* קורא את כל קובצי ה-JS וה-HTML של האפליקציה, לא רק index.html —
   שבע אפליקציות כאן רב־קובציות, והמנוע שלהן יושב ב-js/. */
function sourceOf(app) {
  const out = [];
  (function walk(d) {
    let ents;
    try { ents = fs.readdirSync(d, { withFileTypes: true }) } catch (e) { return }
    for (const e of ents) {
      if (e.name === 'img' || e.name === 'audio' || e.name === 'vendor') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(html|js)$/.test(e.name) && e.name !== 'sw.js') {
        try { out.push(fs.readFileSync(p, 'utf8')) } catch (e2) {}
      }
    }
  })(path.join(ROOT, app));
  return out.join('\n');
}

function matching(re, apps) {
  return (apps || local()).filter(a => re.test(sourceOf(a)));
}

/* שם מפורש בשורת הפקודה תמיד גובר — כך אפשר לבדוק אפליקציה אחת
   בזמן עבודה, בלי להמתין לכל הרשימה. */
function pick(argv, fallback) {
  const named = (argv || []).filter(a => !a.startsWith('-')).map(a => a.replace(/\/$/, ''));
  return named.length ? named : fallback;
}

module.exports = { ROOT, STAGES, local, stage, withFile, matching, sourceOf, pick };

if (require.main === module) {
  const L = local();
  console.log(`${L.length} אפליקציות ב-stages.json שקיימות כאן:`);
  console.log('  ' + L.join(' '));
  for (const s of ['public', 'approved', 'content-qa', 'internal', 'build']) {
    const g = stage(s);
    if (g.length) console.log(`${String(g.length).padStart(3)} · ${s}: ${g.join(' ')}`);
  }
}
