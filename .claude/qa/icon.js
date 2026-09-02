/* =====================================================================
   מחולל אייקוני PWA. מריצים אותו ביד כשמוסיפים אפליקציה — הוא אינו
   שלב בנייה ואינו רץ בפריסה. האתר עצמו נשאר קובץ HTML יחיד לכל
   אפליקציה, בלי npm ובלי build.

     node .claude/qa/icon.js <תיקייה> <רקע> <צבע-קו> '<path d=…>'

   הצייר הוא כרומיום שכבר מותקן לבדיקות. הקלט הוא אותו SVG שנכתב
   ביד בדף הבית, כדי שהסמל בכרטיס והסמל במסך הבית יהיו אותו סמל
   ולא שני ציורים שנפרדו עם הזמן.
   ===================================================================== */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'),path=require('path');
const [dir,bg,ink,d]=process.argv.slice(2);
if(!dir||!bg||!ink||!d){console.error("שימוש: node .claude/qa/icon.js <תיקייה> <רקע> <צבע-קו> '<path…>'");process.exit(1)}

/* maskable: מערכת ההפעלה חותכת עיגול מתוך הריבוע, ולכן הציור מוקטן
   ל-60% ומרוכז. בלי זה קצה הסמל נחתך במסך הבית של אנדרואיד. */
function page(size,maskable){
  const pad=maskable?0.20:0.14, inner=size*(1-2*pad), r=maskable?0:size*0.22;
  return `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;width:${size}px;height:${size}px}
  .b{width:${size}px;height:${size}px;background:${bg};border-radius:${r}px;
     display:flex;align-items:center;justify-content:center}</style>
<div class="b"><svg width="${inner}" height="${inner}" viewBox="0 0 24 24" fill="none"
  stroke="${ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg></div>`;
}
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage();
  for(const [file,size,mask] of [["icon-192.png",192,false],["icon-512.png",512,false],
                                 ["icon-maskable-512.png",512,true],["apple-touch-icon.png",180,false]]){
    await p.setViewportSize({width:size,height:size});
    await p.setContent(page(size,mask));
    const out=path.join(dir,"img",file);
    await p.screenshot({path:out,omitBackground:false});
    console.log(out, fs.statSync(out).size+" bytes");
  }
  await b.close();
})();
