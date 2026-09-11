/* =====================================================================
   מריץ את כל חבילת הבדיקות ונותן פסק דין אחד.

     node .claude/qa/all.js           הכול
     node .claude/qa/all.js --fast    בלי entropy ו-options (הכי איטיות)
     node .claude/qa/all.js --static  רק מה שאינו דורש דפדפן (שניות)

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
/* --static מפיל כל בדיקה שדורשת דפדפן. נועד לשער שרץ בסיום עבודה:
   הוא חייב להיות מהיר מספיק שלא יכבו אותו, ושש־עשרה הבדיקות
   שנשארות קוראות קוד בלבד. */
const STATIC = process.argv.includes('--static');
const APPS = ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3', 'lomda',
              'english', 'history', 'ulpan'];
const PAGES = APPS.concat(['bagrut-806', 'reader', '.']);

/* הבדיקות, לפי הסדר שבו כדאי לראות אותן: המהירות קודם, כדי
   שכישלון זול יעצור לפני שמחכים לדפדפן. */
const SUITE = [
  { id: 'parse',    args: PAGES.filter(p => p !== '.').map(a => a + '/index.html').concat(['index.html']) },
  { id: 'cache',    args: [] },
  { id: 'storage',  args: [] },
  { id: 'naming',   args: [] },
  { id: 'apps',     args: [] },
  /* שער השלבים. קו הבסיס שלו הוא אפס FAIL והוא רץ בלי דפדפן, ולכן
     הוא כאן. content.js אינו כאן במתכוון: קו הבסיס שלו אינו אפס —
     הוא מדווח REVIEW שדורש עין אנושית — והוא היה צובע את הריצה
     באדום לתמיד. מריצים אותו ביד, כמתואר ב-README. */
  { id: 'stage',    args: [] },
  { id: 'status',   args: ['--check'] },
  { id: 'wix',      args: ['--check'] },
  { id: 'banks',    args: [] },
  /* התוכן של ״כותבים ביחד״. content.js אינו סורק אותה — כל תשע
     המשפחות שלו מודדות שאלה, ואין שם שאלה. */
  { id: 'kotvim',   args: [] },
  { id: 'leaks',    args: [] },
  { id: 'markers',  args: [] },
  /* שמות הכפתורים שב-GUIDE.md מול הממשק. המדריך צבר שלוש דריפטות
     תוך יממה, ואיש לא ידע עד שקראו אותו. */
  { id: 'guide',    args: [] },
  { id: 'century',  args: [] },
  { id: 'content806', args: [] },
  /* `content.js` עצמו אינו כאן, כאמור למעלה — אבל **הדוחות שהוא
     השאיר כן**. `fresh.js` אינו קורא תוכן ואינו שופט אותו; הוא
     שואל דבר אחד, האם הדוח נמדד על העץ שיושב כאן עכשיו. קו
     הבסיס שלו הוא אפס, ולכן הוא מתאים לריצה הזאת.
     נמדד 10.9.2026: `reports/lomda.json` שב-`main` אמר `REVIEW`
     על תוכן שזז אחריו בשני קומיטים. `stage.js` קורא `verdict`
     מאותו קובץ, ולכן `PASS` מיושן היה מעביר בשער תוכן שלא נסרק. */
  { id: 'fresh',    args: [] },
  { id: 'a11y',     args: [] },
  { id: 'fonts',    args: [] },
  { id: 'engine',   args: [] },
  { id: 'exam806',  args: [] },
  { id: 'tutor',    args: [] },
  { id: 'smoke',    args: PAGES,  needsServer: true },
  { id: 'say',      args: [],     needsServer: true },
  /* מה שבאמת מגיע למנוע ההקראה. content.js מודד שדה שנדגם; זה מריץ
     את speakMath על שאלות שנבנו וקורא את הפלט. תפס ^ גולמי ב-math-uni2
     בזמן ש-content.js החזיר עליה PASS. */
  { id: 'saysym',   args: [],     needsServer: true },
  /* האם אפשר לקלוע בלי לדעת את החומר. content.js מדווח את אותו
     דבר כ-REVIEW — כלומר כשאלה שאפשר לדלג עליה — ושני תאים הגיעו
     ככה ל-100% ונשארו בייצור. כאן זה שער חוסם. */
  { id: 'guess',    args: [],     needsServer: true },
  { id: 'clicks',   args: [],     needsServer: true },
  { id: 'langbtn',  args: [],     needsServer: true },
  /* מנוע ההקראה מול speechSynthesis מזויף. slow: הוא ממתין 9.8
     שניות לכל אפליקציה כדי לראות את שומר-הער פועם. */
  { id: 'voice',    args: [],     needsServer: true, slow: true },
  { id: 'exam',     args: [],     needsServer: true },
  { id: 'entropy',  args: APPS,   needsServer: true, slow: true },
  { id: 'options',  args: APPS,   needsServer: true, slow: true },
];

const plan = SUITE.filter(t => !(FAST && t.slow) && !(STATIC && t.needsServer));
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
if (STATIC) console.log('  · כל הבדיקות שדורשות דפדפן — דולגו (--static)');
else if (FAST) console.log('  · entropy, options — דולגו (--fast)');
console.log('═'.repeat(72));
console.log(failed
  ? `${failed} מתוך ${results.length} נכשלו`
  : `${results.length} בדיקות, כולן עברו`);

process.exit(failed ? 1 : 0);
