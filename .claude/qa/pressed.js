/* =====================================================================
   pressed.js — כפתור דו־מצבי אומר לקורא המסך באיזה מצב הוא

     node .claude/qa/pressed.js [app…]

   **למה זה נולד (O-136א, 5.10.2026).** בוטי השער דיווחו על
   `aria-pressed` חסר בחמש אפליקציות. מדידה על כל 38 החזירה **364
   כפתורים** בעשרים ושתיים: כל בוררי הרמה, השפה, ערכת הצבע, מצב
   הקול, אורך הסבב והנושא. לומד שרואה את המסך יודע איזה כפתור דולק —
   המחלקה `on` צובעת אותו. קורא מסך לא ידע כלום: הוא הקריא ״כפתור,
   רמה 2״ בלי לומר שהיא הנבחרת, בדיוק אצל מי שתלוי בו.

   **מה נבדק, ובמילים מדודות.** האפליקציות כאן בונות HTML במחרוזות,
   ולכן אין DOM לקרוא בלי דפדפן; מה שנקרא הוא **תבנית הבנייה**:
   תגית `<button` שמחלקת ה-`class` שלה מדליקה `on` לפי תנאי — כלומר
   כפתור שיש לו מצב — חייבת לשאת `aria-pressed` באותה תגית, או
   `aria-current` (ניווט, ושם זה הסימון הנכון).

   **ומה אינו נבדק כאן:** ש-`aria-pressed` באמת זז עם התנאי. זה
   `aria.js`, שבודק שהערך אינו מחרוזת קבועה.

   הבדיקה קוראת קוד בלבד. אין דפדפן ואין שרת.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const AL = require('./applist.js');

const ROOT = path.join(__dirname, '..', '..');
const APPS = process.argv.slice(2).filter(a => !a.startsWith('--'));
const list = APPS.length ? APPS : AL.local();

/* כפתור עם מחלקת `on` מותנית — שלוש הצורות שבשימוש בפועל */
const RE = [
  /<button\s+class="(?:[^"\\]|\\.)*?\?" ?on"\s*:\s*""\)[^>]*?>/g,
  /<button\s+class="[^"]*?\?"on"\s*:\s*""\)[^>]*?>/g,
  /<button\s+class="',\s*\([^)]*\?"on"\s*:\s*""\),[^>]*?>/g,
];

function filesOf(app) {
  const out = [];
  for (const f of ['index.html', 'app.js']) {
    const p = path.join(ROOT, app, f);
    if (fs.existsSync(p)) out.push(p);
  }
  const js = path.join(ROOT, app, 'js');
  if (fs.existsSync(js)) for (const f of fs.readdirSync(js).filter(x => x.endsWith('.js'))) out.push(path.join(js, f));
  return out;
}

let bad = 0, seen = 0, apps = 0;
for (const app of list) {
  let n = 0, miss = [];
  for (const p of filesOf(app)) {
    const src = fs.readFileSync(p, 'utf8');
    const hits = new Set();
    for (const re of RE) { re.lastIndex = 0; let m; while ((m = re.exec(src))) hits.add(m[0]); }
    for (const tag of hits) {
      n++;
      /* `role="switch"` מסומן ב-`aria-checked` ולא ב-`aria-pressed`,
         ושניהם יחד אינם חוקיים — 14 כפתורי מתג כאלה יש כאן. */
      if (!/aria-pressed|aria-current|aria-checked/.test(tag)) {
        miss.push(path.relative(ROOT, p) + ' — ' + tag.slice(0, 110).replace(/\s+/g, ' '));
      }
    }
  }
  seen += n;
  if (!n) continue;
  apps++;
  if (miss.length) {
    bad += miss.length;
    console.log(`✗ ${app} — ${miss.length} כפתורים דו־מצביים בלי aria-pressed`);
    for (const m of miss.slice(0, 6)) console.log('     ' + m);
    if (miss.length > 6) console.log(`     …ועוד ${miss.length - 6}`);
  }
}

console.log(`\n${apps} אפליקציות עם כפתורים דו־מצביים · ${seen} תבניות כפתור · ${bad} בלי aria-pressed`);
process.exit(bad ? 1 : 0);
