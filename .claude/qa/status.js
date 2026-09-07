/* =====================================================================
   תמונת מצב נמדדת — כל שורה נקראת מהריפו, אף אחת לא נכתבת ביד.

     node .claude/qa/status.js            טבלה לטרמינל
     node .claude/qa/status.js --md       גוש Markdown ל-STATUS.md

   למה זה מחולל ולא מסמך
   ----------------------
   STATUS.md נכתב ביד ב-2.9, ותוך יומיים כל שבעת מספרי הגרסה שבו
   היו שגויים — האפליקציות זזו 4 עד 7 גרסאות. מסמך שסשן מונחה
   לסמוך עליו, ושכל מספר בו לא נכון, גרוע ממסמך שאינו קיים.
   ולכן המספרים כאן נגזרים, וההערכה האנושית נשארת ב-STATUS.md.
   ===================================================================== */
const fs=require("fs"), path=require("path");
const root=process.cwd(), md=process.argv.includes("--md"), check=process.argv.includes("--check");

/* רשימת האפליקציות מ-DATA.APPS שבדף הבית — מקור האמת למניין,
   ולא רשימה קשיחה שהייתה מתיישנת באפליקציה הבאה. */
function appIds(){
  /* אותו חילוץ שב-apps.js: DATA הוא JSON שלם בשורה אחת. */
  const home=fs.readFileSync(path.join(root,"index.html"),"utf8");
  const m=home.match(/var DATA=(\{"APPS".*?\});\s*\nvar APPS/s);
  if(!m)throw new Error("לא נמצא בלוק DATA ב-index.html");
  return JSON.parse(m[1]).APPS.map(a=>a.id);
}
function readApp(id){
  for(const f of [`${id}/index.html`,`${id}/app.js`]){
    const p=path.join(root,f);
    if(fs.existsSync(p))return {file:f,src:fs.readFileSync(p,"utf8")};
  }
  return null;
}
const rows=[];
for(const id of appIds()){
  const a=readApp(id);
  if(!a){ rows.push({id,build:"—",sw:"—",match:"אינה בריפו הזה",note:""}); continue; }
  let src=a.src;
  if(!/var BUILD=/.test(src)&&fs.existsSync(path.join(root,id,"app.js")))
    src+=fs.readFileSync(path.join(root,id,"app.js"),"utf8");
  const b=(src.match(/var BUILD\s*=\s*"([^"]+)"/)||[])[1]||"";
  const w=(src.match(/sw\.js\?v=([A-Za-z0-9.-]+)/)||[])[1]||"";
  const bk=b.split(" ")[0];
  const match = (!b&&w) ? "מפתח בלבד" : (bk&&w&&w.replace(/-pwa\d+$/,"")===bk) ? "תואם" : "לא תואם";
  rows.push({id,build:b||"—",sw:w||"—",match,note:""});
}
/* --check: הטבלה ב-STATUS.md מול הקבצים עצמם.
   בלי זה המסמך משקר בשקט — הוא רוענן ידנית ב-4.9 ותוך יום היו בו
   שוב שתי גרסאות ישנות. מספר שנשאר מאחור נתפס עכשיו כמו מניין
   שנשאר מאחור ב-apps.js. */
if(check){
  const p=path.join(root,"STATUS.md");
  if(!fs.existsSync(p)){ console.log("STATUS.md אינו קיים"); process.exit(1); }
  const doc=fs.readFileSync(p,"utf8"), bad=[];
  for(const r of rows){
    const line=doc.split("\n").find(l=>l.includes("`"+r.id+"`"));
    if(!line){ bad.push(`${r.id} — אינו בטבלה שב-STATUS.md`); continue; }
    const cells=line.split("|").map(c=>c.trim());
    if(cells[2]!==r.build||cells[3]!==r.sw)
      bad.push(`${r.id} — במסמך ${cells[2]} / ${cells[3]}, בקובץ ${r.build} / ${r.sw}`);
  }
  if(bad.length){
    bad.forEach(b=>console.log("· "+b));
    console.log(`\nהטבלה ב-STATUS.md מאחור ב-${bad.length} שורות.`);
    console.log("רענון: node .claude/qa/status.js --md");
    process.exit(1);
  }
  console.log(`הטבלה ב-STATUS.md תואמת לכל ${rows.length} האפליקציות`);
  process.exit(0);
}
const w=(s,n)=>String(s)+" ".repeat(Math.max(0,n-String(s).length));
const out=[];
if(md){
  out.push("| אפליקציה | BUILD | מפתח קאש | תואם |","|---|---|---|---|");
  rows.forEach(r=>out.push(`| \`${r.id}\` | ${r.build} | ${r.sw} | ${r.match}${r.note?" — "+r.note:""} |`));
  out.push("", `נוצר ב-\`node .claude/qa/status.js --md\`, ${new Date().toISOString().slice(0,10)}.`);
}else{
  out.push(w("אפליקציה",16)+w("BUILD",22)+w("מפתח קאש",14)+"תואם");
  rows.forEach(r=>out.push(w(r.id,16)+w(r.build,22)+w(r.sw,14)+r.match+(r.note?" — "+r.note:"")));
  const bad=rows.filter(r=>r.match==="לא תואם");
  out.push("", `${rows.length} אפליקציות · ${bad.length} עם גרסה ומפתח שאינם תואמים`);
}
console.log(out.join("\n"));
process.exit(rows.some(r=>r.match==="לא תואם")?1:0);
