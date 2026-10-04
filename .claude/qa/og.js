/* =====================================================================
   מחולל תמונת שיתוף. אותו דגם של `icon.js`: מריצים ביד, הצייר הוא
   הכרומיום שכבר מותקן לבדיקות, ואין npm ואין שלב בנייה.

     node .claude/qa/og.js <תיקייה> <רקע> '<כותרת>' '<path d=…>' ['<כותרת משנה>']
     node .claude/qa/og.js --check    תמונות השיתוף שבדיסק מול הפלטה (רץ ב-all.js)

   הפריסה נמדדה מ-`english/img/og.png` הקיימת: 1200×630, רקע בצבע
   המותג, כותרת RTL, שורת ״למידה שנשמעת״ מתחתיה, ואריח מעוגל עם
   הסמל מהצד.

   **הסמל הוא אותו `path` שבדף הבית** — כך תמונת השיתוף, האייקון
   והכרטיס הם ציור אחד. זה בדיוק מה ש-`O-44` תיאר כשהם נפרדים.

   **והרקע שטוח בכוונה.** PNG אינו דוחס מעברים חלקים: גרדיאנט
   רדיאלי נתן 215KB ולינארי 158KB, מול **25KB** לרקע שטוח — נמדד
   על אותה תמונה בדיוק. שאר התיקים יושבים על 35–46KB.

   **--check (O-77).** הצילום אינו דטרמיניסטי — הגופן נמשך מגוגל, והרשת
   חסומה בסביבת הפיתוח — ולכן אין ״לייצר מחדש ולהשוות בתים״. נבדק מה
   שאפשר לקרוא מה-PNG עצמו (המפענח יושב ב-`icon.js`):
     1. הגודל 1200×630.
     2. הרקע — ארבע הפינות — הוא `theme_color` שבמניפסט של אותה
        אפליקציה. זה בדיוק מה שנסחף ב-18.9: חמש תמונות בצבע זר.
     3. אין שתי אפליקציות עם **אותו קובץ בדיוק**. הכותרת צרובה בתמונה,
        ולכן עותק פירושו שאפליקציה אחת משותפת בשם של אחרת — נמדד
        4.10.2026: science משותפת כ״חשבון ליסודי״.
   מה שלא נבדק: נוסח הכותרת והסמל. אין להם מקור בדיסק שאפשר להשוות
   אליו בלי OCR.
   ===================================================================== */
const fs = require('fs'), path = require('path'), crypto = require('crypto');

/* תמונה שלא יצאה מהמחולל הזה, בכוונה — עיצוב אחר, לא סחיפה. שורה
   שהתמונה שלה כבר תואמת לפלטה נופלת: חריג שאינו נחוץ הוא חור. */
const FOREIGN = {
  'hebrew-lit':  'רקע מדורג וציור ספרים — עיצוב נפרד של היסודי',
  'tanakh-elem': 'רקע מדורג — אותו עיצוב של hebrew-lit',
  'rakia':       'צילום מסך של מפת הלידה, לא כרטיס של og.js',
  'civics':      'רקע בהיר מדורג עם תגיות נושא — עיצוב נפרד',
};
/* עותקים ידועים: תיקייה → התיקייה שהתמונה שלה הועתקה. **זה באג פתוח,
   לא היתר** (נמדד 4.10.2026, דווח לבצלאל): הכותרת שבתמונה היא של
   המקור. כל שורה נמחקת כשהתמונה מחודשת, ושורה שכבר אינה עותק נופלת.
   עותק חדש שאינו כאן — נופל. */
const COPIED = {
  'bagrut-history': 'bagrut-806',
  'geography':      'civics',
  'hebrew-arab':    'civics',
  'literature':     'civics',
  'motal':          'civics',
  'tanakh':         'civics',
  'geography-elem': 'math-app',
  'science':        'math-app',
};

if (process.argv.includes('--check')) {
  const { decodePNG, near, appDirs, theme, TOL, ROOT } = require('./icon.js');
  const bad = [], byHash = new Map(); let n = 0;
  for (const dir of appDirs()) {
    const f = path.join(ROOT, dir, 'img', 'og.png');
    if (!fs.existsSync(f)) continue;
    n++;
    const rel = path.join(dir, 'img', 'og.png');
    const h = crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex');
    byHash.set(h, (byHash.get(h) || []).concat(dir));
    const img = decodePNG(f), bg = theme(dir);
    if (img.w !== 1200 || img.h !== 630) bad.push(`${rel}: ${img.w}×${img.h}, צריך 1200×630`);
    const off = [[3, 3], [1196, 3], [3, 626], [1196, 626]]
      .map(([x, y]) => [x, y, img.at(x, y)]).filter(([, , c]) => !near(c, bg));
    if (FOREIGN[dir]) {
      if (!off.length) bad.push(`${dir}: רשום כחריג ב-FOREIGN, אבל הרקע כבר ${bg} — מחק את השורה`);
      else console.log(`  · ${dir} — חריג מתועד: ${FOREIGN[dir]}`);
    } else if (COPIED[dir] && FOREIGN[COPIED[dir]]) {
      /* עותק של תמונה חריגה יורש את החריגה — הבאג שלו נספר למטה. */
    } else for (const [x, y, c] of off) bad.push(`${rel} (${x},${y}) ${c} — הרקע אינו theme_color ${bg} (סטייה מעל ${TOL})`);
  }
  const copied = new Set();
  for (const dirs of byHash.values()) {
    if (dirs.length < 2) continue;
    /* המקור הוא מי שאינו רשום כעותק; אם כולם רשומים — הראשון. */
    const src = dirs.find(d => !COPIED[d]) || dirs[0];
    for (const d of dirs) {
      if (d === src) continue;
      copied.add(d);
      if (COPIED[d] === src) console.log(`  · ${d} — עותק ידוע של ${src} (באג פתוח: הכותרת של ${src})`);
      else bad.push(`${d}/img/og.png: זהה בבית לבית ל-${src}/img/og.png — הכותרת שבתמונה היא של אפליקציה אחרת`);
    }
  }
  for (const d of Object.keys(COPIED)) if (!copied.has(d)) bad.push(`COPIED: ${d} כבר אינו עותק של ${COPIED[d]} — מחק את השורה`);
  for (const d of Object.keys(FOREIGN)) if (!fs.existsSync(path.join(ROOT, d, 'img', 'og.png'))) bad.push(`FOREIGN: ${d} — אין ${d}/img/og.png`);
  for (const b of bad) console.log('✗ ' + b);
  console.log(`${bad.length ? '✗' : '✓'} ${n} תמונות שיתוף מול theme_color, ${Object.keys(FOREIGN).length} חריגים, ${Object.keys(COPIED).length} עותקים ידועים, ${bad.length} פערים`);
  process.exit(bad.length ? 1 : 0);
}

const { chromium } = require('./pw.js');

const [dir, bg, title, d, sub] = process.argv.slice(2);
/* כותרת המשנה: ״למידה שנשמעת״ באפליקציות, ״אפליקציות לימוד בהקראה״ בשורש
   בלבד. עד 18.9.2026 המחרוזת הייתה קשיחה לשורש, ו-12 תמונות האפליקציות
   באוויר נשאו את הנוסח האחר — מגרסה קודמת של המחולל. */
const subtitle = sub || 'למידה שנשמעת';
if (!dir || !bg || !title || !d) {
  console.error("שימוש: node .claude/qa/og.js <תיקייה> <רקע> '<כותרת>' '<path…>'");
  process.exit(1);
}

/* כותרת ארוכה מקבלת גופן קטן יותר, כדי שלא תישבר על מילה בודדת.
   נמדד: ״למידה שנשמעת״ ב-76px שברה את המילה האחרונה לשורה משלה. */
const size = title.length > 16 ? 60 : 72;

const HTML = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;800&display=swap">
<style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;display:flex;align-items:center;justify-content:center;
  gap:72px;padding:0 90px;direction:rtl;background:${bg};
  font-family:Heebo,system-ui,Arial,sans-serif;color:#fff}
.t{flex:1;text-align:right}
h1{font-size:${size}px;font-weight:800;line-height:1.16;letter-spacing:-.02em;text-wrap:balance}
p{margin-top:26px;font-size:34px;font-weight:400;opacity:.86}
.tile{flex:0 0 auto;width:300px;height:300px;border:10px solid #fff;border-radius:64px;
  display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.10)}
svg{width:172px;height:172px}
</style>
<div class="t"><h1>${title}</h1><p>${subtitle}</p></div>
<div class="tile"><svg viewBox="0 0 24 24" fill="none" stroke="#fff"
  stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg></div>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(HTML, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const out = path.join(dir, 'img', 'og.png');
  await p.screenshot({ path: out });
  await b.close();
  console.log(out + ' ' + fs.statSync(out).size + ' bytes');
})();
