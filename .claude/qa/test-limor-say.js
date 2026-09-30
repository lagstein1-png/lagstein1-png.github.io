const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.addInitScript(()=>{
    const v = [{name:'Microsoft Hila - Hebrew (Israel)',lang:'he-IL',voiceURI:'uri-hila',localService:true,default:true}];
    if(!window.speechSynthesis){
      const t = new EventTarget();
      window.speechSynthesis = {speaking:false,pending:false,paused:false,
        getVoices(){return v},addEventListener:(...a)=>t.addEventListener(...a),
        dispatchEvent:(...a)=>t.dispatchEvent(...a),cancel(){},speak(){},pause(){},resume(){}};
    } else {
      speechSynthesis.getVoices = ()=>v;
    }
  });
  await p.goto('http://127.0.0.1:8099/ulpan/');
  await p.waitForTimeout(900);
  const lg = await p.$('#lg-ok'); if(lg){ await lg.click(); await p.waitForTimeout(200); }
  await p.click('[data-a="open"]');
  await p.waitForTimeout(500);
  // advance to a question if the track home has one more screen
  const opened = await p.evaluate(()=>{
    let btn = document.querySelector('[data-a="tutor"]');
    if(!btn){
      const start = document.querySelector('[data-a="start"],[data-a="go"],[data-a="begin"]');
      if(start) start.click();
    }
    return !!btn;
  });
  await p.waitForTimeout(500);
  const opened2 = await p.evaluate(()=>{
    const btn = document.querySelector('[data-a="tutor"]');
    if(btn){ btn.click(); return true; }
    return false;
  });
  console.log('tutor button present/clicked:', opened, opened2);
  await p.waitForTimeout(700);
  // ask a question through the composer
  const asked = await p.evaluate(()=>{
    const ta = document.querySelector('.tu-in textarea, .tu-in input, textarea[id^="tu"], .tu textarea');
    const send = document.querySelector('[data-tu="send"]');
    if(!ta || !send) return {ta:!!ta, send:!!send};
    ta.value = 'מה המשמעות של המילה סליחה?';
    ta.dispatchEvent(new Event('input',{bubbles:true}));
    send.click();
    return {ta:true, send:true};
  });
  console.log('asked:', JSON.stringify(asked));
  await p.waitForTimeout(2500);
  const res = await p.evaluate(()=>{
    const bots = document.querySelectorAll('.tu-bot').length;
    const say = document.querySelectorAll('[data-tu="say"]').length;
    const stop = document.querySelectorAll('[data-tu="stop"]').length;
    const rate = document.querySelectorAll('#tu-rate').length;
    const off = document.querySelectorAll('.tu-ctl.tu-sys').length;
    return {bots, say, stop, rate, off, ctlText: (document.querySelector('.tu-ctl')||{}).textContent || ''};
  });
  console.log(JSON.stringify(res,null,1));
  console.log('pageerrors:', errs.length? errs : 'none');
  await b.close();
})();
