/* =====================================================================
   דוח תוכן שמתאר עץ שכבר אינו קיים.

     node .claude/qa/fresh.js [root]

   כל דוח ב-`reports/` נושא `sig` — חתימת קובצי התוכן שנסרקו,
   בלי מחרוזות הגרסה. כאן היא מחושבת מחדש ומושווית. נפרדו —
   הדוח מיושן, ויש להריץ את הסורק שכתב אותו.

   הרקע המלא, ובכללו המדידה שהולידה את הבדיקה, נמצא ב-`sig.js`.

   **הבדיקה אינה קוראת את התוכן ואינה שופטת אותו** — היא אומרת
   דבר אחד: האם מה שכתוב בדוח נמדד על מה שיושב בעץ עכשיו.

   **`[root]` בודק worktree של קומיט אחר**, כמו ב-`josh.js`,
   `brain.js`, `guide.js` ו-`markers.js`. עד 14.9.2026 הארגומנט
   לא היה קיים כאן ו**נבלע בשקט**: `fresh.js /tmp/worktree` מדד
   את עץ העבודה הנוכחי והדפיס ״10 דוחות, כולם על התוכן שבעץ״ על
   קומיט שה-CI הפיל באותו רגע. זו התשובה הנכונה לשאלה אחרת.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { sigOf, sourcesOf } = require('./sig.js');

const DIR = __dirname;
const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(DIR, '..', '..');
const OUT = path.join(ROOT, '.claude', 'qa', 'reports');
const TOOL = { 'bagrut-806': 'content806.js' };

if (!fs.existsSync(OUT)) { console.log('אין תיקיית reports — אין מה לבדוק.'); process.exit(0) }

const rows = [];
let bad = 0;
for (const f of fs.readdirSync(OUT).filter(x => x.endsWith('.json') && x !== 'summary.json').sort()) {
  const app = f.replace(/\.json$/, '');
  let R;
  try { R = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')) }
  catch (e) { rows.push(['✗', app, 'הדוח אינו נקרא — ' + e.message]); bad++; continue }

  const now = sigOf(app, ROOT);
  if (!now) { rows.push(['·', app, 'אין קובצי תוכן בעץ — מדולג']); continue }

  const tool = TOOL[app] || 'content.js';
  if (!R.sig) {
    rows.push(['✗', app, 'הדוח נכתב לפני שהחתימה קיימת — `node .claude/qa/' + tool + ' ' + app + '`']);
    bad++; continue;
  }
  if (R.sig !== now) {
    rows.push(['✗', app, 'התוכן זז מאז הסריקה (' + R.sig + ' → ' + now + ') — `node .claude/qa/' + tool + ' ' + app + '`']);
    bad++; continue;
  }
  rows.push(['✓', app, (R.verdict || '?') + ' · ' + sourcesOf(app, ROOT).length + ' קובצי תוכן · ' + R.sig]);
}

for (const r of rows) console.log(r[0] + ' ' + r[1].padEnd(12) + ' ' + r[2]);
console.log('');
console.log(bad ? bad + ' דוחות מתארים עץ אחר' : rows.length + ' דוחות, כולם על התוכן שבעץ');
process.exit(bad ? 1 : 0);
