/* בודק את מה שהיה נשבר בשקט: שהשאלה שהמורה רואה על המסך היא
   בדיוק השאלה שהתלמיד מקבל מהקישור, ושהחלפה של שאלה אחת אינה
   משנה אף אחת מהשאר. */
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const APPS=process.argv.slice(2).length?process.argv.slice(2)
  :["math-app","math-teen","math-uni","math-uni2","math-uni3","ulpan","english","history"];
const BASE="http://127.0.0.1:8099";

(async()=>{
  const b=await chromium.launch();
  let bad=0;
  for(const app of APPS){
    const page=await b.newPage();
    const errs=[];
    page.on("pageerror",e=>errs.push(String(e)));
    /* חסימת הרשת החיצונית היא שלנו, וכרום מדווח עליה כשגיאה.
       בלעדי הסינון כל דף "נכשל" תמיד ושגיאה אמיתית נבלעת. */
    page.on("console",m=>{
      if(m.type()!=="error")return;
      const t=m.text();
      if(/net::ERR_FAILED|net::ERR_BLOCKED/.test(t))return;
      errs.push("console: "+t);
    });
    await page.route("**/*",r=>r.request().url().startsWith(BASE)?r.continue():r.abort());
    await page.goto(BASE+"/"+app+"/",{waitUntil:"domcontentloaded"});
    await page.waitForTimeout(700);
    /* שער התנאים יושב מעל הכול וחוסם כל לחיצה. סוגרים אותו, ואז
       עוברים את האונבורדינג אם יש. */
    try{await page.click("#lg-ok",{timeout:3000})}catch(e){}
    for(let i=0;i<10;i++){
      if(await page.$('[data-a="selpet"]'))await page.click('[data-a="selpet"]').catch(()=>{});
      if(await page.$('[data-a="startpet"]')){await page.click('[data-a="startpet"]').catch(()=>{});continue}
      if(await page.$('[data-a="obnext"]')){await page.click('[data-a="obnext"]').catch(()=>{});continue}
      break;
    }
    await page.waitForFunction(()=>typeof window.exSlots==="function",{timeout:15000});

    const r=await page.evaluate(()=>{
      const out={};
      /* מצב פתיחה: נושאים, רמה, ועשר שאלות. */
      EB.q=null; EB.n=10; EB.built=null;
      const slots=exSlots();
      out.n=slots.length;
      out.seeded=slots.every(s=>s.length===3&&typeof s[2]==="number");
      const sig=s=>{const q=exBuildSlot(s);return q?(q.ask+"|"+(q.expr||"")+"|"+q.options.map(o=>o.t).join("~")):"NULL"};
      const before=slots.map(sig);
      out.nulls=before.filter(x=>x==="NULL").length;

      /* החלפה של שאלה אחת — רק היא משתנה. */
      const i=3;
      slots[i]=exSlot(slots[i][0],slots[i][1]);
      const after=slots.map(sig);
      out.changedByRoll=before.map((x,k)=>x!==after[k]?k:-1).filter(k=>k>=0);

      /* אריזה לקישור, ופענוח חזרה — כמו אצל התלמיד. */
      const spec={v:GENV,t:"בדיקה",s:(Math.random()*4294967295)>>>0,l:EB.level,
                  q:slots.slice(),r:true,f:true,w:true,m:0};
      const code=encodeExam(spec);
      out.urlLen=code.length;
      const back=decodeExam(code);
      out.decoded=!!back;
      const student=examQuestions(back).map(q=>q.ask+"|"+(q.expr||"")+"|"+q.options.map(o=>o.t).join("~"));
      const teacher=after.filter(x=>x!=="NULL");
      out.sameAsStudent=student.length===teacher.length&&student.every((x,k)=>x===teacher[k]);
      out.studentN=student.length;

      /* מבחן ישן, בלי זרעים, חייב להיבנות בדיוק כמו קודם. */
      const legacy={v:GENV,t:"ישן",s:12345,l:2,q:slots.map(s=>[s[0],s[1]]),r:true,f:true,w:true,m:0};
      const a1=examQuestions(legacy).map(q=>q.ask+"|"+(q.expr||""));
      const a2=examQuestions(legacy).map(q=>q.ask+"|"+(q.expr||""));
      out.legacyStable=a1.length>0&&a1.join("§")===a2.join("§");
      out.legacyId=examId(legacy);
      /* גם המבחן הארוך ביותר חייב להיכנס להודעת וואטסאפ. */
      EB.q=null;EB.n=25;
      const big=exSlots();
      out.maxCode=encodeExam({v:GENV,t:"מבחן אלגברה — כיתה ט׳2",s:1,l:2,q:big,r:true,f:true,w:true,m:45}).length;
      EB.q=null;EB.n=10;
      return out;
    });

    /* והמסך עצמו: הרשימה מצטיירת, וכפתור ההחלפה עובד באמת. */
    await page.evaluate(()=>{ if(typeof goto==="function")goto("exam"); else {view="exam";render()} });
    await page.waitForSelector(".xq-list .xq",{timeout:10000});
    const rows=await page.$$eval(".xq-list .xq",n=>n.length);
    const first=await page.$eval(".xq-list .xq .xq-q",n=>n.textContent.trim());
    await page.click('.xq-list .xq:nth-child(1) [data-a="exqroll"]');
    await page.waitForTimeout(120);
    const firstAfter=await page.$eval(".xq-list .xq .xq-q",n=>n.textContent.trim());
    await page.click('[data-a="exqans"]');
    await page.waitForTimeout(120);
    const answers=await page.$$eval(".xq-a",n=>n.length);
    const del=await page.$('.xq-list .xq:nth-child(2) [data-a="exqdel"]');
    if(del)await del.click();
    await page.waitForTimeout(120);
    const rowsAfterDel=await page.$$eval(".xq-list .xq",n=>n.length);
    await page.click('[data-a="exqadd"]');
    await page.waitForTimeout(120);
    const rowsAfterAdd=await page.$$eval(".xq-list .xq",n=>n.length);
    await page.click('[data-a="exbuild"]');
    await page.waitForTimeout(200);
    const builtN=await page.evaluate(()=>EB.built?EB.built.q.length:0);

    const ok = r.seeded && r.decoded && r.sameAsStudent && r.legacyStable
            && r.changedByRoll.length===1 && r.changedByRoll[0]===3
            && rows===10 && rowsAfterDel===9 && rowsAfterAdd===10
            && builtN===10 && answers>0 && errs.length===0;
    if(!ok)bad++;
    console.log((ok?"✓":"✗")+" "+app.padEnd(10)+
      " slots="+r.n+" seeded="+r.seeded+" roll→"+JSON.stringify(r.changedByRoll)+
      " student="+r.studentN+"/"+r.sameAsStudent+" legacy="+r.legacyStable+
      " nulls="+r.nulls+" code="+r.urlLen+"/"+r.maxCode+
      " ui="+rows+"→"+rowsAfterDel+"→"+rowsAfterAdd+" built="+builtN+" ans="+answers+
      (errs.length?"\n    JS: "+errs.slice(0,3).join(" | "):""));
    await page.close();
  }
  await b.close();
  process.exit(bad?1:0);
})();
