/* =====================================================================
   markers.js — סמני התנגשות מיזוג שנשארו בקובץ

   פעמיים ב-9.9.2026 נדחף קובץ עם <<<<<<< בתוכו: README של ה-QA
   (תוקן ב-edad3a8) ו-FINDINGS.md (2c1efd5 — פותר שנפל על assert ולא
   עצר את שרשרת הפקודות, וה-QA כולו עבר ירוק). שום בדיקה לא קראה
   את הסמן: naming סורק .md אבל מחפש שם, ו-parse פותח רק index.html.

   הבדיקה: כל קובץ טקסט שנעקב ב-git, ושורה שמתחילה ב-"<<<<<<< " או
   ב-">>>>>>> " היא ממצא. "=======" לבדו אינו נבדק — ב-Markdown הוא
   קו תחתי חוקי של כותרת. שתי שניות, בלי דפדפן.

   הוכחת נפילה: על 2c1efd5 — 1 קובץ, 2 שורות. על התיקון (387f3c5) — 0.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '..', '..');
const TEXT = /\.(html|js|json|md|css|svg|txt|webmanifest|yml|yaml|sh)$/i;

/* קובץ באמצע מיזוג מופיע ב-ls-files שלוש פעמים (שלושת השלבים) — נספר פעם אחת */
const files = [...new Set(execFileSync('git', ['ls-files', '-z'], { cwd: ROOT }).toString().split('\0'))].filter(f => f && TEXT.test(f));
let bad = 0, hits = 0;
for (const f of files) {
  const full = path.join(ROOT, f);
  if (!fs.existsSync(full)) continue;
  const lines = fs.readFileSync(full, 'utf8').split('\n');
  let n = 0;
  lines.forEach((ln, i) => {
    if (/^(<<<<<<< |>>>>>>> )/.test(ln)) { n++; hits++; console.log(`✗ ${f}:${i + 1}: ${ln.slice(0, 40)}`); }
  });
  if (n) bad++;
}
console.log(`${bad ? '✗' : '✓'} ${files.length} קבצי טקסט נסרקו, ${bad} עם סמני התנגשות (${hits} שורות)`);
process.exit(bad ? 1 : 0);
