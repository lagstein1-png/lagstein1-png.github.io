/* =====================================================================
   מסלול הלומד על הבתים שנפרסו — בדיקה שרצה ביד בלבד.

     node .claude/qa/deployed.js                  origin/main
     node .claude/qa/deployed.js <ref>            קומיט, תגית או ענף
     node .claude/qa/deployed.js --dir <path>     תיקייה כפי שהיא, בלי git
     node .claude/qa/deployed.js --app lomda      אפליקציה אחת (אפשר כמה)
     node .claude/qa/deployed.js --lang he        שפה אחת
     node .claude/qa/deployed.js --shots /tmp/s   גם צילומי מסך
     node .claude/qa/deployed.js --port 8111      פורט אחר

   למה הבדיקה הזאת קיימת, ולמה היא אינה ב-all.js
   ----------------------------------------------
   כל שאר הכלים בודקים את **עץ העבודה** — מה שכתוב על הדיסק ברגע
   זה, כולל שינויים שעוד לא נדחפו. הכלי הזה בודק את מה ש**נפרס**:
   הוא מוציא worktree על קומיט, מגיש אותו כפי ש-GitHub Pages מגיש
   (קבצים סטטיים, בלי build), ומעביר דפדפן אמיתי במסלול של לומד —
   שער השפה, האונבורדינג, ואז המסך עצמו, בארבע השפות.

   **הרשת חסומה כאן**, ולכן זו אינה בדיקה של הכתובת החיה: היא אינה
   אומרת דבר על DNS, על ה-CDN או על התעודה. מה שהיא כן אומרת הוא
   שהבתים של אותו קומיט נטענים ועובדים. ההוכחה שהם אכן אותם בתים
   היא ה-md5 שמודפס בראש הריצה, מול `git show <sha>:<file>`.

   היא אינה ב-`all.js` מפני שהיא דורשת רשת ל-`git fetch`, יוצרת
   worktree, ומריצה 4 שפות × כל אפליקציה — כלומר עשרות טעינות דף.
   `smoke.js` כבר מכסה שגיאות JS על עץ העבודה בכל push. זו בדיקה
   שמריצים כשרוצים לדעת מה באמת עומד בשרת, ולא בכל commit.

   מה היא בודקת בכל אפליקציה ובכל שפה
   ----------------------------------
   1. הדף נטען, ואפס שגיאות JS (pageerror וגם console.error).
      בקשות חיצוניות נחסמות ואינן נספרות — כמו ב-`smoke.js`.
   2. שער השפה נפתח, נבחרת שפה, והמסך ממשיך אחריו.
   3. **מחרוזת ה-BUILD שבקובץ מופיעה על המסך.** זו הבדיקה שאין
      בשום כלי אחר: `status.js` משווה שתי מחרוזות בקובץ, וכאן
      נבדק שמה שהלומד רואה בפוטר הוא באמת הגרסה הזאת.
   4. ה-service worker שנרשם נושא את אותו מפתח `?v=`. זה המנגנון
      היחיד שמביא קוד חדש למי שכבר התקין, ולכן הוא נבדק בדפדפן
      ולא בקריאת טקסט. אין רישום — הודעה, לא כישלון: דפדפן ללא
      הקשר מאובטח אינו מחויב לרשום.

   קוראת ומריצה בלבד. אינה כותבת דבר לריפו.
   ===================================================================== */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawn } = require('child_process');
const { chromium } = require('./pw.js');

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const many = (name) => argv.reduce((out, a, i) =>
  (a === '--' + name && argv[i + 1] && !argv[i + 1].startsWith('--')) ? out.concat(argv[i + 1]) : out, []);

const DIR   = flag('dir', null);
const PORT  = Number(flag('port', 8111));
const SHOTS = flag('shots', null);
const ONLY  = many('app');
const LANGS = many('lang').length ? many('lang') : ['he', 'ar', 'ru', 'en'];
/* ה-ref הוא הארגומנט הראשון שאינו דגל ואינו ערך של דגל */
const TAKES_VALUE = new Set(['--dir', '--port', '--shots', '--app', '--lang']);
const positional = argv.filter((a, i) =>
  !a.startsWith('--') && !(i > 0 && TAKES_VALUE.has(argv[i - 1])));
const REF = positional[0] || 'origin/main';

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const md5 = (b) => crypto.createHash('md5').update(b).digest('hex');

let findings = 0;
const bad = (m) => { console.log('✗ ' + m); findings++; };

/* --- 1. תמונת המצב: worktree על הקומיט, או תיקייה שנמסרה --- */
let snap = DIR, sha = null, tmp = null;
if (!DIR) {
  try { sha = git('rev-parse', REF); }
  catch (e) { console.log(`✗ אין ref בשם "${REF}" — הרץ git fetch origin, או העבר --dir`); process.exit(1); }
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'deployed-'));
  snap = path.join(tmp, 'snap');
  git('worktree', 'add', '--detach', snap, sha);
  console.log(`תמונת מצב: ${REF} = ${sha.slice(0, 7)}  ${git('log', '-1', '--format=%s', sha).slice(0, 60)}`);
} else {
  console.log(`תמונת מצב: התיקייה ${snap} כפי שהיא`);
}

const cleanup = () => {
  try { if (server && !server.killed) server.kill(); } catch (e) {}
  try { if (tmp) { git('worktree', 'remove', '--force', snap); fs.rmSync(tmp, { recursive: true, force: true }); } } catch (e) {}
};
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });

/* --- 2. שרת: הקובץ מהריפו, cwd של תמונת המצב --- */
/* בכוונה לא ה-serve.js של תמונת המצב: השרת אינו חלק ממה שנפרס,
   ובקומיט ישן הוא עלול שלא להכיר QA_PORT. */
const server = spawn(process.execPath, [path.join(ROOT, '.claude/qa/serve.js')],
  { cwd: snap, env: Object.assign({}, process.env, { QA_PORT: String(PORT) }), stdio: 'ignore' });

const BASE = `http://127.0.0.1:${PORT}`;
const get = (p) => new Promise((res, rej) => {
  require('http').get(BASE + p, r => {
    const chunks = [];
    r.on('data', c => chunks.push(c));
    r.on('end', () => res({ code: r.statusCode, body: Buffer.concat(chunks) }));
  }).on('error', rej);
});
const wait = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  /* השרת עולה */
  let up = false;
  for (let i = 0; i < 25 && !up; i++) {
    try { up = (await get('/')).code === 200; } catch (e) { await wait(200); }
  }
  if (!up) { bad(`השרת לא עלה על ${BASE}`); process.exit(1); }

  /* --- 3. הוכחת נאמנות: הבתים שמוגשים הם של הקומיט --- */
  if (sha) {
    const served = (await get('/index.html')).body;
    const inGit = execFileSync('git', ['show', `${sha}:index.html`], { cwd: ROOT, maxBuffer: 1 << 28 });
    if (md5(served) !== md5(inGit)) bad('הבתים שמוגשים אינם זהים לקומיט — worktree מלוכלך?');
    else console.log(`נאמנות: md5(index.html) = ${md5(served)} — זהה ל-${sha.slice(0, 7)}`);
  }

  /* --- 4. אילו אפליקציות: מה ש-stages.json של אותו קומיט מכריז ציבורי --- */
  const stages = JSON.parse(fs.readFileSync(path.join(snap, '.claude/qa/stages.json'), 'utf8'));
  let apps = Object.keys(stages.apps)
    .filter(id => stages.apps[id].stage === 'public')
    .filter(id => !stages.apps[id].external)
    .filter(id => fs.existsSync(path.join(snap, id, 'index.html')));
  apps.unshift('');                                   /* '' = דף הבית */
  if (ONLY.length) apps = apps.filter(id => ONLY.includes(id || 'home'));
  if (!apps.length) { bad('אין אפליקציה לבדוק'); process.exit(1); }

  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

  const b = await chromium.launch();
  for (const app of apps) {
    const label = app || 'דף הבית';
    /* בבגרות 806 הגרסה ומחרוזת הרישום יושבות ב-app.js ולא ב-index.html.
       מי שקורא רק את index.html מדווח עליה ״אין BUILD״ ובודק אפס. */
    let src = fs.readFileSync(path.join(snap, app, 'index.html'), 'utf8');
    const side = path.join(snap, app, 'app.js');
    if (!/var BUILD\s*=/.test(src) && fs.existsSync(side)) src += '\n' + fs.readFileSync(side, 'utf8');
    const build = (src.match(/var BUILD\s*=\s*"([^"]+)"/) || [])[1] || null;
    const key = (src.match(/sw\.js\?v=([^"']+)"/) || [])[1] || null;
    const rows = [];

    for (const lg of LANGS) {
      const ctx = await b.newContext({ viewport: { width: 430, height: 950 } });
      const p = await ctx.newPage();
      const errs = [];
      p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
      let blocked = 0;
      p.on('console', m => {
        if (m.type() !== 'error') return;
        const t = m.text();
        if (/net::ERR_FAILED|net::ERR_BLOCKED/.test(t) && blocked > 0) return;   /* החסימה היא שלנו */
        errs.push('CONSOLE: ' + t);
      });
      await p.route('**/*', r => {
        if (r.request().url().startsWith(BASE)) return r.continue();
        blocked++; return r.abort();
      });

      const click = async (s) => { try { await p.click(s, { timeout: 1500 }); await p.waitForTimeout(250); return true } catch (e) { return false } };
      await p.goto(BASE + '/' + app, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await p.waitForTimeout(700);

      /* שער השפה של הביקור הראשון, ואז האונבורדינג — בדיוק מה שלומד עובר */
      const gate = await click(`[data-lg="${lg}"]`);
      await click('#lg-ok');
      for (let i = 0; i < 10; i++) {
        if (await p.$('[data-a="selpet"]')) await click('[data-a="selpet"]');
        if (await p.$('[data-a="startpet"]')) { await click('[data-a="startpet"]'); continue }
        if (await p.$('[data-a="obnext"]')) { await click('[data-a="obnext"]'); continue }
        break;
      }
      await p.waitForTimeout(400);

      const seenBuild = build ? await p.evaluate(t => document.body.innerText.indexOf(t) >= 0, build) : null;
      /* הרישום עצמו, ולא המחרוזת שבקוד */
      const swUrl = await p.evaluate(async () => {
        if (!navigator.serviceWorker) return null;
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          const r = regs.find(x => x.active || x.installing || x.waiting);
          return r ? (r.active || r.installing || r.waiting).scriptURL : null;
        } catch (e) { return null }
      });

      if (errs.length) bad(`${label} · ${lg}: ${[...new Set(errs)].slice(0, 2).join(' | ')}`);
      if (build && !seenBuild) bad(`${label} · ${lg}: הפוטר אינו מציג "${build}" — הדף שמוגש אינו הגרסה הזאת`);
      /* הגרסה שמוצגת ומפתח המטמון הם שתי מחרוזות נפרדות, ו-`sw.js`
         גוזר את המטמון מהשנייה בלבד. עדכון של אחת בלי השנייה פירושו
         שהלומד רואה מספר חדש ומקבל קוד ישן — או להפך. `status.js`
         משווה אותן בקובץ; כאן זה נבדק על מה שנרשם בדפדפן. */
      if (build && key && lg === LANGS[0] && key.indexOf(build.split(' ')[0] + '-') !== 0)
        bad(`${label}: BUILD "${build.split(' ')[0]}" ומפתח המטמון "${key}" אינם אותה גרסה`);
      if (key && swUrl && swUrl.indexOf(key) < 0) bad(`${label} · ${lg}: ה-worker נרשם כ-${swUrl} ולא עם ?v=${key}`);
      if (!gate && lg !== LANGS[0]) console.log(`   · ${label} · ${lg}: לא נמצא שער שפה — נבדק בשפת ברירת המחדל`);

      rows.push(`${lg}${errs.length ? '✗' : '✓'}`);
      /* חלון מבצע ההשקה נפתח על דף הבית חצי שנייה אחרי הטעינה ומכסה
         אותו. הבדיקות קוראות טקסט ואינן מושפעות; הצילום כן, והוא היה
         יוצא תמונה של החלון במקום של הדף. Escape סוגר, ורק לפני הצילום. */
      if (SHOTS) {
        await p.keyboard.press('Escape');
        await p.waitForTimeout(350);
        await p.screenshot({ path: path.join(SHOTS, (app || 'home') + '-' + lg + '.png') });
      }
      await ctx.close();
    }
    console.log(`${findings ? ' ' : ''}${label.padEnd(12)} ${rows.join(' ')}   ` +
                `${build ? 'BUILD ' + build.split(' ')[0] : 'אין BUILD'}${key ? ' · ?v=' + key : ''}`);
  }
  await b.close();

  console.log(`\n${apps.length} דפים × ${LANGS.length} שפות · ${findings} ממצאים` +
              (SHOTS ? `\nצילומים: ${SHOTS}` : ''));
  process.exit(findings ? 1 : 0);
})().catch(e => { console.log('✗ ' + (e && e.message)); cleanup(); process.exit(1); });
