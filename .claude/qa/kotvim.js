/* =====================================================================
   kotvim.js — התוכן של ״כותבים ביחד״

   האפליקציה הזאת אינה חידון: אין בה שאלה, אין מסיח ואין תשובה
   נכונה, ולכן `content.js` — שכל תשע המשפחות שלו מודדות שאלה —
   אינו סורק אותה כלל. עד שנכתב הקובץ הזה התוכן שלה היה היחיד
   בפורטפוליו שאיש לא מדד.

   מה שכן אפשר למדוד כאן בלי לדעת את החומר:

     · ארבע שפות מלאות בכל קטע, ובלי עברית שנשארה בשדה זר
     · לכל נושא מספיק קטעים כדי שכל בחירה חוקית תהיה אפשרית
     · קטע אינו חוזר בשני נושאים — זה בדיוק הפיגום הגנרי
       שהאפליקציה נבנתה כדי לא להיות
     · כל קטע נגמר בסימן סוף משפט, אחרת הצירוף נדבק

   הקריאה אינה ב-regex: בלוק התוכן נלקח מהקובץ כמות שהוא ומורץ
   ב-Node עם `F` ו-`TP` אמיתיים. מבנה שהשתנה ייפול כאן, ולא
   יעבור בשקט.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

/* נתיב חלופי בארגומנט — כך אפשר להריץ על עותק פגום ולראות את
   הבדיקה אדומה. בדיקה שלא נראתה אדומה אינה בודקת כלום. */
const FILE = process.argv[2] || path.join(__dirname, '..', '..', 'kotvim', 'index.html');
const LANGS = ['he', 'ar', 'ru', 'en'];
const KINDS = [['op', 'פתיחה', 1], ['cl', 'טענה', 3], ['ex', 'דוגמה', 1], ['cn', 'סיכום', 1]];

/* CL_MAX — כמה טענות הלומד רשאי לבחור. נקרא מהקובץ ולא נכתב כאן
   שוב: מספר שמועתק הוא מספר שיישאר מאחור בשינוי הבא. */
function readClMax(src) {
  const m = src.match(/var\s+CL_MIN\s*=\s*(\d+)\s*,\s*CL_MAX\s*=\s*(\d+)/);
  return m ? Number(m[2]) : 3;
}

function loadContent(src) {
  const a = src.indexOf('function F(he,ar,ru,en)');
  const b = src.indexOf('var BANKS_K=');
  if (a < 0 || b < 0) throw new Error('בלוק התוכן לא נמצא ב-kotvim/index.html');
  const end = src.indexOf('\n];', src.indexOf('{type:"story"', b));
  if (end < 0) throw new Error('סוף BANKS_K לא נמצא');
  const code = src.slice(a, end + 3) + '\n;({TYPES:TYPES, BANKS:BANKS_K})';
  const ctx = vm.createContext({});
  return vm.runInContext(code, ctx);
}

const HEB = /[֐-׿]/;
const ARB = /[؀-ۿ]/;
const CYR = /[Ѐ-ӿ]/;
const LAT = /[A-Za-z]/;
const ENDS = /[.!?…:״"')\]]$/;

function run() {
  const src = fs.readFileSync(FILE, 'utf8');
  const CL_MAX = readClMax(src);
  const { TYPES, BANKS } = loadContent(src);
  const bad = [];
  const seen = new Map();       /* טקסט עברי → הנושא שבו נראה קודם */
  const ids = new Set();
  let topics = 0, frags = 0;

  const check = (f, where) => {
    if (!f || typeof f !== 'object') { bad.push(`${where}: אינו חבילת ארבע שפות`); return; }
    for (const l of LANGS) {
      const v = f[l];
      if (typeof v !== 'string' || !v.trim()) { bad.push(`${where}: ${l} ריק`); continue; }
      if (l !== 'he' && v.trim() === String(f.he || '').trim()) bad.push(`${where}: ${l} זהה לעברית — לא תורגם`);
      if (l !== 'he' && HEB.test(v)) bad.push(`${where}: ${l} מכיל אותיות עבריות`);
      if (l === 'ar' && !ARB.test(v)) bad.push(`${where}: ar בלי אותיות ערביות`);
      if (l === 'ru' && !CYR.test(v)) bad.push(`${where}: ru בלי אותיות קיריליות`);
      if (l === 'en' && !LAT.test(v)) bad.push(`${where}: en בלי אותיות לטיניות`);
    }
  };

  const typeIds = TYPES.map(t => t.id);
  for (const t of TYPES) check(t.n, `סוג ${t.id} · שם`);

  for (const grp of BANKS) {
    if (typeIds.indexOf(grp.type) < 0) bad.push(`קבוצה ${grp.type}: אין סוג כזה ב-TYPES`);
    if (!grp.topics || grp.topics.length < 2)
      bad.push(`סוג ${grp.type}: ${(grp.topics || []).length} נושאים — לומד שבוחר את הסוג הזה אינו בוחר נושא`);
    for (const tp of grp.topics) {
      topics++;
      if (ids.has(tp.id)) bad.push(`נושא ${tp.id}: מזהה חוזר`);
      ids.add(tp.id);
      check(tp.n, `נושא ${tp.id} · שם`);
      for (const [k, name, min] of KINDS) {
        const need = k === 'cl' ? Math.max(min, CL_MAX) : min;
        const arr = tp[k] || [];
        if (arr.length < need)
          bad.push(`נושא ${tp.id}: ${arr.length} ${name} — נדרשות ${need}`);
        arr.forEach((f, i) => {
          frags++;
          const where = `${tp.id}.${k}[${i}]`;
          check(f, where);
          const he = String((f && f.he) || '').trim();
          if (he && !ENDS.test(he)) bad.push(`${where}: הקטע העברי אינו נגמר בסימן סוף משפט`);
          if (he) {
            if (seen.has(he)) bad.push(`${where}: קטע זהה כבר ב-${seen.get(he)} — קטע גנרי`);
            else seen.set(he, where);
          }
        });
      }
    }
  }

  if (bad.length) {
    bad.forEach(b => console.log('✗ ' + b));
    console.log(`\n${bad.length} ממצאים`);
    process.exit(1);
  }
  console.log(`✓ ${TYPES.length} סוגים, ${topics} נושאים, ${frags} קטעים — ארבע שפות מלאות, אין קטע חוזר`);
}

try { run(); }
catch (e) { console.log('✗ ' + e.message); process.exit(1); }
