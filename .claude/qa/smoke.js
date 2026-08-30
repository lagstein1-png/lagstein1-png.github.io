const {chromium}=require('/opt/node22/lib/node_modules/playwright');
async function click(p,s){try{await p.click(s,{timeout:2000});await p.waitForTimeout(300);return true}catch(e){return false}}
(async()=>{const b=await chromium.launch();
for(const app of process.argv.slice(2)){
  const ctx=await b.newContext({locale:'he-IL'});const page=await ctx.newPage();
  const errs=[];page.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE: '+m.text())});
  await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8099')?r.continue():r.abort());
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
  console.log(app.padEnd(12)+(errs.length?'ERRORS ('+errs.length+'):\n   '+[...new Set(errs)].join('\n   '):'clean ('+labels.length+' controls exercised)'));
  await ctx.close();
}
await b.close();})();
