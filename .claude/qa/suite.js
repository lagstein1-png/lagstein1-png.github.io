/* =====================================================================
   suite.js — רשימת הכלים ב-docs/claude/qa-tools.md מול SUITE שב-all.js

     node .claude/qa/suite.js            מה חסר במסמך, ומה במסמך שאין לו קובץ
     node .claude/qa/suite.js --check    אותו דבר, ונופל אם יש פער (רץ ב-all.js)
     node .claude/qa/suite.js --missing  שורות מוצעות לחסרים, מכותרת הקובץ

   **למה זה קיים.** הרשימה ב-`qa-tools.md` נכתבה ביד, ונמדד
   19.9.2026 שחסרים בה 24 מזהי SUITE (ו-20 ב-README). זה בדיוק
   הדפוס ש-CLAUDE.md אוסר: ״מחולל נולד עם --check״ — נכס שנכתב
   ביד נסחף מהמקור שלו בשקט. המקור כאן הוא `SUITE` ב-`all.js`:
   כל מזהה שם חייב שורת `node .claude/qa/<id>.js` במסמך, וכל
   שורה כזאת במסמך חייבת קובץ קיים. התיאור עצמו נשאר כתוב ביד —
   הוא הערך של המסמך; מה שנאכף הוא שהרשימה שלמה ואינה מתה.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const QA = __dirname;
const ROOT = path.resolve(QA, '..', '..');
const DOC = path.join(ROOT, 'docs', 'claude', 'qa-tools.md');
const CHECK = process.argv.includes('--check');
const MISSING = process.argv.includes('--missing');

const all = fs.readFileSync(path.join(QA, 'all.js'), 'utf8');
const suite = [...all.matchAll(/^\s*\{ id: '([^']+)'(?:[^\n]*ext: '([^']+)')?/gm)]
  .map(m => ({ id: m[1], ext: m[2] || '.js' }));

const doc = fs.readFileSync(DOC, 'utf8');
const listed = new Set([...doc.matchAll(/^ {4}node \.claude\/qa\/([A-Za-z0-9_\/-]+)\.(m?js)\b/gm)].map(m => m[1]));

const missing = suite.filter(t => !listed.has(t.id));
const dead = [...listed].filter(id => !fs.existsSync(path.join(QA, id + '.js')) && !fs.existsSync(path.join(QA, id + '.mjs')));

/* שורת התיאור: השורה הראשונה בכותרת הקובץ שאינה קו מפריד. */
function headline(t) {
  try {
    const src = fs.readFileSync(path.join(QA, t.id + t.ext), 'utf8').split('\n').slice(0, 8);
    const l = src.map(s => s.replace(/^\s*(\/\*|#!\/usr\/bin\/env node|\*\/)?\s*/, '').trim())
      .find(s => s && !/^[=\-]+$/.test(s));
    return (l || '').replace(new RegExp('^' + t.id.replace(/[\/-]/g, '.') + '\\.m?js\\s*[—-]\\s*'), '');
  } catch (e) { return '' }
}

if (MISSING) {
  for (const t of missing) console.log(('    node .claude/qa/' + t.id + t.ext).padEnd(41) + '# ' + headline(t));
  process.exit(0);
}
for (const t of missing) console.log('✗ חסר במסמך: ' + t.id);
for (const id of dead) console.log('✗ במסמך ואין קובץ: ' + id);
console.log(`${missing.length || dead.length ? '✗' : '✓'} ${suite.length} מזהים ב-SUITE, ${listed.size} שורות במסמך, ${missing.length} חסרים, ${dead.length} מתים`);
process.exit(CHECK && (missing.length || dead.length) ? 1 : 0);
