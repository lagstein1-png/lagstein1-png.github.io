/* =====================================================================
   Playwright — מאיפה הוא נטען.

   בסביבת הפיתוח הוא מותקן גלובלית ב-/opt/node22, ואינו ברשימת
   התלויות של הריפו (אין package.json, וזו החלטה). ב-GitHub Actions
   הנתיב הזה אינו קיים, ושם הוא מותקן ב-`npm i playwright` בתיקיית
   העבודה. הקובץ הזה מנסה את השני ואז את הראשון, כדי ששבע הבדיקות
   שמריצות דפדפן לא יחזיקו כל אחת נתיב קשיח משלה.
   ===================================================================== */
'use strict';
function load() {
  const tries = [
    () => require('playwright'),
    () => require('/opt/node22/lib/node_modules/playwright'),
  ];
  let last;
  for (const t of tries) { try { return t(); } catch (e) { last = e; } }
  throw new Error('playwright לא נמצא — לא בתיקיית העבודה ולא ב-/opt/node22. ' +
                  'התקנה: npm i playwright && npx playwright install chromium\n' + (last && last.message));
}
module.exports = load();
