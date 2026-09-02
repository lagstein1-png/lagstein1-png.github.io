/* ============================================================
   stage.js — אכיפת שער השלבים
   ------------------------------------------------------------
   build → internal → content-qa → approved → public

   השאלה היחידה שהכלי הזה עונה עליה: **האם משהו שלא אושר
   נגיש ללומד אמיתי?**

   הוא אינו מריץ דפדפן ואינו בודק תוכן. הוא משווה שלושה
   מקורות שאפשר להם להיפרד בשקט:

     · `.claude/qa/stages.json` — מה השלב של כל אפליקציה
     · `DATA.APPS` שבדף הבית    — מי מוצג ללומד
     · `index.html` של האפליקציה — האם השער הפנימי בפנים

   שלושתם נכתבים ביד, בשלושה רגעים שונים, ולכן הם ייפרדו.
   קו הבסיס הוא **אפס FAIL**.
   ============================================================ */
const fs=require("fs"), path=require("path");
const ROOT=path.resolve(__dirname,"..","..");
const REG=JSON.parse(fs.readFileSync(path.join(__dirname,"stages.json"),"utf8"));

const LADDER=["build","internal","content-qa","approved","public"];
const PUBLIC_OK=["pass","cleared","none","legacy-published"];
const GATE_MARK="INTERNAL-GATE";

const fail=[], warn=[], ok=[];
const F=(a,m)=>fail.push(a+": "+m);
const W=(a,m)=>warn.push(a+": "+m);

/* הדוח האחרון של content.js, כשיש. אין דוח — אין ידיעה, ולא
   מדווח כאן ניחוש במקומה. */
function scanOf(id){
  const p=path.join(__dirname,"reports",id+".json");
  if(!fs.existsSync(p)) return null;
  try{
    const R=JSON.parse(fs.readFileSync(p,"utf8"));
    return {verdict:R.verdict,fail:R.fail,review:R.review,date:R.generated,n:R.n};
  }catch(e){ return null }
}

/* --- דף הבית: מי באמת מוצג --- */
const home=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
const dm=home.match(/var DATA=(\{[\s\S]*?\});\s*\n/);
if(!dm){ console.log("✗ לא נמצא DATA= בדף הבית"); process.exit(1) }
const DATA=JSON.parse(dm[1]);
const listed=new Set(DATA.APPS.map(a=>a.id));

/* --- תיקיות שיש בהן דף --- */
const dirs=fs.readdirSync(ROOT,{withFileTypes:true})
  .filter(d=>d.isDirectory()&&!d.name.startsWith(".git"))
  .map(d=>d.name)
  .filter(n=>fs.existsSync(path.join(ROOT,n,"index.html")));

/* 1. כל תיקייה עם דף רשומה איפשהו.
      תיקייה חדשה שאיש לא רשם היא בדיוק המקרה שהשער נועד לתפוס:
      היא חיה בכתובת, ואף אחד לא החליט שהיא מותרת. */
for(const d of dirs)
  if(!REG.apps[d]&&!REG.notApps[d])
    F(d,"תיקייה עם index.html שאינה רשומה — הוסיפו ל-apps או ל-notApps ב-stages.json");

for(const [id,a] of Object.entries(REG.apps)){
  const stage=a.stage, here=dirs.includes(id);
  if(LADDER.indexOf(stage)<0){ F(id,"שלב לא מוכר: "+stage); continue }

  /* 2. רשומה ואינה בריפו — תקין רק אם סומנה external */
  if(!here&&!a.external){ F(id,"רשומה ב-stages.json אבל אין תיקייה"); continue }

  /* 3. מי שאינו public לא מופיע בדף הבית, ומי שכן — כן. */
  if(stage==="public"&&!listed.has(id))
    F(id,"שלב public אבל אינה ב-DATA.APPS — לומד לא ימצא אותה");
  if(stage!=="public"&&listed.has(id))
    F(id,"שלב "+stage+" אבל מופיעה בדף הבית — לומד אמיתי מגיע אליה");

  /* 4. השער הפנימי: חייב להיות לפני approved, ואסור אחריו. */
  if(here){
    const src=fs.readFileSync(path.join(ROOT,id,"index.html"),"utf8");
    const gated=src.indexOf(GATE_MARK)>=0;
    const needsGate=LADDER.indexOf(stage)<LADDER.indexOf("approved");
    if(needsGate&&!gated)
      F(id,"שלב "+stage+" בלי שער פנימי — הכתובת פתוחה לכל מי שינחש אותה");
    if(!needsGate&&gated)
      F(id,"שלב "+stage+" והשער הפנימי עדיין בקובץ — נועל את מי שאושר לו להיכנס");
  }

  /* 5. אישור דורש סריקת תוכן. */
  if(LADDER.indexOf(stage)>=LADDER.indexOf("approved")){
    if(!PUBLIC_OK.includes(a.contentQA))
      F(id,"שלב "+stage+" עם contentQA=\""+a.contentQA+"\" — אישור דורש pass או cleared");
    if(a.contentQA==="legacy-published"&&!scanOf(id))
      W(id,"פורסמה לפני שהשער נבנה, ו-content.js עוד לא רץ עליה.");
  }
  /* 6. הדוח האחרון, אם יש. FAIL בדוח אינו מוריד אפליקציה שכבר
        פורסמה — הוא נאמר, והבעלים מחליט. באפליקציה שעדיין לא
        אושרה הוא כן חוסם, וזו כל הנקודה של הסולם. */
  const sc=scanOf(id);
  if(sc){
    if(sc.verdict==="FAIL"&&LADDER.indexOf(stage)>=LADDER.indexOf("approved"))
      W(id,"הסריקה האחרונה מצאה "+sc.fail+" ממצאים חוסמים ("+sc.date+")");
    if(sc.verdict==="FAIL"&&LADDER.indexOf(stage)<LADDER.indexOf("approved"))
      F(id,"הסריקה האחרונה FAIL עם "+sc.fail+" ממצאים חוסמים — אינה יכולה לעלות שלב");
  }
  ok.push(id.padEnd(11)+" · "+stage.padEnd(10)+" · "+String(a.contentQA).padEnd(17)+
          " · "+(sc?("סריקה "+sc.verdict+" "+sc.fail+"/"+sc.review+" "+sc.date):"לא נסרקה"));
}

/* 6. מי שבדף הבית ואינו רשום בכלל */
for(const id of listed)
  if(!REG.apps[id]) F(id,"מופיעה ב-DATA.APPS ואינה ב-stages.json");

/* 7. מניין ה-badge. אינו נגזר מ-DATA.APPS, ולכן הוא נשכח.
      ארבע מחרוזות ביד, ומספר אחד ברישום. */
const nPublic=Object.values(REG.apps).filter(a=>a.stage==="public").length;
if(nPublic!==DATA.APPS.length)
  F("badge",nPublic+" אפליקציות public ברישום מול "+DATA.APPS.length+" ב-DATA.APPS");
if(nPublic!==REG.badge.count)
  F("badge","badge.count="+REG.badge.count+" מול "+nPublic+" אפליקציות public");
for(const [lg,word] of Object.entries(REG.badge.words)){
  const s=(DATA.STR[lg]||{}).badge||"";
  if(s.indexOf(word)<0)
    F("badge",lg+": הכותרת אינה מכילה \""+word+"\" — "+JSON.stringify(s.slice(0,40)));
}

/* --- דוח --- */
console.log("== שער שלבים · "+Object.keys(REG.apps).length+" רשומות · "+
            nPublic+" public");
for(const l of ok) console.log("   · "+l);
if(warn.length){ console.log("\n   אזהרות ("+warn.length+"):");
  for(const l of warn) console.log("   ! "+l) }
if(fail.length){ console.log("\n   FAIL ("+fail.length+"):");
  for(const l of fail) console.log("   ✗ "+l) }
else console.log("\n   FAIL: אפס");
process.exit(fail.length?1:0);
