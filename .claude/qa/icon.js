/* =====================================================================
   מחולל אייקוני PWA. מריצים אותו ביד כשמוסיפים אפליקציה — הוא אינו
   שלב בנייה ואינו רץ בפריסה. האתר עצמו נשאר קובץ HTML יחיד לכל
   אפליקציה, בלי npm ובלי build.

     node .claude/qa/icon.js <תיקייה> <רקע> <צבע-קו> '<path d=…>'
     node .claude/qa/icon.js --check    האייקונים שבדיסק מול הפלטה (רץ ב-all.js)

   הצייר הוא כרומיום שכבר מותקן לבדיקות. הקלט הוא אותו SVG שנכתב
   ביד בדף הבית, כדי שהסמל בכרטיס והסמל במסך הבית יהיו אותו סמל
   ולא שני ציורים שנפרדו עם הזמן.

   **מה --check בודק, ולמה לא השוואת בתים (O-77).** צילום של כרומיום
   אינו דטרמיניסטי בין גרסאות (החלקת קצוות, ניהול צבע — נמדד 4.10.2026:
   אותו #9a5b0f יצא #97590e באייקון של history), ולכן ״לייצר מחדש
   ולהשוות״ היה נופל על כל עדכון דפדפן. במקום זה הוא קורא את ה-PNG
   עצמו — מפענח PNG קטן כאן, בלי תלות — ובודק את מה שהוזן למחולל:
   צבע הרקע מול `theme_color` שבמניפסט של אותה אפליקציה, בסטייה של
   עד TOL לערוץ; שכל אייקון שהמניפסט מצהיר עליו קיים ובגודל המוצהר;
   ושהאייקון הניתן לחיתוך (maskable) מלא עד הפינה העליונה. מה שלא נבדק: הסמל
   עצמו וצבע הקו — אין להם מקור בדיסק להשוות אליו.
   ===================================================================== */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ROOT=path.resolve(__dirname,'..','..');
const TOL=6;

/* אייקון שלא יצא מהמחולל הזה, בכוונה. כל שורה — תיקייה ונימוק.
   שורה שהאייקון שלה כבר תואם לפלטה נופלת גם היא: חריג שאינו נחוץ
   הוא חור שבו סחיפה הבאה תעבור בשקט. */
const FOREIGN={
  'hebrew-lit':'רקע מדורג וציור ספרים עם המילה ״קריאה״ — עיצוב נפרד, לא icon.js',
};

/* מפענח PNG מינימלי: 8 ביט, RGB או RGBA, בלי שזירה — כל מה שכרומיום
   מצלם. נמדד 4.10.2026 על 147 קובצי האייקון ותמונות השיתוף: אין אחר. */
function decodePNG(f){
  const b=fs.readFileSync(f);let o=8,h=null;const idat=[];
  while(o<b.length){const len=b.readUInt32BE(o),t=b.toString('ascii',o+4,o+8),d=b.subarray(o+8,o+8+len);
    if(t==='IHDR')h={w:d.readUInt32BE(0),h:d.readUInt32BE(4),bd:d[8],ct:d[9],il:d[12]};
    if(t==='IDAT')idat.push(d);o+=12+len;}
  const bpp={2:3,6:4}[h&&h.ct];
  if(!h||h.bd!==8||!bpp||h.il)throw new Error('PNG בפורמט שהמפענח אינו מכיר: '+JSON.stringify(h));
  const raw=zlib.inflateSync(Buffer.concat(idat)),st=h.w*bpp,px=Buffer.alloc(st*h.h);
  for(let y=0;y<h.h;y++){
    const ft=raw[y*(st+1)],src=raw.subarray(y*(st+1)+1,(y+1)*(st+1)),r=px.subarray(y*st,(y+1)*st),pr=y?px.subarray((y-1)*st,y*st):null;
    for(let i=0;i<st;i++){const a=i>=bpp?r[i-bpp]:0,u=pr?pr[i]:0,c=pr&&i>=bpp?pr[i-bpp]:0;let v=src[i];
      if(ft===1)v+=a;else if(ft===2)v+=u;else if(ft===3)v+=(a+u)>>1;
      else if(ft===4){const p=a+u-c,pa=Math.abs(p-a),pb=Math.abs(p-u),pc=Math.abs(p-c);v+=pa<=pb&&pa<=pc?a:pb<=pc?u:c;}
      r[i]=v&255;}}
  return{w:h.w,h:h.h,at(x,y){const i=y*st+x*bpp;return'#'+[px[i],px[i+1],px[i+2]].map(n=>n.toString(16).padStart(2,'0')).join('')}};
}
function near(a,b,tol=TOL){
  const p=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));const x=p(a.toLowerCase()),y=p(b.toLowerCase());
  return x.every((v,i)=>Math.abs(v-y[i])<=tol);
}
/* כל תיקייה עם manifest.json, והשורש. נגזר מהדיסק, לא נכתב ביד. */
function appDirs(){
  return ['.'].concat(fs.readdirSync(ROOT,{withFileTypes:true})
    .filter(e=>e.isDirectory()&&!e.name.startsWith('.')&&fs.existsSync(path.join(ROOT,e.name,'manifest.json')))
    .map(e=>e.name));
}
function theme(dir){return JSON.parse(fs.readFileSync(path.join(ROOT,dir,'manifest.json'),'utf8')).theme_color}
module.exports={decodePNG,near,appDirs,theme,TOL,ROOT};

function check(){
  const bad=[];let n=0;const seenForeign=new Set();
  for(const dir of appDirs()){
    const m=JSON.parse(fs.readFileSync(path.join(ROOT,dir,'manifest.json'),'utf8'));
    const bg=m.theme_color;
    if(!/^#[0-9a-f]{6}$/i.test(bg||'')){bad.push(`${dir}: theme_color חסר או אינו #rrggbb — ${bg}`);continue}
    const files=(m.icons||[]).filter(i=>/\.png$/i.test(i.src)).map(i=>({src:i.src,sizes:i.sizes,mask:/maskable/.test(i.purpose||'')}));
    if(fs.existsSync(path.join(ROOT,dir,'img','apple-touch-icon.png')))files.push({src:'img/apple-touch-icon.png',sizes:'180x180',mask:false});
    const off=[];
    for(const f of files){
      const p=path.join(ROOT,dir,f.src),rel=path.join(dir,f.src);
      if(!fs.existsSync(p)){bad.push(`${rel}: המניפסט מצהיר עליו ואין קובץ`);continue}
      const img=decodePNG(p);n++;
      const [w,h]=(f.sizes||'').split('x').map(Number);
      if(img.w!==w||img.h!==h)bad.push(`${rel}: ${img.w}×${img.h}, המניפסט אומר ${f.sizes}`);
      /* נקודת הדגימה: אמצע הקצה העליון, 5% פנימה — בתוך הרקע ומחוץ
         לסמל (הריפוד הוא 14%), ורחוק מהפינה המעוגלת. */
      const pts=[[img.w>>1,Math.round(img.h*0.05)]];
      /* maskable מלא עד הקצה — גם הפינה היא רקע. רק הפינה העליונה:
         בחמישה אייקונים (history, math-uni×3, reader) הרקע מדורג
         לכהה בפינה הנגדית, נמדד 4.10.2026, והמוצא שלו הוא theme_color. */
      if(f.mask)pts.push([1,1]);
      for(const [x,y] of pts){const c=img.at(x,y);if(!near(c,bg))off.push(`${rel} (${x},${y}) ${c}`)}
    }
    if(FOREIGN[dir]){seenForeign.add(dir);
      if(!off.length)bad.push(`${dir}: רשום כחריג ב-FOREIGN, אבל האייקונים כבר תואמים ל-${bg} — מחק את השורה`);
      else console.log(`  · ${dir} — חריג מתועד: ${FOREIGN[dir]}`);
      continue}
    for(const o of off)bad.push(`${o} — הרקע אינו theme_color ${bg} (סטייה מעל ${TOL})`);
  }
  for(const d of Object.keys(FOREIGN))if(!seenForeign.has(d))bad.push(`FOREIGN: ${d} — אין תיקייה עם מניפסט בשם הזה`);
  for(const b of bad)console.log('✗ '+b);
  console.log(`${bad.length?'✗':'✓'} ${n} אייקונים ב-${appDirs().length} מניפסטים מול theme_color, ${Object.keys(FOREIGN).length} חריגים מתועדים, ${bad.length} פערים`);
  process.exit(bad.length?1:0);
}

if(require.main===module){
if(process.argv.includes('--check'))check();
const {chromium}=require('./pw.js');
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
}
