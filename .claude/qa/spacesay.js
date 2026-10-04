/* =====================================================================
   מקש הרווח מקריא את `P.q.say` לפני שענו — סריקה סטטית בכל האפליקציות.

     node .claude/qa/spacesay.js            # כל האפליקציות שב-stages.json
     node .claude/qa/spacesay.js civics     # רק זו

   **למה סטטי, כשיש כבר `say.js`.** `say.js` מריץ דפדפן אמיתי וזו
   הבדיקה החזקה — אבל היא מכוונת לארבע אפליקציות בשם (`english`,
   `ulpan`, `history`, `lomda`), ודפדפן על ארבעים אפליקציות אינו
   ריאלי. הבאג הזה אינו של אפליקציה אחת: הוא נולד מהעתקה. ב-4.10.2026
   הוא נמצא בעשר אפליקציות בבת אחת — `literature`, `hebrew-arab`,
   `tanakh`, `motal`, `geography`, `russian`, `biology`, `islam`,
   `civics` — וכולן ירוקות ב-`say.js`, מפני שאף אחת מהן אינה ברשימה.
   כאן אין הרצה ואין רשימה: נקראים כל קובצי ה-`index.html`.

   **מה נבדק.** המטפל `if(e.key===" ")` במסך התרגול. `P.q.say` נבנה
   כ״השאלה, התשובה הנכונה וההסבר״ ונועד להישמע *אחרי* המענה. אם
   הוא מוקרא בלי לשאול `P.done`, מי שלוחץ רווח כדי לשמוע את השאלה
   שומע את הפתרון — וזה בדיוק הלומד שבשבילו האפליקציה נכתבה.

   הנוסח התקין, מ-`literature`:
       speak(saySpell(P.done?P.q.say:(P.q.lead||"")),state.lang)
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const argv = process.argv.slice(2).filter(a => !a.startsWith('--')).map(a => a.replace(/\/$/, ''));

function appsFromStages() {
  const s = JSON.parse(fs.readFileSync(path.join(__dirname, 'stages.json'), 'utf8'));
  return Object.keys(s.apps || s);
}

/* הבלוק שאחרי `if(e.key===" ")`: ספירת סוגריים מסולסלים מהראשון. */
function blockAt(src, from) {
  const open = src.indexOf('{', from);
  if (open < 0) return src.slice(from, from + 200);
  let d = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') d++;
    else if (src[i] === '}') { d--; if (!d) return src.slice(open, i + 1) }
  }
  return src.slice(open, open + 400);
}

const targets = argv.length ? argv : appsFromStages();
let findings = 0, scanned = 0, withHandler = 0;

for (const app of targets) {
  const f = path.join(ROOT, app, 'index.html');
  if (!fs.existsSync(f)) { console.log(`· ${app.padEnd(15)} אין index.html`); continue }
  const src = fs.readFileSync(f, 'utf8');
  scanned++;
  const hits = [];
  let i = 0;
  while ((i = src.indexOf('e.key===" "', i)) >= 0) {
    const body = blockAt(src, i);
    if (body.indexOf('P.q.say') >= 0) {
      hits.push({ line: src.slice(0, i).split('\n').length, guarded: body.indexOf('P.done') >= 0, body });
    }
    i += 11;
  }
  if (!hits.length) continue;
  withHandler++;
  const bad = hits.filter(h => !h.guarded);
  if (!bad.length) { console.log(`✓ ${app.padEnd(15)} ${hits.length} מטפל/ים, כולם שואלים P.done`); continue }
  findings += bad.length;
  for (const h of bad) {
    console.log(`✗ ${app.padEnd(15)} שורה ${h.line}: הרווח מקריא את P.q.say בלי לשאול P.done`);
    console.log('   ' + h.body.replace(/\s+/g, ' ').slice(0, 150));
  }
}

console.log(`\n${scanned} אפליקציות נסרקו, ${withHandler} עם מטפל רווח שמקריא say, ${findings} ממצאים`);
process.exit(findings ? 1 : 0);
