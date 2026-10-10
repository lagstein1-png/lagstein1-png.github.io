/* =====================================================================
   audio-move.js — בונה את עצי שני ריפואי הקול מהעץ הזה.

     node .claude/qa/audio-move.js                   מה ייבנה, בלי לכתוב
     node .claude/qa/audio-move.js --build <תיקייה>  בונה את שני העצים
     node .claude/qa/audio-move.js --check <תיקייה>  המניפסטים מול עץ שנבנה

   **למה.** האתר המפורסם חצה את מגבלת ה-1GB של GitHub Pages (O-191),
   ו-984MB מתוכו הם 22,406 קובצי MP3. הכרעת הבעלים 10.10.2026:
   הקבצים עוברים לריפואים נפרדים, וכל אחד מהם אתר Pages משלו.

   **הוא מעתיק ואינו מוחק.** המחיקה מהריפו הזה היא קומיט נפרד ומפורש,
   כדי שהחזרה אחורה תהיה `git revert` אחד — ולא חיפוש של 984MB
   בהיסטוריה. עד שהריפואים חיים, הקבצים יושבים בשני מקומות, וזה
   בכוונה: אין רגע שבו הם במקום אחד בלבד.

   **הפריסה זהה למקומית** — `<אפליקציה>/audio/<שפה>/<מזהה>.mp3` —
   ולכן `recorded.js` מחשב את אותו נתיב בדיוק, רק עם מקור אחר.
   המניפסטים **אינם** עוברים: הם נשארים בריפו הזה, קטנים, נטענים
   ב-`no-cache`, וכך השאלה ״יש קובץ?״ נשארת ללא CORS.

   **`.nojekyll` חייב להיות שם.** בלעדיו Pages מריץ Jekyll, שמתעלם
   מכל קובץ ותיקייה שמתחילים בקו תחתון ומטפל ב-22 אלף קבצים לאט.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const argv = process.argv.slice(2);
const MODE = argv.includes('--build') ? 'build' : argv.includes('--check') ? 'check' : 'plan';
const OUT = argv[argv.indexOf('--' + MODE) + 1];
const REPO = { 1: 'bekol-audio', 2: 'bekol-audio2' };

function on2() {
  const src = fs.readFileSync(path.join(ROOT, 'speech', 'recorded.js'), 'utf8');
  const m = src.match(/var ON_2 = \{([\s\S]*?)\};/);
  if (!m) { console.log('✗ אין ON_2 ב-speech/recorded.js'); process.exit(1); }
  const out = {};
  for (const k of m[1].matchAll(/["']?([A-Za-z0-9_-]+)["']?\s*:\s*1/g)) out[k[1]] = 1;
  return out;
}
const ON_2 = on2();

/* --- מה יש: אפליקציה → שפה → רשימת קבצים --- */
const apps = [];
for (const d of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name[0] === '.') continue;
  const a = path.join(ROOT, d.name, 'audio');
  if (!fs.existsSync(a)) continue;
  const langs = {};
  let n = 0;
  for (const lg of fs.readdirSync(a, { withFileTypes: true })) {
    if (!lg.isDirectory()) continue;
    const mp3 = fs.readdirSync(path.join(a, lg.name)).filter(f => f.endsWith('.mp3'));
    if (!mp3.length) continue;
    langs[lg.name] = mp3; n += mp3.length;
  }
  if (!n) continue;
  apps.push({ app: d.name, langs, n, b: ON_2[d.name] ? 2 : 1 });
}
apps.sort((x, y) => y.n - x.n);

const tot = b => apps.filter(a => a.b === b).reduce((s, a) => s + a.n, 0);

if (MODE === 'plan') {
  console.log('אפליקציה           דלי  קליפים  שפות');
  for (const a of apps) console.log(a.app.padEnd(18) + String(a.b).padStart(3) + String(a.n).padStart(8) + '  ' + Object.keys(a.langs).join(','));
  console.log('-'.repeat(46));
  console.log(`דלי 1 → ${REPO[1]}:  ${tot(1)} קליפים`);
  console.log(`דלי 2 → ${REPO[2]}: ${tot(2)} קליפים`);
  console.log(`\nבנייה:  node .claude/qa/audio-move.js --build /נתיב/לתיקייה`);
  process.exit(0);
}

if (!OUT) { console.log(`✗ --${MODE} דורש נתיב לתיקייה`); process.exit(1); }

const README = b => `# ${REPO[b]}

קובצי הקול המוקלטים של **bekol.co.il** — מאגר ${b} מתוך שניים.

הקבצים נוצרים ב-\`.claude/qa/record.js\` שבריפו האתר, על רנר של GitHub
עם המפתח שב-Secrets, ולעולם לא בדפדפן. **אין לערוך אותם ביד.**

הפריסה: \`<אפליקציה>/audio/<שפה>/<מזהה>.mp3\`. המזהה הוא גיבוב של הטקסט
המוצג, ולכן עריכת ניסוח מייצרת מזהה חדש ולעולם לא מנוגן קליפ ישן על
טקסט שהשתנה. רשימת המזהים שיש להם קובץ — \`<אפליקציה>/audio/manifest.json\`
— יושבת בריפו האתר ולא כאן, כדי שהשאלה ״יש קובץ?״ לא תעבור מקור.

המאגר מוגש ב-GitHub Pages. **מגבלת אתר Pages היא 1GB**, ולכן יש שניים
והחלוקה נאכפת ב-\`.claude/qa/audio-size.js\` שבריפו האתר.
`;

if (MODE === 'build') {
  let wrote = 0;
  for (const b of [1, 2]) {
    const dir = path.join(OUT, REPO[b]);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, '.nojekyll'), '');
    fs.writeFileSync(path.join(dir, 'README.md'), README(b));
    for (const a of apps.filter(x => x.b === b)) {
      for (const lg of Object.keys(a.langs)) {
        const dst = path.join(dir, a.app, 'audio', lg);
        fs.mkdirSync(dst, { recursive: true });
        for (const f of a.langs[lg]) {
          fs.copyFileSync(path.join(ROOT, a.app, 'audio', lg, f), path.join(dst, f));
          wrote++;
        }
      }
    }
    console.log(`✓ ${REPO[b]}: ${tot(b)} קליפים ב-${dir}`);
  }
  console.log(`\n${wrote} קבצים הועתקו. הריפו הזה לא נגע — המחיקה ממנו היא קומיט נפרד.`);
  console.log(`\nדחיפה (לכל אחד מהשניים, אחרי שהריפו נוצר ב-GitHub):`);
  for (const b of [1, 2]) {
    console.log(`  cd ${path.join(OUT, REPO[b])} && git init -b main && git add -A \\`);
    console.log(`    && git commit -m "הקלטות: ${tot(b)} קליפים מ-bekol.co.il" \\`);
    console.log(`    && git remote add origin https://github.com/lagstein1-png/${REPO[b]}.git \\`);
    console.log(`    && git push -u origin main`);
  }
  console.log(`\nואז Settings → Pages → Deploy from a branch → main / (root) בכל אחד,`);
  console.log(`ואז HOST_1 ו-HOST_2 ב-speech/recorded.js ו-AUDIO ב-41 קובצי sw.js.`);
  process.exit(0);
}

/* --- check: המניפסט מול עץ שנבנה --- */
let bad = 0, ok = 0;
for (const a of apps) {
  const mf = path.join(ROOT, a.app, 'audio', 'manifest.json');
  if (!fs.existsSync(mf)) { console.log(`✗ ${a.app} — אין manifest.json`); bad++; continue; }
  let m;
  try { m = JSON.parse(fs.readFileSync(mf, 'utf8')); } catch (e) { console.log(`✗ ${a.app} — manifest.json שבור`); bad++; continue; }
  const base = path.join(OUT, REPO[a.b], a.app, 'audio');
  let miss = 0, have = 0;
  for (const lg of Object.keys(m.langs || {})) {
    for (const id of (m.langs[lg].ids || [])) {
      if (fs.existsSync(path.join(base, lg, id + '.mp3'))) have++; else miss++;
    }
  }
  if (miss) { console.log(`✗ ${a.app.padEnd(16)} ${miss} מזהים במניפסט בלי קובץ ב-${REPO[a.b]}`); bad++; }
  else { console.log(`✓ ${a.app.padEnd(16)} ${have} מזהים, כולם בדלי ${a.b}`); ok++; }
}
console.log(`\n${ok} אפליקציות תואמות, ${bad} ממצאים`);
process.exit(bad ? 1 : 0);
