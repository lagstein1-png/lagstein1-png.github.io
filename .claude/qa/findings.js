/* =====================================================================
   findings.js — FINDINGS.md מחזיק את השבוע האחרון; הישן עובר לארכיון

     node .claude/qa/findings.js            מה היה עובר לארכיון, בלי לגעת
     node .claude/qa/findings.js --check    נופל אם יש מה להעביר (רץ ב-all.js)
     node .claude/qa/findings.js --archive  מעביר ל-docs/claude/findings-archive.md

   **למה זה קיים (O-85, 19.9.2026).** `FINDINGS.md` נקרא בפתיחת כל
   סשן, והוא היה 766,905 בייטים / 10,927 שורות — 87.5% מכל חומר
   הפתיחה, ו-52% ממנו רשומות ״נסגר״ ישנות משבוע. הקובץ צמח
   +1,181 שורות ביום אחד. הכלל: ״נסגר״ מחזיק רשומות מ-DAYS הימים
   האחרונים; רשומה ישנה יותר עוברת כלשונה לארכיון, בסדר הקובץ
   (החדש למעלה). ״פתוח״ אינו נוגע — ממצא פתוח נשאר פתוח.

   **מה נחשב רשומה.** כותרת `###` שיש בה תאריך `d.m.yyyy` (ראשון
   בכותרת), עד הכותרת המתוארכת הבאה. כותרת `###` בלי תאריך היא
   תת־סעיף של הרשומה שלפניה ונוסעת איתה. הטבלה שבראש ״נסגר״ (שורות
   `| O-`) לפני הרשומה הראשונה נשארת. בקובץ יש בדיוק שני `## ` —
   ״פתוח״ ו-״נסגר״ (O-92: תשעה סעיפים מתוארכים נכתבו כ-`##` אחרי
   ״נסגר״ במקום בתוכו; `--archive` מוריד אותם ל-`###`).

   **המספרים כאן נספרים, לא נזכרים.** הפלט אומר כמה רשומות וכמה
   שורות, מהקובץ שעל הדיסק.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'FINDINGS.md');
const DST = path.join(ROOT, 'docs', 'claude', 'findings-archive.md');
const DAYS = Number(process.env.FINDINGS_DAYS || 7);
const CHECK = process.argv.includes('--check');
const ARCHIVE = process.argv.includes('--archive');

const lines = fs.readFileSync(SRC, 'utf8').split('\n');
const iOpen = lines.findIndex(l => /^## פתוח/.test(l));
const iClosed = lines.findIndex(l => /^## נסגר/.test(l));
if (iOpen < 0 || iClosed < 0) { console.log('✗ FINDINGS.md: חסר ״## פתוח״ או ״## נסגר״'); process.exit(1) }

/* O-92: סעיף `##` מתוארך אחרי ״נסגר״ הוא רשומה, ויורד ל-`###`. */
let demoted = 0;
for (let i = iClosed + 1; i < lines.length; i++)
  if (/^## /.test(lines[i])) { lines[i] = '#' + lines[i]; demoted++; }

function dateOf(l) {
  const m = l.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  return m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])) : null;
}
const today = new Date(); today.setUTCHours(0, 0, 0, 0);
const cut = new Date(today.getTime() - DAYS * 86400000);

/* רשומות: מכותרת ### מתוארכת עד הבאה. */
const heads = [];
for (let i = iClosed + 1; i < lines.length; i++)
  if (/^### /.test(lines[i]) && dateOf(lines[i])) heads.push(i);
const entries = heads.map((h, k) => ({ start: h, end: k + 1 < heads.length ? heads[k + 1] : lines.length,
                                        date: dateOf(lines[h]), title: lines[h] }));
const old = entries.filter(e => e.date < cut);
const oldLines = old.reduce((n, e) => n + (e.end - e.start), 0);

const stamp = d => `${d.getUTCDate()}.${d.getUTCMonth() + 1}.${d.getUTCFullYear()}`;
console.log(`${entries.length} רשומות ב״נסגר״, ${old.length} ישנות מ-${DAYS} ימים (לפני ${stamp(cut)}) — ${oldLines} מתוך ${lines.length} שורות` +
            (demoted ? ` · ${demoted} סעיפי ## שהיו מחוץ ל״נסגר״` : ''));

if (ARCHIVE) {
  if (!old.length && !demoted) { console.log('✓ אין מה להעביר'); process.exit(0) }
  const moved = [];
  for (const e of old) moved.push(...lines.slice(e.start, e.end));
  const keep = [];
  for (let i = 0; i < lines.length; i++) {
    const e = old.find(x => i >= x.start && i < x.end);
    if (!e) keep.push(lines[i]);
  }
  const HEAD = ['# ממצאים — הארכיון',
    '',
    '> רשומות ״נסגר״ ישנות משבוע, שהועברו כלשונן מ-`FINDINGS.md` על ידי',
    '> `node .claude/qa/findings.js --archive`. החדש למעלה. **לא עורכים כאן ביד**',
    '> ולא מוחקים: זה הזיכרון של המאגר, וההוכחות שמצוטטות ב-`FINDINGS.md`',
    '> וב-`CHANGELOG.md` מפנות לכאן. ממצא פתוח לעולם אינו כאן — הוא ב-`FINDINGS.md`.',
    '', '---', ''];
  let prev = [];
  if (fs.existsSync(DST)) {
    const cur = fs.readFileSync(DST, 'utf8').split('\n');
    const sep = cur.indexOf('---');
    prev = sep >= 0 ? cur.slice(sep + 1) : cur;
  }
  fs.writeFileSync(DST, HEAD.concat(moved, prev).join('\n').replace(/\n{3,}/g, '\n\n'));
  fs.writeFileSync(SRC, keep.join('\n').replace(/\n{3,}/g, '\n\n'));
  console.log(`✓ הועברו ${old.length} רשומות, ${moved.length} שורות → docs/claude/findings-archive.md · FINDINGS.md עכשיו ${keep.length} שורות`);
  process.exit(0);
}

const bad = old.length || demoted;
console.log(bad
  ? `✗ FINDINGS.md נושא ${old.length} רשומות ישנות מ-${DAYS} ימים${demoted ? ` ו-${demoted} סעיפי ## מחוץ ל״נסגר״` : ''} — node .claude/qa/findings.js --archive`
  : `✓ FINDINGS.md מחזיק רק את ${DAYS} הימים האחרונים, ושני ## בלבד`);
process.exit(CHECK && bad ? 1 : 0);
