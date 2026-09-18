/* =====================================================================
   rakia-safety.js — מה שאסור לטקסט של רקיע לומר

     node .claude/qa/rakia-safety.js            כל קובצי rakia/data/texts-*.js
     node .claude/qa/rakia-safety.js --file f   קובץ אחד (לכותב בזמן כתיבה)

   רקיע מציגה מפה אסטרולוגית. הטקסט שלה הוא תיאור נטייה, לא נבואה
   ולא עצה. הבדיקה אוכפת ארבע גדרות, כולן על המחרוזות עצמן:

   1. **אין רפואה, אין כסף, אין משפט, אין מוות.** מילים שהופכות
      תיאור אופי להבטחה על גוף, כיס או גורל.
   2. **אין נבואה.** פעלים שמבטיחים מה יקרה, ומילות תזמון —
      ״השנה״, ״בקרוב״ — שהופכות נטייה לתחזית.
   3. **אין ודאות.** ״בוודאות״, ״ללא ספק״, ״מדעי״ — האפליקציה
      אומרת במסך ״על הדיוק״ שזה אינו מדע, והטקסט לא יסתור אותה.
   4. **אין פנייה במגדר.** ״אתה״, ״אתם״ — הטקסט כתוב באופן
      בלתי־אישי, כך שכל קורא נמצא בו.

   קו הבסיס הוא אפס. ממצא כאן הוא משפט שיש לנסח מחדש.
   הוכחת נפילה: ראו FINDINGS.md, שלב C של רקיע.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const DIR = path.join(ROOT, 'rakia', 'data');

const args = process.argv.slice(2);
const fi = args.indexOf('--file');
const files = fi >= 0 ? [path.resolve(args[fi + 1])]
  : fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => /^texts-.*\.js$/.test(f)).sort().map(f => path.join(DIR, f)) : [];

/* ארבע הגדרות. כל ביטוי נבדק על הטקסט כפי שהוא. */
/* \b אינו עובד עם עברית — אות עברית אינה "תו מילה" ב-JS, ולכן
   "ואתה" לא היה נתפס. מילה שלמה נבדקת בלוקאראונד על טווח האותיות. */
const H = '[\\u05D0-\\u05EA]';
/* אות שימוש אחת לפני המילה — ״ואתה״, ״ותקבל״ — עדיין המילה. */
const words = (...w) => new RegExp('(?<!' + H + ')[ובלשהכמ]?(?:' + w.join('|') + ')(?!' + H + ')');
const stems = (...w) => new RegExp(w.join('|'));
const RULES = [
  ['רפואה / גוף', stems('מחל[הת]', 'חול[הי]', 'בריאות', 'רופא', 'תרופ', 'ניתוח', 'כאב', 'הריון', 'תאונ', 'פציע', 'דיכאון', 'חרד[הת]', 'התמכר')],
  /* ״סרטן״ הוא גם מזל. ״בסרטן״, ״לסרטן״, ״מזל סרטן״, ״מזל הסרטן״ — המזל;
     ״סרטן״ חשוף, ״הסרטן״ בלי ״מזל״ לפניו, ״מסרטן״ — המחלה. נמצא על ידי היפטיה 1. */
  ['רפואה / גוף', new RegExp('(?<!מזל )(?<!' + H + ')[המ]?סרטן')],
  ['מוות',        words('מוות', 'מת', 'מתה', 'ימות', 'תמות', 'קבר', 'שכול', 'למות')],   /* ״אבל״ הוסרה — מילת קישור שכיחה, נמצא על ידי היפטיה 2 */
  ['כסף',         stems('כסף', 'כספי', 'עושר', 'עשיר', 'עוני', 'רווח', 'הפסד', 'השקע', 'בורס', 'הלווא', 'משכורת', 'ירוויח', 'תרוויח', 'תפסיד', 'ירוש[הת]', 'מחיר')],
  ['כסף (מילה)',  words('עני', 'חוב', 'חובות')],
  ['משפט / פשע',  stems('משפט', 'עורך דין', 'תביע', 'פשע', 'משטר[הת]', 'עונש', 'כלא')],
  ['פחד / גורל',  stems('סכנ[הת]', 'מסוכן', 'אסון', 'קלל[הת]', 'מזל רע', 'גורל', 'נגזר', 'בגיד[הת]', 'גירוש', 'פריד[הת]')],
  ['נבואה',       words('יקרה', 'תקרה', 'יזכה', 'תזכה', 'יזכו', 'תזכו', 'תקבל', 'תקבלו', 'יקבל', 'יקבלו', 'תפגוש', 'תפגשו', 'תמצא', 'תמצאו', 'צפוי', 'צפויה', 'צפויים', 'בקרוב', 'השנה', 'החודש', 'השבוע', 'בעתיד', 'יבוא', 'יבואו', 'תבוא')],
  ['ודאות',       stems('בוודאות', 'ללא ספק', 'בלי ספק', 'מדעי', 'מוכח', 'לעולם לא')],
  ['ודאות (מילה)', words('תמיד')],
  ['מגדר',        words('אתה', 'אתם', 'אתן', 'שלכם', 'שלכן', 'לכם', 'שלך')],
];

function load(f) {
  const sb = { window: {}, globalThis: {} };
  sb.window.RAKIA = {}; sb.globalThis = sb;
  const ctx = vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(DIR, 'schema.js'), 'utf8'), ctx, { filename: 'schema.js' });
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: path.basename(f) });
  return sb.window.RAKIA.TEXTS;
}
function walk(o, pathArr, out) {
  if (o && typeof o === 'object') {
    if (typeof o.he === 'string') { out.push([pathArr.join('.'), o.he]); return; }
    for (const k of Object.keys(o)) walk(o[k], pathArr.concat(k), out);
  }
}

let bad = 0, n = 0;
for (const f of files) {
  let texts;
  try { texts = load(f); } catch (e) { console.log(`✗ ${path.basename(f)}: אינו נטען — ${e.message}`); bad++; continue; }
  const items = []; walk(texts, [], items);
  for (const [key, he] of items) {
    n++;
    for (const [name, re] of RULES) {
      const m = he.match(re);
      if (m) { bad++; console.log(`✗ ${path.basename(f)} ${key} — ${name}: ״${m[0]}״\n     ${he.slice(0, 90)}…`); }
    }
  }
}
console.log(`${bad ? '✗' : '✓'} ${n} טקסטים ב-${files.length} קבצים, ${bad} ממצאים`);
process.exit(bad ? 1 : 0);
