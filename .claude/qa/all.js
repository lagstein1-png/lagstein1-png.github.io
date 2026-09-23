/* =====================================================================
   מריץ את כל חבילת הבדיקות ונותן פסק דין אחד.

     node .claude/qa/all.js           הכול
     node .claude/qa/all.js --fast    בלי הבדיקות המסומנות slow (הכי איטיות)
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
  { id: 'parse',    args: PAGES.filter(p => p !== '.').map(a => a + '/index.html').concat(['index.html', 'rakia/index.html']) },
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
  /* רשימת הכלים ב-qa-tools.md מול SUITE הזה — מחולל עם --check,
     כפי שהכלל דורש. נמדד 19.9.2026: 24 מזהים חסרו במסמך. */
  { id: 'suite',    args: ['--check'] },
  /* FINDINGS.md מחזיק שבוע; הישן בארכיון (O-85). --archive מעביר. */
  { id: 'findings', args: ['--check'] },
  /* שלושה כללים שהיו כתובים ב-CLAUDE.md בלבד, ונאכפים מ-16.9.2026.
     כל אחד מצא משהו ביום שנכתב: pure — לולאת הנפילה של תרגיל
     הסידור ב-english וב-ulpan שקלה לפי state.item בתוך המבחן;
     i18n — מסיח ב-math-uni3 שהוחלף בלי מפתח ושלוש שפות ראו בעברית;
     agents — נקי, והוכח אדום במוטציה. */
  { id: 'pure',     args: [] },
  { id: 'i18n',     args: [] },
  { id: 'agents',   args: [] },
  /* שמות הכפתורים שב-GUIDE.md מול הממשק. המדריך צבר שלוש דריפטות
     תוך יממה, ואיש לא ידע עד שקראו אותו. */
  { id: 'guide',    args: [] },
  { id: 'century',  args: [] },
  /* `content.js` עצמו אינו כאן, כאמור למעלה — אבל **הדוחות שהוא
     השאיר כן**. `fresh.js` אינו קורא תוכן ואינו שופט אותו; הוא
     שואל דבר אחד, האם הדוח נמדד על העץ שיושב כאן עכשיו. קו
     הבסיס שלו הוא אפס, ולכן הוא מתאים לריצה הזאת.
     נמדד 10.9.2026: `reports/lomda.json` שב-`main` אמר `REVIEW`
     על תוכן שזז אחריו בשני קומיטים. `stage.js` קורא `verdict`
     מאותו קובץ, ולכן `PASS` מיושן היה מעביר בשער תוכן שלא נסרק.

     **והוא חייב לרוץ לפני כל סורק שכותב דוח — נמדד 18.9.2026.**
     `content806` ישב כאן מעליו, והוא **כותב** את
     `reports/bagrut-806.json` מהעץ. לכן כשהגיע תורו של `fresh`
     הדוח כבר היה טרי תמיד, ו-`fresh` **לא היה מסוגל ליפול על
     `bagrut-806` לעולם** — בדיוק ״בדיקה שמעולם לא נראתה אדומה
     אינה בודקת כלום״.

     כך שרדה החתימה השגויה מ-14.9 (`4a4bdbcc` במקום `38cf5d13`,
     הסיפור ב-`CLAUDE.md`) בתוך `main` ארבעה ימים, בזמן ש-CI היה
     ירוק. נמדד על אותו עץ בדיוק: `node .claude/qa/fresh.js` לבדו
     החזיר `✗ bagrut-806`, ו-`all.js --static` החזיר `✓ fresh`
     ו״46 בדיקות, כולן עברו״.

     `fresh` בודק מה **נדחף**, ולכן הוא חייב לראות את הדוחות
     כפי שהם בעץ — לפני שסורק כלשהו נגע בהם. */
  { id: 'fresh',    args: [] },
  { id: 'content806', args: [] },
  { id: 'a11y',     args: [] },
  { id: 'aria',     args: [] },
  { id: 'fonts',    args: [] },
  { id: 'engine',   args: [] },
  { id: 'exam806',  args: [] },
  { id: 'tutor',    args: [] },
  { id: 'hebrew',   args: [] },
  { id: 'langretry', args: [], ext: '.mjs' },
  /* הכתיב של ג׳וש. `JOSH.md` מחייב גרש עברי מהיום שהבוט נבנה, ואיש
     לא אכף — דף הבית נשא את שתי הצורות יחד. */
  { id: 'josh',     args: [] },
  /* מוח אחד, ואין שני. `josh-engine.js` היה מוח שלם בדפדפן שדף הבית
     טען — שם אחר, בלי CORE, ושאלה שלא נענתה הלכה ממנו לוויקיפדיה.
     הבדיקה אוכפת חיווט ולא קיום, ולכן אין לה רשימת פטורים. */
  { id: 'brain',    args: [] },
  /* ושכבת הפנים נשארת תצוגה. `brain.js` שומר שלא ייטען מוח שני;
     זה שומר שהפנים עצמן לא יהפכו לאחד. שני צדדים של אותו כלל. */
  { id: 'joshface', args: [] },
  /* והגלאי. `joshface` בודק קוד בלבד ודי לו; גלאי יכול להיות נקי
     מכל איסור ועדיין לדווח לא נכון, ולכן הבדיקה הזאת גם **מריצה**
     אותו — שישה־עשר תרחישים ב-vm נפרד לכל אחד. */
  { id: 'joshstate', args: [] },
  /* והצעה שהמוח המקומי מציע מתקיימת. ״רוצה שנסתכל על השאלה שעל
     המסך?״ → ״כן״ → השאלה מצוטטת, ולא רק ״יופי, בוא נסתכל״.
     16.9.2026: הבעלים ראה ״נעבור למסך״ בלי מעבר. */
  { id: 'offer',    args: [] },
  /* ״גרסה פשוטה״ ב-reader: הטקסט המודבק יוצא רק בלחיצה ורק במצב
     simplify, והמוח המקומי אומר שהוא מחלק ולא מקצר. הוכח אדום על
     העץ שלפני 17.9.2026 (6 נפילות, ואז קריסה) לפני שהוכח ירוק. */
  { id: 'simplify', args: [] },
  /* חוזה ספק החיפוש — שלב 5. `brain.js` שואל מה הדפדפן טוען; זה
     שואל על השרת ועל מה שכתוב ללומד, ומשווה את `SEARCH.md` לקוד. */
  { id: 'search',   args: [] },
  /* ומה שהדף מבטיח, ולא רק מה שהקוד עושה. `launch.js` פותח את הכול
     ללא חיוב, ותגית ה-meta — מה שגוגל וּוואטסאפ מציגים — אמרה
     ״שמונה בתשלום״ חודשיים. אף בדיקה לא הסתכלה לשם. */
  { id: 'money',    args: [] },
  /* ספירת כניסות — או בכל הדפים או באף אחד, והתנאים אומרים את זה
     בארבע שפות. ההסרה ב-10.9 מחקה את המשפט מהעברית בלבד, וחמישה
     ימים שלוש שפות סיפרו ללומד שהאתר סופר בזמן שלא נשלח דבר. */
  { id: 'analytics', args: [] },
  /* **claims דורשת שרת — סומן 15.9.2026.** היא רשומה כסטטית,
     אבל החלק השני שלה מריץ את clicks.js כדי לוודא שמספר שמצוטט
     ממנו במסמכי השיווק עדיין נכון — ו-clicks.js פותח דפדפן.
     בלי השרת היא נפלה על ERR_CONNECTION_REFUSED, כלומר
     `all.js --static` יצא אדום מסיבה שאינה קשורה לשינוי — וזה
     גם מה ששער ה-Stop מריץ. */
  { id: 'claims',  args: [],     needsServer: true },
  /* אורך המכתב שהכותרת מבטיחה מול המכתב עצמו. נמדד 15.9.2026:
     כל שבעת המכתבים נקבו במספר שגוי, בפער של תו אחד עד 126.
     שורת האורך היא ההוראה המעשית — מה נכנס להודעת וואטסאפ אחת. */
  { id: 'letters', args: [] },
  /* דף ההוראות לאפליקציה הבאה. נמדד 15.9.2026 — חמש טענות שגויות
     ישבו בו יחד, ואחת מהן סתרה את שער הפרסום שב-CLAUDE.md. */
  { id: 'skill',   args: [] },
  /* הכתוביות שנוצרו מהטבלאות מול הטבלאות עצמן. הכלל הראשון
     ב-video-scripts.md הוא ״כתוביות תמיד״, ותזמון שנשאר מאחור
     הוא כתובית שמופיעה על הפריים הלא נכון. */
  { id: 'srt',     args: [] },
  /* `marketing/index.html` הוא רינדור של אחד־עשר קובצי ה-.md, והוא
     נסחף בשקט: 16.9.2026 הוא נשא את הודעת התקשורת שכבר תוקנה
     ב-campaign.md, והניווט שלו הכריז ״facts.md · 9.3 KB״ על קובץ
     בן 10.1 KB. המחולל היה קיים — מי שבודק שהריצו אותו לא היה. */
  { id: 'mkreader', args: ['--check'] },
  /* סרטוני ההדגמה וצילומי ארבע השפות ב-marketing/media/ — נגזרים
     מ-DEMO_SCRIPT שבכל אפליקציה, וחתימת התסריט נשמרת ב-manifest.
     תסריט שהשתנה בלי הקלטה מחדש = סרטון שמראה אפליקציה אחרת. */
  { id: 'media',    args: [] },
  /* מספר תוכן שמצוטט בחומר שיווקי מול המדידה של היום. נמדד
     16.9.2026: 21 מתוך 21 היו מתים — ״20 מאגרים, 48 נושאים,
     1021 פריטים״ מול 23 · 57 · 1219, ו״18 נושאים״ ב״שלב״ מול 24.
     אחד מהם היה בגוף הודעה לתקשורת, ואחד בנראטיב מדובר. */
  { id: 'counts',  args: [] },
  /* learning-core/ — ספרייה שאיש אינו טוען, ושחסרים בה שלושה
     ממנגנוני ההקראה ותיקון pure. חוסמת אימוץ כל עוד הפער קיים. */
  { id: 'core',    args: [] },
  /* מנוע ברק — חוזה ה-Worker מול מודל מדומה (פעולות, אימות, שרשרת
     מודלים, פרטיות, תקציב הכתיבות) והחיווט בשלושה־עשר הדפים. */
  { id: 'barak',   args: [] },
  { id: 'hespeech', args: [] },
  /* השכבה המוקלטת — המנוע של תאוריה מדברת, 21.9.2026: המודול
     מנגן רק מה שבמניפסט ונופל לקול המכשיר; החיווט בארבע אפליקציות
     המאגר; והמניפסט של כל אפליקציה תואם לקבצים שעל הדיסק. */
  { id: 'recorded', args: [] },
  { id: 'record',   args: ['--check'] },
  /* רקיע — מפת לידה, 18.9.2026. גלילאו מודד את המנוע מול Swiss
     Ephemeris; content ו-safety את 469 הטקסטים; deps את אפס התלות;
     שני המחוללים את הטבלאות שאסור לערוך ביד. */
  { id: 'galileo',       args: [] },
  { id: 'rakia-content', args: [] },
  { id: 'rakia-safety',  args: [] },
  { id: 'deps',          args: [] },
  { id: 'rakia/mk-ephem',  args: ['--check'] },
  { id: 'rakia/mk-places', args: ['--check'] },
  { id: 'smoke',    args: PAGES.concat(['rakia']),  needsServer: true },
  /* מנוע ברק בדפדפן אמיתי מול Worker מדומה: ההקשר שנשלח, פעולה
     שמתבצעת באמת, פעולה שנכשלת ולא מוכרזת, אופליין ו-429. */
  { id: 'barak-browser', args: [], needsServer: true },
  /* השכבה המוקלטת בדפדפן אמיתי: משפט עם קובץ מנגן Audio ולא פונה
     ל-speechSynthesis; משפט בלי קובץ — ההפך. */
  { id: 'recorded', args: ['--browser'], needsServer: true },
  /* O-72 — ספק שתולה: שני נתיבי השליחה של הפאנל חוזרים תוך 12 שניות
     עם תשובה מקומית. הוכח אדום 18.9.2026: sendLegacy נשאר BUSY
     אחרי 13,329 ms כש-barak-core.js לא נטען. */
  { id: 'tutor-timeout', args: [], needsServer: true },
  /* השאלה שברק מקבל — בשפת המסך. צילום הבעלים 23.9.2026: שאלה עברית
     בראש ״Ask the teacher״. הוכח אדום על math-teen שלפני התיקון: 96/96. */
  { id: 'tutor-lang', args: [], needsServer: true },
  /* הפאנל של ברק כשהמקלדת פתוחה — `visualViewport` מזויף, 360 ו-412,
     עברית וערבית: אזור השיחה נראה, הדיוקן 56, הצעות גוללות, חזקות
     נשמרות, ואופליין. הוכחה אדומה על הקוד הישן: 28px לשיחה. */
  { id: 'keyboard', args: [], needsServer: true },
  /* **האם הטקסט בכלל נראה.** נבנתה 16.9.2026, אחרי שלושה מקומות
     של לבן־על־לבן שנמצאו בעין ב-15.9 (1.18:1 פעמיים, ו-1.76–2.98
     בכפתור הפעולה של ארבע אפליקציות). אף אחת מ-35 הבדיקות לא
     מדדה ניגודיות: a11y בודקת שהמצבים מחווטים, aria בודקת מיקוד
     ומאפיין פיזי — ואיש לא בדק אם רואים. */
  { id: 'contrast', args: [],     needsServer: true, slow: true },
  /* פונקציה גלובלית שנדרסה בשקט. `var txt=` בבלוק ה-TUTOR של
     math-teen דרס את בונה תוויות ה-SVG, וכל תוויות האיורים
     נמחקו — טריגונומטריה רמה 1 הגישה משולש בלי מספרים. אין
     שגיאה ואין מסך שבור, ו-47 הבדיקות עברו. */
  { id: 'shadow',   args: [],     needsServer: true },
  { id: 'say',      args: [],     needsServer: true },
  /* מה שבאמת מגיע למנוע ההקראה. content.js מודד שדה שנדגם; זה מריץ
     את speakMath על שאלות שנבנו וקורא את הפלט. תפס ^ גולמי ב-math-uni2
     בזמן ש-content.js החזיר עליה PASS. */
  { id: 'saysym',   args: [],     needsServer: true },
  /* האם אפשר לקלוע בלי לדעת את החומר. content.js מדווח את אותו
     דבר כ-REVIEW — כלומר כשאלה שאפשר לדלג עליה — ושני תאים הגיעו
     ככה ל-100% ונשארו בייצור. כאן זה שער חוסם. */
  { id: 'guess',    args: [],     needsServer: true },
  { id: 'visible',  args: [],     needsServer: true },
  { id: 'clearwhy', args: [],     needsServer: true },
  { id: 'clicks',   args: [],     needsServer: true },
  { id: 'langbtn',  args: [],     needsServer: true },
  /* ״שלב״ בארבע שפות בפועל (O-58): כל שדה שמוצג עובר trHTML, ההקראה
     בלי אות עברית, ומילה מתורגמת אינה צמודה לספרה. 18.9.2026 —
     ar 9 · ru 13 · en 15 שברי פיצול, ו-״10 процентов מתוך 40״ בקול. */
  { id: 'teen-i18n', args: [], needsServer: true },
  /* מנוע ההקראה מול speechSynthesis מזויף. slow: הוא ממתין 9.8
     שניות לכל אפליקציה כדי לראות את שומר-הער פועם. */
  { id: 'voice',    args: [],     needsServer: true, slow: true },
  { id: 'netpin',   args: [] },
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
  /* **`ext` — סיומת, ולא `.js` קשיח.** בדיקה שמייבאת את
     `worker.js` חייבת להיות ESM (`import` ו-`await` ברמה
     העליונה), והמוסכמה כאן היא `.mjs` — כמו `evals.mjs`.
     בלי השדה הזה הרַנר היה מחפש `langretry.js` שאינו קיים,
     והבדיקה הייתה ״נכשלת״ מפני שלא הורצה. */
  const r = spawnSync(process.execPath, [path.join(QA, t.id + (t.ext || '.js'))].concat(t.args),
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
else if (FAST) console.log(`  · ${SUITE.filter(t => t.slow).map(t => t.id).join(', ')} — דולגו (--fast)`);
console.log('═'.repeat(72));
console.log(failed
  ? `${failed} מתוך ${results.length} נכשלו`
  : `${results.length} בדיקות, כולן עברו`);

process.exit(failed ? 1 : 0);
