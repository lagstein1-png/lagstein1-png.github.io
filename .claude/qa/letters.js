/* =====================================================================
   אורך המכתב שהכותרת מבטיחה, מול המכתב שבאמת כתוב שם.

   **למה זו בדיקה ולא הערה.** `marketing/outreach-letters.md` פותח
   כל מכתב בשורת `**אורך:** N תווים`, והמספר הזה אינו נגזר — הוא
   הוקלד. נמדד 15.9.2026 על `origin/main`: **כל שבעת המכתבים**
   נקבו במספר שגוי, והפער נע בין תו אחד ל-126.

   זה לא נזק תיאורטי. שורת האורך היא ההוראה המעשית של המסמך —
   מכתב של 478 תווים נכנס להודעת וואטסאפ אחת, ומכתב של 604 לא —
   ומי שמסתמך עליה מקבל מספר שאיש לא מדד.

   ולמה זה חוזר: המספר נכון ברגע שנכתב, וכל עריכה של מילה אחת
   בגוף המכתב מיישנת אותו **בלי שום סימן**. בדיוק אותה משפחה של
   ״מספר בלי מקור הוא שקר״ — רק שכאן המקור קיים, ונמצא שלוש
   שורות מתחת למספר.

   הספירה: כל מה שבין שתי גדרות ה-``` שאחרי הכותרת, אחרי `strip`.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
/* שני קבצים מאז 15.9.2026: המכתבים הראשיים, והמכתבים למגזר הערבי —
   שם כל מכתב נושא שתי שורות אורך, אחת לגוש העברי ואחת לערבי. */
const FILES = [path.join('marketing', 'outreach-letters.md'),
               path.join('marketing', 'outreach-letters-ar.md')];
const HDR = /\*\*אורך:\*\* (\d+) תווים/g;

let bad = 0, n = 0, m;
for (const FILE of FILES) {
const full = path.join(ROOT, FILE);
if (!fs.existsSync(full)) {
  console.log(`✗ ${FILE} אינו קיים`);
  process.exit(1);
}
const s = fs.readFileSync(full, 'utf8');
HDR.lastIndex = 0;
while ((m = HDR.exec(s)) !== null) {
  n++;
  const claim = parseInt(m[1], 10);

  const a = s.indexOf('```', m.index);
  const b = a < 0 ? -1 : s.indexOf('```', a + 3);
  if (a < 0 || b < 0) {
    console.log(`✗ ${FILE}: מכתב ${n} — אין גוש מכתב אחרי שורת האורך`);
    bad++;
    continue;
  }
  const real = s.slice(a + 3, b).trim().length;

  /* שם המכתב, כדי שהממצא יאמר באיזה מהשבעה מדובר */
  const before = s.slice(0, m.index);
  const name = before.includes('## ')
    ? before.split('## ').pop().split('\n')[0].trim()
    : `מכתב ${n}`;

  if (real !== claim) {
    console.log(`✗ ${FILE}: ${name} — כתוב ${claim} תווים, בפועל ${real}`);
    bad++;
  } else {
    console.log(`✓ ${name} — ${real} תווים`);
  }
}
}

if (!n) {
  console.log(`✗ אין אף שורת \`**אורך:** N תווים\` — הפורמט השתנה`);
  process.exit(1);
}

console.log(`\n${n} גושי מכתב בשני קבצים, ${bad} שאורכם אינו מה שהכותרת מבטיחה`);
process.exit(bad ? 1 : 0);
