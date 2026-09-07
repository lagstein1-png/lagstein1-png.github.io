/* =====================================================================
   מפתחות localStorage — מפתח אחד לאפליקציה אחת.

     node .claude/qa/storage.js            # כל האפליקציות
     node .claude/qa/storage.js lomda      # רק אלה שנקבו בשמן

   כל האפליקציות יושבות באותו מקור (lagstein1-png.github.io), ולכן
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
     · var XKEY="..."  — כל משתנה ששמו מסתיים ב-KEY או ב-KEY_STORE
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

function keysOf(app) {
  const files = ['index.html', 'app.js', 'speech.js']
    .map(f => path.join(ROOT, app, f)).filter(f => fs.existsSync(f));
  const live = new Map(), legacy = new Map();
  for (const f of files) {
    const src = stripComments(fs.readFileSync(f, 'utf8'));
    const rel = path.relative(ROOT, f);
    let m;
    const reVar = /\bvar\s+([A-Za-z_$][\w$]*(?:KEY|KEY_STORE|KEY_OLD|_OLD))\s*=\s*"([^"]+)"/g;
    while ((m = reVar.exec(src))) {
      const line = src.slice(0, m.index).split('\n').length;
      (/_OLD$/.test(m[1]) ? legacy : live).set(m[2], rel + ':' + line + ' (' + m[1] + ')');
    }
    const reCall = /\b(?:localStorage|sessionStorage)\.(?:get|set|remove)Item\(\s*"([^"]+)"/g;
    while ((m = reCall.exec(src))) {
      const line = src.slice(0, m.index).split('\n').length;
      if (!live.has(m[1])) live.set(m[1], rel + ':' + line);
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

let findings = 0;
for (const [k, list] of owner) {
  if (list.length < 2) continue;
  findings++;
  console.log(`\n✗ "${k}" — מפתח חי ב-${list.length} אפליקציות:`);
  for (const { app, where } of list) console.log(`     ${app.padEnd(12)} ${where}`);
}
console.log(`\n${checked} אפליקציות נבדקו, ${findings} ממצאים` +
            (findings ? '' : ' — לכל אפליקציה מפתחות משלה'));
process.exit(findings ? 1 : 0);
