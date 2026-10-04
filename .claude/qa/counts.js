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
   **חריג אחד, 4.10.2026:** בצירוף ״X מתוך Y״ על מצב מורה ושפות
   מילים כן מתפרשות — ראו בסוף הקובץ.
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

/* =====================================================================
   ״X מתוך Y״ — מצב מורה ושפות, גם כשהמספר כתוב במילים (4.10.2026)

   **למה.** `facts.md` עבר ל-23 אפליקציות, 17 עם מצב מורה ו-19 בארבע
   שפות — והטקסטים המשיכו לומר ״בתשע מתוך שלוש־עשרה״ ו״בשתים־עשרה
   מתוך שלוש־עשרה״ בעשרות שורות. הבדיקה למעלה ראתה ספרות בלבד, והחומר
   השיווקי כותב מספרים במילים — כלומר המספר המת עבר ירוק.

   **הגבול שהכותרת למעלה מצהירה עליו נשאר, ונסגר רק כאן:** מילים
   מתפרשות רק בצירוף ״X מתוך Y״, שבו שני הצדדים חייבים להיות מספר
   — אין כאן ניחוש מתוך משפט חופשי.

   **מה נבדק:** המשפט שסביב ״מתוך״. מדבר על מצב מורה / בונה מבחן /
   מסך ציונים — Y הוא המספר החיצוני, ו-X הוא 17 (מצב מורה), ואם
   המשפט מזכיר בונה מבחן או מסך ציונים — 15 או 16 בלבד (`facts.md`,
   ״כללי הניסוח״). מדבר על שפות / ממשק — X הוא 19. שלושת המספרים
   נקראים מטבלת `facts.md`, לא נכתבים כאן. `facts.md` עצמו אינו
   נסרק: הוא המקור, והוא מצטט את ההיסטוריה.
   ===================================================================== */
const UNIT = { אפס: 0, אחת: 1, אחד: 1, שתיים: 2, שתים: 2, שניים: 2, שנים: 2, שני: 2, שתי: 2,
  שלוש: 3, שלושה: 3, ארבע: 4, ארבעה: 4, חמש: 5, חמישה: 5, חמשה: 5, שש: 6, שישה: 6, ששה: 6,
  שבע: 7, שבעה: 7, שמונה: 8, תשע: 9, תשעה: 9, עשר: 10, עשרה: 10 };
const TENS = { עשרים: 20, שלושים: 30, ארבעים: 40, חמישים: 50 };
/* אות שימוש אחת או שתיים בראש המילה: ״בתשע״, ״ובשתים־עשרה״ */
function bare(w, table) {
  if (w in table) return table[w];
  for (let k = 1; k <= 2; k++) {
    if (!/^[ובהלמשכ]+$/.test(w.slice(0, k))) break;
    if (w.slice(k) in table) return table[w.slice(k)];
  }
  return null;
}
function hebNum(phrase) {
  const p = phrase.replace(/^[(\[>•*\-\s]+|[\s:;,.)\]״"!?]+$/g, '');
  const d = p.match(/^[א-ת]{0,3}-?(\d+)$/);
  if (d) return +d[1];
  const w = p.split(/[\s\u05BE]+/).filter(Boolean);
  if (w.length === 1) return bare(w[0], UNIT) ?? bare(w[0], TENS);
  if (w.length === 2) {
    if (/^עשרה?$/.test(w[1])) { const u = bare(w[0], UNIT); return u != null && u < 10 ? u + 10 : null }
    const t = bare(w[0], TENS);
    if (t != null && /^ו/.test(w[1]) && w[1].slice(1) in UNIT && UNIT[w[1].slice(1)] < 10) return t + UNIT[w[1].slice(1)];
  }
  return null;
}
/* שני צירופים לכל צד: הארוך קודם (״עשרים ושלוש״), ואז מילה אחת */
function side(tokens) {
  for (const n of [2, 1]) {
    if (tokens.length < n) continue;
    const v = hebNum(tokens.slice(0, n).join(' '));
    if (v != null) return v;
  }
  return null;
}

const FACTS = fs.readFileSync(path.join(dir, 'facts.md'), 'utf8').split('\n');
const row = re => { const l = FACTS.find(x => re.test(x)); const m = l && l.match(/\*\*(\d+)\*\*/); return m ? +m[1] : null };
const OUT = row(/^\|\s*אפליקציות — \*\*המספר שנאמר כלפי חוץ/);
const LANGS = row(/^\|\s*מהן בארבע שפות/);
const TEACH = row(/^\|\s*מהן עם מצב מורה/);
const bl = FACTS.find(x => /^\|\s*מהן עם מצב מורה/.test(x)) || '';
const BUILDER = (bl.match(/בונה מבחן ומסך ציונים ב-(\d+)/) || [])[1];
let bad2 = 0, seen2 = 0;
if (!OUT || !LANGS || !TEACH || !BUILDER) {
  bad2++;
  console.log(`✗ facts.md — לא נמצאו בטבלה המספר החיצוני / שפות / מצב מורה / בונה מבחן (${OUT}/${LANGS}/${TEACH}/${BUILDER})`);
} else {
  const B = +BUILDER;
  console.log(`· facts.md עכשיו: ${OUT} כלפי חוץ · ${TEACH} עם מצב מורה (בונה מבחן ומסך ציונים: ${B} או ${B + 1}) · ${LANGS} בארבע שפות`);
  const TEACH_RE = /מצב מורה|בונה מבחן|בונים מבחן|מסך ציונים/;
  const BUILD_RE = /בונה מבחן|בונים מבחן|מסך ציונים/;
  const LANG_RE = /שפות|ממשק|בערבית|ברוסית/;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'facts.md').sort()) {
    const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
    let skipping = false;
    lines.forEach((l, i) => {
      if (/^#{1,6}\s/.test(l)) skipping = SKIP_HEAD.test(l);
      if (skipping || l.indexOf('מתוך') < 0) return;
      const prev = i ? lines[i - 1] : '', next = lines[i + 1] || '';
      const text = prev + '\n' + l + '\n' + next, off = prev.length + 1;
      let k = -1;
      while ((k = l.indexOf('מתוך', k + 1)) >= 0) {
        /* מספר בתוך ״…״ הוא ציטוט של מה שנכתב, ולא טענה */
        if (/\u05F4/.test(l.slice(0, k)) && /\u05F4/.test(l.slice(k)) &&
            (l.slice(0, k).match(/\u05F4/g) || []).length % 2 === 1) continue;
        const at = off + k;
        const left = text.slice(0, at).trim().split(/\s+/).slice(-2);
        const right = text.slice(at + 4).trim().split(/\s+/);
        let x = side(left.slice(-1).concat([]));
        const x2 = left.length === 2 ? hebNum(left.join(' ')) : null;
        if (x2 != null) x = x2;
        const y = side(right);
        if (x == null || y == null) continue;
        /* המשפט: מהנקודה שלפני עד הנקודה שאחרי (נקודה שאחריה רווח —
           ״teacher-math-teen.mp4״ אינו סוף משפט), או שורת רשימה / שורה ריקה */
        const before = text.slice(0, at), after = text.slice(at);
        const s0 = Math.max(before.search(/[.!?](?=\s)[^.!?]*$/) + 1, before.lastIndexOf('\n\n') + 1, before.search(/\n\s*[-•][^\n]*$/) + 1, 0);
        let e = after.search(/[.!?](?=\s|$)|\n\s*\n|\n\s*[-•]/);
        const sent = text.slice(s0, e < 0 ? text.length : at + e);
        const teach = TEACH_RE.test(sent), lang = !teach && LANG_RE.test(sent);
        if (!teach && !lang) continue;
        seen2++;
        const strict = teach && BUILD_RE.test(sent);
        const okX = teach ? (strict ? [B, B + 1] : [TEACH, B, B + 1]) : [LANGS];
        if (y !== OUT || !okX.includes(x)) {
          bad2++;
          const want = (strict ? `${B} (או ${B + 1})` : teach ? TEACH : LANGS) + ` מתוך ${OUT}`;
          console.log(`✗ marketing/${f}:${i + 1} — ${x} מתוך ${y} ${teach ? (strict ? 'עם בונה מבחן / מסך ציונים' : 'עם מצב מורה') : 'בארבע שפות'}, ולפי facts.md: ${want}`);
          console.log(`    ${l.trim().slice(0, 88)}`);
        }
      }
    });
  }
}
console.log(`${bad2 ? '✗' : '✓'} ${seen2} צירופי ״X מתוך Y״ על מצב מורה ושפות (גם במילים), ${bad2} מתים`);
process.exit(bad || bad2 ? 1 : 0);
