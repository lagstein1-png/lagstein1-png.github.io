/* =====================================================================
   tutor-lang.js — השאלה שלימור מקבל כתובה בשפת המסך

   צילום הבעלים 23.9.2026: חלון ״Ask the teacher״ במסך אנגלי, ובראשו
   ״מצאו את שיפוע הישר העובר בנקודות״. `TUTOR.mount` ב-math-teen שלח
   את `x.ask` הגולמי — המסך תורגם, מה שהגיע ללימור לא.

   לכל אפליקציה מ-stages.json שיש בה `TUTOR.mount` ומחולל שאלות
   (`loadQ` במשפחת המתמטיקה, `buildQuestion` במשפחת החידון): ארבע
   רמות, כל נושא שלוש פעמים, באנגלית, בערבית וברוסית. `CFG.q().expr`
   נלכד בעטיפה של `TUTOR.mount` לפני שהדף נטען. אות עברית בו — כישלון.

   **מה שאינו נספר:** הנושא עצמו (`subject`, `lead`) — ב-ulpan המילה
   הנלמדת היא עברית, וזה התוכן ולא תקלה. נבדק הנוסח שסביבה.

   **ושתי מלכודות של המדידה עצמה, שנפלו עליי בכתיבה:** משפחת החידון
   שומרת את השפה ב-`state.lang` ומשפחת המתמטיקה ב-`state.settings.lang`
   — מדידה שקובעת רק אחת מהן מדווחת 100% עברית באפליקציה תקינה.

   הוכחת נפילה 23.9.2026, math-teen בקוד שלפני `_(x.ask)`:
     ✗ math-teen  en 96/96 · ar 96/96 · ru 96/96
   אחרי: ✓ math-teen  en 0/96 · ar 0/96 · ru 0/96

   **וביום שנכתבה היא תפסה עוד אחד:** ״Compute 50% מתוך 40״ — המילה
   העברית יושבת ב-`x.expr` ולא ב-`x.ask`, והמסך מתרגם אותה ב-`trHTML`.
   ✗ 3/96 בכל שפה, ואחרי `_(x.expr)` — 0/96.

   הרצה:  node .claude/qa/tutor-lang.js
   דורש:  node .claude/qa/serve.js
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('./pw.js');
const BASE = 'http://127.0.0.1:8099';
const ROOT = path.resolve(__dirname, '..', '..');
const REG = JSON.parse(fs.readFileSync(path.join(__dirname, 'stages.json'), 'utf8'));

const APPS = Object.keys(REG.apps).filter(a => {
  const f = path.join(ROOT, a, 'index.html');
  if (!fs.existsSync(f)) return false;
  const s = fs.readFileSync(f, 'utf8');
  return /TUTOR\.mount\(/.test(s) && /q:function/.test(s)
      && (/function loadQ\(/.test(s) || /function buildQuestion\(/.test(s));
});

(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const a of APPS) {
    const p = await b.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => {
      let T;
      Object.defineProperty(window, 'TUTOR', { configurable: true, get() { return T }, set(v) {
        T = v; const m = v.mount;
        v.mount = function (c) { window.__CFG = c; return m.apply(this, arguments) };
      } });
    });
    await p.goto(BASE + '/' + a + '/', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      const HE = /[א-ת]/, out = {};
      function around(q, x) {
        let e = (q && q.expr) || '';
        const sb = x && x.subject, parts = [x && x.lead];
        if (sb) parts.push(typeof sb === 'object' ? (sb.h || sb.t || sb.text || sb.w || '') : sb);
        parts.forEach(s => { if (s) e = e.split(TUTOR.plain ? TUTOR.plain(String(s)) : String(s)).join(' ') });
        return e;
      }
      const quiz = typeof buildQuestion === 'function';
      for (const lg of ['en', 'ar', 'ru']) {
        if (state.settings) state.settings.lang = lg;
        state.lang = lg;
        try { applyModes() } catch (e) {}
        let n = 0; const hits = [];
        const take = () => { const q = __CFG.q(); n++; const e = around(q, P.q); if (HE.test(e)) hits.push(e) };
        if (!quiz) { try { if (!P.list || !P.list.length) startRound() } catch (e) {} }
        for (const lv of [1, 2, 3, 4]) {
          if (quiz) {
            for (const t of TOPICS) for (let k = 0; k < 3; k++) {
              try { P.q = buildQuestion(t.id, lv) } catch (e) { continue }
              if (P.q) take();
            }
          } else {
            state.level = lv;
            for (let i = 0; i < (P.list || []).length; i++) for (let k = 0; k < 3; k++) {
              try { P.i = i; loadQ() } catch (e) { continue }
              if (P.q) take();
            }
          }
        }
        out[lg] = { n, bad: hits.length, ex: hits.slice(0, 3) };
      }
      return out;
    });
    const sum = Object.entries(r).map(([k, v]) => `${k} ${v.bad}/${v.n}`).join(' · ');
    const fail = Object.values(r).some(v => v.bad > 0 || v.n === 0);
    if (fail) bad++;
    console.log((fail ? '✗ ' : '✓ ') + a.padEnd(10) + ' ' + sum);
    if (fail) for (const [k, v] of Object.entries(r)) v.ex.forEach(e => console.log('    ' + k + ' ' + e.slice(0, 120)));
    if (errs.length) console.log('    שגיאות דף: ' + errs.slice(0, 2).join(' | '));
    await p.close();
  }
  await b.close();
  console.log(`\n${APPS.length} אפליקציות, ${bad} שבהן שאלה עברית מגיעה ללימור במסך בשפה אחרת`);
  process.exit(bad ? 1 : 0);
})();
