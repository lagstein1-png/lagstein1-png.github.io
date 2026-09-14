/* =====================================================================
   money.js — אין מסחר באתר, ואין דרך להחזיר אותו בשקט

     node .claude/qa/money.js

   **ההחלטה.** הבעלים הכריע 14.9.2026: ״אין עלות כספית, תמחק כל
   קשר לכסף״. לא מחיר, לא דף קנייה, לא מבצע השקה שמרמז על חיוב
   עתידי, ולא שדה `price` ששוכב ומחכה.

   **למה זו בדיקה ולא רק מחיקה.** המסחר כאן נבנה בהדרגה ובשקט:
   קודם שדה `price` ברשומה, אחר כך תגית בכרטיס, אחר כך עמוד
   מחירים, ואז `launch.js` ששכתב את התגיות ו-`buy.html` עם טופס.
   כל שלב היה קטן והגיוני בפני עצמו. מחיקה בלי שער מזמינה את
   אותה הצטברות שוב, ואיש לא יראה אותה עד שהיא על המסך.

   **מה נשאר בכוונה, ואינו ממצא — שתי משפחות:**

   · **תוכן לימודי שעוסק בכסף.** `lomda/data/money.js` היא
     אוריינות פיננסית; במתמטיקה יש תרגילי מחיר בש״ח. מחיקת
     תוכן לימודי אסורה ב-`CLAUDE.md`, וזה גם אינו מה שהוחלט.
     לכן הבדיקה רצה על **הדפים והנתונים של האתר**, לא על
     `lomda/data/` ולא על בנקי השאלות.
   · **האמירה ״חינם״.** היא היעדר מחיר, לא מחיר — והיא בדיוק
     המסר. `badge`, `noAds` ו-`s4` אומרים אותה, והן נשארות.
     מחיקתן הייתה משאירה את הלומד בלי לדעת שזה חינם.

   ── חמש בדיקות ──

     1. אין קובץ מסחר: `pricing/`, `theory/buy.html`, `launch.js`,
        `launch.css`, `marketing/billing-model.md`
     2. אין שדה `price` או `once` באף רשומה ב-`DATA.APPS`
     3. אין מחרוזת מסחר ב-`DATA.STR` באף שפה
     4. אין סכום כסף בדף שהלומד רואה — ספרה צמודה ל-₪, ‎$‎ או ‎€‎
     5. אין תגית `description` שמבטיחה תשלום, ואין קישור קנייה
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const fail = [];
const F = m => fail.push(m);

/* --- 1. קבצים שנמחקו, ואסור שיחזרו --- */
const GONE = ['pricing', 'theory/buy.html', 'launch.js', 'launch.css',
              'marketing/billing-model.md', 'tests/launch.test.html'];
for (const rel of GONE)
  if (fs.existsSync(path.join(ROOT, rel)))
    F(`${rel} חזר — הוא נמחק בהכרעת הבעלים 14.9.2026`);

/* --- דף הבית --- */
const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dm = home.match(/var DATA=(\{[\s\S]*?\});\n/);
if (!dm) { console.log('✗ לא נמצא DATA= בדף הבית'); process.exit(1); }
const DATA = JSON.parse(dm[1]);

/* --- 2. שדות מחיר ברשומות --- */
for (const a of DATA.APPS)
  for (const k of ['price', 'once', 'cost', 'sale'])
    if (k in a) F(`${a.id}: השדה "${k}" חזר ל-DATA.APPS`);

/* --- 3. מחרוזות מסחר במילון --- */
const BAD_KEYS = ['lbar', 'nPricing', 'free', 'once', 'buy', 'price', 'pricing'];
for (const lg of Object.keys(DATA.STR))
  for (const k of BAD_KEYS)
    if (k in DATA.STR[lg]) F(`STR.${lg}.${k} — מחרוזת מסחר חזרה`);

/* --- 4. סכום כסף בטקסט שהלומד רואה --------------------------------
   ספרה שצמודה לסימן מטבע. ״חינם״, ״מجّاني״ ו-״Free״ אינם סכום
   ואינם נתפסים כאן — וזה בכוונה. */
const AMOUNT = /\d\s*[₪$€]|[₪$€]\s*\d/;
for (const lg of Object.keys(DATA.STR))
  for (const [k, v] of Object.entries(DATA.STR[lg]))
    if (typeof v === 'string' && AMOUNT.test(v))
      F(`STR.${lg}.${k} — סכום כסף: ${JSON.stringify(v).slice(0, 60)}`);
for (const a of DATA.APPS)
  for (const field of ['n', 'd'])
    for (const [lg, v] of Object.entries(a[field] || {}))
      if (typeof v === 'string' && AMOUNT.test(v))
        F(`${a.id}.${field}.${lg} — סכום כסף: ${v.slice(0, 50)}`);

/* --- 5. מה הדף מבטיח מחוץ לגוף: meta, וקישורי קנייה ---------------
   `promo.js` נולד מזה בדיוק: שתי תגיות `description` אמרו ״שמונה
   בתשלום״ בזמן שהחלון הקופץ אמר ״הכול חינם״, וחודשיים של בדיקות
   לא ראו זאת — כל הבדיקות הביטו במה שהקוד עושה, ואף אחת לא במה
   שהדף מבטיח. */
const PAGES = [];
(function walk(dir, depth) {
  if (depth > 2) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'marketing') walk(p, depth + 1); }
    else if (e.name.endsWith('.html')) PAGES.push(p);
  }
})(ROOT, 0);

const PAY_META = /(בתשלום|לרכישה|רכישה|מנוי|شراء|مدفوع|اشتراك|платн|подписк|купить|paid|purchase|subscription|checkout)/i;
for (const p of PAGES) {
  const src = fs.readFileSync(p, 'utf8');
  const rel = path.relative(ROOT, p);
  const meta = src.match(/<meta[^>]+name=["']description["'][^>]*>/gi) || [];
  for (const tag of meta)
    if (PAY_META.test(tag)) F(`${rel} — תגית description מבטיחה תשלום: ${tag.slice(0, 80)}`);
  if (/href=["'][^"']*\/(pricing|buy|checkout)\b/i.test(src))
    F(`${rel} — קישור קנייה`);
}

/* --- דוח --- */
console.log(`== אין מסחר · ${DATA.APPS.length} אפליקציות · ${PAGES.length} דפים נסרקו`);
if (fail.length) {
  console.log(`\n   FAIL (${fail.length}):`);
  for (const l of fail) console.log('   ✗ ' + l);
  process.exit(1);
}
console.log('   ✓ אין מחיר, אין דף קנייה, ואין הבטחת תשלום באף דף');
