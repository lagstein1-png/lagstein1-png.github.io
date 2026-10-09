const {chromium}=require('../pw.js');const assert=require('assert');const fs=require('fs');
(async()=>{
 const b=await chromium.launch({headless:true});let checks=0,errors=[];const root='http://127.0.0.1:8099/net-elem/';
 const c=await b.newContext();let gate=await c.newPage();await gate.goto(root);assert(await gate.locator('#gate').isVisible());assert.equal(await gate.locator('[data-u]').count(),0);checks+=2;await c.close();
 for(const lang of ['he','ar','ru','en']){
  const c=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>errors.push(lang+': '+e.message));
  await p.route(/https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
  await p.goto(root+'?internal=shlav-internal-net-elem-k'); if(await p.locator('.lg-wrap').count()){console.log(await p.locator('.lg-wrap button').allTextContents());await p.locator('.lg-wrap button').nth(4).click();}await p.locator(`[data-lang="${lang}"]`).click();
  assert.equal(await p.locator('[data-u]').count(),8);assert.equal(await p.locator('html').getAttribute('dir'),['he','ar'].includes(lang)?'rtl':'ltr');checks+=2;
  await p.screenshot({path:`/tmp/net-${lang}-home.png`,fullPage:true});
  for(const topic of await p.locator('[data-u]').evaluateAll(xs=>xs.map(x=>x.dataset.u))){
   await p.locator(`[data-u="${topic}"]`).click();assert(await p.locator('#playBtn').isVisible());checks++;
   await p.locator('#startBtn').click();
   const count=await p.evaluate(()=>R.qs.length);assert.equal(count,topic==='mix'?12:5);checks++;
   for(let i=0;i<count;i++){
    assert.equal(await p.locator('.opt').count(),4);assert.equal(await p.locator('[data-opt]').count(),4);checks+=2;
    assert(await p.evaluate(()=>new Set(curQ().keys.map(k=>optText(k))).size===4));checks++;
    if(i===0){
     const before=await p.evaluate(()=>R.i);await p.evaluate(()=>nextQ());assert.equal(await p.evaluate(()=>R.i),before);checks++;
     await p.locator('#hintBtn').click();const hint=await p.locator('#fb').textContent();assert(hint.length>8);checks++;
     await p.locator('#limorBtn').click();assert(await p.locator('#limorOv').isVisible());assert.equal(await p.locator('#limorOv img').count(),1);checks+=2;
     await p.locator('[data-k="story"]').click();assert.notEqual(await p.locator('#lmText').textContent(),hint);checks++;
     if(topic==='privacy')await p.screenshot({path:`/tmp/net-${lang}-limor.png`,fullPage:false});await p.keyboard.press('Escape');assert.equal(await p.locator('#limorOv').count(),0);checks++;
     await p.locator('#playBtn').click();assert(await p.locator('#audioNotice').isVisible());checks++;
     const wrong=await p.evaluate(()=>curQ().keys.map((x,i)=>i).filter(i=>i!==curQ().ans));await p.locator('#opt'+wrong[0]).click();await p.locator('#opt'+wrong[1]).click();assert.equal(await p.evaluate(()=>R.locked),false);checks++;
     if(topic==='privacy')await p.screenshot({path:`/tmp/net-${lang}-question.png`,fullPage:true});
    }
    const ans=await p.evaluate(()=>curQ().ans);await p.locator('#opt'+ans).click();assert(await p.locator('#nextBtn').isVisible());checks++;
    if(i===0){let other=lang==='en'?'he':'en';await p.locator(`[data-lang="${other}"]`).click();assert(await p.locator('#nextBtn').isVisible());await p.locator(`[data-lang="${lang}"]`).click();checks++;}
    await p.locator('#nextBtn').click();
   }
   assert(await p.locator('#doneText').isVisible());checks++;await p.locator('#unitsBtn').click();
  }
  await p.locator('#gearBtn').click();await p.locator('#darkBtn').click();assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');checks++;
  await p.locator('[data-mode="reduceMotion"]').click();await p.locator('[data-ts="3"]').click();assert(await p.locator('html').evaluate(e=>e.classList.contains('ts3')));checks++;
  await p.screenshot({path:`/tmp/net-${lang}-settings.png`,fullPage:true});await p.reload();assert(await p.locator('html').evaluate(e=>e.classList.contains('ts3')));checks++;
  await c.close();
 }
 await b.close();assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,pageErrors:errors,languages:['he','ar','ru','en'],topics:7,questions:35}));
})().catch(e=>{console.error(e);process.exit(1)});
