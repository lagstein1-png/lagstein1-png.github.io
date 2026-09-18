/* =====================================================================
   מקליט ההדגמות — סרטון לכל אפליקציה, מתוך מצב ההדגמה שלה עצמה.

   **מה זה עושה.** אחת־עשרה אפליקציות נושאות `?demo=1`: תסריט
   כתוב (`DEMO_SCRIPT` בתוך `index.html`) שלוחץ על הכפתורים
   האמיתיים ומציג כתובית לכל צעד. הקובץ הזה פותח כל אפליקציה
   בדפדפן חסר־ראש בגודל טלפון, מפעיל את ההדגמה, מקליט את המסך,
   וכותב:

     marketing/media/video/<app>.mp4    9:16, 1080×1920, כתוביות צרובות
     marketing/media/video/<app>.srt    אותן כתוביות כקובץ, לפי התזמון
     marketing/media/thumb/<app>.jpg    פריים מהסרטון, לתמונה מקדימה
     marketing/media/manifest.json      מה הוקלט, מתי, ומול איזה תסריט

   ועם `--shots` — צילומי מסך, לא סרטון: כל אפליקציה בארבע השפות
   ודף הבית בארבע השפות, `marketing/media/shots/<app>-<lang>.jpg`.
   זה הנכס ליום 12 בלוח התוכן (״אותה שאלה בארבע שפות — צילום מסך
   לכל אחת״) ולמכתבים למרכזי הקליטה. השפה נבחרת בשער התנאים —
   בדיוק המסלול שלומד עובר — ולא בעריכה. ואז מריצים את צעדי
   ההדגמה עד השאלה הראשונה, כדי שהצילום יראה שאלה ולא מסך פתיחה.
   **״אותה שאלה״ פירושו אותה שאלה:** `Math.random` מוחלף במחולל
   עם זרע קבוע, ולכן ארבע השפות מקבלות את אותה שאלה בדיוק — אחרת
   כל צילום היה מגריל שאלה משלו, והפוסט היה משקר.

   **מה זה אינו.** אין כאן קול. הדפדפן חסר־הראש אינו מנגן הקראה,
   ולכן מנוע הדיבור מוחלף במנוע מדומה שמדווח גבולות מילים — כך
   ההדגשה של המילה הנאמרת זזה על המסך כמו באמת, אבל הרצועה
   שקטה. הכלל הראשון ב-`video-scripts.md` הוא ״כתוביות תמיד, כי
   רוב הצפיות הן בלי קול״ — הסרטונים האלה עומדים בו מעצם בנייתם.
   קול אמיתי מוקלט מטלפון, ורק שם.

   **`--check`** — הכלל מ-`CLAUDE.md`: מחולל נולד עם `--check`.
   הסרטון נגזר מ-`DEMO_SCRIPT`, ולכן `manifest.json` שומר חתימה
   של התסריט כפי שהיה בהקלטה. שינוי בתסריט בלי הקלטה מחדש =
   כישלון, בדיוק כמו `fresh.js` על דוחות התוכן.

   הרצה:
     node marketing/media/record.js              כל האפליקציות
     node marketing/media/record.js reader ulpan  אפליקציות נבחרות
     node marketing/media/record.js --shots       צילומי מסך בארבע שפות
     node marketing/media/record.js --check       חתימות מול התסריטים, וקיום הצילומים

   דורש: playwright (כמו שאר בדיקות הדפדפן, דרך `.claude/qa/pw.js`)
   ו-ffmpeg עם libx264 — נתיב ב-`FFMPEG`, או `ffmpeg` ב-PATH. בלי
   ffmpeg נשמר ה-.webm של הדפדפן בלבד, ועל כך מדווח.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const net = require('net');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT  = __dirname;
const VID  = path.join(OUT, 'video');
const THUMB = path.join(OUT, 'thumb');
const SHOTS = path.join(OUT, 'shots');
const LANGS = ['he', 'ar', 'ru', 'en'];
/* מי מצטלם בארבע שפות: מה ש-DATA.APPS מסמן tLangs ויש לו תיקייה
   כאן — בלי ״כותבים ביחד״ (גרסת ניסיון, לפי facts.md) ובלי 806
   (עברית בלבד). נגזר מדף הבית ולא מרשימה קשיחה. */
function shotApps() {
  const line = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n')
    .find(l => l.startsWith('var DATA='));
  const apps = line ? JSON.parse(line.slice('var DATA='.length).replace(/;\s*$/, '')).APPS : [];
  return apps.filter(a => a.t && a.t.includes('tLangs') && a.id !== 'kotvim' && a.id !== 'theory'
    && fs.existsSync(path.join(ROOT, a.id, 'index.html'))).map(a => a.id);
}
const MANIFEST = path.join(OUT, 'manifest.json');
const PORT = Number(process.env.QA_PORT) || 8099;
const BASE = 'http://127.0.0.1:' + PORT;

/* גודל טלפון. `video-scripts.md` מדד 412×915; כאן 540×960 — אותו
   יחס 9:16, ופי שניים בפיקסלים לסרטון 1080×1920. */
const VIEW = { width: 540, height: 960 };
const SIZE = { width: 1080, height: 1920 };

/* ---- התסריט כפי שהוא בקובץ — החתימה נמדדת עליו ------------------ */
function scriptOf(app) {
  const f = path.join(ROOT, app, 'index.html');
  if (!fs.existsSync(f)) return null;
  const src = fs.readFileSync(f, 'utf8');
  const m = src.match(/var DEMO_SCRIPT=\[[\s\S]*?\n\];/);
  return m ? m[0] : null;
}
const sha = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);

function demoApps() {
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name)
    .filter(a => scriptOf(a))
    .sort();
}

function readManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch (e) { return { videos: {} }; }
}

/* ---- --check ------------------------------------------------------ */
function check() {
  const man = readManifest();
  let bad = 0;
  for (const app of demoApps()) {
    const have = man.videos[app];
    const now = sha(scriptOf(app));
    const mp4 = path.join(VID, app + '.mp4');
    if (!have) { console.log(`✗ ${app}: אין הקלטה ב-manifest — הרץ node marketing/media/record.js ${app}`); bad++; continue; }
    if (have.script !== now) { console.log(`✗ ${app}: DEMO_SCRIPT השתנה (${have.script} → ${now}) — הסרטון מיושן`); bad++; continue; }
    if (!fs.existsSync(mp4) && !fs.existsSync(path.join(VID, app + '.webm'))) {
      console.log(`✗ ${app}: הקובץ חסר — ${path.relative(ROOT, mp4)}`); bad++; continue;
    }
    if (!fs.existsSync(path.join(VID, app + '.srt'))) { console.log(`✗ ${app}: חסר .srt`); bad++; continue; }
    console.log(`✓ ${app} — ${have.seconds}s, ${have.steps} צעדים, תסריט ${now}`);
  }
  for (const app of Object.keys(man.videos)) {
    if (!scriptOf(app)) { console.log(`✗ ${app}: ב-manifest, ואין לו DEMO_SCRIPT`); bad++; }
  }
  /* צילומי המסך: קיום בלבד. התוכן שבהם אקראי מעצם בנייתו (השאלה
     נבחרת בזמן ריצה), ולכן אין להם חתימה — יש להם תאריך ב-manifest. */
  const want = shotApps().concat(['home']);
  let shots = 0;
  for (const app of want) for (const lg of LANGS) {
    const f = path.join(SHOTS, `${app}-${lg}.jpg`);
    if (!fs.existsSync(f)) { console.log(`✗ צילום חסר: ${path.relative(ROOT, f)} — הרץ node marketing/media/record.js --shots`); bad++; }
    else shots++;
  }
  console.log(`✓ ${shots} צילומי מסך, ${want.length} דפים × ${LANGS.length} שפות`);
  console.log(`\n${demoApps().length} אפליקציות עם הדגמה, ${bad} ממצאים`);
  process.exit(bad ? 1 : 0);
}

/* ---- מנוע דיבור מדומה — מדווח גבולות מילים כדי שההדגשה תזוז ------- */
const FAKE_TTS = `(() => {
  const V = [
    { name:'Google עברית', lang:'he-IL', voiceURI:'google-he', localService:true, default:true },
    { name:'Google العربية', lang:'ar-SA', voiceURI:'google-ar', localService:true, default:false },
    { name:'Google русский', lang:'ru-RU', voiceURI:'google-ru', localService:true, default:false },
    { name:'Google US English', lang:'en-US', voiceURI:'google-en', localService:true, default:false },
  ];
  class U extends EventTarget {
    constructor(t){ super(); this.text = t || ''; this.lang=''; this.rate=1; this.pitch=1; this.volume=1;
      this.voice=null; this.onend=null; this.onerror=null; this.onboundary=null; this.onstart=null; }
  }
  U.prototype.onboundary = null;
  let timers = [];
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const synth = {
    speaking:false, pending:false, paused:false, onvoiceschanged:null,
    getVoices(){ return V; },
    addEventListener(){}, removeEventListener(){},
    cancel(){ clear(); this.speaking = false; },
    pause(){ this.paused = true; }, resume(){ this.paused = false; },
    speak(u){
      clear(); this.speaking = true;
      const t = String(u.text);
      /* מילה = רצף שאינו רווח; הקצב: כ-150 מילים לדקה כפול rate */
      const step = Math.round(400 / (u.rate || 1));
      const words = []; const re = /\\S+/g; let m;
      while ((m = re.exec(t))) words.push({ at: m.index, len: m[0].length });
      timers.push(setTimeout(() => { if (u.onstart) u.onstart({}); }, 20));
      words.forEach((w, i) => timers.push(setTimeout(() => {
        const e = { name:'word', charIndex:w.at, charLength:w.len, utterance:u };
        if (u.onboundary) u.onboundary(e);
      }, 60 + i * step)));
      timers.push(setTimeout(() => { this.speaking = false; if (u.onend) u.onend({}); },
        60 + words.length * step + 250));
    }
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable:true });
  window.SpeechSynthesisUtterance = U;
})();`;

/* ---- כלים ---------------------------------------------------------- */
function portOpen(port) {
  return new Promise(res => {
    const s = net.connect(port, '127.0.0.1');
    s.once('connect', () => { s.destroy(); res(true); });
    s.once('error', () => res(false));
  });
}
function findFfmpeg() {
  const c = [process.env.FFMPEG, 'ffmpeg'].filter(Boolean);
  for (const f of c) {
    const r = spawnSync(f, ['-version'], { encoding: 'utf8' });
    if (r.status === 0) return f;
  }
  return null;
}
const stamp = ms => {
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')},${String(ms % 1000).padStart(3,'0')}`;
};
function srtOf(steps) {
  let t = 0; const out = [];
  steps.forEach((s, i) => {
    const d = Math.max(600, s.duration || 3000);
    out.push(`${i + 1}\n${stamp(t)} --> ${stamp(t + d)}\n${s.subtitle}\n`);
    t += d;
  });
  return out.join('\n');
}

/* ---- ההקלטה עצמה --------------------------------------------------- */
async function record(browser, app, ffmpeg, legalVer) {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'demo-'));
  const ctx = await browser.newContext({
    viewport: VIEW, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    locale: 'he-IL',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    recordVideo: { dir: tmp, size: SIZE },
  });
  const page = await ctx.newPage();
  await page.addInitScript(FAKE_TTS);
  await page.addInitScript((ver) => {
    try { localStorage.setItem('legal-accepted-v' + ver,
      JSON.stringify({ v: ver, at: new Date().toISOString(), lang: 'he' })); } catch (e) {}
  }, legalVer);
  /* רק השרת המקומי. גופני גוגל, דיקטה, ספירת הכניסות והמורה — לא.
     הסרטון מראה מה שהאפליקציה עושה לבד. */
  await page.route('**', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());

  const t0 = Date.now();
  await page.goto(`${BASE}/${app}/?demo=1`, { waitUntil: 'load' });
  await page.waitForSelector('#demo-start', { timeout: 15000 });
  const steps = await page.evaluate(() => DEMO_SCRIPT.map(s => ({ subtitle: s.subtitle || '', duration: s.duration || 3000 })));
  const total = steps.reduce((a, s) => a + Math.max(600, s.duration || 3000), 0);
  await page.waitForTimeout(800);
  const tStart = Date.now() - t0;
  await page.click('#demo-start');
  /* ההדגמה נגמרת כשהפס נעלם */
  await page.waitForFunction(() => document.getElementById('demo-bar') && document.getElementById('demo-bar').hidden,
    undefined, { timeout: total + 20000, polling: 250 });
  await page.waitForTimeout(600);
  /* כרטיס סיום — הכלל השלישי ב-video-scripts.md: ״את הקישור אומרים
     בסוף ומראים על המסך״. אף DEMO_SCRIPT אינו מציג את הכתובת
     (נמדד 18.9.2026: 0 מופעים ב-11 תסריטים), ולכן היא מוצגת כאן,
     מעל האפליקציה, שלוש שניות. */
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.setAttribute('dir', 'rtl');
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;' +
      'align-items:center;justify-content:center;gap:18px;background:#0b1220;color:#f4f7ff;' +
      'font:700 30px/1.35 system-ui,sans-serif;text-align:center;padding:40px';
    d.innerHTML = '<div style="font-size:26px;opacity:.85">חינם · בלי הרשמה · בלי פרסומות</div>' +
      '<div style="font-size:34px;direction:ltr;color:#ffd23f">lagstein1-png.github.io</div>' +
      '<div style="font-size:22px;opacity:.75">כל שאלה מוקראת · ארבע שפות · עובד גם בלי אינטרנט</div>';
    document.body.appendChild(d);
  });
  await page.waitForTimeout(3200);
  const tEnd = Date.now() - t0;
  const video = page.video();
  await ctx.close();
  const webm = await video.path();

  fs.mkdirSync(VID, { recursive: true }); fs.mkdirSync(THUMB, { recursive: true });
  fs.writeFileSync(path.join(VID, app + '.srt'), srtOf(steps));

  let out = path.join(VID, app + '.webm');
  let stretch = null;
  if (ffmpeg) {
    out = path.join(VID, app + '.mp4');
    /* חותכים את מה שלפני הלחיצה על ״הדגמה״ ואחרי הסיום, ומקודדים
       H.264 שכל רשת מקבלת. crf 26 על תוכן מסך — קטן וחד. */
    /* חותכים רק את ההתחלה. הפריימים מגיעים באיחור מול שעון הקיר
       (נמדד 18.9.2026: חיתוך לפי tEnd השאיר את reader על צעד 11
       מתוך 12 ובלי כרטיס הסיום), וההקלטה ממילא נסגרת מיד אחרי
       הכרטיס — הזנב שלה הוא הכרטיס. */
    /* ההקלטה ארוכה משעון הקיר — הפריימים מגיעים באיחור שמצטבר
       (נמדד 18.9.2026: reader 70.8s לתסריט של 58.8s + כרטיס). לכן
       הקצב מיושר: אורך ה-webm מול הזמן שנמדד בפועל, ו-setpts מכווץ
       אליו. כך צעד 2 מתחיל בשנייה 5.2 גם בסרטון, וה-.srt מתאים. */
    const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', webm], { encoding: 'utf8' });
    const dm = (probe.stderr || '').match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    const webmSec = dm ? (+dm[1]) * 3600 + (+dm[2]) * 60 + (+dm[3]) : 0;
    const wall = tEnd / 1000;
    /* לשני הכיוונים: math-app יצא קצר משעון הקיר (0.94), לא רק ארוך */
    const k = webmSec > 0 && wall > 0 ? Math.min(1.3, Math.max(0.8, wall / webmSec)) : 1;
    stretch = webmSec && wall ? +(webmSec / wall).toFixed(3) : null;
    const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', (tStart / 1000 * k).toFixed(2),
      '-i', webm,
      '-vf', `setpts=PTS*${k.toFixed(4)},fps=25,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '26',
      '-movflags', '+faststart', '-an', out], { encoding: 'utf8' });
    if (r.status !== 0) { console.log(`✗ ${app}: ffmpeg נכשל\n${r.stderr}`); out = null; }
    else {
      spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '6', '-i', out, '-frames:v', '1', '-q:v', '3',
        path.join(THUMB, app + '.jpg')]);
      /* יום 11 בלוח התוכן: ״מדביקים טקסט — והוא מדבר · GIF של 8
         שניות״. נחתך מהסרטון של המקריא, בשניות שבהן ההקראה רצה. */
      if (app === 'reader') {
        const gif = path.join(OUT, 'gif'); fs.mkdirSync(gif, { recursive: true });
        spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '22', '-t', '8', '-i', out,
          '-vf', 'fps=12,scale=360:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse',
          path.join(gif, 'reader-8s.gif')]);
      }
    }
  } else {
    fs.copyFileSync(webm, out);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  return { steps: steps.length, seconds: Math.round(total / 1000), script: sha(scriptOf(app)), stretch,
    file: out ? path.relative(ROOT, out) : null, bytes: out ? fs.statSync(out).size : 0,
    recorded: new Date().toISOString().slice(0, 10) };
}

/* ---- צילומי מסך בארבע שפות ---------------------------------------- */
const START = {
  he: ['התחלה', 'להתחיל', 'תרגול', 'המשך', 'קדימה'],
  ar: ['ابدأ', 'بدء', 'البدء', 'تدريب', 'متابعة', 'التمرين'],
  ru: ['Начать', 'Старт', 'Практика', 'Продолжить', 'Тренировка', 'Поехали'],
  en: ['Start', 'Begin', 'Practice', 'Continue', "Let's go"],
};
async function shoot(browser, app, lg) {
  const ctx = await browser.newContext({
    viewport: VIEW, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'he-IL',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
  });
  const page = await ctx.newPage();
  await page.addInitScript(FAKE_TTS);
  /* זרע קבוע — אותה שאלה בארבע השפות (mulberry32) */
  await page.addInitScript(() => {
    let a = 0x5EED2026;
    Math.random = function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  });
  await page.route('**', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
  await page.goto(app === 'home' ? `${BASE}/` : `${BASE}/${app}/?demo=1`, { waitUntil: 'load' });
  /* השפה נבחרת בשער התנאים, כמו אצל הלומד. אין שער — בסרגל הדף. */
  const strip = page.locator(`.lg-lgs button[data-lg="${lg}"]`).first();
  await strip.waitFor({ timeout: 6000 }).catch(() => {});
  if (await strip.count()) {
    await strip.click().catch(() => {});
    await page.waitForTimeout(300);
    const ok = page.locator('#lg-ok');
    if (await ok.count()) await ok.click().catch(() => {});
  } else if (app === 'home') {
    await page.click(`#lang [data-l="${lg}"]`).catch(() => {});
  }
  await page.waitForTimeout(500);
  if (app !== 'home') {
    /* עד השאלה הראשונה: צעדי ההדגמה שלפני צעד ההקראה, בלי להמתין
       את משך הכתובית — רק כדי שהלחיצה המושהית (430ms) תספיק. */
    const k = await page.evaluate(() => {
      if (typeof DEMO_SCRIPT === 'undefined' || typeof DEMO === 'undefined') return -1;
      const i = DEMO_SCRIPT.findIndex(s => /listen|read|say|speak|play|hear/i.test(String(s.action)));
      return i > 0 ? i : -1;
    });
    if (k > 0) {
      await page.evaluate(() => { DEMO.on = true; DEMO.i = 0; });
      for (let i = 0; i < k; i++) {
        await page.evaluate(i => { DEMO.i = i + 1; try { DEMO_SCRIPT[i].action(); } catch (e) {} }, i);
        await page.waitForTimeout(900);
      }
      await page.evaluate(() => { DEMO.on = false; document.querySelectorAll('.demo-tap').forEach(e => e.classList.remove('demo-tap')); });
      await page.waitForTimeout(600);
    } else {
      for (const t of START[lg]) {
        const b = page.locator(`button:has-text("${t}")`).first();
        if (await b.count() && await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); break; }
      }
      await page.waitForTimeout(900);
    }
    await page.evaluate(() => { const b = document.getElementById('demo-start'); if (b) b.hidden = true; });
  }
  fs.mkdirSync(SHOTS, { recursive: true });
  const f = path.join(SHOTS, `${app}-${lg}.jpg`);
  await page.screenshot({ path: f, type: 'jpeg', quality: 90 });
  await ctx.close();
  return f;
}

async function shots(browser) {
  const man = readManifest();
  man.shots = { date: new Date().toISOString().slice(0, 10), files: [] };
  let bad = 0;
  for (const app of shotApps().concat(['home'])) {
    const got = [];
    for (const lg of LANGS) {
      try { got.push(path.relative(ROOT, await shoot(browser, app, lg))); }
      catch (e) { console.log(`✗ ${app} ${lg}: ${e.message.split('\n')[0]}`); bad++; }
    }
    man.shots.files.push(...got);
    console.log(`✓ ${app} — ${got.length} שפות`);
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(man, null, 2) + '\n');
  return bad;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--check')) return check();
  const want = args.filter(a => !a.startsWith('-'));
  const apps = want.length ? want : demoApps();
  for (const a of apps) if (!scriptOf(a)) { console.log(`✗ ${a}: אין DEMO_SCRIPT`); process.exit(1); }

  const { chromium } = require(path.join(ROOT, '.claude', 'qa', 'pw.js'));
  const legalVer = (fs.readFileSync(path.join(ROOT, 'legal', 'terms.js'), 'utf8').match(/version:\s*"([^"]+)"/) || [])[1];
  if (!legalVer) { console.log('✗ לא נמצא version ב-legal/terms.js'); process.exit(1); }
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) console.log('! אין ffmpeg — נשמר .webm בלבד. FFMPEG=<נתיב> או ffmpeg ב-PATH לקבלת .mp4');

  let server = null;
  if (!(await portOpen(PORT))) {
    server = spawn(process.execPath, [path.join(ROOT, '.claude', 'qa', 'serve.js')], { cwd: ROOT, stdio: 'ignore' });
    for (let i = 0; i < 40 && !(await portOpen(PORT)); i++) await new Promise(r => setTimeout(r, 250));
  }
  /* בלי הדגל הזה ההקלטה נתפסת בפיקסלים של CSS (540×960) ומרופדת
     לתוך 1080×1920 במקום להתמלא — נמדד 18.9.2026 על reader. */
  const browser = await chromium.launch({ args: ['--force-device-scale-factor=2'] });
  if (args.includes('--shots')) {
    let bad = 1;
    try { bad = await shots(browser); } finally { await browser.close(); if (server) server.kill(); }
    console.log(`\n${bad} כישלונות`);
    process.exit(bad ? 1 : 0);
  }
  const man = readManifest();
  man.videos = man.videos || {};
  let bad = 0;
  try {
    for (const app of apps) {
      process.stdout.write(`… ${app}`);
      try {
        const r = await record(browser, app, ffmpeg, legalVer);
        if (!r.file) { bad++; continue; }
        man.videos[app] = r;
        console.log(`\r✓ ${app} — ${r.seconds}s, ${r.steps} צעדים, ${(r.bytes / 1048576).toFixed(1)} MB → ${r.file}`);
      } catch (e) { console.log(`\r✗ ${app}: ${e.message.split('\n')[0]}`); bad++; }
    }
  } finally {
    await browser.close();
    if (server) server.kill();
  }
  man.size = SIZE; man.note = 'רצועה שקטה — קול אמיתי מוקלט מטלפון. חתימת script היא sha256 של DEMO_SCRIPT בקובץ האפליקציה.';
  fs.writeFileSync(MANIFEST, JSON.stringify(man, null, 2) + '\n');
  console.log(`\n${apps.length} אפליקציות, ${bad} כישלונות`);
  process.exit(bad ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
