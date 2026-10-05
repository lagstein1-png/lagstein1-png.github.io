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
   4. אין import סטטי מכתובת חיצונית (`import … from "https://…"`).
      עד 5.10.2026 הבדיקה לא ראתה אותו בכלל — רק את import( — ולא
      הלכה אחרי import מקומי לקובץ הבא. עכשיו היא הולכת אחרי
      `from "./x.js"` ואחרי `new URL("./x.js", import.meta.url)`.
   החריג היחיד: `gemma/` — מודל שפה במכשיר, בהכרעת הבעלים 5.10.2026.
   הוא רשאי לייבא את שתי הספריות של המודל מ-jsdelivr, ורק אותן (EXEMPT).
   הוכחת נפילה: FINDINGS.md, שלב D של רקיע; סעיף 4 — FINDINGS.md, 5.10.2026.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ['rakia'];
const ALLOWED = /^(https?:)?\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|gc\.zgo\.at)(\/|$)/;
const EXEMPT = { gemma: /^https:\/\/cdn\.jsdelivr\.net\/npm\/(@mlc-ai\/web-llm|@mediapipe\/tasks-genai)(\/|$)/ };
const EXTERNAL = u => /^(https?:)?\/\//.test(u);
/* import סטטי ו-export…from, וגם import "x" בלי from. */
const STATIC_IMPORT = /(?:^|[;\n}])\s*(?:import|export)\s+(?:[^'"`;]*?\sfrom\s*)?["']([^"']+)["']/g;
const WORKER_URL = /new\s+URL\s*\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url/g;
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
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of [...src.matchAll(STATIC_IMPORT), ...src.matchAll(WORKER_URL)]) {
      const u = m[1];
      if (EXTERNAL(u)) {
        if (!ALLOWED.test(u) && !(EXEMPT[app] && EXEMPT[app].test(u))) { bad++; console.log(`✗ ${path.relative(ROOT, f)}: import סטטי מכתובת חיצונית — ${u}`); }
        continue;
      }
      if (!/^\.{0,2}\//.test(u)) continue;
      const dep = u.startsWith('/') ? path.join(ROOT, u) : path.resolve(path.dirname(f), u);
      if (!fs.existsSync(dep)) { bad++; console.log(`✗ ${path.relative(ROOT, f)}: import מקומי חסר — ${u}`); continue; }
      if (!files.includes(dep)) files.push(dep);
    }
    const rel = path.relative(ROOT, f);
    if (/\bimport\s*\(/.test(src)) { bad++; console.log(`✗ ${rel}: import(`); }
    if (/\brequire\s*\(/.test(src)) { bad++; console.log(`✗ ${rel}: require(`); }
    for (const m of src.matchAll(/fetch\s*\(\s*["'`]([^"'`]+)/g)) if (/^(https?:)?\/\//.test(m[1]) && !ALLOWED.test(m[1])) { bad++; console.log(`✗ ${rel}: fetch לכתובת חיצונית — ${m[1]}`); }
  }
  console.log(`· ${app}: ${local.length} סקריפטים מקומיים, ${ext.length} משאבים חיצוניים מותרים`);
}
console.log(`${bad ? '✗' : '✓'} ${PAGES.length} דפים, ${bad} ממצאים`);
process.exit(bad ? 1 : 0);
