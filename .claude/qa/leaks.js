/* =====================================================================
   leaks.js — התיאור של פריט מתוארך אינו מצטט את הכותרת שלו.

   שאלת ״על איזה אירוע מדובר?״ בלומדה מקריאה את התיאור (w) ומבקשת את
   הכותרת (t). תיאור שמכיל את הכותרת מילה במילה מסגיר את התשובה למי
   שמאזין — בדיוק מה ש-say.js תופס, אבל say.js דוגם 60 שאלות באקראי
   מתוך אלפים ולכן מאדים רק לפעמים (8.9.2026: ירוק מקומית, אדום ב-CI
   על אותו קומיט). הבדיקה הזאת עוברת על כל פריט בכל מאגר, בארבע
   השפות, ואינה תלויה במזל.

   הוכחת נפילה (8.9.2026, לפני התיקון): 7 ממצאים — edu.js ×6, geo.js ×1.
   אחרי הניסוח מחדש: 0.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const DIR = path.join(ROOT, 'lomda', 'data');
const LANGS = ['he', 'ar', 'ru', 'en'];

const ctx = { window: { BANKS: [] }, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(DIR, 'schema.js'), 'utf8'), ctx, { filename: 'schema.js' });

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.js') && f !== 'schema.js').sort();
let items = 0, bad = 0;
for (const f of files) {
  const before = ctx.window.BANKS.length;
  vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), ctx, { filename: f });
  for (const b of ctx.window.BANKS.slice(before))
    for (const tp of (b.topics || []))
      for (const L of (tp.L || []))
        for (const it of (Array.isArray(L) ? L : (L.items || []))) {
          if (!it || it.k !== 'e') continue;
          items++;
          for (const lg of LANGS) {
            const t = (it.t || {})[lg], w = (it.w || {})[lg];
            if (t && w && w.indexOf(t) >= 0) {
              console.log(`✗ ${f} · ${it.y} · ${lg}: התיאור מצטט את הכותרת ״${t}״ — ההקראה מסגירה את התשובה`);
              bad++;
            }
          }
        }
}
console.log(`${bad ? '✗' : '✓'} ${items} פריטי E ב-${files.length} קבצים, ${bad} תיאורים שמצטטים את הכותרת`);
process.exit(bad ? 1 : 0);
