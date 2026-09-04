const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{
let failed=0;   /* בלי זה הכלי מדפיס ממצאים ויוצא 0 */
 const b=await chromium.launch();
 for(const app of process.argv.slice(2)){
  const ctx=await b.newContext({locale:'he-IL'});const page=await ctx.newPage();
  const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8099')?r.continue():r.abort());
  try{await page.goto('http://127.0.0.1:8099/'+app+'/',{waitUntil:'domcontentloaded'})}catch(e){console.log(app,'SKIP');await ctx.close();continue}
  await page.waitForTimeout(1000);
  const r=await page.evaluate(()=>{
    const plain=h=>{const d=document.createElement('div');d.innerHTML=String(h||'');return (d.textContent||'').replace(/\s+/g,' ').trim()};
    /* מפתח להשוואת אפשרויות. textContent לבדו משטח מבנה: השבר −5/x
       והמכפלה −5x נותנים אותה מחרוזת, וכך גם שתי מטריצות שנבדלות רק
       בסידור העמודות. כאן כל גבול אלמנט הוא מפריד, ולכן שתי אפשרויות
       נחשבות זהות רק אם הן זהות גם על המסך. */
    const key=h=>{
      const d=document.createElement('div');d.innerHTML=String(h||'');
      const walk=n=>{
        if(n.nodeType===3) return (n.nodeValue||'').replace(/\s+/g,' ');
        let s='<'+n.nodeName+'>';
        for(const c of n.childNodes) s+=walk(c);
        return s+'</>';
      };
      let s='';for(const c of d.childNodes) s+=walk(c);
      return s.trim();
    };
    const rows=[],bad={noAns:0,multi:0,dupe:0,nan:0,nanTxt:0,n:0};
    /* מספר הרמות נלקח מהאפליקציה ולא מקובע כאן: רמה שנוספה בלי
       שהבודק ידע עליה היתה נבדקת אפס פעמים. */
    const LVLS=[];for(let i=1;i<=((typeof LVL!=='undefined'&&LVL.length)||3);i++)LVLS.push(i);
    for(const t of TOPICS) for(const lv of LVLS){
      const seen={},N=500;let ok=0;
      for(let k=0;k<N;k++){
        let q;try{q=buildQ(t.id,lv)}catch(e){continue}
        if(!q||!q.options)continue;
        bad.n++;
        const cs=q.options.filter(o=>o.ok);
        if(cs.length===0)bad.noAns++; if(cs.length>1)bad.multi++;
        const ks=q.options.map(o=>key(o.h!==undefined?o.h:o.t));
        if(new Set(ks).size!==ks.length)bad.dupe++;
        const ts=q.options.map(o=>plain(o.h!==undefined?o.h:o.t));
        if(ts.some(x=>/NaN|Infinity|undefined/.test(x)))bad.nan++;
        /* nan סורק את האפשרויות בלבד, ולכן משתנה שלא קיבל ערך עוד
           הציג "x − undefined" בשני צעדי פתרון ב-math-uni logs L4
           ב-211 מתוך 400 הגרלות — ואף מדד לא הרגיש. הצעדים, הרמז,
           השאלה והביטוי נראים לתלמיד בדיוק כמו האפשרויות. */
        const txt=[q.ask,q.expr,q.hint].filter(x=>typeof x==='string').join(' ')+' '+
                  JSON.stringify(q.steps||[])+' '+JSON.stringify((q.wrong||[]).map(w=>w&&w.why));
        if(/NaN|Infinity|undefined/.test(txt))bad.nanTxt++;
        if(cs.length===1){const a=plain(cs[0].h!==undefined?cs[0].h:cs[0].t);seen[a]=(seen[a]||0)+1;ok++}
      }
      const keys=Object.keys(seen);
      const top=keys.length?Math.max(...keys.map(k=>seen[k]))/Math.max(1,ok):0;
      rows.push({id:t.id,lv,distinct:keys.length,topShare:+(top*100).toFixed(1)});
    }
    return {rows,bad,levels:LVLS.length};
  });
  const constant=r.rows.filter(x=>x.distinct<=1);
  const nearConst=r.rows.filter(x=>x.distinct>1&&x.topShare>=95);
  /* קו הבסיס כאן הוא אפס — ראו README. bad, רמה עם תשובה קבועה
     ושגיאת JS הם כולם באגים אמיתיים, ולכן הם מפילים את הריצה. */
  if(r.bad.noAns||r.bad.multi||r.bad.dupe||r.bad.nan||constant.length||errs.length)failed++;
  console.log('== '+app,JSON.stringify(r.bad),r.levels+' levels');
  console.log('   constant-answer levels:',constant.length?constant.map(x=>x.id+' L'+x.lv).join(', '):'none');
  console.log('   >=95% same answer:',nearConst.length?nearConst.map(x=>x.id+' L'+x.lv+'('+x.topShare+'%)').join(', '):'none');
  console.log('   js errors:',errs.length?errs[0]:'none');
  await ctx.close();
 }
 await b.close();
 process.exitCode = failed ? 1 : 0;
})();
