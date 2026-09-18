/* =====================================================================
   מחולל תמונת שיתוף. אותו דגם של `icon.js`: מריצים ביד, הצייר הוא
   הכרומיום שכבר מותקן לבדיקות, ואין npm ואין שלב בנייה.

     node .claude/qa/og.js <תיקייה> <רקע> '<כותרת>' '<path d=…>' ['<כותרת משנה>']

   הפריסה נמדדה מ-`english/img/og.png` הקיימת: 1200×630, רקע בצבע
   המותג, כותרת RTL, שורת ״למידה שנשמעת״ מתחתיה, ואריח מעוגל עם
   הסמל מהצד.

   **הסמל הוא אותו `path` שבדף הבית** — כך תמונת השיתוף, האייקון
   והכרטיס הם ציור אחד. זה בדיוק מה ש-`O-44` תיאר כשהם נפרדים.

   **והרקע שטוח בכוונה.** PNG אינו דוחס מעברים חלקים: גרדיאנט
   רדיאלי נתן 215KB ולינארי 158KB, מול **25KB** לרקע שטוח — נמדד
   על אותה תמונה בדיוק. שאר התיקים יושבים על 35–46KB.
   ===================================================================== */
const { chromium } = require('./pw.js');
const fs = require('fs'), path = require('path');

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
