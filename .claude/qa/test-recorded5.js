const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  const fails = [];
  const ok = (n,c)=>{ console.log((c?'PASS':'FAIL')+' '+n); if(!c) fails.push(n); };

  for (const app of ['civics','literature','tanakh','hebrew-arab','hebrew']) {
    await p.goto('http://127.0.0.1:8099/'+app+'/');
    await p.waitForTimeout(700);
    const r = await p.evaluate(async ()=>{
      const out = {recorded: typeof RECORDED !== 'undefined'};
      if (out.recorded) {
        // wait for manifest fetch to settle, then probe a nonsense text (must be false)
        await new Promise(res=>setTimeout(res,300));
        out.playMissing = RECORDED.play('מחרוזת שלא קיימת בשום מאגר בעולם הזה בכלל','he',{});
        out.hasReal = typeof RECORDED.has === 'function';
      }
      // speak must not throw with no voices and no files
      try { if (typeof speak === 'function') speak('בדיקת קצרה של ניגון','he'); out.speakThrew = false; }
      catch(e){ out.speakThrew = String(e).slice(0,80); }
      try { if (typeof stopSpeak === 'function') stopSpeak(); } catch(e){}
      return out;
    });
    console.log(app, JSON.stringify(r));
    ok(app+': RECORDED loaded', r.recorded);
    ok(app+': play(missing) === false', r.playMissing === false);
    ok(app+': speak() did not throw', r.speakThrew === false);
  }
  console.log('pageerrors:', errs.length? errs : 'none');
  ok('no page errors', errs.length===0);
  await b.close();
  console.log(fails.length? 'FAILURES: '+fails.join(', ') : 'ALL PASS');
  process.exit(fails.length?1:0);
})();
