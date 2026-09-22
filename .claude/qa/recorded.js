#!/usr/bin/env node
/* =====================================================================
   recorded.js — השכבה המוקלטת: המודול, החיווט, ובדפדפן גם הניגון

   המנוע של ״תאוריה מדברת״ הועתק 21.9.2026 בהוראת הבעלים (״תעתיק
   את המנוע, כבר שילמנו״). שלוש שאלות, וכל אחת נפלה לפני שעברה:

   1. **המודול** (`/speech/recorded.js`, ב-vm עם Audio ו-fetch מזויפים):
      המזהה זהה ל-`audioId` של הריפו הנפרד על שלוש מחרוזות (אחרת
      הקבצים שנוצרו שם ובכלים לא יימצאו); טקסט שבמניפסט מנוגן,
      טקסט שאינו — `play` מחזיר false בלי לגעת ב-Audio; כישלון
      ניגון מגיע ב-onError; `stop` משתיק.
   2. **החיווט** בארבע אפליקציות המאגר: תגית, PRE ב-sw.js,
      `play` בתוך `speak` לפני קול המכשיר,
      ו-`stop` בתוך `stopSpeak`.
   3. **`--browser`** (דורש שרת): english אמיתי, מניפסט מזויף שמכיל
      את המזהה של משפט אחד — `speak` של המשפט הזה מנגן קובץ ולא
      פונה ל-speechSynthesis; משפט אחר — ההפך.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
let bad = 0;
function t(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { console.log('✓ ' + name); return; }
  bad++; console.log('✗ ' + name + '\n    קיבלנו: ' + g + '\n    ציפינו: ' + w);
}

/* --- 1 · המודול -------------------------------------------------- */
function fresh(manifest, audioBehaviour) {
  const calls = { play: [], src: [] };
  const out = { fetched: 0 };
  class Audio {
    constructor() { this.onended = null; this.onerror = null; this.playbackRate = 1; }
    set src(v) { this._src = v; calls.src.push(v); }
    get src() { return this._src; }
    pause() {}
    play() {
      calls.play.push(this._src);
      const self = this;
      if (this._src.startsWith('data:')) return Promise.resolve();
      setTimeout(() => { if (audioBehaviour === 'fail') { if (self.onerror) self.onerror(); }
                         else if (self.onended) self.onended(); }, 5);
      return Promise.resolve();
    }
  }
  const ctx = { Audio, console, setTimeout, Math, String, Number, Object, Promise, Error,
    document: { addEventListener() {} },
    fetch: () => (out.fetched++, manifest) ? Promise.resolve({ ok: true, json: () => Promise.resolve(manifest) })
                          : Promise.resolve({ ok: false }) };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'speech', 'recorded.js'), 'utf8'), ctx);
  out.R = ctx.RECORDED; out.calls = calls;
  return out;
}

(async () => {
  const first = fresh(null);
  const { R } = first;
  t('המודול טוען את המניפסט בעצמו בטעינה (הוא נטען אחרי סקריפט האפליקציה)', first.fetched, 1);
  /* המזהים חושבו ב-audioId של index.html שבריפו הנפרד, 21.9.2026 */
  t('מזהה זהה לריפו הנפרד — משפט מהמאגר שם',
    R.id('ברחוב הרצל סומנו 4 מקומות חנייה רצופים לנכים.'), '5wdzeqbhh7');
  t('מזהה זהה — רווחים מתכווצים', R.id('  שלום   עולם '), '1rhcui67lby');
  t('מזהה זהה — אותו טקסט נקי', R.id('שלום עולם'), '1rhcui67lby');

  const TXT = 'שטח המשולש שווה למחצית מכפלת הבסיס בגובה.';
  const man = { langs: { he: { ids: [R.id(TXT)] } } };

  const a = fresh(man);
  await a.R.setup({ base: 'audio' });
  t('אחרי setup — יש קובץ למשפט שבמניפסט', a.R.has(TXT, 'he-IL'), true);
  t('ואין למשפט אחר', a.R.has('משפט אחר לגמרי בעברית', 'he'), false);
  t('play על משפט שאינו במניפסט מחזיר false בלי לגעת ב-Audio',
    [a.R.play('משפט אחר לגמרי בעברית', 'he', {}), a.calls.play.length], [false, 0]);
  let ended = false;
  const ok = a.R.play(TXT, 'he', { rate: 0.95, onEnd: () => { ended = true; } });
  await new Promise(r => setTimeout(r, 20));
  t('play על משפט שבמניפסט מנגן את הקובץ הנכון ומדווח סיום',
    [ok, a.calls.play[0], ended], [true, 'audio/he/' + R.id(TXT) + '.mp3', true]);

  const b = fresh(man, 'fail');
  await b.R.setup({ base: 'audio' });
  let failed = false;
  b.R.play(TXT, 'he', { onError: () => { failed = true; } });
  await new Promise(r => setTimeout(r, 20));
  t('קובץ שנכשל בניגון מדווח onError — והאפליקציה נופלת לקול המכשיר', failed, true);

  const c = fresh(null);
  await c.R.setup({ base: 'audio' });
  t('אין manifest.json — השכבה כבויה בשקט', c.R.play(TXT, 'he', {}), false);

  const d = fresh(man);
  await d.R.setup({ base: 'audio' });
  let late = false;
  d.R.play(TXT, 'he', { onEnd: () => { late = true; } });
  d.R.stop();
  await new Promise(r => setTimeout(r, 20));
  t('stop משתיק — onEnd של ניגון שנעצר אינו נורה', late, false);

  /* --- 2 · החיווט ------------------------------------------------ */
  /* המנוע נטען בכולן — ״כמנוע שממנו לוקחים בעתיד״ — ו-sw.js של תשע
     האפליקציות חייב להישאר זהה (engine.js). מנגן רק במי שיש לה
     מאגר קבוע. */
  const ALL = ['math-app','math-teen','math-uni','math-uni2','math-uni3','english',
               'history','ulpan','lomda','kotvim','reader','rakia','bagrut-806'];
  for (const app of ALL) {
    const html = fs.readFileSync(path.join(ROOT, app, 'index.html'), 'utf8');
    const sw = fs.readFileSync(path.join(ROOT, app, 'sw.js'), 'utf8');
    t(app + ' — תגית ו-PRE', [/<script src="\/speech\/recorded\.js">/.test(html), sw.indexOf('/speech/recorded.js') >= 0], [true, true]);
  }
  const APPS = ['english', 'history', 'ulpan', 'lomda'];
  for (const app of APPS) {
    const html = fs.readFileSync(path.join(ROOT, app, 'index.html'), 'utf8');
    const sw = fs.readFileSync(path.join(ROOT, app, 'sw.js'), 'utf8');
    const speakBody = (html.match(/function speak\(text,lang,rateMul\)\{[\s\S]*?\n\}/) || [''])[0];
    const stopBody = (html.match(/function stopSpeak\(\)\{[^\n]*/) || [''])[0];
    t(app + ' — play לפני קול המכשיר, stop', [
      speakBody.indexOf('RECORDED.play(') >= 0 && speakBody.indexOf('RECORDED.play(') < speakBody.indexOf('speakDevice('),
      stopBody.indexOf('RECORDED.stop()') >= 0
    ], [true, true]);
  }
  t('הקובץ המשותף קיים', fs.existsSync(path.join(ROOT, 'speech', 'recorded.js')), true);

  /* --- 3 · בדפדפן ------------------------------------------------ */
  if (process.argv.includes('--browser')) {
    const { chromium } = require('./pw.js');
    const BASE = 'http://127.0.0.1:8099';
    const LEGAL_VER = (fs.readFileSync(path.join(ROOT, 'legal', 'terms.js'), 'utf8').match(/version:\s*"([^"]+)"/) || [])[1];
    const browser = await chromium.launch();
    const page = await (await browser.newContext()).newPage();
    await page.addInitScript((ver) => {
      try { localStorage.setItem('legal-accepted-v' + ver, JSON.stringify({ v: ver, at: new Date().toISOString(), lang: 'he' })); } catch (e) {}
      window.__log = { audio: [], synth: [] };
      class U extends EventTarget { constructor(t) { super(); this.text = t; this.rate = 1; this.pitch = 1; this.volume = 1; } }
      const synth = { speaking: false, pending: false, paused: false, getVoices() { return [{ name: 'Google עברית', lang: 'he-IL', voiceURI: 'g', localService: true }]; },
        addEventListener() {}, removeEventListener() {}, cancel() {}, pause() {}, resume() {},
        speak(u) { window.__log.synth.push(u.text); setTimeout(() => { if (u.onend) u.onend({}); }, 10); } };
      Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
      window.SpeechSynthesisUtterance = U;
      /* אלמנט מזויף לגמרי: אלמנט אמיתי היה מנסה לטעון את ה-mp3 מהשרת,
         מקבל 404 ויורה onerror — וזו הנפילה לקול המכשיר, נכונה בייצור
         ומטעה כאן. הבדיקה שואלת מי נקרא, לא אם הקובץ קיים. */
      window.Audio = function () {
        const a = { playbackRate: 1, onended: null, onerror: null, _src: '' };
        Object.defineProperty(a, 'src', { get() { return a._src; }, set(v) { a._src = String(v); } });
        a.pause = function () {};
        a.play = function () { if (!a._src.startsWith('data:')) window.__log.audio.push(a._src); return Promise.resolve(); };
        return a;
      };
    }, LEGAL_VER);
    const TXT2 = 'זהו משפט שיש לו קובץ מוקלט.';
    const idOf = R.id(TXT2);
    await page.route('**/audio/manifest.json', r => r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ langs: { he: { ids: [idOf] } } }) }));
    await page.goto(BASE + '/english/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(900);
    const res = await page.evaluate(async (txt) => {
      speak(txt, 'he'); await new Promise(r => setTimeout(r, 200));
      const a1 = window.__log.audio.length, s1 = window.__log.synth.length;
      speak('משפט שאין לו שום קובץ.', 'he'); await new Promise(r => setTimeout(r, 200));
      return { a1, s1, a2: window.__log.audio.length, s2: window.__log.synth.filter(x => x).length, src: window.__log.audio[0] || '',
               synth: window.__log.synth.slice() };
    }, TXT2);
    t('english בדפדפן — משפט עם קובץ: Audio אחד, speechSynthesis אפס', [res.a1, res.s1, res.synth.slice(0, res.s1)], [1, 0, []]);
    t('english בדפדפן — הקובץ הנכון', res.src, 'audio/he/' + idOf + '.mp3');
    t('english בדפדפן — משפט בלי קובץ: קול המכשיר, בלי Audio נוסף', [res.a2, res.s2 >= 1], [1, true]);
    await browser.close();
  }

  console.log(bad ? '\n✗ השכבה המוקלטת: ' + bad + ' נכשלו' : '\n✓ השכבה המוקלטת — מודול, חיווט' + (process.argv.includes('--browser') ? ' וניגון בדפדפן' : ''));
  process.exit(bad ? 1 : 0);
})();
