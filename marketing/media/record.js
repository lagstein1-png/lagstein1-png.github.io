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

   **מוזיקת רקע** — `audio.js`, מסונתזת כאן, נכנסת לכל mp4 בסוף
   ההקלטה (הכרעת הבעלים 18.9.2026, שהחליפה את ״בלי מוזיקה״).

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

   ועם `--flow teacher` — תסריט 3 של `video-scripts.md` (מצב מורה),
   שאף DEMO_SCRIPT אינו מכסה: המקליט עצמו לוחץ על המסלול האמיתי
   ב-math-teen — הגדרות, קוד מורה, בונה המבחן, התלמיד פותר, הקוד
   נקלט במסך הציונים — והכתוביות הן שורות הטבלה של התסריט,
   מ-`video-scripts.md`, אותן שורות שמהן נוצר `srt/script-3.srt`.

   הרצה:
     node marketing/media/record.js              כל האפליקציות
     node marketing/media/record.js --flow teacher  תסריט 3 — מצב מורה (וגם reader · shlav · langs)
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
const { addMusic } = require('./audio.js');

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

/* רק אפליקציה ב-public. אפליקציה שעוד מאחורי השער הפנימי יורשת את
   DEMO_SCRIPT מהאפליקציה שממנה הועתקה, אבל סרטון שיווקי שלה מקדים
   את האישור — electric, 24.9.2026. */
function isPublic(a) {
  try {
    const st = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude', 'qa', 'stages.json'), 'utf8')).apps[a];
    return !st || st.stage === 'public';
  } catch (e) { return true; }
}
function demoApps() {
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name)
    .filter(a => scriptOf(a) && isPublic(a))
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
  for (const name of Object.keys(FLOWS)) {
    const have = (man.flows || {})[name], f = FLOWS[name];
    if (!have) { console.log(`✗ תסריט ${f.script} (${name}): אין הקלטה — הרץ node marketing/media/record.js --flow ${name}`); bad++; continue; }
    if (have.sig !== flowSig(f)) { console.log(`✗ תסריט ${f.script} (${name}): הטבלה או המסלול השתנו — הסרטון מיושן`); bad++; continue; }
    if (!fs.existsSync(path.join(ROOT, have.file || ''))) { console.log(`✗ תסריט ${f.script}: הקובץ חסר — ${have.file}`); bad++; continue; }
    console.log(`✓ תסריט ${f.script} (${name}) — ${have.seconds}s, ${have.steps} שורות, ${f.app}`);
  }
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
      '<div style="font-size:34px;direction:ltr;color:#ffd23f">bekol.co.il</div>' +
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
      /* מוזיקת רקע — הכרעת הבעלים 18.9.2026 (audio.js) */
      const m = addMusic(ffmpeg, out); if (!m.ok) console.log(`! ${app}: בלי מוזיקה — ${String(m.err).split('\n')[0]}`);
    }
  } else {
    fs.copyFileSync(webm, out);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  return { steps: steps.length, seconds: Math.round(total / 1000), script: sha(scriptOf(app)), stretch,
    file: out ? path.relative(ROOT, out) : null, bytes: out ? fs.statSync(out).size : 0,
    recorded: new Date().toISOString().slice(0, 10) };
}

/* ---- תסריטים ידניים — מה שאין ב-DEMO_SCRIPT ------------------------- */
/* שורות הטבלה של תסריט N ב-video-scripts.md, כמו make-srt.js קורא אותן */
function scriptRows(n) {
  const doc = fs.readFileSync(path.join(ROOT, 'marketing', 'video-scripts.md'), 'utf8');
  const m = doc.match(new RegExp('^## תסריט ' + n + '[^\\n]*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))', 'm'));
  if (!m) return [];
  return [...m[1].matchAll(/^\| *(\d+)[–-](\d+) *\|([^|]*)\|([^|]*)\|/gm)]
    .map(r => ({ a: +r[1], b: +r[2], seen: r[3].trim(), text: r[4].trim() }));
}
const SUB_CSS = 'position:fixed;z-index:2147481000;inset-inline:0;bottom:0;display:flex;justify-content:center;' +
  'padding:0 10px 12px;pointer-events:none';
async function sub(page, text, i, n) {
  await page.evaluate(([text, i, n, css]) => {
    let bar = document.getElementById('rec-sub');
    if (!bar) {
      bar = document.createElement('div'); bar.id = 'rec-sub'; bar.setAttribute('dir', 'rtl'); bar.style.cssText = css;
      bar.innerHTML = '<div style="max-width:46rem;width:100%;background:rgba(9,13,22,.93);color:#f4f7ff;border-radius:14px;' +
        'box-shadow:0 8px 30px rgba(0,0,0,.35);font:600 clamp(1rem,2.6vw,1.22rem)/1.45 system-ui,sans-serif;overflow:hidden">' +
        '<p id="rec-txt" style="margin:0;padding:14px 18px 10px;text-align:center"></p>' +
        '<div id="rec-step" style="padding:0 18px 8px;font-size:.78rem;opacity:.7;text-align:left;direction:ltr"></div>' +
        '<div style="height:3px;background:rgba(255,255,255,.12)"><i id="rec-fill" style="display:block;height:100%;width:0;background:#ffd23f"></i></div></div>';
      document.body.appendChild(bar);
    }
    document.getElementById('rec-txt').textContent = text;
    document.getElementById('rec-step').textContent = i + ' / ' + n;
    const f = document.getElementById('rec-fill'); f.style.transition = 'none'; f.style.width = '0'; void f.offsetWidth;
  }, [text, i, n, SUB_CSS]);
}
async function fill(page, sel, text) { await page.click(sel); await page.type(sel, text, { delay: 90 }); }
async function tap(page, sel) {
  const e = page.locator(sel).first();
  await e.waitFor({ timeout: 8000 });
  await e.scrollIntoViewIfNeeded().catch(() => {});
  await e.evaluate(el => { el.style.outline = '3px solid #ffd23f'; el.style.outlineOffset = '3px'; });
  await page.waitForTimeout(450);
  await e.click();
  await page.waitForTimeout(250);
}

const FLOWS = {
  /* תסריט 3 — מצב מורה, ב-math-teen (שבוע 3 בלוח: קבוצת מורי מתמטיקה) */
  teacher: { app: 'math-teen', script: 3, file: 'teacher-math-teen', tail: 'מצב מורה בתשע אפליקציות · בלי חשבון לתלמיד', steps: [
    async (page) => {                               /* בכל אפליקציה יש מצב מורה */
      /* פתיחה ראשונה = שלושה מסכי היכרות, כמו אצל הלומד */
      for (let k = 0; k < 3 && await page.locator('[data-a="obnext"]').count(); k++) await tap(page, '[data-a="obnext"]');
      await tap(page, '[data-a="go"][data-v="settings"]');
      await page.locator('[data-a="teask"]').first().scrollIntoViewIfNeeded();
    },
    async (page) => {                               /* מאחורי קוד */
      await tap(page, '[data-a="teask"]');
      await fill(page, '#te-pin', '2468');
      await fill(page, '#te-pin2', '2468');
      await tap(page, '#te-ok');
      await page.waitForTimeout(600);
      await tap(page, '[data-a="go"][data-v="marks"]');
      await tap(page, '[data-a="go"][data-v="exam"]');
    },
    async (page) => {                               /* בונים מבחן */
      const tops = page.locator('[data-a="extopic"]');
      await tap(page, '[data-a="extopic"] >> nth=0');
      if (await tops.count() > 1) await tap(page, '[data-a="extopic"] >> nth=1');
      await tap(page, '[data-a="exlvl"][data-l="2"]');
      /* הכותרת אחרונה: כל לחיצה מציירת את המסך מחדש מתוך EB, והשדה
         נקרא רק בבנייה — כותרת שהוקלדה לפני הנושאים נמחקה. */
      await fill(page, '#exTitle', 'מבחן אלגברה — ט׳2');
      await tap(page, '[data-a="exbuild"]');
      await page.waitForSelector('[data-a="excopy"]', { timeout: 8000 });
      await page.locator('[data-a="excopy"]').scrollIntoViewIfNeeded();
    },
    async (page, st) => {                           /* התלמיד פותר במכשיר */
      st.url = await page.getAttribute('[data-a="excopy"]', 'data-v');
      await page.goto(st.url, { waitUntil: 'load' });
      await sub(page, st.text, st.i, st.n);
      await fill(page, '#sitName', 'נועה לוי');
      await tap(page, '[data-a="sitstart"]');
      /* שתי נכונות ואחת שגויה — ציון שנראה כמו של תלמיד, לא 0 ולא 100 */
      for (let k = 0; k < 3; k++) {
        const okIdx = await page.evaluate(() => { const q = SIT.qs[SIT.i]; return q ? q.options.findIndex(o => o.ok) : 0; });
        const pick = k < 2 ? okIdx : (okIdx + 1) % 4;
        await tap(page, '[data-a="sitans"] >> nth=' + Math.max(0, pick));
        if (await page.locator('[data-a="sitfwd"]').count()) await tap(page, '[data-a="sitfwd"]');
      }
      if (await page.locator('[data-a="sitfinish"]').count()) await tap(page, '[data-a="sitfinish"]');
      else await page.evaluate(() => sitFinish());
      await page.waitForTimeout(400);
      st.code = await page.evaluate(() => SIT.code);
    },
    async (page, st) => {                           /* והציונים נאספים כאן */
      await page.goto(`${BASE}/${st.app}/`, { waitUntil: 'load' });
      await sub(page, st.text, st.i, st.n);
      await tap(page, '[data-a="go"][data-v="marks"]');
      await tap(page, '[data-a="mkopen"]');
      await page.fill('#mkPaste', st.code);
      await page.waitForTimeout(500);
      await tap(page, '[data-a="mkadd"]');
      await page.waitForTimeout(500);
    },
    async (page, st) => {                           /* בדפדפן, בלי התקנה */
      await page.goto(`${BASE}/`, { waitUntil: 'load' });
      await sub(page, st.text, st.i, st.n);
    },
    async () => {}                                  /* הכתובת — כרטיס הסיום */
  ] }
};
FLOWS.shlav = {                                   /* תסריט 2 — ״שלב״, מתמטיקה לתיכון */
  app: 'math-teen', script: 2, file: 'shlav-math-teen', steps: [
    async (page) => {                               /* 24 נושאים */
      for (let k = 0; k < 3 && await page.locator('[data-a="obnext"]').count(); k++) await tap(page, '[data-a="obnext"]');
      await tap(page, '[data-a="go"][data-v="topics"]');
      for (let k = 0; k < 3; k++) { await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' })); await page.waitForTimeout(450); }
    },
    async (page) => {                               /* לפי 3, 4 או 5 יחידות — בורר המסלול שבראש מסך הנושאים */
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await page.waitForTimeout(700);
      await tap(page, '[data-a="track"][data-t="4"]');
    },
    async (page) => {                               /* כל שאלה נקראת בקול */
      await tap(page, '[data-a="go"][data-v="home"]');
      if (await page.locator('[data-a="lvl"][data-l="2"]').count()) await tap(page, '[data-a="lvl"][data-l="2"]');
      await tap(page, '[data-a="start"]');
      await page.waitForSelector('[data-a="ans"]', { timeout: 8000 });
      if (await page.locator('[data-a="read"]').count()) await tap(page, '[data-a="read"]');
    },
    async (page) => {                               /* וכשטועים */
      const i = await page.evaluate(() => P.q.options.findIndex(o => !o.ok));
      await tap(page, `[data-a="ans"][data-i="${i}"]`);
    },
    async (page) => {                               /* איפה בדיוק הייתה הטעות */
      const e = page.locator('[data-a="ans"][aria-pressed="true"], .opt.picked, .opt.bad').first();
      if (await e.count()) await e.scrollIntoViewIfNeeded().catch(() => {});
    },
    async (page) => {                               /* דף נוסחאות */
      await tap(page, '[data-a="go"][data-v="formulas"]');
      for (let k = 0; k < 2; k++) { await page.evaluate(() => window.scrollBy({ top: 260, behavior: 'smooth' })); await page.waitForTimeout(900); }
    },
    async (page) => {                               /* פתרון נכון, בלי שעון */
      await tap(page, '[data-a="go"][data-v="practice"]');
      await page.waitForSelector('[data-a="ans"]', { timeout: 8000 });
      const i = await page.evaluate(() => P.q.options.findIndex(o => o.ok));
      await tap(page, `[data-a="ans"][data-i="${i}"]`);
    },
    async () => {}                                  /* הכתובת */
  ] };
FLOWS.reader = {                                  /* תסריט 1 — המקריא הקולי */
  app: 'reader', script: 1, file: 'reader-script1', tail: 'מקריא כל טקסט שמדביקים · המילה שנאמרת מודגשת', steps: [
    async (page) => {                               /* יש טקסט שהילד צריך לקרוא */
      await page.click('#input').catch(() => {});
    },
    async (page) => {                               /* מדביקים אותו כאן */
      await tap(page, '#btnSample');
      await tap(page, '#btnGo');
      /* הניקוד יוצא לרשת, והרשת חסומה כאן — נתיב מציע להמשיך בלעדיו */
      const noNik = page.locator('#btnNoNikud');
      await noNik.waitFor({ timeout: 15000 }).catch(() => {});
      if (await noNik.count()) await tap(page, '#btnNoNikud');
      await page.waitForSelector('#text', { timeout: 8000 });
    },
    async (page) => {                               /* והוא נקרא בקול */
      await tap(page, '#btnPlay');
    },
    async (page) => {                               /* המילה שנשמעת — מודגשת */
      await page.locator('#text').scrollIntoViewIfNeeded().catch(() => {});
    },
    async (page) => {                               /* אפשר להגדיל, ולהרחיב שורות */
      await tap(page, '#toolsHandle');
      await tap(page, '#segSize [data-v="1.95"]');
      await tap(page, '#segSpace [data-v="2"]');
    },
    async (page) => {                               /* ולהאט, משפט אחד בכל פעם */
      await tap(page, '#segFocus [data-v="1"]');
      await tap(page, '#segRate [data-v="0.75"]');
    },
    async () => {}                                  /* הכתובת */
  ] };
/* ארבע השפות — כמו שהאפליקציה עושה: היא בונה שאלה חדשה בכל החלפת
   שפה (במתכוון — שאלה נבנית פעם אחת בשפה שהייתה פעילה, והחלפה
   באמצע הייתה משאירה מסך חצי מתורגם), ולכן הסרטון מראה ארבע
   שאלות שונות מאותו נושא. הבעלים הכריע 18.9.2026: בלי איפוס זרע. */
const switchLang = async (page, lg) => {
  await tap(page, '[data-a="go"][data-v="settings"]');
  await tap(page, `[data-a="lang"][data-n="${lg}"]`);
  await tap(page, '[data-a="go"][data-v="practice"]');
};
FLOWS.langs = {                                   /* תסריט 4 — ארבע השפות, ב״אקסיומה״ */
  app: 'math-uni', script: 4, file: 'langs-math-uni', tail: 'ארבע שפות · השאלות, הרמזים וההסברים', steps: [
    async (page) => {                               /* שאלה במתמטיקה בעברית */
      /* ההיכרות אינה חלק מהתסריט הזה — לחיצות מהירות, כדי שהשאלה בעברית תישאר על המסך */
      for (let k = 0; k < 3 && await page.locator('[data-a="obnext"]').count(); k++) { await page.click('[data-a="obnext"]'); await page.waitForTimeout(150); }
      if (await page.locator('[data-a="lvl"][data-l="2"]').count()) await page.click('[data-a="lvl"][data-l="2"]');
      await page.click('[data-a="start"]');
      await page.waitForSelector('[data-a="ans"]', { timeout: 8000 });
    },
    async (page) => { await switchLang(page, 'ar'); },   /* בערבית */
    async (page) => { await switchLang(page, 'ru'); },   /* ברוסית */
    async (page) => { await switchLang(page, 'en'); },   /* ובאנגלית */
    async (page) => {                               /* לא רק התפריט — גם השאלות וההסברים */
      const i = await page.evaluate(() => P.q.options.findIndex(o => o.ok));
      await tap(page, `[data-a="ans"][data-i="${i}"]`);
      if (await page.locator('[data-a="guide"]').count()) await tap(page, '[data-a="guide"]');
    },
    async () => {}                                  /* הכתובת */
  ] };
const flowSig = f => sha(scriptRows(f.script).map(r => `${r.a}-${r.b}|${r.text}`).join('\n') + f.steps.map(String).join('\n'));

async function recordFlow(browser, name, ffmpeg, legalVer) {
  const f = FLOWS[name];
  const rows = scriptRows(f.script);
  if (!rows.length) throw new Error('אין טבלה לתסריט ' + f.script + ' ב-video-scripts.md');
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'flow-'));
  const ctx = await browser.newContext({
    viewport: VIEW, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'he-IL',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    recordVideo: { dir: tmp, size: SIZE },
  });
  const page = await ctx.newPage();
  await page.addInitScript(FAKE_TTS);
  await page.addInitScript((ver) => {
    try { localStorage.setItem('legal-accepted-v' + ver,
      JSON.stringify({ v: ver, at: new Date().toISOString(), lang: 'he' })); } catch (e) {}
  }, legalVer);
  await page.route('**', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
  const t0 = Date.now();
  await page.goto(`${BASE}/${f.app}/`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const tStart = Date.now() - t0;
  const st = { app: f.app, n: rows.length };
  const late = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    st.i = i + 1; st.text = r.text;
    await sub(page, r.text, i + 1, rows.length);
    await page.evaluate(ms => { const el = document.getElementById('rec-fill'); if (el) { el.style.transition = 'width ' + ms + 'ms linear'; el.style.width = '100%'; } }, (r.b - r.a) * 1000);
    const stepStart = Date.now();
    if (i === rows.length - 1) break;              /* השורה האחרונה היא כרטיס הסיום */
    try { await f.steps[i](page, st); }
    catch (e) {
      const shot = path.join(require('os').tmpdir(), `flow-${name}-step${i + 1}.png`);
      await page.screenshot({ path: shot }).catch(() => {});
      await ctx.close().catch(() => {});
      throw new Error(`צעד ${i + 1} (${r.text}): ${e.message.split('\n')[0]} — צילום ב-${shot}`);
    }
    const took = (Date.now() - stepStart) / 1000;
    if (took > r.b - r.a) late.push(`${i + 1}: ${took.toFixed(1)}s > ${r.b - r.a}s`);
    const until = tStart + r.b * 1000 - (Date.now() - t0);
    if (until > 0) await page.waitForTimeout(until);
  }
  await page.evaluate((tail) => {
    const d = document.createElement('div'); d.setAttribute('dir', 'rtl');
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;' +
      'justify-content:center;gap:18px;background:#0b1220;color:#f4f7ff;font:700 30px/1.35 system-ui,sans-serif;text-align:center;padding:40px';
    d.innerHTML = '<div style="font-size:26px;opacity:.85">חינם · בלי הרשמה · בלי פרסומות</div>' +
      '<div style="font-size:34px;direction:ltr;color:#ffd23f">bekol.co.il</div>' +
      '<div style="font-size:22px;opacity:.75">' + tail + '</div>';
    document.body.appendChild(d);
  }, f.tail || 'כל שאלה מוקראת · ארבע שפות · עובד גם בלי אינטרנט');
  await page.waitForTimeout(3200);
  const tEnd = Date.now() - t0;
  const video = page.video();
  await ctx.close();
  const webm = await video.path();
  fs.mkdirSync(VID, { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'marketing', 'srt', `script-${f.script}.srt`), path.join(VID, f.file + '.srt'));
  let out = path.join(VID, f.file + '.webm'), stretch = null;
  if (ffmpeg) {
    out = path.join(VID, f.file + '.mp4');
    const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', webm], { encoding: 'utf8' });
    const dm = (probe.stderr || '').match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    const webmSec = dm ? (+dm[1]) * 3600 + (+dm[2]) * 60 + (+dm[3]) : 0;
    const wall = tEnd / 1000;
    const k = webmSec > 0 && wall > 0 ? Math.min(1.3, Math.max(0.8, wall / webmSec)) : 1;
    stretch = webmSec && wall ? +(webmSec / wall).toFixed(3) : null;
    const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', (tStart / 1000 * k).toFixed(2), '-i', webm,
      '-vf', `setpts=PTS*${k.toFixed(4)},fps=25,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '26',
      '-movflags', '+faststart', '-an', out], { encoding: 'utf8' });
    if (r.status !== 0) { console.log(`✗ ${name}: ffmpeg נכשל\n${r.stderr}`); out = null; }
    else {
      spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '14', '-i', out, '-frames:v', '1', '-q:v', '3', path.join(THUMB, f.file + '.jpg')]);
      const m = addMusic(ffmpeg, out); if (!m.ok) console.log(`! ${name}: בלי מוזיקה — ${String(m.err).split('\n')[0]}`);
    }
  } else fs.copyFileSync(webm, out);
  fs.rmSync(tmp, { recursive: true, force: true });
  if (late.length) console.log(`! ${name}: צעדים שחרגו מזמן השורה — ${late.join(' · ')}`);
  return { app: f.app, script: f.script, steps: rows.length, seconds: rows[rows.length - 1].b, sig: flowSig(f), stretch,
    file: out ? path.relative(ROOT, out) : null, bytes: out ? fs.statSync(out).size : 0, recorded: new Date().toISOString().slice(0, 10) };
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
  const want = args.filter((a, i) => !a.startsWith('-') && args[i - 1] !== '--flow');
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
  const flowArg = args.indexOf('--flow');
  if (flowArg >= 0) {
    const name = args[flowArg + 1];
    if (!FLOWS[name]) { console.log(`✗ אין תסריט בשם ${name}. יש: ${Object.keys(FLOWS).join(', ')}`); await browser.close(); if (server) server.kill(); process.exit(1); }
    const man = readManifest(); man.flows = man.flows || {};
    let ok = false;
    try {
      const r = await recordFlow(browser, name, ffmpeg, legalVer);
      if (r.file) { man.flows[name] = r; ok = true;
        console.log(`✓ תסריט ${r.script} (${name}) — ${r.seconds}s, ${(r.bytes / 1048576).toFixed(1)} MB → ${r.file}`); }
    } catch (e) { console.log(`✗ ${name}: ${e.message.split('\n')[0]}`); }
    finally { await browser.close(); if (server) server.kill(); }
    fs.writeFileSync(MANIFEST, JSON.stringify(man, null, 2) + '\n');
    process.exit(ok ? 0 : 1);
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
