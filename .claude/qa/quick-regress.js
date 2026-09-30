const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://127.0.0.1:8099/ulpan/');
  await p.waitForTimeout(900);
  const lg = await p.$('#lg-ok');
  if(lg){ await lg.click(); await p.waitForTimeout(300); }
  // open first track
  await p.click('[data-a="open"]');
  await p.waitForTimeout(600);
  const state = await p.evaluate(()=>{
    const q = s => document.querySelectorAll(s).length;
    return {
      build: document.body.textContent.match(/a1\d\d/)?.[0] || '',
      hear: q('[data-a="hear"]'), slow: q('[data-a="slow"]'),
      optspk: q('.optspk'), body: document.body.textContent.slice(0,0)
    };
  });
  console.log(JSON.stringify(state), 'pageerrors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(errs.length?1:0);
})();
