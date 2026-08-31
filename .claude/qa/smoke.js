const {chromium}=require('/opt/node22/lib/node_modules/playwright');
async function click(p,s){try{await p.click(s,{timeout:2000});await p.waitForTimeout(300);return true}catch(e){return false}}
(async()=>{const b=await chromium.launch();
for(const app of process.argv.slice(2)){
  const ctx=await b.newContext({locale:'he-IL'});const page=await ctx.newPage();
  const errs=[];page.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
  /* חסימת הרשת החיצונית היא שלנו, וכרום מדווח עליה כשגיאת קונסולה.
     בלעדי הסינון הזה כל דף שטוען גופן מגוגל "נכשל" תמיד, ושגיאה
     אמיתית נבלעת בתוך הרעש. */
  let blocked=0;
  page.on('console',m=>{
    if(m.type()!=='error')return;
    const t=m.text();
    if(/net::ERR_FAILED|net::ERR_BLOCKED/.test(t)&&blocked>0)return;
    errs.push('CONSOLE: '+t);
  });
  await page.route('**/*',r=>{
    if(r.request().url().startsWith('http://127.0.0.1:8099'))return r.continue();
    blocked++;return r.abort();
  });
  await page.goto('http://127.0.0.1:8099/'+app,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForTimeout(700);
  await click(page,'#lg-ok');
  for(let i=0;i<10;i++){
    if(await page.$('[data-a="selpet"]'))await click(page,'[data-a="selpet"]');
    if(await page.$('[data-a="startpet"]')){await click(page,'[data-a="startpet"]');continue}
    if(await page.$('[data-a="obnext"]')){await click(page,'[data-a="obnext"]');continue}
    break;
  }
  // click up to 20 distinct visible buttons, returning home between
  const labels=await page.evaluate(()=>[...document.querySelectorAll('button,[role="button"]')]
     .filter(b=>b.offsetParent!==null).map(b=>(b.textContent||'').trim()).filter(Boolean).slice(0,18));
  for(const lb of labels){
    await page.evaluate(t=>{const b=[...document.querySelectorAll('button,[role="button"]')]
      .filter(x=>x.offsetParent!==null).find(x=>(x.textContent||'').trim()===t);if(b)b.click()},lb);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(400);
  const tail=' ('+labels.length+' controls exercised, '+blocked+' external requests blocked)';
  console.log(app.padEnd(24)+(errs.length?'ERRORS ('+errs.length+'):\n   '+[...new Set(errs)].join('\n   ')+'\n  '+tail:'clean'+tail));
  await ctx.close();
}
await b.close();})();
