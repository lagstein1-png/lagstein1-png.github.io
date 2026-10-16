/* =====================================================================
   deps.js — אפס תלות בזמן ריצה

     node .claude/qa/deps.js            כל הדפים: דף הבית וכל תיקייה בשורש שיש בה index.html
     node .claude/qa/deps.js kotvim …   דפים נבחרים

   O-166, 16.10.2026: עד היום ברירת המחדל הייתה ['rakia'] — דף אחד מתוך
   46. <script src="https://cdn…"> ב-history לא היה נתפס בשום כלי.
   הרשימה נגזרת מהדיסק (כמו storage.js), ויש לה רצפה: פחות מ-30 דפים
   הוא גזירה שנשברה. ממצא אמיתי שכבר ידוע ושייך לאפליקציה — KNOWN למטה,
   עם הפניה לממצא; הוא מודפס בכל ריצה ואינו ירוק שקט, ורשומה שכבר לא
   נורית נופלת (כדי שהרשימה רק תתקצר).

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
   אין כאן חריג. דף /gemma/ הוסר ב-6.10.2026, והחריג היחיד שנשאר בריפו —
   `tutor/limor-device.js` — נבדק ב-`brain.js` סעיף 5, לא כאן.
   הוכחת נפילה: FINDINGS.md, שלב D של רקיע; סעיף 4 — FINDINGS.md, 5.10.2026.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const ARGS = process.argv.slice(2).map(a => a.replace(/\/$/, ''));
const ALL = ['.'].concat(fs.readdirSync(ROOT).filter(d =>
  !d.startsWith('.') && fs.existsSync(path.join(ROOT, d, 'index.html'))));
const PAGES = ARGS.length ? ARGS : ALL;
if (!ARGS.length && ALL.length < 30) {
  console.log(`✗ נמצאו ${ALL.length} דפים בלבד — הגזירה מהדיסק נשברה`);
  process.exit(1);
}
/* ממצאים אמיתיים וידועים. לא מתקנים כאן אפליקציות — רושמים, מנמקים,
   ומפנים לממצא. כל רשומה היא תבנית על שורת הממצא כפי שהיא מודפסת. */
const KNOWN = [
  { re: /^(biology|civics|hebrew|hebrew-arab|islam|literature|science-mid|tanakh): \/tutor\/[\w.-]+\.js נטען אבל אינו ב-PRE/,
    why: 'O-185 — נכסי /tutor/ אינם ב-PRE בשמונה אפליקציות; לימור לא תעבוד אופליין למי שלא פתח אותה ברשת' },
  { re: /^math-teen: bagrut3\.js נטען אבל אינו ב-PRE/,
    why: 'נחשף עם O-166, 16.10.2026 — math-teen/index.html:522 טוען bagrut3.js ב-document.write תחת ?bagrut3=1, והקובץ אינו ב-PRE; אופליין מסך בגרות 3 יח״ל נשען על מטמון הריצה בלבד. לא תוקן ב-sw.js: תשעת קובצי sw.js זהים (engine.js), ו-bagrut3.js קיים רק ב-math-teen' },
  { re: /^[\w-]+\/index\.html: fetch לכתובת חיצונית — https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-2\.5-flash-preview-tts:generateContent\?key=$/,
    why: 'קול הענן האופציונלי (gSynth, ARCHITECTURE.md §168) — נשלח רק כשהלומד הזין מפתח Gemini משלו (GKEY). תלות שקדמה לכלל; מספר האפליקציות — O-179. נחשף כאן ב-16.10.2026: legal/terms.js אינו מזכיר Gemini (grep -c ⇒ 0)' },
];
const knownHit = new Map();

const ALLOWED = /^(https?:)?\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|gc\.zgo\.at)(\/|$)/;
const EXEMPT = {};
const EXTERNAL = u => /^(https?:)?\/\//.test(u);
/* import סטטי ו-export…from, וגם import "x" בלי from. */
const STATIC_IMPORT = /(?:^|[;\n}])\s*(?:import|export)\s+(?:[^'"`;]*?\sfrom\s*)?["']([^"']+)["']/g;
const WORKER_URL = /new\s+URL\s*\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url/g;
let bad = 0;
function fail(msg) {
  const k = KNOWN.find(x => x.re.test(msg));
  if (k) { knownHit.set(k, (knownHit.get(k) || 0) + 1); return; }
  bad++; console.log('✗ ' + msg);
}
for (const app of PAGES) {
  const file = path.join(ROOT, app, 'index.html');
  if (!fs.existsSync(file)) { fail(`${app}: אין index.html`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  /* src עם < או + הוא טקסט בתוך הערה או מחרוזת (lomda: "data/<שם>.js"), לא תגית */
  const srcs = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]).filter(u => !/[<>+{}]/.test(u));
  /* רק קישורים שטוענים משהו: גיליון סגנון או preload. canonical ו-license הם כתובות, לא טעינה. */
  const hrefs = [...html.matchAll(/<link[^>]*>/g)].map(m => m[0]).filter(t => /rel="(stylesheet|preload|modulepreload|preconnect)"/.test(t)).map(t => (t.match(/\shref="([^"]+)"/) || [])[1]).filter(Boolean);
  const ext = srcs.concat(hrefs).filter(u => /^(https?:)?\/\//.test(u));
  for (const u of ext) if (!ALLOWED.test(u)) fail(`${app}: משאב חיצוני שאינו מותר — ${u}`);
  const sw = fs.existsSync(path.join(ROOT, app, 'sw.js')) ? fs.readFileSync(path.join(ROOT, app, 'sw.js'), 'utf8') : '';
  const pre = (sw.match(/PRE\s*=\s*\[([\s\S]*?)\]/) || [, ''])[1];
  const local = srcs.filter(u => !/^(https?:)?\/\//.test(u));
  const files = [file];
  for (const u of local) {
    const f = u.startsWith('/') ? path.join(ROOT, u) : path.join(ROOT, app, u);
    if (!fs.existsSync(f)) { fail(`${app}: סקריפט מקומי חסר — ${u}`); continue; }
    files.push(f);
    const key = u.startsWith('/') ? u : './' + u.replace(/^\.\//, '');
    if (sw && !pre.includes('"' + key + '"')) fail(`${app}: ${u} נטען אבל אינו ב-PRE של sw.js — לא יעבוד אופליין`);
  }
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of [...src.matchAll(STATIC_IMPORT), ...src.matchAll(WORKER_URL)]) {
      const u = m[1];
      if (EXTERNAL(u)) {
        if (!ALLOWED.test(u) && !(EXEMPT[app] && EXEMPT[app].test(u))) fail(`${path.relative(ROOT, f)}: import סטטי מכתובת חיצונית — ${u}`);
        continue;
      }
      if (!/^\.{0,2}\//.test(u)) continue;
      const dep = u.startsWith('/') ? path.join(ROOT, u) : path.resolve(path.dirname(f), u);
      if (!fs.existsSync(dep)) { fail(`${path.relative(ROOT, f)}: import מקומי חסר — ${u}`); continue; }
      if (!files.includes(dep)) files.push(dep);
    }
    const rel = path.relative(ROOT, f);
    if (/\bimport\s*\(/.test(src)) fail(`${rel}: import(`);
    if (/\brequire\s*\(/.test(src)) fail(`${rel}: require(`);
    for (const m of src.matchAll(/fetch\s*\(\s*["'`]([^"'`]+)/g)) if (/^(https?:)?\/\//.test(m[1]) && !ALLOWED.test(m[1])) fail(`${rel}: fetch לכתובת חיצונית — ${m[1]}`);
  }
  console.log(`· ${app}: ${local.length} סקריפטים מקומיים, ${ext.length} משאבים חיצוניים מותרים`);
}
for (const k of KNOWN) {
  const n = knownHit.get(k) || 0;
  if (n) console.log(`· ידוע (${n}): ${k.why}`);
  else if (!ARGS.length) { bad++; console.log(`✗ רשומת KNOWN שכבר אינה נורית — הסר אותה: ${k.why.slice(0, 60)}…`); }
}
console.log(`${bad ? '✗' : '✓'} ${PAGES.length} דפים, ${bad} ממצאים`);
process.exit(bad ? 1 : 0);
