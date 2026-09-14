/* =====================================================================
   מחולל תמונת שיתוף. אותו דגם של `icon.js`: מריצים ביד, הצייר הוא
   הכרומיום שכבר מותקן לבדיקות, ואין npm ואין שלב בנייה.

     node og.js <תיקייה> <רקע> '<כותרת>' '<path d=…>'

   הפריסה מועתקת מ-`english/img/og.png` שנמדדה בעין: 1200×630, רקע
   בצבע המותג עם הצללה קלה, כותרת RTL מימין, שורת ״למידה שנשמעת״
   מתחתיה, ואריח מעוגל עם הסמל משמאל.

   **הסמל הוא אותו `path` שבדף הבית** — כך תמונת השיתוף, האייקון
   והכרטיס הם ציור אחד. זה בדיוק מה ש-`O-44` מתאר כשהם נפרדים.
   ===================================================================== */
const { chromium } = require('./.claude/qa/pw.js');
const fs = require('fs'), path = require('path');

const [dir, bg, title, d] = process.argv.slice(2);
if (!dir || !bg || !title || !d) {
  console.error("שימוש: node og.js <תיקייה> <רקע> '<כותרת>' '<path…>'");
  process.exit(1);
}

const HTML = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;800&display=swap">
<style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;display:flex;align-items:center;justify-content:center;
  gap:72px;padding:0 90px;direction:rtl;
  background:${bg};
  font-family:Heebo,system-ui,Arial,sans-serif;color:#fff}
.t{flex:1;text-align:right}
h1{font-size:76px;font-weight:800;line-height:1.16;letter-spacing:-.02em;
  text-wrap:balance;text-shadow:0 2px 14px rgba(0,0,0,.18)}
p{margin-top:26px;font-size:34px;font-weight:400;opacity:.86}
.tile{flex:0 0 auto;width:300px;height:300px;border:10px solid #fff;border-radius:64px;
  display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.10)}
svg{width:172px;height:172px}
</style>
<div class="t"><h1>${title}</h1><p>למידה שנשמעת</p></div>
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
