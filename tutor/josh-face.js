/* =====================================================================
   josh-face.js — הפנים של ג׳וש. שכבת תצוגה, ותו לא.

   **מה הקובץ הזה אינו, ואסור שיהיה.** אין בו מוח, אין בו תשובות, אין
   בו חיפוש, אין `fetch`, אין `speechSynthesis`, אין בחירת קול ואין
   `ROLE`. הוא אינו יודע מה נלמד, אינו יודע מה נכון, ואינו מחליט דבר.
   הוא מקבל אירוע ומצייר פרצוף. המוח היחיד הוא `tutor-api/worker.js`,
   והממשק אליו הוא `tutor/tutor.js`.

   הכלל הזה אינו סגנון — הוא הסיבה שהקובץ נכתב. `josh-engine.js` היה
   שכבת פנים **ומוח באותו קובץ**, ומפני שהיו מחוברים, כל הודעה שלומד
   הקליד בדף הבית זרמה אל ויקיפדיה בלי שאיש התכוון לכך.
   `node .claude/qa/joshface.js` אוכף את ההפרדה בקוד ולא בהבטחה.

   שימוש:

     <script src="/tutor/josh-face.js"></script>

     html += JOSHFACE.markup(140);   // מחרוזת HTML לתוך render()
     JOSHFACE.attach();              // אחרי כל render — ראו למטה
     JOSHFACE.emit("correct");       // אירוע

   **למה `markup` ו-`attach` נפרדים.** כל האפליקציות כאן בונות את
   `#app` מחדש בכל `render()`, ולכן אלמנט שנשמר בזיכרון נמחק תחת
   הידיים. הפתרון: המצב חי במודול ולא ב-DOM, `markup()` מחזיר מחרוזת
   שנכנסת לפלט של `render()`, ו-`attach()` מוצא את הצומת שקיים עכשיו
   ומצייר עליו את המצב הנוכחי. זו אותה מלכודת ש-`tutor/tutor.js`
   מתאר בראשו, ופתרון אחר לה: הפאנל שם יושב על `document.body` מפני
   שהוא צף, והפנים כאן יושבות **בתוך** הפריסה.

   **אפס נכסים.** הפנים הן SVG מוטבע — אין PNG, אין גופן, אין בקשת
   רשת, ולכן אין מה לטעון בעצלתיים ואין מה שיאט את עליית האפליקציה.
   `josh-sprites.png` (21,797 בתים) נמחק ב-13.9 ואינו נטען כאן:
   הוא היה רובוט צעצוע עם אנטנה. ראו O-52.

   **ומאז 14.9.2026 יש כאן שני פרצופים מצוירים, לא אחד.** הבעלים
   שלח דגם תלת־ממד מ-Meshy — ראש כרום עם כיפה כהה ועיניים ציאן —
   וביקש ״תן לו חיים״. הדגם עצמו אינו נכנס לדפדפן (1,946,666
   פאות, ומציג תלת־ממד הוא תלות חיצונית אסורה), ולכן **העיצוב
   צויר ב-SVG** ויושב ב-`robotSVG`. `look("human")` מחזיר את
   המורה האנושי, ושניהם חיים.

   **תנועה.** אין `requestAnimationFrame` ואין לולאה. מה שרץ תמיד הוא
   שרשרת `setTimeout` אחת למצמוץ, שנעצרת כשהלשונית מוסתרת או כשאין
   צומת מחובר. כל השאר הוא CSS. ב-`prefers-reduced-motion: reduce`
   הכול כבוי והפנים סטטיות.
   ===================================================================== */
(function (g) {
"use strict";

/* ---------------------------------------------------------------
   האירועים. עשרה, ואין אחד־עשר — כל אחד משנה מצב פנים ותו לא.

   ארבעה הם **מצב בסיס** שנשאר עד שמחליפים אותו, שלושה הם **רגע**
   שחוזר מעצמו למצב הבסיס, ושלושה מתארים את **הלומד** ולא את ג׳וש:
   הם וריאציה רגועה יותר של הקשבה, ולא הבעה שלישית. לומד מתוסכל
   אינו צריך פרצוף מודאג מולו.
   --------------------------------------------------------------- */
var BASE = { idle:1, listening:1, thinking:1, speaking:1,
             frustrated:1, stuck:1, slow:1 };
var MOMENT = { correct:1400, wrong:1600, encourage:1600 };   /* מילישניות החזקה */

/* המצב שאליו חוזרים אחרי רגע. נקבע בכניסה לרגע ולא בסופו, אחרת
   שני רגעים רצופים היו מאבדים את הבסיס. */
var base = "idle", cur = "idle", nodes = [], moTimer = null, blTimer = null;

/* נתיב לדיוקן. ריק = הפנים המצוירות. ראו `photo()` למטה. */
var photoURL = "";
/* כיול המסכות של הדיוקן הנוכחי. `null` = ברירות המחדל של josh.jpg. */
var photoMarks = null;

/* **איזה פרצוף נבנה כשאין תצלום — "robot" או "human".**

   ברירת המחדל היא הרובוט, בהוראת הבעלים 14.9.2026. הפנים
   האנושיות נשארות במלואן ואינן קוד מת: `JOSHFACE.look("human")`
   מחזיר אותן, וזו שורה אחת. */
var look = "robot";

var MOTION_Q = "(prefers-reduced-motion: reduce)";
function reduced() {
  try { return g.matchMedia && g.matchMedia(MOTION_Q).matches } catch (e) { return false }
}

/* ---------------------------------------------------------------
   הסגנון. מוזרק פעם אחת ולא בקובץ נפרד: קובץ CSS נוסף הוא בקשה
   נוספת, רשומה נוספת ב-`PRE` של כל `sw.js`, ומפתח קאש נוסף שאפשר
   לשכוח. כאן הכול נוסע יחד עם הקוד שמשתמש בו.
   --------------------------------------------------------------- */
var CSS = [
".jf{display:inline-block;line-height:0;position:relative}",
".jf svg{display:block;width:100%;height:auto;overflow:visible}",

/* ההטיה והנשימה — טרנספורם על השורש בלבד, לא על כל צומת */
".jf__head{transform-origin:50% 80%;transition:transform .5s cubic-bezier(.22,.8,.3,1)}",
'.jf[data-state="listening"] .jf__head,.jf[data-state="stuck"] .jf__head{transform:rotate(-4deg)}',
'.jf[data-state="thinking"] .jf__head{transform:rotate(3deg) translateY(-1px)}',
'.jf[data-state="correct"] .jf__head,.jf[data-state="encourage"] .jf__head{transform:translateY(-2px)}',
'.jf[data-state="frustrated"] .jf__head,.jf[data-state="slow"] .jf__head{transform:rotate(-2deg)}',
".jf.is-tilt .jf__head{transform:rotate(-2.5deg)}",

/* מצמוץ. אינו אנימציית CSS מחזורית אלא מחלקה שנדלקת לרגע —
   מצמוץ בקצב קבוע נראה מכני, ובני אדם ממצמצים בפרקי זמן לא שווים. */
/* `transform-box: fill-box` הוא תיקון ולא נוי: בלי הצהרה כזאת
   אחוזי `transform-origin` על אלמנט SVG נמדדים מול חלון ה-SVG
   כולו ולא מול האלמנט עצמו, והעפעף היה נסגר מהקצה העליון של
   הציור במקום מקצה העין. */
".jf__lid{transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0);transition:transform .09s ease-out}",
".jf.is-blink .jf__lid{transform:scaleY(1)}",

/* האישונים — מבט. 'חושב' מסיט מבט הצידה ומעלה, כמו אדם שנזכר. */
".jf__eyes{transition:transform .45s cubic-bezier(.22,.8,.3,1)}",
'.jf[data-state="thinking"] .jf__eyes{transform:translate(3.5px,-2px)}',
'.jf[data-state="listening"] .jf__eyes{transform:translate(-1.5px,.5px)}',

/* הגבות — ההבדל בין 'מקשיב' ל'שואל'. תנועה קטנה, לא קריקטורה. */
".jf__brows{transition:transform .35s ease}",
'.jf[data-state="thinking"] .jf__brows{transform:translateY(-2.2px)}',
'.jf[data-state="wrong"] .jf__brows,.jf[data-state="encourage"] .jf__brows{transform:translateY(-1.4px)}',
'.jf[data-state="frustrated"] .jf__brows{transform:translateY(-1px)}',

/* הפה. מצב אחד גלוי בכל רגע — פשוט יותר מלמזג צורות, וקריא יותר. */
".jf__m{opacity:0;transition:opacity .18s linear}",
".jf__m.is-on{opacity:1}",
'.jf[data-state="speaking"] .jf__m--talk{transform-box:fill-box;transform-origin:50% 40%;animation:jf-talk .26s ease-in-out infinite alternate}',
"@keyframes jf-talk{from{transform:scaleY(.55)}to{transform:scaleY(1.15)}}",

/* הנגיעה הטכנולוגית: קשת אוזנייה דקה מאחורי האוזן, ונורית קטנה.
   זה הכול. הגרסה הראשונה שמה כאן הילה מעל הראש — והילה היא
   מסקוט, בעוד אוזנייה היא מישהו שעובד. */
".jf__ring{fill:none;stroke-width:2;opacity:.34;transition:stroke .4s ease,opacity .4s ease}",
'.jf[data-state="listening"] .jf__ring,.jf[data-state="stuck"] .jf__ring{opacity:.8}',
'.jf[data-state="thinking"] .jf__ring{opacity:.66}',
".jf__led{transition:fill .4s ease,opacity .4s ease;opacity:.75}",
'.jf[data-state="listening"] .jf__led{animation:jf-led 1.9s ease-in-out infinite}',
'.jf[data-state="thinking"] .jf__led{animation:jf-led 2.8s ease-in-out infinite}',
"@keyframes jf-led{0%,100%{opacity:.35}50%{opacity:1}}",

/* נכון/עידוד — הנהון אחד, לא ריקוד. */
'.jf[data-state="correct"]{animation:jf-nod .5s ease-in-out}',
"@keyframes jf-nod{0%,100%{transform:translateY(0)}45%{transform:translateY(3px)}}",

/* נשימה, בהוראת הבעלים 14.9.2026.

   **ארבע שניות וחצי, ו-1.5% בלבד.** נשימה שרואים אותה אינה
   נשימה אלא פעימה, והיא מושכת את העין מהטקסט — וזה בדיוק ההפך
   ממה שדרוש ללומד עם קשיי קשב. מה שהיא כן עושה: מונעת את
   התחושה שהמסך קפא.

   על `.jf__body` ולא על `.jf__head`, אחרת היא מתנגשת עם ההטיה
   שכבר יושבת שם — שני טרנספורמים על אותו צומת, והאחרון מנצח.

   `prefers-reduced-motion` מכבה אותה בבלוק שבסוף הקובץ, יחד עם
   שאר התנועה. */
'.jf__body{transform-box:fill-box;transform-origin:50% 100%;' +
  'animation:jf-breathe 4.5s ease-in-out infinite}',
"@keyframes jf-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}",

/* שלוש נקודות בחשיבה — על הפנים המצוירות, לא רק על התצלום.
   נדלקות אחת אחרי השנייה ולא יחד: שלוש נקודות שמהבהבות בו־זמנית
   הן התראה, ובזו אחר זו הן ״רגע, אני חושב״. */
'.jf__think{opacity:0;transition:opacity .25s}',
'.jf[data-state="thinking"] .jf__think{opacity:1}',
'.jf__think circle{animation:jf-think 1.4s ease-in-out infinite}',
'.jf__think circle:nth-child(2){animation-delay:.18s}',
'.jf__think circle:nth-child(3){animation-delay:.36s}',
"@keyframes jf-think{0%,70%,100%{opacity:.25}35%{opacity:1}}",

/* ----------------------------------------------------------------
   מצב תמונה.

   **הבעיה שנפתרה כאן, ואיך.** יש פריים אחד — `img/josh.jpg`,
   200×300 — ואי אפשר לחתוך ממנו עיניים עצומות. הגרסה הראשונה
   הסיקה מזה שאין מצמוץ ואין תנועת פה בתצלום, וזה היה מוקדם מדי:
   **הפריים היחיד מכיל את הפיקסלים הדרושים לשניהם.**

   המצמוץ הוא **העור שמעל העין**, מוסט כלפי מטה ל-120 מילישניות
   דרך מסכת אליפסה שיושבת בדיוק על העין. אלה פיקסלים אמיתיים של
   אותו אדם ולא כתם בצבע עור, ולכן אין תחושת ציור על תצלום.

   תנועת הפה היא **אזור הפה עצמו**, נמתח אנכית עד 5% סביב ציר
   שמתחת לאף. המסכה היא מדרג רדיאלי ולכן אין קצה נראה, וכשהאנימציה
   עומדת השכבה זהה לתצלום שמתחתיה — כלומר בלתי נראית.

   שלוש המסכות נמדדו על הקובץ, לא נוחשו: ראו `FACE.md`.

   מה שווריאנטים יוסיפו: חיוך אמיתי, פה פתוח לדיבור, וכיוון מבט.
   ראו O-54 — הוא נשאר פתוח, ומה שנסגר כאן הוא המצמוץ והלסת.
   ---------------------------------------------------------------- */
".jf--photo{overflow:visible}",
/* `aspect-ratio` שומר את המקום לפני שהתצלום נטען. בלעדיו `height:auto`
   נותן גובה 0 עד שהבייטים מגיעים — ובדף הבית, שבו הפנים יושבות מתחת
   לקפל ולכן `loading="lazy"` דוחה את הטעינה, נמדד בכרום `height:0px`
   ו-`naturalWidth:0`: הפנים פשוט לא היו שם. היחס הוא זה של הקובץ,
   200×300, ולכן הוא שומר את המראה בדיוק ורק מונע את הקפיצה. */
/* `.jf__fx` נושאת את מצבי ההטיה, ולא `.jf__ph` — שלוש שכבות
   התנועה חייבות לזוז עם התצלום. שכבה שנשארת ישרה בזמן שהתצלום
   מוטה -3° מזיזה את העפעף אל מחוץ לעין. */
".jf__fx{position:relative;display:block;transform-origin:50% 88%;",
"  transition:transform .5s cubic-bezier(.22,.8,.3,1)}",
".jf--photo .jf__ph{display:block;width:100%;height:auto;aspect-ratio:2/3;",
"  object-fit:cover;border-radius:50%;",
"  box-shadow:0 2px 10px rgba(20,40,50,.12),0 10px 26px rgba(20,40,50,.10);",
"  transform-origin:50% 88%;transition:transform .5s cubic-bezier(.22,.8,.3,1)}",
'.jf--photo[data-state="listening"] .jf__fx,.jf--photo[data-state="stuck"] .jf__fx{transform:rotate(-3deg)}',
'.jf--photo[data-state="thinking"] .jf__fx{transform:rotate(2.5deg) translateY(-2px)}',
'.jf--photo[data-state="frustrated"] .jf__fx,.jf--photo[data-state="slow"] .jf__fx{transform:rotate(-1.5deg)}',
/* טעות: הטיה קטנה פנימה, כמו מי שמתקרב להסתכל יחד. לא ריחוק. */
'.jf--photo[data-state="wrong"] .jf__fx{transform:rotate(-2.5deg) scale(1.01)}',
'.jf--photo[data-state="correct"] .jf__fx,.jf--photo[data-state="encourage"] .jf__fx{transform:translateY(-3px) scale(1.02)}',
'.jf--photo[data-state="speaking"] .jf__fx{animation:jf-ph-talk 1.5s ease-in-out infinite}',
"@keyframes jf-ph-talk{0%,100%{transform:scale(1)}50%{transform:scale(1.012)}}",
".jf--photo.is-tilt .jf__fx{transform:rotate(-1.5deg)}",

/* --- שלוש שכבות התנועה על התצלום --- */
/* כולן שואבות מאותו `--jf-ph`, שהוא אותו קובץ שכבר במטמון: אפס
   בקשת רשת נוספת, ואפס נכס חדש. */
".jf__plid,.jf__pjaw{position:absolute;inset:0;pointer-events:none}",
".jf__plid>i,.jf__pjaw>i{position:absolute;inset:0;display:block;",
"  background-image:var(--jf-ph);background-size:100% 100%;background-repeat:no-repeat;",
"  border-radius:50%}",
/* העפעף: העור שמעל העין, מוסט מטה. 3.1% מגובה התיבה הם כתשעה
   פיקסלים במקור — המרחק בין קו הריסים לקפל שמעליו. */
".jf__plid{opacity:0}",
".jf__plid>i{transform:translateY(3.1%)}",
/* **הקואורדינטות הן משתנים מאז 14.9.2026, ולא מספרים קשיחים.**

   `FACE.md` הזהיר במפורש: ארבעת המספרים האלה מכוילים לחתך של
   `josh.jpg` בלבד, ותצלום אחר מנחית את העפעפיים על הלחי. הבעלים
   שלח דיוקן שני, ולכן הכיול עבר אל הקורא — וברירות המחדל כאן הן
   בדיוק המספרים הישנים, כך ש-`josh.jpg` אינו משתנה בפיקסל.

   מי שמוסיף דיוקן שלישי מודד ומעביר; מי שלא מעביר מקבל את
   ברירות המחדל, וזה גלוי מיד כי העפעף לא יהיה על העין. */
".jf__plid--a{-webkit-mask-image:radial-gradient(ellipse var(--jf-ew,7%) var(--jf-eh,2.6%) at var(--jf-ax,59%) var(--jf-ay,28.4%),#000 55%,transparent 100%);",
"  mask-image:radial-gradient(ellipse var(--jf-ew,7%) var(--jf-eh,2.6%) at var(--jf-ax,59%) var(--jf-ay,28.4%),#000 55%,transparent 100%)}",
".jf__plid--b{-webkit-mask-image:radial-gradient(ellipse var(--jf-ew2,7.5%) var(--jf-eh2,2.8%) at var(--jf-bx,83%) var(--jf-by,32.2%),#000 55%,transparent 100%);",
"  mask-image:radial-gradient(ellipse var(--jf-ew2,7.5%) var(--jf-eh2,2.8%) at var(--jf-bx,83%) var(--jf-by,32.2%),#000 55%,transparent 100%)}",
".jf--photo.is-blink .jf__plid{opacity:1}",
/* הלסת: אזור הפה, נמתח אנכית סביב ציר שמתחת לאף. כשהאנימציה
   עומדת השכבה זהה למה שמתחתיה, ולכן אינה נראית כלל. */
".jf__pjaw{-webkit-mask-image:radial-gradient(ellipse var(--jf-jw,13%) var(--jf-jh,6%) at var(--jf-jx,65%) var(--jf-jy,47.5%),#000 45%,transparent 100%);",
"  mask-image:radial-gradient(ellipse var(--jf-jw,13%) var(--jf-jh,6%) at var(--jf-jx,65%) var(--jf-jy,47.5%),#000 45%,transparent 100%)}",
".jf__pjaw>i{transform-origin:var(--jf-jx,65%) var(--jf-jo,41%)}",
'.jf--photo[data-state="speaking"] .jf__pjaw>i{animation:jf-jaw .22s ease-in-out infinite alternate}',
"@keyframes jf-jaw{from{transform:scaleY(1)}to{transform:scaleY(1.05)}}",

/* הטבעת והנורית יושבות מעל התצלום ולא בתוכו */
/* הטבעת: `border-color` חייב להיקבע בכל מצב. בגרסה הראשונה הוא
   נשאר `transparent` ואיש לא דרס אותו — האטימות עלתה ל-0.9 ולא
   נראה דבר. נמדד בדפדפן. */
".jf__halo{position:absolute;inset:-5px;border-radius:50%;border:2px solid transparent;",
"  transition:border-color .4s ease,opacity .4s ease;opacity:0;pointer-events:none}",
'.jf--photo[data-state="listening"] .jf__halo,.jf--photo[data-state="stuck"] .jf__halo{border-color:#3fa8a0}',
'.jf--photo[data-state="thinking"] .jf__halo{border-color:#d9a441}',
'.jf--photo[data-state="correct"] .jf__halo,.jf--photo[data-state="encourage"] .jf__halo{border-color:#4fb06a}',
'.jf--photo[data-state="listening"] .jf__halo,.jf--photo[data-state="stuck"] .jf__halo{opacity:.9}',
'.jf--photo[data-state="thinking"] .jf__halo{opacity:.6}',
'.jf--photo[data-state="correct"] .jf__halo,.jf--photo[data-state="encourage"] .jf__halo{opacity:.85}',
".jf__dot{position:absolute;inset-block-start:16%;inset-inline-end:2%;width:9%;height:9%;",
"  background:#3fa8a0;box-shadow:0 0 6px rgba(63,168,160,.7);",
"  border-radius:50%;opacity:0;transition:opacity .4s ease;pointer-events:none}",
'.jf--photo[data-state="listening"] .jf__dot{opacity:1;animation:jf-led 1.9s ease-in-out infinite}',
'.jf--photo[data-state="thinking"] .jf__dot{opacity:1;animation:jf-led 2.8s ease-in-out infinite}',

/* הרובוט: ההילה סביב העין.

   **זה מה שמפריד בין נורית דולקת לעין שמגיבה.** האישון עצמו אינו
   משנה בהירות — עין שמהבהבת היא התראה — אלא ההילה שמסביבו, וזו
   תנועה שנקראת בפריפריה בלי למשוך את המבט מהטקסט. בתסכול ובתקיעות
   היא **יורדת** ולא עולה: מכונה שמאירה חזק יותר על לומד שנתקע היא
   מכונה שלוחצת עליו.

   `prefers-reduced-motion` מכבה גם את זה — הבלוק שמתחת חל על
   `.jf *` כולו. */
'.jf--bot .jf__glow{transition:opacity .45s ease}',
'.jf--bot[data-state="listening"] .jf__glow,.jf--bot[data-state="speaking"] .jf__glow{opacity:.4}',
'.jf--bot[data-state="correct"] .jf__glow,.jf--bot[data-state="encourage"] .jf__glow{opacity:.5}',
'.jf--bot[data-state="frustrated"] .jf__glow,.jf--bot[data-state="stuck"] .jf__glow,.jf--bot[data-state="slow"] .jf__glow{opacity:.1}',
'.jf--bot[data-state="thinking"] .jf__glow{animation:jf-glow 2.4s ease-in-out infinite}',
"@keyframes jf-glow{0%,100%{opacity:.14}50%{opacity:.44}}",

/* וזה מכבה את הכול. `animation:none` על הצאצאים מכסה גם את
   הקשת ואת ההנהון, ולא רק את הפה. */
"@media (prefers-reduced-motion: reduce){",
"  .jf *,.jf{animation:none!important;transition:none!important}",
"  .jf__head,.jf--photo .jf__fx,.jf--photo .jf__fx *{transform:none!important}",
  "  .jf--photo .jf__plid{opacity:0!important}",
"}"
].join("");

/* המשתנים של הכיול, כמחרוזת שנכנסת ל-`style`. ריק כשאין כיול,
   ואז ברירות המחדל שב-CSS תקפות. */
function markVars() {
  if (!photoMarks) return "";
  var s = "", k;
  for (k in photoMarks)
    if (Object.prototype.hasOwnProperty.call(photoMarks, k))
      s += ";--jf-" + k + ":" + photoMarks[k];
  return s;
}

function injectCSS() {
  if (document.getElementById("jf-css")) return;
  var s = document.createElement("style");
  s.id = "jf-css";
  s.textContent = CSS;
  (document.head || document.documentElement).appendChild(s);
}

/* ---------------------------------------------------------------
   הפנים.

   מורה אנושי: ראש, שיער קצר, צוואר וצווארון חולצה. הגוונים באים
   מ-`currentColor` ומשלושה צבעים קבועים וחמים, ולא ממשתני נושא של
   אפליקציה מסוימת — הקובץ הזה משותף, והוא אינו מכיר את הפלטה של
   מי שטוען אותו.

   `aria-hidden` מפני שאלה פנים ולא מידע: מה שיש לג׳וש לומר יושב
   בטקסט שלידו, ומקריא מסך שיקריא גם פרצוף יקרא אותו דבר פעמיים.
   ובלי טקסט בתוך ה-SVG גם אין כאן עברית סטטית — `aria.js` בדיקה 6
   מפילה כל מילה עברית שאינה עוברת ב-`lgChrome`.
   --------------------------------------------------------------- */
var SKIN   = "#e3b28d",   /* גוון בסיס */
    SKIN_M = "#cf9a73",   /* צל בינוני — אוזניים, צוואר, אף */
    SKIN_D = "#b57f58",   /* צל עמוק — מתחת ללסת ובנחיריים */
    HAIR   = "#2e2a31", HAIR_HI = "#433c48",
    SHIRT  = "#35566e", COLLAR = "#2a4459",
    LIP    = "#a96754", TECH = "#4aa8a0";

/* ---------------------------------------------------------------
   לוח הרובוט. נגזר מהדגם שהבעלים שלח: כרום קר, כיפה כהה, ציאן.

   חמישה גווני כרום ולא שניים — משטח מתכתי נקרא ככזה בזכות
   המדרגות שבין אור לצל, ושני גוונים נותנים פלסטיק. */
var CH_HI = "#f4f7fa",  /* נצנוץ — עצמות לחיים, קצה לוח */
    CH    = "#dce3ea",  /* לוח הפנים */
    CH_M  = "#b3bfcb",  /* צל בינוני — תריסים, צווארון */
    CH_D  = "#8795a6",  /* צל — תפרים, מתחת ללסת */
    CH_X  = "#5d6b7c",  /* התפר העמוק ביותר */
    PNL   = "#1b2331",  /* לוח כהה — כיפה, פודים, ארובות */
    PNL_L = "#2e3a4c",  /* לוח כהה בהיר יותר — פס מרכזי */
    CY    = "#3fd8ea",  /* ציאן — עיניים, תפרים חיים */
    CY_D  = "#12a3bd",
    CY_HI = "#a8f2fb";

/* `width` ו-`height` יושבים כתכונות ולא ב-CSS בלבד, וזו חגורה ולא
   כפילות: נמדד בכרומיום — בלי גיליון הסגנון ה-SVG קורס ל-0×0, מפני
   ש-`height:auto` על SVG מוטבע אינו נגזר מ-`viewBox` כשאין לו רוחב.
   פנים בגודל אפס אינן שגיאה ואינן נראות בשום בדיקת DOM: הצומת קיים,
   האירועים עובדים, והמסך ריק. התכונות מבטיחות שהוא ייראה גם אם
   הסגנון לא הגיע.

   **הציור נבנה מחדש 12.9.2026, אחרי שהגרסה הראשונה נפסלה.** היא
   נראתה כמו אימוג׳י: ראש עגול, עיניים גדולות ולבנות, ואפס הצללה.
   ההבדל בין ״ציור של דמות״ ל״אדם״ אינו כמות הפרטים אלא ארבעה
   דברים, וכולם כאן:

     · **פרופורציה** — הראש גבוה מרוחבו (49×71 ביחידות ה-viewBox)
       ויש לו לסת. עיגול הוא תמיד תינוק או אימוג׳י.
     · **עיניים שקדיות וקטנות** — עין אנושית היא כשישית מרוחב הפנים
       ורובה מכוסה בעפעף. לובן גדול ועגול הוא קריקטורה.
     · **הצללה** — לחיים, מתחת ללסת, זיפים קלים וצל אף. בלעדיה כל
       ציור שטוח נקרא כמדבקה.
     · **פה קטן בגוון שפתיים** — לא קו שחור מחייך מאוזן לאוזן.

   הנגיעה הטכנולוגית ירדה מהילה מעל הראש לקשת אוזנייה דקה מאחורי
   האוזן. הילה מעל הראש היא מסקוט; אוזנייה היא מישהו שעובד. */
function faceSVG(px) {
  return '<svg viewBox="0 0 120 120" width="' + px + '" height="' + px + '" aria-hidden="true" focusable="false">' +

    /* ---- גוף: חולצה עם צווארון פתוח ----
       עטוף ב-`jf__body` כדי שהנשימה תיתלה עליו ולא על הראש:
       ל-`jf__head` כבר יש טרנספורם הטיה, ושני טרנספורמים על אותו
       צומת אינם מצטברים — האחרון דורס. וגם אנטומית זה נכון יותר,
       החזה עולה ולא הפנים. */
    '<g class="jf__body">' +
      '<path fill="' + SHIRT + '" d="M 21 120 C 23 104 31 97.5 46.5 93.5 L 73.5 93.5 C 89 97.5 97 104 99 120 Z"/>' +
      '<path fill="' + SKIN_M + '" d="M 51 78 h 18 v 16 q -9 7 -18 0 Z"/>' +
      '<path fill="' + SKIN_D + '" opacity=".45" d="M 51 78 q 9 11 18 0 v 5 q -9 9 -18 0 Z"/>' +
      /* פתח הצווארון ושתי הדשים */
      '<path fill="' + SKIN_M + '" d="M 53.5 93.5 L 60 104 L 66.5 93.5 Z"/>' +
      '<path fill="' + COLLAR + '" d="M 46.5 92 L 60.5 105 L 54 92 Z"/>' +
      '<path fill="' + COLLAR + '" d="M 73.5 92 L 59.5 105 L 66 92 Z"/>' +
    '</g>' +

    '<g class="jf__head">' +
      /* ---- שיער אחורי, ואוזניים ---- */
      '<path fill="' + HAIR + '" d="M 33 55 C 31 26 43.5 14 60 14 C 76.5 14 89 26 87 55 C 86 45 84 39.5 82 36 L 38 36 C 36 39.5 34 45 33 55 Z"/>' +
      '<path fill="' + SKIN_M + '" d="M 36.5 52.5 C 32 51.5 30 55.5 31.2 60 C 32.2 63.6 34.2 66 36.8 66.2 Z"/>' +
      '<path fill="' + SKIN_M + '" d="M 83.5 52.5 C 88 51.5 90 55.5 88.8 60 C 87.8 63.6 85.8 66 83.2 66.2 Z"/>' +
      '<path d="M 34.4 56 c 1.2 1.4 1.4 4 .6 5.8" stroke="' + SKIN_D + '" stroke-width="1" fill="none" opacity=".8"/>' +
      '<path d="M 85.6 56 c -1.2 1.4 -1.4 4 -.6 5.8" stroke="' + SKIN_D + '" stroke-width="1" fill="none" opacity=".8"/>' +

      /* ---- הפנים: גבוה מרוחבו, עם לסת ---- */
      '<path fill="' + SKIN + '" d="M 35.5 50 C 35.5 27 44 17.5 60 17.5 C 76 17.5 84.5 27 84.5 50 C 84.5 61 83 68.5 79.5 74.5 C 75 82 67.5 88.5 60 88.5 C 52.5 88.5 45 82 40.5 74.5 C 37 68.5 35.5 61 35.5 50 Z"/>' +
      /* הצללה: לחיים, ולסת עם זיפים קלים */
      '<ellipse cx="42.5" cy="65" rx="4.6" ry="7" fill="' + SKIN_D + '" opacity=".13"/>' +
      '<ellipse cx="77.5" cy="65" rx="4.6" ry="7" fill="' + SKIN_D + '" opacity=".13"/>' +
      '<path fill="#6d4b33" opacity=".11" d="M 40.5 64 C 44 80 52 88.5 60 88.5 C 68 88.5 76 80 79.5 64 C 77 74.5 70 80.5 60 80.5 C 50 80.5 43 74.5 40.5 64 Z"/>' +

      /* ---- שיער קדמי: קו שיער סרוק לצד, ורקות ---- */
      '<path fill="' + HAIR + '" d="M 34 52 C 32 25 44 15.5 60 15.5 C 76 15.5 88 25 86 52 C 85 44 83.5 39.5 82 37 C 76 31 66 33.5 56 36.5 C 48 39 42 40.5 38.5 44 C 36.5 46.2 35 49 34 52 Z"/>' +
      '<path fill="' + HAIR_HI + '" opacity=".45" d="M 63 18.5 C 71 20 78 25.5 81 34 C 77 26.5 70 21 63 18.5 Z"/>' +
      '<path fill="' + HAIR + '" d="M 35.6 45.5 c 1.6 1 2 6.5 1.4 11.5 l -2.6 -1.6 c -0.4 -4.4 -0.2 -7.6 1.2 -9.9 Z"/>' +
      '<path fill="' + HAIR + '" d="M 84.4 45.5 c -1.6 1 -2 6.5 -1.4 11.5 l 2.6 -1.6 c 0.4 -4.4 0.2 -7.6 -1.2 -9.9 Z"/>' +

      /* ---- אוזנייה: הנגיעה הטכנולוגית היחידה ---- */
      '<path class="jf__ring" stroke="' + TECH + '" d="M 84.6 49.5 C 90.4 51 92.6 56.4 91.4 62.2"/>' +
      '<circle class="jf__led" cx="91" cy="63.8" r="1.9" fill="' + TECH + '"/>' +

      '<g class="jf__brows">' +
        '<path d="M 42.6 45.4 C 46 42.5 53 42.5 56.6 45" stroke="' + HAIR + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M 63.4 45 C 67 42.5 74 42.5 77.4 45.4" stroke="' + HAIR + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '</g>' +

      '<g class="jf__eyes">' +
        /* שקד ולא עיגול, ועליו קו ריסים שנותן עומק */
        '<path fill="#f7f3ef" d="M 43 54.2 C 45 50.2 54 50.2 56 54.2 C 54 57.9 45 57.9 43 54.2 Z"/>' +
        '<path fill="#f7f3ef" d="M 64 54.2 C 66 50.2 75 50.2 77 54.2 C 75 57.9 66 57.9 64 54.2 Z"/>' +
        '<circle cx="49.9" cy="54.3" r="3.3" fill="#4e3a2e"/>' +
        '<circle cx="70.1" cy="54.3" r="3.3" fill="#4e3a2e"/>' +
        '<circle cx="49.9" cy="54.3" r="1.6" fill="#181410"/>' +
        '<circle cx="70.1" cy="54.3" r="1.6" fill="#181410"/>' +
        '<circle cx="51.1" cy="52.9" r=".85" fill="#ffffff" opacity=".95"/>' +
        '<circle cx="71.3" cy="52.9" r=".85" fill="#ffffff" opacity=".95"/>' +
        '<path d="M 43 54.2 C 45 50 54 50 56 54.2" stroke="#332721" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M 64 54.2 C 66 50 75 50 77 54.2" stroke="#332721" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M 44.6 56.8 C 47 58.2 52 58.2 55 56.8" stroke="' + SKIN_D + '" stroke-width=".9" fill="none" opacity=".6"/>' +
        '<path d="M 65.6 56.8 C 68 58.2 73 58.2 76 56.8" stroke="' + SKIN_D + '" stroke-width=".9" fill="none" opacity=".6"/>' +
        /* העפעפיים — נסגרים בקנה מידה אנכי, ולכן אין ציור שני */
        '<path class="jf__lid" fill="' + SKIN + '" d="M 42.4 49.6 h 14.2 v 8.8 c -2.6 2.4 -11.6 2.4 -14.2 0 Z"/>' +
        '<path class="jf__lid" fill="' + SKIN + '" d="M 63.4 49.6 h 14.2 v 8.8 c -2.6 2.4 -11.6 2.4 -14.2 0 Z"/>' +
      '</g>' +

      /* ---- אף: גשר, בסיס ושני נחיריים ---- */
      '<path d="M 57.6 55.5 C 56.7 62 56.3 66 57.7 68.6" stroke="' + SKIN_M + '" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M 55.9 69.3 C 57.6 71.3 62.4 71.3 64.1 69.3" stroke="' + SKIN_D + '" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".85"/>' +
      '<ellipse cx="56.7" cy="69.7" rx=".9" ry=".65" fill="' + SKIN_D + '" opacity=".65"/>' +
      '<ellipse cx="63.3" cy="69.7" rx=".9" ry=".65" fill="' + SKIN_D + '" opacity=".65"/>' +

      /* ---- חמישה פיות, אחד גלוי בכל רגע ---- */
      '<g class="jf__mouths">' +
        '<path class="jf__m jf__m--calm is-on" d="M 53.2 78.4 C 56 79.9 64 79.9 66.8 78.4" stroke="' + LIP + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--smile" d="M 52.2 77.6 C 55.6 82.6 64.4 82.6 67.8 77.6" stroke="' + LIP + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--soft" d="M 53.6 78.8 C 56.4 80 63.6 80 66.4 78.2" stroke="' + LIP + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--think" d="M 54 78.6 C 56.6 77.2 59 79.1 61.6 78.7 C 64 78.3 65.6 77.6 66.6 77" stroke="' + LIP + '" stroke-width="1.9" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--talk" fill="#7a3f35" d="M 54.4 77.6 C 57.2 76.3 62.8 76.3 65.6 77.6 C 64.6 82.6 55.4 82.6 54.4 77.6 Z"/>' +
      '</g>' +
    '</g>' +

    /* שלוש נקודות חשיבה — מחוץ ל-`jf__head`, כדי שההטיה של
       ״חושב״ לא תסחוב אותן איתה. הן סימן על המסך, לא איבר.
       `aria-hidden` יורש מה-svg כולו. */
    '<g class="jf__think">' +
      '<circle r="3.1" cx="91" cy="30" fill="' + LIP + '" opacity=".25"/>' +
      '<circle r="3.1" cx="101" cy="26" fill="' + LIP + '" opacity=".25"/>' +
      '<circle r="3.1" cx="111" cy="22" fill="' + LIP + '" opacity=".25"/>' +
    '</g>' +
  '</svg>';
}


/* עוגני האנטומיה זהים לאלה של הפנים האנושיות, וזה תנאי ולא סגנון:
   ה-CSS מזיז את `jf__eyes` ב-3.5px ומקנה מידה את `jf__lid`
   מ-`50% 0`. ציור עם עיניים במקום אחר היה מקבל את אותה תנועה
   בדיוק — ונראה שבור. עיניים ב-cy 54.3, תריסים 49.6→58.4,
   גבות סביב 43–45.6, פה 77–82.4, וראש 17→88.5. */
function robotSVG(px) {
  return '<svg viewBox="0 0 120 120" width="' + px + '" height="' + px + '" aria-hidden="true" focusable="false">' +

    /* ---- גוף: לוחות כתף, צוואר מכני ונורית חזה ----
       הנשימה נתלית כאן ולא על הראש, מאותה סיבה בדיוק כמו בפנים
       האנושיות: ל-`jf__head` כבר יש טרנספורם הטיה. */
    '<g class="jf__body">' +
      /* צוואר: עמוד כהה עם שתי טבעות */
      '<path fill="' + PNL + '" d="M 51.5 77 h 17 v 17 q -8.5 6.5 -17 0 Z"/>' +
      '<path d="M 52.4 84 h 15.2 M 52.8 89 h 14.4" stroke="' + CY_D + '" stroke-width=".9" opacity=".55" fill="none"/>' +
      '<path fill="#000" opacity=".22" d="M 51.5 77 q 8.5 10 17 0 v 4.5 q -8.5 8.5 -17 0 Z"/>' +
      /* גוש הכתפיים — כהה מתחת, לוחות כרום מעל */
      '<path fill="' + PNL + '" d="M 20 120 C 22 103 30.5 96.5 46.5 92.5 L 73.5 92.5 C 89.5 96.5 98 103 100 120 Z"/>' +
      '<path fill="' + CH + '" d="M 20 120 C 22 104 30 97.5 45.5 93.5 L 48.5 100.5 C 36.5 104.5 30.5 110.5 29 120 Z"/>' +
      '<path fill="' + CH + '" d="M 100 120 C 98 104 90 97.5 74.5 93.5 L 71.5 100.5 C 83.5 104.5 89.5 110.5 91 120 Z"/>' +
      '<path fill="' + CH_HI + '" opacity=".55" d="M 22.6 116 C 24.6 106 31 100.5 44 97 L 45 99.4 C 33 103 27 109 24.6 118 Z"/>' +
      '<path fill="' + CH_HI + '" opacity=".55" d="M 97.4 116 C 95.4 106 89 100.5 76 97 L 75 99.4 C 87 103 93 109 95.4 118 Z"/>' +
      /* תפרי ציאן על הכתפיים */
      '<path d="M 31.5 120 C 33 110.5 37.5 105 46.2 101.6" stroke="' + CY + '" stroke-width="1" opacity=".5" fill="none"/>' +
      '<path d="M 88.5 120 C 87 110.5 82.5 105 73.8 101.6" stroke="' + CY + '" stroke-width="1" opacity=".5" fill="none"/>' +
      /* צווארון: טבעת כרום שיורדת ל-V */
      '<path fill="' + CH_M + '" d="M 46.5 92.5 L 60 104.5 L 73.5 92.5 L 70 99.5 L 60 108 L 50 99.5 Z"/>' +
      /* נורית החזה */
      '<ellipse cx="60" cy="112.5" rx="5.4" ry="5.4" fill="' + CY + '" opacity=".18"/>' +
      '<ellipse cx="60" cy="112.5" rx="2.6" ry="2.6" fill="' + CY + '" opacity=".9"/>' +
      '<ellipse cx="60" cy="112.5" rx="1.1" ry="1.1" fill="' + CY_HI + '"/>' +
    '</g>' +

    '<g class="jf__head">' +
      /* ---- פודי צדע: יחידות כהות במקום אוזניים ---- */
      '<path fill="' + PNL + '" d="M 37.5 49 L 33.4 50.8 C 31.2 51.9 30.6 55.2 31.1 59 C 31.6 62.8 32.8 65.4 34.7 66.4 L 37.5 67.6 Z"/>' +
      '<path fill="' + PNL + '" d="M 82.5 49 L 86.6 50.8 C 88.8 51.9 89.4 55.2 88.9 59 C 88.4 62.8 87.2 65.4 85.3 66.4 L 82.5 67.6 Z"/>' +
      '<path d="M 33.9 54.6 v 6.6 M 86.1 54.6 v 6.6" stroke="' + CY + '" stroke-width="1.3" opacity=".7" stroke-linecap="round" fill="none"/>' +

      /* ---- לוח הפנים: אותה צללית אנושית, בקצוות חדים יותר ---- */
      '<path fill="' + CH + '" d="M 36 48 C 36 26 44.5 17 60 17 C 75.5 17 84 26 84 48 C 84 60 82.5 67.5 79 73.5 C 74.5 81.5 67 88.5 60 88.5 C 53 88.5 45.5 81.5 41 73.5 C 37.5 67.5 36 60 36 48 Z"/>' +
      /* עצמות לחיים — נצנוץ, ולא סומק */
      '<ellipse cx="43.8" cy="62.5" rx="4.2" ry="6.4" fill="' + CH_HI + '" opacity=".5"/>' +
      '<ellipse cx="76.2" cy="62.5" rx="4.2" ry="6.4" fill="' + CH_HI + '" opacity=".5"/>' +
      /* צל הלסת */
      '<path fill="' + CH_D + '" opacity=".3" d="M 41 64 C 44.5 80 52.5 88.5 60 88.5 C 67.5 88.5 75.5 80 79 64 C 76.5 74.5 69.5 80.5 60 80.5 C 50.5 80.5 43.5 74.5 41 64 Z"/>' +
      /* תפרי הלוחות — זה מה שהופך משטח חלק למכונה.
         **קצרים, ולא מהעין לסנטר.** הגרסה הראשונה התחילה ב-y=60.5,
         מיד מתחת לעין, ושני הקווים נקראו כמו עקבות דמעות. מול ילד
         שמתקשה זה הדבר האחרון שצריך להיות שם. נמדד בצילום מסך. */
      '<path d="M 44.8 71.2 C 46.6 75.8 49.2 78.9 52.2 80.6" stroke="' + CH_D + '" stroke-width=".85" opacity=".65" fill="none"/>' +
      '<path d="M 75.2 71.2 C 73.4 75.8 70.8 78.9 67.8 80.6" stroke="' + CH_D + '" stroke-width=".85" opacity=".65" fill="none"/>' +
      '<path d="M 53.4 84.6 C 56.4 85.8 63.6 85.8 66.6 84.6" stroke="' + CH_X + '" stroke-width=".8" opacity=".5" fill="none"/>' +

      /* ---- הכיפה: לוח כהה עם חריץ V במצח, כמו בדגם ---- */
      '<path fill="' + PNL + '" d="M 36 48 C 36 26 44.5 17 60 17 C 75.5 17 84 26 84 48 C 83.1 42.2 81.6 38 80 35.4 L 66 35.4 L 60 43.4 L 54 35.4 L 40 35.4 C 38.4 38 36.9 42.2 36 48 Z"/>' +
      '<path fill="' + PNL_L + '" d="M 56.2 17.5 C 58 17.15 62 17.15 63.8 17.5 L 63.8 33.8 L 60 38.6 L 56.2 33.8 Z"/>' +
      '<path d="M 40 35.4 L 54 35.4 L 60 43.4 L 66 35.4 L 80 35.4" stroke="' + CY + '" stroke-width=".95" opacity=".6" fill="none" stroke-linejoin="round"/>' +
      '<path fill="' + CH_HI + '" opacity=".22" d="M 62 18.6 C 71 20.4 78.4 26.4 81.4 34.4 C 77.2 27.2 70 21.4 62 18.6 Z"/>' +

      /* ---- אוזנייה ונורית: הן חלק מהמכונה, ולא תוספת ---- */
      '<path class="jf__ring" stroke="' + CY + '" d="M 85.4 49 C 91.4 50.6 93.6 56.2 92.4 62.2"/>' +
      '<circle class="jf__led" cx="92" cy="63.8" r="1.9" fill="' + CY + '"/>' +

      /* ---- גבות: חריצים כהים בלוח, ולא שיער ---- */
      '<g class="jf__brows">' +
        '<path d="M 42.8 45.8 L 47.2 43.4 L 53.6 43.2 L 56.8 45.4" stroke="' + PNL + '" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M 63.2 45.4 L 66.4 43.2 L 72.8 43.4 L 77.2 45.8" stroke="' + PNL + '" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</g>' +

      /* ---- העיניים ---- */
      '<g class="jf__eyes">' +
        /* ארובה כהה — בלעדיה הציאן צף על הכרום ואינו נראה כנתון בפנים */
        '<path fill="' + PNL + '" d="M 42.4 54.3 C 45 48.9 54.8 48.9 57.4 54.3 C 54.8 59.3 45 59.3 42.4 54.3 Z"/>' +
        '<path fill="' + PNL + '" d="M 62.6 54.3 C 65.2 48.9 75 48.9 77.6 54.3 C 75 59.3 65.2 59.3 62.6 54.3 Z"/>' +
        /* ההילה — היא מה שהופך עין דולקת לעין חיה */
        '<ellipse class="jf__glow" cx="49.9" cy="54.3" rx="7" ry="4.6" fill="' + CY + '" opacity=".16"/>' +
        '<ellipse class="jf__glow" cx="70.1" cy="54.3" rx="7" ry="4.6" fill="' + CY + '" opacity=".16"/>' +
        '<ellipse cx="49.9" cy="54.3" rx="3.5" ry="3.1" fill="' + CY_D + '"/>' +
        '<ellipse cx="70.1" cy="54.3" rx="3.5" ry="3.1" fill="' + CY_D + '"/>' +
        '<ellipse cx="49.9" cy="54.3" rx="2.4" ry="2.1" fill="' + CY + '"/>' +
        '<ellipse cx="70.1" cy="54.3" rx="2.4" ry="2.1" fill="' + CY + '"/>' +
        '<ellipse cx="49.9" cy="54.3" rx="1.1" ry="1" fill="' + CY_HI + '"/>' +
        '<ellipse cx="70.1" cy="54.3" rx="1.1" ry="1" fill="' + CY_HI + '"/>' +
        '<circle cx="51.2" cy="52.8" r=".75" fill="#ffffff" opacity=".92"/>' +
        '<circle cx="71.4" cy="52.8" r=".75" fill="#ffffff" opacity=".92"/>' +
        /* שפת הארובה — קצה כרום מעל, שנותן עומק */
        '<path d="M 42.4 54.3 C 45 48.7 54.8 48.7 57.4 54.3" stroke="' + CH_D + '" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
        '<path d="M 62.6 54.3 C 65.2 48.7 75 48.7 77.6 54.3" stroke="' + CH_D + '" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
        /* התריסים — אותה גאומטריה בדיוק של העפעפיים, ולכן אותו מצמוץ */
        '<path class="jf__lid" fill="' + CH_M + '" d="M 42.4 49.6 h 14.2 v 8.8 c -2.6 2.4 -11.6 2.4 -14.2 0 Z"/>' +
        '<path class="jf__lid" fill="' + CH_M + '" d="M 63.4 49.6 h 14.2 v 8.8 c -2.6 2.4 -11.6 2.4 -14.2 0 Z"/>' +
      '</g>' +

      /* ---- אף: רכס דק ושני פתחי אוורור ---- */
      '<path d="M 57.9 56.4 C 57.2 62.4 56.9 66 58.1 68.6" stroke="' + CH_D + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M 56.1 69.2 C 57.8 71.1 62.2 71.1 63.9 69.2" stroke="' + CH_X + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="56.9" cy="69.6" rx=".85" ry=".6" fill="' + PNL + '" opacity=".75"/>' +
      '<ellipse cx="63.1" cy="69.6" rx=".85" ry=".6" fill="' + PNL + '" opacity=".75"/>' +

      /* ---- חמישה פיות, אחד גלוי בכל רגע ----
         תפר מכונה ולא שפתיים, ורק ב״מדבר״ הוא נפתח ונדלק מבפנים. */
      '<g class="jf__mouths">' +
        '<path class="jf__m jf__m--calm is-on" d="M 53.4 78.6 C 56.2 79.9 63.8 79.9 66.6 78.6" stroke="' + PNL + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--smile" d="M 52.4 77.8 C 55.8 82.4 64.2 82.4 67.6 77.8" stroke="' + PNL + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--soft" d="M 53.8 78.9 C 56.6 80 63.4 80 66.2 78.4" stroke="' + PNL + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--think" d="M 54.2 78.7 C 56.8 77.4 59.2 79.2 61.8 78.8 C 64.2 78.4 65.8 77.7 66.8 77.1" stroke="' + PNL + '" stroke-width="1.9" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--talk" fill="' + PNL + '" stroke="' + CY + '" stroke-width=".7" stroke-opacity=".65" d="M 54.6 77.8 C 57.4 76.4 62.6 76.4 65.4 77.8 C 64.4 82.5 55.6 82.5 54.6 77.8 Z"/>' +
      '</g>' +
    '</g>' +

    /* שלוש נקודות חשיבה — מחוץ ל-`jf__head`, כדי שההטיה לא תסחוב
       אותן. ציאן, כדי שיהיו של אותה מכונה. */
    '<g class="jf__think">' +
      '<circle r="3.1" cx="92" cy="30" fill="' + CY + '" opacity=".25"/>' +
      '<circle r="3.1" cx="102" cy="26" fill="' + CY + '" opacity=".25"/>' +
      '<circle r="3.1" cx="112" cy="22" fill="' + CY + '" opacity=".25"/>' +
    '</g>' +
  '</svg>';
}

/* איזה פה לכל מצב. טעות אינה מקבלת פרצוף עצוב: הכלל שנמסר הוא
   שלא מביישים מי שטעה, ופה נופל מול ילד הוא בדיוק זה. */
var MOUTH = {
  idle:"calm", listening:"soft", thinking:"think", speaking:"talk",
  correct:"smile", encourage:"smile", wrong:"soft",
  frustrated:"soft", stuck:"soft", slow:"calm"
};

/* ---------------------------------------------------------------
   ציור
   --------------------------------------------------------------- */
/* **רשימה ולא צומת אחד.** `math-app` מציירת את ג׳וש פעמיים — גדול
   בעמודת הליווי, וקטן בשבב ה-XP שבכותרת — ו-`querySelector` תפס את
   הראשון בלבד: הפנים הגדולות לא קיבלו אף מצב. נמדד בדפדפן. */
function paint() {
  var want = MOUTH[cur] || "calm", n, list, i, k;
  for (k = 0; k < nodes.length; k++) {
    n = nodes[k];
    if (!n || !n.isConnected) continue;
    n.setAttribute("data-state", cur);
    if (photoURL) continue;                   /* לתצלום אין פיות להחליף */
    list = n.querySelectorAll(".jf__m");
    for (i = 0; i < list.length; i++) {
      list[i].classList.toggle("is-on", list[i].classList.contains("jf__m--" + want));
    }
  }
}

/* המצמוץ. פרק זמן אקראי בין שלוש לשבע שניות, ולפעמים גם הטיית ראש
   זעירה — שתיהן באותה שרשרת, כדי שלא ירוצו שני טיימרים. */
function eachNode(fn) {
  for (var i = 0; i < nodes.length; i++) if (nodes[i] && nodes[i].isConnected) fn(nodes[i]);
}

function scheduleBlink() {
  clearTimeout(blTimer);
  if (!nodes.length || reduced()) return;
  blTimer = setTimeout(function () {
    if (!document.hidden) {
      eachNode(function (n) { n.classList.add("is-blink") });
      setTimeout(function () { eachNode(function (n) { n.classList.remove("is-blink") }) }, 120);
      /* הטיה קלה רק כשאין מה לעשות. באמצע דיבור היא נראית כמו תקלה. */
      if (cur === "idle" && Math.random() < 0.28) {
        eachNode(function (n) { n.classList.add("is-tilt") });
        setTimeout(function () { eachNode(function (n) { n.classList.remove("is-tilt") }) }, 1500);
      }
    }
    scheduleBlink();
  }, 3000 + Math.random() * 4000);
}

/* ---------------------------------------------------------------
   הממשק הציבורי
   --------------------------------------------------------------- */
var JOSHFACE = {

  /** מחרוזת HTML לתוך הפלט של render(). אינה נוגעת ב-DOM. */
  markup: function (size) {
    /* הסגנון מוזרק כאן ולא רק ב-`attach`. מי שקורא ל-`markup` ושוכח
       את `attach` היה מקבל פנים שקיימות ב-DOM ואינן נראות — כשל שקט
       בדיוק כמו זה שהקובץ הזה נכתב כדי למנוע. ההזרקה מוגנת מכפילות. */
    injectCSS();
    var px = Math.max(48, Math.min(320, parseInt(size, 10) || 140));

    if (photoURL) {
      /* `decoding="async"` ו-`loading="lazy"`: הדיוקן לא יעכב את
         הציור הראשון של האפליקציה. `alt=""` כי זה קישוט — מה שיש
         לג׳וש לומר יושב בטקסט שלידו. */
      return '<span class="jf jf--photo" data-state="' + cur + '" style="width:' + px +
               "px;--jf-ph:url('" + photoURL + "')" + markVars() + "\">" +
               '<span class="jf__fx">' +
                 '<img class="jf__ph" src="' + photoURL + '" alt="" decoding="async" loading="lazy">' +
                 /* שלוש שכבות התנועה. `aria-hidden` מיותר — `<i>` ריק
                    אינו נקרא — אבל `pointer-events:none` כן נדרש, והוא
                    ב-CSS. */
                 '<i class="jf__plid jf__plid--a"><i></i></i>' +
                 '<i class="jf__plid jf__plid--b"><i></i></i>' +
                 '<i class="jf__pjaw"><i></i></i>' +
               '</span>' +
               '<span class="jf__halo"></span><span class="jf__dot"></span>' +
             '</span>';
    }
    if (look === "robot")
      return '<span class="jf jf--bot" data-state="' + cur + '" style="width:' + px +
             'px">' + robotSVG(px) + '</span>';
    return '<span class="jf" data-state="' + cur + '" style="width:' + px + 'px">' + faceSVG(px) + '</span>';
  },

  /* **הכיול של `img/josh-bot.jpg`, נמדד ולא נוחש.**

     שיטת המדידה, 14.9.2026: החתך צויר ל-canvas בגודל 200×300,
     ונסרקו בו הפיקסלים הכחולים־רוויים בפס הגובה של העיניים
     (`b>140`, `b-r>50`, `g>90`). שני האשכולות שיצאו הם האישונים:

         עין ימין   38.7, 126.1  →  19.4% , 42.0%
         עין שמאל  102.1, 125.2  →  51.1% , 41.7%

     **וזה נבדק בעין ולא רק במספרים** — הצלבות צוירו על החתך
     והתמונה נצפתה. הניסיון הראשון תפס את פסי הציאן שבכתר
     והשני את פוד האוזן; רק התיחום הצר נחת על העיניים.

     הפה נקרא מרשת אחוזים שהונחה על אותו חתך: מרכז ב-39%, 64%,
     ורוחב שנמתח מ-25% ל-53%. בסיס האף ב-58%, והוא ציר הלסת. */
  MARKS_BOT: {
    ax: "19.4%", ay: "42%",   ew: "6.5%", eh: "2.8%",
    bx: "51.1%", by: "41.7%", ew2: "6.5%", eh2: "2.8%",
    jx: "39%",   jy: "64%",   jw: "14%",  jh: "5.5%", jo: "58%"
  },

  /**
   * בוחר איזה פרצוף מצויר נבנה: `"robot"` או `"human"`.
   *
   * שם לא מוכר נדחה ומחזיר false, והבחירה הקודמת נשארת — כך
   * ששגיאת כתיב אינה מוחקת את הפנים.
   *
   * **אינו נוגע בתצלום.** מי שקרא ל-`photo()` ימשיך לראות אותו,
   * מפני ש-`markup` בודק את התצלום ראשון. סדר החזרה לאדם:
   * `photo("")` ואז `look("human")`.
   */
  look: function (name) {
    if (name !== "robot" && name !== "human") return false;
    look = name;
    return true;
  },

  /**
   * מחליף את הפנים המצוירות בדיוקן.
   *
   * **נתיב יחסי בלבד.** כתובת מלאה נדחית ומחזירה false: הקובץ הזה
   * אינו מביא דבר מהרשת, וזו אינה הבטחה בהערה אלא בדיקה בקוד —
   * `node .claude/qa/joshface.js` אוכף את אותו כלל מבחוץ.
   *
   * מה שמשתנה במצב תמונה: **אין מצמוץ ואין סנכרון שפתיים**, מפני
   * שאי אפשר לחתוך עיניים עצומות מפריים שעיניו פתוחות. עשרת
   * האירועים עצמם ממשיכים לעבוד — הם נאמרים בהטיה, בקנה מידה,
   * בטבעת ובנורית. ראו O-54.
   *
   * קריאה בלי ארגומנט מחזירה לפנים המצוירות.
   */
  photo: function (url, marks) {
    if (url === undefined || url === null || url === "") { photoURL = ""; photoMarks = null; return true }
    if (/^[a-z]+:/i.test(String(url)) || String(url).indexOf("//") === 0) return false;
    /* הנתיב נכנס גם ל-`url('…')` שבתוך style, ולכן גרש, מירכאות,
       סוגר או רווח פוסלים אותו. נתיב אמיתי אינו מכיל אותם. */
    if (/['"()\s\\]/.test(String(url))) return false;
    photoURL = String(url);
    /* כיול אופציונלי. ערך שאינו אחוז/פיקסל נזרק — הוא נכנס
       לתוך `style`, ולכן זו בדיקת קלט ולא נוי. */
    photoMarks = null;
    if (marks && typeof marks === "object") {
      var out = {}, k, v, any = false;
      for (k in marks) {
        if (!Object.prototype.hasOwnProperty.call(marks, k)) continue;
        if (!/^[a-z0-9]{2,4}$/.test(k)) continue;
        v = String(marks[k]);
        if (!/^-?\d+(\.\d+)?(%|px)$/.test(v)) continue;
        out[k] = v; any = true;
      }
      if (any) photoMarks = out;
    }
    return true;
  },

  /** מחבר את המודול לצומת שקיים עכשיו. נקרא אחרי כל render(). */
  /** מחבר לכל הפנים שעל הדף. אלמנט מפורש מגביל לאחד. */
  attach: function (el) {
    injectCSS();
    nodes = el ? [el] : [].slice.call(document.querySelectorAll(".jf"));
    if (!nodes.length) return false;
    paint();
    /* גם לתצלום יש עפעפיים מאז 13.9.2026 — שכבת העור שמעל העין.
       הטיימר אחד לשני המצבים. */
    scheduleBlink();
    return nodes.length;
  },

  detach: function () {
    clearTimeout(blTimer); blTimer = null;
    clearTimeout(moTimer); moTimer = null;
    nodes = [];
  },

  /**
   * אירוע אחד מתוך עשרה. מצב לא מוכר מוחזר כ-false ואינו משנה דבר,
   * כדי שקריאה שגויה לא תשאיר פרצוף תקוע.
   */
  emit: function (ev) {
    if (MOMENT[ev]) {
      cur = ev; paint();
      clearTimeout(moTimer);
      moTimer = setTimeout(function () { cur = base; paint() }, MOMENT[ev]);
      return true;
    }
    if (BASE[ev]) {
      clearTimeout(moTimer); moTimer = null;
      base = ev; cur = ev; paint();
      return true;
    }
    return false;
  },

  /** המצב המוצג כרגע, ומצב הבסיס שאליו יחזור אחרי רגע. */
  state: function () { return { current: cur, base: base, photo: photoURL || null, look: look } },

  /**
   * וו לסנכרון שפתיים, ו**רק וו**. הוא אינו מקריא ואינו יודע מה
   * נאמר: מי שמקריא הוא `tutor/tutor.js`, ואם וכאשר יוחלט לחבר —
   * הוא יקרא לכאן מתוך `onboundary` שכבר קיים אצלו. עד אז הפה נע
   * ב-CSS, וזה מספיק. אין כאן `speechSynthesis` ואין בחירת קול.
   */
  boundary: function () {
    if (!nodes.length || photoURL || cur !== "speaking" || reduced()) return false;
    var v = "scaleY(" + (0.6 + Math.random() * 0.6).toFixed(2) + ")", hit = false;
    eachNode(function (n) {
      var m = n.querySelector(".jf__m--talk");
      if (m) { m.style.transform = v; hit = true }
    });
    return hit;
  },

  reduced: reduced
};

/* לשונית מוסתרת — אין למי לצייר, והטיימר נעצר. */
document.addEventListener("visibilitychange", function () {
  if (document.hidden) { clearTimeout(blTimer); blTimer = null; }
  else if (nodes.length) scheduleBlink();
});

g.JOSHFACE = JOSHFACE;

})(window);
