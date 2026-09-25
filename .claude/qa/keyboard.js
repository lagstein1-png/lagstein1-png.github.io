/* =====================================================================
   הפאנל של לימור כשהמקלדת פתוחה — 17.9.2026.

   הבעלים צילם באנדרואיד (כרום, שאלת נגזרת): כשהמקלדת נפתחת
   הכותרת, הדיוקן ובועת השאלה תופסים כמעט את כל מה שנשאר מהמסך,
   אזור השיחה מתכווץ לאפס, שורת ההצעות נחתכת, ו-``2x² + 4x``
   הוצג ״2x 2 + 4x״.

   **למה מזייפים את `visualViewport`.** אין מקלדת בדפדפן מונחה,
   ואין דרך לפתוח אחת. מה שכרום עושה כשהיא נפתחת — במצב ברירת
   המחדל שלו מאז גרסה 108, `interactive-widget=resizes-visual` —
   הוא להשאיר את `innerHeight` כפי שהוא ולכווץ את
   `window.visualViewport.height`, ולהזיז את `offsetTop` כך שהשדה
   הממוקד נראה. זה בדיוק מה שהזיוף כאן עושה, ולכן הבדיקה מודדת
   את מה ש-`tutor.js` באמת רואה, ולא מה שדפדפן מונחה מספק.

   מה נבדק, ברוחב 360 ו-412, בעברית (math-uni) ובערבית (bagrut-806
   דרך בורר השפה של הפאנל):

     · המקלדת ״נפתחת״ → `#tu-ov.tu-kb`, הפאנל יושב בדיוק בתוך
       החלון הנראה, אזור השיחה גבוה מ-80px, ושורת הקלט צמודה
       לתחתית החלון הנראה
     · הדיוקן 56px ולא 68, הכותרת בשורה אחת, ״סגירה״ הפך לאייקון
       עם `aria-label`
     · בועת השאלה בשורה אחת, ולחיצה מרחיבה אותה
     · שורת ההצעות גוללת אופקית — אף כפתור אינו נחתך אנכית,
       ואף כפתור בפאנל אינו חורג מגבולותיו
     · המקלדת ״נסגרת״ → הכול חוזר: אין `tu-kb`, הדיוקן 68
     · `TUTOR.plain` שומר חזקות: `2x<sup>2</sup>` → ``2x²``,
       והבועה עוטפת נוסחה ב-`<bdi dir="ltr">`
     · אופליין: math-uni נטענת מהמטמון אחרי שה-worker התקין

   ובלי דפדפן — ארבע בדיקות סטטיות על `tutor/tutor.js`:
   `enterkeyhint="send"`, `autocomplete="off"`, `dvh` בלי `100vh`,
   ו-`visualViewport`.

   מריצים:  node .claude/qa/serve.js &  ואז  node .claude/qa/keyboard.js
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('./pw.js');
const ROOT = path.resolve(__dirname, '..', '..');
const BASE = 'http://127.0.0.1:' + (process.env.QA_PORT || 8099);
const H = 740;                       /* גובה מסך טלפון */
const KB = 380;                      /* מה שנשאר ממנו כשהמקלדת פתוחה */

let bad = 0, n = 0;
function t(name, ok, extra) {
  n++;
  if (ok) { console.log('✓ ' + name); return }
  bad++; console.log('✗ ' + name + (extra ? '\n    ' + extra : ''));
}

/* ---------- סטטי ---------- */
const src = fs.readFileSync(path.join(ROOT, 'tutor', 'tutor.js'), 'utf8');
t('שדה הקלט: enterkeyhint="send"', /id="tu-in"[^>]*enterkeyhint="send"/.test(src));
t('שדה הקלט: autocomplete="off"', /id="tu-in"[^>]*autocomplete="off"/.test(src));
t('גובה הפאנל ב-dvh, ואין 100vh', /\d+dvh/.test(src) && !/100vh/.test(src));
t('המקלדת מזוהה דרך visualViewport', /visualViewport/.test(src));

/* ---------- זיוף המקלדת ---------- */
const FAKE_VV = `(function(){
  var ls = [], st = { h: null, top: 0 };
  var fake = {
    addEventListener: function(ev, f){ ls.push(f) },
    removeEventListener: function(){},
    get height(){ return st.h == null ? window.innerHeight : st.h },
    get width(){ return window.innerWidth },
    get offsetTop(){ return st.top },
    get offsetLeft(){ return 0 },
    get pageTop(){ return st.top },
    get scale(){ return 1 }
  };
  window.__kb = function(h){
    st.h = h; st.top = h == null ? 0 : window.innerHeight - h;
    ls.forEach(function(f){ try{ f({ type: 'resize' }) }catch(e){} });
  };
  Object.defineProperty(window, 'visualViewport', { get: function(){ return fake }, configurable: true });
})();`;

async function click(p, s) { try { await p.click(s, { timeout: 1500 }); await p.waitForTimeout(150); return true } catch (e) { return false } }

const rect = (p, sel) => p.evaluate(s => {
  const el = document.querySelector(s); if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, w: r.width, h: r.height };
}, sel);

async function scenario(b, app, width, lang) {
  const tag = `${app} ${width}px ${lang}`;
  const ctx = await b.newContext({ locale: lang === 'ar' ? 'ar' : 'he-IL',
    viewport: { width, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    serviceWorkers: app === 'math-uni' ? 'allow' : 'block' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(FAKE_VV);
  await page.route('**/*', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
  let qs = '';
  try {
    const km = fs.readFileSync(path.join(ROOT, app, 'index.html'), 'utf8').match(/var INTERNAL_KEY="([^"]+)"/);
    if (km) qs = '?internal=' + encodeURIComponent(km[1]);
  } catch (e) {}
  await page.goto(BASE + '/' + app + '/' + qs, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(700);
  await page.addStyleTag({ content: '#tts-fail{display:none !important}' });
  await click(page, '#lg-ok');
  for (let i = 0; i < 8; i++) {
    if (await page.$('[data-a="selpet"]')) await click(page, '[data-a="selpet"]');
    if (await page.$('[data-a="startpet"]')) { await click(page, '[data-a="startpet"]'); continue }
    if (await page.$('[data-a="obnext"]')) { await click(page, '[data-a="obnext"]'); continue }
    break;
  }
  /* למסך שאלה. ב-math-uni — נגזרות בכוונה, שם יש <sup>. */
  if (app === 'math-uni') {
    const ok = await page.evaluate(() => { try { state.level = 1; startRound('deriv'); view = 'practice'; render(); return true } catch (e) { return false } });
    if (!ok) for (const s of ['[data-a="topic"]', '[data-a="lvl"]', '[data-a="start"]']) await click(page, s);
  } else {
    for (const s of ['[data-topic]', '[data-exam]', '[data-go="practice"]']) await click(page, s);
  }
  await page.waitForTimeout(300);
  await page.evaluate(() => { try { TUTOR._clear(); TUTOR.open() } catch (e) {} });
  await page.waitForTimeout(200);
  if (lang === 'ar') {
    try { await page.selectOption('#tu-lg', 'ar'); await page.waitForTimeout(200) } catch (e) {}
    t(`${tag}: הפאנל בערבית ו-RTL`, await page.evaluate(() => { const b = document.getElementById('tu-bx'); return b.getAttribute('lang') === 'ar' && b.getAttribute('dir') === 'rtl' }));
  }
  t(`${tag}: הפאנל פתוח`, await page.evaluate(() => document.getElementById('tu-ov').classList.contains('on')));

  /* הודעה עם שלוש הצעות — כמו שהשרת מחזיר. המוח המקומי אינו
     מציע, ולכן ההודעה נדחפת ישירות. */
  await page.evaluate(() => {
    TUTOR._state().msgs.push({ role: 'assistant',
      text: 'נסו כך.[[?]]\nתן לי רמז ראשון בבקשה\nהסבר לי את השאלה שוב מההתחלה\nאיך מתחילים לפתור את זה' });
    TUTOR.open();
  });
  await page.focus('#tu-in');

  /* ---- המקלדת נפתחת ---- */
  await page.evaluate(h => window.__kb(h), KB);
  await page.waitForTimeout(250);
  const ov = await rect(page, '#tu-ov'), bx = await rect(page, '#tu-bx');
  t(`${tag}: מצב קומפקטי (#tu-ov.tu-kb)`, await page.evaluate(() => document.getElementById('tu-ov').classList.contains('tu-kb')));
  t(`${tag}: הפאנל בתוך החלון הנראה (top ${H - KB}, height ${KB})`,
    ov && Math.abs(ov.top - (H - KB)) <= 1 && Math.abs(ov.h - KB) <= 1 && bx.top >= ov.top - 1 && bx.bottom <= ov.bottom + 1,
    JSON.stringify({ ov, bx }));
  const log = await rect(page, '#tu-log');
  t(`${tag}: אזור השיחה נראה (גובה ≥ 80px)`, log && log.h >= 80, log && ('log.h=' + log.h));
  const inp = await rect(page, '#tu-in');
  t(`${tag}: שורת הקלט צמודה מעל המקלדת`, inp && inp.bottom <= H + 1 && inp.bottom >= H - 90, inp && ('inp.bottom=' + inp.bottom));
  const face = await rect(page, '#tu-face .jf');
  const faceBox = await rect(page, '#tu-face');
  t(`${tag}: הדיוקן 56px`, face && Math.abs(face.w - 56) <= 2 && faceBox && faceBox.h <= 60, JSON.stringify({ face, faceBox }));
  t(`${tag}: הדיוקן ממשיך לנשום (יש data-state ושכבות תנועה)`,
    await page.evaluate(() => { const j = document.querySelector('#tu-face .jf'); return !!j && !!j.getAttribute('data-state') && !!j.querySelector('.jf__plid,.jf__eye') }));
  const hd = await rect(page, '#tu-hd');
  t(`${tag}: הכותרת שורה אחת (≤ 72px)`, hd && hd.h <= 72, hd && ('hd.h=' + hd.h));
  t(`${tag}: ״סגירה״ הפך לאייקון עם aria-label`,
    await page.evaluate(() => { const x = document.getElementById('tu-x'); return x.textContent.trim().length <= 1 && !!x.getAttribute('aria-label') }));
  /* בועת השאלה */
  const qv = await page.evaluate(() => { const q = document.getElementById('tu-q'); return q && !q.hidden });
  if (qv) {
    const q1 = await rect(page, '#tu-q');
    t(`${tag}: בועת השאלה בשורה אחת (≤ 40px)`, q1 && q1.h <= 40, q1 && ('q.h=' + q1.h));
    await click(page, '#tu-q');
    const ex = await page.evaluate(() => document.getElementById('tu-q').classList.contains('tu-qx'));
    t(`${tag}: לחיצה על הבועה מרחיבה אותה`, ex);
    await click(page, '#tu-q');
  } else t(`${tag}: אין בועת שאלה על המסך — בדיקת השורה האחת דולגה`, true);
  /* ההצעות: שורה גוללת, בלי חיתוך */
  const sg = await page.evaluate(() => {
    const s = document.querySelector('.tu-sg'); if (!s) return null;
    const cs = getComputedStyle(s), sr = s.getBoundingClientRect();
    const lg = document.getElementById('tu-log').getBoundingClientRect();
    const btns = [...s.querySelectorAll('button')].map(b => b.getBoundingClientRect());
    return { ox: cs.overflowX, wrap: cs.flexWrap, n: btns.length,
      cut: btns.some(r => r.top < lg.top - 1 || r.bottom > lg.bottom + 1),
      scroll: s.scrollWidth > s.clientWidth };
  });
  t(`${tag}: שורת ההצעות קיימת`, !!sg && sg.n === 3, JSON.stringify(sg));
  t(`${tag}: שורת ההצעות גוללת אופקית ואינה נחתכת`, !!sg && sg.ox === 'auto' && sg.wrap === 'nowrap' && !sg.cut, JSON.stringify(sg));
  /* אף כפתור בפאנל אינו חורג מגבולותיו (ההצעות גוללות, ולכן נמדדות למעלה) */
  const over = await page.evaluate(() => {
    const B = document.getElementById('tu-bx').getBoundingClientRect(), out = [];
    document.querySelectorAll('#tu-bx button:not(.tu-sg button), #tu-bx input, #tu-bx select').forEach(el => {
      if (el.hidden || el.offsetParent === null) return;
      const r = el.getBoundingClientRect();
      if (r.left < B.left - 1 || r.right > B.right + 1 || r.top < B.top - 1 || r.bottom > B.bottom + 1)
        out.push((el.id || el.className || el.tagName) + ' ' + JSON.stringify([r.left | 0, r.top | 0, r.right | 0, r.bottom | 0]));
    });
    return out;
  });
  t(`${tag}: אף כפתור אינו חורג מהפאנל`, over.length === 0, over.join(' · '));

  /* ---- המקלדת נסגרת ---- */
  await page.evaluate(() => window.__kb(null));
  await page.waitForTimeout(250);
  const face2 = await rect(page, '#tu-face .jf');
  t(`${tag}: אחרי סגירת המקלדת — חזרה לגודל המלא`,
    await page.evaluate(() => { const o = document.getElementById('tu-ov'); return !o.classList.contains('tu-kb') && !o.style.height })
    && face2 && Math.abs(face2.w - 68) <= 2, face2 && ('face.w=' + face2.w));
  t(`${tag}: אין שגיאות JS`, errs.length === 0, errs.join(' | '));
  /* ---- תשובה ארוכה: ראש התשובה נראה, ולא רק סופה (18.9.2026) ----
     הבעלים צילם ב-lomda תשובה של ארבע שורות שממנה נראתה השורה
     האחרונה בלבד, ומתחתיה כפתורי ההקראה: הפאנל גלל תמיד לתחתית.
     נמדד ב-390×844 לפני התיקון: אזור השיחה 141px, הבועה 323px,
     נראו 50px. הבדיקה דוחפת תשובה גבוהה מאזור השיחה ומודדת שראש
     הבועה בתוכו; ואחרי הודעה של הילד — שההודעה שלו נראית בתחתית. */
  const long = await page.evaluate(() => {
    const st = TUTOR._state();
    st.msgs.push({ role: 'user', text: 'מה פירוש המושג?' });
    st.msgs.push({ role: 'assistant', text: 'משפט ראשון של תשובה ארוכה שממשיכה עוד ועוד. '.repeat(14) });
    TUTOR.open();
    const log = document.getElementById('tu-log'), bots = log.querySelectorAll('.tu-bot'), last = bots[bots.length - 1];
    const L = log.getBoundingClientRect(), B = last.getBoundingClientRect();
    return { logH: Math.round(L.height), bubH: Math.round(B.height), top: Math.round(B.top - L.top),
      topIn: B.top >= L.top - 1 && B.top < L.bottom };
  });
  t(`${tag}: התשובה גבוהה מאזור השיחה (אחרת אין מה לבדוק)`, long.bubH > long.logH, JSON.stringify(long));
  t(`${tag}: ראש התשובה של לימור נראה, ולא רק סופה`, long.topIn, JSON.stringify(long));
  const mine = await page.evaluate(() => {
    const st = TUTOR._state(); st.msgs.push({ role: 'user', text: 'ומה עכשיו?' }); TUTOR.open();
    const log = document.getElementById('tu-log'), me = [...log.querySelectorAll('.tu-me')].pop();
    const L = log.getBoundingClientRect(), M = me.getBoundingClientRect();
    return { ok: M.bottom <= L.bottom + 1 && M.top >= L.top - 1, top: Math.round(M.top - L.top), bottom: Math.round(L.bottom - M.bottom) };
  });
  t(`${tag}: אחרי שהילד שולח — ההודעה שלו נראית בתחתית`, mine.ok, JSON.stringify(mine));

  /* ---- חזקות ו-bdi (פעם אחת, בעברית) ---- */
  if (app === 'math-uni' && width === 360) {
    t('TUTOR.plain: 2x<sup>2</sup> + 4x → 2x² + 4x',
      await page.evaluate(() => typeof TUTOR.plain === 'function' && TUTOR.plain('2x<sup>2</sup> + 4x') === '2x² + 4x'));
    t('TUTOR.plain: חזקה שאינה ניתנת לכתב עילי → ^(…)',
      await page.evaluate(() => typeof TUTOR.plain === 'function' && TUTOR.plain('e<sup>2y+q</sup>') === 'e^(2y+q)'));
    t('TUTOR.plain: תגית אחרת נמחקת ורווחים מתכווצים',
      await page.evaluate(() => typeof TUTOR.plain === 'function' && TUTOR.plain('<b>f(x)</b>  =  <i>3</i>') === 'f(x) = 3'));
    /* שאלה שיש בה <sup> — נגזרת של פולינום. מגרילים עד שמגיעים לאחת. */
    const hasSup = await page.evaluate(() => {
      try {
        for (let k = 0; k < 60 && !/<sup>\d/.test(String(P.q.ask) + String(P.q.expr)); k++) loadQ();
        render(); TUTOR.open();
        return /<sup>\d/.test(String(P.q.ask) + String(P.q.expr));
      } catch (e) { return false }
    });
    t('נמצאה שאלה עם <sup> בנגזרות', hasSup);
    await page.waitForTimeout(150);
    const bd = await page.evaluate(() => {
      const q = document.getElementById('tu-q'); if (!q || q.hidden) return 'nobubble';
      const bdi = q.querySelector('bdi[dir="ltr"]');
      return { has: !!bdi, sup: /[²³⁰-⁹]/.test(q.textContent), txt: q.textContent.slice(0, 80) };
    });
    t('הבועה עוטפת את הנוסחה ב-<bdi dir="ltr">', bd && bd.has, JSON.stringify(bd));
    t('הבועה מציגה את החזקה ולא ״2x 2״', bd && bd.sup, JSON.stringify(bd));
    /* ---- אופליין ---- */
    let swOk = false;
    try { swOk = await page.evaluate(() => navigator.serviceWorker.ready.then(() => true)); } catch (e) {}
    await page.waitForTimeout(1500);
    await ctx.setOffline(true);
    let off = false;
    try {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(600);
      off = await page.evaluate(() => typeof TUTOR !== 'undefined' && !!document.getElementById('app') && document.body.innerText.trim().length > 0);
    } catch (e) {}
    t('אופליין: math-uni נטענת מהמטמון, ו-tutor.js איתה', swOk && off);
    await ctx.setOffline(false);
  }
  await ctx.close();
}

(async () => {
  const b = await chromium.launch();
  try {
    for (const width of [360, 412]) {
      await scenario(b, 'math-uni', width, 'he');
      await scenario(b, 'bagrut-806', width, 'ar');
    }
  } catch (e) { bad++; console.log('✗ הבדיקה נפלה: ' + (e && e.stack || e)); }
  await b.close();
  console.log(`\n${n} בדיקות, ${bad} ממצאים`);
  process.exit(bad ? 1 : 0);
})();
