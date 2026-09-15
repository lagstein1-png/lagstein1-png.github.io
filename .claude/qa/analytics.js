/* =====================================================================
   analytics.js — ספירת כניסות: או בכל הדפים, או באף אחד — והתנאים
   אומרים את אותו דבר בארבע שפות

     node .claude/qa/analytics.js

   **ההחלטה.** GoatCounter הוסר מכל הדפים ב-10.9.2026 בהחלטת
   הבעלים, וחזר ב-15.9.2026 בהחלטת הבעלים (״תחזיר את GoatCounter
   לכל הדפים״). הבדיקה אינה מכריעה בין השניים — היא אוכפת שהמצב
   אחיד, ושהתנאים מספרים ללומד את האמת.

   **למה זו בדיקה.** ההסרה ב-10.9 מחקה את המשפט ״האתר סופר
   כניסות״ מ-`legal/terms.js` **בעברית בלבד**. הערבית, הרוסית
   והאנגלית המשיכו לומר חמישה ימים שהאתר סופר, בזמן שלא נשלחה
   שום בקשה. נמדד 15.9.2026, לפני התיקון: אפס תגיות ב-13 דפים,
   ושלוש שפות מתוך ארבע עם המשפט. אף בדיקה לא הסתכלה לשם.

   **שלוש בדיקות:**
   1. התגית — או בכל הדפים שיש להם `sw.js` ובדף הבית, או באף אחד.
   2. תגית שקיימת נושאת את קוד האתר של הבעלים (`yehoshua-apps`),
      `async`, ואת הסקריפט מ-`gc.zgo.at` — ולא מציין מקום.
   3. `legal/terms.js`: המשפט ״האתר סופר כניסות״ קיים בכל ארבע
      השפות אם התגית קיימת, ובאף אחת אם לא.
   ===================================================================== */
'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const TAG  = /<script[^>]*data-goatcounter=/i;
const GOOD = /<script data-goatcounter="https:\/\/yehoshua-apps\.goatcounter\.com\/count" async src="\/\/gc\.zgo\.at\/count\.js"><\/script>/;

/* הדפים: דף הבית, וכל תיקייה שיש בה index.html וגם sw.js —
   כלומר אפליקציה. legal/ ו-voice/ אינן אפליקציות ואין להן sw.js. */
const pages = ['index.html'];
for (const e of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!e.isDirectory() || e.name.startsWith('.')) continue;
  const d = path.join(ROOT, e.name);
  if (fs.existsSync(path.join(d, 'index.html')) && fs.existsSync(path.join(d, 'sw.js')))
    pages.push(e.name + '/index.html');
}
pages.sort();

/* ארבע השפות — המשפט כפי שכתוב בתנאים, מילה במילה. */
const TERMS = {
  he: 'האתר סופר כניסות באופן אנונימי, ללא עוגיות.',
  ar: 'الزيارات بشكل مجهول الهوية، دون ملفّات تعريف الارتباط (كوكيز).',
  ru: 'Сайт считает посещения анонимно, без cookies.',
  en: 'The site counts visits anonymously, without cookies.',
};

const bad = [];
const withTag = [], without = [], malformed = [];
for (const p of pages) {
  const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
  const n = (html.match(new RegExp(TAG.source, 'gi')) || []).length;
  if (n === 0) without.push(p);
  else {
    withTag.push(p);
    if (n > 1) malformed.push(p + ' — ' + n + ' תגיות');
    else if (!GOOD.test(html)) malformed.push(p + ' — תגית שאינה בצורה המוסכמת');
  }
}

/* 1. אחידות */
if (withTag.length && without.length)
  bad.push('התגית ב-' + withTag.length + ' דפים ולא ב-' + without.length + ': ' + without.join(', '));
/* 2. צורה */
for (const m of malformed) bad.push(m);

/* 3. התנאים */
const terms = fs.readFileSync(path.join(ROOT, 'legal', 'terms.js'), 'utf8');
const counting = withTag.length > 0 && without.length === 0;
const say = Object.keys(TERMS).filter(l => terms.includes(TERMS[l]));
const silent = Object.keys(TERMS).filter(l => !terms.includes(TERMS[l]));
if (counting && silent.length)
  bad.push('האתר סופר, והתנאים שותקים על זה ב-' + silent.join(', '));
if (!counting && say.length)
  bad.push('האתר אינו סופר, והתנאים אומרים שהוא סופר ב-' + say.join(', '));

const state = counting ? 'סופר' : (withTag.length ? 'חלקי' : 'אינו סופר');
console.log('  דפים: ' + pages.length + ' · עם תגית: ' + withTag.length +
  ' · בתנאים: ' + say.join(',') + (say.length ? '' : '—') + ' · מצב: ' + state);
if (bad.length) {
  for (const b of bad) console.log('✗ ' + b);
  process.exit(1);
}
console.log('✓ analytics — ' + pages.length + ' דפים ' + state + ', והתנאים מסכימים בארבע שפות');
