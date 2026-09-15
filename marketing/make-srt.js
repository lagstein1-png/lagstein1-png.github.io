/* =====================================================================
   כתוביות מארבעת התסריטים — .srt, ישר מהטבלאות.

   **למה זה קיים.** `video-scripts.md` אומר ״הכתוביות נכתבות בעורך
   החינמי של פייסבוק או של יוטיוב, **ידנית**, לפי הטבלאות כאן״. אבל
   הטבלאות כבר נושאות את שתי העמודות שקובץ .srt צריך — טווח זמן
   ונוסח — ולכן ההקלדה הידנית היא העתקה של מה שכבר כתוב, וכל
   הקלדה כזאת היא הזדמנות לשגיאת תזמון.

   הכלל הראשון של המסמך הוא ״כתוביות בעברית תמיד — רוב הצפיות הן
   בלי קול, וסרטון על הקראה שנצפה בלי קול הוא ריק״. לכן הכתובית
   אינה קישוט, והיא לא צריכה להיות תלויה בדיוק של הקלדה בשעת לילה.

   שימוש:
     node marketing/make-srt.js            כותב אל marketing/srt/
     node marketing/make-srt.js --check    נופל אם הקבצים אינם תואמים

   הקובץ מיובא ל-.srt ולא ל-.vtt מפני ש-.srt הוא מה ששני העורכים
   החינמיים שהמסמך נוקב בהם מקבלים בהעלאה.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'marketing', 'video-scripts.md');
const OUT = path.join(ROOT, 'marketing', 'srt');

function stamp(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor(sec % 3600 / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s},000`;
}

function parse(doc) {
  const out = [];
  const heads = [...doc.matchAll(/^## (תסריט (\d+)[^\n]*)$/gm)];
  heads.forEach((h, i) => {
    const end = i + 1 < heads.length ? heads[i + 1].index : doc.length;
    const blk = doc.slice(h.index, end);
    /* טווח הזמן הוא מקף רגיל או מקף עברי — שניהם מופיעים במסמך */
    const rows = [...blk.matchAll(/^\| *(\d+)[–-](\d+) *\|([^|]*)\|([^|]*)\|/gm)]
      .map(m => ({ a: +m[1], b: +m[2], seen: m[3].trim(), text: m[4].trim() }));
    if (rows.length) out.push({ n: h[2], title: h[1].trim(), rows });
  });
  return out;
}

function srt(scr) {
  return scr.rows.map((r, i) =>
    `${i + 1}\n${stamp(r.a)} --> ${stamp(r.b)}\n${r.text}\n`).join('\n');
}

const doc = fs.readFileSync(SRC, 'utf8');
const scripts = parse(doc);
if (!scripts.length) { console.log('✗ לא נמצאה אף טבלת תסריט ב-video-scripts.md'); process.exit(1); }

const check = process.argv.includes('--check');
let bad = 0;

for (const s of scripts) {
  const file = path.join(OUT, `script-${s.n}.srt`);
  const body = srt(s);

  /* התזמון חייב להיות רציף ועולה: חפיפה או קפיצה אחורה מייצרות
     כתובית שמופיעה לפני שהקודמת נעלמה, ועורכי הרשת מקבלים אותה
     בשקט. נבדק כאן ולא בעין. */
  for (let i = 0; i < s.rows.length; i++) {
    const r = s.rows[i];
    if (r.b <= r.a) { console.log(`✗ ${s.title}: שורה ${i + 1} — ${r.a}–${r.b} אינו טווח`); bad++; }
    if (i && r.a < s.rows[i - 1].b) {
      console.log(`✗ ${s.title}: שורה ${i + 1} מתחילה ב-${r.a}, והקודמת נגמרת ב-${s.rows[i - 1].b}`);
      bad++;
    }
    if (!r.text) { console.log(`✗ ${s.title}: שורה ${i + 1} — אין נוסח כתובית`); bad++; }
  }

  if (check) {
    const have = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (have === null) { console.log(`✗ חסר ${path.relative(ROOT, file)} — הרץ node marketing/make-srt.js`); bad++; }
    else if (have !== body) { console.log(`✗ ${path.relative(ROOT, file)} אינו תואם לטבלה שב-video-scripts.md`); bad++; }
    else console.log(`✓ ${s.title} — ${s.rows.length} כתוביות, ${s.rows[s.rows.length - 1].b} שניות`);
  } else {
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(file, body);
    console.log(`✓ ${path.relative(ROOT, file)} — ${s.rows.length} כתוביות, ${s.rows[s.rows.length - 1].b} שניות`);
  }
}

console.log(`\n${scripts.length} תסריטים, ${bad} ממצאים`);
process.exit(bad ? 1 : 0);
