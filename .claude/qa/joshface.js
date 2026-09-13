/* =====================================================================
   joshface.js — שכבת הפנים נשארת שכבת תצוגה

     node .claude/qa/joshface.js

   **למה הבדיקה הזאת קיימת.** `josh-engine.js` היה שכבת פנים ומוח
   באותו קובץ, ומפני שהיו מחוברים אף אחד לא ראה מה זורם לאן: כל
   הודעה שלומד הקליד בדף הבית הלכה אל `he.wikipedia.org`, מפני
   ש-`_responder` היה `null` ו-`send` נפל אל `search()`. איש לא
   התכוון לזה, ואיש לא כתב את זה — זה פשוט נבע מכך ששתי השכבות
   ישבו יחד.

   `tutor/josh-face.js` נכתב בשלב 2 כשכבת תצוגה בלבד, וההפרדה הזאת
   היא הדבר היחיד שמונע את החזרה. הצהרה בראש קובץ אינה מונעת דבר —
   `JOSH.md` הצהיר על הכתיב מהיום הראשון, ובלי `josh.js` הוא נסחף
   לשתי צורות.

   שבע שאלות, כולן על `tutor/josh-face.js`:

     1. אין `fetch`, `XMLHttpRequest`, `WebSocket` או `sendBeacon`
     2. אין כתובת רשת חיצונית
     3. אין `speechSynthesis`, `SpeechSynthesisUtterance` ואין
        `SpeechRecognition` — הקול הוא של `tutor/tutor.js`
     4. אין בחירת קול: `getVoices`, `voiceURI`, `pickVoice`, `localService`
     5. אין `ROLE` ואין החלטה מה ללמד
     6. אין `localStorage` — מפתח שנולד בהעתקה הוא מגירה משותפת,
        וזו המלכודת שכבר תפסה כאן ארבע אפליקציות
     7. יש `prefers-reduced-motion`, ואין `requestAnimationFrame`

   הערות **אינן** מוסרות לפני החיפוש, וזה מכוון: הקובץ מתאר בהערותיו
   בדיוק את מה שאסור לו לעשות, ולכן הבדיקה מחפשת **קריאה** — שם
   שאחריו סוגר — ולא אזכור. `"fetch"` בתוך משפט אינו ממצא; `fetch(`
   כן. את כלל האיסור עצמו אי אפשר לכתוב אחרת בלי לאסור על הקובץ
   להסביר את עצמו.

   הוכחת נפילה: שבע הזרקות, כל אחת בנפרד, לעותק זמני של הקובץ.
   כל אחת הפילה את הבדיקה שלה. הפלט ב-`FINDINGS.md`.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const FILE = process.argv[2] || 'tutor/josh-face.js';
/* `resolve` ולא `join`: נתיב מוחלט חייב לנצח, אחרת בדיקה על עותק
   זמני קוראת בשקט את הקובץ האמיתי — וזו בדיוק הדרך שבה הוכחת
   נפילה יוצאת ירוקה ומרגיעה לשווא. */
const full = path.resolve(ROOT, FILE);

if (!fs.existsSync(full)) {
  console.log('✗ ' + FILE + ' אינו קיים');
  process.exit(1);
}
const src = fs.readFileSync(full, 'utf8');

/* קריאה בפועל: שם שאחריו סוגר, ואפשר רווח ביניהם. */
const call = n => new RegExp('(?:^|[^\\w.$])' + n + '\\s*\\(');

const CHECKS = [
  { t: 'אין קריאת רשת',
    bad: [['fetch', call('fetch')], ['XMLHttpRequest', /new\s+XMLHttpRequest/],
          ['WebSocket', /new\s+WebSocket/], ['sendBeacon', /sendBeacon\s*\(/]] },

  { t: 'אין כתובת רשת חיצונית',
    bad: [['כתובת http', /https?:\/\/(?!\/)[a-z0-9]/i]] },

  { t: 'אין מנוע הקראה — הקול הוא של tutor.js',
    bad: [['speechSynthesis', /\bspeechSynthesis\s*[.(\[]/],
          ['SpeechSynthesisUtterance', /new\s+SpeechSynthesisUtterance/],
          ['SpeechRecognition', /\b(?:webkit)?SpeechRecognition\b/]] },

  { t: 'אין בחירת קול',
    bad: [['getVoices', call('getVoices')], ['voiceURI', /\bvoiceURI\b/],
          ['pickVoice', call('pickVoice')], ['localService', /\blocalService\b/]] },

  /* `ROLE` נבדק כשימוש ולא כמילה, מאותה סיבה שהפונקציות נבדקות
     כקריאה: הקובץ מצהיר בהערותיו שאין לו ROLE, ואיסור על המילה היה
     אוסר עליו להסביר את עצמו. הגדרה, גישה לאיבר או קריאה — כן. */
  { t: 'אין ROLE ואין החלטה מה ללמד',
    bad: [['הגדרת ROLE', /\b(?:var|let|const)\s+ROLE\b/],
          ['שימוש ב-ROLE', /\bROLE\s*[[.=]/],
          ['משתנה role', /\brole\s*[:=]\s*["'`]/]] },

  { t: 'אין localStorage',
    bad: [['localStorage', /\blocalStorage\b/], ['sessionStorage', /\bsessionStorage\b/]] },
];

let bad = 0;
for (const c of CHECKS) {
  const hits = c.bad.filter(([, re]) => re.test(src)).map(([n]) => n);
  if (hits.length) { console.log('✗ ' + c.t + ' — נמצא: ' + hits.join(', ')); bad++; }
  else console.log('✓ ' + c.t);
}

/* שתי דרישות חיוביות: מה שחייב להיות שם */
if (!/prefers-reduced-motion/.test(src)) {
  console.log('✗ אין prefers-reduced-motion — תנועה שאי אפשר לכבות'); bad++;
} else console.log('✓ מכבד prefers-reduced-motion');

if (call('requestAnimationFrame').test(src)) {
  console.log('✗ requestAnimationFrame — לולאת אנימציה, ולא CSS'); bad++;
} else console.log('✓ אין לולאת אנימציה — CSS וטיימר אחד');

console.log((bad ? '✗ ' : '✓ ') + FILE + ' — ' + (CHECKS.length + 2) + ' שאלות, ' + bad + ' ממצאים');
process.exit(bad ? 1 : 0);
