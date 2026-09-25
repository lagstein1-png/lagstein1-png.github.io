/* =====================================================================
   offer.js — הצעה שלימור מציע מתקיימת

     node .claude/qa/offer.js

   **למה הבדיקה הזאת קיימת.** 16.9.2026, הבעלים: לימור אמר ״נעבור
   למסך״ ולא עבר לשום מקום. ״מורה שמבטיח ולא מקיים גרוע ממורה
   ששותק.״ המוח המקומי סיים תשובות ב-״רוצה שנסתכל על השאלה שעל
   המסך?״, ועל ״כן״ ענה ״יופי. בוא נסתכל עליה יחד.״ — ואז שאלה
   מנחה כללית. השאלה עצמה לא הופיעה. ההצעה הייתה טקסט, והביצוע
   לא היה קיים.

   מה נבדק, בארבע השפות, כל תרחיש ב-vm נפרד:

     1. תשובה עם תרגיל על המסך מסתיימת בהצעה (זנב עם ״?״)
     2. ״כן״ אחרי ההצעה **מצטט את השאלה שעל המסך** — `expr`
        ו-`ask`, מה שיש — ולא רק מאשר
     3. והציטוט לעולם אינו כולל את `ans`. המוח המקומי אינו מסגיר
        תשובה, וזו אותה הבטחה של `say.js` ו-`leaks.js`
     4. ״כן״ בלי הצעה קודמת אינו מצטט דבר — הסכמה למה שלא הוצע
        היא באג בכיוון השני

   הבדיקה מריצה את `tutor/josh-local.js` עצמו, ולא העתק שלו.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const FILE = path.join(ROOT, 'tutor', 'josh-local.js');
const src = fs.readFileSync(FILE, 'utf8');

function load() {
  const sandbox = {};
  sandbox.window = sandbox; sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  new vm.Script(src, { filename: FILE }).runInContext(sandbox);
  if (!sandbox.JOSHLOCAL) throw new Error('JOSHLOCAL לא הוגדר');
  return sandbox.JOSHLOCAL;
}

/* ״כן״ בכל שפה — מה שלומד באמת מקליד, ולא מזהה פנימי. */
const YES = { he: 'כן', ar: 'نعم', ru: 'да', en: 'yes' };
/* בקשה שהתשובות עליה אינן שאלה בעצמן, ולכן מקבלות זנב: ״דוגמה״. */
const ASK = { he: 'תן דוגמה', ar: 'مثال', ru: 'пример', en: 'example' };

const Q = { expr: '7 × 8 =', ask: 'כמה זה שבע כפול שמונה', ans: '56', level: 'רמה 2 מתוך 6' };

let bad = 0, ran = 0;
function t(name, ok, why) {
  ran++;
  console.log((ok ? '✓ ' : '✗ ') + name + (ok || !why ? '' : '\n    ' + why));
  if (!ok) bad++;
}

for (const lg of ['he', 'ar', 'ru', 'en']) {
  const J = load();
  const ctx = { lang: lg, q: Q, sign: null };
  /* עד עשרה ניסיונות: הזנב נבחר מכמה נוסחים, וחלקם יכולים להתחלף.
     מה שנבדק הוא שהצעה **קיימת** אחרי שאלה כללית. */
  let first = null;
  for (let i = 0; i < 10 && !first; i++) {
    const r = J.reply(ASK[lg], ctx);
    if (/[?؟]\s*$/.test(r.text)) first = r;
    else J.reply('...', ctx); /* תור ריק מאפס את הדגל */
  }
  t(`${lg} · תשובה עם תרגיל מסתיימת בהצעה`, !!first,
    first ? '' : 'עשר תשובות, אף אחת לא הסתיימה ב-״?״');
  if (!first) continue;

  const yes = J.reply(YES[lg], ctx);
  const quoted = yes.text.indexOf(Q.expr) >= 0 || yes.text.indexOf(Q.ask) >= 0;
  t(`${lg} · ״כן״ אחרי ההצעה מצטט את השאלה שעל המסך`, quoted,
    'התשובה: ' + JSON.stringify(yes.text.slice(0, 120)));
  t(`${lg} · הציטוט אינו מסגיר את התשובה`, yes.text.indexOf(Q.ans) < 0,
    'התשובה כוללת את ' + Q.ans);

  /* 4. הסכמה בלי הצעה */
  const J2 = load();
  const lone = J2.reply(YES[lg], { lang: lg, q: Q, sign: null });
  t(`${lg} · ״כן״ בלי הצעה קודמת אינו מצטט`,
    lone.text.indexOf(Q.expr) < 0 && lone.text.indexOf(Q.ask) < 0,
    'התשובה: ' + JSON.stringify(lone.text.slice(0, 120)));
}

console.log(bad ? `\n✗ ${bad} מתוך ${ran} נכשלו` : `\n✓ ${ran} בדיקות — ההצעה מתקיימת בארבע השפות`);
process.exit(bad ? 1 : 0);
