/* =====================================================================
   geobank.js — המחסן של geography-elem (GEOBANK), בלי דפדפן.

     node .claude/qa/geobank.js

   למה בדיקה משלה
   ---------------
   GEOBANK הוא מחסן סטטי בסכימה של math-app — שורה אחת לכל שאלה:
     ["unit", רמה, {he/en/ru/ar: [שאלה, נכונה, שגויה×3, רמז1, רמז2, הסבר]}]
   content.js אינו סורק אותו (stages.json: ״מחוץ להיקף״), והסריקות של
   27.9 היו חד־פעמיות. ב-1.10.2026 המחסן גדל מ-52 ל-156 שורות, ובלי
   בדיקה קבועה השורה הבאה שתיכתב ביד לא תיבדק בכלל.

   מה נבדק, לכל שורה ולכל שפה
   ---------------------------
   1. ארבע שפות, 8 מחרוזות לא ריקות.
   2. ארבע אפשרויות שונות זו מזו.
   3. אין אותיות עבריות בערבית, ברוסית ובאנגלית; הרוסית ברוסית והערבית בערבית.
   4. הרמזים והשאלה אינם מכילים את התשובה (מעל 3 תווים).
   5. התשובה הנכונה אינה הארוכה בבירור (פי 1.3 ויותר מ-6 תווים מעל
      המסיח הארוך) — אחרת מנחשים לפי אורך.
   6. שאלה עברית אינה חוזרת במחסן.
   7. בכל תא (יחידה × רמה) יש לפחות MIN שורות.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const FILE = process.argv[2] || path.join(ROOT, 'geography-elem', 'index.html');
const UNITS = ['maps', 'med', 'regions', 'jeru'];
const MIN = 13;

const src = fs.readFileSync(FILE, 'utf8');
const a = src.indexOf('const GEOBANK=[');
const b = src.indexOf('\n]\nfunction genQ', a);
if (a < 0 || b < 0) { console.log('✗ לא נמצא GEOBANK ב-' + FILE); process.exit(1); }
let bank;
try { bank = JSON.parse(src.slice(a + 'const GEOBANK='.length, b + 2)); }
catch (e) { console.log('✗ GEOBANK אינו JSON תקין: ' + e.message); process.exit(1); }

const bad = [], cell = {}, seen = new Map();
bank.forEach((r, i) => {
  const at = `שורה ${i} (${r[0]} ${r[1]})`;
  if (!UNITS.includes(r[0]) || ![1, 2, 3].includes(r[1])) { bad.push(`${at}: יחידה או רמה לא מוכרת`); return; }
  cell[r[0] + r[1]] = (cell[r[0] + r[1]] || 0) + 1;
  const langs = Object.keys(r[2] || {}).sort().join(',');
  if (langs !== 'ar,en,he,ru') bad.push(`${at}: שפות ${langs}`);
  for (const [g, L] of Object.entries(r[2] || {})) {
    if (!Array.isArray(L) || L.length !== 8 || L.some(x => typeof x !== 'string' || !x.trim())) { bad.push(`${at} ${g}: צריך 8 מחרוזות לא ריקות`); continue; }
    if (new Set(L.slice(1, 5).map(x => x.trim())).size !== 4) bad.push(`${at} ${g}: אפשרויות כפולות`);
    if (g !== 'he' && /[֐-׿]/.test(L.join(''))) bad.push(`${at} ${g}: אותיות עבריות`);
    if (g === 'ru' && !/[Ѐ-ӿ]/.test(L[0])) bad.push(`${at} ru: השאלה אינה ברוסית`);
    if (g === 'ar' && !/[؀-ۿ]/.test(L[0])) bad.push(`${at} ar: השאלה אינה בערבית`);
    const ans = L[1].trim(), longest = Math.max(...L.slice(2, 5).map(x => x.length));
    if (ans.length > 3 && [L[0], L[5], L[6]].some(x => x.includes(ans))) bad.push(`${at} ${g}: השאלה או רמז מכילים את התשובה`);
    if (ans.length > 1.3 * longest && ans.length - longest > 6) bad.push(`${at} ${g}: הנכונה הארוכה בבירור (${ans.length} מול ${longest})`);
  }
  const q = r[2] && r[2].he && r[2].he[0];
  if (q) { if (seen.has(q)) bad.push(`${at}: השאלה חוזרת על שורה ${seen.get(q)}`); else seen.set(q, i); }
});
for (const u of UNITS) for (const l of [1, 2, 3])
  if ((cell[u + l] || 0) < MIN) bad.push(`${u} רמה ${l}: ${cell[u + l] || 0} שורות, צריך לפחות ${MIN}`);

if (bad.length) { for (const x of bad) console.log('✗ ' + x); console.log(`\n${bank.length} שורות, ${bad.length} ממצאים`); process.exit(1); }
console.log(`✓ GEOBANK: ${bank.length} שורות, ${UNITS.length} יחידות × 3 רמות, לפחות ${MIN} בכל תא — 0 ממצאים`);
