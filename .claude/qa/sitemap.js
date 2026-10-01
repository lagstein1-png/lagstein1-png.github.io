/* =====================================================================
   sitemap.xml — נגזר, לא נכתב ביד.

     node .claude/qa/sitemap.js            כותב את sitemap.xml
     node .claude/qa/sitemap.js --check    משווה, ונופל על פער (all.js)

   למה מחולל
   ---------
   ב-1.10.2026 בדיקה חיצונית מצאה ש-motal (public מ-30.9) חסרה במפה,
   ש-rakia — מפת לידה, לא אפליקציית לימוד — כן בה, ושאין בה lastmod
   כלל. המפה נכתבה ביד, ושום בדיקה לא השוותה אותה לשום דבר.

   מה נכנס
   -------
   1. דף הבית.
   2. כל אפליקציה ש-stages.json אומר עליה "public", בסדר של DATA.APPS
      בדף הבית — **חוץ מ:**
      - `external` בלי כתובת משלה — כרטיס-הכינוי english-bagrut.
        **external עם כתובת (״תאוריה מדברת״) — נכנסת**, בהכרעת הבעלים
        1.10.2026 (״רוץ — תוסיף את תאוריה מדברת למפת האתר״). הכתובת
        נלקחת משדה `u` בכרטיס שב-DATA.APPS — המופע החוקי היחיד של שם
        הריפו — ולא נכתבת כאן. בלי lastmod: ההיסטוריה שלה בריפו הנפרד.
        naming.js מתיר בדיוק את שורת ה-<loc> הזאת ב-sitemap.xml.
      - דף שיש בו <meta name="robots" content="noindex…"> — הדף עצמו
        הוא מקור האמת לשאלה אם לאנדקס אותו. כך יצאה rakia.
   3. EXTRA — דפים שאינם אפליקציה ומיועדים לציבור.

   מה נאכף בנוסף
   -------------
   - אפליקציה שאינה public (מאחורי השער הפנימי) — אינה במפה, וחייבת
     noindex בדף.
   - lastmod של כל כתובת = תאריך הקומיט האחרון שנגע בתיקייה (git,
     תאריך המבצע). תיקייה עם שינוי שעוד לא נשמר — היום. ולכן מי
     שמשנה אפליקציה מריץ את הכלי הזה לפני ה-commit, בדיוק כמו
     status.js. בריפו shallow התאריכים אינם אמינים, ו---check מדלג
     על lastmod בלבד ואומר את זה.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SITE = 'https://bekol.co.il/';
const FILE = path.join(ROOT, 'sitemap.xml');
const CHECK = process.argv.includes('--check');
const STAGES = require('./stages.json');

/* דפים לציבור שאינם אפליקציה. */
const EXTRA = ['teachers', 'legal'];
/* changefreq/priority — ברירת מחדל, ומה שחורג ממנה. */
const DEF = { changefreq: 'monthly', priority: '0.9' };
const META = {
  '':         { changefreq: 'weekly',  priority: '1.0' },
  'math-uni': { priority: '0.8' }, 'math-uni2': { priority: '0.8' }, 'math-uni3': { priority: '0.8' },
  'lomda':    { changefreq: 'weekly' },
  'reader':   { priority: '0.8' },
  'kotvim':   { priority: '0.7' },
  'teachers': { priority: '0.6' },
  'legal':    { changefreq: 'yearly', priority: '0.3' },
};

function git(args) {
  try { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim(); }
  catch (e) { return ''; }
}
const SHALLOW = git(['rev-parse', '--is-shallow-repository']) === 'true';
const TODAY = (() => { const d = new Date(); return d.getFullYear() + '-' +
  String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();

/* הנתיב שהתאריך שלו קובע: דף הבית — index.html בלבד (שאר השורש אינו הדף). */
function pathsOf(id) { return id === '' ? ['index.html'] : [id]; }
function lastmod(id) {
  const ps = pathsOf(id);
  if (git(['status', '--porcelain', '--', ...ps])) return TODAY;
  return git(['log', '-1', '--format=%cs', '--', ...ps]) || TODAY;
}
function page(id) {
  const f = path.join(ROOT, id, 'index.html');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
}
const NOINDEX = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i;

function homeOrder() {
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = home.match(/var DATA=(\{"APPS".*?\});\s*\nvar APPS/s);
  if (!m) throw new Error('לא נמצא בלוק DATA ב-index.html');
  return JSON.parse(m[1]).APPS;
}

const apps = STAGES.apps;
const CARDS = homeOrder();
const order = CARDS.map(a => a.id);
/* כתובת מפורשת מהכרטיס — רק כשהיא על הדומיין הזה. */
const URL_OF = {};
for (const a of CARDS) if (a.u && a.u.startsWith(SITE)) URL_OF[a.id] = a.u;
const locOf = id => URL_OF[id] || SITE + (id ? id + '/' : '');
/* public שאינה בדף הבית — בסוף, לפי stages.json, כדי שלא תיעלם בשקט. */
const pub = order.concat(Object.keys(apps).filter(k => !order.includes(k)))
  .filter(id => apps[id] && apps[id].stage === 'public');
const skipped = [];
const ids = [''];
for (const id of pub) {
  if (apps[id].external) {
    if (URL_OF[id]) ids.push(id);
    else skipped.push(`${id} — external בלי כתובת משלה (כינוי)`);
    continue;
  }
  const src = page(id);
  if (!src) { skipped.push(`${id} — אין ${id}/index.html`); continue; }
  if (NOINDEX.test(src)) { skipped.push(`${id} — noindex בדף`); continue; }
  ids.push(id);
}
for (const id of EXTRA) ids.push(id);

function build() {
  const head = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  למידה שנשמעת — מפת האתר.

  **נגזרת, לא נכתבת ביד:** node .claude/qa/sitemap.js כותב אותה,
  ו---check ב-all.js נופל כשהיא נסחפת. מקור האמת: stages.json
  (public), הסדר של DATA.APPS, ו-noindex בדף עצמו. lastmod = הקומיט
  האחרון שנגע בתיקייה.

  ״תאוריה מדברת״ יושבת בריפו נפרד ונכנסת לכאן בהכרעת הבעלים
  (1.10.2026), בלי lastmod — ההיסטוריה שלה שם. **מה לא כאן, ובכוונה:**
  rakia — מפת לידה, לא
  אפליקציית לימוד — נושאת noindex (הכרעת הבעלים 1.10.2026). אפליקציות
  מאחורי השער הפנימי — noindex, ואינן כאן. /voice/ חסום ב-robots.txt.
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  const body = ids.map(id => {
    const m = Object.assign({}, DEF, META[id] || {});
    return `  <url>
    <loc>${locOf(id)}</loc>
${URL_OF[id] ? '' : `    <lastmod>${lastmod(id)}</lastmod>\n`}    <changefreq>${m.changefreq}</changefreq>
    <priority>${m.priority}</priority>
  </url>
`;
  }).join('');
  return head + body + '</urlset>\n';
}

/* --- אכיפה שאינה תלויה במחולל: השער הפנימי, ו-noindex מול המפה --- */
const locsOf = xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
function gate(xml) {
  const out = [], ls = locsOf(xml);
  for (const [id, v] of Object.entries(apps)) {
    if (v.stage === 'public' || v.external) continue;
    if (ls.includes(SITE + id + '/')) out.push(`${id} (${v.stage}) — במפה, ואינה public`);
    const src = page(id);
    if (src && !NOINDEX.test(src)) out.push(`${id} (${v.stage}) — אין noindex בדף`);
  }
  for (const l of ls) {
    const id = l.replace(SITE, '').replace(/\/$/, '');
    const src = id ? page(id) : fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    if (src && NOINDEX.test(src)) out.push(`${l} — במפה, והדף אומר noindex`);
  }
  return out;
}
const cur = fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8') : '';
const locs = locsOf(cur);

if (!CHECK) {
  const xml = build();
  fs.writeFileSync(FILE, xml);
  const bad = gate(xml);
  console.log(`sitemap.xml נכתב: ${ids.length} כתובות`);
  for (const s of skipped) console.log(`  · בחוץ: ${s}`);
  for (const b of bad) console.log(`  ✗ ${b}`);
  process.exit(bad.length ? 1 : 0);
}

const bad = gate(cur);
let want = build();
let have = cur;
if (SHALLOW) {
  console.log('· ריפו shallow — lastmod לא נבדק (התאריכים מ-git אינם אמינים)');
  const strip = s => s.replace(/<lastmod>[^<]*<\/lastmod>/g, '<lastmod/>');
  want = strip(want); have = strip(have);
}
const wantLocs = ids.map(locOf);
for (const l of wantLocs) if (!locs.includes(l)) bad.push(`${l} — חסרה במפה`);
for (const l of locs) if (!wantLocs.includes(l)) bad.push(`${l} — במפה, ואינה אמורה להיות`);
if (!SHALLOW) for (const id of ids.filter(i => !URL_OF[i])) {
  const l = locOf(id);
  const blk = (cur.split('<url>').find(b => b.includes(`<loc>${l}</loc>`)) || '');
  const lm = (blk.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
  if (locs.includes(l) && lm !== lastmod(id)) bad.push(`${l} — lastmod ${lm || 'חסר'}, הקומיט האחרון ${lastmod(id)}`);
}
if (want !== have) {
  const w = want.split('\n'), h = have.split('\n');
  for (let i = 0; i < Math.max(w.length, h.length); i++)
    if (w[i] !== h[i]) { bad.push(`שורה ${i + 1}: בקובץ «${(h[i] || '').trim()}», צריך «${(w[i] || '').trim()}»`); break; }
  bad.push('sitemap.xml נסחף — הריצו: node .claude/qa/sitemap.js');
}
for (const s of skipped) console.log(`· בחוץ: ${s}`);
if (bad.length) { for (const b of bad) console.log('✗ ' + b); process.exit(1); }
console.log(`✓ sitemap.xml: ${ids.length} כתובות, תואם ל-stages.json, ל-noindex ול-git`);
