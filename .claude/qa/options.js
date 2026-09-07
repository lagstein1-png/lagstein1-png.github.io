const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{
let failed=0;   /* בלי זה הכלי מדפיס JS ERRORS ויוצא 0 */
 const b=await chromium.launch();
 for(const app of process.argv.slice(2)){
  const ctx=await b.newContext({locale:'he-IL'});const page=await ctx.newPage();
  const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8099')?r.continue():r.abort());
  await page.goto('http://127.0.0.1:8099/'+app+'/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(900);
  let r;try{r=await page.evaluate(()=>{
    const LV=[];for(let i=1;i<=((typeof LVL!=='undefined'&&LVL.length)||3);i++)LV.push(i);
    /* כמו ב-entropy.js: בלי המשמר הזה אפליקציה בלי מחולל זורקת
       ReferenceError שמפיל את הריצה, וכל מה שאחריה לא נבדק. */
    if(typeof TOPICS==='undefined'||typeof buildQ!=='function') return {na:true};
    const rows=[];let tot=0,under=0,multi=0,none=0;
    for(const t of TOPICS) for(const lv of LV){
      let n=0,u=0;
      for(let k=0;k<600;k++){
        let q;try{q=buildQ(t.id,lv)}catch(e){continue}
        if(!q||!q.options)continue;
        n++;tot++;
        if(q.options.length<4){u++;under++}
        const ok=q.options.filter(o=>o.ok).length;
        if(ok>1)multi++; if(ok===0)none++;
      }
      if(u)rows.push({row:t.id+' L'+lv,pct:+(u/n*100).toFixed(1)});
    }
    return {rows:rows.sort((a,b)=>b.pct-a.pct),tot,under,multi,none,levels:LV.length};
  })}catch(e){failed++;console.log('✗ '+app+': '+String(e.message).split('\n')[0]);await ctx.close();continue}
  if(r.na){console.log('· '+app+': אין TOPICS/buildQ — סכימה אחרת, לא נבדק כאן');await ctx.close();continue}
  /* under4 אינו מפיל: יש לו קו בסיס מתועד שאינו אפס (math-uni 2.2%,
     שלוש שורות שנבדקו ונמצאו תקינות — ראו README). multiCorrect,
     noCorrect ושגיאת JS כן: לאלה קו הבסיס הוא אפס. */
  if(r.multi||r.none||errs.length)failed++;
  console.log('== '+app+'  levels='+r.levels+'  total='+r.tot+
    '  under4='+r.under+' ('+(r.under/r.tot*100).toFixed(1)+'%)  multiCorrect='+r.multi+'  noCorrect='+r.none);
  r.rows.slice(0,8).forEach(x=>console.log('     '+x.row.padEnd(16)+x.pct+'%'));
  if(errs.length)console.log('     JS ERRORS: '+errs[0]);
  await ctx.close();
 }
 await b.close();
 process.exitCode = failed ? 1 : 0;
})();
