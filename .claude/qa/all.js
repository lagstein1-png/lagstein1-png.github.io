/* =====================================================================
   נקודת כניסה אחת לכל בדיקות ה-QA.

     node .claude/qa/all.js              # הכול
     node .claude/qa/all.js --static     # רק מה שלא צריך דפדפן (מהיר)
     node .claude/qa/all.js --app ulpan  # אפליקציה אחת (אפשר לחזור על הדגל)

   **הקובץ הזה אינו בודק כלום בעצמו.** הוא מגלה מה יש בריפו, מריץ את
   הכלים שכבר קיימים בתיקייה הזאת, ומתרגם את הפלט שלהם לשלוש מילים:

     PASS    תואם לקו הבסיס
     FAIL    סטייה מקו בסיס שהוא אפס — באג
     REVIEW  מדד שאין לו קו בסיס אפס, וצריך עין אנושית

   שלוש הערות שהן הסיבה שהקובץ נכתב:

   1. **אין כאן רשימת אפליקציות.** כל רשימה מוקלדת ביד מתיישנת ביום
      שנולדת אפליקציה חדשה, והבדיקה שלא רצה עליה נראית כאילו עברה.
      הגילוי הוא מהדיסק בלבד — בדיוק כמו `allApps()` שב-`cache.js`.

   2. **`parse.js` סורק בלוקי `<script>` פנימיים בלבד.** ב-`bagrut-806`
      כל הקוד יושב בקבצי `.js` חיצוניים, ולכן הוא מחזיר שם
      `0 inline scripts, 0 parse failures` — מעבר שנראה נקי ולא בדק
      דבר. הרַץ מזהה את המצב הזה, מסמן אותו, ושולח את הקבצים
      החיצוניים ל-`node --check`.

   3. **קו הבסיס של eslint נקרא מ-`README.md` ואינו משוכפל לכאן.**
      טבלת הממצאים השפירים שם היא מקור האמת היחיד; שכפול שלה כאן היה
      מבטיח ששתי הרשימות ייפרדו עם הזמן.

   הרַץ **אינו כותב, אינו עורך ואינו מתקן**. הוא קורא בלבד.
   קוד יציאה: 0 אם אין אף FAIL, אחרת 1. REVIEW אינו מפיל.
   ===================================================================== */
const { spawnSync, spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os'), net = require('net');

const ROOT = path.resolve(__dirname, '..', '..');
const QA = __dirname;
const PORT = 8099;

const argv = process.argv.slice(2);
const STATIC_ONLY = argv.includes('--static');
const ONLY = [];
for (let i = 0; i < argv.length; i++) if (argv[i] === '--app') ONLY.push(argv[++i]);

/* ---------- גילוי: הכול מהדיסק, שום דבר מהזיכרון ---------- */

const subdirs = () => fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'img' && e.name !== 'marketing')
  .map(e => e.name).sort();

/* יחידה = תיקייה שיש בה index.html. "." הוא דף הבית. */
function units() {
  const out = fs.existsSync(path.join(ROOT, 'index.html')) ? ['.'] : [];
  for (const d of subdirs()) if (fs.existsSync(path.join(ROOT, d, 'index.html'))) out.push(d);
  return ONLY.length ? out.filter(u => ONLY.includes(u)) : out;
}

const upath = (u, f) => path.join(ROOT, u === '.' ? '' : u, f);
const uname = u => (u === '.' ? '(שורש)' : u);

/* המקור שבו יושב הקוד של היחידה: index.html, ובבגרות 806 גם app.js. */
function hostSrc(u) {
  let s = '';
  for (const f of ['index.html', 'app.js'])
    if (fs.existsSync(upath(u, f))) s += fs.readFileSync(upath(u, f), 'utf8');
  return s;
}

/* קובצי .js חיצוניים שהיחידה טוענת בעצמה. vendor/ אינו שלנו,
   ו-/legal/ משותף לכולן ונבדק פעם אחת בנפרד. */
function externalJs(u) {
  const idx = upath(u, 'index.html');
  if (!fs.existsSync(idx)) return [];
  const html = fs.readFileSync(idx, 'utf8');
  const out = [];
  for (let m, re = /<script[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi; (m = re.exec(html));) {
    const src = m[1];
    if (/^(https?:)?\/\//.test(src) || src.startsWith('/') || src.includes('vendor/')) continue;
    const f = path.join(ROOT, u === '.' ? '' : u, src);
    if (fs.existsSync(f)) out.push(path.relative(ROOT, f));
  }
  return out;
}

/* אפליקציות מחולל: מגדירות גם TOPICS וגם buildQ. רק עליהן
   entropy.js ו-options.js יכולים לרוץ בכלל. */
const isGen = u => /\bTOPICS\s*=/.test(hostSrc(u)) && /\bbuildQ\s*[=(]|function\s+buildQ/.test(hostSrc(u));
/* אפליקציות עם בונה מבחן. */
const isExam = u => /\bEB\s*=/.test(hostSrc(u));

/* ---------- תוצאות ---------- */

const rows = [];
const add = (check, unit, where, status, detail) =>
  rows.push({ check, unit, where, status, detail });

function run(cmd, args, opts) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

/* ---------- 1. parse.js — פרסינג של בלוקים פנימיים ---------- */

function checkParse(us) {
  for (const u of us) {
    const idx = upath(u, 'index.html');
    const r = run('node', [path.join(QA, 'parse.js'), path.relative(ROOT, idx)]);
    const fails = r.out.split('\n').filter(l => l.startsWith('PARSE FAIL'));
    const m = r.out.match(/(\d+) inline scripts, (\d+) parse failures/);
    const inline = m ? +m[1] : 0;
    if (fails.length) add('parse', u, 'index.html', 'FAIL', fails.join(' | '));
    else if (inline === 0)
      add('parse', u, 'index.html', 'REVIEW',
        'אפס בלוקים פנימיים — parse.js לא בדק כאן דבר. הקוד חיצוני; ראה בדיקת external-js');
    else add('parse', u, 'index.html', 'PASS', inline + ' בלוקים');
  }
}

/* ---------- 2. node --check — הקבצים ש-parse.js אינו רואה ---------- */

function checkExternal(us) {
  const seen = new Set();
  const jobs = [];
  for (const u of us) for (const f of externalJs(u)) jobs.push([u, f]);
  /* /legal/ משותף לכל אחת־עשרה האפליקציות ולכן נבדק פעם אחת. */
  if (!ONLY.length) for (const f of ['legal/terms.js', 'legal/protect.js'])
    if (fs.existsSync(path.join(ROOT, f))) jobs.push(['legal', f]);
  for (const [u, f] of jobs) {
    if (seen.has(f)) continue;
    seen.add(f);
    const r = run('node', ['--check', f]);
    if (r.code === 0) add('external-js', u, f, 'PASS', 'node --check עבר');
    else add('external-js', u, f, 'FAIL', r.out.trim().split('\n').slice(0, 3).join(' | '));
  }
}

/* ---------- 3. cache.js — BUILD מול ?v=, ו-caches.match גלובלי ---------- */

function checkCache(us) {
  /* cache.js מגלה בעצמו, ומכסה יחידות עם sw.js — לא בהכרח אותה
     קבוצה כמו units(). מריצים אותו בלי ארגומנטים כדי לא לצמצם. */
  const r = run('node', [path.join(QA, 'cache.js')]);
  for (const line of r.out.split('\n')) {
    const m = line.match(/^([✓✗·])\s+(\S+?)(?:\/(index\.html|app\.js))?:\s*(.*)$/);
    if (!m) continue;
    const [, sign, unit, host, detail] = m;
    const status = sign === '✗' ? 'FAIL' : 'PASS';
    add('cache', unit, host || 'sw.js', status, detail);
  }
  if (!/\d+ sw\.js נבדקו/.test(r.out))
    add('cache', '—', 'cache.js', 'FAIL', 'הכלי לא הדפיס שורת סיכום: ' + r.out.trim().slice(0, 200));
}

/* ---------- 4. eslint — קו בסיס שאינו אפס, נקרא מ-README ---------- */

/* קו הבסיס של eslint נקרא מטבלת README, על שתי העמודות שלה:
   *איזה* ממצא שפיר, ו*באיזו* יחידה הוא שפיר. בלי עמודת הקובץ,
   `'stopSpeak' is not defined` — שהוא שפיר בדף הבית וב-reader בלבד —
   היה עובר בשקט בכל אפליקציה אחרת, וזו בדיוק ההבחנה שהטבלה עושה.
   המפתח הוא המזהה + סוג הממצא, ולא נוסח ההודעה: eslint מוסיף נקודה
   בסוף, ו-README לא. */
function eslintBaseline() {
  const md = fs.readFileSync(path.join(QA, 'README.md'), 'utf8');
  const byUnit = {};
  for (const line of md.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map(s => s.trim());
    if (cells.length < 4) continue;
    const f = cells[2].match(/`'([^']+)' is (already|not) defined`/);
    if (!f) continue;
    const key = f[1] + '|' + f[2];
    for (let tok of cells[1].split(',')) {
      tok = tok.trim();
      if (!tok) continue;
      const u = /^index\b/.test(tok) ? '.' : tok;
      (byUnit[u] = byUnit[u] || new Set()).add(key);
    }
  }
  return byUnit;
}

function checkEslint(us) {
  const base = eslintBaseline();
  if (!Object.keys(base).length) {
    add('eslint', '—', 'README.md', 'REVIEW', 'לא הצלחתי לקרוא את טבלת קו הבסיס מ-README');
    return;
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-eslint-'));
  const htmls = us.map(u => path.relative(ROOT, upath(u, 'index.html'))).filter(f => fs.existsSync(path.join(ROOT, f)));
  const ex = run('node', [path.join(QA, 'extract.js'), tmp, ...htmls]);
  if (ex.code !== 0) { add('eslint', '—', 'extract.js', 'REVIEW', 'החילוץ נכשל: ' + ex.out.trim().slice(0, 200)); return; }
  fs.copyFileSync(path.join(QA, 'eslint.config.mjs'), path.join(tmp, 'eslint.config.mjs'));

  const r = run('npx', ['--no-install', 'eslint', '--config', 'eslint.config.mjs', '.', '-f', 'json'], { cwd: tmp });
  let report;
  try { report = JSON.parse(r.out.slice(r.out.indexOf('['))); }
  catch (e) { add('eslint', '—', 'eslint', 'REVIEW', 'לא הצלחתי לפרסר את הפלט: ' + r.out.trim().slice(0, 200)); return; }

  /* שם הקובץ המחולץ נגזר מהנתיב: math-app_index.js ← math-app/index.html */
  const unitOf = f => {
    const b = path.basename(f).replace(/\.js$/, '');
    return b === 'index' ? '.' : b.replace(/_index$/, '');
  };
  const perUnit = {};
  for (const f of report) for (const m of f.messages) {
    const u = unitOf(f.filePath);
    const g = m.message.match(/'([^']+)' is (already|not) defined/);
    const known = g && (base[u] || new Set()).has(g[1] + '|' + g[2]);
    (perUnit[u] = perUnit[u] || { known: 0, novel: [] });
    if (known) perUnit[u].known++;
    else perUnit[u].novel.push(`שורה ${m.line} בקובץ המחולץ: ${m.ruleId || '-'} — ${m.message}`);
  }
  for (const u of us) {
    const p = perUnit[u] || { known: 0, novel: [] };
    if (p.novel.length)
      add('eslint', u, 'index.html', 'REVIEW',
        `${p.novel.length} ממצאים שאינם בקו הבסיס: ` + p.novel.slice(0, 4).join(' | '));
    else add('eslint', u, 'index.html', 'PASS', `${p.known} ממצאים, כולם בקו הבסיס שב-README`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

/* ---------- שרת מקומי לבדיקות הדפדפן ---------- */

function portOpen() {
  return new Promise(res => {
    const s = net.connect(PORT, '127.0.0.1');
    s.on('connect', () => { s.end(); res(true); });
    s.on('error', () => res(false));
  });
}

async function withServer(fn) {
  const already = await portOpen();
  let srv = null;
  if (!already) {
    srv = spawn('node', [path.join(QA, 'serve.js')], { cwd: ROOT, stdio: 'ignore', detached: false });
    for (let i = 0; i < 50; i++) { if (await portOpen()) break; await new Promise(r => setTimeout(r, 100)); }
    if (!await portOpen()) { add('serve', '—', 'serve.js', 'FAIL', 'השרת לא עלה על ' + PORT); return; }
  }
  try { await fn(); } finally { if (srv) srv.kill(); }
}

/* ---------- 5. smoke.js — דפדפן אמיתי ---------- */

function checkSmoke(us) {
  /* יחידה בכל הרצה: הפלט של smoke.js רב-שורתי כשיש שגיאות, וייחוס
     שורה לאפליקציה מתוך ריצה משותפת הוא בדיוק סוג הניחוש שהכלים
     האלה נועדו למנוע. */
  for (const u of us) {
    const r = run('node', [path.join(QA, 'smoke.js'), u === '.' ? '.' : u]);
    const ctl = (r.out.match(/\((\d+) controls exercised/) || [])[1] || '0';
    const err = r.out.match(/ERRORS \((\d+)\)/);
    if (err) {
      const first = r.out.split('\n').filter(l => /PAGEERROR|CONSOLE/.test(l)).slice(0, 3).map(s => s.trim());
      add('smoke', u, 'index.html', 'FAIL', `${err[1]} שגיאות: ` + first.join(' | '));
    } else if (/clean/.test(r.out)) add('smoke', u, 'index.html', 'PASS', ctl + ' פקדים הופעלו');
    else add('smoke', u, 'index.html', 'REVIEW', 'פלט לא מזוהה: ' + r.out.trim().slice(0, 200));
  }
}

/* ---------- 6. entropy.js — תשובה קבועה, כפילויות, NaN ---------- */

function checkEntropy(us) {
  for (const u of us) {
    const r = run('node', [path.join(QA, 'entropy.js'), u]);
    if (/^\S+ SKIP/m.test(r.out)) { add('entropy', u, 'index.html', 'REVIEW', 'הדף לא נטען — SKIP'); continue; }
    const bad = (r.out.match(/\{[^}]*\}/) || [])[0];
    let b = null; try { b = JSON.parse(bad); } catch (e) { }
    if (!b) { add('entropy', u, 'index.html', 'REVIEW', 'פלט לא מזוהה: ' + r.out.trim().slice(0, 200)); continue; }
    const constant = (r.out.match(/constant-answer levels:\s*(.*)/) || [])[1] || '';
    const near = (r.out.match(/>=95% same answer:\s*(.*)/) || [])[1] || '';
    /* קו הבסיס לארבעת אלה ול-constant הוא אפס — README, "קו הבסיס
       של entropy.js ו-smoke.js הוא אפס". */
    const hard = [];
    for (const k of ['noAns', 'multi', 'dupe', 'nan']) if (b[k]) hard.push(`${k}=${b[k]}`);
    if (constant.trim() && constant.trim() !== 'none') hard.push('רמות עם תשובה קבועה: ' + constant.trim());
    if (hard.length) add('entropy', u, 'index.html', 'FAIL', hard.join(' | ') + ` (מתוך ${b.n} שאלות)`);
    else if (near.trim() && near.trim() !== 'none')
      add('entropy', u, 'index.html', 'REVIEW', '95%+ אותה תשובה: ' + near.trim());
    else add('entropy', u, 'index.html', 'PASS', `${b.n} שאלות, אפס סטיות`);
  }
}

/* ---------- 7. options.js — כמה אפשרויות התלמיד רואה ---------- */

function checkOptions(us) {
  for (const u of us) {
    const r = run('node', [path.join(QA, 'options.js'), u]);
    const m = r.out.match(/total=(\d+)\s+under4=(\d+) \(([\d.]+)%\)\s+multiCorrect=(\d+)\s+noCorrect=(\d+)/);
    if (!m) { add('options', u, 'index.html', 'REVIEW', 'פלט לא מזוהה: ' + r.out.trim().slice(0, 200)); continue; }
    const [, tot, under, pct, multi, none] = m;
    if (+multi || +none)
      add('options', u, 'index.html', 'FAIL', `multiCorrect=${multi} noCorrect=${none} (מתוך ${tot})`);
    else if (+under)
      /* README: "ההבחנה היא לפי מקור האפשרויות — כתובות מראש בתוכן,
         או נבנות בזמן ריצה — ולא לפי האחוז." ולכן REVIEW ולא FAIL. */
      add('options', u, 'index.html', 'REVIEW',
        `${under} שאלות מציגות פחות מארבע (${pct}% מתוך ${tot}) — הכרע לפי מקור האפשרויות, לא לפי האחוז`);
    else add('options', u, 'index.html', 'PASS', `${tot} שאלות, כולן עם ארבע אפשרויות`);
  }
}

/* ---------- 8. exam.js — המורה מול התלמיד ---------- */

function checkExam(us) {
  for (const u of us) {
    const r = run('node', [path.join(QA, 'exam.js'), u]);
    if (/^✓/m.test(r.out)) add('exam', u, 'index.html', 'PASS', (r.out.match(/^✓.*/m) || [''])[0].trim());
    else if (/^✗/m.test(r.out)) add('exam', u, 'index.html', 'FAIL', (r.out.match(/^✗.*/m) || [''])[0].trim());
    else add('exam', u, 'index.html', 'REVIEW', 'פלט לא מזוהה: ' + r.out.trim().slice(0, 200));
  }
}

/* ---------- דוח ---------- */

function report() {
  const w = a => Math.max(...a.map(s => [...s].length));
  const cols = ['בדיקה', 'יחידה', 'קובץ', 'מצב'];
  const data = rows.map(r => [r.check, uname(r.unit), r.where, r.status]);
  const wid = cols.map((c, i) => Math.max([...c].length, w(data.map(d => d[i]))));
  const pad = (s, n) => s + ' '.repeat(Math.max(0, n - [...s].length));

  console.log('');
  console.log(cols.map((c, i) => pad(c, wid[i])).join('  '));
  console.log(wid.map(n => '-'.repeat(n)).join('  '));
  for (let i = 0; i < rows.length; i++) {
    console.log(data[i].map((d, j) => pad(d, wid[j])).join('  ') + '  ' + rows[i].detail);
  }

  const n = s => rows.filter(r => r.status === s).length;
  console.log('');
  console.log(`PASS ${n('PASS')}   FAIL ${n('FAIL')}   REVIEW ${n('REVIEW')}`);

  if (n('FAIL')) {
    console.log('\nמה נכשל:');
    for (const r of rows.filter(r => r.status === 'FAIL'))
      console.log(`  ✗ ${r.check}  ${uname(r.unit)}/${r.where}  — ${r.detail}`);
  }
  if (n('REVIEW')) {
    console.log('\nמה דורש הכרעה אנושית (אינו מפיל את הריצה):');
    for (const r of rows.filter(r => r.status === 'REVIEW'))
      console.log(`  ? ${r.check}  ${uname(r.unit)}/${r.where}  — ${r.detail}`);
  }
  console.log('\nהרַץ לא שינה ולא תיקן דבר. כל תיקון הוא החלטה של סוכן, לא של הכלי.');
  return n('FAIL') ? 1 : 0;
}

/* ---------- main ---------- */

(async () => {
  const us = units();
  if (!us.length) { console.log('לא נמצאה אף יחידה עם index.html'); process.exit(1); }
  const gens = us.filter(isGen), exams = us.filter(isExam);

  console.log('התגלו מהדיסק:');
  console.log('  יחידות עם index.html : ' + us.map(uname).join(', '));
  console.log('  מגדירות TOPICS+buildQ: ' + (gens.join(', ') || '—') + '   (entropy, options)');
  console.log('  מגדירות EB           : ' + (exams.join(', ') || '—') + '   (exam)');

  checkParse(us);
  checkExternal(us);
  if (!ONLY.length) checkCache(us);
  checkEslint(us);

  if (!STATIC_ONLY) {
    await withServer(async () => {
      checkSmoke(us);
      checkEntropy(gens);
      checkOptions(gens);
      checkExam(exams);
    });
  } else {
    console.log('\n(--static: smoke, entropy, options ו-exam דולגו)');
  }

  process.exit(report());
})();
