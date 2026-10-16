/* =====================================================================
   מפתחות localStorage — מפתח אחד לאפליקציה אחת.

     node .claude/qa/storage.js            # כל האפליקציות
     node .claude/qa/storage.js lomda      # רק אלה שנקבו בשמן

   כל האפליקציות יושבות באותו מקור (bekol.co.il), ולכן
   localStorage משותף לכולן: מפתח שמופיע בשתי אפליקציות הוא מגירה
   אחת ששתיהן כותבות אליה. הבאג הזה אינו נכתב — הוא מועתק: אפליקציה
   חדשה נולדת מהעתקה של קובץ קיים, והמפתח בא איתה, לפעמים עם ההערה
   "מפתח לאפליקציה הזאת בלבד" מילה במילה.

   זה קרה פעמיים. ב-31.8 כל האפליקציות חלקו "shlav-exams-v1" ומבחן
   של ניב נפתח באקסיומה; ב-5.9 נמצא ש-lomda, שנולדה מהעתקה של
   history, נשאה את "shlav-exams-history-v1" ואת "mifne-teacher" —
   מבחן שמורה בנה בלומדה הופיע במפנה, וקוד מורה שנקבע באחת נעל את
   השנייה.

   מה נאסף מכל אפליקציה:
     · var/let/const XKEY="..." או '...' — כל משתנה שבשמו KEY (כולל KEY לבדו),
       וכל משתנה שמועבר ישירות ל-getItem/setItem — בכל .html/.js של התיקייה
     · localStorage / sessionStorage .getItem / .setItem / .removeItem
       עם מחרוזת קבועה
   משתנה ששמו מסתיים ב-_OLD הוא מפתח ירושה: נקרא ואינו נכתב, ומותר
   לו להיות משותף — זה בדיוק תפקידו. הוא מדווח בפלט, ואינו ממצא.

   ממצא = מפתח חי שמופיע ביותר מאפליקציה אחת.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const only = process.argv.slice(2).map(a => a.replace(/\/$/, ''));

/* כל תיקייה שיש בה index.html היא אפליקציה; דף הבית הוא '.'.
   legal ו-voice אינן אפליקציות לימוד, אבל גם הן יושבות באותו מקור
   ולכן נבדקות. */
const apps = ['.'].concat(fs.readdirSync(ROOT).filter(d =>
  !d.startsWith('.') && fs.existsSync(path.join(ROOT, d, 'index.html'))));

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
            .replace(/(^|[^:"'])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
}

/* O-194, 16.10.2026 — ארבעה עיוורונות נסגרו כאן:
     1. הרגקס דרש תו ועוד KEY, ולכן משתנה ששמו בדיוק `KEY` — מפתח
        ההתקדמות הראשי של math-app, math-uni, electric, domino ועוד חמש —
        לא נראה לעולם. עכשיו השם יכול להיות KEY לבדו.
     2. רק `var`. עכשיו גם `let` ו-`const`.
     3. רק מרכאות כפולות. עכשיו גם יחידות.
     4. רק index.html/app.js/speech.js בשורש התיקייה — וכל js/*.js של
        שבע הרב־קובציות, ו-lomda/data, היו בחוץ. עכשיו כל .html/.js
        בתיקייה, לעומק. מדלגים על vendor/audio/img/fonts ועל תת־תיקייה
        שיש בה index.html משלה (learning-core/template, tutor-api/local —
        דפי הדגמה שאינם נטענים, והם עותקים של אפליקציה ולכן היו מדווחים
        כהתנגשות שאינה קיימת). לדף הבית ('.') — רק קבצים בשורש.
   ובנוסף: כל מזהה שמועבר ישירות ל-getItem/setItem/removeItem נחפש
   בהצהרה שלו, גם כשאין בשמו KEY (STORE, ACCESS). */
const SKIP_DIR = new Set(['vendor', 'audio', 'img', 'fonts', 'node_modules', 'reports']);
function filesOf(app) {
  const out = [];
  const top = path.join(ROOT, app);
  (function walk(d, depth) {
    let ents;
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (app === '.' || e.name.startsWith('.') || SKIP_DIR.has(e.name)) continue;
        if (fs.existsSync(path.join(p, 'index.html'))) continue;
        walk(p, depth + 1);
      } else if (/\.(html|js)$/.test(e.name)) out.push(p);
    }
  })(top, 0);
  return out;
}

const NAME = String.raw`[\w$]*(?:KEY[\w$]*|_OLD\d*)`;
function keysOf(app) {
  const files = filesOf(app);
  const live = new Map(), legacy = new Map();
  for (const f of files) {
    const src = stripComments(fs.readFileSync(f, 'utf8'));
    const rel = path.relative(ROOT, f);
    let m;
    /* מזהים שמועברים כמו שהם לקריאת אחסון */
    const used = new Set();
    const reUse = /\b(?:localStorage|sessionStorage)\.(?:get|set|remove)Item\(\s*([A-Za-z_$][\w$]*)\s*[,)]/g;
    while ((m = reUse.exec(src))) used.add(m[1]);
    const reDecl = /\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(["'])([^"'\n]+)\2/g;
    while ((m = reDecl.exec(src))) {
      const name = m[1];
      if (!new RegExp('^' + NAME + '$').test(name) && !used.has(name)) continue;
      const line = src.slice(0, m.index).split('\n').length;
      (/_OLD\d*$/.test(name) ? legacy : live).set(m[3], rel + ':' + line + ' (' + name + ')');
    }
    const reCall = /\b(?:localStorage|sessionStorage)\.(?:get|set|remove)Item\(\s*(["'])([^"'\n]+)\1/g;
    while ((m = reCall.exec(src))) {
      const line = src.slice(0, m.index).split('\n').length;
      if (!live.has(m[2]) && !legacy.has(m[2])) live.set(m[2], rel + ':' + line);
    }
  }
  return { live, legacy };
}

const owner = new Map();   // key → [{app, where}]
let checked = 0;
for (const app of apps) {
  if (only.length && !only.includes(app)) continue;
  const { live, legacy } = keysOf(app);
  checked++;
  const l = [...live.keys()], o = [...legacy.keys()];
  console.log(`${app.padEnd(12)} ${l.length} מפתחות` + (o.length ? `, ירושה: ${o.join(', ')}` : '') +
              (l.length ? `\n${''.padEnd(13)}${l.join(', ')}` : ''));
  for (const [k, where] of live) {
    if (!owner.has(k)) owner.set(k, []);
    owner.get(k).push({ app, where });
  }
}

/* מפתח של מודול משותף — שייך למודול, ושאר הנוגעים בו עושים זאת בכוונה.
   כל חריג כאן מודפס, כדי שלא יהיה ירוק שקט. */
const SHARED = {
  'legal-accepted-v': 'שער התנאים — legal/protect.js נטען בכל דף, והמפתח אחד לכל האתר בכוונה. ' +
                      'marketing/media/record.js הוא מקליט Playwright (Node) שמאשר את השער מראש לפני הצילום. נחשף עם O-194',
};
let findings = 0;
for (const [k, list] of owner) {
  if (list.length < 2) continue;
  if (SHARED[k]) {
    console.log(`\n· "${k}" — ב-${list.length} מקומות, משותף בכוונה: ${SHARED[k]}`);
    continue;
  }
  findings++;
  console.log(`\n✗ "${k}" — מפתח חי ב-${list.length} אפליקציות:`);
  for (const { app, where } of list) console.log(`     ${app.padEnd(12)} ${where}`);
}
console.log(`\n${checked} אפליקציות נבדקו, ${findings} ממצאים` +
            (findings ? '' : ' — לכל אפליקציה מפתחות משלה'));
process.exit(findings ? 1 : 0);
