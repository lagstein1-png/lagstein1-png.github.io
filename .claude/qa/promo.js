/* =====================================================================
   promo.js — במבצע ההשקה שום דבר אינו אומר ללומד שהוא משלם

     node .claude/qa/promo.js

   **למה זה קיים.** `launch.js` כותב מחדש את תגיות `.t.price` **בתוך**
   דף הבית, ולכן הוא לא נוגע בשני מקומות שהלומד כן רואה: תגית
   `<meta name="description">`, שהיא מה שגוגל וּוואטסאפ מציגים, וטקסט
   שיווקי שיושב בגוף עמוד אחר. נמדד 13.9.2026 — שתי התגיות בדף הבית
   ושתיים בעמוד המחירים אמרו ״שמונה בתשלום״ בזמן שהחלון הקופץ אמר
   ״כל האפליקציות פתוחות עכשיו בחינם – ללא חיוב״. **ההבטחה שמחוץ
   לדף הייתה הישנה, וחודשיים של בדיקות לא ראו אותה** — מפני שכל
   הבדיקות מסתכלות על מה שהקוד עושה, ואף אחת לא על מה שהדף מבטיח.

   ואז נמצא החריג: ״תאוריה מדברת״ נשארה בתשלום ב-`launch.js` עצמו,
   79 ₪ וכפתור ״לרכישה״. הבעלים הכריע — ״לא כלום לא בתשלום״,
   ״הכל חינם״ — והבדיקה הזאת נועלת את שני הדברים יחד.

   ── ארבע בדיקות ──

     1. אין חריג ב-`launch.js`: לא `THEORY_SALE`, לא `BUY_URL`, לא
        `.launch-sale`/`.launch-buy`, ולא `theory` מיוצא
     2. נוסח המבצע קיים בארבע השפות במילון של `launch.js`
     3. שלושת הדפים שמציגים מחיר נושאים פס מבצע
     4. אין תגית `description` שאומרת ללומד שהוא משלם

   **מה שאינו נבדק כאן, וזה מכוון:** טבלת המחירים עצמה, ו-`price`
   ב-`DATA.APPS`. הבעלים הכריע ב-10.9.2026 שהמחירים **נשמרים**
   ונכנסים לתוקף בסיום המבצע. בדיקה שהייתה דורשת אפס מחירים הייתה
   דורשת למחוק נתון, וזה בדיוק ההפוך ממה שהוחלט. מה שנבדק הוא
   ההבטחה, לא הנתון.

   הוכחת נפילה, 13.9.2026 — ארבע הזרקות, הפלטים ב-`FINDINGS.md`.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

let bad = 0;
const ok = m => console.log('✓ ' + m);
const fail = m => { console.log('✗ ' + m); bad++ };
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

/* ---------- 1 ----------
   החריג שהוסר. שם מיוצא אינו התנהגות, ולכן נבדקים גם הקבועים,
   גם שתי המחלקות שרק הוא יצר, וגם הייצוא. */
const lj = read('launch.js');
const lc = read('launch.css');
const gone = [
  ['THEORY_SALE', /\bTHEORY_SALE\b/],
  ['BUY_URL', /\bBUY_URL\b/],
  ['theory:', /\btheory\s*:/],
  ['launch-sale', /["'][^"']*launch-sale/],
  ['launch-buy', /["'][^"']*launch-buy/]
];
const back = gone.filter(([, re]) => re.test(lj)).map(([n]) => n);
if (back.length)
  fail('החריג של ״תאוריה מדברת״ חזר ל-launch.js: ' + back.join(', ') +
       ' — הבעלים הכריע 13.9.2026 ״לא כלום לא בתשלום״');
else if (/\.launch-sale\s*\{|\.launch-buy\s*[{:]/.test(lc))
  fail('launch.css עדיין מעצב .launch-sale או .launch-buy — אין להם יוצר');
else ok('אין חריג: לא THEORY_SALE, לא BUY_URL, ואין מחיר מבצע או כפתור רכישה');

/* ---------- 2 ----------
   הנוסח הוא של הבעלים, והוא מקור האמת לכל השאר. אם הוא נעלם
   מהמילון — אין מה להשוות אליו, וכל השאר חסר עוגן. */
const SAY = [['עברית', /ללא חיוב/], ['ערבית', /بلا رسوم/],
             ['רוסית', /без оплаты/], ['אנגלית', /no charge/i]];
const miss = SAY.filter(([, re]) => !re.test(lj)).map(([n]) => n);
if (miss.length) fail('נוסח המבצע חסר ב-launch.js: ' + miss.join(', '));
else ok('נוסח המבצע קיים בארבע השפות במילון של launch.js');

/* ---------- 3 ----------
   שלושת הדפים שמציגים מחיר. בדף הבית הפס נמלא מהמילון בזמן ריצה
   (#lbar), ובשני האחרים הוא כתוב בגוף ה-HTML. */
const BARS = [['index.html', /id="lbar"/],
              ['pricing/index.html', /class="launch-bar"[\s\S]{0,200}ללא חיוב/],
              ['theory/buy.html', /class="launch-bar"[\s\S]{0,200}ללא חיוב/]];
const nobar = BARS.filter(([f, re]) => !re.test(read(f))).map(([f]) => f);
if (nobar.length) fail('דף שמציג מחיר בלי פס מבצע: ' + nobar.join(', '));
else ok('שלושת הדפים שמציגים מחיר נושאים פס מבצע');

/* ---------- 4 ----------
   התגית שאיש לא בדק. נסרקות תגיות description בלבד — לא הדף כולו —
   מפני שטבלת מחירים היא נתון מותר, וההבטחה היא מה שנבדק.

   ״בתשלום״ בהקשר של האפליקציות עצמן הוא מה שנאסר: ״שמונה בתשלום״.
   ״ייכנס לתוקף בסיום המבצע, בתשלום חד־פעמי״ הוא עתיד מוצהר, והוא
   מותר — לכן התבנית דורשת מספר או ״כל״ לפני המילה, ולא את המילה
   לבדה. */
const CLAIM = [
  ['עברית',  /(שמונה|שמונת|כל ה?אפליקציות|ארבע)\s+[^"]{0,20}בתשלום/],
  ['אנגלית', /\b(eight|all|four)\s+[^"]{0,20}paid\b/i],
  ['ערבית',  /(ثمانية|كل)\s+[^"]{0,24}(مدفوع|بأجر)/],
  ['רוסית',  /(восемь|все)\s+[^"]{0,24}платн/i]
];
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    const rel = d ? d + '/' + e.name : e.name;
    if (e.isDirectory()) {
      /* apps-21 ו-tests אינם דפים שהלומד מגיע אליהם */
      if (['node_modules', '.git', 'apps-21', 'tests', '.claude'].includes(e.name)) continue;
      walk(rel);
    } else if (e.name.endsWith('.html')) pages.push(rel);
  }
})('');
const hits = [];
for (const p of pages) {
  const src = read(p);
  for (const m of src.matchAll(/<meta[^>]+(?:name="description"|property="og:description")[^>]*content="([^"]*)"/g))
    for (const [lang, re] of CLAIM)
      if (re.test(m[1])) hits.push(p + ' (' + lang + '): ' + m[1].slice(0, 70));
}
if (hits.length) fail('תגית description שאומרת ללומד שהוא משלם — ' + hits.join(' | '));
else ok('אין תגית description שאומרת ללומד שהוא משלם (' + pages.length + ' דפים)');

console.log(bad ? `✗ מבצע ההשקה — ${bad} ממצאים`
                : '✓ מבצע ההשקה — שום דבר אינו אומר ללומד שהוא משלם');
process.exit(bad ? 1 : 0);
