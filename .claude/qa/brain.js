/* =====================================================================
   brain.js — מוח אחד, ואין שני

   ל״עזרה מהמורה״ יש מוח אחד: `CORE` ו-`ROLE` ב-`tutor-api/worker.js`,
   כלומר **בשרת**. הנימוק כתוב בראש `tutor/tutor.js`: דפדפן אפשר
   לערוך, ולכן אישיות שמוגדרת בדפדפן אינה אישיות אלא הצעה.

   זה כבר נשבר פעמיים, ושתיהן באותה צורה:

   · `lagstein1-png/josh-server` — שרת שני עם אישיות משלו ומזהי
     אפליקציה אחרים. נסגר 10.9.2026 בהחלטת הבעלים.
   · `josh-engine.js` — 1,607 שורות בדפדפן, שדף הבית טען. נמדד
     12.9.2026 בכרום אמיתי על `http://127.0.0.1:8099/index.html`:
     `Josh.opts.name` היה ״ג׳וש הגאון״ ולא ״ג׳וש״; `_responder`
     היה `null`, כלומר **שום AI לא היה מחובר**; ו-`Josh.send()`
     אחד ייצר בקשה יוצאת אחת ויחידה — אל `he.wikipedia.org`.
     עברית בלבד, בלי `CORE`, בלי `ROLE`, ועם מיקרופון שב-`tutor.js`
     נפסל במפורש. הבעלים פסל את החיפוש החיצוני באותו יום (`O-48`).

   בשני המקרים איש לא בנה מוח שני בכוונה — הוא נבנה מפני שהקובץ
   היה שם ואפשר היה לחווט אותו. **הבדיקה הזאת אוכפת חיווט, לא
   קיום.** `josh-engine.js` נשאר על הדיסק; מה שאסור הוא שדף יטען
   אותו. זו ההבחנה שמאפשרת לשער לחיות בלי רשימת פטורים.

   ── שלוש בדיקות ──

   1. **מה שדף טוען.** נבנית קבוצת ההגיעוּת: כל `<script src>` וכל
      `<link href>` מקומי בכל `*.html` שנעקב, ועוד כל נתיב ב-`PRE`
      של כל `sw.js`. אף אחד מהם אינו רשאי להיות `josh-engine.js`
      או `josh-avatar.css`.

   2. **ספק חיפוש חיצוני בקוד שנטען.** אף קובץ בקבוצת ההגיעוּת אינו
      נושא `wikipedia.org` או `_searchProvider`. **הכתובת שם נבנית
      בשרשור** — `"https://" + searchLang + ".wikipedia.org"` — ולכן
      חיפוש אחרי כתובת מלאה בתוך `fetch(` לא היה תופס אותה; נמדד,
      חמישה קבצים בלבד במאגר נושאים כתובת חיצונית מילולית ב-`fetch(`,
      וכולם Gemini TTS שהמפתח שלו מגיע מהמשתמש.

      **והמילה ״ויקיפדיה״ לבדה אינה ממצא, במתכוון.** הניסוח הראשון
      חיפש `wikipedia` וחסר־רישיות, ונפל מיד על
      `lomda/data/digital.js:118` — ״ויקיפדיה נפתחה״, פריט תוכן
      מתוארך בארבע שפות בנושא אוריינות דיגיטלית. זו אותה מלכודת
      ש-`josh.js` מתעד ב״מה הבדיקה אינה עושה״: תבנית שמפילה תוכן
      תקין מאמנת את העין להתעלם. שני הסימנים שנבחרו במקומה נמדדו
      על כל המאגר ויושבים בשני עותקי `josh-engine.js` בלבד.

   3. **מי מגדיר את ג׳וש הגלובלי.** אף קובץ בקבוצת ההגיעוּת אינו
      מציב `window.Josh` / `global.Josh` / `JoshEngine`. הממשק
      המותר הוא `tutor/tutor.js`, ו-`.claude/qa/tutor.js` הוא
      שבודק שהוא אכן מחווט בשתים־עשרה האפליקציות.

   הוכחת נפילה, 12.9.2026: החזרת שתי התגיות לדף הבית בלבד הפילה את
   שלוש הבדיקות יחד — `index.html` נכנס לקבוצת ההגיעוּת ואיתו
   `josh-engine.js`, שנושא גם את ויקיפדיה וגם את `global.Josh`.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '..', '..');

const tracked = [...new Set(execFileSync('git', ['ls-files', '-z'], { cwd: ROOT }).toString().split('\0'))]
  .filter(Boolean);

const read = f => {
  const full = path.join(ROOT, f);
  try { return fs.readFileSync(full, 'utf8'); } catch (e) { return null; }
};

/* ------------------------------------------------------------------
   קבוצת ההגיעוּת: כל קובץ שדף טוען, או ש-worker מצרף מראש.
   נתיב מנורמל יחסית לשורש המאגר; כתובת חיצונית (http) אינה נכנסת —
   היא אינה קובץ שלנו, וכלל 3 ב-CLAUDE.md כבר אוסר אותה.
   ------------------------------------------------------------------ */
const TAG = /<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*(["'])([^"']+)\1/gi;
const PRE = /const\s+PRE\s*=\s*\[([\s\S]*?)\]/;

const reach = new Map();          // נתיב → מי טוען אותו
const note = (from, raw) => {
  let u = String(raw).trim().replace(/[?#].*$/, '');
  if (!u || /^(https?:)?\/\//i.test(u) || /^(data|blob|mailto):/i.test(u)) return;
  const base = u.startsWith('/') ? u.slice(1) : path.posix.join(path.posix.dirname(from), u);
  const norm = path.posix.normalize(base).replace(/^\.\//, '');
  if (!norm || norm.startsWith('..')) return;
  if (!reach.has(norm)) reach.set(norm, from);
};

for (const f of tracked) {
  if (f.endsWith('.html')) {
    const s = read(f); if (s == null) continue;
    let m; TAG.lastIndex = 0;
    while ((m = TAG.exec(s))) note(f, m[2]);
  }
  if (path.basename(f) === 'sw.js') {
    const s = read(f); if (s == null) continue;
    const blk = s.match(PRE);
    if (blk) for (const m of blk[1].matchAll(/["']([^"']+)["']/g)) note(f, m[1]);
  }
}

/* ------------------------------------------------------------------ */
const hits = [];
const hit = (what, where, why) => hits.push(`✗ ${what}  ← ${where}\n  ${why}`);

/* 1 — מוח שני שנטען */
const BRAIN = /(^|\/)(josh-engine\.js|josh-avatar\.css)$/;
for (const [p, from] of reach)
  if (BRAIN.test(p))
    hit(p, from, 'מוח שני בדפדפן. המוח היחיד הוא tutor-api/worker.js — ראו JOSH.md');

/* 2 + 3 — מה שיושב בתוך מה שנטען */
const SEARCH = /wikipedia\.org|_searchProvider/;
const GLOBAL = /\b(?:global|window|self)\s*\.\s*(?:Josh|JoshEngine)\s*=/;
for (const [p, from] of [...reach].sort()) {
  if (!/\.(js|html)$/i.test(p)) continue;
  const s = read(p); if (s == null) continue;
  if (SEARCH.test(s))
    hit(p, from, 'ספק חיפוש חיצוני בקוד שנטען. אין חיפוש מהדפדפן — ראו O-48');
  if (GLOBAL.test(s))
    hit(p, from, 'מגדיר ג׳וש גלובלי. הממשק היחיד הוא tutor/tutor.js');
}

for (const h of hits) console.log(h);
const files = [...reach.keys()].filter(p => /\.(js|html)$/i.test(p)).length;
console.log(`${hits.length ? '✗' : '✓'} ${reach.size} קבצים בקבוצת ההגיעוּת (${files} קוד), ${hits.length} ממצאים`);
process.exit(hits.length ? 1 : 0);
