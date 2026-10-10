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
function fresh(manifest, audioBehaviour, opts) {
  opts = opts || {};
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
  const ctx = { Audio, console, setTimeout, Math, String, Number, Object, Promise, Error, URL,
    document: { addEventListener() {} },
    /* ‏`location` קיים בדפדפן ואינו קיים כאן — ולכן הוא נמסר במפורש.
       הקשר בלי `location` הוא מצב חוקי, והמודול חייב להישאר יחסי בו. */
    location: opts.pathname ? { pathname: opts.pathname } : undefined,
    fetch: () => (out.fetched++, manifest) ? Promise.resolve({ ok: true, json: () => Promise.resolve(manifest) })
                          : Promise.resolve({ ok: false }) };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  let src = fs.readFileSync(path.join(ROOT, 'speech', 'recorded.js'), 'utf8');
  /* הפיכת המתג בלי לגעת בקובץ: כך הבדיקה מודדת את המעבר עצמו ולא
     רק את המצב שלפניו. בלי זה הכלי היה ירוק על שורה שלא קרא —
     בדיוק O-210. */
  if (opts.host1 !== undefined) src = src.replace('var HOST_1 = "";', 'var HOST_1 = ' + JSON.stringify(opts.host1) + ';');
  if (opts.host2 !== undefined) src = src.replace('var HOST_2 = "";', 'var HOST_2 = ' + JSON.stringify(opts.host2) + ';');
  vm.runInContext(src, ctx);
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

  /* ===== מקור הקול — המעבר לריפואים נפרדים, 10.10.2026 =====
     ‏`clip` הוא המקום **היחיד** באתר שבונה כתובת של קליפ, ולכן זה
     המקום היחיד שצריך למדוד. שלוש שאלות: מקומי נשאר כפי שהיה, דלי 1
     ודלי 2 הולכים לריפו הנכון, והמאגר המשותף של לימור (`/tutor/audio`)
     הולך לפי מי שמחזיק את `tutor` ולא לפי האפליקציה שבה הלומד נמצא. */
  const H1 = 'https://lagstein1-png.github.io/bekol-audio';
  const H2 = 'https://lagstein1-png.github.io/bekol-audio2';
  const ID = R.id(TXT);

  const loc = fresh(man, null, { pathname: '/english/index.html' });
  t('מקור מקומי — הנתיב מוחלט לתיקיית האפליקציה, ואין מקור',
    loc.R.clip('audio', 'he', ID), '/english/audio/he/' + ID + '.mp3');

  const rem = fresh(man, null, { pathname: '/history/', host1: H1, host2: H2 });
  t('דלי 1 — history הולכת ל-bekol-audio',
    rem.R.clip('audio', 'he', ID), H1 + '/history/audio/he/' + ID + '.mp3');

  const rem2 = fresh(man, null, { pathname: '/civics/', host1: H1, host2: H2 });
  t('דלי 2 — civics הולכת ל-bekol-audio2',
    rem2.R.clip('audio', 'he', ID), H2 + '/civics/audio/he/' + ID + '.mp3');

  t('המאגר המשותף של לימור נקבע לפי tutor, לא לפי הדף שהלומד נמצא בו',
    rem.R.clip('/tutor/audio', 'he', ID), H2 + '/tutor/audio/he/' + ID + '.mp3');

  const nol = fresh(man, null, { host1: H1, host2: H2 });
  t('הקשר בלי location — יחסי, בלי מקור, ובלי לזרוק',
    nol.R.clip('audio', 'he', ID), 'audio/he/' + ID + '.mp3');

  const played = fresh(man, null, { pathname: '/history/', host1: H1, host2: H2 });
  await played.R.setup({ base: 'audio' });
  let pend = false;
  const pok = played.R.play(TXT, 'he', { onEnd: () => { pend = true; } });
  await new Promise(r => setTimeout(r, 20));
  t('ובניגון אמיתי — play מנגן את הכתובת המרוחקת ומדווח סיום',
    [pok, played.calls.play[0], pend], [true, H1 + '/history/audio/he/' + ID + '.mp3', true]);

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

  /* מאגר משותף — לימור (5.10.2026): מניפסט שני בתיקייה משלו, והניגון
     מאותה תיקייה. */
  const e2 = fresh(man);
  await e2.R.load('/tutor/audio/');
  t('load — יש קובץ במאגר המשותף, ואין למשפט אחר',
    [e2.R.has(TXT, 'he', '/tutor/audio'), e2.R.has('משפט אחר לגמרי בעברית', 'he', '/tutor/audio')], [true, false]);
  e2.R.play(TXT, 'he', { base: '/tutor/audio' });
  t('play עם base מנגן מהתיקייה המשותפת', e2.calls.play[e2.calls.play.length - 1],
    '/tutor/audio/he/' + R.id(TXT) + '.mp3');

  /* --- 2 · החיווט ------------------------------------------------ */
  /* המנוע נטען בכולן — ״כמנוע שממנו לוקחים בעתיד״ — ו-sw.js של תשע
     האפליקציות חייב להישאר זהה (engine.js). מנגן רק במי שיש לה
     מאגר קבוע. */
  const ALL = ['math-app','math-teen','math-uni','math-uni2','math-uni3','english',
               'history','ulpan','lomda','kotvim','reader','rakia','bagrut-806',
               /* 2.10.2026: חמש שחוטמו 30.9 בלי PRE (אופליין — בלי המודול), ושתיים בלי כלום */
               'civics','hebrew','literature','tanakh','hebrew-arab','biology','islam','russian','geography','motal'];
  for (const app of ALL) {
    const html = fs.readFileSync(path.join(ROOT, app, 'index.html'), 'utf8');
    const sw = fs.readFileSync(path.join(ROOT, app, 'sw.js'), 'utf8');
    t(app + ' — תגית ו-PRE', [/<script src="\/speech\/recorded\.js">/.test(html), sw.indexOf('/speech/recorded.js') >= 0], [true, true]);
  }
  /* כל מי שב-SOURCES של record.js (יש לה מאגר קבוע), ושתיים שהבעלים
     ביקש 2.10.2026 — אין להן מאגר קבוע עדיין, אבל speak מוכן לו */
  /* hebrew בנויה אחרת (app.js, speakParts) ומחווטת שם — מחוץ לבדיקת התבנית */
  const APPS = ['english', 'history', 'ulpan', 'lomda', 'civics', 'literature', 'tanakh', 'hebrew-arab', 'biology', 'islam', 'russian',
                'geography', 'motal'];
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
    /* **מוחלט ולא יחסי, מ-10.10.2026.** `clip` מחשב את תיקיית
       האפליקציה מ-`location.pathname` כדי שיוכל לתלות אותה על מקור
       אחר (ריפו הקול). בדפדפן שמריץ את `/english/` זה `/english/audio/…`,
       והדפדפן פותר את שתי הצורות לאותה כתובת — אבל רק המוחלטת
       ניתנת להעברה. זו הבדיקה שהוכיחה שזה אכן מה שיוצא. */
    t('english בדפדפן — הקובץ הנכון', res.src, '/english/audio/he/' + idOf + '.mp3');
    t('english בדפדפן — משפט בלי קובץ: קול המכשיר, בלי Audio נוסף', [res.a2, res.s2 >= 1], [1, true]);

    /* --- lomda: מה ש-record.js מקליט הוא מה שהלומד שומע (4.10.2026) ---
       נמדד בדפדפן: שאלה (רווח), כרטיס אחרי המענה, רמז ושורות הקטע
       הגיעו ל-0 הקלטות מתוך 42 שאלות — הם משפטים מורכבים בזמן ריצה
       (``כותרת. תיאור``, ``שאלה. כותרת · שנה``) ו-saySpell רץ לפני
       הגיבוב, בעוד record.js מקליט כל שדה לבד. כאן המניפסט הוא המאגר
       כולו (``record.js --ids lomda``), כאילו הכול הוקלט, וכל הקראה
       בעברית בכל מסלול חייבת להגיע ל-Audio ולא לקול המכשיר. */
    const ids = JSON.parse(require('child_process').execFileSync(process.execPath,
      [path.join(__dirname, 'record.js'), '--ids', 'lomda'], { maxBuffer: 1 << 26 }).toString());
    const lp = await (await browser.newContext()).newPage();
    await lp.addInitScript((ver) => {
      try { localStorage.setItem('legal-accepted-v' + ver, JSON.stringify({ v: ver, at: new Date().toISOString(), lang: 'he' })); } catch (e) {}
      window.__log = [];
      class U extends EventTarget { constructor(t) { super(); this.text = t; } }
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speaking: false, pending: false, paused: false,
        getVoices() { return [{ name: 'Google עברית', lang: 'he-IL', voiceURI: 'g', localService: true }]; },
        addEventListener() {}, removeEventListener() {}, cancel() {}, pause() {}, resume() {},
        speak(u) { if (u.text) window.__log.push({ p: window.__p, dev: u.text }); } } });
      window.SpeechSynthesisUtterance = U;
      /* onended מיידי: משפט שמנוגן כשרשרת של קטעים מוקלטים צריך את כולם */
      window.Audio = function () {
        const a = { playbackRate: 1, onended: null, onerror: null, _src: '' };
        Object.defineProperty(a, 'src', { get() { return a._src; }, set(v) { a._src = String(v); } });
        a.pause = function () {};
        a.play = function () { if (!a._src.startsWith('data:')) { window.__log.push({ p: window.__p, audio: a._src });
          const f = a.onended; if (f) Promise.resolve().then(f); } return Promise.resolve(); };
        return a;
      };
    }, LEGAL_VER);
    await lp.route('**/lomda/audio/manifest.json', r => r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ langs: { he: { ids } } }) }));
    await lp.goto(BASE + '/lomda/', { waitUntil: 'domcontentloaded' });
    await lp.waitForFunction(() => window.RECORDED && RECORDED._state.loaded && TOPICS.length);
    const lr = await lp.evaluate(async () => {
      const tick = () => Promise.resolve();   /* הרצף כולו במיקרו־משימות: setTimeout היה מוסיף 40 שניות */
      const agg = {}, miss = [];
      let nq = 0;
      state.lang = 'he'; state.settings = state.settings || {}; state.settings.tts = false;
      async function act(p, fn) {
        window.__p = p; const n0 = window.__log.length;
        fn(); for (let i = 0; i < 40; i++) await tick();
        const got = window.__log.slice(n0), a = agg[p] = agg[p] || { calls: 0, recorded: 0 };
        if (!got.length) return;
        a.calls++;
        const dev = got.filter(x => x.dev);
        if (!dev.length) a.recorded++; else if (miss.length < 8) miss.push(p + ': ' + dev[0].dev);
      }
      for (const tp of TOPICS) for (let lv = 1; lv <= 3; lv++) {
        state.topic = tp.id; state.level = lv; state.screen = 'prac'; view = ''; P.sum = false;
        newQuestion(); if (!P.q) continue; nq++;
        await act('שאלה (רווח)', () => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })));
        for (const b of document.querySelectorAll('.subject .spk[data-a="say"]:not([data-slow])')) await act('כותרת', () => b.click());
        for (const b of document.querySelectorAll('.orow .spk')) await act('אפשרות', () => b.click());
        for (const b of document.querySelectorAll('.passage .s')) await act('שורת קטע', () => b.click());
        for (const b of [...document.querySelectorAll('.qcard .spk[data-a="say"]:not([data-slow])')]
          .filter(b => !b.closest('.subject') && !b.closest('.orow'))) await act('קטע מלא', () => b.click());
        const hb = document.querySelector('[data-a="hint"]'); if (hb) await act('רמז', () => hb.click());
        P.done = true; P.ok = true; P.picked = 0; render();
        for (const b of document.querySelectorAll('.qcard .spk[data-a="say"]:not([data-slow])')) if (!b.closest('.orow') && !b.closest('.subject'))
          await act('אחרי המענה', () => b.click());
        await act('רווח אחרי המענה', () => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })));
      }
      return { agg, miss, nq };
    });
    console.log('  lomda: ' + lr.nq + ' שאלות · ' + Object.entries(lr.agg).map(([k, v]) => k + ' ' + v.recorded + '/' + v.calls).join(' · '));
    lr.miss.forEach(m => console.log('    לקול המכשיר — ' + m));
    t('lomda בדפדפן — כל מה שהמאגר מקליט מגיע ל-Audio בכל מסלול (שאלה, כותרת, אפשרות, קטע, רמז, אחרי המענה)',
      Object.values(lr.agg).reduce((s, v) => s + v.calls - v.recorded, 0), 0);
    await browser.close();
  }

  console.log(bad ? '\n✗ השכבה המוקלטת: ' + bad + ' נכשלו' : '\n✓ השכבה המוקלטת — מודול, חיווט' + (process.argv.includes('--browser') ? ' וניגון בדפדפן' : ''));
  process.exit(bad ? 1 : 0);
})();
