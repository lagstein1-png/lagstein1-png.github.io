/* =====================================================================
   port.js — הפורט של השרת המקומי, במקום אחד.

     const { PORT, BASE } = require('./port.js');
     QA_PORT=8123 node .claude/qa/all.js      שתי ריצות במקביל, בלי התנגשות
     node .claude/qa/port.js --check          אין כלי שמקודד 127.0.0.1:8099 קשיח

   **למה זה קיים (O-197, 16.10.2026).** 26 מתוך 30 כלי הדפדפן החזיקו
   `127.0.0.1:8099` קשיח, וארבעה בלבד קראו `QA_PORT`. `serve.js` כבר
   ידע להקשיב על פורט אחר — אבל הכלים לא ידעו לפנות אליו, ולכן אי
   אפשר היה להריץ שתי בדיקות במקביל, ושלושה בוטים נפרדים נתקעו בזה.
   כאן הפורט נגזר פעם אחת: `QA_PORT` מהסביבה, ברירת מחדל 8099.
   `QA_BASE` (כתובת מלאה) גובר, כמו שהיה ב-`guess`/`visible`/`shadow`.

   `--check` סורק את קובצי ה-JS שב-.claude/qa ונופל על כל פורט קשיח
   כמחרוזת בקוד, או `|| 8099`. החריגים בשם, עם נימוק.
   ===================================================================== */
'use strict';
const PORT = Number(process.env.QA_PORT) || 8099;
const BASE = (process.env.QA_BASE || 'http://127.0.0.1:' + PORT).replace(/\/$/, '');
module.exports = { PORT, BASE };

if (require.main === module) {
  const fs = require('fs'), path = require('path');
  /* קובץ → נימוק. חריג שכבר אינו מקודד קשיח מדווח, כדי שיימחק מכאן. */
  const EXEMPT = {
    /* בעבודה של סשן מקביל ב-16.10.2026 — מחוץ לתחום של התיקון הזה.
       מי שנוגע בו הבא: `const { BASE } = require('./port.js')` ומחיקה מכאן. */
  };
  const QA = __dirname;
  const files = fs.readdirSync(QA).filter(f => /\.(m?js)$/.test(f) && f !== 'port.js');
  let bad = 0;
  for (const f of files) {
    /* מחרוזת בגרש או במרכאות — כך הערה שמצטטת כתובת בתוך `…`
       (brain.js) אינה נספרת, ותבנית ה-glob של page.route אינה נבלעת
       כפתיחת הערה. ו-`|| 8099` תופס את הצורה של serve.js/keyboard.js. */
    const code = fs.readFileSync(path.join(QA, f), 'utf8');
    const hits = code.split('\n').map((l, i) => [i, l])
      .filter(([, l]) => /['"]https?:\/\/(127\.0\.0\.1|localhost):8099|\|\|\s*8099\b/.test(l));
    if (!hits.length) {
      if (EXEMPT[f]) console.log(`· ${f} — ברשימת החריגים ואינו מקודד עוד; מחק אותו מ-EXEMPT`);
      continue;
    }
    if (EXEMPT[f]) { console.log(`· ${f} — חריג: ${EXEMPT[f]}`); continue; }
    bad++;
    console.log(`✗ ${f} — פורט קשיח (${hits.length}): ${hits[0][1].trim().slice(0, 90)}`);
  }
  console.log(`${bad ? '✗' : '✓'} ${files.length} קבצים, ${bad} עם 127.0.0.1:8099 קשיח — הפורט בא מ-port.js (QA_PORT=${PORT})`);
  process.exit(bad ? 1 : 0);
}
