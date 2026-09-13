/* =====================================================================
   search.js — אין ספק חיפוש, ואין אשליה שיש

     node .claude/qa/search.js

   **מה זה אוכף.** `O-48` הוא ממצא קריטי: הבעלים פסל ב-12.9.2026
   כל ספק חיפוש חיצוני, ופסל גם את **הצגת** החיפוש — ״אין הצגת
   אשליית חיפוש״. שלב 5 הוא החוזה שנשאר פתוח שם, והוא כתוב
   ב-`tutor-api/SEARCH.md`. הקובץ הזה מוודא שהמסמך והקוד אומרים
   אותו דבר.

   **למה זה לא מיותר לצד `brain.js`.** `brain.js` שואל מי **נטען**
   בדפדפן, ולכן הוא מכסה את הנתיב שדרכו `josh-engine.js` הגיע
   לוויקיפדיה. הוא אינו יודע דבר על השרת, ואינו יודע דבר על מה
   שכתוב ללומד. שתי הדלתות האלה הן בדיוק מה שנשאר פתוח.

   ── שש בדיקות ──

     1. `PROVIDER` הוא `null` — אין ספק מותקן
     2. `checked` **נגזר** מ-`PROVIDER` ואינו כתוב קשיח
     3. התשובה בפועל נושאת `checked`, והיום הוא `false`
     4. אין ניסוח של ״בודק״ / ״מחפש״ בממשק, בארבע השפות
     5. אין ספק חיפוש בקוד השרת
     6. המסמך והקוד מסכימים על המספרים

   **מה שאינו נבדק כאן, וזה מכוון:** חמשת קודי השגיאה שב-§4
   אינם מושווים לקוד, מפני שאין להם קוד — אין ספק, ולכן אין מי
   שמחזיר אותם. בדיקה שהייתה מתיימרת להשוות אותם הייתה משווה
   מסמך לעצמו. ביום שבו ספק יותקן, ההשוואה הזאת היא הבדיקה
   השביעית שצריך להוסיף כאן, וזה כתוב גם ב-`SEARCH.md` §9.

   הוכחת נפילה, 13.9.2026 — שבע הזרקות, הפלטים ב-`FINDINGS.md`.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const WORKER = 'file://' + path.join(ROOT, 'tutor-api', 'worker.js');
const WSRC = path.join(ROOT, 'tutor-api', 'worker.js');
const CLIENT = path.join(ROOT, 'tutor', 'tutor.js');
const DOC = path.join(ROOT, 'tutor-api', 'SEARCH.md');

let bad = 0;
const ok = m => console.log('✓ ' + m);
const fail = m => { console.log('✗ ' + m); bad++ };

for (const f of [WSRC, CLIENT, DOC])
  if (!fs.existsSync(f)) { console.log('✗ חסר: ' + path.relative(ROOT, f)); process.exit(1) }

const wsrc = fs.readFileSync(WSRC, 'utf8');
const client = fs.readFileSync(CLIENT, 'utf8');
const doc = fs.readFileSync(DOC, 'utf8');

/* ------------------------------------------------------------------
   מילון הממשק בלבד, ולא כל הקובץ.

   סריקה של הקובץ כולו הייתה נופלת על ההערות שמסבירות מה אסור —
   בדיוק המלכודת ש-`josh.js` ו-`brain.js` מתעדים: תבנית שמפילה
   קובץ על ההסבר של עצמו מאמנת את העין להתעלם. לכן נחתך `var L = {`
   עד סופו, ונסרקות המחרוזות שבתוכו בלבד.
   ------------------------------------------------------------------ */
function uiStrings() {
  const i = client.indexOf('var L = {');
  if (i < 0) return null;
  /* סוף האובייקט: הסוגר המסולסל שבעומק אפס אחרי ההתחלה. */
  let depth = 0, end = -1;
  for (let k = client.indexOf('{', i); k < client.length; k++) {
    if (client[k] === '{') depth++;
    else if (client[k] === '}') { depth--; if (!depth) { end = k; break } }
  }
  if (end < 0) return null;
  const blk = client.slice(i, end + 1);
  return [...blk.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
}

/* ---------- 1 ---------- */
import(WORKER).then(async W => {

  if (W.PROVIDER === null) ok('אין ספק חיפוש מותקן — PROVIDER הוא null');
  else fail('PROVIDER אינו null אלא ' + typeof W.PROVIDER +
            ' — התקנת ספק דורשת החלטת הבעלים, ראו O-48');

  /* ---------- 2 ----------
     `checked: false` קשיח הוא שקר שנשכח ביום שבו ספק יותקן. */
  if (/checked:\s*!!\s*PROVIDER/.test(wsrc))
    ok('checked נגזר מ-PROVIDER ואינו כתוב קשיח');
  else
    fail('checked אינו נגזר מ-PROVIDER — ערך קבוע יישאר שקר כשספק יותקן');

  /* ---------- 3 ----------
     לא רק שהשורה כתובה, אלא שהיא באמת יוצאת. */
  const inp = W.readBody({ app: 'math-app', lang: 'he',
    messages: [{ role: 'user', text: 'שאלה' }] });
  if (!inp) fail('readBody נכשל — אי אפשר לבדוק את גוף התשובה');
  else {
    /* `fetch` האמיתי דורש מפתח ורשת. במקום להריץ אותו, נבדק
       שהשורה שמרכיבה את התשובה נושאת את שני השדות יחד. */
    const m = wsrc.match(/return json\(\{[\s\S]{0,240}?\},\s*200/);
    if (m && /\btext:/.test(m[0]) && /\bchecked:/.test(m[0]))
      ok('תשובת 200 נושאת גם text וגם checked');
    else
      fail('תשובת 200 אינה נושאת את שני השדות — ' + (m ? m[0].slice(0, 80) : 'לא נמצאה'));
  }

  /* ---------- 4 ----------
     ״אין הצגת אשליית חיפוש״, בלשון הבעלים. ״חושב״ מותר — יש
     בקשה פתוחה למודל והיא אמיתית; ״בודק״ אסור. */
  const BANNED = [
    ['עברית',  /בודק|מחפש|מאמת|מוודא/],
    ['ערבית',  /أبحث|يبحث|أتحقّق|أتحقق|يتحقق/],
    ['רוסית',  /ищу|ищет|проверя|поиск/i],
    ['אנגלית', /\b(check|checking|search|searching|look(ing)?\s+up|verif)/i]
  ];
  const strs = uiStrings();
  if (!strs) fail('לא נמצא מילון הממשק ב-tutor/tutor.js');
  else {
    const hits = [];
    for (const s of strs)
      for (const [lang, re] of BANNED)
        if (re.test(s)) hits.push(lang + ': ' + s);
    if (hits.length) fail('ניסוח של בדיקה/חיפוש בממשק — ' + hits.join(' | '));
    else ok('אין ניסוח של בדיקה או חיפוש בממשק (' + strs.length + ' מחרוזות, ארבע שפות)');
  }

  /* ---------- 5 ----------
     `brain.js` שואל מה הדפדפן טוען; כאן נשאל על השרת. */
  const SRV = [['wikipedia.org', /wikipedia\.org/],
               ['_searchProvider', /_searchProvider/],
               ['googleapis', /googleapis\.com/],
               ['bing', /api\.bing\./]];
  const srvHit = SRV.filter(([, re]) => re.test(wsrc)).map(([n]) => n);
  if (srvHit.length) fail('ספק חיפוש בקוד השרת: ' + srvHit.join(', '));
  else ok('אין ספק חיפוש בקוד השרת');

  /* ---------- 6 ----------
     מסמך שאינו נבדק מול הקוד נפרד ממנו תוך ימים — זה כבר קרה
     כאן, וזו הסיבה ש-`tutor.js` משווה את `CORE` ל-`JOSH.md`. */
  const claims = [];
  const ctx = doc.match(/`LIM\.ctx`\s*\((\d+)\s*תווים\)/);
  if (!ctx) claims.push('המסמך אינו נוקב ב-LIM.ctx');
  else if (+ctx[1] !== W.LIM.ctx)
    claims.push('LIM.ctx: המסמך אומר ' + ctx[1] + ', הקוד אומר ' + W.LIM.ctx);
  for (const k of ['perDay', 'globalPerDay'])
    if (doc.indexOf('`' + k + '`') < 0) claims.push('המסמך אינו מזכיר את ' + k);
  if (doc.indexOf('`PROVIDER`') < 0) claims.push('המסמך אינו נוקב בשם נקודת החיווט');
  if (claims.length) fail('המסמך והקוד אינם מסכימים — ' + claims.join(' | '));
  else ok('המסמך והקוד מסכימים על המספרים ועל שם נקודת החיווט');

  console.log(bad ? `✗ חוזה החיפוש — ${bad} ממצאים`
                  : '✓ חוזה החיפוש — אין ספק, ואין אשליה');
  process.exit(bad ? 1 : 0);
}).catch(e => { console.log('✗ ' + e.message); process.exit(1) });
