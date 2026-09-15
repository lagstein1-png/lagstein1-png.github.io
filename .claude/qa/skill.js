/* =====================================================================
   דף ההוראות לאפליקציה הבאה — האם מה שכתוב בו עדיין נכון.

   `.claude/skills/create-learning-app/SKILL.md` הוא מה שסשן קורא
   כשהוא בונה אפליקציה חדשה. הוא **אינו נבדק על ידי שום דבר**, וכל
   טענה עובדתית בו מתיישנת בשקט — ואז האפליקציה הבאה נולדת שגויה.
   זה בדיוק מנגנון ״אפליקציה חדשה נולדת מהעתקה ולכן מעתיקה גם את
   הבאג״ שכתוב ב-`CLAUDE.md`, רק שכאן מועתקת ההוראה ולא הקוד.

   נמדד 15.9.2026 — חמש סחיפות ישבו שם בו־זמנית:
     · ״שורה 13 ושורה 25״ ב-sw.js      — השנייה בשורה 29
     · רשימת אותיות BUILD              — חסרה `k` של kotvim
     · ״lead — אין עליו בדיקה״          — apps.js בדיקה 6 בודקת אותו
     · ״כל העשר עוברות״                 — 41 בדיקות רשומות ב-all.js
     · `stages.json` לא הוזכר כלל       — וזו סתירה לשער הפרסום

   שלוש מהן נספרות מהעץ, ולכן הן נבדקות כאן. השתיים האחרות תוקנו
   ואינן ניתנות לספירה אוטומטית.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REL = path.join('.claude', 'skills', 'create-learning-app', 'SKILL.md');
const full = path.join(ROOT, REL);

if (!fs.existsSync(full)) {
  console.log(`✗ ${REL} אינו קיים`);
  process.exit(1);
}
const doc = fs.readFileSync(full, 'utf8');
let bad = 0;
const fail = m => { console.log('✗ ' + m); bad++; };

/* --- 1. כל אות BUILD שבשימוש מופיעה ברשימה שבדף --- */
/* האות נקראת מהעץ ולא מרשימה קשיחה כאן, אחרת זו אותה מלכודת
   שהבדיקה הזאת נועדה לתפוס, במקום אחד נוסף. */
const used = [];
for (const d of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name.startsWith('.')) continue;
  const dir = path.join(ROOT, d.name);
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(html|js)$/.test(f)) continue;
    const m = fs.readFileSync(path.join(dir, f), 'utf8')
      .match(/var\s+BUILD\s*=\s*"([a-z])/);
    if (m) { used.push({ app: d.name, letter: m[1] }); break; }
  }
}
/* אות אחת לשתי אפליקציות היא התנגשות בעץ עצמו, לא בדף */
const byLetter = {};
for (const u of used) (byLetter[u.letter] = byLetter[u.letter] || []).push(u.app);
for (const [l, apps] of Object.entries(byLetter))
  if (apps.length > 1) fail(`האות \`${l}\` בשימוש בשתי אפליקציות: ${apps.join(', ')}`);

/* **החיפוש מצומצם לפסקה של הרשימה, ולא לכל הדף.** גרסה ראשונה
   חיפשה \`k\` בכל המסמך ועברה ירוק — מפני שטבלת שדות `DATA.APPS`
   מונה `k` כשם שדה מילות המפתח. אות בודדת היא מחרוזת נפוצה מכדי
   לחפש אותה בכל מקום, וזו הייתה בדיקה שנראית עובדת ואינה בודקת
   כלום. הפסקה מתחילה ב״בשימוש כרגע:״ ונגמרת בשורה ריקה. */
const anchor = doc.indexOf('בשימוש כרגע:');
if (anchor < 0) {
  fail('SKILL.md: לא נמצאה הפסקה שמונה את אותיות ה-BUILD ("בשימוש כרגע:")');
} else {
  const rest = doc.slice(anchor);
  const para = rest.slice(0, rest.indexOf('\n\n') >= 0 ? rest.indexOf('\n\n') : rest.length);
  for (const u of used) {
    /* הדף כותב אותן כ-`b` (math-app) — האות, ואחריה שם האפליקציה */
    const re = new RegExp('`' + u.letter + '`[^\\n]{0,4}\\(');
    if (!re.test(para) && para.indexOf('`' + u.letter + '`') < 0)
      fail(`האות \`${u.letter}\` (${u.app}) בשימוש ואינה ברשימה שב-SKILL.md`);
  }
}
if (!bad) console.log(`✓ ${used.length} אותיות BUILD בשימוש, כולן ברשימה`);

/* --- 2. שער השלבים מוזכר --- */
/* ההשמטה הזאת אינה חוסר בתיעוד אלא סתירה: הצ׳ק־ליסט אמר להוסיף
   ל-DATA.APPS, ו-CLAUDE.md אומר שעד `approved` היא אינה שם. */
const before = bad;
for (const must of ['stages.json', 'stage.js', 'internal-gate'])
  if (doc.indexOf(must) < 0)
    fail(`SKILL.md אינו מזכיר \`${must}\` — שער הפרסום חסר בו`);
if (bad === before) console.log('✓ שער השלבים מוזכר — stages.json, stage.js והשער הפנימי');

/* --- 3. אין טענת מספר-שורה על sw.js --- */
/* מספר שורה מתיישן בכל הערה שמישהו מוסיף, ואי אפשר לתחזק אותו.
   ״שורה 13 ושורה 25״ ישבו כאן בזמן שהשנייה הייתה 29. */
const lineClaim = /שורה\s+\d+/g;
const hits = doc.split('\n')
  .map((ln, i) => ({ ln, i: i + 1 }))
  .filter(x => lineClaim.test(x.ln) && !/נמחקו|היו כאן|מתיישן/.test(x.ln));
for (const h of hits)
  fail(`${REL}:${h.i}: טענת מספר־שורה — ${JSON.stringify(h.ln.trim().slice(0, 60))}`);
if (!hits.length) console.log('✓ אין טענת מספר־שורה שתתיישן');

console.log(`\n${bad} ממצאים בדף ההוראות לאפליקציה הבאה`);
process.exit(bad ? 1 : 0);
