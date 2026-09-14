const { chromium } = require('playwright');
const CANDS = JSON.parse(process.argv[3]);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 860, height: 470 }, deviceScaleFactor: 2 });
  /* הדף הוא התמונה עצמה — אותו מקור, בלי סקריפטים ובלי מודאל */
  await p.goto('http://127.0.0.1:8099/img/tmp-bot-src.png', { waitUntil: 'load' });
  await p.evaluate(async (C) => {
    document.documentElement.innerHTML = '<body></body>';
    document.body.style.cssText =
      'margin:0;display:flex;gap:24px;align-items:center;justify-content:center;' +
      'height:470px;background:#f6f5f2;font:600 13px system-ui;color:#5b6670';
    const img = new Image();
    img.src = '/img/tmp-bot-src.png';
    await img.decode();
    for (const c of C) {
      const wrap = document.createElement('div');
      wrap.style.textAlign = 'center';
      for (const round of [false, true]) {
        const cv = document.createElement('canvas');
        cv.width = 200; cv.height = 300;
        cv.getContext('2d').drawImage(img, c.x, c.y, c.w, c.h, 0, 0, 200, 300);
        cv.style.cssText = 'display:block;width:124px;height:186px;margin:0 auto 8px;' +
          (round ? 'border-radius:50%;' : 'border-radius:6px;');
        wrap.appendChild(cv);
      }
      const cap = document.createElement('div');
      cap.textContent = c.n; wrap.appendChild(cap);
      document.body.appendChild(wrap);
    }
  }, CANDS);
  await p.waitForTimeout(300);
  await p.screenshot({ path: process.argv[2] });
  await b.close();
})();
