/* =====================================================================
   counts.js — מספר תוכן שמצוטט בחומר שיווקי מול המדידה של היום

     node .claude/qa/counts.js

   **למה זה נדרש.** `facts.md` אומר על עצמו ״מספרי הלומדה מתיישנים
   תוך יממה״, ומביא דוגמה: בין 14.9 ל-15.9 נוסף מאגר ושלושת
   המספרים זזו. מה שלא היה קיים הוא מי שיבדוק.

   נמדד 16.9.2026, והתוצאה מראה בדיוק את זה: **שמונה** ציטוטים
   ב-`campaign.md` עדיין אמרו ״20 מאגרים, 48 נושאים, 1021 פריטים״
   בזמן ש-`banks.js` החזיר 23 · 57 · 1219. אחד מהם היה בגוף
   **הודעה לתקשורת**, ואחד היה **נראטיב מדובר** בתסריט וידאו
   (״עשרים מאגרים, ארבעים ושמונה נושאים״) — כלומר המספר המת היה
   עומד להיאמר בקול.

   ובאותה מדידה נמצא שגם הסעיף ב-`facts.md` **שמזהיר** מפני
   המלכודת נשא מספרים מתים משלו. סעיף שמזהיר מפני התיישנות ומתיישן
   הוא הראיה הטובה ביותר שצריך כאן פקודה ולא כלל.

   **מה נבדק:** כל `N מאגר…`, `N נושאים` ו-`N פריטי…` בקובצי
   `marketing/*.md`, מול הפלט של `banks.js` **שרץ עכשיו**.

   **מה אינו נבדק, במתכוון:** מספר שכתוב במילים. ״עשרים ושלושה
   מאגרים״ בתסריט המדובר אינו נתפס כאן — מיפוי מילים־למספר בעברית
   הוא ניחוש, וניחוש בשער גרוע משער שמצהיר על גבולו. השורה הזאת
   מתוחזקת ביד, ליד הספרה שכן נבדקת באותה שורה.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');

/* ---- המדידה, ולא מספר שכתוב איפשהו ---- */
let out = '';
try {
  out = execFileSync(process.execPath, [path.join(__dirname, 'banks.js')],
                     { encoding: 'utf8', cwd: ROOT });
} catch (e) { out = (e.stdout || '') + (e.stderr || '') }
const m = out.match(/(\d+)\s*מאגרים\s*·\s*(\d+)\s*נושאים\s*·\s*(\d+)\s*פריטים/);
if (!m) {
  console.log('✗ banks.js לא החזיר מניין שאפשר להשוות אליו');
  process.exit(1);
}
const TRUE = { מאגר: +m[1], נושא: +m[2], פריט: +m[3] };
console.log(`· banks.js עכשיו: ${TRUE.מאגר} מאגרים · ${TRUE.נושא} נושאים · ${TRUE.פריט} פריטים`);

/* ---- מה מדלגים, ולמה ----------------------------------------------
   סעיף שכל תפקידו לתעד מספר שהתיישן חייב לצטט אותו. בלי הדילוג
   הזה הבדיקה הייתה מפילה את האזהרה מפני המלכודת שהיא עצמה אוכפת
   — וזה בדיוק מה שקרה ל-`claims.js` כשנכתבה. הדילוג הוא לפי
   **כותרת סעיף**, ולא לפי מילה בשורה: כותרת היא הצהרת כוונה של
   מי שכתב, ומילה בשורה היא ניחוש. */
const SKIP_HEAD = /מלכודת|התיישנ|מה שהיה/;
const NUM = /(\d[\d,]*)\s*(מאגר|נושא|פריט)/g;
const WORD = { 'מאגר': 'מאגרים', 'נושא': 'נושאים', 'פריט': 'פריטים' };

/* ---- רק מה שמדבר על הלומדה ------------------------------------
   **הריצה הראשונה לימדה את זה, וזה היה ממצא ולא רעש.** ״18
   נושאים״ הופיע בארבעה קבצים, והוא **נכון** — הוא מתאר את
   ״שלב״, מתמטיקה לתיכון, ואין לו שום קשר ל-`banks.js`. שער
   שמפיל מספר נכון מאמן את מי שקורא אותו להתעלם ממנו.

   ההקשר הוא חלון של שלוש שורות ולא שורה אחת, מפני שהציטוטים
   כאן עוברים שורה: ״ולומדה עם 23 מאגרי / נושאים ו-57 נושאים״
   — המילה ״לומדה״ בשורה אחת, המניין בשורה שאחריה. */
const LOMDA = /לומדה|lomda/i;
const WINDOW = 2;

/* ---- ו״שלב״, מאותה סיבה בדיוק ---------------------------------
   ״18 נושאים״ היה נכון כשנכתב, והוא לא נכון היום: `math-teen`
   נושא **24** נושאים (15 במסלול 3 יחידות, 23 ב-4, 24 ב-5).
   המספר המת ישב בארבעה קבצים — ובהם מכתב הפנייה, המכתב הערבי
   (״18 موضوعًا״) ושורת נראטיב מדובר בתסריט וידאו.

   הוא נגזר מהקובץ ולא נכתב כאן, בדיוק כמו מספרי הלומדה:
   רשימת `TOPICS` ב-`math-teen/index.html`. */
function teenTopics() {
  const src = fs.readFileSync(path.join(ROOT, 'math-teen', 'index.html'), 'utf8');
  const i = src.search(/var TOPICS\s*=\s*\[/);
  if (i < 0) return null;
  let j = src.indexOf('[', i), d = 0, k = j;
  for (; k < src.length; k++) {
    if (src[k] === '[') d++;
    else if (src[k] === ']') { d--; if (!d) break }
  }
  return [...src.slice(j, k + 1).matchAll(/\bid\s*:\s*"[^"]+"/g)].length || null;
}
const TEEN = teenTopics();
const SHLAV = /שלב|math-teen|شلاف|לתיכון|התיכון/;
if (TEEN) console.log(`· math-teen עכשיו: ${TEEN} נושאים`);

let bad = 0, seen = 0;
const dir = path.join(ROOT, 'marketing');
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort()) {
  const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
  let skipping = false;
  lines.forEach((l, i) => {
    if (/^#{1,6}\s/.test(l)) skipping = SKIP_HEAD.test(l);
    if (skipping) return;
    /* ההקשר: השורה עצמה, או אחת משתי השורות שלפניה */
    const ctx = lines.slice(Math.max(0, i - WINDOW), i + 1);
    const isLomda = ctx.some(x => LOMDA.test(x));
    const isTeen = !isLomda && TEEN && ctx.some(x => SHLAV.test(x));
    if (!isLomda && !isTeen) return;
    let g; NUM.lastIndex = 0;
    while ((g = NUM.exec(l))) {
      const n = +g[1].replace(/,/g, ''), kind = g[2];
      /* ״שלב״ נמדד בנושאים בלבד — אין לו מאגרים ואין לו פריטים */
      if (isTeen && kind !== 'נושא') continue;
      /* ״23 מאגרי נושאים״ — ה-״נושאים״ שם הוא תיאור המאגר ולא מניין */
      if (kind === 'נושא' && /מאגרי\s*$/.test(l.slice(0, g.index))) continue;
      /* מספר בתוך ״…״ הוא ציטוט של מה שנכתב, ולא טענה */
      const pre = l.slice(0, g.index), post = l.slice(g.index);
      if (/\u05F4/.test(pre) && /\u05F4/.test(post)) continue;
      seen++;
      const want = isTeen ? TEEN : TRUE[kind];
      if (n !== want) {
        bad++;
        console.log(`✗ marketing/${f}:${i + 1} — ${n} ${WORD[kind]}${isTeen ? ' ב״שלב״' : ''}, והמדידה היום היא ${want}`);
        console.log(`    ${l.trim().slice(0, 88)}`);
      }
    }
  });
}
console.log(`${bad ? '✗' : '✓'} ${seen} מספרי תוכן מצוטטים בחומר השיווקי, ${bad} מתים`);
if (bad) console.log('  המקור הוא node .claude/qa/banks.js — לא הזיכרון ולא הקובץ הקודם');
process.exit(bad ? 1 : 0);
