/* =====================================================================
   מריץ את כל חבילת הבדיקות ונותן פסק דין אחד.

     node .claude/qa/all.js           הכול
     node .claude/qa/all.js --fast    בלי entropy ו-options (הכי איטיות)

   הוא מרים את השרת המקומי בעצמו וסוגר אותו בסוף, כי שלוש מהבדיקות
   דורשות אותו ושכחה שלו נראית בדיוק כמו כישלון אמיתי.

   למה הוא קיים
   ------------
   היו שתים־עשרה בדיקות ואף אחת לא רצה מעצמה. מי שנגע בקובץ אחד הריץ
   בדיקה אחת, וזה בדיוק המקום שממנו נולדת סחיפה: הבדיקה שהייתה תופסת
   את הבאג היא זו שלא הורצה.

   **וארבע מהן היו יוצאות 0 גם כשמצאו ממצאים** — parse, smoke,
   entropy ו-options הדפיסו PARSE FAIL או ERRORS וסיימו בהצלחה.
   כל רתמה שנשענת על קוד יציאה הייתה עיוורת לשליש מהחבילה. זה תוקן
   באותו commit שהוסיף את הקובץ הזה.

   קו הבסיס של החבילה כולה הוא אפס. כישלון כאן הוא ממצא אמיתי.
   ===================================================================== */
'use strict';

const { spawn, spawnSync } = require('child_process');
const path = require('path');

const QA = __dirname;
const FAST = process.argv.includes('--fast');
const APPS = ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
              'english', 'history', 'ulpan'];
const PAGES = APPS.concat(['bagrut-806', 'reader', '.']);

/* הבדיקות, לפי הסדר שבו כדאי לראות אותן: המהירות קודם, כדי
   שכישלון זול יעצור לפני שמחכים לדפדפן. */
const SUITE = [
  { id: 'parse',    args: PAGES.filter(p => p !== '.').map(a => a + '/index.html').concat(['index.html']) },
  { id: 'cache',    args: [] },
  { id: 'apps',     args: [] },
  { id: 'a11y',     args: [] },
  { id: 'engine',   args: [] },
  { id: 'exam806',  args: [] },
  { id: 'smoke',    args: PAGES,  needsServer: true },
  { id: 'exam',     args: [],     needsServer: true },
  { id: 'entropy',  args: APPS,   needsServer: true, slow: true },
  { id: 'options',  args: APPS,   needsServer: true, slow: true },
];

const plan = SUITE.filter(t => !(FAST && t.slow));
const needServer = plan.some(t => t.needsServer);

let server = null;
if (needServer) {
  server = spawn(process.execPath, [path.join(QA, 'serve.js')],
                 { cwd: process.cwd(), stdio: 'ignore' });
  /* המתנה קצרה עד שהפורט מקשיב. spawnSync על curl היה תלות נוספת. */
  spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},1500)']);
}

const stop = () => { if (server && !server.killed) try { server.kill() } catch (e) {} };
process.on('exit', stop);
process.on('SIGINT', () => { stop(); process.exit(130); });

const results = [];
let failed = 0;

for (const t of plan) {
  process.stdout.write(`── ${t.id} `.padEnd(72, '─') + '\n');
  const r = spawnSync(process.execPath, [path.join(QA, t.id + '.js')].concat(t.args),
                      { cwd: process.cwd(), stdio: 'inherit' });
  const code = r.status === null ? 1 : r.status;
  results.push([t.id, code]);
  if (code) failed++;
  process.stdout.write('\n');
}

stop();

console.log('═'.repeat(72));
for (const [id, code] of results) {
  console.log(`  ${code ? '✗' : '✓'} ${id.padEnd(10)} ${code ? 'exit ' + code : ''}`);
}
if (FAST) console.log('  · entropy, options — דולגו (--fast)');
console.log('═'.repeat(72));
console.log(failed
  ? `${failed} מתוך ${results.length} נכשלו`
  : `${results.length} בדיקות, כולן עברו`);

process.exit(failed ? 1 : 0);
