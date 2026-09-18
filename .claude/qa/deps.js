/* =====================================================================
   deps.js — אפס תלות בזמן ריצה

     node .claude/qa/deps.js            rakia (ברירת המחדל)
     node .claude/qa/deps.js kotvim …   דפים נבחרים

   הכלל ב-CLAUDE.md: Vanilla JS, אין תלות חיצונית חדשה. הבדיקה קוראת
   את index.html של הדף ואת כל הסקריפטים המקומיים שהוא טוען, ושואלת:
   1. כל <script src> ו-<link href> חיצוני הוא מאחד משלושת המארחים
      המותרים — Google Fonts (שני מארחים) ו-GoatCounter — ולא CDN.
   2. כל סקריפט מקומי קיים בדיסק, וכל אחד מהם נמצא גם ב-PRE של sw.js
      (אחרת האפליקציה מבטיחה אופליין ונופלת בלי רשת).
   3. אין import(, require(, או fetch( לכתובת חיצונית באף קובץ.
   הוכחת נפילה: FINDINGS.md, שלב D של רקיע.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ['rakia'];
const ALLOWED = /^(https?:)?\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|gc\.zgo\.at)(\/|$)/;
let bad = 0;
for (const app of PAGES) {
  const file = path.join(ROOT, app, 'index.html');
  if (!fs.existsSync(file)) { bad++; console.log(`✗ ${app}: אין index.html`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const srcs = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]);
  /* רק קישורים שטוענים משהו: גיליון סגנון או preload. canonical ו-license הם כתובות, לא טעינה. */
  const hrefs = [...html.matchAll(/<link[^>]*>/g)].map(m => m[0]).filter(t => /rel="(stylesheet|preload|modulepreload|preconnect)"/.test(t)).map(t => (t.match(/\shref="([^"]+)"/) || [])[1]).filter(Boolean);
  const ext = srcs.concat(hrefs).filter(u => /^(https?:)?\/\//.test(u));
  for (const u of ext) if (!ALLOWED.test(u)) { bad++; console.log(`✗ ${app}: משאב חיצוני שאינו מותר — ${u}`); }
  const sw = fs.existsSync(path.join(ROOT, app, 'sw.js')) ? fs.readFileSync(path.join(ROOT, app, 'sw.js'), 'utf8') : '';
  const pre = (sw.match(/PRE\s*=\s*\[([\s\S]*?)\]/) || [, ''])[1];
  const local = srcs.filter(u => !/^(https?:)?\/\//.test(u));
  const files = [file];
  for (const u of local) {
    const f = u.startsWith('/') ? path.join(ROOT, u) : path.join(ROOT, app, u);
    if (!fs.existsSync(f)) { bad++; console.log(`✗ ${app}: סקריפט מקומי חסר — ${u}`); continue; }
    files.push(f);
    const key = u.startsWith('/') ? u : './' + u.replace(/^\.\//, '');
    if (sw && !pre.includes('"' + key + '"')) { bad++; console.log(`✗ ${app}: ${u} נטען אבל אינו ב-PRE של sw.js — לא יעבוד אופליין`); }
  }
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const rel = path.relative(ROOT, f);
    if (/\bimport\s*\(/.test(src)) { bad++; console.log(`✗ ${rel}: import(`); }
    if (/\brequire\s*\(/.test(src)) { bad++; console.log(`✗ ${rel}: require(`); }
    for (const m of src.matchAll(/fetch\s*\(\s*["'`]([^"'`]+)/g)) if (/^(https?:)?\/\//.test(m[1]) && !ALLOWED.test(m[1])) { bad++; console.log(`✗ ${rel}: fetch לכתובת חיצונית — ${m[1]}`); }
  }
  console.log(`· ${app}: ${local.length} סקריפטים מקומיים, ${ext.length} משאבים חיצוניים מותרים`);
}
console.log(`${bad ? '✗' : '✓'} ${PAGES.length} דפים, ${bad} ממצאים`);
process.exit(bad ? 1 : 0);
